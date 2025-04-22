<script setup>
import 'jspdf-autotable'
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

// Data states
const absensiData = ref([])
const users = ref([]) // Store list of users
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
let searchTimeout = null
// Add these methods to your component
const handleStatusChange = () => {
  if (formData.value.status !== 'masuk') {
    formData.value.jam_masuk = ''
  }
}

const handleUpdateStatusChange = () => {
  if (updateFormData.value.status !== 'masuk') {
    updateFormData.value.jam_masuk = ''
  }
}
// Modal states
const showExportModal = ref(false)
const showModal = ref(false)
const showCreateModal = ref(false)
const itemToDelete = ref(null)
const modalMessage = ref('')
const isDeleteButtonVisible = ref(true)
const showImportModal = ref(false)
const selectedFile = ref(null)

// Add these new modal states
const showUpdateJamKeluarModal = ref(false)
const showUpdateStatusModal = ref(false)
const selectedAbsensi = ref(null)
const newStatus = ref('masuk')
const showJamMasukModal = ref(false)
const jamMasukForm = ref({
  absensiId: null,
  jam_masuk: ''
})
// Add this in your script section
const showUpdateModal = ref(false)
const updateFormData = ref({
  id: '',
  user_id: '',
  tanggal: '',
  jam_masuk: '',
  status: 'masuk',
  keterangan: ''
})

const openUpdateModal = (absensi) => {
  updateFormData.value = {
    id: absensi.id,
    user_id: absensi.user_id,
    tanggal: absensi.tanggal,
    jam_masuk: absensi.jam_masuk,
    status: absensi.status,
    keterangan: absensi.keterangan
  }
  showUpdateModal.value = true
}

