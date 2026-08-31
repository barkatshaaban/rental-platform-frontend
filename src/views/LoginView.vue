<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Login failed, please try again'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <span class="eyebrow">Welcome back</span>
      <h1>{{ t('auth.loginTitle') }}</h1>

      <form @submit.prevent="handleLogin">
        <label>{{ t('auth.email') }}</label>
        <input v-model="email" type="email" required autocomplete="email" />

        <label>{{ t('auth.password') }}</label>
        <input v-model="password" type="password" required autocomplete="current-password" />

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" class="btn-accent" :disabled="loading">
          {{ loading ? t('auth.loggingIn') : t('auth.login') }}
        </button>
      </form>

      <p class="switch-link">No account? <RouterLink to="/register">Register here</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 68px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--paper-raised);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
}
.eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 8px;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 24px;
}
form {
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.82rem;
  font-weight: 500;
  margin: 12px 0 6px;
}
input {
  padding: 10px 12px;
}
.error {
  color: var(--danger);
  font-size: 0.85rem;
  margin: 10px 0 0;
}
button {
  margin-top: 22px;
  padding: 12px;
  background: var(--accent);
  color: var(--brand-dark);
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}
.switch-link {
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
  margin: 20px 0 0;
}
</style>
