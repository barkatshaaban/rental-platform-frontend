<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const { t } = useI18n()

const properties = ref([])
const loading = ref(true)
const errorMessage = ref('')

const search = ref('')
const minPrice = ref('')
const maxPrice = ref('')
const roomType = ref('')

async function fetchProperties() {
  loading.value = true
  errorMessage.value = ''
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (minPrice.value) params.min_price = minPrice.value
    if (maxPrice.value) params.max_price = maxPrice.value
    if (roomType.value) params.room_type = roomType.value

    const response = await api.get('/properties', { params })
    properties.value = response.data.data
  } catch (error) {
    errorMessage.value = t('home.loadError')
  } finally {
    loading.value = false
  }
}

function imageUrl(property) {
  const primary = property.images?.find((img) => img.is_primary) || property.images?.[0]
  if (primary) return `http://127.0.0.1:8000/storage/${primary.path}`
  return null
}

onMounted(fetchProperties)
</script>

<template>
  <div class="page">
    <section class="hero">
      <span class="eyebrow">Verified listings only</span>
      <h1>{{ t('home.title') }}</h1>
      <p class="hero-sub">Every room here has passed admin verification — no brokers, no guesswork.</p>

      <form class="filters" @submit.prevent="fetchProperties">
        <input v-model="search" type="text" :placeholder="t('home.searchPlaceholder')" class="search-input" />
        <input v-model="minPrice" type="number" :placeholder="t('home.minPrice')" />
        <input v-model="maxPrice" type="number" :placeholder="t('home.maxPrice')" />
        <select v-model="roomType">
          <option value="">{{ t('home.anyRoomType') }}</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="quadruple">Quadruple</option>
          <option value="self_contained">Self-contained</option>
          <option value="shared">Shared</option>
        </select>
        <button type="submit" class="btn-accent">{{ t('home.search') }}</button>
      </form>
    </section>

    <section class="results">
      <p v-if="loading" class="state-message">{{ t('home.loading') }}</p>
      <p v-else-if="errorMessage" class="state-message error">{{ errorMessage }}</p>
      <p v-else-if="properties.length === 0" class="state-message">{{ t('home.noResults') }}</p>

      <div v-else class="property-grid">
        <RouterLink
          v-for="property in properties"
          :key="property.id"
          :to="`/properties/${property.id}`"
          class="property-card"
        >
          <div class="card-image" :style="imageUrl(property) ? { backgroundImage: `url(${imageUrl(property)})` } : {}">
            <span v-if="!imageUrl(property)" class="placeholder-icon">🏠</span>
            <span class="verified-stamp">✓ Verified</span>
          </div>
          <div class="card-body">
            <h3>{{ property.title }}</h3>
            <p class="address">📍 {{ property.address }}</p>
            <div class="card-footer">
              <span class="price">TZS {{ Number(property.price).toLocaleString() }}<span class="period">/{{ property.price_period }}</span></span>
              <span class="room-type">{{ property.room_type.replace('_', ' ') }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 60px;
}
.hero {
  padding: 48px 0 36px;
  border-bottom: 1px solid var(--line);
}
.eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand);
  background: rgba(31, 111, 92, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 14px;
}
.hero h1 {
  font-size: 2.4rem;
  max-width: 600px;
}
.hero-sub {
  color: var(--muted);
  max-width: 480px;
  margin: 0 0 28px;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.filters input, .filters select {
  padding: 11px 14px;
  font-size: 0.9rem;
}
.search-input {
  flex: 2;
  min-width: 220px;
}
.filters button {
  padding: 11px 22px;
  cursor: pointer;
}
.btn-accent {
  background: var(--accent);
  color: var(--brand-dark);
  border: none;
}
.results {
  padding-top: 36px;
}
.state-message {
  color: var(--muted);
  text-align: center;
  padding: 40px 0;
}
.state-message.error {
  color: var(--danger);
}
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}
.property-card {
  text-decoration: none;
  color: inherit;
  background: var(--paper-raised);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease;
}
.property-card:hover {
  transform: translateY(-3px);
}
.card-image {
  height: 160px;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.placeholder-icon {
  font-size: 2.2rem;
  opacity: 0.5;
}
.verified-stamp {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent);
  color: var(--brand-dark);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 20px;
  transform: rotate(4deg);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.card-body {
  padding: 16px;
}
.card-body h3 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}
.address {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0 0 12px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.price {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--brand);
}
.period {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.8rem;
}
.room-type {
  text-transform: capitalize;
  font-size: 0.78rem;
  color: var(--muted);
  background: var(--paper);
  padding: 3px 9px;
  border-radius: 20px;
}
</style>
