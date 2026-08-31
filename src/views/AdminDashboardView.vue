<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const { t } = useI18n()

const activeTab = ref('landlords')

const pendingLandlords = ref([])
const pendingProperties = ref([])
const users = ref([])
const reports = ref([])
const activityLog = ref([])

const loading = ref(true)
const rejectionReasons = ref({})

async function fetchAll() {
  loading.value = true
  const [landlordsRes, propertiesRes, usersRes, reportsRes, activityRes] = await Promise.all([
    api.get('/admin/landlords/pending'),
    api.get('/admin/properties/pending'),
    api.get('/admin/users'),
    api.get('/admin/reports'),
    api.get('/admin/activity-log'),
  ])
  pendingLandlords.value = landlordsRes.data
  pendingProperties.value = propertiesRes.data
  users.value = usersRes.data.data
  reports.value = reportsRes.data
  activityLog.value = activityRes.data.data
  loading.value = false
}

async function verifyLandlord(id, action) {
  const payload = { action }
  if (action === 'reject') payload.rejection_reason = rejectionReasons.value[`landlord-${id}`] || ''
  await api.put(`/admin/landlords/${id}/verify`, payload)
  await fetchAll()
}

async function verifyProperty(id, action) {
  const payload = { action }
  if (action === 'reject') payload.rejection_reason = rejectionReasons.value[`property-${id}`] || ''
  await api.put(`/admin/properties/${id}/verify`, payload)
  await fetchAll()
}

async function suspendUser(id) {
  await api.put(`/admin/users/${id}/suspend`)
  await fetchAll()
}

async function reactivateUser(id) {
  await api.put(`/admin/users/${id}/reactivate`)
  await fetchAll()
}

async function resolveReport(id, status) {
  await api.put(`/admin/reports/${id}/resolve`, { status })
  await fetchAll()
}

onMounted(fetchAll)
</script>

