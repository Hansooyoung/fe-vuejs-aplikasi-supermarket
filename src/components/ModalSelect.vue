<template>
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 class="text-lg font-semibold mb-4">Pilih {{ title }}</h2>
        
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari..." 
          class="w-full p-2 border rounded mb-4"
        />
        
        <ul class="max-h-60 overflow-y-auto">
          <li 
            v-for="item in filteredItems" 
            :key="item.id" 
            @click="selectItem(item)" 
            class="p-2 cursor-pointer hover:bg-gray-200 rounded">
            {{ item.name }}
          </li>
        </ul>
        
        <button @click="closeModal" class="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">
          Tutup
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    isOpen: Boolean,
    title: String,
    items: Array,
  });
  const emit = defineEmits(['close', 'select']);
  const searchQuery = ref('');
  
  const filteredItems = computed(() => {
    return props.items.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  });
  
  const selectItem = (item) => {
    emit('select', item);
    closeModal();
  };
  
  const closeModal = () => {
    emit('close');
  };
  </script>
  