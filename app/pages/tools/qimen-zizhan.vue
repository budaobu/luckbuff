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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Qimen Zizhan</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('qimenZizhan.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('qimenZizhan.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('qimen.interpret.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 所测之字 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimenZizhan.form.char') }}</label>
              <UInput
                v-model="form.char"
                :placeholder="$t('qimenZizhan.form.charPlaceholder')"
                class="w-full"
                :ui="inputUi"
                maxlength="1"
              />
            </div>

            <!-- 所问之事 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('qimenZizhan.form.question') }}</label>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('qimenZizhan.form.questionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 起局时刻 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('qimenZizhan.form.time')"
              :hint="$t('qimenZizhan.form.timeHint')"
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
                <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
              </template>
              {{ $t('qimenZizhan.form.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenZizhan.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenZizhan.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimenZizhan.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('qimenZizhan.knowledgeCard2Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：排盘动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative flex items-center justify-center" style="width: 220px; height: 220px;">
          <div class="absolute rounded-full bg-[var(--accent-faint)]" style="width: 240px; height: 240px; filter: blur(24px);" />
          <div class="absolute rounded-full border border-dashed border-[var(--accent-faint)] zizhan-outer-ring" style="width: 220px; height: 220px;" />
          <div class="absolute rounded-full border border-[var(--accent-faint)] zizhan-inner-ring" style="width: 150px; height: 150px;" />
          <div
            class="absolute rounded-full flex items-center justify-center zizhan-center"
            style="width: 72px; height: 72px; border: 2px solid var(--accent-border); background: radial-gradient(circle at 35% 35%, rgba(201,162,39,0.25), rgba(139,92,246,0.1));"
          >
            <span class="text-2xl font-bold text-[var(--accent)] font-serif">{{ form.char || '字' }}</span>
          </div>
        </div>
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('qimenZizhan.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('qimenZizhan.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果（字占海报） ============ -->
      <div v-if="phase === 'result' && chart">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zizhan Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('qimenZizhan.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读完成后才挂载，保证分享图融合完整解读 -->
        <div v-if="resultStatus === 'done' && interpretContent" ref="posterRef" v-show="false" class="qimen-zizhan-share-target">
          <QimenZizhanPoster
            :chart="chart"
            :question="form.question"
            :ai-content="interpretContent"
          />
        </div>

        <!-- 页内展示：字占海报（AI 流式融入） -->
        <QimenZizhanPoster
          :chart="chart"
          :question="form.question"
          :ai-content="interpretContent"
        />

        <!-- 解读状态条 -->
        <div class="qimen-zizhan-ai-bar">
          <div v-if="resultStatus === 'loading' || resultStatus === 'streaming'" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('qimenZizhan.interpreting') }}</span>
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
            <p class="text-[11px] text-[var(--text-faint)]">{{ $t('qimen.interpret.disclaimer') }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startInterpretStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('qimenZizhan.reinterpret') }}
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
            tool="qimen-zizhan"
            :disabled="resultStatus !== 'done' || !interpretContent"
            :summary="`${chart.pan.yinYang === 'yang' ? '阳遁' : '阴遁'}${chart.pan.juShu}局 · 测字「${chart.char}」`"
            :share-target="posterRef || undefined"
            :filename="`qimen-zizhan-${chart.char}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo(localePath('/cezi')) }">
            <template #leading>
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
            </template>
            {{ $t('qimenZizhan.backToCezi') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QimenZizhanChart } from '~/types/qimen-zizhan'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const chart = ref<QimenZizhanChart | null>(null)
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

async function handleSubmit() {
  const char = form.char.trim()
  if (!/^[一-鿿豈-﫿]$/.test(char)) {
    toast.add({
      title: t('qimenZizhan.error.invalidChar'),
      color: 'warning',
    })
    return
  }

  phase.value = 'animating'
  chart.value = null
  interpretContent.value = ''
  interpretError.value = null
  resultStatus.value = 'idle'

  try {
    const result = await $fetch<QimenZizhanChart>('/api/tools/qimen-zizhan/chart', {
      method: 'POST',
      body: {
        char,
        questionTime: (timeCardRef.value?.iso as any)?.value || new Date().toISOString(),
      },
    })
    chart.value = result
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
  if (!chart.value) return
  interpretContent.value = ''
  resultStatus.value = 'loading'
  interpretError.value = null

  try {
    const response = await fetch('/api/tools/qimen-zizhan/interpret', {
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
    return `${t('seo.qimenZizhanDesc')} · 测字「${chart.value.char}」 ${chart.value.strokes}画`
  }
  return t('seo.qimenZizhanDesc')
})

const siteName = 'ososn'

const pageTitle = computed(() => t('seo.qimenZizhanTitle'))

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.qimenZizhanKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/qimen-zizhan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.qimenZizhanTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/qimen-zizhan',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('qimenZizhan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/qimen-zizhan',
          description: t('qimenZizhan.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.qimen-zizhan-share-target {
  width: 720px;
}
.qimen-zizhan-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
.zizhan-outer-ring {
  animation: zizhan-spin 20s linear infinite;
}
.zizhan-inner-ring {
  animation: zizhan-spin 14s linear infinite reverse;
}
.zizhan-center {
  animation: zizhan-pulse 2s ease-in-out infinite;
}
@keyframes zizhan-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes zizhan-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(201, 162, 39, 0.2), 0 0 40px rgba(201, 162, 39, 0.05); }
  50% { box-shadow: 0 0 30px rgba(201, 162, 39, 0.35), 0 0 60px rgba(201, 162, 39, 0.1); }
}
</style>
