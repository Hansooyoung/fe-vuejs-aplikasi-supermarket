<script setup>
import api from '@/api'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import DefaultLayoutOperator from '@/layouts/DefaultLayoutOperator.vue'

const router = useRouter()
const route = useRoute()

const formData = ref({
  kategori_id: null,
  kategori_nama: '',
  satuan_id: null,
  satuan_nama: '',
  diskon_id: null,
  diskon_nama: '',
  nama_barang: '',
  barcode: '',
  status: 'Aktif',
  profit_persen: null,
  gambar: null
})

const errors = ref([])
const isLoading = ref(false)
const previewImage = ref(null)
const originalData = ref({})

const kategoriList = ref([])
const satuanList = ref([])
const diskonList = ref([])
const modalType = ref('')
const isModalOpen = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout = null

const fetchDataBarang = async () => {
  const kode = route.params.kode_barang
  try {
    isLoading.value = true
    const response = await api.get(`/barang/${kode}`)
    originalData.value = { ...response.data }
    
    formData.value = {
      kategori_id: response.data.kategori_id || null,
      kategori_nama: response.data.kategori || '',
      satuan_id: response.data.satuan_id || null,
      satuan_nama: response.data.satuan || '',
      diskon_id: response.data.diskon_id || null,
      diskon_nama: response.data.nama_diskon || '',
      nama_barang: response.data.nama_barang || '',
      barcode: response.data.barcode || '',
      status: response.data.status || 'Aktif',
      profit_persen: response.data.profit_persen || null,
      gambar: response.data.gambar || null
    }
    previewImage.value = response.data.gambar || null
  } catch (error) {
    console.error(error)
    Swal.fire({
      title: 'Error!',
      text: 'Gagal mengambil data barang',
      icon: 'error',
      confirmButtonColor: '#d33'
    })
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: 'File terlalu besar',
        text: 'Ukuran maksimal gambar adalah 2MB',
        icon: 'warning'
      })
      return
    }
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      Swal.fire({
        title: 'Format tidak didukung',
        text: 'Hanya menerima file JPG, JPEG, atau PNG',
        icon: 'warning'
      })
      return
    }
    
    formData.value.gambar = file
    const reader = new FileReader()
    reader.onload = () => {
      previewImage.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  formData.value.gambar = null
  previewImage.value = null
}

