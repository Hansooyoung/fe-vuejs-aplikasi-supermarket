<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'vue-chartjs'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const dashboardData = ref({
  sales: {},
  purchases: {},
  inventory: {},
  members: {},
  vouchers: {},
  users: {},
  recent_transactions: {},
  timestamp: ''
})

const loading = ref(true)
const error = ref(null)

const fetchDashboardData = async () => {
  try {
    loading.value = true
    const response = await api.get('/dashboard/super')
    dashboardData.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
    console.error('Error fetching dashboard data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  // Refresh data every 5 minutes
  const interval = setInterval(fetchDashboardData, 300000)
  return () => clearInterval(interval)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}

// Chart data and options
const salesChartData = {
  labels: ['Hari Ini', 'Bulan Ini'],
  datasets: [
    {
      label: 'Pendapatan',
      backgroundColor: '#4f46e5',
      data: [0, 0],
      borderRadius: 6
    },
    {
      label: 'Keuntungan',
      backgroundColor: '#10b981',
      data: [0, 0],
      borderRadius: 6
    }
  ]
}

const salesChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += formatCurrency(context.raw)
          return label
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return formatCurrency(value).replace('Rp', '')
        }
      }
    }
  }
}

const inventoryChartData = {
  labels: ['Total Barang', 'Stok Rendah', 'Stok Habis'],
  datasets: [
    {
      backgroundColor: ['#4f46e5', '#f59e0b', '#ef4444'],
      data: [0, 0, 0]
    }
  ]
}

const inventoryChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.label + ': ' + context.raw
        }
      }
    }
  }
}

const updateChartData = () => {
  salesChartData.datasets[0].data = [
    dashboardData.value.sales.today.revenue,
    dashboardData.value.sales.month.revenue
  ]
  salesChartData.datasets[1].data = [
    dashboardData.value.sales.today.profit,
    dashboardData.value.sales.month.profit
  ]
  
  inventoryChartData.datasets[0].data = [
    dashboardData.value.inventory.total_items,
    dashboardData.value.inventory.low_stock,
    dashboardData.value.inventory.out_of_stock
  ]
}

watch(dashboardData, () => {
  updateChartData()
})
</script>

<template>
  <DefaultLayoutSuper>
    <div class="p-4 md:p-6 min-h-screen bg-gray-50">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Super Admin</h1>
          <p class="text-gray-500" v-if="!loading && !error">
            Data terakhir diperbarui: {{ formatDate(dashboardData.timestamp) }}
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
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Penjualan -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-blue-50 text-blue-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL PENJUALAN</h2>
                  <p class="text-2xl font-bold text-gray-800">
                    {{ dashboardData.sales.month.count }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatCurrency(dashboardData.sales.month.revenue) }} (Bulan Ini)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Pembelian -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-green-50 text-green-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL PEMBELIAN</h2>
                  <p class="text-2xl font-bold text-gray-800">
                    {{ dashboardData.purchases.month.count }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatCurrency(dashboardData.purchases.month.total) }} (Bulan Ini)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Member -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-purple-50 text-purple-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">TOTAL MEMBER</h2>
                  <p class="text-2xl font-bold text-gray-800">
                    {{ dashboardData.members.total_members }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ dashboardData.members.active_today }} aktif hari ini
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory Status -->
          <div class="card bg-white shadow-sm hover:shadow-md transition-shadow">
            <div class="card-body p-4 md:p-6">
              <div class="flex items-center">
                <div class="rounded-full p-3 bg-yellow-50 text-yellow-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-medium text-gray-500">STATUS INVENTORY</h2>
                  <p class="text-2xl font-bold text-gray-800">
                    {{ dashboardData.inventory.total_items }} Barang
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ dashboardData.inventory.low_stock }} stok rendah, {{ dashboardData.inventory.out_of_stock }} stok habis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Sales Chart -->
          <div class="card bg-white shadow-sm p-4">
            <h2 class="text-lg font-semibold mb-4">Penjualan & Keuntungan</h2>
            <div class="h-64">
              <Bar 
                :data="salesChartData" 
                :options="salesChartOptions"
              />
            </div>
          </div>

          <!-- Inventory Chart -->
          <div class="card bg-white shadow-sm p-4">
            <h2 class="text-lg font-semibold mb-4">Status Inventory</h2>
            <div class="h-64">
              <Pie 
                :data="inventoryChartData" 
                :options="inventoryChartOptions"
              />
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Sales -->
          <div class="card bg-white shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-lg font-semibold mb-4">Transaksi Penjualan Terakhir</h2>
              <div class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Member</th>
                      <th>Kasir</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sale in dashboardData.recent_transactions.sales" :key="sale.id">
                      <td>{{ formatShortDate(sale.date) }}</td>
                      <td>{{ sale.member }}</td>
                      <td>{{ sale.cashier }}</td>
                      <td class="text-right">{{ formatCurrency(sale.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Recent Purchases -->
          <div class="card bg-white shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-lg font-semibold mb-4">Transaksi Pembelian Terakhir</h2>
              <div class="overflow-x-auto">
                <table class="table table-zebra">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Vendor</th>
                      <th>Operator</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="purchase in dashboardData.recent_transactions.purchases" :key="purchase.id">
                      <td>{{ formatShortDate(purchase.date) }}</td>
                      <td>{{ purchase.vendor }}</td>
                      <td>{{ purchase.operator }}</td>
                      <td class="text-right">{{ formatCurrency(purchase.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Voucher Stats -->
          <div class="card bg-white shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-lg font-semibold mb-4">Statistik Voucher</h2>
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-500">Total Voucher</p>
                  <p class="text-2xl font-bold">{{ dashboardData.vouchers.total_vouchers }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Diterbitkan</p>
                  <p class="text-2xl font-bold">{{ dashboardData.vouchers.issued_vouchers }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Digunakan</p>
                  <p class="text-2xl font-bold">{{ dashboardData.vouchers.used_vouchers }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- User Stats -->
          <div class="card bg-white shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-lg font-semibold mb-4">Statistik Pengguna</h2>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-500">Total Pengguna</p>
                  <p class="text-2xl font-bold">{{ dashboardData.users.total_users }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Aktif Hari Ini</p>
                  <p class="text-2xl font-bold">{{ dashboardData.users.active_today }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayoutSuper>
</template>

<style scoped>
.card {
  @apply rounded-lg border border-gray-100 overflow-hidden;
}
</style>