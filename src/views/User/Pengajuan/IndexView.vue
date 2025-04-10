<script setup>
import 'jspdf-autotable'

import api from '@/api'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

// Data barang
const pengajuanData = ref([])
const currentPage = ref(1) // Halaman saat ini
const totalPages = ref(1) // Total halaman
const searchQuery = ref('')
let searchTimeout = null // Timeout untuk debounce
const showExportModal = ref(false) // Flag untuk menampilkan modal export
const showModal = ref(false) // Flag untuk menampilkan modal
const itemToDelete = ref(null) // Menyimpan Kategori barang yang akan dihapus
const modalMessage = ref('') // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true) // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
const showImportModal = ref(false) // Flag untuk menampilkan modal import
const showEditModal = ref(false)
const selectedPengajuan = ref(null)
const editStatus = ref('')

const editKeterangan = ref('')

const openEditModal = (pengajuan) => {
  selectedPengajuan.value = pengajuan
  editStatus.value = pengajuan.status
  editKeterangan.value = pengajuan.keterangan || '' // Pastikan keterangan bisa kosong
  showEditModal.value = true
}


const updateStatusPengajuan = async () => {
  if (!selectedPengajuan.value) return

  try {
    const response = await api.request({
      method: 'PUT',
      url: `/pengajuan-barang/${selectedPengajuan.value.id}/update-status`,
      data: { 
        status: editStatus.value,
        keterangan: editKeterangan.value // Tambahkan keterangan
      },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
    })

    showEditModal.value = false
    fetchDataPengajuan() // Refresh data

    Swal.fire({
      title: 'Berhasil!',
      text: 'Status pengajuan berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    Swal.fire({
      title: 'Gagal!',
      text: 'Terjadi kesalahan saat memperbarui status.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
  }
}


watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDataPengajuan()
  }, 5000)
})

// Fetch data dari API
const fetchDataPengajuan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/pengajuan-barang?page=${currentPage.value}&search=${searchQuery.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    pengajuanData.value = response.data.data
    totalPages.value = response.data.pagination.last_page
  } catch (error) {
    console.error('Error fetching Kategori barang:', error)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDataPengajuan()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDataPengajuan()
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
      url: `/pengajuan-barang/${itemToDelete.value.id}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataPengajuan()
    showModal.value = false
    Swal.fire({
      title: 'Berhasil!',
      text: 'Data Pengajuan berhasil dihapus.',
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

const confirmDelete = (pengajuan) => {
  itemToDelete.value = pengajuan
  modalMessage.value = 'Apakah Anda yakin ingin menghapus Kategori barang ini?'
  isDeleteButtonVisible.value = true
  showModal.value = true
}

const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/pengajuan/export/pdf',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-pengajuan.pdf'
    link.click()
    URL.revokeObjectURL(link.href)

    Swal.fire({
      title: 'Berhasil!',
      text: 'Export PDF berhasil!',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)

    Swal.fire({
      title: 'Gagal!',
      text: 'Terjadi kesalahan saat export PDF. Pastikan Internet Download Manager (IDM) tidak mengganggu proses download.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
  }
}

const exportToExcel = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/pengajuan/export/excel',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-pengajuan.xlsx'
    link.click()
    URL.revokeObjectURL(link.href)

    Swal.fire({
      title: 'Berhasil!',
      text: 'Export Excel berhasil!',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error exporting Excel:', error)

    Swal.fire({
      title: 'Gagal!',
      text: 'Terjadi kesalahan saat export Excel. Pastikan Internet Download Manager (IDM) tidak mengganggu proses download.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
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
  fetchDataPengajuan()
})
</script>

<template>
  <DefaultLayoutUser>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Pengajuan Barang</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">
            <div class="flex items-center space-x-2">
              <button
              @click="$router.push({ name: 'pengajuan-barang.create' })"
              class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Create Data
            </button>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari Nama Barang..."
                class="border px-4 py-2 rounded-md w-1/2"
              />
              <button
                @click="fetchDataPengajuan"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Cari
              </button>
            </div>
          </div>

          <div class="flex gap-2">
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
                Nama Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Jumlah</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Pesan</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Keterangan</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Pengajuan
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pengajuanData.length === 0">
              <td colspan="7" class="text-center py-5 px-4 text-gray-500">
                Data pengajuan tidak ada
              </td>
            </tr>
            <tr v-for="(pengajuan, index) in pengajuanData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ index + 1 }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pengajuan.nama_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pengajuan.jumlah }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pengajuan.pesan }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pengajuan.keterangan }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ pengajuan.tanggal_pengajuan }}</p>
              </td>
              <td class="py-5 px-4">
                <p
                  :class="{
                    'text-green-600': pengajuan.status === 'Approved',
                    'text-red-600': pengajuan.status === 'Rejected',
                    'text-black dark:text-white':
                      pengajuan.status !== 'Approved' && pengajuan.status !== 'Rejected'
                  }"
                >
                  {{ pengajuan.status }}
                </p>
              </td>

              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button
                    @click="openEditModal(pengajuan)"
                    :disabled="pengajuan.status !== 'Pending'"
                    class="px-4 py-2 rounded text-white"
                    :class="{
                      'bg-blue-600 hover:bg-blue-700': pengajuan.status === 'Pending',
                      'bg-gray-400 cursor-not-allowed': pengajuan.status !== 'Pending'
                    }"
                  >
                    Edit
                  </button>

                  <!-- <button
                    @click="confirmDelete(pengajuan)"
                    class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Hapus
                  </button> -->
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
    <!-- Modal Edit Status -->
<div v-if="showEditModal" class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
  <div class="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
    <h2 class="text-xl mb-4">Edit Status Pengajuan</h2>
    
    <label class="block text-sm font-medium text-gray-700">Status</label>
    <select v-model="editStatus" class="border px-4 py-2 rounded-md w-full">
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>

    <label class="block mt-4 text-sm font-medium text-gray-700">Keterangan (Opsional)</label>
    <textarea v-model="editKeterangan" class="border px-4 py-2 rounded-md w-full" placeholder="Masukkan keterangan"></textarea>

    <div class="mt-4 flex justify-between">
      <button @click="updateStatusPengajuan" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Simpan
      </button>
      <button @click="showEditModal = false" class="text-red-500">Batal</button>
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
