<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()
const isLoading = ref(true)
const searchQuery = ref('')

// Real Data container
const allSeals = ref<any[]>([])

onMounted(async () => {
  try {
    isLoading.value = true
    
    // 1. Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // 2. Fetch all seals for this user (Completed or Not)
    const { data: sealsData, error: sealsError } = await supabase
      .from('Seals')
      .select('*')
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false })

    if (sealsError) throw sealsError

    // 3. Map the database data to your UI structure
    if (sealsData) {
      allSeals.value = sealsData.map(seal => {
        
        // Generate a clean Display ID from the UUID (e.g., SEAL-a1b2c3d4)
        const shortId = seal.id.substring(0, 8).toUpperCase()
        
        return { 
          id: seal.id, 
          displayId: `SEAL-${shortId}`,
          title: seal.project_name, 
          // Use the new client_name column for tracking
          client: seal.client_id 
             ? (seal.client_name || 'Client Assigned') 
             : `Awaiting: ${seal.client_name || 'Client'}`, 
          amount: seal.total_amount, 
          status: seal.status, 
          nextMilestone: getMilestoneMessage(seal.status)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching seals:', error)
  } finally {
    isLoading.value = false
  }
})

// Search filter logic
const filteredSeals = computed(() => {
  if (!searchQuery.value) return allSeals.value
  return allSeals.value.filter(seal => 
    seal.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    seal.client.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seal.displayId.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatCurrency = (amount: number) => {
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

// Map the real database statuses to your UI colors
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

// Generate a helpful subtitle based on the status
const getMilestoneMessage = (status: string) => {
  switch(status) {
    case 'Pending review': return 'Waiting for Client to Accept'
    case 'Awaiting funding': return 'Waiting for Client Escrow Deposit'
    case 'In progress': return 'Work Ongoing'
    case 'Completed': return 'Funds Released'
    case 'Cancelled': return 'Project Voided'
    default: return 'Pending Update'
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
        @click="router.push({ name: 'create-seal' })"
        class="px-5 py-2.5 bg-seal-teal text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors flex items-center shrink-0 justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Make New Seal
      </button>
    </div>

    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search projects by name or ID..." 
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal transition-all shadow-sm text-sm"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <svg class="animate-spin h-8 w-8 text-seal-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
          <p class="text-sm text-gray-500 font-medium mb-4">{{ seal.client }}</p>
          
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Amount</p>
            <p class="font-bold text-seal-teal text-lg">{{ formatCurrency(seal.amount) }}</p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p class="text-xs text-gray-500 mb-3 flex items-center font-medium">
            <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ seal.nextMilestone }}
          </p>
          
          <button 
            @click="router.push({ name: 'seal-detail', params: { id: seal.id } })"
            class="w-full py-2 bg-white border border-gray-200 text-gray-700 hover:text-seal-teal hover:border-seal-teal font-bold rounded-lg transition-colors text-sm shadow-sm"
          >
            View Seal Details
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <p class="text-gray-500 font-medium">No active seals found</p>
      <p class="text-sm text-gray-400 mt-1 mb-4">You don't have any ongoing projects matching that search.</p>
      <button 
        @click="router.push({ name: 'create-seal' })"
        class="text-sm font-bold text-seal-teal hover:underline"
      >
        + Create a new seal
      </button>
    </div>

  </div>
</template>