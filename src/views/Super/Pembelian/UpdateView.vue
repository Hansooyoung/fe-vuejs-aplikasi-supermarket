<script setup>
import api from '@/api'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayoutOperator from '@/layouts/DefaultLayoutOperator.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const isSubmitting = ref(false)
const pembelianId = route.params.id

const formData = ref({
  vendor_id: '',
  barang: [],
  tanggal_masuk: null,
})

const vendorList = ref([])
const barangList = ref([])
const selectedBarang = ref([])
const selectedVendor = ref(null)
const errors = ref([])
const searchQuery = ref('')
const showBarangSelect = ref(false)
const showVendorSelect = ref(false)

// Fetch existing pembelian data
const fetchPembelianData = async () => {
  try {
    const response = await api.get(`/pembelian/${pembelianId}`);
    const pembelian = response.data;

    // Set form data
    formData.value = {
      vendor_id: pembelian.vendor_id,
      tanggal_masuk: pembelian.tanggal_masuk === 'Belum Masuk' ? null : pembelian.tanggal_masuk,
    };

    // Set selected vendor
    if (pembelian.vendor_id) {
      try {
        const vendorResponse = await api.get(`/vendor/${pembelian.vendor_id}`);
        selectedVendor.value = vendorResponse.data.data;
      } catch (error) {
        console.error('Error fetching vendor:', error);
      }
    }

    // Set selected barang - use the direct fields from detail_pembelian
    if (pembelian.detail_pembelian && pembelian.detail_pembelian.length > 0) {
      selectedBarang.value = pembelian.detail_pembelian.map(item => ({
        barcode: item.barcode, // Use barcode directly from item
        nama_barang: item.nama_barang, // Use nama_barang directly from item
        harga_beli: Number(item.harga_beli) || 0,
        jumlah: Number(item.jumlah) || 1,
        stok: 0 // You might need to fetch this separately if needed
      }));
    }

  } catch (error) {
    console.error('Error fetching pembelian:', error);
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat data pembelian' });
  }
};

// Fetch Vendor Data
const fetchVendorData = async () => {
  try {
    console.log('Memulai fetch daftar vendor...')
    const response = await api.get('/vendor', {
      params: { 
        search: searchQuery.value,
        per_page: 100
      }
    })
    console.log('Response daftar vendor:', response.data)
    
    // Sesuaikan dengan struktur response API
    vendorList.value = response.data.data?.data || response.data.data || []
    console.log('Daftar vendor:', vendorList.value)
  } catch (error) {
    console.error('Gagal mengambil daftar vendor:', error)
    vendorList.value = []
  }
}

// Fetch Barang Data
const fetchBarangData = async () => {
  try {
    const response = await api.get('/barang', { 
      params: { search: searchQuery.value } 
    })
    barangList.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch barang:', error)
  }
}

// Computed Properties
const totalHarga = computed(() => {
  return selectedBarang.value.reduce((sum, barang) => {
    return sum + (barang.harga_beli * barang.jumlah)
  }, 0)
})

