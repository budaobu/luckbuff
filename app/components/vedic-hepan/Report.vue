<script setup lang="ts">
import { marked } from 'marked'
import type { VedicHepanCalcResult } from '~/types/vedic-hepan'

interface Props {
  result: VedicHepanCalcResult
  analysis: string
  streaming: boolean
  errorMsg?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ retry: [] }>()

const { t, locale } = useI18n()

/* ---------- 报告头派生 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const titleText = computed(() => t('vedicHepan.report.title', {
  a: props.result.personA.name || t('vedicHepan.personA'),
  b: props.result.personB.name || t('vedicHepan.personB'),
}))

const subtitleText = computed(() => t('vedicHepan.report.subtitle', {
  aSign: props.result.ascendantComparison.aSignZh,
  bSign: props.result.ascendantComparison.bSignZh,
}))

/* ---------- 行星 / 相位工具 ---------- */

function planetNameZh(name: string): string {
  const map: Record<string, string> = {
    Sun: '太阳', Moon: '月亮', Mars: '火星', Mercury: '水星',
    Jupiter: '木星', Venus: '金星', Saturn: '土星', Rahu: '罗睺', Ketu: '计都',
  }
  return map[name] || name
}

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}
function glyph(graha: string): string {
  return PLANET_GLYPH[graha] ?? '✦'
}

const ASPECT_META: Record<string, { color: string; glyph: string }> = {
  '合相': { color: '#8c2f26', glyph: '☌' },
  '六合': { color: '#4a7c59', glyph: '⚹' },
  '刑克': { color: '#a8512e', glyph: '□' },
  '拱相': { color: '#4a6a8a', glyph: '△' },
  '冲相': { color: '#8c6d1f', glyph: '☍' },
}
function aspectColor(type: string): string {
  return ASPECT_META[type]?.color ?? '#55503f'
}
function aspectGlyph(type: string): string {
  return ASPECT_META[type]?.glyph ?? '✧'
}

