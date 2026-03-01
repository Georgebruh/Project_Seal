<script setup lang="ts">
import { ref } from 'vue'

// Metric Data
const metrics = ref([
  { title: 'Total Earnings (6 mo)', value: '₱220,000', change: '+18%', changeType: 'positive', iconText: '$', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-100' },
  { title: 'Projects Completed', value: '24', change: '+3', changeType: 'positive', iconText: '✓', iconColor: 'text-blue-500', iconBg: 'bg-blue-100' },
  { title: 'Avg Project Value', value: '₱9,166', change: '+5%', changeType: 'positive', iconText: '◎', iconColor: 'text-purple-500', iconBg: 'bg-purple-100' },
  { title: 'Avg Completion', value: '12 days', change: '-2 days', changeType: 'positive', iconText: '⏱', iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
])

// Client Satisfaction Data
const satisfactionScores = ref([
  { category: 'Communication', score: 98 },
  { category: 'Quality', score: 100 },
  { category: 'Timeliness', score: 95 },
  { category: 'Professionalism', score: 100 },
  { category: 'Value', score: 92 },
])

// Monthly Projects Data
const monthlyProjects = ref([
  { month: 'Sep', count: 4, height: 'h-20' },
  { month: 'Oct', count: 5, height: 'h-24' },
  { month: 'Nov', count: 6, height: 'h-32' },
  { month: 'Dec', count: 5, height: 'h-24' },
  { month: 'Jan', count: 7, height: 'h-40' },
  { month: 'Feb', count: 6, height: 'h-32' },
])

// Achievements Data
const achievements = ref([
  { title: '5-Star Pro', subtitle: '10+ Five Star Reviews', icon: '★', bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-400 text-white' },
  { title: 'Fast Finisher', subtitle: 'Early completion streak', icon: '✓', bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-400 text-white' },
  { title: 'Client Favorite', subtitle: '80% repeat clients', icon: '◎', bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-400 text-white' },
  { title: 'Elite Member', subtitle: 'Top 5% platform rank', icon: '🏅', bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-400 text-white' },
])
</script>

<template>
  <div class="p-6 md:p-10 bg-[#e8f1f2] min-h-screen font-sans text-slate-800">
    
    <div class="flex justify-between items-end mb-8">
      <div>
        <a href="#" class="text-sm text-slate-500 flex items-center gap-1 mb-4 hover:text-slate-700">
          <span>←</span> Back to Dashboard
        </a>
        <h1 class="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p class="text-slate-500 mt-1">Track your performance and growth</p>
      </div>
      <div class="text-right hidden md:block">
        <p class="text-xs text-slate-400 uppercase tracking-wide">Last Updated</p>
        <p class="text-sm font-semibold">Feb 24, 2026</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <div class="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.228l-5.36 3.864 1.95-6.33-5.45-3.87 6.64-.09L12 2l2.22 6.792 6.64.09-5.45 3.87 1.95 6.33z"/></svg>
        </div>

        <div class="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-300">🏅</span> YOUR RANK
        </div>
        <h2 class="text-4xl font-bold mb-1">Elite</h2>
        <p class="text-sm text-slate-400 mb-8">Top 5% of Freelancers</p>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-300">Overall Rating</span>
            <span class="font-bold flex items-center gap-1"><span class="text-amber-400">★</span> 4.8</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-300">Success Rate</span>
            <span class="font-bold">96%</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-slate-300">Response Time</span>
            <span class="font-bold">&lt;2 hrs</span>
          </div>
        </div>
        
        <div class="mt-6">
          <div class="w-full bg-slate-700 rounded-full h-1.5 mb-2">
            <div class="bg-amber-400 h-1.5 rounded-full" style="width: 85%"></div>
          </div>
          <p class="text-xs text-slate-400">15% to Master Rank</p>
        </div>
      </div>

      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="metric in metrics" :key="metric.title" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div class="flex justify-between items-start mb-4">
            <div :class="[metric.iconBg, metric.iconColor, 'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl']">
              {{ metric.iconText }}
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
              {{ metric.change }}
            </span>
          </div>
          <div>
            <p class="text-sm text-slate-500 mb-1">{{ metric.title }}</p>
            <h3 class="text-3xl font-bold text-slate-900">{{ metric.value }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="font-bold text-lg text-slate-900">Earnings Trend</h3>
            <p class="text-sm text-slate-500">Last 6 months</p>
          </div>
          <span class="text-emerald-500 font-bold">↗</span>
        </div>
        
        <div class="h-48 relative mt-4">
          <div class="absolute inset-0 flex flex-col justify-between text-xs text-slate-300">
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-8">60000</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-8">45000</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-8">30000</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-8">15000</span></div>
            <div class="border-b border-slate-300 w-full mt-auto flex items-end"><span class="-translate-x-4">0</span></div>
          </div>
          <svg class="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline fill="none" stroke="#10b981" stroke-width="2" points="5,70 20,65 40,55 60,60 80,45 95,40" />
            <circle cx="5" cy="70" r="2" fill="#10b981" />
            <circle cx="20" cy="65" r="2" fill="#10b981" />
            <circle cx="40" cy="55" r="2" fill="#10b981" />
            <circle cx="60" cy="60" r="2" fill="#10b981" />
            <circle cx="80" cy="45" r="2" fill="#10b981" />
            <circle cx="95" cy="40" r="2" fill="#10b981" />
          </svg>
          <div class="absolute bottom-[-24px] left-0 right-0 flex justify-between text-xs text-slate-400 px-2">
            <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div class="mb-4">
          <h3 class="font-bold text-lg text-slate-900">Project Distribution</h3>
          <p class="text-sm text-slate-500">Current status overview</p>
        </div>
        
        <div class="flex-1 flex items-center justify-center gap-8">
          <div class="relative w-40 h-40 rounded-full border-[16px] border-slate-100">
            <div class="absolute inset-[-16px] rounded-full border-[16px] border-emerald-500" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 50%); transform: rotate(-45deg);"></div>
            <div class="absolute inset-[-16px] rounded-full border-[16px] border-blue-500" style="clip-path: polygon(50% 50%, 100% 100%, 0 100%); transform: rotate(15deg);"></div>
            <div class="absolute inset-[-16px] rounded-full border-[16px] border-amber-400" style="clip-path: polygon(100% 50%, 100% 100%, 50% 50%); transform: rotate(10deg);"></div>
          </div>
          
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 font-bold text-sm"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Completed</div>
              <div class="text-xs text-slate-500 ml-5">24 (73%)</div>
            </div>
            <div>
              <div class="flex items-center gap-2 font-bold text-sm"><span class="w-3 h-3 rounded-full bg-blue-500"></span> In Progress</div>
              <div class="text-xs text-slate-500 ml-5">6 (18%)</div>
            </div>
            <div>
              <div class="flex items-center gap-2 font-bold text-sm"><span class="w-3 h-3 rounded-full bg-amber-400"></span> Pending</div>
              <div class="text-xs text-slate-500 ml-5">3 (9%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div class="mb-6">
          <h3 class="font-bold text-lg text-slate-900">Client Satisfaction</h3>
          <p class="text-sm text-slate-500">Average ratings by category</p>
        </div>
        
        <div class="space-y-4">
          <div v-for="item in satisfactionScores" :key="item.category" class="flex items-center gap-4">
            <span class="w-28 text-sm text-slate-600 text-right">{{ item.category }}</span>
            <div class="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
              <div class="absolute top-0 left-0 h-full bg-blue-500 rounded-md" :style="`width: ${item.score}%`"></div>
            </div>
          </div>
          <div class="flex justify-between pl-32 text-xs text-slate-400 pt-2">
            <span>0</span><span>2</span><span>5</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div class="mb-6">
          <h3 class="font-bold text-lg text-slate-900">Monthly Projects</h3>
          <p class="text-sm text-slate-500">Project volume over time</p>
        </div>
        
        <div class="h-48 w-full flex items-end justify-around gap-2 pb-6 relative">
          <div class="absolute inset-0 flex flex-col justify-between text-xs text-slate-300 z-0">
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-4">8</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-4">6</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-4">4</span></div>
            <div class="border-b border-dashed border-slate-200 w-full flex-1 flex items-start"><span class="-translate-y-2 -translate-x-4">2</span></div>
            <div class="border-b border-slate-300 w-full mt-auto flex items-end"><span class="-translate-x-4">0</span></div>
          </div>
          
          <div v-for="data in monthlyProjects" :key="data.month" class="flex flex-col items-center z-10 w-full max-w-[40px]">
            <div :class="[data.height, 'w-full bg-amber-400 rounded-t-md']"></div>
            <span class="text-xs text-slate-500 mt-4 absolute bottom-0">{{ data.month }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 class="font-bold text-lg text-slate-900 mb-6">Recent Achievements</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="badge in achievements" :key="badge.title" :class="[badge.bg, 'rounded-xl p-4 flex flex-col items-center text-center']">
          <div :class="[badge.iconBg, 'w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3 shadow-sm']">
            {{ badge.icon }}
          </div>
          <h4 :class="[badge.text, 'font-bold text-sm mb-1']">{{ badge.title }}</h4>
          <p class="text-xs text-slate-500">{{ badge.subtitle }}</p>
        </div>
      </div>
    </div>

  </div>
</template>