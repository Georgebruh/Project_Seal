<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isLoading = ref(true)

// Mock Data for past projects
const historyRecords = ref<any[]>([])
const searchQuery = ref('')
const filterStatus = ref('all') // all, completed, cancelled

onMounted(() => {
  // Simulate fetching history from Supabase
  setTimeout(() => {
    historyRecords.value = [
      { id: 'SEAL-092', title: 'E-Commerce Website Redesign', client: 'Acme Corp', dateCompleted: 'Oct 15, 2025', amount: 45000, status: 'completed' },
      { id: 'SEAL-085', title: 'Brand Logo & Animation', client: 'TechStart Inc.', dateCompleted: 'Sep 28, 2025', amount: 15000, status: 'completed' },
      { id: 'SEAL-081', title: 'SEO Technical Audit', client: 'Local Bakery', dateCompleted: 'Aug 10, 2025', amount: 8000, status: 'cancelled' },
      { id: 'SEAL-077', title: 'Mobile App Wireframes', client: 'Sarah Designs', dateCompleted: 'Jul 22, 2025', amount: 25000, status: 'completed' },
      { id: 'SEAL-070', title: 'Database Migration', client: 'DataSync LLC', dateCompleted: 'Jun 05, 2025', amount: 35000, status: 'completed' },
    ]
    isLoading.value = false
  }, 600)
})

// Filter logic
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
  return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const getStatusBadge = (status: string) => {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'cancelled') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Project History</h2>
      <p class="text-gray-500 mt-1">Review your past completed seals and cancelled contracts.</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by project, client, or ID..." 
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal transition-all shadow-sm text-sm"
        />
      </div>

      <div class="sm:w-48 shrink-0">
        <select 
          v-model="filterStatus"
          class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal shadow-sm text-sm text-gray-700 font-medium appearance-none"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <svg class="animate-spin h-8 w-8 text-seal-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4 font-bold">Project Details</th>
              <th class="px-6 py-4 font-bold">Client</th>
              <th class="px-6 py-4 font-bold">Date</th>
              <th class="px-6 py-4 font-bold">Amount</th>
              <th class="px-6 py-4 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-gray-50">
            <tr v-for="record in filteredHistory" :key="record.id" class="hover:bg-gray-50/50 transition-colors">
              
              <td class="px-6 py-4">
                <p class="font-bold text-gray-900">{{ record.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ record.id }}</p>
              </td>
              
              <td class="px-6 py-4">
                <p class="font-medium text-gray-700">{{ record.client }}</p>
              </td>

              <td class="px-6 py-4">
                <p class="text-gray-600">{{ record.dateCompleted }}</p>
              </td>
              
              <td class="px-6 py-4">
                <p class="font-bold text-gray-900">{{ formatCurrency(record.amount) }}</p>
              </td>
              
              <td class="px-6 py-4 text-right">
                <span :class="['px-2.5 py-1 text-xs font-bold rounded-md border capitalize inline-block', getStatusBadge(record.status)]">
                  {{ record.status }}
                </span>
              </td>
              
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredHistory.length === 0" class="p-12 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <p class="text-gray-500 font-medium">No records found</p>
        <p class="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
      </div>
    </div>

  </div>
</template>