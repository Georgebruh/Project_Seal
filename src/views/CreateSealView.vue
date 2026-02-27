<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// UI State
const currentStep = ref(1)
const isSubmitting = ref(false)

// Form Data State
const form = ref({
  projectName: '',
  projectType: 'Web Development',
  scope: '',
  totalAmount: null as number | null,
  depositPercentage: 50,
  paymentTerms: 'completion', 
  milestonePhases: 2,
  startDate: '',
  endDate: '',
  contractTemplate: 'Standard Service Agreement'
})

// Validation State
const errors = ref<Record<string, string>>({})

const projectTypes = ['Web Development', 'Mobile App', 'Graphic Design', 'Writing', 'Consulting', 'Other']
const templates = ['Standard Service Agreement', 'Work for Hire Agreement', 'NDA + Basic Services']
//this will be changed later
const generatedContract = computed(() => {
  return `
CONTRACT OF SERVICE: ${form.value.contractTemplate.toUpperCase()}

This Agreement is made for the project "${form.value.projectName || '[Project Name]'}" 
starting on ${form.value.startDate || '[Start Date]'} and concluding on ${form.value.endDate || '[End Date]'}.

1. SCOPE OF WORK: 
${form.value.scope || '[Scope details will appear here]'}

2. COMPENSATION: 
The total compensation for this project is ₱${form.value.totalAmount || '0.00'}.
A deposit of ${form.value.depositPercentage}% (₱${((form.value.totalAmount || 0) * (form.value.depositPercentage / 100)).toFixed(2)}) is required to begin work.

3. PAYMENT TERMS: 
${form.value.paymentTerms === 'completion' 
  ? 'The remaining balance shall be paid in full upon project completion.' 
  : `The remaining balance shall be paid across ${form.value.milestonePhases} project milestones.`}
  
By accepting this Seal, both parties agree to the terms outlined above and the platform escrow conditions.
  `.trim()
})


