<script setup lang="js">
import { ref } from 'vue';
import api from '@/api';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';
import ChartOne from '@/components/Charts/ChartOne.vue';
import ChartTwo from '@/components/Charts/ChartTwo.vue';
import ChartThree from '@/components/Charts/ChartThree.vue';
import MapOne from '@/components/Maps/MapOne.vue';
import TableOne from '@/components/Tables/TableOne.vue';
import ChatCard from '@/components/ChatCard.vue';
import VueApexCharts from 'vue3-apexcharts'
// State untuk menyimpan data
const totalPeminjaman = ref(0);
const totalPengembalian = ref(0);
const totalSiswa = ref(0);
const totalBarang = ref(0);
const totalTersedia = ref(0);
const showTersedia = ref(false);

const fetchDataDashboard = async () => {
  try {
    // Fetch data untuk total peminjaman, pengembalian, dan siswa
    const peminjamanResponse = await api.request({ method: 'GET', url: '/peminjaman' });
    totalPeminjaman.value = peminjamanResponse.data.total_data.total_peminjaman;
    totalPengembalian.value = peminjamanResponse.data.total_data.total_pengembalian;

    const siswaResponse = await api.request({ method: 'GET', url: '/siswa' });
    totalSiswa.value = siswaResponse.data.total_siswa;

    // Fetch data total barang dan barang tersedia
    const barangResponse = await api.request({ method: 'GET'  , url: '/barang-inventaris' });
    totalBarang.value = barangResponse.data.total.total_semua_barang;
    totalTersedia.value = barangResponse.data.total.total_tersedia;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

fetchDataDashboard();

const toggleShowTersedia = () => {
  showTersedia.value = !showTersedia.value;
};



const chartData = {
  series: [
    {
      name: 'Product One',
      data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45]
    },

    {
      name: 'Product Two',
      data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51]
    }
  ],
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
}

const chart = ref(null)

const apexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left'
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1
    },

    toolbar: {
      show: false
    }
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300
        }
      }
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350
        }
      }
    }
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight'
  },

  labels: {
    show: false,
    position: 'top'
  },
  grid: {
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5
    }
  },
  xaxis: {
    type: 'category',
    categories: chartData.labels,
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px'
      }
    },
    min: 0,
    max: 100
  }
}
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <!-- Card Total Peminjaman -->
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          📦
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ totalPeminjaman }}</h4>
            <span class="text-sm font-medium">Total Peminjaman</span>
          </div>
        </div>
      </div>

      <!-- Card Total Pengembalian -->
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          🔄
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ totalPengembalian }}</h4>
            <span class="text-sm font-medium">Total Pengembalian</span>
          </div>
        </div>
      </div>

      <!-- Card Total Siswa -->
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          🎓
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ totalSiswa }}</h4>
            <span class="text-sm font-medium">Total Siswa</span>
          </div>
        </div>
      </div>

      <!-- Card Total Barang -->
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          🏷️
        </div>
        <div class="mt-4 flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">
              {{ showTersedia ? totalTersedia : totalBarang }}
            </h4>
            <span class="text-sm font-medium">{{ showTersedia ? 'Total Tersedia' : 'Total Barang' }}</span>
          </div>
        </div>
        <button 
          class="mt-4 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-700"
          @click="toggleShowTersedia"
        >
          {{ showTersedia ? 'Show Total Barang' : 'Show Total Tersedia' }}
        </button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-12 gap-4 md:mt-6">
      <div
    class="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8"
  >
    <div class="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
      <div class="flex w-full flex-wrap gap-3 sm:gap-5">
        <div class="flex min-w-47.5">
          <span
            class="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary"
          >
            <span class="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
          </span>
          <div class="w-full">
            <p class="font-semibold text-primary">Total Peminjaman</p>
            <p class="text-sm font-medium">12.04.2022 - 12.05.2022</p>
          </div>
        </div>
        <div class="flex min-w-47.5">
          <span
            class="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary"
          >
            <span class="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
          </span>
          <div class="w-full">
            <p class="font-semibold text-secondary">Total Pengembalian</p>
            <p class="text-sm font-medium">12.04.2022 - 12.05.2022</p>
          </div>
        </div>
      </div>
      <div class="flex w-full max-w-45 justify-end">
        <div class="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <button
            class="rounded bg-white py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark"
          >
            Day
          </button>
          <button
            class="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
          >
            Week
          </button>
          <button
            class="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
          >
            Month
          </button>
        </div>
      </div>
    </div>
    <div>
      <div id="chartOne" class="-ml-5">
        <VueApexCharts
          type="area"
          height="350"
          :options="apexOptions"
          :series="chartData.series"
          ref="chart"
        />
      </div>
    </div>
  </div>
      <ChartTwo />
      <ChartThree />
      <MapOne />
      <div class="col-span-12 xl:col-span-8">
        <TableOne />
      </div>
      <ChatCard />
    </div>
  </DefaultLayoutUser>
</template>
