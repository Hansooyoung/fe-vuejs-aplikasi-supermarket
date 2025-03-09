<script setup>
import api from '@/api'; // Use the configured API instance
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue'; // Adjust with actual component location
import InputGroup from '@/components/Auths/InputGroup.vue'; // Adjust with actual component location
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();

// Form state
const formData = ref({
  nama_vendor: '', // Change this to 'nama_vendor'
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
      url: '/vendor', // Update API endpoint to '/vendor'
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value, // Send form data
    });

    // Success notification
    alert('vendor berhasil ditambahkan!');
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'vendor-super' }); // Adjust the redirect to the correct route
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
        <!-- Form Start -->
        <DefaultCard cardTitle="Tambah vendor">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for vendor Nama -->
              <InputGroup
                label="Nama vendor"
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
