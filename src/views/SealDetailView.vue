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
const isProcessingPayment = ref(false) // NEW: Added for payment loading state
const seal = ref<any>(null)
const freelancerName = ref('Loading...')
const clientName = ref('Awaiting Client')

// Inline Login State
const loginStep = ref(1)
const loginPhone = ref('')
const loginOtp = ref('')
const loginError = ref('')
const isLoggingIn = ref(false)

// Link Copy State
const linkPressed = ref(false)

// NEW: Custom Modal State
const customModal = ref({
  isOpen: false,
  type: 'alert' as 'alert' | 'confirm',
  title: '',
  message: '',
  confirmText: 'Confirm',
  confirmAction: null as Function | null
})

const showAlert = (title: string, message: string) => {
  customModal.value = { isOpen: true, type: 'alert', title, message, confirmText: 'OK', confirmAction: null }
}

const showConfirm = (title: string, message: string, confirmText: string, action: Function) => {
  customModal.value = { isOpen: true, type: 'confirm', title, message, confirmText, confirmAction: action }
}

const handleModalConfirm = async () => {
  if (customModal.value.confirmAction) {
    await customModal.value.confirmAction()
  }
  customModal.value.isOpen = false
}

onMounted(async () => {
  // Ensure auth state is initialized before fetching
  await authStore.initialize()
  await fetchSealDetails()
})

const fetchSealDetails = async () => {
  try {
    isLoading.value = true
    
    const { data: sealData, error: sealError } = await supabase
      .from('Seals')
      .select('*')
      .eq('id', sealId)
      .single()
      
    if (sealError) throw sealError
    seal.value = sealData

    clientName.value = sealData.client_id
      ? (sealData.client_name || 'Unknown Client')
      : `Awaiting: ${sealData.client_name || 'Client'}`

    if (sealData.freelancer_id) {
      const { data: fData } = await supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', sealData.freelancer_id)
        .single()
      if (fData) freelancerName.value = fData.full_name || 'Unknown Freelancer'
    }

    if (sealData.client_id) {
      const { data: cData } = await supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', sealData.client_id)
        .single()
      if (cData && cData.full_name) {
        clientName.value = cData.full_name 
      }
    }

    // Dynamic Role Assignment
    if (authStore.user) {
      if (authStore.user.id !== sealData.freelancer_id) {
        authStore.activeRole = 'client'
      } else {
        authStore.activeRole = 'freelancer'
      }
    }

  } catch (error) {
    console.error('Error fetching seal details:', error)
  } finally {
    isLoading.value = false
  }
}

// Login Handlers
const handlePhoneSubmit = async () => {
  loginError.value = ''
  isLoggingIn.value = true
  try {
    const email = await authStore.checkPhoneExistsAndGetEmail(loginPhone.value)
    if (email) {
      await authStore.sendEmailOtp(email)
      loginStep.value = 2
    } else {
      loginError.value = 'Phone number not recognized in the system.'
    }
  } catch (err: any) {
    loginError.value = err.message || 'Failed to verify phone.'
  } finally {
    isLoggingIn.value = false
  }
}

const handleOtpSubmit = async () => {
  loginError.value = ''
  isLoggingIn.value = true
  try {
    await authStore.verifyEmailOtp(loginOtp.value)
    // Re-evaluate roles now that they are logged in
    await fetchSealDetails()
  } catch (err: any) {
    loginError.value = err.message || 'Invalid OTP code.'
  } finally {
    isLoggingIn.value = false
  }
}

interface StatusInfo {
  label: string
  color: string
  icon: string
  progress: string
}

