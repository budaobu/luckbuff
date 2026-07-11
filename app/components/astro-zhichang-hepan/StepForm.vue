<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { AstroZhichangFormData } from '~/types/astro-zhichang-hepan'

interface Props {
  modelValue: AstroZhichangFormData
  errorMsg?: string
  submitLabel?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: AstroZhichangFormData]; submit: [] }>()

const { t, locale } = useI18n()

const form = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const labelA = computed(() =>
  form.value.relationType === 'colleague'
    ? t('astroZhichangHepan.personAColleague')
    : t('astroZhichangHepan.personA'),
)
const labelB = computed(() =>
  form.value.relationType === 'colleague'
    ? t('astroZhichangHepan.personBColleague')
    : t('astroZhichangHepan.personB'),
)

const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
const calendarDateA = ref<CalendarDate | undefined>(undefined)
const calendarDateB = ref<CalendarDate | undefined>(undefined)

watch(calendarDateA, () => {
  form.value.personA.birthDate = calendarDateA.value
    ? `${calendarDateA.value.year}-${String(calendarDateA.value.month).padStart(2, '0')}-${String(calendarDateA.value.day).padStart(2, '0')}`
    : ''
})
watch(calendarDateB, () => {
  form.value.personB.birthDate = calendarDateB.value
    ? `${calendarDateB.value.year}-${String(calendarDateB.value.month).padStart(2, '0')}-${String(calendarDateB.value.day).padStart(2, '0')}`
    : ''
})

const isValid = computed(() =>
  form.value.personA.birthDate && form.value.personA.birthTime && form.value.personA.birthCity.trim()
  && form.value.personB.birthDate && form.value.personB.birthTime && form.value.personB.birthCity.trim(),
)

function handleSubmit() {
  if (!isValid.value) return
  emit('submit')
}

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}
</script>

<template>
  <div class="space-y-5">
    <!-- 关系类型 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-[var(--accent)]" />
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroZhichangHepan.relationTypeLabel') }}</span>
        </div>
      </div>
      <div class="p-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex flex-col items-center gap-1.5 py-4 rounded-xl border text-sm font-medium transition-all duration-200"
          :class="form.relationType === 'leader-subordinate'
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="form.relationType = 'leader-subordinate'"
        >
          <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
          {{ $t('astroZhichangHepan.relationTypeLeaderSubordinate') }}
          <span class="text-[10px] opacity-70">{{ $t('astroZhichangHepan.personA') }} · {{ $t('astroZhichangHepan.personB') }}</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1.5 py-4 rounded-xl border text-sm font-medium transition-all duration-200"
          :class="form.relationType === 'colleague'
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="form.relationType = 'colleague'"
        >
          <UIcon name="i-heroicons-users" class="w-5 h-5" />
          {{ $t('astroZhichangHepan.relationTypeColleague') }}
          <span class="text-[10px] opacity-70">{{ $t('astroZhichangHepan.personAColleague') }} · {{ $t('astroZhichangHepan.personBColleague') }}</span>
        </button>
      </div>
    </div>

    <!-- Person A -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
          </div>
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ labelA }}</span>
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.nameLabel') }}</label>
          <UInput v-model="form.personA.name" :placeholder="$t('astroZhichangHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.genderLabel') }}</label>
          <div class="flex gap-2">
            <button type="button" class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all"
              :class="form.personA.gender === 'male' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personA.gender = 'male'">{{ $t('common.male') }}</button>
            <button type="button" class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all"
              :class="form.personA.gender === 'female' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personA.gender = 'female'">{{ $t('common.female') }}</button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UPopover>
            <UButton color="neutral" variant="outline" class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)]" :class="{ 'text-[var(--text-placeholder)]': !form.personA.birthDate }">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
              {{ form.personA.birthDate && calendarDateA ? df.format(calendarDateA.toDate(tz)) : $t('astroZhichangHepan.birthDatePlaceholder') }}
            </UButton>
            <template #content><AppCalendar v-model="calendarDateA" color="warning" class="p-2" /></template>
          </UPopover>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthTimeLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UInput v-model="form.personA.birthTime" type="time" class="w-full" :ui="inputUi" />
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input v-model="form.personA.timeUncertain" type="checkbox" class="rounded border-[var(--border-medium)] bg-[var(--surface-card-hover)] text-[var(--accent)] focus:ring-offset-0">
            <span class="text-[11px] text-[var(--text-muted)]">{{ $t('astroZhichangHepan.timeUncertain') }}</span>
          </label>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthCityLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UInput v-model="form.personA.birthCity" :placeholder="$t('astroZhichangHepan.birthCityPlaceholder')" class="w-full" :ui="inputUi" />
        </div>
      </div>
    </div>

    <!-- Person B -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
          </div>
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ labelB }}</span>
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.nameLabel') }}</label>
          <UInput v-model="form.personB.name" :placeholder="$t('astroZhichangHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.genderLabel') }}</label>
          <div class="flex gap-2">
            <button type="button" class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all"
              :class="form.personB.gender === 'male' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personB.gender = 'male'">{{ $t('common.male') }}</button>
            <button type="button" class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all"
              :class="form.personB.gender === 'female' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personB.gender = 'female'">{{ $t('common.female') }}</button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UPopover>
            <UButton color="neutral" variant="outline" class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)]" :class="{ 'text-[var(--text-placeholder)]': !form.personB.birthDate }">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
              {{ form.personB.birthDate && calendarDateB ? df.format(calendarDateB.toDate(tz)) : $t('astroZhichangHepan.birthDatePlaceholder') }}
            </UButton>
            <template #content><AppCalendar v-model="calendarDateB" color="warning" class="p-2" /></template>
          </UPopover>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthTimeLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UInput v-model="form.personB.birthTime" type="time" class="w-full" :ui="inputUi" />
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input v-model="form.personB.timeUncertain" type="checkbox" class="rounded border-[var(--border-medium)] bg-[var(--surface-card-hover)] text-[var(--accent)] focus:ring-offset-0">
            <span class="text-[11px] text-[var(--text-muted)]">{{ $t('astroZhichangHepan.timeUncertain') }}</span>
          </label>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">{{ $t('astroZhichangHepan.birthCityLabel') }} <span class="text-[var(--accent)]">*</span></label>
          <UInput v-model="form.personB.birthCity" :placeholder="$t('astroZhichangHepan.birthCityPlaceholder')" class="w-full" :ui="inputUi" />
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
      {{ errorMsg }}
    </div>

    <UButton color="warning" size="lg" block :disabled="!isValid" class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300" @click="handleSubmit">
      <template #leading><UIcon name="i-heroicons-sparkles" class="w-5 h-5" /></template>
      {{ submitLabel || $t('astroZhichangHepan.submitBtn') }}
    </UButton>
  </div>
</template>
