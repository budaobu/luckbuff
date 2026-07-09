<script setup lang="ts">
import type { VedicHepanFormData, VedicHepanCalcResult } from '~/types/vedic-hepan'
import type { DiZhi, UserProfile } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'

interface Props {
  modelValue: VedicHepanFormData
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: VedicHepanFormData]
  submit: []
}>()

const { t } = useI18n()
const { profiles, defaultProfile } = useProfiles()
const localePath = useLocalePath()

const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const selectedA = ref<string | null>(null)
const selectedB = ref<string | null>(null)

const shichenOptions = [...SHICHEN_OPTIONS]

function diZhiToTime(dizhi?: DiZhi): string {
  if (!dizhi) return ''
  const map: Record<DiZhi, string> = {
    '子': '00:00', '丑': '01:00', '寅': '03:00', '卯': '05:00',
    '辰': '07:00', '巳': '09:00', '午': '11:00', '未': '13:00',
    '申': '15:00', '酉': '17:00', '戌': '19:00', '亥': '21:00',
  }
  return map[dizhi] || ''
}

function selectProfile(profile: UserProfile, target: 'A' | 'B') {
  if (target === 'A') {
    selectedA.value = profile.id
    form.value.personA.name = profile.name || profile.label || ''
    form.value.personA.gender = profile.gender || ''
    form.value.personA.birthDate = profile.birthDate || ''
    form.value.personA.birthTime = profile.birthHour ? diZhiToTime(profile.birthHour) : ''
    form.value.personA.birthCity = profile.birthProvince || ''
  } else {
    selectedB.value = profile.id
    form.value.personB.name = profile.name || profile.label || ''
    form.value.personB.gender = profile.gender || ''
    form.value.personB.birthDate = profile.birthDate || ''
    form.value.personB.birthTime = profile.birthHour ? diZhiToTime(profile.birthHour) : ''
    form.value.personB.birthCity = profile.birthProvince || ''
  }
}

onMounted(() => {
  if (defaultProfile.value) selectProfile(defaultProfile.value, 'A')
  const second = profiles.value.find(p => p.id !== defaultProfile.value?.id)
  if (second) selectProfile(second, 'B')
})

const isValid = computed(() => {
  return (
    form.value.personA.birthDate &&
    form.value.personA.birthTime &&
    form.value.personA.birthCity.trim() &&
    form.value.personB.birthDate &&
    form.value.personB.birthTime &&
    form.value.personB.birthCity.trim()
  )
})

function handleSubmit() {
  if (!isValid.value) return
  emit('submit')
}

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}
</script>

<template>
  <div class="space-y-5">
    <!-- 档案快选 -->
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('vedicHepan.selectProfile') }}</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="selectedA === profile.id
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="selectProfile(profile, 'A')"
        >
          <UIcon name="i-heroicons-user" class="w-3 h-3" />
          {{ profile.label }}
          <span v-if="profile.isDefault" class="text-[10px]">★</span>
        </button>
      </div>
    </div>

    <!-- 甲方 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
          </div>
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.personA') }}</span>
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('vedicHepan.nameLabel') }}</label>
          <UInput v-model="form.personA.name" :placeholder="$t('vedicHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.genderLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
              :class="form.personA.gender === 'male'
                ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personA.gender = 'male'"
            >
              {{ $t('common.male') }}
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
              :class="form.personA.gender === 'female'
                ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personA.gender = 'female'"
            >
              {{ $t('common.female') }}
            </button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthDateLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personA.birthDate" type="date" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthTimeLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personA.birthTime" type="time" class="w-full" :ui="inputUi" />
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              v-model="form.personA.timeUncertain"
              type="checkbox"
              class="rounded border-[var(--border-medium)] bg-[var(--surface-card-hover)] text-[var(--accent)] focus:ring-[var(--accent-border-hover)] focus:ring-offset-0"
            >
            <span class="text-[11px] text-[var(--text-muted)]">{{ $t('vedicHepan.timeUncertain') }}</span>
          </label>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthCityLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personA.birthCity" :placeholder="$t('vedicHepan.birthCityPlaceholder')" class="w-full" :ui="inputUi" />
        </div>
      </div>
    </div>

    <!-- 乙方 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
          </div>
          <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.personB') }}</span>
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('vedicHepan.nameLabel') }}</label>
          <UInput v-model="form.personB.name" :placeholder="$t('vedicHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.genderLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
              :class="form.personB.gender === 'male'
                ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personB.gender = 'male'"
            >
              {{ $t('common.male') }}
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
              :class="form.personB.gender === 'female'
                ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
              @click="form.personB.gender = 'female'"
            >
              {{ $t('common.female') }}
            </button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthDateLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personB.birthDate" type="date" class="w-full" :ui="inputUi" />
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthTimeLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personB.birthTime" type="time" class="w-full" :ui="inputUi" />
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              v-model="form.personB.timeUncertain"
              type="checkbox"
              class="rounded border-[var(--border-medium)] bg-[var(--surface-card-hover)] text-[var(--accent)] focus:ring-[var(--accent-border-hover)] focus:ring-offset-0"
            >
            <span class="text-[11px] text-[var(--text-muted)]">{{ $t('vedicHepan.timeUncertain') }}</span>
          </label>
        </div>
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {{ $t('vedicHepan.birthCityLabel') }}
            <span class="text-[var(--accent)]">*</span>
          </label>
          <UInput v-model="form.personB.birthCity" :placeholder="$t('vedicHepan.birthCityPlaceholder')" class="w-full" :ui="inputUi" />
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
      {{ errorMsg }}
    </div>

    <UButton
      color="warning"
      size="lg"
      block
      :disabled="!isValid"
      class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
      @click="handleSubmit"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      {{ $t('vedicHepan.submitBtn') }}
    </UButton>
  </div>
</template>
