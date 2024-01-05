<script setup>
import { onMounted, ref, watch } from 'vue'
import { getDatabase, ref as dbRef, get, remove, set } from 'firebase/database'
import CardList from '@/components/CardList.vue'
import { inject } from 'vue'
import { initializeApp } from 'firebase/app'

const items = ref([])
const { cart, addToCart, removeFromCart } = inject(['cart'])
const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}

// Инициализация Firebase
initializeApp(firebaseConfig)

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}

const handleFavoriteClick = async (item) => {
  const database = getDatabase()
  const favoriteRef = dbRef(database, `favorites/${item.id}`)

  if (item.isFavorite) {
    await remove(favoriteRef)
  } else {
    await set(favoriteRef, true)
  }
  item.isFavorite = !item.isFavorite
  if (!item.isFavorite) {
    // Обновляем список элементов после удаления
    items.value = items.value.filter((i) => i.id !== item.id)
  }
}

const onClickRemove = async (item) => {
  await handleFavoriteClick(item) // Используем ту же логику для удаления из избранного
}

onMounted(async () => {
  const database = getDatabase()
  cart.value = JSON.parse(localStorage.getItem('cart')) || []

  const itemsRef = dbRef(database, 'items')
  const itemsSnapshot = await get(itemsRef)
  let allItems = {}

  if (itemsSnapshot.exists()) {
    allItems = itemsSnapshot.val()
  }

  const favoritesRef = dbRef(database, 'favorites')
  const favoritesSnapshot = await get(favoritesRef)
  let favoriteIds = []

  if (favoritesSnapshot.exists()) {
    favoriteIds = Object.keys(favoritesSnapshot.val())
  }

  items.value = Object.entries(allItems)
    .filter(([key]) => favoriteIds.includes(key))
    .map(([key, value]) => ({
      id: key,
      ...value,
      isFavorite: favoriteIds.includes(key),
      isAdded: cart.value.some((cartItem) => cartItem.id === key)
    }))
})

watch(
  cart,
  () => {
    localStorage.setItem('cart', JSON.stringify(cart.value))
  },
  { deep: true }
)
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Избранное</h2>
    <div v-if="items.length === 0" class="text-center transition-opacity duration-700" key="empty">
      <h3 class="text-lg font-medium mb-4">Здесь пока пусто</h3>
      <img
        src="https://i.ibb.co/cbtNyW2/DALL-E-2024-01-03-14-26-46-A-pair-of-legs-wearing-jeans-standing-on-a-street-with-transparent-outlin.png"
        alt="Пусто"
        class="mx-auto opacity-40"
      />
    </div>
    <transition-group name="list" tag="div" class="list" v-else>
      <CardList
        :items="items"
        @add-to-favorite="handleFavoriteClick"
        @add-to-cart="onClickAddPlus"
        @remove-from-cart="onClickRemove"
        key="favorites-list"
      />
    </transition-group>
  </div>
</template>
