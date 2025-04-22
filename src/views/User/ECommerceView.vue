<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const dashboardData = ref({
  total_transaksi: 0,
  total_penjualan_setelah_diskon: 0,
  total_keuntungan: 0,
  tanggal: ''
});

const loading = ref(true);
const error = ref(null);

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const response = await api.get('/dashboard/kasir');
    
    dashboardData.value = {
      ...response.data.data,
      tanggal: response.data.tanggal
    };
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal memuat data dashboard';
    console.error('Error fetching dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
  // Refresh data every 5 minutes
  const interval = setInterval(fetchDashboardData, 300000);
  return () => clearInterval(interval);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};
</script>

<template>
  <DefaultLayoutUser>
    <div class="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Kasir</h1>
          <p class="text-gray-500" v-if="!loading && !error">
            {{ formatDate(dashboardData.tanggal) }}
          </p>
        </div>
        <button 
          @click="fetchDashboardData" 
          class="btn btn-sm btn-outline"
          :class="{ 'loading': loading }"
          :disabled="loading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-64 rounded-lg bg-white shadow-sm">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4 text-gray-500">Memuat data dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">Gagal memuat data!</h3>
          <div class="text-xs">{{ error }}</div>
        </div>
        <button @click="fetchDashboardData" class="btn btn-sm btn-ghost">Coba Lagi</button>
      </div>

      <!-- Success State -->
      <div v-else class="space-y-4">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-4">
          <!-- Total Transaksi -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-blue-50 text-blue-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL TRANSAKSI</h2>
                  <p class="text-2xl md:text-3xl font-bold text-gray-800">
                    {{ dashboardData.total_transaksi }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Penjualan -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-green-50 text-green-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL PENJUALAN</h2>
                  <p class="text-2xl md:text-3xl font-bold text-gray-800">
                    {{ formatCurrency(dashboardData.total_penjualan_setelah_diskon) }}
                  </p>
                 
                </div>
              </div>
            </div>
          </div>

          <!-- Total Keuntungan -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-purple-50 text-purple-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL KEUNTUNGAN</h2>
                  <p class="text-2xl md:text-3xl font-bold text-gray-800">
                    {{ formatCurrency(dashboardData.total_keuntungan) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">Bersih hari ini</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="bg-white rounded-lg shadow-sm p-4 text-center">
          <p class="text-sm text-gray-500">
            Data diperbarui secara otomatis setiap 5 menit
          </p>
        </div>
      </div>
    </div>
  </DefaultLayoutUser>
</template>

<style scoped>
.card {
  @apply rounded-lg border border-gray-100 overflow-hidden;
}
</style>