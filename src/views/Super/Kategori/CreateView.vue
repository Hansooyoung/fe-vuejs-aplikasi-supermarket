<script setup>
import api from '@/api'; // Gunakan instance API yang sudah diatur
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue';// Sesuaikan dengan lokasi komponen
import InputGroup from '@/components/Auths/InputGroup.vue'; // Sesuaikan dengan lokasi komponen
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';
const router = useRouter();

// Form state
const formData = ref({
  nama_kategori: '',
}); 

// Error handling
const errors = ref([]);

// Submit form to API
const handleSubmit = async () => {
  try {
    // Clear previous errors
    errors.value = [];

    // API call using api.request
    const response = await api.request({
      method: 'POST',
      url: '/kategori',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value, // Send form data
    });

    // Success notification
    alert('Data berhasil dibuat!');
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'kategori' });
  } catch (error) {
    // Handle validation or other errors
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors; // Display validation errors
    } else {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  }
};
</script>

<template>
    <DefaultLayoutAdmin>
  <div class="grid">
    <div class="flex flex-col gap-9">

      <DefaultCard cardTitle="Tambah Jenis Barang">
        <form @submit.prevent="handleSubmit">
          <div class="p-6.5">
         
            <InputGroup
              label="Nama Kategori Barang"
              type="text"
              placeholder="Masukkan Nama Kategori barang"
              v-model="formData.nama_kategori"
              customClasses="mb-4.5"
            />
            <p v-if="errors.nama_kategori" class="text-sm text-red-600">
              {{ errors.nama_kategori[0] }}
            </p>

            <!-- Submit Button -->
            <button
              type="submit"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
            >
              Simpan Data
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