// Validation logic for Step 1
const validateStep1 = () => {
  errors.value = {} 
  let isValid = true

  if (!form.value.projectName.trim()) { errors.value.projectName = 'Project name is required.'; isValid = false }
  if (!form.value.scope.trim()) { errors.value.scope = 'Scope and deliverables are required.'; isValid = false }
  if (!form.value.totalAmount || form.value.totalAmount <= 0) { errors.value.totalAmount = 'Please enter a valid total amount.'; isValid = false }
  if (form.value.depositPercentage === null || form.value.depositPercentage < 0 || form.value.depositPercentage > 100) { errors.value.depositPercentage = 'Deposit must be between 0 and 100%.'; isValid = false }
  if (!form.value.startDate) { errors.value.startDate = 'Start date is required.'; isValid = false }
  if (!form.value.endDate) { errors.value.endDate = 'End date is required.'; isValid = false } 
  else if (form.value.startDate && form.value.endDate < form.value.startDate) { errors.value.endDate = 'End date cannot be before start date.'; isValid = false }
  if (form.value.paymentTerms === 'milestone' && (!form.value.milestonePhases || form.value.milestonePhases < 2)) { errors.value.milestonePhases = 'At least 2 phases required.'; isValid = false }

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

const submitSeal = () => {
  isSubmitting.value = true
  
  // Fake a quick loading delay
  setTimeout(() => {
    // ----------------------------------------------------
    // TODO: Connect this to Supabase later!
    console.log('Ready to send to Supabase:', form.value)
    console.log('Contract Text:', generatedContract.value)
    // ----------------------------------------------------

    isSubmitting.value = false
    router.push('/') // Send back to dashboard
  }, 600)
}
</script>

<template>
  <div class="max-w-4xl mx-auto pb-12">
    
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Make New Seal</h2>
        <p class="text-gray-500 mt-1">
          {{ currentStep === 1 ? 'Define the terms of your project and generate a contract.' : 'Review your terms and confirm the contract.' }}
        </p>
      </div>
      
      <nav aria-label="Progress">
        <ol role="list" class="flex items-center space-x-3">
          <li>
            <button @click="currentStep = 1" class="flex items-center group focus:outline-none" aria-current="step">
              <span :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                currentStep === 1 ? 'border-seal-teal bg-teal-50 text-seal-teal' : 'border-seal-teal bg-seal-teal text-white group-hover:bg-teal-700'
              ]">
                <svg v-if="currentStep > 1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span v-else class="text-sm font-bold">1</span>
              </span>
              <span :class="['ml-3 text-sm font-medium transition-colors duration-300', currentStep === 1 ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900']">
                Details
              </span>
            </button>
          </li>
          <li class="flex items-center" aria-hidden="true">
            <div :class="['w-10 h-0.5 rounded transition-colors duration-500', currentStep === 2 ? 'bg-seal-teal' : 'bg-gray-200']"></div>
          </li>
          <li>
            <div class="flex items-center">
              <span :class="[
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                currentStep === 2 ? 'border-seal-teal bg-teal-50 text-seal-teal' : 'border-gray-200 bg-white text-gray-400'
              ]">
                <span class="text-sm font-bold">2</span>
              </span>
              <span :class="['ml-3 text-sm font-medium transition-colors duration-300', currentStep === 2 ? 'text-gray-900 font-bold' : 'text-gray-400']">
                Review
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <div v-if="currentStep === 1" class="space-y-6">
      
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">Project Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Name <span class="text-red-500">*</span></label>
            <input v-model="form.projectName" type="text" placeholder="e.g. E-Commerce Redesign" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.projectName ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.projectName" class="mt-1 text-xs text-red-500">{{ errors.projectName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select v-model="form.projectType" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal transition-colors">
              <option v-for="ptype in projectTypes" :key="ptype" :value="ptype">{{ ptype }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Brief Scope & Deliverables <span class="text-red-500">*</span></label>
            <textarea v-model="form.scope" rows="3" placeholder="Describe what will be delivered..." :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.scope ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']"></textarea>
            <p v-if="errors.scope" class="mt-1 text-xs text-red-500">{{ errors.scope }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">Pricing & Payments</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount (₱) <span class="text-red-500">*</span></label>
            <input v-model="form.totalAmount" type="number" placeholder="50000" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.totalAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.totalAmount" class="mt-1 text-xs text-red-500">{{ errors.totalAmount }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Upfront Deposit (%) <span class="text-red-500">*</span></label>
            <input v-model="form.depositPercentage" type="number" min="0" max="100" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.depositPercentage ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.depositPercentage" class="mt-1 text-xs text-red-500">{{ errors.depositPercentage }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select v-model="form.paymentTerms" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal transition-colors">
              <option value="completion">Upon Completion</option>
              <option value="milestone">By Milestone</option>
            </select>
          </div>
          <div v-if="form.paymentTerms === 'milestone'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Number of Phases <span class="text-red-500">*</span></label>
            <input v-model="form.milestonePhases" type="number" min="2" max="10" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.milestonePhases ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.milestonePhases" class="mt-1 text-xs text-red-500">{{ errors.milestonePhases }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">Timeline & Template</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date <span class="text-red-500">*</span></label>
            <input v-model="form.startDate" type="date" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.startDate" class="mt-1 text-xs text-red-500">{{ errors.startDate }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date <span class="text-red-500">*</span></label>
            <input v-model="form.endDate" type="date" :class="['w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors', errors.endDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-seal-teal focus:ring-seal-teal/50']" />
            <p v-if="errors.endDate" class="mt-1 text-xs text-red-500">{{ errors.endDate }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Contract Template</label>
            <select v-model="form.contractTemplate" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-teal/50 focus:border-seal-teal transition-colors">
              <option v-for="template in templates" :key="template" :value="template">{{ template }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button @click="nextStep" class="px-8 py-3 bg-seal-teal text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors">
          Next: Review & Confirm
        </button>
      </div>

    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="font-bold text-gray-900 mb-4">Project Summary</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Name:</span> <span class="font-medium text-gray-900">{{ form.projectName }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Type:</span> <span class="font-medium text-gray-900">{{ form.projectType }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Total:</span> <span class="text-gray-900 font-bold">₱{{ form.totalAmount }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Deposit:</span> <span class="font-medium text-gray-900">{{ form.depositPercentage }}%</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Terms:</span> <span class="font-medium text-gray-900 capitalize">{{ form.paymentTerms }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Dates:</span> <span class="font-medium text-gray-900">{{ form.startDate }} to {{ form.endDate }}</span></div>
            </div>
            <button @click="prevStep" class="w-full mt-6 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Edit Details
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
            <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 class="text-lg font-bold text-gray-900">Contract Preview</h3>
              <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wider">Draft</span>
            </div>
            
            <div class="flex-1 bg-white rounded-xl p-6 border border-gray-200 overflow-y-auto font-mono text-sm text-gray-700 whitespace-pre-wrap shadow-inner h-100">
              {{ generatedContract }}
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                @click="submitSeal" 
                :disabled="isSubmitting"
                class="px-8 py-3 bg-seal-teal text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
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
</template>