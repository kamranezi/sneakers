<script setup>
import { onMounted, ref, watch, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, remove } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const swipeLeft = () => {
  if (currentImageIndex.value < productDetails.value.image_urls.length - 1) {
    currentImageIndex.value++
  }
}

const swipeRight = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const emit = defineEmits(['openDrawer'])
const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}
const goBack = () => {
  router.go(-1) // Или router.back();
}
// Инициализация Firebase
initializeApp(firebaseConfig)
const database = getDatabase()
const auth = getAuth() // Инициализация аутентификации Firebase

const router = useRouter()
const productId = ref(router.currentRoute.value.params.id)
const productDetails = ref({})
const unavailableSizes = ref([]) // Новая реактивная ссылка для хранения недоступных размеров

const currentImageIndex = ref(0)
const isFavorite = ref(false)
// Интеграция состояния корзины и избранного
const { cart, addToCart, removeFromCart } = inject('cart')
const isAddedToCart = computed(() => cart.value.some((item) => item.id === productId.value))

const loadProductDetails = async () => {
  try {
    const database = getDatabase()
    const productRef = dbRef(database, `items/${productId.value}`)
    const snapshot = await get(productRef)
    if (snapshot.exists()) {
      productDetails.value = snapshot.val()
      unavailableSizes.value = productDetails.value.unavailable_sizes || [] // Получаем недоступные размеры из данных продукта

      // Обновляем, используя image_urls
      productDetails.value.images = productDetails.value.image_urls.map((url, index) => ({
        imageUrl: url
      }))
    } else {
      console.error('Данные о продукте не найдены.')
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных о продукте:', error)
  }
}

onMounted(async () => {
  await loadProductDetails()

  // Проверяем состояние избранного в локальном хранилище
  const favoriteStatus = localStorage.getItem(`favorite-${productId.value}`)
  isFavorite.value = favoriteStatus === 'true'

  // Проверяем состояние избранного в базе данных
  checkIfFavorite()
})
watch(
  () => router.currentRoute.value.params.id,
  (newId) => {
    productId.value = newId
    loadProductDetails()
    checkIfFavorite()
  }
)

// Проверка, находится ли товар в избранном
const checkIfFavorite = async () => {
  const favoriteRef = dbRef(database, `favorites/${productId.value}`)
  const snapshot = await get(favoriteRef)
  isFavorite.value = snapshot.exists()
}
const isAddButtonClicked = ref(false)

const selectedSize = ref('')

const selectSize = (size) => {
  selectedSize.value = size
}
const showSizeMessage = ref(false)
const resetProductState = () => {
  selectedSize.value = ''
  showSizeMessage.value = false
}

const toggleCart = async () => {
  if (!selectedSize.value) {
    showSizeMessage.value = true // Показываем сообщение о выборе размера
    return
  }

  const itemToAdd = {
    id: productId.value,
    title: productDetails.value.title,
    imageUrl: productDetails.value.imageUrl,
    price: productDetails.value.price,
    size: selectedSize.value
  }

  // Добавление товара в Firebase
  const database = getDatabase()
  const cartRef = dbRef(database, `carts/${productId.value}`)
  await set(cartRef, itemToAdd)

  // Добавление в локальный массив корзины
  cart.value.push(itemToAdd)

  resetProductState() // Сбрасываем состояние товара
}
const toggleFavorite = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    console.error('Пользователь не авторизован')
    return
  }

  const currentFavoriteState = isFavorite.value
  const userFavoriteRef = dbRef(database, `users/${currentUser.uid}/favorites/${productId.value}`)

  try {
    if (!currentFavoriteState) {
      await set(userFavoriteRef, true) // Добавляем товар в избранное пользователя
      localStorage.setItem(`favorite-${productId.value}`, 'true')
    } else {
      await remove(userFavoriteRef) // Удаляем товар из избранного пользователя
      localStorage.removeItem(`favorite-${productId.value}`)
    }
    isFavorite.value = !currentFavoriteState
    console.log('Новое состояние избранного:', isFavorite.value)
  } catch (error) {
    console.error('Ошибка при обновлении избранного:', error)
  }
}
//
</script>

