<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';
import { useRoute } from 'vue-router';
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue';

// Ambil ID dari route
const route = useRoute();
const pembelian = ref(null); 
const detailData = ref([]); 

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
      url: `/pembelian/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    if (response.data) {
      pembelian.value = response.data;
      detailData.value = response.data.detail_pembelian; // Perhatikan perubahan di sini
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat data pembelian';
    console.error("Error fetching detail pembelian:", err);
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
  <DefaultLayoutSuper>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Detail Pembelian</h4>

      <!-- Informasi Pembelian -->
      <div class="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50 dark:bg-meta-4">
        <p class="text-lg text-black dark:text-white"><strong>ID:</strong> {{ pembelian?.id }}</p>
        <p class="text-lg text-black dark:text-white"><strong>Tanggal Masuk:</strong> {{ pembelian?.tanggal_masuk }}</p>
        <p class="text-lg text-black dark:text-white"><strong>Tanggal Pembelian:</strong> {{ pembelian?.tanggal_pembelian }}</p>
        <p class="text-lg text-black dark:text-white"><strong>Total Pembelian:</strong> {{ formatRupiah(pembelian?.total) }}</p>
      </div>
      
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID  
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Kode Barang  
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Barang  
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, index) in detailData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ detail.id }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ detail.kode_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ detail.nama_barang }}</p>
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayoutSuper>
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
