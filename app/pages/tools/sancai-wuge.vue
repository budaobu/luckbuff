<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Sancai Wuge</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('sancaiWuge.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('sancaiWuge.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 姓氏 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('sancaiWuge.surnameLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.surname"
                :placeholder="$t('sancaiWuge.surnamePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('sancaiWuge.surnameHint') }}
              </p>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('sancaiWuge.genderLabel') }}
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'male'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4 inline mr-1.5" />
                  {{ $t('sancaiWuge.boy') }}
                </button>
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'female'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4 inline mr-1.5" />
                  {{ $t('sancaiWuge.girl') }}
                </button>
              </div>
            </div>

            <!-- 起名按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('sancaiWuge.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sancaiWuge.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sancaiWuge.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sancaiWuge.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sancaiWuge.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 三才五格说明卡片 -->
        <div class="mt-6 space-y-3">
          <!-- 什么是三才五格 -->
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('sancaiWuge.whatIsTitle') }}
            </h3>
            <p class="text-xs text-[var(--text-body)] leading-relaxed">
              {{ $t('sancaiWuge.whatIsDesc') }}
            </p>
          </div>

          <!-- 三才 -->
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('sancaiWuge.sancaiTitle') }}
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)]">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('sancaiWuge.tiancai') }}</p>
                <p class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.tiancaiLabel') }}</p>
                <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ $t('sancaiWuge.tiancaiDesc') }}</p>
              </div>
              <div class="text-center p-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)]">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('sancaiWuge.rencai') }}</p>
                <p class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.rencaiLabel') }}</p>
                <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ $t('sancaiWuge.rencaiDesc') }}</p>
              </div>
              <div class="text-center p-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)]">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('sancaiWuge.dicai') }}</p>
                <p class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sancaiWuge.dicaiLabel') }}</p>
                <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ $t('sancaiWuge.dicaiDesc') }}</p>
              </div>
            </div>
          </div>

          <!-- 五格 -->
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('sancaiWuge.wugeTitle') }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div
                v-for="grid in wugeGrids"
                :key="grid.key"
                class="text-center p-2.5 rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)]"
              >
                <p class="text-[10px] text-[var(--text-faint)]">{{ grid.label }}</p>
                <p class="text-xs font-medium text-[var(--text-primary)] mt-0.5">{{ grid.name }}</p>
                <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ grid.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('sancaiWuge.naming') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('sancaiWuge.resultTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ form.surname }}{{ form.gender ? ' · ' + (form.gender === 'male' ? $t('common.male') : $t('common.female')) : '' }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 错误提示 -->
        <div v-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-5">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-sm text-red-400">{{ aiError }}</p>
          </div>
        </div>

        <!-- 隐藏截图目标：720px 定宽竖版证书，供分享导出（AI 点评到齐后再启用） -->
        <div
          v-if="namingResult && !aiStreaming"
          ref="posterRef"
          v-show="false"
          class="sancai-wuge-share-target"
          aria-hidden="true"
        >
          <SancaiWugeCertPoster
            :top="namingResult.topName!"
            :others="namingResult.candidates.slice(1)"
            :surname="form.surname"
            :ai-content="aiContent"
          />
        </div>

        <!-- 可见证书海报：候选秒出，AI 点评流式融入 -->
        <SancaiWugeCertPoster
          v-if="namingResult"
          :top="namingResult.topName!"
          :others="namingResult.candidates.slice(1)"
          :surname="form.surname"
          :ai-content="aiContent"
        />

        <!-- 加载中（候选未至） -->
        <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
            </div>
            <p class="text-xs text-[var(--text-muted)]">{{ $t('sancaiWuge.generatingNames') }}</p>
          </div>
        </div>

        <!-- 重新起名 -->
        <div v-if="!aiStreaming && (namingResult || aiError)" class="flex justify-center mt-5">
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
            {{ $t('sancaiWuge.rename') }}
          </UButton>
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
            {{ $t('sancaiWuge.copyResult') }}
          </UButton>
          <AppShareButton
            tool="sancai-wuge"
            :name="namingResult?.topName?.fullName || form.surname"
            :summary="shareSummary"
            :share-target="posterRef"
            :disabled="aiStreaming || !namingResult"
            :filename="`sancai-wuge-${namingResult?.topName?.fullName || form.surname || 'name'}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('sancaiWuge.restart') }}
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
            {{ $t('sancaiWuge.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SancaiWugeNamingResult } from '~/types/sancai-wuge'

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const posterRef = ref<HTMLDivElement>()
const form = reactive({
  surname: '',
  gender: 'male' as 'male' | 'female',
})

const toast = useToast()

const canSubmit = computed(() => {
  return form.surname.trim().length > 0
})

// 候选结果（本地引擎，candidates 帧）与 AI 一句点评（text 帧）
const namingResult = ref<SancaiWugeNamingResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

// 分享摘要：主推姓名 + 等级 + 评分
const shareSummary = computed(() => {
  const top = namingResult.value?.topName
  if (!top) return `姓${form.surname}`
  return `${top.fullName} · ${top.grade} · ${top.score}分`
})

const wugeGrids = computed(() => [
  { key: 'tiange', label: t('sancaiWuge.wugeTiangeLabel'), name: t('sancaiWuge.tiange'), desc: t('sancaiWuge.tiangeShort') },
  { key: 'renge', label: t('sancaiWuge.wugeRengeLabel'), name: t('sancaiWuge.renge'), desc: t('sancaiWuge.rengeShort') },
  { key: 'dige', label: t('sancaiWuge.wugeDigeLabel'), name: t('sancaiWuge.dige'), desc: t('sancaiWuge.digeShort') },
  { key: 'waige', label: t('sancaiWuge.wugeWaigeLabel'), name: t('sancaiWuge.waige'), desc: t('sancaiWuge.waigeShort') },
  { key: 'zongge', label: t('sancaiWuge.wugeZonggeLabel'), name: t('sancaiWuge.zongge'), desc: t('sancaiWuge.zonggeShort') },
])

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  namingResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  // 短暂动画后进入结果页并开始流
  setTimeout(() => {
    phase.value = 'result'
    startAiStream()
  }, 600)
}

async function startAiStream() {
  namingResult.value = null
  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/sancai-wuge/naming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surname: form.surname.trim(),
        gender: form.gender,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      let msg = `HTTP ${response.status}`
      try {
        const j = JSON.parse(errText)
        msg = j?.statusMessage || j?.message || msg
      } catch { /* 保留默认 */ }
      throw new Error(msg)
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
          if (data.type === 'candidates' && data.result) {
            // 帧一：本地引擎结构化候选，秒渲染证书海报
            namingResult.value = data.result
          } else if (data.type === 'text' && data.text) {
            // 帧二：AI 一句点评，流式融入主推候选点评位
            aiContent.value += data.text
          } else if (data.type === 'error') {
            // AI 点评失败：保留候选，点评位回落到本地短评（海报不空白）
            aiError.value = null
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('sancaiWuge.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  namingResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
  form.surname = ''
  form.gender = 'male'
}

function handleCopy() {
  const r = namingResult.value
  if (!r?.topName) return
  const top = r.topName
  const gridLine = `${t('sancaiWuge.tiange')}${top.grids.tiange.value}(${top.grids.tiange.fortune}) ${t('sancaiWuge.renge')}${top.grids.renge.value}(${top.grids.renge.fortune}) ${t('sancaiWuge.dige')}${top.grids.dige.value}(${top.grids.dige.fortune}) ${t('sancaiWuge.waige')}${top.grids.waige.value}(${top.grids.waige.fortune}) ${t('sancaiWuge.zongge')}${top.grids.zongge.value}(${top.grids.zongge.fortune})`
  const othersLine = r.candidates.slice(1)
    .map(c => `${c.fullName}（${c.score}分 · ${c.grade}）${c.briefComment}`)
    .join('\n')
  const comment = aiContent.value || top.briefComment
  const text = `${t('sancaiWuge.resultTitle')}\n\n` +
    `${t('sancaiWuge.poster.nameFlag')}：${top.fullName}（${top.pinyin}）\n` +
    `${gridLine}\n` +
    `${t('sancaiWuge.poster.sancaiTitle')}：${top.sancai.combo}（${top.sancai.luck}）\n` +
    `${t('sancaiWuge.poster.scoreLabel')}：${top.score} · ${t('sancaiWuge.poster.gradeLabel')}：${top.grade} · ${t('sancaiWuge.poster.luckLabel')}：${top.overallLuck}\n` +
    `${comment}\n\n` +
    `${t('sancaiWuge.poster.othersTitle')}：\n${othersLine}`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.sancaiWugeTitle')} - ${siteName}`,
  description: t('seo.sancaiWugeDesc'),
  keywords: t('seo.sancaiWugeKeywords'),
  ogTitle: () => `${t('seo.sancaiWugeOgTitle')} - ${siteName}`,
  ogDescription: t('seo.sancaiWugeOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/sancai-wuge',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.sancaiWugeTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/sancai-wuge',
        description: t('seo.sancaiWugeDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('sancaiWuge.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/sancai-wuge',
          description: t('seo.sancaiWugeOgDesc'),
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
/* 分享截图目标：720px 定宽竖版证书，html-to-image 按此出图 */
.sancai-wuge-share-target {
  width: 720px;
}
</style>
