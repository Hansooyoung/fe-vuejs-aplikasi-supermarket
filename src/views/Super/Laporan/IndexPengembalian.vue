<script setup>
import api from '@/api'
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue' 
import { ref, onMounted } from 'vue';

// Data barang
const laporanStatus = ref([]);
const statusKembali = ref('');

// Fetch data dari API
const fetchDataLaporan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/laporan-pengembalian',
      params: {
        status_kembali: statusKembali.value,
      },
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Set response data ke state laporanStatus
    laporanStatus.value = response.data.data;
  } catch (error) {
    console.error("Error fetching jenis barang:", error);
  }
};

// Fungsi untuk menghapus item


// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataLaporan();
});

const updateFilter = () => {
  fetchDataLaporan();
};
</script>

<template>
  <DefaultLayoutSuper>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Laporan Pengembalian</h4>

      <!-- Filter Section -->
      <div class="flex mb-4">
        <!-- Status Kembali Filter -->
        <div class="mr-4">
          <label for="statusKembali" class="block text-sm font-medium">Status Tersedia</label>
          <select
            id="statusKembali"
            v-model="statusKembali"
            @change="updateFilter"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Pilih Status</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="dikembalikan">Dikembalikan</option>
          </select>
        </div>

      </div>
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID Pengembalian
              </th>
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID Peminjaman
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Nama Siswa
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Peminjaman
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal Kembali
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Status Kembali
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Status Barang
              </th>
             
            </tr>
          </thead>
          <tbody>
            <tr v-for="(laporanPengembalian, index) in laporanStatus" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ laporanPengembalian.id_pengembalian }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.id_peminjaman }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.nama_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.nama_siswa }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.tanggal_peminjaman }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.tanggal_kembali }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.status_kembali }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ laporanPengembalian.status_barang   }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Konfirmasi -->

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
