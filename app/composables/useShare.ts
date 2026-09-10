export interface ShareOptions {
  tool:
    | 'bazi'
    | 'bazi-elements'
    | 'name-compatibility'
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
    | 'ziping-bazi'
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
    | 'zibaifeixing'
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
    | 'astro-zhichang-hepan'
    | 'japan-priority-test'
    | 'bazhai-fengshui'
    | 'office-fengshui'
    | 'hall-fengshui'
    | 'bedroom-fengshui'
    | 'fengshui-ornament'
    | 'bazi-zhichang-hepan'
    | 'study-fengshui'
    | 'fengshui-fish-tank'
    | 'astro-fortune-tune'
    | 'bazi-zhengyuan'
    | 'taiyi'
    | 'huangji-zhiniangua'
    | 'liuren-zizhan'
    | 'qimen-zizhan'
    | 'poufuchan-zeri'
    | 'tiche-zeri'
    | 'liunian'
    | 'jinsuoyuguan-fengshui'
    | 'numeric-energy'
    | 'astro-dice'
  | 'mangpai-bazi'
  | 'new-school-bazi'
  | 'bazi-paipan'
  | 'shichu-suimei'
  | 'qizheng-paipan'
  | 'qimen-paipan'
  | 'tieban-paipan'
  | 'liuren-paipan'
  | 'taiyi-paipan'
  | 'ziwei-paipan'
  | 'jinri-huangli'
  name?: string
  summary?: string
  /** 覆盖当前页面路径；一般留给特殊入口使用 */
  path?: string
  /** 覆盖二维码目标；默认始终指向当前工具页 URL */
  shareUrl?: string
  /** 兼容旧调用方；Canvas 分享图不再消费结果页 DOM */
  shareTarget?: HTMLElement
  /** 兼容旧调用方；Canvas 分享图不再消费结果页 DOM */
  shareTargetSelector?: string
  /** 绕过通用海报，直接使用工具自定义 Canvas 分享图 */
  customShareImage?: string | null
  filename: string
  /** i18n 的 t 函数，必须从组件 setup 中传入 */
  t: (key: string, ...args: unknown[]) => string
}

export interface ShareResult {
  copyText: string
  /** 兼容现有调用方属性名；内容是 Canvas 合成海报 */
  screenshotDataUrl: string | null
  filename: string
  screenshotError: string | null
}

