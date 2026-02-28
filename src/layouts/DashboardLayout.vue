<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'

const authStore = useAuthStore()

// Set to TRUE so the sidebar is retracted by default
const isSidebarCollapsed = ref(true)
</script>

<template>
  <div class="flex h-screen bg-seal-light font-sans text-seal-dark">
    
    <Sidebar :isCollapsed="isSidebarCollapsed" />

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