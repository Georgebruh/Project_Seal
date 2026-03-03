<!-- <script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Add a Loading State
const isLoading = ref(true)

//  Start with an empty array (this is how it will look before Supabase loads)
const notifications = ref<any[]>([])

//  Simulate fetching from Supabase on page load
onMounted(async () => {
  // ------------------------------------------------------------------
  // TODO: Replace with real Supabase fetch:
  // const { data, error } = await supabase
  //   .from('notifications')
  //   .select('*')
  //   .eq('user_id', authStore.user.id)
  //   .order('created_at', { ascending: false })
  // ------------------------------------------------------------------

  setTimeout(() => {
    notifications.value = [
      { id: 1, title: 'Contract Signed', message: 'Acme Corp has digitally signed the Standard Service Agreement.', time: '10 mins ago', type: 'success', isRead: false, link: '/seal/123' },
      { id: 2, title: 'Escrow Funded', message: '₱22,500.00 has been securely deposited into escrow.', time: '1 hour ago', type: 'success', isRead: false, link: '/seal/123' },
      { id: 3, title: 'Action Required: Review Work', message: 'Alex Developer has submitted deliverables for review.', time: 'Yesterday', type: 'action', isRead: true, link: '/seal/456' },
      { id: 4, title: 'Platform Update', message: 'We have updated our Escrow Terms of Service.', time: 'Oct 20, 2025', type: 'info', isRead: true, link: '#' }
    ]
    isLoading.value = false // Turn off loading spinner
  }, 800) // Fake 0.8s network delay xD
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

//  Simulate an UPDATE query to Supabase
const markAllAsRead = async () => {
  // Optimistic UI update (update the screen instantly)
  notifications.value.forEach(n => n.isRead = true)

  // ------------------------------------------------------------------
  // TODO: Replace with real Supabase update:
  // await supabase
  //   .from('notifications')
  //   .update({ isRead: true })
  //   .eq('user_id', authStore.user.id)
  //   .eq('isRead', false)
  // ------------------------------------------------------------------
  console.log('Mock: Database updated! All notifications marked as read.')
}

const getIcon = (type: string) => {
  if (type === 'success') return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  if (type === 'action') return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

const getIconColor = (type: string) => {
  if (type === 'success') return 'text-green-500 bg-green-50'
  if (type === 'action') return 'text-orange-500 bg-orange-50'
  return 'text-blue-500 bg-blue-50'
}
</script> -->


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isLoading = ref(true)
const notifications = ref<any[]>([])

// Simulate fetching from Supabase on page load
onMounted(async () => {
  setTimeout(() => {
    notifications.value = [
      { 
        id: 1, 
        title: 'Payment Released!', 
        message: 'Acme Corp has approved your work for "E-Commerce Website Redesign". ₱22,500.00 is being transferred to your bank account.', 
        time: '2 mins ago', 
        type: 'success', 
        isRead: false, 
        link: '/seal/123' 
      },
      { 
        id: 2, 
        title: 'Action Required: Revision Requested', 
        message: 'The client has requested changes for "Mobile App UI/UX". Please review their notes and submit the updated files.', 
        time: '1 hour ago', 
        type: 'action', 
        isRead: false, 
        link: '/seal/456' 
      },
      { 
        id: 3, 
        title: 'Deadline Approaching', 
        message: 'The agreed delivery date for "SEO Optimization Setup" is tomorrow. Please ensure your work is submitted to escrow.', 
        time: '5 hours ago', 
        type: 'warning', 
        isRead: false, 
        link: '/seal/789' 
      },
      { 
        id: 4, 
        title: 'Escrow Funded', 
        message: '₱15,000.00 has been securely deposited into escrow for "Brand Logo Creation". You may now begin working safely.', 
        time: 'Yesterday', 
        type: 'success', 
        isRead: true, 
        link: '/seal/101' 
      },
      { 
        id: 5, 
        title: 'Identity Verification Complete', 
        message: 'Your valid ID has been successfully verified. Your "Verified Freelancer" badge is now active on your profile.', 
        time: 'Oct 24, 2025', 
        type: 'success', 
        isRead: true, 
        link: '#' 
      },
      { 
        id: 6, 
        title: 'New Message', 
        message: 'Sarah Designs sent you a message regarding the "Dashboard UI" contract terms.', 
        time: 'Oct 22, 2025', 
        type: 'info', 
        isRead: true, 
        link: '#' 
      },
      { 
        id: 7, 
        title: 'Platform Update', 
        message: 'We have updated our Dispute Resolution Policy. Please review the new terms to understand how we protect both parties.', 
        time: 'Oct 20, 2025', 
        type: 'info', 
        isRead: true, 
        link: '#' 
      }
    ]
    isLoading.value = false
  }, 800)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  console.log('Mock: Database updated! All notifications marked as read.')
}

// Dynamically choose SVG icons based on the notification type
const getIcon = (type: string) => {
  if (type === 'success') return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  if (type === 'action') return 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
  if (type === 'warning') return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

// UPDATED: Added dark mode color variants for the icons
const getIconColor = (type: string) => {
  if (type === 'success') return 'text-green-600 bg-green-100/80 dark:text-green-400 dark:bg-green-900/40'
  if (type === 'action') return 'text-purple-600 bg-purple-100/80 dark:text-purple-400 dark:bg-purple-900/40'
  if (type === 'warning') return 'text-orange-600 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/40'
  return 'text-blue-600 bg-blue-100/80 dark:text-blue-400 dark:bg-blue-900/40'
}
</script>

<template>
  <div class="max-w-4xl mx-auto pb-12 font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Notifications</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Stay updated on your projects and escrow statuses.</p>
      </div>
      
      <button 
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="text-sm font-medium text-seal-teal dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors flex items-center bg-teal-50/80 dark:bg-teal-900/40 px-3 py-1.5 rounded-lg"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        Mark all as read ({{ unreadCount }})
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <svg class="animate-spin h-8 w-8 text-seal-teal dark:text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-lg overflow-hidden transition-colors duration-300">
      
      <div v-if="notifications.length === 0" class="p-12 text-center">
        <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <p class="text-gray-500 dark:text-gray-400 font-medium transition-colors">You're all caught up!</p>
        <p class="text-sm text-gray-400 dark:text-slate-500 mt-1 transition-colors">No new notifications at this time.</p>
      </div>

      <div v-else class="divide-y divide-white/40 dark:divide-slate-700/50 transition-colors">
        <RouterLink 
          v-for="notification in notifications" 
          :key="notification.id"
          :to="notification.link"
          :class="[
            'p-6 flex items-start hover:bg-white/60 dark:hover:bg-slate-700/50 transition-colors block',
            !notification.isRead ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
          ]"
        >
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 shadow-sm transition-colors', getIconColor(notification.type)]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(notification.type)"></path>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <p :class="['text-sm truncate pr-4 transition-colors', !notification.isRead ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300 font-semibold']">
                {{ notification.title }}
              </p>
              <span :class="['text-xs whitespace-nowrap shrink-0 transition-colors', !notification.isRead ? 'text-seal-teal dark:text-teal-400 font-medium' : 'text-gray-400 dark:text-gray-500']">{{ notification.time }}</span>
            </div>
            <p :class="['text-sm leading-relaxed transition-colors', !notification.isRead ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400']">
              {{ notification.message }}
            </p>
          </div>

          <div v-if="!notification.isRead" class="ml-4 shrink-0 flex items-center h-10">
            <span class="w-2.5 h-2.5 bg-seal-teal dark:bg-teal-400 rounded-full shadow-sm transition-colors"></span>
          </div>
        </RouterLink>
      </div>

    </div>

  </div>
</template>