<script setup>
import api from '@/api'
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue' 
import { ref, onMounted } from 'vue';

// Data barang
const jenisBarangData = ref([]);
const showModal = ref(false); // Flag untuk menampilkan modal
const itemToDelete = ref(null); // Menyimpan jenis barang yang akan dihapus
const modalMessage = ref(''); // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true); // Untuk menentukan apakah tombol "Hapus" harus ditampilkan

// Fetch data dari API
const fetchDataJenisBarang = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/jenis-barang',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Set response data ke state jenisBarangData
    jenisBarangData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching jenis barang:", error);
  }
};

// Fungsi untuk menghapus item
const deleteItem = async () => {
  if (!itemToDelete.value) {
    console.error("No item selected for deletion");
    return;
  }

  try {
    await api.request({
      method: 'DELETE',
      url: `/jenis-barang/${itemToDelete.value.jenis_barang_kode}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    fetchDataJenisBarang(); // Reload data setelah berhasil dihapus
    showModal.value = false; // Tutup modal setelah penghapusan
    alert('Data berhasil dihapus!');
  } catch (error) {
    if (error.response?.status === 400) {
      modalMessage.value = 'Data tidak bisa dihapus karena memiliki relasi dengan data lain.';
      isDeleteButtonVisible.value = false;
    } else {
      alert('Terjadi kesalahan saat menghapus data.');
    }
    console.error('Error deleting item:', error);
  }
};

const confirmDelete = (jenisBarang) => {
  itemToDelete.value = jenisBarang;
  modalMessage.value = 'Apakah Anda yakin ingin menghapus jenis barang ini?';
  isDeleteButtonVisible.value = true;
  showModal.value = true;
};

// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataJenisBarang();
});
</script>

<template>
  <DefaultLayoutSuper>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Jenis Barang</h4>
      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-start mb-4">
          <button @click="$router.push({ name: 'jenis-barang-super.create' })" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
            Create Data
          </button>
        </div>

        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Kode Jenis Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Nama Jenis Barang</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(jenisBarang, index) in jenisBarangData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ jenisBarang.jenis_barang_kode }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ jenisBarang.jenis_barang_nama }}</p>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button @click="$router.push({ name: 'jenis-barang-super.update', params: { jenis_barang_kode: jenisBarang.jenis_barang_kode } })" class="hover:text-primary ">Edit</button>
                  <button @click="confirmDelete(jenisBarang)" class="hover:text-primary">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

<!-- Modal Konfirmasi -->
<div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
  <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
    <h3 class="text-xl font-semibold text-center mb-4" v-if="isDeleteButtonVisible">Konfirmasi Penghapusan</h3>
    <h3 class="text-xl font-semibold text-center mb-4" v-else>Data Tidak Bisa Dihapus</h3>
    <p class="text-center mb-4">{{ modalMessage }}</p>
    <div class="flex justify-between gap-7">
      <button v-if="isDeleteButtonVisible" @click="deleteItem" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1">Hapus</button>
      <button @click="showModal = false" class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 flex-1">Kembali</button>
    </div>
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
