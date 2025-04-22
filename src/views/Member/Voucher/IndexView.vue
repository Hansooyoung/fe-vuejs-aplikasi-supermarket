<script setup>
import api from '@/api'
import DefaultLayoutMembers from '@/layouts/DefaultLayoutMembers.vue'
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

// Data voucher
const voucherData = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('all') // 'all', 'unused', 'used'

// Fetch data dari API
const fetchVouchers = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/history-voucher/my`,
      params: {
        status: statusFilter.value === 'all' ? null : statusFilter.value
      },
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      }
    })

    voucherData.value = response.data.data
    // Karena endpoint tidak mendukung pagination, kita set totalPages ke 1
    totalPages.value = 1
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    Swal.fire({
      title: 'Error!',
      text: 'Gagal mengambil data voucher',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

// Filter voucher berdasarkan status
const filterVouchers = () => {
  currentPage.value = 1
  fetchVouchers()
}

// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchVouchers()
})
</script>

<template>
  <DefaultLayoutMembers>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Voucher Saya</h4>
      
      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-between mb-4">
          <div class="flex gap-4 items-center">
            <div class="flex items-center space-x-2">
            </div>
          </div>
        </div>

        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                No
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Voucher
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Jenis Voucher
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nilai Voucher
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Min Pembelian
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Penukaran
              </th>
              
            </tr>
          </thead>
          <tbody>
            <tr v-if="voucherData.length === 0">
              <td colspan="8" class="text-center py-5 px-4 text-gray-500">
                Tidak ada data voucher
              </td>
            </tr>
            <tr v-for="(voucher, index) in voucherData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">
                  {{ index + 1 }}
                </h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ voucher.voucher.nama_voucher }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ voucher.voucher.jenis_voucher }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">
                  {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(voucher.voucher.nilai_voucher) }}
                </p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">
                  {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(voucher.voucher.min_pembelian) }}
                </p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">
                  {{ new Date(voucher.tanggal_penukaran).toLocaleDateString('id-ID') }}
                </p>
              </td>
             
            </tr>
          </tbody>
        </table>
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

.bg-green-200 {
  background-color: #bbf7d0;
}

.dark .bg-green-700 {
  background-color: #15803d;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.dark .bg-gray-700 {
  background-color: #374151;
}
</style>