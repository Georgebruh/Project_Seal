<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const rawSeals = ref<any[]>([])

// --- STATE: Time Interval Selector ---
type TimeInterval = '1W' | '1M' | '3M' | '6M' | '1Y'
const selectedInterval = ref<TimeInterval>('6M')

// --- FETCH REAL DATA ---
onMounted(async () => {
  try {
    isLoading.value = true
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // Fetch all seals for this freelancer
    const { data, error } = await supabase
      .from('Seals')
      .select('*')
      .eq('freelancer_id', user.id)

    if (error) throw error
    if (data) rawSeals.value = data

  } catch (error) {
    console.error('Error fetching analytics data:', error)
  } finally {
    isLoading.value = false
  }
})

// --- 1. BASIC METRICS ---
const totalSeals = computed(() => rawSeals.value.length)

const completedSeals = computed(() => 
  rawSeals.value.filter(s => s.status === 'Completed')
)

const totalRevenue = computed(() => 
  completedSeals.value.reduce((sum, seal) => sum + Number(seal.total_amount || 0), 0)
)

const successRate = computed(() => {
  if (totalSeals.value === 0) return 0
  return Math.round((completedSeals.value.length / totalSeals.value) * 100)
})

const metrics = computed(() => [
  {
    title: 'Total Seals',
    value: totalSeals.value.toString(),
    change: 'Lifetime',
    iconText: 'S',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    title: 'Completed',
    value: completedSeals.value.length.toString(),
    change: `${successRate.value}% Success`,
    iconText: '✔',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    title: 'Revenue',
    value: `₱${totalRevenue.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    change: 'Lifetime',
    iconText: '₱',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
  }
])

// --- 2. DYNAMIC RANK LOGIC (Option A) ---
const rankInfo = computed(() => {
  const rev = totalRevenue.value
  if (rev >= 50000) return { name: 'Elite', target: 100000, color: 'text-purple-400' }
  if (rev >= 20000) return { name: 'Expert', target: 50000, color: 'text-blue-400' }
  if (rev >= 5000) return { name: 'Pro', target: 20000, color: 'text-emerald-400' }
  return { name: 'Novice', target: 5000, color: 'text-amber-400' }
})

const rankProgress = computed(() => {
  const currentRank = rankInfo.value
  return Math.min(100, Math.round((totalRevenue.value / currentRank.target) * 100))
})

// --- 3. PROJECT DISTRIBUTION ---
const distribution = computed(() => {
  const t = totalSeals.value || 1 // prevent div by zero
  const completed = completedSeals.value.length
  const inProgress = rawSeals.value.filter(s => s.status === 'In progress').length
  const pending = rawSeals.value.filter(s => ['Pending review', 'Awaiting funding', 'Pending output review'].includes(s.status)).length

  return {
    completed: { count: completed, pct: Math.round((completed / t) * 100) },
    inProgress: { count: inProgress, pct: Math.round((inProgress / t) * 100) },
    pending: { count: pending, pct: Math.round((pending / t) * 100) }
  }
})

// style helper for the circular distribution graphic
const projectDistributionStyle = computed(() => {
  const { completed, inProgress, pending } = distribution.value
  // generate a conic-gradient based on percentage slices
  const compPct = completed.pct
  const inP = inProgress.pct
  const pend = pending.pct
  // if nothing yet, show a subtle background
  if (compPct + inP + pend === 0) {
    return 'background: #e5e7eb;' // light gray
  }
  return `background: conic-gradient(#10b981 ${compPct}%, #3b82f6 ${compPct + inP}%, #fbbf24 0);`
})

// --- 4. DYNAMIC CHARTS (Interval Logic) ---

// type used for each bucket in the dynamic charts
interface Interval {
  label: string
  dateMatch: Date
  revenue: number
  projects: number
}

const chartData = computed(() => {
  const intervals: Interval[] = []
  const now = new Date()

  // Helper to format dates for labels
  const formatLabel = (date: Date, type: 'day' | 'month' | 'monthYear') => {
    if (type === 'day') return date.toLocaleString('en-US', { weekday: 'short' })
    if (type === 'month') return date.toLocaleString('en-US', { month: 'short' })
    return date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
  }

  // Generate the x-axis buckets based on the selected interval
  if (selectedInterval.value === '1W') {
    // Past 7 Days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      intervals.push({ label: formatLabel(d, 'day'), dateMatch: d, revenue: 0, projects: 0 })
    }
  } else if (selectedInterval.value === '1M') {
    // Past 4 Weeks (approx) - showing labels roughly every 5-6 days
    for (let i = 29; i >= 0; i -= Math.ceil(30/6)) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        intervals.push({ label: `${d.getDate()} ${formatLabel(d, 'month')}`, dateMatch: d, revenue: 0, projects: 0 })
    }
    // ensure today is the last point
     if (intervals[intervals.length - 1]?.dateMatch.getDate() !== now.getDate()) {
        intervals.push({ label: 'Today', dateMatch: new Date(now), revenue: 0, projects: 0 })
     }
  } else if (selectedInterval.value === '3M') {
    // Past 3 Months
     for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      intervals.push({ label: formatLabel(d, 'month'), dateMatch: d, revenue: 0, projects: 0 })
    }
  } else if (selectedInterval.value === '6M') {
     // Past 6 Months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      intervals.push({ label: formatLabel(d, 'month'), dateMatch: d, revenue: 0, projects: 0 })
    }
  } else if (selectedInterval.value === '1Y') {
    // Past 12 Months
    for (let i = 11; i >= 0; i -= 2) { // Showing every other month for space
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      intervals.push({ label: formatLabel(d, 'monthYear'), dateMatch: d, revenue: 0, projects: 0 })
    }
  }

  // Populate actual data into the buckets
  rawSeals.value.forEach(seal => {
    const sealDate = new Date(seal.created_at)
    
    // Find which bucket this seal belongs to
    let matchIndex = -1

    if (selectedInterval.value === '1W' || selectedInterval.value === '1M') {
      // Match by exact day (or nearest bucket for 1M)
      // For simplicity in 1M, we just bucket it to the nearest label if it falls in that range
      matchIndex = intervals.findIndex((interval, idx) => {
         const nextInterval = intervals[idx + 1]
         const start = new Date(interval.dateMatch)
         start.setHours(0,0,0,0)
         if (!nextInterval) return sealDate.getTime() >= start.getTime() // Last bucket catches everything after it
         const end = new Date(nextInterval.dateMatch)
         end.setHours(0,0,0,0)
         return sealDate.getTime() >= start.getTime() && sealDate.getTime() < end.getTime()
      })
    } else {
      // Match by month/year for 3M, 6M, 1Y
       matchIndex = intervals.findIndex(interval => 
         sealDate.getMonth() === interval.dateMatch.getMonth() && 
         sealDate.getFullYear() === interval.dateMatch.getFullYear()
       )
    }

    if (matchIndex !== -1) {
      const bucket = intervals[matchIndex]!
      bucket.projects++
      if (seal.status === 'Completed') {
        bucket.revenue += Number(seal.total_amount || 0)
      }
    }
  })

  return intervals
})

