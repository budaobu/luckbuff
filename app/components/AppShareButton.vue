<script setup lang="ts">
import type { ShareOptions } from '~/composables/useShare'

interface Props {
  tool: ShareOptions['tool']
  name?: string
  summary?: string
  shareTarget?: HTMLElement
  filename: string
  disabled?: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()
const toast = useToast()

const shareDialogOpen = ref(false)
const generating = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)

async function handleShare() {
  if (props.disabled || generating.value) return
  const { share } = useShare()

  // 截图期间 useShare 会把隐藏的分享目标临时钉进视口渲染（fixed+top:0），
  // 约 1-3 秒。盖一层全屏遮罩挡住这层闪现，同时给用户「生成中」的明确反馈。
  generating.value = true
  // 关键：等遮罩真正渲染上屏后才开始 share()。否则 html-to-image 模块若已缓存，
  // useShare 可能在遮罩还没进 DOM 的那一帧就把报告 pin 进视口，造成一闪。
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  try {
    const result = await share({
      tool: props.tool,
      name: props.name,
      summary: props.summary,
      shareTarget: props.shareTarget,
      filename: props.filename,
      t,
    })

    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  } finally {
    generating.value = false
  }
}

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: t('share.downloadSuccess'), color: 'success' })
}

// ── 分享到 X（两层实现）──────────────────────────────────────────────
// 增强层：支持文件分享的设备用 Web Share API（navigator.share + files），
//         把 useShare 生成的截图作为附件一并分享。
// 基础层：x.com/intent/post?text=…&url=…，交给系统 universal link
//         决定跳 X app 还是浏览器（不做 UA 检测）。全程无需 X 开发者账号。
const sharingToX = ref(false)

/** X 正文上限 280（按字符近似，已编码前）。截断文案，留 1 字符缓冲。 */
const X_TEXT_LIMIT = 280

/** 从 useShare 的 copyText 提炼 X 文案：去掉内嵌的「👉 url」行（url 走独立参数）。 */
function buildXText(copyText: string, url: string): string {
  let text = copyText
    .split('\n')
    .map(line => line.trim())
    // 移除以 👉 开头且包含当前 url 的行（url 单独作为参数传）
    .filter(line => !(line.startsWith('👉') && line.includes(url)))
    .join('\n')
    .trim()
  if (text.length > X_TEXT_LIMIT - 1) {
    text = `${text.slice(0, X_TEXT_LIMIT - 2)}…`
  }
  return text
}

function buildXIntentUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}

/** 把截图 dataURL 转成 File；失败返回 null。 */
function screenshotToFile(dataUrl: string | null, filename: string): File | null {
  if (!dataUrl) return null
  try {
    const [head, body] = dataUrl.split(',')
    const mime = /data:(.*?)(;|$)/.exec(head ?? '')?.[1] || 'image/png'
    const binary = atob(body ?? '')
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const name = /\.(png|jpe?g|webp)$/i.test(filename) ? filename : `${filename}.png`
    return new File([bytes], name, { type: mime })
  } catch {
    return null
  }
}

async function shareToX() {
  if (!shareData.value || sharingToX.value) return
  sharingToX.value = true
  const url = window.location.href
  const text = buildXText(shareData.value.copyText, url)

  try {
    // 增强层：尝试原生文件分享
    const file = screenshotToFile(shareData.value.screenshotDataUrl, shareData.value.filename)
    const canNativeShareFiles = !!file
      && typeof navigator !== 'undefined'
      && typeof navigator.share === 'function'
      && typeof navigator.canShare === 'function'
      && navigator.canShare({ files: [file] })

    if (canNativeShareFiles && file) {
      try {
        await navigator.share({ files: [file], text, url })
        return // 原生分享成功，结束
      } catch (e: any) {
        // 用户取消（AbortError）不视为失败，也不回退打开新标签页
        if (e?.name === 'AbortError') {
          toast.add({ title: t('share.nativeShareCancelled'), color: 'neutral' })
          return
        }
        // 其他错误（NotAllowedError/TypeError 等）→ 落到基础层
      }
    }

    // 基础层：Web Intent 新标签页
    window.open(buildXIntentUrl(text, url), '_blank', 'noopener,noreferrer')
    toast.add({ title: t('share.shareToXOpening'), color: 'success' })
  } catch (e: any) {
    toast.add({
      title: t('share.shareToXFailed'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  } finally {
    sharingToX.value = false
  }
}
</script>

<template>
  <div>
    <UButton
      color="warning"
      variant="soft"
      class="group/btn"
      :disabled="disabled"
      @click="handleShare"
    >
      <template #leading>
        <UIcon name="i-heroicons-share" class="w-4 h-4" />
      </template>
      {{ $t('common.shareResult') }}
    </UButton>

    <!-- 全屏遮罩由 useShare 在截图期间统一创建（data-share-veil），
         这里不再重复盖，避免双层遮罩。generating 仅用于按钮防重复点击。 -->

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="() => { shareDialogOpen = false }"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.copyText') }}
                </UButton>
              </div>
              <!-- 分享到 X：原生文件分享（增强层）→ x.com/intent/post（基础层） -->
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3">
                <UButton
                  color="neutral"
                  variant="solid"
                  size="sm"
                  block
                  class="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  :loading="sharingToX"
                  :disabled="!shareData"
                  @click="shareToX"
                >
                  <template #leading>
                    <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </template>
                  {{ $t('share.shareToX') }}
                </UButton>
                <p class="text-[10px] text-[var(--text-faint)] mt-2 leading-relaxed">{{ $t('share.xShareHint') }}</p>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

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
