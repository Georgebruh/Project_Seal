<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getClientDashboardData, type ClientDashboardData } from '@/services/dashboardService'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const dashboardData = ref<ClientDashboardData | null>(null) 

onMounted(async () => {
  try {
    const userId = authStore.user?.id;  
    if (!userId) {
      console.warn("User ID not found. Ensure the user is logged in.");

      return;
    }

    dashboardData.value = await getClientDashboardData(userId)
  } catch (error) {
    console.error('Error fetching client dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})


// Navigation Handlers
const goToActiveSeals = () => {
  router.push({ name: 'my-seals', query: { tab: 'active' } })
}

const goToPendingReview = () => {
  router.push({ name: 'my-seals', query: { tab: 'review' } })
}
const goToSealDetail = (id: number) => {
  router.push({ 
    name: 'seal-detail', // The name defined in your router config
    params: { id: id.toString() } 
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    
    <div>
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
        Welcome back, {{ authStore.user?.user_metadata.full_name || authStore.user?.full_name || 'Client' }}!
      </h2>
      <p class="text-gray-500 mt-1">{{ authStore.user?.email || 'client@example.com' }}</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div 
          @click="goToActiveSeals"
          class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Active Seals (In Progress)</h3>
              <p class="text-sm text-gray-500">Fully funded seals currently being worked on</p>
            </div>
            <div class="text-3xl font-bold text-blue-600">{{ dashboardData?.activeSeals.total }}</div>
          </div>
          
          <div class="space-y-2 mt-4">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Recent</div>
            <div 
              v-for="seal in dashboardData?.activeSeals.top" 
              :key="seal.id"
              @click.stop="goToSealDetail(seal.id)"
              class="flex justify-between text-sm p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span class="font-medium text-gray-900">{{ seal.title }}</span>
              <span class="text-gray-500">{{ seal.freelancerName }}</span>
            </div>
          </div>
        </div>

        <div 
          @click="goToPendingReview"
          class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Pending Review</h3>
              <p class="text-sm text-gray-500">Awaiting your approval to release funds</p>
            </div>
            <div class="text-3xl font-bold text-purple-600">{{ dashboardData?.pendingReview.total }}</div>
          </div>

          <div class="space-y-2 mt-4">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Activities</div>
            <div 
              v-for="seal in dashboardData?.pendingReview.top" 
              :key="seal.id"
              @click.stop="goToSealDetail(seal.id)"
              class="flex justify-between text-sm p-2 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              <span class="font-medium text-gray-900">{{ seal.title }}</span>
              <span class="text-gray-500">{{ seal.freelancerName }}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Recent Seals</h3>
        </div>
        
        <div class="divide-y divide-gray-50">
          <div 
            v-for="seal in dashboardData?.sealsList" 
            :key="seal.id" 
            class="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h4 class="text-md font-bold text-gray-900">{{ seal.title }}</h4>
              <div class="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span class="font-medium text-gray-700">From: {{ seal.freelancerName }}</span>
                <span>•</span>
                <span>{{ seal.date }}</span>
              </div>
            </div>
            
            <div class="text-left sm:text-right">
              <div class="text-lg font-bold text-gray-900">{{ seal.amount }}</div>
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-medium mt-1.5', seal.statusBg]">
                {{ seal.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <button 
            @click="router.push({ name: 'my-seals' })"
            class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Seals
          </button>
        </div>
      </div>

    </template>
  </div>
</template>