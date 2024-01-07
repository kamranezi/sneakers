<script setup>
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as dbRef, onValue, set, remove, update, get } from 'firebase/database'
import { onMounted, ref, reactive, watch, computed } from 'vue'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '@/firebase.js'

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
const database = getDatabase()
const auth = getAuth(app) // Инициализация auth
const { cart, addToCart, removeFromCart } = inject(['cart'])
const favorites = ref([])
const userFavorites = ref([])
const updateIsAddedState = () => {
  rawItems.value.forEach((item) => {
    item.isAdded = cart.value.some((cartItem) => cartItem.id === item.id)
  })
}
const onFavoriteClick = async (item) => {
  if (!auth.currentUser) {
    console.error('Пользователь не авторизован')
    return
  }
  const userId = auth.currentUser.uid
  const itemRef = dbRef(database, `users/${userId}/favorites/${item.id}`)
  if (item.isFavorite) {
    await remove(itemRef)
    userFavorites.value = userFavorites.value.filter((favId) => favId !== item.id)
  } else {
    await set(itemRef, true)
    userFavorites.value.push(item.id)
  }
  item.isFavorite = !item.isFavorite
}
const isLoggedIn = ref(true)
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = user
  })
})

onMounted(async () => {
  if (auth.currentUser) {
    const userId = auth.currentUser.uid
    const favoritesRef = dbRef(database, `users/${userId}/favorites`)
    onValue(favoritesRef, (snapshot) => {
      if (snapshot.exists()) {
        userFavorites.value = Object.keys(snapshot.val())
        // Теперь установите isFavorite для каждого элемента на основе userFavorites
        rawItems.value.forEach((item) => {
          item.isFavorite = userFavorites.value.includes(item.id)
        })
      } else {
        userFavorites.value = []
      }
    })
  }
})

// Функция для удаления из избранного

const loadFavoriteItems = async () => {
  const loadedItems = []
  for (const favoriteId of favorites.value) {
    const itemRef = dbRef(database, `items/${favoriteId}`)
    const itemSnapshot = await get(itemRef)
    if (itemSnapshot.exists()) {
      loadedItems.push(itemSnapshot.val())
    }
  }
  items.value = loadedItems
}
const favoritesItems = ref([]) // Если используется Vue 3

//Пагинация
const currentPage = ref(1)
const itemsPerPage = 20 // Вы можете изменить это число в зависимости от желаемого количества элементов на странице
const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return items.value.slice(start, end)
})

const goToPage = (pageNumber) => {
  currentPage.value = pageNumber
}
const rawItems = ref([])
const filters = reactive({
  sortBy: 'title',
  searchQuery: '',
  category: null
})

const selectedBrands = ref(['Adidas'])

const selectedGenders = ref(['Men', 'Women', 'Kids']) // Установите начальные значения здесь
// const selectedSizes = ref([]);
const selectedSize = ref('')
const toggleBrandSelection = (brand) => {
  const index = selectedBrands.value.indexOf(brand)
  if (index > -1) {
    selectedBrands.value.splice(index, 1) // Remove brand if it's already selected
  } else {
    selectedBrands.value.push(brand) // Add brand if it's not selected
  }
}

const items = computed(() => {
  return rawItems.value
    .filter((item) => {
      // Фильтрация по категории, если выбрана
      return filters.category ? item.category === filters.category : true
    })
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
const categories = ref([])

const fetchCategories = () => {
  const itemsRef = dbRef(database, 'items')
  onValue(itemsRef, (snapshot) => {
    if (snapshot.exists()) {
      const allItems = Object.values(snapshot.val())
      const uniqueCategories = Array.from(new Set(allItems.map((item) => item.category)))
      categories.value = uniqueCategories
    }
  })
}
const selectCategory = (category) => {
  // Handle category selection here
  filters.category = category
  console.log(`Category selected: ${category}`)
  // You might want to update the displayed items based on the selected category
}
const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item)
  } else {
    removeFromCart(item)
  }
}
const fetchItems = async () => {
  const itemsRef = dbRef(database, 'items')
  const snapshot = await get(itemsRef)
  if (snapshot.exists()) {
    rawItems.value = Object.entries(snapshot.val()).map(([key, value]) => ({
      id: key,
      ...value,
      isFavorite: userFavorites.value.includes(key)
    }))
  }
}
const emit = defineEmits(['addToFavorite'])
const addToFavorite = (item) => {
  emit('addToFavorite', item)
}
// Функция для получения избранных товаров текущего пользователя
const fetchUserFavorites = async () => {
  if (!auth.currentUser) {
    console.error('Пользователь не авторизован')
    return
  }

  const favoritesRef = dbRef(database, `users/${auth.currentUser.uid}/favorites`)
  const snapshot = await get(favoritesRef)
  if (snapshot.exists()) {
    userFavorites.value = Object.keys(snapshot.val())
  } else {
    userFavorites.value = []
  }
}
const fetchItemsAndUpdateFavorites = async () => {
  await fetchItems()
  await fetchUserFavorites()
  // Обновление флага isFavorite для каждого элемента в rawItems
  rawItems.value.forEach((item) => {
    item.isFavorite = userFavorites.value.includes(item.id)
  })
}
onMounted(() => {
  cart.value = JSON.parse(localStorage.getItem('cart')) || []
  fetchItems().then(fetchUserFavorites) // Первоначально загружаем все элементы, затем избранные
  updateIsAddedState()
  fetchCategories()
})
onMounted(async () => {
  if (auth.currentUser) {
    await fetchUserFavorites()
  }
  // Загрузите корзину и другие необходимые данные
})

