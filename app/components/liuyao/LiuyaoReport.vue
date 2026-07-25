<template>
  <div class="lyrp">
    <div class="lyrp-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="lyrp-head">
        <div class="lyrp-head-top">
          <div class="lyrp-brand">
            <div class="lyrp-seal">{{ $t('liuyaoDivination.report.seal') }}</div>
            <span class="lyrp-brand-name">{{ $t('liuyaoDivination.report.brandName') }}</span>
          </div>
          <div class="lyrp-head-right">
            <span class="lyrp-time">{{ $t('liuyaoDivination.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="lyrp-method">{{ $t('liuyaoDivination.report.methodNote') }}</span>
          </div>
        </div>

        <h1 class="lyrp-title">{{ titleText }}</h1>
        <p class="lyrp-subtitle">{{ subtitleText }}</p>

        <div class="lyrp-head-bottom">
          <p v-if="lunarLine" class="lyrp-meta-line">{{ lunarLine }}</p>
          <p v-if="temporalLine" class="lyrp-meta-line">{{ temporalLine }}</p>
        </div>
      </header>

      <!-- ============ 所问之事 + 断卦提要 ============ -->
      <section class="lyrp-row lyrp-row-top">
        <div class="lyrp-card lyrp-query">
          <div class="lyrp-query-line">
            <span class="lyrp-ico">❖</span>
            <span class="lyrp-query-label">{{ $t('liuyaoDivination.report.queryLabel') }}</span>
            <span class="lyrp-query-value">{{ query || $t('liuyaoDivination.report.queryEmpty') }}</span>
          </div>
          <div class="lyrp-query-line">
            <span class="lyrp-ico">✦</span>
            <span class="lyrp-query-label">{{ $t('liuyaoDivination.report.palaceLabel') }}</span>
            <span class="lyrp-query-value">{{ palaceText }}</span>
          </div>
          <div class="lyrp-query-line">
            <span class="lyrp-ico">☯</span>
            <span class="lyrp-query-label">{{ $t('liuyaoDivination.report.shiYingLabel') }}</span>
            <span class="lyrp-query-value">{{ shiYingText }}</span>
          </div>
        </div>

        <div class="lyrp-card lyrp-verdict-card">
          <div class="lyrp-verdict-left">
            <div class="lyrp-verdict-label">{{ $t('liuyaoDivination.report.dongYaoLabel') }}</div>
            <div class="lyrp-verdict-badge">{{ dongYaoText }}</div>
            <div class="lyrp-verdict-relation">{{ focusGuidance }}</div>
          </div>
          <div class="lyrp-verdict-right">
            <h4 class="lyrp-mini-head">★ {{ $t('liuyaoDivination.report.yaoCiTitle') }}</h4>
            <p class="lyrp-yaoci">{{ yaoCi || $t('liuyaoDivination.report.noYaoCi') }}</p>
            <p v-if="guaCi" class="lyrp-guaci">{{ $t('liuyaoDivination.report.guaCiLabel') }}{{ guaCi }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 三卦流转 ============ -->
      <section class="lyrp-section">
        <h3 class="lyrp-section-title">{{ $t('liuyaoDivination.report.triGuaTitle') }}</h3>
        <div class="lyrp-gua-grid">
          <div class="lyrp-gua">
            <div class="lyrp-gua-head">
              <span class="lyrp-gua-tag">{{ $t('liuyaoDivination.report.benGuaTag') }}</span>
              <span class="lyrp-gua-time">{{ $t('liuyaoDivination.report.timeNow') }}</span>
            </div>
            <div class="lyrp-yao-stack">
              <div
                v-for="(polarity, i) in benPolarityDisplay"
                :key="i"
                class="lyrp-yao"
                :class="{ 'lyrp-yao-dong': movingPositions.includes(6 - i) }"
              >
                <template v-if="polarity === 'yang'"><span class="lyrp-yao-solid" /></template>
                <template v-else><span class="lyrp-yao-half" /><span class="lyrp-yao-half" /></template>
              </div>
            </div>
            <div class="lyrp-gua-name">{{ result.hexagram?.本卦 }}</div>
            <div class="lyrp-gua-meaning">{{ benGuaInfo?.meaning }}</div>
            <div class="lyrp-gua-foot">
              <span class="lyrp-gua-trigram">{{ trigramTextOf(result.primary_hexagram) }}</span>
            </div>
          </div>
          <div class="lyrp-gua">
            <div class="lyrp-gua-head">
              <span class="lyrp-gua-tag">{{ $t('liuyaoDivination.report.huGuaTag') }}</span>
              <span class="lyrp-gua-time">{{ $t('liuyaoDivination.report.timeMid') }}</span>
            </div>
            <div class="lyrp-yao-stack">
              <div v-for="(polarity, i) in huPolarityDisplay" :key="i" class="lyrp-yao">
                <template v-if="polarity === 'yang'"><span class="lyrp-yao-solid" /></template>
                <template v-else><span class="lyrp-yao-half" /><span class="lyrp-yao-half" /></template>
              </div>
            </div>
            <div class="lyrp-gua-name">{{ result.hexagram?.互卦 }}</div>
            <div class="lyrp-gua-meaning">{{ huGuaInfo?.meaning }}</div>
            <div class="lyrp-gua-foot">
              <span class="lyrp-gua-trigram">{{ trigramTextOf(result.nuclear_hexagram) }}</span>
            </div>
          </div>
          <div class="lyrp-gua">
            <div class="lyrp-gua-head">
              <span class="lyrp-gua-tag">{{ $t('liuyaoDivination.report.bianGuaTag') }}</span>
              <span class="lyrp-gua-time">{{ $t('liuyaoDivination.report.timeFuture') }}</span>
            </div>
            <div class="lyrp-yao-stack">
              <div v-for="(polarity, i) in bianPolarityDisplay" :key="i" class="lyrp-yao">
                <template v-if="polarity === 'yang'"><span class="lyrp-yao-solid" /></template>
                <template v-else><span class="lyrp-yao-half" /><span class="lyrp-yao-half" /></template>
              </div>
            </div>
            <div class="lyrp-gua-name">{{ result.hexagram?.变卦 }}</div>
            <div class="lyrp-gua-meaning">{{ bianGuaInfo?.meaning }}</div>
            <div class="lyrp-gua-foot">
              <span class="lyrp-gua-trigram">{{ trigramTextOf(result.transformed_hexagram) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 六爻排盘 ============ -->
      <section class="lyrp-section">
        <h3 class="lyrp-section-title">{{ $t('liuyaoDivination.report.panTitle') }}</h3>
        <div class="lyrp-table-wrap">
          <table class="lyrp-table">
            <thead>
              <tr>
                <th>{{ $t('liuyaoDivination.report.colYao') }}</th>
                <th>{{ $t('liuyaoDivination.report.colSpirit') }}</th>
                <th>{{ $t('liuyaoDivination.report.colBen') }}</th>
                <th>{{ $t('liuyaoDivination.report.colBian') }}</th>
                <th>{{ $t('liuyaoDivination.report.colStrength') }}</th>
                <th>{{ $t('liuyaoDivination.report.colTemporal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in panRows"
                :key="row.position"
                :class="{ 'lyrp-row-moving': row.isMoving }"
              >
                <td class="lyrp-td-yao">
                  <span class="lyrp-yao-mini">
                    <template v-if="row.polarity === 'yang'"><span class="lyrp-yao-mini-solid" /></template>
                    <template v-else><span class="lyrp-yao-mini-half" /><span class="lyrp-yao-mini-half" /></template>
                  </span>
                  <span class="lyrp-yao-label">{{ row.label }}</span>
                  <span v-if="row.role" class="lyrp-role-chip" :class="'lyrp-role-' + (row.role === '世' ? 'shi' : 'ying')">{{ row.role }}</span>
                </td>
                <td>{{ row.sixSpirit }}</td>
                <td>
                  <span class="lyrp-najia">{{ row.benNajia }}</span>
                  <span class="lyrp-relation">{{ row.benRelation }}</span>
                  <span v-if="row.isMoving" class="lyrp-moving-mark">{{ row.value === 6 ? '○' : '●' }}</span>
                </td>
                <td class="lyrp-td-bian">
                  <template v-if="row.isMoving && row.bianNajia">
                    <span class="lyrp-najia">{{ row.bianNajia }}</span>
                    <span class="lyrp-relation">{{ row.bianRelation }}</span>
                  </template>
                  <span v-else class="lyrp-dash">—</span>
                </td>
                <td>
                  <div class="lyrp-strength">
                    <span class="lyrp-strength-track"><span class="lyrp-strength-bar" :class="{ 'lyrp-strength-neg': row.score < 0 }" :style="{ width: row.strengthPct + '%' }" /></span>
                    <span class="lyrp-strength-score">{{ row.score > 0 ? '+' : '' }}{{ row.score }}</span>
                  </div>
                </td>
                <td class="lyrp-td-notes">
                  <span v-if="row.voided" class="lyrp-void-chip">{{ $t('liuyaoDivination.report.voided') }}</span>
                  {{ row.notes }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="lyrp-row lyrp-ai-row">
        <div class="lyrp-card lyrp-ai">
          <h3 class="lyrp-ai-title"><span class="lyrp-ai-no">01</span>{{ $t('liuyaoDivination.report.secOverview') }}</h3>
          <div class="lyrp-ai-body lyrp-md" v-html="renderSection(pickSection('卦象总览', 'Hexagram Overview'))" />
        </div>
        <div class="lyrp-card lyrp-ai">
          <h3 class="lyrp-ai-title"><span class="lyrp-ai-no">02</span>{{ $t('liuyaoDivination.report.secShiying') }}</h3>
          <div class="lyrp-ai-body lyrp-md" v-html="renderSection(pickSection('世应分析', 'Self-Response Analysis'))" />
        </div>
      </section>

      <section class="lyrp-row lyrp-ai-row">
        <div class="lyrp-card lyrp-ai">
          <h3 class="lyrp-ai-title"><span class="lyrp-ai-no">03</span>{{ $t('liuyaoDivination.report.secMoving') }}</h3>
          <div class="lyrp-ai-body lyrp-md" v-html="renderSection(pickSection('动爻解读', 'Moving Lines Interpretation'))" />
        </div>
        <div class="lyrp-card lyrp-ai">
          <h3 class="lyrp-ai-title"><span class="lyrp-ai-no">04</span>{{ $t('liuyaoDivination.report.secYongshen') }}</h3>
          <div class="lyrp-ai-body lyrp-md" v-html="renderSection(pickSection('用神分析', 'Useful God Analysis'))" />
        </div>
      </section>

      <!-- ============ 综合判断 ============ -->
      <section class="lyrp-section">
        <div class="lyrp-card lyrp-ai">
          <h3 class="lyrp-ai-title"><span class="lyrp-ai-no">05</span>{{ $t('liuyaoDivination.report.secSynthesis') }}</h3>
          <div class="lyrp-final">
            <div class="lyrp-final-thesis">
              <div class="lyrp-final-thesis-label">{{ $t('liuyaoDivination.report.summaryLabel') }}</div>
              <div class="lyrp-final-thesis-text">{{ summaryText }}</div>
              <div class="lyrp-final-thesis-note">{{ result.hexagram?.本卦 }}<template v-if="!isStaticGua"> {{ $t('liuyaoDivination.report.titleArrow') }} {{ result.hexagram?.变卦 }}</template> · {{ dongYaoText }}</div>
            </div>
            <div class="lyrp-ai-body lyrp-md lyrp-final-md" v-html="renderSection(pickSection('综合判断', 'Synthesis'))" />
          </div>
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="lyrp-streaming">
        <span class="lyrp-streaming-dot" />
        {{ $t('liuyaoDivination.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="lyrp-error">
        <p>{{ error }}</p>
        <button type="button" class="lyrp-retry" @click="$emit('retry')">{{ $t('liuyaoDivination.report.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="lyrp-foot">
        <span class="lyrp-foot-note">ⓘ {{ $t('liuyaoDivination.report.footerNote') }}</span>
        <span class="lyrp-seal lyrp-seal-foot">{{ $t('liuyaoDivination.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { LiuYaoResult, LiuyaoEngineLine } from '~/types/liuyao'
import { LIUSHISI_GUA } from '~/utils/zhouyi/constants'
import { YAOCI } from '~/utils/zhouyi/yaoci'

interface Props {
  result: LiuYaoResult
  query: string
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

const linesDetail = computed<LiuyaoEngineLine[]>(() => props.result.lines_detail_top_down ?? [])
const transformedDetail = computed<LiuyaoEngineLine[]>(() => props.result.transformed_lines_detail_top_down ?? [])

const movingPositions = computed<number[]>(() => {
  if (props.result.moving_lines?.length) return props.result.moving_lines
  return linesDetail.value.filter(l => l.moving).map(l => l.position)
})

const isStaticGua = computed(() => movingPositions.value.length === 0)

const GUA_BY_NAME = new Map(LIUSHISI_GUA.map(g => [g.name, g]))
function guaInfoByName(name?: string) {
  return name ? GUA_BY_NAME.get(name) : undefined
}
function guaInfoByNumber(num?: number) {
  return num ? LIUSHISI_GUA.find(g => g.id === num) : undefined
}

const benGuaInfo = computed(() => guaInfoByNumber(props.result.primary_hexagram?.number) ?? guaInfoByName(props.result.hexagram?.本卦))
const bianGuaInfo = computed(() => guaInfoByNumber(props.result.transformed_hexagram?.number) ?? guaInfoByName(props.result.hexagram?.变卦))
const huGuaInfo = computed(() => guaInfoByNumber(props.result.nuclear_hexagram?.number) ?? guaInfoByName(props.result.hexagram?.互卦))

/** 主断动爻：取首个动爻（自初爻起算），静卦回退到 focus_rule 指引 */
const primaryMovingPosition = computed(() => movingPositions.value.length >= 1 ? movingPositions.value[0]! : null)

const yaoCi = computed(() => {
  const pos = primaryMovingPosition.value
  const id = benGuaInfo.value?.id
  if (!pos || !id) return ''
  return YAOCI[id]?.[pos] || ''
})

const guaCi = computed(() => benGuaInfo.value?.guaci || '')

const focusGuidance = computed(() => props.result.focus_rule?.guidance || '')

const dongYaoText = computed(() => {
  const moving = linesDetail.value.filter(l => l.moving)
  if (moving.length === 0) return t('liuyaoDivination.report.staticGua')
  return moving.map(l => l.label).join('、')
})

const titleText = computed(() => {
  const ben = props.result.hexagram?.本卦 || ''
  const bian = props.result.hexagram?.变卦 || ''
  if (!ben) return t('liuyaoDivination.report.titleFallback')
  if (isStaticGua.value || !bian || ben === bian) return ben
  return `${ben} ${t('liuyaoDivination.report.titleArrow')} ${bian}`
})

const subtitleText = computed(() => t('liuyaoDivination.report.subtitleValue', {
  ben: props.result.hexagram?.本卦 || '—',
  hu: props.result.hexagram?.互卦 || '—',
  bian: props.result.hexagram?.变卦 || '—',
}))

const palaceText = computed(() => {
  const p = props.result.palace_assignment
  if (!p?.palace) return '—'
  const seq = p.sequence_label ? ` · ${p.sequence_label}` : ''
  const el = p.palace_element ? p.palace_element : ''
  return `${p.palace}${t('liuyaoDivination.report.palaceSuffix')} ${el}${seq}`
})

const shiYingText = computed(() => {
  const shi = props.result.hexagram?.世爻位
  const ying = props.result.hexagram?.应爻位
  if (!shi && !ying) return '—'
  return t('liuyaoDivination.report.shiYingValue', { shi: shi || '—', ying: ying || '—' })
})

const lunarLine = computed(() => {
  const lunar = props.result.temporal_context?.lunar
  if (!lunar?.date_text) return ''
  return `${lunar.date_text} · ${lunar.year_ganzhi || ''}年 ${lunar.month_ganzhi || ''}月 ${lunar.day_ganzhi || ''}日 ${lunar.time_ganzhi || ''}时`
})

const temporalLine = computed(() => {
  const tc = props.result.temporal_context
  if (!tc) return ''
  return t('liuyaoDivination.report.temporalValue', {
    yueJian: tc.月建 || '—',
    riChen: tc.日辰 || '—',
    shiChen: tc.时辰 || '—',
    xunKong: tc.旬空 || '—',
  })
})

/* ---------- 三卦爻线 ---------- */

type Polarity = 'yin' | 'yang'

function polarityOfHexagram(detail: LiuyaoEngineLine[], upper?: string, lower?: string): Polarity[] {
  if (detail.length === 6) {
    return detail.map(l => l.polarity === 'yang' ? 'yang' : 'yin')
  }
  // 互卦无爻明细，由上下卦推导（自上而下）
  const TRIGRAM_LINES: Record<string, Polarity[]> = {
    // 三爻自上而下
    '乾': ['yang', 'yang', 'yang'],
    '兑': ['yin', 'yang', 'yang'],
    '离': ['yang', 'yin', 'yang'],
    '震': ['yin', 'yin', 'yang'],
    '巽': ['yang', 'yang', 'yin'],
    '坎': ['yin', 'yang', 'yin'],
    '艮': ['yang', 'yin', 'yin'],
    '坤': ['yin', 'yin', 'yin'],
  }
  const up = upper ? TRIGRAM_LINES[upper] : undefined
  const lo = lower ? TRIGRAM_LINES[lower] : undefined
  if (up && lo) return [...up, ...lo]
  return []
}

const benPolarityDisplay = computed(() => polarityOfHexagram(linesDetail.value, props.result.primary_hexagram?.upper_trigram, props.result.primary_hexagram?.lower_trigram))
const huPolarityDisplay = computed(() => polarityOfHexagram([], props.result.nuclear_hexagram?.upper_trigram, props.result.nuclear_hexagram?.lower_trigram))
const bianPolarityDisplay = computed(() => polarityOfHexagram(transformedDetail.value, props.result.transformed_hexagram?.upper_trigram, props.result.transformed_hexagram?.lower_trigram))

function trigramTextOf(hex?: { upper_trigram?: string; lower_trigram?: string }): string {
  if (!hex?.upper_trigram || !hex?.lower_trigram) return ''
  return `${hex.upper_trigram} / ${hex.lower_trigram}`
}

/* ---------- 排盘表格 ---------- */

const SCORE_CLAMP = 5

interface PanRow {
  position: number
  label: string
  polarity: Polarity
  role: string | null
  sixSpirit: string
  benNajia: string
  benRelation: string
  bianNajia: string
  bianRelation: string
  isMoving: boolean
  value: number
  score: number
  strengthPct: number
  notes: string
  voided: boolean
}

const panRows = computed<PanRow[]>(() => {
  return linesDetail.value.map((line, idx) => {
    const bian = transformedDetail.value[idx]
    const score = line.temporal?.score ?? 0
    const strengthPct = Math.min(100, Math.round(Math.abs(score) / SCORE_CLAMP * 100))
    return {
      position: line.position,
      label: line.label,
      polarity: line.polarity === 'yang' ? 'yang' : 'yin',
      role: line.role ?? (line.shi ? '世' : line.ying ? '应' : null),
      sixSpirit: line.six_spirit || '',
      benNajia: line.najia_ganzhi ? `${line.najia_ganzhi}${line.branch_element || ''}` : '',
      benRelation: line.relation || '',
      bianNajia: bian?.najia_ganzhi ? `${bian.najia_ganzhi}${bian.branch_element || ''}` : '',
      bianRelation: bian?.relation || '',
      isMoving: !!line.moving,
      value: line.value,
      score,
      strengthPct,
      notes: (line.temporal?.notes || []).filter(n => !n.includes('旬空')).join('、'),
      voided: !!line.temporal?.voided_by_day_xunkong,
    }
  })
})

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('liuyaoDivination.report.pending'))

const SUMMARY_REGEX = /<!--\s*summary:\s*(.+?)\s*-->/

const summaryText = computed(() => {
  const text = props.aiContent || ''
  if (!text) return pendingText.value
  const match = text.match(SUMMARY_REGEX)
  if (match?.[1]) return match[1].trim()
  // 退化：综合判断章节首句
  const synthesis = pickSection('综合判断', 'Synthesis') || pickSection('卦象总览', 'Hexagram Overview') || ''
  const first = synthesis.replace(/[#*]/g, '').replace(/\n/g, ' ').split(/[。！!？?]/)[0]?.trim() ?? ''
  return first.slice(0, 60) || pendingText.value
})

const aiSections = computed<Record<string, string>>(() => {
  const text = (props.aiContent || '').replace(SUMMARY_REGEX, '')
  const map: Record<string, string> = {}
  if (!text) return map
  const raws = text.split(/\n(?=##\s)/)
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) map[title] = content
  }
  return map
})

/** AI 实际输出常为「卦象总览 / Hexagram Overview」双语标题，按中英前缀宽松匹配 */
function pickSection(zhTitle: string, enTitle: string): string | undefined {
  const sections = aiSections.value
  const key = Object.keys(sections).find(k =>
    k.includes(zhTitle) || k.toLowerCase().includes(enTitle.toLowerCase()),
  )
  return key ? sections[key] : undefined
}

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="lyrp-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 ZhouyiReport/BaziZiweiReport 同系） ========== */
.lyrp {
  --lyrp-bg: #f2ede3;
  --lyrp-sheet: #faf6ec;
  --lyrp-card: #fffdf6;
  --lyrp-ink: #2e2a24;
  --lyrp-ink-soft: #55503f;
  --lyrp-ink-faint: #8a8272;
  --lyrp-line: #d8d0bd;
  --lyrp-line-soft: #e6dfcd;
  --lyrp-accent: #8c2f26;
  --lyrp-accent-soft: #a8512e;
  --lyrp-star: #8c6d1f;
  --lyrp-green: #4a7c59;
  border-radius: 12px;
  background: var(--lyrp-bg);
  padding: 18px;
  color: var(--lyrp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.lyrp-sheet {
  background: var(--lyrp-sheet);
  border: 1px solid var(--lyrp-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.lyrp-head { border-bottom: 2px solid var(--lyrp-ink); padding-bottom: 16px; }
.lyrp-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.lyrp-brand { display: flex; align-items: center; gap: 8px; }
.lyrp-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--lyrp-accent);
  color: var(--lyrp-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.lyrp-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--lyrp-ink-soft); }
.lyrp-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--lyrp-ink-faint); }
.lyrp-method { color: var(--lyrp-ink-faint); }

.lyrp-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.lyrp-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--lyrp-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.lyrp-head-bottom { text-align: center; }
.lyrp-meta-line { margin: 2px 0; font-size: 12px; color: var(--lyrp-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.lyrp-row { display: grid; gap: 14px; margin-top: 16px; }
.lyrp-row-top { grid-template-columns: 1fr 2.4fr; }
.lyrp-ai-row { grid-template-columns: 1fr 1fr; }
.lyrp-section { margin-top: 16px; }

.lyrp-card {
  background: var(--lyrp-card);
  border: 1px solid var(--lyrp-line);
  padding: 14px 16px;
}
.lyrp-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 所问之事卡 ---------- */
.lyrp-query { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.lyrp-query-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.lyrp-ico { color: var(--lyrp-accent-soft); font-size: 12px; flex-shrink: 0; }
.lyrp-query-label { color: var(--lyrp-ink-faint); min-width: 30px; flex-shrink: 0; }
.lyrp-query-value { color: var(--lyrp-ink); letter-spacing: 0.5px; line-height: 1.6; word-break: break-all; }

/* ---------- 断卦提要卡 ---------- */
.lyrp-verdict-card { display: grid; grid-template-columns: 150px 1fr; gap: 14px; align-items: stretch; }
.lyrp-verdict-left {
  border: 1.5px solid var(--lyrp-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 12px 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  text-align: center;
}
.lyrp-verdict-label { font-size: 10px; color: var(--lyrp-ink-faint); letter-spacing: 2px; }
.lyrp-verdict-badge { font-size: 22px; font-weight: 700; letter-spacing: 2px; color: var(--lyrp-accent); }
.lyrp-verdict-relation { font-size: 11px; color: var(--lyrp-ink-soft); letter-spacing: 0.5px; line-height: 1.6; }
.lyrp-verdict-right { border-left: 1px dashed var(--lyrp-line); padding-left: 14px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.lyrp-mini-head { margin: 0; font-size: 12px; font-weight: 700; color: var(--lyrp-star); letter-spacing: 1px; }
.lyrp-yaoci { margin: 0; font-size: 14px; line-height: 1.8; color: var(--lyrp-ink); font-weight: 600; letter-spacing: 0.5px; }
.lyrp-guaci { margin: 0; font-size: 11px; line-height: 1.7; color: var(--lyrp-ink-faint); }

/* ---------- 三卦流转 ---------- */
.lyrp-gua-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.lyrp-gua {
  background: var(--lyrp-card);
  border: 1px solid var(--lyrp-line);
  padding: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
}
.lyrp-gua-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; justify-content: center; }
.lyrp-gua-tag { font-size: 10px; font-weight: 700; color: var(--lyrp-accent-soft); letter-spacing: 1px; }
.lyrp-gua-time { font-size: 9px; color: var(--lyrp-ink-faint); }
.lyrp-yao-stack { display: flex; flex-direction: column; gap: 5px; padding: 6px 0; }
.lyrp-yao { display: flex; gap: 14px; width: 96px; height: 7px; }
.lyrp-yao-solid { width: 100%; background: var(--lyrp-ink); }
.lyrp-yao-half { flex: 1; background: var(--lyrp-ink); }
.lyrp-yao-dong .lyrp-yao-solid, .lyrp-yao-dong .lyrp-yao-half { background: var(--lyrp-accent); box-shadow: 0 0 0 1px rgba(140, 47, 38, 0.25); }
.lyrp-gua-name { font-size: 17px; font-weight: 700; letter-spacing: 1px; }
.lyrp-gua-meaning { font-size: 11px; color: var(--lyrp-ink-soft); }
.lyrp-gua-foot { margin-top: auto; display: flex; flex-direction: column; gap: 2px; font-size: 9px; color: var(--lyrp-ink-faint); }
.lyrp-gua-trigram { letter-spacing: 0.5px; }

/* ---------- 六爻排盘表 ---------- */
.lyrp-table-wrap { overflow-x: auto; }
.lyrp-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--lyrp-card);
  border: 1px solid var(--lyrp-line);
  font-size: 12px;
  min-width: 620px;
}
.lyrp-table th {
  background: var(--lyrp-line-soft);
  font-weight: 700;
  color: var(--lyrp-ink);
  padding: 7px 8px;
  text-align: left;
  letter-spacing: 1px;
  font-size: 11px;
  border: 1px solid var(--lyrp-line);
  white-space: nowrap;
}
.lyrp-table td {
  border: 1px solid var(--lyrp-line-soft);
  padding: 7px 8px;
  color: var(--lyrp-ink-soft);
  vertical-align: middle;
}
.lyrp-row-moving td { background: rgba(140, 47, 38, 0.045); }
.lyrp-row-moving .lyrp-najia { color: var(--lyrp-accent); font-weight: 700; }

.lyrp-td-yao { white-space: nowrap; }
.lyrp-yao-mini { display: inline-flex; gap: 5px; width: 34px; height: 5px; vertical-align: middle; margin-right: 6px; }
.lyrp-yao-mini-solid { width: 100%; background: var(--lyrp-ink); }
.lyrp-yao-mini-half { flex: 1; background: var(--lyrp-ink); }
.lyrp-yao-label { font-size: 11px; color: var(--lyrp-ink-faint); }
.lyrp-role-chip {
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
}
.lyrp-role-shi { background: rgba(140, 47, 38, 0.12); color: var(--lyrp-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.lyrp-role-ying { background: rgba(74, 106, 138, 0.12); color: #4a6a8a; border: 1px solid rgba(74, 106, 138, 0.35); }
.lyrp-najia { font-size: 12px; color: var(--lyrp-ink); letter-spacing: 0.5px; }
.lyrp-relation { margin-left: 6px; font-size: 11px; color: var(--lyrp-ink-faint); }
.lyrp-moving-mark { margin-left: 6px; color: var(--lyrp-accent); font-weight: 700; }
.lyrp-td-bian .lyrp-najia { color: var(--lyrp-ink-soft); }
.lyrp-dash { color: var(--lyrp-ink-faint); }

.lyrp-strength { display: flex; align-items: center; gap: 6px; min-width: 96px; }
.lyrp-strength-track { flex: 1; height: 6px; background: var(--lyrp-line-soft); }
.lyrp-strength-bar { display: block; height: 100%; background: var(--lyrp-green); }
.lyrp-strength-neg { background: var(--lyrp-accent-soft); }
.lyrp-strength-score { font-size: 10px; color: var(--lyrp-ink-faint); width: 24px; text-align: right; }
.lyrp-td-notes { font-size: 11px; line-height: 1.6; }
.lyrp-void-chip {
  display: inline-block;
  font-size: 10px;
  padding: 0 5px;
  margin-right: 4px;
  line-height: 1.6;
  border-radius: 2px;
  background: rgba(140, 109, 31, 0.12);
  color: var(--lyrp-star);
  border: 1px solid rgba(140, 109, 31, 0.35);
}

/* ---------- AI 章节 ---------- */
.lyrp-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--lyrp-line-soft);
  padding-bottom: 8px;
}
.lyrp-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--lyrp-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.lyrp-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--lyrp-ink-soft); }

.lyrp-md :deep(p) { margin: 0 0 0.7em; }
.lyrp-md :deep(p:last-child) { margin-bottom: 0; }
.lyrp-md :deep(strong) { color: var(--lyrp-ink); font-weight: 700; }
.lyrp-md :deep(ul), .lyrp-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.lyrp-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.lyrp-md :deep(h3), .lyrp-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--lyrp-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.lyrp-md { overflow-x: auto; }
.lyrp-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.lyrp-md :deep(th), .lyrp-md :deep(td) { border: 1px solid var(--lyrp-line); padding: 4px 6px; text-align: left; }
.lyrp-md :deep(th) { background: var(--lyrp-line-soft); font-weight: 700; color: var(--lyrp-ink); }
.lyrp-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--lyrp-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.lyrp-md :deep(.lyrp-pending), .lyrp-pending { color: var(--lyrp-ink-faint); font-style: italic; }

/* ---------- 05 综合判断 ---------- */
.lyrp-final { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
.lyrp-final-thesis {
  border: 1.5px solid var(--lyrp-accent);
  background: rgba(140, 47, 38, 0.04);
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  justify-content: center;
}
.lyrp-final-thesis-label { font-size: 10px; color: var(--lyrp-ink-faint); letter-spacing: 2px; }
.lyrp-final-thesis-text { font-size: 15px; font-weight: 700; color: var(--lyrp-accent); line-height: 1.7; letter-spacing: 1px; }
.lyrp-final-thesis-note { font-size: 11px; color: var(--lyrp-ink-soft); line-height: 1.6; }
.lyrp-final-md { font-size: 11.5px; }

/* ---------- 流式/错误 ---------- */
.lyrp-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--lyrp-ink-faint); letter-spacing: 1px;
}
.lyrp-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--lyrp-accent);
  animation: lyrp-pulse 1s ease-in-out infinite;
}
@keyframes lyrp-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.lyrp-error { margin-top: 14px; text-align: center; color: var(--lyrp-accent); font-size: 12px; }
.lyrp-retry {
  margin-top: 8px;
  border: 1px solid var(--lyrp-accent);
  background: transparent;
  color: var(--lyrp-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.lyrp-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.lyrp-foot {
  margin-top: 18px;
  border-top: 1px solid var(--lyrp-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.lyrp-foot-note { font-size: 10px; color: var(--lyrp-ink-faint); }
.lyrp-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .lyrp-row-top { grid-template-columns: 1fr; }
  .lyrp-final { grid-template-columns: 1fr; }
}

.lyrp-ai, .lyrp-final, .lyrp-gua-grid { min-width: 0; }

@media (max-width: 720px) {
  .lyrp { padding: 8px; }
  .lyrp-sheet { padding: 16px 12px; }
  .lyrp-ai-row { grid-template-columns: 1fr; }
  .lyrp-title { font-size: 22px; letter-spacing: 2px; }
  .lyrp-gua-grid { grid-template-columns: 1fr; }
  .lyrp-verdict-card { grid-template-columns: 1fr; }
  .lyrp-verdict-right { border-left: none; border-top: 1px dashed var(--lyrp-line); padding-left: 0; padding-top: 10px; }
}
</style>
