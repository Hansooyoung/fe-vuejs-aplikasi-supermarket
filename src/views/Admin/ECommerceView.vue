<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import { use } from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent, 
  GridComponent,
  DataZoomComponent,
  VisualMapComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import api from "@/api";
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';
import Swal from 'sweetalert2';

use([
  TitleComponent, 
  TooltipComponent, 
  LegendComponent, 
  GridComponent, 
  LineChart, 
  BarChart,
  CanvasRenderer,
  DataZoomComponent,
  VisualMapComponent
]);

const isLoading = ref(true);
const xAxisData = ref([]);
const chartOptions = ref({
  pendapatan: {},
  keuntungan: {},
  transaksi: {}
});
const refreshInterval = ref(null);

const fetchData = async () => {
  try {
    isLoading.value = true;

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const tanggalMulai = sevenDaysAgo.toISOString().split("T")[0];
    const tanggalSelesai = today;

    const response = await api.request({
      method: "GET",
      url: "/grafik-penjualan",
      params: { tanggal_mulai: tanggalMulai, tanggal_selesai: tanggalSelesai },
    });

    let data = response.data.data;
    data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    const selectedDates = [];
    let currentDate = new Date(tanggalMulai);
    while (currentDate <= new Date(tanggalSelesai)) {
      selectedDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    xAxisData.value = selectedDates;

    const finalData = xAxisData.value.map((date) => {
      const dayData = data.find((item) => item.tanggal === date);
      return {
        tanggal: date,
        jumlah_transaksi: dayData ? parseFloat(dayData.jumlah_transaksi) : 0,
        total_pendapatan: dayData ? parseFloat(dayData.total_pendapatan) : 0,
        total_keuntungan: dayData ? parseFloat(dayData.total_keuntungan) : 0
      };
    });

    // Format dates for display (e.g., "Mon 15")
    const formattedDates = xAxisData.value.map(date => {
      const d = new Date(date);
      return `${d.toLocaleString('id-ID', { weekday: 'short' })} ${d.getDate()}`;
    });

    // Common chart configuration
    const commonOptions = {
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const date = new Date(xAxisData.value[params[0].dataIndex]);
          const formattedDate = date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short' 
          });
          let result = `<strong>${formattedDate}</strong><br/>`;
          params.forEach(item => {
            result += `${item.marker} ${item.seriesName}: ${item.value.toLocaleString('id-ID')}`;
            if (item.seriesName.includes('Pendapatan') || item.seriesName.includes('Keuntungan')) {
              result += ` IDR`;
            }
            result += `<br/>`;
          });
          return result;
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "15%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: formattedDates,
        axisLabel: { 
          interval: 0, 
          rotate: 30,
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value) => {
            if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value/1000).toFixed(1)}K`;
            return value;
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          bottom: 10,
          height: 20
        }
      ]
    };

    // Generate chart options
    chartOptions.value.pendapatan = {
      ...commonOptions,
      title: { 
        text: "Total Pendapatan (7 Hari Terakhir)",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      color: ['#4f46e5'],
      series: [{ 
        name: "Pendapatan (IDR)", 
        type: "line", 
        data: finalData.map((item) => item.total_pendapatan),
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbolSize: 8,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(79, 70, 229, 0.3)'
            }, {
              offset: 1, color: 'rgba(79, 70, 229, 0)'
            }]
          }
        }
      }]
    };

    chartOptions.value.keuntungan = {
      ...commonOptions,
      title: { 
        text: "Total Keuntungan (7 Hari Terakhir)",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      color: ['#10b981'],
      series: [{ 
        name: "Keuntungan (IDR)", 
        type: "line", 
        data: finalData.map((item) => item.total_keuntungan),
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbolSize: 8,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(16, 185, 129, 0.3)'
            }, {
              offset: 1, color: 'rgba(16, 185, 129, 0)'
            }]
          }
        }
      }]
    };

    chartOptions.value.transaksi = {
      ...commonOptions,
      title: { 
        text: "Jumlah Transaksi (7 Hari Terakhir)",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      color: ['#f59e0b'],
      series: [{ 
        name: "Transaksi", 
        type: "bar", 
        data: finalData.map((item) => item.jumlah_transaksi),
        barWidth: '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }]
    };

    await nextTick();
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      title: 'Error!',
      text: 'Gagal memuat data grafik',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    isLoading.value = false;
  }
};

const handleRefresh = async () => {
  await fetchData();
  Swal.fire({
    title: 'Berhasil!',
    text: 'Data dashboard telah diperbarui',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });
};

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
};

onMounted(() => {
  fetchData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="p-4 md:p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Analisis Penjualan</h1>
        <button 
          @click="handleRefresh"
          class="btn btn-sm btn-outline flex items-center"
          :disabled="isLoading"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            :class="{ 'animate-spin': isLoading }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
      
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div class="text-gray-500">Memuat data...</div>
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[400px] w-full">
            <v-chart 
              class="h-80 w-full" 
              :option="chartOptions.pendapatan" 
              autoresize 
            />
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[400px] w-full">
            <v-chart 
              class="h-80 w-full" 
              :option="chartOptions.keuntungan" 
              autoresize 
            />
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[400px] w-full">
          <v-chart 
            class="h-80 w-full" 
            :option="chartOptions.transaksi" 
            autoresize 
          />
        </div>

        <div class="mt-4 text-sm text-gray-500 text-center">
          Data akan diperbarui otomatis setiap 5 menit
        </div>
      </template>
    </div>
  </DefaultLayoutAdmin>
</template>

<style scoped>
.btn-outline {
  @apply border-gray-300 hover:border-primary hover:text-primary;
}
</style>