watch(userFavorites, async () => {
  await fetchItems() // Перезагрузка элементов при изменении избранных
})
const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
  // fetchItems() вызывать, если вам нужно изменить запрос к базе данных на основе сортировки
}

const onChangeSearchInput = (event) => {
  filters.searchQuery = event.target.value
  // fetchItems() вызывать, если вам нужно изменить запрос к базе данных на основе строки поиска
}
</script>

<template>
  <div class="brand-filter">
    <!-- Adidas -->
    <div class="brand-option" @click="toggleBrandSelection('Adidas')">
      <input type="checkbox" id="brand-adidas" :checked="selectedBrands.includes('Adidas')" />
      <label for="brand-adidas">Adidas</label>
    </div>

    <!-- Nike -->
    <div class="brand-option" @click="toggleBrandSelection('Nike')">
      <input type="checkbox" id="brand-nike" :checked="selectedBrands.includes('Nike')" />
      <label for="brand-nike">Nike</label>
    </div>

    <!-- Reebok -->
    <div class="brand-option" @click="toggleBrandSelection('Reebok')">
      <input type="checkbox" id="brand-reebok" :checked="selectedBrands.includes('Reebok')" />
      <label for="brand-reebok">Reebok</label>
    </div>

    <!-- New Balance -->
    <div class="brand-option" @click="toggleBrandSelection('New Balance')">
      <input
        type="checkbox"
        id="brand-new-balance"
        :checked="selectedBrands.includes('New Balance')"
      />
      <label for="brand-new-balance">New Balance</label>
    </div>
  </div>
  <div class="category-scroll-container">
    <div class="category-list">
      <a
        v-for="category in categories"
        :key="category"
        @click="selectCategory(category)"
        :class="{ 'category-item-active': filters.category === category }"
        class="category-item"
      >
        {{ category }}
        <span v-if="filters.category === category" class="category-underline"></span>
      </a>
    </div>
  </div>
  <div class="flex flex-row justify-between items-center" style="border-bottom: 1px solid #ccc">
    <div class="filter-section">
      <div class="gender-filter">
        <label class="gender-option">
          <input type="checkbox" v-model="selectedGenders" value="Men" />
          Men's
        </label>
        <label class="gender-option">
          <input type="checkbox" v-model="selectedGenders" value="Women" />
          Women's
        </label>
        <label class="gender-option">
          <input type="checkbox" v-model="selectedGenders" value="Kids" />
          Kids'
        </label>
      </div>
      <div class="size-selector">
        <select v-model="selectedSize">
          <option value="">All Sizes</option>
          <option value="5">5</option>
          <option value="5.5">5.5</option>
          <option value="6">6</option>
          <option value="6.5">6.5</option>
          <option value="7">7</option>
          <option value="7.5">7.5</option>
          <option value="8">8</option>
          <option value="8.5">8.5</option>
          <option value="9">9</option>
          <option value="9.5">9.5</option>
          <option value="10">10</option>
          <option value="10.5">10.5</option>
          <option value="11">11</option>
          <option value="11.5">11.5</option>
          <option value="12">12</option>
          <option value="13">13</option>
        </select>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row mt-4 gap-2 mb-4">
      <div class="relative max-w-[200px] w-full">
        <img class="absolute left-3 top-1/2 -translate-y-1/2" src="/search.svg" alt="Search" />
        <input
          @input="onChangeSearchInput"
          class="border rounded-lg py-1 pl-8 h-8 outline-none focus:border-gray-400 text-xs md:text-sm w-full"
          type="text"
          placeholder="Поиск..."
        />
      </div>
      <select
        @change="onChangeSelect"
        class="border rounded-lg py-1 px-2 h-8 outline-none focus:border-gray-400 text-xs md:text-sm w-full max-w-[200px]"
      >
        <option value="name">По популярности</option>
        <option value="price">Сначала дешевые</option>
        <option value="-price">Сначала дорогие</option>
      </select>
    </div>
  </div>
  <CardList
    :items="paginatedItems"
    @add-to-favorite="onFavoriteClick"
    @add-to-cart="onClickAddPlus"
  />
  <div class="flex justify-center items-center space-x-2 my-4 mb-8">
    <button v-if="currentPage > 1" @click="goToPage(currentPage - 1)" class="p-2">
      <img src="/pag.png" alt="Prev" class="h-8 w-8 rotate-180" />
      <!-- Используйте перевернутое изображение pag.png -->
    </button>
    <button
      v-for="page in totalPages"
      :key="page"
      @click="goToPage(page)"
      :class="[
        'p-2 rounded-full border hover:bg-gray-200',
        { 'bg-gray-300': page === currentPage },
        'w-8 h-8 flex items-center justify-center'
      ]"
    >
      {{ page }}
    </button>
    <button v-if="currentPage < totalPages" @click="goToPage(currentPage + 1)" class="p-2">
      <img src="/pag.png" alt="Next" class="h-8 w-8" />
      <!-- Используйте ваше изображение pag.png -->
    </button>
  </div>
