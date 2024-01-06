<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import OrderHistory from './OrderHistory.vue' // Убедитесь, что путь к компоненту верный
import { inject } from 'vue'
defineProps({
  totalPrice: Number,
  openOrderHistory: Function // Добавлено для вызова открытия истории заказов
})
const emit = defineEmits(['openDrawer'])
const isMenuOpen = ref(false)
const orderHistoryState = inject('orderHistory')
const toggleMenu = (event) => {
  if (event) {
    event.stopPropagation()
  }
  isMenuOpen.value = !isMenuOpen.value
}
const { isOrderHistoryOpen, closeOrderHistory } = orderHistoryState

const openOrderHistory = () => {
  isOrderHistoryOpen.value = true
  toggleMenu() // Закрыть меню после выбора пункта
}
// Закрытие меню при клике вне компонента
const handleOutsideClick = (e) => {
  const menuElement = document.querySelector('.menu-element') // класс или id вашего меню
  if (isMenuOpen.value && !menuElement.contains(e.target)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick)
})
</script>
//
<template>
  <header
    class="flex justify-between items-center border-b border-slate-400 bg-slate-50 px-4 py-2 md:px-8 md:py-4 fixed top-0 left-0 right-0 z-10"
  >
    <div class="flex items-center gap-4">
      <button
        @click="toggleMenu($event)"
        class="p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <svg
          class="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <router-link to="/"
        ><div class="flex items-center gap-4">
          <img src="/Logo1.png" alt="Logo" class="w-12 h-12" />
          <div>
            <h2 class="text-xl md:text-2xl font-bold uppercase tracking-wide">Sneakers</h2>
            <p class="text-slate-500 text-sm md:text-base">
              Originals from <img src="/icons8-сша-48.png" alt="USA flag" class="inline h-6" /> USA
            </p>
          </div>
        </div></router-link
      >
    </div>

    <ul class="flex items-center gap-2 md:gap-4">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-0.5 mr-2 md:gap-1 text-gray-500 hover:text-black"
      >
        <img src="/cart.svg" alt="Cart" class="w-6 h-6" />
        <b>${{ totalPrice }}</b>
      </li>

      <router-link to="/favorites">
        <li class="flex items-center cursor-pointer gap-1 md:gap-1 text-gray-500 hover:text-black">
          <img src="/heart.svg" alt="Favorite" class="w-6 h-6" />
          <span class="hidden sm:block">Избранное</span>
        </li>
      </router-link>

      <li class="flex items-center cursor-pointer gap-1 md:gap-1 text-gray-500 hover:text-black">
        <img src="/profile.svg" alt="Profile" class="w-6 h-6" />

        <span class="hidden sm:block">Профиль</span>
      </li>
    </ul>
    <div
      v-if="isMenuOpen"
      class="menu-element absolute z-10 top-16 left-0 bg-white rounded-r-lg shadow-md py-2 w-48"
    >
      <div
        @click="openOrderHistory"
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Мои заказы</span>
        <img src="/arrow-left.svg" alt="Orders" class="w-4 h-4 rotate-180" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Adidas</span>
        <img src="/icons8-adidas-трилистник.svg" alt="Adidas Icon" class="w-4 h-4" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Nike</span>
        <img src="/icons8-nike.svg" alt="Nike Icon" class="w-4 h-4" />
      </div>

      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Reebok</span>
        <img src="/icons8-nike.svg" alt="Reebok Icon" class="w-4 h-4" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>New Balance</span>
        <img src="/icons8-nike.svg" alt="New Balance Icon" class="w-4 h-4" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Мужские</span>
        <img src="/arrow-next.svg" alt="Orders" class="w-4 h-4" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Детские</span>
        <img src="/arrow-next.svg" alt="Orders" class="w-4 h-4" />
      </div>
      <div
        class="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
      >
        <span>Женские</span>
        <img src="/arrow-next.svg" alt="Orders" class="w-4 h-4" />
      </div>
    </div>
  </header>
  <OrderHistory v-if="isOrderHistoryOpen" />
</template>
