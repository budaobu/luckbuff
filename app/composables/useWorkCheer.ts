export interface WorkCheerGoal {
  id: string
  name: string
  amount: number
}

export interface WorkCheerSettings {
  monthlySalary: number
  startTime: string
  endTime: string
  breakEnabled: boolean
  breakStart: string
  breakEnd: string
  weekdays: number[]
  restDates: string[]
  extraWorkDates: string[]
  cycleDay: number
  currency: string
  privacyMode: boolean
  goals: WorkCheerGoal[]
}

export interface WorkCheerPeriodRange {
  start: Date
  end: Date
}

export interface WorkCheerSnapshot {
  status: 'before' | 'working' | 'break' | 'after' | 'rest'
  workedSeconds: number
  totalSeconds: number
  progress: number
  remainingSeconds: number
  dailySalary: number
  hourlyValue: number
  secondsRate: number
  todayEarned: number
  cycleEarned: number
  periodDays: number
  goals: Array<{
    goal: WorkCheerGoal
    allocated: number
    progress: number
    remaining: number
  }>
}

const STORAGE_KEY = 'luckbuff-work-cheer-settings-v1'
const CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'KRW'] as const

export function createDefaultWorkCheerSettings(): WorkCheerSettings {
  return {
    monthlySalary: 18000,
    startTime: '09:00',
    endTime: '18:00',
    breakEnabled: true,
    breakStart: '12:00',
    breakEnd: '13:00',
    weekdays: [1, 2, 3, 4, 5],
    restDates: [],
    extraWorkDates: [],
    cycleDay: 1,
    currency: 'CNY',
    privacyMode: false,
    goals: [
      { id: 'coffee', name: '', amount: 150 },
      { id: 'reward', name: '', amount: 3000 },
    ],
  }
}

function createDemoWorkCheerSnapshot(current: WorkCheerSettings): WorkCheerSnapshot {
  const periodDays = 21
  const dailySalary = current.monthlySalary / periodDays
  const totalSeconds = 8 * 3600
  const workedSeconds = 4.4 * 3600
  const todayEarned = (workedSeconds / totalSeconds) * dailySalary
  const cycleEarned = (dailySalary * 2) + todayEarned
  let rewardBudget = Math.max(0, cycleEarned)
  const goals = current.goals.map((goal) => {
    const allocated = Math.min(goal.amount, rewardBudget)
    rewardBudget -= allocated
    return {
      goal,
      allocated,
      progress: goal.amount ? allocated / goal.amount : 0,
      remaining: Math.max(0, goal.amount - allocated),
    }
  })

  return {
    status: 'working',
    workedSeconds,
    totalSeconds,
    progress: totalSeconds ? workedSeconds / totalSeconds : 0,
    remainingSeconds: Math.max(0, totalSeconds - workedSeconds),
    dailySalary,
    hourlyValue: totalSeconds ? dailySalary / (totalSeconds / 3600) : 0,
    secondsRate: totalSeconds ? dailySalary / totalSeconds : 0,
    todayEarned,
    cycleEarned,
    periodDays,
    goals,
  }
}

