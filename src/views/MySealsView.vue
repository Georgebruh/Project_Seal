<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const searchQuery = ref('')
const allSeals = ref<any[]>([])

// Real-time channel reference
let listChannel: any = null

// Helper to map raw database row to your specific UI structure
const mapSealToUI = (seal: any) => {
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
}

const setupRealtime = () => {
  listChannel = supabase
    .channel('my-seals-realtime')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'Seals' 
      },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          const index = allSeals.value.findIndex(s => s.id === payload.new.id)
          if (index !== -1) {
            // Re-apply your mapping logic to the updated database row
            allSeals.value[index] = mapSealToUI(payload.new)
          }
        } else if (payload.eventType === 'INSERT') {
          // Only add if the user is the freelancer or client
          if (payload.new.freelancer_id === authStore.user?.id || payload.new.client_id === authStore.user?.id) {
            allSeals.value.unshift(mapSealToUI(payload.new))
          }
        } else if (payload.eventType === 'DELETE') {
          allSeals.value = allSeals.value.filter(s => s.id !== payload.old.id)
        }
      }
    )
    .subscribe()
}

onMounted(async () => {
  try {
    isLoading.value = true
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    const roleColumn = authStore.activeRole === 'client' ? 'client_id' : 'freelancer_id'

    const { data: sealsData, error: sealsError } = await supabase
      .from('Seals')
      .select('*')
      .eq(roleColumn, user.id)
      .order('created_at', { ascending: false })

    if (sealsError) throw sealsError

    if (sealsData) {
      allSeals.value = sealsData.map(seal => mapSealToUI(seal))
    }

    // Start listening for changes after initial fetch
    setupRealtime()

  } catch (error) {
    console.error('Error fetching seals:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (listChannel) {
    supabase.removeChannel(listChannel)
  }
})

const filteredSeals = computed(() => {
  let list = [...allSeals.value]

  const activeTab = route.query.tab
  if (activeTab === 'active') {
    list = list.filter(seal => ['In progress', 'Pending output review'].includes(seal.status))
  } else if (activeTab === 'review') {
    list = list.filter(seal => ['Awaiting funding', 'Pending review'].includes(seal.status))
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

const getStatusStyles = (status: string) => {
  switch(status) {
    case 'Pending review': return 'bg-amber-100/80 text-amber-800 border-amber-200/50 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50'
    case 'Awaiting funding': return 'bg-blue-100/80 text-blue-800 border-blue-200/50 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/50'
    case 'In progress': return 'bg-indigo-100/80 text-indigo-800 border-indigo-200/50 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/50'
    case 'Pending output review': return 'bg-purple-100/80 text-purple-800 border-purple-200/50 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800/50'
    case 'Completed': return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50'
    case 'Cancelled': return 'bg-red-100/80 text-red-800 border-red-200/50 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50'
    default: return 'bg-gray-100/80 text-gray-800 border-gray-200/50 dark:bg-slate-700/50 dark:text-gray-300 dark:border-slate-600/50'
  }
}

const getMilestoneMessage = (status: string, role: string) => {
  if (role === 'client') {
    switch(status) {
      case 'Pending review': return 'Action Needed: Review Contract'
      case 'Awaiting funding': return 'Action Needed: Deposit Funds to Escrow'
      case 'In progress': return 'Freelancer is working'
      case 'Pending output review': return 'Action Needed: Review & Approve Output'
      case 'Completed': return 'Funds Released'
      case 'Cancelled': return 'Project Voided'
      default: return 'Pending Update'
    }
  } else {
    switch(status) {
      case 'Pending review': return 'Waiting for Client to Accept'
      case 'Awaiting funding': return 'Waiting for Client Escrow Deposit'
      case 'In progress': return 'Work Ongoing'
      case 'Pending output review': return 'Waiting for Client Approval'
      case 'Completed': return 'Funds Released'
      case 'Cancelled': return 'Project Voided'
      default: return 'Pending Update'
    }
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">My Seals</h2>
        <p class="text-gray-600 dark:text-gray-400 font-medium mt-1 transition-colors">Manage your active contracts and pending escrows.</p>
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

    <div v-if="route.query.tab" class="mb-4 flex items-center gap-2 bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-100 dark:border-blue-800/50 p-2 rounded-lg w-fit transition-colors">
      <span class="text-sm text-blue-700 dark:text-blue-300 font-medium transition-colors">
        Filtering: <strong>{{ route.query.tab === 'active' ? 'In Progress' : 'Pending Review' }}</strong>
      </span>
      <button @click="router.push({ name: 'my-seals' })" class="text-xs font-bold text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline ml-2 transition-colors">
        ✕ Show All
      </button>
    </div>

    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search projects by name or ID..." 
        class="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal dark:focus:border-teal-500 focus:bg-white/90 dark:focus:bg-slate-800 transition-all shadow-sm text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg transition-colors duration-300">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-seal-teal dark:text-teal-500 mb-4 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">Loading your seals...</p>
      </div>
    </div>

    <div v-else-if="filteredSeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="seal in filteredSeals" 
        :key="seal.id"
        class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:bg-white/80 dark:hover:bg-slate-800 transition-all flex flex-col overflow-hidden group"
      >
        <div class="p-6 flex-1">
          <div class="flex justify-between items-start mb-4">
            <span :class="['px-2.5 py-1 text-xs font-bold rounded-md border shadow-sm transition-colors', getStatusStyles(seal.status)]">
              {{ seal.status }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono font-medium bg-white/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-white/40 dark:border-slate-600 transition-colors">{{ seal.displayId }}</span>
          </div>
          
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight group-hover:text-seal-teal dark:group-hover:text-teal-400 transition-colors">{{ seal.title }}</h3>
          
          <p class="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4 transition-colors">
            <span class="text-gray-500 dark:text-gray-500 text-xs uppercase tracking-wider block mb-0.5 transition-colors">
              {{ authStore.activeRole === 'client' ? 'Freelancer' : 'Client' }}
            </span>
            {{ seal.counterpart }}
          </p>
          
          <div class="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-lg p-3 border border-white/40 dark:border-slate-600 shadow-sm transition-colors">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1 transition-colors">Total Amount</p>
            <p class="font-bold text-seal-teal dark:text-teal-400 text-lg transition-colors">{{ formatCurrency(seal.amount) }}</p>
          </div>
        </div>

        <div class="px-6 py-4 bg-white/40 dark:bg-slate-900/40 border-t border-white/50 dark:border-slate-700/50 transition-colors">
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-3 flex items-center font-medium transition-colors" 
             :class="{'text-amber-700 dark:text-amber-400': seal.nextMilestone.includes('Action Needed')}">
            <svg class="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-500 transition-colors" :class="{'text-amber-500 dark:text-amber-500': seal.nextMilestone.includes('Action Needed')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ seal.nextMilestone }}
          </p>
          <button 
            @click="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="w-full py-2 bg-white/60 dark:bg-slate-700/50 backdrop-blur-sm border border-white/60 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:text-seal-teal dark:hover:text-teal-400 hover:border-seal-teal dark:hover:border-teal-500 hover:bg-white/90 dark:hover:bg-slate-700 font-bold rounded-lg transition-all text-sm shadow-sm"
          >
            View Seal Details
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-12 text-center bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg transition-colors duration-300">
      <div class="bg-white/50 dark:bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/40 dark:border-slate-600 transition-colors">
        <svg class="w-10 h-10 text-gray-400 dark:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <p class="text-gray-800 dark:text-white font-bold text-lg transition-colors">No active seals found</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-6 font-medium transition-colors">You don't have any ongoing projects matching that search.</p>
      <button 
        v-if="authStore.activeRole === 'freelancer'"
        @click="router.push({ name: 'create-seal' })"
        class="text-sm font-bold text-seal-teal dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline px-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-teal-100 dark:border-slate-600 rounded-lg transition-colors inline-block"
      >
        + Create a new seal
      </button>
    </div>
  </div>
</template>