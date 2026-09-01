<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const { t } = useI18n()

const properties = ref([])
const stats = ref({ rooms_listed: 0, verified_landlords: 0, campus_areas: 0 })
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

async function fetchStats() {
  const response = await api.get('/stats')
  stats.value = response.data
}

function imageUrl(property) {
  const primary = property.images?.find((img) => img.is_primary) || property.images?.[0]
  if (primary) return `http://127.0.0.1:8000/storage/${primary.path}`
  return null
}

function scrollToResults() {
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  fetchProperties()
  fetchStats()
})
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow">✓ Every hostel verified before it goes live</span>
        <h1>A room near campus, without the guesswork.</h1>
        <p class="hero-sub">
          Rental Hub connects students with trusted landlords — real photos, honest prices, and direct messaging.
        </p>

        <form class="search-bar" @submit.prevent="scrollToResults(); fetchProperties()">
          <input v-model="search" type="text" :placeholder="t('home.searchPlaceholder')" />
          <button type="submit" class="btn-accent">{{ t('home.search') }}</button>
        </form>

        <div class="stats-bar">
          <div class="stat">
            <span class="stat-num">{{ stats.rooms_listed }}+</span>
            <span class="stat-label">Rooms listed</span>
          </div>
          <div class="stat">
            <span class="stat-num">{{ stats.verified_landlords }}</span>
            <span class="stat-label">Verified landlords</span>
          </div>
          <div class="stat">
            <span class="stat-num">{{ stats.campus_areas }}</span>
            <span class="stat-label">Campus areas covered</span>
          </div>
        </div>
      </div>
    </section>

    <section id="results" class="results">
      <div class="results-header">
        <h2>Rooms you can view now</h2>
        <div class="filters">
          <input v-model="minPrice" type="number" :placeholder="t('home.minPrice')" @change="fetchProperties" />
          <input v-model="maxPrice" type="number" :placeholder="t('home.maxPrice')" @change="fetchProperties" />
          <select v-model="roomType" @change="fetchProperties">
            <option value="">{{ t('home.anyRoomType') }}</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quadruple">Quadruple</option>
            <option value="self_contained">Self-contained</option>
            <option value="shared">Shared</option>
          </select>
        </div>
      </div>

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
            <span class="room-tag">{{ property.room_type.replace('_', ' ') }}</span>
          </div>
          <div class="card-body">
            <div class="card-title-row">
              <h3>{{ property.title }}</h3>
              <span v-if="property.reviews_avg_rating" class="rating">
                ★ {{ Number(property.reviews_avg_rating).toFixed(1) }}
              </span>
              <span v-else class="rating new">New</span>
            </div>
            <p class="landlord-name">{{ property.landlord.name }}</p>
            <p class="address">📍 {{ property.address }}<span v-if="property.institution"> · near {{ property.institution.name.split('(')[0].trim() }}</span></p>

            <div class="tags" v-if="property.facilities.length">
              <span v-for="facility in property.facilities.slice(0, 3)" :key="facility.id" class="tag">{{ facility.name }}</span>
            </div>

            <div class="card-footer">
              <span class="price">TZS {{ Number(property.price).toLocaleString() }}<span class="period">/{{ property.price_period }}</span></span>
              <span class="view-link">View room →</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="how-it-works">
      <h2>From searching to keys in four clear steps</h2>
      <div class="steps">
        <div class="step">
          <span class="step-num">1</span>
          <h3>Search and filter</h3>
          <p>Filter by area, distance to campus, room type and monthly budget.</p>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <h3>Check verification</h3>
          <p>Admin-reviewed listings carry a verified badge with confirmed owner details.</p>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <h3>Message the landlord</h3>
          <p>Ask about water, power and house rules before you travel to view the room.</p>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <h3>Send your request</h3>
          <p>Reserve your interest directly through the platform, tracked from start to finish.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--brand-dark), var(--brand));
  color: white;
}
.hero-inner {
  max-width: 700px;
  margin: 0 auto;
  padding: 64px 24px 48px;
  text-align: center;
}
.eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.hero h1 {
  font-size: 2.6rem;
  margin-bottom: 14px;
}
.hero-sub {
  color: rgba(255, 255, 255, 0.85);
  max-width: 480px;
  margin: 0 auto 32px;
}
.search-bar {
  display: flex;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}
.search-bar input {
  flex: 1;
  padding: 13px 16px;
  border: none;
  font-size: 0.95rem;
}
.btn-accent {
  padding: 13px 24px;
  background: var(--accent);
  color: var(--brand-dark);
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 44px;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
}
.stat-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}
.results {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 28px;
}
.results-header h2 {
  font-size: 1.5rem;
  margin: 0;
}
.filters {
  display: flex;
  gap: 8px;
}
.filters input, .filters select {
  padding: 9px 12px;
  font-size: 0.85rem;
}
.state-message {
  text-align: center;
  color: var(--muted);
  padding: 40px 0;
}
.state-message.error {
  color: var(--danger);
}
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  height: 170px;
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
.room-tag {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.72rem;
  text-transform: capitalize;
  padding: 3px 10px;
  border-radius: 20px;
}
.card-body {
  padding: 16px;
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-title-row h3 {
  font-size: 1.02rem;
  margin: 0;
}
.rating {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-dark);
  white-space: nowrap;
}
.rating.new {
  color: var(--muted);
  font-weight: 400;
}
.landlord-name {
  color: var(--muted);
  font-size: 0.82rem;
  margin: 2px 0 8px;
}
.address {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0 0 10px;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.tag {
  font-size: 0.72rem;
  background: var(--paper);
  color: var(--muted);
  padding: 3px 8px;
  border-radius: 20px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-top: 1px solid var(--line);
  padding-top: 10px;
}
.price {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--brand);
  font-size: 0.92rem;
}
.period {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.78rem;
}
.view-link {
  font-size: 0.8rem;
  color: var(--brand);
  font-weight: 500;
}
.how-it-works {
  background: var(--paper-raised);
  padding: 56px 24px;
  border-top: 1px solid var(--line);
}
.how-it-works h2 {
  text-align: center;
  font-size: 1.5rem;
  max-width: 500px;
  margin: 0 auto 40px;
}
.steps {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 28px;
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand);
  color: white;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
}
.step h3 {
  font-size: 1rem;
  margin-bottom: 6px;
}
.step p {
  color: var(--muted);
  font-size: 0.88rem;
  margin: 0;
}
</style>
