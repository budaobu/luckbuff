<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            四柱八字
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            输入生辰，推演命盘
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-white/8 bg-[#1a1612] overflow-hidden">
          <!-- 顶部金色渐变线 -->
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" label="天机推演中..." />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && chart">
        <!-- 隐藏截图目标：运势五维分析卡片（首选） -->
        <div ref="shareTargetRef" v-show="false" class="p-6">
          <FortuneRadar
            :scores="aiResult?.dimensionScores ?? { 感情运: 70, 事业运: 70, 财运: 70, 健康运: 70, 学业运: 70 }"
          />
        </div>

        <!-- 隐藏截图目标：五行力量分布（备选，AI 不可用时使用） -->
        <div ref="shareTargetBackupRef" v-show="false" class="p-6">
          <WuxingAnalysis
            :wuxing-score="chart.wuxingScore"
            :analysis-text="analysisRef?.getSummary?.() ?? ''"
          />
        </div>
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            {{ formValues.name || '命盘' }}的八字
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            日主{{ chart.riZhu }}（{{ chart.riZhuStrength }}）| {{ chart.geju }}
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <UTabs
          :items="tabItems"
          :ui="{
            list: 'bg-[#1a1612] rounded-xl p-1 border border-white/[0.08] gap-1',
            trigger: 'text-[#e8e0d0]/50 data-[active]:text-[#f5e6c0] data-[active]:bg-[#c9a227]/15 data-[active]:font-medium px-4 py-2 text-sm rounded-lg transition-all hover:text-[#e8e0d0]/80',
            indicator: 'bg-transparent',
            content: 'pt-5',
          }"
        >
          <template #ai>
            <BaziAiInterpret
              :chart="chart"
              :ai-stream="aiStreamState"
              :ai-result="aiResult"
              @retry="startAiStream"
            />
          </template>

          <template #pan>
            <BaziPan :chart="chart" />
          </template>

          <template #analysis>
            <BaziAnalysis ref="analysisRef" :chart="chart" />
          </template>
        </UTabs>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetToForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            重新推演
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            一键分享
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[#e8e0d0]/50 hover:text-[#e8e0d0]/80 hover:bg-white/5"
            @click="navigateTo('/')"
          >
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            回到首页
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <!-- 遮罩 -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <!-- 弹窗卡片 -->
          <div class="relative rounded-2xl border border-white/[0.08] bg-[#1a1612] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <!-- 顶部渐变线 -->
            <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
            <!-- 标题 -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[#f5e6c0]">分享结果</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[#e8e0d0]/40 hover:text-[#e8e0d0]/80 hover:bg-white/5"
                @click="shareDialogOpen = false"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>

            <!-- 内容区 -->
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <!-- 文案 -->
              <div>
                <p class="text-[11px] text-[#e8e0d0]/40 mb-1.5 tracking-wide">分享文案</p>
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-sm text-[#e8e0d0]/80 leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  复制文案
                </UButton>
              </div>

              <!-- 截图预览 -->
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[#e8e0d0]/40 mb-1.5 tracking-wide">分享截图</p>
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" alt="分享截图" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  下载图片
                </UButton>
              </div>

              <!-- 截图失败提示 -->
              <div v-else class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[#e8e0d0]/20 mx-auto mb-2" />
                <p class="text-xs text-[#e8e0d0]/40">截图生成失败，请复制文案后手动截图</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>

            <!-- 底部 -->
            <div class="px-5 py-3 border-t border-white/[0.06] text-center">
              <p class="text-[10px] text-[#e8e0d0]/30">由 LuckBuff 生成 · 仅供娱乐参考</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart, BaziAiResult } from '~/types/bazi'
import type { DiZhi } from '~/types/user'
const { build: buildBaziAiPrompt } = useBaziPrompt()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

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
const chart = ref<BaziChart | null>(null)
const aiResult = ref<BaziAiResult | null>(null)

const analysisRef = ref<{ getSummary: () => string } | null>(null)

const tabItems = [
  { label: 'AI 解读', slot: 'ai' },
  { label: '排盘计算', slot: 'pan' },
  { label: '综合分析', slot: 'analysis' },
]

const store = useProfilesStore()
const { calc } = useBaziCalc()
const toast = useToast()

const aiLoading = ref(false)
const aiError = ref<string | null>(null)

const aiStreamState = computed(() => ({
  content: '',
  streaming: aiLoading.value,
  started: !aiLoading.value && !!aiResult.value,
  error: aiError.value,
}))

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()
const shareTargetBackupRef = ref<HTMLElement>()

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number)

  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'

  // 最少播放 1.5 秒动画
  setTimeout(() => {
    phase.value = 'result'
    startAiStream()
  }, 1500)
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
  if (!chart.value) return

  aiLoading.value = true
  aiError.value = null
  aiResult.value = null

  await nextTick()

  const summary = analysisRef.value?.getSummary() ?? ''
  const profile = {
    id: 'temp',
    label: '临时',
    name: formValues.value.name,
    gender: formValues.value.gender,
    birthDate: formValues.value.birthDate,
    birthHour: formValues.value.birthHour,
  }

  const { systemPrompt, userPrompt } = buildBaziAiPrompt(chart.value, profile, summary)

  try {
    const res = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, systemPrompt }),
    })

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`
      try {
        const errData = await res.json()
        errMsg = errData.message || errData.statusMessage || JSON.stringify(errData)
      } catch { /* ignore */ }
      throw new Error(errMsg)
    }

    const data = await res.json()
    // OpenAI 兼容格式：choices[0].message.content
    const aiContent = data.choices?.[0]?.message?.content || data.content || ''

    const parsed = extractJsonFromText(aiContent)
    if (parsed) {
      aiResult.value = {
        overview: parsed.overview ?? '',
        personality: parsed.personality ?? { summary: '', detail: '', tags: [] },
        career: parsed.career ?? { summary: '', detail: '', tags: [], wealthTrend: '' },
        relationship: parsed.relationship ?? { summary: '', detail: '', tags: [], timing: '' },
        health: parsed.health ?? { summary: '', detail: '', tags: [], seasons: '' },
        dimensionScores: parsed.dimensionScores ?? {},
        dayunScores: parsed.dayunScores ?? [],
        historicalPredictions: parsed.historicalPredictions ?? [],
        comprehensiveAdvice: parsed.comprehensiveAdvice ?? [],
      }
    } else {
      aiError.value = 'AI 返回格式异常，请重试'
    }
  } catch (e) {
    aiError.value = e instanceof Error ? e.message : 'AI 请求失败'
  } finally {
    aiLoading.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiResult.value = null
  aiLoading.value = false
  aiError.value = null
}

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  // AI 解读有结果且有 dimensionScores 时用首选目标，否则用备选（五行力量分布）
  const hasAiScores = !!aiResult.value?.dimensionScores
  const target = hasAiScores ? shareTargetRef.value : shareTargetBackupRef.value

  try {
    const result = await share({
      tool: 'bazi',
      name: formValues.value.name,
      summary: `日主${chart.value.riZhu}（${chart.value.riZhuStrength}），${chart.value.geju}`,
      shareTarget: target,
      filename: `bazi-${formValues.value.name || '命盘'}-${new Date().toISOString().slice(0, 10)}.png`,
    })

    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: '分享失败',
      description: e?.message || '请重试',
      color: 'error',
    })
  }
}

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: '文案已复制', color: 'success' })
  }).catch(() => {
    toast.add({ title: '复制失败，请手动复制', color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: '图片已开始下载', color: 'success' })
}

useSeoMeta({
  title: '四柱八字 - LuckBuff',
  description: '输入生辰，AI 解读您的四柱命盘',
})
</script>
