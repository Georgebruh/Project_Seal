<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()

// State management
const isLoading = ref(true)
const freelancerName = ref('Freelancer')

// Real reactive data containers
const earningsData = ref({ amount: '₱0', trend: 'Updated', completedThisMonth: 0 })
const activeProjectsData = ref({ total: 0, nearDeadline: [] as any[] })
const transactionsData = ref([] as any[])

// Real Seals Data
const activeSealsList = ref<any[]>([])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending review': return 'bg-amber-100 text-amber-700'
    case 'Awaiting funding': return 'bg-blue-100 text-blue-700'
    case 'In progress': return 'bg-indigo-100 text-indigo-700'
    case 'Pending output review': return 'bg-purple-100 text-purple-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

onMounted(async () => {
  try {
    isLoading.value = true

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // Fetch Profile, Active Seals, Completed Seals, and Recent Transactions concurrently
    const [profileRes, activeSealsRes, completedSealsRes, recentTransactionsRes] = await Promise.all([
      supabase.from('Profiles').select('full_name').eq('id', user.id).single(),
      
      supabase
        .from('Seals')
        .select('id, project_name, project_type, start_date, end_date, total_amount, status')
        .eq('freelancer_id', user.id)
        .neq('status', 'Completed') 
        .neq('status', 'Cancelled')
        .order('created_at', { ascending: false }),

      supabase
        .from('Seals')
        .select('total_amount, end_date')
        .eq('freelancer_id', user.id)
        .eq('status', 'Completed'),
        
      // NEW: Fetch the 2 most recently updated seals
      supabase
        .from('Seals')
        .select('id, project_name, status, updated_at')
        .eq('freelancer_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(2)
    ])

    if (profileRes.data && profileRes.data.full_name) {
      freelancerName.value = profileRes.data.full_name.split(' ')[0]
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    if (activeSealsRes.data) {
      const nearDeadlineList: any[] = []

      activeSealsList.value = activeSealsRes.data.map(seal => {
        if (seal.end_date) {
          const endDate = new Date(seal.end_date)
          endDate.setHours(0, 0, 0, 0)
          if (endDate >= today && endDate <= threeDaysFromNow) {
            nearDeadlineList.push({
              id: seal.id,
              name: seal.project_name,
              date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            })
          }
        }
        return {
          id: seal.id,
          title: seal.project_name,
          subtitle: seal.project_type || 'General Project',
          date: new Date(seal.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: `₱${seal.total_amount.toLocaleString()}`,
          status: seal.status,
          statusBg: getStatusColor(seal.status)
        }
      })

      activeProjectsData.value = {
        total: activeSealsRes.data.length,
        // .slice(0, 3) ensures it never returns more than 3 items
        nearDeadline: nearDeadlineList.slice(0, 3)
      }
    }

    if (completedSealsRes.data) {
      let totalEarnings = 0
      let completedThisMonthCount = 0

      completedSealsRes.data.forEach(seal => {
        totalEarnings += Number(seal.total_amount || 0)
        if (seal.end_date) {
          const endDate = new Date(seal.end_date)
          if (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) {
            completedThisMonthCount++
          }
        }
      })

      earningsData.value = {
        amount: `₱${totalEarnings.toLocaleString()}`,
        trend: 'Up to date',
        completedThisMonth: completedThisMonthCount
      }
    }

    // NEW: Map real recent transactions to the UI
    if (recentTransactionsRes.data) {
      transactionsData.value = recentTransactionsRes.data.map(tx => {
        const date = new Date(tx.updated_at || new Date())
        return {
          id: tx.id,
          projectId: tx.id,
          message: `${tx.project_name} updated to ${tx.status}`,
          time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }
      })
    }
    
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
      <p class="text-gray-600 mt-1 font-medium">Here's what's happening with your projects today.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <div 
        @click="router.push({ name: 'analytics' })" 
        class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg hover:border-seal-teal hover:shadow-2xl hover:bg-white/90 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-52 group"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">Total Earnings</p>
            <div class="flex items-center space-x-2">
              <h3 class="text-2xl font-bold text-gray-900">{{ earningsData.amount }}</h3>
              <span class="text-xs font-bold text-green-700 bg-green-100/80 px-2 py-1 rounded-full">{{ earningsData.trend }}</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50/80 text-green-600 shadow-sm border border-white/50 group-hover:scale-110 group-hover:bg-green-100 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-white/40">
          <p class="text-xs text-gray-600"><span class="font-bold text-gray-800">{{ earningsData.completedThisMonth }}</span> completed seals this month</p>
        </div>
      </div>

      <div 
        @click="router.push({ name: 'my-seals' })" 
        class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg hover:border-seal-teal hover:shadow-2xl hover:bg-white/90 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-52 group"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">Active Seals</p>
            <h3 
              @click.stop="router.push({ name: 'analytics' })" 
              class="text-2xl font-bold text-gray-900 hover:text-seal-teal transition-colors"
              title="View Calendar"
            >
              {{ activeProjectsData.total }} Projects
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50/80 text-orange-600 shadow-sm border border-white/50 group-hover:scale-110 group-hover:bg-orange-100 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t border-white/40">
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Near Deadline</p>
          <div 
            v-for="seal in activeProjectsData.nearDeadline" 
            :key="seal.id"
            @click.stop="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="flex justify-between items-center text-sm py-0.5 hover:bg-white/50 rounded px-1 -mx-1 transition-colors"
          >
            <span class="font-medium text-gray-800 truncate mr-2">{{ seal.name }}</span>
            <span class="text-xs text-red-600 font-semibold whitespace-nowrap">{{ seal.date }}</span>
          </div>
        </div>
      </div>

      <div 
        @click="router.push({ name: 'history' })" 
        class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg hover:border-seal-teal hover:shadow-2xl hover:bg-white/90 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-52 group"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">Transaction History</p>
            <h3 class="text-2xl font-bold text-gray-900">Recent</h3>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50/80 text-blue-600 shadow-sm border border-white/50 group-hover:scale-110 group-hover:bg-blue-100 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
        </div>
        <div class="mt-2 pt-3 border-t border-white/40">
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Latest Alerts</p>
          <div 
            v-for="tx in transactionsData" 
            :key="tx.id"
            @click.stop="router.push(`/seal/${tx.projectId}`)"
            class="py-0.5 hover:bg-white/50 rounded px-1 -mx-1 transition-colors"
          >
            <p class="text-sm font-medium text-gray-800 truncate">{{ tx.message }}</p>
            <p class="text-[10px] text-gray-500">{{ tx.time }}</p>
          </div>
        </div>
      </div>

    </div>

    <div class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-white/40 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900">Active Seals</h3>
        <button @click="router.push({ name: 'my-seals' })" class="text-sm font-semibold text-seal-teal hover:underline">View All</button>
      </div>
      
      <div v-if="isLoading" class="p-6 text-center text-gray-600 font-medium text-sm">
        Loading your active seals...
      </div>

      <div v-else-if="activeSealsList.length === 0" class="p-8 text-center">
        <p class="text-gray-500 text-sm mb-4">You don't have any active seals right now.</p>
        <button @click="router.push({ name: 'create-seal' })" class="bg-seal-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
          Create a New Seal
        </button>
      </div>

      <div v-else class="divide-y divide-white/40">
        <div v-for="seal in activeSealsList" :key="seal.id" class="px-6 py-4 flex items-center justify-between hover:bg-white/60 transition-colors cursor-pointer" @click="router.push({ name: 'seal-detail', params: { id: seal.id } })">
          
          <div class="w-1/3">
            <p class="font-bold text-gray-900">{{ seal.title }}</p>
            <p class="text-xs text-gray-600 mt-0.5 font-medium">{{ seal.subtitle }}</p>
          </div>

          <div class="w-1/4 text-sm text-gray-700 font-medium">
            {{ seal.date }}
          </div>

          <div class="w-1/4 text-sm font-bold text-gray-900">
            {{ seal.amount }}
          </div>

          <div class="w-1/6 flex justify-end">
            <span :class="['text-xs font-bold px-3 py-1.5 rounded-full shadow-sm', seal.statusBg]">
              {{ seal.status }}
            </span>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>