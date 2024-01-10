<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { getDatabase, ref as dbRef, get } from 'firebase/database'

// Удаляем isAdded и onAddClick из props
const props = defineProps({
  id: Number,
  title: String,
  brand: String,
  category: String,
  imageUrl: String,
  colors: Array,
  price: Number,
  isFavorite: Boolean,
  onFavoriteClick: Function
})
const colorsCount = computed(() => {
  return productDetails.value.colors?.length > 0
    ? `${productDetails.value.colors.length} цветов доступно`
    : 'Уточняйте по размерам'
})
const router = useRouter()
const goToProductDetails = () => {
  router.push(`/product/${props.id}`)
}

const productDetails = ref({
  title: '',
  imageUrl: '',
  price: '',
  description: ''
})

onMounted(async () => {
  const database = getDatabase()
  const productRef = dbRef(database, `items/${props.id}`)
  const snapshot = await get(productRef)
  if (snapshot.exists()) {
    productDetails.value = snapshot.val()
  } else {
    console.error('Данные о продукте не найдены.')
  }
})
</script>
<template>
  <div
    class="relative bg-white border border-slate-100 rounded-b-lg cursor-pointer transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
    @click="goToProductDetails"
  >
    <div class="flex-grow">
      <img
        @click.stop="onFavoriteClick"
        :src="!props.isFavorite ? '/like-1.svg' : '/like-2.svg'"
        alt="like"
        class="absolute bottom-1 right-1 w-8 h-8 border border-red-200 rounded-md md:w-10 md:h-10"
      />
      <div class="w-full relative pb-[100%]">
        <img
          :src="props.imageUrl"
          alt="Sneaker"
          :class="{
            'absolute w-full h-full object-cover object-top left-0 top-0': true,
            'mirror-image': props.brand === 'vans'
          }"
        />
      </div>
      <p class="ml-1">{{ props.title }}</p>
      <div class="text-sm ml-1 mb-0.5 text-gray-500">{{ colorsCount }}</div>
    </div>
    <div class="flex justify-between">
      <b class="text-lg ml-1 mb-1 sm:text-xl">${{ props.price }}</b>
    </div>
  </div>
</template>
<style>
.mirror-image {
  transform: scaleX(-1);
}
</style>
