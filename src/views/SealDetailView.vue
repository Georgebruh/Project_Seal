<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sealId = route.params.id

// Mock database fetch
const isLoading = ref(true)
const seal = ref({
  id: '',
  title: '',
  type: '',
  amount: 0,
  deposit: 0,
  startDate: '',
  endDate: '',
  status: 'pending_funding', // pending_funding, in_progress, review, completed
  contractText: '',
  freelancerName: 'Alex Developer',
  clientName: 'Acme Corp'
})

onMounted(() => {
  setTimeout(() => {
    seal.value = {
      id: sealId as string,
      title: 'E-Commerce Website Redesign',
      type: 'Web Development',
      amount: 45000,
      deposit: 50,
      startDate: '2026-03-01',
      endDate: '2026-04-15',
      status: 'pending_funding',
      freelancerName: 'Alex Developer',
      clientName: 'Acme Corp',
      contractText: `CONTRACT OF SERVICE: STANDARD SERVICE AGREEMENT\n\nThis Agreement is made for the project "E-Commerce Website Redesign" starting on 2026-03-01 and concluding on 2026-04-15.\n\n1. SCOPE OF WORK:\nComplete overhaul of the existing WooCommerce frontend. Implementing a new responsive design, optimizing checkout flow, and adding advanced product filtering.\n\n2. COMPENSATION:\nThe total compensation for this project is ₱45,000.00.\nA deposit of 50% (₱22,500.00) is required to be placed in escrow to begin work.\n\n3. PAYMENT TERMS:\nThe remaining balance shall be paid in full upon project completion.\n\nBy accepting this Seal, both parties agree to the terms outlined above and the platform escrow conditions.`
    }
    isLoading.value = false
  }, 400)
})

const statusInfo = computed(() => {
  const map: Record<string, { label: string, color: string, icon: string, progress: string }> = {
    'pending_funding': { 
      label: 'Awaiting Escrow Funding', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      progress: '0%'
    },
    'in_progress': { 
      label: 'Funded & In Progress', 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      progress: '100%'
    },
    'review': { 
      label: 'Work Submitted for Review', 
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      progress: '100%'
    },
    'completed': { 
      label: 'Completed & Funds Released', 
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      progress: '100%'
    }
  }
  
  // Hardcoded fallback so TypeScript knows 100% it will return this object format
  return map[seal.value.status] || {
    label: 'Awaiting Escrow Funding', 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    progress: '0%'
  }
})

const depositAmount = computed(() => seal.value.amount * (seal.value.deposit / 100))

// Mock Actions
const clientFundEscrow = () => {
  alert(`Processing secure payment of ₱${depositAmount.value.toLocaleString()} to Escrow...`)
  seal.value.status = 'in_progress'
}

const freelancerSubmitWork = () => {
  alert('Files attached! Submitting work to client for review...')
  seal.value.status = 'review'
}

const clientApproveWork = () => {
  alert('Work approved! Releasing funds to freelancer...')
  seal.value.status = 'completed'
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <svg class="animate-spin h-8 w-8 text-seal-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else>
      <div class="mb-8 flex items-center justify-between">
        <div>
          <button @click="router.back()" class="text-sm font-medium text-gray-500 hover:text-seal-teal transition-colors flex items-center mb-3">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </button>
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">{{ seal.title }}</h2>
          <p class="text-gray-500 mt-1">Seal ID: #{{ seal.id.toUpperCase() }} • {{ seal.type }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 class="font-bold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Digital Service Contract
              </h3>
            </div>
            <div class="p-8 bg-white font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed h-[500px] overflow-y-auto">
              {{ seal.contractText }}
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 space-y-6">
          
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Current Status</h3>
            <div :class="['flex items-center p-4 rounded-xl border', statusInfo.color]">
              <svg class="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusInfo.icon"></path>
              </svg>
              <span class="font-bold">{{ statusInfo.label }}</span>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-50">
              <div class="flex justify-between text-xs font-bold text-gray-500 mb-2">
                <span>Escrow Funded</span>
                <span>{{ statusInfo.progress }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-seal-teal h-2.5 rounded-full transition-all duration-1000" :style="{ width: statusInfo.progress }"></div>
              </div>
            </div>
          </div>

          <div v-if="authStore.activeRole === 'client'" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm border-t-4 border-t-blue-500">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Client Actions</h3>
            
            <div v-if="seal.status === 'pending_funding'">
              <p class="text-sm text-gray-600 mb-4">You need to fund the escrow before the freelancer will begin work. Funds are held securely until you approve the final delivery.</p>
              <div class="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Total Project</span><span class="font-medium">₱{{ seal.amount.toLocaleString() }}</span></div>
                <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Deposit Req.</span><span class="font-medium">{{ seal.deposit }}%</span></div>
                <div class="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                  <span>Due to Escrow</span>
                  <span class="text-lg text-seal-teal">₱{{ depositAmount.toLocaleString() }}</span>
                </div>
              </div>
              <button @click="clientFundEscrow" class="w-full py-3.5 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Deposit to Secure Escrow
              </button>
            </div>

            <div v-else-if="seal.status === 'in_progress'" class="text-center py-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Freelancer is working.</p>
              <p class="text-sm text-gray-500 mt-1">Escrow is fully funded. You will be notified when work is submitted.</p>
            </div>

            <div v-else-if="seal.status === 'review'">
              <div class="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-100 flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-purple-900">project_files.zip</p>
                  <p class="text-xs text-purple-700">Uploaded 2 hours ago</p>
                </div>
                <button class="text-purple-700 hover:text-purple-900">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>
              </div>
              <button @click="clientApproveWork" class="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Approve Work & Release Funds
              </button>
              <button class="w-full py-2 mt-2 text-sm text-red-500 font-medium hover:underline">
                Request Revisions
              </button>
            </div>
            
            <div v-else class="text-center py-4 text-green-600 font-bold">
              Transaction Complete!
            </div>
          </div>

          <div v-if="authStore.activeRole === 'freelancer'" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm border-t-4 border-t-orange-500">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Freelancer Actions</h3>
            
            <div v-if="seal.status === 'pending_funding'" class="text-center py-4">
              <div class="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <p class="font-bold text-gray-900">Do not start working yet.</p>
              <p class="text-sm text-gray-500 mt-1">Wait until the client secures the ₱{{ depositAmount.toLocaleString() }} deposit in the platform escrow.</p>
            </div>

            <div v-else-if="seal.status === 'in_progress'">
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer mb-4">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p class="text-sm font-medium text-seal-teal">Click to upload deliverables</p>
                <p class="text-xs text-gray-500 mt-1">ZIP, PDF, or Links</p>
              </div>
              <button @click="freelancerSubmitWork" class="w-full py-3.5 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Submit Work for Review
              </button>
            </div>

            <div v-else-if="seal.status === 'review'" class="text-center py-4">
               <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Under Review</p>
              <p class="text-sm text-gray-500 mt-1">The client is reviewing your work. Escrow funds will be released upon approval.</p>
            </div>

            <div v-else class="text-center py-4 text-green-600 font-bold">
              Funds Transferred Successfully!
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Project Details</h3>
            <div class="space-y-4 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Total Contract</span>
                <span class="font-bold text-gray-900">₱{{ seal.amount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <span class="text-gray-500">Client</span>
                <span class="font-medium text-gray-900">{{ seal.clientName }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Freelancer</span>
                <span class="font-medium text-gray-900">{{ seal.freelancerName }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <span class="text-gray-500">Timeline</span>
                <span class="font-medium text-gray-900">{{ seal.startDate }} to {{ seal.endDate }}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>