<template>
  <div class="page">
    <h1>{{ t('admin.title') }}</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'landlords' }" @click="activeTab = 'landlords'">
        {{ t('admin.landlordsTab') }} <span class="count">{{ pendingLandlords.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'properties' }" @click="activeTab = 'properties'">
        {{ t('admin.propertiesTab') }} <span class="count">{{ pendingProperties.length }}</span>
      </button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
        {{ t('admin.usersTab') }}
      </button>
      <button :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'">
        {{ t('admin.reportsTab') }}
      </button>
      <button :class="{ active: activeTab === 'activity' }" @click="activeTab = 'activity'">
        {{ t('admin.activityTab') }}
      </button>
    </div>

    <p v-if="loading" class="state-message">Loading...</p>

    <template v-else>
      <div v-if="activeTab === 'landlords'">
        <p v-if="pendingLandlords.length === 0" class="state-message">{{ t('admin.noPendingLandlords') }}</p>
        <div v-for="profile in pendingLandlords" :key="profile.id" class="card">
          <div class="card-header">
            <div>
              <strong>{{ profile.user.name }}</strong>
              <span class="muted"> · {{ profile.user.email }}</span>
            </div>
          </div>
          <p class="muted">{{ profile.business_name }}</p>
          <p class="muted">ID: {{ profile.national_id_number }}</p>
          <a class="doc-link" :href="`http://127.0.0.1:8000/storage/${profile.id_document_path}`" target="_blank">
            View ID document ↗
          </a>
          <div class="actions">
            <button class="btn-approve" @click="verifyLandlord(profile.id, 'approve')">
              {{ t('admin.approve') }}
            </button>
            <input v-model="rejectionReasons[`landlord-${profile.id}`]" :placeholder="t('admin.rejectionReasonPlaceholder')" />
            <button class="btn-reject" @click="verifyLandlord(profile.id, 'reject')">
              {{ t('admin.rejectAction') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'properties'">
        <p v-if="pendingProperties.length === 0" class="state-message">{{ t('admin.noPendingProperties') }}</p>
        <div v-for="property in pendingProperties" :key="property.id" class="card">
          <div class="card-header">
            <strong>{{ property.title }}</strong>
            <span class="price">TZS {{ Number(property.price).toLocaleString() }}/{{ property.price_period }}</span>
          </div>
          <p class="muted">📍 {{ property.address }}</p>
          <p class="muted">By {{ property.landlord.name }} · {{ property.landlord.email }}</p>
          <div class="actions">
            <button class="btn-approve" @click="verifyProperty(property.id, 'approve')">
              {{ t('admin.approve') }}
            </button>
            <input v-model="rejectionReasons[`property-${property.id}`]" :placeholder="t('admin.rejectionReasonPlaceholder')" />
            <button class="btn-reject" @click="verifyProperty(property.id, 'reject')">
              {{ t('admin.rejectAction') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'users'" class="table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td class="muted">{{ user.email }}</td>
              <td><span class="role-pill">{{ user.role }}</span></td>
              <td><span class="status-pill" :class="user.status">{{ user.status }}</span></td>
              <td>
                <button v-if="user.status === 'active'" class="btn-reject small" @click="suspendUser(user.id)">
                  {{ t('admin.suspend') }}
                </button>
                <button v-else class="btn-approve small" @click="reactivateUser(user.id)">
                  {{ t('admin.reactivate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'reports'">
        <p v-if="reports.length === 0" class="state-message">{{ t('admin.noReports') }}</p>
        <div v-for="report in reports" :key="report.id" class="card">
          <div class="card-header">
            <span class="muted">Reported by {{ report.reporter.name }}</span>
            <span class="status-pill" :class="report.status">{{ report.status }}</span>
          </div>
          <p>{{ report.reason }}</p>
          <div v-if="report.status === 'open'" class="actions">
            <button class="btn-approve" @click="resolveReport(report.id, 'resolved')">{{ t('admin.resolve') }}</button>
            <button class="btn-reject" @click="resolveReport(report.id, 'dismissed')">{{ t('admin.dismiss') }}</button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'activity'" class="table-card">
        <ul class="activity-list">
          <li v-for="log in activityLog" :key="log.id">
            <span class="dot"></span>
            <div>
              <strong>{{ log.user?.name }}</strong> {{ log.action.replace(/_/g, ' ') }}
              <div class="timestamp">{{ new Date(log.created_at).toLocaleString() }}</div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 950px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}
.tabs {
  display: flex;
  gap: 4px;
  margin: 20px 0 28px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.tabs button {
  padding: 10px 4px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 22px;
}
.tabs button.active {
  color: var(--brand);
  border-bottom-color: var(--brand);
  font-weight: 600;
}
.count {
  background: var(--accent);
  color: var(--brand-dark);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
}
.state-message {
  color: var(--muted);
  text-align: center;
  padding: 40px 0;
}
.card {
  background: var(--paper-raised);
  border-radius: var(--radius);
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: var(--shadow);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.muted {
  color: var(--muted);
  font-size: 0.85rem;
}
.price {
  font-family: var(--font-mono);
  color: var(--brand);
  font-size: 0.85rem;
}
.doc-link {
  display: inline-block;
  font-size: 0.82rem;
  margin-top: 6px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.actions input {
  padding: 8px 10px;
  flex: 1;
  min-width: 160px;
}
.btn-approve {
  background: var(--brand);
  color: white;
  border: none;
  padding: 9px 16px;
  cursor: pointer;
}
.btn-reject {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 9px 16px;
  cursor: pointer;
}
.btn-approve.small, .btn-reject.small {
  padding: 5px 12px;
  font-size: 0.8rem;
}
.table-card {
  background: var(--paper-raised);
  border-radius: var(--radius);
  padding: 8px 20px;
  box-shadow: var(--shadow);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
  padding: 12px 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
}
td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--line);
}
.role-pill {
  background: var(--paper);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  text-transform: capitalize;
}
.status-pill {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: 3px 10px;
  border-radius: 20px;
}
.status-pill.active, .status-pill.resolved { background: rgba(31, 111, 92, 0.15); color: var(--brand); }
.status-pill.suspended, .status-pill.dismissed { background: rgba(192, 57, 43, 0.12); color: var(--danger); }
.status-pill.open { background: rgba(232, 163, 61, 0.2); color: var(--accent-dark); }
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.activity-list li {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  margin-top: 6px;
  flex-shrink: 0;
}
.timestamp {
  color: var(--muted);
  font-size: 0.78rem;
  margin-top: 2px;
}
</style>
