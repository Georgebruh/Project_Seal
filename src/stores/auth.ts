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

  // --- Helper to normalize phone numbers ---
  // Twilio requires E.164 format (+639xxxxxxxxx). This converts local 09... to +63...
  const formatToE164 = (phone: string) => {
    let p = phone.replace(/\D/g, '') // Strip non-numeric
    if (p.startsWith('0')) {
      p = '63' + p.substring(1) // Convert 09... to 639...
    } else if (p.length === 10) {
      p = '63' + p // Assume it's 9xxxxxxxxx and prepend 63
    }
    return '+' + p // e.g., +639664714567
  }

// 1. Check if the user's phone number exists in the Profiles table.
  const checkPhoneExists = async (phone: string) => {
    // Strip everything except numbers
    const numericPhone = phone.replace(/\D/g, '')
    
    // Grab the last 10 digits (e.g., '9664714567')
    const tenDigitString = numericPhone.slice(-10) 
    
    // Cast to an actual Number to match your bigint column
    const dbPhoneMatch = Number(tenDigitString)

    console.log("DEBUG: Looking for phone number ->", dbPhoneMatch)

    const { data, error } = await supabase
      .from('Profiles')
      .select('id')
      .eq('phone_number', dbPhoneMatch)
      .maybeSingle() 

    if (error) {
      console.error('DEBUG: Supabase error:', error)
      return false
    }

    console.log("DEBUG: Database returned ->", data)

    // Returns true if profile data exists, false if null
    return !!data 
  }

  // 2. Trigger SMS OTP via Supabase (which uses Twilio under the hood)
  const sendPhoneOtp = async (phone: string) => {
    const formattedPhone = formatToE164(phone) // Ensure +63 format for Twilio

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })

    if (error) throw error
    return data
  }

  // 3. Verify the OTP token entered by the user
  const verifyPhoneOtp = async (phone: string, token: string) => {
    const formattedPhone = formatToE164(phone) // Match the exact format we used to send

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms'
    })

    if (error) throw error

    // On success, set the authenticated user state
    user.value = data.user
    isAuthenticated.value = true
    return data
  }

  // --- Keep your existing actions below ---
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
  }
})