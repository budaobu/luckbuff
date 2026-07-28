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
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Wuge</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('wuge.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('wuge.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('wuge.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('wuge.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>
            <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
              <p class="text-sm text-[var(--text-faint)]">
                {{ $t('wuge.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('wuge.goSettings') }}</NuxtLink>{{ $t('wuge.createSuffix') }}
              </p>
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('wuge.nameLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.name"
                :placeholder="$t('wuge.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('wuge.nameHint') }}
              </p>
            </div>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuge.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuge.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuge.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuge.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuge.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuge.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuge.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuge.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 计算按钮 -->
        <UButton
          color="warning"
          size="lg"
          block
          :disabled="!canSubmit"
          class="mt-5 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
          @click="handleSubmit"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
          </template>
          {{ $t('wuge.submitBtn') }}
        </UButton>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('wuge.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult" class="max-w-none">
        <div ref="reportRef" class="wuge-report-share">
          <WugeReport
            :result="calcResult"
            :ai-content="aiContent"
            :streaming="aiStreaming"
            :error="aiError"
            @retry="startAiStream"
          />
        </div>

        <!-- 重新解读 -->
        <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-5">
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
            {{ $t('wuge.reinterpret') }}
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
            {{ $t('wuge.copyResult') }}
          </UButton>
          <AppShareButton
            tool="wuge"
            :name="calcResult.input"
            :summary="`${calcResult.surname}${calcResult.givenName} · 天格${calcResult.grids.tiange.value} · 人格${calcResult.grids.renge.value} · 地格${calcResult.grids.dige.value} · 总格${calcResult.grids.zongge.value}`"
            :share-target="reportRef"
            :filename="`wuge-${calcResult.input}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('wuge.recalculate') }}
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
            {{ $t('wuge.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'

interface WugeGrid {
  name: string
  value: number
  fortune: {
    fortune: string
    desc: string
  }
}

interface WugeCalcResult {
  input: string
  surname: string
  givenName: string
  chars: { char: string; strokes: number }[]
  grids: {
    tiange: WugeGrid
    renge: WugeGrid
    dige: WugeGrid
    waige: WugeGrid
    zongge: WugeGrid
  }
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  name: '',
})
const calcResult = ref<WugeCalcResult | null>(null)

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const localePath = useLocalePath()
const selectedProfileId = ref<string | null>(null)

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.name = profile.name || profile.label || ''
}

onMounted(() => {
  if (defaultProfile.value && !form.name) {
    selectProfile(defaultProfile.value)
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const reportRef = ref<HTMLDivElement>()

const toast = useToast()

const canSubmit = computed(() => {
  return form.name.trim().length >= 2
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<WugeCalcResult>('/api/tools/wuge/calc', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    // 延迟启动 AI 解读
    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('wuge.calcFail'),
      description: err.data?.message || err.message || t('wuge.checkInput'),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/wuge/reading', {
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
          } else if (data.type === 'error') {
            aiError.value = data.message || t('wuge.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('wuge.aiUnavailable')
  } finally {
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
  selectedProfileId.value = null
}

function handleCopy() {
  if (!calcResult.value) return
  const g = calcResult.value.grids
  const text = `${t('wuge.resultTitle')}

${t('wuge.nameLabel')}：${calcResult.value.input}

【${t('wuge.tiange')}】${g.tiange.value} — ${g.tiange.fortune.fortune}
【${t('wuge.renge')}】${g.renge.value} — ${g.renge.fortune.fortune}
【${t('wuge.dige')}】${g.dige.value} — ${g.dige.fortune.fortune}
【${t('wuge.waige')}】${g.waige.value} — ${g.waige.fortune.fortune}
【${t('wuge.zongge')}】${g.zongge.value} — ${g.zongge.fortune.fortune}

${aiContent.value ? '【' + t('wuge.interpretation') + '】\n' + aiContent.value : ''}
`
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
  title: () => `${t('seo.wugeTitle')} - ${siteName}`,
  description: t('seo.wugeDesc'),
  keywords: t('seo.wugeKeywords'),
  ogTitle: () => `${t('seo.wugeOgTitle')} - ${siteName}`,
  ogDescription: t('seo.wugeOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/wuge',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.wugeTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/wuge',
        description: t('seo.wugeDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('wuge.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/wuge',
          description: t('seo.wugeOgDesc'),
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
/* 结果阶段报告需要更宽版面，覆盖外层 max-w-2xl 限制 */
.wuge-report-share {
  width: min(100%, 960px);
  margin-left: 50%;
  transform: translateX(-50%);
}
@media (min-width: 1024px) {
  .wuge-report-share {
    width: min(92vw, 1100px);
  }
}
</style>
