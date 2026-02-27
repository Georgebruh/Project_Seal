import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // Send users to the login screen first
    },
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
        }
      ]
    }
  ],
})

export default router