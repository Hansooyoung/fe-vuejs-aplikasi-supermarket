<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";
import DefaultLayoutOperator from "@/layouts/DefaultLayoutOperator.vue";

const route = useRoute();
const router = useRouter();
const detailData = ref(null);

// Format Rupiah function
const formatRupiah = (value) => {
  if (!value) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

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
  <DefaultLayoutOperator>
    <div class="p-6 bg-white dark:bg-boxdark rounded-lg shadow-md max-w-md mx-auto">
      <h2 class="text-2xl font-semibold text-black dark:text-white mb-6 text-center">
        Detail Barang
      </h2>
      
      <div v-if="detailData" class="space-y-4">
        <!-- Detail Card -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div class="grid grid-cols-1 gap-4">
            <!-- Image Section -->
            <div class="flex flex-col items-center">
              <span class="font-medium text-gray-700 dark:text-gray-300 mb-2">Gambar Barang</span>
              <img 
                :src="detailData.gambar" 
                alt="Gambar Barang" 
                class="w-40 h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-700 p-2" 
                onerror="this.src='https://via.placeholder.com/150?text=No+Image'"
              />
            </div>
            
            <!-- Details Section -->
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Kode Barang:</span>
                <span class="text-black dark:text-white font-semibold">{{ detailData.kode_barang || '-' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Barcode:</span>
                <span class="text-black dark:text-white">{{ detailData.barcode || '-' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Nama Barang:</span>
                <span class="text-black dark:text-white text-right">{{ detailData.nama_barang || '-' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Harga Beli:</span>
                <span class="text-black dark:text-white">{{ formatRupiah(detailData.harga_beli) }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Stok:</span>
                <span class="text-black dark:text-white">{{ detailData.stok || '0' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="font-medium text-gray-700 dark:text-gray-300">Harga Jual:</span>
                <span class="text-green-600 dark:text-green-400 font-semibold">{{ formatRupiah(detailData.harga_jual) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-6 flex justify-center">
        <button 
          @click="goBack" 
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i class="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
        </button>
      </div>
    </div>
  </DefaultLayoutOperator>
</template>

<style scoped>
/* Add smooth transitions for dark mode compatibility */
div, span, button {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Better image error handling */
img {
  background-color: #f3f4f6;
  object-fit: contain;
}

.dark img {
  background-color: #374151;
}
</style>