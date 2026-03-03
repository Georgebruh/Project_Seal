<script setup lang="ts">
import { supabase } from '@/supabase'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentStep = ref(1)
const isSubmitting = ref(false)
const sealLink = ref('')
const showLink = ref(false)
const linkPressed = ref(false)

// Form Data State - Removed deposit_percentage, milestone_phases, and terms
const form = ref({
  project_name: '',
  total_amount: null as number | null,
  service_fee: 0,
  status: 'Pending review',
  project_type: 'Web Development',
  scope: '',
  contract_template: 'Standard Service Agreement',
  contract_text: '',
  start_date: '',
  end_date: '',
  client_name: ''
})

const errors = ref<Record<string, string>>({})
const projectTypes = ['Web Development', 'Mobile App', 'Graphic Design', 'Writing', 'Consulting', 'Other']
const templates = ['Standard Service Agreement', 'Work for Hire Agreement', 'NDA + Basic Services']

const generatedContract = computed(() => {
  return `
CONTRACT OF SERVICE: ${form.value.contract_template.toUpperCase()}

This Agreement is made for the project "${form.value.project_name || '[Project Name]'}" 
starting on ${form.value.start_date || '[Start Date]'} and concluding on ${form.value.end_date || '[End Date]'}.

1. SCOPE OF WORK: 
${form.value.scope || '[Scope details will appear here]'}

2. COMPENSATION & PAYMENT TERMS: 
The total compensation for this project is ₱${form.value.total_amount || '0.00'}.
The full amount (100%) is required to be deposited into the secure platform escrow to begin work.
The funds shall be released in full to the freelancer upon project completion and client approval.
  
By accepting this Seal, both parties agree to the terms outlined above and the platform escrow conditions.
  `.trim()
})

const validateStep1 = () => {
  errors.value = {} 
  let isValid = true

  if (!form.value.project_name.trim()) { errors.value.project_name = 'Project name is required.'; isValid = false }
  if (!form.value.client_name.trim()) { errors.value.client_name = 'Client name is required.'; isValid = false }
  if (!form.value.scope.trim()) { errors.value.scope = 'Scope and deliverables are required.'; isValid = false }
  if (!form.value.total_amount || form.value.total_amount <= 0) { errors.value.total_amount = 'Please enter a valid total amount.'; isValid = false }
  if (!form.value.start_date) { errors.value.start_date = 'Start date is required.'; isValid = false }
  if (!form.value.end_date) { errors.value.end_date = 'End date is required.'; isValid = false } 
  else if (form.value.start_date && form.value.end_date < form.value.start_date) { errors.value.end_date = 'End date cannot be before start date.'; isValid = false }

  return isValid
}

const nextStep = () => {
  if (currentStep.value === 1 && validateStep1()) {
    currentStep.value = 2
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value === 2) currentStep.value = 1
}

const copyLink = async () => {
  if (!sealLink.value) return
  try {
    await navigator.clipboard.writeText(sealLink.value)
    linkPressed.value = true
  } catch (err) {
    console.error('Clipboard write failed', err)
  }
}

const submitSeal = async () => {
  isSubmitting.value = true
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    alert('You must be logged in to create a Seal.')
    isSubmitting.value = false
    return
  }

  const dummySlug = Date.now().toString(36)

  const payload = {
    ...form.value,
    freelancer_id: user.id,
    shareable_link_slug: dummySlug,
    contract_text: generatedContract.value,
    service_fee: form.value.total_amount ? (form.value.total_amount * 0.05).toFixed(2) : 0 
  }

  const { data: newSeal, error: insertError } = await supabase
    .from('Seals')
    .insert(payload)
    .select()
    .single()
  
  if (insertError || !newSeal) {
    console.error('Error saving seal:', insertError)
    alert('Database error: ' + (insertError?.message || 'Unknown error'))
    isSubmitting.value = false
    return
  } 

  sealLink.value = `${window.location.origin}/seal/${newSeal.id}`
  
  await supabase
    .from('Seals')
    .update({ shareable_link: sealLink.value })
    .eq('id', newSeal.id)

  isSubmitting.value = false
  showLink.value = true
}
</script>