const uniqueAspects = computed(() => {
  const seen = new Set<string>()
  return props.result.crossAspects.filter((a) => {
    const key = [a.planetA, a.planetB].sort().join('-') + `-${a.aspectType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

/* ---------- 相位类型分布（柱状图） ---------- */

const aspectDist = computed(() => {
  const order = ['合相', '六合', '刑克', '拱相', '冲相']
  const counts: Record<string, number> = {}
  for (const a of uniqueAspects.value) counts[a.aspectType] = (counts[a.aspectType] ?? 0) + 1
  const max = Math.max(1, ...Object.values(counts))
  return order
    .map(type => ({ type, count: counts[type] ?? 0, pct: Math.round(((counts[type] ?? 0) / max) * 100), color: aspectColor(type) }))
    .filter(d => d.count > 0)
})

/* ---------- 宫位叠加 ---------- */

function groupOverlay(list: { planet: string; house: number }[]): Record<number, string[]> {
  const groups: Record<number, string[]> = {}
  for (const o of list) {
    const arr = groups[o.house] ?? []
    arr.push(planetNameZh(o.planet))
    groups[o.house] = arr
  }
  return groups
}
const aInBGrouped = computed(() => groupOverlay(props.result.aPlanetsInB))
const bInAGrouped = computed(() => groupOverlay(props.result.bPlanetsInA))

/* ---------- 本命盘（单人） ---------- */

function mainPlanets(person: VedicHepanCalcResult['personA']) {
  return person.chart.planets.filter(p =>
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.graha))
}
const personAPlanets = computed(() => mainPlanets(props.result.personA))
const personBPlanets = computed(() => mainPlanets(props.result.personB))

function currentDasha(person: VedicHepanCalcResult['personA']) {
  return person.chart.dasha.find(d => d.isCurrent)
}

/* ---------- AI 五章节 ---------- */

interface AiSection { title: string; content: string }

const aiSections = computed<AiSection[]>(() => {
  const text = props.analysis || ''
  if (!text) return []
  const raws = text.split(/\n(?=##\s)/)
  const out: AiSection[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) out.push({ title, content })
  }
  return out
})

const pendingText = computed(() => t('vedicHepan.report.pending'))

function renderMd(content: string): string {
  if (!content) return `<p class="vhr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}

function sectionNo(i: number): string {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <div class="vhr">
    <div class="vhr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="vhr-head">
        <div class="vhr-head-top">
          <div class="vhr-brand">
            <div class="vhr-seal">{{ $t('vedicHepan.report.seal') }}</div>
            <span class="vhr-brand-name">{{ $t('vedicHepan.report.brandName') }}</span>
          </div>
          <div class="vhr-head-right">
            <span class="vhr-time">{{ $t('vedicHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="vhr-rating">{{ $t('vedicHepan.report.rating') }}</span>
          </div>
        </div>

        <h1 class="vhr-title">{{ titleText }}</h1>
        <p class="vhr-subtitle">{{ subtitleText }}</p>

        <div class="vhr-head-bottom">
          <p class="vhr-meta-line">{{ result.methodNote }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 上升对比 ============ -->
      <section class="vhr-row vhr-row-top">
        <div class="vhr-card vhr-couple">
          <h3 class="vhr-card-title">{{ $t('vedicHepan.report.coupleTitle') }}</h3>
          <div class="vhr-couple-grid">
            <div class="vhr-person">
              <div class="vhr-person-tag">{{ $t('vedicHepan.personA') }}</div>
              <div class="vhr-person-name">{{ result.personA.name || $t('vedicHepan.personA') }}</div>
              <div class="vhr-person-city">{{ result.personA.cityName }}</div>
            </div>
            <div class="vhr-person">
              <div class="vhr-person-tag">{{ $t('vedicHepan.personB') }}</div>
              <div class="vhr-person-name">{{ result.personB.name || $t('vedicHepan.personB') }}</div>
              <div class="vhr-person-city">{{ result.personB.cityName }}</div>
            </div>
          </div>
        </div>

        <div class="vhr-card vhr-asc">
          <h3 class="vhr-card-title">{{ $t('vedicHepan.report.ascTitle') }}</h3>
          <div class="vhr-asc-grid">
            <div class="vhr-asc-cell">
              <div class="vhr-asc-who">{{ result.personA.name || $t('vedicHepan.personA') }}</div>
              <div class="vhr-asc-sign">{{ result.ascendantComparison.aSignZh }}</div>
              <div class="vhr-asc-en">{{ result.ascendantComparison.aSign }}</div>
            </div>
            <div class="vhr-asc-vs">×</div>
            <div class="vhr-asc-cell">
              <div class="vhr-asc-who">{{ result.personB.name || $t('vedicHepan.personB') }}</div>
              <div class="vhr-asc-sign">{{ result.ascendantComparison.bSignZh }}</div>
              <div class="vhr-asc-en">{{ result.ascendantComparison.bSign }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 相位分布柱状图 + 相位表 ============ -->
      <section class="vhr-section">
        <h3 class="vhr-section-title">{{ $t('vedicHepan.report.aspectSectionTitle') }}</h3>
        <div class="vhr-row vhr-row-aspect">
          <div class="vhr-card vhr-chart">
            <h3 class="vhr-card-title">{{ $t('vedicHepan.report.aspectDistTitle') }}</h3>
            <div v-if="aspectDist.length" class="vhr-bars">
              <div v-for="d in aspectDist" :key="d.type" class="vhr-bar-row">
                <span class="vhr-bar-glyph" :style="{ color: d.color }">{{ aspectGlyph(d.type) }}</span>
                <span class="vhr-bar-label">{{ d.type }}</span>
                <span class="vhr-bar-track"><span class="vhr-bar-fill" :style="{ width: d.pct + '%', background: d.color }" /></span>
                <span class="vhr-bar-count">{{ d.count }}</span>
              </div>
            </div>
            <p v-else class="vhr-empty">{{ $t('vedicHepan.noAspects') }}</p>
          </div>

          <div class="vhr-card vhr-aspect-table">
            <h3 class="vhr-card-title">{{ $t('vedicHepan.report.aspectTableTitle') }}</h3>
            <div v-if="uniqueAspects.length" class="vhr-table-wrap">
              <table class="vhr-table">
                <thead>
                  <tr>
                    <th>{{ $t('vedicHepan.report.colPair') }}</th>
                    <th>{{ $t('vedicHepan.report.colAspect') }}</th>
                    <th>{{ $t('vedicHepan.report.colOrb') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(a, i) in uniqueAspects.slice(0, 12)" :key="i">
                    <td>
                      {{ result.personA.name || $t('vedicHepan.personA') }}·{{ planetNameZh(a.planetA) }}
                      <span class="vhr-table-x">×</span>
                      {{ result.personB.name || $t('vedicHepan.personB') }}·{{ planetNameZh(a.planetB) }}
                    </td>
                    <td>
                      <span class="vhr-aspect-badge" :style="{ color: aspectColor(a.aspectType), borderColor: aspectColor(a.aspectType) }">
                        {{ aspectGlyph(a.aspectType) }} {{ a.aspectType }}
                      </span>
                    </td>
                    <td class="vhr-orb">{{ a.orb }}°</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="vhr-empty">{{ $t('vedicHepan.noAspects') }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 宫位叠加 ============ -->
      <section class="vhr-section">
        <h3 class="vhr-section-title">{{ $t('vedicHepan.report.overlaySectionTitle') }}</h3>
        <div class="vhr-row vhr-row-overlay">
          <div class="vhr-card">
            <h3 class="vhr-card-title">{{ $t('vedicHepan.aPlanetsInB', { a: result.personA.name || $t('vedicHepan.personA'), b: result.personB.name || $t('vedicHepan.personB') }) }}</h3>
            <div class="vhr-overlay-grid">
              <div v-for="house in 12" :key="house" class="vhr-overlay-cell" :class="{ 'vhr-overlay-fill': (aInBGrouped[house] ?? []).length }">
                <span class="vhr-overlay-house">{{ house }}</span>
                <span class="vhr-overlay-planets">{{ (aInBGrouped[house] ?? []).join('、') || '—' }}</span>
              </div>
            </div>
          </div>
          <div class="vhr-card">
            <h3 class="vhr-card-title">{{ $t('vedicHepan.bPlanetsInA', { a: result.personA.name || $t('vedicHepan.personA'), b: result.personB.name || $t('vedicHepan.personB') }) }}</h3>
            <div class="vhr-overlay-grid">
              <div v-for="house in 12" :key="house" class="vhr-overlay-cell" :class="{ 'vhr-overlay-fill': (bInAGrouped[house] ?? []).length }">
                <span class="vhr-overlay-house">{{ house }}</span>
                <span class="vhr-overlay-planets">{{ (bInAGrouped[house] ?? []).join('、') || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 本命盘 ============ -->
      <section class="vhr-section">
        <h3 class="vhr-section-title">{{ $t('vedicHepan.report.natalSectionTitle') }}</h3>
        <div class="vhr-row vhr-row-natal">
          <div v-for="(person, idx) in [result.personA, result.personB]" :key="idx" class="vhr-card vhr-natal">
            <h3 class="vhr-card-title">{{ person.name || (idx === 0 ? $t('vedicHepan.personA') : $t('vedicHepan.personB')) }}</h3>
            <div class="vhr-natal-meta">
              <div class="vhr-natal-line">
                <span class="vhr-natal-label">{{ $t('vedicHepan.report.natalAsc') }}</span>
                <span class="vhr-natal-value">{{ person.chart.ascendant.signNameZh }}<span class="vhr-natal-en">{{ person.chart.ascendant.signName }}</span></span>
              </div>
              <div class="vhr-natal-line">
                <span class="vhr-natal-label">{{ $t('vedicHepan.report.natalDasha') }}</span>
                <span class="vhr-natal-value">{{ currentDasha(person) ? planetNameZh(currentDasha(person)!.graha) : '—' }}</span>
              </div>
            </div>
            <div class="vhr-natal-planets">
              <div v-for="p in (idx === 0 ? personAPlanets : personBPlanets)" :key="p.graha" class="vhr-natal-planet">
                <span class="vhr-natal-glyph">{{ glyph(p.graha) }}</span>
                <span class="vhr-natal-pname">{{ planetNameZh(p.graha) }}<i v-if="p.isRetrograde" class="vhr-retro">逆</i></span>
                <span class="vhr-natal-psign">{{ p.signNameZh }}</span>
                <span class="vhr-natal-phouse">{{ $t('vedicHepan.report.houseShort', { n: p.house }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 五章节 ============ -->
      <section class="vhr-section">
        <h3 class="vhr-section-title">{{ $t('vedicHepan.report.aiSectionTitle') }}</h3>
        <div class="vhr-ai-stack">
          <div v-for="(s, i) in aiSections" :key="s.title" class="vhr-card vhr-ai">
            <h3 class="vhr-ai-title"><span class="vhr-ai-no">{{ sectionNo(i) }}</span>{{ s.title }}</h3>
            <div class="vhr-ai-body vhr-md" v-html="renderMd(s.content)" />
            <span
              v-if="streaming && i === aiSections.length - 1"
              class="vhr-cursor"
            />
          </div>

          <!-- 流式占位 -->
          <div v-if="streaming" class="vhr-streaming">
            <span class="vhr-streaming-dot" />
            {{ $t('vedicHepan.report.streamingHint') }}
          </div>

          <!-- AI 错误 -->
          <div v-if="errorMsg" class="vhr-error">
            <p>{{ errorMsg }}</p>
            <button type="button" class="vhr-retry" @click="emit('retry')">{{ $t('vedicHepan.reinterpret') }}</button>
          </div>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="vhr-foot">
        <span class="vhr-foot-note">ⓘ {{ $t('vedicHepan.disclaimer') }}</span>
        <span class="vhr-seal vhr-seal-foot">{{ $t('vedicHepan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ========== 纸质报告主题 ========== */
.vhr {
  --vhr-bg: #f2ede3;
  --vhr-sheet: #faf6ec;
  --vhr-card: #fffdf6;
  --vhr-ink: #2e2a24;
  --vhr-ink-soft: #55503f;
  --vhr-ink-faint: #8a8272;
  --vhr-line: #d8d0bd;
  --vhr-line-soft: #e6dfcd;
  --vhr-accent: #8c2f26;
  --vhr-accent-soft: #a8512e;
  --vhr-green: #4a7c59;
  --vhr-blue: #4a6a8a;
  --vhr-gold: #8c6d1f;
  border-radius: 12px;
  background: var(--vhr-bg);
  padding: 18px;
  color: var(--vhr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}
.vhr-sheet {
  background: var(--vhr-sheet);
  border: 1px solid var(--vhr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.vhr-head { border-bottom: 2px solid var(--vhr-ink); padding-bottom: 16px; }
.vhr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.vhr-brand { display: flex; align-items: center; gap: 8px; }
.vhr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--vhr-accent);
  color: var(--vhr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px; transform: rotate(-4deg);
  letter-spacing: 1px; padding: 2px;
}
.vhr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--vhr-ink-soft); }
.vhr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--vhr-ink-faint); }
.vhr-rating { letter-spacing: 1px; }
.vhr-title { margin: 14px 0 6px; font-size: 30px; font-weight: 700; letter-spacing: 4px; text-align: center; }
.vhr-subtitle { text-align: center; font-size: 13px; color: var(--vhr-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.vhr-head-bottom { text-align: center; }
.vhr-meta-line { margin: 2px 0; font-size: 12px; color: var(--vhr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用 ---------- */
.vhr-row { display: grid; gap: 14px; margin-top: 16px; }
.vhr-row-top { grid-template-columns: 1fr 1.4fr; }
.vhr-row-aspect { grid-template-columns: 1fr 1.6fr; margin-top: 0; }
.vhr-row-overlay { grid-template-columns: 1fr 1fr; margin-top: 0; }
.vhr-row-natal { grid-template-columns: 1fr 1fr; margin-top: 0; }
.vhr-section { margin-top: 16px; }
.vhr-card { background: var(--vhr-card); border: 1px solid var(--vhr-line); padding: 14px 16px; min-width: 0; }
.vhr-card-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 2px; border-bottom: 1px solid var(--vhr-line-soft); padding-bottom: 8px; text-align: center; }
.vhr-section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }
.vhr-empty { font-size: 12px; color: var(--vhr-ink-faint); font-style: italic; }

/* ---------- 命主信息 ---------- */
.vhr-couple-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vhr-person { border: 1px dashed var(--vhr-line); background: rgba(255, 255, 255, 0.45); padding: 12px; text-align: center; }
.vhr-person-tag { font-size: 10px; color: var(--vhr-accent-soft); letter-spacing: 2px; }
.vhr-person-name { font-size: 18px; font-weight: 700; margin: 4px 0 2px; }
.vhr-person-city { font-size: 11px; color: var(--vhr-ink-faint); }

/* ---------- 上升对比 ---------- */
.vhr-asc-grid { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.vhr-asc-cell { border: 1px solid var(--vhr-line); background: rgba(140, 47, 38, 0.04); padding: 14px 10px; text-align: center; }
.vhr-asc-who { font-size: 10px; color: var(--vhr-ink-faint); letter-spacing: 1px; }
.vhr-asc-sign { font-size: 24px; font-weight: 700; margin: 6px 0 2px; letter-spacing: 2px; }
.vhr-asc-en { font-size: 11px; color: var(--vhr-ink-faint); }
.vhr-asc-vs { font-size: 20px; color: var(--vhr-accent); font-weight: 700; }

/* ---------- 柱状图 ---------- */
.vhr-bars { display: flex; flex-direction: column; gap: 8px; }
.vhr-bar-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.vhr-bar-glyph { width: 14px; text-align: center; font-size: 13px; }
.vhr-bar-label { width: 34px; color: var(--vhr-ink-soft); }
.vhr-bar-track { flex: 1; height: 10px; background: var(--vhr-line-soft); }
.vhr-bar-fill { display: block; height: 100%; }
.vhr-bar-count { width: 18px; text-align: right; color: var(--vhr-ink-faint); }

/* ---------- 表格 ---------- */
.vhr-table-wrap { overflow-x: auto; }
.vhr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.vhr-table th, .vhr-table td { border: 1px solid var(--vhr-line); padding: 6px 8px; text-align: left; line-height: 1.5; vertical-align: middle; }
.vhr-table thead th { background: var(--vhr-line-soft); font-weight: 700; color: var(--vhr-ink); text-align: center; letter-spacing: 1px; }
.vhr-table td { color: var(--vhr-ink-soft); }
.vhr-table-x { color: var(--vhr-accent); margin: 0 1px; }
.vhr-aspect-badge { display: inline-block; border: 1px solid; padding: 0 6px; font-size: 10px; white-space: nowrap; }
.vhr-orb { text-align: right; color: var(--vhr-ink-faint); white-space: nowrap; }

/* ---------- 宫位叠加 ---------- */
.vhr-overlay-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.vhr-overlay-cell { border: 1px solid var(--vhr-line-soft); padding: 6px 4px; text-align: center; display: flex; flex-direction: column; gap: 2px; background: var(--vhr-card); }
.vhr-overlay-fill { border-color: var(--vhr-accent); background: rgba(140, 47, 38, 0.04); }
.vhr-overlay-house { font-size: 10px; font-weight: 700; color: var(--vhr-ink-faint); }
.vhr-overlay-fill .vhr-overlay-house { color: var(--vhr-accent); }
.vhr-overlay-planets { font-size: 10px; color: var(--vhr-ink-soft); line-height: 1.3; min-height: 26px; }

/* ---------- 本命盘 ---------- */
.vhr-natal-meta { display: flex; gap: 16px; margin-bottom: 10px; }
.vhr-natal-line { display: flex; align-items: baseline; gap: 6px; font-size: 12px; }
.vhr-natal-label { color: var(--vhr-ink-faint); font-size: 11px; }
.vhr-natal-value { font-weight: 700; }
.vhr-natal-en { font-size: 10px; color: var(--vhr-ink-faint); font-weight: 400; margin-left: 3px; }
.vhr-natal-planets { display: flex; flex-direction: column; }
.vhr-natal-planet { display: grid; grid-template-columns: 18px 56px 1fr auto; align-items: center; gap: 6px; padding: 5px 0; border-top: 1px dashed var(--vhr-line-soft); font-size: 11px; }
.vhr-natal-glyph { text-align: center; color: var(--vhr-accent-soft); font-size: 13px; }
.vhr-natal-pname { font-weight: 700; color: var(--vhr-ink); }
.vhr-retro { font-style: normal; font-size: 8px; color: var(--vhr-accent); border: 1px solid var(--vhr-accent); padding: 0 1px; margin-left: 2px; vertical-align: super; }
.vhr-natal-psign { color: var(--vhr-ink-soft); }
.vhr-natal-phouse { color: var(--vhr-ink-faint); white-space: nowrap; }

/* ---------- AI 章节 ---------- */
.vhr-ai-stack { display: flex; flex-direction: column; gap: 12px; }
.vhr-ai-title { margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--vhr-line-soft); padding-bottom: 8px; }
.vhr-ai-no { font-size: 11px; color: #f5efe0; background: var(--vhr-ink); padding: 2px 6px; letter-spacing: 1px; }
.vhr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--vhr-ink-soft); }
.vhr-cursor { display: inline-block; width: 2px; height: 15px; background: var(--vhr-accent); margin-left: 2px; vertical-align: middle; animation: vhr-blink 0.9s steps(1) infinite; }
@keyframes vhr-blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0; } }

.vhr-md :deep(p) { margin: 0 0 0.7em; }
.vhr-md :deep(p:last-child) { margin-bottom: 0; }
.vhr-md :deep(strong) { color: var(--vhr-ink); font-weight: 700; }
.vhr-md :deep(ul), .vhr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.vhr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.vhr-md :deep(h3), .vhr-md :deep(h4) { font-size: 12.5px; font-weight: 700; color: var(--vhr-ink); margin: 0.8em 0 0.4em; letter-spacing: 1px; }
.vhr-md :deep(.vhr-pending), .vhr-pending { color: var(--vhr-ink-faint); font-style: italic; }

.vhr-streaming { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--vhr-ink-faint); letter-spacing: 1px; padding: 8px 0; }
.vhr-streaming-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--vhr-accent); animation: vhr-pulse 1s ease-in-out infinite; }
@keyframes vhr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.vhr-error { text-align: center; color: var(--vhr-accent); font-size: 12px; padding: 8px 0; }
.vhr-retry { margin-top: 8px; border: 1px solid var(--vhr-accent); background: transparent; color: var(--vhr-accent); font-size: 12px; padding: 5px 16px; cursor: pointer; font-family: inherit; letter-spacing: 1px; }
.vhr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.vhr-foot { margin-top: 18px; border-top: 1px solid var(--vhr-line); padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.vhr-foot-note { font-size: 10px; color: var(--vhr-ink-faint); line-height: 1.6; flex: 1; min-width: 0; }
.vhr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .vhr-row-top, .vhr-row-aspect, .vhr-row-overlay, .vhr-row-natal { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .vhr { padding: 8px; }
  .vhr-sheet { padding: 16px 12px; }
  .vhr-title { font-size: 22px; letter-spacing: 2px; }
  .vhr-overlay-grid { grid-template-columns: repeat(3, 1fr); }
  .vhr-couple-grid { grid-template-columns: 1fr; }
  .vhr-table { min-width: 460px; }
}
</style>
