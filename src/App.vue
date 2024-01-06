<script setup>
import { provide, ref, watch, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import Drawer from './components/Drawer.vue'
import OrderHistory from './components/OrderHistory.vue'

import { getDatabase, ref as dbRef, set, push } from 'firebase/database'

const cart = ref([])
const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0))
const drawerOpen = ref(false)
const isOrderHistoryOpen = ref(false) // Добавлено состояние для открытия истории заказов

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
  <Drawer v-if="drawerOpen" :total-price="totalPrice" @create-order="createOrder" />
  <Header :total-price="totalPrice" @open-drawer="openDrawer" class="fixed top-0 left-0 right-0" />

  <div class="bg-white w-full m-auto rounded-xl shadow-xl p-4 md:p-8 mt-20">
    <div class="p-1 md:p-4">
      <router-view></router-view>
    </div>
  </div>
</template>
