<script setup lang="ts">
import type { VedicFormData } from '~/types/vedic'
import type { DiZhi, UserProfile } from '~/types/user'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date'

const DIZHI_TO_TIME: Record<DiZhi, string> = {
  '子': '00:00',
  '丑': '01:00',
  '寅': '03:00',
  '卯': '05:00',
  '辰': '07:00',
  '巳': '09:00',
  '午': '11:00',
  '未': '13:00',
  '申': '15:00',
  '酉': '17:00',
  '戌': '19:00',
  '亥': '21:00',
}

interface Props {
  modelValue: VedicFormData
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [VedicFormData]
  submit: []
  'save-profile': [id: string, values: Partial<Pick<UserProfile, 'gender' | 'birthDate' | 'birthProvince'>>]
}>()

const { t } = useI18n()
const { profiles, defaultProfile } = useProfiles()
const store = useProfilesStore()
const localePath = useLocalePath()

const selectedProfileId = ref<string | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = shallowRef<DateValue | undefined>(undefined)

function syncBirthDateFromCalendar() {
  if (calendarDate.value) {
    local.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    local.birthDate = ''
  }
}

watch(calendarDate, () => {
  syncBirthDateFromCalendar()
})

const local = reactive({ ...props.modelValue })
watch(() => props.modelValue, (v) => {
  Object.assign(local, v)
  if (v.birthDate) {
    try {
      calendarDate.value = parseDate(v.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
}, { deep: true })
watch(local, v => emit('update:modelValue', { ...v }), { deep: true })

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}))

const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
  label: String(i * 5).padStart(2, '0'),
  value: String(i * 5).padStart(2, '0'),
}))

function parseTime(timeStr: string) {
  if (!timeStr || !timeStr.includes(':')) return { hour: '', minute: '' }
  const [h, m] = timeStr.split(':')
  return { hour: h ?? '', minute: m ?? '' }
}

const selectedHour = ref('')
const selectedMinute = ref('')

watch([selectedHour, selectedMinute], ([h, m]) => {
  if (h && m) {
    local.birthTime = `${h}:${m}`
  } else {
    local.birthTime = ''
  }
})

watch(() => props.modelValue.birthTime, (time) => {
  const { hour, minute } = parseTime(time)
  selectedHour.value = hour
  selectedMinute.value = minute
}, { immediate: true })

const formError = ref<string | null>(null)

function validate(): boolean {
  if (!local.birthDate) {
    formError.value = t('vedic.form.errBirthDate')
    return false
  }
  if (!local.birthTime) {
    formError.value = t('vedic.form.errBirthTime')
    return false
  }
  if (!local.city.trim()) {
    formError.value = t('vedic.form.errCity')
    return false
  }
  if (!local.dimensions.length) {
    formError.value = t('vedic.form.errDimensions')
    return false
  }
  formError.value = null
  return true
}

function onSubmit() {
  if (!validate()) return
  emit('submit')
}

