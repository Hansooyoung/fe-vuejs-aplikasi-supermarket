<script setup>
import api from '@/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const router = useRouter();

// State untuk form
const formData = ref({
  nama_member: '',
  email: '',
  no_hp: '',
  password: '',
});

// Error handling
const errors = ref({});

// Submit form ke API
const handleSubmit = async () => {
  try {
    // Reset error sebelumnya
    errors.value = {};

    // API call menggunakan axios instance
    const response = await api.request({
      method: 'POST',
      url: '/member',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    // SweetAlert sukses
    Swal.fire({
      title: 'Berhasil!',
      text: 'Member berhasil ditambahkan.',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
    }).then(() => {
      router.push({ name: 'member' });
    });
  } catch (error) {
    // Handle error validasi
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;

      // SweetAlert untuk menampilkan error
      let errorMessage = Object.values(errors.value)
        .flat()
        .join('<br>');

      Swal.fire({
        title: 'Gagal!',
        html: errorMessage,
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tutup',
      });
    } else {
      console.error(error);
      Swal.fire({
        title: 'Terjadi Kesalahan!',
        text: 'Gagal menyimpan data. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tutup',
      });
    }
  }
};
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tambah Member">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Nama Member -->
              <InputGroup
                label="Nama Member"
                type="text"
                placeholder="Masukkan Nama Member"
                v-model="formData.nama_member"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama_member" class="text-sm text-red-600">
                {{ errors.nama_member[0] }}
              </p>

              <!-- Email -->
              <InputGroup
                label="Email"
                type="email"
                placeholder="Masukkan Email"
                v-model="formData.email"
                customClasses="mb-4.5"
              />
              <p v-if="errors.email" class="text-sm text-red-600">
                {{ errors.email[0] }}
              </p>

              <!-- No HP -->
              <InputGroup
                label="Nomor HP"
                type="text"
                placeholder="Masukkan Nomor HP"
                v-model="formData.no_hp"
                customClasses="mb-4.5"
              />
              <p v-if="errors.no_hp" class="text-sm text-red-600">
                {{ errors.no_hp[0] }}
              </p>

              <!-- Password -->
              <InputGroup
                label="Password"
                type="password"
                placeholder="Masukkan Password"
                v-model="formData.password"
                customClasses="mb-4.5"
              />
              <p v-if="errors.password" class="text-sm text-red-600">
                {{ errors.password[0] }}
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
      </div>
    </div>
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
