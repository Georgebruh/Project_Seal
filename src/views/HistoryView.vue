<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)

const historyRecords = ref<any[]>([])
const searchQuery = ref('')
const filterStatus = ref('all') 

onMounted(async () => {
  try {
    isLoading.value = true
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    const roleColumn = authStore.activeRole === 'client' ? 'client_id' : 'freelancer_id'

    const { data, error } = await supabase
      .from('Seals')
      .select('*')
      .eq(roleColumn, user.id)
      .in('status', ['Completed', 'Cancelled'])
      .order('created_at', { ascending: false }) 

    if (error) throw error

    if (data) {
      historyRecords.value = data.map(record => {
        let counterpartName = ''
        if (authStore.activeRole === 'client') {
          counterpartName = record.freelancer_name || 'Freelancer'
        } else {
          counterpartName = record.client_name || 'Client'
        }

        return {
          id: `SEAL-${record.id.substring(0, 8).toUpperCase()}`,
          rawId: record.id,
          title: record.project_name,
          client: counterpartName,
          dateCompleted: new Date(record.updated_at || record.end_date || record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: record.total_amount,
          status: record.status.toLowerCase()
        }
      })
    }
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredHistory = computed(() => {
  return historyRecords.value.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          record.client.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          record.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || record.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const formatCurrency = (amount: number) => {
  return `₱${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

// UPDATED: Added dark mode color variants for the status badges
const getStatusBadge = (status: string) => {
  if (status === 'completed') return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50'
  if (status === 'cancelled') return 'bg-red-100/80 text-red-800 border-red-200/50 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50'
  return 'bg-gray-100/80 text-gray-800 border-gray-200/50 dark:bg-slate-700/50 dark:text-gray-300 dark:border-slate-600/50'
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Project History</h2>
      <p class="text-gray-600 dark:text-gray-400 font-medium mt-1 transition-colors">Review your past completed seals and cancelled contracts.</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by project, client, or ID..." 
          class="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal dark:focus:border-teal-500 focus:bg-white/90 dark:focus:bg-slate-800 transition-all shadow-sm text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div class="sm:w-48 shrink-0">
        <select 
          v-model="filterStatus"
          class="w-full px-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal dark:focus:border-teal-500 shadow-sm text-sm text-gray-800 dark:text-white font-medium appearance-none focus:bg-white/90 dark:focus:bg-slate-800 transition-all cursor-pointer"
        >
          <option class="dark:bg-slate-800" value="all">All Statuses</option>
          <option class="dark:bg-slate-800" value="completed">Completed</option>
          <option class="dark:bg-slate-800" value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg transition-colors duration-300">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-seal-teal dark:text-teal-500 mb-4 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">Loading history...</p>
      </div>
    </div>

    <div v-else class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg overflow-hidden transition-colors duration-300">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/40 dark:bg-slate-900/40 border-b border-white/50 dark:border-slate-700/50 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider transition-colors">
              <th class="px-6 py-4 font-bold">Project Details</th>
              <th class="px-6 py-4 font-bold">Client</th>
              <th class="px-6 py-4 font-bold">Date</th>
              <th class="px-6 py-4 font-bold">Amount</th>
              <th class="px-6 py-4 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-white/40 dark:divide-slate-700/50 transition-colors">
            <tr v-for="record in filteredHistory" :key="record.id" class="hover:bg-white/60 dark:hover:bg-slate-700/50 transition-colors">
              
              <td class="px-6 py-4">
                <p class="font-bold text-gray-900 dark:text-white transition-colors">{{ record.title }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-mono bg-white/50 dark:bg-slate-700/50 inline-block px-1.5 py-0.5 rounded border border-white/40 dark:border-slate-600 transition-colors">{{ record.id }}</p>
              </td>
              
              <td class="px-6 py-4">
                <p class="font-medium text-gray-800 dark:text-gray-200 transition-colors">{{ record.client }}</p>
              </td>

              <td class="px-6 py-4">
                <p class="text-gray-700 dark:text-gray-300 font-medium transition-colors">{{ record.dateCompleted }}</p>
              </td>
              
              <td class="px-6 py-4">
                <p class="font-bold text-gray-900 dark:text-white transition-colors">{{ formatCurrency(record.amount) }}</p>
              </td>
              
              <td class="px-6 py-4 text-right">
                <span :class="['px-2.5 py-1 text-xs font-bold rounded-md border shadow-sm capitalize inline-block transition-colors', getStatusBadge(record.status)]">
                  {{ record.status }}
                </span>
              </td>
              
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredHistory.length === 0" class="p-12 text-center bg-white/40 dark:bg-slate-800/40 border-t border-white/50 dark:border-slate-700/50 transition-colors">
        <div class="bg-white/50 dark:bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/40 dark:border-slate-600 transition-colors">
          <svg class="w-8 h-8 text-gray-500 dark:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <p class="text-gray-800 dark:text-white font-bold text-lg transition-colors">No records found</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium transition-colors">Try adjusting your search or filters.</p>
      </div>
    </div>

  </div>
</template>