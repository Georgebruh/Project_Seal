<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="max-w-6xl mx-auto">
    
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
        Welcome Back, {{ authStore.user.name.split(' ')[0] }}!
      </h2>
      <p class="text-gray-500 mt-1">Ryan is Gay.</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
      <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Client Dashboard</h3>
      <p class="text-gray-500 max-w-md mx-auto">
        yesyesyewsyesyesyeseysyesy
      </p>
    </div>

  </div>
</template>