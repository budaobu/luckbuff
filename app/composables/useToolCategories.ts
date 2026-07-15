import type { ComputedRef } from 'vue'

export interface ToolItem {
  icon: string
  titleKey: string
  descKey: string
  ctaKey: string
  path: string
  recommended?: boolean
}

export interface ToolCategory {
  id: string
  icon: string
  titleKey: string
  subtitleKey: string
  sectionPath: string
  tools: ToolItem[]
}

const toolCategories: ToolCategory[] = [
  {
    id: 'fortune-telling',
    icon: 'i-heroicons-sparkles',
    titleKey: 'tools.categoryFortuneTelling',
    subtitleKey: 'tools.categoryFortuneTellingSubtitle',
    sectionPath: '/fortune-telling',
    tools: [
      {
        icon: 'i-heroicons-calendar-days',
        titleKey: 'home.toolBaziTitle',
        descKey: 'home.toolBaziDesc',
        ctaKey: 'home.toolBaziCta',
        path: '/tools/bazi',
        recommended: true,
      },
      {
        icon: 'i-heroicons-scale',
        titleKey: 'home.toolZipingBaziTitle',
        descKey: 'home.toolZipingBaziDesc',
        ctaKey: 'home.toolZipingBaziCta',
        path: '/tools/ziping-bazi',
      },
      {
        icon: 'i-heroicons-squares-plus',
        titleKey: 'home.toolBaziZiweiTitle',
        descKey: 'home.toolBaziZiweiDesc',
        ctaKey: 'home.toolBaziZiweiCta',
        path: '/tools/bazi-ziwei',
      },
      {
        icon: 'i-heroicons-circle-stack',
        titleKey: 'home.toolLiuyaoDivinationTitle',
        descKey: 'home.toolLiuyaoDivinationDesc',
        ctaKey: 'home.toolLiuyaoDivinationCta',
        path: '/tools/liuyao-divination',
      },
      {
        icon: 'i-heroicons-map',
        titleKey: 'home.toolQimenTitle',
        descKey: 'home.toolQimenDesc',
        ctaKey: 'home.toolQimenCta',
        path: '/tools/qimen',
      },
      {
        icon: 'i-heroicons-square-3-stack-3d',
        titleKey: 'home.toolTaiyiTitle',
        descKey: 'home.toolTaiyiDesc',
        ctaKey: 'home.toolTaiyiCta',
        path: '/tools/taiyi',
      },
      {
        icon: 'i-heroicons-eye',
        titleKey: 'home.toolLiurenTitle',
        descKey: 'home.toolLiurenDesc',
        ctaKey: 'home.toolLiurenCta',
        path: '/tools/liuren',
      },
      {
        icon: 'i-heroicons-hand-raised',
        titleKey: 'home.toolXiaoLiurenTitle',
        descKey: 'home.toolXiaoLiurenDesc',
        ctaKey: 'home.toolXiaoLiurenCta',
        path: '/tools/xiao-liuren',
      },
     {
       icon: 'i-heroicons-scale',
       titleKey: 'home.toolJinkoujueTitle',
       descKey: 'home.toolJinkoujueDesc',
       ctaKey: 'home.toolJinkoujueCta',
       path: '/tools/jinkoujue',
     },
   ],
 },
  {
    id: 'double-chart',
    icon: 'i-heroicons-heart',
    titleKey: 'tools.categoryDoubleChart',
    subtitleKey: 'tools.categoryDoubleChartSubtitle',
    sectionPath: '/shuangren-hepan',
    tools: [
      {
        icon: 'i-heroicons-briefcase',
        titleKey: 'baziShiyeHepan.title',
        descKey: 'baziShiyeHepan.toolDesc',
        ctaKey: 'baziShiyeHepan.toolCta',
        path: '/tools/bazi-shiye-hepan',
      },
      {
        icon: 'i-heroicons-users',
        titleKey: 'baziZhichangHepan.title',
        descKey: 'baziZhichangHepan.toolDesc',
        ctaKey: 'baziZhichangHepan.toolCta',
        path: '/tools/bazi-zhichang-hepan',
      },
      {
        icon: 'i-heroicons-briefcase',
        titleKey: 'ziweiShiyeHepan.title',
        descKey: 'ziweiShiyeHepan.toolDesc',
        ctaKey: 'ziweiShiyeHepan.toolCta',
        path: '/tools/ziwei-shiye-hepan',
      },
      {
        icon: 'i-heroicons-users',
        titleKey: 'ziweiZhichangHepan.title',
        descKey: 'ziweiZhichangHepan.toolDesc',
        ctaKey: 'ziweiZhichangHepan.toolCta',
        path: '/tools/ziwei-zhichang-hepan',
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'home.toolBaziHunpanTitle',
        descKey: 'home.toolBaziHunpanDesc',
        ctaKey: 'home.toolBaziHunpanCta',
        path: '/tools/bazi-hunpan',
        recommended: true,
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'ziweiHunpan.title',
        descKey: 'ziweiHunpan.toolDesc',
        ctaKey: 'ziweiHunpan.toolCta',
        path: '/tools/ziwei-hunpan',
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'home.toolShengxiaoPeiduiTitle',
        descKey: 'home.toolShengxiaoPeiduiDesc',
        ctaKey: 'home.toolShengxiaoPeiduiCta',
        path: '/tools/shengxiao-peidui',
      },
    ],
  },
  {
    id: 'auspicious-datetime',
    icon: 'i-heroicons-calendar',
    titleKey: 'tools.categoryAuspiciousDatetime',
    subtitleKey: 'tools.categoryAuspiciousDatetimeSubtitle',
    sectionPath: '/auspicious-datetime',
    tools: [
      {
        icon: 'i-heroicons-sun',
        titleKey: 'home.toolHuangdaoTitle',
        descKey: 'home.toolHuangdaoDesc',
        ctaKey: 'home.toolHuangdaoCta',
        path: '/tools/huangdao',
        recommended: true,
      },
      {
        icon: 'i-heroicons-clock',
        titleKey: 'home.toolJishiTitle',
        descKey: 'home.toolJishiDesc',
        ctaKey: 'home.toolJishiCta',
        path: '/tools/jishi',
      },
      {
        icon: 'i-heroicons-scale',
        titleKey: 'home.toolJinriYijiTitle',
        descKey: 'home.toolJinriYijiDesc',
        ctaKey: 'home.toolJinriYijiCta',
        path: '/tools/jinri-yiji',
      },
      {
        icon: 'i-heroicons-sparkles',
        titleKey: 'home.toolJinriYunshiTitle',
        descKey: 'home.toolJinriYunshiDesc',
        ctaKey: 'home.toolJinriYunshiCta',
        path: '/tools/jinri-yunshi',
      },
      {
        icon: 'i-heroicons-swatch',
        titleKey: 'home.toolWuxingChuanyiTitle',
        descKey: 'home.toolWuxingChuanyiDesc',
        ctaKey: 'home.toolWuxingChuanyiCta',
        path: '/tools/wuxing-chuanyi',
      },
      {
        icon: 'i-heroicons-arrows-right-left',
        titleKey: 'home.toolChongShengxiaoTitle',
        descKey: 'home.toolChongShengxiaoDesc',
        ctaKey: 'home.toolChongShengxiaoCta',
        path: '/tools/chong-shengxiao',
      },
      {
        icon: 'i-heroicons-banknotes',
        titleKey: 'home.toolShengxiaoPiancaiyunTitle',
        descKey: 'home.toolShengxiaoPiancaiyunDesc',
        ctaKey: 'home.toolShengxiaoPiancaiyunCta',
        path: '/tools/shengxiao-piancaiyun',
      },
    ],
  },
  {
    id: 'seeking',
    icon: 'i-heroicons-magnifying-glass',
    titleKey: 'tools.categorySeeking',
    subtitleKey: 'tools.categorySeekingSubtitle',
    sectionPath: '/seeking',
    tools: [
      {
        icon: 'i-heroicons-signal',
        titleKey: 'qimenSeeking.title',
        descKey: 'seeking.toolQimenSeekingDesc',
        ctaKey: 'seeking.toolQimenSeekingCta',
        path: '/tools/qimen-seeking',
        recommended: true,
      },
      {
        icon: 'i-heroicons-circle-stack',
        titleKey: 'liuyaoSeeking.title',
        descKey: 'seeking.toolLiuyaoSeekingDesc',
        ctaKey: 'seeking.toolLiuyaoSeekingCta',
        path: '/tools/liuyao-seeking',
      },
      {
        icon: 'i-heroicons-eye',
        titleKey: 'liurenSeeking.title',
        descKey: 'seeking.toolLiurenSeekingDesc',
        ctaKey: 'seeking.toolLiurenSeekingCta',
        path: '/tools/liuren-seeking',
      },
      {
        icon: 'i-heroicons-hand-raised',
        titleKey: 'xiaoLiurenSeeking.title',
        descKey: 'seeking.toolXiaoLiurenSeekingDesc',
        ctaKey: 'seeking.toolXiaoLiurenSeekingCta',
        path: '/tools/xiao-liuren-seeking',
      },
    ],
  },
  {
    id: 'naming',
    icon: 'i-heroicons-pencil-square',
    titleKey: 'tools.categoryNaming',
    subtitleKey: 'tools.categoryNamingSubtitle',
    sectionPath: '/naming',
    tools: [
      {
        icon: 'i-heroicons-gift',
        titleKey: 'babyNaming.title',
        descKey: 'naming.toolBabyNamingDesc',
        ctaKey: 'naming.toolBabyNamingCta',
        path: '/tools/baby-naming',
        recommended: true,
      },
      {
        icon: 'i-heroicons-sparkles',
        titleKey: 'home.toolSancaiWugeTitle',
        descKey: 'home.toolSancaiWugeDesc',
        ctaKey: 'home.toolSancaiWugeCta',
        path: '/tools/sancai-wuge',
        recommended: true,
      },
      {
        icon: 'i-heroicons-fire',
        titleKey: 'home.toolBaziNamingTitle',
        descKey: 'home.toolBaziNamingDesc',
        ctaKey: 'home.toolBaziNamingCta',
        path: '/tools/bazi-naming',
      },
      {
        icon: 'i-heroicons-squares-2x2',
        titleKey: 'home.toolWugeTitle',
        descKey: 'home.toolWugeDesc',
        ctaKey: 'home.toolWugeCta',
        path: '/tools/wuge',
      },
      {
        icon: 'i-heroicons-star',
        titleKey: 'home.toolNameScoreTitle',
        descKey: 'home.toolNameScoreDesc',
        ctaKey: 'home.toolNameScoreCta',
        path: '/tools/name-score',
      },
      {
        icon: 'i-heroicons-numbered-list',
        titleKey: 'home.toolNumerologyTitle',
        descKey: 'home.toolNumerologyDesc',
        ctaKey: 'home.toolNumerologyCta',
        path: '/tools/numerology',
      },
      {
        icon: 'i-heroicons-scale',
        titleKey: 'home.toolChengguTitle',
        descKey: 'home.toolChengguDesc',
        ctaKey: 'home.toolChengguCta',
        path: '/tools/chenggu',
      },
    ],
  },
  {
    id: 'cezi',
    icon: 'i-heroicons-pencil',
    titleKey: 'tools.categoryCezi',
    subtitleKey: 'tools.categoryCeziSubtitle',
    sectionPath: '/cezi',
    tools: [
      {
        icon: 'i-heroicons-pencil-square',
        titleKey: 'ceziZhouyi.title',
        descKey: 'ceziZhouyi.toolDesc',
        ctaKey: 'ceziZhouyi.toolCta',
        path: '/tools/cezi-zhouyi',
        recommended: true,
      },
      {
        icon: 'i-heroicons-document-text',
        titleKey: 'ceziYishu.title',
        descKey: 'ceziYishu.toolDesc',
        ctaKey: 'ceziYishu.toolCta',
        path: '/tools/cezi-yishu',
      },
      {
        icon: 'i-heroicons-circle-stack',
        titleKey: 'liuyaoCezi.title',
        descKey: 'liuyaoCezi.toolDesc',
        ctaKey: 'liuyaoCezi.toolCta',
        path: '/tools/liuyao-cezi',
      },
      {
        icon: 'i-heroicons-bolt',
        titleKey: 'ceziBattle.title',
        descKey: 'ceziBattle.toolDesc',
        ctaKey: 'ceziBattle.toolCta',
        path: '/tools/cezi-battle',
      },
    ],
  },
  {
    id: 'draw-a-lot',
    icon: 'i-heroicons-gift-top',
    titleKey: 'tools.categoryDrawALot',
    subtitleKey: 'tools.categoryDrawALotSubtitle',
    sectionPath: '/draw-a-lot',
    tools: [
      {
        icon: 'i-heroicons-gift-top',
        titleKey: 'drawALot.title',
        descKey: 'drawALot.toolDesc',
        ctaKey: 'drawALot.toolCta',
        path: '/tools/guanyin-lots',
        recommended: true,
      },
      {
        icon: 'i-heroicons-currency-dollar',
        titleKey: 'wealthGodLot.title',
        descKey: 'wealthGodLot.toolDesc',
        ctaKey: 'wealthGodLot.toolCta',
        path: '/tools/5-god-of-wealth-lot',
      },
      {
        icon: 'i-heroicons-flag',
        titleKey: 'sanshanwangLot.title',
        descKey: 'sanshanwangLot.toolDesc',
        ctaKey: 'sanshanwangLot.toolCta',
        path: '/tools/3shanwang-lot',
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'mazuLot.title',
        descKey: 'mazuLot.toolDesc',
        ctaKey: 'mazuLot.toolCta',
        path: '/tools/mazu-lot',
      },
      {
        icon: 'i-heroicons-numbered-list',
        titleKey: 'zhugeCezi.title',
        descKey: 'zhugeCezi.toolDesc',
        ctaKey: 'zhugeCezi.toolCta',
        path: '/tools/zhuge-cezi',
      },
     {
      icon: 'i-heroicons-hand-raised',
      titleKey: 'jiaobei.title',
      descKey: 'jiaobei.toolDesc',
      ctaKey: 'jiaobei.toolCta',
      path: '/tools/jiaobei',
    },
   ],
 },
  {
    id: 'psychological-test',
    icon: 'i-heroicons-beaker',
    titleKey: 'tools.categoryPsychologicalTest',
    subtitleKey: 'tools.categoryPsychologicalTestSubtitle',
    sectionPath: '/psychological-test',
    tools: [
      {
        icon: 'i-heroicons-chart-pie',
        titleKey: 'psychologicalTest.toolBaziPersonalityTitle',
        descKey: 'psychologicalTest.toolBaziPersonalityDesc',
        ctaKey: 'psychologicalTest.toolBaziPersonalityCta',
        path: '/tools/bazi-personality-map',
        recommended: true,
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'psychologicalTest.toolParentChildBaziTitle',
        descKey: 'psychologicalTest.toolParentChildBaziDesc',
        ctaKey: 'psychologicalTest.toolParentChildBaziCta',
        path: '/tools/parent-child-bazi',
      },
      {
        icon: 'i-heroicons-home',
        titleKey: 'psychologicalTest.toolParentingStyleTitle',
        descKey: 'psychologicalTest.toolParentingStyleDesc',
        ctaKey: 'psychologicalTest.toolParentingStyleCta',
        path: '/tools/parenting-style',
      },
      {
        icon: 'i-heroicons-heart',
        titleKey: 'psychologicalTest.toolMarriageXiangxingTitle',
        descKey: 'psychologicalTest.toolMarriageXiangxingDesc',
        ctaKey: 'psychologicalTest.toolMarriageXiangxingCta',
        path: '/tools/marriage-xiangxing',
      },
      {
        icon: 'i-heroicons-puzzle-piece',
        titleKey: 'psychologicalTest.toolChildActivityInterestTitle',
        descKey: 'psychologicalTest.toolChildActivityInterestDesc',
        ctaKey: 'psychologicalTest.toolChildActivityInterestCta',
        path: '/tools/child-activity-interest',
      },
      {
        icon: 'i-heroicons-face-smile',
        titleKey: 'psychologicalTest.toolSbtiTitle',
        descKey: 'psychologicalTest.toolSbtiDesc',
        ctaKey: 'psychologicalTest.toolSbtiCta',
        path: '/tools/sbti',
      },
      {
        icon: 'i-heroicons-trophy',
        titleKey: 'psychologicalTest.toolLifeAchievementTitle',
        descKey: 'psychologicalTest.toolLifeAchievementDesc',
        ctaKey: 'psychologicalTest.toolLifeAchievementCta',
        path: '/tools/life-achievement-generator',
        recommended: true,
      },
      {
        icon: 'i-heroicons-cake',
        titleKey: 'bztiBirthdayPersonality.title',
        descKey: 'bztiBirthdayPersonality.subtitle',
        ctaKey: 'common.start',
        path: '/tools/bzti-birthday-personality',
      },
      {
        icon: 'i-heroicons-shield-exclamation',
        titleKey: 'fuckClaude.toolTitle',
        descKey: 'fuckClaude.toolDesc',
        ctaKey: 'fuckClaude.toolCta',
        path: '/tools/fuckclaude',
      },
      {
        icon: 'i-heroicons-queue-list',
        titleKey: 'psychologicalTest.toolJapanPriorityTestTitle',
        descKey: 'psychologicalTest.toolJapanPriorityTestDesc',
        ctaKey: 'psychologicalTest.toolJapanPriorityTestCta',
        path: '/tools/japan-priority-test',
      },
    ],
  },
  {
    id: 'prophet',
    icon: 'i-heroicons-trophy',
    titleKey: 'tools.categoryProphet',
    subtitleKey: 'tools.categoryProphetSubtitle',
    sectionPath: '/prophet',
    tools: [
      {
        icon: 'i-heroicons-sparkles',
        titleKey: 'home.toolLiuyaoTitle',
        descKey: 'home.toolLiuyaoDesc',
        ctaKey: 'home.toolLiuyaoCta',
        path: '/tools/liu-yao',
        recommended: true,
      },
      {
        icon: 'i-heroicons-squares-2x2',
        titleKey: 'home.toolQimenWorldcupTitle',
        descKey: 'home.toolQimenWorldcupDesc',
        ctaKey: 'home.toolQimenWorldcupCta',
        path: '/prophet/qimen-worldcup',
      },
      {
        icon: 'i-heroicons-cube-transparent',
        titleKey: 'home.toolLiurenWorldcupTitle',
        descKey: 'home.toolLiurenWorldcupDesc',
        ctaKey: 'home.toolLiurenWorldcupCta',
        path: '/prophet/liuren-worldcup',
      },
      {
        icon: 'i-heroicons-user-group',
        titleKey: 'home.toolFbtiTitle',
        descKey: 'home.toolFbtiDesc',
        ctaKey: 'home.toolFbtiCta',
        path: '/tools/fbti',
      },
      {
        icon: 'i-heroicons-trophy',
        titleKey: 'home.toolWorldcupChampionTitle',
        descKey: 'home.toolWorldcupChampionDesc',
        ctaKey: 'home.toolWorldcupChampionCta',
        path: '/prophet/worldcup-champion-odds-2026',
      },
    ],
  },
]

/**
 * 所有工具专题分类数据
 * 供 /tools 专题列表页读取，各专题页亦可复用
 */
export function useToolCategories(): ComputedRef<ToolCategory[]> {
  return computed(() => toolCategories)
}

/**
 * 获取某个专题下除前 3 个展示外剩余的完整工具列表
 * 用于「更多」跳转后的专题页渲染
 */
export function getCategoryFullTools(categoryId: string): ToolItem[] {
  const cat = toolCategories.find(c => c.id === categoryId)
  return cat?.tools ?? []
}

/**
 * 获取所有工具的扁平列表（用于 SEO JSON-LD）
 */
export function getAllToolsFlat(): ToolItem[] {
  return toolCategories.flatMap(c => c.tools)
}
