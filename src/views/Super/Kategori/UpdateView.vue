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
  nama_satuan: '',
}); 

// Error handling
const errors = ref([]);
const isLoading = ref(false);

// Fetch data saat halaman pertama kali dimuat
const fetchDataKategori = async () => {
  const kode = route.params.id;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/kategori/${kode}`,
      headers: {
        'Accept': 'application/json',
      },
    });
    formData.value.nama_satuan = response.data.data.nama_satuan;
  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan saat mengambil data.');
  } finally {
    isLoading.value = false;
  }
};

// Submit form to API
const handleSubmit = async () => {
  try {
    // Clear previous errors
    errors.value = [];
    const kode = route.params.id;

    // API call to update data
    const response = await api.request({
      method: 'PUT',
      url: `/kategori/${kode}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value, // Send form data
    });

    // Success notification
    alert('Data berhasil diperbarui!');
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

// Fetch data saat halaman dimuat
onMounted(fetchDataKategori);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Kategori Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              
              <InputGroup
                label="Nama Kategori Barang"
                type="text"
                placeholder="Masukkan nama Kategori barang"
                v-model="formData.nama_satuan"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama_satuan" class="text-sm text-red-600">
                {{ errors.nama_satuan[0] }}
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
