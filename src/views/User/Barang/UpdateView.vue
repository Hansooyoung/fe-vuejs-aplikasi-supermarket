<script setup>
import api from '@/api'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue'

const router = useRouter()
const route = useRoute()

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
const isLoading = ref(false)

const kategoriList = ref([])
const satuanList = ref([])
const diskonList = ref([])
const modalType = ref('')
const isModalOpen = ref(false)
const searchQuery = ref('')
let searchTimeout = null

const fetchDataBarang = async () => {
  const kode = route.params.kode_barang
  if (!kode) {
    console.error('kode_barang tidak ditemukan di route params')
    return
  }
  try {
    isLoading.value = true
    const response = await api.get(`/barang/${kode}`)
    formData.value = {
      kategori_nama: response.data.kategori || '',
      satuan_nama: response.data.satuan || '',
      diskon_nama: response.data.nama_diskon || 'Tidak ada diskon',
      nama_barang: response.data.nama_barang || '',
      barcode: response.data.barcode || '',
      status: response.data.status || 'Aktif',
      profit_persen: response.data.profit_persen || '',
      gambar: response.data.gambar || null
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error!', 'Terjadi kesalahan saat mengambil data.', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.gambar = file // Simpan file untuk dikirim ke backend
  }
}

const handleSubmit = async () => {
  try {
    const kode = route.params.kode_barang
    const data = new FormData()
    data.append('_method', 'PUT')
    Object.keys(formData.value).forEach((key) => {
      if (key !== 'gambar' && formData.value[key]) {
        data.append(key, formData.value[key])
      }
    })
    if (formData.value.gambar instanceof File) {
      data.append('gambar', formData.value.gambar)
    }
    await api.post(`/barang/${kode}`, data)
    Swal.fire('Berhasil!', 'Barang berhasil diperbarui.', 'success').then(() => {
      router.push({ name: 'barang' })
    })
  } catch (error) {
    errors.value = error.response?.data.errors || []
    Swal.fire('Error!', 'Terjadi kesalahan saat menyimpan data.', 'error')
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
  formData.value[modalType.value + '_id'] = item.id
  formData.value[modalType.value + '_nama'] = item.nama || item[`nama_${modalType.value}`]
  closeModal()
}

const fetchDropdownData = async () => {
  try {
    const params = searchQuery.value ? { search: searchQuery.value } : {}
    const response = await api.get(`/${modalType.value}`, { params })
    if (modalType.value === 'kategori') kategoriList.value = response.data.data.data || []
    else if (modalType.value === 'satuan') satuanList.value = response.data.data.data || []
    else if (modalType.value === 'diskon') diskonList.value = response.data.data.data || []
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchDropdownData, 500)
})

onMounted(fetchDataBarang)
</script>

<template>
  <DefaultLayoutUser>
    <DefaultCard cardTitle="Edit Barang">
      <form @submit.prevent="handleSubmit">
        <div class="p-6.5">
          <div v-for="type in ['kategori', 'satuan', 'diskon']" :key="type" class="mb-4.5">
            <label class="block mb-2 font-medium capitalize">{{ type }}</label>
            <button type="button" @click="openModal(type)" class="w-full bg-gray-200 p-2 rounded">
              {{ formData[type + '_nama'] || 'Pilih ' + type }}
            </button>
          </div>

          <InputGroup label="Nama Barang" type="text" v-model="formData.nama_barang" class="mb-4.5" />
          <InputGroup label="Barcode" type="text" v-model="formData.barcode" class="mb-4.5" />
          <InputGroup label="Profit Persen" type="number" v-model="formData.profit_persen" class="mb-4.5" />

          <div class="mb-4.5">
            <label class="block mb-2 font-medium">Upload Gambar</label>
            <div v-if="formData.gambar" class="mb-2">
              <img :src="formData.gambar" alt="Gambar Barang" class="w-32 h-32 object-cover rounded border" />
            </div>
            <input type="file" @change="handleFileUpload" class="w-full p-2 border rounded" />
          </div>

          <button type="submit" class="w-full bg-primary p-3 text-white rounded hover:bg-opacity-90">
            Simpan Data
          </button>
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
      </form>
    </DefaultCard>
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