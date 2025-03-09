<script setup>
import api from '@/api'; // Gunakan instance API yang sudah diatur
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const router = useRouter();
const route = useRoute();

// Form state
const formData = ref({
  nisn: '',
  nama: '',
  kelas_id: '',
  jurusan_id: '',
  no_hp: '',
});

// Dropdown options
const kelasOptions = ref([]);
const jurusanOptions = ref([]);

// Error handling
const errors = ref([]);
const isLoading = ref(false);

// Fetch kelas and jurusan options
const fetchOptions = async () => {
  try {
    const [kelasResponse, jurusanResponse] = await Promise.all([
      api.request({ method: 'GET', url: '/kelas' }),
      api.request({ method: 'GET', url: '/jurusan' }),
    ]);
    kelasOptions.value = kelasResponse.data.data;
    jurusanOptions.value = jurusanResponse.data.data;
  } catch (error) {
    console.error('Error fetching options:', error);
  }
};

// Fetch data siswa saat halaman dimuat
const fetchSiswa = async () => {
  const id = route.params.id;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/siswa/${id}`,
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = response.data.data;
    formData.value = {
      nisn: data.nisn,
      nama: data.nama,
      kelas_id: data.kelas_id,
      jurusan_id: data.jurusan_id,
      no_hp: data.no_hp,
    };

  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan saat mengambil data siswa.');
  } finally {
    isLoading.value = false;
  }
};

// Submit form to API
const handleSubmit = async () => {
  const id = route.params.id;
  try {
    // Clear previous errors
    errors.value = [];

    // API call to update data
    const response = await api.request({
      method: 'PUT',
      url: `/siswa/${id}`,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    // Success notification
    alert('Data siswa berhasil diperbarui!');
    console.log(response.data);

    // Redirect to the index page
    router.push({ name: 'siswa' });
  } catch (error) {
    // Handle validation or other errors
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;
    } else {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  }
};

// Fetch options and siswa data saat halaman dimuat
onMounted(async () => {
  await fetchOptions();
  await fetchSiswa();
});
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Data Siswa">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Input for NISN -->
              <InputGroup
                label="NISN"
                type="text"
                placeholder="Masukkan NISN"
                v-model="formData.nisn"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nisn" class="text-sm text-red-600">
                {{ errors.nisn[0] }}
              </p>

              <!-- Input for Nama -->
              <InputGroup
                label="Nama Siswa"
                type="text"
                placeholder="Masukkan nama siswa"
                v-model="formData.nama"
                customClasses="mb-4.5"
              />
              <p v-if="errors.nama" class="text-sm text-red-600">
                {{ errors.nama[0] }}
              </p>

              <!-- Select for Kelas -->
              <div class="mb-4.5">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <select
                  v-model="formData.kelas_id"
                  class="block w-full p-2 border rounded"
                >
                  <option value="" disabled>Pilih Kelas</option>
                  <option
                    v-for="kelas in kelasOptions"
                    :key="kelas.id"
                    :value="kelas.id"
                  >
                    {{ kelas.nama_kelas }}
                  </option>
                </select>
                <p v-if="errors.kelas_id" class="text-sm text-red-600">
                  {{ errors.kelas_id[0] }}
                </p>
              </div>

              <!-- Select for Jurusan -->
              <div class="mb-4.5">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Jurusan
                </label>
                <select
                  v-model="formData.jurusan_id"
                  class="block w-full p-2 border rounded"
                >
                  <option value="" disabled>Pilih Jurusan</option>
                  <option
                    v-for="jurusan in jurusanOptions"
                    :key="jurusan.id"
                    :value="jurusan.id"
                  >
                    {{ jurusan.nama_jurusan }}
                  </option>
                </select>
                <p v-if="errors.jurusan_id" class="text-sm text-red-600">
                  {{ errors.jurusan_id[0] }}
                </p>
              </div>

              <!-- Input for No HP -->
              <InputGroup
                label="No HP"
                type="text"
                placeholder="Masukkan No HP"
                v-model="formData.no_hp"
                customClasses="mb-4.5"
              />
              <p v-if="errors.no_hp" class="text-sm text-red-600">
                {{ errors.no_hp[0] }}
              </p>

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
