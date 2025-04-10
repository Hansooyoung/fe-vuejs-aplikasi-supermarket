<script setup>
import api from '@/api'
import { ref, onMounted, computed, watch } from 'vue'
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
const selectedMember = ref(null)

const errors = ref([])
const searchQuery = ref('')
const showBarangSelect = ref(false)
const showMemberSelect = ref(false)
const noBarangMessage = ref('')
const debouncedQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
let debounceTimeout = null

// **Fetch Data Member Setelah Pencarian**
const fetchMemberData = async () => {
  if (!searchQuery.value) {
    errors.value = ['Silakan masukkan nama atau nomor HP member']
    return
  }
  try {
    const response = await api.request({
      method: 'GET',
      url: '/member',
      params: { search: searchQuery.value }
    })

    memberList.value = response.data.data.data

    if (memberList.value.length === 0) {
      errors.value = ['Member tidak ditemukan']
    } else if (memberList.value.length === 1) {
      formData.value.member_id = memberList.value[0].id
      errors.value = []
      fetchVoucherData()
    }
  } catch (error) {
    errors.value = ['Gagal mengambil data member']
  }
}

const handleSearchMember = () => {
  errors.value = []
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(fetchMemberData, 500)
}


// **Fetch Barang**
const fetchBarangData = async (page = 1) => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/barang?page=${page}`,
      params: { search: debouncedQuery.value }
    })
    barangList.value = response.data.data
    totalPages.value = response.data.pagination.last_page
  } catch (error) {
    console.error('Gagal mengambil data barang', error)
  }
}

// **Fetch Voucher Setelah Memilih Member**
const fetchVoucherData = async () => {
  if (!formData.value.member_id) {
    voucherList.value = []
    return
  }
  try {
    const response = await api.request({
      method: 'GET',
      url: `/historyvoucher`,
      params: { member_id: formData.value.member_id }
    })

    if (response.data && Array.isArray(response.data.data)) {
      // Filter hanya yang belum digunakan
      voucherList.value = response.data.data
        .filter(history => history.tanggal_digunakan === null)
        .map(history => history.voucher)
    } else {
      voucherList.value = []
    }
  } catch (error) {
    console.error('Gagal mengambil data voucher dari historyvoucher', error)
    voucherList.value = []
  }
}


// **Total Harga Menggunakan Harga Diskon Jika Ada Voucher**
const totalHarga = computed(() => {
  let total = selectedBarang.value.reduce((sum, barang) => {
    let hargaSatuan = barang.harga_jual_diskon && barang.harga_jual_diskon > 0
      ? barang.harga_jual_diskon // Gunakan harga diskon jika ada
      : barang.harga_jual // Jika tidak, pakai harga normal
    
    return sum + hargaSatuan * barang.jumlah
  }, 0)

  // **Jika ada voucher, kurangi total dengan diskon voucher**
  if (formData.value.voucher_id) {
    const voucher = voucherList.value.find((v) => v.id === formData.value.voucher_id)
    if (voucher && voucher.diskon) {
      total -= voucher.diskon
    }
  }

  return total > 0 ? total : 0 // Pastikan total tidak negatif
})

// **Kembalian**
const kembalian = computed(() => formData.value.tunai - totalHarga.value)

// **Pilih Barang**
const addBarang = (barang) => {
  if (!selectedBarang.value.some((b) => b.barcode === barang.barcode)) {
    selectedBarang.value.push({
      barcode: barang.barcode,
      nama_barang: barang.nama_barang,
      harga_jual:
        barang.harga_jual_diskon && barang.harga_jual_diskon > 0
          ? barang.harga_jual_diskon
          : barang.harga_jual,
      jumlah: 1
    })
  }
}
const filteredBarang = computed(() => {
  return barangList.value.filter(
    (barang) =>
      barang.barcode.toLowerCase().includes(debouncedQuery.value.toLowerCase()) ||
      barang.nama_barang.toLowerCase().includes(debouncedQuery.value.toLowerCase())
  )
})
const isSelected = (barang) => {
  return selectedBarang.value.some((b) => b.barcode === barang.barcode)
}
const selectMember = (member) => {
  formData.value.member_id = member.id
  selectedMember.value = member  // Simpan data member yang dipilih
  showMemberSelect.value = false
  fetchVoucherData()
}

// **Hapus Barang**
const removeBarang = (index) => {
  selectedBarang.value.splice(index, 1)
}

// **Submit Form**
const handleSubmit = async () => {
  if (isSubmitting.value) return

  const confirmResult = await Swal.fire({
    title: 'Konfirmasi',
    text: 'Apakah Anda yakin ingin menyimpan transaksi ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, simpan',
    cancelButtonText: 'Batal'
  })

  if (!confirmResult.isConfirmed) return

  isSubmitting.value = true

  try {
    errors.value = []
    formData.value.barang = selectedBarang.value.map(({ barcode, jumlah }) => ({ barcode, jumlah }))

    const response = await api.request({
      method: 'POST',
      url: '/penjualan',
      headers: { Accept: 'application/json', 'Content-type': 'application/json' },
      data: formData.value
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Transaksi berhasil!',
      timer: 1500,
      showConfirmButton: false
    })

    router.push({
      name: 'struk',
      params: { id: response.data.penjualan.id },
      query: { tunai: formData.value.tunai, kembalian: kembalian.value }
    })
  } catch (error) {
    errors.value = error.response?.data?.errors || []
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat menyimpan data.' })
  } finally {
    isSubmitting.value = false
  }
}

// **Pilih Member dan Ambil Voucher**
watch(() => formData.value.member_id, fetchVoucherData)

onMounted(() => {
  fetchBarangData()
})
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <DefaultCard cardTitle="Tambah penjualan">
        <form @submit.prevent="handleSubmit">
          <div class="p-6.5">
            <!-- Input Pencarian Member -->
            <button
              type="button"
              class="w-full p-2 border bg-blue-500 text-white hover:bg-blue-600"
              @click="showMemberSelect = true"
            >
              Pilih Member
            </button>
            <p v-if="formData.member_id" class="mt-2 text-gray-600">
  <strong>Member Dipilih:</strong>
  {{ selectedMember ? selectedMember.nama_member : 'Tidak ada' }}
</p>

            <!-- **Voucher** -->
            <label class="block mb-2 mt-4">Voucher</label>
            <select
              v-model="formData.voucher_id"
              class="w-full p-2 border"
              :disabled="!formData.member_id"
            >
              <option value="">(Tidak Memilih)</option>
              <option v-for="voucher in voucherList" :key="voucher.id" :value="voucher.id">
                {{ voucher.nama_voucher }}
              </option>
            </select>

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
            <!-- Modal Pilih Member -->
            <div
              v-if="showMemberSelect"
              class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              @click="showMemberSelect = false"
            >
              <div
                class="bg-white w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-4 p-6 rounded-lg shadow-lg"
                @click.stop
              >
                <!-- Input Pencarian Member -->
                <input
                  v-model="searchQuery"
                  @input="handleSearchMember"
                  type="text"
                  class="w-full p-2 mb-4 border"
                  placeholder="Cari Member..."
                />

                <!-- Daftar Member -->
                <div v-if="memberList.length > 0" class="max-h-60 overflow-y-auto mb-4">
                  <button
                    v-for="member in memberList"
                    :key="member.id"
                    class="block w-full p-2 text-left hover:bg-gray-100 mb-2"
                    @click="selectMember(member)"
                    type="button"
                  >
                    {{ member.nama_member }} ({{ member.no_hp }})
                  </button>
                </div>

                <!-- Pesan Member Tidak Ditemukan -->
                <p v-if="errors.length" class="text-sm text-red-600 text-center py-2">
                  {{ errors[0] }}
                </p>

                <!-- Tombol Tutup -->
                <button
                  @click="showMemberSelect = false"
                  class="mt-4 p-2 bg-blue-500 text-white w-full hover:bg-blue-600"
                >
                  Tutup
                </button>
              </div>
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
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data' }}
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