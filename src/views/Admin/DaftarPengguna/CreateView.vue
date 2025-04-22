<script setup>
import api from '@/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // Import SweetAlert2
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();

// Form state
const formData = ref({
  nama: '',
  email: '',
  password: '',
  role: 'user', // Default role
});

// Error handling
const errors = ref({
  nama: null,
  email: null,
  password: null,
  role: null
});

// Loading state
const loading = ref(false);

// Options for the role select dropdown
const roles = ref([
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super', label: 'Super Admin' },
  { value: 'operator', label: 'Operator' },
]);

// Submit form to API
const handleSubmit = async () => {
  try {
    // Clear previous errors
    errors.value = {
      nama: null,
      email: null,
      password: null,
      role: null
    };
    loading.value = true;

    // API call
    const response = await api.post('/users', formData.value);

    // Success notification
        // SweetAlert success notification
        await Swal.fire({
      title: 'Berhasil!',
      text: 'Data berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'daftar-pengguna-admin' });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;
      
      // Ambil pesan error pertama dari response API
      const errorMessage = Object.values(errors.value).flat()[0]; 

      Swal.fire({
        title: 'Error!',
        text: errorMessage || 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
  } else {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    }
  }
};
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Tambah Pengguna">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for Nama -->
              <InputGroup
                label="Nama Lengkap"
                type="text"
                placeholder="Masukkan nama lengkap (maks. 50 karakter)"
                v-model="formData.nama"
                customClasses="mb-4.5"
                :error="errors.nama"
                required
              />

              <!-- Input for Email -->
              <InputGroup
                label="Email"
                type="email"
                placeholder="Masukkan alamat email"
                v-model="formData.email"
                customClasses="mb-4.5"
                :error="errors.email"
                required
              />

              <!-- Input for Password -->
              <InputGroup
                label="Password"
                type="password"
                placeholder="Masukkan password (min. 6 karakter)"
                v-model="formData.password"
                customClasses="mb-4.5"
                :error="errors.password"
                required
              />

              <!-- Select for Role -->
              <div class="mb-4.5">
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                  Role <span class="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  v-model="formData.role"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                  required
                >
                  <option v-for="role in roles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <p v-if="errors.role" class="text-sm text-red-600 mt-1">
                  {{ errors.role }}
                </p>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                :disabled="loading"
              >
                <span v-if="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
                <span v-else>
                  Simpan Data
                </span>
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