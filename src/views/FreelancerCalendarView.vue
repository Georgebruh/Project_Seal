<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

const router = useRouter()
const authStore = useAuthStore()

const seals = ref<any[]>([])
const tasks = ref<any[]>([])
const isLoading = ref(true)

// Calendar State
const currentDate = ref(new Date())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

// Modal State
const selectedDay = ref<any>(null)
const isModalOpen = ref(false)
const newTaskText = ref('')
const newTaskDate = ref('') 
const newTaskTime = ref('') 
const isAddingTask = ref(false)

// Editing State
const editingTask = ref<any>(null)

// Context Menu State (Right Click)
const contextMenu = ref({ visible: false, x: 0, y: 0, task: null as any })

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

const fetchData = async () => {
  if (!authStore.user?.id) return
  try {
    const { data: sealsData } = await supabase
      .from('seals')
      .select('*')
      .eq('freelancer_id', authStore.user.id)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
    seals.value = sealsData || []

    const { data: tasksData } = await supabase
      .from('calendar_tasks')
      .select('*')
      .eq('freelancer_id', authStore.user.id)
    tasks.value = tasksData || []
  } catch (err) {
    console.error('Error fetching calendar data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu)
})

const prevMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1) }
const nextMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1) }
const goToToday = () => { currentDate.value = new Date() }

const formatDateForDB = (date: Date) => {
  const d = new Date(date)
  let month = '' + (d.getMonth() + 1)
  let day = '' + d.getDate()
  const year = d.getFullYear()
  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day
  return [year, month, day].join('-')
}

// --- NEW: Watcher to change the Card's Date automatically ---
watch(newTaskDate, async (newVal) => {
  if (isModalOpen.value && newVal) {
    // If the selected date is different from the card's current date, switch the card!
    if (selectedDay.value?.formattedDate !== newVal) {
      const parts = newVal.split('-')
      const y = parts[0]
      const m = parts[1]
      const d = parts[2]
      if (!y || !m || !d) return
      
      // 1. Shift the background calendar to the selected month/year
      currentDate.value = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      
      // Wait a microsecond for the calendar to re-render the new days
      await nextTick()
      
      // 2. Find the new day object and update the Card (Modal) to show it
      const targetDay = calendarDays.value.find(day => day.formattedDate === newVal)
      if (targetDay) {
        selectedDay.value = targetDay
      }
    }
  }
})

// Today's Agenda Computed Properties
const todayDateString = formatDateForDB(new Date())
const todayTasks = computed(() => {
  return tasks.value.filter(t => t.task_date === todayDateString).sort((a, b) => {
    if (!a.task_time) return 1; if (!b.task_time) return -1;
    return a.task_time.localeCompare(b.task_time);
  })
})
const todaySeals = computed(() => {
  return seals.value.filter(s => {
    const d = new Date(s.end_data || s.created_at)
    return formatDateForDB(d) === todayDateString
  })
})

const formatTimeDisplay = (timeStr: string) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hours = parseInt(h || '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${m} ${ampm}`
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const days = []
  
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, seals: [], tasks: [] })
  }
  
  for (let i = 1; i <= totalDays; i++) {
    const dateObj = new Date(year, month, i)
    const formattedDate = formatDateForDB(dateObj)
    
    const daySeals = seals.value.filter(s => {
      const targetDate = new Date(s.end_data || s.created_at) 
      return targetDate.getFullYear() === year && targetDate.getMonth() === month && targetDate.getDate() === i
    })
    const dayTasks = tasks.value.filter(t => t.task_date === formattedDate).sort((a, b) => {
      if (!a.task_time) return 1; if (!b.task_time) return -1;
      return a.task_time.localeCompare(b.task_time);
    })

    days.push({
      date: i, fullDate: dateObj, formattedDate: formattedDate,
      isCurrentMonth: true, isToday: formattedDate === todayDateString,
      seals: daySeals, tasks: dayTasks
    })
  }
  
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
     days.push({ date: i, isCurrentMonth: false, seals: [], tasks: [] })
  }
  
  return days
})

// --- Task Actions ---

