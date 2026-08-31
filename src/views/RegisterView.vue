<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const form = ref({ name: '', email: '', password: '', role: 'student' })
const errorMessage = ref('')
const loading = ref(false)

async function handleRegister() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/')
  } catch (error) {
    const errors = error.response?.data?.errors
    errorMessage.value = errors
      ? Object.values(errors).flat().join(' ')
      : error.response?.data?.message || 'Registration failed, please try again'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <span class="eyebrow">Join Rental Hub</span>
      <h1>{{ t('auth.registerTitle') }}</h1>

      <form @submit.prevent="handleRegister">
        <label>{{ t('auth.fullName') }}</label>
        <input v-model="form.name" type="text" required />

        <label>{{ t('auth.email') }}</label>
        <input v-model="form.email" type="email" required autocomplete="email" />

        <label>{{ t('auth.password') }}</label>
        <input v-model="form.password" type="password" required minlength="6" autocomplete="new-password" />

        <label>{{ t('auth.iAmA') }}</label>
        <div class="role-toggle">
          <button type="button" :class="{ active: form.role === 'student' }" @click="form.role = 'student'">
            {{ t('auth.student') }}
          </button>
          <button type="button" :class="{ active: form.role === 'landlord' }" @click="form.role = 'landlord'">
            {{ t('auth.landlord') }}
          </button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" class="btn-accent" :disabled="loading">
          {{ loading ? t('auth.creatingAccount') : t('auth.registerButton') }}
        </button>
      </form>

      <p class="switch-link">Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
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
.role-toggle {
  display: flex;
  gap: 8px;
}
.role-toggle button {
  flex: 1;
  padding: 10px;
  background: var(--paper);
  border: 1px solid var(--line);
  color: var(--muted);
  cursor: pointer;
}
.role-toggle button.active {
  background: var(--brand);
  border-color: var(--brand);
  color: white;
}
.error {
  color: var(--danger);
  font-size: 0.85rem;
  margin: 10px 0 0;
}
button[type="submit"] {
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
