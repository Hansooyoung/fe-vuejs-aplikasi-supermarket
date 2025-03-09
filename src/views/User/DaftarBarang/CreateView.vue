<script setup>
import api from '@/api';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DefaultCard from '@/components/Forms/DefaultCard.vue';
import InputGroup from '@/components/Auths/InputGroup.vue';
import DefaultLayoutUser from '@/layouts/DefaultLayoutUser.vue';

const router = useRouter();

// Form state
const formData = ref({
  jenis_barang_kode: '',
  nama_barang: '',
  tanggal_terima: '',
  status_barang: '',
  vendor_id: '',
});

// Error handling
const errors = ref([]);
const jenisBarangList = ref([]);
const vendorList = ref([]);
const statusOptions = ref(['baik', 'normal', 'rusak']);

// Fetch data for jenis barang and vendors
const fetchJenisBarangAndVendors = async () => {
  try {
    const [jenisBarangResponse, vendorResponse] = await Promise.all([
      api.request({ method: 'GET', url: '/jenis-barang' }),
      api.request({ method: 'GET', url: '/vendor' }),
    ]);

    jenisBarangList.value = jenisBarangResponse.data.data;
    vendorList.value = vendorResponse.data.data;
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data.', error);
  }
};

// Submit form to API
const handleSubmit = async () => {
  try {
    errors.value = [];
    const response = await api.request({
      method: 'POST',
      url: '/barang-inventaris',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      data: formData.value,
    });

    alert('Data barang berhasil ditambahkan!');
    console.log(response.data);
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

// Initialize fetch
onMounted(fetchJenisBarangAndVendors);
</script>

<template>
  <DefaultLayoutUser>
    <div class="grid">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Tambah Barang Inventaris">
          <form @submit.prevent="handleSubmit">
            <div class="p-6.5">
              <!-- Select Jenis Barang -->
              <label class="block mb-2">Jenis Barang</label>
              <select v-model="formData.jenis_barang_kode" class="w-full mb-4 p-2 border">
                <option disabled value="">Pilih Jenis Barang</option>
                <option v-for="jenis in jenisBarangList" :key="jenis.jenis_barang_kode" :value="jenis.jenis_barang_kode">
                  {{ jenis.jenis_barang_nama }}
                </option>
              </select>
              <p v-if="errors.jenis_barang_kode" class="text-sm text-red-600">{{ errors.jenis_barang_kode[0] }}</p>

              <!-- Nama Barang -->
              <InputGroup
                label="Nama Barang"
                type="text"
                placeholder="Masukkan nama barang"
                v-model="formData.nama_barang"
                customClasses="mb-4"
              />
              <p v-if="errors.nama_barang" class="text-sm text-red-600">{{ errors.nama_barang[0] }}</p>

              <!-- Tanggal Terima -->
              <InputGroup
                label="Tanggal Terima"
                type="date"
                v-model="formData.tanggal_terima"
                customClasses="mb-4"
              />
              <p v-if="errors.tanggal_terima" class="text-sm text-red-600">{{ errors.tanggal_terima[0] }}</p>

              <!-- Select Status Barang -->
              <label class="block mb-2">Status Barang</label>
              <select v-model="formData.status_barang" class="w-full mb-4 p-2 border">
                <option disabled value="">Pilih Status Barang</option>
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
              <p v-if="errors.status_barang" class="text-sm text-red-600">{{ errors.status_barang[0] }}</p>

              <!-- Select Vendor -->
              <label class="block mb-2">Vendor</label>
              <select v-model="formData.vendor_id" class="w-full mb-4 p-2 border">
                <option disabled value="">Pilih Vendor</option>
                <option v-for="vendor in vendorList" :key="vendor.id" :value="vendor.id">
                  {{ vendor.nama_vendor }}
                </option>
              </select>
              <p v-if="errors.vendor_id" class="text-sm text-red-600">{{ errors.vendor_id[0] }}</p>

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
