<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth' // Adjust path if needed

const authStore = useAuthStore()

onMounted(() => {
  // Sync Pinia with Supabase as soon as the app starts
  authStore.initialize()
})
</script>

<template>
  <RouterView />
</template>