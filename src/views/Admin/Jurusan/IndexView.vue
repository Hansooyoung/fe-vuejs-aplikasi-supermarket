<script setup>
import api from '@/api'
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue'
import { ref, onMounted } from 'vue';

// Data kelas
const jurusanData = ref([]);
const showModal = ref(false); // Flag untuk menampilkan modal
const itemToDelete = ref(null); // Menyimpan kelas yang akan dihapus
const modalMessage = ref(''); // Pesan yang ditampilkan di dalam modal
const isDeleteButtonVisible = ref(true); // Untuk menentukan apakah tombol "Hapus" harus ditampilkan
// Fetch data dari API
const fetchDataJurusan = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/jurusan',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Set response data ke state kelasData
    jurusanData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching kelas:", error);
  }
};

// Fungsi untuk menghapus item
const deleteItem = async () => {
  // Pastikan itemToDelete tidak null sebelum melanjutkan
  if (!itemToDelete.value) {
    console.error("No item selected for deletion");
    return; // Prevent deletion if no item is selected
  }

  try {
    await api.request({
      method: 'DELETE',
      url: `/jurusan/${itemToDelete.value.id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    // Reload data setelah berhasil dihapus
    fetchDataJurusan();
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

const confirmDelete = (jurusan) => {
  itemToDelete.value = jurusan;
  modalMessage.value = 'Apakah Anda yakin ingin menghapus jurusan ini?';
  isDeleteButtonVisible.value = true;
  showModal.value = true;
};
// J
// Jalankan fetch data saat komponen terpasang
onMounted(() => {
  fetchDataJurusan();
});
</script>

<template>
  <DefaultLayoutAdmin>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Jurusan</h4>
      <div class="max-w-full overflow-x-auto">
        <div class="flex justify-start mb-4">
          <button 
            @click="$router.push({ name: 'jurusan.create' })"
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Create Data
          </button>
        </div>

        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                ID jurusan
              </th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Nama Jurusan
              </th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(jurusan, index) in jurusanData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ jurusan.id }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ jurusan.nama_jurusan }}</p>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button @click="$router.push({ name: 'jurusan.update', params: { id: jurusan.id } })" class="hover:text-primary ">Edit</button>
                  <button @click="confirmDelete(jurusan)" class="hover:text-primary">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Konfirmasi -->
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