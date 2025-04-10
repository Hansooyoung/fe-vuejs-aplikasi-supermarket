<script setup>
import { ref, onMounted, nextTick } from "vue";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import api from "@/api";
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, LineChart, CanvasRenderer]);

const isLoading = ref(true);
const xAxisData = ref([]);
const pendapatanOptions = ref({});
const keuntunganOptions = ref({});
const transaksiOptions = ref({});

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

    // Urutkan berdasarkan tanggal untuk memastikan data benar
    data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    const selectedDates = [];
    let currentDate = new Date(tanggalMulai);
    while (currentDate <= new Date(tanggalSelesai)) {
      selectedDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    xAxisData.value = selectedDates;

    // Pastikan data sesuai dengan xAxisData
    const finalData = xAxisData.value.map((date) => {
      const dayData = data.find((item) => item.tanggal === date);
      return {
        tanggal: date,
        jumlah_transaksi: dayData ? parseFloat(dayData.jumlah_transaksi) : 0,
        total_pendapatan: dayData ? parseFloat(dayData.total_pendapatan) : 0,
        total_keuntungan: dayData ? parseFloat(dayData.total_keuntungan) : 0
      };
    });

    // **🟢 Debugging: Lihat Data Sebelum Ditampilkan**
    console.log("Final Data:", finalData);

    // **Pastikan data naik turun sesuai API**
    pendapatanOptions.value = {
      title: { text: "Total Pendapatan" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: xAxisData.value,
        axisLabel: { interval: 0, rotate: 45 },
      },
      yAxis: { type: "value" },
      series: [{ 
        name: "Pendapatan", 
        type: "line", 
        data: finalData.map((item) => item.total_pendapatan) 
      }],
    };

    keuntunganOptions.value = {
      title: { text: "Total Keuntungan" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: xAxisData.value,
        axisLabel: { interval: 0, rotate: 45 },
      },
      yAxis: { type: "value" },
      series: [{ 
        name: "Keuntungan", 
        type: "line", 
        data: finalData.map((item) => item.total_keuntungan) 
      }],
    };

    transaksiOptions.value = {
      title: { text: "Jumlah Transaksi" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: xAxisData.value,
        axisLabel: { interval: 0, rotate: 45 },
      },
      yAxis: { type: "value" },
      series: [{ 
        name: "Transaksi", 
        type: "line", 
        data: finalData.map((item) => item.jumlah_transaksi) 
      }],
    };

    await nextTick();
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
  }
};


onMounted(() => {
  fetchData();
});
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="p-4">
      <div class="grid grid-cols-1 gap-6">
        <div v-if="isLoading" class="text-center text-gray-500">Loading data...</div>

        <template v-else>
          <div class="bg-white p-4 rounded-lg shadow-md min-h-[400px] w-full">
            <v-chart class="h-80 w-full" :option="pendapatanOptions" />
          </div>

          <div class="bg-white p-4 rounded-lg shadow-md min-h-[400px] w-full">
            <v-chart class="h-80 w-full" :option="keuntunganOptions" />
          </div>

          <div class="bg-white p-4 rounded-lg shadow-md min-h-[400px] w-full">
            <v-chart class="h-80 w-full" :option="transaksiOptions" />
          </div>
        </template>
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>
