<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-lg mx-auto px-6 py-12">
      <!-- 返回按钮 -->
      <button
        class="inline-flex items-center gap-2 text-sm text-[#e8e0d0]/40 hover:text-[#c9a227] transition-colors mb-8 group"
        @click="$emit('cancel')"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {{ $t('profileForm.back') }}
      </button>

      <!-- 表单卡片 -->
      <div class="rounded-2xl border border-white/8 bg-[#1a1612] overflow-hidden">
        <!-- 顶部金色渐变线 -->
        <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />

        <!-- Header -->
        <div class="flex items-center gap-3 px-6 pt-6 pb-2">
          <div class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center">
            <UIcon
              :name="isEdit ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'"
              class="w-5 h-5 text-[#c9a227]"
            />
          </div>
          <div>
            <h1 class="text-lg font-semibold text-[#f5e6c0]">
              {{ isEdit ? $t('profileForm.editTitle') : $t('profileForm.newTitle') }}
            </h1>
            <p class="text-xs text-[#e8e0d0]/40 mt-0.5">
              {{ isEdit ? $t('profileForm.editSubtitle') : $t('profileForm.newSubtitle') }}
            </p>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="mx-6 h-px bg-white/5 mt-4" />

        <!-- Form -->
        <form class="px-6 py-5 space-y-5" @submit.prevent="handleSubmit">
          <!-- 档案标签 -->
          <div class="space-y-1.5">
            <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
              {{ $t('profileForm.label') }}
              <span class="text-[#c9a227]">*</span>
            </label>
            <UInput
              v-model="form.label"
              :placeholder="$t('profileForm.labelPlaceholder')"
              color="warning"
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
              }"
            />
            <p v-if="errors.label" class="text-xs text-red-400/80">
              {{ errors.label }}
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

          <!-- 阳历生日 — UPopover + UCalendar -->
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

          <!-- 出生时辰 — USelect -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-[#e8e0d0]/60">{{ $t('profileForm.birthHour') }}</label>
            <USelect
              v-model="form.birthHour"
              :items="hourOptions"
              :placeholder="$t('profileForm.birthHourPlaceholder')"
              color="warning"
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0]',
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
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
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
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
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
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
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
              :ui="{
                base: 'bg-white/[0.03] border-white/8 focus:border-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
              }"
            />
          </div>

          <!-- 设为默认 -->
          <label class="flex items-center gap-3 cursor-pointer group pt-1">
            <div
              class="w-5 h-5 rounded border flex items-center justify-center transition-colors"
              :class="form.isDefault
                ? 'border-[#c9a227]/50 bg-[#c9a227]/20'
                : 'border-white/15 bg-white/[0.03] group-hover:border-white/25'"
            >
              <UIcon
                v-if="form.isDefault"
                name="i-heroicons-check"
                class="w-3.5 h-3.5 text-[#c9a227]"
              />
            </div>
            <input v-model="form.isDefault" type="checkbox" class="sr-only" />
            <span class="text-sm text-[#e8e0d0]/60 group-hover:text-[#e8e0d0]/80 transition-colors">
              {{ $t('profileForm.setDefault') }}
            </span>
          </label>
        </form>

        <!-- Footer 操作栏 -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/[0.01]">
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[#e8e0d0]/50 hover:text-[#e8e0d0]/80 hover:bg-white/5"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            color="warning"
            class="bg-[#c9a227] hover:bg-[#d4b43a] text-[#1a1612] font-medium px-5"
            @click="handleSubmit"
          >
            <UIcon :name="isEdit ? 'i-heroicons-check' : 'i-heroicons-plus'" class="w-4 h-4 mr-1" />
            {{ isEdit ? $t('common.save') : $t('common.create') }}
          </UButton>
        </div>
      </div>

      <!-- 底部提示 -->
      <p class="mt-6 text-center text-xs text-[#e8e0d0]/20 flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
        {{ $t('profileForm.privacyNote') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile, DiZhi } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

interface Props {
  profile?: UserProfile | null
}

const props = withDefaults(defineProps<Props>(), {
  profile: null,
})

const emit = defineEmits<{
  cancel: []
  submit: [data: Omit<UserProfile, 'id'>]
}>()

const { t, locale } = useI18n()

const isEdit = computed(() => !!props.profile)

const form = reactive({
  label: '',
  name: '',
  formerName: '',
  formerNameChangedYear: undefined as number | undefined,
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
  birthProvince: '',
  isDefault: false,
})

const errors = reactive({
  label: '',
})

const hourOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

const birthGanZhi = ref('')
const { dateToGanZhi } = useBaziCalc()

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' })
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

watch(() => props.profile, (p) => {
  if (p) {
    form.label = p.label
    form.name = p.name || ''
    form.formerName = p.formerName || ''
    form.formerNameChangedYear = p.formerNameChangedYear
    form.gender = p.gender
    form.birthDate = p.birthDate || ''
    form.birthHour = p.birthHour
    form.birthProvince = p.birthProvince || ''
    form.isDefault = p.isDefault || false
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
  } else {
    form.label = ''
    form.name = ''
    form.formerName = ''
    form.formerNameChangedYear = undefined
    form.gender = 'male'
    form.birthDate = ''
    calendarDate.value = undefined
    form.birthHour = undefined
    form.birthProvince = ''
    form.isDefault = false
    birthGanZhi.value = ''
  }
}, { immediate: true })

function handleSubmit() {
  errors.label = ''
  if (!form.label.trim()) {
    errors.label = t('profileForm.labelError')
    return
  }
  if (!form.birthDate) {
    return
  }

  emit('submit', {
    label: form.label.trim(),
    name: form.name || undefined,
    formerName: form.formerName || undefined,
    formerNameChangedYear: form.formerNameChangedYear,
    gender: form.gender,
    birthDate: form.birthDate,
    birthHour: form.birthHour,
    birthProvince: form.birthProvince || undefined,
    isDefault: form.isDefault,
  })
}
</script>