function selectProfile(profile: UserProfile, autoSubmit = false) {
  selectedProfileId.value = profile.id
  local.gender = profile.gender
  local.birthDate = profile.birthDate || ''
  if (profile.birthDate) {
    try {
      calendarDate.value = parseDate(profile.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
  if (profile.birthHour && DIZHI_TO_TIME[profile.birthHour]) {
    local.birthTime = DIZHI_TO_TIME[profile.birthHour]
  } else {
    local.birthTime = ''
  }
  const { hour, minute } = parseTime(local.birthTime)
  selectedHour.value = hour
  selectedMinute.value = minute
  local.city = profile.birthProvince || ''
  if (autoSubmit && local.birthDate && local.birthTime && local.city) {
    nextTick(() => {
      if (validate()) emit('submit')
    })
  }
}

function saveToProfile() {
  if (!selectedProfileId.value) return
  emit('save-profile', selectedProfileId.value, {
    gender: local.gender || undefined,
    birthDate: local.birthDate,
    birthProvince: local.city,
  })
}

const hasFormChanges = computed(() => {
  if (!selectedProfileId.value) return false
  const p = store.list.find(x => x.id === selectedProfileId.value)
  if (!p) return false
  return (
    p.gender !== local.gender ||
    p.birthDate !== local.birthDate ||
    p.birthProvince !== local.city
  )
})

onMounted(() => {
  if (defaultProfile.value && !props.modelValue.birthDate) {
    selectProfile(defaultProfile.value)
  }
})
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <!-- 档案快选区 -->
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('vedic.form.selectProfile') }}</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="selectedProfileId === profile.id
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="selectProfile(profile)"
        >
          <UIcon name="i-heroicons-user" class="w-3 h-3" />
          {{ profile.label }}
          <span v-if="profile.isDefault" class="text-[10px]">★</span>
        </button>
      </div>
    </div>
    <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
      <p class="text-sm text-[var(--text-faint)]">
        {{ $t('vedic.form.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('vedic.form.goSettings') }}</NuxtLink>{{ $t('vedic.form.createSuffix') }}
      </p>
    </div>

    <!-- 出生日期 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('vedic.form.birthDate') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UPopover>
        <UButton
          color="neutral"
          variant="outline"
          class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
          :class="{ 'text-[var(--text-placeholder)]': !local.birthDate }"
        >
          <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
          {{ local.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('vedic.form.birthDate') }}
        </UButton>
        <template #content>
          <AppCalendar
            v-model="calendarDate"
            color="warning"
            class="p-2"
          />
        </template>
      </UPopover>
    </div>

    <!-- 出生时间 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('vedic.form.birthTime') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UPopover>
        <UButton
          color="neutral"
          variant="outline"
          class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
          :class="{ 'text-[var(--text-placeholder)]': !local.birthTime }"
        >
          <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
          {{ local.birthTime || $t('vedic.form.birthTime') }}
        </UButton>
        <template #content>
          <div class="bg-[var(--surface-elevated)] border border-[var(--border-light)] rounded-xl shadow-2xl p-3 w-[220px]">
            <div class="flex items-center gap-2">
              <USelect
                v-model="selectedHour"
                :items="hourOptions"
                :placeholder="$t('vedic.form.hourPlaceholder')"
                color="warning"
                class="flex-1"
                :ui="{
                  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
                  placeholder: 'text-[var(--text-placeholder)]',
                  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[240px]',
                  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
                }"
              />
              <span class="text-[var(--text-faint)] text-sm">:</span>
              <USelect
                v-model="selectedMinute"
                :items="minuteOptions"
                :placeholder="$t('vedic.form.minutePlaceholder')"
                color="warning"
                class="flex-1"
                :ui="{
                  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
                  placeholder: 'text-[var(--text-placeholder)]',
                  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[240px]',
                  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
                }"
              />
            </div>
          </div>
        </template>
      </UPopover>
      <label class="flex items-center gap-2 mt-2 cursor-pointer">
        <input
          v-model="local.timeUncertain"
          type="checkbox"
          class="rounded border-[var(--border-medium)] bg-[var(--surface-card-hover)] text-[var(--accent)] focus:ring-[var(--accent-border-hover)] focus:ring-offset-0"
        >
        <span class="text-[11px] text-[var(--text-muted)]">{{ $t('vedic.form.timeUncertain') }}</span>
      </label>
    </div>

    <!-- 出生城市 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('vedic.form.city') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UInput
        v-model="local.city"
        :placeholder="$t('vedic.form.cityPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
      />
      <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('vedic.form.cityHint') }}</p>
    </div>

    <!-- 性别 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('vedic.form.gender') }}</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="g in (['', 'male', 'female'] as const)"
          :key="g || 'none'"
          type="button"
          class="py-2 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="local.gender === g
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="local.gender = g"
        >
          {{ g === '' ? $t('vedic.form.genderNone') : g === 'male' ? $t('vedic.form.genderMale') : $t('vedic.form.genderFemale') }}
        </button>
      </div>
    </div>

    <!-- 分析维度 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('vedic.form.dimensions') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <VedicDimSelector v-model="local.dimensions" />
    </div>

    <!-- 保存到当前档案 -->
    <div v-if="selectedProfileId && hasFormChanges" class="pt-1">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        class="text-[var(--text-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-faint)]"
        @click="saveToProfile"
      >
        <template #leading>
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
        </template>
        {{ $t('vedic.form.saveToProfile') }}
      </UButton>
    </div>

    <!-- 错误 / 提交 -->
    <div v-if="formError || errorMsg" class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300/90">
      {{ formError || errorMsg }}
    </div>

    <UButton
      type="submit"
      color="warning"
      variant="soft"
      class="w-full justify-center"
      size="lg"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
      </template>
      {{ $t('vedic.form.submit') }}
    </UButton>

    <p class="text-[10px] text-[var(--text-placeholder)] text-center leading-relaxed">
      {{ $t('vedic.form.privacy') }}
    </p>
  </form>
</template>
