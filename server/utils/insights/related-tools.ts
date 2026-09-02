export interface RelatedToolInput {
  title: string
  tags: string[]
  content: string
}

interface RelatedToolMatcher {
  key: string
  terms: string[]
}

// Keys intentionally match the article page's related-tool registry. New
// matchers must correspond to a live tool page before being added here.
const TOOL_MATCHERS: RelatedToolMatcher[] = [
  { key: 'office-fengshui', terms: ['办公室风水', '办公桌', '工位', '职场风水', 'office fengshui'] },
  { key: 'fengshui', terms: ['风水', '住宅风水', '家居风水', '户型', 'fengshui'] },
  { key: 'bedroom-fengshui', terms: ['卧室风水', '床位', '睡眠', '卧室'] },
  { key: 'hall-fengshui', terms: ['客厅风水', '客厅', '玄关', '厅堂'] },
  { key: 'study-fengshui', terms: ['书房风水', '文昌', '学业', '书房', '考试'] },
  { key: 'bazhai', terms: ['八宅', '宅命', '吉凶位', '游星'] },
  { key: 'jinsuoyuguan', terms: ['金锁玉关', '砂水', '过路阴阳'] },
  { key: 'bazi', terms: ['八字', '四柱', '日主', '喜用神', '天干地支', '五行', 'bazi'] },
  { key: 'bazi-ziwei', terms: ['八字紫微', '紫微', '紫薇', '星曜', '十二宫'] },
  { key: 'liuyao-divination', terms: ['六爻', '摇卦', '起卦', '爻辞', 'liuyao'] },
  { key: 'tarot', terms: ['塔罗', '塔罗牌', '牌阵', '大阿卡纳', 'tarot'] },
  { key: 'huangdao', terms: ['黄道吉日', '黄历', '择日', '吉日', '宜忌'] },
  { key: 'jinri-yunshi', terms: ['今日运势', '每日运势', '日运'] },
  { key: 'liunian', terms: ['流年', '大运', '年运', '太岁'] },
  { key: 'baby-naming', terms: ['起名', '取名', '宝宝起名', '名字', '用字'] },
  { key: 'bazi-wealth', terms: ['财运', '正财', '偏财', '财富', '财星'] },
  { key: 'bazi-zhengyuan', terms: ['正缘', '姻缘', '婚姻', '桃花', '感情', '配偶'] },
]

function includesTerm(haystack: string, term: string): boolean {
  return haystack.includes(term.toLowerCase())
}

export function inferRelatedTools({ title, tags, content }: RelatedToolInput): string[] {
  const normalizedTitle = title.toLowerCase()
  const normalizedTags = tags.map(tag => tag.toLowerCase())
  const normalizedContent = content.toLowerCase()

  return TOOL_MATCHERS
    .map((tool) => {
      const score = tool.terms.reduce((total, term) => {
        if (includesTerm(normalizedTitle, term)) total += 4
        if (normalizedTags.some(tag => includesTerm(tag, term))) total += 3
        if (includesTerm(normalizedContent, term)) total += 1
        return total
      }, 0)
      return { key: tool.key, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, 3)
    .map(item => item.key)
}
