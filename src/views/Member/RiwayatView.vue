<script setup>
import api from '@/api'
import DefaultLayoutMembers from '@/layouts/DefaultLayoutMembers.vue'
import { ref, onMounted, watch } from 'vue'

const riwayatData = ref([]) // Data riwayat aktivitas
const currentPage = ref(1) // Halaman saat ini
const totalPages = ref(1) // Total halaman
const searchQuery = ref('') // Query pencarian
let searchTimeout = null // Timeout untuk debounce

// Fetch data riwayat aktivitas
const fetchRiwayatAktifitas = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/riwayat-aktifitas?page=${currentPage.value}&search=${searchQuery.value}`,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    riwayatData.value = response.data.data // Direct access to data
    totalPages.value = response.data.total_pages // Access total pages from response
  } catch (error) {
    console.error('Error fetching Riwayat Aktifitas:', error)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchRiwayatAktifitas()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchRiwayatAktifitas()
  }
}

// Watch untuk search query
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchRiwayatAktifitas()
  }, 500)
})

// Fetch data saat komponen pertama kali dimuat
onMounted(() => {
  fetchRiwayatAktifitas()
})
</script>

<template>
  <DefaultLayoutMembers>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Riwayat Aktifitas</h4>

      <!-- Pencarian -->
      <div class="flex justify-between mb-4">
        <div class="flex gap-4 items-center">
          <div class="flex items-center space-x-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari aktivitas..."
              class="border px-4 py-2 rounded-md w-1/2"
            />
            <button
              @click="fetchRiwayatAktifitas"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Aktivitas
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Deskripsi
              </th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="riwayatData.length === 0">
              <td colspan="3" class="text-center py-5 px-4 text-gray-500">
                Data riwayat aktivitas tidak ada
              </td>
            </tr>
            <tr v-for="(log, index) in riwayatData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ (currentPage - 1) * riwayatData.length + index + 1 }}
                </h5>
              </td>

              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ log.activity }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ log.description }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ log.tanggal_aktifitas }}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
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
  </DefaultLayoutMembers>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}

.bg-primary:hover {
  background-color: #1e40af;
}

.bg-gray-300 {
  background-color: #d1d5db;
}

.bg-gray-300:hover {
  background-color: #9ca3af;
}
</style>
