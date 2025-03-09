<script setup>
import api from '@/api';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2'; // Import SweetAlert2
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();
const route = useRoute();

const formData = ref({
  nama_vendor: '',
  alamat: '',
  no_hp: '',
});

const errors = ref([]);
const isLoading = ref(false);

// Ambil data vendor saat halaman dimuat
const fetchDataVendor = async () => {
  const id = route.params.id;
  try {
  isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/vendor/${id}`,
      headers: { 'Accept': 'application/json' },
    });

    formData.value = {
      nama_vendor: response.data.data.nama_vendor || '',
      alamat: response.data.data.alamat || '',
      no_hp: response.data.data.no_hp || '',
    };
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: 'Error!',
      text: 'Terjadi kesalahan saat mengambil data vendor.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33',
    });
  } finally {
    isLoading.value = false;
  }
};

// Fungsi validasi nomor HP
const validatePhoneInput = () => {
  formData.value.no_hp = formData.value.no_hp.replace(/[^+0-9]/g, ''); // Hanya angka dan '+'

  // Pastikan '+' hanya di awal
  if (formData.value.no_hp.includes('+')) {
    formData.value.no_hp = '+' + formData.value.no_hp.replace(/\+/g, '');
  }
};

// Fungsi untuk submit form
const handleSubmit = async () => {
  try {
    errors.value = [];

    // Validasi manual sebelum mengirim request ke backend
    if (!formData.value.nama_vendor.trim()) {
      errors.value.push("Nama vendor harus diisi.");
    }
    if (!formData.value.alamat.trim()) {
      errors.value.push("Alamat vendor harus diisi.");
    }
    if (!formData.value.no_hp.trim()) {
      errors.value.push("Nomor HP harus diisi.");
    } else {
      // Validasi no_hp: hanya angka, opsional diawali dengan +
      const phoneRegex = /^\+?[0-9]{9,15}$/;
      if (!phoneRegex.test(formData.value.no_hp)) {
        errors.value.push("Nomor HP hanya boleh berisi angka dan boleh diawali dengan '+'. Minimal 9 digit, maksimal 15 digit.");
      }
    }

    // Jika ada error dari validasi manual, tampilkan SweetAlert
    if (errors.value.length > 0) {
      Swal.fire({
        title: 'Error!',
        html: errors.value.join('<br>'), // Menampilkan semua error dalam satu alert
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
      return;
    }

    // Kirim data ke backend
    const id = route.params.id;
    const response = await api.request({
      method: 'PUT',
      url: `/vendor/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Vendor berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'vendor' });

  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = Object.values(error.response.data.errors).flat();

      Swal.fire({
        title: 'Error!',
        html: errors.value.join('<br>'),
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

onMounted(fetchDataVendor);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Edit Vendor Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Nama Vendor -->
              <InputGroup
                label="Nama Vendor"
                type="text"
                placeholder="Masukkan Nama Vendor"
                v-model="formData.nama_vendor"
                customClasses="mb-4.5"
              />

              <!-- Alamat Vendor -->
              <InputGroup
                label="Alamat Vendor"
                type="text"
                placeholder="Masukkan Alamat Vendor"
                v-model="formData.alamat"
                customClasses="mb-4.5"
              />

              <!-- Nomor HP Vendor -->
              <InputGroup
                label="Nomor HP"
                type="text"
                placeholder="Masukkan Nomor HP Vendor"
                v-model="formData.no_hp"
                @input="validatePhoneInput"
                customClasses="mb-4.5"
              />

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