export function useShare() {
  async function share(options: ShareOptions): Promise<ShareResult> {
    const { t, tool, name, summary, filename } = options

    const toolNameMap: Record<string, string> = {
      bazi: '八字',
      'bazi-elements': '八字五行缺口',
      'name-compatibility': '姓名配对',
      zhouyi: '卦象',
      zwds: '紫微',
      liuyao: '六爻',
      'liuyao-divination': '六爻占卜',
      vedic: '吠陀占星',
      qimen: '奇门遁甲',
      huangdao: '黄道吉日',
      liuren: '大六壬',
      'bazi-ziwei': '八字紫微综合',
      'ziping-bazi': '子平八字',
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
      zibaifeixing: '紫白飞星',
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
      'astro-zhichang-hepan': '职场占星合盘',
      'japan-priority-test': '日本很火的心理测试',
      'bazhai-fengshui': '八宅风水',
      'office-fengshui': '办公室风水布局',
      'hall-fengshui': '厅堂风水布局',
      'bedroom-fengshui': '卧室风水布局',
      'bazi-zhichang-hepan': '职场八字合盘',
      'study-fengshui': '书房风水布局',
      'fengshui-fish-tank': '风水鱼缸',
      'astro-fortune-tune': '占星改运',
      'bazi-zhengyuan': '正缘画像',
      taiyi: '太乙神数',
      'huangji-zhiniangua': '皇极经世值年卦',
      'liuren-zizhan': '六壬字占',
      'qimen-zizhan': '奇门字占',
      'poufuchan-zeri': '剖腹产择日',
      'tiche-zeri': '提车吉日',
      liunian: '流年运势',
      'jinsuoyuguan-fengshui': '金锁玉关风水',
      'numeric-energy': '数字能量',
      'astro-dice': '占星骰子',
      'mangpai-bazi': '盲派八字',
      'new-school-bazi': '新派八字',
      'bazi-paipan': '八字排盘',
      'shichu-suimei': '四柱推命排盘',
      'qizheng-paipan': '七政四余排盘',
      'qimen-paipan': '奇门遁甲排盘',
      'tieban-paipan': '铁板神数排盘',
      'liuren-paipan': '大六壬排盘',
      'taiyi-paipan': '太乙神数排盘',
      'ziwei-paipan': '紫微命盘',
      'jinri-huangli': '今日黄历',
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
      'ziping-bazi': summary
        ? t('share.hookZipingBazi', { summary })
        : t('share.hookZipingBaziDefault'),
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
      'japan-priority-test': summary
        ? t('share.hookJapanPriorityTest', { summary })
        : t('share.hookJapanPriorityTestDefault'),
      'bazhai-fengshui': summary
        ? t('share.hookGeneric', { tool: '八宅风水', summary })
        : t('share.hookGeneric', { tool: '八宅风水' }),
      'hall-fengshui': summary
        ? t('share.hookGeneric', { tool: '厅堂风水布局', summary })
        : t('share.hookGeneric', { tool: '厅堂风水布局' }),
      'bedroom-fengshui': summary
        ? t('share.hookGeneric', { tool: '卧室风水布局', summary })
        : t('share.hookGeneric', { tool: '卧室风水布局' }),
      'bazi-zhichang-hepan': summary
        ? t('share.hookGeneric', { tool: '职场八字合盘', summary })
        : t('share.hookGeneric', { tool: '职场八字合盘' }),
      'study-fengshui': summary
        ? t('share.hookGeneric', { tool: '书房风水布局', summary })
        : t('share.hookGeneric', { tool: '书房风水布局' }),
      'bazi-zhengyuan': summary
        ? t('share.hookGenericSummary', { tool: '正缘画像', summary })
        : t('share.hookGeneric', { tool: '正缘画像' }),
      taiyi: summary
        ? t('share.hookTaiyi', { summary })
        : t('share.hookTaiyiDefault'),
      'huangji-zhiniangua': summary
        ? t('share.hookHuangjiZhiniangua', { summary })
        : t('share.hookHuangjiZhinianguaDefault'),
      'liuren-zizhan': summary
        ? t('share.hookLiurenZizhan', { summary })
        : t('share.hookLiurenZizhanDefault'),
      'poufuchan-zeri': summary
        ? t('share.hookPoufuchanZeri', { summary })
        : t('share.hookPoufuchanZeriDefault'),
      liunian: summary
        ? t('share.hookLiunian', { summary })
        : t('share.hookLiunianDefault'),
      'jinsuoyuguan-fengshui': summary
        ? t('share.hookGeneric', { tool: '金锁玉关风水', summary })
        : t('share.hookGeneric', { tool: '金锁玉关风水' }),
    }
    const hook = hookLines[tool] ?? t('share.hookGeneric', { tool: toolName })
    const url = window.location.href
    const suffix = tool === 'liuyao'
      ? t('share.suffixLiuyao')
      : tool === 'vedic'
        ? t('share.suffixVedic')
        : name
          ? t('share.suffix', { name, tool: toolName })
          : ''
    const copyText = `${hook}\n\n👉 ${url}${suffix ? `\n${suffix}` : ''}`

    // 分享图是固定背景上的分类版式，不再读取或克隆任何结果页 DOM。
    let screenshotDataUrl: string | null = null
    let screenshotError: string | null = null

    try {
      if (options.customShareImage) {
        screenshotDataUrl = options.customShareImage
      }
      else {
      const posterContext = resolveSharePosterContext(
        options.path || new URL(url, window.location.href).pathname,
      )
      const posterFeatureValues = ['1', '2', '3', '4'].map(index =>
        t(`sharePoster.features.${posterContext?.categoryId ?? 'fortune-telling'}${index}`),
      )
      const posterFeatures: [string, string, string, string] = [
        posterFeatureValues[0] ?? '',
        posterFeatureValues[1] ?? '',
        posterFeatureValues[2] ?? '',
        posterFeatureValues[3] ?? '',
      ]

      screenshotDataUrl = await generateSharePoster({
        categoryId: posterContext?.categoryId,
        title: posterContext ? t(posterContext.titleKey) : toolName,
        subtitle: posterContext ? t(posterContext.descriptionKey) : (summary || toolName),
        category: posterContext ? t(posterContext.categoryTitleKey) : 'ososn',
        features: posterFeatures,
        url: options.shareUrl || url,
      })
      }
    }
    catch (e: any) {
      screenshotError = e?.message || t('share.screenshotError')
    }

    return { copyText, screenshotDataUrl, filename, screenshotError }
  }

  return { share }
}