// Calculations for the Line Chart (SVG points)
const maxRevenue = computed(() => Math.max(...chartData.value.map(m => m.revenue), 1000))

const chartPoints = computed(() => {
  const dataLen = chartData.value.length
  return chartData.value.map((m, i) => {
    // Dynamically space points based on how many intervals there are
    const spacing = 90 / Math.max(1, (dataLen - 1))
    const x = 5 + (i * spacing) 
    const y = 95 - ((m.revenue / maxRevenue.value) * 90) // Scale to fit
    return { x, y, value: m.revenue }
  })
})

const polylineString = computed(() => chartPoints.value.map(p => `${p.x},${p.y}`).join(' '))

// Monthly Projects Heights
const maxProjects = computed(() => Math.max(...chartData.value.map(m => m.projects), 10))

const getProjectHeight = (count: number) => {
  // Scale height dynamically based on max projects in this interval
  const percentage = (count / maxProjects.value) * 100
  return `height: ${percentage}%`
}

// --- 5. STATIC MOCKS ---
const satisfactionScores = ref([
  { category: 'Communication', score: 95 },
  { category: 'Quality', score: 98 },
  { category: 'Timeliness', score: 92 },
])

// --- 6. DYNAMIC ACHIEVEMENTS ---
const achievements = computed(() => {
  const badges = []
  
  if (totalSeals.value > 0) badges.push({ bg: 'bg-blue-50', iconBg: 'bg-blue-200', icon: '🎉', title: 'First Seal', text: 'text-blue-600', subtitle: 'Created your first project' })
  if (completedSeals.value.length >= 5) badges.push({ bg: 'bg-emerald-50', iconBg: 'bg-emerald-200', icon: '⭐', title: 'Reliable', text: 'text-emerald-600', subtitle: '5+ completed projects' })
  if (totalRevenue.value >= 10000) badges.push({ bg: 'bg-amber-50', iconBg: 'bg-amber-200', icon: '🏆', title: 'Top Seller', text: 'text-amber-600', subtitle: 'Reached ₱10k+ revenue' })
  if (successRate.value >= 90 && totalSeals.value >= 3) badges.push({ bg: 'bg-purple-50', iconBg: 'bg-purple-200', icon: '🔥', title: 'Flawless', text: 'text-purple-600', subtitle: '90%+ Success Rate' })
  
  // Fill empty slots with placeholders if they are new
  if (badges.length === 0) badges.push({ bg: 'bg-gray-50', iconBg: 'bg-gray-200', icon: '⏳', title: 'Get Started', text: 'text-gray-600', subtitle: 'Complete a seal to earn badges!' })

  return badges.slice(0, 4) // Show max 4
})
</script>

