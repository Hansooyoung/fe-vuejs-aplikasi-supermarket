<script setup>
import api from '@/api'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue' 
import { ref, onMounted } from 'vue';

// Data barang
const barangData = ref([]);


// Fetch data dari API
const fetchDataBarang = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/barang-pinjam',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Set response data ke state barangData
    barangData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching jenis barang:", error);
  }
};

// Fungsi untuk menghapus item


// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataBarang();
});
</script>

<template>
  <DefaultLayoutUser>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Daftar Barang Belum Kembali</h4>
      <div class="max-w-full overflow-x-auto">
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
                Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Operator
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Vendor 
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Siswa Yang Meminjam 
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Meminjam 
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Akan Dikembalikan Tanggal
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(barang, index) in barangData" :key="index">
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
                <p class="text-black dark:text-white">{{ barang.user }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.nama_vendor }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.siswa }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.tanggal_peminjaman }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.tanggal_pengembalian }}</p>
              </td>
            </tr>
          </tbody>
        </table>
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
