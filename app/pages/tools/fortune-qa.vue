<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- Form phase -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Fortune Q&A</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('fortuneQa.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('fortuneQa.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('fortuneQa.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('fortuneQa.questionLabel') }}</label>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('fortuneQa.questionPlaceholder')"
                class="w-full"
                :rows="3"
                :ui="inputUi"
              />
            </div>

            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fortuneQa.birthLabel') }}
                <span class="text-[11px] text-[var(--text-placeholder)] ml-1">{{ $t('fortuneQa.birthHint') }}</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <UInput
                  v-model="form.birthDate"
                  type="date"
                  class="w-full"
                  :ui="inputUi"
                />
                <USelect
                  v-model="form.birthHour"
                  :items="hourOptions"
                  :placeholder="$t('fortuneQa.hourPlaceholder')"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="form.question.trim().length < 4"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5" />
              </template>
              {{ $t('fortuneQa.submitBtn') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Interpreting phase -->
      <div v-if="phase === 'interpreting'" class="flex flex-col items-center justify-center min-h-[40vh]">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6 text-[var(--accent)] animate-pulse" />
          <span class="text-sm text-[var(--accent-muted)]">{{ $t('fortuneQa.interpreting') }}</span>
        </div>
        <div v-if="!aiStarted" class="text-xs text-[var(--text-placeholder)]">{{ $t('fortuneQa.connecting') }}</div>
      </div>

      <!-- Result phase -->
      <div v-if="phase === 'result' && aiContent">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
          <div class="mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <p class="text-xs text-[var(--text-placeholder)] mb-1">{{ $t('fortuneQa.yourQuestion') }}</p>
            <p class="text-sm text-[var(--text-primary)] font-medium">{{ form.question }}</p>
          </div>
          <div class="space-y-3">
            <div v-for="field in parsedFields" :key="field.key" class="flex items-start gap-3">
              <span class="text-xs font-medium text-[var(--accent)] min-w-[4.5rem] pt-0.5">{{ field.label }}</span>
              <p class="text-sm text-[var(--text-body)] leading-relaxed flex-1">{{ field.value }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-center gap-3">
          <UButton
            variant="outline"
            size="sm"
            icon="i-heroicons-bookmark"
            @click="saveReport"
          >
            {{ $t('myReports.saveBtn') }}
          </UButton>
          <UButton variant="outline" size="sm" @click="reset">
            {{ $t('fortuneQa.againBtn') }}
          </UButton>
        </div>
      </div>

      <!-- Error -->
      <div v-if="phase === 'result' && aiError" class="mt-8 text-center">
        <p class="text-sm text-red-400 mb-4">{{ aiError }}</p>
        <UButton variant="outline" size="sm" @click="reset">
          {{ $t('fortuneQa.againBtn') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const inputUi = {
  base: 'w-full bg-[var(--surface-input)] border-[var(--border-light)] focus:border-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}
const selectUi = {
  base: 'w-full bg-[var(--surface-input)] border-[var(--border-light)] focus:border-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

const phase = ref<'form' | 'interpreting' | 'result'>('form')
const form = reactive({
  question: '',
  birthDate: '',
  birthHour: '',
})
const aiContent = ref('')
const aiError = ref<string | null>(null)
const aiStarted = ref(false)
const { save } = useReports()

const hourOptions = computed(() => [
  { label: t('fortuneQa.hourUnknown'), value: '' },
  ...['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].map((d, i) => ({
    label: `${d}时`,
    value: d,
  })),
])

const fieldLabels: Record<string, Record<string, string>> = {
  'zh-CN': { OV: '直答', INSIGHT: '洞察', WORK: '事业', LOVE: '感情', ACTION: '行动', TIMING: '时机', NOTE: '提醒' },
  'zh-TW': { OV: '直答', INSIGHT: '洞察', WORK: '事業', LOVE: '感情', ACTION: '行動', TIMING: '時機', NOTE: '提醒' },
  en: { OV: 'Answer', INSIGHT: 'Insight', WORK: 'Career', LOVE: 'Love', ACTION: 'Action', TIMING: 'Timing', NOTE: 'Note' },
}

const parsedFields = computed(() => {
  const map: Record<string, string> = {}
  const labels = fieldLabels[locale.value] || fieldLabels['zh-CN']!
  for (const line of aiContent.value.split('\n').map(l => l.trim()).filter(Boolean)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (value && !map[key]) map[key] = value
  }
  return Object.entries(map).map(([key, value]) => ({
    key,
    label: labels[key] || key,
    value,
  }))
})

function handleSubmit() {
  if (form.question.trim().length < 4) return
  phase.value = 'interpreting'
  startAiStream()
}

function reset() {
  phase.value = 'form'
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false
}

function saveReport() {
  if (!aiContent.value) return
  const ov = parsedFields.value.find(f => f.key === 'OV')?.value
  save(
    t('fortuneQa.title'),
    '/tools/fortune-qa',
    ov || form.question.slice(0, 40),
    aiContent.value.slice(0, 200),
    {
      question: form.question,
      birthDate: form.birthDate || null,
      content: aiContent.value,
    },
  )
  toast.add({ title: t('myReports.saved'), color: 'success' })
}

async function startAiStream() {
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false

  try {
    const response = await fetch('/api/tools/fortune-qa/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: form.question.trim(),
        birthDate: form.birthDate || undefined,
        birthHour: form.birthHour || undefined,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          if (parsed.type === 'text' && parsed.text) {
            if (!aiStarted.value) {
              aiStarted.value = true
              phase.value = 'result'
            }
            aiContent.value += parsed.text
          }
          else if (parsed.type === 'error' && parsed.message) {
            aiError.value = parsed.message
            phase.value = 'result'
          }
        } catch {
          // non-JSON chunk: ignore
        }
      }
    }

    if (!aiStarted.value && !aiError.value) {
      aiError.value = t('fortuneQa.noResult')
      phase.value = 'result'
    }
  } catch (e: any) {
    aiError.value = e?.message || t('fortuneQa.requestFail')
    phase.value = 'result'
    toast.add({
      title: t('fortuneQa.requestFail'),
      description: aiError.value || undefined,
      color: 'error',
    })
  }
}

useSeoMeta({
  title: t('seo.fortuneQaTitle'),
  description: t('seo.fortuneQaDesc'),
  keywords: t('seo.fortuneQaKeywords'),
  ogTitle: t('seo.fortuneQaOgTitle'),
  ogDescription: t('seo.fortuneQaOgDesc'),
})
</script>
