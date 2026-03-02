<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'
import profilePicture from '@/assets/PFPFOREVERYONE.png'

const authStore = useAuthStore()
const router = useRouter()

const isSidebarCollapsed = ref(true)
const isProfileDropdownOpen = ref(false)
const hasNotifications = ref(true)
const hasSettingsNotif = ref(false)

const hasAnyNotification = computed(() => hasNotifications.value || hasSettingsNotif.value)

const dashboardRoute = computed(() => {
  return authStore.activeRole === 'client' 
    ? { name: 'client-dashboard' } 
    : { name: 'freelancer-dashboard' }
})
</script>

<template>
  <div class="flex h-screen bg-transparent font-sans text-seal-dark">
    
    <Sidebar 
      :isCollapsed="isSidebarCollapsed" 
      class="shadow-[4px_0_30px_rgba(0,0,0,0.15)] drop-shadow-2xl border-r border-gray-200/50"
      style="z-index: 50;"
    />

    <div class="flex-1 flex flex-col overflow-hidden relative z-0">
      
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-6 shrink-0 z-20 relative transition-transform duration-300">
        <div class="flex items-center">
          <RouterLink :to="dashboardRoute" class="h-10 flex items-center hover:opacity-80 transition-opacity">
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

            <img class="h-8 w-8 rounded-full bg-gray-300 shadow-sm" :src="profilePicture" alt="Missing Profile Image" />
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
            
            <div class="border-t border-gray-100/50 my-1"></div>
            
            <button class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center space-x-3">
               <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               <span>Log out</span>
            </button>
          </div>
          
        </div>
      </header>

      <div class="flex-1 overflow-hidden relative flex flex-col">
        
        <div 
          class="absolute inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-all duration-500 ease-out"
          :class="!isSidebarCollapsed ? 'opacity-100 visible cursor-pointer' : 'opacity-0 invisible pointer-events-none'"
          @click="isSidebarCollapsed = true"
        ></div>

        <main 
          class="flex-1 overflow-y-auto p-8 transition-all duration-500 ease-out origin-top"
          :class="!isSidebarCollapsed ? 'scale-[0.98] rounded-b-3xl bg-white/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] pointer-events-none select-none' : ''"
        >
          <div class="mb-6 flex relative z-10">
            <button 
              @click="isSidebarCollapsed = !isSidebarCollapsed" 
              class="relative flex items-center justify-center w-[100px] h-[44px] backdrop-blur-md border shadow-sm rounded-2xl transition-all duration-300 focus:outline-none hover:shadow-md group overflow-hidden"
              :class="isSidebarCollapsed ? 'animate-cycle-bg text-gray-700' : 'bg-white/60 border-white/60 text-gray-700 hover:text-seal-teal hover:bg-white/90'"
              title="Toggle Menu"
            >
              
              <div 
                class="absolute inset-0 flex items-center justify-center transition-all duration-300"
                :class="isSidebarCollapsed ? 'animate-cycle-text' : 'opacity-100 translate-y-0 scale-100'"
              >
                <svg class="w-4 h-4 mr-1.5 currentColor transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <span class="font-bold text-sm tracking-wide">Menu</span>
              </div>

              <div 
                class="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0"
                :class="isSidebarCollapsed ? 'animate-cycle-icon' : 'translate-y-4 scale-75'"
              >
                <img 
                  src="@/assets/seal-face.png" 
                  alt="Seal Menu Icon" 
                  class="w-40 h-40 scale-110 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-125" 
                />
              </div>

            </button>
          </div>

          <RouterView />
        </main>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* CHANGED: Added bgSwap for the background color transition */
.animate-cycle-bg {
  animation: bgSwap 14s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
.animate-cycle-text {
  animation: textSwap 14s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
.animate-cycle-icon {
  animation: iconSwap 14s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes bgSwap {
  0%, 45% { 
    background-color: rgba(255, 255, 255, 0.6); 
    border-color: rgba(255, 255, 255, 0.6); 
  }
  48%, 95% { 
    background-color: #0d9488; /* Tailwind's text-seal-teal */
    border-color: #0d9488; 
  }
  98%, 100% { 
    background-color: rgba(255, 255, 255, 0.6); 
    border-color: rgba(255, 255, 255, 0.6); 
  }
}

@keyframes textSwap {
  0%, 45% { opacity: 1; transform: translateY(0px) scale(1); pointer-events: auto; }
  48%, 50% { opacity: 0; transform: translateY(-15px) scale(0.8); pointer-events: none; }
  50.1%, 95% { opacity: 0; transform: translateY(15px) scale(0.8); pointer-events: none; }
  98%, 100% { opacity: 1; transform: translateY(0px) scale(1); pointer-events: auto; }
}

@keyframes iconSwap {
  0%, 45% { opacity: 0; transform: translateY(15px) scale(0.5) rotate(-10deg); pointer-events: none; }
  48%, 95% { opacity: 1; transform: translateY(0px) scale(1) rotate(0deg); pointer-events: auto; }
  98%, 100% { opacity: 0; transform: translateY(-15px) scale(0.5) rotate(10deg); pointer-events: none; }
}
</style>