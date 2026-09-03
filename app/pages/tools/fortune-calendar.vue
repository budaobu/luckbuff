<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <div class="mb-8">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Fortune Calendar</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('fortuneCalendar.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-2">
          {{ $t('fortuneCalendar.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
      </div>

      <!-- Month navigation -->
      <div class="flex items-center justify-between mb-4">
        <UButton variant="ghost" size="sm" icon="i-heroicons-chevron-left" :disabled="loading" @click="prevMonth" />
        <span class="text-base font-semibold text-[var(--text-primary)] font-serif">{{ monthLabel }}</span>
        <UButton variant="ghost" size="sm" icon="i-heroicons-chevron-right" :disabled="loading" @click="nextMonth" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>

      <!-- Calendar grid -->
      <div v-else class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
        <!-- Weekday header -->
        <div class="grid grid-cols-7 border-b border-[var(--border-subtle)]">
          <div
            v-for="day in weekdayLabels"
            :key="day"
            class="py-2 text-center text-[10px] font-medium text-[var(--text-faint)]"
          >
            {{ day }}
          </div>
        </div>

        <!-- Day grid -->
        <div class="grid grid-cols-7">
          <div
            v-for="(cell, idx) in gridCells"
            :key="idx"
            class="aspect-square border-[0.5px] border-[var(--border-light)] flex flex-col items-center justify-center cursor-pointer transition-all"
            :class="cell ? (selectedDate === cell.date ? 'bg-[var(--accent-bg)] ring-1 ring-[var(--accent-border)]' : fortuneCellClass(cell)) : ''"
            @click="cell && selectDay(cell)"
          >
            <template v-if="cell">
              <span class="text-xs font-semibold" :class="cell.isToday ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'">
                {{ cell.dayNumber }}
              </span>
              <span class="text-[9px] text-[var(--text-faint)]">{{ cell.lunarDay }}</span>
              <span
                v-if="cell.fortuneLevel"
                class="w-1.5 h-1.5 rounded-full mt-0.5"
                :class="fortuneDotClass(cell.fortuneLevel)"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Day detail -->
      <div v-if="selectedDay" class="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <div class="flex items-baseline gap-3 mb-3">
          <span class="text-lg font-bold text-[var(--text-primary)] font-serif">{{ selectedDay.date }}</span>
          <span class="text-sm text-[var(--text-muted)]">{{ selectedDay.dayGanZhi }}</span>
          <span
            v-if="selectedDay.fortuneLevel"
            class="text-xs px-2 py-0.5 rounded-full"
            :class="fortuneBadgeClass(selectedDay.fortuneLevel)"
          >
            {{ $t(`fortuneCalendar.fortune.${selectedDay.fortuneLevel}`) }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-[var(--accent)] mb-1">{{ $t('fortuneCalendar.yiLabel') }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="item in selectedDay.yi.slice(0, 12)"
                :key="item"
                class="text-[11px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)]"
              >
                {{ item }}
              </span>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-red-400 mb-1">{{ $t('fortuneCalendar.jiLabel') }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="item in selectedDay.ji.slice(0, 12)"
                :key="item"
                class="text-[11px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedDay.jieQi" class="mt-3 text-[11px] text-[var(--accent-muted)]">
          {{ $t('fortuneCalendar.jieQiLabel') }}: {{ selectedDay.jieQi }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

interface CalendarDay {
  date: string
  dayNumber: number
  lunarDay: string
  dayGanZhi: string
  yi: string[]
  ji: string[]
  jieQi: string
  tianShenLuck: string
  fortuneLevel: 'ji' | 'xiong' | 'ping' | null
  isToday: boolean
}

const loading = ref(true)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const days = ref<CalendarDay[]>([])
const selectedDate = ref<string | null>(null)

const weekdayLabels = computed(() =>
  locale.value === 'en'
    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    : ['日', '一', '二', '三', '四', '五', '六'],
)

const monthLabel = computed(() => {
  if (locale.value === 'en') {
    return new Date(currentYear.value, currentMonth.value - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return `${currentYear.value}年${currentMonth.value}月`
})

const selectedDay = computed(() => days.value.find(d => d.date === selectedDate.value) || null)

const gridCells = computed(() => {
  if (!days.value.length) return Array(42).fill(null)

  const first = days.value[0]!
  const firstDate = new Date(first.date + 'T00:00:00')
  const startOffset = firstDate.getDay()
  const cells: (CalendarDay | null)[] = Array(startOffset).fill(null)
  cells.push(...days.value)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

function fortuneCellClass(day: CalendarDay) {
  if (day.fortuneLevel === 'ji') return 'hover:bg-[var(--accent-bg)]/50'
  if (day.fortuneLevel === 'xiong') return 'hover:bg-red-50 dark:hover:bg-red-900/20'
  return 'hover:bg-[var(--surface-hover)]'
}

function fortuneDotClass(level: string) {
  if (level === 'ji') return 'bg-green-500'
  if (level === 'xiong') return 'bg-red-400'
  return 'bg-gray-300 dark:bg-gray-600'
}

function fortuneBadgeClass(level: string) {
  if (level === 'ji') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (level === 'xiong') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
}

function selectDay(day: CalendarDay) {
  selectedDate.value = day.date
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  fetchMonth()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  fetchMonth()
}

async function fetchMonth() {
  loading.value = true
  selectedDate.value = null

  const lastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const startDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-01`
  const endDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  try {
    const res = await $fetch<any>('/api/tools/fortune-calendar/days', {
      method: 'POST',
      body: { startDate, endDate },
    })

    const todayStr = new Date().toISOString().slice(0, 10)
    days.value = (Array.isArray(res) ? res : res.days || []).map((d: any) => ({
      date: d.date,
      dayNumber: Number(d.date.slice(8)),
      lunarDay: d.dayInChinese || '',
      dayGanZhi: d.dayGanZhi || '',
      yi: Array.isArray(d.yi) ? d.yi : [],
      ji: Array.isArray(d.ji) ? d.ji : [],
      jieQi: d.jieQi || '',
      tianShenLuck: d.tianShenLuck || '',
      fortuneLevel: d.tianShenLuck === '吉' ? 'ji' : d.tianShenLuck === '凶' ? 'xiong' : 'ping',
      isToday: d.date === todayStr,
    }))
  } catch (e) {
    console.error('Fortune calendar fetch error', e)
    days.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchMonth)

useSeoMeta({
  title: t('seo.fortuneCalendarTitle'),
  description: t('seo.fortuneCalendarDesc'),
  keywords: t('seo.fortuneCalendarKeywords'),
  ogTitle: t('seo.fortuneCalendarOgTitle'),
  ogDescription: t('seo.fortuneCalendarOgDesc'),
})
</script>
