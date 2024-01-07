<script setup>
import { ref, onMounted } from 'vue'
import { initializeApp } from 'firebase/app'

import { getDatabase, ref as dbRef, set, push, get, update } from 'firebase/database'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
defineProps({
  closeProfile: Function
})
// Экземпляры Firebase Auth и Database
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
// const isLoggedIn = ref(false)

// onMounted(() => {
//   const auth = getAuth()
//   onAuthStateChanged(auth, (user) => {
//     isLoggedIn.value = !!user
//   })
// })
const database = getDatabase()

// const login = async () => {
//   try {
//     if (!email.value || !password.value) {
//       throw new Error('Email and password are required.')
//     }
//     const response = await signInWithEmailAndPassword(auth, email.value, password.value)
//     // Обрабатываем успешный вход в систему
//   } catch (error) {
//     console.error(error)
//     // Здесь вы можете обработать ошибку и отобразить сообщение пользователю
//   }
// }
const email = ref('')
const password = ref('')
const isLoginMode = ref(true)
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

const fetchUserProfile = async (userId) => {
  const userRef = dbRef(database, `users/${userId}`)
  try {
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
      return snapshot.val()
    } else {
      console.error('No such user with UID:', userId)
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <h2>Вход / Регистрация</h2>

      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Пароль" />

      <button @click="login">Войти</button>
      <button @click="register">Регистрация</button>

      <button @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999; /* Достаточно высокое значение */
  display: flex; /* Используем flexbox для центрирования модального окна */
  justify-content: center; /* Центрирование по горизонтали */
  align-items: center; /* Центрирование по вертикали */
}

.modal-content {
  z-index: 10000; /* Должен быть выше, чем у .modal-backdrop */
  background: white; /* Фон модального окна должен быть белым или другим цветом */
  padding: 20px; /* Добавляем отступы внутри модального окна */
  border-radius: 5px; /* Скругляем углы модального окна */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Добавляем тень для эффекта "всплытия" */
  /* Другие стили для позиционирования и внешнего вида */
}
</style>
