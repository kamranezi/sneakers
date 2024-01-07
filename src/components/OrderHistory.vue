<template>
  <div class="max-w-4xl mx-auto bg-white shadow overflow-hidden sm:rounded-md">
    <h2 class="text-2xl font-bold p-6">История заказов</h2>
    <ul class="divide-y divide-gray-200">
      <li v-for="order in orders" :key="order.id">
        <div class="block hover:bg-gray-50">
          <div class="px-8 py-3">
            <div class="flex flex-col sm:flex-row justify-between">
              <div>
                <p class="text-lg font-medium text-indigo-600 mb-1">Заказ №{{ order.id }}</p>
                <p
                  class="mt-1 inline-flex text-sm leading-5 font-semibold rounded-md bg-green-100 text-green-800"
                >
                  Доставлен
                </p>
              </div>
              <div class="mt-2 sm:mt-0">
                <p class="text-lg text-gray-500">{{ order.createdAt }}</p>
                <p class="text-lg font-medium text-gray-500">${{ order.totalPrice }}</p>
                <p class="text-lg text-gray-500">{{ order.items.length }} товаров</p>
              </div>
            </div>
          </div>
          <OrdersList :items="order.items" />
        </div>
      </li>
    </ul>
    <button
      @click="closeOrderHistory"
      class="mt-4 mb-2 w-1/2 ml-4 bg-indigo-600 text-white font-medium p-2 hover:bg-indigo-700 rounded-lg transition duration-300 ease-in-out"
    >
      Закрыть
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { getDatabase, ref as dbRef, onValue } from 'firebase/database'
import OrdersList from '@/components/OrdersList.vue'
import { getAuth } from 'firebase/auth' // Импортируем getAuth для получения текущего пользователя

// Inject the authentication state
const auth = getAuth() // Инициализируем auth
const orders = ref([])
const orderHistoryState = inject('orderHistory')
const { closeOrderHistory } = orderHistoryState

onMounted(() => {
  const database = getDatabase()
  const currentUser = auth.currentUser // Получаем текущего пользователя

  if (currentUser) {
    const userOrdersRef = dbRef(database, `users/${currentUser.uid}/orders`) // Путь к заказам конкретного пользователя

    onValue(userOrdersRef, (snapshot) => {
      const data = snapshot.val()
      const loadedOrders = []

      for (const id in data) {
        loadedOrders.push({
          id,
          ...data[id],
          createdAt: new Date(data[id].createdAt).toLocaleDateString() // Format the date
        })
      }

      orders.value = loadedOrders
    })
  }
})
</script>
