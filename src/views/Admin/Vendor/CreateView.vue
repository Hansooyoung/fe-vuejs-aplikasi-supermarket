<script setup>
import api from '@/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();
const formData = ref({
  nama_vendor: '',
  alamat: '',
  no_hp: '',
});

const errors = ref([]);

// Fungsi untuk memastikan hanya angka dan simbol '+' yang bisa dimasukkan
const validatePhoneInput = () => {
  formData.value.no_hp = formData.value.no_hp.replace(/[^+0-9]/g, ''); // Hanya angka dan '+'

  // Pastikan '+' hanya di awal
  if (formData.value.no_hp.includes('+')) {
    formData.value.no_hp = '+' + formData.value.no_hp.replace(/\+/g, '');
  }
};

// Validasi sebelum submit
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
    const response = await api.request({
      method: 'POST',
      url: '/vendor',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Data vendor berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    console.log(response.data);
    router.push({ name: 'vendor' });

  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = Object.values(error.response.data.errors).flat();

      Swal.fire({
        title: 'Error!',
        html: errors.value.join('<br>'), // Menampilkan semua error dalam satu alert
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
        <DefaultCard cardTitle="Tambah Vendor Barang">
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
              >
                Simpan Data
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
