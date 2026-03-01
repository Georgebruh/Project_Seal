<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(true)
const searchQuery = ref('')

// Mock Data for active/pending projects
const activeSeals = ref<any[]>([])

onMounted(() => {
  // Simulate fetching active seals from Supabase
  setTimeout(() => {
    activeSeals.value = [
      { 
        id: '105', 
        displayId: 'SEAL-105',
        title: 'Mobile App UI Setup', 
        client: 'TechStart Inc.', 
        amount: 25000, 
        status: 'in_progress', 
        nextMilestone: 'Submit Wireframes (Feb 26)' 
      },
      { 
        id: '108', 
        displayId: 'SEAL-108',
        title: 'Website Redesign', 
        client: 'Acme Corp', 
        amount: 45000, 
        status: 'awaiting_deposit', 
        nextMilestone: 'Waiting for Client Funds' 
      },
      { 
        id: '102', 
        displayId: 'SEAL-102',
        title: 'Logo Design & Branding', 
        client: 'Sarah Designs', 
        amount: 8500, 
        status: 'in_review', 
        nextMilestone: 'Awaiting Client Approval' 
      }
    ]
    isLoading.value = false
  }, 600)
})

const filteredSeals = computed(() => {
  if (!searchQuery.value) return activeSeals.value
  return activeSeals.value.filter(seal => 
    seal.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    seal.client.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatCurrency = (amount: number) => {
  return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const getStatusStyles = (status: string) => {
  switch(status) {
    case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'awaiting_deposit': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'in_review': return 'bg-purple-50 text-purple-700 border-purple-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'in_progress': return 'In Progress'
    case 'awaiting_deposit': return 'Awaiting Deposit'
    case 'in_review': return 'In Review'
    default: return status
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
        placeholder="Search active projects..." 
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
              {{ getStatusLabel(seal.status) }}
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