<script setup>
import { onMounted, ref, watch, provide, nextTick } from 'vue'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup
} from 'firebase/auth'
import { getDatabase, ref as dbRef, set, push, get, update } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    // Пользователь успешно вошел через Google
    // Здесь вы можете добавить логику после успешного входа
    console.log(result.user)
    // После успешного входа можно закрыть модальное окно входа
  } catch (error) {
    console.error('Ошибка входа через Google:', error)
  }
}
const customerPhotoUrl = ref('/tg.png') // Инициализация пустой строки для URL фотографии

// Вызовите этот метод каждый раз, когда customerPhotoUrl обновляется

const isLoggedIn = ref(false)
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = user
  })
})
const script = document.createElement('script')
onMounted(() => {
  window.onTelegramAuth = onTelegramAuth

  loadTelegramWidget() // Вызов функции загрузки виджета
})
function loadTelegramWidget() {
  const container = document.getElementById('telegram-button-container')
  if (container) {
    container.innerHTML = '' // Очистка контейнера

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', 'WorldSpawnBot')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true

    container.appendChild(script)
  } else {
    console.error('Container not found')
  }
}

const authenticateUserOnClick = async () => {
  // Получите user_id и username из параметров URL
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('user_id')
  const username = urlParams.get('username')

  console.log('UserID из URL:', userId, 'Username из URL:', username)

  // Проверяем, получены ли userId и username
  if (userId && username) {
    const requestBody = {
      user: {
        id: userId,
        username: username
      }
    }
    console.log('Отправляемый JSON:', requestBody)

    try {
      // Отправляем данные на сервер и получаем кастомный токен
      const response = await fetch(
        'https://us-central1-servertg-709f6.cloudfunctions.net/app/receive-telegram-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )
      const data = await response.json()
      if (data.customToken) {
        // Аутентификация пользователя с полученным кастомным токеном
        const userCredential = await signInWithCustomToken(auth, data.customToken)
        console.log('Пользователь успешно аутентифицирован')
        const firebaseUid = userCredential.user.uid
        const name = username.split('@')[0] // Извлекаем имя из username

        // Записываем name в Firebase, используя UID
        const userRef = dbRef(database, `users/${firebaseUid}`)
        await update(userRef, { name: name })

        console.log('Имя пользователя записано в Firebase')
        // Вы можете перенаправить пользователя на домашнюю страницу или выполнить другие действия после аутентификации
      }
    } catch (error) {
      console.error('Ошибка при запросе данных пользователя или аутентификации:', error)
      // Обработайте ошибки, связанные с запросом к серверу
    }
  } else {
    console.log('User ID или Username не найдены в параметрах URL')
    // Обработайте случай, когда userId или username не были переданы в параметрах URL
  }
}
// Функция, которая будет вызываться при успешной аутентификации через Telegram
function onTelegramAuth(userData) {
  console.log('Telegram auth callback с данными пользователя:', userData)

  // Предполагается, что username уже содержится в userData
  const username = userData.username
  const photoUrl = userData.photo_url // Предполагается, что фото доступно как 'photo_url'
  // Извлечение username из данных Telegram

  sendUserDataToServer({ user: userData }) // Отправляем данные пользователя на сервер
    .then((response) => {
      console.log('Ответ сервера:', response)
      if (response.customToken) {
        // Аутентификация в Firebase с использованием кастомного токена
        authenticateUserWithCustomToken(response.customToken, username, photoUrl) // Передаем username и photoUrl
      }
      // Здесь можно добавить дополнительную логику обработки ответа сервера
    })
    .catch((error) => {
      console.error('Ошибка при отправке данных пользователя на сервер:', error)
    })
} // Функция для отправки данных пользователя на сервер
async function sendUserDataToServer(data) {
  try {
    const response = await fetch(
      'https://us-central1-servertg-709f6.cloudfunctions.net/app/receive-telegram-data',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    )
    return await response.json()
  } catch (error) {
    throw error
  }
}

function authenticateUserWithCustomToken(customToken, username, photoUrl) {
  signInWithCustomToken(auth, customToken)
    .then((userCredential) => {
      console.log('Пользователь успешно аутентифицирован:', userCredential.user)
      // Дополнительная логика после успешной аутентификации, например, сохранение username
      return update(dbRef(database, `users/${userCredential.user.uid}`), {
        name: username,
        photo: photoUrl,
        gender: customerGender.value,
        age: customerAge.value,
        size: parseInt(customerShoeSize.value), // Преобразование в число
        brand: customerFavoriteBrand.value,
        format: selectedSizeFormat.value
        // photo: photoUrl // Сохраняем URL фотографии
      })
    })
    .then(() => {
      console.log('Username успешно сохранен в Firebase')
    })
    .catch((error) => {
      console.error('Ошибка аутентификации с кастомным токеном или при сохранении username:', error)
    })
} // Установка функции обратного вызова в глобальное окно

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase()
const email = ref('')
const password = ref('')
const notificationMessage = ref('') // Для хранения сообщения уведомления
const customerName = ref('')
const customerEmail = ref('')
const customerGender = ref('Gender')
const customerAge = ref('')
const customerShoeSize = ref('')
const customerFavoriteBrand = ref('')
const customerShoeFormat = ref('')
const favorites = ref([])
const sizes = {
  EU: [
    35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44,
    44.5, 45, 45.5, 46, 46.5, 47, 47.5, 48
  ],
  US: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13]
}

