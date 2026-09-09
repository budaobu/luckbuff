<template>
  <div class="space-y-4">
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="block text-sm text-[var(--text-muted)]">{{ $t('baziForm.selectProfile') }}</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          :class="selectedProfileId === profile.id
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="emit('select-profile', profile)"
        >
          <UIcon name="i-heroicons-user" class="h-3 w-3" />
          {{ profile.label }}
          <span v-if="profile.isDefault" class="text-[10px]">★</span>
        </button>
      </div>
    </div>

    <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
      <p class="text-sm text-[var(--text-faint)]">
        {{ $t('baziForm.noProfiles') }}<NuxtLink
          :to="localePath('/settings')"
          class="text-[var(--accent)] hover:underline"
        >{{ $t('baziForm.goSettings') }}</NuxtLink>{{ $t('baziForm.createSuffix') }}
      </p>
    </div>

    <div class="space-y-2">
      <label v-if="dateLabel" class="block text-sm text-[var(--text-muted)]">
        {{ dateLabel }}
        <span v-if="required" class="text-[var(--accent)]">*</span>
      </label>
      <UPopover>
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
          :class="{ 'text-[var(--text-placeholder)]': !birthDate }"
        >
          <UIcon name="i-heroicons-calendar" class="mr-2 h-4 w-4 text-[var(--text-faint)]" />
          {{ birthDate && calendarDate ? dateFormatter.format(calendarDate.toDate(tz)) : $t('profileForm.birthDatePlaceholder') }}
        </UButton>
        <template #content>
          <AppCalendar
            v-model="calendarDate"
            color="warning"
            :min-value="minDate"
            :max-value="maxDate"
            class="p-2"
          />
        </template>
      </UPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { UserProfile } from '~/types/user'

const props = defineProps<{
  birthDate: string
  selectedProfileId?: string | null
  dateLabel?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'select-profile': [profile: UserProfile]
  'update:birthDate': [value: string]
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
const { profiles } = useProfiles()

const tz = getLocalTimeZone()
const dateFormatter = computed(() => new DateFormatter(
  locale.value === 'en' ? 'en-US' : 'zh-CN',
  { dateStyle: 'long' },
))

const minDate = new CalendarDate(1900, 1, 1)
const maxDate = new CalendarDate(2100, 12, 31)
const calendarDate = shallowRef<DateValue>()

watch(() => props.birthDate, (value) => {
  calendarDate.value = value ? parseDate(value) : undefined
}, { immediate: true })

watch(calendarDate, (value) => {
  emit('update:birthDate', value ? value.toString() : '')
})
</script>
