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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liuren Zizhan</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liurenZizhan.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liurenZizhan.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('xiaoLiuren.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 所测之字 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenZizhan.form.char') }}</label>
              <UInput
                v-model="form.char"
                :placeholder="$t('liurenZizhan.form.charPlaceholder')"
                class="w-full"
                :ui="inputUi"
                maxlength="1"
              />
            </div>

            <!-- 所问之事 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenZizhan.form.question') }}</label>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('liurenZizhan.form.questionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 起课时刻 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('liurenZizhan.form.time')"
              :hint="$t('liurenZizhan.form.timeHint')"
              required
            />

            <UButton
              color="warning"
              size="lg"
              block
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
              </template>
              {{ $t('liurenZizhan.form.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenZizhan.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenZizhan.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenZizhan.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenZizhan.knowledgeCard2Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：掐指一算动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <XiaoLiurenHand :active-index="thumbStep" />
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('liurenZizhan.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('liurenZizhan.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果（字占海报） ============ -->
      <div v-if="phase === 'result' && chart">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zizhan Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liurenZizhan.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读完成后才挂载，保证分享图融合完整解读 -->
        <div v-if="resultStatus === 'done' && interpretContent" ref="posterRef" v-show="false" class="liuren-zizhan-share-target">
          <LiurenZizhanPoster
            :chart="chart"
            :question="form.question"
            :ai-content="interpretContent"
          />
        </div>

        <!-- 页内展示：字占海报（AI 流式融入） -->
        <LiurenZizhanPoster
          :chart="chart"
          :question="form.question"
          :ai-content="interpretContent"
        />

        <!-- 解读状态条 -->
        <div class="liuren-zizhan-ai-bar">
          <div v-if="resultStatus === 'loading' || resultStatus === 'streaming'" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('liurenZizhan.interpreting') }}</span>
          </div>
          <div v-else-if="resultStatus === 'error'" class="flex items-center justify-center gap-2 py-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-xs text-red-400">{{ interpretError }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startInterpretStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('common.retry') }}
            </UButton>
          </div>
          <div v-else-if="interpretContent" class="flex items-center justify-center gap-4 py-1">
            <p class="text-[11px] text-[var(--text-faint)]">{{ $t('xiaoLiuren.disclaimer') }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startInterpretStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('liurenZizhan.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <AppShareButton
            tool="liuren-zizhan"
            :disabled="resultStatus !== 'done' || !interpretContent"
            :summary="`${chart.finalPosition.name} · 测字「${chart.char}」`"
            :share-target="posterRef || undefined"
            :filename="`liuren-zizhan-${chart.char}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo(localePath('/cezi')) }">
            <template #leading>
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
            </template>
            {{ $t('liurenZizhan.backToCezi') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiurenZizhanChart } from '~/types/liuren-zizhan'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const chart = ref<LiurenZizhanChart | null>(null)
const posterRef = ref<HTMLDivElement | null>(null)

const resultStatus = ref<'idle' | 'loading' | 'streaming' | 'done' | 'error'>('idle')
const interpretContent = ref('')
const interpretError = ref<string | null>(null)

const form = reactive({
  char: '',
  question: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// 动画：大拇指在六宫之间移动
const thumbStep = ref(0)
let thumbTimer: ReturnType<typeof setInterval> | null = null

function startThumbAnimation() {
  thumbStep.value = 0
  if (thumbTimer) clearInterval(thumbTimer)
  thumbTimer = setInterval(() => {
    thumbStep.value = (thumbStep.value + 1) % 6
  }, 600)
}

function stopThumbAnimation() {
  if (thumbTimer) {
    clearInterval(thumbTimer)
    thumbTimer = null
  }
}

onBeforeUnmount(() => {
  stopThumbAnimation()
})

async function handleSubmit() {
  const char = form.char.trim()
  if (!/^[一-鿿豈-﫿]$/.test(char)) {
    toast.add({
      title: t('liurenZizhan.error.invalidChar'),
      color: 'warning',
    })
    return
  }

  phase.value = 'animating'
  chart.value = null
  interpretContent.value = ''
  interpretError.value = null
  resultStatus.value = 'idle'
  startThumbAnimation()

  try {
    const result = await $fetch<LiurenZizhanChart>('/api/tools/liuren-zizhan/chart', {
      method: 'POST',
      body: {
        char,
        questionTime: (timeCardRef.value?.iso as any)?.value || new Date().toISOString(),
      },
    })
    chart.value = result
    setTimeout(() => {
      stopThumbAnimation()
      phase.value = 'result'
      setTimeout(() => startInterpretStream(), 300)
    }, 2400)
  } catch (err: any) {
    stopThumbAnimation()
    phase.value = 'form'
    toast.add({
      title: t('xiaoLiuren.calcFail'),
      description: err.data?.statusMessage || err.message || t('xiaoLiuren.checkInput'),
      color: 'error',
    })
  }
}

async function startInterpretStream() {
  if (!chart.value) return
  interpretContent.value = ''
  resultStatus.value = 'loading'
  interpretError.value = null

  try {
    const response = await fetch('/api/tools/liuren-zizhan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chart.value,
        question: form.question || undefined,
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
            interpretError.value = data.message || t('xiaoLiuren.aiUnavailable')
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
    interpretError.value = e?.message || t('xiaoLiuren.aiUnavailable')
    resultStatus.value = 'error'
  }
}

function resetForm() {
  phase.value = 'form'
  chart.value = null
  interpretContent.value = ''
  interpretError.value = null
  resultStatus.value = 'idle'
  form.char = ''
  form.question = ''
}

// SEO
const pageDescription = computed(() => {
  if (phase.value === 'result' && chart.value) {
    return `${t('seo.liurenZizhanDesc')} · 测字「${chart.value.char}」 ${chart.value.strokes}画 · ${chart.value.finalPosition.name}`
  }
  return t('seo.liurenZizhanDesc')
})

const siteName = 'ososn'

const pageTitle = computed(() => t('seo.liurenZizhanTitle'))

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liurenZizhanKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuren-zizhan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liurenZizhanTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuren-zizhan',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('liurenZizhan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuren-zizhan',
          description: t('liurenZizhan.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.liuren-zizhan-share-target {
  width: 720px;
}
.liuren-zizhan-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
</style>
