import './assets/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import Home from './pages/Home.vue'
import Favorites from './pages/Favorites.vue'
import ProductDetails from './pages/ProductDetails.vue' // Импортируйте новый компонент
import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
const app = createApp(App)
import Vue3TouchEvents from 'vue3-touch-events'

app.use(Vue3TouchEvents)
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/favorites', name: 'Favorites', component: Favorites },
  { path: '/product/:id', name: 'ProductDetails', component: ProductDetails } // Добавьте новый маршрут
]
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // всегда скроллить вверх при смене маршрутов
    return { top: 0 }
  }
})
app.use(VueTelInput)

app.use(router)
app.use(autoAnimatePlugin)
app.mount('#app')
// if (window.Telegram?.WebApp) {
//   // Обработка события кнопки "Назад" Telegram Web App
//   Telegram.WebApp.onEvent('backButton', () => {
//     // Используем историю роутера Vue для навигации назад
//     if (router.currentRoute.value.name !== 'Home') {
//       router.back()
//     } else {
//       // Если мы находимся на главной странице, закрываем веб-приложение
//       Telegram.WebApp.close()
//     }
//   })
// }
