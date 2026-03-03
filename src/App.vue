<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  const root = document.documentElement
  
  if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

onMounted(() => {
  // Initialize theme first to prevent flash of light mode
  initTheme()
  // Sync Pinia with Supabase
  authStore.initialize()
})
</script>

<template>
  <RouterView />
</template>