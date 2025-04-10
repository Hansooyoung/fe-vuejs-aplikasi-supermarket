<script setup>
import api from '@/api';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutAdmin from '@/layouts/DefaultLayoutAdmin.vue';

const router = useRouter();
const route = useRoute();

const formData = ref({
  nama_barang: '',
  jumlah: 1,
  pesan: '',
});

const errors = ref([]);
const isLoading = ref(false);

// Fetch data jika sedang dalam mode edit
const fetchData = async () => {
  const id = route.params.id;
  if (!id) return;

  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/pengajuan-barang/${id}/`,
      headers: { 'Accept': 'application/json' },
    });

    formData.value = {
      nama_barang: response.data.nama_barang,
      jumlah: response.data.jumlah,
      pesan: response.data.pesan || '',
    };
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

// Submit form untuk membuat atau memperbarui pengajuan barang
const handleSubmit = async () => {
  try {
    errors.value = [];
    isLoading.value = true;
    const id = route.params.id;

    const response = await api.request({
      method: id ? 'PUT' : 'POST',
      url: id ? `/pengajuan-barang/${id}/` : '/pengajuan-barang',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: id ? 'Pengajuan barang berhasil diperbarui.' : 'Pengajuan barang berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'pengajuan' });
  } catch (error) {
    isLoading.value = false;
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

onMounted(fetchData);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard :cardTitle="route.params.id ? 'Edit Pengajuan Barang' : 'Buat Pengajuan Barang'">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <InputGroup
                label="Nama Barang"
                type="text"
                placeholder="Masukkan nama barang"
                v-model="formData.nama_barang"
                customClasses="mb-4.5"
              />  
              <InputGroup
                label="Jumlah"
                type="number"
                placeholder="Masukkan jumlah barang"
                v-model="formData.jumlah"
                customClasses="mb-4.5"
              />  
              <InputGroup
                label="Pesan (Opsional)"
                type="text"
                placeholder="Tambahkan pesan"
                v-model="formData.pesan"
                customClasses="mb-4.5"
              />  
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Loading...' : route.params.id ? 'Perbarui Pengajuan' : 'Ajukan Barang' }}
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
