<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const applyTheme = (theme: string) => {
  const root = document.documentElement
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

const notifications = ref({
  email: {
    newSeal: true,
    fundsSecured: true,
    marketing: false
  },
  sms: {
    newSeal: false,
    fundsSecured: true
  }
})

const preferences = ref({
  language: 'en',
  theme: localStorage.getItem('theme') || 'light' 
})

watch(() => preferences.value.theme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(() => {
  applyTheme(preferences.value.theme)
})

const isSaving = ref(false)
const saveSuccess = ref(false)

const handleSave = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  }, 800)
}

const handleLogoutAll = () => {
  alert('Simulating Supabase auth.signOut() from all other sessions...')
}
</script>

<template>
  <div class="max-w-4xl mx-auto font-sans text-slate-800 dark:text-gray-100">
    
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Account Settings</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your notifications, security, and app preferences.</p>
    </div>

    <div class="max-w-4xl grid grid-cols-1 gap-8">
      
      <section class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Control how Project Seal alerts you about your transactions.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Email Alerts</h3>
            
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">New Seal Created</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">When you generate a new transaction link.</p>
              </div>
              <input type="checkbox" v-model="notifications.email.newSeal" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative transition-colors"></div>
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Funds Secured</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">When a client deposits money into the vault.</p>
              </div>
              <input type="checkbox" v-model="notifications.email.fundsSecured" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative transition-colors"></div>
            </label>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">SMS Alerts</h3>
            
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Funds Secured (Urgent)</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Instant text when money is locked in escrow.</p>
              </div>
              <input type="checkbox" v-model="notifications.sms.fundsSecured" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative transition-colors"></div>
            </label>
          </div>
        </div>
      </section>

      <section class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">App Preferences</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Display Language</label>
            <select v-model="preferences.language" class="w-full bg-white/50 dark:bg-slate-700 border border-white/50 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-colors backdrop-blur-sm">
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
              <option value="ceb">Cebuano</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Interface Theme</label>
            <select v-model="preferences.theme" class="w-full bg-white/50 dark:bg-slate-700 border border-white/50 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-colors backdrop-blur-sm">
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="system">Sync with System</option>
            </select>
          </div>
        </div>
      </section>

      <section class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Security</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your active sessions and account status.</p>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-lg border border-white/50 dark:border-slate-600 mb-4 transition-colors">
          <div>
            <p class="font-semibold text-sm text-slate-900 dark:text-white">Active Sessions</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Log out of all other browsers and devices.</p>
          </div>
          <button @click="handleLogoutAll" class="mt-3 sm:mt-0 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-600 border border-white/80 dark:border-slate-500 hover:bg-white dark:hover:bg-slate-500 py-2 px-4 rounded-lg transition-colors shadow-sm">
            Log out other devices
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-100 dark:border-red-900/30 transition-colors">
          <div>
            <p class="font-semibold text-sm text-red-700 dark:text-red-400">Deactivate Account</p>
            <p class="text-xs text-red-500 dark:text-red-500">Permanently remove your profile and history.</p>
          </div>
          <button class="mt-3 sm:mt-0 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors shadow-sm">
            Deactivate
          </button>
        </div>
      </section>

      <div class="flex justify-end items-center gap-4 pt-2">
        <span v-if="saveSuccess" class="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          ✓ Preferences updated
        </span>
        <button 
          @click="handleSave" 
          class="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          :disabled="isSaving"
        >
          <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>

    </div>
  </div>
</template> 