<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(1)
const phoneNumber = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])

const handleSendOTP = () => {
  if (phoneNumber.value.length >= 10) {
    step.value = 2
  }
}

const handleVerifyOTP = () => {
  const code = otpDigits.value.join('')
  if (code.length === 6) {
    router.push('/dashboard/freelancer')
  }
}

const onOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

const onOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}
</script>

<template>
  <div id="itehjtts" class="auth-wrapper">
    <div class="auth-card">
      
      <div class="logo-circle">
        <img src="/seal-logo.png" alt="Logo" class="logo-img" />
      </div>

      <div class="card-content">
        <h1 class="title">Login</h1>

        <div v-if="step === 1" class="step-container">
          <p class="subtitle">Enter your phone number to receive a one time password</p>
          
          <div class="input-section">
            <label>Phone Number</label>
            <div class="input-wrapper">
              <input 
                v-model="phoneNumber" 
                type="tel" 
                placeholder="+63 966 471 4567"
                @keyup.enter="handleSendOTP"
              />
            </div>
          </div>

          <button class="btn-primary" @click="handleSendOTP">Send OTP</button>
        </div>

        <div v-if="step === 2" class="step-container">
          <p class="subtitle">Enter the 6-digit code sent to your phone</p>
          
          <div class="input-section">
            <label>One-Time Password</label>
            <div class="otp-container">
              <input
                v-for="(_digit, index) in 6"
                :key="index"
                ref="otpInputs"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                class="otp-box"
                @input="onOtpInput(index, $event)"
                @keydown="onOtpKeydown(index, $event)"
                @keyup.enter="handleVerifyOTP"
              />
            </div>
          </div>

          <div class="button-group">
            <button class="btn-primary" @click="handleVerifyOTP">Verify & Login</button>
            <button class="btn-secondary" @click="step = 1">Change phone number</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #5F9598 100%), #FFFFFF;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 437px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #5F9598;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  margin-top: 120px; 
}

.logo-circle {
  position: absolute;
  top: -105px;
  left: 50%;
  transform: translateX(-50%);
  width: 99px;
  height: 92px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-content {
  padding: 60px 29px 30px 29px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  color: #061E29;
  margin: 0 0 16px 0;
  text-align: center;
}

.step-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.subtitle {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #6A7282;
  margin: 0;
  text-align: center;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #000000;
}

.input-wrapper {
  width: 100%;
  height: 46px;
  border: 1px solid #5F9598;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.input-wrapper input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  font-weight: 400;
  font-size: 14px;
  color: #061E29;
}

.input-wrapper input::placeholder {
  color: rgba(10, 10, 10, 0.5);
}

.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.otp-box {
  width: 46px;
  height: 46px;
  border: 1px solid #5F9598;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  color: #061E29;
  outline: none;
  box-sizing: border-box;
}

.otp-box:focus {
  border-width: 2px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  height: 36px;
  background: #061E29;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-secondary {
  width: 100%;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #061E29;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
