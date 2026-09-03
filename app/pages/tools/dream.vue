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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zhou Gong Dream</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('dream.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('dream.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('dream.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('dream.formLabel') }}</label>
              <UTextarea
                v-model="form.dream"
                :placeholder="$t('dream.formPlaceholder')"
                class="w-full"
                :rows="5"
                :ui="inputUi"
              />
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="form.dream.trim().length < 2"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-moon" class="w-5 h-5" />
              </template>
              {{ $t('dream.submitBtn') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Interpreting phase -->
      <div v-if="phase === 'interpreting'" class="flex flex-col items-center justify-center min-h-[40vh]">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-moon" class="w-6 h-6 text-[var(--accent)] animate-pulse" />
          <span class="text-sm text-[var(--accent-muted)]">{{ $t('dream.interpreting') }}</span>
        </div>
        <div v-if="!aiStarted" class="text-xs text-[var(--text-placeholder)]">{{ $t('dream.connecting') }}</div>
      </div>

      <!-- Result phase -->
      <div v-if="phase === 'result' && aiContent">
        <DreamPoster
          :dream="form.dream"
          :content="aiContent"
        />

        <div class="mt-6 flex justify-center gap-3">
          <UButton
            variant="outline"
            size="sm"
            icon="i-heroicons-bookmark"
            @click="saveReport"
          >
            {{ $t('myReports.saveBtn') }}
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            @click="reset"
          >
            {{ $t('dream.againBtn') }}
          </UButton>
        </div>
      </div>

      <!-- Error -->
      <div v-if="phase === 'result' && aiError" class="mt-8 text-center">
        <p class="text-sm text-red-400 mb-4">{{ aiError }}</p>
        <UButton variant="outline" size="sm" @click="reset">
          {{ $t('dream.againBtn') }}
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

const phase = ref<'form' | 'interpreting' | 'result'>('form')
const form = reactive({ dream: '' })
const aiContent = ref('')
const aiError = ref<string | null>(null)
const aiStarted = ref(false)
const { save } = useReports()

function handleSubmit() {
  if (form.dream.trim().length < 2) return
  phase.value = 'interpreting'
  startAiStream()
}

function reset() {
  phase.value = 'form'
  form.dream = ''
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false
}

function saveReport() {
  if (!aiContent.value) return
  const { OV } = parseAiContent(aiContent.value)
  save(
    t('dream.title'),
    '/tools/dream',
    OV || t('dream.title'),
    aiContent.value.slice(0, 200),
    { dream: form.dream, content: aiContent.value },
  )
  toast.add({ title: t('myReports.saved'), color: 'success' })
}

function parseAiContent(content: string) {
  const map: Record<string, string> = {}
  for (const line of content.split('\n').map(l => l.trim()).filter(Boolean)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (value && !map[key]) map[key] = value
  }
  return map
}

async function startAiStream() {
  aiContent.value = ''
  aiError.value = null
  aiStarted.value = false

  try {
    const response = await fetch('/api/tools/dream/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dream: form.dream.trim(),
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
      aiError.value = t('dream.noResult')
      phase.value = 'result'
    }
  } catch (e: any) {
    aiError.value = e?.message || t('dream.requestFail')
    phase.value = 'result'
    toast.add({
      title: t('dream.requestFail'),
      description: aiError.value || undefined,
      color: 'error',
    })
  }
}

useSeoMeta({
  title: t('seo.dreamTitle'),
  description: t('seo.dreamDesc'),
  keywords: t('seo.dreamKeywords'),
  ogTitle: t('seo.dreamOgTitle'),
  ogDescription: t('seo.dreamOgDesc'),
})
</script>
