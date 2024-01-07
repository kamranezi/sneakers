// Импортируем только необходимые функции для инициализации Firebase
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
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

export { app, database }

// Настройка хостинга Firebase
const firebaseHostingConfig = {
  hosting: {
    public: 'dist',
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
    rewrites: [
      {
        source: '**',
        destination: '/index.html'
      }
    ]
  }
}

export { firebaseHostingConfig }
