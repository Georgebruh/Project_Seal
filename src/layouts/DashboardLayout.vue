<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)

const navigation = computed(() => {
  if (authStore.activeRole === 'freelancer') {
    return [
      { name: 'My Seals', href: '#', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { name: 'Contract Automation', href: '#', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Calendar', href: '#', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Analytics', href: '#', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { name: 'History', href: '#', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  } else {
    return [
      { name: 'My Seals', href: '#', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { name: 'Calendar', href: '#', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'History', href: '#', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  }
})
</script>

<template>
  <div class="flex h-screen bg-seal-light font-sans text-seal-dark">
    
    <aside 
      :class="[
        'bg-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0',
        isSidebarCollapsed ? 'w-0 border-r-0 opacity-0' : 'w-64 border-r border-gray-200 opacity-100'
      ]"
    >
      <div class="w-64 flex flex-col h-full">
        <div class="h-16 flex items-center px-6 border-b border-gray-200 shrink-0"></div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tools</p>
          
          <RouterLink 
            v-for="item in navigation" 
            :key="item.name" 
            :to="item.href"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-seal-teal transition-colors group"
          >
            <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-seal-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
            </svg>
            <span class="font-medium text-sm">{{ item.name }}</span>
          </RouterLink>
    
         <RouterLink v-if="authStore.activeRole === 'freelancer'" to="/create-seal" class="w-full mt-4 flex items-center justify-center px-4 py-2 bg-seal-teal text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm">
          <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             Make New Seal
          </RouterLink>
        </nav>

        <div class="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div class="bg-white p-3 rounded-lg border border-teal-100 shadow-sm mb-4">
            <p class="text-xs text-gray-500 font-semibold mb-1 flex items-center">
              <svg class="w-3 h-3 mr-1 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              Pro Tip
            </p>
            <p class="text-xs text-gray-600 leading-tight">
              {{ authStore.activeRole === 'freelancer' ? 'Clear communication prevents scope creep!' : 'Reviewing submissions within 24hrs builds trust.' }}
            </p>
          </div>

          <button 
            @click="authStore.toggleRole" 
            class="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Log-in as {{ authStore.activeRole === 'freelancer' ? 'Client' : 'Freelancer' }}
          </button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden relative">
      
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
        
        <div class="flex items-center space-x-4">
          
          <button 
            @click="isSidebarCollapsed = !isSidebarCollapsed" 
            class="p-2 bg-white border border-gray-200 shadow-sm rounded-lg text-gray-500 hover:text-seal-teal transition-all focus:outline-none flex items-center justify-center hover:shadow"
            :title="isSidebarCollapsed ? 'Open Sidebar' : 'Close Sidebar'"
          >
            <svg class="w-5 h-5 transition-transform duration-300" :class="!isSidebarCollapsed ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="isSidebarCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <RouterLink to="/" class="h-10 flex items-center hover:opacity-80 transition-opacity">
            <img src="@/assets/TopBarLogo.svg" alt="Seal Logo" class="h-full w-auto object-contain" />
          </RouterLink>

        </div>

        <div class="flex items-center space-x-5">
          <button class="relative text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span class="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <button class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>

          <div class="flex items-center space-x-3 border-l border-gray-200 pl-5 cursor-pointer">
            <img class="h-8 w-8 rounded-full bg-gray-300" :src="authStore.user.avatar" alt="Profile" />
            <div class="hidden md:block text-sm">
              <p class="font-medium text-gray-700 leading-none">{{ authStore.user.name }}</p>
              <p class="text-xs text-gray-500 mt-1 capitalize">{{ authStore.activeRole }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-hidden relative flex flex-col">
        <main class="flex-1 overflow-y-auto p-8">
          <RouterView />
        </main>
      </div>

    </div>
  </div>
</template>