<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'
import profilePicture from '@/assets/PFPFOREVERYONE.png'

const authStore = useAuthStore()

// State to hold the real database data
const dbProfile = ref({
  name: '',
  email: '',
  phone_number: ''
})

const isLoading = ref(true)

// Mock data for UI presentation 
const userStats = ref({
  transactions: 24,
  rating: 4.8,
  disputes: 0
})

const verificationStatus = ref<'verified' | 'pending' | 'unverified'>('verified')

const paymentMethods = ref([
  { id: 1, type: 'GCash', number: '**** **** 4567', isDefault: true },
  { id: 2, type: 'Maya', number: '**** **** 8901', isDefault: false },
])

// Fetch the real profile data when the page loads
onMounted(async () => {
  if (authStore.user?.email) {
    const { data, error } = await supabase
      .from('Profiles')
      .select('full_name, email, phone_number') // Update these if your DB columns have different names
      .eq('email', authStore.user.email)
      .single()

    if (error) {
      console.error('Error fetching profile from DB:', error)
    } else if (data) {
      dbProfile.value = {
        name: data.full_name || 'No name set',
        email: data.email || 'No email set',
        phone_number: data.phone_number || 'No phone set'
      }
    }
  }
  isLoading.value = false
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">My Profile</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage your account settings, verification, and payment methods.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-1 space-y-6">
        
        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 flex flex-col items-center text-center transition-colors duration-300">
          <div class="relative">
            <img 
              :src="profilePicture" 
              alt="Missing Profile Picture" 
              class="h-24 w-24 rounded-full object-cover border-4 border-white/80 dark:border-slate-700 bg-gray-200 dark:bg-slate-600 shadow-sm"
            />
            <button class="absolute bottom-0 right-0 bg-white/90 dark:bg-slate-700 p-1.5 rounded-full shadow border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors backdrop-blur-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          </div>
          
          <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{{ dbProfile.name }}</h2>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-2 transition-colors"
                :class="authStore.activeRole === 'freelancer' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'">
            {{ authStore.activeRole }}
          </span>

          <div class="w-full mt-6 pt-6 border-t border-gray-100 dark:border-slate-700/50">
            <div class="flex justify-between text-sm mb-3">
              <span class="text-gray-500 dark:text-gray-400">Email</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ dbProfile.email }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Phone</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ dbProfile.phone_number }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Reputation</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/50 dark:border-slate-600 p-3 rounded-lg text-center transition-colors">
              <span class="block text-2xl font-bold text-gray-900 dark:text-white">{{ userStats.transactions }}</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400 mt-1">Transactions</span>
            </div>
            <div class="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/50 dark:border-slate-600 p-3 rounded-lg text-center transition-colors">
              <div class="flex items-center justify-center space-x-1">
                <span class="block text-2xl font-bold text-gray-900 dark:text-white">{{ userStats.rating }}</span>
                <svg class="w-4 h-4 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
              <span class="block text-xs text-gray-500 dark:text-gray-400 mt-1">Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        
        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Identity Verification</h3>
            <span v-if="verificationStatus === 'verified'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 transition-colors">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
              Verified
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Verifying your identity with a valid ID (like PhilSys or a Driver's License) builds trust and increases your escrow limits.</p>
          
          <button v-if="verificationStatus !== 'verified'" class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Start Verification Process
          </button>
          <div v-else class="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/50 dark:border-slate-600 flex items-start space-x-3 transition-colors">
             <svg class="w-6 h-6 text-green-500 mt-0.5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             <div>
               <p class="text-sm font-medium text-gray-900 dark:text-white">Identity Verified</p>
               <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Your government ID has been securely processed. You are cleared for all escrow transactions.</p>
             </div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Payout Methods</h3>
            <button class="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">Add New</button>
          </div>
          
          <div class="space-y-3">
            <div v-for="method in paymentMethods" :key="method.id" class="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 bg-white/40 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg hover:border-teal-500 dark:hover:border-teal-400 transition-colors cursor-pointer" :class="{'border-teal-500 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-900/20': method.isDefault}">
              <div class="flex items-center space-x-3">
                <div class="h-10 w-10 bg-white/80 dark:bg-slate-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-sm">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ method.type }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ method.number }}</p>
                </div>
              </div>
              <div v-if="method.isDefault" class="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded transition-colors">
                Default
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>