const openDayModal = (day: any) => {
  if (!day.isCurrentMonth) return
  selectedDay.value = day
  newTaskDate.value = day.formattedDate 
  newTaskTime.value = ''
  isModalOpen.value = true
  setTimeout(() => document.getElementById('taskInput')?.focus(), 100)
}

const closeDayModal = () => {
  isModalOpen.value = false
  setTimeout(() => selectedDay.value = null, 300)
  cancelEdit()
}

const saveTask = async () => {
  if (!newTaskText.value.trim() || !newTaskDate.value || !authStore.user?.id) return
  isAddingTask.value = true
  
  if (editingTask.value) {
    const taskId = editingTask.value.id
    const updatedText = newTaskText.value
    const updatedDate = newTaskDate.value
    const updatedTime = newTaskTime.value

    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .update({ task_text: updatedText, task_date: updatedDate, task_time: updatedTime })
        .eq('id', taskId)
        .select()
        .single()
        
      if (error) throw error
      
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) tasks.value[index] = data
      
      if (selectedDay.value) {
        if (updatedDate === selectedDay.value.formattedDate) {
          const mIndex = selectedDay.value.tasks.findIndex((t: any) => t.id === taskId)
          if (mIndex !== -1) selectedDay.value.tasks[mIndex] = data
          else selectedDay.value.tasks.push(data)
        } else {
          selectedDay.value.tasks = selectedDay.value.tasks.filter((t: any) => t.id !== taskId)
        }
      }
      cancelEdit()
    } catch (err) {
      console.error('Error updating task:', err)
    } finally {
      isAddingTask.value = false
    }
    return
  }

  const tempTask = {
    id: 'temp-' + Date.now(),
    freelancer_id: authStore.user.id,
    task_text: newTaskText.value,
    task_date: newTaskDate.value,
    task_time: newTaskTime.value,
    is_completed: false
  }
  
  tasks.value.push(tempTask)
  if (selectedDay.value && newTaskDate.value === selectedDay.value.formattedDate) {
    selectedDay.value.tasks.push(tempTask)
  }
  
  const textToSave = newTaskText.value
  const dateToSave = newTaskDate.value
  const timeToSave = newTaskTime.value
  newTaskText.value = ''
  newTaskTime.value = ''
  
  try {
    const { data, error } = await supabase
      .from('calendar_tasks')
      .insert([{
        freelancer_id: authStore.user.id,
        task_text: textToSave,
        task_date: dateToSave,
        task_time: timeToSave
      }])
      .select()
      .single()
      
    if (error) throw error
    
    const index = tasks.value.findIndex(t => t.id === tempTask.id)
    if (index !== -1) tasks.value[index] = data
    
    if (selectedDay.value) {
      const modalIndex = selectedDay.value.tasks.findIndex((t: any) => t.id === tempTask.id)
      if (modalIndex !== -1) selectedDay.value.tasks[modalIndex] = data
    }
  } catch (err) {
    console.error('Error adding task:', err)
    tasks.value = tasks.value.filter(t => t.id !== tempTask.id)
    if (selectedDay.value) selectedDay.value.tasks = selectedDay.value.tasks.filter((t: any) => t.id !== tempTask.id)
  } finally {
    isAddingTask.value = false
  }
}

const toggleTask = async (task: any) => {
  const newStatus = !task.is_completed
  task.is_completed = newStatus 
  try {
    const { error } = await supabase.from('calendar_tasks').update({ is_completed: newStatus }).eq('id', task.id)
    if (error) throw error
  } catch (err) {
    console.error('Error toggling task:', err)
    task.is_completed = !newStatus 
  }
}

const openContextMenu = (e: MouseEvent, task: any) => {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, task }
}

const handleEditClick = () => {
  editingTask.value = contextMenu.value.task
  newTaskText.value = editingTask.value.task_text
  newTaskDate.value = editingTask.value.task_date
  newTaskTime.value = editingTask.value.task_time || ''
  document.getElementById('taskInput')?.focus()
}

const cancelEdit = () => {
  editingTask.value = null
  newTaskText.value = ''
  newTaskTime.value = ''
}

