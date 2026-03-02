<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const route = useRoute()
const router = useRouter()
const transactionId = route.params.id

// State
const isLoading = ref(true)
const isProcessing = ref(false)
const transaction = ref<any>(null)

// Signature Modal State
const showContractModal = ref(false)
const signatureInput = ref('')
const appliedSignature = ref('')

// Check if the contract has been signed
const isSigned = computed(() => appliedSignature.value.trim().length > 0)

// Fetching the Transaction Details from Supabase
onMounted(async () => {
  try {
    isLoading.value = true

    // 1. Fetch the Seal Data
    const { data: sealData, error: sealError } = await supabase
      .from('Seals')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (sealError) throw sealError

    // 2. Fetch Freelancer Name
    let fName = 'Unknown Freelancer'
    if (sealData.freelancer_id) {
      const { data: profileData } = await supabase
        .from('Profiles')
        .select('full_name')
        .eq('id', sealData.freelancer_id)
        .single()
      
      if (profileData && profileData.full_name) {
        fName = profileData.full_name
      }
    }

    // 3. Map to the transaction object to match your template
    transaction.value = {
      id: sealData.id,
      projectName: sealData.project_name,
      freelancerName: fName,
      totalAmount: sealData.total_amount,
      depositPercentage: sealData.deposit_percentage || 100,
      contractText: sealData.contract_text
    }

  } catch (error) {
    console.error('Error fetching checkout details:', error)
    alert('Failed to load transaction details.')
  } finally {
    isLoading.value = false
  }
})

const depositAmount = computed(() => {
  if (!transaction.value) return 0
  return transaction.value.totalAmount * (transaction.value.depositPercentage / 100)
})

const signContract = () => {
  if (signatureInput.value.trim() !== '') {
    appliedSignature.value = signatureInput.value.trim()
    showContractModal.value = false
  }
}

const handlePayMongoCheckout = async () => {
  try {
    isProcessing.value = true
    
    // Call the PayMongo Edge Function
    const { data, error } = await supabase.functions.invoke('create-paymongo-checkout', {
      body: { 
        amount: depositAmount.value, 
        description: `Escrow Deposit for ${transaction.value.projectName}`,
        successUrl: `${window.location.origin}/payment-success?seal_id=${transaction.value.id}`,
        cancelUrl: window.location.href 
      }
    })

    if (error) throw error
    if (data && data.checkoutUrl) {
      // Redirect the client to the secure PayMongo gateway
      window.location.href = data.checkoutUrl
    } else {
      throw new Error("No checkout URL returned")
    }
  } catch (error) {
    console.error('Payment initialization failed:', error)
    alert('Failed to connect to payment gateway. Please try again.')
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans relative">
    
    <div class="mb-8">
      <img src="@/assets/TopBarLogo.svg" alt="Project Seal" class="h-10 w-auto" />
    </div>

    <div v-if="isLoading" class="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center">
      <svg class="animate-spin h-10 w-10 text-seal-teal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="text-gray-500 font-medium">Loading secure transaction...</p>
    </div>

    <div v-else class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-md w-full">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-teal-50 text-seal-teal rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Secure Escrow Deposit</h2>
        <p class="text-sm text-gray-500 mt-2">You are funding a project via Project Seal.</p>
      </div>

      <div class="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 space-y-4">
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Project</p>
          <p class="font-medium text-gray-900">{{ transaction.projectName }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Freelancer</p>
          <p class="font-medium text-gray-900">{{ transaction.freelancerName }}</p>
        </div>
        
        <div class="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
          <span class="font-bold text-gray-900">Amount Due Today</span>
          <span class="text-2xl font-bold text-seal-teal">₱{{ depositAmount.toLocaleString() }}</span>
        </div>
      </div>

      <div v-if="isSigned" class="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <p class="text-xs text-green-700 font-medium uppercase tracking-wider">Digitally Signed By</p>
            <p class="text-sm font-bold text-green-900">{{ appliedSignature }}</p>
          </div>
        </div>
        <button @click="showContractModal = true" class="text-xs text-green-700 font-medium hover:underline">
          View
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        
        <button 
          @click="router.push(`/seal/${transaction.id}`)"
          class="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 hover:border-seal-teal hover:text-seal-teal rounded-xl font-bold transition-colors text-center shadow-sm"
        >
          View More
        </button>

        <button 
          v-if="!isSigned"
          @click="showContractModal = true"
          class="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md transition-all flex justify-center items-center text-center"
        >
          Sign Contract to Pay
        </button>

        <button 
          v-else
          @click="handlePayMongoCheckout"
          :disabled="isProcessing"
          class="flex-1 py-4 bg-seal-teal hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed text-center"
        >
          <svg v-if="isProcessing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ isProcessing ? 'Initializing...' : 'Start Payment' }}
        </button>

      </div>

    </div>

    <div v-if="showContractModal && transaction" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-900 text-lg flex items-center">
            <svg class="w-5 h-5 mr-2 text-seal-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Digital Contract Review
          </h3>
          <button @click="showContractModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="p-6 bg-white flex-1 overflow-y-auto font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {{ transaction.contractText }}
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <label class="block text-sm font-medium text-gray-700 mb-2">Type your full name to electronically sign:</label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input 
              v-model="signatureInput" 
              type="text" 
              placeholder="e.g. John Doe" 
              class="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal font-medium" 
            />
            <button 
              @click="signContract"
              :disabled="!signatureInput.trim()"
              class="px-6 py-3 bg-seal-teal text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Sign & Accept
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            By signing, you acknowledge this holds the same legal weight as a physical signature under the E-Commerce Act blah blah blah.
          </p>
        </div>

      </div>
    </div>

  </div>
</template>