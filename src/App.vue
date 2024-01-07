<script setup>
import { provide, ref, watch, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import Drawer from './components/Drawer.vue'
import Profile from './components/Profile.vue'
import { initializeApp } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

import OrderHistory from './components/OrderHistory.vue'
import { getDatabase, ref as dbRef, set, push, get, update } from 'firebase/database'
import LoginModal from './components/LoginModal.vue'

// Учетные данные для конфигурации вашего Firebase проекта
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
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
// Получение экземпляра базы данных Firebase
const database = getDatabase(app)
// const toggleMode = () => {
//   isLoginMode.value = !isLoginMode.value
// }

const showLoginModal = ref(false)

const cart = ref([])
const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0))
const drawerOpen = ref(false)
const isOrderHistoryOpen = ref(false) // Добавлено состояние для открытия истории заказов
const isProfileOpen = ref(false) // Инициализация isProfileOpen

const addToCart = async (item) => {
  const database = getDatabase()
  // Создаём новую запись в 'carts' и получаем уникальный ключ
  const newCartItemRef = push(dbRef(database, 'carts'))

  // Записываем данные товара, используя уникальный ключ
  await set(newCartItemRef, {
    realItemId: item.id, // Сохраняем реальный ID товара, это значение остается неизменным
    title: item.title,
    imageUrl: item.imageUrl,
    price: item.price,
    size: item.size
  })

  // Обновляем локальное состояние корзины
  cart.value.push({
    ...item,
    cartItemId: newCartItemRef.key // Добавляем уникальный идентификатор позиции в корзине
  })

  // Сохраняем обновленное состояние корзины в localStorage
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

const removeFromCart = (item) => {
  const itemIndex = cart.value.findIndex((cartItem) => cartItem.id === item.id)
  if (itemIndex > -1) {
    cart.value.splice(itemIndex, 1)
  }
}
function closeOrderHistory() {
  isOrderHistoryOpen.value = false
}
function openOrderHistory() {
  isOrderHistoryOpen.value = true
}
const closeDrawer = () => {
  drawerOpen.value = false
}

const closeProfile = () => {
  isProfileOpen.value = false
}
const openDrawer = () => {
  drawerOpen.value = true
}
const createOrder = async () => {
  if (cart.value.every((item) => item.size)) {
    const database = getDatabase()
    const ordersRef = dbRef(database, 'orders')
    const newOrderRef = push(ordersRef) // Получаем новую ссылку для заказа

    const order = {
      items: cart.value,
      totalPrice: totalPrice.value,
      createdAt: Date.now()
    }

    try {
      await set(newOrderRef, order)
      // Остальная логика после создания заказа...
      cart.value = []
      localStorage.removeItem('cart')
    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
    }
  } else {
    console.error('Размер для всех товаров должен быть выбран')
  }
}
watch(
  cart,
  (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
  },
  { deep: true }
)

provide('cart', {
  cart,
  closeDrawer,
  openDrawer,
  addToCart,
  removeFromCart
})
provide('orderHistory', {
  isOrderHistoryOpen,
  closeOrderHistory,
  openOrderHistory
})
onMounted(() => {
  const storedCart = localStorage.getItem('cart')
  if (storedCart) {
    cart.value = JSON.parse(storedCart)
    // Важно, чтобы в localStorage была сохранена полная информация о каждом товаре в корзине, включая уникальные идентификаторы Firebase
  }
})
</script>

<template>
  <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />

  <Drawer v-if="drawerOpen" :total-price="totalPrice" @create-order="createOrder" />
  <Header :total-price="totalPrice" @open-drawer="openDrawer" />
  <Profile v-if="isProfileOpen" :close-profile="closeProfile" />

  <div class="bg-white w-full m-auto rounded-xl shadow-xl p-4 mt-14">
    <div class="md:p-0.5">
      <router-view></router-view>
    </div>
  </div>
</template>
