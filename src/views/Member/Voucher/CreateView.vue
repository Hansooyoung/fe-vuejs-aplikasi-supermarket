<script setup>
import api from '@/api'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayoutMembers from '@/layouts/DefaultLayoutMembers.vue'

const router = useRouter()
const vouchers = ref([])
const memberPoints = ref(0)
const selectedVoucherId = ref(null)
const isLoading = ref(false)

// Fetch available vouchers and member points
const fetchData = async () => {
  try {
    isLoading.value = true
    
    // Get available vouchers
    const vouchersResponse = await api.get('/voucher')
    // Adjust for paginated response
    vouchers.value = vouchersResponse.data.data?.data || vouchersResponse.data.data || []

    // Get member points - adjust endpoint if needed
    const memberResponse = await api.get('/member')
    // Handle both direct data and paginated response
    const memberData = memberResponse.data.data?.data?.[0] || memberResponse.data.data?.[0] || memberResponse.data.data
    memberPoints.value = memberData?.total_point || 0
    
  } catch (error) {
    console.error('Error fetching data:', error)
    Swal.fire({
      title: 'Error!',
      text: 'Gagal mengambil data voucher',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  } finally {
    isLoading.value = false
  }
}

// Redeem voucher
const redeemVoucher = async () => {
  if (!selectedVoucherId.value) {
    Swal.fire({
      title: 'Peringatan!',
      text: 'Silakan pilih voucher terlebih dahulu',
      icon: 'warning',
      confirmButtonText: 'OK'
    })
    return
  }

  try {
    const response = await api.post('/history-voucher/redeem', {
      voucher_id: selectedVoucherId.value
    })

    await Swal.fire({
      title: 'Berhasil!',
      text: response.data.message || 'Voucher berhasil ditukarkan',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })

    // Refresh data after successful redemption
    await fetchData()
    selectedVoucherId.value = null
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat menukarkan voucher'
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || 'Poin tidak mencukupi'
      } else if (error.response.status === 404) {
        errorMessage = error.response.data.message || 'Member tidak ditemukan'
      } else if (error.response.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ')
      }
    }
    
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DefaultLayoutMembers>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tukar Voucher">
          <div class="p-6.5">
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">Poin Saya</h3>
              <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <span class="text-2xl font-bold">{{ memberPoints }} Poin</span>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">Pilih Voucher</h3>
              
              <div v-if="isLoading" class="text-center py-8">
                <p>Memuat voucher...</p>
              </div>
              
              <div v-else-if="vouchers.length === 0" class="text-center py-8 text-gray-500">
                Tidak ada voucher yang tersedia
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="voucher in vouchers"
                  :key="voucher.id"
                  @click="selectedVoucherId = voucher.id"
                  class="border rounded-lg p-4 cursor-pointer transition-all"
                  :class="{
                    'border-primary border-2': selectedVoucherId === voucher.id,
                    'border-gray-300 dark:border-gray-600': selectedVoucherId !== voucher.id,
                    'opacity-50': memberPoints < voucher.harga_point
                  }"
                  :title="memberPoints < voucher.harga_point ? 'Poin tidak mencukupi' : ''"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-lg">{{ voucher.nama_voucher }}</h4>
                      <p class="text-gray-600 dark:text-gray-400">{{ voucher.jenis_voucher }}</p>
                    </div>
                    <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                      {{ voucher.harga_point }} Poin
                    </span>
                  </div>
                  <div class="mt-3">
                    <p class="text-sm">
                      Nilai: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(voucher.nilai_voucher) }}
                    </p>
                    <p class="text-sm">
                      Min. Belanja: {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(voucher.min_pembelian) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="redeemVoucher"
              :disabled="!selectedVoucherId || isLoading"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Memproses...</span>
              <span v-else>Tukar Voucher</span>
            </button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayoutMembers>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>