const handleDeleteClick = async () => {
  const taskToDelete = contextMenu.value.task
  tasks.value = tasks.value.filter(t => t.id !== taskToDelete.id)
  if (selectedDay.value) {
    selectedDay.value.tasks = selectedDay.value.tasks.filter((t: any) => t.id !== taskToDelete.id)
  }
  try {
    const { error } = await supabase.from('calendar_tasks').delete().eq('id', taskToDelete.id)
    if (error) throw error
  } catch (err) {
    console.error('Error deleting task:', err)
    fetchData() 
  }
}

const openSeal = (sealId: string) => router.push(`/dashboard/seal/${sealId}`)
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 relative font-sans text-slate-800 dark:text-gray-100 transition-colors duration-300">
    
    <div 
      v-if="contextMenu.visible"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-[9999] w-36 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/60 dark:border-slate-700/50 shadow-xl rounded-xl py-1 overflow-hidden transition-colors duration-300"
      @click.stop
    >
      <button @click="handleEditClick(); closeContextMenu()" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-slate-700/50 flex items-center font-medium transition-colors">
        <svg class="w-4 h-4 mr-2 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        Edit
      </button>
      <button @click="handleDeleteClick(); closeContextMenu()" class="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-white/60 dark:hover:bg-red-900/20 flex items-center font-medium transition-colors">
        <svg class="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        Delete
      </button>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white transition-colors">Project Calendar</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage your deadlines, schedule, and daily tasks.</p>
      </div>
      <div class="flex items-center space-x-4 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 dark:border-slate-600 p-1 transition-colors">
        <button @click="goToToday" class="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-seal-teal dark:hover:text-teal-400 transition-colors">Today</button>
        <div class="w-px h-6 bg-gray-200 dark:bg-slate-600 transition-colors"></div>
        <div class="flex items-center space-x-2 px-2">
          <button @click="prevMonth" class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-600/50 hover:text-seal-teal dark:hover:text-teal-400 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span class="w-32 text-center font-bold text-gray-800 dark:text-white transition-colors">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
          <button @click="nextMonth" class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-600/50 hover:text-seal-teal dark:hover:text-teal-400 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      
      <div class="flex-1 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-lg overflow-hidden flex flex-col transition-colors duration-300">
        <div class="grid grid-cols-7 border-b border-white/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 transition-colors">
          <div v-for="day in daysOfWeek" :key="day" class="py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">{{ day }}</div>
        </div>

        <div v-if="isLoading" class="h-96 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-seal-teal dark:border-teal-500"></div>
        </div>

        <div v-else class="grid grid-cols-7 auto-rows-fr bg-gray-100 dark:bg-slate-700/50 gap-px transition-colors">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            @click="openDayModal(day)"
            class="min-h-[140px] p-2 transition-colors group relative"
            :class="[!day.isCurrentMonth ? 'opacity-40 bg-white/30 dark:bg-slate-800/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/80 cursor-pointer']"
          >
            <div class="flex justify-between items-center mb-2">
              <button v-if="day.isCurrentMonth" class="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-seal-teal dark:hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/80 dark:hover:bg-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
              <span v-else class="w-6"></span>
              <span class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold transition-all shadow-sm" :class="day.isToday ? 'bg-seal-teal dark:bg-teal-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'">
                {{ day.date }}
              </span>
            </div>

            <div class="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
              <div 
                v-for="seal in day.seals" :key="'seal-'+seal.id" @click.stop="openSeal(seal.id)"
                class="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 group/event shadow-sm backdrop-blur-sm"
                :class="seal.status === 'pending' ? 'bg-amber-50/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/60' : 'bg-teal-50/80 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/60'"
              >
                <div class="truncate">{{ seal.project_name }}</div>
              </div>
              
              <div 
                v-for="task in day.tasks" :key="'task-'+task.id" 
                @click.stop="toggleTask(task)"
                @contextmenu.prevent="openContextMenu($event, task)"
                class="flex items-start space-x-1.5 px-1 py-1 rounded text-xs transition-colors hover:bg-white/60 dark:hover:bg-slate-600/50"
                :class="task.is_completed ? 'opacity-50 line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300 font-medium'"
              >
                <div class="mt-0.5 shrink-0">
                  <svg v-if="task.is_completed" class="w-3.5 h-3.5 text-seal-teal dark:text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <div v-else class="w-3.5 h-3.5 border-2 border-gray-300 dark:border-gray-500 rounded-sm hover:border-seal-teal dark:hover:border-teal-400 transition-colors"></div>
                </div>
                <div class="flex-1 truncate">
                  <span v-if="task.task_time" class="font-bold mr-1 text-teal-600 dark:text-teal-400">{{ formatTimeDisplay(task.task_time) }}</span>
                  <span>{{ task.task_text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-80 shrink-0 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-lg p-6 flex flex-col h-[600px] overflow-hidden transition-colors duration-300">
        <h3 class="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1 flex items-center transition-colors">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Today's Agenda
        </h3>
        <p class="text-xs text-gray-400 dark:text-gray-500 font-medium mb-6 transition-colors">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }}</p>

        <div class="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
          <div v-if="todaySeals.length === 0 && todayTasks.length === 0" class="text-center py-10 opacity-50 transition-colors">
            <svg class="w-10 h-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <p class="text-sm font-medium dark:text-gray-300">All caught up for today!</p>
          </div>

          <div v-if="todaySeals.length > 0">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors">Deadlines</h4>
            <div class="space-y-2">
              <div v-for="seal in todaySeals" :key="seal.id" @click="openSeal(seal.id)" class="p-3 bg-teal-50/80 dark:bg-teal-900/30 backdrop-blur-sm border border-teal-100 dark:border-teal-800/50 rounded-xl cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors shadow-sm">
                <p class="font-bold text-sm text-teal-900 dark:text-teal-100 truncate transition-colors">{{ seal.project_name }}</p>
                <p class="text-xs text-teal-700/70 dark:text-teal-400/70 mt-0.5 font-medium transition-colors">Click to view contract</p>
              </div>
            </div>
          </div>

          <div v-if="todayTasks.length > 0">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors">Tasks & Schedule</h4>
            <div class="space-y-1.5">
              <div 
                v-for="task in todayTasks" :key="task.id" 
                @click="toggleTask(task)"
                class="flex items-start space-x-3 p-2.5 rounded-xl transition-colors hover:bg-white/60 dark:hover:bg-slate-700/50 cursor-pointer border border-white/40 dark:border-slate-600 shadow-sm backdrop-blur-sm"
              >
                <div class="mt-0.5 shrink-0">
                  <svg v-if="task.is_completed" class="w-5 h-5 text-seal-teal dark:text-teal-400 drop-shadow-sm transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <div v-else class="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-colors bg-white/50 dark:bg-slate-600/50"></div>
                </div>
                <div class="flex-1 min-w-0 transition-opacity" :class="task.is_completed ? 'opacity-50' : ''">
                  <p v-if="task.task_time" class="text-xs font-bold text-teal-600 dark:text-teal-400 mb-0.5 transition-colors">{{ formatTimeDisplay(task.task_time) }}</p>
                  <p class="text-sm text-gray-800 dark:text-gray-200 font-medium truncate transition-colors" :class="task.is_completed ? 'line-through' : ''">{{ task.task_text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div 
      class="fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300"
      :class="isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'"
    >
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeDayModal"></div>
      
      <div 
        class="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 w-full max-w-xl mx-4 rounded-[2rem] shadow-2xl z-10 overflow-hidden transition-all duration-300 flex flex-col max-h-[85vh]"
        :class="isModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'"
      >
        <div v-if="selectedDay" class="p-8 flex flex-col h-full">
          
          <div class="flex justify-between items-start mb-6 shrink-0">
            <div>
              <p class="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1 transition-colors">Schedule & Tasks</p>
              <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                {{ selectedDay.fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
              </h2>
            </div>
            <button @click="closeDayModal" class="p-2 text-gray-400 dark:text-gray-500 hover:bg-white/60 dark:hover:bg-slate-700/50 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-colors bg-white/40 dark:bg-slate-700/30">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="mb-4 flex flex-col gap-3 shrink-0 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-slate-700/50 transition-colors">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">{{ editingTask ? 'Editing Task' : 'Add New Task / Event' }}</span>
              <button v-if="editingTask" @click="cancelEdit" class="text-xs text-red-500 dark:text-red-400 hover:underline font-medium transition-colors">Cancel Edit</button>
            </div>
            
            <div class="relative flex-1 group">
              <input 
                id="taskInput"
                v-model="newTaskText"
                @keyup.enter="saveTask"
                type="text" 
                :placeholder="newTaskTime ? 'Add event details...' : 'What needs to be done?'"
                class="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/60 dark:border-slate-600 rounded-xl text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-seal-teal dark:focus:border-teal-500 focus:bg-white/90 dark:focus:bg-slate-800 transition-all shadow-sm"
                :disabled="isAddingTask"
              />
            </div>
            
            <div class="flex gap-2 w-full">
              <input 
                type="date" 
                v-model="newTaskDate"
                class="w-1/3 py-3 px-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/60 dark:border-slate-600 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white/90 dark:focus:bg-slate-800 transition-all shadow-sm font-medium"
                :disabled="isAddingTask"
              />
              <input 
                type="time" 
                v-model="newTaskTime"
                class="w-1/3 py-3 px-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/60 dark:border-slate-600 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white/90 dark:focus:bg-slate-800 transition-all shadow-sm font-medium"
                :disabled="isAddingTask"
              />
              <button 
                @click="saveTask"
                class="flex-1 py-3 bg-seal-teal text-white font-bold rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center text-sm"
                :disabled="isAddingTask || !newTaskText.trim()"
              >
                {{ editingTask ? 'Save Edit' : 'Add' }}
              </button>
            </div>
          </div>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-4 mt-[-10px] transition-colors">💡 Tip: Right-click any task below to Edit or Delete it.</p>

          <div class="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
            <div v-if="selectedDay.seals.length === 0 && selectedDay.tasks.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 transition-colors">
              <div class="w-12 h-12 bg-white/50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-sm font-medium">Schedule is clear!</p>
            </div>

            <div v-if="selectedDay.seals.length > 0">
              <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 transition-colors">Project Deadlines</h4>
              <div class="space-y-2">
                <div v-for="seal in selectedDay.seals" :key="seal.id" @click="openSeal(seal.id)" class="flex items-center justify-between p-4 bg-teal-50/50 dark:bg-teal-900/20 backdrop-blur-sm border border-teal-100 dark:border-teal-800/50 rounded-xl cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/40 transition-colors group shadow-sm">
                  <div class="flex items-center">
                    <div class="w-2.5 h-2.5 rounded-full bg-teal-500 dark:bg-teal-400 mr-4 shadow-sm transition-colors"></div>
                    <div><span class="font-bold text-base text-teal-900 dark:text-teal-100 block leading-tight transition-colors">{{ seal.project_name }}</span></div>
                  </div>
                  <svg class="w-5 h-5 text-teal-400 dark:text-teal-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>

            <div v-if="selectedDay.tasks.length > 0">
              <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 transition-colors">To-Do List</h4>
              <div class="space-y-1.5">
                <div 
                  v-for="task in selectedDay.tasks" :key="task.id"
                  @click="toggleTask(task)"
                  @contextmenu.prevent="openContextMenu($event, task)"
                  class="flex items-start space-x-4 p-3.5 rounded-xl transition-colors hover:bg-white/50 dark:hover:bg-slate-700/50 cursor-pointer group border border-transparent hover:border-white/60 dark:hover:border-slate-600 shadow-sm"
                >
                  <div class="mt-0.5 shrink-0">
                    <svg v-if="task.is_completed" class="w-6 h-6 text-seal-teal dark:text-teal-400 drop-shadow-sm transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <div v-else class="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-md group-hover:border-seal-teal dark:group-hover:border-teal-400 transition-colors bg-white/50 dark:bg-slate-600/50"></div>
                  </div>
                  <div class="flex-1 flex flex-col justify-center pt-px transition-opacity" :class="task.is_completed ? 'opacity-50 line-through' : ''">
                    <span v-if="task.task_time" class="text-xs font-bold text-teal-600 dark:text-teal-400 transition-colors">{{ formatTimeDisplay(task.task_time) }}</span>
                    <span class="text-base text-gray-800 dark:text-gray-200 font-medium transition-colors">{{ task.task_text }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>