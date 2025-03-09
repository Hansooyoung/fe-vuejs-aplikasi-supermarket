<script setup>
import api from '@/api'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import Swal from 'sweetalert2'
const router = useRouter()

const formData = ref({
  vendor_id: '',
  barang: [],
  tanggal_masuk: ''
})

const vendorList = ref([])
const barangList = ref([])
const selectedBarang = ref([])
const errors = ref([])
const searchQuery = ref('')
const showBarangSelect = ref(false)
const noBarangMessage = ref('')
const debouncedQuery = ref('')
let debounceTimeout = null

const isSelected = (barang) => {
  return selectedBarang.value.some((b) => b.barcode === barang.barcode)
}

const currentPage = ref(1)
const totalPages = ref(1)

const fetchData = async (page = 1) => {
  try {
    const vendorResponse = await api.request({ method: 'GET', url: '/vendor' })
    const barangResponse = await api.request({
      method: 'GET',
      url: `/barang?page=${page}`,
      params: {
        search: debouncedQuery.value
      }
    })

    vendorList.value = vendorResponse.data.data.data
    barangList.value = barangResponse.data.data
    totalPages.value = barangResponse.data.pagination.last_page
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data.', error)
  }
}

// Computed untuk filter barang
const filteredBarang = computed(() => {
  return barangList.value.filter(
    (barang) =>
      barang.barcode.toLowerCase().includes(debouncedQuery.value.toLowerCase()) ||
      barang.nama_barang.toLowerCase().includes(debouncedQuery.value.toLowerCase())
  )
})

// Watcher untuk mengelola pesan error
watch([filteredBarang, debouncedQuery], () => {
  fetchData()
  if (debouncedQuery.value && filteredBarang.value.length === 0) {
    noBarangMessage.value = 'Barang Tidak Ditemukan'
  } else {
    noBarangMessage.value = ''
  }
})

const addBarang = (barang) => {
  if (!isSelected(barang)) {
    selectedBarang.value.push({
      barcode: barang.barcode,
      nama_barang: barang.nama_barang,
      harga_beli: 0,
      jumlah: 1
    })
  }
}

const removeBarang = (index) => {
  selectedBarang.value.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    errors.value = [];
    formData.value.barang = selectedBarang.value.map(({ barcode, harga_beli, jumlah }) => ({
      barcode,
      harga_beli,
      jumlah
    }));

    await api.request({
      method: 'POST',
      url: '/pembelian',
      headers: { Accept: 'application/json', 'Content-type': 'application/json' },
      data: {
        vendor_id: formData.value.vendor_id,
        barang: formData.value.barang,
        tanggal_masuk: formData.value.tanggal_masuk
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Berhasil membuat transaksi pembelian',
      timer: 2000,
      showConfirmButton: true
    });

    router.push({ name: 'pembelian' });
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat menyimpan data.';

    if (error.response) {
      if (error.response.status === 429) {
        errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage
    });

    errors.value = error.response?.data.errors || [];
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

onMounted(fetchData)
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <DefaultCard cardTitle="Tambah Pembelian">
        <form @submit.prevent="handleSubmit">
          <div class="p-6.5">
            <!-- Field Vendor -->
            <label class="block mb-2">Vendor</label>
            <select v-model="formData.vendor_id" class="w-full mb-4 p-2 border">
              <option disabled value="">Pilih Vendor</option>
              <option v-for="vendor in vendorList" :key="vendor.id" :value="vendor.id">
                {{ vendor.nama_vendor }}
              </option>
            </select>

            <!-- Field Tanggal Masuk -->
            <label class="block mb-2">Tanggal Masuk</label>
            <input type="date" v-model="formData.tanggal_masuk" class="w-full mb-4 p-2 border" />
            <p v-if="errors.tanggal_masuk" class="text-sm text-red-600">
              {{ errors.tanggal_masuk[0] }}
            </p>

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

              <div class="flex items-center w-1/3">
                <span class="mr-2 text-gray-600">Harga:</span>
                <input
                  v-model.number="barang.harga_beli"
                  type="number"
                  class="w-full p-1 border"
                  min="1"
                  placeholder="Harga beli"
                  @keydown.enter.prevent
                />
              </div>

              <div class="flex items-center w-1/4">
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

            <!-- Tombol Simpan Data -->
            <button type="submit" class="w-full p-3 bg-blue-500 text-white hover:bg-blue-600">
              Simpan Data
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
