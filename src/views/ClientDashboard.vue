<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)

// Reactive states for real data
const activeSealsCount = ref(0)
const activeSealsTop = ref<any[]>([])

const pendingReviewCount = ref(0)
const pendingReviewTop = ref<any[]>([])

const recentSealsList = ref<any[]>([])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending review': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'Awaiting funding': return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'In progress': return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
    case 'Pending output review': return 'bg-purple-100 text-purple-700 border border-purple-200' // NEW PURPLE BADGE
    case 'Completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200'
    default: return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // Fetch all seals where this user is the client from the REAL database
    const { data: sealsData, error: sealsError } = await supabase
      .from('Seals')
      .select('*')
      .eq('client_id', user.id)
      .order('updated_at', { ascending: false })

    if (sealsError) throw sealsError

    if (sealsData) {
      // 1. Filter Active Seals (Funded/Working, Awaiting Deposit, or Pending Output Review)
      const active = sealsData.filter(s => ['In progress', 'Awaiting funding', 'Pending output review'].includes(s.status))
      activeSealsCount.value = active.length
      activeSealsTop.value = active.slice(0, 3) // Top 3 most recent

      // 2. Filter Pending Review (Needs client contract review)
      const review = sealsData.filter(s => ['Pending review', 'Pending output review'].includes(s.status))
      pendingReviewCount.value = review.length
      pendingReviewTop.value = review.slice(0, 3) // Ensures only 3 display

      // 3. Map the 5 most recent seals for the list UI
      recentSealsList.value = sealsData.slice(0, 5).map(seal => ({
        id: seal.id,
        title: seal.project_name,
        freelancerName: seal.freelancer_name || 'Freelancer',
        date: new Date(seal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: `₱${(seal.total_amount || 0).toLocaleString()}`,
        status: seal.status,
        statusBg: getStatusColor(seal.status)
      }))
    }
  } catch (error) {
    console.error('Error fetching client dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})

// Navigation Handlers (ID is correctly handled as a string now)
const goToActiveSeals = () => router.push({ name: 'my-seals', query: { tab: 'active' } })
const goToPendingReview = () => router.push({ name: 'my-seals', query: { tab: 'review' } })
const goToSealDetail = (id: string) => router.push(`/seal/${id}`)
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    
    <div>
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
        Welcome back, {{ authStore.user?.user_metadata.full_name || authStore.user?.full_name || 'Client' }}!
      </h2>
      <p class="text-gray-600 mt-1 font-medium">{{ authStore.user?.email || 'Secure Client Dashboard' }}</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-seal-teal"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div 
          @click="goToActiveSeals"
          class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Active Seals</h3>
              <p class="text-sm text-gray-600">Funded and working projects</p>
            </div>
            <div class="text-3xl font-bold text-blue-600">{{ activeSealsCount }}</div>
          </div>
          
          <div class="space-y-2 mt-4">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Recent</div>
            <div v-if="activeSealsTop.length === 0" class="text-sm text-gray-400 py-2">No active projects.</div>
            <div 
              v-for="seal in activeSealsTop" 
              :key="seal.id"
              @click.stop="goToSealDetail(seal.id)"
              class="flex justify-between text-sm p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
            >
              <span class="font-medium text-gray-900">{{ seal.project_name }}</span>
              <span class="text-gray-600">{{ seal.freelancer_name }}</span>
            </div>
          </div>
        </div>

        <div 
          @click="goToPendingReview"
          class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all cursor-pointer group"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Pending Review</h3>
              <p class="text-sm text-gray-600">Projects awaiting your review</p>
            </div>
            <div class="text-3xl font-bold text-purple-600">{{ pendingReviewCount }}</div>
          </div>

          <div class="space-y-2 mt-4">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Needed</div>
            <div v-if="pendingReviewTop.length === 0" class="text-sm text-gray-400 py-2">You're all caught up!</div>
            <div 
              v-for="seal in pendingReviewTop" 
              :key="seal.id"
              @click.stop="goToSealDetail(seal.id)"
              class="flex justify-between text-sm p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
            >
              <span class="font-medium text-gray-900">{{ seal.project_name }}</span>
              <span class="text-gray-600">{{ seal.freelancer_name }}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div class="px-6 py-5 border-b border-white/40">
          <h3 class="text-lg font-bold text-gray-900">Recent Seals</h3>
        </div>
        
        <div v-if="recentSealsList.length === 0" class="p-12 text-center">
          <p class="text-gray-500 font-medium">No recent seal history.</p>
        </div>

        <div v-else class="divide-y divide-white/40">
          <div 
            v-for="seal in recentSealsList" 
            :key="seal.id" 
            @click="goToSealDetail(seal.id)"
            class="p-6 hover:bg-white/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
          >
            <div>
              <h4 class="text-md font-bold text-gray-900">{{ seal.title }}</h4>
              <div class="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <span class="font-medium text-gray-800">From: {{ seal.freelancerName }}</span>
                <span>•</span>
                <span>{{ seal.date }}</span>
              </div>
            </div>
            
            <div class="text-left sm:text-right">
              <div class="text-lg font-bold text-gray-900">{{ seal.amount }}</div>
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-medium mt-1.5 shadow-sm', seal.statusBg]">
                {{ seal.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-white/40 bg-white/30 text-center">
          <button 
            @click="router.push('/dashboard/my-seals')"
            class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

    </template>
  </div>
</template>