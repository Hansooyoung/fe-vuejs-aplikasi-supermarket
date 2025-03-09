<script setup>
import api from '@/api'; // Gunakan instance API yang sudah diatur
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue'; 
import InputGroup from '@/components/Auths/InputGroup.vue'; 
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();
const route = useRoute();

// Form state
const formData = ref({
  nama: '',
  email: '',
  password: '',
  role: '',
}); 

// Error handling
const errors = ref([]);
const isLoading = ref(false);
const roles = ['super', 'admin', 'user']; // Enum roles

// Fetch data saat halaman pertama kali dimuat
const fetchUser = async () => {
  const id = route.params.id;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/users/${id}`,
      headers: {
        'Accept': 'application/json',
      },
    });
    const user = response.data;
    formData.value = {
      nama: user.nama,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan saat mengambil data pengguna.');
  } finally {
    isLoading.value = false;
  }
};

// Submit form to API
const handleSubmit = async () => {
  try {
    errors.value = [];
    const id = route.params.id;

    const response = await api.request({
      method: 'PUT',
      url: `/users/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value, // Send form data
    });

    alert('Data pengguna berhasil diperbarui!');
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'daftar-pengguna' });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;
    } else {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data pengguna.');
    }
  }
};

// Fetch data saat halaman dimuat
onMounted(fetchUser);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Pengguna">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for Nama -->
              <InputGroup
                label="Nama Pengguna"
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
                placeholder="Masukkan email"
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
                placeholder="Masukkan password (kosongkan jika tidak ingin mengganti)"
                v-model="formData.password"
                customClasses="mb-4.5"
              />
              <p v-if="errors.password" class="text-sm text-red-600">
                {{ errors.password[0] }}
              </p>

              <!-- Select for Role -->
              <div class="mb-4.5">
                <label class="block text-sm font-medium">Role</label>
                <select 
                  v-model="formData.role" 
                  class="w-full mt-1 p-2 border rounded"
                >
                  <option v-for="role in roles" :key="role" :value="role">
                    {{ role }}
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
