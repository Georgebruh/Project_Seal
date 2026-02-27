import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/freelancer'
    },

    {
      path: '/pay/:id',
      name: 'secure-checkout',
      component: () => import('@/views/TransactionCheckoutView.vue')
    },
    // Application Dashboard
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