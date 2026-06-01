import { toCanvas } from 'html-to-image'

export interface ShareOptions {
  tool: 'bazi' | 'zhouyi' | 'liuyao' | 'zwds' | 'vedic' | 'huangdao' | 'liuyao-divination' | 'qimen'
  name?: string
  summary?: string
  /** 直接传入 DOM 元素（推荐，不受 tab 切换影响） */
  shareTarget?: HTMLElement
  /** CSS 选择器（兼容旧用法，但如果目标在隐藏 tab 中会找不到） */
  shareTargetSelector?: string
  filename: string
  /** i18n 的 t 函数，必须从组件 setup 中传入 */
  t: (key: string, ...args: unknown[]) => string
}

export interface ShareResult {
  copyText: string
  screenshotDataUrl: string | null
  filename: string
  screenshotError: string | null
}

export function useShare() {
  async function share(options: ShareOptions): Promise<ShareResult> {
    const { t, tool, name, summary, shareTarget, shareTargetSelector, filename } = options

    const toolNameMap: Record<string, string> = { bazi: '八字', zhouyi: '卦象', zwds: '紫微', liuyao: '六爻', vedic: '吠陀占星', qimen: '奇门遁甲', huangdao: '黄道吉日' }
    const toolName = toolNameMap[tool] ?? '命理'

    const hookLines: Record<string, string> = {
      bazi: summary
        ? t('share.hookBazi', { summary })
        : t('share.hookBaziDefault'),
      zhouyi: summary
        ? t('share.hookZhouyi', { summary })
        : t('share.hookZhouyiDefault'),
      zwds: summary
        ? t('share.hookZwds', { summary })
        : t('share.hookZwdsDefault'),
      liuyao: summary
        ? t('share.hookLiuyao', { summary })
        : t('share.hookLiuyaoDefault'),
      vedic: summary
        ? t('share.hookVedic', { summary })
        : t('share.hookVedicDefault'),
      qimen: summary
        ? t('share.hookQimen', { summary })
        : t('share.hookQimenDefault'),
      huangdao: summary
        ? t('share.hookHuangdao', { summary })
        : t('share.hookHuangdaoDefault'),
    }
    const hook = hookLines[tool] ?? t('share.hookGeneric', { tool: toolName })
    const url = window.location.href
    const suffix = tool === 'liuyao'
      ? t('share.suffixLiuyao')
      : tool === 'vedic'
        ? t('share.suffixVedic')
        : t('share.suffix', { name: name || t('common.unknown'), tool: toolName })
    const copyText = `${hook}\n\n👉 ${url}\n${suffix}`

    // 生成分享图
    const el = shareTarget ?? (shareTargetSelector ? document.querySelector(shareTargetSelector) as HTMLElement | null : null)
    let screenshotDataUrl: string | null = null
    let screenshotError: string | null = null

    if (el) {
      const hiddenChain: { el: HTMLElement; display: string; visibility: string; position: string }[] = []
      const originalFilters: { el: HTMLElement; filter: string }[] = []

      try {
        // 1. 保存元素及其所有父节点的原始 display/visibility 值
        // html-to-image 无法对 display:none 的元素截图
        let cur: HTMLElement | null = el
        while (cur) {
          const computed = window.getComputedStyle(cur)
          if (computed.display === 'none' || computed.visibility === 'hidden') {
            hiddenChain.push({
              el: cur,
              display: cur.style.display,
              visibility: cur.style.visibility,
              position: cur.style.position,
            })
            cur.style.display = 'block'
            cur.style.visibility = 'visible'
            if (computed.position === 'fixed') {
              cur.style.position = 'absolute'
            }
          }
          cur = cur.parentElement
        }

        // 2. 临时关闭 backdrop-blur 等 html-to-image 不支持的 CSS
        const blurEls = el.querySelectorAll('[class*="backdrop-blur"]')
        blurEls.forEach((blurEl) => {
          const htmlEl = blurEl as HTMLElement
          originalFilters.push({ el: htmlEl, filter: htmlEl.style.filter })
          htmlEl.style.filter = 'none'
        })

        // 等待 canvas（Chart.js 等）完全渲染后再截图
        // 1. 先等一帧让浏览器完成布局
        await new Promise(resolve => requestAnimationFrame(resolve))
        // 2. 触发 resize 让 Chart.js 重新计算 canvas 尺寸（从隐藏状态显示后尺寸可能不对）
        window.dispatchEvent(new Event('resize'))
        // 3. 再等一帧确保 resize 生效
        await new Promise(resolve => requestAnimationFrame(resolve))
        // 4. 等待 Chart.js 默认动画完成（1000ms）
        await new Promise(resolve => setTimeout(resolve, 1200))

        const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--surface-page').trim()
          || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#0a0a0f' : '#f5f0e8')
        const canvas = await toCanvas(el, {
          backgroundColor: bgColor || '#0a0a0f',
          pixelRatio: 2,
          cacheBust: true,
        })

        // 3. 添加水印
        const ctx = canvas.getContext('2d')!
        ctx.font = `${24 * 2}px sans-serif`
        ctx.fillStyle = 'rgba(201,162,39,0.35)'
        ctx.textAlign = 'right'
        ctx.fillText('ososn', canvas.width - 32, canvas.height - 32)

        screenshotDataUrl = canvas.toDataURL('image/png')
      } catch (e: any) {
        screenshotError = e?.message || String(e)
      } finally {
        // 无论成功失败，都必须恢复原始样式，否则 v-show="false" 的隐藏元素会永久可见
        hiddenChain.forEach(({ el, display, visibility, position }) => {
          el.style.display = display
          el.style.visibility = visibility
          el.style.position = position
        })
        originalFilters.forEach(({ el, filter }) => {
          el.style.filter = filter
        })
      }
    } else {
      screenshotError = t('share.screenshotError')
    }

    return { copyText, screenshotDataUrl, filename, screenshotError }
  }

  return { share }
}
