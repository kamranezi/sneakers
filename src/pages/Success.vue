<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { EventBus } from '../event-bus.js'

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
const router = useRouter()

onMounted(() => {
  // Проверяем аутентификацию пользователя при монтировании компонента
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь аутентифицирован
      EventBus.emit('createOrder')
      console.log('Emitting createOrder event')
    } else {
      // Пользователь не аутентифицирован
      console.log('User is not authenticated')
    }
  })
})

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="order-confirmation-page text-center p-4 mt-8 sm:mt-8 md:mt-12 lg:mt-14">
    <div class="order-success-info">
      <img src="/order-success-icon.png" alt="Order Success" class="mx-auto w-24 pt-10" />
      <h1 class="text-2xl font-bold my-4">Ваш заказ оформлен</h1>
      <p class="mb-4">Спасибо за покупку! Мы скоро свяжемся с вами для подтверждения заказа.</p>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-2"
        @click="navigateTo('/')"
      >
        В Каталог
      </button>
      <button
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full m-2"
        @click="navigateTo('/contact')"
      >
        Написать нам
      </button>
      <button
        class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full m-2"
        @click="openOrderHistory"
      >
        Открыть мои заказы
      </button>
    </div>
  </div>
  <!--  <OrdersList :items="order.items" />-->
</template>

<style>
/* Убраны кастомные стили, так как используется Tailwind CSS */
</style>
