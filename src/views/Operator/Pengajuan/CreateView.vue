<script setup>
import api from '@/api'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import DefaultLayoutOperator from '@/layouts/DefaultLayoutOperator.vue'

const router = useRouter()
const formData = ref({
  member_id: null,
  nama_barang: '',
  jumlah: 0,
  pesan: ''
})

// State untuk modal & pencarian
const showModal = ref(false)
const searchQuery = ref('')
const member = ref([])
const selectedMember = ref(null)
const errors = ref([])
const isLoading = ref(false)
const noMemberFound = ref(false)
let searchTimeout = null

// Buka Modal Pilih Member
const openModal = () => {
  showModal.value = true
  searchQuery.value = ''
  member.value = []
  noMemberFound.value = false
}

// Tutup Modal Pilih Member
const closeModal = () => {
  showModal.value = false
}

// Fetch member berdasarkan pencarian no_hp
const searchMembers = async () => {
  if (!searchQuery.value.trim()) {
    member.value = []
    noMemberFound.value = false
    return
  }

  isLoading.value = true
  try {
    const response = await api.get('/member', {
      params: { search: searchQuery.value }
    })
    member.value = response.data.data.data

    noMemberFound.value = member.value.length === 0
  } catch (error) {
    console.error('Gagal mengambil data member:', error)
    noMemberFound.value = true
  } finally {
    isLoading.value = false
  }
}

// Pilih member dari hasil pencarian
const selectMember = (memberItem) => {
  selectedMember.value = memberItem
  formData.value.member_id = memberItem.id
  showModal.value = false // Tutup modal setelah memilih
}

// Hapus member yang sudah dipilih
const removeSelectedMember = () => {
  selectedMember.value = null
  formData.value.member_id = null
}

// Submit form pengajuan barang
const handleSubmit = async () => {
  if (!formData.value.member_id) {
    Swal.fire({
      title: 'Error!',
      text: 'Harap pilih member terlebih dahulu.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
    return
  }

  try {
    errors.value = []
    await api.post('/pengajuan-barang', formData.value)

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Pengajuan barang berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8'
    })

    router.push({ name: 'pengajuan-barang' })
  } catch (error) {
    const errorMessage = error.response?.data?.errors
      ? Object.values(error.response.data.errors).flat()[0]
      : 'Terjadi kesalahan saat menyimpan data.'

    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    })
  }
}

// Panggil API dengan debounce
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchMembers()
  }, 500)
})
</script>


<template>
  <DefaultLayoutOperator>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Ajukan Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Tombol Pilih Member -->
              <div class="mb-4.5">
                <label class="block text-gray-700">Member</label>
                <button
                  type="button"
                  @click="openModal"
                  class="w-full border p-2 rounded-md bg-gray-100 text-gray-700 text-left"
                >
                  {{ selectedMember ? selectedMember.nama_member + ' (' + selectedMember.no_hp + ')' : 'Pilih Member' }}
                </button>
              </div>

              <!-- Member Terpilih -->
              <div
                v-if="selectedMember"
                class="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-4"
              >
                <p class="text-sm text-green-600">
                  Member dipilih: {{ selectedMember.nama_member }} ({{ selectedMember.no_hp }})
                </p>
                <button
                  @click="removeSelectedMember"
                  class="text-red-500 text-lg font-bold hover:text-red-700"
                >
                  ❌
                </button>
              </div>

              <!-- Input Data Barang -->
              <InputGroup
                label="Nama Barang"
                type="text"
                placeholder="Masukkan Nama Barang"
                v-model="formData.nama_barang"
                customClasses="mb-4.5"
              />
              <InputGroup
                label="Jumlah Barang"
                type="number"
                min="1"
                placeholder="Masukkan Jumlah Barang"
                v-model="formData.jumlah"
                customClasses="mb-4.5"
              />
              <InputGroup
                label="Pesan (Opsional)"
                type="text"
                placeholder="Tambahkan pesan (jika ada)"
                v-model="formData.pesan"
                customClasses="mb-4.5"
              />

              <!-- Submit Button -->
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
              >
                Ajukan Barang
              </button>
            </div>
          </form>
        </DefaultCard>
      </div>
    </div>

    <!-- Modal Pilih Member -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h2 class="text-lg font-bold mb-4">Pilih Member</h2>
        
        <!-- Input Pencarian -->
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari No HP"
          class="w-full border p-2 rounded-md mb-3"
        />
        
        <!-- Loading -->
        <p v-if="isLoading" class="text-sm text-blue-500">Mencari...</p>

        <!-- Hasil Pencarian -->
        <ul v-if="member.length" class="border rounded-md max-h-40 overflow-auto">
          <li
            v-for="memberItem in member"
            :key="memberItem.id"
            @click="selectMember(memberItem)"
            class="p-2 hover:bg-gray-200 cursor-pointer"
          >
            {{ memberItem.nama_member }} - {{ memberItem.no_hp }}
          </li>
        </ul>

        <!-- Pesan jika tidak ada member ditemukan -->
        <p v-if="noMemberFound" class="text-sm text-red-500 mt-1">Nomor tidak terdaftar</p>

        <!-- Tombol Tutup -->
        <button
          @click="closeModal"
          class="w-full mt-3 p-2 bg-red-500 text-white rounded-md hover:bg-red-700"
        >
          Tutup
        </button>
      </div>
    </div>
  </DefaultLayoutOperator>
</template>


<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