<template>
  <div class="max-w-7xl mx-auto font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    
    <div class="flex justify-between items-end mb-8">
      <div>
        <a href="#" class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <span>←</span> Back to Dashboard
        </a>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Analytics Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track your performance and growth</p>
      </div>
      <div class="text-right hidden md:block">
        <p class="text-xs text-slate-400 uppercase tracking-wide">Last Updated</p>
        <p class="text-sm font-semibold dark:text-slate-200">{{ new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-seal-teal dark:border-teal-500"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <div class="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-700/50 transition-colors duration-300">
          <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.228l-5.36 3.864 1.95-6.33-5.45-3.87 6.64-.09L12 2l2.22 6.792 6.64.09-5.45 3.87 1.95 6.33z"/></svg>
          </div>

          <div class="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider flex items-center gap-2">
            <span class="text-slate-300">🏅</span> YOUR RANK
          </div>
          <h2 :class="['text-4xl font-bold mb-1', rankInfo.color]">{{ rankInfo.name }}</h2>
          <p class="text-sm text-slate-400 mb-8">Current Tier based on Earnings</p>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-300">Overall Rating</span>
              <span class="font-bold flex items-center gap-1"><span class="text-amber-400">★</span> 4.8</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-300">Success Rate</span>
              <span class="font-bold">{{ successRate }}%</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-slate-300">Response Time</span>
              <span class="font-bold">&lt;2 hrs</span>
            </div>
          </div>
          
          <div class="mt-6">
            <div class="w-full bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
              <div class="bg-amber-400 h-1.5 rounded-full transition-all duration-1000" :style="`width: ${rankProgress}%`"></div>
            </div>
            <p class="text-xs text-slate-400">{{ 100 - rankProgress }}% to next rank</p>
          </div>
        </div>

        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="metric in metrics" :key="metric.title" class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 flex flex-col justify-between transition-colors duration-300">
            <div class="flex justify-between items-start mb-4">
              <div :class="[metric.iconBg, metric.iconColor, 'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl']">
                {{ metric.iconText }}
              </div>
              <span class="text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-md transition-colors">
                {{ metric.change }}
              </span>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1 transition-colors">{{ metric.title }}</p>
              <h3 class="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{{ metric.value }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-start mb-4">
      <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-white/60 dark:border-slate-700/50 shadow-sm flex space-x-1">
        <button @click="selectedInterval = '1W'" :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-colors', selectedInterval === '1W' ? 'bg-white dark:bg-slate-600 shadow-sm text-seal-teal dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']">1W</button>
        <button @click="selectedInterval = '1M'" :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-colors', selectedInterval === '1M' ? 'bg-white dark:bg-slate-600 shadow-sm text-seal-teal dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']">1M</button>
        <button @click="selectedInterval = '3M'" :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-colors', selectedInterval === '3M' ? 'bg-white dark:bg-slate-600 shadow-sm text-seal-teal dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']">3M</button>
        <button @click="selectedInterval = '6M'" :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-colors', selectedInterval === '6M' ? 'bg-white dark:bg-slate-600 shadow-sm text-seal-teal dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']">6M</button>
        <button @click="selectedInterval = '1Y'" :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-colors', selectedInterval === '1Y' ? 'bg-white dark:bg-slate-600 shadow-sm text-seal-teal dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']">1Y</button>
      </div>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="font-bold text-lg text-slate-900 dark:text-white transition-colors">Earnings Trend</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 transition-colors">Past {{ selectedInterval }}</p>
            </div>
            <span class="text-emerald-500 font-bold">↗</span>
          </div>
          
          <div class="h-48 relative mt-4 ml-12">
            <div class="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500">
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-14 top-[-8px] w-12 text-right">{{ Math.round(maxRevenue) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-14 top-[-8px] w-12 text-right">{{ Math.round(maxRevenue * 0.75) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-14 top-[-8px] w-12 text-right">{{ Math.round(maxRevenue * 0.5) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-14 top-[-8px] w-12 text-right">{{ Math.round(maxRevenue * 0.25) }}</span></div>
              <div class="border-b border-slate-300 dark:border-slate-600 w-full mt-auto relative"><span class="absolute -left-14 bottom-[-4px] w-12 text-right">0</span></div>
            </div>
            <svg class="absolute inset-0 h-full w-full drop-shadow-sm transition-all duration-500" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polyline fill="none" stroke="#10b981" stroke-width="2" :points="polylineString" />
              <circle v-for="(point, i) in chartPoints" :key="'c'+i" :cx="point.x" :cy="point.y" r="2" fill="#10b981" class="transition-all duration-500" />
            </svg>
            <div class="absolute bottom-[-24px] left-0 right-0 flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
              <span v-for="m in chartData" :key="m.label">{{ m.label }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 flex flex-col transition-colors duration-300">
          <div class="mb-4">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white transition-colors">Project Distribution</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 transition-colors">Current status overview</p>
          </div>
          
          <div class="flex-1 flex items-center justify-center gap-8">
            <div class="relative w-40 h-40 flex items-center justify-center shrink-0 drop-shadow-sm">
              <div 
                class="absolute inset-0 rounded-full transition-all duration-1000"
                :style="projectDistributionStyle"
              ></div>
              
              <div class="relative z-10 flex flex-col items-center mt-1">
                <span class="text-3xl font-black text-slate-800 dark:text-gray-100 leading-none">{{ totalSeals }}</span>
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <div class="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-gray-200"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Completed</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 ml-5">{{ distribution.completed.count }} ({{ distribution.completed.pct }}%)</div>
              </div>
              <div>
                <div class="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-gray-200"><span class="w-3 h-3 rounded-full bg-blue-500"></span> In Progress</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 ml-5">{{ distribution.inProgress.count }} ({{ distribution.inProgress.pct }}%)</div>
              </div>
              <div>
                <div class="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-gray-200"><span class="w-3 h-3 rounded-full bg-amber-400"></span> Pending</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 ml-5">{{ distribution.pending.count }} ({{ distribution.pending.pct }}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <div class="mb-6">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white transition-colors">Client Satisfaction</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 transition-colors">Average ratings by category</p>
          </div>
          
          <div class="space-y-4">
            <div v-for="item in satisfactionScores" :key="item.category" class="flex items-center gap-4">
              <span class="w-28 text-sm text-slate-600 dark:text-slate-300 text-right transition-colors">{{ item.category }}</span>
              <div class="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden relative transition-colors">
                <div class="absolute top-0 left-0 h-full bg-blue-500 rounded-md transition-all duration-1000" :style="{ width: item.score + '%' }"></div>
              </div>
            </div>
            <div class="flex justify-between pl-32 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span>0</span><span>2</span><span>5</span>
            </div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
          <div class="mb-6">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white transition-colors">Project Volume</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 transition-colors">Projects per {{ selectedInterval === '1W' ? 'Day' : selectedInterval === '1M' ? 'Week' : 'Month' }}</p>
          </div>
          
          <div class="h-48 flex items-end justify-around gap-2 pb-6 relative ml-6">
            <div class="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500 z-0">
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-8 top-[-8px] w-6 text-right">{{ Math.max(10, Math.round(maxProjects)) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-8 top-[-8px] w-6 text-right">{{ Math.max(7, Math.round(maxProjects * 0.75)) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-8 top-[-8px] w-6 text-right">{{ Math.max(5, Math.round(maxProjects * 0.5)) }}</span></div>
              <div class="border-b border-dashed border-slate-300 dark:border-slate-600 w-full flex-1 relative"><span class="absolute -left-8 top-[-8px] w-6 text-right">{{ Math.max(2, Math.round(maxProjects * 0.25)) }}</span></div>
              <div class="border-b border-slate-300 dark:border-slate-600 w-full mt-auto relative"><span class="absolute -left-8 bottom-[-4px] w-6 text-right">0</span></div>
            </div>
            
            <div v-for="data in chartData" :key="data.label" class="flex flex-col items-center justify-end z-10 w-full max-w-[40px] group h-full">
              <div class="text-xs text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity pb-1">{{ data.projects }}</div>
              <div class="w-full bg-amber-400 rounded-t-md shadow-sm transition-all duration-500" :style="getProjectHeight(data.projects)"></div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-4 absolute bottom-0 transition-colors truncate w-full text-center">{{ data.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60 dark:border-slate-700/50 transition-colors duration-300">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-6 transition-colors">Recent Achievements</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="badge in achievements" :key="badge.title" :class="[badge.bg, 'dark:bg-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center backdrop-blur-sm border border-white/50 dark:border-slate-600 transition-colors']">
            <div :class="[badge.iconBg, 'w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3 shadow-sm']">
              {{ badge.icon }}
            </div>
            <h4 :class="[badge.text, 'dark:text-white font-bold text-sm mb-1 transition-colors']">{{ badge.title }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 transition-colors">{{ badge.subtitle }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>