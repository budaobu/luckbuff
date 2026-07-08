<script setup lang="ts">
import type { AstroFortuneTuneFormData } from '~/types/astro-fortune-tune'
import type { DiZhi } from '~/types/user'

const { t } = useI18n()

interface Props {
  modelValue: AstroFortuneTuneFormData
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: AstroFortuneTuneFormData]
  submit: []
  'save-profile': [id: string, values: {
    gender: 'male' | 'female'
    birthDate: string
    birthHour?: DiZhi
    name?: string
    birthProvince?: string
  }]
}>()

const { profiles, defaultProfile } = useProfiles()
const store = useProfilesStore()
const localePath = useLocalePath()

const selectedProfileId = ref<string | null>(null)

const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const selectedProfile = computed(() => profiles.value.find(p => p.id === selectedProfileId.value))

function selectProfile(profile: { id: string; gender?: 'male' | 'female'; birthDate?: string; birthHour?: DiZhi; name?: string; birthProvince?: string }) {
  selectedProfileId.value = profile.id
  if (profile.gender) form.value.gender = profile.gender
  if (profile.birthDate) form.value.birthDate = profile.birthDate
  if (profile.birthHour) form.value.birthTime = diZhiToTime(profile.birthHour)
  if (profile.birthProvince) form.value.baseCity = profile.birthProvince
}

function diZhiToTime(dizhi: DiZhi): string {
  const map: Record<DiZhi, string> = {
    '子': '00:00', '丑': '01:00', '寅': '03:00', '卯': '05:00',
    '辰': '07:00', '巳': '09:00', '午': '11:00', '未': '13:00',
    '申': '15:00', '酉': '17:00', '戌': '19:00', '亥': '21:00',
  }
  return map[dizhi] || ''
}

function saveToProfile() {
  if (!selectedProfileId.value) return
  const profile = store.list.find(p => p.id === selectedProfileId.value)
  if (!profile) return
  emit('save-profile', selectedProfileId.value, {
    gender: (form.value.gender || profile.gender || 'male') as 'male' | 'female',
    birthDate: (form.value.birthDate || profile.birthDate) as string,
    birthHour: timeToDiZhi(form.value.birthTime),
    name: profile.name,
    birthProvince: (form.value.baseCity || profile.birthProvince) as string,
  })
}

function timeToDiZhi(time: string): DiZhi | undefined {
  if (!time) return undefined
  const hour = Number(time.split(':')[0])
  const map: Record<number, DiZhi> = {
    0: '子', 1: '丑', 3: '寅', 5: '卯', 7: '辰', 9: '巳',
    11: '午', 13: '未', 15: '申', 17: '酉', 19: '戌', 21: '亥',
  }
  // 找到最接近的时辰
  const hours = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
  const nearest = hours.reduce((prev, curr) => Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev)
  return map[nearest]
}

onMounted(() => {
  if (defaultProfile.value) {
    selectProfile(defaultProfile.value)
  }
})

const isValid = computed(() => {
  return !!(form.value.birthDate && form.value.birthTime && form.value.baseCity && form.value.candidateCities.filter(Boolean).length > 0)
})

function removeCandidate(index: number) {
  form.value.candidateCities.splice(index, 1)
}

function addCandidate() {
  if (form.value.candidateCities.length >= 3) return
  form.value.candidateCities.push('')
}

function handleSubmit() {
  if (!isValid.value) return
  emit('submit')
}

watch(() => form.value.birthTime, (v) => {
  if (!v) return
  // 确保 HH:mm 格式
  const parts = v.split(':')
  if (parts.length === 2) {
    form.value.birthTime = `${String(Number(parts[0])).padStart(2, '0')}:${String(Number(parts[1])).padStart(2, '0')}`
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-5">
    <!-- 档案快选 -->
    <div v-if="profiles.length > 0" class="space-y-2">
      <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('astroFortuneTune.selectProfile') }}</label>
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
        </button>
      </div>
    </div>

    <!-- 性别 -->
    <div class="space-y-1.5">
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
          {{ form.birthDate || $t('profileForm.birthDatePlaceholder') }}
        </UButton>
        <template #content>
          <AppCalendar
            v-model="form.birthDate"
            color="warning"
            class="p-2"
          />
        </template>
      </UPopover>
    </div>

    <!-- 出生时间 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('profileForm.birthTime') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UInput
        v-model="form.birthTime"
        type="time"
        :placeholder="$t('profileForm.birthTimePlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 出生城市 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
        {{ $t('astroFortuneTune.baseCityLabel') }}
        <span class="text-[var(--accent)]">*</span>
      </label>
      <UInput
        v-model="form.baseCity"
        :placeholder="$t('astroFortuneTune.baseCityPlaceholder')"
        color="warning"
        class="w-full"
        :ui="{
          base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
        }"
      />
    </div>

    <!-- 候选城市 -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          {{ $t('astroFortuneTune.candidateCitiesLabel') }}
          <span class="text-[var(--accent)]">*</span>
        </label>
        <span class="text-[10px] text-[var(--text-faint)]">{{ $t('astroFortuneTune.candidateCitiesHint') }}</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="(city, index) in form.candidateCities"
          :key="index"
          class="flex gap-2"
        >
          <UInput
            v-model="form.candidateCities[index]"
            :placeholder="$t('astroFortuneTune.candidateCityPlaceholder', { index: index + 1 })"
            color="warning"
            class="flex-1"
            :ui="{
              base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
            }"
          />
          <UButton
            v-if="form.candidateCities.length > 1"
            color="neutral"
            variant="ghost"
            class="text-[var(--text-faint)] hover:text-red-400"
            @click="removeCandidate(index)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </UButton>
        </div>
        <UButton
          v-if="form.candidateCities.length < 3"
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-[var(--text-muted)] hover:text-[var(--accent)]"
          @click="addCandidate"
        >
          <template #leading>
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          </template>
          {{ $t('astroFortuneTune.addCandidate') }}
        </UButton>
      </div>
    </div>

    <!-- 出生时间不确定 -->
    <div class="flex items-center gap-2">
      <UCheckbox v-model="form.timeUncertain" :label="$t('astroFortuneTune.timeUncertain')" />
    </div>

    <!-- 保存到档案 -->
    <div v-if="selectedProfile" class="pt-1">
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
        {{ $t('astroFortuneTune.saveToProfile') }}
      </UButton>
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
      class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
      @click="handleSubmit"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      {{ $t('astroFortuneTune.submit') }}
    </UButton>
  </div>
</template>
