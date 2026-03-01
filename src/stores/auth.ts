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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const isAuthenticated = ref(false)
  const activeRole = ref<'freelancer' | 'client'>('freelancer')

  function toggleRole() {
    activeRole.value = activeRole.value === 'freelancer' ? 'client' : 'freelancer'
  }
  
  // Keep track of the retrieved email to use during the verify step
  const currentEmail = ref<string>('')

  // 1. Check if the user's phone number exists in the Profiles table and GET the email.
  const checkPhoneExistsAndGetEmail = async (phone: string) => {
    // Strip everything except numbers
    const numericPhone = phone.replace(/\D/g, '')
    
    // Grab the last 10 digits (e.g., '9664714567')
    const tenDigitString = numericPhone.slice(-10) 
    
    // Cast to an actual Number to match your bigint column
    const dbPhoneMatch = Number(tenDigitString)

    console.log("DEBUG: Looking for phone number ->", dbPhoneMatch)

    const { data, error } = await supabase
      .from('Profiles')
      .select('id, email') // REQUIRED: You must have an 'email' column in your Profiles table
      .eq('phone_number', dbPhoneMatch)
      .maybeSingle() 

    if (error) {
      console.error('DEBUG: Supabase error:', error)
      return null
    }

    console.log("DEBUG: Database returned ->", data)

    // Return the email if profile data exists and has an email attached
    if (data && data.email) {
      currentEmail.value = data.email
      return data.email
    }
    
    return null 
  }

  // 2. Trigger Email OTP via Supabase
  const sendEmailOtp = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email, // Sending to the email we retrieved from the DB
    })

    if (error) throw error
    return data
  }

  // 3. Verify the Email OTP token entered by the user
  const verifyEmailOtp = async (token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: currentEmail.value, // Verify against the email we stored in state
      token,
      type: 'email' // Changed from 'sms' to 'email'
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
    activeRole,
    toggleRole,
    currentEmail,
    checkPhoneExistsAndGetEmail,
    sendEmailOtp,
    verifyEmailOtp,
    logout
  }
})