<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('bztiBirthdayPersonality.formTag') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('bztiBirthdayPersonality.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bztiBirthdayPersonality.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('bztiBirthdayPersonality.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              :show-former-name="false"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bztiBirthdayPersonality.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bztiBirthdayPersonality.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bztiBirthdayPersonality.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bztiBirthdayPersonality.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bztiBirthdayPersonality.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bztiBirthdayPersonality.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bztiBirthdayPersonality.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bztiBirthdayPersonality.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-cake" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('bztiBirthdayPersonality.calculating') }}</p>
          <p class="text-xs text-[var(--text-faint)]">{{ $t('bztiBirthdayPersonality.calculatingHint') }}</p>
        </div>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('bztiBirthdayPersonality.resultLabel') }}</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ calcResult.profile.name ? $t('bztiBirthdayPersonality.resultTitleWithName', { name: calcResult.profile.name }) : $t('bztiBirthdayPersonality.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.riZhu }}{{ $t('baziPersonalityMap.riZhuSuffix') }} · {{ calcResult.riZhuStrength }} · {{ calcResult.geju }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 结果卡片（可截图） -->
          <div
            ref="shareCardRef"
            class="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
            :style="{ background: `linear-gradient(180deg, ${typeGradient[0]}22, ${typeGradient[1]}15), var(--surface-card)` }"
          >
            <div class="relative z-10">
              <div class="flex flex-col items-center text-center mb-6">
                <div class="text-7xl md:text-8xl mb-4">{{ calcResult.type.icon }}</div>
                <span
                  class="text-[11px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full mb-3 border"
                  :class="rarityBadgeClass(calcResult.rarity)"
                >
                  {{ $t(`bztiBirthdayPersonality.rarity${calcResult.rarity === 'rare' ? 'Rare' : 'Common'}`) }} · {{ $t('bztiBirthdayPersonality.estimatedPercent', { percent: calcResult.type.estimatedPercent }) }}
                </span>
                <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] font-serif mb-1">
                  {{ typeName }}
                </h2>
                <p class="font-mono text-sm text-[var(--text-muted)] tracking-widest uppercase">
                  {{ calcResult.type.code }}
                </p>
                <p class="text-sm text-[var(--accent)] mt-2">
                  {{ typeAlias }}
                </p>
              </div>

              <blockquote class="text-center mb-5">
                <p class="text-lg font-serif italic text-[var(--text-primary)]">“{{ typeSummary }}”</p>
              </blockquote>

              <div class="flex flex-wrap justify-center gap-2 mb-5">
                <span
                  v-for="tag in typeTags"
                  :key="tag"
                  class="text-xs px-2.5 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-4 mb-5">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">{{ $t('bztiBirthdayPersonality.wuxingTitle') }}</p>
                </div>
                <div class="space-y-2">
                  <div v-for="[wx, score] in sortedWuxing" :key="wx" class="flex items-center gap-2">
                    <span class="text-xs text-[var(--text-muted)] w-6">{{ wx }}</span>
                    <div class="flex-1 h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        :style="{ width: `${score}%`, background: wuxingColor(wx) }"
                      />
                    </div>
                    <span class="text-xs font-mono text-[var(--text-muted)] w-8 text-right">{{ score }}%</span>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-4">
                <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">{{ $t('bztiBirthdayPersonality.shiShenCountsTitle') }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="[shishen, count] in sortedShiShenCounts"
                    :key="shishen"
                    class="text-xs px-2.5 py-1 rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)]"
                  >
                    {{ shishen }}：{{ count }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- AI 解读 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('bztiBirthdayPersonality.interpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('bztiBirthdayPersonality.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div v-if="aiSections.length > 0" class="space-y-3">
              <div
                v-for="(section, index) in aiSections"
                :key="section.title"
                class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
                :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
              >
                <div class="relative z-10 p-4">
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    {{ section.title.replace(/^##\s*/, '') }}
                  </h4>
                  <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                  <span
                    v-if="aiStreaming && index === aiSections.length - 1"
                    class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                  />
                </div>
              </div>
            </div>

            <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
                </div>
                <p class="text-xs text-[var(--text-muted)]">{{ $t('bztiBirthdayPersonality.generatingInterpretation') }}</p>
              </div>
            </div>

            <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
                <p class="text-sm text-red-400">{{ aiError }}</p>
              </div>
            </div>

            <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
              <UButton
                color="warning"
                variant="soft"
                size="sm"
                class="group/btn"
                @click="startAiStream"
              >
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ $t('bztiBirthdayPersonality.reinterpret') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('bztiBirthdayPersonality.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bzti-birthday-personality"
            :name="calcResult.profile.name"
            :summary="shareSummary"
            :share-target="shareCardRef ?? undefined"
            :filename="`bzti-${calcResult.type.code}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('bztiBirthdayPersonality.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('bztiBirthdayPersonality.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { DiZhi } from '~/types/user'
import type { BztiBirthdayPersonalityCalcResult } from '~/data/bzti-birthday-personality'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  birthProvince: string
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const calcResult = ref<BztiBirthdayPersonalityCalcResult | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()
const shareCardRef = ref<HTMLDivElement | null>(null)

const store = useProfilesStore()

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/bzti-birthday-personality'

const effectiveLocale = computed(() => {
  const l = locale.value
  return l === 'zh-TW' ? 'zh-TW' : l === 'en' ? 'en' : 'zh-CN'
})

const typeName = computed(() => {
  if (!calcResult.value) return ''
  return calcResult.value.type.name[effectiveLocale.value] || calcResult.value.type.name['zh-CN']
})

const typeAlias = computed(() => {
  if (!calcResult.value) return ''
  return calcResult.value.type.alias[effectiveLocale.value] || calcResult.value.type.alias['zh-CN']
})

const typeSummary = computed(() => {
  if (!calcResult.value) return ''
  return calcResult.value.type.summary[effectiveLocale.value] || calcResult.value.type.summary['zh-CN']
})

const typeTags = computed(() => {
  if (!calcResult.value) return []
  return calcResult.value.type.tags[effectiveLocale.value] || calcResult.value.type.tags['zh-CN'] || []
})

const typeGradient = computed(() => {
  if (!calcResult.value) return ['#c9a227', '#8b5cf6'] as [string, string]
  return calcResult.value.type.gradient
})

const sortedWuxing = computed(() => {
  if (!calcResult.value) return []
  return Object.entries(calcResult.value.wuxingScore).sort((a, b) => b[1] - a[1])
})

const sortedShiShenCounts = computed(() => {
  if (!calcResult.value) return []
  return Object.entries(calcResult.value.shishenCounts).sort((a, b) => b[1] - a[1])
})

const shareSummary = computed(() => {
  if (!calcResult.value) return ''
  return `${typeName.value} · ${calcResult.value.type.code}`
})

function wuxingColor(wx: string): string {
  const map: Record<string, string> = {
    木: '#22c55e',
    火: '#ef4444',
    土: '#ca8a04',
    金: '#94a3b8',
    水: '#3b82f6',
  }
  return map[wx] || '#c9a227'
}

function rarityBadgeClass(rarity: string): string {
  return rarity === 'rare'
    ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'
    : 'bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
}

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<BztiBirthdayPersonalityCalcResult>('/api/tools/bzti-birthday-personality/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
        name: values.name || '',
        birthProvince: values.birthProvince || '',
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('baziPersonalityMap.calcFail'),
      description: err.data?.message || err.message || t('baziPersonalityMap.checkInput'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    birthProvince: values.birthProvince || undefined,
  })
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bzti-birthday-personality/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
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
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('bztiBirthdayPersonality.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('bztiBirthdayPersonality.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('bztiBirthdayPersonality.resultTitle')}

${calcResult.value.profile.name ? t('baziPersonalityMap.nameLabel') + '：' + calcResult.value.profile.name + '\n' : ''}${t('baziPersonalityMap.birthDateLabel')}：${calcResult.value.profile.birthDate}

【${t('bztiBirthdayPersonality.typeCodeLabel')}】
${calcResult.value.type.code} · ${typeName.value}
${typeAlias.value}
${typeSummary.value}

【${t('bztiBirthdayPersonality.shiShenCountsTitle')}】
${sortedShiShenCounts.value.map(([k, v]) => `${k}：${v}`).join('\n')}

${aiContent.value ? '【' + t('bztiBirthdayPersonality.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('bztiBirthdayPersonality.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

useSeoMeta({
  title: () => `${t('seo.bztiBirthdayPersonalityTitle')} - ${siteName}`,
  description: t('seo.bztiBirthdayPersonalityDesc'),
  keywords: t('seo.bztiBirthdayPersonalityKeywords'),
  ogTitle: () => `${t('seo.bztiBirthdayPersonalityOgTitle')} - ${siteName}`,
  ogDescription: t('seo.bztiBirthdayPersonalityOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.bztiBirthdayPersonalityTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.bztiBirthdayPersonalityDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('bztiBirthdayPersonality.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}${pagePath}`,
          description: t('seo.bztiBirthdayPersonalityOgDesc'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
