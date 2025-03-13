<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'

// State laporan
const laporanPenjualanData = ref([])
const rekapLaporan = ref({ total_penjualan: 0, total_keuntungan: 0, total_barang: 0 })
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const periode = ref('semua')
const tanggal = ref('')
const bulan = ref('')
const tahun = ref('')
const startDate = ref('')
const endDate = ref('')

// Tentukan input yang ditampilkan berdasarkan filter periode
const showTanggalInput = computed(() => periode.value === 'harian')
const showBulanInput = computed(() => periode.value === 'bulanan')
const showTahunInput = computed(() => periode.value === 'tahunan')
const showCustomRange = computed(() => periode.value === 'custom')

// Ambil data laporan
const fetchDataLaporan = async () => {
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      periode: periode.value,
    }

    if (periode.value === 'harian' && tanggal.value) {
      params.tanggal = tanggal.value
    } else if (periode.value === 'bulanan' && bulan.value) {
      params.bulan = bulan.value.substring(5, 7)
      params.tahun = bulan.value.substring(0, 4)
    } else if (periode.value === 'tahunan' && tahun.value) {
      params.tahun = tahun.value
    } else if (periode.value === 'custom' && startDate.value && endDate.value) {
      params.start_date = startDate.value
      params.end_date = endDate.value
    }

    const response = await api.get('/laporan-penjualan', { params })
    laporanPenjualanData.value = response.data.data
    totalPages.value = response.data.pagination.last_page

    // Simpan data rekap
    rekapLaporan.value.total_penjualan = response.data.total_penjualan
    rekapLaporan.value.total_keuntungan = response.data.total_keuntungan
    rekapLaporan.value.total_barang = response.data.total_barang
  } catch (error) {
    console.error('Error fetching laporan penjualan:', error)
  }
}

// Panggil data saat komponen dimuat
onMounted(fetchDataLaporan)
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Laporan Penjualan</h4>

      <!-- Filter -->
      <div class="flex flex-wrap gap-4 mb-4">
        <select v-model="periode" @change="fetchDataLaporan" class="border p-2 rounded w-full sm:w-auto">
          <option value="semua">Semua</option>
          <option value="harian">Harian</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
          <option value="custom">Custom</option>
        </select>

        <input v-if="showTanggalInput" v-model="tanggal" type="date" class="border p-2 rounded w-full sm:w-auto" />
        <input v-if="showBulanInput" v-model="bulan" type="month" class="border p-2 rounded w-full sm:w-auto" />
        <input v-if="showTahunInput" v-model="tahun" type="number" min="2000" max="2100" class="border p-2 rounded w-full sm:w-auto" placeholder="Tahun" />

        <input v-if="showCustomRange" v-model="startDate" type="date" class="border p-2 rounded w-full sm:w-auto" />
        <input v-if="showCustomRange" v-model="endDate" type="date" class="border p-2 rounded w-full sm:w-auto" />

        <button @click="fetchDataLaporan" class="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">Terapkan</button>
      </div>
      
      <!-- Rekap Data -->
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold text-blue-700">Periode</h5>
          <p class="text-blue-900">{{ periode.charAt(0).toUpperCase() + periode.slice(1) }}</p>
        </div>
        <div class="bg-green-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold text-green-700">Total Keuntungan</h5>
          <p class="text-green-900">Rp {{ rekapLaporan.total_keuntungan.toLocaleString() }}</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold text-yellow-700">Total Barang</h5>
          <p class="text-yellow-900">{{ rekapLaporan.total_barang }} pcs</p>
        </div>
        <div class="bg-red-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold text-red-700">Total Penjualan</h5>
          <p class="text-red-900">Rp {{ rekapLaporan.total_penjualan.toLocaleString() }}</p>
        </div>
      </div>
      
      <!-- Tabel -->
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">ID</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Total Penjualan</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Keuntungan</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Tanggal Penjualan</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>  
          <tbody>
            <tr v-if="laporanPenjualanData.length === 0">
              <td colspan="5" class="text-center py-5 px-4 text-gray-500">Data laporan penjualan tidak ditemukan</td>
            </tr>
            <tr v-for="(penjualan, index) in laporanPenjualanData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">{{ penjualan.id }}</td>
              <td class="py-5 px-4">Rp {{ penjualan.total_penjualan.toLocaleString() }}</td>
              <td class="py-5 px-4">Rp {{ penjualan.total_keuntungan.toLocaleString() }}</td>
              <td class="py-5 px-4">{{ penjualan.tanggal_penjualan }}</td>
              <td class="py-5 px-4">
                <button @click="$router.push({ name: 'penjualan.detail', params: { id: penjualan.id } })" class="hover:text-primary">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>
  