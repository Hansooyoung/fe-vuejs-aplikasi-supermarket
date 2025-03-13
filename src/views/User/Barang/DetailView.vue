<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";
import DefaultLayoutUser from "@/layouts/DefaultLayoutUser.vue";

const route = useRoute();
const router = useRouter();
const detailData = ref(null);

const fetchDataDetail = async () => {
  const kode_barang = route.params.kode_barang;
  try {
    const response = await api.get(`/barang/${kode_barang}`, {
      headers: { Accept: "application/json" },
    });
    detailData.value = response.data;
  } catch (error) {
    console.error("Error fetching detail barang:", error);
  }
};

const goBack = () => {
  router.push({ name: "barang" });
};

onMounted(fetchDataDetail);
</script>

<template>
  <DefaultLayoutUser>
    <div class="p-6 bg-white dark:bg-boxdark rounded-lg shadow-md max-w-md mx-auto">
      <h2 class="text-2xl font-semibold text-black dark:text-white mb-4 text-center">Detail Barang</h2>
      
      <div v-if="detailData" class="space-y-4">
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Kode Barang:</span>
          <span class="text-black dark:text-white">{{ detailData.kode_barang }}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Barcode:</span>
          <span class="text-black dark:text-white">{{ detailData.barcode }}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Nama Barang:</span>
          <span class="text-black dark:text-white">{{ detailData.nama_barang }}</span>
        </div>
        <div class="text-center">
          <span class="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Gambar:</span>
          <img :src="detailData.gambar" alt="Gambar Barang" class="w-32 h-32 object-cover rounded-lg mx-auto" />
        </div>
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Harga Beli:</span>
          <span class="text-black dark:text-white">{{ detailData.harga_beli }}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Stok:</span>
          <span class="text-black dark:text-white">{{ detailData.stok }}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-300">Harga Jual:</span>
          <span class="text-black dark:text-white">{{ detailData.harga_jual }}</span>
        </div>
      </div>

      <!-- Tombol Kembali -->
      <div class="mt-6 text-center">
        <button @click="goBack" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali
        </button>
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
