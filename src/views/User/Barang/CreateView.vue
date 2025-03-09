<script setup>
import api from '@/api'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'

const router = useRouter()
const formData = ref({
  kategori_id: '',
  kategori_nama: '',
  satuan_id: '',
  satuan_nama: '',
  diskon_id: '',
  diskon_nama: '',
  nama_barang: '',
  barcode: '',
  status: 'Aktif',
  profit_persen: '',
  gambar: null
})

const errors = ref([])
const kategoriList = ref([])
const satuanList = ref([])
const diskonList = ref([])
const modalType = ref('')
const isModalOpen = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout = null

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
  if (modalType.value === 'kategori') {
    formData.value.kategori_id = item.id
    formData.value.kategori_nama = item.nama_kategori
  } else if (modalType.value === 'satuan') {
    formData.value.satuan_id = item.id
    formData.value.satuan_nama = item.nama_satuan
  } else if (modalType.value === 'diskon') {
    formData.value.diskon_id = item.id
    formData.value.diskon_nama = item.nama_diskon
  }
  closeModal()
}

const fetchDropdownData = async () => {
  try {
    const params = searchQuery.value ? { search: searchQuery.value } : {}
    if (modalType.value === 'kategori') {
      const response = await api.get('/kategori', { params })
      kategoriList.value = response.data.data.data || []
    } else if (modalType.value === 'satuan') {
      const response = await api.get('/satuan', { params })
      satuanList.value = response.data.data.data || []
    } else if (modalType.value === 'diskon') {
      const response = await api.get('/diskon', { params })
      diskonList.value = response.data.data.data || []
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    isSearching.value = false
    fetchDropdownData()
  }, 5000)
  isSearching.value = true
}

watch(searchQuery, () => {
  handleSearch()
})

const previewImage = ref(null)
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.gambar = file
    const reader = new FileReader()
    reader.onload = () => {
      previewImage.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  try {
    errors.value = []
    const formDataToSend = new FormData()
    formDataToSend.append('kategori_id', formData.value.kategori_id)
    formDataToSend.append('satuan_id', formData.value.satuan_id)
    formDataToSend.append('diskon_id', formData.value.diskon_id || '')
    formDataToSend.append('nama_barang', formData.value.nama_barang)
    formDataToSend.append('barcode', formData.value.barcode)
    formDataToSend.append('status', formData.value.status)
    formDataToSend.append('profit_persen', formData.value.profit_persen)
    if (formData.value.gambar) {
      formDataToSend.append('gambar', formData.value.gambar)
    }

    const response = await api.post('/barang', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Swal.fire({
      title: 'Berhasil!',
      text: response.data.message,
      icon: 'success',
      confirmButtonColor: '#1d4ed8'
    })

    router.push({ name: 'barang' })
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      Swal.fire({
        title: 'Validasi Gagal!',
        text: Object.values(errors.value).flat()[0] || 'Silakan periksa input Anda.',
        icon: 'warning',
        confirmButtonColor: '#d33'
      })
    } else {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Terjadi kesalahan.',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }
}



onMounted(fetchDropdownData)
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tambah Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <div v-for="type in ['kategori', 'satuan', 'diskon']" :key="type" class="mb-4.5">
                <label class="block mb-2 font-medium capitalize">{{ type }}</label>
                <button
                  type="button"
                  @click="openModal(type)"
                  class="w-full bg-gray-200 p-2 rounded"
                >
                  {{ formData[type + '_nama'] || 'Pilih ' + type }}
                </button>
              </div>
              <InputGroup
                label="Nama Barang"
                type="text"
                v-model="formData.nama_barang"
                class="mb-4.5"
              />
              <InputGroup label="Barcode" type="text" v-model="formData.barcode" class="mb-4.5" />
              <InputGroup
                label="Profit Persen"
                type="number"
                v-model="formData.profit_persen"
                class="mb-4.5"
              />
              <div class="mb-4.5">
                <label class="block mb-2 font-medium">Upload Gambar</label>
                <input type="file" @change="handleFileUpload" class="w-full p-2 border rounded" />
                <div v-if="previewImage" class="mt-3">
                  <img
                    :src="previewImage"
                    alt="Preview Gambar"
                    class="w-32 h-32 object-cover rounded border"
                  />
                </div>
              </div>
              <button
                type="submit"
                class="w-full bg-primary p-3 text-white rounded hover:bg-opacity-90"
              >
                Simpan Data
              </button>
            </div>
          </form>
        </DefaultCard>
      </div>
    </div>
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-5 rounded shadow-lg w-1/3">
        <h2 class="text-xl font-semibold mb-4">Pilih {{ modalType }}</h2>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Cari..."
          class="w-full p-2 mb-2 border rounded"
        />
        <button @click="fetchDropdownData" class="w-full bg-blue-500 p-2 text-white rounded">
          Cari
        </button>
        <ul class="max-h-60 overflow-y-auto border p-2 mt-2">
          <li
            v-for="item in modalType === 'kategori'
              ? kategoriList
              : modalType === 'satuan'
                ? satuanList
                : diskonList"
            :key="item.id"
            @click="selectItem(item)"
            class="p-2 cursor-pointer hover:bg-gray-100"
          >
            {{
              modalType === 'kategori'
                ? item.nama_kategori
                : modalType === 'satuan'
                  ? item.nama_satuan
                  : item.nama_diskon
            }}
          </li>
        </ul>
        <button @click="closeModal" class="w-full mt-4 bg-gray-300 p-2 rounded">Tutup</button>
      </div>
    </div>
  </DefaultLayoutUser>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
