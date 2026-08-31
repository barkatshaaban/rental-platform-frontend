import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => user.value?.role || null)

  function setSession(newUser, newToken) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('token', newToken)
  }

  async function login(email, password) {
    const response = await api.post('/login', { email, password })
    setSession(response.data.user, response.data.token)
    return response.data
  }

  async function register(payload) {
    const response = await api.post('/register', payload)
    setSession(response.data.user, response.data.token)
    return response.data
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // hata kama ombi la logout limeshindwa, tunamtoa mtumiaji hapa hapa
    }
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, role, login, register, logout }
})
