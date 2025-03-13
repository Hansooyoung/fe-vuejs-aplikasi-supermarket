<script setup>
import api from '@/api'
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const isSubmitting = ref(false)
const formData = ref({
  member_id: '',
  voucher_id: '',
  barang: [],
  tanggal_penjualan: '',
  tunai: 0 
})

const memberList = ref([])
const barangList = ref([])
const voucherList = ref([])
const selectedBarang = ref([])
const errors = ref([])
const searchQuery = ref('')
const showBarangSelect = ref(false)
const noBarangMessage = ref('')
const debouncedQuery = ref('')
let debounceTimeout = null
const totalHarga = computed(() =>
  selectedBarang.value.reduce((sum, barang) => sum + barang.harga_jual * barang.jumlah, 0)
)
const kembalian = computed(() =>
  formData.value.tunai ? formData.value.tunai - totalHarga.value : 0
)

const isSelected = (barang) => {
  return selectedBarang.value.some((b) => b.barcode === barang.barcode)
}

console.log(selectedBarang.value);


const currentPage = ref(1)
const totalPages = ref(1)

const fetchData = async (page = 1) => {
  try {
    const memberResponse = await api.request({ method: 'GET', url: '/member' })
    const voucherResponse = await api.request({ method: 'GET', url: '/voucher' })
    const barangResponse = await api.request({
      method: 'GET',
      url: `/barang?page=${page}`,
      params: { search: debouncedQuery.value }
    })

    memberList.value = memberResponse.data.data.data
    voucherList.value = voucherResponse.data.data.data
    barangList.value = barangResponse.data.data
    totalPages.value = barangResponse.data.pagination.last_page
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data.', error)
  }
}


const filteredBarang = computed(() => {
  return barangList.value.filter(
    (barang) =>
      barang.barcode.toLowerCase().includes(debouncedQuery.value.toLowerCase()) ||
      barang.nama_barang.toLowerCase().includes(debouncedQuery.value.toLowerCase())
  )
})

watchEffect(() => {
  if (debouncedQuery.value !== '') {
    fetchData()
  }
})


const addBarang = (barang) => {
  if (!isSelected(barang)) {
    selectedBarang.value.push({
      barcode: barang.barcode,
      nama_barang: barang.nama_barang,
      harga_jual: barang.harga_jual_diskon && barang.harga_jual_diskon > 0 ? barang.harga_jual_diskon : barang.harga_jual,

      jumlah: 1
    })
  }
}

const removeBarang = (index) => {
  selectedBarang.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  const confirmResult = await Swal.fire({
    title: 'Konfirmasi',
    text: 'Apakah Anda yakin ingin menyimpan transaksi ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, simpan',
    cancelButtonText: 'Batal'
  });

  if (!confirmResult.isConfirmed) return; // Jika dibatalkan, hentikan proses

  isSubmitting.value = true;

  try {
    errors.value = [];
    formData.value.barang = selectedBarang.value.map(({ barcode, jumlah }) => ({
      barcode,
      jumlah
    }));

    const response = await api.request({
      method: 'POST',
      url: '/penjualan',
      headers: { Accept: 'application/json', 'Content-type': 'application/json' },
      data: {
        member_id: formData.value.member_id,
        voucher_id: formData.value.voucher_id,
        barang: formData.value.barang,
        tanggal_penjualan: formData.value.tanggal_penjualan,
        tunai: formData.value.tunai
      }
    });

    const transaksiId = response.data.penjualan.id; 

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Transaksi berhasil!',
      timer: 1500,
      showConfirmButton: false
    });

    router.push({ 
  name: 'struk', 
  params: { id: transaksiId }, 
  query: { tunai: formData.value.tunai, kembalian: kembalian.value } 
});

  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      Object.values(error.response?.data?.errors || {})
        .flat()
        .join(', ') ||
      'Terjadi kesalahan saat menyimpan data.';

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage
    });

    errors.value = error.response?.data?.errors || [];
  } finally {
    isSubmitting.value = false; 
  }
};




const handleSearch = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedQuery.value = searchQuery.value
  }, 500)
}

const handleEnterSearch = () => {
  clearTimeout(debounceTimeout)
  debouncedQuery.value = searchQuery.value
}

