<script setup>
import api from '@/api'
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue'
import { ref, onMounted } from 'vue';

// Data barang
const laporanBarang = ref([]);

// Status Tersedia dan Vendor untuk filter
const statusBarang = ref('');

// Fetch data dari API dengan filter
const fetchDataLaporan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/laporan-status',
      params: {
        status_barang: statusBarang.value,


      },
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Set response data ke state laporanBarang
    laporanBarang.value = response.data.data;
  } catch (error) {
    console.error("Error fetching laporan barang:", error);
  }
};

// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataLaporan();
});

// Fungsi untuk mengupdate filter dan refresh data
const updateFilter = () => {
  fetchDataLaporan();
};

// Fungsi untuk print laporan

</script>

<template>
  <DefaultLayoutSuper>
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
            <option value="">Pilih Status</option>
            <option value="baik">Baik</option>
            <option value="normal">Normal</option>
            <option value="rusak">Rusak</option>
          </select>
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
                Vendor
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Status Barang
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Status Tersedia
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
                <p class="text-black dark:text-white">{{ barang.vendor }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.status_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.status_tersedia }}</p>
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

/* Print Styles */
@media print {
  /* Sembunyikan elemen yang tidak diinginkan */
  .flex.mb-4, .bg-primary, h4, .print-only {
    display: none;
  }

  /* Tampilkan hanya tabel dan judul print */
  #tableContainer {
    width: 100%;
  }

  /* Judul di atas tabel untuk print */
  .print-only {
    display: block;
    text-align: center;
    margin-bottom: 20px;
  }

  .print-only h2 {
    font-size: 24px;
    font-weight: bold;
  }
}
</style>