</template>
<style scoped>
.brand-filter {
  display: flex;
  justify-content: flex-start; /* Corrected to ensure compatibility */
  padding-bottom: 4px;
  margin-top: 18px;
  border-bottom: 2px solid #eceff1;
}

.brand-option {
  margin-right: 10px; /* Space between brand options */
  display: flex;
  align-items: center;
}

.brand-option input[type='checkbox'] {
  margin-right: 3px; /* Space between checkbox and label */
}

/* You might want to add further styles for your labels or inputs here */
</style>

<style scoped>
.category-scroll-container {
  overflow-x: auto;
  scrollbar-width: thin; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
  position: relative;
}

.category-scroll-container::-webkit-scrollbar {
  height: 2px; /* Height of the scrollbar */
  background-color: transparent; /* Optional: can be set to the page background color */
}
.category-scroll-container::-webkit-scrollbar-thumb {
  background-color: #000; /* Color of the scrollbar thumb */
  border-radius: 1px; /* Optional: if you want rounded corners */
}
.category-list {
  display: flex;
  white-space: nowrap;
  padding-bottom: 4px;
  margin-top: 2px;
  /* Adjusts the space for the invisible scrollbar */
}

.category-item {
  margin-right: 20px; /* Add spacing between items */
  cursor: pointer;
  position: relative;
}

.category-item:hover .category-underline,
.category-item.active .category-underline {
  width: 100%;
  height: 2px;
  background-color: black;
  position: absolute;
  bottom: 0;
  left: 0;
}

.category-underline {
  width: 100%;
  height: 2px;
  background-color: black;
  position: absolute;
  bottom: -2px; /* Adjust as needed */
  left: 0;
  transition: width 0.3s ease;
}
</style>
<style scoped>
.filter-section {
  display: flex;
  align-items: flex-start; /* Выравнивание элементов по верху */
  margin-top: 2px; /* Удаление верхнего отступа */
}

.gender-filter,
.size-selector {
  margin-top: -2px; /* Удаление верхнего отступа для фильтров */
}

.gender-filter {
  display: flex;
}

.gender-option {
  margin-right: 16px;
}

.size-selector {
  display: flex;
  flex-wrap: wrap;
  max-width: 300px; /* При необходимости отрегулируйте ширину */
}

.size-option input[type='checkbox'] {
  margin-right: 5px; /* Отступ справа от чекбокса */
}
.size-selector select {
  border: 1px solid #cccccc; /* Цвет и толщина границы */
  padding: 2px 12px; /* Отступы внутри селектора */
  border-radius: 4px; /* Скругление углов */
}
@media (max-width: 600px) {
  /* Предполагаемый брейкпоинт для мобильных устройств */
  .filter-section {
    flex-direction: column; /* Столбцовое расположение на мобильных устройствах */
  }

  .size-selector {
    order: 3; /* Перемещение в конец секции фильтров */
    margin-bottom: 4px;
  }
}
</style>
