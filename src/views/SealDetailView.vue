<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sealId = route.params.id as string

const isLoading = ref(true)
const seal = ref<any>(null)
const freelancerName = ref('Loading...')
const clientName = ref('Awaiting Client')

onMounted(async () => {
  await fetchSealDetails()
})

const fetchSealDetails = async () => {
  try {
    isLoading.value = true
    
    // 1. Fetch the Seal Data
    const { data: sealData, error: sealError } = await supabase
      .from('Seals')
      .select('*')
      .eq('id', sealId)
      .single()
      
    if (sealError) throw sealError
    seal.value = sealData

    // Set initial client name using your new column
    clientName.value = sealData.client_id
      ? (sealData.client_name || 'Unknown Client')
      : `Awaiting: ${sealData.client_name || 'Client'}`

    // 2. Fetch Freelancer Profile Name
    if (sealData.freelancer_id) {
      const { data: fData } = await supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', sealData.freelancer_id)
        .single()
      if (fData) freelancerName.value = fData.full_name || 'Unknown Freelancer'
    }

    // 3. Fetch Client Profile Name (if a client has accepted it)
    if (sealData.client_id) {
      const { data: cData } = await supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', sealData.client_id)
        .single()
      // Overwrite the reference name with the client's actual registered profile name
      if (cData && cData.full_name) {
        clientName.value = cData.full_name 
      }
    }

  } catch (error) {
    console.error('Error fetching seal details:', error)
  } finally {
    isLoading.value = false
  }
}

// Map real database statuses to UI
interface StatusInfo {
  label: string
  color: string
  icon: string
  progress: string
}

const statusInfo = computed<StatusInfo>(() => {
  if (!seal.value) {
    // return a default to satisfy typing, though the template guards with v-if
    return { label: '', color: '', icon: '', progress: '' }
  }
  
  const map: Record<string, StatusInfo> = {
    'Pending review': { 
      label: 'Awaiting Contract Review', 
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      progress: '0%'
    },
    'Awaiting funding': { 
      label: 'Awaiting Escrow Funding', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      progress: '0%'
    },
    'In progress': { 
      label: 'Funded & In Progress', 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      progress: '100%'
    },
    'Completed': { 
      label: 'Completed & Funds Released', 
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      progress: '100%'
    },
    'Cancelled': {
      label: 'Project Cancelled',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: 'M6 18L18 6M6 6l12 12',
      progress: '0%'
    }
  }
  
  const result = map[seal.value.status as string] || map['Pending review']
  return result as StatusInfo
})

// Calculate deposit based on the percentage set in the database (default 100%)
const depositAmount = computed(() => {
  if (!seal.value) return 0
  const percentage = seal.value.deposit_percentage || 100
  return seal.value.total_amount * (percentage / 100)
})

// --- DATABASE ACTIONS ---

const updateSealStatus = async (newStatus: string, additionalUpdates: any = {}) => {
  try {
    const { error } = await supabase
      .from('Seals')
      .update({ status: newStatus, ...additionalUpdates })
      .eq('id', seal.value.id)

    if (error) throw error
    
    // Update local state so UI reacts instantly
    seal.value.status = newStatus
    if (additionalUpdates.client_id) seal.value.client_id = additionalUpdates.client_id
    
    // Refresh names just in case
    if (additionalUpdates.client_id) await fetchSealDetails()
    
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Failed to update status. Check permissions.')
  }
}

// Client Actions
const clientAcceptContract = async () => {
  // Binds the currently logged-in user as the client and moves to funding
  await updateSealStatus('Awaiting funding', { client_id: authStore.user.id })
}

const clientFundEscrow = async () => {
  alert(`In a future update, this will open the payment gateway for ₱${depositAmount.value.toLocaleString()}.`)
  await updateSealStatus('In progress')
}

const clientApproveWork = async () => {
  if(confirm('Are you sure you want to approve this work and release funds? This action is final.')) {
    await updateSealStatus('Completed')
  }
}

