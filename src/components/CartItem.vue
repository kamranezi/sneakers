<script setup>
const emit = defineEmits(['onClickRemove'])
defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  selectedSize: String
  // Удалены неиспользуемые props и функции
})
</script>
<template>
  <div class="relative border border-slate-400 rounded-xl flex items-center gap-4 p-4">
    <img class="w-16 h-16" :src="imageUrl" :alt="title" />
    <div class="flex flex-col flex-1">
      <p class="font-medium mr-3">{{ title }}</p>
      <span class="text-sm text-gray-600">Размер: {{ selectedSize }}</span>
      <b class="flex-1">${{ price }}</b>
    </div>
    <img
      @click="emit('onClickRemove', id)"
      class="absolute top-0 right-0 mt-1 mr-1 opacity-70 hover:opacity-100 cursor-pointer transition"
      src="/close.svg"
      alt="Close"
    />
  </div>
</template>
