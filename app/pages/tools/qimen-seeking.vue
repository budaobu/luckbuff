<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Qimen Seeking</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('qimenSeeking.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('qimenSeeking.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('qimen.interpret.disclaimer') }}
          </p>
        </div>

        <!-- 寻物表单 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('qimen.form.time')"
              :hint="$t('qimen.form.timeHintSeeking')"
              required
            />

            <!-- 具体描述 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">{{ $t('qimenSeeking.form.description') }}</label>
                <QuestionInspiration
                  :extra-categories="seekingExtraCategories"
                  @select="q => form.description = q"
                />
              </div>
              <UTextarea
                v-model="form.description"
                :placeholder="$t('qimenSeeking.form.descriptionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 最后见到时间 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.lastSeenTime') }}</label>
              <UInput
                v-model="form.lastSeenTime"
                :placeholder="$t('qimen.form.lastSeenTimePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.lastSeenPlace') }}</label>
              <UInput
                v-model="form.lastSeenPlace"
                :placeholder="$t('qimen.form.lastSeenPlacePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 失物描述 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimenSeeking.form.lostItemDesc') }}</label>
              <UInput
                v-model="form.lostItemDesc"
                :placeholder="$t('qimenSeeking.form.lostItemDescPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 与失物关系 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimen.form.relationship') }}</label>
              <UInput
                v-model="form.relationship"
                :placeholder="$t('qimen.form.relationshipPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-radar" class="w-5 h-5" />
              </template>
              {{ $t('qimenSeeking.form.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenSeeking.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenSeeking.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenSeeking.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenSeeking.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenSeeking.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenSeeking.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenSeeking.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenSeeking.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 寻物指南 -->
        <div class="mt-10">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenSeeking.tipsTitle') }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(tip, idx) in tips"
              :key="idx"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]/30"
            >
              <div class="flex items-start gap-3">
                <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
                <div>
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
                  <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：雷达探测动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative flex items-center justify-center" style="width: 260px; height: 260px;">
          <!-- 背景光晕 -->
          <div class="absolute rounded-full bg-[var(--accent-faint)]" style="width: 300px; height: 300px; filter: blur(24px);" />

          <!-- 最外层虚线环 -->
          <div class="absolute rounded-full border border-dashed border-[var(--accent-faint)] outer-dashed-ring" style="width: 260px; height: 260px;" />

          <!-- 外层实线环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] outer-solid-ring" style="width: 240px; height: 240px;" />

          <!-- 雷达扫描扇形 -->
          <div class="absolute rounded-full overflow-hidden" style="width: 200px; height: 200px; border: 1px solid var(--accent-border);">
            <div class="radar-sweep" />
          </div>

          <!-- 内圈细环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] inner-ring" style="width: 100px; height: 100px;" />

          <!-- 中心定位点 -->
          <div
            class="absolute rounded-full flex items-center justify-center center-pulse"
            style="width: 48px; height: 48px; border: 2px solid var(--accent-border); background: radial-gradient(circle at 35% 35%, rgba(201,162,39,0.25), rgba(139,92,246,0.1));"
          >
            <UIcon name="i-heroicons-radar" class="w-5 h-5 text-[var(--accent)]" />
          </div>

          <!-- 九宫方位标记 -->
          <div
            v-for="(dir, i) in directions"
            :key="dir"
            class="absolute text-[10px] text-[var(--accent-muted)] radar-dot"
            :style="{
              left: `calc(50% + ${Math.cos((i * 45 - 90) * Math.PI / 180) * 50}% - 8px)`,
              top: `calc(50% + ${Math.sin((i * 45 - 90) * Math.PI / 180) * 50}% - 6px)`,
            }"
          >
            {{ dir }}
          </div>
        </div>
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('qimenSeeking.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('qimenSeeking.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && pan" ref="resultRef">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Seeking Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('qimenSeeking.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 遁局信息 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-body)]">
            <span class="font-semibold text-[var(--text-primary)]">
              {{ pan.yinYang === 'yang' ? '阳遁' : '阴遁' }}{{ pan.juShu }}局
            </span>
            <span class="text-[var(--text-faint)]">|</span>
            <span>日：{{ pan.riGanzhi }}</span>
            <span class="text-[var(--text-faint)]">|</span>
            <span>时：{{ pan.shiGanzhi }}</span>
            <span class="text-[var(--text-faint)]">|</span>
            <span>节气：{{ pan.jieqi }}</span>
          </div>
        </div>

        <!-- 寻物信息摘要 -->
        <div v-if="formSummary" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-4">
          <div class="text-sm text-[var(--text-body)] space-y-1">
            <div v-if="formSummary.description"><span class="text-[var(--text-faint)]">问事：</span>{{ formSummary.description }}</div>
            <div v-if="formSummary.lastSeenTime"><span class="text-[var(--text-faint)]">最后见到：</span>{{ formSummary.lastSeenTime }}</div>
            <div v-if="formSummary.lastSeenPlace"><span class="text-[var(--text-faint)]">最后地点：</span>{{ formSummary.lastSeenPlace }}</div>
            <div v-if="formSummary.lostItemDesc"><span class="text-[var(--text-faint)]">失物：</span>{{ formSummary.lostItemDesc }}</div>
            <div v-if="formSummary.relationship"><span class="text-[var(--text-faint)]">关系：</span>{{ formSummary.relationship }}</div>
          </div>
        </div>

        <!-- 九宫格盘面 -->
        <QimenPan
          :palaces="pan.palaces"
          :zhifu-gong="pan.zhiFuGong"
          :zhishi-gong="pan.zhiShiGong"
        />

        <!-- AI 寻物解读 -->
        <QimenResultCard
          :status="resultStatus"
          :content="interpretContent"
          :error="interpretError"
          :metadata="resultMetadata"
          @retry="startInterpretStream"
        />

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <AppShareButton
            tool="qimen-seeking"
            :summary="`${pan.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.juShu}局 · ${pan.jieqi}${formSummary?.lostItemDesc ? ' · 失物：' + formSummary.lostItemDesc : ''}`"
            :share-target="resultRef"
            :filename="`qimen-seeking-${pan.riGanzhi}-${pan.shiGanzhi}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo(localePath('/seeking')) }">
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            </template>
            {{ $t('qimenSeeking.backToSeeking') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QimenPan as QimenPanType } from '~~/server/utils/qimen/types'
import type { QimenResultStatus } from '~/components/qimen/QimenResultCard.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const pan = ref<QimenPanType | null>(null)
const lastPayload = ref<any>(null)
const resultRef = ref<HTMLDivElement>()

const resultStatus = ref<QimenResultStatus>('idle')
const interpretContent = ref('')
const interpretError = ref<string | null>(null)

const form = reactive({
  description: '',
  lastSeenTime: '',
  lastSeenPlace: '',
  lostItemDesc: '',
  relationship: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const formSummary = computed(() => {
  if (phase.value !== 'result') return null
  const s: Record<string, string> = {}
  if (form.description) s.description = form.description
  if (form.lastSeenTime) s.lastSeenTime = form.lastSeenTime
  if (form.lastSeenPlace) s.lastSeenPlace = form.lastSeenPlace
  if (form.lostItemDesc) s.lostItemDesc = form.lostItemDesc
  if (form.relationship) s.relationship = form.relationship
  return Object.keys(s).length > 0 ? s : null
})

const resultMetadata = computed(() => {
  if (!pan.value) return null
  return {
    juShu: pan.value.juShu,
    yinYang: pan.value.yinYang,
    riGanzhi: pan.value.riGanzhi,
    shiGanzhi: pan.value.shiGanzhi,
    jieqi: pan.value.jieqi,
  }
})

const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const tips = computed(() => [
  { icon: '🧭', title: t('qimenSeeking.tips.direction.title'), content: t('qimenSeeking.tips.direction.content') },
  { icon: '🔍', title: t('qimenSeeking.tips.search.title'), content: t('qimenSeeking.tips.search.content') },
  { icon: '⏰', title: t('qimenSeeking.tips.timing.title'), content: t('qimenSeeking.tips.timing.content') },
  { icon: '📍', title: t('qimenSeeking.tips.location.title'), content: t('qimenSeeking.tips.location.content') },
])

const seekingExtraCategories = [
  {
    key: 'seeking',
    groups: [
      {
        key: 'seekingDirection',
        questions: ['seekingDirection1', 'seekingDirection2', 'seekingDirection3', 'seekingDirection4', 'seekingDirection5', 'seekingDirection6'],
      },
      {
        key: 'seekingProbability',
        questions: ['seekingProbability1', 'seekingProbability2', 'seekingProbability3', 'seekingProbability4', 'seekingProbability5', 'seekingProbability6'],
      },
    ],
  },
]

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

async function handleSubmit() {
  phase.value = 'animating'
  pan.value = null
  interpretContent.value = ''
  interpretError.value = null
  resultStatus.value = 'idle'

  const payload = {
    eventType: 'seeking' as const,
    description: form.description || undefined,
    extra: {
      lastSeenTime: form.lastSeenTime || undefined,
      lastSeenPlace: form.lastSeenPlace || undefined,
      targetDesc: form.lostItemDesc || undefined,
      relationship: form.relationship || undefined,
    },
    questionTime: (timeCardRef.value?.iso as any).value || new Date().toISOString(),
  }

  lastPayload.value = payload

  try {
    const result = await $fetch<QimenPanType>('/api/tools/qimen/generate', {
      method: 'POST',
      body: payload,
    })
    pan.value = result
    phase.value = 'result'
    setTimeout(() => startInterpretStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('qimen.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('qimen.error.unknown'),
      color: 'error',
    })
  }
}

async function startInterpretStream() {
  if (!pan.value || !lastPayload.value) return
  interpretContent.value = ''
  resultStatus.value = 'loading'
  interpretError.value = null

  try {
    const response = await fetch('/api/tools/qimen-seeking/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pan: pan.value,
        eventType: 'seeking',
        description: lastPayload.value.description,
        extra: lastPayload.value.extra,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    resultStatus.value = 'streaming'

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
            interpretContent.value += data.text
          } else if (data.type === 'error') {
            interpretError.value = data.message || t('qimen.error.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }

    if (interpretError.value) {
      resultStatus.value = 'error'
    } else {
      resultStatus.value = 'done'
    }
  } catch (e: any) {
    interpretError.value = e?.message || t('qimen.error.aiUnavailable')
    resultStatus.value = 'error'
  }
}

function resetForm() {
  phase.value = 'form'
  pan.value = null
  interpretContent.value = ''
  interpretError.value = null
  resultStatus.value = 'idle'
  form.description = ''
  form.lastSeenTime = ''
  form.lastSeenPlace = ''
  form.lostItemDesc = ''
  form.relationship = ''
}

// SEO
const pageDescription = computed(() => {
  if (phase.value === 'result' && pan.value) {
    return `${pan.value.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.value.juShu}局 · ${pan.value.riGanzhi}日 ${pan.value.shiGanzhi}时 · ${form.lostItemDesc || '寻物占卜'}`
  }
  return t('seo.qimenSeekingDesc')
})

const siteName = 'ososn'

const pageTitle = computed(() => {
  if (phase.value === 'result' && pan.value) {
    return `${t('seo.qimenSeekingTitle')} · ${pan.value.yinYang === 'yang' ? '阳遁' : '阴遁'}${pan.value.juShu}局`
  }
  return t('seo.qimenSeekingTitle')
})

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.qimenSeekingKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/qimen-seeking',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.qimenSeekingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/qimen-seeking',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('qimenSeeking.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/qimen-seeking',
          description: t('qimenSeeking.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.outer-dashed-ring {
  animation: spin-dashed 24s linear infinite;
}
.outer-solid-ring {
  animation: spin-solid 16s linear infinite reverse;
}
.inner-ring {
  animation: spin-inner 20s linear infinite;
}
.center-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(201, 162, 39, 0.15) 60deg, rgba(201, 162, 39, 0.35) 90deg, transparent 120deg);
  transform-origin: 0 0;
  animation: radar-sweep 2s linear infinite;
  border-radius: 0 100% 0 0;
}
.radar-dot {
  animation: radar-dot-pulse 2s ease-in-out infinite;
}
@keyframes spin-dashed {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-solid {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-inner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(201, 162, 39, 0.2), 0 0 40px rgba(201, 162, 39, 0.05); }
  50% { box-shadow: 0 0 30px rgba(201, 162, 39, 0.35), 0 0 60px rgba(201, 162, 39, 0.1); }
}
@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes radar-dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
