import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const activeRole = ref<'freelancer' | 'client'>('freelancer')   // default freelancer for now so you can build that view first
  
  // Mock user data
  const user = ref({
    name: 'DexterBAyot Kristan Señagan',
    email: 'george@projectseal.com',
    avatar: 'https://via.placeholder.com/40'
  })

  function toggleRole() {
    activeRole.value = activeRole.value === 'freelancer' ? 'client' : 'freelancer'
  }

  return { activeRole, user, toggleRole }
})