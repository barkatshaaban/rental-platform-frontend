import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PropertyDetailView from '../views/PropertyDetailView.vue'
import LandlordDashboardView from '../views/LandlordDashboardView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/properties/:id', name: 'property-detail', component: PropertyDetailView },
    { path: '/landlord/dashboard', name: 'landlord-dashboard', component: LandlordDashboardView },
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboardView },
  ],
})

export default router
