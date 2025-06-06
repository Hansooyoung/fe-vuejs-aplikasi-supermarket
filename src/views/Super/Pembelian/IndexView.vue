<script setup>
import 'jspdf-autotable'

import api from '@/api'
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

// Data barang
const pembelianData = ref([])
const currentPage = ref(1) // Halaman saat ini
const totalPages = ref(1) // Total halaman
const searchQuery = ref('')
let searchTimeout = null // Timeout untuk debounce
const showExportModal = ref(false) // Flag untuk menampilkan modal export
const showModal = ref(false) // Flag untuk menampilkan modal
const itemToDelete = ref(null) // Menyimpan Pembelian barang yang akan dihapus
const modalMessage = ref('') // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true) // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
const showImportModal = ref(false) // Flag untuk menampilkan modal import
const selectedFile = ref(null) // Menyimpan file yang dipilih untuk import
const sortField = ref('tanggal_pembelian') // Field yang di-sort
const sortDirection = ref('desc') // Arah sorting (asc/desc)
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0, // Menghilangkan desimal
    maximumFractionDigits: 0 // Menghilangkan desimal
  }).format(angka)
}

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDataPembelian()
  }, 5000)
})

// Fetch data dari API
const fetchDataPembelian = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/pembelian-super?page=${currentPage.value}&search=${searchQuery.value}&sort=${sortField.value}&direction=${sortDirection.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    pembelianData.value = response.data.data
    totalPages.value = response.data.pagination.last_page // Total halaman dari API
  } catch (error) {
    console.error('Error fetching Pembelian barang:', error)
  }
}
// Fungsi untuk toggle sorting
const toggleSort = (field) => {
  if (sortField.value === field) {
    // Jika field yang sama diklik, toggle arah sorting
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Jika field berbeda, set field baru dan default arah ascending
    sortField.value = field
    sortDirection.value = 'asc'
  }
  fetchDataPembelian()
}

