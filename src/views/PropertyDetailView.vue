<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

const property = ref(null)
const loading = ref(true)
const actionMessage = ref('')

const requestMessage = ref('')
const sendingRequest = ref(false)

const reviewRating = ref(5)
const reviewComment = ref('')
const sendingReview = ref(false)

async function fetchProperty() {
  loading.value = true
  const response = await api.get(`/properties/${route.params.id}`)
  property.value = response.data
}

async function toggleFavorite() {
  await api.post(`/favorites/${property.value.id}`)
  actionMessage.value = 'Added to favourites!'
}

async function sendRequest() {
  sendingRequest.value = true
  actionMessage.value = ''
  try {
    await api.post(`/properties/${property.value.id}/requests`, { message: requestMessage.value })
    actionMessage.value = 'Request sent to the landlord!'
    requestMessage.value = ''
  } catch (error) {
    actionMessage.value = error.response?.data?.message || 'Could not send request'
  } finally {
    sendingRequest.value = false
  }
}

async function submitReview() {
  sendingReview.value = true
  actionMessage.value = ''
  try {
    await api.post(`/properties/${property.value.id}/reviews`, {
      rating: reviewRating.value,
      comment: reviewComment.value,
    })
    actionMessage.value = 'Review submitted!'
    reviewComment.value = ''
    await fetchProperty()
  } catch (error) {
    actionMessage.value = error.response?.data?.message || 'Could not submit review'
  } finally {
    sendingReview.value = false
  }
}

onMounted(async () => {
  await fetchProperty()
  loading.value = false
})
</script>

<template>
  <div v-if="loading" class="page state-message">{{ t('detail.loading') }}</div>

  <div v-else-if="property" class="page">
    <RouterLink to="/" class="back-link">← Back to listings</RouterLink>

    <div class="detail-grid">
      <div class="main-col">
        <div class="images" v-if="property.images.length">
          <img
            v-for="image in property.images"
            :key="image.id"
            :src="`http://127.0.0.1:8000/storage/${image.path}`"
            alt="Property photo"
          />
        </div>
        <div v-else class="images-placeholder">🏠</div>

        <div class="title-row">
          <div>
            <h1>{{ property.title }}</h1>
            <p class="address">📍 {{ property.address }}</p>
          </div>
          <span class="verified-stamp">✓ Admin Verified</span>
        </div>

        <p class="description">{{ property.description }}</p>

        <h3>{{ t('detail.details') }}</h3>
        <div class="details-grid">
          <div><span class="label">{{ t('detail.roomType') }}</span><span class="value">{{ property.room_type.replace('_', ' ') }}</span></div>
          <div><span class="label">{{ t('detail.rooms') }}</span><span class="value">{{ property.number_of_rooms }}</span></div>
          <div><span class="label">{{ t('detail.bedsPerRoom') }}</span><span class="value">{{ property.beds_per_room }}</span></div>
          <div><span class="label">{{ t('detail.availableSlots') }}</span><span class="value">{{ property.available_slots }}</span></div>
          <div v-if="property.institution"><span class="label">{{ t('detail.near') }}</span><span class="value">{{ property.institution.name }}</span></div>
        </div>

        <h3>{{ t('detail.facilities') }}</h3>
        <div class="facility-tags">
          <span v-for="facility in property.facilities" :key="facility.id" class="facility-tag">{{ facility.name }}</span>
        </div>

        <h3 v-if="property.reviews?.length">Reviews</h3>
        <div v-if="property.reviews?.length" class="reviews">
          <div v-for="review in property.reviews" :key="review.id" class="review">
            <span class="stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
            <p>{{ review.comment }}</p>
            <span class="reviewer">— {{ review.user.name }}</span>
          </div>
        </div>
      </div>

      <aside class="side-col">
        <div class="price-card">
          <span class="price">TZS {{ Number(property.price).toLocaleString() }}<span class="period">/{{ property.price_period }}</span></span>

          <p v-if="actionMessage" class="action-message">{{ actionMessage }}</p>

          <template v-if="auth.isLoggedIn && auth.role === 'student'">
            <button class="btn-outline" @click="toggleFavorite">♥ {{ t('detail.saveFavorite') }}</button>

            <div class="request-box">
              <textarea v-model="requestMessage" :placeholder="t('detail.messagePlaceholder')"></textarea>
              <button class="btn-accent" @click="sendRequest" :disabled="sendingRequest">
                {{ sendingRequest ? t('detail.sending') : t('detail.sendRequest') }}
              </button>
            </div>

            <div class="review-box">
              <h4>{{ t('detail.leaveReview') }}</h4>
              <select v-model="reviewRating">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} star{{ n > 1 ? 's' : '' }}</option>
              </select>
              <textarea v-model="reviewComment" :placeholder="t('detail.commentPlaceholder')"></textarea>
              <button class="btn-outline" @click="submitReview" :disabled="sendingReview">
                {{ sendingReview ? t('detail.submitting') : t('detail.submitReview') }}
              </button>
            </div>
          </template>

          <p v-else-if="!auth.isLoggedIn" class="login-prompt">
            <RouterLink to="/login">{{ t('nav.login') }}</RouterLink> {{ t('detail.loginToInteract') }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}
.state-message {
  text-align: center;
  color: var(--muted);
  padding: 60px 0;
}
.back-link {
  display: inline-block;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 20px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}
@media (max-width: 720px) {
  .detail-grid { grid-template-columns: 1fr; }
}
.images {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-bottom: 20px;
}
.images img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: var(--radius);
  flex-shrink: 0;
}
.images-placeholder {
  height: 140px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 20px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.title-row h1 {
  font-size: 1.8rem;
  margin-bottom: 4px;
}
.address {
  color: var(--muted);
  margin: 0;
}
.verified-stamp {
  background: var(--accent);
  color: var(--brand-dark);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 20px;
  white-space: nowrap;
  transform: rotate(3deg);
}
.description {
  margin: 20px 0;
  color: var(--ink);
}
h3 {
  font-size: 1.1rem;
  margin-top: 28px;
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.details-grid > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.label {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.value {
  font-weight: 500;
  text-transform: capitalize;
}
.facility-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.facility-tag {
  background: rgba(31, 111, 92, 0.1);
  color: var(--brand);
  font-size: 0.82rem;
  padding: 5px 12px;
  border-radius: 20px;
}
.reviews {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.review {
  border-bottom: 1px solid var(--line);
  padding-bottom: 14px;
}
.stars {
  color: var(--accent);
}
.reviewer {
  color: var(--muted);
  font-size: 0.82rem;
}
.price-card {
  background: var(--paper-raised);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.price {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--brand);
}
.period {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--muted);
}
.action-message {
  background: rgba(31, 111, 92, 0.1);
  color: var(--brand-dark);
  padding: 10px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  margin: 0;
}
.btn-outline {
  padding: 10px;
  background: transparent;
  border: 1px solid var(--brand);
  color: var(--brand);
  cursor: pointer;
}
.btn-accent {
  padding: 10px;
  background: var(--accent);
  color: var(--brand-dark);
  border: none;
  cursor: pointer;
}
.request-box, .review-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--line);
  padding-top: 12px;
}
.review-box h4 {
  margin: 0;
  font-size: 0.9rem;
}
textarea, select {
  padding: 8px;
  min-height: 50px;
}
.login-prompt {
  font-size: 0.88rem;
  color: var(--muted);
}
</style>
