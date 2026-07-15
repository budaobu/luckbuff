<template>
  <div class="space-y-5">
    <!-- 档案快选区 -->
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziForm.selectProfile') }}</label>
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
        {{ $t('baziForm.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('baziForm.goSettings') }}</NuxtLink>{{ $t('baziForm.createSuffix') }}
      </p>
    </div>

    <!-- 性别 -->
    <div v-if="!minimal && showGender" class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('profileForm.gender') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
          :class="form.gender === 'male'
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="form.gender = 'male'"
        >
          <UIcon name="i-heroicons-user" class="w-4 h-4" />
          {{ $t('common.male') }}
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
          :class="form.gender === 'female'
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
          @click="form.gender = 'female'"
        >
          <UIcon name="i-heroicons-user" class="w-4 h-4" />
          {{ $t('common.female') }}
        </button>
      </div>
    </div>

    <!-- 阳历生日 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('profileForm.birthDate') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UPopover>
        <UButton
          color="neutral"
          variant="outline"
          class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
          :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
        >
          <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
          {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('profileForm.birthDatePlaceholder') }}
        </UButton>
        <template #content>
          <AppCalendar
            v-model="calendarDate"
            color="warning"
            class="p-2"
          />
        </template>
      </UPopover>
      <p v-if="birthGanZhi" class="text-xs text-[var(--accent)] flex items-center gap-1">
        <UIcon name="i-heroicons-sparkles" class="w-3 h-3" />
        {{ birthGanZhi }}
      </p>
    </div>

    <!-- 出生时辰 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('profileForm.birthHour') }}</label>
      <USelect
        v-model="form.birthHour"
        :items="hourOptions"
        :placeholder="$t('profileForm.birthHourPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
          placeholder: 'text-[var(--text-placeholder)]',
          content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
          item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
        }"
      />
    </div>

    <!-- 姓名 -->
    <div v-if="!minimal && showName" class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('profileForm.name') }}</label>
      <UInput
        v-model="form.name"
        :placeholder="$t('profileForm.namePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 曾用名 -->
    <div v-if="!minimal && showFormerName" class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('profileForm.formerName') }}</label>
      <UInput
        v-model="form.formerName"
        :placeholder="$t('profileForm.formerNamePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 改名年份 -->
    <div v-if="!minimal && showFormerName && form.formerName" class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('profileForm.changedYear') }}</label>
      <UInput
        v-model.number="form.formerNameChangedYear"
        type="number"
        :placeholder="$t('profileForm.changedYearPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 出生地点 -->
    <div v-if="!minimal && showBirthProvince" class="space-y-1.5">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('profileForm.birthProvince') }}</label>
      <UInput
        v-model="form.birthProvince"
        :placeholder="$t('profileForm.birthProvincePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 保存到当前档案 -->
    <div v-if="!minimal && selectedProfileId && hasFormChanges" class="pt-1">
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
        {{ $t('baziForm.saveToProfile') }}
      </UButton>
    </div>

    <UButton
      v-if="!minimal"
      color="warning"
      size="lg"
      block
      :disabled="!isValid"
      class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
      @click="$emit('submit', { ...form })"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      {{ submitLabel || $t('baziForm.submit') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi, UserProfile } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

interface Props {
  initialValues?: Partial<FormValues>
  minimal?: boolean
  showGender?: boolean
  showName?: boolean
  showFormerName?: boolean
  showBirthProvince?: boolean
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  minimal: false,
  showGender: true,
  showName: true,
  showFormerName: true,
  showBirthProvince: true,
  submitLabel: undefined,
})

const emit = defineEmits<{
  submit: [values: FormValues]
  'save-profile': [id: string, values: FormValues]
}>()

const { profiles, defaultProfile } = useProfiles()
const store = useProfilesStore()
const localePath = useLocalePath()

const selectedProfileId = ref<string | null>(null)

const form = reactive<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
  ...props.initialValues,
})

const hourOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

const birthGanZhi = ref('')
const { dateToGanZhi } = useBaziCalc()

const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

function syncBirthDateFromCalendar() {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    form.birthDate = ''
  }
  onBirthDateChange()
}

watch(calendarDate, () => {
  syncBirthDateFromCalendar()
})

function onBirthDateChange() {
  if (!form.birthDate) {
    birthGanZhi.value = ''
    return
  }
  const [year, month, day] = form.birthDate.split('-').map(Number)
  if (!year || !month || !day) {
    birthGanZhi.value = ''
    return
  }
  try {
    birthGanZhi.value = dateToGanZhi(year, month, day)
  } catch {
    birthGanZhi.value = ''
  }
}

const isValid = computed(() => {
  if (props.minimal) return !!(form.birthDate)
  return !!(form.gender && form.birthDate)
})

const hasFormChanges = computed(() => {
  if (!selectedProfileId.value) return false
  const p = store.list.find(x => x.id === selectedProfileId.value)
  if (!p) return false
  const checks: boolean[] = [
    p.birthDate !== form.birthDate,
    p.birthHour !== form.birthHour,
  ]
  if (props.showGender) checks.push(p.gender !== form.gender)
  if (props.showName) checks.push(p.name !== form.name)
  if (props.showFormerName && !props.minimal) {
    checks.push(
      p.formerName !== form.formerName,
      p.formerNameChangedYear !== form.formerNameChangedYear,
    )
  }
  if (props.showBirthProvince && !props.minimal) checks.push(p.birthProvince !== form.birthProvince)
  return checks.some(Boolean)
})

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.gender = profile.gender
  form.birthDate = profile.birthDate || ''
  form.birthHour = profile.birthHour
  form.name = profile.name || ''
  form.formerName = profile.formerName || ''
  form.formerNameChangedYear = profile.formerNameChangedYear
  form.birthProvince = profile.birthProvince || ''
  if (form.birthDate) {
    try {
      calendarDate.value = parseDate(form.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
  onBirthDateChange()
}

function saveToProfile() {
  if (selectedProfileId.value) {
    emit('save-profile', selectedProfileId.value, { ...form })
  }
}

watch(() => props.initialValues, (v) => {
  if (v) {
    Object.assign(form, v)
    if (form.birthDate) {
      try {
        calendarDate.value = parseDate(form.birthDate)
      } catch {
        calendarDate.value = undefined
      }
    }
    onBirthDateChange()
  }
}, { immediate: true })

// 自动选择默认档案
onMounted(() => {
  if (defaultProfile.value && !props.initialValues?.birthDate) {
    selectProfile(defaultProfile.value)
  }
})

defineExpose({ form })
</script>
