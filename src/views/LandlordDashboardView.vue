<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const { t } = useI18n()

const activeTab = ref('listings')

const listings = ref([])
const requests = ref([])
const institutions = ref([])
const facilities = ref([])

const loadingListings = ref(true)
const loadingRequests = ref(true)

const form = ref({
  title: '', description: '', address: '', price: '', price_period: 'month',
  room_type: 'single', number_of_rooms: 1, beds_per_room: 1, available_slots: 1,
  institution_id: '', facility_ids: [],
})
const photoFiles = ref([])
const submitting = ref(false)
const formMessage = ref('')

async function fetchListings() {
  loadingListings.value = true
  const response = await api.get('/landlord/properties')
  listings.value = response.data
  loadingListings.value = false
}

async function fetchRequests() {
  loadingRequests.value = true
  const response = await api.get('/landlord/requests')
  requests.value = response.data
  loadingRequests.value = false
}

async function fetchLookups() {
  const [institutionsRes, facilitiesRes] = await Promise.all([
    api.get('/institutions'),
    api.get('/facilities'),
  ])
  institutions.value = institutionsRes.data
  facilities.value = facilitiesRes.data
}

function handlePhotoChange(event) {
  photoFiles.value = Array.from(event.target.files)
}

async function submitListing() {
  submitting.value = true
  formMessage.value = ''
  try {
    const data = new FormData()
    Object.entries(form.value).forEach(([key, value]) => {
      if (key === 'facility_ids') {
        value.forEach((id) => data.append('facility_ids[]', id))
      } else if (value !== '' && value !== null) {
        data.append(key, value)
      }
    })
    photoFiles.value.forEach((file) => data.append('images[]', file))

    await api.post('/landlord/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    formMessage.value = 'Listing submitted, awaiting admin verification.'
    form.value = {
      title: '', description: '', address: '', price: '', price_period: 'month',
      room_type: 'single', number_of_rooms: 1, beds_per_room: 1, available_slots: 1,
      institution_id: '', facility_ids: [],
    }
    photoFiles.value = []
    await fetchListings()
  } catch (error) {
    const errors = error.response?.data?.errors
    formMessage.value = errors ? Object.values(errors).flat().join(' ') : 'Failed to submit listing'
  } finally {
    submitting.value = false
  }
}

async function respondToRequest(requestId, action) {
  await api.put(`/landlord/requests/${requestId}`, { action })
  await fetchRequests()
}

onMounted(async () => {
  await fetchListings()
  await fetchRequests()
  await fetchLookups()
})
</script>

<template>
  <div class="page">
    <h1>{{ t('landlord.title') }}</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'listings' }" @click="activeTab = 'listings'">
        {{ t('landlord.myListings') }} <span class="count">{{ listings.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">
        + {{ t('landlord.addListing') }}
      </button>
      <button :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
        {{ t('landlord.requestsTab') }} <span class="count">{{ requests.filter(r => r.status === 'pending').length }}</span>
      </button>
    </div>

    <div v-if="activeTab === 'listings'">
      <p v-if="loadingListings" class="state-message">Loading...</p>
      <p v-else-if="listings.length === 0" class="state-message">{{ t('landlord.noListings') }}</p>
      <div v-else class="listing-grid">
        <div v-for="listing in listings" :key="listing.id" class="listing-card">
          <div class="listing-header">
            <h3>{{ listing.title }}</h3>
            <span class="status-pill" :class="listing.status">{{ listing.status }}</span>
          </div>
          <p class="address">📍 {{ listing.address }}</p>
          <p class="price">TZS {{ Number(listing.price).toLocaleString() }} <span>/ {{ listing.price_period }}</span></p>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'add'" class="form-card">
      <form @submit.prevent="submitListing">
        <div class="form-row">
          <label>{{ t('landlord.listingTitle') }}</label>
          <input v-model="form.title" required />
        </div>

        <div class="form-row">
          <label>{{ t('landlord.description') }}</label>
          <textarea v-model="form.description"></textarea>
        </div>

        <div class="form-row">
          <label>{{ t('landlord.address') }}</label>
          <input v-model="form.address" required />
        </div>

        <div class="form-row">
          <label>{{ t('landlord.institution') }}</label>
          <select v-model="form.institution_id">
            <option value="">—</option>
            <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.name }}</option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-row">
            <label>{{ t('landlord.price') }}</label>
            <input v-model="form.price" type="number" required />
          </div>
          <div class="form-row">
            <label>{{ t('landlord.pricePeriod') }}</label>
            <select v-model="form.price_period">
              <option value="month">{{ t('landlord.perMonth') }}</option>
              <option value="semester">{{ t('landlord.perSemester') }}</option>
              <option value="year">{{ t('landlord.perYear') }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <label>{{ t('landlord.roomType') }}</label>
          <select v-model="form.room_type">
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quadruple">Quadruple</option>
            <option value="self_contained">Self-contained</option>
            <option value="shared">Shared</option>
          </select>
        </div>

        <div class="form-grid three">
          <div class="form-row">
            <label>{{ t('landlord.numberOfRooms') }}</label>
            <input v-model="form.number_of_rooms" type="number" min="1" required />
          </div>
          <div class="form-row">
            <label>{{ t('landlord.bedsPerRoom') }}</label>
            <input v-model="form.beds_per_room" type="number" min="1" required />
          </div>
          <div class="form-row">
            <label>{{ t('landlord.availableSlots') }}</label>
            <input v-model="form.available_slots" type="number" min="0" required />
          </div>
        </div>

        <div class="form-row">
          <label>{{ t('detail.facilities') }}</label>
          <div class="facility-grid">
            <label v-for="facility in facilities" :key="facility.id" class="facility-check">
              <input type="checkbox" :value="facility.id" v-model="form.facility_ids" />
              {{ facility.name }}
            </label>
          </div>
        </div>

        <div class="form-row">
          <label>{{ t('landlord.photos') }}</label>
          <input type="file" multiple accept="image/*" @change="handlePhotoChange" />
        </div>

        <p v-if="formMessage" class="form-message">{{ formMessage }}</p>

        <button type="submit" class="btn-accent" :disabled="submitting">
          {{ submitting ? t('landlord.submitting') : t('landlord.submitListing') }}
        </button>
      </form>
    </div>

    <div v-else-if="activeTab === 'requests'">
      <p v-if="loadingRequests" class="state-message">Loading...</p>
      <p v-else-if="requests.length === 0" class="state-message">{{ t('landlord.noRequests') }}</p>
      <div v-else class="request-list">
        <div v-for="req in requests" :key="req.id" class="request-card">
          <div class="request-header">
            <div>
              <strong>{{ req.student.name }}</strong>
              <span class="muted"> · {{ req.student.email }}</span>
            </div>
            <span class="status-pill" :class="req.status">{{ req.status }}</span>
          </div>
          <p class="muted">{{ req.property.title }}</p>
          <p v-if="req.message" class="quote">"{{ req.message }}"</p>
          <div v-if="req.status === 'pending'" class="request-actions">
            <button class="btn-accent small" @click="respondToRequest(req.id, 'accept')">{{ t('landlord.accept') }}</button>
            <button class="btn-outline small" @click="respondToRequest(req.id, 'reject')">{{ t('landlord.reject') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin: 20px 0 28px;
  border-bottom: 1px solid var(--line);
}
.tabs button {
  padding: 10px 4px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.92rem;
  margin-right: 20px;
}
.tabs button.active {
  color: var(--brand);
  border-bottom-color: var(--brand);
  font-weight: 600;
}
.count {
  background: var(--paper);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.75rem;
}
.state-message {
  color: var(--muted);
  text-align: center;
  padding: 40px 0;
}
.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}
.listing-card, .request-card, .form-card {
  background: var(--paper-raised);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
}
.listing-header, .request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.listing-header h3 {
  font-size: 1rem;
  margin: 0;
}
.address {
  color: var(--muted);
  font-size: 0.85rem;
}
.price {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--brand);
}
.price span {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.8rem;
}
.status-pill {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.status-pill.pending { background: rgba(232, 163, 61, 0.2); color: var(--accent-dark); }
.status-pill.verified, .status-pill.accepted { background: rgba(31, 111, 92, 0.15); color: var(--brand); }
.status-pill.rejected { background: rgba(192, 57, 43, 0.12); color: var(--danger); }
.form-card {
  max-width: 560px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.form-row label {
  font-size: 0.82rem;
  font-weight: 500;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-grid.three {
  grid-template-columns: 1fr 1fr 1fr;
}
input, select, textarea {
  padding: 9px 11px;
  width: 100%;
}
.facility-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.facility-check {
  flex-direction: row !important;
  align-items: center;
  gap: 6px !important;
  font-weight: 400 !important;
  font-size: 0.88rem;
}
.form-message {
  background: rgba(31, 111, 92, 0.1);
  color: var(--brand-dark);
  padding: 10px;
  border-radius: var(--radius);
  font-size: 0.85rem;
}
.btn-accent {
  padding: 11px 22px;
  background: var(--accent);
  color: var(--brand-dark);
  border: none;
  cursor: pointer;
  font-size: 0.92rem;
}
.btn-outline {
  padding: 11px 22px;
  background: transparent;
  border: 1px solid var(--brand);
  color: var(--brand);
  cursor: pointer;
}
.btn-accent.small, .btn-outline.small {
  padding: 7px 14px;
  font-size: 0.85rem;
}
.request-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.muted {
  color: var(--muted);
  font-size: 0.85rem;
}
.quote {
  font-style: italic;
  color: var(--ink);
  background: var(--paper);
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 0.88rem;
}
.request-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>
