<script setup>
import { onMounted } from 'vue'
import Card from './Card.vue'
import { remove } from 'firebase/database'

const props = defineProps({
  items: Array
})
const emit = defineEmits(['addToFavorite', 'addToCart'])

// Добавление вывода в консоль для отладки
onMounted(() => {
  console.log(props.items)
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4" v-auto-animate>
    <Card
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :title="item.title"
      :imageUrl="item.imageUrl"
      :price="item.price"
      :on-favorite-click="() => emit('addToFavorite', item)"
      :on-add-click="() => emit('addToCart', item)"
      :is-favorite="item.isFavorite"
      :is-added="item.isAdded"
    />
  </div>
</template>
<style>
/* CSS для отключения анимации на мобильных устройствах */
@media only screen and (max-width: 768px) {
  /* измените значение max-width по вашему усмотрению */
  .grid[v-auto-animate] {
    /* Здесь вы можете переопределить или полностью отключить анимацию */
    animation: none !important;
  }
}
.grid {
  column-gap: 5px; /* Здесь вы можете указать нужный размер просвета */
}
</style>