const handleSubmit = async () => {
  try {
    errors.value = []
    const kode = route.params.kode_barang
    const data = new FormData()
    data.append('_method', 'PUT')
    
    // Only append changed fields
    Object.keys(formData.value).forEach(key => {
      if (key !== 'gambar' && 
          formData.value[key] !== originalData.value[key] &&
          formData.value[key] !== null) {
        data.append(key, formData.value[key])
      }
    })
    
    // Handle image separately
    if (formData.value.gambar instanceof File) {
      data.append('gambar', formData.value.gambar)
    } else if (formData.value.gambar === null && originalData.value.gambar) {
      // If image was removed
      data.append('remove_image', 'true')
    }

    const response = await api.post(`/barang/${kode}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      title: 'Berhasil!',
      text: response.data.message,
      icon: 'success',
      confirmButtonColor: '#1d4ed8',
      timer: 1500,
      timerProgressBar: true
    })

    router.push({ name: 'barang' })
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      Swal.fire({
        title: 'Validasi Gagal!',
        html: Object.values(errors.value).map(err => `<p>${err}</p>`).join(''),
        icon: 'warning',
        confirmButtonColor: '#d33'
      })
    } else {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }
}

const openModal = (type) => {
  modalType.value = type
  searchQuery.value = ''
  isModalOpen.value = true
  fetchDropdownData()
}

const closeModal = () => {
  isModalOpen.value = false
}

const selectItem = (item) => {
  if (!item) return
  formData.value[`${modalType.value}_id`] = item.id
  formData.value[`${modalType.value}_nama`] = 
    item.nama || item[`nama_${modalType.value}`] || item.nama_kategori || item.nama_satuan || item.nama_diskon
  closeModal()
}

const fetchDropdownData = async () => {
  try {
    const params = searchQuery.value ? { search: searchQuery.value } : {}
    const response = await api.get(`/${modalType.value}`, { params })
    if (modalType.value === 'kategori') {
      kategoriList.value = response.data.data.data || []
    } else if (modalType.value === 'satuan') {
      satuanList.value = response.data.data.data || []
    } else if (modalType.value === 'diskon') {
      diskonList.value = response.data.data.data || []
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isSearching.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    isSearching.value = false
    fetchDropdownData()
  }, 500)
}

watch(searchQuery, () => {
  isSearching.value = true
  handleSearch()
})

onMounted(fetchDataBarang)
</script>

<template>
  <DefaultLayoutOperator>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Edit Data Barang">
          <form @submit.prevent="handleSubmit" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-5">
                <!-- Kategori Selection -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori <span class="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    @click="openModal('kategori')"
                    class="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <span :class="{'text-gray-500': !formData.kategori_nama}">
                      {{ formData.kategori_nama || 'Pilih Kategori' }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Satuan Selection -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Satuan <span class="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    @click="openModal('satuan')"
                    class="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <span :class="{'text-gray-500': !formData.satuan_nama}">
                      {{ formData.satuan_nama || 'Pilih Satuan' }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Diskon Selection -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diskon (Opsional)
                  </label>
                  <button
                    type="button"
                    @click="openModal('diskon')"
                    class="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <span :class="{'text-gray-500': !formData.diskon_nama}">
                      {{ formData.diskon_nama || 'Pilih Diskon' }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Nama Barang -->
                <InputGroup
                  label="Nama Barang"
                  type="text"
                  v-model="formData.nama_barang"
                  placeholder="Masukkan nama barang"
                  required
                />

                <!-- Barcode -->
                <InputGroup 
                  label="Barcode"
                  type="text"
                  v-model="formData.barcode"
                  placeholder="Masukkan kode barcode"
                  required
                />
              </div>

              <!-- Right Column -->
              <div class="space-y-5">
                <!-- Profit Persen -->
                <InputGroup
                  label="Profit Persen (%)"
                  type="number"
                  v-model="formData.profit_persen"
                  placeholder="Masukkan persentase profit"
                  min="0"
                  max="100"
                  step="0.01"
                />

                <!-- Status Toggle -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center space-x-4">
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="formData.status" 
                        value="Aktif" 
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        required
                      >
                      <span class="ml-2">Aktif</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input 
                        type="radio" 
                        v-model="formData.status" 
                        value="Tidak Aktif" 
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      >
                      <span class="ml-2">Tidak Aktif</span>
                    </label>
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gambar Barang (Opsional)
                  </label>
                  <div class="flex flex-col space-y-4">
                    <label class="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all">
                      <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="mb-2 text-sm text-gray-500">
                          <span class="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p class="text-xs text-gray-500">PNG, JPG (Max. 2MB)</p>
                      </div>
                      <input type="file" @change="handleFileUpload" class="hidden" accept="image/*" />
                    </label>
                    
                    <!-- Image Preview -->
                    <div v-if="previewImage" class="flex flex-col items-center">
                      <span class="text-sm text-gray-500 mb-2">Preview Gambar</span>
                      <div class="relative">
                        <img 
                          :src="previewImage" 
                          alt="Preview Gambar" 
                          class="w-32 h-32 object-contain rounded-lg border border-gray-200 p-1"
                        />
                        <button 
                          type="button"
                          @click="removeImage" 
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                @click="router.push({ name: 'barang' })"
                class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </DefaultCard>
      </div>
    </div>

    <!-- Modal for Selection -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div class="relative w-full max-w-md max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 80px)">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Pilih {{ modalType }}</h3>
          
          <!-- Search Input -->
          <div class="relative mb-4">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari..."
              autocomplete="off"
              @keydown.esc="closeModal"
            />
          </div>

          <!-- Loading State -->
          <div v-if="isSearching" class="flex justify-center py-4">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Mencari...</span>
          </div>

          <!-- Results List -->
          <ul class="border rounded-md divide-y divide-gray-200 overflow-y-auto">
            <li
              v-for="item in modalType === 'kategori'
                ? kategoriList
                : modalType === 'satuan'
                  ? satuanList
                  : diskonList"
              :key="item.id"
              @click="selectItem(item)"
              class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center">
                <span class="block truncate">
                  {{
                    modalType === 'kategori'
                      ? item.nama_kategori
                      : modalType === 'satuan'
                        ? item.nama_satuan
                        : item.nama_diskon
                  }}
                </span>
              </div>
            </li>
            <li v-if="(modalType === 'kategori' && !kategoriList.length) ||
                     (modalType === 'satuan' && !satuanList.length) ||
                     (modalType === 'diskon' && !diskonList.length)"
                class="px-4 py-3 text-center text-gray-500">
              Data tidak ditemukan
            </li>
          </ul>
        </div>

        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </DefaultLayoutOperator>
</template>

<style scoped>
/* Transition effects */
button, input, select, textarea {
  transition: all 0.2s ease;
}


</style>