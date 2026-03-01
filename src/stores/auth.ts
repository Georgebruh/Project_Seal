import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

// export const useAuthStore = defineStore('auth', () => {
//   const activeRole = ref<'freelancer' | 'client'>('freelancer')   // default freelancer for now so you can build that view first
  
//   // Mock user data
//   const user = ref({
//     name: 'DexterBAyot Kristan Señagan',
//     email: 'george@projectseal.com',
//     avatar: 'https://via.placeholder.com/40'
//   })

//   function toggleRole() {
//     activeRole.value = activeRole.value === 'freelancer' ? 'client' : 'freelancer'
//   }

//   return { activeRole, user, toggleRole }
// })


// -- Above is mock data. Below is real implementation for now -- 

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const isAuthenticated = ref(false)

  // --- ADDED: Twilio/Supabase Phone Auth functionality ---


   // 1. Check if the user's phone number exists in the Profiles table.
   //    This prevents unregistered users from triggering SMS messages.


  const checkPhoneExists = async (phone: string) => {
    // Strip non-numeric characters (e.g., '+', '-') for the bigint comparison in the DB
    const numericPhone = phone.replace(/\D/g, '')

    const { data, error } = await supabase
      .from('Profiles')
      .select('id')
      .eq('phone_number', numericPhone)
      .maybeSingle() // Use maybeSingle to avoid errors if 0 rows are returned

    if (error) {
      console.error('Error checking phone:', error)
      return false
    }

    // Returns true if profile data exists, false if null
    return !!data 
  }

     // 2. Trigger SMS OTP via Supabase (which uses Twilio under the hood)

  const sendPhoneOtp = async (phone: string) => {
    // Phone must include country code, e.g., +1234567890
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    })

    if (error) throw error
    return data
  }


  // 3. Verify the OTP token entered by the user

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })

    if (error) throw error

    // On success, set the authenticated user state
    user.value = data.user
    isAuthenticated.value = true
    return data
  }

  // --- Keep your existing actions below (e.g., logout, connectWallet) ---
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    checkPhoneExists,
    sendPhoneOtp,
    verifyPhoneOtp,
    logout
    // ... expose any other existing functions here
  }
})