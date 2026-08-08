<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('ziweiHunpan.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('ziweiHunpan.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('ziweiHunpan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('ziweiHunpan.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ metaLineA }}</p>
          <p class="bzr-meta-line">{{ metaLineB }}</p>
        </div>
      </header>

      <!-- ============ 合盘总论横幅 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-overview">
          <div class="bzr-overview-label">{{ $t('ziweiHunpan.report.overviewLabel') }}</div>
          <div class="bzr-overview-text">{{ overviewText }}</div>
        </div>
      </section>

      <!-- ============ 两人信息 + 主星共盘 ============ -->
      <section class="bzr-row bzr-row-top">
        <!-- 甲方 -->
        <div class="bzr-card bzr-profile">
          <h3 class="bzr-card-title">{{ displayNameA }}</h3>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.genderLabel') }}</span>
            <span class="bzr-profile-value">{{ genderTextA }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☀</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.mingGongLabel') }}</span>
            <span class="bzr-profile-value">{{ chartA.mingGong.zhi }} · {{ chartA.mingGong.mainStars.join('、') || $t('ziweiHunpan.report.borrowPalace') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">❖</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.shenGongLabel') }}</span>
            <span class="bzr-profile-value">{{ chartA.shenGong.zhi }} · {{ chartA.shenGong.mainStars.join('、') || $t('ziweiHunpan.report.borrowPalace') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">✦</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.wuxingJuLabel') }}</span>
            <span class="bzr-profile-value">{{ chartA.wuxingJu }}{{ $t('ziweiHunpan.report.juSuffix') }}</span>
          </div>
        </div>

        <!-- 乙方 -->
        <div class="bzr-card bzr-profile">
          <h3 class="bzr-card-title">{{ displayNameB }}</h3>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.genderLabel') }}</span>
            <span class="bzr-profile-value">{{ genderTextB }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☀</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.mingGongLabel') }}</span>
            <span class="bzr-profile-value">{{ chartB.mingGong.zhi }} · {{ chartB.mingGong.mainStars.join('、') || $t('ziweiHunpan.report.borrowPalace') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">❖</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.shenGongLabel') }}</span>
            <span class="bzr-profile-value">{{ chartB.shenGong.zhi }} · {{ chartB.shenGong.mainStars.join('、') || $t('ziweiHunpan.report.borrowPalace') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">✦</span>
            <span class="bzr-profile-label">{{ $t('ziweiHunpan.report.wuxingJuLabel') }}</span>
            <span class="bzr-profile-value">{{ chartB.wuxingJu }}{{ $t('ziweiHunpan.report.juSuffix') }}</span>
          </div>
        </div>

        <!-- 主星共盘分组柱状图 -->
        <div class="bzr-card bzr-wuxing-card">
          <h3 class="bzr-card-title">{{ $t('ziweiHunpan.report.starCompareTitle') }}</h3>
          <div class="bzr-wuxing-compare">
            <div v-for="s in starCompare" :key="s.name" class="bzr-wuxing-group">
              <div class="bzr-wuxing-bars">
                <span
                  class="bzr-wuxing-bar bzr-wuxing-bar-a"
                  :style="{ height: s.a + '%', background: s.color }"
                  :title="`${displayNameA} ${s.aCount}`"
                />
                <span
                  class="bzr-wuxing-bar bzr-wuxing-bar-b"
                  :style="{ height: s.b + '%', background: s.color }"
                  :title="`${displayNameB} ${s.bCount}`"
                />
              </div>
              <div class="bzr-wuxing-group-name">{{ s.name }}</div>
            </div>
          </div>
          <div class="bzr-wuxing-legend">
            <span class="bzr-legend-item"><i class="bzr-legend-swatch bzr-legend-a" />{{ displayNameA }}</span>
            <span class="bzr-legend-item"><i class="bzr-legend-swatch bzr-legend-b" />{{ displayNameB }}</span>
          </div>
        </div>
      </section>

      <!-- ============ 缘分匹配指数 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('ziweiHunpan.report.matchTitle') }}</h3>
        <div class="bzr-match-grid">
          <!-- 综合指数仪表盘 -->
          <div class="bzr-card bzr-match-score-card">
            <div class="bzr-match-score-label">{{ $t('ziweiHunpan.report.matchScoreLabel') }}</div>
            <div class="bzr-match-dial">
              <svg viewBox="0 0 120 70" class="bzr-match-svg">
                <path d="M 10 62 A 50 50 0 0 1 110 62" fill="none" stroke="var(--bzr-line-soft)" stroke-width="9" stroke-linecap="round" />
                <path
                  d="M 10 62 A 50 50 0 0 1 110 62"
                  fill="none"
                  :stroke="matchColor"
                  stroke-width="9"
                  stroke-linecap="round"
                  :stroke-dasharray="dashArray"
                  stroke-dashoffset="0"
                />
              </svg>
              <div class="bzr-match-score-num" :style="{ color: matchColor }">{{ matchScore }}</div>
            </div>
            <div class="bzr-match-score-level" :style="{ color: matchColor }">{{ matchLevel }}</div>
          </div>

          <!-- 五维匹配条形 -->
          <div class="bzr-card bzr-match-dims-card">
            <div v-for="d in matchDims" :key="d.key" class="bzr-match-dim">
              <span class="bzr-match-dim-name">{{ d.label }}</span>
              <span class="bzr-match-dim-track">
                <span class="bzr-match-dim-bar" :style="{ width: d.score + '%', background: d.color }" />
              </span>
              <span class="bzr-match-dim-score" :style="{ color: d.color }">{{ d.score }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 宫位对照 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('ziweiHunpan.report.gongCompareTitle') }}</h3>
        <div class="bzr-card bzr-gong-table-card">
          <table class="bzr-gong-table">
            <thead>
              <tr>
                <th>{{ $t('ziweiHunpan.report.gongColGong') }}</th>
                <th>{{ displayNameA }}</th>
                <th>{{ displayNameB }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in gongCompareRows" :key="row.key">
                <td class="bzr-gong-name">{{ row.label }}</td>
                <td>{{ row.a }}</td>
                <td>{{ row.b }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 大限同步 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('ziweiHunpan.report.daxianTitle') }}</h3>
        <div class="bzr-daxian-grid">
          <div class="bzr-card bzr-daxian-card">
            <div class="bzr-daxian-name">{{ displayNameA }}</div>
            <div class="bzr-daxian-row">
              <div
                v-for="d in chartA.daXians"
                :key="d.index"
                class="bzr-daxian-item"
                :class="{ 'bzr-daxian-current': d === chartA.currentDaXian }"
              >
                <span class="bzr-daxian-gz">{{ d.gongZhi }}</span>
                <span class="bzr-daxian-gong">{{ d.gongName }}</span>
                <span class="bzr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
              </div>
            </div>
          </div>
          <div class="bzr-card bzr-daxian-card">
            <div class="bzr-daxian-name">{{ displayNameB }}</div>
            <div class="bzr-daxian-row">
              <div
                v-for="d in chartB.daXians"
                :key="d.index"
                class="bzr-daxian-item"
                :class="{ 'bzr-daxian-current': d === chartB.currentDaXian }"
              >
                <span class="bzr-daxian-gz">{{ d.gongZhi }}</span>
                <span class="bzr-daxian-gong">{{ d.gongName }}</span>
                <span class="bzr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('ziweiHunpan.report.secMing') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('命宫互动'))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('ziweiHunpan.report.secFuqi') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('夫妻宫对比'))" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('ziweiHunpan.report.secFude') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('福德宫'))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('ziweiHunpan.report.secSihua') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('四化飞星'))" />
        </div>
      </section>

      <!-- ============ AI 章节 05 大限同步 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">05</span>{{ $t('ziweiHunpan.report.secDaxian') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('大限同步'))" />
        </div>
      </section>

      <!-- ============ AI 章节 06 综合建议 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">06</span>{{ $t('ziweiHunpan.report.secAdvice') }}</h3>
          <div v-if="adviceList.length" class="bzr-advice">
            <div v-for="(a, i) in adviceList" :key="i" class="bzr-advice-item">
              <span class="bzr-final-num">{{ i + 1 }}</span>
              <div class="bzr-advice-text">{{ a }}</div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(findSection('综合建议'))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('ziweiHunpan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('ziweiHunpan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('ziweiHunpan.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('ziweiHunpan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ZwdsChart, GongName } from '~/types/zwds'

interface Props {
  chartA: ZwdsChart
  chartB: ZwdsChart
  nameA?: string
  nameB?: string
  genderA: 'male' | 'female'
  genderB: 'male' | 'female'
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 静态派生 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const displayNameA = computed(() => props.nameA || t('ziweiHunpan.personA'))
const displayNameB = computed(() => props.nameB || t('ziweiHunpan.personB'))

const genderTextA = computed(() =>
  props.genderA === 'male' ? t('ziweiHunpan.report.genderMale') : t('ziweiHunpan.report.genderFemale'))
const genderTextB = computed(() =>
  props.genderB === 'male' ? t('ziweiHunpan.report.genderMale') : t('ziweiHunpan.report.genderFemale'))

const mingStarsA = computed(() => props.chartA.mingGong.mainStars.join('、') || t('ziweiHunpan.report.borrowPalace'))
const mingStarsB = computed(() => props.chartB.mingGong.mainStars.join('、') || t('ziweiHunpan.report.borrowPalace'))

const metaLineA = computed(() => t('ziweiHunpan.report.metaLine', {
  label: displayNameA.value,
  zhi: props.chartA.mingGong.zhi,
  stars: mingStarsA.value,
  ju: props.chartA.wuxingJu,
}))
const metaLineB = computed(() => t('ziweiHunpan.report.metaLine', {
  label: displayNameB.value,
  zhi: props.chartB.mingGong.zhi,
  stars: mingStarsB.value,
  ju: props.chartB.wuxingJu,
}))

/* ---------- 主星共盘对比（各盘主星落宫数分组统计） ---------- */

/** 按宫位主星个数聚合：把 12 宫按 4 组（命迁线/财官线/福夫线/子田线）归并，比较两人落星密度 */
const STAR_GROUPS: { nameKey: string; gongs: GongName[] }[] = [
  { nameKey: 'starGroupMingqian', gongs: ['命宫', '迁移'] },
  { nameKey: 'starGroupCaiguan', gongs: ['财帛', '事业'] },
  { nameKey: 'starGroupFufu', gongs: ['福德', '夫妻'] },
  { nameKey: 'starGroupZitian', gongs: ['子女', '田宅'] },
]

function groupCount(chart: ZwdsChart, gongs: GongName[]): number {
  return chart.gongs
    .filter(g => (gongs as string[]).includes(g.name))
    .reduce((sum, g) => sum + g.mainStars.length + Math.ceil(g.auxStars.length / 2), 0)
}

const STAR_COLORS = ['#8c2f26', '#a8512e', '#8c6d1f', '#4a6a8a']

const starCompare = computed(() => {
  const max = Math.max(
    1,
    ...STAR_GROUPS.flatMap(g => [groupCount(props.chartA, g.gongs), groupCount(props.chartB, g.gongs)]),
  )
  return STAR_GROUPS.map((g, i) => {
    const aCount = groupCount(props.chartA, g.gongs)
    const bCount = groupCount(props.chartB, g.gongs)
    return {
      name: t(`ziweiHunpan.report.${g.nameKey}`),
      aCount,
      bCount,
      a: Math.round((aCount / max) * 100),
      b: Math.round((bCount / max) * 100),
      color: STAR_COLORS[i % STAR_COLORS.length]!,
    }
  })
})

/* ---------- 宫位对照表 ---------- */

function gongInfo(chart: ZwdsChart, name: GongName): string {
  const g = chart.gongs.find(x => x.name === name)
  if (!g) return '—'
  const stars = g.mainStars.join('、') || t('ziweiHunpan.report.borrowPalace')
  return `${g.zhi} · ${stars}`
}

const GONG_ROWS: { key: string; labelKey: string; gong: GongName }[] = [
  { key: 'ming', labelKey: 'gongMing', gong: '命宫' },
  { key: 'fuqi', labelKey: 'gongFuqi', gong: '夫妻' },
  { key: 'fude', labelKey: 'gongFude', gong: '福德' },
  { key: 'caibo', labelKey: 'gongCaibo', gong: '财帛' },
  { key: 'shiye', labelKey: 'gongShiye', gong: '事业' },
]

const gongCompareRows = computed(() =>
  GONG_ROWS.map(r => ({
    key: r.key,
    label: t(`ziweiHunpan.report.${r.labelKey}`),
    a: gongInfo(props.chartA, r.gong),
    b: gongInfo(props.chartB, r.gong),
  })))

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

const aiSections = computed<AiSection[]>(() => {
  const text = props.aiContent || ''
  if (!text) return []
  const raws = text.split(/\n(?=##\s)/)
  const out: AiSection[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^#+\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title || content) out.push({ title, content })
  }
  return out
})

function findSection(keyword: string): string | undefined {
  const hit = aiSections.value.find(s => s.title.includes(keyword))
  return hit?.content
}

const pendingText = computed(() => t('ziweiHunpan.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) return `<p class="bzr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}

/** 合盘总论（首段） */
const overviewText = computed(() => {
  const first = aiSections.value[0]
  const raw = (first?.title.includes('总论'))
    ? first.content
    : (first && !first.title.startsWith('#') ? `${first.title}${first.content ? '\n' + first.content : ''}` : first?.content) || ''
  const plain = raw.replace(/[#*]/g, '').replace(/\n+/g, ' ').trim()
  return plain || pendingText.value
})

/* ---------- 缘分匹配指数（由 AI 文本关键词启发式打分） ---------- */

const POS_WORDS = ['相合', '相生', '互补', '契合', '稳固', '和谐', '助', '吉', '佳', '旺', '缘深', '同步', '相配', '滋养', '融洽']
const NEG_WORDS = ['相冲', '相克', '相刑', '相害', '摩擦', '冲突', '不利', '阻碍', '分歧', '缘浅', '不同步', '克', '忌']

function scoreSection(keyword: string, base: number): number {
  const c = findSection(keyword) ?? ''
  if (!c) return base
  let score = base
  for (const w of POS_WORDS) if (c.includes(w)) score += 5
  for (const w of NEG_WORDS) if (c.includes(w)) score -= 5
  return Math.max(30, Math.min(98, score))
}

const MATCH_DIMS = [
  { key: 'ming', keyword: '命宫互动', base: 70, color: '#8c2f26' },
  { key: 'fuqi', keyword: '夫妻宫对比', base: 68, color: '#a8512e' },
  { key: 'fude', keyword: '福德宫', base: 66, color: '#8c6d1f' },
  { key: 'sihua', keyword: '四化飞星', base: 66, color: '#4a7c59' },
  { key: 'daxian', keyword: '大限同步', base: 64, color: '#4a6a8a' },
] as const

const matchDims = computed(() =>
  MATCH_DIMS.map(d => ({
    key: d.key,
    label: t(`ziweiHunpan.report.dim_${d.key}`),
    score: scoreSection(d.keyword, d.base),
    color: d.color,
  })))

const matchScore = computed(() => {
  const dims = matchDims.value
  if (!dims.length) return 70
  return Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length)
})

const matchColor = computed(() => {
  const s = matchScore.value
  if (s >= 80) return '#4a7c59'
  if (s >= 65) return '#8c6d1f'
  if (s >= 50) return '#a8512e'
  return '#8c2f26'
})

const matchLevel = computed(() => {
  const s = matchScore.value
  if (s >= 80) return t('ziweiHunpan.report.matchExcellent')
  if (s >= 65) return t('ziweiHunpan.report.matchGood')
  if (s >= 50) return t('ziweiHunpan.report.matchFair')
  return t('ziweiHunpan.report.matchWork')
})

/** 半圆弧长：半径 50 的半圆 ≈ 157；按百分比填充 */
const dashArray = computed(() => {
  const full = 157
  const filled = (matchScore.value / 100) * full
  return `${filled} ${full}`
})

/* ---------- 标题/判定词 ---------- */

const verdict = computed(() => {
  const c = overviewText.value
  if (/相冲|相克|相刑|缘浅|不利|提防/.test(c)) return t('ziweiHunpan.report.verdictFriction')
  if (/互补|相合|相生|缘深|契合|同步|稳固/.test(c)) return t('ziweiHunpan.report.verdictMatch')
  return t('ziweiHunpan.report.verdictBalanced')
})

const titleText = computed(() => t('ziweiHunpan.report.title', {
  a: displayNameA.value,
  b: displayNameB.value,
}))

const subtitleText = computed(() => {
  const first = overviewText.value.split(/[。！!？?]/)[0]?.trim() ?? ''
  return first && first !== pendingText.value
    ? first.slice(0, 46)
    : t('ziweiHunpan.report.subtitleFallback')
})

/** 综合建议：拆分为编号列表 */
const adviceList = computed(() => {
  const content = findSection('综合建议') ?? ''
  if (!content) return []
  return content
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').replace(/\*\*/g, '').trim())
    .filter(l => l.length > 4)
    .slice(0, 6)
})
</script>

<style scoped>
/* ========== 纸质报告主题（与 BaziHunpanReport 同源） ========== */
.bzr {
  --bzr-bg: #f2ede3;
  --bzr-sheet: #faf6ec;
  --bzr-card: #fffdf6;
  --bzr-ink: #2e2a24;
  --bzr-ink-soft: #55503f;
  --bzr-ink-faint: #8a8272;
  --bzr-line: #d8d0bd;
  --bzr-line-soft: #e6dfcd;
  --bzr-accent: #8c2f26;
  --bzr-accent-soft: #a8512e;
  --bzr-star: #8c6d1f;
  --bzr-green: #4a7c59;
  --bzr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--bzr-bg);
  padding: 18px;
  color: var(--bzr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bzr-sheet {
  background: var(--bzr-sheet);
  border: 1px solid var(--bzr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bzr-head { border-bottom: 2px solid var(--bzr-ink); padding-bottom: 16px; }
.bzr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bzr-brand { display: flex; align-items: center; gap: 8px; }
.bzr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bzr-accent);
  color: var(--bzr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.bzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bzr-ink-soft); }
.bzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-verdict { color: var(--bzr-green); font-weight: 600; }
.bzr-rating { letter-spacing: 1px; }

.bzr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.bzr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--bzr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.bzr-head-bottom { text-align: center; }
.bzr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bzr-row { display: grid; gap: 14px; margin-top: 16px; }
.bzr-row-top { grid-template-columns: 1fr 1fr 1.6fr; }
.bzr-ai-row { grid-template-columns: 1fr 1fr; }
.bzr-section { margin-top: 16px; }

.bzr-card {
  background: var(--bzr-card);
  border: 1px solid var(--bzr-line);
  padding: 14px 16px;
}
.bzr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.bzr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 总论横幅 ---------- */
.bzr-overview {
  border: 1.5px solid var(--bzr-accent);
  background: rgba(140, 47, 38, 0.04);
  text-align: center;
  padding: 18px 20px;
}
.bzr-overview-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 3px; margin-bottom: 8px; }
.bzr-overview-text { font-size: 16px; font-weight: 700; color: var(--bzr-accent); line-height: 1.8; letter-spacing: 1px; }

/* ---------- 两人信息卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 30px; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 主星共盘分组柱状图 ---------- */
.bzr-wuxing-card { display: flex; flex-direction: column; }
.bzr-wuxing-compare {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  padding: 6px 4px 0;
  min-height: 120px;
}
.bzr-wuxing-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.bzr-wuxing-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 100px;
  width: 100%;
  justify-content: center;
}
.bzr-wuxing-bar { width: 14px; display: block; border: 1px solid rgba(0,0,0,0.12); }
.bzr-wuxing-bar-a { opacity: 0.95; }
.bzr-wuxing-bar-b { opacity: 0.45; }
.bzr-wuxing-group-name { font-size: 12px; font-weight: 700; color: var(--bzr-ink-soft); }
.bzr-wuxing-legend {
  display: flex; justify-content: center; gap: 16px;
  margin-top: 8px; font-size: 10px; color: var(--bzr-ink-faint);
}
.bzr-legend-item { display: inline-flex; align-items: center; gap: 4px; }
.bzr-legend-swatch { width: 10px; height: 10px; display: inline-block; border: 1px solid rgba(0,0,0,0.15); }
.bzr-legend-a { background: var(--bzr-accent); }
.bzr-legend-b { background: var(--bzr-blue); opacity: 0.6; }

/* ---------- 缘分匹配指数 ---------- */
.bzr-match-grid { display: grid; grid-template-columns: 0.9fr 1.6fr; gap: 10px; }
.bzr-match-score-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 14px 10px;
}
.bzr-match-score-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 2px; }
.bzr-match-dial { position: relative; width: 130px; }
.bzr-match-svg { width: 100%; display: block; }
.bzr-match-score-num {
  position: absolute; left: 0; right: 0; bottom: 2px;
  font-size: 30px; font-weight: 700; letter-spacing: 1px; text-align: center;
}
.bzr-match-score-level { font-size: 13px; font-weight: 700; letter-spacing: 2px; }

.bzr-match-dims-card { display: flex; flex-direction: column; justify-content: center; gap: 9px; }
.bzr-match-dim { display: flex; align-items: center; gap: 8px; }
.bzr-match-dim-name { font-size: 11px; color: var(--bzr-ink-soft); width: 56px; flex-shrink: 0; letter-spacing: 1px; }
.bzr-match-dim-track { flex: 1; height: 8px; background: var(--bzr-line-soft); overflow: hidden; }
.bzr-match-dim-bar { display: block; height: 100%; transition: width 0.8s ease; }
.bzr-match-dim-score { font-size: 12px; font-weight: 700; width: 24px; text-align: right; flex-shrink: 0; }

/* ---------- 宫位对照表 ---------- */
.bzr-gong-table-card { padding: 8px; overflow-x: auto; }
.bzr-gong-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.bzr-gong-table th, .bzr-gong-table td {
  border: 1px solid var(--bzr-line);
  padding: 7px 10px;
  text-align: left;
}
.bzr-gong-table th {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  letter-spacing: 1px;
  text-align: center;
}
.bzr-gong-table td { color: var(--bzr-ink-soft); letter-spacing: 0.5px; }
.bzr-gong-name { font-weight: 700; color: var(--bzr-ink) !important; text-align: center; white-space: nowrap; }

/* ---------- 大限同步 ---------- */
.bzr-daxian-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bzr-daxian-card { padding: 12px; }
.bzr-daxian-name {
  margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center;
}
.bzr-daxian-row { display: flex; gap: 2px; overflow-x: auto; }
.bzr-daxian-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--bzr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 4px 2px; gap: 1px;
}
.bzr-daxian-current { border-color: var(--bzr-accent); background: rgba(140, 47, 38, 0.05); }
.bzr-daxian-gz { font-size: 14px; font-weight: 700; }
.bzr-daxian-gong { font-size: 9px; color: var(--bzr-ink-faint); }
.bzr-daxian-age { font-size: 8px; color: var(--bzr-ink-faint); }

/* ---------- AI 章节 ---------- */
.bzr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
}
.bzr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--bzr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.bzr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bzr-ink-soft); }

.bzr-md :deep(p) { margin: 0 0 0.7em; }
.bzr-md :deep(p:last-child) { margin-bottom: 0; }
.bzr-md :deep(strong) { color: var(--bzr-ink); font-weight: 700; }
.bzr-md :deep(ul), .bzr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bzr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bzr-md :deep(h3), .bzr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--bzr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.bzr-md { overflow-x: auto; }
.bzr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.bzr-md :deep(th), .bzr-md :deep(td) { border: 1px solid var(--bzr-line); padding: 4px 6px; text-align: left; }
.bzr-md :deep(th) { background: var(--bzr-line-soft); font-weight: 700; color: var(--bzr-ink); }
.bzr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bzr-md :deep(.bzr-pending), .bzr-pending { color: var(--bzr-ink-faint); font-style: italic; }

/* ---------- 综合建议编号列表 ---------- */
.bzr-advice { display: flex; flex-direction: column; gap: 10px; }
.bzr-advice-item { display: flex; gap: 8px; align-items: flex-start; }
.bzr-advice-text { font-size: 12.5px; color: var(--bzr-ink-soft); line-height: 1.7; }
.bzr-final-num {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--bzr-ink); color: #f5efe0;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}

.bzr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px;
}
.bzr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--bzr-accent);
  animation: bzr-pulse 1s ease-in-out infinite;
}
@keyframes bzr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bzr-error { margin-top: 14px; text-align: center; color: var(--bzr-accent); font-size: 12px; }
.bzr-retry {
  margin-top: 8px;
  border: 1px solid var(--bzr-accent);
  background: transparent;
  color: var(--bzr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bzr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.bzr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--bzr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bzr-foot-note { font-size: 10px; color: var(--bzr-ink-faint); }
.bzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .bzr-row-top { grid-template-columns: 1fr 1fr; }
  .bzr-wuxing-card { grid-column: 1 / -1; }
  .bzr-daxian-grid { grid-template-columns: 1fr; }
  .bzr-match-grid { grid-template-columns: 1fr; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.bzr-wuxing-card, .bzr-match-grid, .bzr-daxian-row, .bzr-gong-table-card { min-width: 0; }

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-title { font-size: 22px; letter-spacing: 2px; }

  .bzr-daxian-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bzr-daxian-item { flex: 0 0 auto; min-width: 48px; }
}
</style>
