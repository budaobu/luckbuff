<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('huangdao.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('huangdao.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('huangdao.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('huangdao.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ verdictLabel }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ metaLineA }}</p>
          <p class="bzr-meta-line">{{ metaLineB }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 择日总论 ============ -->
      <section class="bzr-row bzr-row-top">
        <!-- 命主信息卡 -->
        <div class="bzr-card bzr-profile">
          <h3 class="bzr-card-title">{{ $t('huangdao.report.profileTitle') }}</h3>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☀</span>
            <span class="bzr-profile-label">{{ $t('huangdao.report.nameLabel') }}</span>
            <span class="bzr-profile-value">{{ name || $t('common.unknown') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('huangdao.report.genderLabel') }}</span>
            <span class="bzr-profile-value">{{ genderText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☽</span>
            <span class="bzr-profile-label">{{ $t('huangdao.report.birthLabel') }}</span>
            <span class="bzr-profile-value">{{ birthText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">❖</span>
            <span class="bzr-profile-label">{{ $t('huangdao.report.matterLabel') }}</span>
            <span class="bzr-profile-value">{{ matter || $t('huangdao.generalMatter') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">✦</span>
            <span class="bzr-profile-label">{{ $t('huangdao.report.rangeLabel') }}</span>
            <span class="bzr-profile-value">{{ startDate }} ~ {{ endDate }}</span>
          </div>
        </div>

        <!-- 择日总论 + 综合匹配指数 -->
        <div class="bzr-card bzr-overview-card">
          <h3 class="bzr-card-title">{{ $t('huangdao.report.overviewTitle') }}</h3>
          <div class="bzr-overview-body">
            <!-- 综合匹配指数仪表盘 -->
            <div class="bzr-match-score-card">
              <div class="bzr-match-score-label">{{ $t('huangdao.report.matchScoreLabel') }}</div>
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
            <!-- 候选统计 -->
            <div class="bzr-stat-grid">
              <div class="bzr-stat">
                <div class="bzr-stat-num">{{ days.length }}</div>
                <div class="bzr-stat-label">{{ $t('huangdao.report.statCandidates') }}</div>
              </div>
              <div class="bzr-stat">
                <div class="bzr-stat-num bzr-stat-num-good">{{ auspiciousCount }}</div>
                <div class="bzr-stat-label">{{ $t('huangdao.report.statAuspicious') }}</div>
              </div>
              <div class="bzr-stat">
                <div class="bzr-stat-num">{{ averageScore }}</div>
                <div class="bzr-stat-label">{{ $t('huangdao.report.statAverage') }}</div>
              </div>
              <div class="bzr-stat">
                <div class="bzr-stat-num bzr-stat-num-best">{{ bestDay?.dayGanZhi || '—' }}</div>
                <div class="bzr-stat-label">{{ $t('huangdao.report.statBestGanZhi') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 吉日匹配度排行柱状图 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('huangdao.report.rankTitle') }}</h3>
        <div class="bzr-card bzr-rank-card">
          <div v-for="(d, i) in rankedDays" :key="d.date" class="bzr-rank-row" :class="{ 'bzr-rank-row-top': i === 0 }">
            <span class="bzr-rank-no" :class="{ 'bzr-rank-no-top': i === 0 }">{{ i + 1 }}</span>
            <span class="bzr-rank-date">{{ formatShortDate(d.date) }}</span>
            <span class="bzr-rank-gz">{{ d.dayGanZhi }}</span>
            <span class="bzr-rank-track">
              <span class="bzr-rank-bar" :style="{ width: d.matchScore + '%', background: scoreColor(d.matchScore) }" />
            </span>
            <span class="bzr-rank-score" :style="{ color: scoreColor(d.matchScore) }">{{ d.matchScore }}</span>
            <span class="bzr-rank-tag" :class="d.isAuspicious ? 'bzr-tag-good' : 'bzr-tag-neutral'">
              {{ d.isAuspicious ? $t('huangdao.report.tagJi') : $t('huangdao.report.tagPing') }}
            </span>
          </div>
        </div>
      </section>

      <!-- ============ 首选吉日五维雷达 + 吉时 ============ -->
      <section class="bzr-row bzr-row-radar">
        <!-- 五维雷达图 -->
        <div class="bzr-card bzr-radar-card">
          <h3 class="bzr-card-title">{{ $t('huangdao.report.radarTitle') }}</h3>
          <div class="bzr-radar-wrap">
            <svg viewBox="0 0 200 200" class="bzr-radar-svg">
              <!-- 网格 -->
              <polygon
                v-for="ring in [0.33, 0.66, 1]"
                :key="ring"
                :points="radarGridPoints(ring)"
                fill="none"
                stroke="var(--bzr-line-soft)"
                stroke-width="1"
              />
              <!-- 轴线 -->
              <line
                v-for="(axis, i) in radarAxes"
                :key="i"
                :x1="100" :y1="100"
                :x2="axisPoint(i, 1).x" :y2="axisPoint(i, 1).y"
                stroke="var(--bzr-line-soft)"
                stroke-width="1"
              />
              <!-- 数据面 -->
              <polygon
                :points="radarDataPoints"
                fill="rgba(140, 47, 38, 0.12)"
                stroke="var(--bzr-accent)"
                stroke-width="1.5"
              />
              <!-- 数据点 -->
              <circle
                v-for="(p, i) in radarDataPointList"
                :key="i"
                :cx="p.x" :cy="p.y" r="2.5"
                fill="var(--bzr-accent)"
              />
              <!-- 轴标签 -->
              <text
                v-for="(axis, i) in radarAxes"
                :key="'lbl' + i"
                :x="axisLabelPoint(i).x" :y="axisLabelPoint(i).y"
                class="bzr-radar-label"
                text-anchor="middle"
              >{{ axis.label }}</text>
            </svg>
          </div>
          <div class="bzr-radar-caption">{{ bestDayCaption }}</div>
        </div>

        <!-- 首选吉日吉时 -->
        <div class="bzr-card bzr-hours-card">
          <h3 class="bzr-card-title">{{ $t('huangdao.report.hoursTitle') }}</h3>
          <div v-if="bestDayDetail?.hours" class="bzr-hours-list">
            <span
              v-for="h in parseHours(bestDayDetail.hours)"
              :key="h"
              class="bzr-hour-chip"
            >{{ h }}</span>
          </div>
          <div v-else class="bzr-hours-empty">{{ pendingText }}</div>
          <div v-if="bestDayDetail?.reason" class="bzr-best-reason">
            <div class="bzr-best-reason-head">{{ $t('huangdao.report.bestReasonTitle') }}</div>
            <p class="bzr-best-reason-text">{{ bestDayDetail.reason }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 逐日黄历对照表 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('huangdao.report.tableTitle') }}</h3>
        <div class="bzr-card bzr-table-card">
          <table class="bzr-table">
            <thead>
              <tr>
                <th>{{ $t('huangdao.report.colDate') }}</th>
                <th>{{ $t('huangdao.report.colGanZhi') }}</th>
                <th>{{ $t('huangdao.report.colTianShen') }}</th>
                <th>{{ $t('huangdao.report.colYi') }}</th>
                <th>{{ $t('huangdao.report.colJi') }}</th>
                <th>{{ $t('huangdao.report.colChong') }}</th>
                <th>{{ $t('huangdao.report.colScore') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in rankedDays" :key="d.date" :class="{ 'bzr-table-best': i === 0 }">
                <td class="bzr-table-date">
                  {{ formatShortDate(d.date) }}
                  <span class="bzr-table-week">{{ $t('common.week') }}{{ d.week }}</span>
                </td>
                <td class="bzr-table-gz">{{ d.dayGanZhi }}<span class="bzr-table-ny">{{ d.naYin }}</span></td>
                <td>
                  <span class="bzr-cell-tag" :class="d.tianShenLuck === '吉' ? 'bzr-tag-good' : 'bzr-tag-bad'">
                    {{ d.tianShen }}
                  </span>
                </td>
                <td class="bzr-table-yi">{{ d.yi.slice(0, 3).join('、') || $t('huangdao.none') }}</td>
                <td class="bzr-table-ji">{{ d.ji.slice(0, 3).join('、') || $t('huangdao.none') }}</td>
                <td class="bzr-table-chong">{{ d.chongDesc || '—' }}</td>
                <td class="bzr-table-score" :style="{ color: scoreColor(d.matchScore) }">{{ d.matchScore }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('huangdao.report.secOverview') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection(['择日总论', 'Overview']))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('huangdao.report.secAdvice') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection(['择日建议', 'General Advice', 'Advice']))" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('huangdao.report.secTopDates') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection(['最佳吉日', 'Top Date', '吉日推荐', 'Date Recommendations']))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('huangdao.report.secAvoid') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection(['忌讳提醒', 'Things to Avoid', 'Avoid']))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('huangdao.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('common.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('huangdao.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('huangdao.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { HuangdaoDay } from '~/types/huangdao'
import type { DiZhi } from '~/types/user'

interface Props {
  days: HuangdaoDay[]
  aiContent: string
  streaming: boolean
  error: string | null
  name?: string
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  matter: string
  startDate: string
  endDate: string
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

const genderText = computed(() =>
  props.gender === 'male' ? t('huangdao.report.genderMale') : t('huangdao.report.genderFemale'))

const birthText = computed(() => {
  const h = props.birthHour ? ` ${props.birthHour}时` : ''
  return `${props.birthDate}${h}`
})

const titleText = computed(() =>
  t('huangdao.report.title', { matter: props.matter || t('huangdao.generalMatter') }))

const subtitleText = computed(() => t('huangdao.report.subtitle'))

const metaLineA = computed(() => t('huangdao.report.metaLineA', {
  name: props.name || t('common.unknown'),
  birth: props.birthDate,
}))

const metaLineB = computed(() => t('huangdao.report.metaLineB', {
  start: props.startDate,
  end: props.endDate,
  count: props.days.length,
}))

/* ---------- 排行与统计 ---------- */

const rankedDays = computed(() =>
  props.days.slice().sort((a, b) => b.matchScore - a.matchScore))

const auspiciousCount = computed(() => props.days.filter(d => d.isAuspicious).length)

const averageScore = computed(() => {
  if (!props.days.length) return 0
  return Math.round(props.days.reduce((s, d) => s + d.matchScore, 0) / props.days.length)
})

/* ---------- 首选吉日：优先 AI 首推，回退最高分 ---------- */
// 依赖的 parsedAiDateDetails 在下方声明，但此处仅在 computed getter 惰性求值时引用，
// 运行时已完成初始化，不构成 TDZ。
function resolveBestDay(): HuangdaoDay | null {
  if (!props.days.length) return null
  const aiFirstKey = Array.from(parsedAiDateDetails.value.keys())[0]
  if (aiFirstKey) {
    const aiDay = props.days.find(d => d.date === aiFirstKey)
    if (aiDay) return aiDay
  }
  return rankedDays.value[0] ?? null
}

const bestDay = computed<HuangdaoDay | null>(() => resolveBestDay())

const bestDayDetail = computed<DayDetail | null>(() =>
  bestDay.value ? (parsedAiDateDetails.value.get(bestDay.value.date) ?? null) : null)

const matchScore = computed(() => bestDay.value?.matchScore ?? 0)

const matchColor = computed(() => scoreColor(matchScore.value))

const matchLevel = computed(() => {
  const s = matchScore.value
  if (s >= 90) return t('huangdao.report.matchExcellent')
  if (s >= 75) return t('huangdao.report.matchGood')
  if (s >= 60) return t('huangdao.report.matchFair')
  return t('huangdao.report.matchWork')
})

const verdictLabel = computed(() => {
  const s = matchScore.value
  if (s >= 90) return t('huangdao.report.verdictExcellent')
  if (s >= 60) return t('huangdao.report.verdictGood')
  return t('huangdao.report.verdictCareful')
})

function scoreColor(score: number): string {
  if (score >= 90) return '#4a7c59'
  if (score >= 75) return '#8c6d1f'
  if (score >= 60) return '#a8512e'
  return '#8c2f26'
}

/** 半圆弧长：半径 50 的半圆 ≈ 157；按百分比填充 */
const dashArray = computed(() => {
  const full = 157
  const filled = (matchScore.value / 100) * full
  return `${filled} ${full}`
})

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/* ---------- 五维雷达（确定性推导） ---------- */

/** 由候选池统计量推导首选吉日五维评分（0-100） */
const radarScores = computed(() => {
  const best = bestDay.value
  if (!best) return [0, 0, 0, 0, 0]
  const days = props.days
  const max = (fn: (d: HuangdaoDay) => number) => Math.max(1, ...days.map(fn))

  const maxYi = max(d => d.yi.length)
  const maxJiShen = max(d => d.jiShen.length)
  const maxXiong = max(d => d.xiongSha.length)

  // 值神：吉=100，凶=40
  const tianShenScore = best.tianShenLuck === '吉' ? 100 : 40
  // 宜：占候选最大值比例
  const yiScore = Math.round((best.yi.length / maxYi) * 100)
  // 吉神：占候选最大值比例
  const jiShenScore = Math.round((best.jiShen.length / maxJiShen) * 100)
  // 冲煞：无冲=100，有冲=35
  const chongScore = best.chongDesc ? 35 : 100
  // 清宁（凶煞少）：凶煞越少越高
  const qingScore = Math.round((1 - best.xiongSha.length / maxXiong) * 100)

  return [tianShenScore, yiScore, jiShenScore, chongScore, qingScore]
})

const radarAxes = computed(() => [
  { label: t('huangdao.report.axisTianShen') },
  { label: t('huangdao.report.axisYi') },
  { label: t('huangdao.report.axisJiShen') },
  { label: t('huangdao.report.axisChong') },
  { label: t('huangdao.report.axisQing') },
])

const RADAR_CX = 100
const RADAR_CY = 100
const RADAR_R = 70

function axisPoint(i: number, ratio: number): { x: number; y: number } {
  // 五轴，从顶部开始顺时针
  const angle = (-90 + i * 72) * (Math.PI / 180)
  return {
    x: RADAR_CX + Math.cos(angle) * RADAR_R * ratio,
    y: RADAR_CY + Math.sin(angle) * RADAR_R * ratio,
  }
}

function radarGridPoints(ratio: number): string {
  return radarAxes.value.map((_, i) => {
    const p = axisPoint(i, ratio)
    return `${p.x},${p.y}`
  }).join(' ')
}

const radarDataPointList = computed(() =>
  radarScores.value.map((s, i) => axisPoint(i, s / 100)))

const radarDataPoints = computed(() =>
  radarDataPointList.value.map(p => `${p.x},${p.y}`).join(' '))

function axisLabelPoint(i: number): { x: number; y: number } {
  const p = axisPoint(i, 1.22)
  return { x: p.x, y: p.y + 3 }
}

const bestDayCaption = computed(() =>
  bestDay.value
    ? t('huangdao.report.radarCaption', { date: formatShortDate(bestDay.value.date), gz: bestDay.value.dayGanZhi })
    : '')

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

const aiSections = computed<AiSection[]>(() => {
  const text = props.aiContent || ''
  if (!text) return []
  const raws = text.split(/\n(?=##\s)/)
  const out: AiSection[] = []
  for (const raw of raws) {
    const trimmed = raw.replace(/<!--[\s\S]*?-->/g, '').trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title || content) out.push({ title, content })
  }
  return out
})

function findSection(keywords: string[]): string | undefined {
  const hit = aiSections.value.find(s => keywords.some(k => s.title.includes(k)))
  return hit?.content
}

const pendingText = computed(() => t('huangdao.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) return `<p class="bzr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}

/* ---------- 首选吉日吉时/推荐理由（从 AI 文本解析） ---------- */

interface DayDetail { rank: string; reason: string; hours: string }

const parsedAiDateDetails = computed(() => {
  const topSection = aiSections.value.find(s =>
    ['最佳吉日', 'Top Date', '吉日推荐', 'Date Recommendations'].some(k => s.title.includes(k)))
  if (!topSection?.content) return new Map<string, DayDetail>()

  const map = new Map<string, DayDetail>()
  const content = topSection.content
  const entryPattern = /(首推|次推|次选|备选|First|Second|Third)[：:\s]+(\d{4}[年\-]\d{1,2}[月\-]\d{1,2}[日]?)[（(]([^)）]+)[）)][，,\s]*([\s\S]*?)(?=(?:首推|次推|次选|备选|First|Second|Third)\s*[：:\s]+\d{4}|$)/g

  let m: RegExpExecArray | null
  while ((m = entryPattern.exec(content)) !== null) {
    const rank = m[1] ?? ''
    const dateStr = m[2] ?? ''
    const text = m[4]?.trim() ?? ''
    const reasonMatch = text.match(/^(.+?)(?:推荐(?:时辰|吉时)\s*[：:](.+))?$/s)
    const reason = reasonMatch?.[1]?.trim() || ''
    const hours = reasonMatch?.[2]?.trim() || ''
    map.set(normalizeDate(dateStr), { rank, reason, hours })
  }
  return map
})

function normalizeDate(dateStr: string): string {
  if (dateStr.includes('-')) return dateStr
  return dateStr
    .replace(/[年月]/g, '-')
    .replace('日', '')
    .split('-')
    .map(p => p.padStart(2, '0'))
    .join('-')
}

function parseHours(hoursText: string): string[] {
  if (!hoursText) return []
  const results: string[] = []
  for (const line of hoursText.split(/[，,、\n]/)) {
    const trimmed = line.trim()
    if (trimmed) results.push(trimmed)
  }
  return results.length ? results : [hoursText]
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 BaziZiweiReport / ShengxiaoPeiduiReport 同源） ========== */
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
.bzr-row-top { grid-template-columns: 1fr 1.6fr; }
.bzr-row-radar { grid-template-columns: 1fr 1fr; }
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

/* ---------- 命主信息卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 34px; flex-shrink: 0; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 总论 + 指数 ---------- */
.bzr-overview-card { display: flex; flex-direction: column; }
.bzr-overview-body { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; flex: 1; }

.bzr-match-score-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 6px 4px;
}
.bzr-match-score-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 2px; }
.bzr-match-dial { position: relative; width: 130px; }
.bzr-match-svg { width: 100%; display: block; }
.bzr-match-score-num {
  position: absolute; left: 0; right: 0; bottom: 2px;
  font-size: 30px; font-weight: 700; letter-spacing: 1px; text-align: center;
}
.bzr-match-score-level { font-size: 13px; font-weight: 700; letter-spacing: 2px; }

.bzr-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-stat {
  border: 1px dashed var(--bzr-line);
  background: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 12px 6px;
  display: flex; flex-direction: column; gap: 4px; justify-content: center;
}
.bzr-stat-num { font-size: 22px; font-weight: 700; color: var(--bzr-ink); letter-spacing: 1px; }
.bzr-stat-num-good { color: var(--bzr-green); }
.bzr-stat-num-best { font-size: 18px; color: var(--bzr-accent); }
.bzr-stat-label { font-size: 10.5px; color: var(--bzr-ink-faint); letter-spacing: 1px; }

/* ---------- 匹配度排行柱状图 ---------- */
.bzr-rank-card { display: flex; flex-direction: column; gap: 8px; }
.bzr-rank-row { display: flex; align-items: center; gap: 10px; }
.bzr-rank-row-top { padding: 6px 8px; border: 1px solid var(--bzr-accent); background: rgba(140, 47, 38, 0.04); border-radius: 4px; margin: -2px 0; }
.bzr-rank-no {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid var(--bzr-line); color: var(--bzr-ink-faint);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bzr-rank-no-top { background: var(--bzr-accent); border-color: var(--bzr-accent); color: #f5efe0; }
.bzr-rank-date { font-size: 12px; font-weight: 700; color: var(--bzr-ink); width: 42px; flex-shrink: 0; }
.bzr-rank-gz { font-size: 11px; color: var(--bzr-ink-soft); width: 48px; flex-shrink: 0; }
.bzr-rank-track { flex: 1; min-width: 60px; height: 10px; background: var(--bzr-line-soft); overflow: hidden; border-radius: 2px; }
.bzr-rank-bar { display: block; height: 100%; transition: width 0.8s ease; border-radius: 2px; }
.bzr-rank-score { font-size: 13px; font-weight: 700; width: 28px; text-align: right; flex-shrink: 0; }
.bzr-rank-tag { font-size: 10px; padding: 1px 8px; border-radius: 999px; border: 1px solid; letter-spacing: 0.5px; flex-shrink: 0; }

/* ---------- 判定标签配色 ---------- */
.bzr-tag-good { border-color: rgba(74, 124, 89, 0.4); background: rgba(74, 124, 89, 0.1); color: var(--bzr-green); }
.bzr-tag-bad { border-color: rgba(140, 47, 38, 0.4); background: rgba(140, 47, 38, 0.1); color: var(--bzr-accent); }
.bzr-tag-neutral { border-color: var(--bzr-line); background: var(--bzr-line-soft); color: var(--bzr-ink-faint); }

/* ---------- 雷达图 ---------- */
.bzr-radar-card { display: flex; flex-direction: column; }
.bzr-radar-wrap { display: flex; justify-content: center; padding: 4px 0; }
.bzr-radar-svg { width: 220px; max-width: 100%; display: block; }
.bzr-radar-label { font-size: 11px; fill: var(--bzr-ink-soft); letter-spacing: 1px; }
.bzr-radar-caption { text-align: center; font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 1px; margin-top: 6px; }

/* ---------- 吉时卡 ---------- */
.bzr-hours-card { display: flex; flex-direction: column; gap: 12px; }
.bzr-hours-list { display: flex; flex-wrap: wrap; gap: 8px; }
.bzr-hour-chip {
  font-size: 12px; padding: 5px 12px;
  border: 1px solid var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.07);
  color: var(--bzr-accent-soft);
  border-radius: 999px; letter-spacing: 0.5px;
}
.bzr-hours-empty { font-size: 12px; color: var(--bzr-ink-faint); font-style: italic; }
.bzr-best-reason { border-top: 1px dashed var(--bzr-line); padding-top: 10px; }
.bzr-best-reason-head { font-size: 11px; font-weight: 700; color: var(--bzr-ink); letter-spacing: 1px; margin-bottom: 4px; }
.bzr-best-reason-text { margin: 0; font-size: 12px; line-height: 1.7; color: var(--bzr-ink-soft); }

/* ---------- 逐日对照表 ---------- */
.bzr-table-card { padding: 8px; overflow-x: auto; }
.bzr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.bzr-table th, .bzr-table td {
  border: 1px solid var(--bzr-line);
  padding: 7px 8px;
  text-align: left;
  vertical-align: top;
  line-height: 1.5;
}
.bzr-table thead th {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  text-align: center;
  letter-spacing: 1px;
  white-space: nowrap;
}
.bzr-table td { color: var(--bzr-ink-soft); }
.bzr-table-best { background: rgba(74, 124, 89, 0.05); }
.bzr-table-date { font-weight: 700; color: var(--bzr-ink) !important; white-space: nowrap; }
.bzr-table-week { display: block; font-size: 9.5px; font-weight: 400; color: var(--bzr-ink-faint); }
.bzr-table-gz { white-space: nowrap; }
.bzr-table-ny { display: block; font-size: 9.5px; color: var(--bzr-ink-faint); }
.bzr-table-yi { color: var(--bzr-green) !important; }
.bzr-table-ji { color: var(--bzr-accent) !important; }
.bzr-table-chong { font-size: 10.5px; }
.bzr-table-score { font-weight: 700; text-align: center; white-space: nowrap; }
.bzr-cell-tag { font-size: 11px; padding: 2px 9px; border-radius: 999px; border: 1px solid; letter-spacing: 0.5px; white-space: nowrap; }

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
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-row-radar { grid-template-columns: 1fr; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.bzr-overview-card, .bzr-rank-card, .bzr-radar-card, .bzr-hours-card, .bzr-table-card { min-width: 0; }

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-title { font-size: 22px; letter-spacing: 2px; }
  .bzr-overview-body { grid-template-columns: 1fr; }
  .bzr-stat-grid { grid-template-columns: repeat(4, 1fr); }
  .bzr-table { min-width: 640px; }
}
</style>
