import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', 
      name: 'login',
      component: LoginView 
    },
    {
      path: '/',
      redirect: '/login' 
    },
    {
      path: '/payment-success',
      name: 'payment-success',
      component: () => import('@/views/PaymentSuccessView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pay/:id',
      name: 'secure-checkout',
      component: () => import('@/views/TransactionCheckoutView.vue')
    },
    // Moved to top-level to perfectly match your shareable links!
    {
      path: '/seal/:id',
      name: 'seal-detail',
      component: () => import('@/views/SealDetailView.vue')
    },
    {
      path: '/dashboard', 
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: 'freelancer', 
          name: 'freelancer-dashboard',
          component: () => import('@/views/FreelancerDashboard.vue')
        },
        {
          path: 'my-seals',
          name: 'my-seals',
          component: () => import('@/views/MySealsView.vue')
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/views/AnalyticsView.vue')
        },
        {
          path: 'client', 
          name: 'client-dashboard',
          component: () => import('@/views/ClientDashboard.vue')
        },
        {
          path: 'create-seal',
          name: 'create-seal',
          component: () => import('@/views/CreateSealView.vue')
        },
        {
          path: 'notifications', 
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue')
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/HistoryView.vue')
        },
        {
          path: 'profile', 
          name: 'profile',
          component: () => import('@/views/ProfileView.vue')
        },
        {
          path: 'settings', 
          name: 'settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
      
    }
  ],
})

export default router