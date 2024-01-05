<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { getDatabase, ref as dbRef, get } from 'firebase/database'

// Удаляем isAdded и onAddClick из props
const props = defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  isFavorite: Boolean,
  onFavoriteClick: Function
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
    class="relative bg-white border border-slate-100 rounded-2xl md:p-3 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
    @click="goToProductDetails"
  >
    <div class="flex-grow">
      <img
        @click.stop="onFavoriteClick"
        :src="!props.isFavorite ? '/like-1.svg' : '/like-2.svg'"
        alt="like"
        class="absolute top-3.5 left-3.5 w-8 h-8 sm:w-6 sm:h-6 md:w-8 md:h-8"
      />
      <img :src="props.imageUrl" alt="Sneaker" class="w-full" />
      <p>{{ props.title }}</p>
      <div class="text-sm text-gray-500 mb-3">8 цветов доступно</div>
    </div>
    <div class="flex justify-between items-center mt-3">
      <b class="text-lg sm:text-xl">${{ props.price }}</b>
    </div>
  </div>
</template>