const updateAbsensi = async () => {
  try {
    let jamMasuk = updateFormData.value.jam_masuk
    if (jamMasuk && jamMasuk.length === 5) {
      jamMasuk += ':00'
    }

    const response = await api.request({
      method: 'PUT',
      url: `/absensi/${updateFormData.value.id}/updateAbsensi`,
      data: {
        user_id: updateFormData.value.user_id,
        tanggal: updateFormData.value.tanggal,
        jam_masuk: jamMasuk,
        status: updateFormData.value.status,
        keterangan: updateFormData.value.keterangan
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    showUpdateModal.value = false
    fetchDataAbsensi()

    Swal.fire({
      title: 'Berhasil!',
      text: 'Data absensi berhasil diperbarui',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error updating absensi:', error)
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    })
  }
}

// Add these new methods
const openUpdateJamKeluarModal = (absensi) => {
  selectedAbsensi.value = absensi
  showUpdateJamKeluarModal.value = true
}

const updateJamKeluar = async () => {
  try {
    const response = await api.request({
      method: 'PUT',
      url: `/absensi/${selectedAbsensi.value.id}/updateJam`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataAbsensi()
    showUpdateJamKeluarModal.value = false
    Swal.fire({
      title: 'Berhasil!',
      text: 'Jam keluar berhasil diupdate',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error updating jam keluar:', error)
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat mengupdate jam keluar',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    })
  }
}

const updateStatusDirectly = async (absensi) => {
  try {
    // If changing to 'masuk', show jam masuk modal
    if (absensi.status === 'masuk') {
      jamMasukForm.value = {
        absensiId: absensi.id,
        jam_masuk: absensi.jam_masuk || ''
      }
      showJamMasukModal.value = true
      return
    }

    // For other statuses, update directly
    const response = await api.request({
      method: 'PUT',
      url: `/absensi/${absensi.id}/updateStatus`,
      data: {
        status: absensi.status,
        jam_masuk: '00:00:00' // Set default for non-masuk status
      },
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataAbsensi()
    Swal.fire({
      title: 'Berhasil!',
      text: 'Status berhasil diupdate',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    // Revert the change if failed
    absensi.status = selectedAbsensi.value?.status || 'masuk'
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat mengupdate status',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    })
  }
}

const submitJamMasuk = async () => {
  try {
    let jamMasuk = jamMasukForm.value.jam_masuk
    if (jamMasuk && jamMasuk.length === 5) {
      jamMasuk += ':00'
    }

    const response = await api.request({
      method: 'PUT',
      url: `/absensi/${jamMasukForm.value.absensiId}/updateStatus`,
      data: {
        status: 'masuk',
        jam_masuk: jamMasuk
      },
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    showJamMasukModal.value = false
    fetchDataAbsensi()
    Swal.fire({
      title: 'Berhasil!',
      text: 'Status dan jam masuk berhasil diupdate',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error updating jam masuk:', error)
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat mengupdate jam masuk',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    })
  }
}
// Form data
const formData = ref({
  user_id: '',
  tanggal: new Date().toISOString().split('T')[0], // Default to today
  jam_masuk: '',
  status: 'masuk',
  keterangan: ''
})

const statusOptions = [
  { value: 'masuk', label: 'Masuk' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'cuti', label: 'Cuti' }
]

// Watch for search query changes
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDataAbsensi()
  }, 500)
})

// Fetch attendance data
const fetchDataAbsensi = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/absensi?page=${currentPage.value}&search=${searchQuery.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    absensiData.value = response.data.data.data
    totalPages.value = response.data.data.last_page
  } catch (error) {
    console.error('Error fetching data absensi:', error)
  }
}

// Fetch users data
const fetchUsers = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/users',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })
    // Filter out members on the frontend
    users.value = response.data.data.data.filter((user) => user.role !== 'member')
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// Create new attendance
const createAbsensi = async () => {
  let jamMasuk = formData.value.jam_masuk
  if (jamMasuk && jamMasuk.length === 5) {
    jamMasuk += ':00'
  }
  try {
    // Format data sesuai kebutuhan backend
    const postData = {
      user_id: formData.value.user_id,
      tanggal: formData.value.tanggal,
      jam_masuk: jamMasuk,
      status: formData.value.status,
      keterangan: formData.value.keterangan
    }

    console.log('Data yang dikirim:', postData) // Untuk debugging

    const response = await api.request({
      method: 'POST',
      url: '/absensi',
      data: postData, // Gunakan objek yang sudah diformat
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json' // Pastikan header ini ada
      }
    })

    showCreateModal.value = false
    fetchDataAbsensi()
    resetForm()

    Swal.fire({
      title: 'Berhasil!',
      text: 'Data absensi berhasil ditambahkan',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error detail:', error.response) // Lihat response error lebih detail
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    })
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    user_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam_masuk: '',
    status: 'masuk',
    keterangan: ''
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDataAbsensi()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDataAbsensi()
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
      url: `/absensi/${itemToDelete.value.id}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    fetchDataAbsensi()
    showModal.value = false
    Swal.fire({
      title: 'Berhasil!',
      text: 'Data absensi berhasil dihapus.',
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

const confirmDelete = (absensi) => {
  itemToDelete.value = absensi
  modalMessage.value = 'Apakah Anda yakin ingin menghapus data absensi ini?'
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
      url: '/absensi/import',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    alert('Data berhasil diimpor.')
    showImportModal.value = false
    fetchDataAbsensi()
  } catch (error) {
    console.error('Error importing data:', error)
    alert('Terjadi kesalahan saat impor data.')
  }
}

const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/absensi/export/pdf',
      responseType: 'blob'
    })

    // Create filename with current date
    const currentDate = new Date().toISOString().slice(0, 10)
    const filename = `laporan_absensi_${currentDate}.pdf`

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Clean up
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Show success notification only
    Swal.fire({
      title: 'Berhasil!',
      text: 'Laporan PDF berhasil diunduh',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    // No error message shown to user
  }
}

const exportToExcel = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/absensi/export/excel',
      responseType: 'blob'
    })

    // Create filename with current date
    const currentDate = new Date().toISOString().slice(0, 10)
    const filename = `laporan_absensi_${currentDate}.xlsx`

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Clean up
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Show success notification only
    Swal.fire({
      title: 'Berhasil!',
      text: 'Laporan Excel berhasil diunduh',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })
  } catch (error) {
    console.error('Error exporting Excel:', error)
    // No error message shown to user
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
  fetchDataAbsensi()
  fetchUsers()
})
</script>

<template>
  <DefaultLayoutAdmin>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Data Absensi</h4>
      <!-- Action Buttons -->

      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">
            <button
              @click="showCreateModal = true"
              class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Create Data
            </button>

            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama karyawan..."
                class="border px-4 py-2 rounded-md w-1/2"
              />
              <button
                @click="fetchDataAbsensi"
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
                Nama Karyawan
              </th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal
              </th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Jam Masuk
              </th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Jam Keluar
              </th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="absensiData.length === 0">
              <td colspan="7" class="text-center py-5 px-4 text-gray-500">
                Data absensi tidak ada
              </td>
            </tr>
            <tr v-for="(absensi, index) in absensiData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ absensi.id }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ absensi.user?.nama || 'N/A' }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ absensi.tanggal }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ absensi.jam_masuk || '-' }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">
                  {{ absensi.jam_keluar }}
                  <button
                    v-if="!absensi.jam_keluar"
                    @click="openUpdateJamKeluarModal(absensi)"
                    class="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Selesai
                  </button>
                </p>
              </td>
              <td class="py-5 px-4">
                <select
                  v-model="absensi.status"
                  @change="
                    absensi.status === 'masuk'
                      ? updateStatusDirectly(absensi)
                      : updateStatusDirectly(absensi)
                  "
                  class="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  <option value="masuk">Masuk</option>
                  <option value="sakit">Sakit</option>
                  <option value="cuti">Cuti</option>
                </select>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button @click="openUpdateModal(absensi)" class="hover:text-primary">Edit</button>
                  <button @click="confirmDelete(absensi)" class="hover:text-primary">Delete</button>
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
    <!-- Create Data Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Tambah Data Absensi</h2>
          <button @click="showCreateModal = false" class="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createAbsensi" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
            <select
              v-model="formData.user_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled selected>Pilih Karyawan</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.nama }} - {{ user.role }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              v-model="formData.tanggal"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Status field moved up -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="formData.status"
              @change="handleStatusChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="option in statusOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Jam Masuk field - only shown when status is 'masuk' -->
          <div v-if="formData.status === 'masuk'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
            <input
              v-model="formData.jam_masuk"
              type="time"
              step="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Contoh: 08:00:00</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              v-model="formData.keterangan"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan keterangan jika diperlukan"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Jam Masuk Modal -->
    <div
      v-if="showJamMasukModal"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Input Jam Masuk</h2>
          <button @click="showJamMasukModal = false" class="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
            <input
              v-model="jamMasukForm.jam_masuk"
              type="time"
              step="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Contoh: 08:00:00</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showJamMasukModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              @click="submitJamMasuk"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Update Data Modal -->
    <div
      v-if="showUpdateModal"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Update Data Absensi</h2>
          <button @click="showUpdateModal = false" class="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="updateAbsensi" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
            <select
              v-model="updateFormData.user_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih Karyawan</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
                :selected="user.id === updateFormData.user_id"
              >
                {{ user.nama }} - {{ user.role }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              v-model="updateFormData.tanggal"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Status field moved up -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="updateFormData.status"
              @change="handleUpdateStatusChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="option in statusOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Jam Masuk field - only shown when status is 'masuk' -->
          <div v-if="updateFormData.status === 'masuk'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
            <input
              v-model="updateFormData.jam_masuk"
              type="time"
              step="1"
              :required="updateFormData.status === 'masuk'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Contoh: 08:00:00</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              v-model="updateFormData.keterangan"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan keterangan jika diperlukan"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showUpdateModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Update Jam Keluar Modal -->
    <div
      v-if="showUpdateJamKeluarModal"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Update Jam Keluar</h2>
          <button
            @click="showUpdateJamKeluarModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <p>
            Anda yakin ingin mengupdate jam keluar untuk absensi
            <strong>{{ selectedAbsensi.user?.nama }}</strong> pada tanggal
            <strong>{{ selectedAbsensi.tanggal }}</strong
            >?
          </p>
          <p>Jam keluar akan diisi dengan waktu saat ini.</p>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showUpdateJamKeluarModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              @click="updateJamKeluar"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Update Jam Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Konfirmasi -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-xl font-semibold mb-4">Import Data Absensi</h3>
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
