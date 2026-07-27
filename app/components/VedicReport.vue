<template>
  <div class="vdr">
    <div class="vdr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="vdr-head">
        <div class="vdr-head-top">
          <div class="vdr-brand">
            <div class="vdr-seal">{{ $t('vedic.report.seal') }}</div>
            <span class="vdr-brand-name">{{ $t('vedic.report.brandName') }}</span>
          </div>
          <div class="vdr-head-right">
            <span>{{ $t('vedic.report.generatedAt') }}：{{ generatedAt }}</span>
            <span>{{ $t('vedic.report.systemLine') }}</span>
          </div>
        </div>

        <h1 class="vdr-title">{{ $t('vedic.report.title') }}</h1>
        <p class="vdr-subtitle">{{ subtitleText }}</p>
      </header>

      <!-- ============ 命主信息 + 四小卡 ============ -->
      <section class="vdr-row vdr-row-top">
        <div class="vdr-card vdr-profile">
          <div class="vdr-profile-line">
            <span class="vdr-ico">☀</span>
            <span class="vdr-profile-label">{{ $t('vedic.report.birthLabel') }}</span>
            <span class="vdr-profile-value">{{ birthText }}</span>
          </div>
          <div class="vdr-profile-line">
            <span class="vdr-ico">◈</span>
            <span class="vdr-profile-label">{{ $t('vedic.report.cityLabel') }}</span>
            <span class="vdr-profile-value">{{ chart.cityName ?? '—' }}</span>
          </div>
          <div class="vdr-profile-line">
            <span class="vdr-ico">⧗</span>
            <span class="vdr-profile-label">{{ $t('vedic.report.timezoneLabel') }}</span>
            <span class="vdr-profile-value">{{ offsetText }}</span>
          </div>
          <div class="vdr-profile-line">
            <span class="vdr-ico">✦</span>
            <span class="vdr-profile-label">{{ $t('vedic.report.ayanamshaLabel') }}</span>
            <span class="vdr-profile-value">{{ chart.ayanamsha }}°</span>
          </div>
        </div>

        <div class="vdr-quad">
          <div class="vdr-card vdr-mini">
            <div class="vdr-mini-label">{{ $t('vedic.report.ascendantCard') }}</div>
            <div class="vdr-mini-value">
              {{ chart.ascendant.signNameZh }}
              <span class="vdr-mini-en">{{ chart.ascendant.signName }}</span>
            </div>
            <div class="vdr-mini-sub">
              {{ chart.ascendant.degree.toFixed(2) }}° · {{ nakshatraName(chart.ascendant.nakshatra) }} pada {{ chart.ascendant.nakshatraPada }}
            </div>
          </div>
          <div class="vdr-card vdr-mini">
            <div class="vdr-mini-label">{{ $t('vedic.report.moonCard') }}</div>
            <div class="vdr-mini-value">
              {{ moonPlanet?.signNameZh ?? '—' }}
              <span class="vdr-mini-en">{{ moonPlanet?.signName }}</span>
            </div>
            <div class="vdr-mini-sub" v-if="moonPlanet">
              {{ nakshatraName(moonPlanet.nakshatra) }} pada {{ moonPlanet.nakshatraPada }} · {{ $t('vedic.chart.house', { n: moonPlanet.house }) }}
            </div>
          </div>
          <div class="vdr-card vdr-mini">
            <div class="vdr-mini-label">{{ $t('vedic.report.sunCard') }}</div>
            <div class="vdr-mini-value">
              {{ sunPlanet?.signNameZh ?? '—' }}
              <span class="vdr-mini-en">{{ sunPlanet?.signName }}</span>
            </div>
            <div class="vdr-mini-sub" v-if="sunPlanet">
              {{ sunPlanet.degree.toFixed(1) }}° · {{ $t('vedic.chart.house', { n: sunPlanet.house }) }}
            </div>
          </div>
          <div class="vdr-card vdr-mini vdr-mini-accent">
            <div class="vdr-mini-label">{{ $t('vedic.report.currentDashaCard') }}</div>
            <div class="vdr-mini-value">{{ currentDasha ? planetName(currentDasha.graha) : '—' }}</div>
            <div class="vdr-mini-sub" v-if="currentDasha">{{ currentDasha.startDate }} → {{ currentDasha.endDate }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 出生时间不确定提示 ============ -->
      <div v-if="chart.timeUncertain" class="vdr-timeuncertain">
        ⚠ {{ $t('vedic.chart.timeUncertainBanner') }}
      </div>

      <!-- ============ 行星落座 + 宫位分布 ============ -->
      <section class="vdr-row vdr-row-mid">
        <div class="vdr-card vdr-planets">
          <h3 class="vdr-card-title">{{ $t('vedic.report.planetsTitle') }}</h3>
          <div class="vdr-table-wrap">
            <table class="vdr-table">
              <thead>
                <tr>
                  <th>{{ $t('vedic.report.colPlanet') }}</th>
                  <th>{{ $t('vedic.report.colSign') }}</th>
                  <th>{{ $t('vedic.report.colDegree') }}</th>
                  <th>{{ $t('vedic.report.colHouse') }}</th>
                  <th>{{ $t('vedic.report.colNakshatra') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in chart.planets" :key="p.graha">
                  <td class="vdr-td-planet">
                    {{ planetName(p.graha) }}<span v-if="p.isRetrograde" class="vdr-retro" :title="$t('vedic.chart.retrograde')">℞</span>
                  </td>
                  <td>{{ p.signNameZh }} <span class="vdr-td-en">{{ p.signName }}</span></td>
                  <td>{{ p.degree.toFixed(1) }}°</td>
                  <td>{{ p.house }}</td>
                  <td>{{ nakshatraName(p.nakshatra) }} p{{ p.nakshatraPada }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="vdr-card vdr-houses">
          <h3 class="vdr-card-title">{{ $t('vedic.report.housesTitle') }}</h3>
          <div class="vdr-house-list">
            <div v-for="h in houseBars" :key="h.n" class="vdr-house-row">
              <span class="vdr-house-n">{{ h.n }}</span>
              <span class="vdr-house-bar-wrap">
                <span
                  class="vdr-house-bar"
                  :class="{ 'vdr-house-bar-zero': h.planets.length === 0 }"
                  :style="{ width: h.planets.length ? (h.planets.length / maxHouseCount * 100) + '%' : '0%' }"
                />
              </span>
              <span class="vdr-house-names">{{ h.planets.map(p => planetName(p.graha)).join(' · ') || '—' }}</span>
            </div>
          </div>
          <p v-if="keyHousesText" class="vdr-house-note">{{ keyHousesText }}</p>
        </div>
      </section>

      <!-- ============ 大运时间轴 ============ -->
      <section class="vdr-section">
        <div class="vdr-card">
          <h3 class="vdr-card-title">{{ $t('vedic.report.dashaTitle', { vimshottari: $t('vedic.terms.vimshottari') }) }}</h3>
          <div class="vdr-dasha-row">
            <div
              v-for="d in chart.dasha.slice(0, 8)"
              :key="d.startDate + d.graha"
              class="vdr-dasha-item"
              :class="{ 'vdr-dasha-current': d.isCurrent }"
            >
              <span class="vdr-dasha-graha">{{ planetName(d.graha) }}</span>
              <span class="vdr-dasha-years">{{ d.years }}{{ $t('vedic.report.yearUnit') }}</span>
              <span class="vdr-dasha-range">{{ d.startDate.slice(0, 4) }} → {{ d.endDate.slice(0, 4) }}</span>
              <span v-if="d.isCurrent" class="vdr-dasha-tag">{{ $t('vedic.chart.currentTag') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="vdr-section">
        <div class="vdr-ai-grid">
          <div v-for="(s, i) in aiSections" :key="i" class="vdr-card vdr-ai">
            <h3 class="vdr-ai-title">
              <span class="vdr-ai-no">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.title }}
            </h3>
            <div class="vdr-ai-body vdr-md" v-html="s.html" />
          </div>
        </div>

        <!-- 流式中提示 -->
        <div v-if="streaming" class="vdr-streaming">
          <span class="vdr-streaming-dot" />
          {{ $t('vedic.result.streaming') }}
        </div>

        <!-- AI 错误 -->
        <div v-if="error" class="vdr-error">
          <p>{{ error }}</p>
          <button type="button" class="vdr-retry" @click="$emit('retry')">{{ $t('common.retry') }}</button>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="vdr-foot">
        <span class="vdr-foot-note">ⓘ {{ $t('vedic.result.disclaimer') }}</span>
        <span class="vdr-seal vdr-seal-foot">{{ $t('vedic.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { VedicChart } from '~/types/vedic'

interface Props {
  chart: VedicChart
  aiContent: string
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
  const b = props.chart.birthData
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${b.year}-${pad(b.month)}-${pad(b.day)} ${pad(b.hour)}:${pad(b.minute)}`
})

const offsetText = computed(() => {
  const o = props.chart.birthData.utcOffset
  return `UTC${o >= 0 ? '+' : ''}${o}`
})

const subtitleText = computed(() =>
  t('vedic.report.subtitle', {
    sign: props.chart.ascendant.signNameZh,
    system: t('vedic.chart.houseSystemName'),
  }))

const moonPlanet = computed(() => props.chart.planets.find(p => p.graha === 'Moon'))
const sunPlanet = computed(() => props.chart.planets.find(p => p.graha === 'Sun'))
const currentDasha = computed(() => props.chart.dasha.find(d => d.isCurrent))

function planetName(graha: string): string {
  const translated = t(`vedic.chart.planetNames.${graha}`)
  return translated === `vedic.chart.planetNames.${graha}` ? graha : translated
}

function nakshatraName(name: string): string {
  const translated = t(`vedic.chart.nakshatraNames.${name}`)
  return translated === `vedic.chart.nakshatraNames.${name}` ? name : translated
}

/* ---------- 宫位分布 ---------- */

const houseBars = computed(() => Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  planets: props.chart.planets.filter(p => p.house === i + 1),
})))

const maxHouseCount = computed(() => Math.max(1, ...houseBars.value.map(h => h.planets.length)))

const keyHousesText = computed(() => {
  const kendra = [1, 4, 7, 10].map(n => houseBars.value[n - 1]!.planets.length).reduce((a, b) => a + b, 0)
  const trikona = [1, 5, 9].map(n => houseBars.value[n - 1]!.planets.length).reduce((a, b) => a + b, 0)
  return t('vedic.report.keyHousesNote', { kendra, trikona })
})

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('vedic.report.pending'))

const aiSections = computed<{ title: string; html: string }[]>(() => {
  const text = props.aiContent || ''
  const out: { title: string; html: string }[] = []
  if (text) {
    const parts = text.split(/(?=^## )/m).filter(p => p.trim())
    for (const part of parts) {
      const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('vedic.result.untitledSection')
      const body = part.replace(/^## .+\n?/, '').trim()
      if (body) out.push({ title, html: marked.parse(body, { async: false }) as string })
    }
  }
  // 流式尚未产出章节时，先展示四张待生成占位卡
  if (!out.length) {
    for (const dim of ['core', 'career', 'love', 'annual']) {
      out.push({ title: t(`vedic.dim.${dim}Label`), html: `<p class="vdr-pending">${pendingText.value}</p>` })
    }
  }
  return out
})
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bazi-ziwei 报告色系） ========== */
.vdr {
  --vdr-bg: #f2ede3;
  --vdr-sheet: #faf6ec;
  --vdr-card: #fffdf6;
  --vdr-ink: #2e2a24;
  --vdr-ink-soft: #55503f;
  --vdr-ink-faint: #8a8272;
  --vdr-line: #d8d0bd;
  --vdr-line-soft: #e6dfcd;
  --vdr-accent: #8c2f26;
  --vdr-accent-soft: #a8512e;
  --vdr-star: #8c6d1f;
  --vdr-green: #4a7c59;
  border-radius: 12px;
  background: var(--vdr-bg);
  padding: 18px;
  color: var(--vdr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.vdr-sheet {
  background: var(--vdr-sheet);
  border: 1px solid var(--vdr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.vdr-head { border-bottom: 2px solid var(--vdr-ink); padding-bottom: 16px; }
.vdr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.vdr-brand { display: flex; align-items: center; gap: 8px; }
.vdr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--vdr-accent);
  color: var(--vdr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.vdr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--vdr-ink-soft); }
.vdr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--vdr-ink-faint); }

.vdr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.vdr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--vdr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 4px;
}

/* ---------- 通用卡片/行 ---------- */
.vdr-row { display: grid; gap: 14px; margin-top: 16px; }
.vdr-row-top { grid-template-columns: 1fr 2.2fr; }
.vdr-row-mid { grid-template-columns: 1.5fr 1fr; }
.vdr-section { margin-top: 16px; }

.vdr-card {
  background: var(--vdr-card);
  border: 1px solid var(--vdr-line);
  padding: 14px 16px;
  min-width: 0;
}
.vdr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--vdr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 命主信息卡 ---------- */
.vdr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.vdr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.vdr-ico { color: var(--vdr-accent-soft); font-size: 12px; }
.vdr-profile-label { color: var(--vdr-ink-faint); min-width: 30px; }
.vdr-profile-value { color: var(--vdr-ink); letter-spacing: 0.5px; }

/* ---------- 四小卡 ---------- */
.vdr-quad { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vdr-mini { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.vdr-mini-accent { border: 1.5px solid var(--vdr-accent); background: rgba(140, 47, 38, 0.04); }
.vdr-mini-label { font-size: 11px; color: var(--vdr-ink-faint); letter-spacing: 1px; }
.vdr-mini-value { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.vdr-mini-en { font-size: 11px; font-weight: 400; color: var(--vdr-ink-faint); margin-left: 4px; }
.vdr-mini-sub { font-size: 10.5px; color: var(--vdr-ink-faint); line-height: 1.5; }

/* ---------- 出生时间不确定 ---------- */
.vdr-timeuncertain {
  margin-top: 14px;
  border: 1px dashed var(--vdr-accent-soft);
  background: rgba(168, 81, 46, 0.06);
  padding: 8px 12px;
  font-size: 11.5px;
  color: var(--vdr-accent-soft);
  line-height: 1.6;
}

/* ---------- 行星表格 ---------- */
.vdr-table-wrap { overflow-x: auto; }
.vdr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.vdr-table th, .vdr-table td {
  border: 1px solid var(--vdr-line);
  padding: 5px 8px;
  text-align: left;
  line-height: 1.5;
}
.vdr-table thead th {
  background: var(--vdr-line-soft);
  font-weight: 700;
  color: var(--vdr-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.vdr-table td { color: var(--vdr-ink-soft); }
.vdr-td-planet { font-weight: 700; color: var(--vdr-ink); white-space: nowrap; }
.vdr-td-en { font-size: 10px; color: var(--vdr-ink-faint); }
.vdr-retro { color: var(--vdr-accent-soft); font-size: 10px; margin-left: 2px; }

/* ---------- 宫位分布 ---------- */
.vdr-house-list { display: flex; flex-direction: column; gap: 5px; }
.vdr-house-row { display: flex; align-items: center; gap: 8px; font-size: 10.5px; }
.vdr-house-n {
  width: 16px; height: 16px;
  border: 1px solid var(--vdr-line);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: var(--vdr-ink-faint);
  flex-shrink: 0;
}
.vdr-house-bar-wrap { width: 90px; height: 8px; background: var(--vdr-line-soft); flex-shrink: 0; }
.vdr-house-bar { display: block; height: 100%; background: var(--vdr-accent-soft); }
.vdr-house-bar-zero { background: transparent; }
.vdr-house-names { color: var(--vdr-ink-soft); line-height: 1.4; }
.vdr-house-note { margin: 10px 0 0; font-size: 10.5px; color: var(--vdr-ink-faint); line-height: 1.6; border-top: 1px dashed var(--vdr-line); padding-top: 8px; }

/* ---------- 大运时间轴 ---------- */
.vdr-dasha-row { display: flex; gap: 4px; overflow-x: auto; }
.vdr-dasha-item {
  flex: 1; min-width: 64px;
  border: 1px solid var(--vdr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 4px; gap: 2px;
  background: var(--vdr-card);
}
.vdr-dasha-current { border-color: var(--vdr-accent); background: rgba(140, 47, 38, 0.05); }
.vdr-dasha-graha { font-size: 14px; font-weight: 700; }
.vdr-dasha-years { font-size: 9px; color: var(--vdr-ink-faint); }
.vdr-dasha-range { font-size: 9px; color: var(--vdr-ink-faint); }
.vdr-dasha-tag { font-size: 9px; color: var(--vdr-accent); font-weight: 700; letter-spacing: 1px; }

/* ---------- AI 章节 ---------- */
.vdr-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.vdr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--vdr-line-soft);
  padding-bottom: 8px;
}
.vdr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--vdr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.vdr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--vdr-ink-soft); }

.vdr-md :deep(p) { margin: 0 0 0.7em; }
.vdr-md :deep(p:last-child) { margin-bottom: 0; }
.vdr-md :deep(strong) { color: var(--vdr-ink); font-weight: 700; }
.vdr-md :deep(ul), .vdr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.vdr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.vdr-md :deep(h3), .vdr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--vdr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.vdr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--vdr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.vdr-md :deep(.vdr-pending), .vdr-pending { color: var(--vdr-ink-faint); font-style: italic; }

.vdr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--vdr-ink-faint); letter-spacing: 1px;
}
.vdr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--vdr-accent);
  animation: vdr-pulse 1s ease-in-out infinite;
}
@keyframes vdr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.vdr-error { margin-top: 14px; text-align: center; color: var(--vdr-accent); font-size: 12px; }
.vdr-retry {
  margin-top: 8px;
  border: 1px solid var(--vdr-accent);
  background: transparent;
  color: var(--vdr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.vdr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.vdr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--vdr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.vdr-foot-note { font-size: 10px; color: var(--vdr-ink-faint); max-width: 80%; }
.vdr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .vdr-row-top { grid-template-columns: 1fr; }
  .vdr-row-mid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .vdr { padding: 8px; }
  .vdr-sheet { padding: 16px 12px; }
  .vdr-title { font-size: 22px; letter-spacing: 2px; }
  .vdr-ai-grid { grid-template-columns: 1fr; }
  .vdr-quad { grid-template-columns: 1fr 1fr; }
  .vdr-mini-value { font-size: 17px; }
  .vdr-dasha-row { -webkit-overflow-scrolling: touch; }
  .vdr-dasha-item { flex: 0 0 auto; }
  .vdr-table { min-width: 460px; }
  .vdr-foot-note { max-width: 100%; }
}
</style>
