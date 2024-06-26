<script setup>
import { io } from 'socket.io-client'
import { inject, ref, watch } from 'vue'
import CartItemList from './CartItemList.vue'
import InfoBlock from '@/components/InfoBlock.vue'
import VueGoogleAutocomplete from 'vue-google-autocomplete'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
const apiKey = 'AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog'
const customerPhone = ref('+791')
const isProfileOpen = inject('isProfileOpen')
const auth = getAuth()
// const socket = io('http://localhost:3000') // Укажите ваш адрес сервера

// остальные методы, computed свойства и т.д.

const getAddressData = (addressData, placeResultData, id) => {
  customerAddress.value = addressData.name // Или другое свойство в зависимости от ваших требований
}
const { closeDrawer } = inject(['cart'])
defineProps({
  totalPrice: Number
})
const { cart, addToCart, removeFromCart } = inject(['cart'])
const customerCity = ref('')
const customerAddress = ref('')
const customerHouse = ref('')
const customerApartment = ref('')
const customerFloor = ref('')
const selectedPaymentMethod = ref('')
// const cardDetails = ref({
//   cardNumber: '',
//   expiryDate: '',
//   cvv: ''
// })
const proceedToCheckout = async () => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe()
          resolve(user)
        },
        reject
      )
    })

    if (user) {
      window.scrollTo({
        top: 500,
        behavior: 'smooth' // Добавляет плавный скролл
      })
      // Добавьте свою логику здесь
    } else {
      // Сбросить значение, если пользователь не аутентифицирован
      selectedPaymentMethod.value = 'wallet'
      // Открывает профиль/форму входа для неаутентифицированного пользователя
      isProfileOpen.value = true
      console.error('Пользователь не аутентифицирован')
    }
  } catch (error) {
    console.error('Ошибка при проверке аутентификации:', error)
    // Добавьте обработку ошибок, если необходимо
  }
  // Добавьте здесь логику для перехода к оформлению заказа, если требуется
}
// Подключение к сокету на клиенте

// Слушаем событие 'paymentSuccess'
// socket.on('paymentSuccess', (notificationData) => {
//   emit('createOrder')
//   isOrderCreated.value = true
//   console.log('Received payment success notification on the client:', notificationData)

// Ваша логика обработки уведомления на клиенте
</script>