export function useWorkCheer() {
  const { locale } = useI18n()
  const settings = ref<WorkCheerSettings>(createDefaultWorkCheerSettings())
  const now = ref<Date | null>(null)
  const ready = ref(false)
  const loaded = ref(false)
  const demoMode = ref(false)
  const loadError = ref('')
  let suppressSave = false
  let timer: ReturnType<typeof setInterval> | undefined

  function minutesFromTime(value: string): number {
    const match = /^(\d{2}):(\d{2})$/.exec(value)
    if (!match) return 0
    return Number(match[1]) * 60 + Number(match[2])
  }

  function dateFromIso(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  function normalizeDateList(values: string[]): string[] {
    return values
      .map(value => value.trim())
      .filter(Boolean)
      .filter((value) => {
        const date = dateFromIso(value)
        return date !== null
      })
  }

  function normalizeSettings(input: Partial<WorkCheerSettings> | null): WorkCheerSettings {
    const base = createDefaultWorkCheerSettings()
    if (!input) return base

    const weekdays = Array.isArray(input.weekdays)
      ? [...new Set(input.weekdays.filter(day => Number.isInteger(day) && day >= 0 && day <= 6))].sort()
      : base.weekdays
    const goals = Array.isArray(input.goals)
      ? input.goals.slice(0, 20).map(goal => ({
          id: String(goal?.id ?? `${Date.now()}-${Math.random()}`),
          name: String(goal?.name ?? '').slice(0, 40),
          amount: Math.min(Math.max(Number(goal?.amount) || 0, 0), 100_000_000),
        })).filter(goal => goal.amount > 0)
      : base.goals

    return {
      monthlySalary: Math.min(Math.max(Number(input.monthlySalary) || 0, 0), 100_000_000),
      startTime: /^\d{2}:\d{2}$/.test(String(input.startTime)) ? String(input.startTime) : base.startTime,
      endTime: /^\d{2}:\d{2}$/.test(String(input.endTime)) ? String(input.endTime) : base.endTime,
      breakEnabled: input.breakEnabled !== false,
      breakStart: /^\d{2}:\d{2}$/.test(String(input.breakStart)) ? String(input.breakStart) : base.breakStart,
      breakEnd: /^\d{2}:\d{2}$/.test(String(input.breakEnd)) ? String(input.breakEnd) : base.breakEnd,
      weekdays: weekdays.length ? weekdays : base.weekdays,
      restDates: normalizeDateList(Array.isArray(input.restDates) ? input.restDates : []),
      extraWorkDates: normalizeDateList(Array.isArray(input.extraWorkDates) ? input.extraWorkDates : []),
      cycleDay: Math.min(Math.max(Number(input.cycleDay) || 1, 1), 31),
      currency: CURRENCIES.includes(input.currency as typeof CURRENCIES[number]) ? String(input.currency) : base.currency,
      privacyMode: input.privacyMode === true,
      goals: goals.length ? goals : base.goals,
    }
  }

  function isWorkday(date: Date, current: WorkCheerSettings = settings.value): boolean {
    const localIso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (current.extraWorkDates.includes(localIso)) return true
    if (current.restDates.includes(localIso)) return false
    return current.weekdays.includes(date.getDay())
  }

  function periodRange(date: Date, cycleDay: number): WorkCheerPeriodRange {
    const year = date.getFullYear()
    const month = date.getMonth()
    const safeDay = Math.min(cycleDay, new Date(year + (month === 11 ? 1 : 0), month === 11 ? 0 : month + 1, 0).getDate())
    let start: Date
    let endAnchor: Date
    if (date.getDate() < safeDay) {
      const previousMonth = month === 0 ? 11 : month - 1
      const previousYear = month === 0 ? year - 1 : year
      const previousSafeDay = Math.min(cycleDay, new Date(previousYear + (previousMonth === 11 ? 1 : 0), previousMonth === 11 ? 0 : previousMonth + 1, 0).getDate())
      start = new Date(previousYear, previousMonth, previousSafeDay)
      endAnchor = new Date(year, month, safeDay)
    }
    else {
      start = new Date(year, month, safeDay)
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const nextSafeDay = Math.min(cycleDay, new Date(nextYear + (nextMonth === 11 ? 1 : 0), nextMonth === 11 ? 0 : nextMonth + 1, 0).getDate())
      endAnchor = new Date(nextYear, nextMonth, nextSafeDay)
    }
    const end = new Date(endAnchor)
    end.setDate(end.getDate() - 1)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  function overlapSeconds(dayStart: Date, startMinute: number, endMinute: number, nowDate: Date): number {
    const start = new Date(dayStart)
    start.setMinutes(start.getMinutes() + startMinute)
    const end = new Date(dayStart)
    end.setMinutes(end.getMinutes() + endMinute)
    const elapsed = Math.min(end.getTime(), nowDate.getTime()) - start.getTime()
    return Math.max(0, elapsed / 1000)
  }

  const snapshot = computed<WorkCheerSnapshot | null>(() => {
    if (!ready.value) return null
    const nowDate = now.value
    if (!nowDate) return demoMode.value ? createDemoWorkCheerSnapshot(settings.value) : null

    const period = periodRange(nowDate, settings.value.cycleDay)
    let periodDays = 0
    for (let date = new Date(period.start); date <= period.end; date.setDate(date.getDate() + 1)) {
      if (isWorkday(date)) periodDays += 1
    }

    const dailySalary = periodDays > 0 ? settings.value.monthlySalary / periodDays : 0
    const restHourlyValue = 0
    const restSecondsRate = 0
    if (!isWorkday(nowDate)) {
      return {
        status: 'rest',
        workedSeconds: 0,
        totalSeconds: 0,
        progress: 0,
        remainingSeconds: 0,
        dailySalary,
        hourlyValue: restHourlyValue,
        secondsRate: restSecondsRate,
        todayEarned: 0,
        cycleEarned: 0,
        periodDays,
        goals: settings.value.goals.map(goal => ({ goal, allocated: 0, progress: 0, remaining: goal.amount })),
      }
    }

    const startMinute = minutesFromTime(settings.value.startTime)
    const endMinute = minutesFromTime(settings.value.endTime)
    const totalMinutes = endMinute > startMinute ? endMinute - startMinute : 1440 - startMinute + endMinute
    const breakStartMinute = minutesFromTime(settings.value.breakStart)
    const breakEndMinute = minutesFromTime(settings.value.breakEnd)
    const breakMinutes = settings.value.breakEnabled && breakEndMinute > breakStartMinute
      ? breakEndMinute - breakStartMinute
      : 0
    const effectiveMinutes = Math.max(0, totalMinutes - breakMinutes)
    const dayStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate())
    const rawWorked = overlapSeconds(dayStart, startMinute, endMinute > startMinute ? endMinute : endMinute + 1440, nowDate)
    const breakWorked = settings.value.breakEnabled
      ? overlapSeconds(dayStart, breakStartMinute, breakEndMinute, nowDate)
      : 0
    const workedSeconds = Math.max(0, Math.min(rawWorked - breakWorked, effectiveMinutes * 60))
    const totalSeconds = effectiveMinutes * 60
    const hourlyValue = totalSeconds ? dailySalary / (totalSeconds / 3600) : 0
    const secondsRate = totalSeconds ? dailySalary / totalSeconds : 0
    const todayEarned = totalSeconds ? (workedSeconds / totalSeconds) * dailySalary : 0

    let cycleEarned = 0
    for (let date = new Date(period.start); date < dayStart; date.setDate(date.getDate() + 1)) {
      if (isWorkday(date)) cycleEarned += dailySalary
    }
    cycleEarned += todayEarned

    let rewardBudget = Math.max(0, cycleEarned)
    const goals = settings.value.goals.map((goal) => {
      const allocated = Math.min(goal.amount, rewardBudget)
      rewardBudget -= allocated
      return {
        goal,
        allocated,
        progress: goal.amount ? allocated / goal.amount : 0,
        remaining: Math.max(0, goal.amount - allocated),
      }
    })

    const nowSeconds = (nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds())
      + (nowDate.getDate() !== dayStart.getDate() ? 86400 : 0)
    const shiftStartSeconds = startMinute * 60
    const shiftEndSeconds = (endMinute > startMinute ? endMinute : endMinute + 1440) * 60
    const breakStartSeconds = breakStartMinute * 60
    const breakEndSeconds = (breakEndMinute > breakStartMinute ? breakEndMinute : breakEndMinute + 1440) * 60
    const onBreak = settings.value.breakEnabled
      && nowSeconds >= breakStartSeconds
      && nowSeconds < breakEndSeconds

    const status = nowSeconds < shiftStartSeconds
      ? 'before'
      : onBreak
        ? 'break'
        : nowSeconds >= shiftEndSeconds ? 'after' : 'working'

    return {
      status,
      hourlyValue,
      secondsRate,
      workedSeconds,
      totalSeconds,
      progress: totalSeconds ? Math.min(1, workedSeconds / totalSeconds) : 0,
      remainingSeconds: Math.max(0, totalSeconds - workedSeconds),
      dailySalary,
      todayEarned,
      cycleEarned,
      periodDays,
      goals,
    }
  })

  function saveSettings() {
    if (!ready.value || suppressSave) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      loadError.value = ''
    }
    catch {
      loadError.value = 'save-failed'
    }
  }

  function loadSettings() {
    suppressSave = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        settings.value = normalizeSettings(JSON.parse(raw) as Partial<WorkCheerSettings>)
        demoMode.value = false
        loadError.value = ''
      }
      else {
        settings.value = createDefaultWorkCheerSettings()
        demoMode.value = true
        loadError.value = ''
      }
    }
    catch {
      settings.value = createDefaultWorkCheerSettings()
      demoMode.value = true
      loadError.value = 'load-failed'
    }
    ready.value = true
    loaded.value = true
    if (!demoMode.value) now.value = new Date()
    nextTick(() => {
      suppressSave = false
    })
  }

  function resetSettings() {
    settings.value = createDefaultWorkCheerSettings()
    saveSettings()
  }

  function addGoal() {
    if (settings.value.goals.length >= 20) return
    settings.value.goals.push({
      id: `${Date.now()}`,
      name: 'reward',
      amount: 1000,
    })
  }

  function removeGoal(id: string) {
    settings.value.goals = settings.value.goals.filter(goal => goal.id !== id)
  }

  function moveGoal(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= settings.value.goals.length) return
    const list = [...settings.value.goals]
    const [item] = list.splice(index, 1)
    if (item) list.splice(next, 0, item)
    settings.value.goals = list
  }

  function formatMoney(amount: number, maximumFractionDigits = 2): string {
    try {
      return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: settings.value.currency,
        maximumFractionDigits,
        minimumFractionDigits: 0,
      }).format(Math.max(0, amount))
    }
    catch {
      return amount.toFixed(3)
    }
  }

  function formatClock(seconds: number): string {
    const safe = Math.max(0, Math.round(seconds))
    const h = Math.floor(safe / 3600)
    const m = Math.floor((safe % 3600) / 60)
    const s = safe % 60
    return [h, m, s].map(value => String(value).padStart(2, '0')).join(':')
  }

  watch(settings, saveSettings, { deep: true })

  onMounted(() => {
    loadSettings()
    now.value = new Date()
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return {
    settings,
    snapshot,
    now,
    ready,
    loaded,
    demoMode,
    loadError,
    resetSettings,
    addGoal,
    removeGoal,
    moveGoal,
    formatMoney,
    formatClock,
  }
}
