<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';
import { useRoute } from 'vue-router';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const route = useRoute();
const penjualan = ref(null); 
const detailData = ref([]); 
const isLoading = ref(true);
const error = ref(null);

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(angka);
};

const fetchDataDetail = async () => {
  const id = route.params.id;
  try {
    const response = await api.request({
      method: 'GET',
      url: `/penjualan/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    penjualan.value = response.data;
    detailData.value = response.data.detail_penjualan; // Perhatikan perubahan di sini
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal memuat data penjualan';
    console.error("Error fetching detail penjualan:", err);
  } finally {
    isLoading.value = false;
  }
};

// Jalankan fetch saat komponen dipasang
onMounted(() => {
  fetchDataDetail();
});
</script>

<template>
  <DefaultLayoutUser>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Detail Penjualan</h4>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <p>Memuat data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8 text-red-500">
        <p>{{ error }}</p>
        <button 
          @click="fetchDataDetail"
          class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Success State -->
      <template v-else>
        <!-- Informasi Penjualan -->
        <div class="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50 dark:bg-meta-4">
          <p class="text-lg text-black dark:text-white"><strong>ID:</strong> {{ penjualan?.id }}</p>
          <p class="text-lg text-black dark:text-white"><strong>Tanggal Penjualan:</strong> {{ penjualan?.tanggal_penjualan }}</p>
          
          <p class="text-lg text-black dark:text-white"><strong>Total Penjualan:</strong> {{ formatRupiah(penjualan?.total_penjualan) }}</p>
          <p class="text-lg text-black dark:text-white"><strong>Total Keuntungan:</strong> {{ formatRupiah(penjualan?.total_keuntungan) }}</p>
        
         
        </div>
        
        <!-- Tabel Detail Penjualan -->
        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  ID  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Barcode  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Nama Barang  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Harga Jual  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Harga Beli  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Jumlah  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Subtotal  
                </th>
                <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Keuntungan  
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in detailData" :key="index">
                <td class="py-5 px-4 pl-9 xl:pl-11">
                  <h5 class="font-medium text-black dark:text-white">{{ detail.id }}</h5>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ detail.barcode }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ detail.nama_barang }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ formatRupiah(detail.harga_jual) }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ formatRupiah(detail.harga_beli) }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ detail.jumlah }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ formatRupiah(detail.sub_total) }}</p>
                </td>
                <td class="py-5 px-4">
                  <p class="text-black dark:text-white">{{ formatRupiah(detail.keuntungan) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </DefaultLayoutUser>
</template>

<style scoped>
/* Gaya yang sama seperti sebelumnya */
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