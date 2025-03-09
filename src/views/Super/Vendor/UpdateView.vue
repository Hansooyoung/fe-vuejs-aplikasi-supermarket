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
  nama_vendor: '',
}); 

// Error handling
const errors = ref([]);
const isLoading = ref(false);

// Fetch data saat halaman pertama kali dimuat
const fetchVendor = async () => {
  const id = route.params.id;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/vendor/${id}`,
      headers: {
        'Accept': 'application/json',
      },
    });
    formData.value.nama_vendor = response.data.nama_vendor;
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
    const id = route.params.id;

    // API call to update data
    const response = await api.request({
      method: 'PUT',
      url: `/vendor/${id}`,
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
    router.push({ name: 'vendor-super' });
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
onMounted(fetchVendor);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Vendor">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for Jenis Barang Nama -->
              <InputGroup
                label="Nama Vendor"
                type="text"
                placeholder="Masukkan nama vendor"
                v-model="formData.nama_vendor"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama_vendor" class="text-sm text-red-600">
                {{ errors.nama_vendor[0] }}
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
