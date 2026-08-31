<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const { locale, t } = useI18n()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function switchLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="brand">
      <span class="brand-mark">RH</span>
      <span class="brand-name">{{ t('nav.brand') }}</span>
    </RouterLink>

    <div class="links">
      <RouterLink to="/" class="nav-link">{{ t('nav.listings') }}</RouterLink>

      <template v-if="auth.isLoggedIn">
        <RouterLink v-if="auth.role === 'landlord'" to="/landlord/dashboard" class="nav-link">
          {{ t('nav.dashboard') }}
        </RouterLink>
        <RouterLink v-if="auth.role === 'admin'" to="/admin/dashboard" class="nav-link">
          {{ t('nav.admin') }}
        </RouterLink>

        <span class="user-chip">{{ auth.user.name }} · {{ auth.role }}</span>
        <button class="btn-ghost" @click="handleLogout">{{ t('nav.logout') }}</button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="nav-link">{{ t('nav.login') }}</RouterLink>
        <RouterLink to="/register" class="btn-accent">{{ t('nav.register') }}</RouterLink>
      </template>

      <div class="lang-switch">
        <button :class="{ active: locale === 'en' }" @click="switchLanguage('en')">EN</button>
        <button :class="{ active: locale === 'sw' }" @click="switchLanguage('sw')">SW</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: var(--brand-dark);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--accent);
  color: var(--brand-dark);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
}
.brand-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.15rem;
  color: white;
}
.links {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
}
.nav-link:hover {
  color: white;
}
.user-chip {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}
.btn-ghost {
  padding: 7px 14px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
}
.btn-accent {
  padding: 7px 16px;
  background: var(--accent);
  color: var(--brand-dark);
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}
.lang-switch {
  display: flex;
  gap: 2px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 2px;
}
.lang-switch button {
  padding: 4px 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.78rem;
}
.lang-switch button.active {
  background: white;
  color: var(--brand-dark);
}
</style>