// Freelancer Actions
const freelancerCancel = async () => {
  if(confirm('Are you sure you want to cancel this seal?')) {
    await updateSealStatus('Cancelled')
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <svg class="animate-spin h-8 w-8 text-seal-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else-if="seal">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <button @click="router.back()" class="text-sm font-medium text-gray-500 hover:text-seal-teal transition-colors flex items-center mb-3">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to List
          </button>
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">{{ seal.project_name }}</h2>
          <p class="text-gray-500 mt-1">Seal ID: #{{ seal.id.substring(0, 8).toUpperCase() }} • {{ seal.project_type || 'General Service' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 class="font-bold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Digital Service Contract & Scope
              </h3>
            </div>
            <div class="p-8 bg-white font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed h-125 overflow-y-auto">
              {{ seal.contract_text }}
              
              <div class="mt-8 pt-4 border-t border-gray-200">
                <strong>Project Scope:</strong>
                <br />
                {{ seal.scope }}
              </div>
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

          <div v-if="authStore.activeRole === 'client' && seal.status !== 'Cancelled'" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm border-t-4 border-t-blue-500">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Client Actions</h3>
            
            <div v-if="seal.status === 'Pending review'">
              <p class="text-sm text-gray-600 mb-4">Review the contract text. By accepting, you agree to these terms and bind yourself to this project.</p>
              <button @click="clientAcceptContract" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Accept Contract
              </button>
            </div>

            <div v-else-if="seal.status === 'Awaiting funding'">
              <p class="text-sm text-gray-600 mb-4">You need to fund the escrow before the freelancer will begin work. Funds are held securely until you approve the final delivery.</p>
              <div class="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Total Project</span><span class="font-medium">₱{{ seal.total_amount.toLocaleString() }}</span></div>
                <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Deposit Req.</span><span class="font-medium">{{ seal.deposit_percentage || 100 }}%</span></div>
                <div class="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                  <span>Due to Escrow</span>
                  <span class="text-lg text-seal-teal">₱{{ depositAmount.toLocaleString() }}</span>
                </div>
              </div>
              <button @click="clientFundEscrow" class="w-full py-3.5 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Deposit to Secure Escrow
              </button>
            </div>

            <div v-else-if="seal.status === 'In progress'" class="text-center py-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Freelancer is working.</p>
              <p class="text-sm text-gray-500 mt-1 mb-4">Escrow is fully funded. Once you receive and verify the final files, approve the work to release funds.</p>
              <button @click="clientApproveWork" class="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Approve Work & Release Funds
              </button>
            </div>
            
            <div v-else-if="seal.status === 'Completed'" class="text-center py-4 text-green-600 font-bold">
              Transaction Complete!
            </div>
          </div>

          <div v-if="authStore.activeRole === 'freelancer'" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm border-t-4 border-t-orange-500">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Freelancer Status</h3>
            
            <div v-if="seal.status === 'Pending review'" class="text-center py-4">
              <p class="font-bold text-gray-900">Waiting for Client</p>
              <p class="text-sm text-gray-500 mt-1">Share the link with your client. They need to review and accept the contract.</p>
              <button @click="freelancerCancel" class="mt-4 text-xs font-bold text-red-500 hover:underline">Cancel Project</button>
            </div>

            <div v-else-if="seal.status === 'Awaiting funding'" class="text-center py-4">
              <div class="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <p class="font-bold text-gray-900">Do not start working yet.</p>
              <p class="text-sm text-gray-500 mt-1">Wait until the client secures the deposit in the platform escrow.</p>
            </div>

            <div v-else-if="seal.status === 'In progress'" class="text-center py-4">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Escrow Funded</p>
              <p class="text-sm text-gray-500 mt-1">You may begin work safely. Deliver the final files directly to your client. They will release the funds from here.</p>
            </div>

            <div v-else-if="seal.status === 'Completed'" class="text-center py-4 text-green-600 font-bold">
              Funds Transferred Successfully!
            </div>
            
            <div v-else-if="seal.status === 'Cancelled'" class="text-center py-4 text-red-600 font-bold">
              This Seal was cancelled.
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Project Details</h3>
            <div class="space-y-4 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Total Contract</span>
                <span class="font-bold text-gray-900">₱{{ seal.total_amount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <span class="text-gray-500">Client</span>
                <span class="font-medium text-gray-900">{{ clientName }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Freelancer</span>
                <span class="font-medium text-gray-900">{{ freelancerName }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <span class="text-gray-500">Timeline</span>
                <span class="font-medium text-gray-900">
                  {{ new Date(seal.start_date).toLocaleDateString() }} to {{ new Date(seal.end_date).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    
    <div v-else class="text-center py-12">
       <p class="text-gray-500">Seal not found.</p>
       <button @click="router.back()" class="mt-4 text-seal-teal hover:underline">Go Back</button>
    </div>

  </div>
</template>