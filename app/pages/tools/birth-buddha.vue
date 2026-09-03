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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Birth Buddha</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('birthBuddha.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('birthBuddha.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('birthBuddha.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('birthBuddha.yearLabel') }}</label>
              <USelectMenu
                v-model="form.year"
                :items="yearOptions"
                :placeholder="$t('birthBuddha.yearPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <div v-if="selectedZodiac" class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)]/30 p-4 text-center">
              <p class="text-sm text-[var(--accent-muted)]">{{ $t('birthBuddha.zodiacLabel') }}</p>
              <p class="text-xl font-bold text-[var(--accent)] mt-1 font-serif">{{ selectedZodiac.name }}</p>
              <p class="text-sm text-[var(--text-muted)] mt-2">{{ selectedZodiac.buddha }}</p>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!form.year"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('birthBuddha.submitBtn') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Interpreting phase -->
      <div v-if="phase === 'interpreting'" class="flex flex-col items-center justify-center min-h-[40vh]">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-[var(--accent)] animate-pulse" />
          <span class="text-sm text-[var(--accent-muted)]">{{ $t('birthBuddha.interpreting') }}</span>
        </div>
        <div v-if="!aiStarted" class="text-xs text-[var(--text-placeholder)]">{{ $t('birthBuddha.connecting') }}</div>
      </div>

      <!-- Result phase -->
      <div v-if="phase === 'result' && aiContent">
        <BirthBuddhaPoster
          :year="form.year!"
          :zodiac="selectedZodiac!"
          :content="aiContent"
        />

        <div class="mt-6 flex justify-center gap-3">
          <UButton
            variant="outline"
            size="sm"
            @click="reset"
          >
            {{ $t('birthBuddha.againBtn') }}
          </UButton>
        </div>
      </div>

      <!-- Error -->
      <div v-if="phase === 'result' && aiError" class="mt-8 text-center">
        <p class="text-sm text-red-400 mb-4">{{ aiError }}</p>
        <UButton variant="outline" size="sm" @click="reset">
          {{ $t('birthBuddha.againBtn') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const selectUi = {
  base: 'w-full bg-[var(--surface-input)] border-[var(--border-light)] focus:border-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

const phase = ref<'form' | 'interpreting' | 'result'>('form')
const form = reactive<{ year?: number }>({ year: undefined })
const aiContent = ref('')
const aiError = ref<string | null>(null)
const aiStarted = ref(false)

// Traditional zodiac-to-Buddha mapping (本命佛)
const zodiacBuddhaMap = [
  { key: 'rat', buddha: '千手观音菩萨' },
  { key: 'ox', buddha: '虚空藏菩萨' },
  { key: 'tiger', buddha: '虚空藏菩萨' },
  { key: 'rabbit', buddha: '文殊菩萨' },
  { key: 'dragon', buddha: '普贤菩萨' },
  { key: 'snake', buddha: '普贤菩萨' },
  { key: 'horse', buddha: '大势至菩萨' },
  { key: 'goat', buddha: '大日如来' },
  { key: 'monkey', buddha: '大日如来' },
  { key: 'rooster', buddha: '不动尊菩萨' },
  { key: 'dog', buddha: '阿弥陀佛' },
  { key: 'pig', buddha: '阿弥陀佛' },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 90 }, (_, i) => currentYear - i)

const selectedZodiac = computed(() => {
  if (!form.year) return null
  const idx = (((form.year - 4) % 12) + 12) % 12
  const entry = zodiacBuddhaMap[idx]
  if (!entry) return null
  return {
    ...entry,
    name: t(`birthBuddha.zodiac.${entry.key}`),
  }
})

function handleSubmit() {
  if (!form.year || !selectedZodiac.value) return
  phase.value = 'interpreting'
  startAiStream()
}

function reset() {
  phase.value = 'form'
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false
}

async function startAiStream() {
  if (!selectedZodiac.value) return
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false

  try {
    const response = await fetch('/api/tools/birth-buddha/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zodiac: selectedZodiac.value.name,
        buddha: selectedZodiac.value.buddha,
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
      aiError.value = t('birthBuddha.noResult')
      phase.value = 'result'
    }
  } catch (e: any) {
    aiError.value = e?.message || t('birthBuddha.requestFail')
    phase.value = 'result'
    toast.add({
      title: t('birthBuddha.requestFail'),
      description: aiError.value || undefined,
      color: 'error',
    })
  }
}

useSeoMeta({
  title: t('seo.birthBuddhaTitle'),
  description: t('seo.birthBuddhaDesc'),
  keywords: t('seo.birthBuddhaKeywords'),
  ogTitle: t('seo.birthBuddhaOgTitle'),
  ogDescription: t('seo.birthBuddhaOgDesc'),
})
</script>
