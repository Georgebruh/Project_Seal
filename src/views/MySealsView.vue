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

const getStatusStyles = (status: string) => {
  switch(status) {
    case 'Pending review': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Awaiting funding': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'In progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
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
        <p class="text-gray-500 mt-1">Manage your active contracts and pending escrows.</p>
      </div>
      <button 
        v-if="authStore.activeRole === 'freelancer'"
        @click="router.push({ name: 'create-seal' })"
        class="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors flex items-center shrink-0 justify-center"
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
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search projects..." 
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-sm text-sm"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="filteredSeals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="seal in filteredSeals" 
        :key="seal.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
      >
        <div class="p-6 flex-1">
          <div class="flex justify-between items-start mb-4">
            <span :class="['px-2.5 py-1 text-xs font-bold rounded-md border', getStatusStyles(seal.status)]">
              {{ seal.status }}
            </span>
            <span class="text-xs text-gray-400 font-mono font-medium">{{ seal.displayId }}</span>
          </div>
          
          <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">{{ seal.title }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ seal.counterpart }}</p>
          
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p class="text-xs text-gray-500 uppercase font-bold mb-1">Total Amount</p>
            <p class="font-bold text-teal-600 text-lg">{{ formatCurrency(seal.amount) }}</p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p class="text-xs text-gray-500 mb-3 flex items-center font-medium">
            {{ seal.nextMilestone }}
          </p>
          <button 
            @click="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="w-full py-2 bg-white border border-gray-200 text-gray-700 hover:text-teal-600 hover:border-teal-600 font-bold rounded-lg transition-colors text-sm"
          >
            View Seal Details
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-gray-500 font-medium">No seals found</p>
      <button v-if="route.query.tab" @click="router.push({ name: 'my-seals' })" class="text-teal-600 text-sm font-bold mt-2">
        Clear filters and show all
      </button>
    </div>
  </div>
</template>