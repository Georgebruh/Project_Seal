<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isCollapsed: boolean
}>()

const authStore = useAuthStore()
const router = useRouter()

const navigation = computed(() => {
  if (authStore.activeRole === 'freelancer') {
    return [
      { name: 'Dashboard', routeName: 'freelancer-dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'My Seals', routeName: 'my-seals', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      // --- ADDED CALENDAR NAVIGATION HERE ---
      { name: 'Calendar', routeName: 'freelancer-calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Analytics', routeName: 'analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2h-2a2 2 0 01-2-2z' },
      { name: 'History', routeName: 'history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  } else {
    // --- UPDATED CLIENT NAVIGATION ---
    return [
      { name: 'Overview', routeName: 'client-dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'My Seals', routeName: 'my-seals', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' }
    ]
  }
})

const handleRoleToggle = () => {
  authStore.toggleRole()
  if (authStore.activeRole === 'client') {
    router.push({ name: 'client-dashboard' })
  } else {
    router.push({ name: 'freelancer-dashboard' })
  }
}
</script>

<template>
  <aside 
    :class="[
      'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-20',
      isCollapsed ? 'w-0 border-r-0 opacity-0' : 'w-64 border-r border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-300/50 dark:shadow-slate-900/50 opacity-100'
    ]"
  >
    <div class="w-64 flex flex-col h-full">
      <div class="h-16 flex items-center px-6 border-b border-white/50 dark:border-slate-700/50 shrink-0 transition-colors duration-300"></div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p class="px-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 transition-colors">Tools</p>
        
        <RouterLink 
          v-for="item in navigation" 
          :key="item.name" 
          :to="{ name: item.routeName }"
          class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-slate-700/50 hover:text-seal-teal dark:hover:text-teal-400 transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-seal-teal dark:group-hover:text-teal-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
          </svg>
          <span class="font-medium text-sm">{{ item.name }}</span>
        </RouterLink>
  
        <RouterLink v-if="authStore.activeRole === 'freelancer'" :to="{ name: 'create-seal' }" class="w-full mt-4 flex items-center justify-center px-4 py-2 bg-seal-teal text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors text-sm font-medium shadow-md shadow-slate-300/50 dark:shadow-none">
          <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
           Make New Seal
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm shrink-0 transition-colors duration-300">
        <div class="bg-white/70 dark:bg-slate-800/80 p-3 rounded-lg border border-teal-100 dark:border-slate-600 shadow-sm mb-4 transition-colors duration-300">
          <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1 flex items-center transition-colors">
            <svg class="w-3 h-3 mr-1 text-yellow-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            Pro Tip
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-300 leading-tight transition-colors">
            {{ authStore.activeRole === 'freelancer' ? 'Clear communication prevents scope creep!' : 'Reviewing submissions within 24hrs builds trust.' }}
          </p>
        </div>

        <button 
          @click="handleRoleToggle" 
          class="w-full py-2 px-4 border border-white/60 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-white/80 dark:hover:bg-slate-600 hover:shadow-sm transition-all"
        >
          Log-in as {{ authStore.activeRole === 'freelancer' ? 'Client' : 'Freelancer' }}
        </button>
      </div>
    </div>
  </aside>
</template>