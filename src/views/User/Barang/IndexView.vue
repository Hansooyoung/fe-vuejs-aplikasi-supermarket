<script setup>
import 'jspdf-autotable'

import api from '@/api'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

// Data barang
const barangData = ref([])
const currentPage = ref(1) // Halaman saat ini
const totalPages = ref(1) // Total halaman
const searchQuery = ref('')
let searchTimeout = null // Timeout untuk debounce
const showExportModal = ref(false) // Flag untuk menampilkan modal export
const showModal = ref(false) // Flag untuk menampilkan modal
const itemToDelete = ref(null) // Menyimpan Barang barang yang akan dihapus
const modalMessage = ref('') // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true) // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
const showImportModal = ref(false) // Flag untuk menampilkan modal import
const selectedFile = ref(null) // Menyimpan file yang dipilih untuk import

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDataBarang()
  }, 5000)
})

// Fetch data dari API
const fetchDataBarang = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/barang?page=${currentPage.value}&search=${searchQuery.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    barangData.value = response.data.data
    totalPages.value = response.data.pagination.last_page
  } catch (error) {
    console.error('Error fetching Barang barang:', error)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDataBarang()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDataBarang()
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
      url: `/barang/${itemToDelete.value.kode_barang}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataBarang()
    showModal.value = false
    Swal.fire({
      title: 'Berhasil!',
      text: 'Data barang berhasil dihapus.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    if (error.response?.status === 400) {
      modalMessage.value =
        'Data tkode_barangak bisa dihapus karena memiliki relasi dengan data lain.'
      isDeleteButtonVisible.value = false
    } else {
      alert('Terjadi kesalahan saat menghapus data.')
    }
    console.error('Error deleting item:', error)
  }
}

const confirmDelete = (barang) => {
  itemToDelete.value = barang
  modalMessage.value = 'Apakah Anda yakin ingin menghapus Barang barang ini?'
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
      url: '/import-barang',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    alert('Data berhasil diimpor.')
    showImportModal.value = false
    fetchDataBarang()
  } catch (error) {
    console.error('Error importing data:', error)
    alert('Terjadi kesalahan saat impor data.')
  }
}
const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/barang/export/pdf',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-barang.pdf'
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
      url: '/barang/export/excel',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-barang.xlsx'
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
  fetchDataBarang()
})
</script>

<template>
  <DefaultLayoutUser>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Barang Barang</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">

            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari barang..."
                class="border px-4 py-2 rounded-md w-1/2"
              />
              <button
                @click="fetchDataBarang"
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
                Kode Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Barcode
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Barang
              </th>

              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Harga Jual
              </th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="barangData.length === 0">
              <td colspan="7" class="text-center py-5 px-4 text-gray-500">
                Data barang tidak ada
              </td>
            </tr>
            <tr v-for="(barang, index) in barangData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ barang.kode_barang }}
                </h5>
              </td>
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ barang.barcode }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.nama_barang }}</p>
              </td>

              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.status }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.harga_jual }}</p>
              </td>

              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button
                    @click="
                      $router.push({
                        name: 'barang.update',
                        params: { kode_barang: barang.kode_barang }
                      })
                    "
                    class="hover:text-primary"
                  >
                    Edit
                  </button>
                  <button @click="confirmDelete(barang)" class="hover:text-primary">Delete</button>
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
        <h3 class="text-xl font-semibold mb-4">Import Barang Barang</h3>
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
        <h3 class="text-xl font-semibold text-center mb-4" v-else>
          Data Barang Bisa Dihapus
        </h3>
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
  </DefaultLayoutUser>
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
</style>
