<template>
  <div class="space-y-5">
    <!-- 档案快选区 -->
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('baziForm.selectProfile') }}</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="selectedProfileId === profile.id
            ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
            : 'border-white/8 bg-white/[0.02] text-[#e8e0d0]/50 hover:border-white/15 hover:text-[#e8e0d0]/70'"
          @click="selectProfile(profile)"
        >
          <UIcon name="i-heroicons-user" class="w-3 h-3" />
          {{ profile.label }}
          <span v-if="profile.isDefault" class="text-[10px]">★</span>
        </button>
      </div>
    </div>
    <div v-else class="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <p class="text-sm text-[#e8e0d0]/40">
        {{ $t('baziForm.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[#c9a227] hover:underline">{{ $t('baziForm.goSettings') }}</NuxtLink>{{ $t('baziForm.createSuffix') }}
      </p>
    </div>

    <!-- 性别 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
        {{ $t('profileForm.gender') }}
        <span class="text-[#c9a227]">*</span>
      </label>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
          :class="form.gender === 'male'
            ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
            : 'border-white/8 bg-white/[0.02] text-[#e8e0d0]/50 hover:border-white/15 hover:text-[#e8e0d0]/70'"
          @click="form.gender = 'male'"
        >
          <UIcon name="i-heroicons-user" class="w-4 h-4" />
          {{ $t('common.male') }}
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
          :class="form.gender === 'female'
            ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
            : 'border-white/8 bg-white/[0.02] text-[#e8e0d0]/50 hover:border-white/15 hover:text-[#e8e0d0]/70'"
          @click="form.gender = 'female'"
        >
          <UIcon name="i-heroicons-user" class="w-4 h-4" />
          {{ $t('common.female') }}
        </button>
      </div>
    </div>

    <!-- 阳历生日 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
        {{ $t('profileForm.birthDate') }}
        <span class="text-[#c9a227]">*</span>
      </label>
      <UPopover>
        <UButton
          color="neutral"
          variant="outline"
          class="w-full justify-start bg-white/[0.03] border-white/8 text-[#f5e6c0] hover:bg-white/[0.05] hover:border-white/15"
          :class="{ 'text-[#e8e0d0]/25': !form.birthDate }"
        >
          <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[#e8e0d0]/40" />
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
      <p v-if="birthGanZhi" class="text-xs text-[#c9a227]/80 flex items-center gap-1">
        <UIcon name="i-heroicons-sparkles" class="w-3 h-3" />
        {{ birthGanZhi }}
      </p>
    </div>

    <!-- 出生时辰 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.birthHour') }}</label>
      <USelect
        v-model="form.birthHour"
        :items="hourOptions"
        :placeholder="$t('profileForm.birthHourPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0]',
          placeholder: 'text-[#e8e0d0]/25',
          content: 'bg-[#1a1612] border border-white/8 rounded-xl shadow-2xl',
          item: 'text-[#f5e6c0] hover:bg-white/[0.04] data-[state=checked]:bg-[#c9a227]/10 data-[state=checked]:text-[#c9a227]',
        }"
      />
    </div>

    <!-- 姓名 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.name') }}</label>
      <UInput
        v-model="form.name"
        :placeholder="$t('profileForm.namePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
        }"
      />
    </div>

    <!-- 曾用名 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.formerName') }}</label>
      <UInput
        v-model="form.formerName"
        :placeholder="$t('profileForm.formerNamePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
        }"
      />
    </div>

    <!-- 改名年份 -->
    <div v-if="form.formerName" class="space-y-1.5">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.changedYear') }}</label>
      <UInput
        v-model.number="form.formerNameChangedYear"
        type="number"
        :placeholder="$t('profileForm.changedYearPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
        }"
      />
    </div>

    <!-- 出生地点 -->
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.birthProvince') }}</label>
      <UInput
        v-model="form.birthProvince"
        :placeholder="$t('profileForm.birthProvincePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
        }"
      />
    </div>

    <!-- 保存到当前档案 -->
    <div v-if="selectedProfileId && hasFormChanges" class="pt-1">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        class="text-[#e8e0d0]/40 hover:text-[#c9a227] hover:bg-[#c9a227]/5"
        @click="saveToProfile"
      >
        <template #leading>
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
        </template>
        {{ $t('baziForm.saveToProfile') }}
      </UButton>
    </div>

    <UButton
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
      {{ $t('baziForm.submit') }}
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
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
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
  try {
    birthGanZhi.value = dateToGanZhi(year, month, day)
  } catch {
    birthGanZhi.value = ''
  }
}

const isValid = computed(() => {
  return !!(form.gender && form.birthDate)
})

const hasFormChanges = computed(() => {
  if (!selectedProfileId.value) return false
  const p = store.list.find(x => x.id === selectedProfileId.value)
  if (!p) return false
  return (
    p.gender !== form.gender ||
    p.birthDate !== form.birthDate ||
    p.birthHour !== form.birthHour ||
    p.name !== form.name ||
    p.formerName !== form.formerName ||
    p.formerNameChangedYear !== form.formerNameChangedYear ||
    p.birthProvince !== form.birthProvince
  )
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
</script>
