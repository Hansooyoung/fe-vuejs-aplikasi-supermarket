<script setup>

import "jspdf-autotable";

import DefaultLayoutAdmin from "@/layouts/DefaultLayoutAdmin.vue";
import api from "@/api";
import { ref, onMounted, watch } from "vue";
import { debounce } from "lodash";


// Data barang
const laporanBarang = ref([]);

// Filter values
const statusBarang = ref('');
const statusTersedia = ref('');
const namaVendor = ref('');
const startDate = ref('');
const endDate = ref('');

// Untuk menampilkan modal
const showExportModal = ref(false);

// Fungsi fetch data dengan filter
const fetchDataLaporan = async () => {
  try {
    const response = await api.request({
      method: "GET",
      url: "/laporan-barang",
      params: {
        status_barang: statusBarang.value,
        status_tersedia: statusTersedia.value,
        nama_vendor: namaVendor.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
    });

    // Set response data ke state laporanBarang
    laporanBarang.value = response.data.data;
  } catch (error) {
    console.error("Error fetching laporan barang:", error);
  }
};

// Fungsi debounce untuk fetch data
const debouncedFetchDataLaporan = debounce(fetchDataLaporan, 3000);

// Gunakan debounce pada perubahan filter
watch([statusBarang, statusTersedia, namaVendor, startDate, endDate], () => {
  debouncedFetchDataLaporan();
});

// Jalankan fetch data awal
onMounted(() => {
  fetchDataLaporan();
});

// Fungsi untuk export PDF
const exportToPDF = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/laporan-barang/export/pdf',
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-barang.pdf'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Terjadi kesalahan saat export PDF.')
  }
}

// Fungsi untuk export Excel
const exportToExcel = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/laporan-barang/export/excel',
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'laporan-barang.xlsx'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting Excel:', error)
    alert('Terjadi kesalahan saat export Excel.')
  }
}

// Fungsi untuk membuka modal export
const openExportModal = () => {
  showExportModal.value = true;
};

// Fungsi untuk menutup modal export
const closeExportModal = () => {
  showExportModal.value = false;
};


</script>


<template>
  <DefaultLayoutAdmin>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Laporan Barang</h4>

      <!-- Filter Section -->
      <div class="flex flex-wrap mb-4 gap-4">
        <!-- Status Tersedia Filter -->
        <div class="w-full sm:w-auto">
          <label for="statusTersedia" class="block text-sm font-medium">Status Barang</label>
          <select
            id="statusTersedia"
            v-model="statusTersedia"
            @change="debouncedFetchDataLaporan"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Pilih Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="tidak_tersedia">Tidak Tersedia</option>
          </select>
        </div>

        <!-- Status Barang Filter -->
        <div class="w-full sm:w-auto">
          <label for="statusBarang" class="block text-sm font-medium">Kondisi Barang</label>
          <select
            id="statusBarang"
            v-model="statusBarang"
            @change="debouncedFetchDataLaporan"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Pilih Status</option>
            <option value="baik">Baik</option>
            <option value="normal">Normal</option>
            <option value="rusak">Rusak</option>
          </select>
        </div>

        <!-- Nama Vendor Filter -->
        <div class="w-full sm:w-auto">
          <label for="namaVendor" class="block text-sm font-medium">Nama Vendor</label>
          <input
            id="namaVendor"
            v-model="namaVendor"
            @input="debouncedFetchDataLaporan"
            type="text"
            placeholder="Cari Vendor"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <!-- Tanggal Mulai Filter -->
        <div class="w-full sm:w-auto">
          <label for="startDate" class="block text-sm font-medium">Tanggal Mulai</label>
          <input
            id="startDate"
            type="date"
            v-model="startDate"
            @change="debouncedFetchDataLaporan"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <!-- Tanggal Akhir Filter -->
        <div class="w-full sm:w-auto">
          <label for="endDate" class="block text-sm font-medium">Tanggal Akhir</label>
          <input
            id="endDate"
            type="date"
            v-model="endDate"
            @change="debouncedFetchDataLaporan"
            class="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mb-4 gap-4">
        <button @click="openExportModal" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
          Print / Export
        </button>
      </div>

      <!-- Modal Export -->
      <div v-if="showExportModal" class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
  <div class="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
    <h2 class="text-xl mb-4">Pilih Format Export</h2>
    <div class="flex justify-between w-full">
      <button @click="exportToPDF" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">Export PDF</button>
      <button @click="exportToExcel" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">Export Excel</button>
    </div>
    <div class="mt-4">
      <button @click="closeExportModal" class="text-red-500">Tutup</button>
    </div>
  </div>
</div>


      <!-- Table Barang -->
      <div class="max-w-full overflow-x-auto" id="tableContainer">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Kode Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Jenis Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Nama Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Operator</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Vendor</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Tanggal Terima</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Kondisi Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status Barang</th>
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
                <p class="text-black dark:text-white">{{ barang.user_nama }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.vendor }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.tanggal_terima }}</p>
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
  </DefaultLayoutAdmin>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}

.bg-primary:hover {
  background-color: #1e40af;
}

/* Modal */
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 10px;
}

.shadow-lg {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.w-1tiga {
  width: 33%;
}

button {
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}
</style>
