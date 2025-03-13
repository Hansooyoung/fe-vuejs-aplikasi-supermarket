<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'

const laporanPenjualanData = ref([])
const rekapLaporan = ref({ total_terjual: 0, total_keuntungan: 0 })
const currentPage = ref(1)
const searchQuery = ref('')
const periode = ref('semua')
const tanggal = ref('')
const bulan = ref('')
const tahun = ref('')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')

const showTanggalInput = computed(() => periode.value === 'harian')
const showBulanInput = computed(() => periode.value === 'bulanan')
const showTahunInput = computed(() => periode.value === 'tahunan')
const showCustomRange = computed(() => periode.value === 'custom')

const fetchDataLaporan = async () => {
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      periode: periode.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    }

    if (periode.value === 'harian' && tanggal.value) params.tanggal = tanggal.value
    if (periode.value === 'bulanan' && bulan.value) {
      params.bulan = bulan.value.substring(5, 7)
      params.tahun = bulan.value.substring(0, 4)
    }
    if (periode.value === 'tahunan' && tahun.value) params.tahun = tahun.value
    if (periode.value === 'custom' && startDate.value && endDate.value) {
      params.start_date = startDate.value
      params.end_date = endDate.value
    }

    const response = await api.get('/laporan-penjualan-barang', { params })
    laporanPenjualanData.value = response.data.data
    rekapLaporan.value.total_keuntungan = response.data.total_keuntungan
    rekapLaporan.value.total_terjual = response.data.total_terjual
  } catch (error) {
    console.error('Error fetching laporan penjualan barang:', error)
  }
}

const sortData = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  fetchDataLaporan()
}

onMounted(fetchDataLaporan)
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default">
      <h4 class="mb-6 text-xl font-semibold">Laporan Penjualan Barang</h4>
      
      <div class="flex flex-wrap gap-4 mb-4">
        <select v-model="periode" @change="fetchDataLaporan" class="border p-2 rounded">
          <option value="semua">Semua</option>
          <option value="harian">Harian</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
          <option value="custom">Custom</option>
        </select>
        
        <input v-if="showTanggalInput" v-model="tanggal" type="date" class="border p-2 rounded" />
        <input v-if="showBulanInput" v-model="bulan" type="month" class="border p-2 rounded" />
        <input v-if="showTahunInput" v-model="tahun" type="number" class="border p-2 rounded" placeholder="Tahun" />
        
        <input v-if="showCustomRange" v-model="startDate" type="date" class="border p-2 rounded" />
        <input v-if="showCustomRange" v-model="endDate" type="date" class="border p-2 rounded" />

        <button @click="fetchDataLaporan" class="bg-blue-600 text-white px-4 py-2 rounded">Terapkan</button>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-green-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold">Total Keuntungan</h5>
          <p>Rp {{ rekapLaporan.total_keuntungan.toLocaleString() }}</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold">Total Barang Terjual</h5>
          <p>{{ rekapLaporan.total_terjual }} pcs</p>
        </div>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-200">
              <th class="py-4 px-4">Kode Barang</th>
              <th class="py-4 px-4">Nama Barang</th>
              <th class="py-4 px-4 cursor-pointer" @click="sortData('total_terjual')">
                Total Terjual
                <span v-if="sortBy === 'total_terjual'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="py-4 px-4 cursor-pointer" @click="sortData('total_keuntungan')">
                Total Keuntungan
                <span v-if="sortBy === 'total_keuntungan'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="laporanPenjualanData.length === 0">
              <td colspan="4" class="text-center py-5 text-gray-500">Data tidak ditemukan</td>
            </tr>
            <tr v-for="(barang, index) in laporanPenjualanData" :key="index">
              <td class="py-5 px-4">{{ barang.kode_barang }}</td>
              <td class="py-5 px-4">{{ barang.nama_barang }}</td>
              <td class="py-5 px-4">{{ barang.total_terjual }} pcs</td>
              <td class="py-5 px-4">Rp {{ barang.total_keuntungan.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>
