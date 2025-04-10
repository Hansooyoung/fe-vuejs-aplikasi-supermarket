<script setup>
import api from '@/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; 
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutMembers from '@/layouts/DefaultLayoutMembers.vue';

const router = useRouter();
const formData = ref({
  nama_barang: '',
  jumlah:0,
  pesan: '',
});

const errors = ref([]);

const handleSubmit = async () => {
  try {
    errors.value = [];

    const response = await api.request({
      method: 'POST',
      url: '/pengajuan-barang',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Pengajuan barang berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    console.log(response.data);

    router.push({ name: 'pengajuan' });
  } catch (error) {
    if (error.response) {
      if (error.response.status === 403) {
        Swal.fire({
          title: 'Akses Ditolak!',
          text: 'User tidak memiliki member yang terkait.',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      } else if (error.response.data.errors) {
        errors.value = error.response.data.errors;
        const errorMessage = Object.values(errors.value).flat()[0];

        Swal.fire({
          title: 'Error!',
          text: errorMessage || 'Terjadi kesalahan saat menyimpan data.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
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
  <DefaultLayoutMembers>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Ajukan Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <InputGroup
                label="Nama Barang"
                type="text"
                placeholder="Masukkan Nama Barang"
                v-model="formData.nama_barang"
                customClasses="mb-4.5"
              />
              <InputGroup
                label="Jumlah Barang"
                type="number"
                min="1"
                placeholder="Masukkan Jumlah Barang"
                v-model="formData.jumlah"
                customClasses="mb-4.5"
              />
              <InputGroup
                label="Pesan (Opsional)"
                type="text"
                placeholder="Tambahkan pesan (jika ada)"
                v-model="formData.pesan"
                customClasses="mb-4.5"
              />

              <!-- Submit Button -->
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
              >
                Ajukan Barang
              </button>
            </div>
          </form>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayoutMembers>
</template>

<style scoped>
.bg-primary {
  background-color: #1d4ed8;
}
.bg-primary:hover {
  background-color: #1e40af;
}
</style>
