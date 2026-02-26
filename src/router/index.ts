import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/freelancer' // Redirect root to dashboard for now
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      children: [
        {
          path: 'freelancer',
          name: 'freelancer-dashboard',
          component: () => import('@/views/FreelancerDashboard.vue')
        },
        {
          path: 'client',
          name: 'client-dashboard',
          component: () => import('@/views/ClientDashboard.vue')
        },
        // NEW ROUTE ADDED HERE
        {
          path: 'create-seal',
          name: 'create-seal',
          component: () => import('@/views/CreateSealView.vue')
        }
      ]
    }
  ],
})

export default router