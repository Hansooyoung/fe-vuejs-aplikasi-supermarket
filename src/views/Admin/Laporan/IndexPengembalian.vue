<script setup>
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "@/api";
import DefaultLayoutAdmin from "@/layouts/DefaultLayoutAdmin.vue";
import { ref, onMounted } from "vue";

// Data barang
const laporanStatus = ref([]);
const statusKembali = ref('');
const showExportModal = ref(false);

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

    laporanStatus.value = response.data.data;
  } catch (error) {
    console.error("Error fetching jenis barang:", error);
  }
};

// Fungsi untuk export ke PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Laporan Pengembalian Barang", 14, 20);

  const tableColumn = ["ID Pengembalian", "ID Peminjaman", "Nama Barang","Nama Siswa","Tanggal Peminjaman", "Tanggal Kembali", "Status Barang","Kondisi Barang"];
  const tableRows = laporanStatus.value.map((barang) => [
  barang.id_pengembalian,
      barang.id_peminjaman,
      barang.nama_barang,
      barang.nama_siswa,
      barang.tanggal_peminjaman,
      barang.tanggal_kembali,
      barang.status_kembali,
      barang.status_barang,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save("laporan-pengembalian.pdf");
};

// Fungsi untuk export ke Excel
const exportToExcel = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Laporan Pengembalian Barang"],
    [],
    ["ID Pengembalian", "ID Peminjaman", "Nama Barang","Nama Siswa","Tanggal Peminjaman", "Tanggal Kembali", "Status Barang","Kondisi Barang"],
    ...laporanStatus.value.map((barang) => [
      barang.id_pengembalian,
      barang.id_peminjaman,
      barang.nama_barang,
      barang.nama_siswa,
      barang.tanggal_peminjaman,
      barang.tanggal_kembali,
      barang.status_kembali,
      barang.status_barang,
    ]),
  ]);

  ws['!cols'] = [
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 200 },
    { wpx: 150 },
    { wpx: 100 },
    { wpx: 100 },
    { wpx: 100 },
    { wpx: 100 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengembalian");
  XLSX.writeFile(wb, "laporan-pengembalian.xlsx");
};

const openExportModal = () => {
  showExportModal.value = true;
};

const closeExportModal = () => {
  showExportModal.value = false;
};

onMounted(() => {
  fetchDataLaporan();
});

const updateFilter = () => {
  fetchDataLaporan();
};
</script>


<template>
  <DefaultLayoutAdmin>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Laporan Pengembalian</h4>

      <!-- Filter Section -->
      <div class="flex mb-4">
        <div class="mr-4">
          <label for="statusKembali" class="block text-sm font-medium">Status Barang</label>
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

      <!-- Action Buttons -->
      <div class="flex justify-end mb-4">
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
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">ID Pengembalian</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">ID Peminjaman</th>
              <th class="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Nama Barang</th>
              <th class="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Nama Siswa</th>
              <th class="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Tanggal Peminjaman</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Tanggal Kembali</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Kondisi Barang</th>
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
  </DefaultLayoutAdmin>
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
