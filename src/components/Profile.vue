<script setup>
import { onMounted, ref } from 'vue'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

// Если вам нужны другие функции из Realtime Database, импортируйте их так
import { getDatabase, ref as dbRef, set, push, get, update } from 'firebase/database'

// Создайте экземпляры для Auth и Database
const firebaseConfig = {
  apiKey: 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog',
  authDomain: 'sneakers-5c581.firebaseapp.com',
  databaseURL: 'https://sneakers-5c581-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'sneakers-5c581',
  storageBucket: 'sneakers-5c581.appspot.com',
  messagingSenderId: '278974655722',
  appId: '1:278974655722:web:e033d27d8c2a69f2c87b93'
}

const isLoggedIn = ref(true)
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = user
  })
})
// Инициализация Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase()

const email = ref('')
const password = ref('')
const loginEmail = ref('')
const loginPassword = ref('')

const customerName = ref('')
const customerEmail = ref('')
const customerGender = ref('')
const customerAge = ref('')
const customerSize = ref('')
const customerShoeSize = ref('')
const updateProfile = async () => {
  if (!auth.currentUser) {
    console.error('Пользователь не авторизован')
    return
  }

  const userData = {
    name: customerName.value,
    email: customerEmail.value,
    gender: customerGender.value,
    age: customerAge.value,
    size: customerSize.value
  }

  try {
    await set(dbRef(database, `users/${auth.currentUser.uid}`), userData)
    console.log('Профиль обновлен')
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
  }
}
const register = async () => {
  console.log('Attempting to register:', email.value, password.value)
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    console.log('User registered:', userCredential.user)

    // Создание профиля пользователя
    try {
      // Здесь мы записываем тестовое значение вместо пустого объекта
      await set(dbRef(database, `users/${userCredential.user.uid}`), {
        testValue: 'Тестовое значение'
      })
      console.log('User profile created')
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  } catch (error) {
    console.error('Registration error:', error)
  }
}

const loginUser = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    )
    console.log('Logged in:', userCredential.user)
    // Дополнительные действия после входа...
  } catch (error) {
    console.error('Login error:', error)
  }
}

// Выход пользователя
const logoutUser = async () => {
  try {
    await signOut(auth)
    console.log('Logged out')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const customerMail = ref('')
const props = defineProps({
  closeProfile: Function
})
</script>
<template>
  <div class="fixed inset-0 bg-black opacity-70 z-30 hidden sm:block"></div>

  <div class="fixed top-0 sm:right-0 h-full sm:w-96 w-120 bg-white z-30 p-4 sm:p-8 overflow-y-auto">
    <div class="flex items-center gap-5 mb-4">
      <img
        @click="closeProfile"
        src="/arrow-left.svg"
        alt="Back"
        class="w-8 h-8 cursor-pointer opacity-40 hover:opacity-100 mr-2"
      />
      <h2 class="text-2xl font-bold">Профиль</h2>
    </div>

    <div class="profile-form">
      <h3 class="text-lg font-medium my-4">Ваша информация:</h3>

      <input
        type="text"
        placeholder="Name"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2 mr-4"
        v-model="customerName"
      />
      <select
        class="form-input rounded-lg border border-gray-300 mb-4 p-2 smaller-select"
        v-model="customerGender"
      >
        <option value="" disabled selected>Пол</option>
        <option value="male">Мужской</option>
        <option value="female">Женский</option>
        <!-- Другие опции, если нужно -->
      </select>

      <input
        type="number"
        placeholder="Возраст"
        class="smaller-select rounded-lg border border-gray-300 mb-4 p-2"
        v-model="customerAge"
      />

      <select
        type="number"
        v-model="customerShoeSize"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2"
      >
        <option value="">Size</option>
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
      <input
        v-model="loginEmail"
        type="email"
        placeholder="Email для входа"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2"
      />
      <input
        v-model="loginPassword"
        type="password"
        placeholder="Пароль для входа"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2"
      />
      <button
        @click="loginUser"
        class="transition w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 cursor-pointer mb-4"
      >
        Войти
      </button>
      <input
        v-model="email"
        type="email"
        placeholder="Email для регистрации"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Пароль для регистрации"
        class="form-input rounded-lg border border-gray-300 mb-4 p-2"
      />
      <button
        @click="register"
        class="transition w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 cursor-pointer mb-4"
      >
        Регистрация
      </button>
    </div>
  </div>
</template>

<style>
.smaller-select {
  /* Вы можете настроить размер здесь, например: */
  width: 30%;
  margin-right: 6px;
}
</style>
