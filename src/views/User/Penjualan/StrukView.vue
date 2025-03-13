<template>
    <div>
      <!-- Animasi Loading -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>🚀 Sedang Membuat Struk...</p>
      </div>
  
      <!-- Struk -->
      <div class="struk" ref="struk" v-if="!isLoading && showStruk">
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
              <td>{{ item.nama_barang }}</td>
              <td>{{ formatRupiah(item.harga_jual) }}</td>
              <td>{{ item.jumlah }}</td>
              <td v-if="hasDiskon">{{ formatRupiah(item.diskon) }}</td>
              <td>{{ formatRupiah(item.sub_total) }}</td>
            </tr>
          </tbody>
        </table>
  
        <p>--------------------------------</p>
        <p><strong>Total:</strong> {{ formatRupiah(transaksi.total_penjualan) }}</p>
        <p v-if="transaksi.nama_member"><strong>Member:</strong> {{ transaksi.nama_member }}</p>
        <p v-if="transaksi.nama_voucher"><strong>Voucher:</strong> {{ transaksi.nama_voucher }}</p>
        <p><strong>Tunai:</strong> {{ formatRupiah(tunai) }}</p>
        <p><strong>Kembalian:</strong> {{ formatRupiah(kembalian) }}</p>
  
        <p class="center">--------------------------------</p>
        <p class="center">TERIMA KASIH</p>
        <p class="center">--------------------------------</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Swal from 'sweetalert2'
  import api from '@/api'
  
  const route = useRoute()
  const router = useRouter()
  const transaksi = ref({ detail_penjualan: [] })
  const tunai = ref(route.query.tunai || 0)
  const kembalian = ref(route.query.kembalian || 0)
  const isLoading = ref(true)
  // Flag untuk mengontrol tampilan struk
  const showStruk = ref(true)
  
  // Flag untuk mencoba mendeteksi jika pengguna membatalkan print
  let printCanceled = false
  
  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka)
  
  const formatDate = (tanggal) =>
    new Date(tanggal).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  
  const hasDiskon = computed(() =>
    transaksi.value.detail_penjualan.some((item) => item.diskon > 0)
  )
  
  const fetchData = async () => {
    try {
      isLoading.value = true
      const response = await api.get(`/penjualan/struk/${route.params.id}`)
      transaksi.value = response.data
      await nextTick()
    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error)
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Gagal mengambil data transaksi!',
        confirmButtonColor: '#d33'
      })
    }
  }
  
  // Fungsi handler untuk mendeteksi jika window kembali fokus setelah print (diasumsikan batal)
  const onFocusAfterPrint = () => {
    printCanceled = true
    window.removeEventListener('focus', onFocusAfterPrint)
  }
  
  onMounted(async () => {
    await fetchData()
    setTimeout(async () => {
      isLoading.value = false
      if (transaksi.value.id) {
        await nextTick()
        // Reset flag sebelum print
        printCanceled = false
        // Tambahkan listener focus untuk mendeteksi jika pengguna membatalkan print
        window.addEventListener('focus', onFocusAfterPrint)
        window.print()
      }
    }, 2000)
  
    window.addEventListener('afterprint', handleAfterPrint)
  })
  
  // Fungsi ini dipanggil setelah print dialog ditutup (baik print atau cancel)
  const handleAfterPrint = () => {
    // Sembunyikan tampilan struk
    showStruk.value = false
    // Delay sejenak agar flag printCanceled ter-update (trik hack, tidak 100% akurat)
    setTimeout(() => {
      if (printCanceled) {
        Swal.fire({
          title: 'Gagal Mencetak Print!',
          text: 'Anda telah membatalkan pencetakan. Anda akan diarahkan ke halaman penjualan.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc3545',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          router.push({ name: 'penjualan' })
        })
      } else {
        Swal.fire({
          title: 'Selesai',
          text: 'Anda akan diarahkan ke halaman penjualan.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#28a745',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          router.push({ name: 'penjualan' })
        })
      }
    }, 100)
  }
  
  onBeforeUnmount(() => {
    window.removeEventListener('afterprint', handleAfterPrint)
    window.removeEventListener('focus', onFocusAfterPrint)
  })
  </script>
  
  <style>
  /* Animasi Loading */
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  /* Tampilan Struk */
  .struk {
    display: block;
    font-family: monospace;
    font-size: 14px;
    max-width: 300px; /* Lebar tetap seperti kertas thermal */
    width: 100%;
    height: auto; /* Tinggi menyesuaikan jumlah data */
    margin: 0 auto;
    padding: 10px;
    border: 1px solid #000;
    background: white;
  }
  
  /* Header */
  .struk h2 {
    text-align: center;
    font-size: 16px;
    margin-bottom: 5px;
  }
  
  .struk .center {
    text-align: center;
  }
  
  /* Tabel Barang */
  .struk table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
  }
  
  .struk th,
  .struk td {
    text-align: left;
    padding: 4px;
    border-bottom: 1px dashed #000;
    font-size: 13px;
  }
  
  .struk th {
    font-weight: bold;
  }
  
  /* Garis Pembatas */
  .struk p {
    margin: 2px 0;
  }
  
  /* Mode Print */
  @media print {
    body {
      visibility: hidden;
    }
  
    .struk,
    .struk * {
      visibility: visible;
    }
  
    .struk {
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      max-width: 300px; /* Lebar tetap */
      width: 100%;
      height: auto; /* Panjang menyesuaikan isi */
      page-break-inside: avoid; /* Mencegah pemotongan halaman */
      padding: 10px;
      border: none;
    }
  
    h2,
    .center {
      text-align: center;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
    }
  
    th,
    td {
      text-align: left;
      padding: 4px;
      border-bottom: 1px dashed #000;
    }
  
    th {
      font-weight: bold;
    }
  
    p {
      margin: 2px 0;
    }
  }
  </style>
  