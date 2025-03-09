<script setup>
import api from '@/api';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const router = useRouter();
const route = useRoute();

// Form state
const formData = ref({
  jenis_barang_kode: '',
  nama_barang: '',
  tanggal_terima: '',
  status_barang: '',
  vendor_id: '',
});

// Options for select dropdowns
const jenisBarangOptions = ref([]);
const vendorOptions = ref([]);
const statusOptions = ['baik', 'normal', 'rusak'];

// Error handling and loading state
const errors = ref([]);
const isLoading = ref(false);

// Fetch barang data
const fetchBarang = async () => {
  const kode = route.params.kode_barang;
  try {
    isLoading.value = true;
    const response = await api.request({
      method: 'GET',
      url: `/barang-inventaris/${kode}`,
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = response.data.data;
    formData.value = {
      jenis_barang_kode: data.jenis_barang_kode,
      nama_barang: data.nama_barang,
      tanggal_terima: data.tanggal_terima,
      status_barang: data.status_barang,
      vendor_id: data.vendor_id,
    };
  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan saat mengambil data barang.');
  } finally {
    isLoading.value = false;
  }
};

// Fetch jenis barang
const fetchJenisBarang = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/jenis-barang`,
      headers: {
        'Accept': 'application/json',
      },
    });

    jenisBarangOptions.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data jenis barang:', error);
  }
};

// Fetch vendor
const fetchVendor = async () => {
  try {
    const response = await api.request({
      method: 'GET',
      url: `/vendor`,
      headers: {
        'Accept': 'application/json',
      },
    });

    vendorOptions.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data vendor:', error);
  }
};

// Submit form
const handleSubmit = async () => {
  try {
    errors.value = [];
    const kode = route.params.kode_barang;

    const response = await api.request({
      method: 'PUT',
      url: `/barang-inventaris/${kode}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      data: formData.value,
    });

    alert('Data berhasil diperbarui!');
    router.push({ name: 'daftar-barang' });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors;
    } else {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  }
};

// Fetch data saat halaman dimuat
onMounted(() => {
  fetchBarang();
  fetchJenisBarang();
  fetchVendor();
});
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <!-- Form Start -->
        <DefaultCard cardTitle="Edit Barang Inventaris">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Select for Jenis Barang -->
              <div class="mb-4.5">
                <label class="block mb-1 font-medium">Jenis Barang</label>
                <select v-model="formData.jenis_barang_kode" class="w-full rounded p-2 border">
                  <option v-for="jenis in jenisBarangOptions" :key="jenis.jenis_barang_kode" :value="jenis.jenis_barang_kode">
                    {{ jenis.jenis_barang_nama }}
                  </option>
                </select>
              </div>

              <!-- Input for Nama Barang -->
              <InputGroup
                label="Nama Barang"
                type="text"
                placeholder="Masukkan nama barang"
                v-model="formData.nama_barang"
                customClasses="mb-4.5"
              />

              <!-- Input for Tanggal Terima -->
              <InputGroup
                label="Tanggal Terima"
                type="date"
                placeholder="Pilih tanggal terima"
                v-model="formData.tanggal_terima"
                customClasses="mb-4.5"
              />

              <!-- Select for Status Barang -->
              <div class="mb-4.5">
                <label class="block mb-1 font-medium">Status Barang</label>
                <select v-model="formData.status_barang" class="w-full rounded p-2 border">
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </div>

              <!-- Select for Vendor -->
              <div class="mb-4.5">
                <label class="block mb-1 font-medium">Vendor</label>
                <select v-model="formData.vendor_id" class="w-full rounded p-2 border">
                  <option v-for="vendor in vendorOptions" :key="vendor.id" :value="vendor.id">
                    {{ vendor.nama_vendor }}
                  </option>
                </select>
              </div>

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
