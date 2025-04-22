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
  nama_voucher: null,
  harga_point: null,
  jenis_voucher: null,
  status: null,
  nilai_voucher: null,
  min_pembelian: null,
});

const originalData = ref({});
const errors = ref({});
const isLoading = ref(false);
const isSubmitting = ref(false);

// Fetch voucher data when component mounts
const fetchVoucherData = async () => {
  try {
    isLoading.value = true;
    const response = await api.get(`/voucher/${route.params.id}`);
    originalData.value = response.data.data;
    // Initialize form with original data
    Object.keys(formData.value).forEach(key => {
      formData.value[key] = originalData.value[key];
    });
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: 'Error!',
      text: 'Gagal memuat data voucher',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33',
    });
    router.push({ name: 'voucher' });
  } finally {
    isLoading.value = false;
  }
};

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    errors.value = {};

    // Prepare payload with only changed fields
    const payload = {};
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key] !== originalData.value[key]) {
        payload[key] = formData.value[key];
      }
    });

    const response = await api.put(`/voucher/${route.params.id}`, payload);

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Voucher berhasil diperbarui',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'voucher' });
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors;
      
      // Scroll to first error field
      const firstError = Object.keys(errors.value)[0];
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui voucher',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchVoucherData);
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-6">
        <!-- Breadcrumb Navigation -->
        <nav class="flex px-1 py-3 text-gray-700" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-2">
            <li class="inline-flex items-center">
              <router-link to="/" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
                Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                </svg>
                <router-link :to="{ name: 'voucher' }" class="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2">
                  Daftar Voucher
                </router-link>
              </div>
            </li>
            <li aria-current="page">
              <div class="flex items-center">
                <svg class="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span class="ml-1 text-sm font-medium text-blue-600 md:ml-2">Edit Voucher</span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Form Card -->
        <DefaultCard cardTitle="Edit Voucher" cardSubtitle="Kosongkan field yang tidak ingin diubah">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="p-6 space-y-4">
              <!-- Nama Voucher -->
              <InputGroup
                label="Nama Voucher"
                name="nama_voucher"
                type="text"
                placeholder="Biarkan kosong jika tidak ingin diubah"
                v-model="formData.nama_voucher"
                :error="errors.nama_voucher"
                maxlength="255"
              />

              <!-- Harga Point -->
              <InputGroup
                label="Harga Point"
                name="harga_point"
                type="number"
                placeholder="Biarkan kosong jika tidak ingin diubah"
                v-model.number="formData.harga_point"
                :error="errors.harga_point"
                min="0"
              />

              <!-- Jenis Voucher -->
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  Jenis Voucher
                </label>
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio h-4 w-4 text-blue-600"
                      v-model="formData.jenis_voucher"
                      value="nominal"
                    >
                    <span class="ml-2 text-gray-700">Nominal</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio h-4 w-4 text-blue-600"
                      v-model="formData.jenis_voucher"
                      value="persen"
                    >
                    <span class="ml-2 text-gray-700">Persentase</span>
                  </label>
                </div>
                <p v-if="errors.jenis_voucher" class="mt-1 text-sm text-red-600">
                  {{ errors.jenis_voucher[0] }}
                </p>
              </div>

              <!-- Status Voucher -->
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  v-model="formData.status"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="aktif">Aktif</option>
                  <option value="kadaluarsa">Kadaluarsa</option>
                </select>
                <p v-if="errors.status" class="mt-1 text-sm text-red-600">
                  {{ errors.status[0] }}
                </p>
              </div>

              <!-- Nilai Voucher -->
              <InputGroup
                :label="formData.jenis_voucher === 'nominal' ? 'Nilai Voucher (Rp)' : 'Nilai Voucher (%)'"
                name="nilai_voucher"
                type="number"
                :placeholder="formData.jenis_voucher === 'nominal' ? 'Biarkan kosong jika tidak ingin diubah' : 'Biarkan kosong jika tidak ingin diubah'"
                v-model.number="formData.nilai_voucher"
                :error="errors.nilai_voucher"
                min="0"
                step="any"
              />

              <!-- Minimum Pembelian -->
              <InputGroup
                label="Minimum Pembelian (Rp)"
                name="min_pembelian"
                type="number"
                placeholder="Biarkan kosong jika tidak ingin diubah"
                v-model.number="formData.min_pembelian"
                :error="errors.min_pembelian"
                min="0"
                step="any"
              />

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                <router-link
                  :to="{ name: 'voucher' }"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </router-link>
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                  :disabled="isSubmitting"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </div>
          </form>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayoutAdmin>
</template>

<style scoped>
.form-radio:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
}
</style>