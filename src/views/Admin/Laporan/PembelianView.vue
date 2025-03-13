<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'

const laporanPembelianData = ref([])
const rekapLaporan = ref({ total_pembelian: 0, total_barang: 0 })
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const periode = ref('semua')
const tanggal = ref('')
const bulan = ref('')
const tahun = ref('')
const startDate = ref('')
const endDate = ref('')

const showTanggalInput = computed(() => periode.value === 'harian')
const showBulanInput = computed(() => periode.value === 'bulanan')
const showTahunInput = computed(() => periode.value === 'tahunan')
const showCustomRange = computed(() => periode.value === 'custom')

const fetchDataLaporan = async () => {
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      periode: periode.value
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

    const response = await api.get('/laporan-pembelian', { params })
    laporanPembelianData.value = response.data.data
    totalPages.value = response.data.pagination.last_page

    rekapLaporan.value.total_pembelian = response.data.total_pembelian
    rekapLaporan.value.total_barang = response.data.total_barang
  } catch (error) {
    console.error('Error fetching laporan pembelian:', error)
  }
}

onMounted(fetchDataLaporan)
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default">
      <h4 class="mb-6 text-xl font-semibold">Laporan Pembelian</h4>

      <div class="flex flex-wrap gap-4 mb-4">
        <select
          v-model="periode"
          @change="fetchDataLaporan"
          class="border p-2 rounded w-full sm:w-auto"
        >
          <option value="semua">Semua</option>
          <option value="harian">Harian</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
          <option value="custom">Custom</option>
        </select>

        <input
          v-if="showTanggalInput"
          v-model="tanggal"
          type="date"
          class="border p-2 rounded w-full sm:w-auto"
        />
        <input
          v-if="showBulanInput"
          v-model="bulan"
          type="month"
          class="border p-2 rounded w-full sm:w-auto"
        />
        <input
          v-if="showTahunInput"
          v-model="tahun"
          type="number"
          min="2000"
          max="2100"
          class="border p-2 rounded w-full sm:w-auto"
          placeholder="Tahun"
        />
        <input
          v-if="showCustomRange"
          v-model="startDate"
          type="date"
          class="border p-2 rounded w-full sm:w-auto"
        />
        <input
          v-if="showCustomRange"
          v-model="endDate"
          type="date"
          class="border p-2 rounded w-full sm:w-auto"
        />

        <button
          @click="fetchDataLaporan"
          class="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Terapkan
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold text-blue-700">Periode</h5>
          <p class="text-blue-900">{{ periode.charAt(0).toUpperCase() + periode.slice(1) }}</p>
        </div>
        <div class="bg-blue-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold">Total Pembelian</h5>
          <p>Rp {{ rekapLaporan.total_pembelian.toLocaleString() }}</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg text-center">
          <h5 class="text-lg font-semibold">Total Barang</h5>
          <p>{{ rekapLaporan.total_barang }} pcs</p>
        </div>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left">
              <th class="py-4 px-4 font-medium">ID</th>
              <th class="py-4 px-4 font-medium">Total</th>
              <th class="py-4 px-4 font-medium">Tanggal Pembelian</th>
              <th class="py-4 px-4 font-medium">Vendor</th>
              <th class="py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="laporanPembelianData.length === 0">
              <td colspan="5" class="text-center py-5 text-gray-500">Data tidak ditemukan</td>
            </tr>
            <tr v-for="(pembelian, index) in laporanPembelianData" :key="index">
              <td class="py-5 px-4">{{ pembelian.id }}</td>
              <td class="py-5 px-4">Rp {{ pembelian.total.toLocaleString() }}</td>
              <td class="py-5 px-4">{{ pembelian.tanggal_pembelian }}</td>
              <td class="py-5 px-4">{{ pembelian.vendor.nama_vendor }}</td>
              <td class="py-5 px-4">
                <button
                  @click="$router.push({ name: 'pembelian.detail', params: { id: pembelian.id } })"
                  class="hover:text-primary"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>