// Fungsi untuk mendapatkan class icon sorting
const getSortIcon = (field) => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
}
const updateTanggalMasuk = async (id, tanggalMasuk) => {
  try {
    const response = await api.request({
      method: 'PUT',
      url: `/pembelian/${id}/tanggal-masuk`,
      data: {
        tanggal_masuk: tanggalMasuk,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    Swal.fire({
      title: 'Tanggal Masuk Diperbarui',
      text: 'Tanggal masuk berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
    fetchDataPembelian();
  } catch (error) {
    console.error('Error updating tanggal masuk:', error);
    Swal.fire({
      title: 'Gagal',
      text: 'Terjadi kesalahan saat memperbarui tanggal masuk.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDataPembelian()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDataPembelian()
  }
}

// Fungsi untuk menghapus item
const deleteItem = async () => {
  if (!itemToDelete.value) {
    console.error('No item selected for deletion')
    return
  }

  try {
    await api.request({
      method: 'DELETE',
      url: `/pembelian/${itemToDelete.value.id}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataPembelian()
    showModal.value = false
    Swal.fire({
      title: 'Berhasil!',
      text: 'Data pembelian berhasil dihapus.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    if (error.response?.status === 400) {
      modalMessage.value = 'Data tidak bisa dihapus karena memiliki relasi dengan data lain.'
      isDeleteButtonVisible.value = false
    } else {
      alert('Terjadi kesalahan saat menghapus data.')
    }
    console.error('Error deleting item:', error)
  }
}

const confirmDelete = (pembelian) => {
  itemToDelete.value = pembelian
  modalMessage.value = 'Apakah Anda yakin ingin menghapus Pembelian barang ini?'
  isDeleteButtonVisible.value = true
  showModal.value = true
}
const handleFileInput = (event) => {
  selectedFile.value = event.target.files[0]
}

const importExcel = async () => {
  if (!selectedFile.value) {
    alert('Silakan pilih file Excel terlebih dahulu.')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    await api.request({
      method: 'POST',
      url: '/import-pembelian',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    alert('Data berhasil diimpor.')
    showImportModal.value = false
    fetchDataPembelian()
  } catch (error) {
    console.error('Error importing data:', error)
    alert('Terjadi kesalahan saat impor data.')
  }
}
const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/pembelian/export/pdf',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-pembelian.pdf'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Terjadi kesalahan saat export PDF.')
  }
}

const exportToExcel = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/pembelian/export/excel',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-pembelian.xlsx'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting Excel:', error)
    alert('Terjadi kesalahan saat export Excel.')
  }
}

const openExportModal = () => {
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}
// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataPembelian()
})
</script>

<template>
  <DefaultLayoutSuper>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Transaksi Pembelian</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">
            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari pembelian..."
                class="border px-4 py-2 rounded-md w-1/2"
              />
              <button
                @click="fetchDataPembelian"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Cari
              </button>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="showImportModal = true"
              class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Import Excel
            </button>
            <button
              @click="openExportModal"
              class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Print / Export
            </button>
          </div>
        </div>

        <!-- Modal Export -->
        <div
          v-if="showExportModal"
          class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
        >
          <div class="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <h2 class="text-xl mb-4">Pilih Format Export</h2>
            <div class="flex justify-between w-full">
              <button
                @click="exportToPDF"
                class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                Export PDF
              </button>
              <button
                @click="exportToExcel"
                class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                Export Excel
              </button>
            </div>
            <div class="mt-4">
              <button @click="closeExportModal" class="text-red-500">Tutup</button>
            </div>
          </div>
        </div>
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Vendor</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Nama Operator</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer" @click="toggleSort('tanggal_penjualan')">
                Tanggal Pembelian {{ getSortIcon('tanggal_penjualan') }}
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Masuk
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Total</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pembelianData.length === 0">
              <td colspan="7" class="text-center py-5 px-4 text-gray-500">
                Data pembelian tidak ada
              </td>
            </tr>
            <tr v-for="(pembelian, index) in pembelianData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ pembelian.id }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pembelian.nama_vendor }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pembelian.nama_user }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pembelian.tanggal_pembelian }}</p>
              </td>
              <td class="py-5 px-4">
                <p v-if="pembelian.tanggal_masuk === null" class="text-red-500">
                  <input
                    type="date"
                    v-model="pembelian.tanggal_masuk"
                    class="ml-2 border px-2 py-1 rounded-md"
                    @change="updateTanggalMasuk(pembelian.id, pembelian.tanggal_masuk)"
                  />
                </p>
                <p v-else class="text-black dark:text-white">{{ pembelian.tanggal_masuk }}</p>
              </td>

              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ formatRupiah(pembelian.total) }}</p>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button
                    @click="
                      $router.push({
                        name: 'pembelian.detail-super',
                        params: { id: pembelian.id }
                      })
                    "
                    class="hover:text-primary"
                  >
                    Detail
                  </button>
                  <button
                    @click="
                      $router.push({
                        name: 'pembelian.update-super',
                        params: { id: pembelian.id }
                      })
                    "
                    class="hover:text-primary"
                  >
                    Edit
                  </button>
                  <button
      @click="confirmDelete(pembelian)"
      class="hover:text-red-500"
    >
      Hapus
    </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between items-center m-6">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50"
          >
            Previous
          </button>

          <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-xl font-semibold mb-4">Import Pembelian Barang</h3>
        <input type="file" @change="handleFileInput" class="mb-4 w-full" />
        <div class="flex justify-between gap-3">
          <button
            @click="importExcel"
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Import
          </button>
          <button
            @click="showImportModal = false"
            class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-xl font-semibold text-center mb-4" v-if="isDeleteButtonVisible">
          Konfirmasi Penghapusan
        </h3>
        <h3 class="text-xl font-semibold text-center mb-4" v-else>Data Tidak Bisa Dihapus</h3>
        <p class="text-center mb-4">{{ modalMessage }}</p>
        <div class="flex justify-between gap-7">
          <button
            v-if="isDeleteButtonVisible"
            @click="deleteItem"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
          >
            Hapus
          </button>
          <button
            @click="showModal = false"
            class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 flex-1"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  </DefaultLayoutSuper>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}

.bg-primary:hover {
  background-color: #1e40af;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-red-500:hover {
  background-color: #dc2626;
}

.bg-gray-300 {
  background-color: #d1d5db;
}

.bg-gray-300:hover {
  background-color: #9ca3af;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