<template>
  <div class="fixed inset-0 bg-black opacity-70 z-20 hidden sm:block"></div>

  <div
    class="fixed top-0 sm:right-0 h-full sm:w-96 w-full bg-white z-40 p-4 sm:p-8 overflow-y-auto"
  >
    <div class="flex items-center gap-5 mb-4">
      <img
        @click="closeDrawer"
        src="/arrow-left.svg"
        alt="Back"
        class="w-8 h-8 cursor-pointer opacity-40 hover:opacity-100 mr-2"
      />
      <h2 class="text-2xl font-bold">Корзина</h2>
    </div>

    <InfoBlock
      v-if="totalPrice === 0"
      v-auto-animate
      title="Ваша корзина пуста"
      description="Добавьте хотя бы одну пару кроссовок, чтобы оформить заказ."
      image-url="/package-icon.png"
    />
    <!--    <InfoBlock-->
    <!--      v-if="isOrderCreated"-->
    <!--      v-auto-animate-->
    <!--      title="Ваш заказ оформлен"-->
    <!--      description="Спасибо за покупку! Мы скоро свяжемся с вами для подтверждения заказа."-->
    <!--      image-url="/order-success-icon.png"-->
    <!--    />-->
    <CartItemList v-else />

    <div class="flex gap-2 mb-4 my-3">
      <span class="flex gap-2">Итого:</span>
      <div class="flex-1 border-b"></div>
      <b>${{ totalPrice }}</b>
    </div>

    <div class="checkout-form">
      <h3 class="text-lg font-medium my-4">Информация для доставки:</h3>
      <VueGoogleAutocomplete
        id="map-city"
        classname="form-input rounded-lg border border-gray-300 mb-4 p-2"
        placeholder="Введите город"
        v-model="customerCity"
        :api-key="apiKey"
        @placechanged="getAddressData"
        types="(cities)"
      />
      <VueGoogleAutocomplete
        id="map-address"
        classname="form-input rounded-lg border border-gray-300 w-full mb-4 p-2"
        placeholder="Введите адрес доставки"
        v-model="customerAddress"
        :api-key="apiKey"
        @placechanged="getAddressData"
        types="address"
      />
      <input
        type="text"
        placeholder="Дом"
        class="form-input rounded-lg border border-gray-300 mx-1 w-1/4 mb-4 p-2"
        v-model="customerHouse"
      />

      <!-- Поле для этажа -->
      <input
        type="number"
        placeholder="Этаж"
        class="form-input mx-1 rounded-lg w-1/4 border border-gray-300 mb-4 p-2"
        v-model="customerFloor"
      />

      <!-- Поле для квартиры -->
      <input
        type="number"
        placeholder="Кв. №"
        class="form-input rounded-lg mx-1 border border-gray-300 mb-4 p-2 w-1/4"
        v-model="customerApartment"
        maxlength="3"
      />
      <div style="max-width: 200px; max-height: 200px">
        <vue-tel-input
          v-model="customerPhone"
          :enabled-country-code="true"
          :mode="'international'"
          :autocomplete="true"
          :dynamic="true"
          :dynamicPlaceholder="true"
          :default-country="'ru'"
          :valid-characters-only="true"
          :preferred-countries="['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az']"
          :input-class="'form-input rounded-lg border border-gray-300  mb-4 p-2'"
        ></vue-tel-input>
      </div>

      <h3 class="text-lg font-medium my-4">Выбор метода оплаты:</h3>
      <label
        class="block mb-2"
        style="display: flex; align-items: center; cursor: pointer; font-size: 16px"
      >
        <input
          type="radio"
          value="card"
          @click="() => proceedToCheckout(user)"
          v-model="selectedPaymentMethod"
          style="width: 20px; height: 20px; margin-right: 8px"
        />
        <span style="flex: 1">Оплата картой</span>
      </label>

      <label
        class="block mb-2"
        style="display: flex; align-items: center; cursor: pointer; font-size: 16px"
      >
        <input
          type="radio"
          value="wallet"
          v-model="selectedPaymentMethod"
          style="width: 20px; height: 20px; margin-right: 8px"
        />
        <span style="flex: 1">Оплата Wallet Pay (USDT/TON в ТГ)</span>
      </label>

      <!--      <div v-if="selectedPaymentMethod === 'card'" class="mb-4">-->
      <!--        <input-->
      <!--          v-model="cardDetails.cardNumber"-->
      <!--          type="text"-->
      <!--          placeholder="Номер карты"-->
      <!--          class="form-input mb-2"-->
      <!--        />-->
      <!--        <input-->
      <!--          v-model="cardDetails.expiryDate"-->
      <!--          type="text"-->
      <!--          placeholder="Дата истечения"-->
      <!--          class="form-input mb-2"-->
      <!--        />-->
      <!--        <input v-model="cardDetails.cvv" type="text" placeholder="CVV" class="form-input mb-2" />-->
      <!--      </div>-->
    </div>

    <div v-if="selectedPaymentMethod === 'card'" class="mb-8 overflow-y-auto">
      <br /><link
        rel="stylesheet"
        href="https://yookassa.ru/integration/simplepay/css/yookassa_construct_form.css"
      />
      <form
        class="yoomoney-payment-form"
        action="https://yookassa.ru/integration/simplepay/payment"
        method="post"
        accept-charset="utf-8"
      >
        Страница успеха
        <div class="ym-hidden-inputs">
          <input name="shopSuccessURL" type="hidden" value="https://originalus.ru/Success" />
        </div>
        <!--        <div class="ym-products">-->
        <!--          <div class="ym-block-title ym-products-title">Товары</div>-->

        <!--          <div class="ym-product">-->
        <!--            <div class="ym-product-line">-->
        <!--              <span class="ym-product-description"-->
        <!--                ><span class="ym-product-count">1×</span>Adidas</span-->
        <!--              >-->
        <!--              <span class="ym-product-price" data-price="100" data-id="204" data-count="1"-->
        <!--                >100,00&nbsp;₽</span-->
        <!--              >-->
        <!--            </div>-->

        <!--            <input disabled="" type="hidden" name="text" value="Adidas" /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="price"-->
        <!--              value="100"-->
        <!--            /><input disabled="" type="hidden" name="quantity" value="1" /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="paymentSubjectType"-->
        <!--              value="commodity"-->
        <!--            /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="paymentMethodType"-->
        <!--              value="full_prepayment"-->
        <!--            /><input disabled="" type="hidden" name="tax" value="1" />-->
        <!--          </div>-->
        <!--          <div class="ym-product">-->
        <!--            <div class="ym-product-line">-->
        <!--              <span class="ym-product-description"-->
        <!--                ><span class="ym-product-count">1×</span>Adidas2</span-->
        <!--              >-->
        <!--              <span class="ym-product-price" data-price="200" data-id="678" data-count="1"-->
        <!--                >200,00&nbsp;₽</span-->
        <!--              >-->
        <!--            </div>-->

        <!--            <input disabled="" type="hidden" name="text" value="Adidas2" /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="price"-->
        <!--              value="200"-->
        <!--            /><input disabled="" type="hidden" name="quantity" value="1" /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="paymentSubjectType"-->
        <!--              value="commodity"-->
        <!--            /><input-->
        <!--              disabled=""-->
        <!--              type="hidden"-->
        <!--              name="paymentMethodType"-->
        <!--              value="full_prepayment"-->
        <!--            /><input disabled="" type="hidden" name="tax" value="1" />-->
        <!--          </div>-->
        <!--        </div>-->
        <input value="" type="hidden" name="ym_merchant_receipt" />
        <div class="ym-customer-info">
          <div class="ym-block-title">О покупателе</div>
          <input name="cps_email" class="ym-input" placeholder="Email" type="text" value="" />
          <input
            name="cps_phone"
            class="ym-input"
            placeholder="Телефон"
            type="text"
            :value="customerPhone"
          />
          <input name="custName" class="ym-input" placeholder="ФИО" type="text" value="" />
          <!--          <input-->
          <!--            name="custAddr"-->
          <!--            class="ym-input"-->
          <!--            placeholder="Адрес"-->
          <!--            type="text"-->
          <!--            :value="`${customerStreet} Д.${customerHouse} Кв.${customerApartment}`"-->
          <!--          />-->
          <div class="ym-payment-btn-block ym-align-space-between">
            <div class="ym-input-icon-rub ym-display-none">
              <input
                name="sum"
                placeholder="0.00"
                class="ym-input ym-sum-input ym-required-input"
                type="number"
                step="any"
                :value="totalPrice * 90"
              />
            </div>
            <button
              :disabled="totalPrice === 0"
              class="disabled:bg-gray-300 ym-btn-pay ym-result-price"
              style="
                width: 100%;
                margin-bottom: 10px;
                padding-inline: 5px;
                background-color: #4caf50;
                font-size: 16px;
              "
              src="https://yookassa.ru/integration/simplepay/js/yookassa_construct_form.js"
            >
              <span class="ym-text-crop">Оплатить</span>
              <span class="ym-price-output">{{ totalPrice * 90 }}&nbsp;₽</span></button
            ><svg
              class="ym-logo"
              width="114"
              height="27"
              viewBox="0 0 114 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-labelledby="logoTitle"
              role="img"
            >
              <path
                d="M59.3827 7.348H55.7087L53.0599 11.9619H51.6929V2.05054H48.1897V19.9081H51.6929V15.0379H53.0599L56.4777 19.9081H60.408L55.8796 13.4145L59.3827 7.348Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M85.6996 13.2436C85.016 12.7309 84.1616 12.4746 83.3926 12.2183C83.1363 12.1328 82.88 12.0474 82.6236 11.9619C82.5382 11.9619 82.4527 11.8765 82.4527 11.8765C81.9401 11.7056 81.4274 11.5347 81.4274 11.0221C81.4274 10.7657 81.5983 10.5094 81.7692 10.2531C82.0255 10.0822 82.2819 9.99676 82.6236 9.99676C83.3072 9.91132 83.9053 10.1676 84.5034 10.5094L84.5888 10.5949L86.4686 8.45878L86.3831 8.37334C86.1268 8.20245 85.8705 7.94613 85.6141 7.86068C84.9306 7.51891 84.4179 7.34802 84.0762 7.26258C83.7344 7.17714 82.7945 7.00625 81.6838 7.26258C81.1711 7.34802 80.4021 7.51891 79.6331 8.11701C78.7787 8.80055 78.266 9.65498 78.1806 10.5949C78.1806 10.9366 78.0952 12.1328 78.7787 13.0727C79.4622 13.9271 80.573 14.3544 81.342 14.6107C81.4274 14.6107 81.4274 14.6107 81.5129 14.6961C81.5983 14.6961 81.6838 14.7816 81.8546 14.7816C83.1363 15.2088 83.4781 15.3797 83.649 15.7214C83.8198 15.9778 83.8198 16.1487 83.8198 16.1487C83.8198 16.7468 83.0508 17.0031 82.5382 17.174C81.8546 17.3449 81.0857 17.0885 80.4876 16.7468C80.0603 16.405 79.6331 15.9778 79.2913 15.5506C79.1205 15.7214 77.1553 17.6866 77.1553 17.6866L77.2407 17.7721C77.9243 18.6265 79.1205 19.7373 80.9148 20.079C81.1711 20.1645 81.5129 20.1645 81.9401 20.1645C82.0255 20.1645 82.1964 20.1645 82.2819 20.1645C83.1363 20.1645 84.4179 19.9936 85.5287 19.1392C85.8705 18.8828 86.554 18.3702 86.8958 17.3449C87.2376 16.405 87.1521 15.2942 86.554 14.3544C86.4686 13.9271 86.1268 13.5854 85.6996 13.2436Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M96.9777 13.2436C96.2941 12.7309 95.4397 12.4746 94.6707 12.2183C94.4144 12.1328 94.158 12.0474 93.9017 11.9619C93.8163 11.9619 93.7308 11.8765 93.7308 11.8765C93.2182 11.7056 92.7055 11.5347 92.7055 11.0221C92.7055 10.7657 92.8764 10.5094 93.0473 10.2531C93.3036 10.0822 93.5599 9.99676 93.9017 9.99676C94.5853 9.91132 95.1834 10.1676 95.7815 10.5094L95.8669 10.5949L97.7466 8.45878L97.6612 8.37334C97.4049 8.20245 97.1485 7.94613 96.8922 7.86068C96.2087 7.51891 95.696 7.34802 95.3542 7.26258C95.0125 7.17714 94.0726 7.00625 92.9618 7.26258C92.4492 7.34802 91.6802 7.51891 90.9112 8.11701C90.0568 8.80055 89.5441 9.65498 89.4587 10.5949C89.4587 10.9366 89.3732 12.1328 90.0568 13.0727C90.7403 13.9271 91.8511 14.3544 92.6201 14.6107C92.7055 14.6107 92.7055 14.6107 92.791 14.6961C92.8764 14.6961 92.9618 14.7816 93.1327 14.7816C94.4144 15.2088 94.7561 15.3797 94.927 15.7214C95.0979 15.9778 95.0979 16.1487 95.0979 16.1487C95.0979 16.7468 94.3289 17.0031 93.8163 17.174C93.1327 17.3449 92.3637 17.0885 91.7656 16.7468C91.3384 16.405 90.9112 15.9778 90.5694 15.5506C90.3985 15.7214 88.4333 17.6866 88.4333 17.6866L88.5188 17.7721C89.2023 18.6265 90.3985 19.7373 92.1929 20.079C92.4492 20.1645 92.791 20.1645 93.2182 20.1645C93.3036 20.1645 93.4745 20.1645 93.5599 20.1645C94.4144 20.1645 95.696 19.9936 96.8068 19.1392C97.1485 18.8828 97.8321 18.3702 98.1739 17.3449C98.5156 16.405 98.4302 15.2942 97.8321 14.3544C97.7466 13.9271 97.4049 13.5854 96.9777 13.2436Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M70.8323 7.34811V8.54432H70.6614C69.5507 7.519 68.3544 7.00635 67.0728 7.00635C65.3639 7.00635 63.7405 7.68989 62.6298 8.88609C61.519 10.0823 60.9209 11.7057 60.9209 13.5C60.9209 15.3798 61.519 17.0032 62.6298 18.1994C63.7405 19.3956 65.2785 20.0791 66.9874 20.0791C68.269 20.0791 69.5507 19.5665 70.6614 18.6266H70.8323V19.7374H74.4209V7.17723H70.8323V7.34811ZM71.0032 13.6709C71.0032 14.7817 70.6614 15.7215 70.0633 16.4905C69.4652 17.1741 68.6108 17.5158 67.5855 17.5158C66.6456 17.5158 65.8766 17.1741 65.1931 16.4051C64.5949 15.7215 64.2532 14.7817 64.2532 13.5855C64.2532 12.4747 64.5949 11.6203 65.1931 10.8513C65.7912 10.1677 66.6456 9.74052 67.5855 9.74052C68.6108 9.74052 69.3798 10.0823 70.0633 10.7658C70.6614 11.6203 71.0032 12.5601 71.0032 13.6709Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M110.222 7.34811V8.54432H110.051C108.94 7.519 107.744 7.00635 106.462 7.00635C104.753 7.00635 103.13 7.68989 102.019 8.88609C100.908 10.0823 100.31 11.7057 100.31 13.5C100.31 15.3798 100.908 17.0032 102.019 18.1994C103.13 19.3956 104.668 20.0791 106.377 20.0791C107.658 20.0791 108.94 19.5665 110.051 18.6266H110.222V19.7374H113.81V7.17723H110.222V7.34811ZM110.393 13.6709C110.393 14.7817 110.051 15.7215 109.453 16.4905C108.855 17.1741 108 17.5158 106.975 17.5158C106.035 17.5158 105.266 17.1741 104.582 16.4051C103.984 15.7215 103.643 14.7817 103.643 13.5855C103.643 12.4747 103.984 11.6203 104.582 10.8513C105.181 10.1677 106.035 9.74052 106.975 9.74052C108 9.74052 108.769 10.0823 109.453 10.7658C110.051 11.6203 110.393 12.5601 110.393 13.6709Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M24.4366 0C16.9176 0 10.9366 6.06646 10.9366 13.5C10.9366 21.019 17.003 27 24.4366 27C31.8701 27 37.9366 20.9335 37.9366 13.5C38.022 6.06646 31.8701 0 24.4366 0ZM24.4366 18.5411C21.7024 18.5411 19.3954 16.2342 19.3954 13.5C19.3954 10.7658 21.7024 8.45886 24.4366 8.45886C27.1708 8.45886 29.4777 10.7658 29.4777 13.5C29.4777 16.2342 27.2562 18.5411 24.4366 18.5411Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
              <path
                d="M10.9367 3.93036V23.5823H6.1519L0 3.93036H10.9367Z"
                fill="black"
                fill-opacity="0.4"
              ></path>
            </svg>
          </div>

          <textarea
            class="ym-textarea"
            name="orderDetails"
            placeholder="Комментарий"
            value=""
          ></textarea>
        </div>
        <div class="ym-hidden-inputs"></div>
        <input name="customerNumber" type="hidden" value="Стоимость всех услуг" />

        <input name="shopId" type="hidden" value="311031" />
        <!--        <button-->
        <!--          :disabled="totalPrice === 0 || isOrderCreated === true"-->
        <!--          @click="proceedToPayment"-->
        <!--          class="transition w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:bg-gray-300 cursor-pointer"-->
        <!--        >-->
        <!--          Оплатить-->
        <!--        </button>-->
        <!--        <p>После оплаты вы получите трекер</p>-->
        <!--        <button-->
        <!--          :disabled="totalPrice === 0 || isOrderCreated === true"-->
        <!--          @click="-->
        <!--            () => {-->
        <!--              emit('createOrder')-->
        <!--              isOrderCreated = true-->
        <!--            }-->
        <!--          "-->
        <!--          class="transition w-full bg-lime-500 text-white disabled:bg-slate-300 py-3 rounded-xl hover:bg-lime-600 cursor-pointer"-->
        <!--        >-->
        <!--          Оформить заказ-->
        <!--        </button>-->
      </form>
    </div>
  </div>
</template>
