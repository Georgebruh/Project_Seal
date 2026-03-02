<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const searchQuery = ref('')
const allSeals = ref<any[]>([])

onMounted(async () => {
  try {
    isLoading.value = true
    
    // 1. Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // 2. Query based on role
    const roleColumn = authStore.activeRole === 'client' ? 'client_id' : 'freelancer_id'

    // 3. Fetch seals
    const { data: sealsData, error: sealsError } = await supabase
      .from('Seals')
      .select('*')
      .eq(roleColumn, user.id)
      .order('created_at', { ascending: false })

    if (sealsError) throw sealsError

    // 4. Map to UI structure
    if (sealsData) {
      allSeals.value = sealsData.map(seal => {
        const shortId = seal.id.substring(0, 8).toUpperCase()
        
        let counterpartName = ''
        if (authStore.activeRole === 'client') {
          counterpartName = seal.freelancer_id ? (seal.freelancer_name || 'Freelancer') : 'Awaiting Freelancer'
        } else {
          counterpartName = seal.client_id ? (seal.client_name || 'Client') : 'Awaiting Client'
        }
        
        return { 
          id: seal.id, 
          displayId: `SEAL-${shortId}`,
          title: seal.project_name, 
          counterpart: counterpartName, 
          amount: seal.total_amount, 
          status: seal.status, 
          nextMilestone: getMilestoneMessage(seal.status, authStore.activeRole)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching seals:', error)
  } finally {
    isLoading.value = false
  }
})


const filteredSeals = computed(() => {
  
  let list = [...allSeals.value]

 
  const activeTab = route.query.tab
  if (activeTab === 'active') {
    list = list.filter(seal => seal.status === 'In progress')
  } else if (activeTab === 'review') {
    list = list.filter(seal => seal.status === 'Awaiting funding')
  }

  
  if (!searchQuery.value.trim()) return list
  
  const search = searchQuery.value.toLowerCase()
  return list.filter(seal => 
    seal.title.toLowerCase().includes(search) || 
    seal.counterpart.toLowerCase().includes(search) ||
    seal.displayId.toLowerCase().includes(search)
  )
})

const formatCurrency = (amount: number) => {
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

// Map the real database statuses to your UI colors (slightly tweaked for glass)
const getStatusStyles = (status: string) => {
  switch(status) {
    case 'Pending review': return 'bg-amber-100/80 text-amber-800 border-amber-200/50'
    case 'Awaiting funding': return 'bg-blue-100/80 text-blue-800 border-blue-200/50'
    case 'In progress': return 'bg-indigo-100/80 text-indigo-800 border-indigo-200/50'
    case 'Completed': return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50'
    case 'Cancelled': return 'bg-red-100/80 text-red-800 border-red-200/50'
    default: return 'bg-gray-100/80 text-gray-800 border-gray-200/50'
  }
}

const getMilestoneMessage = (status: string, role: string) => {
  if (role === 'client') {
    switch(status) {
      case 'Pending review': return 'Action Needed: Review Submitted Work'
      case 'Awaiting funding': return 'Action Needed: Deposit Funds to Escrow'
      case 'In progress': return 'Freelancer is working'
      case 'Completed': return 'Funds Released'
      case 'Cancelled': return 'Project Voided'
      default: return 'Pending Update'
    }
  } else {
    switch(status) {
      case 'Pending review': return 'Waiting for Client to Accept'
      case 'Awaiting funding': return 'Waiting for Client Escrow Deposit'
      case 'In progress': return 'Work Ongoing'
      case 'Completed': return 'Funds Released'
      case 'Cancelled': return 'Project Voided'
      default: return 'Pending Update'
    }
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">My Seals</h2>
        <p class="text-gray-600 font-medium mt-1">Manage your active contracts and pending escrows.</p>
      </div>
      <button 
        v-if="authStore.activeRole === 'freelancer'"
        @click="router.push({ name: 'create-seal' })"
        class="px-5 py-2.5 bg-seal-teal/90 backdrop-blur-sm border border-teal-500/50 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition-all flex items-center shrink-0 justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Make New Seal
      </button>
    </div>

    <div v-if="route.query.tab" class="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-lg w-fit">
      <span class="text-sm text-blue-700 font-medium">
        Filtering: <strong>{{ route.query.tab === 'active' ? 'In Progress' : 'Pending Review' }}</strong>
      </span>
      <button @click="router.push({ name: 'my-seals' })" class="text-xs font-bold text-blue-800 hover:underline ml-2">
        ✕ Show All
      </button>
    </div>

    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search projects by name or ID..." 
        class="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal focus:bg-white/90 transition-all shadow-sm text-sm text-gray-800 placeholder-gray-500"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-seal-teal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm text-gray-600 font-medium">Loading your seals...</p>
      </div>
    </div>

    <div v-else-if="filteredSeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="seal in filteredSeals" 
        :key="seal.id"
        class="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all flex flex-col overflow-hidden"
      >
        <div class="p-6 flex-1">
          <div class="flex justify-between items-start mb-4">
            <span :class="['px-2.5 py-1 text-xs font-bold rounded-md border shadow-sm', getStatusStyles(seal.status)]">
              {{ seal.status }}
            </span>
            <span class="text-xs text-gray-500 font-mono font-medium bg-white/50 px-2 py-0.5 rounded-md border border-white/40">{{ seal.displayId }}</span>
          </div>
          
          <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">{{ seal.title }}</h3>
          
          <p class="text-sm text-gray-600 font-medium mb-4">
            <span class="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">
              {{ authStore.activeRole === 'client' ? 'Freelancer' : 'Client' }}
            </span>
            {{ seal.counterpart }}
          </p>
          
          <div class="bg-white/50 rounded-lg p-3 border border-white/40 shadow-sm">
            <p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Amount</p>
            <p class="font-bold text-seal-teal text-lg">{{ formatCurrency(seal.amount) }}</p>
          </div>
        </div>

        <div class="px-6 py-4 bg-white/40 border-t border-white/50">
          <p class="text-xs text-gray-600 mb-3 flex items-center font-medium" 
             :class="{'text-amber-700': seal.nextMilestone.includes('Action Needed')}">
            <svg class="w-4 h-4 mr-1.5 text-gray-500" :class="{'text-amber-500': seal.nextMilestone.includes('Action Needed')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ seal.nextMilestone }}
          </p>
          <button 
            @click="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="w-full py-2 bg-white/60 backdrop-blur-sm border border-white/60 text-gray-800 hover:text-seal-teal hover:border-seal-teal hover:bg-white/90 font-bold rounded-lg transition-all text-sm shadow-sm"
          >
            View Seal Details
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-12 text-center bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg">
      <div class="bg-white/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/40">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <p class="text-gray-800 font-bold text-lg">No active seals found</p>
      <p class="text-sm text-gray-600 mt-1 mb-6 font-medium">You don't have any ongoing projects matching that search.</p>
      <button 
        v-if="authStore.activeRole === 'freelancer'"
        @click="router.push({ name: 'create-seal' })"
        class="text-sm font-bold text-seal-teal hover:text-teal-700 hover:underline px-4 py-2 bg-white/50 border border-teal-100 rounded-lg transition-colors inline-block"
      >
        + Create a new seal
      </button>
    </div>
  </div>
</template>