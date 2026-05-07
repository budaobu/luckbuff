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
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Ziwei Doushu</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            紫微斗数
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            输入生辰，推演十二宫命盘
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-white/8 bg-[#1a1612] overflow-hidden">
          <!-- 顶部金色渐变线 -->
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
          <div class="p-6">
            <ZwdsForm
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
        <!-- 隐藏截图目标（综合分析 > 流年 > 当前年份的流年概览卡片） -->
        <div ref="shareTargetRef" v-show="false" class="p-6">
          <GlowCard title="流年概览">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="text-sm text-[#e8e0d0]/60">年柱</div>
                <div class="text-base font-bold text-[#f5e6c0]">{{ currentLiunianGanZhi }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-sm text-[#e8e0d0]/60">太岁入宫</div>
                <div class="text-sm text-[#f5e6c0]">{{ currentLiunianTaiSuiGong }}宫（{{ currentLiunianTaiSuiZhi }}）</div>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <span
                  v-for="s in currentLiunianSiHua"
                  :key="s.star + s.type"
                  class="text-xs px-2 py-1 rounded border"
                  :class="sihuaBadgeClass(s.type)"
                >
                  {{ s.star }}化{{ s.type }}
                </span>
              </div>
              <p class="text-xs text-[#e8e0d0]/50 leading-relaxed">{{ currentLiunianSummary }}</p>
              <div class="flex items-center gap-4 pt-2">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold border"
                  :class="ratingClass(currentLiunianRating)"
                >
                  {{ currentLiunianRating }}
                </div>
                <div class="flex-1">
                  <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">{{ ratingText(currentLiunianRating) }}</p>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>

        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            {{ formValues.name || '命盘' }}的紫微
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            命宫{{ chart.mingGong.zhi }}（{{ chart.mingGong.mainStars.join('、') || '借对宫' }}）| {{ chart.wuxingJu }}局
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
            <ZwdsAiInterpret
              :chart="chart"
              :content="aiContent"
              :streaming="aiStreaming"
              :started="aiStarted"
              :error="aiError"
              @retry="startAiStream"
            />
          </template>

          <template #pan>
            <ZwdsPan :chart="chart" :has-hour="!!formValues.birthHour" />
          </template>

          <template #analysis>
            <ZwdsAnalysis ref="analysisRef" :chart="chart" />
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
            @click="navigateTo('/tools')"
          >
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            工具首页
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
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-white/[0.08] bg-[#1a1612] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
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
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
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
              <div v-else class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[#e8e0d0]/20 mx-auto mb-2" />
                <p class="text-xs text-[#e8e0d0]/40">截图生成失败，请复制文案后手动截图</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
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
import type { ZwdsChart } from '~/types/zwds'
import type { DiZhi } from '~/types/user'
import { getLiunianAnalysis } from '~/utils/zwds/analysis'

const { build: buildZwdsAiPrompt } = useZwdsPrompt()
const aiStream = useAiStream()
// 提取独立 ref 用于模板 prop 绑定（Vue 3 对象属性在 prop 绑定中不会自动解包）
const aiContent = aiStream.content
const aiStreaming = aiStream.streaming
const aiStarted = aiStream.started
const aiError = aiStream.error

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  birthProvince: string
}

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const chart = ref<ZwdsChart | null>(null)

const analysisRef = ref<{ getSummary: () => string; liunianOverviewRef: HTMLElement | null } | null>(null)

// 当前年份流年数据（用于隐藏截图目标）
const currentYear = new Date().getFullYear()
const currentLiunian = computed(() => {
  if (!chart.value) return null
  return getLiunianAnalysis(chart.value, currentYear)
})
const currentLiunianGanZhi = computed(() => currentLiunian.value?.yearGanZhi ?? '')
const currentLiunianTaiSuiGong = computed(() => currentLiunian.value?.taiSuiGong ?? '')
const currentLiunianTaiSuiZhi = computed(() => currentLiunian.value?.taiSuiZhi ?? '')
const currentLiunianSiHua = computed(() => currentLiunian.value?.liuNianSiHua ?? [])
const currentLiunianSummary = computed(() => currentLiunian.value?.summary ?? '')
const currentLiunianRating = computed(() => currentLiunian.value?.rating ?? '平稳')

function sihuaBadgeClass(type: string): string {
  switch (type) {
    case '禄': return 'border-[#c9a227]/20 bg-[#c9a227]/10 text-[#c9a227]'
    case '权': return 'border-red-500/20 bg-red-500/10 text-red-400'
    case '科': return 'border-[#8b5cf6]/20 bg-[#8b5cf6]/10 text-[#8b5cf6]'
    case '忌': return 'border-gray-500/20 bg-gray-500/10 text-gray-400'
    default: return 'border-white/10 bg-white/5 text-[#e8e0d0]'
  }
}

function ratingClass(rating: string): string {
  switch (rating) {
    case '顺遂': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    case '平稳': return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    case '留意': return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    case '谨慎': return 'border-red-500/30 bg-red-500/10 text-red-400'
    default: return 'border-white/10 bg-white/5 text-[#e8e0d0]'
  }
}

function ratingText(rating: string): string {
  switch (rating) {
    case '顺遂': return '整体运势向好，适合主动推进计划，把握机会。'
    case '平稳': return '运势平稳，无大起大落，按部就班即可。'
    case '留意': return '部分领域有波动信号，保持警觉，遇事先观察。'
    case '谨慎': return '多宫受冲，宜守不宜攻，重大决策建议延后或多方求证。'
    default: return '运势一般，平常心对待。'
  }
}

const tabItems = [
  { label: 'AI 解读', slot: 'ai' },
  { label: '排盘计算', slot: 'pan' },
  { label: '综合分析', slot: 'analysis' },
]

const store = useProfilesStore()
const { calc } = useZwdsCalc()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number)

  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'

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
    birthProvince: values.birthProvince || undefined,
  })
}

async function startAiStream() {
  if (!chart.value) return

  aiStream.reset()

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

  const { systemPrompt, userPrompt } = buildZwdsAiPrompt(chart.value, profile, summary)

  // 使用 useAiStream 的 startStream（流式模式）
  await aiStream.startStream(userPrompt, systemPrompt, true)
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiStream.reset()
}

// 回访流程：URL 带 ?profile=id 时自动加载档案并排盘
onMounted(() => {
  const profileId = route.query.profile as string | undefined
  if (profileId) {
    const profile = store.list.find(p => p.id === profileId)
    if (profile && profile.gender && profile.birthDate) {
      const values: FormValues = {
        gender: profile.gender,
        birthDate: profile.birthDate,
        birthHour: profile.birthHour,
        name: profile.name || '',
        birthProvince: profile.birthProvince || '',
      }
      lastFormValues.value = { ...values }
      handleSubmit(values)
      // 清除 query 参数，避免刷新重复提交
      router.replace({ query: {} })
    }
  }
})

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  try {
    const result = await share({
      tool: 'zwds',
      name: formValues.value.name,
      summary: `命宫${chart.value.mingGong.zhi}（${chart.value.mingGong.mainStars.join('、') || '借对宫'}），${chart.value.wuxingJu}局`,
      shareTarget: shareTargetRef.value,
      filename: `zwds-${formValues.value.name || '命盘'}-${new Date().toISOString().slice(0, 10)}.png`,
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
  title: '紫微斗数 - LuckBuff',
  description: '输入生辰，AI 解读您的紫微斗数命盘',
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
