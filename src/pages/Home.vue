<script setup>
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as firebaseRef, onValue, set, remove } from 'firebase/database'
import { onMounted, ref, reactive, watch, computed } from 'vue'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'

const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}

// Initialize Firebase
// const app = initializeApp(firebaseConfig)

initializeApp(firebaseConfig)
const database = getDatabase()

const rawItems = ref([])
const { cart, addToCart, removeFromCart } = inject(['cart'])
const filters = reactive({
  sortBy: 'title',
  searchQuery: ''
})

const items = computed(() => {
  return rawItems.value
    .filter((item) => item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.price - b.price
        case '-price':
          return b.price - a.price
        default:
          return a.title.localeCompare(b.title)
      }
    })
})
const updateIsAddedState = () => {
  rawItems.value.forEach((item) => {
    item.isAdded = cart.value.some((cartItem) => cartItem.id === item.id)
  })
}

const fetchItems = () => {
  const itemsRef = firebaseRef(database, 'items')
  onValue(itemsRef, (snapshot) => {
    if (snapshot.exists()) {
      rawItems.value = Object.entries(snapshot.val()).map(([key, value]) => ({
        id: key,
        ...value,
        isFavorite: false
      }))
      updateIsAddedState()
    }
  })
}
const fetchFavorites = () => {
  const favoritesRef = firebaseRef(database, 'favorites')
  onValue(favoritesRef, (snapshot) => {
    if (snapshot.exists()) {
      const favorites = snapshot.val()
      items.value.forEach((item) => {
        item.isFavorite = !!favorites[item.id]
      })
    }
  })
}

onMounted(() => {
  cart.value = JSON.parse(localStorage.getItem('cart')) || []
  fetchItems()
  fetchFavorites()
  updateIsAddedState()
})

watch(
  cart,
  (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    updateIsAddedState()
  },
  { deep: true }
)

const addToFavorite = async (item) => {
  const favoriteRef = firebaseRef(database, `favorites/${item.id}`)
  item.isFavorite = !item.isFavorite
  if (item.isFavorite) {
    await set(favoriteRef, true)
  } else {
    await remove(favoriteRef)
  }
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
  // fetchItems() вызывать, если вам нужно изменить запрос к базе данных на основе сортировки
}

const onChangeSearchInput = (event) => {
  filters.searchQuery = event.target.value
  // fetchItems() вызывать, если вам нужно изменить запрос к базе данных на основе строки поиска
}

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between items-center">
    <h2 class="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Все кроссовки</h2>
    <div class="flex flex-col md:flex-row gap-3 mb-4 md:mb-0">
      <div class="relative max-w-xs">
        <img class="absolute left-3 top-1/2 -translate-y-1/2" src="/search.svg" alt="Search" />
        <input
          @input="onChangeSearchInput"
          class="border rounded-lg py-1 pl-10 pr-3 outline-none focus:border-gray-400 text-xs md:text-sm w-full"
          type="text"
          placeholder="Поиск..."
        />
      </div>
      <select
        @change="onChangeSelect"
        class="border rounded-lg py-1 px-2 outline-none focus:border-gray-400 text-xs md:text-sm max-w-xs"
      >
        <option value="name">По популярности</option>
        <option value="price">Сначала дешевые</option>
        <option value="-price">Сначала дорогие</option>
      </select>
    </div>
  </div>
  <CardList :items="items" @add-to-favorite="addToFavorite" @add-to-cart="onClickAddPlus" />
</template>
