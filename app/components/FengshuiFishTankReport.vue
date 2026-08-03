<template>
  <div class="fft">
    <div class="fft-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="fft-head">
        <div class="fft-head-top">
          <div class="fft-brand">
            <div class="fft-seal">{{ $t('fishTank.report.seal') }}</div>
            <span class="fft-brand-name">{{ $t('fishTank.report.brandName') }}</span>
          </div>
          <div class="fft-head-right">
            <span class="fft-time">{{ $t('fishTank.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="fft-rating">{{ $t('fishTank.report.rating') }}</span>
            <span class="fft-verdict">
              {{ result.wealth.direction }} · {{ result.wealth.star }}
            </span>
          </div>
        </div>

        <h1 class="fft-title">{{ titleText }}</h1>
        <p class="fft-subtitle">{{ subtitleText }}</p>

        <div class="fft-head-bottom">
          <p class="fft-meta-line">
            {{ $t('fishTank.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('fishTank.report.metaDayMaster', { gan: result.dayMasterGan, wuxing: result.dayMasterWuxing }) }}
          </p>
          <p class="fft-meta-line">
            {{ $t('fishTank.report.metaFacing', { facing: facingText }) }}
            · {{ $t('fishTank.report.metaRoom', { room: roomTypeText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 五行概览 ============ -->
      <section class="fft-row fft-row-top">
        <div class="fft-card fft-profile">
          <div class="fft-profile-line">
            <span class="fft-ico">⚥</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileGender') }}</span>
            <span class="fft-profile-value">{{ genderText }}</span>
          </div>
          <div class="fft-profile-line">
            <span class="fft-ico">◷</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileBirth') }}</span>
            <span class="fft-profile-value">{{ result.birthYear }}</span>
          </div>
          <div class="fft-profile-line">
            <span class="fft-ico">⌖</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileFacing') }}</span>
            <span class="fft-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="fft-profile-line">
            <span class="fft-ico">▤</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileRoom') }}</span>
            <span class="fft-profile-value">{{ roomTypeText }}</span>
          </div>
          <div v-if="result.floor != null" class="fft-profile-line">
            <span class="fft-ico">≣</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileFloor') }}</span>
            <span class="fft-profile-value">{{ result.floor }}</span>
          </div>
          <div v-if="result.tankSize" class="fft-profile-line">
            <span class="fft-ico">◫</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileTank') }}</span>
            <span class="fft-profile-value">{{ result.tankSize }}</span>
          </div>
          <div class="fft-profile-line">
            <span class="fft-ico">☯</span>
            <span class="fft-profile-label">{{ $t('fishTank.report.profileMing') }}</span>
            <span class="fft-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
        </div>

        <div class="fft-card fft-overview">
          <h3 class="fft-card-title">{{ $t('fishTank.report.overviewTitle') }}</h3>
          <div class="fft-overview-grid">
            <div class="fft-mini">
              <h4 class="fft-mini-head">☯ {{ $t('fishTank.report.xiyongTitle') }}</h4>
              <div class="fft-xiyong">
                <div class="fft-xiyong-row">
                  <span class="fft-xiyong-label">{{ $t('fishTank.report.xiyongGood') }}</span>
                  <span class="fft-wuxing-chip fft-wuxing-good">{{ result.xiyong }}</span>
                </div>
                <div class="fft-xiyong-row">
                  <span class="fft-xiyong-label">{{ $t('fishTank.report.xiyongBad') }}</span>
                  <span class="fft-wuxing-chip fft-wuxing-bad">{{ result.jishen }}</span>
                </div>
              </div>
              <p class="fft-mini-body">{{ $t('fishTank.report.xiyongNote', { day: result.dayMasterGan, wuxing: result.dayMasterWuxing }) }}</p>
            </div>
            <div class="fft-mini">
              <h4 class="fft-mini-head">✪ {{ $t('fishTank.report.wealthTitle') }}</h4>
              <div class="fft-wealth-line">
                <span class="fft-wealth-dir">{{ result.wealth.direction }}</span>
                <span class="fft-wealth-note">{{ result.wealth.star }}</span>
              </div>
              <p class="fft-mini-body">{{ $t('fishTank.report.wealthNote') }}</p>
            </div>
            <div class="fft-mini fft-mini-wide">
              <h4 class="fft-mini-head">{{ $t('fishTank.report.wuxingChartTitle') }}</h4>
              <div class="fft-radar-wrap">
                <div class="fft-radar-canvas">
                  <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 五板块 01-05 ============ -->
      <section class="fft-row fft-ai-row">
        <div class="fft-card fft-ai">
          <h3 class="fft-ai-title"><span class="fft-ai-no">01</span>{{ $t('fishTank.report.secPosition') }}</h3>
          <div class="fft-ai-body fft-md fft-md-tiles fft-md-tiles-dir" v-html="renderSection(aiSections[AI_KEYS.position])" />
        </div>
        <div class="fft-card fft-ai">
          <h3 class="fft-ai-title"><span class="fft-ai-no">02</span>{{ $t('fishTank.report.secFlow') }}</h3>
          <div class="fft-ai-body fft-md" v-html="renderSection(aiSections[AI_KEYS.flow])" />
        </div>
      </section>

      <!-- 鱼类配置：表格 + 柱状图 -->
      <section class="fft-section">
        <div class="fft-card">
          <h3 class="fft-ai-title"><span class="fft-ai-no">03</span>{{ $t('fishTank.report.secFish') }}</h3>
          <div v-if="fishRows.length" class="fft-fish-grid">
            <div class="fft-table-wrap">
              <table class="fft-table">
                <thead>
                  <tr>
                    <th>{{ $t('fishTank.report.fishColSpecies') }}</th>
                    <th>{{ $t('fishTank.report.fishColColor') }}</th>
                    <th>{{ $t('fishTank.report.fishColCount') }}</th>
                    <th>{{ $t('fishTank.report.fishColBasis') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in fishRows" :key="i">
                    <td class="fft-table-palace">{{ row.species }}</td>
                    <td>{{ row.color }}</td>
                    <td class="fft-table-palace">{{ row.count }}</td>
                    <td class="fft-table-note">{{ row.basis }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="fft-fish-chart">
              <p class="fft-fish-chart-title">{{ $t('fishTank.report.fishBarTitle') }}</p>
              <div class="fft-bar-canvas">
                <Bar v-if="fishBarData" :data="fishBarData" :options="fishBarOptions" />
              </div>
            </div>
          </div>
          <div class="fft-ai-body fft-md" :class="{ 'fft-fish-fallback': !fishRows.length }" v-html="renderSection(aiSections[AI_KEYS.fish])" />
        </div>
      </section>

      <section class="fft-row fft-ai-row">
        <div class="fft-card fft-ai">
          <h3 class="fft-ai-title"><span class="fft-ai-no">04</span>{{ $t('fishTank.report.secPlant') }}</h3>
          <div class="fft-ai-body fft-md fft-md-tiles" v-html="renderSection(aiSections[AI_KEYS.plant])" />
        </div>
        <div class="fft-card fft-ai">
          <h3 class="fft-ai-title"><span class="fft-ai-no">05</span>{{ $t('fishTank.report.secExtra') }}</h3>
          <div class="fft-ai-body fft-md fft-md-tiles fft-md-tiles-warn" v-html="renderSection(aiSections[AI_KEYS.extra])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="fft-streaming">
        <span class="fft-streaming-dot" />
        {{ $t('fishTank.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="fft-error">
        <p>{{ error }}</p>
        <button type="button" class="fft-retry" @click="$emit('retry')">{{ $t('fishTank.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="fft-foot">
        <span class="fft-foot-note">ⓘ {{ $t('fishTank.disclaimer') }}</span>
        <span class="fft-seal fft-seal-foot">{{ $t('fishTank.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { Radar, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import type { Gua } from '~/utils/bazhai'
import type { FishTankCalcResult } from '~~/server/api/tools/fengshui-fish-tank/calc.post'

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
)

interface Props {
  result: FishTankCalcResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{ retry: [] }>()

const { t, locale } = useI18n()

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const DONGSI: Gua[] = ['坎', '震', '巽', '离']
const dongsiMingText = computed(() => t(`fishTank.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))

const GUA_NAME_KEY: Record<string, string> = {
  坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li', 中: 'zhong',
}
function guaName(name: string): string {
  return t(`fishTank.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}

const genderText = computed(() => (props.result.gender === 'male' ? t('common.male') : t('common.female')))
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

const ROOM_KEY: Record<string, string> = { residence: 'roomResidence', office: 'roomOffice', shop: 'roomShop' }
const roomTypeText = computed(() => t(`fishTank.${ROOM_KEY[props.result.roomType] ?? 'roomResidence'}`))

const titleText = computed(() => t('fishTank.report.title', { gua: guaName(props.result.mingGua) }))
const subtitleText = computed(() => t('fishTank.report.subtitle', { room: roomTypeText.value }))

/* ---------- 五行雷达图 ---------- */

const WUXING_ORDER = ['木', '火', '土', '金', '水'] as const
const radarData = computed(() => ({
  labels: WUXING_ORDER.map(wx => wx),
  datasets: [
    {
      label: t('fishTank.report.wuxingChartTitle'),
      data: WUXING_ORDER.map(wx => props.result.wuxingScore[wx] ?? 0),
      backgroundColor: 'rgba(61, 107, 110, 0.16)',
      borderColor: '#3d6b6e',
      borderWidth: 1.5,
      pointBackgroundColor: ['#4a7c59', '#a8512e', '#8a6d3b', '#7d7d68', '#4a6a8a'],
      pointBorderColor: '#faf6ec',
      pointRadius: 3,
    },
  ],
}))
const radarMax = computed(() => Math.max(4, ...WUXING_ORDER.map(wx => props.result.wuxingScore[wx] ?? 0)) + 1)
const radarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: radarMax.value,
      ticks: { display: false, stepSize: 1 },
      grid: { color: 'rgba(85, 80, 63, 0.18)' },
      angleLines: { color: 'rgba(85, 80, 63, 0.18)' },
      pointLabels: { color: '#55503f', font: { size: 12, family: "'Noto Serif SC', serif" } },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(46, 42, 36, 0.92)',
      titleColor: '#f2ede3',
      bodyColor: '#e6dfcd',
      borderColor: 'rgba(61, 107, 110, 0.5)',
      borderWidth: 1,
    },
  },
}))

/* ---------- AI 内容解析 ---------- */

// 提示词固定输出这 5 个 ## 标题，用作分区索引
const AI_KEYS = {
  position: '摆放位置与方位',
  flow: '水流方向',
  fish: '鱼类鱼群配置',
  plant: '水培植物配置',
  extra: '补充建议',
} as const

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

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="fft-pending">${t('fishTank.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/* ---------- 鱼类表格行解析 ---------- */

interface FishRow { species: string; color: string; count: string; basis: string }

// 解析「- **金鱼 · 红色 · 6 条**：依据」列表项
const fishRows = computed<FishRow[]>(() => {
  const content = aiSections.value[AI_KEYS.fish]
  if (!content) return []
  const rows: FishRow[] = []
  const re = /\*\*([^*·]+)·([^*·]+)·([^*·]+)\*\*[：:]\s*(.+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    rows.push({
      species: (m[1] ?? '').trim(),
      color: (m[2] ?? '').trim(),
      count: (m[3] ?? '').trim(),
      basis: (m[4] ?? '').trim(),
    })
  }
  return rows
})

// 鱼数量柱状图：每种鱼的条数（从 count 提取首个数字）
const fishBarData = computed(() => {
  if (!fishRows.value.length) return null
  const nums = fishRows.value.map(r => {
    const n = parseInt(r.count.replace(/[^\d]/g, ''), 10)
    return Number.isFinite(n) ? n : 0
  })
  return {
    labels: fishRows.value.map(r => r.species),
    datasets: [
      {
        label: t('fishTank.report.fishBarYLabel'),
        data: nums,
        backgroundColor: fishRows.value.map((_, i) => `rgba(61, 107, 110, ${0.45 + (i % 3) * 0.15})`),
        borderColor: '#3d6b6e',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})
const fishBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#55503f', font: { size: 10 } },
      grid: { color: 'rgba(85, 80, 63, 0.14)' },
    },
    x: {
      ticks: { color: '#55503f', font: { size: 10, family: "'Noto Serif SC', serif" } },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(46, 42, 36, 0.92)',
      titleColor: '#f2ede3',
      bodyColor: '#e6dfcd',
      borderColor: 'rgba(61, 107, 110, 0.5)',
      borderWidth: 1,
    },
  },
}
</script>

<style scoped>
/* ========== 纸质报告主题（同 hall/bedroom 风水报告，水青点缀） ========== */
.fft {
  --fft-bg: #f2ede3;
  --fft-sheet: #faf6ec;
  --fft-card: #fffdf6;
  --fft-ink: #2e2a24;
  --fft-ink-soft: #55503f;
  --fft-ink-faint: #8a8272;
  --fft-line: #d8d0bd;
  --fft-line-soft: #e6dfcd;
  --fft-accent: #8c2f26;
  --fft-accent-soft: #a8512e;
  --fft-star: #8c6d1f;
  --fft-green: #4a7c59;
  --fft-teal: #3d6b6e;
  border-radius: 12px;
  background: var(--fft-bg);
  padding: 18px;
  color: var(--fft-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.fft-sheet {
  background: var(--fft-sheet);
  border: 1px solid var(--fft-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.fft-head { border-bottom: 2px solid var(--fft-ink); padding-bottom: 16px; }
.fft-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.fft-brand { display: flex; align-items: center; gap: 8px; }
.fft-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--fft-teal);
  color: var(--fft-teal);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.fft-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--fft-ink-soft); }
.fft-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--fft-ink-faint); }
.fft-verdict { color: var(--fft-teal); font-weight: 600; }
.fft-rating { letter-spacing: 1px; }

.fft-title { margin: 14px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-align: center; }
.fft-subtitle { text-align: center; font-size: 13px; color: var(--fft-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.fft-head-bottom { text-align: center; }
.fft-meta-line { margin: 2px 0; font-size: 12px; color: var(--fft-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.fft-row { display: grid; gap: 14px; margin-top: 16px; }
.fft-row-top { grid-template-columns: 1fr 2.2fr; }
.fft-ai-row { grid-template-columns: 1fr 1fr; }
.fft-section { margin-top: 16px; }

.fft-card {
  background: var(--fft-card);
  border: 1px solid var(--fft-line);
  padding: 14px 16px;
  min-width: 0;
}
.fft-card-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  border-bottom: 1px solid var(--fft-line-soft);
  padding-bottom: 8px; text-align: center;
}

/* ---------- 排盘档案卡 ---------- */
.fft-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.fft-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.fft-ico { color: var(--fft-teal); font-size: 12px; }
.fft-profile-label { color: var(--fft-ink-faint); min-width: 30px; }
.fft-profile-value { color: var(--fft-ink); letter-spacing: 0.5px; }

/* ---------- 概览 ---------- */
.fft-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fft-mini { border: 1px dashed var(--fft-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.fft-mini-wide { grid-column: 1 / -1; }
.fft-mini-head { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: var(--fft-teal); letter-spacing: 1px; }
.fft-mini-body { margin: 8px 0 0; font-size: 11px; line-height: 1.7; color: var(--fft-ink-soft); }

.fft-xiyong { display: flex; flex-direction: column; gap: 6px; }
.fft-xiyong-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.fft-xiyong-label { color: var(--fft-ink-faint); letter-spacing: 1px; }
.fft-wuxing-chip {
  display: inline-block; font-size: 14px; font-weight: 700;
  padding: 1px 10px; border-radius: 2px; letter-spacing: 1px;
}
.fft-wuxing-good { background: rgba(74, 124, 89, 0.14); color: var(--fft-green); border: 1px solid rgba(74, 124, 89, 0.4); }
.fft-wuxing-bad { background: rgba(140, 47, 38, 0.12); color: var(--fft-accent); border: 1px solid rgba(140, 47, 38, 0.4); }

.fft-wealth-line { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.fft-wealth-dir { font-size: 26px; font-weight: 700; color: var(--fft-star); letter-spacing: 2px; }
.fft-wealth-note { font-size: 13px; color: var(--fft-ink-soft); }

.fft-radar-wrap { display: flex; justify-content: center; }
.fft-radar-canvas { width: 100%; max-width: 340px; height: 240px; }

/* ---------- AI 章节 ---------- */
.fft-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--fft-line-soft);
  padding-bottom: 8px;
}
.fft-ai-no { font-size: 11px; color: #f5efe0; background: var(--fft-ink); padding: 2px 6px; letter-spacing: 1px; }
.fft-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--fft-ink-soft); }

.fft-md :deep(p) { margin: 0 0 0.7em; }
.fft-md :deep(p:last-child) { margin-bottom: 0; }
.fft-md :deep(strong) { color: var(--fft-ink); font-weight: 700; }
.fft-md :deep(ul), .fft-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.fft-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.fft-md { overflow-x: auto; }
.fft-md :deep(.fft-pending), .fft-pending { color: var(--fft-ink-faint); font-style: italic; }

/* 列表项渲染成小格卡片 */
.fft-md-tiles :deep(ul), .fft-md-tiles :deep(ol) {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin: 0; padding: 0; list-style: none;
}
.fft-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--fft-line-soft);
  border-left: 3px solid var(--fft-teal);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px; line-height: 1.65; color: var(--fft-ink-soft);
}
.fft-md-tiles :deep(li strong) { display: block; font-size: 11.5px; letter-spacing: 1px; color: var(--fft-ink); margin-bottom: 3px; }
.fft-md-tiles-dir :deep(li) { border-left-color: var(--fft-accent-soft); }
.fft-md-tiles-warn :deep(li) { border-left-color: var(--fft-accent); }
.fft-md-tiles-warn :deep(li strong) { color: var(--fft-accent); }

/* ---------- 鱼类表格 + 柱状图 ---------- */
.fft-fish-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; margin-bottom: 12px; }
.fft-fish-chart { border: 1px dashed var(--fft-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); display: flex; flex-direction: column; }
.fft-fish-chart-title { margin: 0 0 8px; font-size: 11px; color: var(--fft-ink-faint); letter-spacing: 1px; text-align: center; }
.fft-bar-canvas { flex: 1; min-height: 180px; }
.fft-fish-fallback { margin-top: 4px; }

.fft-table-wrap { overflow-x: auto; }
.fft-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.fft-table th, .fft-table td { border: 1px solid var(--fft-line); padding: 6px 8px; text-align: center; line-height: 1.55; }
.fft-table thead th { background: var(--fft-line-soft); font-weight: 700; color: var(--fft-ink); letter-spacing: 1px; }
.fft-table td { color: var(--fft-ink-soft); }
.fft-table-palace { font-weight: 700; color: var(--fft-ink); }
.fft-table-note { text-align: left; font-size: 10.5px; }

.fft-streaming { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--fft-ink-faint); letter-spacing: 1px; }
.fft-streaming-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--fft-teal); animation: fft-pulse 1s ease-in-out infinite; }
@keyframes fft-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.fft-error { margin-top: 14px; text-align: center; color: var(--fft-accent); font-size: 12px; }
.fft-retry { margin-top: 8px; border: 1px solid var(--fft-accent); background: transparent; color: var(--fft-accent); font-size: 12px; padding: 5px 16px; cursor: pointer; font-family: inherit; letter-spacing: 1px; }
.fft-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.fft-foot { margin-top: 18px; border-top: 1px solid var(--fft-line); padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.fft-foot-note { font-size: 10px; color: var(--fft-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.fft-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ---------- */
@container (max-width: 1100px) {
  .fft-row-top { grid-template-columns: 1fr; }
  .fft-fish-grid { grid-template-columns: 1fr; }
}

@container (max-width: 720px) {
  .fft { padding: 8px; }
  .fft-sheet { padding: 16px 12px; }
  .fft-ai-row { grid-template-columns: 1fr; }
  .fft-overview-grid { grid-template-columns: 1fr; }
  .fft-md-tiles :deep(ul), .fft-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .fft-title { font-size: 20px; letter-spacing: 2px; }
  .fft-table { min-width: 460px; }
}
</style>
