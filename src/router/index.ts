import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
<<<<<<< HEAD
      redirect: '/login' // Send users to the login screen first
=======
      redirect: '/freelancer'
>>>>>>> 8dbbb95ee4739b8cd2192e3d4d081bc91dabccfa
    },

    {
      path: '/pay/:id',
      name: 'secure-checkout',
      component: () => import('@/views/TransactionCheckoutView.vue')
    },
    // Application Dashboard
    {
      path: '/login',
      name: 'login',
      component: LoginView // Registers your new UI
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
        }
      ]
    }
  ],
})

export default router