<!--Шаблон снизу-->
<template>
  <div class="flex items-center mt-5">
    <img
      @click="goBack"
      src="/back1.png"
      alt="Назад"
      class="mr-3 md:mr-3 mb-2 z-0 cursor-pointer"
    />
    <h1 class="text-xl md:text-3xl font-bold mb-2 flex-grow">
      {{ productDetails.title }}
    </h1>
  </div>
  <div class="flex flex-col lg:flex-row">
    <div class="lg:w-1/2 xl:w-3/9">
      <div class="container"></div>

      <div
        class="relative slider mb-2"
        v-touch:swipe.left="swipeLeft"
        v-touch:swipe.right="swipeRight"
      >
        <!-- Слайдер изображений с цветами -->
        <div class="relative flex-auto lg:flex-auto lg:w-1/2 xl:w-11/12">
          <div class="relative slider mb-2">
            <img
              v-if="productDetails && productDetails.image_urls"
              :src="productDetails.image_urls[currentImageIndex]"
              :alt="`Image of ${productDetails.title}`"
              class="w-full h-auto object-contain"
            />
            <!-- Точки для переключения слайдов -->
            <div class="absolute bottom-4 left-0 right-0 mx-1 flex justify-center">
              <button
                v-for="(image, index) in productDetails.images"
                :key="index"
                @click="currentImageIndex = index"
                class="p-2 mx-1 rounded-full"
                :class="{
                  'bg-blue-500': index === currentImageIndex,
                  'bg-gray-300': index !== currentImageIndex
                }"
              ></button>
            </div>
          </div>

          <!-- Плитка с уменьшенными изображениями -->
          <div class="flex overflow-x-auto mt-2">
            <img
              v-for="(url, index) in productDetails.image_urls"
              :key="index"
              :src="url"
              class="h-24 w-24 md:h-44 md:w-44 object-cover mx-1 rounded-lg cursor-pointer"
              @click="currentImageIndex = index"
            />
          </div>
        </div>
        <!-- Сайдбар с ценой и размерами US -->
      </div>
    </div>
    <div class="flex-1 lg:w-full pl-0">
      <p
        class="text-base sm:text-2xl font-semibold mb-2 mt-2"
        v-if="productDetails && productDetails.price"
      >
        Цена: ${{ productDetails.price }}
      </p>

      <h2 class="text-lg sm:text-xl font-semibold mb-2">Sizes (US):</h2>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="size in productDetails.sizes && productDetails.sizes.US"
          :key="size"
          @click="selectSize(size)"
          :disabled="unavailableSizes.includes(size)"
          class="w-20 h-8 sm:w-1/6 sm:h-12 border border-black rounded-md cursor-pointer transition-colors duration-300"
          :class="{
            'bg-blue-500 text-white': size === selectedSize,
            'hover:bg-blue-300': size !== selectedSize && !unavailableSizes.includes(size),
            'disabled-size': unavailableSizes.includes(size)
          }"
        >
          {{ size }}
        </button>
      </div>

      <!-- Кнопки действий -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          @click="toggleCart"
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full sm:w-auto"
        >
          Добавить в корзину
        </button>

        <!-- Измененное условие для сообщения о выборе размера -->
        <div
          v-if="showSizeMessage && !selectedSize"
          class="text-red-500 flex-center text-sm py-2 sm:w-auto"
        >
          Выберите размер
        </div>
        <div
          v-if="isAddedToCart && !selectedSize"
          class="text-green-500 flex-center text-sm py-2 sm:w-auto"
        >
          Товар успешно добавлен в корзину
        </div>

        <button
          v-if="!isFavorite"
          @click="toggleFavorite"
          class="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
        >
          В избранное
        </button>
        <div v-if="isFavorite" class="text-green-500 flex-center text-sm py-2 sm:w-auto">
          Товар добавлен в избранное
          <button
            @click="toggleFavorite"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full sm:w-auto"
          >
            Убрать из избранного
          </button>
        </div>
      </div>
      <div class="flex flex-wrap mt-4">
        <img
          v-for="(color, index) in productDetails.colors"
          :key="index"
          :src="color"
          class="h-12 w-12 md:h-20 md:w-20 object-cover mx-1 my-1 rounded-lg cursor-pointer"
          @click="currentImageIndex = index"
        />
      </div>
      <!-- Описание продукта -->
      <div class="description mt-4 md:max-w-3xl lg:w-4/5">
        <h2 class="text-lg sm:text-3xl font-semibold mb-3">Description:</h2>
        <p class="text-md sm:text-base mb-4" v-if="productDetails && productDetails.description">
          {{ productDetails.description }}
        </p>
      </div>
    </div>
  </div>
</template>
<style>
.disabled-size {
  opacity: 0.4;
  text-decoration: line-through; /* Перечеркивание */
}
</style>
