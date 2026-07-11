export interface ShareOptions {
  tool:
    | 'bazi'
    | 'zhouyi'
    | 'liuyao'
    | 'zwds'
    | 'vedic'
    | 'huangdao'
    | 'liuyao-divination'
    | 'qimen'
    | 'liuren'
    | 'liuren-seeking'
    | 'liuyao-seeking'
    | 'bazi-ziwei'
    | 'fengshui'
    | 'guanyin-lot'
    | 'wealth-god-lot'
    | 'bazi-hunpan'
    | 'bazi-naming'
    | 'bazi-wealth'
    | 'sancai-wuge'
    | 'cezi-yishu'
    | 'liuyao-cezi'
    | 'jiaobei'
    | 'qimen-seeking'
    | 'numerology'
    | 'zhuge-cezi'
    | 'xiao-liuren'
    | 'tarot'
    | 'ziwei-hunpan'
    | 'wuge'
    | 'cezi-zhouyi'
    | '3shanwang-lot'
    | 'jinkoujue'
    | 'xiao-liuren-seeking'
    | 'mazu-lot'
    | 'chenggu'
    | 'cezi-battle'
    | 'lenormand'
    | 'xuankong-fengshui'
    | 'jinri-yunshi'
    | 'jishi'
    | 'wuxing-chuanyi'
    | 'chong-shengxiao'
    | 'shengxiao-piancaiyun'
    | 'bazi-personality-map'
    | 'name-score'
    | 'shengxiao-peidui'
    | 'parent-child-bazi'
    | 'marriage-xiangxing'
    | 'parenting-style'
    | 'child-activity-interest'
    | 'sbti'
    | 'qizheng-siyu'
    | 'ziwei-shiye-hepan'
    | 'ziwei-zhichang-hepan'
    | 'bazi-shiye-hepan'
    | 'bazi-poxi-hepan'
    | 'vedic-hepan'
    | 'vedic-hepan-career'
    | 'bzti-birthday-personality'
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
    const { toCanvas } = await import('html-to-image')
    const { t, tool, name, summary, shareTarget, shareTargetSelector, filename } = options

    const toolNameMap: Record<string, string> = {
      bazi: '八字',
      zhouyi: '卦象',
      zwds: '紫微',
      liuyao: '六爻',
      vedic: '吠陀占星',
      qimen: '奇门遁甲',
      huangdao: '黄道吉日',
      liuren: '大六壬',
      'bazi-ziwei': '八字紫微综合',
      fengshui: '风水',
      'guanyin-lot': '观音灵签',
      'wealth-god-lot': '五路财神签',
      'bazi-hunpan': '八字合盘',
      'bazi-naming': '八字起名',
      'bazi-wealth': '八字算财富',
      'sancai-wuge': '三才五格起名',
      'cezi-yishu': '测字（易数）',
      'liuyao-cezi': '六爻测字',
      jiaobei: '掷筊杯',
      'qimen-seeking': '奇门遁甲寻物',
      numerology: '姓名灵数',
      'zhuge-cezi': '诸葛神数测字',
      'xiao-liuren': '小六壬',
      tarot: '塔罗牌',
      'ziwei-hunpan': '紫微斗数合盘',
      wuge: '五格剖象法',
      'cezi-zhouyi': '周易测字',
      '3shanwang-lot': '三山国王灵签',
      jinkoujue: '金口诀',
      'xiao-liuren-seeking': '小六壬寻物',
      'mazu-lot': '妈祖灵签',
      chenggu: '称骨算命',
      'cezi-battle': '测字战斗',
      lenormand: '雷诺曼',
      'xuankong-fengshui': '玄空风水',
      'jinri-yunshi': '今日运势',
      jishi: '今日吉时',
      'wuxing-chuanyi': '五行穿衣指南',
      'chong-shengxiao': '今日冲生肖',
      'shengxiao-piancaiyun': '生肖偏财运',
      'bazi-personality-map': '八字人格图谱',
      'name-score': '姓名测试打分',
      'shengxiao-peidui': '生肖配对',
      'parent-child-bazi': '亲子八字合盘',
      'marriage-xiangxing': '婚姻相性测试',
      'parenting-style': '家庭教育风格测试',
      'child-activity-interest': '孩子活动兴趣测试',
      sbti: 'SBTI 沙雕人格测试',
      'qizheng-siyu': '七政四余',
      'ziwei-shiye-hepan': '紫微事业合盘',
      'ziwei-zhichang-hepan': '职场紫微合盘',
      'bazi-shiye-hepan': '事业八字合盘',
      'bazi-poxi-hepan': '婆媳八字合盘',
      'vedic-hepan': '星盘合婚',
      'vedic-hepan-career': '星盘事业合盘',
      'bzti-birthday-personality': 'BZTI 生日人格测试',
    }
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
      'bazi-ziwei': summary
        ? t('share.hookBaziZiwei', { summary })
        : t('share.hookBaziZiweiDefault'),
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
      liuren: summary
        ? t('share.hookLiuren', { summary })
        : t('share.hookLiurenDefault'),
      fengshui: summary
        ? t('share.hookFengshui', { summary })
        : t('share.hookFengshuiDefault'),
      'guanyin-lot': summary
        ? t('share.hookGuanyinLot', { summary })
        : t('share.hookGuanyinLotDefault'),
      'wealth-god-lot': summary
        ? t('share.hookWealthGodLot', { summary })
        : t('share.hookWealthGodLotDefault'),
      'bazi-hunpan': summary
        ? t('share.hookBaziHunpan', { summary })
        : t('share.hookBaziHunpanDefault'),
      'bazi-naming': summary
        ? t('share.hookBaziNaming', { summary })
        : t('share.hookBaziNamingDefault'),
      'bazi-wealth': summary
        ? t('share.hookBaziWealth', { summary })
        : t('share.hookBaziWealthDefault'),
      'sancai-wuge': summary
        ? t('share.hookSancaiWuge', { summary })
        : t('share.hookSancaiWugeDefault'),
      'cezi-yishu': summary
        ? t('share.hookCeziYishu', { summary })
        : t('share.hookCeziYishuDefault'),
      'liuyao-cezi': summary
        ? t('share.hookLiuyaoCezi', { summary })
        : t('share.hookLiuyaoCeziDefault'),
      jiaobei: summary
        ? t('share.hookJiaobei', { summary })
        : t('share.hookJiaobeiDefault'),
      'qimen-seeking': summary
        ? t('share.hookQimenSeeking', { summary })
        : t('share.hookQimenSeekingDefault'),
      numerology: summary
        ? t('share.hookNumerology', { summary })
        : t('share.hookNumerologyDefault'),
      'zhuge-cezi': summary
        ? t('share.hookZhugeCezi', { summary })
        : t('share.hookZhugeCeziDefault'),
      'xiao-liuren': summary
        ? t('share.hookXiaoLiuren', { summary })
        : t('share.hookXiaoLiurenDefault'),
      tarot: summary
        ? t('share.hookTarot', { summary })
        : t('share.hookTarotDefault'),
      'ziwei-hunpan': summary
        ? t('share.hookZiweiHunpan', { summary })
        : t('share.hookZiweiHunpanDefault'),
      wuge: summary
        ? t('share.hookWuge', { summary })
        : t('share.hookWugeDefault'),
      'cezi-zhouyi': summary
        ? t('share.hookCeziZhouyi', { summary })
        : t('share.hookCeziZhouyiDefault'),
      '3shanwang-lot': summary
        ? t('share.hook3ShanwangLot', { summary })
        : t('share.hook3ShanwangLotDefault'),
      jinkoujue: summary
        ? t('share.hookJinkoujue', { summary })
        : t('share.hookJinkoujueDefault'),
      'xiao-liuren-seeking': summary
        ? t('share.hookXiaoLiurenSeeking', { summary })
        : t('share.hookXiaoLiurenSeekingDefault'),
      'mazu-lot': summary
        ? t('share.hookMazuLot', { summary })
        : t('share.hookMazuLotDefault'),
      chenggu: summary
        ? t('share.hookChenggu', { summary })
        : t('share.hookChengguDefault'),
      'cezi-battle': summary
        ? t('share.hookCeziBattle', { summary })
        : t('share.hookCeziBattleDefault'),
      lenormand: summary
        ? t('share.hookLenormand', { summary })
        : t('share.hookLenormandDefault'),
      'jinri-yunshi': summary
        ? t('share.hookJinriYunshi', { summary })
        : t('share.hookJinriYunshiDefault'),
      jishi: summary
        ? t('share.hookJishi', { summary })
        : t('share.hookJishiDefault'),
      'wuxing-chuanyi': summary
        ? t('share.hookWuxingChuanyi', { summary })
        : t('share.hookWuxingChuanyiDefault'),
      'chong-shengxiao': summary
        ? t('share.hookChongShengxiao', { summary })
        : t('share.hookChongShengxiaoDefault'),
      'shengxiao-piancaiyun': summary
        ? t('share.hookShengxiaoPiancaiyun', { summary })
        : t('share.hookShengxiaoPiancaiyunDefault'),
      'bazi-personality-map': summary
        ? t('share.hookBaziPersonalityMap', { summary })
        : t('share.hookBaziPersonalityMapDefault'),
      'name-score': summary
        ? t('share.hookNameScore', { summary })
        : t('share.hookNameScoreDefault'),
      'shengxiao-peidui': summary
        ? t('share.hookShengxiaoPeidui', { summary })
        : t('share.hookShengxiaoPeiduiDefault'),
      'parent-child-bazi': summary
        ? t('share.hookParentChildBazi', { summary })
        : t('share.hookParentChildBaziDefault'),
      'marriage-xiangxing': summary
        ? t('share.hookMarriageXiangxing', { summary })
        : t('share.hookMarriageXiangxingDefault'),
      'parenting-style': summary
        ? t('share.hookParentingStyle', { summary })
        : t('share.hookParentingStyleDefault'),
      'child-activity-interest': summary
        ? t('share.hookChildActivityInterest', { summary })
        : t('share.hookChildActivityInterestDefault'),
      sbti: summary
        ? t('share.hookSbti', { summary })
        : t('share.hookSbtiDefault'),
      'qizheng-siyu': summary
        ? t('share.hookQizhengSiyu', { summary })
        : t('share.hookQizhengSiyuDefault'),
      'ziwei-shiye-hepan': summary
        ? t('share.hookZiweiShiyeHepan', { summary })
        : t('share.hookZiweiShiyeHepanDefault'),
      'ziwei-zhichang-hepan': summary
        ? t('share.hookZiweiZhichangHepan', { summary })
        : t('share.hookZiweiZhichangHepanDefault'),
      'bazi-shiye-hepan': summary
        ? t('share.hookBaziShiyeHepan', { summary })
        : t('share.hookBaziShiyeHepanDefault'),
      'bazi-poxi-hepan': summary
        ? t('share.hookBaziPoxiHepan', { summary })
        : t('share.hookBaziPoxiHepanDefault'),
      'vedic-hepan': summary
        ? t('share.hookVedicHepan', { summary })
        : t('share.hookVedicHepanDefault'),
      'bzti-birthday-personality': summary
        ? t('share.hookBztiBirthdayPersonality', { summary })
        : t('share.hookBztiBirthdayPersonalityDefault'),
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
