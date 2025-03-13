<script setup>
import 'jspdf-autotable'

import api from '@/api'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

// Data barang
const penjualanData = ref([])
const currentPage = ref(1) // Halaman saat ini
const totalPages = ref(1) // Total halaman
const searchQuery = ref('')
let searchTimeout = null // Timeout untuk debounce
const showExportModal = ref(false) // Flag untuk menampilkan modal export
const showModal = ref(false) // Flag untuk menampilkan modal
const itemToDelete = ref(null) // Menyimpan Penjualan barang yang akan dihapus
const modalMessage = ref('') // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true) // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
const showImportModal = ref(false) // Flag untuk menampilkan modal import
const selectedFile = ref(null) // Menyimpan file yang dipilih untuk import

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDataPenjualan()
  }, 5000)
})

// Fetch data dari API
const fetchDataPenjualan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/penjualan?page=${currentPage.value}&search=${searchQuery.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    penjualanData.value = response.data.data
    totalPages.value = response.data.pagination.last_page // Total halaman dari API
  } catch (error) {
    console.error('Error fetching Penjualan barang:', error)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDataPenjualan()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDataPenjualan()
  }
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
      url: '/import-penjualan',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    alert('Data berhasil diimpor.')
    showImportModal.value = false
    fetchDataPenjualan()
  } catch (error) {
    console.error('Error importing data:', error)
    alert('Terjadi kesalahan saat impor data.')
  }
}
const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/penjualan/export/pdf',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-penjualan.pdf'
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
      url: '/penjualan/export/excel',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-penjualan.xlsx'
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
  fetchDataPenjualan()
})
</script>

<template>
  <DefaultLayoutUser>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Transaksi Penjualan</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">
            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari penjualan..."
                class="border px-4 py-2 rounded-md w-1/2"
              />
              <button
                @click="fetchDataPenjualan"
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
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Member
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                User
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Total Penjualan
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Total Keuntungan
              </th>

              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="penjualanData.length === 0">
              <td colspan="6" class="text-center py-5 px-4 text-gray-500">
                Data penjualan tidak ada
              </td>
            </tr>
            <tr v-for="(penjualan, index) in penjualanData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ penjualan.id }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ penjualan.nama_member }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ penjualan.nama_user }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ penjualan.total_penjualan }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ penjualan.total_keuntungan }}</p>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button
                    @click="
                      $router.push({
                        name: 'penjualan.detail',
                        params: { id: penjualan.id }
                      })
                    "
                    class="hover:text-primary"
                  >
                    Detail
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
        <h3 class="text-xl font-semibold mb-4">Import Penjualan Barang</h3>
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