<template>
  <div v-if="!showLink" class="max-w-4xl mx-auto pb-12 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
  
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Make New Seal</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
          {{ currentStep === 1 ? 'Define the terms of your project and generate a contract.' : 'Review your terms and confirm the contract.' }}
        </p>
      </div>
      
      <nav aria-label="Progress">
        <ol role="list" class="flex items-center space-x-3">
          <li>
            <button @click="currentStep = 1" class="flex items-center group focus:outline-none" aria-current="step">
              <span :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-sm',
                currentStep === 1 ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'border-teal-500 bg-teal-500 text-white group-hover:bg-teal-600'
              ]">
                <svg v-if="currentStep > 1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span v-else class="text-sm font-bold">1</span>
              </span>
              <span :class="['ml-3 text-sm font-medium transition-colors duration-300', currentStep === 1 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white']">
                Details
              </span>
            </button>
          </li>
          <li class="flex items-center" aria-hidden="true">
            <div :class="['w-10 h-0.5 rounded transition-colors duration-500', currentStep === 2 ? 'bg-teal-500' : 'bg-white/60 dark:bg-slate-600']"></div>
          </li>
          <li>
            <div class="flex items-center">
              <span :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-sm',
                currentStep === 2 ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'border-white/60 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500'
              ]">
                <span class="text-sm font-bold">2</span>
              </span>
              <span :class="['ml-3 text-sm font-medium transition-colors duration-300', currentStep === 2 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500']">
                Review
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <div v-if="currentStep === 1" class="space-y-6">
      
      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 p-6 shadow-lg transition-colors">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-white/40 dark:border-slate-700/50 pb-2 transition-colors">Project Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Client Name<span class="text-red-500">*</span></label>
            <input v-model="form.client_name" type="text" placeholder="e.g. John Dela Cruz" :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.client_name ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']" />
            <p v-if="errors.client_name" class="mt-1 text-xs text-red-500">{{ errors.client_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Project Name <span class="text-red-500">*</span></label>
            <input v-model="form.project_name" type="text" placeholder="e.g. E-Commerce Redesign" :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.project_name ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']" />
            <p v-if="errors.project_name" class="mt-1 text-xs text-red-500">{{ errors.project_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Project Type</label>
            <select v-model="form.project_type" class="w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/50 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors text-gray-900 dark:text-white shadow-sm focus:bg-white/90 dark:focus:bg-slate-800">
              <option class="dark:bg-slate-800" v-for="ptype in projectTypes" :key="ptype" :value="ptype">{{ ptype }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Brief Scope & Deliverables <span class="text-red-500">*</span></label>
            <textarea v-model="form.scope" rows="3" placeholder="Describe what will be delivered..." :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.scope ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']"></textarea>
            <p v-if="errors.scope" class="mt-1 text-xs text-red-500">{{ errors.scope }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 p-6 shadow-lg transition-colors">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-white/40 dark:border-slate-700/50 pb-2 transition-colors">Pricing & Payments</h3>
        <div class="grid grid-cols-1 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Total Amount (₱) <span class="text-red-500">*</span></label>
            <input v-model="form.total_amount" type="number" placeholder="50000" :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.total_amount ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']" />
            <p v-if="errors.total_amount" class="mt-1 text-xs text-red-500">{{ errors.total_amount }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">100% of this amount will be securely held in escrow until you complete the project.</p>
          </div>
        </div>
      </div>

      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 p-6 shadow-lg transition-colors">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-white/40 dark:border-slate-700/50 pb-2 transition-colors">Timeline & Template</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Start Date <span class="text-red-500">*</span></label>
            <input v-model="form.start_date" type="date" :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.start_date ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']" />
            <p v-if="errors.start_date" class="mt-1 text-xs text-red-500">{{ errors.start_date }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">End Date <span class="text-red-500">*</span></label>
            <input v-model="form.end_date" type="date" :class="['w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 dark:text-white shadow-sm focus:bg-white/90 dark:focus:bg-slate-800', errors.end_date ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200' : 'border-white/50 dark:border-slate-600 focus:border-teal-500 focus:ring-teal-500/50']" />
            <p v-if="errors.end_date" class="mt-1 text-xs text-red-500">{{ errors.end_date }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Select Contract Template</label>
            <select v-model="form.contract_template" class="w-full px-4 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/50 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors text-gray-900 dark:text-white shadow-sm focus:bg-white/90 dark:focus:bg-slate-800">
              <option class="dark:bg-slate-800" v-for="template in templates" :key="template" :value="template">{{ template }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button @click="nextStep" class="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition-all">
          Next: Review & Confirm
        </button>
      </div>

    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 p-6 shadow-lg transition-colors">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 transition-colors">Project Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400 transition-colors">Name:</span> <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ form.project_name }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400 transition-colors">Type:</span> <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ form.project_type }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400 transition-colors">Total:</span> <span class="text-gray-900 dark:text-white font-bold transition-colors">₱{{ form.total_amount }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 dark:text-gray-400 transition-colors">Dates:</span> <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ form.start_date }} to {{ form.end_date }}</span></div>
            </div>
            <button @click="prevStep" class="w-full mt-6 py-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/60 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-white/80 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white transition-colors text-sm shadow-sm">
              Edit Details
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 p-8 shadow-lg h-full flex flex-col transition-colors">
            <div class="flex justify-between items-center border-b border-white/40 dark:border-slate-700/50 pb-4 mb-4 transition-colors">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white transition-colors">Contract Preview</h3>
              <span class="px-2 py-1 bg-blue-50/80 dark:bg-blue-900/40 border border-blue-100/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-sm">Draft</span>
            </div>
            
            <div class="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/50 dark:border-slate-700 overflow-y-auto font-mono text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap shadow-inner h-100 transition-colors">
              {{ generatedContract }}
            </div>

            <div class="mt-6 pt-4 border-t border-white/40 dark:border-slate-700/50 flex justify-end transition-colors">
              <button 
                @click="submitSeal" 
                :disabled="isSubmitting"
                class="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg v-if="!isSubmitting" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ isSubmitting ? 'Creating Seal...' : 'Create Seal & Send Invite' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="text-center py-24 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Seal Created!</h2>
    <p class="mb-6 text-gray-600 dark:text-gray-400 transition-colors">Share the link below with your client so they can review and pay.</p>

    <div class="max-w-xl mx-auto w-full mb-6">
      <div class="flex items-center bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/60 dark:border-slate-600 shadow-sm rounded-lg px-4 py-3 transition-colors">
        <input
          class="flex-1 bg-transparent focus:outline-none text-sm truncate text-gray-800 dark:text-gray-200 transition-colors"
          readonly
          :value="sealLink"
        />
        <button @click="copyLink" :disabled="linkPressed" class="ml-4 px-3 py-1 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-colors">{{ linkPressed ? 'Link Copied!' : 'Copy Link' }}</button>
      </div>
    </div>

    <div>
      <button @click="router.push({ name: 'freelancer-dashboard'})" class="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 hover:shadow-md transition-all">
        Back to Dashboard
      </button>
    </div>
  </div>
</template>