<template>
  <div class="max-w-2xl m-2">
    <ul>
      <li v-for="(item, index) in items" :key="index" class="border-b border-gray-200">
        <div class="flex items-start p-2 hover:bg-gray-50">
          <img :src="item.imageUrl" alt="" class="h-20 w-20 object-cover flex-start" />
          <div class="flex flex-col flex-grow ml-4">
            <h3 class="text-lg font-semibold">{{ item.title }}</h3>
            <p class="text-lg font-semibold my-1">${{ item.price }}</p>
            <p class="text-sm text-gray-500">Размер: {{ item.size }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
defineProps({
  items: Array
})
</script>
