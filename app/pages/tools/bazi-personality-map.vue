<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Personality Map</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziPersonalityMap.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziPersonalityMap.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('baziPersonalityMap.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPersonalityMap.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPersonalityMap.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPersonalityMap.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPersonalityMap.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPersonalityMap.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPersonalityMap.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPersonalityMap.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPersonalityMap.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-chart-pie" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('baziPersonalityMap.calculating') }}</p>
        </div>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ calcResult.profile.name ? $t('baziPersonalityMap.resultTitleWithName', { name: calcResult.profile.name }) : $t('baziPersonalityMap.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.riZhu }}{{ $t('baziPersonalityMap.riZhuSuffix') }} · {{ calcResult.riZhuStrength }} · {{ calcResult.geju }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 人格原型卡片 -->
          <div class="rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('baziPersonalityMap.archetypeLabel') }}</p>
                <h2 class="text-lg font-bold text-[var(--accent)]">{{ calcResult.archetype.name }}</h2>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in calcResult.archetype.tags"
                :key="tag"
                class="text-xs px-2.5 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]"
              >
                {{ tag }}
              </span>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.archetype.summary }}</p>
          </div>

          <!-- 十神能量雷达图 -->
          <BaziPersonalityRadar :scores="calcResult.dimensions" class="mb-5" />

          <!-- 四柱简表 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziPersonalityMap.pillarsTitle') }}
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-[10px] text-[var(--text-faint)] border-b border-[var(--border-light)]">
                    <th class="text-left py-2 pr-2 font-medium">{{ $t('baziPersonalityMap.pillar') }}</th>
                    <th class="text-left py-2 px-2 font-medium">{{ $t('baziPersonalityMap.ganZhi') }}</th>
                    <th class="text-left py-2 px-2 font-medium">{{ $t('baziPersonalityMap.shiShen') }}</th>
                    <th class="text-left py-2 pl-2 font-medium">{{ $t('baziPersonalityMap.cangGan') }}</th>
                  </tr>
                </thead>
                <tbody class="text-[var(--text-body)]">
                  <tr
                    v-for="p in pillarRows"
                    :key="p.label"
                    class="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <td class="py-2 pr-2 text-[var(--text-muted)]">{{ p.label }}</td>
                    <td class="py-2 px-2">{{ p.gan }}{{ p.zhi }}</td>
                    <td class="py-2 px-2 text-[var(--accent-muted)]">{{ p.shishen }}</td>
                    <td class="py-2 pl-2 text-xs">
                      <span
                        v-for="(cg, idx) in p.canggan"
                        :key="idx"
                        class="inline-block mr-2"
                      >
                        {{ cg.gan }}（{{ cg.shishen }}）
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 十神计数 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-numbered-list" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziPersonalityMap.shiShenCountsTitle') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="[shishen, count] in sortedShiShenCounts"
                :key="shishen"
                class="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)]"
              >
                {{ shishen }}：{{ count }}
              </span>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5"
>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('baziPersonalityMap.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('baziPersonalityMap.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('baziPersonalityMap.generatingInterpretation') }}</p>
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
              {{ $t('baziPersonalityMap.reinterpret') }}
            </UButton>
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
            {{ $t('baziPersonalityMap.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bazi-personality-map"
            :name="calcResult.profile.name"
            :summary="shareSummary"
            :share-target="resultRef"
            :filename="`bazi-personality-${calcResult.profile.name || 'result'}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('baziPersonalityMap.recalculate') }}
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
            {{ $t('baziPersonalityMap.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { DiZhi } from '~/types/user'
import type { BaziPersonalityMapCalcResult } from '~/types/bazi-personality-map'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
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
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const calcResult = ref<BaziPersonalityMapCalcResult | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const store = useProfilesStore()

const pillarRows = computed(() => {
  if (!calcResult.value) return []
  const { pillars } = calcResult.value
  const labels = {
    year: t('baziPersonalityMap.yearPillar'),
    month: t('baziPersonalityMap.monthPillar'),
    day: t('baziPersonalityMap.dayPillar'),
    hour: t('baziPersonalityMap.hourPillar'),
  }
  const rows = [
    { label: labels.year, ...pillars.year },
    { label: labels.month, ...pillars.month },
    { label: labels.day, ...pillars.day },
  ]
  if (pillars.hour) {
    rows.push({ label: labels.hour, ...pillars.hour })
  }
  return rows
})

const sortedShiShenCounts = computed(() => {
  if (!calcResult.value) return []
  return Object.entries(calcResult.value.shishenCounts)
    .sort((a, b) => b[1] - a[1])
})

const shareSummary = computed(() => {
  if (!calcResult.value) return ''
  return `${calcResult.value.archetype.name} · ${calcResult.value.archetype.tags.join(' · ')}`
})

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
    const result = await $fetch<BaziPersonalityMapCalcResult>('/api/tools/bazi-personality-map/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
        name: values.name || '',
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
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
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
    const response = await fetch('/api/tools/bazi-personality-map/reading', {
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
            aiError.value = data.message || t('baziPersonalityMap.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('baziPersonalityMap.aiUnavailable')
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
  const text = `${t('baziPersonalityMap.resultTitle')}

${calcResult.value.profile.name ? t('baziPersonalityMap.nameLabel') + '：' + calcResult.value.profile.name + '\n' : ''}${t('baziPersonalityMap.birthDateLabel')}：${calcResult.value.profile.birthDate}

【${t('baziPersonalityMap.archetypeLabel')}】
${calcResult.value.archetype.name}
${calcResult.value.archetype.tags.join(' · ')}
${calcResult.value.archetype.summary}

【${t('baziPersonalityMap.shiShenCountsTitle')}】
${sortedShiShenCounts.value.map(([k, v]) => `${k}：${v}`).join('\n')}

${aiContent.value ? '【' + t('baziPersonalityMap.interpretation') + '】\n' + aiContent.value : ''}
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
      result.push({ title: titleLine || t('baziPersonalityMap.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziPersonalityMapTitle')} - ${siteName}`,
  description: t('seo.baziPersonalityMapDesc'),
  keywords: t('seo.baziPersonalityMapKeywords'),
  ogTitle: () => `${t('seo.baziPersonalityMapOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziPersonalityMapOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi-personality-map',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziPersonalityMapTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/bazi-personality-map',
        description: t('seo.baziPersonalityMapDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziPersonalityMap.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi-personality-map',
          description: t('seo.baziPersonalityMapOgDesc'),
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
