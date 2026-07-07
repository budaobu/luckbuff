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
      <div v-if="phase === 'result'" ref="resultRef">
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

        <!-- AI 流式输出 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('sancaiWuge.namingResult') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('sancaiWuge.naming') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <!-- 流式内容 -->
          <div v-if="aiContent" class="space-y-4">
            <div
              v-for="(card, index) in nameCards"
              :key="index"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <div class="ai-section-content" v-html="renderMarkdown(card)" />
              </div>
              <span
                v-if="aiStreaming && index === nameCards.length - 1 && !card.endsWith('</div>')"
                class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-4 align-middle animate-pulse mb-4"
              />
            </div>
            <!-- 打字光标 -->
            <span
              v-if="aiStreaming && (nameCards.length === 0 || aiContent.endsWith('\n'))"
              class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse"
            />
          </div>

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('sancaiWuge.generatingNames') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 重新起名 -->
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
              {{ $t('sancaiWuge.rename') }}
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
            {{ $t('sancaiWuge.copyResult') }}
          </UButton>
          <AppShareButton
            tool="sancai-wuge"
            :name="form.surname"
            :summary="`姓${form.surname} · ${form.gender === 'male' ? '男' : form.gender === 'female' ? '女' : ''}`"
            :share-target="resultRef"
            :filename="`sancai-wuge-${form.surname || 'name'}-${new Date().toISOString().slice(0, 10)}.png`"
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
import { marked } from 'marked'

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const resultRef = ref<HTMLDivElement>()
const form = reactive({
  surname: '',
  gender: 'male' as 'male' | 'female',
})

const toast = useToast()

const canSubmit = computed(() => {
  return form.surname.trim().length > 0
})

// AI 起名状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

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
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = data.message || t('sancaiWuge.aiUnavailable')
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
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
  form.surname = ''
  form.gender = 'male'
}

function handleCopy() {
  if (!aiContent.value) return
  const text = `${t('sancaiWuge.resultTitle')}\n\n${t('sancaiWuge.surnameLabel')}：${form.surname}\n${form.gender ? t('sancaiWuge.genderLabel') + '：' + (form.gender === 'male' ? t('common.male') : t('common.female')) + '\n' : ''}\n${aiContent.value}`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// 将 AI 内容按 "### 推荐名字" 分割为卡片
const nameCards = computed(() => {
  if (!aiContent.value) return []
  // 按 "### " 分割，保留每个名字区块
  const parts = aiContent.value.split(/(?=###\s)/)
  const result: string[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    result.push(trimmed)
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
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
.ai-section-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}
.ai-section-content :deep(p) {
  margin-bottom: 0.5em;
  line-height: 1.75;
  color: var(--text-body);
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
.ai-section-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 0.75rem 0;
}
</style>
