import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue' // <-- ADD THIS BACK

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', // <-- ADD THIS BACK
      name: 'login',
      component: LoginView 
    },
    {
      path: '/',
      redirect: '/login' // <-- SEND USERS TO LOGIN FIRST
    },
    {
      path: '/pay/:id',
      name: 'secure-checkout',
      component: () => import('@/views/TransactionCheckoutView.vue')
    },
    {
      path: '/dashboard', 
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: '/freelancer',
          name: 'freelancer-dashboard',
          component: () => import('@/views/FreelancerDashboard.vue')
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/views/AnalyticsView.vue')
        },
        {
          path: '/client',
          name: 'client-dashboard',
          component: () => import('@/views/ClientDashboard.vue')
        },
        {
          path: 'create-seal',
          name: 'create-seal',
          component: () => import('@/views/CreateSealView.vue')
        },
        {
          path: 'seal/:id',
          name: 'seal-detail',
          component: () => import('@/views/SealDetailView.vue')
        },
        {
          path: 'notifications', 
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue')
        }
      ]
    }
  ],
})

export default router