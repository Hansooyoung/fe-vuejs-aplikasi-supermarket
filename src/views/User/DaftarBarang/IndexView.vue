<script setup>
import api from '@/api';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';
import { ref, onMounted, watch } from 'vue';
import { debounce } from 'lodash'; // Pastikan lodash sudah diinstal

// Data dan state filter
const barangData = ref([]);
const jenisBarangList = ref([]);
const vendorList = ref([]);
const searchKeyword = ref('');
const selectedJenisBarang = ref('');
const selectedVendor = ref('');
const showModal = ref(false);
const itemToDelete = ref(null);
const modalMessage = ref('');
const isDeleteButtonVisible = ref(true);

const fetchBarangData = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/barang-inventaris',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      params: {
        search: searchKeyword.value,
        jenis_barang: selectedJenisBarang.value,
        vendor: selectedVendor.value,
      },
    });

    barangData.value = response.data.data;
  } catch (error) {
    console.error('Error fetching barang:', error);
  }
};

// Debounced function for search
const debouncedFetchBarangData = debounce(fetchBarangData, 3000);

const fetchJenisBarang = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/jenis-barang',
    });
    jenisBarangList.value = response.data.data;
  } catch (error) {
    console.error('Error fetching jenis barang:', error);
  }
};

const fetchVendorList = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/vendor',
    });
    vendorList.value = response.data.data;
  } catch (error) {
    console.error('Error fetching vendor:', error);
  }
};

const deleteItem = async () => {
  if (!itemToDelete.value) {
    console.error("No item selected for deletion");
    return;
  }

  try {
    await api.request({
      method: 'DELETE',
      url: `/barang-inventaris/${itemToDelete.value.kode_barang}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
    });

    fetchBarangData();
    showModal.value = false;
    alert('Data berhasil dihapus!');
  } catch (error) {
    if (error.response?.status === 400) {
      modalMessage.value = 'Barang masih dipinjam tidak bisa di hapus.';
      isDeleteButtonVisible.value = false;
    } else {
      alert('Terjadi kesalahan saat menghapus data.');
    }
    console.error('Error deleting item:', error);
  }
};

const confirmDelete = (barang) => {
  itemToDelete.value = barang;
  modalMessage.value = 'Apakah Anda yakin ingin menghapus barang ini?';
  isDeleteButtonVisible.value = true;
  showModal.value = true;
};

// Fetch data awal
onMounted(() => {
  fetchJenisBarang();
  fetchVendorList();
  fetchBarangData();
});

// Gunakan debounce untuk search dan perubahan filter
watch([searchKeyword, selectedJenisBarang, selectedVendor], () => {
  debouncedFetchBarangData();
});
</script>


<template>
  <DefaultLayoutUser>
    <div class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Daftar Barang</h4>

      <!-- Filter Section -->
      <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Cari Kode atau Nama Barang"
          class="w-full p-2 border rounded-lg"
        />

        <!-- Select Jenis Barang -->
        <select v-model="selectedJenisBarang" class="w-full p-2 border rounded-lg">
          <option value="">Pilih Jenis Barang</option>
          <option v-for="jenis in jenisBarangList" :key="jenis.id" :value="jenis.jenis_barang_nama">
            {{ jenis.jenis_barang_nama }}
          </option>
        </select>

        <!-- Select Vendor -->
        <select v-model="selectedVendor" class="w-full p-2 border rounded-lg">
          <option value="">Pilih Vendor</option>
          <option v-for="vendor in vendorList" :key="vendor.id" :value="vendor.nama_vendor">
            {{ vendor.nama_vendor }}
          </option>
        </select>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Kode Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Jenis Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Nama Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Nama Operator</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Vendor</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Tanggal Terima</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status Barang</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Status Tersedia</th>
              <th class="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(barang, index) in barangData" :key="index">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-black dark:text-white">{{ barang.kode_barang }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.jenis_barang.jenis_barang_nama }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.nama_barang }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.user.nama }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-black dark:text-white">{{ barang.vendor.nama_vendor }}</p>
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
              <td class="py-5 px-4">
                <div class="flex items-center space-x-3.5">
                  <button @click="$router.push({ name: 'daftar-barang.update', params: { kode_barang: barang.kode_barang } })" class="hover:text-primary">Edit</button>
                  <button @click="confirmDelete(barang)" class="hover:text-primary">Delete</button>
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
