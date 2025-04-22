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
  nama_voucher: '',
  harga_point: 0,
  jenis_voucher: 'diskon',
  status: 'aktif',
  nilai_voucher: 0,
  min_pembelian: 0,
});

const errors = ref([]);

const handleSubmit = async () => {
  try {
    errors.value = [];

    const response = await api.request({
      method: 'POST',
      url: '/voucher',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Voucher berhasil dibuat.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1d4ed8',
    });

    router.push({ name: 'voucher' });
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
</script>

<template>
  <DefaultLayoutAdmin>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tambah Voucher">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nama Voucher -->
              <InputGroup
                label="Nama Voucher"
                type="text"
                placeholder="Masukkan Nama Voucher"
                v-model="formData.nama_voucher"
                required
              />

              <!-- Harga Point -->
              <InputGroup
                label="Harga Point"
                type="number"
                placeholder="Masukkan Harga Point"
                v-model="formData.harga_point"
                min="0"
                required
              />

              <!-- Jenis Voucher -->
              <div class="mb-4.5">
                <label class="mb-2.5 block text-black dark:text-white">
                  Jenis Voucher <span class="text-meta-1">*</span>
                </label>
                <select
                placeholder="Pilih Jenis Voucher"
                  v-model="formData.jenis_voucher"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="persen">Diskon Persentase</option>
                  <option value="nominal">Diskon Nominal</option>
                </select>
              </div>

              <!-- Status -->
              <div class="mb-4.5">
                <label class="mb-2.5 block text-black dark:text-white">
                  Status <span class="text-meta-1">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                >
                  <option value="aktif">Aktif</option>
                  <option value="kadaluarsa">Tidak Aktif</option>
                </select>
              </div>

              <!-- Nilai Voucher -->
              <InputGroup
                label="Nilai Voucher"
                type="number"
                placeholder="Masukkan Nilai Voucher"
                v-model="formData.nilai_voucher"
                min="0"
                step="0.01"
                required
              />

              <!-- Minimal Pembelian -->
              <InputGroup
                label="Minimal Pembelian"
                type="number"
                placeholder="Masukkan Minimal Pembelian"
                v-model="formData.min_pembelian"
                min="0"
                step="0.01"
                required
              />

              <!-- Submit Button -->
              <button
                type="submit"
                class="col-span-full flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
              >
                Simpan Voucher
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