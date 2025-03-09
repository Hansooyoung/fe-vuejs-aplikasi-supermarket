<script setup>
import { ref, defineEmits } from "vue";
import { LMap, LTileLayer, LMarker } from "vue-leaflet";

// Event untuk mengirim alamat ke parent
const emit = defineEmits(["alamat-terpilih"]);

const center = ref([-6.2088, 106.8456]); // Jakarta
const markerPosition = ref([...center.value]);

// Fungsi untuk update alamat dari koordinat
const updateAlamatDariKoordinat = async (lat, lng) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  const data = await response.json();
  if (data.display_name) {
    emit("alamat-terpilih", data.display_name); // 🔥 Kirim alamat ke parent
  }
};

// Dapatkan lokasi pengguna
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    center.value = [latitude, longitude];
    markerPosition.value = [latitude, longitude];
    updateAlamatDariKoordinat(latitude, longitude);
  },
  (error) => {
    console.error("Gagal mendapatkan lokasi", error);
  }
);

// Fungsi update marker saat peta diklik
const updateMarker = (e) => {
  markerPosition.value = [e.latlng.lat, e.latlng.lng];
  updateAlamatDariKoordinat(e.latlng.lat, e.latlng.lng);
};
</script>

<template>
  <LMap v-model:center="center" :zoom="13" style="height: 400px; width: 100%" @click="updateMarker">
    <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <LMarker :lat-lng="markerPosition" />
  </LMap>
</template>
