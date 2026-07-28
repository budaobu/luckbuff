<template>
  <div class="qsr">
    <div class="qsr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="qsr-head">
        <div class="qsr-head-top">
          <div class="qsr-brand">
            <div class="qsr-seal">{{ $t('qizhengSiyu.report.seal') }}</div>
            <span class="qsr-brand-name">{{ $t('qizhengSiyu.report.brandName') }}</span>
          </div>
          <div class="qsr-head-right">
            <span>{{ $t('qizhengSiyu.report.generatedAt') }}：{{ generatedAt }}</span>
            <span>{{ $t('qizhengSiyu.report.systemLine') }}</span>
          </div>
        </div>

        <h1 class="qsr-title">{{ $t('qizhengSiyu.resultTitle') }}</h1>
        <p class="qsr-subtitle">{{ $t('qizhengSiyu.resultSubtitle') }}</p>
        <p class="qsr-meta-line">{{ $t('qizhengSiyu.report.baseCityLabel') }} {{ chart.baseCityName }} · {{ $t('qizhengSiyu.report.longitudeOffsetLabel') }} {{ chart.localOffsetHours.toFixed(2) }} h</p>
      </header>

      <!-- ============ 四角小卡 ============ -->
      <section class="qsr-section">
        <div class="qsr-quad">
          <div
            v-for="(a, i) in angleCards"
            :key="a.name"
            class="qsr-card qsr-mini"
            :class="{ 'qsr-mini-accent': i === 0 }"
          >
            <div class="qsr-mini-label">{{ a.nameZh }}</div>
            <div class="qsr-mini-value">
              {{ a.signNameZh }}
              <span class="qsr-mini-en">{{ a.signNameEn }}</span>
            </div>
            <div class="qsr-mini-sub">{{ a.degreeInSign.toFixed(1) }}°</div>
          </div>
        </div>
      </section>

      <!-- ============ 宫位分布条形图 ============ -->
      <section class="qsr-section">
        <div class="qsr-card">
          <h3 class="qsr-card-title">{{ $t('qizhengSiyu.report.houseDensityTitle') }}</h3>
          <div class="qsr-density">
            <div v-for="row in houseDensityRows" :key="row.house" class="qsr-density-row">
              <span class="qsr-density-label">{{ row.house }}{{ $t('qizhengSiyu.houseSuffix') }}</span>
              <span class="qsr-density-bar-wrap">
                <span class="qsr-density-bar" :style="{ width: row.pct + '%' }" />
              </span>
              <span class="qsr-density-bodies">{{ row.bodies.join(' · ') }}</span>
              <span class="qsr-density-count">{{ row.count }}</span>
            </div>
          </div>
          <p class="qsr-table-note">{{ $t('qizhengSiyu.report.houseDensityNote') }}</p>
        </div>
      </section>

      <!-- ============ 十二宫位表 ============ -->
      <section class="qsr-section">
        <div class="qsr-card">
          <h3 class="qsr-card-title">{{ $t('qizhengSiyu.housesTitle') }}</h3>
          <div class="qsr-table-wrap">
            <table class="qsr-table">
              <thead>
                <tr>
                  <th>{{ $t('qizhengSiyu.report.colHouse') }}</th>
                  <th>{{ $t('qizhengSiyu.tableSign') }}</th>
                  <th>{{ $t('qizhengSiyu.report.colBodies') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in houseRows" :key="row.number" :class="{ 'qsr-tr-filled': row.bodies.length }">
                  <td class="qsr-td-house">{{ row.number }}{{ $t('qizhengSiyu.houseSuffix') }}</td>
                  <td>{{ row.signNameZh }} <span class="qsr-td-en">{{ row.signNameEn }}</span></td>
                  <td>{{ row.bodies.length ? row.bodies.join(' · ') : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 七政 ============ -->
      <section class="qsr-section">
        <div class="qsr-card">
          <h3 class="qsr-card-title">{{ $t('qizhengSiyu.planetsTitle') }}</h3>
          <div class="qsr-table-wrap">
            <table class="qsr-table">
              <thead>
                <tr>
                  <th>{{ $t('qizhengSiyu.tableBody') }}</th>
                  <th>{{ $t('qizhengSiyu.tableSign') }}</th>
                  <th>{{ $t('qizhengSiyu.tableHouse') }}</th>
                  <th>{{ $t('qizhengSiyu.tableState') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in chart.planets" :key="p.key" :class="{ 'qsr-tr-luminary': p.key === 'sun' || p.key === 'moon' }">
                  <td class="qsr-td-body">{{ p.name }} <span class="qsr-td-en">{{ p.nameEn }}</span></td>
                  <td>{{ p.signNameZh }} {{ p.degreeInSign.toFixed(1) }}°</td>
                  <td>{{ p.house }}{{ $t('qizhengSiyu.houseSuffix') }}</td>
                  <td>
                    <span v-if="p.isRetrograde" class="qsr-state qsr-state-retro">{{ $t('qizhengSiyu.retrograde') }}</span>
                    <span v-else class="qsr-state qsr-state-direct">{{ $t('qizhengSiyu.direct') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 四余 ============ -->
      <section class="qsr-section">
        <div class="qsr-card">
          <h3 class="qsr-card-title">{{ $t('qizhengSiyu.remaindersTitle') }}</h3>
          <div class="qsr-table-wrap">
            <table class="qsr-table">
              <thead>
                <tr>
                  <th>{{ $t('qizhengSiyu.tableBody') }}</th>
                  <th>{{ $t('qizhengSiyu.tableSign') }}</th>
                  <th>{{ $t('qizhengSiyu.tableHouse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in chart.remainders" :key="r.key">
                  <td class="qsr-td-body">{{ r.name }} <span class="qsr-td-en">{{ r.nameEn }}</span></td>
                  <td>{{ r.signNameZh }} {{ r.degreeInSign.toFixed(1) }}°</td>
                  <td>{{ r.house }}{{ $t('qizhengSiyu.houseSuffix') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 主要相位 ============ -->
      <section v-if="chart.aspects.length" class="qsr-section">
        <div class="qsr-card">
          <h3 class="qsr-card-title">{{ $t('qizhengSiyu.aspectsTitle') }}</h3>
          <div class="qsr-table-wrap">
            <table class="qsr-table">
              <thead>
                <tr>
                  <th>{{ $t('qizhengSiyu.report.colBodies2') }}</th>
                  <th>{{ $t('qizhengSiyu.report.colAspect') }}</th>
                  <th>{{ $t('qizhengSiyu.report.colAngle') }}</th>
                  <th>{{ $t('qizhengSiyu.report.colOrb') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in chart.aspects" :key="i">
                  <td class="qsr-td-body">{{ a.body1Name }} — {{ a.body2Name }}</td>
                  <td>{{ a.aspectName }}</td>
                  <td>{{ a.angle.toFixed(1) }}°</td>
                  <td>
                    <div class="qsr-orb">
                      <span class="qsr-orb-track">
                        <span class="qsr-orb-bar" :style="{ width: orbPct(a.orb) + '%' }" />
                      </span>
                      <span class="qsr-orb-num">{{ a.orb.toFixed(1) }}°</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 计算口径说明 ============ -->
      <section class="qsr-section">
        <div class="qsr-methodnote">
          <span class="qsr-methodnote-label">{{ $t('qizhengSiyu.methodNoteTitle') }}</span>
          {{ chart.methodNote }}
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="qsr-section">
        <div class="qsr-ai-grid">
          <div v-for="(s, i) in aiSections" :key="i" class="qsr-card qsr-ai">
            <h3 class="qsr-ai-title">
              <span class="qsr-ai-no">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.title }}
            </h3>
            <div class="qsr-ai-body qsr-md" v-html="s.html" />
          </div>
        </div>

        <!-- 流式中提示 -->
        <div v-if="streaming" class="qsr-streaming">
          <span class="qsr-streaming-dot" />
          {{ $t('qizhengSiyu.streaming') }}
        </div>

        <!-- AI 错误 -->
        <div v-if="error" class="qsr-error">
          <p>{{ error }}</p>
          <button type="button" class="qsr-retry" @click="$emit('retry')">{{ $t('common.retry') }}</button>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="qsr-foot">
        <span class="qsr-foot-note">ⓘ {{ $t('qizhengSiyu.disclaimer') }}</span>
        <span class="qsr-seal qsr-seal-foot">{{ $t('qizhengSiyu.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { QizhengSiyuChart } from '~/types/qizheng-siyu'

interface Props {
  chart: QizhengSiyuChart
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

const ANGLE_ORDER = ['Ascendant', 'Midheaven', 'Descendant', 'ImumCoeli'] as const
const ANGLE_I18N_KEYS: Record<string, string> = {
  Ascendant: 'angleAscendant',
  Midheaven: 'angleMidheaven',
  Descendant: 'angleDescendant',
  ImumCoeli: 'angleImumCoeli',
}
const angleCards = computed(() =>
  ANGLE_ORDER
    .map(name => {
      const a = props.chart.angles.find(x => x.name === name)
      return a ? { ...a, nameZh: t(`qizhengSiyu.report.${ANGLE_I18N_KEYS[name]}`) } : null
    })
    .filter((a): a is NonNullable<typeof a> => Boolean(a)))

/* ---------- 宫位分布 ---------- */

interface HouseBodyRow {
  number: number
  signNameZh: string
  signNameEn: string
  bodies: string[]
}

const houseRows = computed<HouseBodyRow[]>(() =>
  props.chart.houses.map(h => ({
    number: h.number,
    signNameZh: h.signNameZh,
    signNameEn: h.signNameEn,
    bodies: [
      ...props.chart.planets.filter(p => p.house === h.number).map(p => p.name),
      ...props.chart.remainders.filter(r => r.house === h.number).map(r => r.name),
    ],
  })))

const houseDensityRows = computed(() => {
  const max = Math.max(1, ...houseRows.value.map(r => r.bodies.length))
  return houseRows.value.map(r => ({
    house: r.number,
    bodies: r.bodies,
    count: r.bodies.length,
    pct: Math.round((r.bodies.length / max) * 100),
  }))
})

/* ---------- 相位 ---------- */

/** 容许度映射到条宽：10° 封顶 */
function orbPct(orb: number): number {
  return Math.min(100, Math.round((Math.abs(orb) / 10) * 100))
}

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('qizhengSiyu.report.pending'))
const untitledSection = computed(() => t('qizhengSiyu.report.untitledSection'))

const aiSections = computed<{ title: string; html: string }[]>(() => {
  const text = props.analysis || ''
  const out: { title: string; html: string }[] = []
  if (text) {
    const parts = text.split(/(?=^## )/m).filter(p => p.trim())
    for (const part of parts) {
      const title = part.match(/^## (.+)/)?.[1]?.trim() ?? untitledSection.value
      const body = part.replace(/^## .+\n?/, '').trim()
      if (body) out.push({ title, html: marked.parse(body, { async: false }) as string })
    }
  }
  // 流式尚未产出章节时，先展示占位卡
  if (!out.length) {
    out.push({ title: untitledSection.value, html: `<p class="qsr-pending">${pendingText.value}</p>` })
  }
  return out
})
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bazi-ziwei 报告色系） ========== */
.qsr {
  --qsr-bg: #f2ede3;
  --qsr-sheet: #faf6ec;
  --qsr-card: #fffdf6;
  --qsr-ink: #2e2a24;
  --qsr-ink-soft: #55503f;
  --qsr-ink-faint: #8a8272;
  --qsr-line: #d8d0bd;
  --qsr-line-soft: #e6dfcd;
  --qsr-accent: #8c2f26;
  --qsr-accent-soft: #a8512e;
  --qsr-star: #8c6d1f;
  --qsr-green: #4a7c59;
  border-radius: 12px;
  background: var(--qsr-bg);
  padding: 18px;
  color: var(--qsr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.qsr-sheet {
  background: var(--qsr-sheet);
  border: 1px solid var(--qsr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.qsr-head { border-bottom: 2px solid var(--qsr-ink); padding-bottom: 16px; }
.qsr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.qsr-brand { display: flex; align-items: center; gap: 8px; }
.qsr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--qsr-accent);
  color: var(--qsr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.qsr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--qsr-ink-soft); }
.qsr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--qsr-ink-faint); }

.qsr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.qsr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--qsr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 8px;
}
.qsr-meta-line { text-align: center; margin: 0; font-size: 11px; color: var(--qsr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/区块 ---------- */
.qsr-section { margin-top: 16px; }
.qsr-card {
  background: var(--qsr-card);
  border: 1px solid var(--qsr-line);
  padding: 14px 16px;
  min-width: 0;
}
.qsr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--qsr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 四角小卡 ---------- */
.qsr-quad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.qsr-mini { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.qsr-mini-accent { border: 1.5px solid var(--qsr-accent); background: rgba(140, 47, 38, 0.04); }
.qsr-mini-label { font-size: 11px; color: var(--qsr-ink-faint); letter-spacing: 1px; }
.qsr-mini-value { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.qsr-mini-en { font-size: 11px; font-weight: 400; color: var(--qsr-ink-faint); margin-left: 4px; }
.qsr-mini-sub { font-size: 10.5px; color: var(--qsr-ink-faint); line-height: 1.5; }

/* ---------- 宫位分布条形 ---------- */
.qsr-density { display: flex; flex-direction: column; gap: 5px; }
.qsr-density-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.qsr-density-label { width: 32px; font-weight: 700; color: var(--qsr-ink-soft); white-space: nowrap; }
.qsr-density-bar-wrap { flex: 0 0 30%; height: 8px; background: var(--qsr-line-soft); }
.qsr-density-bar { display: block; height: 100%; background: var(--qsr-accent-soft); }
.qsr-density-bodies { flex: 1; color: var(--qsr-ink-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qsr-density-count { width: 14px; text-align: right; font-weight: 700; color: var(--qsr-ink-soft); }

/* ---------- 表格通用 ---------- */
.qsr-table-wrap { overflow-x: auto; }
.qsr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.qsr-table th, .qsr-table td {
  border: 1px solid var(--qsr-line);
  padding: 5px 8px;
  text-align: left;
  line-height: 1.5;
}
.qsr-table thead th {
  background: var(--qsr-line-soft);
  font-weight: 700;
  color: var(--qsr-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.qsr-table td { color: var(--qsr-ink-soft); }
.qsr-table-note { margin: 8px 0 0; font-size: 10.5px; color: var(--qsr-ink-faint); line-height: 1.6; }

.qsr-td-house { font-weight: 700; color: var(--qsr-ink); white-space: nowrap; }
.qsr-td-body { font-weight: 700; color: var(--qsr-ink); white-space: nowrap; }
.qsr-td-en { font-size: 10px; color: var(--qsr-ink-faint); }
.qsr-tr-filled { background: rgba(140, 109, 31, 0.04); }
.qsr-tr-luminary { background: rgba(140, 47, 38, 0.03); }

.qsr-state { white-space: nowrap; font-size: 10.5px; }
.qsr-state-retro { color: var(--qsr-accent-soft); font-weight: 700; }
.qsr-state-direct { color: var(--qsr-ink-faint); }

/* ---------- 相位容许度条形 ---------- */
.qsr-orb { display: flex; align-items: center; gap: 6px; min-width: 110px; }
.qsr-orb-track { width: 72px; height: 8px; background: var(--qsr-line-soft); flex-shrink: 0; }
.qsr-orb-bar { display: block; height: 100%; background: var(--qsr-star); }
.qsr-orb-num { font-size: 10px; color: var(--qsr-ink-faint); white-space: nowrap; }

/* ---------- 计算口径 ---------- */
.qsr-methodnote {
  border: 1px dashed var(--qsr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 14px;
  font-size: 11px; color: var(--qsr-ink-faint); line-height: 1.7;
}
.qsr-methodnote-label { font-weight: 700; color: var(--qsr-ink-soft); margin-right: 6px; letter-spacing: 1px; }

/* ---------- AI 章节 ---------- */
.qsr-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.qsr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--qsr-line-soft);
  padding-bottom: 8px;
}
.qsr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--qsr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.qsr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--qsr-ink-soft); }

.qsr-md :deep(p) { margin: 0 0 0.7em; }
.qsr-md :deep(p:last-child) { margin-bottom: 0; }
.qsr-md :deep(strong) { color: var(--qsr-ink); font-weight: 700; }
.qsr-md :deep(ul), .qsr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.qsr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.qsr-md :deep(h3), .qsr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--qsr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.qsr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.qsr-md :deep(th), .qsr-md :deep(td) { border: 1px solid var(--qsr-line); padding: 4px 6px; text-align: left; }
.qsr-md :deep(th) { background: var(--qsr-line-soft); font-weight: 700; color: var(--qsr-ink); }
.qsr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--qsr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.qsr-md :deep(.qsr-pending), .qsr-pending { color: var(--qsr-ink-faint); font-style: italic; }

.qsr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--qsr-ink-faint); letter-spacing: 1px;
}
.qsr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--qsr-accent);
  animation: qsr-pulse 1s ease-in-out infinite;
}
@keyframes qsr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.qsr-error { margin-top: 14px; text-align: center; color: var(--qsr-accent); font-size: 12px; }
.qsr-retry {
  margin-top: 8px;
  border: 1px solid var(--qsr-accent);
  background: transparent;
  color: var(--qsr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.qsr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.qsr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--qsr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.qsr-foot-note { font-size: 10px; color: var(--qsr-ink-faint); max-width: 80%; }
.qsr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .qsr-quad { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .qsr { padding: 8px; }
  .qsr-sheet { padding: 16px 12px; }
  .qsr-title { font-size: 22px; letter-spacing: 2px; }
  .qsr-ai-grid { grid-template-columns: 1fr; }
  .qsr-quad { grid-template-columns: 1fr 1fr; }
  .qsr-mini-value { font-size: 17px; }
  .qsr-table { min-width: 520px; }
  .qsr-density-bar-wrap { flex: 0 0 22%; }
  .qsr-foot-note { max-width: 100%; }
}
</style>
