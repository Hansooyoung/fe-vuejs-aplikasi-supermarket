<template>
  <div class="struk-container">
    <!-- Animasi Loading -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader"></div>
      <p>🚀 Sedang Membuat Struk...</p>
    </div>

    <!-- Container untuk preview struk -->
    <div class="preview-container" v-if="!isLoading">
      <div class="struk-preview">
        <h2 class="center">TOKO SUPERMARKET</h2>
        <p class="center">Jl. Contoh No. 123, Kota</p>
        <p class="center">--------------------------------</p>

        <p><strong>Tanggal:</strong> {{ formatDate(transaksi.tanggal_penjualan) }}</p>
        <p><strong>No. Transaksi:</strong> {{ transaksi.id }}</p>
        <p>--------------------------------</p>

        <table>
          <thead>
            <tr>
              <th>Barang</th>
              <th>Harga</th>
              <th>Qty</th>
              <th v-if="hasDiskon">Diskon</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transaksi.detail_penjualan" :key="item.id">
              <td>{{ item.barang.nama_barang }}</td>
              <td>{{ formatRupiah(item.harga_jual) }}</td>
              <td>{{ item.jumlah }}</td>
              <td v-if="hasDiskon">{{ formatRupiah(item.diskon) }}</td>
              <td>{{ formatRupiah(item.sub_total) }}</td>
            </tr>
          </tbody>
        </table>

        <p>--------------------------------</p>
        <p><strong>Total:</strong> {{ formatRupiah(transaksi.total_penjualan) }}</p>
        <p v-if="transaksi.member"><strong>Member:</strong> {{ transaksi.member.nama_member }}</p>
        <p v-if="transaksi.voucher"><strong>Voucher:</strong> {{ transaksi.voucher.nama_voucher }}</p>
        <p><strong>Tunai:</strong> {{ formatRupiah(tunai) }}</p>
        <p><strong>Kembalian:</strong> {{ formatRupiah(kembalian) }}</p>

        <p class="center">--------------------------------</p>
        <p class="center">TERIMA KASIH</p>
        <p class="center">--------------------------------</p>
      </div>

      <!-- Tombol aksi -->
      <div class="action-buttons">
        <button @click="printReceipt" class="print-button">
          <i class="fas fa-print"></i> Cetak Struk
        </button>
        <button @click="finishTransaction" class="finish-button">
          <i class="fas fa-check"></i> Selesai
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const transaksi = ref({ detail_penjualan: [], member: null, voucher: null })
const tunai = ref(parseFloat(route.query.tunai) || 0)
const kembalian = ref(parseFloat(route.query.kembalian) || 0)
const isLoading = ref(true)

// Format mata uang Rupiah
const formatRupiah = (angka) => {
  if (!angka) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}

// Format tanggal
const formatDate = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Cek apakah ada diskon
const hasDiskon = computed(() => {
  return transaksi.value.detail_penjualan.some(item => item.diskon > 0)
})

// Ambil data transaksi
const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await api.get(`/penjualan/struk/${route.params.id}`)
    transaksi.value = response.data
  } catch (error) {
    console.error('Gagal mengambil data transaksi:', error)
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Gagal mengambil data transaksi!',
      confirmButtonColor: '#d33'
    })
  } finally {
    isLoading.value = false
  }
}

// Cetak struk langsung via backend
const printReceipt = async () => {
  try {
    isLoading.value = true
    
    const response = await api.post(`/print/${route.params.id}`, {
      tunai: tunai.value,
      kembalian: kembalian.value
    })
    
    if (response.data.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Struk berhasil dikirim ke printer iWare',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    } else {
      throw new Error(response.data.message || 'Gagal mencetak struk')
    }
  } catch (error) {
    console.error('Gagal mencetak struk:', error)
    
    let errorMessage = 'Terjadi kesalahan saat mencetak struk'
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage
    } else if (error.message) {
      errorMessage = error.message
    }
    
    Swal.fire({
      title: 'Gagal Mencetak',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK'
    })
    
    // Fallback: Tampilkan preview dan opsi print browser
    window.print()
  } finally {
    isLoading.value = false
  }
}

// Selesaikan transaksi
const finishTransaction = () => {
  router.push({ name: 'penjualan' })
}

// Lifecycle hook
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Tetap gunakan style yang sama seperti sebelumnya */
.struk-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  z-index: 9999;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid white;
  border-top: 5px solid #ffcc00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.struk-preview {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.struk-preview h2 {
  text-align: center;
  font-size: 18px;
  margin-bottom: 5px;
}

.struk-preview .center {
  text-align: center;
}

.struk-preview table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}

.struk-preview th,
.struk-preview td {
  text-align: left;
  padding: 4px;
  border-bottom: 1px dashed #ddd;
  font-size: 13px;
}

.struk-preview th {
  font-weight: bold;
}

.struk-preview p {
  margin: 5px 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.print-button, .finish-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-button {
  background-color: #4CAF50;
  color: white;
}

.print-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.finish-button {
  background-color: #2196F3;
  color: white;
}

.finish-button:hover {
  background-color: #0b7dda;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media print {
  body * {
    visibility: hidden;
  }
  
  .struk-preview,
  .struk-preview * {
    visibility: visible;
  }
  
  .struk-preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: 100%;
    border: none;
    padding: 0;
    margin: 0;
    box-shadow: none;
  }
  
  .action-buttons {
    display: none;
  }
}
</style>