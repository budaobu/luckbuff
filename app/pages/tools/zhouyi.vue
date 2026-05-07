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
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Meihua Yishu</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            梅花易数
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            选择起卦方式，输入相关信息，AI 断卦解惑
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-white/8 bg-[#1a1612] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
          <div class="p-6">
            <ZhouyiForm @submit="handleSubmit" />
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <HexagramSpin size="full" label="蓍草卜卦中..." />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && guaResult">
          <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            推演结果
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            {{ queryText }}
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <ZhouyiResult
          ref="resultRef"
          :result="guaResult"
          :ai-stream="aiStreamState"
          @retry="startAiStream"
        />

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
import type { MeihuaResult, QiguaInput } from '~/types/zhouyi'
const { build: buildZhouyiAiPrompt } = useZhouyiPrompt()
import { getGuaById } from '~/utils/zhouyi/constants'

const phase = ref<'form' | 'animating' | 'result'>('form')
const guaResult = ref<MeihuaResult | null>(null)
const queryText = ref('')

const { calc } = useZhouyiCalc()
const aiStream = useAiStream()
const toast = useToast()

const aiStreamState = computed(() => ({
  content: aiStream.content.value,
  streaming: aiStream.streaming.value,
  started: aiStream.started.value,
  error: aiStream.error.value,
}))

const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const resultRef = ref<{ shareTarget?: HTMLDivElement }>()

function handleSubmit(input: QiguaInput) {
  queryText.value = input.query

  try {
    guaResult.value = calc(input)
    phase.value = 'animating'

    setTimeout(() => {
      phase.value = 'result'
      startAiStream()
    }, 1500)
  } catch (e) {
    toast.add({
      title: '起卦失败',
      description: e instanceof Error ? e.message : String(e),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!guaResult.value) return
  aiStream.reset()
  await nextTick()

  const { systemPrompt, userPrompt } = buildZhouyiAiPrompt(guaResult.value, queryText.value)
  await aiStream.startStream(userPrompt, systemPrompt, true)
}

function resetToForm() {
  phase.value = 'form'
  guaResult.value = null
  aiStream.reset()
}

async function handleShare() {
  if (!guaResult.value) return
  const { share } = useShare()

  const benGua = getGuaById(guaResult.value.benGuaId)

  try {
    const result = await share({
      tool: 'zhouyi',
      name: '',
      summary: `${benGua?.name}，${benGua?.meaning}`,
      shareTarget: resultRef.value?.shareTarget,
      filename: `zhouyi-${new Date().toISOString().slice(0, 10)}.png`,
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
  title: '梅花易数 - LuckBuff',
  description: '梅花易数起卦，AI 断语解答您的困惑',
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
