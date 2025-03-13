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
  nama_kategori: '',
});

const errors = ref([]);
const isLoading = ref(false);

// Fetch data kategori saat halaman dimuat
const fetchDataKategori = async () => {
  const kode = route.params.id;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/kategori/${kode}`,
      headers: { 'Accept': 'application/json' },
    });
    formData.value.nama_kategori = response.data.data.nama_kategori;
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: 'Error!',
      text: 'Terjadi kesalahan saat mengambil data.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33',
    });
  } finally {
    isLoading.value = false;
  }
};

// Submit form untuk update kategori
const handleSubmit = async () => {
  try {
    errors.value = [];
    const kode = route.params.id;

    const response = await api.request({
      method: 'PUT',
      url: `/kategori/${kode}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Kategori berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'kategori' });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;
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

onMounted(fetchDataKategori);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Edit Kategori Barang">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <InputGroup
                label="Nama Kategori Barang"
                type="text"
                placeholder="Masukkan nama kategori barang"
                v-model="formData.nama_kategori"
                customClasses="mb-4.5"
              />    
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
