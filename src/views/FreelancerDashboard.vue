<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { getFreelancerMetrics } from '@/services/dashboardService'

const router = useRouter()

// State management
const isLoading = ref(true)
const freelancerName = ref('Freelancer')

// Empty data containers waiting to be filled
const earningsData = ref({ amount: '', trend: '', completedThisMonth: 0 })
const activeProjectsData = ref({ total: 0, nearDeadline: [] as any[] })
const transactionsData = ref([] as any[])

// Real Seals Data
const activeSealsList = ref<any[]>([])

// Helper function to match your UI colors to real database statuses
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending review': return 'bg-amber-100 text-amber-700'
    case 'Awaiting funding': return 'bg-blue-100 text-blue-700'
    case 'In progress': return 'bg-indigo-100 text-indigo-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// Fetch data when the component loads
onMounted(async () => {
  try {
    isLoading.value = true

    // 1. Get the securely authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) throw new Error('User not authenticated')

    // 2. Fetch the user's Profile (for full_name) and their Active Seals concurrently
    const [profileRes, sealsRes, metrics] = await Promise.all([
      supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', user.id)
        .single(),
      
      supabase
        .from('Seals')
        .select('id, project_name, project_type, start_date, total_amount, status')
        .eq('freelancer_id', user.id)
        .neq('status', 'Completed') 
        .neq('status', 'Cancelled')
        .order('created_at', { ascending: false }),
        
      getFreelancerMetrics() 
    ])

    // Handle Profile Name
    if (profileRes.data && profileRes.data.full_name) {
      freelancerName.value = profileRes.data.full_name.split(' ')[0]
    }

    // Handle Active Seals mapped to your UI structure
    if (sealsRes.data) {
      activeSealsList.value = sealsRes.data.map(seal => ({
        id: seal.id,
        title: seal.project_name,
        subtitle: seal.project_type || 'General Project',
        date: new Date(seal.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: `₱${seal.total_amount.toLocaleString()}`,
        status: seal.status,
        statusBg: getStatusColor(seal.status)
      }))
    }

    // Assign mock metrics data
    earningsData.value = metrics.earnings
    activeProjectsData.value = metrics.projects
    transactionsData.value = metrics.transactions
    
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
  } finally {
    isLoading.value = false 
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
        Welcome Back, {{ freelancerName }}!
      </h2>
      <p class="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <div 
        @click="router.push({ name: 'analytics' })" 
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-seal-teal hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-52"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
            <div class="flex items-center space-x-2">
              <h3 class="text-2xl font-bold text-gray-900">{{ earningsData.amount }}</h3>
              <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{{ earningsData.trend }}</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-500"><span class="font-bold text-gray-700">{{ earningsData.completedThisMonth }}</span> completed seals this month</p>
        </div>
      </div>

      <div 
        @click="router.push({ name: 'my-seals' })" 
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-seal-teal hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-52"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Active Seals</p>
            <h3 
              @click.stop="router.push({ name: 'analytics' })" 
              class="text-2xl font-bold text-gray-900 hover:text-seal-teal transition-colors"
              title="View Calendar"
            >
              {{ activeProjectsData.total }} Projects
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t border-gray-50">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Near Deadline</p>
          <div 
            v-for="seal in activeProjectsData.nearDeadline" 
            :key="seal.id"
            @click.stop="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="flex justify-between items-center text-sm py-0.5 hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
          >
            <span class="font-medium text-gray-700 truncate mr-2">{{ seal.name }}</span>
            <span class="text-xs text-red-500 font-semibold whitespace-nowrap">{{ seal.date }}</span>
          </div>
        </div>
      </div>

      <div 
        @click="router.push({ name: 'history' })" 
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-seal-teal hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-52"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Transaction History</p>
            <h3 class="text-2xl font-bold text-gray-900">Recent</h3>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t border-gray-50">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latest Alerts</p>
          <div 
            v-for="tx in transactionsData" 
            :key="tx.id"
            @click.stop="router.push(`/seal/${tx.projectId}`)"
            class="py-0.5 hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
          >
            <p class="text-sm font-medium text-gray-700 truncate">{{ tx.message }}</p>
            <p class="text-[10px] text-gray-400">{{ tx.time }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900">Active Seals</h3>
        <button @click="router.push('/my-seals')" class="text-sm font-semibold text-seal-teal hover:underline">View All</button>
      </div>
      
      <div v-if="isLoading" class="p-6 text-center text-gray-500 text-sm">
        Loading your active seals...
      </div>

      <div v-else-if="activeSealsList.length === 0" class="p-8 text-center">
        <p class="text-gray-500 text-sm mb-4">You don't have any active seals right now.</p>
        <button @click="router.push('/create-seal')" class="bg-seal-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
          Create a New Seal
        </button>
      </div>

      <div v-else class="divide-y divide-gray-50">
        <div v-for="seal in activeSealsList" :key="seal.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" @click="router.push({ name: 'seal-detail', params: { id: seal.id } })">
          
          <div class="w-1/3">
            <p class="font-bold text-gray-900">{{ seal.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ seal.subtitle }}</p>
          </div>

          <div class="w-1/4 text-sm text-gray-600 font-medium">
            {{ seal.date }}
          </div>

          <div class="w-1/4 text-sm font-bold text-gray-900">
            {{ seal.amount }}
          </div>

          <div class="w-1/6 flex justify-end">
            <span :class="['text-xs font-bold px-3 py-1.5 rounded-full', seal.statusBg]">
              {{ seal.status }}
            </span>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>