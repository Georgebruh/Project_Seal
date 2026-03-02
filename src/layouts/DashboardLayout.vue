<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'
import profilePicture from '@/assets/PFPFOREVERYONE.png'

const authStore = useAuthStore()

const isSidebarCollapsed = ref(true)
const isProfileDropdownOpen = ref(false)
const hasNotifications = ref(true)
const hasSettingsNotif = ref(false)

const hasAnyNotification = computed(() => hasNotifications.value || hasSettingsNotif.value)
</script>

<template>
  <div class="flex h-screen bg-transparent font-sans text-seal-dark">
    
    <Sidebar :isCollapsed="isSidebarCollapsed" />

    <div class="flex-1 flex flex-col overflow-hidden relative">
      
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-6 shrink-0 z-10">
        <div class="flex items-center space-x-4">
          
          <button 
            @click="isSidebarCollapsed = !isSidebarCollapsed" 
            class="p-2 bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm rounded-lg text-gray-500 hover:text-seal-teal transition-all focus:outline-none flex items-center justify-center hover:shadow"
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

        <div class="flex items-center space-x-5 relative">
          
          <div 
            @click="isProfileDropdownOpen = !isProfileDropdownOpen"
            class="flex items-center space-x-3 cursor-pointer relative"
          >
            <span 
              v-if="!isProfileDropdownOpen && hasAnyNotification" 
              class="absolute -top-1 left-6 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white z-10"
            ></span>

            <img class="h-8 w-8 rounded-full bg-gray-300" :src="profilePicture" alt="Missing Profile Image" />
            <div class="hidden md:block text-sm">
              <p class="font-medium text-gray-700 leading-none">{{ authStore.user?.name || 'User' }}</p>
              <p class="text-xs text-gray-500 mt-1 capitalize">{{ authStore.activeRole }}</p>
            </div>
            <svg 
              class="w-4 h-4 text-gray-400 transition-transform duration-200" 
              :class="isProfileDropdownOpen ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <div 
            v-if="isProfileDropdownOpen" 
            class="absolute right-0 top-12 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-md shadow-lg py-1 border border-white/50 z-50"
          >
            <RouterLink to="/dashboard/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span>Profile</span>
              </div>
            </RouterLink>

            <RouterLink :to="{ name: 'notifications' }" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span>Notifications</span>
              </div>
              <span v-if="hasNotifications" class="block h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </RouterLink>

            <button class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Settings</span>
              </div>
              <span v-if="hasSettingsNotif" class="block h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </button>
            
            <div class="border-t border-gray-100/50 my-1"></div>
            
            <button class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center space-x-3">
               <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               <span>Log out</span>
            </button>
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