const filteredBarang = computed(() => {
  return barangList.value.filter(
    barang =>
      barang.barcode?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      barang.nama_barang?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const isSelected = (barang) => {
  return selectedBarang.value.some(b => b.barcode === barang.barcode)
}

// Methods
const addBarang = (barang) => {
  // Validasi barcode
  if (!barang.barcode) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Barang harus memiliki barcode' });
    return;
  }

  const existingIndex = selectedBarang.value.findIndex(b => b.barcode === barang.barcode);
  
  if (existingIndex >= 0) {
    // Jika sudah ada, update jumlahnya
    selectedBarang.value[existingIndex].jumlah += 1;
  } else {
    // Jika belum ada, tambahkan baru
    selectedBarang.value.push({
      barcode: barang.barcode, // Pastikan menggunakan barcode
      nama_barang: barang.nama_barang,
      harga_beli: Number(barang.harga_beli) || 0,
      jumlah: 1,
      stok: Number(barang.stok || 0)
    });
  }
  
  showBarangSelect.value = false;
  searchQuery.value = '';
};
const selectVendor = (vendor) => {
  formData.value.vendor_id = vendor.id
  selectedVendor.value = vendor
  showVendorSelect.value = false
  searchQuery.value = ''
}

const removeBarang = (index) => {
  selectedBarang.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  // Validasi data
  if (selectedBarang.value.length === 0) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tambahkan minimal 1 barang' });
    return;
  }

  // Validasi vendor
  if (!formData.value.vendor_id) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Pilih vendor terlebih dahulu' });
    return;
  }

  // Konfirmasi
  const confirmResult = await Swal.fire({
    title: 'Konfirmasi Perubahan Pembelian',
    html: `
      <div class="text-left">
        <p><strong>Total Pembelian:</strong> Rp${totalHarga.value.toLocaleString('id-ID')}</p>
        ${formData.value.tanggal_masuk ? `<p><strong>Tanggal Masuk:</strong> ${formData.value.tanggal_masuk}</p>` : ''}
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Simpan Perubahan',
    cancelButtonText: 'Batal'
  });

  if (!confirmResult.isConfirmed) return;

  isSubmitting.value = true;

  try {
    // Format data sama persis dengan CreateView yang berhasil
    const payload = {
      vendor_id: formData.value.vendor_id,
      tanggal_masuk: formData.value.tanggal_masuk || null,
      barang: selectedBarang.value.map(item => ({
        barcode: item.barcode, // Pastikan menggunakan barcode
        harga_beli: Number(item.harga_beli),
        jumlah: Number(item.jumlah)
      }))
    };

    console.log('Data yang dikirim:', payload);

    const response = await api.put(`/pembelian/${pembelianId}`, payload, {
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Pembelian Berhasil Diperbarui!',
      html: `
        <div class="text-center">
          <p>Total: Rp${totalHarga.value.toLocaleString('id-ID')}</p>
        </div>
      `,
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => router.push({ name: 'pembelian-super' }), 2000);

  } catch (error) {
    console.error('Error update:', error.response?.data || error);
    
    const errorMsg = error.response?.data?.message || 
                   error.response?.data?.error ||
                   'Terjadi kesalahan saat memperbarui pembelian';
    
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMsg
    });

  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle Hooks
onMounted(async () => {
  await fetchPembelianData() // Load pembelian data first
  await fetchVendorData()
  await fetchBarangData()
})
</script>

<template>
  <DefaultLayoutOperator>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Section -->
      <div class="space-y-4">
        <!-- Vendor Card -->
        <DefaultCard cardTitle="Vendor">
          <div class="p-4">
            <button
              type="button"
              class="w-full p-3 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center"
              @click="showVendorSelect = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              {{ selectedVendor ? selectedVendor.nama_vendor : 'Pilih Vendor' }}
            </button>
            
            <div v-if="selectedVendor" class="mt-3 bg-white p-3 rounded-lg shadow-sm space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Nama:</span>
                <span class="font-medium">{{ selectedVendor.nama_vendor }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">No. HP:</span>
                <span class="font-medium">{{ selectedVendor.no_hp }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Alamat:</span>
                <span class="font-medium">{{ selectedVendor.alamat }}</span>
              </div>
            </div>
          </div>
        </DefaultCard>

        <!-- Tanggal Masuk & Keterangan Card -->
        <DefaultCard cardTitle="Informasi Pembelian">
          <div class="p-4 space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700">Tanggal Masuk</label>
              <input
                type="date"
                v-model="formData.tanggal_masuk"
                class="w-full p-3 border rounded-lg"
                placeholder="Opsional"
              />
              <p class="text-xs text-gray-500 mt-1">Biarkan kosong jika barang belum masuk gudang</p>
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
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="font-medium">{{ barang.nama_barang }}</div>
                    <div class="text-sm text-gray-500">{{ barang.barcode }}</div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center">
                      <input
                        v-model.number="barang.harga_beli"
                        type="number"
                        class="w-24 p-2 border rounded"
                        placeholder="Harga"
                        min="1"
                      />
                    </div>
                    
                    <div class="flex items-center">
                      <button 
                        @click="barang.jumlah > 1 ? barang.jumlah-- : null"
                        class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300"
                      >
                        -
                      </button>
                      <input
                        v-model.number="barang.jumlah"
                        type="number"
                        class="w-12 h-8 text-center border-t border-b"
                        min="1"
                      />
                      <button 
                        @click="barang.jumlah++"
                        class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    
                    <div class="w-24 text-right font-medium">
                      Rp{{ (barang.harga_beli * barang.jumlah).toLocaleString('id-ID') }}
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
      <div>
        <!-- Card Total Pembelian -->
        <DefaultCard cardTitle="Total Pembelian" class="mb-4">
          <div class="p-4 space-y-2">
            <div class="flex justify-between border-t pt-2">
              <span class="font-bold">Total:</span>
              <span class="font-bold text-lg">Rp{{ totalHarga.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </DefaultCard>

        <!-- Card Konfirmasi Pembelian -->
        <DefaultCard cardTitle="Konfirmasi Pembelian">
          <div class="p-4">
            <button
              type="submit"
              @click="handleSubmit"
              class="w-full p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4"
              :disabled="isSubmitting || selectedBarang.length === 0 || !formData.vendor_id"
            >
              <span v-if="isSubmitting">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
              <span v-else>
                SIMPAN PEMBELIAN
              </span>
            </button>
            
            <div v-if="errors.length" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
            </div>
          </div>
        </DefaultCard>
      </div>
    </div>

    <!-- Vendor Selection Modal -->
    <div v-if="showVendorSelect" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white w-full max-w-md mx-4 p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Cari Vendor</h3>
          <button @click="showVendorSelect = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <input
          v-model="searchQuery"
          @input="fetchVendorData"
          type="text"
          class="w-full p-3 border rounded-lg mb-4"
          placeholder="Cari dengan nama atau nomor HP..."
          autofocus
        />
        
        <div v-if="vendorList.length > 0" class="max-h-96 overflow-y-auto space-y-2">
          <button
            v-for="vendor in vendorList"
            :key="vendor.id"
            class="w-full p-3 text-left bg-white hover:bg-blue-50 border rounded-lg flex items-center"
            @click="selectVendor(vendor)"
          >
            <div class="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <div class="font-medium">{{ vendor.nama_vendor }}</div>
              <div class="text-sm text-gray-500">{{ vendor.no_hp }}</div>
            </div>
          </button>
        </div>
        
        <div v-else class="bg-gray-50 border border-gray-200 text-gray-700 p-4 rounded-lg text-center">
          Vendor tidak ditemukan
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
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="barang in filteredBarang" :key="barang.barcode">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ barang.barcode }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ barang.nama_barang }}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  Rp{{ (barang.harga_beli || 0).toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium"
                    :class="{'text-green-600': barang.stok > 0, 'text-red-600': barang.stok < 1}">
                  {{ barang.stok || 0 }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <button
                    @click="addBarang(barang)"
                    :disabled="isSelected(barang)"
                    class="px-3 py-1 rounded text-white"
                    :class="{
                      'bg-green-500 hover:bg-green-600': !isSelected(barang),
                      'bg-gray-300 cursor-not-allowed': isSelected(barang)
                    }"
                  >
                    {{ isSelected(barang) ? 'Ditambahkan' : 'Tambah' }}
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
  </DefaultLayoutOperator>
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
</style>