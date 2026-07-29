<template>
  <div class="nmr">
    <div class="nmr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="nmr-head">
        <div class="nmr-head-top">
          <div class="nmr-brand">
            <div class="nmr-seal">{{ $t('numerology.report.seal') }}</div>
            <span class="nmr-brand-name">{{ $t('numerology.report.brandName') }}</span>
          </div>
          <div class="nmr-head-right">
            <span class="nmr-time">{{ $t('numerology.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="nmr-verdict">✓ {{ $t('numerology.report.verdict') }}</span>
          </div>
        </div>

        <h1 class="nmr-title">{{ $t('numerology.report.title', { name }) }}</h1>
        <p class="nmr-subtitle">{{ $t('numerology.report.subtitle') }}</p>

        <div class="nmr-head-bottom">
          <p class="nmr-meta-line">{{ $t('numerology.report.totalLine', {
            lifePath: result.核心数字.生命路径数,
            nameNum: result.核心数字.姓名数,
            dominant: result.核心数字.主导数,
            auxiliary: result.核心数字.辅助数,
          }) }}</p>
        </div>
      </header>

      <!-- ============ 信息卡 + 综合画像 ============ -->
      <section class="nmr-row nmr-row-top">
        <div class="nmr-card nmr-profile">
          <div class="nmr-profile-line">
            <span class="nmr-ico">名</span>
            <span class="nmr-profile-label">{{ $t('numerology.report.nameLabel') }}</span>
            <span class="nmr-profile-value">{{ name }}</span>
          </div>
          <div class="nmr-profile-line">
            <span class="nmr-ico">辰</span>
            <span class="nmr-profile-label">{{ $t('numerology.report.birthLabel') }}</span>
            <span class="nmr-profile-value">{{ birthdate }}</span>
          </div>
          <div class="nmr-profile-line">
            <span class="nmr-ico">主</span>
            <span class="nmr-profile-label">{{ $t('numerology.report.dominantLabel') }}</span>
            <span class="nmr-profile-value">{{ result.性格.生命路径.符号 }} · {{ result.核心数字.主导数 }}</span>
          </div>
          <div class="nmr-profile-line">
            <span class="nmr-ico">辅</span>
            <span class="nmr-profile-label">{{ $t('numerology.report.auxiliaryLabel') }}</span>
            <span class="nmr-profile-value">{{ result.性格.姓名映射.符号 }} · {{ result.核心数字.辅助数 }}</span>
          </div>
        </div>

        <div class="nmr-card">
          <h3 class="nmr-card-title">{{ $t('numerology.report.overviewTitle') }}</h3>
          <div class="nmr-overview-grid">
            <div class="nmr-mini">
              <h4 class="nmr-mini-head nmr-mini-head-star">★ {{ $t('numerology.report.coreTagsTitle') }}</h4>
              <div class="nmr-tags">
                <span v-for="tag in result.性格.生命路径.标签" :key="'lp-' + tag" class="nmr-tag">{{ tag }}</span>
              </div>
              <p class="nmr-mini-body">{{ $t('numerology.report.coreTagsNote', { n: result.核心数字.生命路径数, symbol: result.性格.生命路径.符号 }) }}</p>
            </div>
            <div class="nmr-mini">
              <h4 class="nmr-mini-head nmr-mini-head-warn">✦ {{ $t('numerology.report.outerTagsTitle') }}</h4>
              <div class="nmr-tags">
                <span v-for="tag in result.性格.姓名映射.标签" :key="'nm-' + tag" class="nmr-tag nmr-tag-alt">{{ tag }}</span>
              </div>
              <p class="nmr-mini-body">{{ $t('numerology.report.outerTagsNote', { n: result.核心数字.姓名数, symbol: result.性格.姓名映射.符号 }) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 核心数字 ============ -->
      <section class="nmr-section">
        <h3 class="nmr-section-title">{{ $t('numerology.report.coreNumbersTitle') }}</h3>
        <div class="nmr-core-grid">
          <div class="nmr-card nmr-core">
            <div class="nmr-core-label">{{ $t('numerology.lifePathNumber') }}</div>
            <div class="nmr-core-value nmr-core-accent">{{ result.核心数字.生命路径数 }}</div>
            <div class="nmr-core-sub">{{ result.性格.生命路径.符号 }}</div>
          </div>
          <div class="nmr-card nmr-core">
            <div class="nmr-core-label">{{ $t('numerology.nameNumber') }}</div>
            <div class="nmr-core-value nmr-core-accent">{{ result.核心数字.姓名数 }}</div>
            <div class="nmr-core-sub">{{ result.性格.姓名映射.符号 }}</div>
          </div>
          <div class="nmr-card nmr-core">
            <div class="nmr-core-label">{{ $t('numerology.report.dominantRoleLabel') }}</div>
            <div class="nmr-core-value">{{ result.核心数字.主导数 }}</div>
            <div class="nmr-core-sub">{{ $t('numerology.report.dominantRoleSub') }}</div>
          </div>
          <div class="nmr-card nmr-core">
            <div class="nmr-core-label">{{ $t('numerology.report.auxiliaryRoleLabel') }}</div>
            <div class="nmr-core-value">{{ result.核心数字.辅助数 }}</div>
            <div class="nmr-core-sub">{{ $t('numerology.report.auxiliaryRoleSub') }}</div>
          </div>
          <div class="nmr-card nmr-core">
            <div class="nmr-core-label">{{ $t('numerology.report.gaugeLabel') }}</div>
            <div class="nmr-core-value">{{ resonanceScore }}</div>
            <div class="nmr-gauge">
              <div class="nmr-gauge-track">
                <span class="nmr-gauge-zone nmr-gauge-zone-low" />
                <span class="nmr-gauge-zone nmr-gauge-zone-mid" />
                <span class="nmr-gauge-zone nmr-gauge-zone-high" />
                <span class="nmr-gauge-pointer" :style="{ left: resonanceScore + '%' }" />
              </div>
              <div class="nmr-gauge-marks">
                <span>{{ $t('numerology.report.gaugeLow') }}</span>
                <span>{{ $t('numerology.report.gaugeMid') }}</span>
                <span>{{ $t('numerology.report.gaugeHigh') }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 双盘：推演算式 + 数字频度柱状图 ============ -->
      <section class="nmr-row nmr-pans">
        <div class="nmr-card nmr-pan">
          <h3 class="nmr-pan-title">{{ $t('numerology.report.formulaTitle') }}</h3>
          <div class="nmr-formula-line">
            <span class="nmr-formula-label">{{ $t('numerology.report.formulaLifePath') }}</span>
            <span class="nmr-formula-expr">{{ lifePathExpr }}</span>
            <span class="nmr-formula-eq">→ {{ result.核心数字.生命路径数 }}</span>
          </div>
          <div class="nmr-formula-line">
            <span class="nmr-formula-label">{{ $t('numerology.report.formulaName') }}</span>
            <span class="nmr-formula-expr">{{ $t('numerology.report.formulaNameExpr') }}</span>
            <span class="nmr-formula-eq">→ {{ result.核心数字.姓名数 }}</span>
          </div>
          <div class="nmr-hist">
            <h4 class="nmr-hist-title">{{ $t('numerology.report.histTitle') }}</h4>
            <div class="nmr-hist-bars">
              <div
                v-for="row in histogram"
                :key="row.digit"
                class="nmr-hist-col"
                :class="{ 'nmr-hist-col-hot': row.digit === result.核心数字.生命路径数 || row.digit === result.核心数字.姓名数 }"
              >
                <span class="nmr-hist-count">{{ row.count || '' }}</span>
                <span class="nmr-hist-bar-wrap"><span class="nmr-hist-bar" :style="{ height: row.pct + '%' }" /></span>
                <span class="nmr-hist-digit">{{ row.digit }}</span>
              </div>
            </div>
            <p class="nmr-hist-note">{{ $t('numerology.report.histNote') }}</p>
          </div>
        </div>

        <div class="nmr-card nmr-pan">
          <h3 class="nmr-pan-title">{{ $t('numerology.report.radarTitle') }}</h3>
          <svg class="nmr-radar" viewBox="0 0 240 240" role="img">
            <polygon
              v-for="lvl in radarLevels"
              :key="lvl"
              class="nmr-radar-grid"
              :points="radarRingPoints(lvl)"
            />
            <line
              v-for="(axis, i) in radarAxes"
              :key="i"
              class="nmr-radar-axis"
              :x1="radarCenter" :y1="radarCenter"
              :x2="axis.x" :y2="axis.y"
            />
            <polygon class="nmr-radar-area" :points="radarAreaPoints" />
            <circle
              v-for="(p, i) in radarValuePoints"
              :key="i"
              class="nmr-radar-dot"
              :cx="p.x" :cy="p.y" r="3"
            />
            <text
              v-for="(axis, i) in radarAxes"
              :key="'label-' + i"
              class="nmr-radar-label"
              :x="axis.lx" :y="axis.ly"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ axis.label }}</text>
          </svg>
          <p class="nmr-radar-note">{{ $t('numerology.report.radarNote') }}</p>
        </div>
      </section>

      <!-- ============ 综合标签表 ============ -->
      <section class="nmr-section">
        <h3 class="nmr-section-title">{{ $t('numerology.report.tableTitle') }}</h3>
        <div class="nmr-card nmr-table-card">
          <div class="nmr-table-wrap">
            <table class="nmr-table">
              <thead>
                <tr>
                  <th>{{ $t('numerology.report.colNumber') }}</th>
                  <th>{{ $t('numerology.report.colValue') }}</th>
                  <th>{{ $t('numerology.report.colSymbol') }}</th>
                  <th>{{ $t('numerology.report.colTags') }}</th>
                  <th>{{ $t('numerology.report.colRole') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th class="nmr-table-rowhead">{{ $t('numerology.lifePathNumber') }}</th>
                  <td class="nmr-td-value">{{ result.核心数字.生命路径数 }}</td>
                  <td><span class="nmr-mark">{{ result.性格.生命路径.符号 }}</span></td>
                  <td>{{ result.性格.生命路径.标签.join(' · ') }}</td>
                  <td>{{ $t('numerology.report.roleLifePath') }}</td>
                </tr>
                <tr>
                  <th class="nmr-table-rowhead">{{ $t('numerology.nameNumber') }}</th>
                  <td class="nmr-td-value">{{ result.核心数字.姓名数 }}</td>
                  <td><span class="nmr-mark nmr-mark-alt">{{ result.性格.姓名映射.符号 }}</span></td>
                  <td>{{ result.性格.姓名映射.标签.join(' · ') }}</td>
                  <td>{{ $t('numerology.report.roleName') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="nmr-combined">
            <h4 class="nmr-combined-head">{{ $t('numerology.combinedTraits') }}</h4>
            <div class="nmr-tags">
              <span v-for="tag in result.性格.综合.标签" :key="'cb-' + tag" class="nmr-tag">{{ tag }}</span>
            </div>
            <p class="nmr-combined-desc">{{ result.性格.综合.说明 }}</p>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="nmr-row nmr-ai-row">
        <div class="nmr-card nmr-ai">
          <h3 class="nmr-ai-title"><span class="nmr-ai-no">01</span>{{ $t('numerology.report.secLifePath') }}</h3>
          <h4 class="nmr-ai-sub-head">{{ $t('numerology.lifePathNumber') }} · {{ result.核心数字.生命路径数 }} — {{ result.性格.生命路径.符号 }}</h4>
          <div class="nmr-ai-body nmr-md" v-html="renderSection(sectionContent('生命路径', 'Life Path'))" />
        </div>
        <div class="nmr-card nmr-ai">
          <h3 class="nmr-ai-title"><span class="nmr-ai-no">02</span>{{ $t('numerology.report.secName') }}</h3>
          <h4 class="nmr-ai-sub-head">{{ $t('numerology.nameNumber') }} · {{ result.核心数字.姓名数 }} — {{ result.性格.姓名映射.符号 }}</h4>
          <div class="nmr-ai-body nmr-md" v-html="renderSection(sectionContent('姓名映射', 'Name Expression'))" />
        </div>
      </section>
      <section class="nmr-section">
        <div class="nmr-card nmr-ai">
          <h3 class="nmr-ai-title"><span class="nmr-ai-no">03</span>{{ $t('numerology.report.secSynthesis') }}</h3>
          <div class="nmr-ai-body nmr-md" v-html="renderSection(sectionContent('综合印象', 'Synthesis'))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="nmr-streaming">
        <span class="nmr-streaming-dot" />
        {{ $t('numerology.interpreting') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="nmr-error">
        <p>{{ error }}</p>
        <button type="button" class="nmr-retry" @click="$emit('retry')">{{ $t('numerology.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="nmr-foot">
        <span class="nmr-foot-note">ⓘ {{ $t('numerology.report.footerNote') }}</span>
        <span class="nmr-seal nmr-seal-foot">{{ $t('numerology.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

export interface NumerologyReportResult {
  核心数字: {
    生命路径数: number
    姓名数: number
    主导数: number
    辅助数: number
  }
  性格: {
    生命路径: {
      标签: string[]
      符号: string
    }
    姓名映射: {
      标签: string[]
      符号: string
    }
    综合: {
      标签: string[]
      说明: string
    }
  }
}

interface Props {
  result: NumerologyReportResult
  name: string
  birthdate: string
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 报告头 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

/* ---------- 共鸣指数（主导/辅助数契合度的象征性度量） ---------- */

const resonanceScore = computed(() => {
  const a = props.result.核心数字.主导数
  const b = props.result.核心数字.辅助数
  if (a === b) return 100
  const na = a > 9 ? Math.floor(a / 10) + (a % 10) : a
  const nb = b > 9 ? Math.floor(b / 10) + (b % 10) : b
  if (na === nb) return 92
  const diff = Math.abs(na - nb)
  return Math.max(35, 92 - diff * 9)
})

/* ---------- 推演算式 ---------- */

const lifePathExpr = computed(() => {
  const digits = props.birthdate.replace(/\D/g, '').split('')
  const sum = digits.reduce((s, d) => s + parseInt(d, 10), 0)
  return `${digits.join(' + ')} = ${sum}`
})

/* ---------- 数字频度柱状图 ---------- */

const histogram = computed(() => {
  const counts: Record<number, number> = {}
  for (const d of props.birthdate.replace(/\D/g, '')) {
    const n = parseInt(d, 10)
    if (n >= 1) counts[n] = (counts[n] ?? 0) + 1
  }
  const bump = (n: number) => { if (n >= 1 && n <= 9) counts[n] = (counts[n] ?? 0) + 1 }
  bump(props.result.核心数字.生命路径数)
  bump(props.result.核心数字.姓名数)
  const max = Math.max(1, ...Object.values(counts))
  return Array.from({ length: 9 }, (_, i) => {
    const digit = i + 1
    const count = counts[digit] ?? 0
    return { digit, count, pct: count === 0 ? 4 : Math.round((count / max) * 100) }
  })
})

/* ---------- 性格雷达 ---------- */

const radarCenter = 120
const radarRadius = 80

const RADAR_DIMS = [
  { key: 'radarDrive', pos: [1, 3, 5, 8] },
  { key: 'radarConnect', pos: [2, 6, 9, 33] },
  { key: 'radarExpress', pos: [3, 5, 6, 9] },
  { key: 'radarReflect', pos: [2, 4, 7, 11] },
  { key: 'radarBuild', pos: [4, 8, 22] },
] as const

function dimScore(pos: readonly number[], n: number): number {
  const exact = pos.includes(n) ? 1 : 0
  const reduced = n > 9 ? Math.floor(n / 10) + (n % 10) : n
  const fuzzy = pos.includes(reduced) ? 0.7 : 0
  return Math.max(exact, fuzzy, 0.28)
}

function radarPoint(index: number, ratio: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2
  return {
    x: radarCenter + radarRadius * ratio * Math.cos(angle),
    y: radarCenter + radarRadius * ratio * Math.sin(angle),
  }
}

const radarLevels = [0.25, 0.5, 0.75, 1]
function radarRingPoints(ratio: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const p = radarPoint(i, ratio)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')
}

const radarAxes = computed(() =>
  RADAR_DIMS.map((dim, i) => {
    const p = radarPoint(i, 1)
    const lp = radarPoint(i, 1.26)
    return {
      x: p.x, y: p.y, lx: lp.x, ly: lp.y,
      label: t(`numerology.report.${dim.key}`),
    }
  }))

const radarValuePoints = computed(() =>
  RADAR_DIMS.map((dim, i) => {
    const ratio = (dimScore(dim.pos, props.result.核心数字.生命路径数) + dimScore(dim.pos, props.result.核心数字.姓名数)) / 2
    return radarPoint(i, ratio)
  }))

const radarAreaPoints = computed(() =>
  radarValuePoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))

/* ---------- AI 内容解析 ---------- */

const aiSections = computed<Record<string, string>>(() => {
  const text = props.aiContent || ''
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

/** 按章节关键字模糊匹配（兼容中英双语标题） */
function sectionContent(...keywords: string[]): string {
  const entry = Object.entries(aiSections.value).find(([title]) =>
    keywords.some(kw => title.includes(kw)))
  return entry?.[1] ?? ''
}

function renderSection(content: string): string {
  if (!content) {
    return `<p class="nmr-pending">${t('numerology.generatingInterpretation')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.nmr {
  --nmr-bg: #f2ede3;
  --nmr-sheet: #faf6ec;
  --nmr-card: #fffdf6;
  --nmr-ink: #2e2a24;
  --nmr-ink-soft: #55503f;
  --nmr-ink-faint: #8a8272;
  --nmr-line: #d8d0bd;
  --nmr-line-soft: #e6dfcd;
  --nmr-accent: #8c2f26;
  --nmr-accent-soft: #a8512e;
  --nmr-star: #8c6d1f;
  --nmr-green: #4a7c59;
  --nmr-blue: #4a6a7c;
  border-radius: 12px;
  background: var(--nmr-bg);
  padding: 18px;
  color: var(--nmr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.nmr-sheet {
  background: var(--nmr-sheet);
  border: 1px solid var(--nmr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.nmr-head { border-bottom: 2px solid var(--nmr-ink); padding-bottom: 16px; }
.nmr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.nmr-brand { display: flex; align-items: center; gap: 8px; }
.nmr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--nmr-accent);
  color: var(--nmr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.nmr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--nmr-ink-soft); }
.nmr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--nmr-ink-faint); }
.nmr-verdict { color: var(--nmr-green); font-weight: 600; }

.nmr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.nmr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--nmr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.nmr-head-bottom { text-align: center; }
.nmr-meta-line { margin: 2px 0; font-size: 12px; color: var(--nmr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.nmr-row { display: grid; gap: 14px; margin-top: 16px; }
.nmr-row-top { grid-template-columns: 1fr 2.2fr; }
.nmr-pans { grid-template-columns: 1fr 1fr; }
.nmr-ai-row { grid-template-columns: 1fr 1fr; }
.nmr-section { margin-top: 16px; }

.nmr-card {
  background: var(--nmr-card);
  border: 1px solid var(--nmr-line);
  padding: 14px 16px;
}
.nmr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--nmr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.nmr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 信息卡 ---------- */
.nmr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.nmr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.nmr-ico { color: var(--nmr-accent-soft); font-size: 12px; }
.nmr-profile-label { color: var(--nmr-ink-faint); min-width: 30px; }
.nmr-profile-value { color: var(--nmr-ink); letter-spacing: 0.5px; }

/* ---------- 总评内外特质 ---------- */
.nmr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.nmr-mini { border: 1px dashed var(--nmr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.nmr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
.nmr-mini-head-star { color: var(--nmr-star); }
.nmr-mini-head-warn { color: var(--nmr-accent-soft); }
.nmr-mini-body { margin: 6px 0 0; font-size: 11px; line-height: 1.7; color: var(--nmr-ink-faint); }

.nmr-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.nmr-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(140, 109, 31, 0.4);
  background: rgba(140, 109, 31, 0.08);
  color: var(--nmr-star);
  letter-spacing: 1px;
}
.nmr-tag-alt {
  border-color: rgba(74, 106, 124, 0.4);
  background: rgba(74, 106, 124, 0.08);
  color: var(--nmr-blue);
}

/* ---------- 核心数字卡 ---------- */
.nmr-core-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.nmr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.nmr-core-label { font-size: 11px; color: var(--nmr-ink-faint); letter-spacing: 1px; }
.nmr-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.nmr-core-accent { color: var(--nmr-accent); }
.nmr-core-sub { font-size: 10px; color: var(--nmr-ink-faint); }

.nmr-gauge { margin-top: 4px; }
.nmr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--nmr-line); overflow: hidden; }
.nmr-gauge-zone { height: 100%; }
.nmr-gauge-zone-low { flex: 40; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.nmr-gauge-zone-mid { flex: 25; background: #efe9d8; }
.nmr-gauge-zone-high { flex: 35; background: linear-gradient(90deg, #d9e4dc, #b8cdc0); }
.nmr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--nmr-ink); transform: translateX(-1px);
}
.nmr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--nmr-ink-faint); margin-top: 3px; }

/* ---------- 双盘：算式 + 柱状图 + 雷达 ---------- */
.nmr-pan { padding: 12px; }
.nmr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }

.nmr-formula-line { display: flex; align-items: baseline; gap: 8px; font-size: 11px; padding: 3px 0; }
.nmr-formula-label { min-width: 60px; font-weight: 700; color: var(--nmr-ink); flex-shrink: 0; }
.nmr-formula-expr { color: var(--nmr-ink-soft); font-family: 'Courier New', monospace; font-size: 11px; word-break: break-all; }
.nmr-formula-eq { margin-left: auto; font-weight: 700; color: var(--nmr-accent-soft); white-space: nowrap; }

.nmr-hist { margin-top: 12px; border-top: 1px dashed var(--nmr-line); padding-top: 10px; }
.nmr-hist-title { margin: 0 0 8px; font-size: 10px; color: var(--nmr-ink-faint); letter-spacing: 1px; text-align: center; }
.nmr-hist-bars { display: flex; align-items: flex-end; justify-content: center; gap: 6px; height: 92px; }
.nmr-hist-col { display: flex; flex-direction: column; align-items: center; gap: 3px; height: 100%; justify-content: flex-end; }
.nmr-hist-count { font-size: 9px; color: var(--nmr-ink-faint); height: 11px; }
.nmr-hist-bar-wrap { height: 58px; display: flex; align-items: flex-end; }
.nmr-hist-bar { display: block; width: 14px; background: var(--nmr-line); border-radius: 2px 2px 0 0; }
.nmr-hist-col-hot .nmr-hist-bar { background: var(--nmr-star); }
.nmr-hist-digit { font-size: 10px; font-weight: 700; color: var(--nmr-ink-soft); }
.nmr-hist-col-hot .nmr-hist-digit { color: var(--nmr-star); }
.nmr-hist-note { margin: 8px 0 0; text-align: center; font-size: 9.5px; color: var(--nmr-ink-faint); }

.nmr-radar { width: 100%; max-width: 280px; display: block; margin: 0 auto; }
.nmr-radar-grid { fill: none; stroke: var(--nmr-line); stroke-width: 0.6; }
.nmr-radar-axis { stroke: var(--nmr-line-soft); stroke-width: 0.6; }
.nmr-radar-area { fill: rgba(74, 106, 124, 0.18); stroke: var(--nmr-blue); stroke-width: 1.2; }
.nmr-radar-dot { fill: var(--nmr-blue); }
.nmr-radar-label { font-size: 9.5px; fill: var(--nmr-ink-soft); letter-spacing: 0.5px; }
.nmr-radar-note { margin: 8px 0 0; text-align: center; font-size: 9.5px; color: var(--nmr-ink-faint); }

/* ---------- 综合标签表 ---------- */
.nmr-table-card { padding: 10px 12px; }
.nmr-table-wrap { overflow-x: auto; }
.nmr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.nmr-table th, .nmr-table td {
  border: 1px solid var(--nmr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.nmr-table thead th {
  background: var(--nmr-line-soft);
  font-weight: 700;
  color: var(--nmr-ink);
  text-align: center;
  letter-spacing: 1px;
  white-space: nowrap;
}
.nmr-table-rowhead {
  background: var(--nmr-line-soft);
  font-weight: 700;
  color: var(--nmr-ink);
  white-space: nowrap;
  font-size: 11px;
}
.nmr-table td { color: var(--nmr-ink-soft); }
.nmr-td-value { font-size: 15px; font-weight: 700; color: var(--nmr-ink) !important; text-align: center; }
.nmr-mark {
  display: inline-block;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
  background: rgba(140, 109, 31, 0.12);
  color: var(--nmr-star);
  border: 1px solid rgba(140, 109, 31, 0.35);
}
.nmr-mark-alt {
  background: rgba(74, 106, 124, 0.12);
  color: var(--nmr-blue);
  border-color: rgba(74, 106, 124, 0.35);
}

.nmr-combined { margin-top: 12px; border-top: 1px dashed var(--nmr-line); padding-top: 10px; }
.nmr-combined-head { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: var(--nmr-accent-soft); letter-spacing: 1px; }
.nmr-combined-desc { margin: 8px 0 0; font-size: 11px; color: var(--nmr-ink-faint); line-height: 1.7; }

/* ---------- AI 章节 ---------- */
.nmr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--nmr-line-soft);
  padding-bottom: 8px;
}
.nmr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--nmr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.nmr-ai-sub-head {
  margin: 0 0 6px;
  font-size: 12px; font-weight: 700;
  color: var(--nmr-accent-soft); letter-spacing: 1px;
}
.nmr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--nmr-ink-soft); }

.nmr-md :deep(p) { margin: 0 0 0.7em; }
.nmr-md :deep(p:last-child) { margin-bottom: 0; }
.nmr-md :deep(strong) { color: var(--nmr-ink); font-weight: 700; }
.nmr-md :deep(ul), .nmr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.nmr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.nmr-md :deep(h3), .nmr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--nmr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.nmr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--nmr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.nmr-md :deep(.nmr-pending), .nmr-pending { color: var(--nmr-ink-faint); font-style: italic; }

.nmr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--nmr-ink-faint); letter-spacing: 1px;
}
.nmr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--nmr-accent);
  animation: nmr-pulse 1s ease-in-out infinite;
}
@keyframes nmr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.nmr-error { margin-top: 14px; text-align: center; color: var(--nmr-accent); font-size: 12px; }
.nmr-retry {
  margin-top: 8px;
  border: 1px solid var(--nmr-accent);
  background: transparent;
  color: var(--nmr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.nmr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.nmr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--nmr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.nmr-foot-note { font-size: 10px; color: var(--nmr-ink-faint); }
.nmr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .nmr-row-top { grid-template-columns: 1fr; }
  .nmr-core-grid { grid-template-columns: repeat(3, 1fr); }
}

.nmr-pan, .nmr-ai { min-width: 0; }

@media (max-width: 720px) {
  .nmr { padding: 8px; }
  .nmr-sheet { padding: 16px 12px; }
  .nmr-ai-row { grid-template-columns: 1fr; }
  .nmr-pans { grid-template-columns: 1fr; }
  .nmr-overview-grid { grid-template-columns: 1fr; }
  .nmr-title { font-size: 20px; letter-spacing: 2px; }
  .nmr-core-grid { grid-template-columns: 1fr 1fr; }
  .nmr-table { min-width: 560px; }
}
</style>
