<script setup>
import api from '@/api'; // Gunakan instance API yang sudah diatur
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue'; // Sesuaikan dengan lokasi komponen
import InputGroup from '@/components/Auths/InputGroup.vue'; // Sesuaikan dengan lokasi komponen
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();
const route = useRoute();

// Form state
const formData = ref({
  nama_kelas: '', // Mengubah form data untuk kelas
}); 

// Error handling
const errors = ref([]);
const isLoading = ref(false);

// Fetch data saat halaman pertama kali dimuat
const fetchKelas = async () => {
  const id = route.params.id; // Ambil id dari parameter route
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/kelas/${id}`, // Ambil data kelas berdasarkan id
      headers: {
        'Accept': 'application/json',
      },
    });
    formData.value.nama_kelas = response.data.data.nama_kelas;
  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan saat mengambil data kelas.');
  } finally {
    isLoading.value = false;
  }
};

// Submit form to API
const handleSubmit = async () => {
  try {
    // Clear previous errors
    errors.value = [];
    const id = route.params.id; // Ambil id dari parameter route

    // API call to update data kelas
    const response = await api.request({
      method: 'PUT',
      url: `/kelas/${id}`, // Menggunakan URL untuk update
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value, // Kirimkan data form
    });

    // Success notification
    alert('Data kelas berhasil diperbarui!');
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'kelas' }); // Redirect sesuai dengan route kelas
  } catch (error) {
    // Handle validation or other errors
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors; // Display validation errors
    } else {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data kelas.');
    }
  }
};

// Fetch data saat halaman dimuat
onMounted(fetchKelas);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Kelas">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for Nama Kelas -->
              <InputGroup
                label="Nama Kelas"
                type="text"
                placeholder="Masukkan nama kelas"
                v-model="formData.nama_kelas"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama_kelas" class="text-sm text-red-600">
                {{ errors.nama_kelas[0] }}
              </p>

              <!-- Submit Button -->
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Loading...' : 'Simpan Data' }}
              </button>
            </div>
          </form>
        </DefaultCard>
        <!-- Form End -->
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
