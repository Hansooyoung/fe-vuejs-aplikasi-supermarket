<script setup>
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'
import { ref, onMounted } from 'vue'

// Data barang
const laporanBarang = ref([])

// Status Tersedia dan Vendor untuk filter
const statusBarang = ref('')
const showExportModal = ref(false)
// Fetch data dari API dengan filter
const fetchDataLaporan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/laporan-status',
      params: {
        status_barang: statusBarang.value
      },
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    // Set response data ke state laporanBarang
    laporanBarang.value = response.data.data
  } catch (error) {
    console.error('Error fetching laporan barang:', error)
  }
}
const exportToPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Laporan Kondisi Barang', 14, 20)

  const tableColumn = ['Kode Barang', 'Jenis Barang', 'Nama Barang', 'Kondisi Barang']
  const tableRows = laporanBarang.value.map((barang) => [
    barang.kode_barang,
    barang.jenis_barang,
    barang.nama_barang,
    barang.status_barang
  ])

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30
  })

  doc.save('laporan-kondisi-barang.pdf')
}

// Fungsi untuk export ke Excel
const exportToExcel = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Laporan Kondisi Barang'],
    [],
    ['Kode Barang', 'Jenis Barang', 'Nama Barang', 'Kondisi Barang'],
    ...laporanBarang.value.map((barang) => [
      barang.kode_barang,
      barang.jenis_barang,
      barang.nama_barang,
      barang.status_barang
    ])
  ])

  ws['!cols'] = [{ wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kondisi Barang')
  XLSX.writeFile(wb, 'laporan-kondisi-barang.xlsx')
}

const openExportModal = () => {
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}
// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataLaporan()
})

// Fungsi untuk mengupdate filter dan refresh data
const updateFilter = () => {
  fetchDataLaporan()
}

// Fungsi untuk print laporan
</script>

<template>
  <DefaultLayoutAdmin>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Laporan Barang</h4>

      <!-- Filter Section -->
      <div class="flex mb-4">
        <div class="mr-4">
          <label for="statusBarang" class="block text-sm font-medium">Status Barang</label>
          <select
            id="statusBarang"
            v-model="statusBarang"
            @change="updateFilter"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Pilih Kondisi Barang</option>
            <option value="baik">Baik</option>
            <option value="normal">Normal</option>
            <option value="rusak">Rusak</option>
          </select>
        </div>
      </div>
      <!-- Action Buttons -->
      <div class="flex justify-end mb-4">
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

      <!-- Table Barang -->
      <div class="max-w-full overflow-x-auto" id="tableContainer">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Kode Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Jenis Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Kondisi Barang
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(barang, index) in laporanBarang" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ barang.kode_barang }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.jenis_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.nama_barang }}</p>
              </td>

              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.status_barang }}</p>
              </td>
            </tr>
          </tbody>
        </table>
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