const selectedSizeFormat = ref('') // начальное значение
const availableSizes = ref(sizes[selectedSizeFormat.value])

const loginUser = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    console.log('Logged in:', userCredential.user)
    notificationMessage.value = 'Вы успешно вошли в систему!'
    setTimeout(() => (notificationMessage.value = ''), 3000) // Очистка уведомления через 3 секунды

    // Уведомление об успешном входе
  } catch (error) {
    console.error('Login error:', error)
  }
}
const register = async () => {
  console.log('Attempting to register:', email.value, password.value)
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    console.log('User registered:', userCredential.user)

    // Создание профиля пользователя с сохранением email
    try {
      await set(dbRef(database, `users/${userCredential.user.uid}`), {
        name: '',
        email: email.value, // Сохраняем email
        gender: '',
        age: '',
        size: '',
        brand: '',
        format: '',
        favorites: [], // Инициализация пустого массива для избранного
        orders: []
      })
      console.log('User profile created')
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  } catch (error) {
    console.error('Registration error:', error)
  }
}

const updateProfile = async () => {
  if (!auth.currentUser) {
    console.error('Пользователь не авторизован')
    return
  }

  const updateData = {
    name: customerName.value,
    email: auth.currentUser.email, // Используйте email из учетных данных пользователя
    gender: customerGender.value,
    age: customerAge.value,
    size: parseInt(customerShoeSize.value), // Преобразование в число
    brand: customerFavoriteBrand.value,
    format: selectedSizeFormat.value,
    photo: customerPhotoUrl.value
  }

  try {
    await update(dbRef(database, `users/${auth.currentUser.uid}`), updateData)
    console.log('Профиль обновлен')
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
  }
}

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    isLoggedIn.value = !!user
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`)

      // Получение данных пользователя
      const userSnapshot = await get(userRef)
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()
        customerPhotoUrl.value = userData.photo || '/tg.png'
        selectedSizeFormat.value = userData.format || 'EU' // Установите значение по умолчанию, если оно отсутствует
        customerShoeSize.value = userData.size ? String(userData.size) : '36'
        // Пример значения по умолчанию
        console.log('Размер обуви:', customerShoeSize.value) // Обновление URL фотографии

        console.log('Полученные данные пользователя:', userData) // Добавьте эту строку для отладки

        // Обновление данных профиля
        customerName.value = userData.name || ''
        customerEmail.value = userData.email || ''
        customerGender.value = userData.gender || ''
        customerAge.value = userData.age || ''
        customerFavoriteBrand.value = userData.brand || ''

        // Получение и вывод избранных ID товаров пользователя
        if (userData.favorites && userData.favorites.length > 0) {
          favorites.value = userData.favorites
          console.log('Избранные ID товаров:', favorites.value)
        }
      }
    }
  })
})

// Выход пользователя
const logoutUser = async () => {
  try {
    await signOut(auth)
    console.log('Logged out')
    loadTelegramWidget() // Перезагрузка виджета

    notificationMessage.value = 'Вы вышли из системы, для покупок авторизуйтесь'
    setTimeout(() => (notificationMessage.value = ''), 4000)

    // Уведомление об успешном выходе
  } catch (error) {
    console.error('Logout error:', error)
    notificationMessage.value = 'Ошибка выхода: ' + error.message // Уведомление об ошибке
  }
}
const changeSizeFormat = () => {
  availableSizes.value = sizes[selectedSizeFormat.value]
}
watch(selectedSizeFormat, () => {
  changeSizeFormat()
})
const customerShoeSizeCm = ref('')
function convertSizeToCm(size, format) {
  if (size === undefined || format === undefined) {
    return null
  }

  // Задаем известные соответствия размеров и сантиметров
  const sizeConversion = {
    EU: {
      baseSize: 47.5, // Базовый размер для EU
      baseCm: 31 // Базовый размер в см для EU
    },
    US: {
      baseSize: 13, // Базовый размер для US мужской обуви
      baseCm: 31 // Базовый размер в см для US мужской обуви
    }
  }

  // Определяем шаг изменения размера для EU и US
  const euSizeStep = 2 / 3 // EU размер увеличивается на 2/3 см за каждый пункт
  const usSizeStep = 1 // US размер увеличивается на 1 см за каждый пункт

  let sizeInCm

  if (format === 'EU') {
    sizeInCm = sizeConversion.EU.baseCm + (size - sizeConversion.EU.baseSize) * euSizeStep
  } else if (format === 'US') {
    sizeInCm = sizeConversion.US.baseCm + (size - sizeConversion.US.baseSize) * usSizeStep
  } else {
    return null
  }

  return sizeInCm.toFixed(1) // Округление до одного десятичного знака
}
watch([() => customerShoeSize.value, () => selectedSizeFormat.value], () => {
  customerShoeSizeCm.value = convertSizeToCm(customerShoeSize.value, selectedSizeFormat.value)
})
const props = defineProps({
  closeProfile: Function
})
</script>
<template>
  <div class="fixed inset-0 bg-black opacity-70 z-10 hidden sm:block"></div>

  <div class="fixed top-0 right-0 h-full w-96 bg-white z-40 p-8 overflow-y-auto">
    <div class="flex items-center gap-5 mb-4">
      <!-- Кнопка входа через Telegram (если она у вас есть) -->
      <!-- <button @click="loginWithTelegram">Войти через Telegram</button> -->

      <img
        @click="closeProfile"
        src="/arrow-left.svg"
        alt="Back"
        class="w-8 h-8 cursor-pointer opacity-40 hover:opacity-100 mr-2"
      />
      <h2 class="text-2xl font-bold">Профиль</h2>

      <!-- Отображение фотографии пользователя, если она существует -->
      <img
        v-if="customerPhotoUrl"
        :src="customerPhotoUrl"
        alt="Profile Photo"
        class="w-10 h-10 rounded-full ml-2 hover:opacity-80 cursor-pointer"
        @click="authenticateUserOnClick"
      />
    </div>

    <div class="profile-form">
      <h3 class="text-lg font-medium my-4">Ваша информация:</h3>

      <input
        type="text"
        placeholder="Name"
        class="form-input w-1/2 rounded-lg border border-gray-300 mb-4 p-2 mr-4"
        v-model="customerName"
      />
      <select
        class="form-input mr-5 rounded-lg border border-gray-300 mb-4 p-2 smaller-select"
        v-model="customerGender"
      >
        <option value="Gender" disabled selected>Пол</option>
        <option value="male">Мужской</option>
        <option value="female">Женский</option>
        <!-- Другие опции, если нужно -->
      </select>

      <!--      <div>-->
      <!--        <label for="customerAge">Ваш возраст:</label>-->
      <!--        <input-->
      <!--          id="customerAge"-->
      <!--          type="number"-->
      <!--          placeholder="Возраст"-->
      <!--          class="w-1/6 rounded-lg ml-2 border border-gray-300 mb-4 p-2"-->
      <!--          v-model="customerAge"-->
      <!--        />-->
      <!--      </div>-->
      <div>
        <label for="customerFavoriteBrand">Любимый бренд:</label>
        <select
          v-model="customerFavoriteBrand"
          class="form-input w-1/3 ml-2 rounded-lg border border-gray-300 mb-4 p-2"
        >
          <option value="Adidas">Adidas</option>
          <option value="Nike">Nike</option>
          <option value="Reebok">Reebok</option>
          <option value="New Balance">New Balance</option>
        </select>
      </div>
      <div>
        <label for="customerShoeFormat">Формат размера:</label>
        <select
          id="customerShoeFormat"
          v-model="selectedSizeFormat"
          @change="changeSizeFormat"
          class="form-select w-1/5 ml-2 rounded-lg border border-gray-300 mb-4 p-2"
        >
          <option value="EU">EU</option>
          <option value="US">US</option>
        </select>
      </div>

      <label for="customerShoeSize">Размер обуви:</label>

      <select
        id="shoeSize"
        v-model="customerShoeSize"
        class="form-select w-1/5 ml-2 rounded-lg border border-gray-300 mb-4 p-2"
      >
        <option v-for="size in availableSizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <span v-if="customerShoeSizeCm" class="shoe-size-cm">= {{ customerShoeSizeCm }} см</span>
      <span v-else class="shoe-size-cm">Размер не указан</span>
    </div>

    <button
      v-if="isLoggedIn"
      class="transition w-full mb-4 bg-blue-500 text-white py-3 rounded hover:bg-blue-600 cursor-pointer"
      @click="updateProfile"
    >
      Обновить профиль
    </button>

    <button
      v-if="isLoggedIn"
      @click="logoutUser"
      class="transition w-full bg-red-400 text-white py-3 rounded hover:bg-red-600 cursor-pointer mb-4"
    >
      Выйти
    </button>

    <!-- Форма регистрации -->
    <div v-if="!isLoggedIn" class="registration-section">
      <div class="mb-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email для входа"
          class="form-input rounded-lg border border-gray-300 p-2"
        />
      </div>
      <div class="mb-4">
        <input
          v-model="password"
          type="password"
          placeholder="Пароль для входа"
          class="form-input rounded-lg border border-gray-300 p-2"
        />
      </div>
      <div class="flex flex-row justify-between mb-4">
        <button
          @click="loginUser"
          class="w-1/2 bg-blue-500 text-white py-3 mr-3 rounded-md hover:bg-blue-600 cursor-pointer"
        >
          Войти
        </button>
        <button
          @click="register"
          class="w-1/2 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 cursor-pointer"
        >
          Регистрация
        </button>
      </div>
      <button
        v-if="!isLoggedIn"
        @click="signInWithGoogle"
        class="google-sign-in-button transition w-full flex justify-center items-center bg-white text-gray-700 py-2 px-4 rounded shadow hover:shadow-md cursor-pointer mb-4"
      >
        <!-- Используйте вашу иконку Google -->
        <img src="/icons8-google.svg" alt="Google Sign-In" class="w-6 h-6 mr-2" />
        Войти через Google
      </button>
      <div v-if="!isLoggedIn" id="telegram-button-container"></div>

      <div v-if="notificationMessage" class="notification">
        {{ notificationMessage }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.google-sign-in-button {
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.google-sign-in-button:hover {
  background: #f5f5f5;
}
.shoe-size-cm {
  margin-left: 10px; /* или используйте padding-left в зависимости от желаемого эффекта */
}
</style>
