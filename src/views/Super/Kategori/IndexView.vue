<script setup>

import 'jspdf-autotable'

import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'
import { ref, onMounted } from 'vue'

// Data barang
const kategoriData = ref([])
const showExportModal = ref(false) // Flag untuk menampilkan modal export
const showModal = ref(false) // Flag untuk menampilkan modal
const itemToDelete = ref(null) // Menyimpan Kategori barang yang akan dihapus
const modalMessage = ref('') // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true) // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
const showImportModal = ref(false) // Flag untuk menampilkan modal import
const selectedFile = ref(null) // Menyimpan file yang dipilih untuk import
// Fetch data dari API
const fetchDataKategori = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/kategori',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    // Set response data ke state kategoriData
    kategoriData.value = response.data.data
  } catch (error) {
    console.error('Error fetching Kategori barang:', error)
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
      url: `/kategori/${itemToDelete.value.id}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataKategori() 
    showModal.value = false 
    alert('Data berhasil dihapus!')
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

const confirmDelete = (kategori) => {
  itemToDelete.value = kategori
  modalMessage.value = 'Apakah Anda yakin ingin menghapus Kategori barang ini?'
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
      url: '/import-kategori',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    alert('Data berhasil diimpor.')
    showImportModal.value = false
    fetchDataKategori()
  } catch (error) {
    console.error('Error importing data:', error)
    alert('Terjadi kesalahan saat impor data.')
  }
}
const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/kategori/export/pdf',
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-kategori.pdf'
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
      url: '/kategori/export/excel',
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-kategori.xlsx'
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
  fetchDataKategori()
})
</script>

<template>
  <DefaultLayoutAdmin>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Kategori Barang</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-start mb-4">
          <button
            @click="$router.push({ name: 'kategori.create' })"
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Create Data
          </button>
        </div>
        <div class="flex justify-end mb-4">
          <button
          @click="showImportModal = true"
          class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark mr-2"
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
                Nama Kategori Barang
              </th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(kategori, index) in kategoriData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ kategori.id }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ kategori.nama_kategori }}</p>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button
                    @click="
                      $router.push({
                        name: 'kategori.update',
                        params: { id: kategori.id }
                      })
                    "
                    class="hover:text-primary"
                  >
                    Edit
                  </button>
                  <button @click="confirmDelete(kategori)" class="hover:text-primary">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Konfirmasi -->
     <div
        v-if="showImportModal"
        class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
      >
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h3 class="text-xl font-semibold mb-4">Import Kategori Barang</h3>
          <input type="file" @change="handleFileInput" class="mb-4 w-full" />
          <div class="flex justify-between gap-3">
            <button @click="importExcel" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
              Import
            </button>
            <button @click="showImportModal = false" class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
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
  </DefaultLayoutAdmin>
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