onMounted(() => {
  fetchData() 
})
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <DefaultCard cardTitle="Tambah penjualan">
        <form @submit.prevent="handleSubmit">
          <div class="p-6.5">
            <label class="block mb-2">Member</label>
            <div class="flex items-center gap-2 mb-4">
              <select v-model="formData.member_id" class="w-full p-2 border">
                <option value="">(Tidak Memilih)</option>
                <option v-for="member in memberList" :key="member.id" :value="member.id">
                  {{ member.nama_member }}
                </option>
              </select>
              <button
                v-if="formData.member_id"
                @click="formData.member_id = ''"
                class="p-2 bg-red-500 text-white hover:bg-red-600"
              >
                Hapus
              </button>
            </div>

            <label class="block mb-2">Voucher</label>
            <div class="flex items-center gap-2 mb-4">
              <select v-model="formData.voucher_id" class="w-full p-2 border">
                <option value="">(Tidak Memilih)</option>
                <option v-for="voucher in voucherList" :key="voucher.id" :value="voucher.id">
                  {{ voucher.nama_voucher }}
                </option>
              </select>
              <button
                v-if="formData.voucher_id"
                @click="formData.voucher_id = ''"
                class="p-2 bg-red-500 text-white hover:bg-red-600"
              >
                Hapus
              </button>
            </div>

            <!-- Tombol Pilih Barang -->
            <label class="block mb-2">Barang</label>
            <button
              type="button"
              class="w-full mb-4 p-2 border bg-blue-500 text-white hover:bg-blue-600"
              @click="showBarangSelect = true"
            >
              Pilih Barang
            </button>

            <!-- Modal Pilih Barang -->
            <div
              v-if="showBarangSelect"
              class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              @click="showBarangSelect = false"
            >
              <div
                class="bg-white w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-4 p-6 rounded-lg shadow-lg"
                @click.stop
              >
                <!-- Input Pencarian Barang -->
                <input
                  v-model="searchQuery"
                  @input="handleSearch"
                  @keyup.enter="handleEnterSearch"
                  @keydown.enter.prevent
                  type="text"
                  class="w-full p-2 mb-4 border"
                  placeholder="Cari Barang..."
                />

                <!-- Pesan Barang Tidak Ditemukan -->
                <p v-if="noBarangMessage" class="text-sm text-red-600 text-center py-2">
                  {{ noBarangMessage }}
                </p>

                <!-- Daftar Barang -->
                <div v-if="filteredBarang.length > 0" class="max-h-60 overflow-y-auto mb-4">
                  <button
                    v-for="barang in filteredBarang"
                    :key="barang.barcode"
                    class="block w-full p-2 text-left hover:bg-gray-100 mb-2"
                    @click="addBarang(barang)"
                    type="button"
                    :disabled="isSelected(barang)"
                    :class="{ 'opacity-50 cursor-not-allowed': isSelected(barang) }"
                  >
                    {{ barang.nama_barang }} ({{ barang.barcode }})
                  </button>
                </div>

                <!-- Navigasi Paginasi -->
                <div class="flex justify-between items-center mt-4 space-x-2">
                  <button
                    @click="fetchData(currentPage.value - 1)"
                    :disabled="currentPage.value === 1"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span class="text-gray-700">
                    Halaman {{ currentPage.value }} dari {{ totalPages.value }}
                  </span>
                  <button
                    @click="fetchData(currentPage.value + 1)"
                    :disabled="currentPage.value === totalPages.value"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>

                <!-- Tombol Tutup -->
                <button
                  @click.prevent="showBarangSelect = false"
                  class="mt-4 p-2 bg-blue-500 text-white w-full hover:bg-blue-600"
                >
                  Tutup
                </button>
              </div>
            </div>

            <!-- Daftar Barang yang Dipilih -->
            <div
              v-for="(barang, index) in selectedBarang"
              :key="barang.barcode"
              class="flex justify-between items-center border p-2 mb-2"
            >
              <span class="w-1/3">{{ barang.nama_barang }} ({{ barang.barcode }})</span>

              <div class="flex items-center w-full">
                <span class="mr-2 text-gray-600">Qty:</span>
                <input
                  v-model.number="barang.jumlah"
                  type="number"
                  class="w-full p-1 border"
                  min="1"
                  placeholder="Jumlah"
                  @keydown.enter.prevent
                />
              </div>

              <button @click="removeBarang(index)" class="text-red-600">Hapus</button>
            </div>
            <!-- Input Tunai -->
            <label class="block mb-2 mt-4">Tunai</label>
            <input
              v-model.number="formData.tunai"
              type="number"
              class="w-full p-2 border"
              placeholder="Masukkan jumlah uang tunai"
            />
            <!-- Total Harga -->
            <p class="mt-4 font-semibold">
              Total Harga: Rp{{ totalHarga.toLocaleString('id-ID') }}
            </p>

            <!-- Kembalian -->
            <p v-if="formData.tunai >= totalHarga" class="mt-4 mb-4 font-semibold">
              Kembalian: Rp{{ kembalian.toLocaleString('id-ID') }}
            </p>
            <p v-else class="mt-4 mb-4 font-semibold">
              Uang tunai kurang Rp{{ (totalHarga - formData.tunai).toLocaleString('id-ID') }}
            </p>
            <!-- Tombol Simpan Data -->
            <button
              type="submit"
              class="w-full p-3 bg-blue-500 text-white hover:bg-blue-600"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Menyimpan...' :   'Simpan Data' }}
            </button>
          </div>
        </form>
      </DefaultCard>
    </div>
  </DefaultLayoutUser>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
