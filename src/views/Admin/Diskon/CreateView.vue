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
  nama_diskon: '',
  jenis_diskon: 'persentase', // Default to percentage
  nilai_diskon: 0,
  tanggal_mulai: '',
  tanggal_berakhir: ''
});

const errors = ref({});
const isLoading = ref(false);

const jenisDiskonOptions = [
  { value: 'persentase', label: 'Persentase (%)' },
  { value: 'nominal', label: 'Nominal (Rp)' }
];

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    errors.value = {};

    // Convert nominal value to number if needed
    if (formData.value.jenis_diskon === 'nominal') {
      formData.value.nilai_diskon = Number(formData.value.nilai_diskon);
    }

    const response = await api.request({
      method: 'POST',
      url: '/diskon',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: response.data.message || 'Data diskon berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'diskon' });
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
      
      // Show first error message
      const firstError = Object.values(errors.value)[0][0];
      Swal.fire({
        title: 'Validasi Error',
        text: firstError,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    }
  } finally {
    isLoading.value = false;
  }
};

// Helper to format date for input field
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tambah Diskon">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5 space-y-4">
              <!-- Nama Diskon -->
              <InputGroup
                label="Nama Diskon*"
                type="text"
                placeholder="Masukkan nama diskon"
                v-model="formData.nama_diskon"
                :error="errors.nama_diskon"
              />

              <!-- Jenis Diskon -->
              <div class="mb-4.5">
                <label class="mb-2.5 block text-sm font-medium text-gray-800">
                  Jenis Diskon*
                </label>
                <select
                  v-model="formData.jenis_diskon"
                  class="w-full rounded border border-gray-300 bg-white py-2 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  :class="{ 'border-red-500': errors.jenis_diskon }"
                >
                  <option 
                    v-for="option in jenisDiskonOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <span v-if="errors.jenis_diskon" class="text-xs text-red-500">
                  {{ errors.jenis_diskon[0] }}
                </span>
              </div>

              <!-- Nilai Diskon -->
              <InputGroup
                :label="formData.jenis_diskon === 'persentase' ? 'Nilai Diskon (%)*' : 'Nilai Diskon (Rp)*'"
                :type="formData.jenis_diskon === 'persentase' ? 'number' : 'text'"
                :placeholder="formData.jenis_diskon === 'persentase' ? 'Masukkan persentase diskon' : 'Masukkan nominal diskon'"
                v-model="formData.nilai_diskon"
                :error="errors.nilai_diskon"
                @input="formData.jenis_diskon === 'nominal' ? formatCurrencyInput($event) : null"
                :min="formData.jenis_diskon === 'persentase' ? 0 : null"
                :max="formData.jenis_diskon === 'persentase' ? 100 : null"
              />

              <!-- Tanggal Mulai -->
              <InputGroup
                label="Tanggal Mulai*"
                type="date"
                v-model="formData.tanggal_mulai"
                :error="errors.tanggal_mulai"
                :min="formatDateForInput(new Date())"
              />

              <!-- Tanggal Berakhir -->
              <InputGroup
                label="Tanggal Berakhir*"
                type="date"
                v-model="formData.tanggal_berakhir"
                :error="errors.tanggal_berakhir"
                :min="formData.tanggal_mulai || formatDateForInput(new Date())"
              />

              <!-- Submit Button -->
              <button
                type="submit"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
                <span v-else>Simpan Data</span>
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