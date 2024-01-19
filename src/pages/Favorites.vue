<script setup>
import { onMounted, ref, watch } from 'vue'
import { getDatabase, ref as dbRef, get, remove, set, onValue } from 'firebase/database'
import CardList from '../components/CardList.vue'
import { inject } from 'vue'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth()
const items = ref([])
const { cart, addToCart, removeFromCart } = inject(['cart'])
const favorites = ref([])

const isLoggedIn = ref(true)

const handleFavoriteClick = async (item) => {
  if (!auth.currentUser) {
    console.error('Пользователь не авторизован')
    return
  }

  const userId = auth.currentUser.uid
  const favoriteRef = dbRef(database, `users/${userId}/favorites/${item.id}`)

  if (item.isFavorite) {
    // Удаляем элемент из избранного в профиле пользователя
    await remove(favoriteRef)
    // Обновляем локальное состояние
    favorites.value = favorites.value.filter((favId) => favId !== item.id)
  } else {
    // Добавляем элемент в избранное в профиле пользователя
    await set(favoriteRef, true)
    // Обновляем локальное состояние
    favorites.value.push(item.id)
  }
  // Обновляем флаг избранного для элемента
  item.isFavorite = !item.isFavorite
}

const onClickRemove = async (item) => {
  await handleFavoriteClick(item) // Используем ту же логику для удаления из избранного
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = user
  })
})

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    isLoggedIn.value = !!user
    if (user) {
      const favoritesRef = dbRef(database, `users/${user.uid}/favorites`)
      onValue(favoritesRef, async (snapshot) => {
        if (snapshot.exists()) {
          const favoriteIds = Object.keys(snapshot.val())
          // Загрузите данные товаров для каждого ID
          await loadFavoriteItems(favoriteIds)
        } else {
          items.value = []
        }
      })
    }
  })
})
const loadFavoriteItems = async (favoriteIds) => {
  const loadedItems = []
  for (const favoriteId of favoriteIds) {
    const itemRef = dbRef(database, `items/${favoriteId}`)
    const itemSnapshot = await get(itemRef)
    if (itemSnapshot.exists()) {
      // Помимо данных товара, добавляем поле isFavorite для управления отображением
      const itemData = itemSnapshot.val()
      loadedItems.push({ ...itemData, isFavorite: true })
    }
  }
  items.value = loadedItems
}
watch(
  cart,
  () => {
    localStorage.setItem('cart', JSON.stringify(cart.value))
  },
  { deep: true }
)
// watch(favorites, loadFavoriteItems, { immediate: true })
</script>

<template>
  <div>
    <h2 class="text-2xl mt-6 font-bold mb-6">Избранное</h2>
    <div v-if="items.length === 0" class="text-center transition-opacity duration-700" key="empty">
      <h3 class="text-lg font-medium mb-4">Здесь пока пусто</h3>
      <img
        src="https://i.ibb.co/cbtNyW2/DALL-E-2024-01-03-14-26-46-A-pair-of-legs-wearing-jeans-standing-on-a-street-with-transparent-outlin.png"
        alt="Пусто"
        class="mx-auto opacity-40"
        style="max-width: 90%; height: auto"
      />
    </div>
    <transition-group name="list" tag="div" class="list" v-else>
      <CardList
        :items="items"
        @add-to-favorite="handleFavoriteClick"
        @remove-from-cart="onClickRemove"
        key="favorites-list"
      />
    </transition-group>
  </div>
</template>
<style scoped>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .list {
    grid-template-columns: 1fr;
    /* Одна колонка на маленьких экранах */
  }
}

.text-2xl {
  font-size: 1.5rem; /* Меньше размер шрифта на мобильных устройствах */
}

@media (min-width: 768px) {
  .text-2xl {
    font-size: 2rem; /* Больше размер шрифта на планшетах и выше */
  }
}

/* Дополнительные стили для адаптации других элементов */
</style>
