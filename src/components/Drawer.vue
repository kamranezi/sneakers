<script setup>
import { inject, ref } from 'vue'
import CartItemList from './CartItemList.vue'
import InfoBlock from '@/components/InfoBlock.vue'
import VueGoogleAutocomplete from 'vue-google-autocomplete'

const customerPhone = ref('')

// остальные методы, computed свойства и т.д.

const getAddressData = (addressData, placeResultData, id) => {
  customerAddress.value = addressData.name // Или другое свойство в зависимости от ваших требований
}
const emit = defineEmits(['createOrder'])
const { closeDrawer } = inject(['cart'])
defineProps({
  totalPrice: Number,
  isCreatingOrder: Boolean
})
const { cart, addToCart, removeFromCart } = inject(['cart'])
const customerCity = ref('')
const customerAddress = ref('')
const isOrderCreated = ref(false)
const selectedPaymentMethod = ref('')
const cardDetails = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})
const proceedToCheckout = () => {
  // Добавьте здесь логику для перехода к оформлению заказа, если требуется
}
</script>

<template>
  <div class="fixed inset-0 bg-black opacity-70 z-10 hidden sm:block"></div>

  <div
    class="fixed top-0 sm:right-0 h-full sm:w-96 w-full bg-white z-20 p-4 sm:p-8 overflow-y-auto"
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
    <InfoBlock
      v-if="isOrderCreated"
      v-auto-animate
      title="Ваш заказ оформлен"
      description="Спасибо за покупку! Мы скоро свяжемся с вами для подтверждения заказа."
      image-url="/order-success-icon.png"
    />
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
        :api-key="AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog"
        @placechanged="getAddressData"
        types="(cities)"
      />
      <VueGoogleAutocomplete
        id="map-address"
        classname="form-input rounded-lg border border-gray-300 w-full mb-4 p-2"
        placeholder="Введите адрес доставки"
        v-model="customerAddress"
        :api-key="AIzaSyCE2imVR50t0z4dVKgPKAoLvjtz6I8KRog"
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
          :default-country="'ge'"
          :valid-characters-only="true"
          :preferred-countries="['ru', 'ua', 'by', 'kz', 'ge', 'am', 'az']"
          :input-class="'form-input rounded-lg border border-gray-300 mb-4 p-2'"
        ></vue-tel-input>
      </div>

      <h3 class="text-lg font-medium my-4">Выбор метода оплаты:</h3>
      <label class="block mb-2">
        <input v-model="selectedPaymentMethod" type="radio" value="card" /> Оплата картой
      </label>
      <label class="block mb-2">
        <input v-model="selectedPaymentMethod" type="radio" value="wallet" /> Оплата Wallet Pay
        (USDT/TON в ТГ)
      </label>
      <div v-if="selectedPaymentMethod === 'card'" class="mb-4">
        <input
          v-model="cardDetails.cardNumber"
          type="text"
          placeholder="Номер карты"
          class="form-input mb-2"
        />
        <input
          v-model="cardDetails.expiryDate"
          type="text"
          placeholder="Дата истечения"
          class="form-input mb-2"
        />
        <input v-model="cardDetails.cvv" type="text" placeholder="CVV" class="form-input mb-2" />
      </div>
    </div>

    <button
      :disabled="totalPrice === 0 || isOrderCreated === true"
      @click="proceedToPayment"
      class="transition w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:bg-gray-300 cursor-pointer"
    >
      Оплатить
    </button>
    <p>После оплаты вы получите трекер</p>
    <button
      :disabled="totalPrice === 0 || isOrderCreated === true"
      @click="
        () => {
          emit('createOrder')
          isOrderCreated = true
        }
      "
      class="transition w-full bg-lime-500 text-white disabled:bg-slate-300 py-3 rounded-xl hover:bg-lime-600 cursor-pointer"
    >
      Оформить заказ
    </button>
  </div>
</template>
