<script setup>
import { onMounted, ref } from 'vue'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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
const customerGender = ref('Gender')
const customerAge = ref('')
const customerShoeSize = ref('')
const customerFavoriteBrand = ref('Adidas')
const customerShoeFormat = ref('US')
const favorites = ref([])
const sizes = {
  EU: [
    36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45,
    45.5, 46, 46.5, 47, 47.5, 48
  ],
  US: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13],
  UK: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]
}

const selectedSizeFormat = ref('EU') // начальное значение
const availableSizes = ref(sizes[selectedSizeFormat.value])

const changeSizeFormat = (format) => {
  selectedSizeFormat.value = format
  availableSizes.value = sizes[format]
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

  const userData = {
    name: customerName.value,
    email: auth.currentUser.email, // Используйте email из учетных данных пользователя
    gender: customerGender.value,
    age: customerAge.value,
    size: parseInt(customerShoeSize.value) // Преобразование в число
  }

  try {
    await set(dbRef(database, `users/${auth.currentUser.uid}`), userData)
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
        console.log('Полученные данные пользователя:', userData) // Добавьте эту строку для отладки

        // Обновление данных профиля
        customerName.value = userData.name || ''
        customerEmail.value = userData.email || ''
        customerGender.value = userData.gender || ''
        customerAge.value = userData.age || ''
        customerShoeFormat.value = userData.format || ''
        customerFavoriteBrand.value = userData.brand || ''
        customerShoeSize.value = userData.size ? String(userData.size) : ''

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
  } catch (error) {
    console.error('Logout error:', error)
  }
}

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
          @change="changeSizeFormat(selectedSizeFormat)"
        >
          class="form-input w-1/5 ml-2 rounded-lg border border-gray-300 mb-4 p-2"
          <option value="EU">EU</option>
          <option value="US">US</option>
          <option value="UK">UK</option>
        </select>
      </div>

      <label for="customerShoeSize">Размер обуви:</label>

      <select
        id="shoeSize"
        v-model="customerShoeSize"
        class="form-input w-1/5 mt-4 ml-2 rounded-lg border border-gray-300 mb-4 p-2"
      >
        <option v-for="size in availableSizes" :key="size" :value="size">{{ size }}</option>
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
        class="transition w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 cursor-pointer mb-4"
      >
        Регистрация
      </button>
      <button
        v-if="!isLoggedIn"
        @click="signInWithGoogle"
        class="google-sign-in-button transition w-full flex justify-center items-center bg-white text-gray-700 py-2 px-4 rounded shadow hover:shadow-md cursor-pointer mb-4"
      >
        <!-- Используйте вашу иконку Google -->
        <img src="/icons8-google.svg" alt="Google Sign-In" class="w-6 h-6 mr-2" />
        Войти через Google
      </button>
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
</style>
