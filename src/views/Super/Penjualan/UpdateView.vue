<script setup>
import api from '@/api'
import { ref, onMounted, computed, watch } from 'vue'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router' // Tambahkan ini
const route = useRoute() // Tambahkan ini
const router = useRouter()
const isSubmitting = ref(false)

const formData = ref({
  member_id: '',
  voucher_id: '',
  barang: [],

  tunai: 0
})

const memberList = ref([])
const barangList = ref([])
const voucherList = ref([])
const selectedBarang = ref([])
const selectedMember = ref(null)
const currentMemberId = ref(null) // Ganti originalMemberId dengan currentMemberId

const errors = ref([])
const searchQuery = ref('')
const showBarangSelect = ref(false)
const showMemberSelect = ref(false)

const currentPage = ref(1)
const totalPages = ref(1)

// Fetch data penjualan
const fetchPenjualanData = async () => {
  try {
    const response = await api.get(`/penjualan/${route.params.id}`)
    const penjualan = response.data

    // Set form data
    formData.value = {
      member_id: penjualan.member_id,
      voucher_id: penjualan.voucher_id,
      tunai: penjualan.tunai
    }

    currentMemberId.value = penjualan.member_id // Simpan member_id saat ini

    // Set selected barang
    selectedBarang.value = penjualan.detail_penjualan.map(item => ({
      id: item.id,
      barcode: item.barcode,
      nama_barang: item.nama_barang,
      harga_jual: item.harga_jual,
      harga_beli: item.harga_beli,
      jumlah: item.jumlah,
      sub_total: item.sub_total,
      keuntungan: item.keuntungan
    }))

    // Jika ada member, fetch data member LENGKAP
    if (penjualan.member_id) {
      try {
        const memberResponse = await api.get(`/member/${penjualan.member_id}`)
        selectedMember.value = {
          id: memberResponse.data.id,
          nama_member: memberResponse.data.nama_member,
          no_hp: memberResponse.data.no_hp,
          total_point: memberResponse.data.total_point
        }
        memberList.value = [selectedMember.value] // Tambahkan ke memberList agar bisa ditampilkan
      } catch (error) {
        console.error('Gagal mengambil data member', error)
        // Fallback jika gagal fetch detail member
        selectedMember.value = {
          id: penjualan.member_id,
          nama_member: 'Member Tidak Ditemukan',
          no_hp: '',
          total_point: 0
        }
      }
      fetchVoucherData()
    }

  } catch (error) {
    console.error('Gagal mengambil data penjualan', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal mengambil data penjualan'
    }).then(() => {
      router.push({ name: 'penjualan-super' })
    })
  }
}

const fetchMemberData = async () => {
  // Reset error dan member list
  errors.value = []
  memberList.value = []
  
  // Jika input kosong, tidak perlu mencari
  if (!searchQuery.value.trim()) {
    return
  }

  // Validasi minimal 10 karakter jika input adalah angka
  if (/^\d+$/.test(searchQuery.value) && searchQuery.value.length < 10) {
    errors.value = ['Nomor HP minimal 10 digit']
    return
  }

  try {
    const params = {
      search: searchQuery.value,
      exact_match: /^\d+$/.test(searchQuery.value) // Jika searchQuery hanya angka, gunakan exact match
    }

    const response = await api.request({
      method: 'GET',
      url: '/member',
      params: params
    })

    memberList.value = response.data.data.data

    if (memberList.value.length === 0) {
      errors.value = ['Member tidak ditemukan']
    } else if (memberList.value.length === 1) {
      formData.value.member_id = memberList.value[0].id
      selectedMember.value = memberList.value[0]
      errors.value = []
      fetchVoucherData()
    }
  } catch (error) {
    errors.value = ['Gagal mengambil data member']
  }
}

