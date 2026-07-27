<template>
  <div class="aft">
    <div class="aft-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="aft-head">
        <div class="aft-head-top">
          <div class="aft-brand">
            <div class="aft-seal">{{ $t('astroFortuneTune.report.seal') }}</div>
            <span class="aft-brand-name">{{ $t('astroFortuneTune.report.brandName') }}</span>
          </div>
          <div class="aft-head-right">
            <span>{{ $t('astroFortuneTune.report.generatedAt') }}：{{ generatedAt }}</span>
            <span>{{ $t('astroFortuneTune.report.systemLine') }}</span>
          </div>
        </div>

        <h1 class="aft-title">{{ $t('astroFortuneTune.resultTitle') }}</h1>
        <p class="aft-subtitle">{{ subtitleText }}</p>
      </header>

      <!-- ============ 命主信息 + 出生地上升 ============ -->
      <section class="aft-row aft-row-top">
        <div class="aft-card aft-profile">
          <div class="aft-profile-line">
            <span class="aft-ico">☀</span>
            <span class="aft-profile-label">{{ $t('astroFortuneTune.report.birthLabel') }}</span>
            <span class="aft-profile-value">{{ birthText }}</span>
          </div>
          <div class="aft-profile-line">
            <span class="aft-ico">◈</span>
            <span class="aft-profile-label">{{ $t('astroFortuneTune.report.baseCityLabel') }}</span>
            <span class="aft-profile-value">{{ result.baseCityName }}</span>
          </div>
          <div class="aft-profile-line">
            <span class="aft-ico">⧗</span>
            <span class="aft-profile-label">{{ $t('astroFortuneTune.report.timezoneLabel') }}</span>
            <span class="aft-profile-value">{{ offsetText }}</span>
          </div>
          <div class="aft-profile-line">
            <span class="aft-ico">✦</span>
            <span class="aft-profile-label">{{ $t('astroFortuneTune.report.ayanamshaLabel') }}</span>
            <span class="aft-profile-value">{{ result.baseChart.ayanamsha }}°</span>
          </div>
        </div>

        <div class="aft-quad">
          <div class="aft-card aft-mini aft-mini-accent">
            <div class="aft-mini-label">{{ $t('astroFortuneTune.report.baseAscCard') }}</div>
            <div class="aft-mini-value">
              {{ result.baseChart.ascendant.signNameZh }}
              <span class="aft-mini-en">{{ result.baseChart.ascendant.signName }}</span>
            </div>
            <div class="aft-mini-sub">
              {{ result.baseChart.ascendant.degree.toFixed(1) }}° · {{ nakshatraName(result.baseChart.ascendant.nakshatra) }} pada {{ result.baseChart.ascendant.nakshatraPada }}
            </div>
          </div>
          <div class="aft-card aft-mini">
            <div class="aft-mini-label">{{ $t('astroFortuneTune.report.moonCard') }}</div>
            <div class="aft-mini-value">
              {{ moonPlanet?.signNameZh ?? '—' }}
              <span class="aft-mini-en">{{ moonPlanet?.signName }}</span>
            </div>
            <div class="aft-mini-sub" v-if="moonPlanet">
              {{ nakshatraName(moonPlanet.nakshatra) }} pada {{ moonPlanet.nakshatraPada }}
            </div>
          </div>
          <div class="aft-card aft-mini">
            <div class="aft-mini-label">{{ $t('astroFortuneTune.report.sunCard') }}</div>
            <div class="aft-mini-value">
              {{ sunPlanet?.signNameZh ?? '—' }}
              <span class="aft-mini-en">{{ sunPlanet?.signName }}</span>
            </div>
            <div class="aft-mini-sub" v-if="sunPlanet">
              {{ sunPlanet.degree.toFixed(1) }}°
            </div>
          </div>
          <div class="aft-card aft-mini">
            <div class="aft-mini-label">{{ $t('astroFortuneTune.report.candidateCountCard') }}</div>
            <div class="aft-mini-value">{{ resolvedCount }}<span class="aft-mini-en">/ {{ result.comparisons.length }}</span></div>
            <div class="aft-mini-sub">{{ $t('astroFortuneTune.report.candidateCountSub') }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 出生时间不确定提示 ============ -->
      <div v-if="result.baseChart.timeUncertain" class="aft-timeuncertain">
        ⚠ {{ $t('astroFortuneTune.report.timeUncertainBanner') }}
      </div>

      <!-- ============ 上升星座对比表 ============ -->
      <section class="aft-section">
        <div class="aft-card">
          <h3 class="aft-card-title">{{ $t('astroFortuneTune.report.comparisonTitle') }}</h3>
          <div class="aft-table-wrap">
            <table class="aft-table">
              <thead>
                <tr>
                  <th>{{ $t('astroFortuneTune.report.colCity') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colAscendant') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colDegree') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colNakshatra') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colDelta') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr class="aft-tr-base">
                  <td class="aft-td-city">
                    {{ result.baseCityName }}
                    <span class="aft-tag-base">{{ $t('astroFortuneTune.report.baseTag') }}</span>
                  </td>
                  <td class="aft-td-sign">{{ result.baseChart.ascendant.signNameZh }} <span class="aft-td-en">{{ result.baseChart.ascendant.signName }}</span></td>
                  <td>{{ result.baseChart.ascendant.degree.toFixed(1) }}°</td>
                  <td>{{ nakshatraName(result.baseChart.ascendant.nakshatra) }} p{{ result.baseChart.ascendant.nakshatraPada }}</td>
                  <td>—</td>
                </tr>
                <tr v-for="(c, i) in result.comparisons" :key="i" :class="{ 'aft-tr-signchange': c.city.resolved && signChanged(c) }">
                  <td class="aft-td-city">
                    {{ c.city.cityName || c.city.name }}
                    <span v-if="!c.city.resolved" class="aft-tag-unresolved">{{ $t('astroFortuneTune.report.unresolvedTag') }}</span>
                  </td>
                  <template v-if="c.city.resolved">
                    <td class="aft-td-sign">
                      {{ c.chart.ascendant.signNameZh }} <span class="aft-td-en">{{ c.chart.ascendant.signName }}</span>
                      <span v-if="signChanged(c)" class="aft-tag-change">{{ $t('astroFortuneTune.report.signChangedTag') }}</span>
                    </td>
                    <td>{{ c.chart.ascendant.degree.toFixed(1) }}°</td>
                    <td>{{ nakshatraName(c.chart.ascendant.nakshatra) }} p{{ c.chart.ascendant.nakshatraPada }}</td>
                    <td>
                      <div class="aft-delta">
                        <span class="aft-delta-track">
                          <span class="aft-delta-bar" :style="{ width: deltaPct(c.ascendantDeltaDeg) + '%' }" />
                        </span>
                        <span class="aft-delta-num">{{ c.ascendantDeltaDeg.toFixed(1) }}°</span>
                      </div>
                    </td>
                  </template>
                  <td v-else colspan="4" class="aft-td-unresolved">{{ $t('astroFortuneTune.report.unresolvedCell') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="result.hasUnresolvedCities" class="aft-table-note">{{ $t('astroFortuneTune.unresolvedCitiesHint') }}</p>
        </div>
      </section>

      <!-- ============ 行星换座对比 ============ -->
      <section v-if="signShiftRows.length" class="aft-section">
        <div class="aft-card">
          <h3 class="aft-card-title">{{ $t('astroFortuneTune.report.planetShiftTitle') }}</h3>
          <div class="aft-table-wrap">
            <table class="aft-table">
              <thead>
                <tr>
                  <th>{{ $t('astroFortuneTune.report.colPlanet') }}</th>
                  <th>{{ result.baseCityName }}</th>
                  <th v-for="c in shiftCities" :key="c.name">{{ c.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in signShiftRows" :key="row.graha">
                  <td class="aft-td-planet">{{ planetName(row.graha) }}</td>
                  <td>{{ row.baseSign }}</td>
                  <td v-for="(s, i) in row.citySigns" :key="i" :class="{ 'aft-td-changed': s !== row.baseSign }">
                    {{ s }}<span v-if="s !== row.baseSign" class="aft-change-arrow">↔</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="aft-table-note">{{ $t('astroFortuneTune.report.planetShiftNote') }}</p>
        </div>
      </section>

      <!-- ============ 各城市相位变化 ============ -->
      <section v-if="citiesWithHighlights.length" class="aft-section">
        <div class="aft-aspect-grid">
          <div v-for="c in citiesWithHighlights" :key="c.name" class="aft-card aft-aspect-card">
            <h4 class="aft-aspect-title">
              <span class="aft-aspect-city">{{ c.name }}</span>
              <span class="aft-aspect-count">{{ $t('astroFortuneTune.report.aspectCount', { n: c.highlights.length }) }}</span>
            </h4>
            <table class="aft-table aft-table-aspect">
              <thead>
                <tr>
                  <th>{{ $t('astroFortuneTune.report.colAspect') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colOrb') }}</th>
                  <th>{{ $t('astroFortuneTune.report.colOrbDelta') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(h, i) in c.highlights" :key="i">
                  <td>{{ planetName(h.planet1) }} {{ h.aspectType }} {{ planetName(h.planet2) }}</td>
                  <td>{{ h.orb.toFixed(1) }}°</td>
                  <td>
                    <span class="aft-orb" :class="h.orbDelta > 0 ? 'aft-orb-tight' : h.orbDelta < 0 ? 'aft-orb-loose' : ''">
                      {{ h.orbDelta > 0 ? '−' : h.orbDelta < 0 ? '+' : '±' }}{{ Math.abs(h.orbDelta).toFixed(1) }}°
                      {{ h.orbDelta > 0 ? $t('astroFortuneTune.report.orbTighter') : h.orbDelta < 0 ? $t('astroFortuneTune.report.orbLooser') : $t('astroFortuneTune.report.orbSame') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 计算口径说明 ============ -->
      <section class="aft-section">
        <div class="aft-methodnote">
          <span class="aft-methodnote-label">{{ $t('astroFortuneTune.methodNoteTitle') }}</span>
          {{ result.methodNote }}
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="aft-section">
        <div class="aft-ai-grid">
          <div v-for="(s, i) in aiSections" :key="i" class="aft-card aft-ai">
            <h3 class="aft-ai-title">
              <span class="aft-ai-no">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.title }}
            </h3>
            <div class="aft-ai-body aft-md" v-html="s.html" />
          </div>
        </div>

        <!-- 流式中提示 -->
        <div v-if="streaming" class="aft-streaming">
          <span class="aft-streaming-dot" />
          {{ $t('astroFortuneTune.streaming') }}
        </div>

        <!-- AI 错误 -->
        <div v-if="error" class="aft-error">
          <p>{{ error }}</p>
          <button type="button" class="aft-retry" @click="$emit('retry')">{{ $t('common.retry') }}</button>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="aft-foot">
        <span class="aft-foot-note">ⓘ {{ $t('astroFortuneTune.disclaimer') }}</span>
        <span class="aft-seal aft-seal-foot">{{ $t('astroFortuneTune.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { AstroFortuneTuneCalcResult, AstroFortuneTuneComparison } from '~/types/astro-fortune-tune'

interface Props {
  result: AstroFortuneTuneCalcResult
  analysis: string
  streaming: boolean
  error?: string | null
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

const birthText = computed(() => {
  const b = props.result.baseChart.birthData
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${b.year}-${pad(b.month)}-${pad(b.day)} ${pad(b.hour)}:${pad(b.minute)}`
})

const offsetText = computed(() => {
  const o = props.result.baseChart.birthData.utcOffset
  return `UTC${o >= 0 ? '+' : ''}${o}`
})

const subtitleText = computed(() =>
  t('astroFortuneTune.report.subtitle', {
    sign: props.result.baseChart.ascendant.signNameZh,
    city: props.result.baseCityName,
    count: resolvedCount.value,
  }))

const moonPlanet = computed(() => props.result.baseChart.planets.find(p => p.graha === 'Moon'))
const sunPlanet = computed(() => props.result.baseChart.planets.find(p => p.graha === 'Sun'))
const resolvedCount = computed(() => props.result.comparisons.filter(c => c.city.resolved).length)

function planetName(graha: string): string {
  const translated = t(`vedic.chart.planetNames.${graha}`)
  return translated === `vedic.chart.planetNames.${graha}` ? graha : translated
}

function nakshatraName(name: string): string {
  const translated = t(`vedic.chart.nakshatraNames.${name}`)
  return translated === `vedic.chart.nakshatraNames.${name}` ? name : translated
}

/* ---------- 上升对比 ---------- */

function signChanged(c: AstroFortuneTuneComparison): boolean {
  return c.chart.ascendant.sign !== props.result.baseChart.ascendant.sign
}

/** Δ 映射到条宽：120° 封顶 */
function deltaPct(delta: number): number {
  return Math.min(100, Math.round((Math.abs(delta) / 120) * 100))
}

/* ---------- 行星换座对比 ---------- */

const resolvedComparisons = computed(() => props.result.comparisons.filter(c => c.city.resolved))

const shiftCities = computed(() =>
  resolvedComparisons.value.map(c => ({ name: c.city.cityName || c.city.name })))

interface SignShiftRow {
  graha: string
  baseSign: string
  citySigns: string[]
}

const signShiftRows = computed<SignShiftRow[]>(() => {
  if (!resolvedComparisons.value.length) return []
  const rows: SignShiftRow[] = []
  for (const p of props.result.baseChart.planets) {
    const citySigns = resolvedComparisons.value.map(c => {
      const cp = c.chart.planets.find(x => x.graha === p.graha)
      return cp ? cp.signNameZh : '—'
    })
    // 只保留至少一个城市换座的行星
    if (citySigns.some(s => s !== p.signNameZh && s !== '—')) {
      rows.push({ graha: p.graha, baseSign: p.signNameZh, citySigns })
    }
  }
  return rows
})

/* ---------- 相位变化 ---------- */

const citiesWithHighlights = computed(() =>
  resolvedComparisons.value
    .filter(c => c.aspectHighlights.length)
    .map(c => ({
      name: c.city.cityName || c.city.name,
      highlights: c.aspectHighlights.slice(0, 6),
    })))

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('astroFortuneTune.report.pending'))

const aiSections = computed<{ title: string; html: string }[]>(() => {
  const text = props.analysis || ''
  const out: { title: string; html: string }[] = []
  if (text) {
    const parts = text.split(/(?=^## )/m).filter(p => p.trim())
    for (const part of parts) {
      const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('astroFortuneTune.untitledSection')
      const body = part.replace(/^## .+\n?/, '').trim()
      if (body) out.push({ title, html: marked.parse(body, { async: false }) as string })
    }
  }
  // 流式尚未产出章节时，先展示占位卡
  if (!out.length) {
    out.push({ title: t('astroFortuneTune.untitledSection'), html: `<p class="aft-pending">${pendingText.value}</p>` })
  }
  return out
})
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bazi-ziwei 报告色系） ========== */
.aft {
  --aft-bg: #f2ede3;
  --aft-sheet: #faf6ec;
  --aft-card: #fffdf6;
  --aft-ink: #2e2a24;
  --aft-ink-soft: #55503f;
  --aft-ink-faint: #8a8272;
  --aft-line: #d8d0bd;
  --aft-line-soft: #e6dfcd;
  --aft-accent: #8c2f26;
  --aft-accent-soft: #a8512e;
  --aft-star: #8c6d1f;
  --aft-green: #4a7c59;
  border-radius: 12px;
  background: var(--aft-bg);
  padding: 18px;
  color: var(--aft-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.aft-sheet {
  background: var(--aft-sheet);
  border: 1px solid var(--aft-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.aft-head { border-bottom: 2px solid var(--aft-ink); padding-bottom: 16px; }
.aft-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.aft-brand { display: flex; align-items: center; gap: 8px; }
.aft-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--aft-accent);
  color: var(--aft-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.aft-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--aft-ink-soft); }
.aft-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--aft-ink-faint); }

.aft-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.aft-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--aft-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 4px;
}

/* ---------- 通用卡片/行 ---------- */
.aft-row { display: grid; gap: 14px; margin-top: 16px; }
.aft-row-top { grid-template-columns: 1fr 2.2fr; }
.aft-section { margin-top: 16px; }

.aft-card {
  background: var(--aft-card);
  border: 1px solid var(--aft-line);
  padding: 14px 16px;
  min-width: 0;
}
.aft-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--aft-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 命主信息卡 ---------- */
.aft-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.aft-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.aft-ico { color: var(--aft-accent-soft); font-size: 12px; }
.aft-profile-label { color: var(--aft-ink-faint); min-width: 30px; }
.aft-profile-value { color: var(--aft-ink); letter-spacing: 0.5px; }

/* ---------- 四小卡 ---------- */
.aft-quad { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aft-mini { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.aft-mini-accent { border: 1.5px solid var(--aft-accent); background: rgba(140, 47, 38, 0.04); }
.aft-mini-label { font-size: 11px; color: var(--aft-ink-faint); letter-spacing: 1px; }
.aft-mini-value { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.aft-mini-en { font-size: 11px; font-weight: 400; color: var(--aft-ink-faint); margin-left: 4px; }
.aft-mini-sub { font-size: 10.5px; color: var(--aft-ink-faint); line-height: 1.5; }

/* ---------- 出生时间不确定 ---------- */
.aft-timeuncertain {
  margin-top: 14px;
  border: 1px dashed var(--aft-accent-soft);
  background: rgba(168, 81, 46, 0.06);
  padding: 8px 12px;
  font-size: 11.5px;
  color: var(--aft-accent-soft);
  line-height: 1.6;
}

/* ---------- 表格通用 ---------- */
.aft-table-wrap { overflow-x: auto; }
.aft-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.aft-table th, .aft-table td {
  border: 1px solid var(--aft-line);
  padding: 5px 8px;
  text-align: left;
  line-height: 1.5;
}
.aft-table thead th {
  background: var(--aft-line-soft);
  font-weight: 700;
  color: var(--aft-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.aft-table td { color: var(--aft-ink-soft); }
.aft-table-note { margin: 8px 0 0; font-size: 10.5px; color: var(--aft-ink-faint); line-height: 1.6; }

.aft-td-city { font-weight: 700; color: var(--aft-ink); white-space: nowrap; }
.aft-td-sign { white-space: nowrap; }
.aft-td-en { font-size: 10px; color: var(--aft-ink-faint); }
.aft-td-planet { font-weight: 700; color: var(--aft-ink); white-space: nowrap; }
.aft-td-unresolved { color: var(--aft-ink-faint); font-style: italic; }
.aft-td-changed { background: rgba(140, 47, 38, 0.05); font-weight: 700; color: var(--aft-accent-soft); }
.aft-tr-base { background: rgba(140, 47, 38, 0.03); }
.aft-tr-signchange { background: rgba(74, 124, 89, 0.04); }

.aft-tag-base {
  font-size: 9px; border: 1px solid var(--aft-accent); color: var(--aft-accent);
  padding: 0 3px; margin-left: 4px; letter-spacing: 1px; white-space: nowrap;
}
.aft-tag-unresolved {
  font-size: 9px; border: 1px solid var(--aft-ink-faint); color: var(--aft-ink-faint);
  padding: 0 3px; margin-left: 4px; letter-spacing: 1px; white-space: nowrap;
}
.aft-tag-change {
  font-size: 9px; border: 1px solid var(--aft-green); color: var(--aft-green);
  padding: 0 3px; margin-left: 4px; letter-spacing: 1px; white-space: nowrap;
}
.aft-change-arrow { margin-left: 3px; font-size: 9px; color: var(--aft-accent-soft); }

/* ---------- Δ 条形 ---------- */
.aft-delta { display: flex; align-items: center; gap: 6px; min-width: 110px; }
.aft-delta-track { width: 72px; height: 8px; background: var(--aft-line-soft); flex-shrink: 0; }
.aft-delta-bar { display: block; height: 100%; background: var(--aft-accent-soft); }
.aft-delta-num { font-size: 10px; color: var(--aft-ink-faint); white-space: nowrap; }

/* ---------- 相位卡 ---------- */
.aft-aspect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.aft-aspect-title {
  margin: 0 0 8px;
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  border-bottom: 1px solid var(--aft-line-soft);
  padding-bottom: 6px;
}
.aft-aspect-city { font-size: 13px; font-weight: 700; letter-spacing: 1px; }
.aft-aspect-count { font-size: 10px; color: var(--aft-ink-faint); }
.aft-table-aspect { font-size: 10.5px; }
.aft-orb { white-space: nowrap; font-size: 10px; }
.aft-orb-tight { color: var(--aft-green); font-weight: 700; }
.aft-orb-loose { color: var(--aft-accent-soft); }

/* ---------- 计算口径 ---------- */
.aft-methodnote {
  border: 1px dashed var(--aft-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 14px;
  font-size: 11px; color: var(--aft-ink-faint); line-height: 1.7;
}
.aft-methodnote-label { font-weight: 700; color: var(--aft-ink-soft); margin-right: 6px; letter-spacing: 1px; }

/* ---------- AI 章节 ---------- */
.aft-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.aft-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--aft-line-soft);
  padding-bottom: 8px;
}
.aft-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--aft-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.aft-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--aft-ink-soft); }

.aft-md :deep(p) { margin: 0 0 0.7em; }
.aft-md :deep(p:last-child) { margin-bottom: 0; }
.aft-md :deep(strong) { color: var(--aft-ink); font-weight: 700; }
.aft-md :deep(ul), .aft-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.aft-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.aft-md :deep(h3), .aft-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--aft-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.aft-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--aft-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.aft-md :deep(.aft-pending), .aft-pending { color: var(--aft-ink-faint); font-style: italic; }

.aft-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--aft-ink-faint); letter-spacing: 1px;
}
.aft-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--aft-accent);
  animation: aft-pulse 1s ease-in-out infinite;
}
@keyframes aft-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.aft-error { margin-top: 14px; text-align: center; color: var(--aft-accent); font-size: 12px; }
.aft-retry {
  margin-top: 8px;
  border: 1px solid var(--aft-accent);
  background: transparent;
  color: var(--aft-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.aft-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.aft-foot {
  margin-top: 18px;
  border-top: 1px solid var(--aft-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.aft-foot-note { font-size: 10px; color: var(--aft-ink-faint); max-width: 80%; }
.aft-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .aft-row-top { grid-template-columns: 1fr; }
  .aft-aspect-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .aft { padding: 8px; }
  .aft-sheet { padding: 16px 12px; }
  .aft-title { font-size: 22px; letter-spacing: 2px; }
  .aft-ai-grid { grid-template-columns: 1fr; }
  .aft-quad { grid-template-columns: 1fr 1fr; }
  .aft-mini-value { font-size: 17px; }
  .aft-table { min-width: 520px; }
  .aft-foot-note { max-width: 100%; }
}
</style>