const statusInfo = computed<StatusInfo>(() => {
  if (!seal.value) {
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
    'Pending output review': { 
      label: 'Output Submitted for Review', 
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
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
  
  return (map[seal.value.status as string] || map['Pending review']) as StatusInfo
})

const generatedSealLink = computed(() => {
  if (!seal.value) return ''
  return `${window.location.origin}/seal/${seal.value.id}`
})

const copySealLink = async () => {
  if (!generatedSealLink.value) return
  try {
    await navigator.clipboard.writeText(generatedSealLink.value)
    linkPressed.value = true
    setTimeout(() => {
      linkPressed.value = false
    }, 2000)
  } catch (err) {
    console.error('Clipboard write failed', err)
  }
}

const updateSealStatus = async (newStatus: string, additionalUpdates: any = {}) => {
  try {
    const { data, error } = await supabase
      .from('Seals')
      .update({ 
        status: newStatus, 
        ...additionalUpdates 
      })
      .eq('id', seal.value.id)
      .select()

    if (error) throw error
    
    // Catch the silent RLS failure
    if (!data || data.length === 0) {
      throw new Error('Update blocked by database security policies (RLS).')
    }
    
    seal.value.status = newStatus
    if (additionalUpdates.client_id) seal.value.client_id = additionalUpdates.client_id
    if (additionalUpdates.client_id) await fetchSealDetails()
    
  } catch (error: any) {
    console.error('Error updating status:', error)
    showAlert('Update Failed', error.message || 'Failed to update status. Check permissions.')
  }
}

const clientAcceptContract = async () => {
  await updateSealStatus('Awaiting funding', { client_id: authStore.user.id })
}

const proceedToPayment = () => {
  router.push(`/pay/${seal.value.id}`)
}

const freelancerSubmitWork = () => {
  showConfirm(
    'Submit Final Work', 
    'Have you delivered the final files to the client? Click Confirm to update the status and request fund release.', 
    'Submit Work',
    async () => await updateSealStatus('Pending output review')
  )
}

const clientApproveWork = () => {
  showConfirm(
    'Approve & Release Funds', 
    'Are you sure you want to approve this work and release funds? This action is final.', 
    'Release Funds',
    async () => await updateSealStatus('Completed')
  )
}

const freelancerCancel = () => {
  showConfirm(
    'Cancel Project', 
    'Are you sure you want to cancel this seal? This action cannot be undone.', 
    'Cancel Project',
    async () => await updateSealStatus('Cancelled')
  )
}

const handleBackToList = () => {
  // Absolutely no history checks. 
  // Always push strictly forward to the dashboard to fetch fresh data.
  router.push({ name: 'my-seals' })
}

</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <svg class="animate-spin h-8 w-8 text-seal-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else-if="!authStore.isAuthenticated" class="max-w-md mx-auto mt-16 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
      <div class="w-16 h-16 bg-teal-50 text-seal-teal rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Project Seal</h2>
      <p class="text-gray-500 mb-8 text-sm">Verify your identity to securely view and manage your digital contract.</p>
      
      <div v-if="loginStep === 1" class="space-y-4">
        <input 
          v-model="loginPhone" 
          type="text" 
          placeholder="Enter your registered phone number" 
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
        />
        <button 
          @click="handlePhoneSubmit" 
          :disabled="isLoggingIn || !loginPhone"
          class="w-full py-3 bg-seal-teal text-white font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ isLoggingIn ? 'Verifying...' : 'Continue' }}
        </button>
      </div>

      <div v-if="loginStep === 2" class="space-y-4">
        <p class="text-sm font-medium text-gray-700 mb-2">Check your email for the OTP code.</p>
        <input 
          v-model="loginOtp" 
          type="text" 
          placeholder="Enter OTP Code" 
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors text-center tracking-widest font-mono text-lg"
        />
        <button 
          @click="handleOtpSubmit" 
          :disabled="isLoggingIn || !loginOtp"
          class="w-full py-3 bg-seal-teal text-white font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ isLoggingIn ? 'Logging In...' : 'Verify OTP' }}
        </button>
      </div>

      <p v-if="loginError" class="mt-4 text-sm text-red-500 font-medium">{{ loginError }}</p>
    </div>

    <div v-else-if="seal">
      <div class="mb-8 flex items-center justify-between mt-4">
        <div>
          <button @click="handleBackToList" class="text-sm font-medium text-gray-500 hover:text-seal-teal transition-colors flex items-center mb-3">
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
            <div class="flex-1 p-8 bg-white font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed overflow-y-auto">
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
              <p class="text-sm text-gray-600 mb-4">Review the contract text. By confirming, you agree to these terms and bind yourself to this project.</p>
              <button @click="clientAcceptContract" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Confirm Contract
              </button>
            </div>

            <div v-else-if="seal.status === 'Awaiting funding'">
              <p class="text-sm text-gray-600 mb-4">Deposit the project funds to officially begin. The freelancer will start working as soon as the payment is secured.</p>
              <div class="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div class="flex justify-between font-bold text-gray-900">
                  <span>Amount Due</span>
                  <span class="text-lg text-seal-teal">₱{{ seal.total_amount.toLocaleString() }}</span>
                </div>
              </div>
              <button @click="proceedToPayment" class="w-full py-3.5 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors flex justify-center items-center">
                Proceed to Payment
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>

            <div v-else-if="seal.status === 'In progress'" class="text-center py-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Freelancer is working.</p>
              <p class="text-sm text-gray-500 mt-1 mb-4">Escrow is fully funded. Please wait for the freelancer to submit the final output.</p>
            </div>
            
            <div v-else-if="seal.status === 'Pending output review'" class="text-center py-4">
              <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Output Submitted!</p>
              <p class="text-sm text-gray-500 mt-1 mb-4">The freelancer has marked the work as complete. Once you receive and verify the final files, approve the work to release funds.</p>
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
              <p class="text-sm text-gray-500 mt-1 mb-4">You may begin work safely. Deliver the final files directly to your client, then mark the output as submitted.</p>
              <button @click="freelancerSubmitWork" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors">
                Mark Work as Submitted
              </button>
            </div>

            <div v-else-if="seal.status === 'Pending output review'" class="text-center py-4">
              <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="font-medium text-gray-900">Awaiting Client Approval</p>
              <p class="text-sm text-gray-500 mt-1">You have submitted the work. The client must now review the files and release the funds.</p>
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
          
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shareable Link</h3>
            <div class="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <input
                class="flex-1 bg-transparent focus:outline-none text-xs text-gray-600 truncate"
                readonly
                :value="generatedSealLink"
              />
              <button @click="copySealLink" class="ml-2 px-3 py-1.5 bg-seal-teal text-white rounded-md text-xs font-bold hover:bg-teal-700 transition-colors shrink-0">
                {{ linkPressed ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
    
    <div v-else class="text-center py-12">
       <p class="text-gray-500">Seal not found.</p>
       <button @click="router.back()" class="mt-4 text-seal-teal hover:underline">Go Back</button>
    </div>

    <div v-if="customModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
        
        <div v-if="customModal.type === 'confirm'" class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div v-else class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ customModal.title }}</h3>
        <p class="text-gray-500 text-sm mb-6">{{ customModal.message }}</p>
        
        <div v-if="customModal.type === 'confirm'" class="flex gap-3">
          <button @click="customModal.isOpen = false" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
            Cancel
          </button>
          <button @click="handleModalConfirm" class="flex-1 py-3 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-sm">
            {{ customModal.confirmText }}
          </button>
        </div>

        <button v-else @click="customModal.isOpen = false" class="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm transition-colors">
          Okay
        </button>

      </div>
    </div>

  </div>
</template>