// Fetch Barang Data
const fetchBarangData = async (page = 1) => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/barang?page=${page}`,
      params: { search: searchQuery.value }
    })
    barangList.value = response.data.data
    totalPages.value = response.data.pagination.last_page
    currentPage.value = page
  } catch (error) {
    console.error('Gagal mengambil data barang', error)
  }
}

// Fetch Voucher Data
const fetchVoucherData = async () => {
  if (!formData.value.member_id) {
    voucherList.value = []
    return
  }

  try {
    const response = await api.get('/historyvoucher', {
      params: { member_id: formData.value.member_id }
    })

    voucherList.value = response.data.data
      .filter(history => history.tanggal_digunakan === null)
      .map(history => history.voucher)

  } catch (error) {
    console.error('Gagal mengambil data voucher', error)
    voucherList.value = []
  }
}

// Computed Properties
const totalHarga = computed(() => {
  // Hitung subtotal
  let subtotal = selectedBarang.value.reduce((sum, barang) => {
    let hargaSatuan = barang.harga_jual_diskon && barang.harga_jual_diskon > 0
      ? barang.harga_jual_diskon
      : barang.harga_jual
    
    return sum + hargaSatuan * barang.jumlah
  }, 0)

  // Inisialisasi diskon
  let diskon = 0

  // Hitung diskon jika ada voucher yang dipilih
  if (formData.value.voucher_id) {
    const voucher = voucherList.value.find(v => v.id === formData.value.voucher_id)
    
    if (voucher) {
      // Cek minimal pembelian terhadap subtotal (sebelum diskon)
      if (subtotal >= voucher.min_pembelian) {
        if (voucher.jenis_voucher === 'persen') {
          diskon = (voucher.nilai_voucher / 100) * subtotal
        } else {
          // Untuk nominal, diskon maksimal sebesar subtotal
          diskon = Math.min(voucher.nilai_voucher, subtotal)
        }
      }
    }
  }

  return subtotal - diskon
})

const kembalian = computed(() => formData.value.tunai - totalHarga.value)

const filteredBarang = computed(() => {
  return barangList.value.filter(
    (barang) =>
      barang.barcode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      barang.nama_barang.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const isSelected = (barang) => {
  return selectedBarang.value.some((b) => b.barcode === barang.barcode)
}

// Methods
const addBarang = (barang) => {
  // Check if stock is available
  if (barang.stok < 1) {
    Swal.fire({
      icon: 'error',
      title: 'Stok Habis',
      text: `Stok ${barang.nama_barang} tidak tersedia`,
    });
    return;
  }

  if (!selectedBarang.value.some((b) => b.barcode === barang.barcode)) {
    selectedBarang.value.push({
      barcode: barang.barcode,
      nama_barang: barang.nama_barang,
      harga_jual: barang.harga_jual_diskon && barang.harga_jual_diskon > 0
        ? barang.harga_jual_diskon 
        : barang.harga_jual,
      jumlah: 1,
      stok: barang.stok // Include stock info
    });
  }
  showBarangSelect.value = false;
  searchQuery.value = '';
}

const selectMember = (member) => {
  formData.value.member_id = member.id
  selectedMember.value = member
  showMemberSelect.value = false
  searchQuery.value = ''
  fetchVoucherData()
  
  // Tambahkan member yang dipilih ke memberList jika belum ada
  if (!memberList.value.some(m => m.id === member.id)) {
    memberList.value.push(member)
  }
}

const removeBarang = (index) => {
  selectedBarang.value.splice(index, 1)
}

const handleEnterSearch = () => {
  fetchBarangData()
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  if (selectedBarang.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Tambahkan minimal 1 barang untuk transaksi'
    })
    return
  }

  const confirmResult = await Swal.fire({
    title: 'Konfirmasi Update Transaksi',
    html: 'Yakin ingin mengupdate transaksi ini?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Update',
    cancelButtonText: 'Batal'
  })

  if (!confirmResult.isConfirmed) return

  isSubmitting.value = true

  try {
    // Format data untuk dikirim ke API
    const requestData = {
      member_id: formData.value.member_id,
      voucher_id: formData.value.voucher_id,
      tunai: formData.value.tunai,
      barang: selectedBarang.value.map(item => ({
        barcode: item.barcode,
        jumlah: item.jumlah
      })),
      current_member_id: currentMemberId.value // Kirim member_id saat ini
    }

    await api.put(`/penjualan/${route.params.id}`, requestData)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Transaksi berhasil diupdate'
    })
    router.push({ name: 'penjualan' })

  } catch (error) {
    console.error('Gagal update transaksi', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengupdate transaksi'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => formData.value.member_id, fetchVoucherData)

// Lifecycle Hooks
onMounted(() => {
  fetchPenjualanData()
  fetchBarangData() // Tetap perlu fetch daftar barang
})
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Section -->
      <div class="space-y-4">
        <!-- Member Card -->
        <DefaultCard cardTitle="Member">
  <div class="p-4">
    <button
      type="button"
      class="w-full p-3 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center"
      @click="showMemberSelect = true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
      {{ selectedMember ? selectedMember.nama_member : 'Pilih Member' }}
    </button>
    
    <div v-if="selectedMember && selectedMember.id" class="mt-3 bg-white p-3 rounded-lg shadow-sm space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500">Nama:</span>
        <span class="font-medium">{{ selectedMember.nama_member }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">No. HP:</span>
        <span class="font-medium">{{ selectedMember.no_hp || '-' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Poin:</span>
        <span class="font-medium">{{ selectedMember.total_point || 0 }}</span>
      </div>
    </div>
  </div>
</DefaultCard>


<!-- Voucher Card -->
<DefaultCard cardTitle="Voucher" v-if="formData.member_id">
  <div class="p-4">
    <div v-if="voucherList.length > 0">
      <select
        v-model="formData.voucher_id"
        class="w-full p-3 border rounded-lg bg-white"
      >
        <option value="">Tidak menggunakan voucher</option>
        <option 
          v-for="voucher in voucherList" 
          :key="voucher.id" 
          :value="voucher.id"
          :disabled="!voucher || selectedBarang.reduce((sum, b) => sum + (b.harga_jual * b.jumlah), 0) < (voucher?.min_pembelian || 0)"
        >
          {{ voucher?.nama_voucher || '' }} 
          <span v-if="voucher?.min_pembelian">
            (Min. pembelian Rp{{ voucher.min_pembelian.toLocaleString('id-ID') }})
          </span>
        </option>
      </select>
      
      <!-- Warning message if selected voucher doesn't meet min_pembelian -->
      <div 
        v-if="formData.voucher_id && selectedBarang.reduce((sum, b) => sum + (b.harga_jual * b.jumlah), 0) < (voucherList.find(v => v.id === formData.voucher_id)?.min_pembelian || 0)"
        class="mt-2 text-red-600 text-sm"
      >
        Voucher tidak dapat digunakan karena minimal pembelian belum terpenuhi
      </div>
    </div>
    
    <!-- Condition when member has no vouchers -->
    <div v-else class="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      Member ini tidak memiliki voucher yang tersedia
    </div>
  </div>
</DefaultCard>

        <!-- Barang Card -->
        <DefaultCard cardTitle="Daftar Barang">
          <div class="p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-medium text-lg">Barang yang dibeli</h3>
              <button
                type="button"
                class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                @click="showBarangSelect = true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Tambah
              </button>
            </div>

          <!-- Selected Items List -->
          <div v-if="selectedBarang.length > 0" class="space-y-2">
            <div v-for="(barang, index) in selectedBarang" :key="barang.barcode" 
                class="bg-white p-3 rounded-lg shadow-sm">
              <!-- Stock warning message - placed above item name -->
              <div v-if="barang.jumlah > barang.stok" class="mb-2 bg-red-50 text-red-600 p-2 rounded text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Stok tidak mencukupi (tersedia: {{ barang.stok }})
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex-1">
                  <div class="font-medium">{{ barang.nama_barang }}</div>
                  <div class="text-sm text-gray-500">{{ barang.barcode }}</div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="flex items-center">
                    <button 
                      @click="barang.jumlah > 1 ? barang.jumlah-- : removeBarang(index)"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300"
                      :class="{ 'text-red-500': barang.jumlah === 1 }"
                    >
                      -
                    </button>
                    <input
                      v-model.number="barang.jumlah"
                      type="number"
                      class="w-12 h-8 text-center border-t border-b"
                      min="1"
                      :max="barang.stok"
                      @change="validateStock(barang)"
                      :class="{'border-red-500': barang.jumlah > barang.stok}"
                    />
                    <button 
                      @click="barang.jumlah < barang.stok ? barang.jumlah++ : null"
                      class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300"
                      :class="{'cursor-not-allowed opacity-50': barang.jumlah >= barang.stok}"
                    >
                      +
                    </button>
                  </div>
                  
                  <div class="w-24 text-right font-medium">
                    Rp{{ (barang.harga_jual * barang.jumlah).toLocaleString('id-ID') }}
                  </div>
                  
                  <button 
                    @click="removeBarang(index)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
            
            <div v-else class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-center">
              Belum ada barang yang dipilih
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Right Section -->
<!-- Right Section - Pembayaran -->
<div>
  <!-- Card Total Pembelian -->
  <DefaultCard cardTitle="Total Pembelian" class="mb-4">
    <div class="p-4 space-y-2">
<div class="flex justify-between">
  <span class="text-gray-600">Subtotal:</span>
  <span>Rp{{ selectedBarang.reduce((sum, b) => sum + (b.harga_jual * b.jumlah), 0).toLocaleString('id-ID') }}</span>
</div>

<div v-if="formData.voucher_id" class="flex justify-between text-green-600">
  <span>Potongan Voucher:</span>
  <span>
    -Rp{{ 
      (() => {
        const voucher = voucherList.find(v => v.id === formData.voucher_id);
        if (!voucher) return 0;
        
        const subtotal = selectedBarang.reduce((sum, b) => sum + (b.harga_jual * b.jumlah), 0);
        if (subtotal < (voucher?.min_pembelian || 0)) return 0;
        
        if (voucher.jenis_voucher === 'persen') {
          return ((voucher.nilai_voucher / 100) * subtotal).toLocaleString('id-ID');
        } else {
          return Math.min(voucher.nilai_voucher, subtotal).toLocaleString('id-ID');
        }
      })()
    }}
    <span 
      v-if="selectedBarang.reduce((sum, b) => sum + (b.harga_jual * b.jumlah), 0) < (voucherList.find(v => v.id === formData.voucher_id)?.min_pembelian || 0)" 
      class="text-red-500 text-xs"
    >
      (Min. pembelian tidak terpenuhi)
    </span>
  </span>
</div>
      
      <div class="flex justify-between border-t pt-2">
        <span class="font-bold">Total:</span>
        <span class="font-bold text-lg">Rp{{ totalHarga.toLocaleString('id-ID') }}</span>
      </div>
    </div>
  </DefaultCard>

  <!-- Card Pembayaran Tunai -->
  <DefaultCard cardTitle="Pembayaran Tunai" class="mb-4">
    <div class="p-4">
      <label class="block mb-2 font-medium">Jumlah Tunai</label>
      <input
        v-model.number="formData.tunai"
        type="number"
        class="w-full p-3 border rounded-lg"
        placeholder="Masukkan jumlah uang tunai"
        min="0"
        @focus="$event.target.select()"
      />
    </div>
  </DefaultCard>

  <!-- Card Informasi Kembalian -->
  <DefaultCard cardTitle="Informasi Pembayaran">
    <div class="p-4">
      <div v-if="formData.tunai > 0" class="text-center py-3">
        <p v-if="formData.tunai >= totalHarga" class="text-xl font-bold text-green-600">
          Kembalian: Rp{{ (formData.tunai - totalHarga).toLocaleString('id-ID') }}
        </p>
        <p v-else class="text-xl font-bold text-red-600">
          Uang Kurang: Rp{{ (totalHarga - formData.tunai).toLocaleString('id-ID') }}
        </p>
      </div>
      <div v-else class="text-center py-3 text-gray-500">
        Masukkan jumlah uang tunai
      </div>
      
      <button
        type="submit"
        @click="handleSubmit"
        class="w-full p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4"
        :disabled="isSubmitting || selectedBarang.length === 0"
      >
        <span v-if="isSubmitting">
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memproses...
        </span>
        <span v-else>
         TRANSAKSI
        </span>
      </button>
    </div>
  </DefaultCard>
</div>
    </div>

<!-- Member Selection Modal -->
<div v-if="showMemberSelect" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white w-full max-w-md mx-4 p-6 rounded-lg shadow-lg">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Cari Member</h3>
      <button @click="showMemberSelect = false" class="text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="flex mb-4">
      <input
        v-model="searchQuery"
        @keyup.enter="fetchMemberData"
        type="text"
        class="flex-1 p-3 border rounded-l-lg"
        placeholder="Cari dengan nama atau nomor HP..."
        autofocus
      />
      <button
        @click="fetchMemberData"
        class="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
      >
        Cari
      </button>
    </div>
    
    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
      {{ errors[0] }}
    </div>
    
    <div v-if="memberList.length > 0" class="max-h-96 overflow-y-auto space-y-2">
      <button
        v-for="member in memberList"
        :key="member.id"
        class="w-full p-3 text-left bg-white hover:bg-blue-50 border rounded-lg flex items-center"
        @click="selectMember(member)"
      >
        <div class="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <div class="font-medium">{{ member.nama_member }}</div>
          <div class="text-sm text-gray-500">{{ member.no_hp }}</div>
        </div>
      </button>
    </div>
    
    <div v-else-if="searchQuery && !errors.length" class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-center">
      Member tidak ditemukan
    </div>
  </div>
</div>

    <!-- Barang Selection Modal -->
    <div v-if="showBarangSelect" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white w-full max-w-2xl mx-4 p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Cari Barang</h3>
          <button @click="showBarangSelect = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex mb-4">
          <input
            v-model="searchQuery"
            @keyup.enter="fetchBarangData(1)"
            type="text"
            class="flex-1 p-3 border rounded-l-lg"
            placeholder="Cari dengan nama atau barcode..."
            autofocus
          />
          <button
            @click="fetchBarangData(1)"
            class="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
          >
            Cari
          </button>
        </div>
        
        <div v-if="filteredBarang.length > 0" class="max-h-96 overflow-y-auto border rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="barang in filteredBarang" :key="barang.barcode">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ barang.barcode }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ barang.nama_barang }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="barang.harga_jual_diskon && barang.harga_jual_diskon > 0" class="flex flex-col">
                    <span class="text-red-500 line-through">Rp{{ barang.harga_jual.toLocaleString('id-ID') }}</span>
                    <span>Rp{{ barang.harga_jual_diskon.toLocaleString('id-ID') }}</span>
                  </span>
                  <span v-else>Rp{{ barang.harga_jual.toLocaleString('id-ID') }}</span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium"
                    :class="{'text-green-600': barang.stok > 0, 'text-red-600': barang.stok < 1}"> {{ barang.stok }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <button
                    @click="addBarang(barang)"
                    :disabled="isSelected(barang) || barang.stok < 1"
                    class="px-3 py-1 rounded text-white"
                    :class="{
                      'bg-green-500 hover:bg-green-600': !isSelected(barang) && barang.stok > 0,
                      'bg-gray-300 cursor-not-allowed': isSelected(barang) || barang.stok < 1
                    }"
                  >
                    {{ isSelected(barang) ? 'Ditambahkan' : barang.stok < 1 ? 'Stok Habis' : 'Tambah' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-center">
          Barang tidak ditemukan
        </div>
        
        <div v-if="filteredBarang.length > 0" class="flex justify-between items-center mt-4">
          <button
            @click="fetchBarangData(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span class="text-sm text-gray-600">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <button
            @click="fetchBarangData(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </DefaultLayoutUser>
</template>

<style scoped>
/* Custom styles */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Smooth transitions */
button, input, select {
  transition: all 0.2s ease;
}

.grid {
  min-height: calc(100vh - 4rem);
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

/* Style untuk SweetAlert2 buttons */
.swal-confirm-button {
  background-color: #3085d6 !important;
  color: white !important;
  border: none !important;
  padding: 10px 24px !important;
  border-radius: 4px !important;
}

.swal-cancel-button {
  background-color: #6c757d !important;
  color: white !important;
  border: none !important;
  padding: 10px 24px !important;
  border-radius: 4px !important;
}

/* Untuk memastikan text putih di tombol */
.swal2-styled.swal2-confirm, 
.swal2-styled.swal2-cancel {
  color: white !important;
}
</style>