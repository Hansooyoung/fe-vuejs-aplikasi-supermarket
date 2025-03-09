<script setup>
import api from '@/api'; // Gunakan instance API yang sudah diatur
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue';// Sesuaikan dengan lokasi komponen
import InputGroup from '@/components/Auths/InputGroup.vue'; // Sesuaikan dengan lokasi komponen
import DefaultLayoutSuper from '@/layouts/DefaultLayoutSuper.vue';
const router = useRouter();

// Form state
const formData = ref({
  nama: '',
  email: '',
  password: '',
  role: 'user', // Default role
}); 

// Error handling
const errors = ref([]);

// Options for the role select dropdown
const roles = ref([
  { value: 'super', label: 'Super' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]);

// Submit form to API
const handleSubmit = async () => {
  try {
    // Clear previous errors
    errors.value = [];

    // API call using api.request
    const response = await api.request({
      method: 'POST',
      url: '/users',
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
    router.push({ name: 'daftar-pengguna-super' });
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
  <DefaultLayoutSuper>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Tambah Pengguna">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for Nama -->
              <InputGroup
                label="Nama"
                type="text"
                placeholder="Masukkan nama pengguna"
                v-model="formData.nama"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama" class="text-sm text-red-600">
                {{ errors.nama[0] }}
              </p>

              <!-- Input for Email -->
              <InputGroup
                label="Email"
                type="email"
                placeholder="Masukkan email pengguna"
                v-model="formData.email"
                customClasses="mb-4.5"
              />
              <p v-if="errors.email" class="text-sm text-red-600">
                {{ errors.email[0] }}
              </p>

              <!-- Input for Password -->
              <InputGroup
                label="Password"
                type="text"
                placeholder="Masukkan password"
                v-model="formData.password"
                customClasses="mb-4.5"
              />
              <p v-if="errors.password" class="text-sm text-red-600">
                {{ errors.password[0] }}
              </p>

              <!-- Select for Role -->
              <div class="mb-4.5">
                <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  v-model="formData.role"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="role in roles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <p v-if="errors.role" class="text-sm text-red-600">
                  {{ errors.role[0] }}
                </p>
              </div>

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
  </DefaultLayoutSuper>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
 