<template>
  <div class="qmr">
    <div class="qmr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="qmr-head">
        <div class="qmr-head-top">
          <div class="qmr-brand">
            <div class="qmr-seal">{{ $t('qimen.report.seal') }}</div>
            <span class="qmr-brand-name">{{ $t('qimen.report.brandName') }}</span>
          </div>
          <div class="qmr-head-right">
            <span class="qmr-time">{{ $t('qimen.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="qmr-verdict">✓ {{ verdictText }}</span>
          </div>
        </div>

        <h1 class="qmr-title">{{ titleText }}</h1>
        <p class="qmr-subtitle">{{ subtitleText }}</p>

        <div class="qmr-head-bottom">
          <p class="qmr-meta-line">{{ jieqiLine }}</p>
          <p v-if="lunarLine" class="qmr-meta-line">{{ lunarLine }}</p>
        </div>
      </header>

      <!-- ============ 问事信息 + 盘面速览 ============ -->
      <section class="qmr-row qmr-row-top">
        <div class="qmr-card qmr-query">
          <div class="qmr-query-line">
            <span class="qmr-ico">❖</span>
            <span class="qmr-query-label">{{ $t('qimen.report.eventTypeLabel') }}</span>
            <span class="qmr-query-value">{{ eventTypeText }}</span>
          </div>
          <div v-if="userInput?.description" class="qmr-query-line">
            <span class="qmr-ico">✦</span>
            <span class="qmr-query-label">{{ $t('qimen.report.questionLabel') }}</span>
            <span class="qmr-query-value">{{ userInput.description }}</span>
          </div>
          <div v-for="line in extraLines" :key="line.label" class="qmr-query-line">
            <span class="qmr-ico">·</span>
            <span class="qmr-query-label">{{ line.label }}</span>
            <span class="qmr-query-value">{{ line.value }}</span>
          </div>
          <div class="qmr-query-line">
            <span class="qmr-ico">☯</span>
            <span class="qmr-query-label">{{ $t('qimen.report.timeLabel') }}</span>
            <span class="qmr-query-value">{{ chart.calendar.solar.ymd_hms }}</span>
          </div>
        </div>

        <div class="qmr-card qmr-yinzheng">
          <h3 class="qmr-card-title">{{ $t('qimen.report.overviewTitle') }}</h3>
          <div class="qmr-yinzheng-grid">
            <div class="qmr-mini">
              <h4 class="qmr-mini-head">{{ $t('qimen.report.confirmedTitle') }}</h4>
              <p class="qmr-mini-body">{{ confirmedText || pendingText }}</p>
            </div>
            <div class="qmr-mini">
              <h4 class="qmr-mini-head qmr-mini-head-star">★ {{ $t('qimen.report.verdictTitle') }}</h4>
              <p class="qmr-mini-body">{{ coreJudgement || pendingText }}</p>
            </div>
            <div class="qmr-mini">
              <h4 class="qmr-mini-head">{{ $t('qimen.report.yongshenTitle') }}</h4>
              <p class="qmr-mini-body">{{ yongshenText || pendingText }}</p>
            </div>
            <div class="qmr-mini">
              <h4 class="qmr-mini-head qmr-mini-head-warn">⊘ {{ $t('qimen.report.warningTitle') }}</h4>
              <template v-if="chart.warnings?.length">
                <div v-for="(w, i) in chart.warnings" :key="i" class="qmr-point">
                  <div class="qmr-point-title qmr-point-title-warn"><span class="qmr-point-ico">⊘</span>{{ w }}</div>
                </div>
              </template>
              <p v-else class="qmr-mini-body">{{ $t('qimen.report.noWarnings') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 局数核心数据 ============ -->
      <section class="qmr-section">
        <h3 class="qmr-section-title">{{ $t('qimen.report.coreDataTitle') }}</h3>
        <div class="qmr-core-grid">
          <div class="qmr-card qmr-core">
            <div class="qmr-core-label">{{ $t('qimen.report.dunJuLabel') }}</div>
            <div class="qmr-core-value">{{ dunTypeText }}{{ chart.chart.ju_number }}{{ $t('qimen.report.juSuffix') }}</div>
            <div class="qmr-core-sub">{{ chart.chart.yuan }}</div>
          </div>
          <div class="qmr-card qmr-core">
            <div class="qmr-core-label">{{ $t('qimen.report.zhifuLabel') }}</div>
            <div class="qmr-core-value">{{ chart.chart.zhifu.star }}</div>
            <div class="qmr-core-sub">{{ palaceLoc(chart.chart.zhifu.palace) }}</div>
          </div>
          <div class="qmr-card qmr-core">
            <div class="qmr-core-label">{{ $t('qimen.report.zhishiLabel') }}</div>
            <div class="qmr-core-value">{{ chart.chart.zhishi.door }}</div>
            <div class="qmr-core-sub">{{ palaceLoc(chart.chart.zhishi.palace) }}</div>
          </div>
          <div class="qmr-card qmr-core">
            <div class="qmr-core-label">{{ $t('qimen.report.xunshouLabel') }}</div>
            <div class="qmr-core-value qmr-core-value-sm">{{ chart.chart.xunshou }}</div>
            <div class="qmr-core-sub">{{ $t('qimen.report.hiddenYiPrefix') }}{{ chart.chart.hidden_yi }}</div>
          </div>
          <div class="qmr-card qmr-core">
            <div class="qmr-core-label">{{ $t('qimen.report.kongwangLabel') }}</div>
            <div class="qmr-core-value qmr-core-value-sm">{{ kongwangText }}</div>
            <div class="qmr-core-sub">{{ kongwangPalacesText }}</div>
          </div>
          <div class="qmr-card qmr-core qmr-core-wuxing">
            <div class="qmr-core-label">{{ $t('qimen.report.wuxingTitle') }}</div>
            <div class="qmr-wuxing">
              <div v-for="row in wuxingRows" :key="row.key" class="qmr-wuxing-row">
                <span class="qmr-wuxing-dot" :style="{ background: row.color }" />
                <span class="qmr-wuxing-name">{{ row.label }}</span>
                <span class="qmr-wuxing-bar-wrap"><span class="qmr-wuxing-bar" :style="{ width: row.pct + '%', background: row.color }" /></span>
                <span class="qmr-wuxing-pct">{{ row.count }}</span>
              </div>
            </div>
            <div class="qmr-core-sub">{{ $t('qimen.report.wuxingHint') }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 四柱干支表 ============ -->
      <section class="qmr-section">
        <h3 class="qmr-section-title">{{ $t('qimen.report.ganzhiTitle') }}</h3>
        <div class="qmr-card qmr-table-card">
          <div class="qmr-table-wrap">
            <table class="qmr-table">
              <thead>
                <tr>
                  <th>{{ $t('qimen.ganzhi.yearLabel') }}</th>
                  <th>{{ $t('qimen.ganzhi.monthLabel') }}</th>
                  <th>{{ $t('qimen.ganzhi.dayLabel') }}</th>
                  <th>{{ $t('qimen.ganzhi.timeLabel') }}</th>
                  <th>{{ $t('qimen.ganzhi.xunshouLabel') }}</th>
                  <th>{{ $t('qimen.ganzhi.xunkongLabel') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="qmr-td-gz">{{ chart.ganzhi.year }}</td>
                  <td class="qmr-td-gz">{{ chart.ganzhi.month }}</td>
                  <td class="qmr-td-gz">{{ chart.ganzhi.day }}</td>
                  <td class="qmr-td-gz">{{ chart.ganzhi.time }}</td>
                  <td>{{ chart.ganzhi.time_xun }}</td>
                  <td>{{ xunkongText }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 九宫盘面 ============ -->
      <section class="qmr-section">
        <h3 class="qmr-section-title">{{ $t('qimen.chartTitle') }}</h3>
        <div class="qmr-card qmr-pan">
          <div class="qmr-grid">
            <template v-for="row in [0, 1, 2]" :key="row">
              <template v-for="col in [0, 1, 2]" :key="col">
                <div
                  v-if="palaceAt(row, col)"
                  class="qmr-gong"
                  :class="{
                    'qmr-gong-zhifu': palaceAt(row, col)!.palace === chart.chart.zhifu.palace,
                    'qmr-gong-zhishi': palaceAt(row, col)!.palace === chart.chart.zhishi.palace,
                    'qmr-gong-kong': chart.chart.kongwang_palaces.includes(palaceAt(row, col)!.palace),
                    'qmr-gong-center': palaceAt(row, col)!.is_center,
                  }"
                >
                  <div class="qmr-gong-head">
                    <span class="qmr-gong-name">{{ palaceName(palaceAt(row, col)!.palace) }}</span>
                    <span class="qmr-gong-dir">{{ palaceDirection(palaceAt(row, col)!.palace) }}</span>
                    <span v-if="palaceAt(row, col)!.palace === chart.chart.zhifu.palace" class="qmr-gong-tag">{{ $t('qimen.report.zhifuTag') }}</span>
                    <span v-else-if="palaceAt(row, col)!.palace === chart.chart.zhishi.palace" class="qmr-gong-tag">{{ $t('qimen.report.zhishiTag') }}</span>
                    <span v-if="chart.chart.kongwang_palaces.includes(palaceAt(row, col)!.palace)" class="qmr-gong-kong-tag">{{ $t('qimen.report.kongTag') }}</span>
                  </div>
                  <div class="qmr-gong-stem">
                    <span class="qmr-gong-sky">{{ palaceAt(row, col)!.sky_stem || '—' }}</span>
                    <span class="qmr-gong-earth">{{ palaceAt(row, col)!.earth_stem }}</span>
                  </div>
                  <div class="qmr-gong-star-door">
                    <span class="qmr-gong-star">{{ palaceAt(row, col)!.star }}</span>
                    <span v-if="palaceAt(row, col)!.door" class="qmr-gong-door">{{ palaceAt(row, col)!.door }}</span>
                  </div>
                  <div v-if="palaceAt(row, col)!.god" class="qmr-gong-god">{{ palaceAt(row, col)!.god }}</div>
                </div>
              </template>
            </template>
          </div>
          <p class="qmr-pan-legend">{{ $t('qimen.report.panLegend') }}</p>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="qmr-row qmr-ai-row">
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">01</span>{{ $t('qimen.report.secConfirmed') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['已确认信息', 'Confirmed', '已确认']))" />
        </div>
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">02</span>{{ $t('qimen.report.secRules') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['使用规则', 'Rules', '规则']))" />
        </div>
      </section>

      <section class="qmr-row qmr-ai-row">
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">03</span>{{ $t('qimen.report.secChartSummary') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['盘面摘要', 'Chart Summary', '盘面']))" />
        </div>
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">04</span>{{ $t('qimen.report.secYongshen') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['用神与关键依据', '用神', 'Key Basis']))" />
        </div>
      </section>

      <!-- ============ 核心判断 ============ -->
      <section class="qmr-section">
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">05</span>{{ $t('qimen.report.secJudgement') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['核心判断', 'Core Judgement', '判断']))" />
        </div>
      </section>

      <!-- ============ 方位 / 时机 / 行动建议 ============ -->
      <section class="qmr-section">
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">06</span>{{ $t('qimen.report.secAdvice') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['方位', '行动建议', '建议', 'Advice']))" />
        </div>
      </section>

      <!-- ============ 风险提示与免责声明 ============ -->
      <section class="qmr-section">
        <div class="qmr-card qmr-ai">
          <h3 class="qmr-ai-title"><span class="qmr-ai-no">07</span>{{ $t('qimen.report.secRisk') }}</h3>
          <div class="qmr-ai-body qmr-md" v-html="renderSection(pickSection(['风险提醒', '风险', '免责', 'Disclaimer']))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="qmr-streaming">
        <span class="qmr-streaming-dot" />
        {{ $t('qimen.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="qmr-error">
        <p>{{ error }}</p>
        <button type="button" class="qmr-retry" @click="$emit('retry')">{{ $t('common.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="qmr-foot">
        <span class="qmr-foot-note">ⓘ {{ $t('qimen.report.footerNote') }}</span>
        <span class="qmr-seal qmr-seal-foot">{{ $t('qimen.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { QimenChartResponse, PalaceData } from '~/types/qimen'

interface QimenFormInput {
  eventType?: string
  description?: string
  extra?: Record<string, any>
  questionTime?: string
  question_type?: string
  question_label?: string
}

interface Props {
  chart: QimenChartResponse
  userInput?: QimenFormInput | null
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const c = computed(() => props.chart.chart)

const eventTypeKey = computed(() => props.userInput?.eventType || props.userInput?.question_type || 'general')
const eventTypeText = computed(() => {
  const key = `qimen.eventType.${eventTypeKey.value}`
  const v = t(key)
  return v === key ? eventTypeKey.value : v
})

const extraLabelMap: Record<string, string> = {
  opponentDesc: 'qimen.form.opponentDesc',
  myGoal: 'qimen.form.myGoal',
  lastSeenTime: 'qimen.form.lastSeenTime',
  lastSeenPlace: 'qimen.form.lastSeenPlace',
  targetDesc: 'qimen.form.targetDesc',
  relationship: 'qimen.form.relationship',
  eventKind: 'qimen.form.eventKind',
  timeRange: 'qimen.form.timeRange',
  targetDirection: 'qimen.form.targetDirection',
}

const extraLines = computed(() => {
  const extra = props.userInput?.extra
  if (!extra) return []
  return Object.entries(extra)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ label: t(extraLabelMap[k] ?? k), value: String(v) }))
})

const dunTypeText = computed(() => {
  const mapped = t(`qimen.dunTypeMap.${c.value.dun_type}`)
  return mapped || c.value.dun_type
})

const titleText = computed(() =>
  t('qimen.report.titleValue', { type: dunTypeText.value, ju: c.value.ju_number }))

const subtitleText = computed(() =>
  t('qimen.report.subtitleValue', { yuan: c.value.yuan, xunshou: c.value.xunshou }))

const jieqiLine = computed(() => {
  const jq = props.chart.calendar?.jieqi as any
  const name = typeof jq === 'string' ? jq : jq?.active_jie || '—'
  return t('qimen.summary.jieqi', { jieqi: name })
})

const lunarLine = computed(() => {
  const l = props.chart.calendar?.lunar
  if (!l) return ''
  return t('qimen.report.lunarValue', {
    month: l.month_text,
    day: l.day_text,
    ganzhi: props.chart.ganzhi.year,
  })
})

function palaceLoc(palace: number): string {
  return t('qimen.report.palaceLoc', {
    palace,
    name: palaceName(palace),
    direction: palaceDirection(palace),
  })
}

const kongwangText = computed(() =>
  c.value.kongwang?.length ? c.value.kongwang.join('、') : t('qimen.report.none'))

const kongwangPalacesText = computed(() => {
  const ps = c.value.kongwang_palaces
  if (!ps?.length) return ''
  return ps.map(p => palaceName(p)).join('、') + t('qimen.report.palaceSuffix')
})

const xunkongText = computed(() => {
  const x = props.chart.ganzhi.time_xunkong
  return Array.isArray(x) ? x.join('、') : (x || '—')
})

/* ---------- 五行能量分布（天盘干 + 九星 + 八门） ---------- */

const GAN_WX: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}
const STAR_WX: Record<string, string> = {
  天蓬: '水', 天芮: '土', 天冲: '木', 天辅: '木', 天禽: '土', 天心: '金', 天柱: '金', 天任: '土', 天英: '火',
}
const DOOR_WX: Record<string, string> = {
  休门: '水', 生门: '土', 伤门: '木', 杜门: '木', 景门: '火', 死门: '土', 惊门: '金', 开门: '金',
}

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }

const wuxingRows = computed(() => {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  for (const p of c.value.palaces) {
    if (p.sky_stem && GAN_WX[p.sky_stem]) counts[GAN_WX[p.sky_stem]!]!++
    if (p.star && STAR_WX[p.star]) counts[STAR_WX[p.star]!]!++
    if (p.door && DOOR_WX[p.door]) counts[DOOR_WX[p.door]!]!++
  }
  const max = Math.max(1, ...Object.values(counts))
  return (['木', '火', '土', '金', '水'] as const).map(wx => ({
    key: wx,
    label: wx,
    count: counts[wx]!,
    pct: Math.round((counts[wx]! / max) * 100),
    color: WX_COLORS[wx]!,
  }))
})

/* ---------- 九宫盘面 ---------- */

// 洛书顺序：4 9 2 / 3 5 7 / 8 1 6
const luoShuMap: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

function palaceAt(row: number, col: number): PalaceData | undefined {
  const num = luoShuMap[row]?.[col]
  if (!num) return undefined
  return c.value.palaces.find(p => p.palace === num)
}

function palaceName(palace: number): string {
  return t(`qimen.palaceNames.${palace}`)
}
function palaceDirection(palace: number): string {
  return t(`qimen.palaceDirections.${palace}`)
}

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('qimen.report.pending'))

const aiSections = computed<Record<string, string>>(() => {
  const text = props.aiContent || ''
  const map: Record<string, string> = {}
  if (!text) return map
  const raws = text.split(/\n(?=##\s)/)
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').replace(/^\d+[.、)]\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) map[title] = content
  }
  return map
})

/** AI 章节标题带序号/双语变体，按候选关键词包含匹配 */
function pickSection(keywords: string[]): string | undefined {
  const sections = aiSections.value
  for (const kw of keywords) {
    if (sections[kw]) return sections[kw]
  }
  for (const kw of keywords) {
    const key = Object.keys(sections).find(k => k.includes(kw))
    if (key) return sections[key]
  }
  return undefined
}

function firstSentence(text: string, maxLen: number): string {
  const plain = text.replace(/[#*]/g, '').replace(/\n/g, ' ').trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').trim()
  return first.slice(0, maxLen)
}

const confirmedText = computed(() => {
  const content = pickSection(['已确认信息', 'Confirmed', '已确认']) ?? ''
  return content ? firstSentence(content, 60) : ''
})

const coreJudgement = computed(() => {
  const content = pickSection(['核心判断', 'Core Judgement', '判断']) ?? ''
  return content ? firstSentence(content, 60) : ''
})

const yongshenText = computed(() => {
  const content = pickSection(['用神与关键依据', '用神', 'Key Basis']) ?? ''
  return content ? firstSentence(content, 60) : ''
})

const verdictText = computed(() => {
  const j = coreJudgement.value
  if (!j) return t('qimen.report.verdictPending')
  if (/不宜|不可|难成|不利|避|凶|阻碍|谨慎/.test(j)) return t('qimen.report.verdictCaution')
  if (/可成|有利|宜|吉|顺利|可行|积极/.test(j)) return t('qimen.report.verdictFavorable')
  return t('qimen.report.verdictNeutral')
})

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="qmr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 ZhouyiReport / BaziZiweiReport 同系） ========== */
.qmr {
  --qmr-bg: #f2ede3;
  --qmr-sheet: #faf6ec;
  --qmr-card: #fffdf6;
  --qmr-ink: #2e2a24;
  --qmr-ink-soft: #55503f;
  --qmr-ink-faint: #8a8272;
  --qmr-line: #d8d0bd;
  --qmr-line-soft: #e6dfcd;
  --qmr-accent: #8c2f26;
  --qmr-accent-soft: #a8512e;
  --qmr-star: #8c6d1f;
  --qmr-green: #4a7c59;
  border-radius: 12px;
  background: var(--qmr-bg);
  padding: 18px;
  color: var(--qmr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.qmr-sheet {
  background: var(--qmr-sheet);
  border: 1px solid var(--qmr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.qmr-head { border-bottom: 2px solid var(--qmr-ink); padding-bottom: 16px; }
.qmr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.qmr-brand { display: flex; align-items: center; gap: 8px; }
.qmr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--qmr-accent);
  color: var(--qmr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.qmr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--qmr-ink-soft); }
.qmr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--qmr-ink-faint); }
.qmr-verdict { color: var(--qmr-green); font-weight: 600; }

.qmr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.qmr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--qmr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.qmr-head-bottom { text-align: center; }
.qmr-meta-line { margin: 2px 0; font-size: 12px; color: var(--qmr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.qmr-row { display: grid; gap: 14px; margin-top: 16px; }
.qmr-row-top { grid-template-columns: 1fr 2.4fr; }
.qmr-ai-row { grid-template-columns: 1fr 1fr; }
.qmr-section { margin-top: 16px; }

.qmr-card {
  background: var(--qmr-card);
  border: 1px solid var(--qmr-line);
  padding: 14px 16px;
}
.qmr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--qmr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.qmr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 问事信息卡 ---------- */
.qmr-query { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.qmr-query-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.qmr-ico { color: var(--qmr-accent-soft); font-size: 12px; }
.qmr-query-label { color: var(--qmr-ink-faint); min-width: 30px; white-space: nowrap; }
.qmr-query-value { color: var(--qmr-ink); letter-spacing: 0.5px; line-height: 1.6; }

/* ---------- 盘面速览 ---------- */
.qmr-yinzheng-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.qmr-mini { border: 1px dashed var(--qmr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.qmr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--qmr-accent-soft); letter-spacing: 1px; }
.qmr-mini-head-star { color: var(--qmr-star); }
.qmr-mini-head-warn { color: var(--qmr-accent); }
.qmr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--qmr-ink-soft); }
.qmr-point { margin-bottom: 7px; }
.qmr-point:last-child { margin-bottom: 0; }
.qmr-point-title { font-size: 12px; font-weight: 700; color: var(--qmr-ink); display: flex; gap: 5px; align-items: baseline; }
.qmr-point-title-warn { color: var(--qmr-accent); font-weight: 400; }
.qmr-point-ico { font-size: 10px; color: var(--qmr-accent); }

/* ---------- 核心数据六卡 ---------- */
.qmr-core-grid { display: grid; grid-template-columns: repeat(5, 1fr) 1.6fr; gap: 10px; }
.qmr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.qmr-core-label { font-size: 11px; color: var(--qmr-ink-faint); letter-spacing: 1px; }
.qmr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.qmr-core-value-sm { font-size: 18px; letter-spacing: 1px; }
.qmr-core-sub { font-size: 10px; color: var(--qmr-ink-faint); }

.qmr-core-wuxing { text-align: left; }
.qmr-wuxing { display: flex; flex-direction: column; gap: 5px; }
.qmr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.qmr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.qmr-wuxing-name { width: 12px; color: var(--qmr-ink-soft); }
.qmr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--qmr-line-soft); }
.qmr-wuxing-bar { display: block; height: 100%; }
.qmr-wuxing-pct { width: 18px; text-align: right; color: var(--qmr-ink-faint); }

/* ---------- 四柱干支表 ---------- */
.qmr-table-card { padding: 10px 12px; }
.qmr-table-wrap { overflow-x: auto; }
.qmr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.qmr-table th, .qmr-table td {
  border: 1px solid var(--qmr-line);
  padding: 8px 10px;
  text-align: center;
  line-height: 1.5;
}
.qmr-table thead th {
  background: var(--qmr-line-soft);
  font-weight: 700;
  color: var(--qmr-ink);
  letter-spacing: 1px;
  font-size: 11px;
}
.qmr-table td { color: var(--qmr-ink-soft); }
.qmr-td-gz { font-size: 16px; font-weight: 700; color: var(--qmr-ink); letter-spacing: 2px; }

/* ---------- 九宫盘面 ---------- */
.qmr-pan { padding: 14px; }
.qmr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.qmr-gong {
  border: 1px solid var(--qmr-line-soft);
  background: var(--qmr-card);
  padding: 8px 10px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 96px;
}
.qmr-gong-zhifu { border: 1.5px solid var(--qmr-accent); background: rgba(140, 47, 38, 0.04); }
.qmr-gong-zhishi:not(.qmr-gong-zhifu) { border: 1.5px solid var(--qmr-star); background: rgba(140, 109, 31, 0.04); }
.qmr-gong-kong { background-image: repeating-linear-gradient(135deg, transparent 0 6px, rgba(138, 130, 114, 0.08) 6px 12px); }
.qmr-gong-center { opacity: 0.75; }
.qmr-gong-head { display: flex; align-items: baseline; gap: 5px; font-size: 9px; color: var(--qmr-ink-faint); }
.qmr-gong-name { font-weight: 700; color: var(--qmr-ink-soft); font-size: 11px; }
.qmr-gong-zhifu .qmr-gong-name { color: var(--qmr-accent); }
.qmr-gong-tag {
  font-size: 8px; border: 1px solid var(--qmr-accent); color: var(--qmr-accent);
  padding: 0 3px; line-height: 1.5; border-radius: 2px; letter-spacing: 1px;
}
.qmr-gong-kong-tag {
  font-size: 8px; border: 1px dashed var(--qmr-ink-faint); color: var(--qmr-ink-faint);
  padding: 0 3px; line-height: 1.5; border-radius: 2px;
}
.qmr-gong-stem { display: flex; align-items: baseline; gap: 8px; }
.qmr-gong-sky { font-size: 24px; font-weight: 700; line-height: 1.2; color: var(--qmr-ink); }
.qmr-gong-earth { font-size: 12px; color: var(--qmr-ink-faint); }
.qmr-gong-star-door { display: flex; gap: 8px; font-size: 12px; }
.qmr-gong-star { color: var(--qmr-accent-soft); font-weight: 600; }
.qmr-gong-door { color: var(--qmr-ink-soft); }
.qmr-gong-god { margin-top: auto; font-size: 10px; color: var(--qmr-ink-faint); border-top: 1px dashed var(--qmr-line-soft); padding-top: 3px; }
.qmr-pan-legend { margin: 8px 2px 0; font-size: 10px; color: var(--qmr-ink-faint); }

/* ---------- AI 章节 ---------- */
.qmr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--qmr-line-soft);
  padding-bottom: 8px;
}
.qmr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--qmr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.qmr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--qmr-ink-soft); }

.qmr-md :deep(p) { margin: 0 0 0.7em; }
.qmr-md :deep(p:last-child) { margin-bottom: 0; }
.qmr-md :deep(strong) { color: var(--qmr-ink); font-weight: 700; }
.qmr-md :deep(ul), .qmr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.qmr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.qmr-md :deep(h3), .qmr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--qmr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.qmr-md { overflow-x: auto; }
.qmr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.qmr-md :deep(th), .qmr-md :deep(td) { border: 1px solid var(--qmr-line); padding: 4px 6px; text-align: left; }
.qmr-md :deep(th) { background: var(--qmr-line-soft); font-weight: 700; color: var(--qmr-ink); }
.qmr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--qmr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.qmr-md :deep(.qmr-pending), .qmr-pending { color: var(--qmr-ink-faint); font-style: italic; }

/* ---------- 流式/错误 ---------- */
.qmr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--qmr-ink-faint); letter-spacing: 1px;
}
.qmr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--qmr-accent);
  animation: qmr-pulse 1s ease-in-out infinite;
}
@keyframes qmr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.qmr-error { margin-top: 14px; text-align: center; color: var(--qmr-accent); font-size: 12px; }
.qmr-retry {
  margin-top: 8px;
  border: 1px solid var(--qmr-accent);
  background: transparent;
  color: var(--qmr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.qmr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.qmr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--qmr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.qmr-foot-note { font-size: 10px; color: var(--qmr-ink-faint); }
.qmr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .qmr-row-top { grid-template-columns: 1fr; }
  .qmr-core-grid { grid-template-columns: repeat(3, 1fr); }
}

.qmr-ai, .qmr-core-grid, .qmr-grid, .qmr-table-wrap { min-width: 0; }

@media (max-width: 720px) {
  .qmr { padding: 8px; }
  .qmr-sheet { padding: 16px 12px; }
  .qmr-ai-row { grid-template-columns: 1fr; }
  .qmr-yinzheng-grid { grid-template-columns: 1fr; }
  .qmr-title { font-size: 22px; letter-spacing: 2px; }
  .qmr-core-grid { grid-template-columns: 1fr 1fr; }
  .qmr-core-wuxing { grid-column: 1 / -1; }
  .qmr-gong { padding: 6px 7px; min-height: 84px; }
  .qmr-gong-sky { font-size: 18px; }
  .qmr-gong-star-door { font-size: 10px; }
  .qmr-td-gz { font-size: 13px; }
  .qmr-table { min-width: 520px; }
}
</style>
