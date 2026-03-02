<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const route = useRoute()
const router = useRouter()
const isVerifying = ref(true)

onMounted(async () => {
  const sealId = route.query.seal_id
  
  if (sealId) {
    try {
      // Update the database to show the money is secured in escrow
      const { error } = await supabase
        .from('Seals')
        .update({ status: 'In progress' })
        .eq('id', sealId)

      if (error) throw error

      // Wait 2 seconds so the user can read the success message
      setTimeout(() => {
        router.push(`/seal/${sealId}`)
      }, 2000)

    } catch (error) {
      console.error("Error updating seal status:", error)
      alert("Payment verified, but failed to update project status.")
    }
  } else {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
    <div class="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center text-center">
      
      <div v-if="isVerifying" class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-seal-teal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <h2 class="text-xl font-bold text-gray-900">Verifying Payment...</h2>
        <p class="text-gray-500 mt-2">Securing funds in the escrow vault.</p>
      </div>

      <div v-else class="flex flex-col items-center">
        <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Payment Successful!</h2>
        <p class="text-gray-500 mt-2">Redirecting you back to your project...</p>
      </div>

    </div>
  </div>
</template>