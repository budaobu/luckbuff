<template>
  <div class="kyr">
    <div class="kyr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="kyr-head">
        <div class="kyr-head-top">
          <div class="kyr-brand">
            <div class="kyr-seal">{{ $t('kanyu.report.seal') }}</div>
            <span class="kyr-brand-name">{{ $t('kanyu.report.brandName') }}</span>
          </div>
          <div class="kyr-head-right">
            <span class="kyr-time">{{ $t('kanyu.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="kyr-rating">{{ $t('kanyu.report.rating') }}</span>
            <span class="kyr-verdict" :class="{ 'kyr-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="kyr-title">{{ titleText }}</h1>
        <p class="kyr-subtitle">{{ subtitleText }}</p>

        <div class="kyr-head-bottom">
          <p class="kyr-meta-line">
            {{ $t('kanyu.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('kanyu.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="kyr-meta-line">
            {{ $t('kanyu.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('kanyu.report.metaPeriod', { period: result.period.name }) }}
            · {{ $t('kanyu.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="kyr-row kyr-row-top">
        <div class="kyr-card kyr-profile">
          <div class="kyr-profile-line">
            <span class="kyr-ico">⚥</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profileGender') }}</span>
            <span class="kyr-profile-value">{{ genderText }}</span>
          </div>
          <div class="kyr-profile-line">
            <span class="kyr-ico">◷</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profileBirth') }}</span>
            <span class="kyr-profile-value">{{ birthText }}</span>
          </div>
          <div class="kyr-profile-line">
            <span class="kyr-ico">◔</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profileHour') }}</span>
            <span class="kyr-profile-value">{{ birthHourText }}</span>
          </div>
          <div class="kyr-profile-line">
            <span class="kyr-ico">⌖</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profileFacing') }}</span>
            <span class="kyr-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="kyr-profile-line">
            <span class="kyr-ico">☰</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profilePeriod') }}</span>
            <span class="kyr-profile-value">{{ result.period.name }}（{{ result.period.startYear }}–{{ result.period.endYear }}）</span>
          </div>
          <div class="kyr-profile-line">
            <span class="kyr-ico">☯</span>
            <span class="kyr-profile-label">{{ $t('kanyu.report.profileMing') }}</span>
            <span class="kyr-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
        </div>

        <div class="kyr-card kyr-overview">
          <h3 class="kyr-card-title">{{ $t('kanyu.report.overviewTitle') }}</h3>
          <div class="kyr-overview-grid">
            <div class="kyr-mini">
              <h4 class="kyr-mini-head">★ {{ $t('kanyu.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="kyr-point">
                <div class="kyr-point-title"><span class="kyr-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="kyr-point-desc">{{ $t('kanyu.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="kyr-mini">
              <h4 class="kyr-mini-head kyr-mini-head-warn">⊘ {{ $t('kanyu.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="kyr-point">
                <div class="kyr-point-title kyr-point-title-warn"><span class="kyr-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="kyr-point-desc">{{ $t('kanyu.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="kyr-mini kyr-mini-wide">
              <h4 class="kyr-mini-head">{{ $t('kanyu.report.matchNoteTitle') }}</h4>
              <p class="kyr-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 星曜统计 ============ -->
      <section class="kyr-section">
        <h3 class="kyr-section-title">{{ $t('kanyu.report.statsTitle') }}</h3>
        <div class="kyr-core-grid">
          <div class="kyr-card kyr-core">
            <div class="kyr-core-label">{{ $t('kanyu.report.coreLuckyCount') }}</div>
            <div class="kyr-core-value kyr-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="kyr-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="kyr-card kyr-core">
            <div class="kyr-core-label">{{ $t('kanyu.report.coreCautionCount') }}</div>
            <div class="kyr-core-value kyr-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="kyr-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="kyr-card kyr-core">
            <div class="kyr-core-label">{{ $t('kanyu.report.coreBestStar') }}</div>
            <div class="kyr-core-value kyr-core-value-good kyr-core-value-text">{{ starName(bestPalace?.star ?? '生气') }}</div>
            <div class="kyr-core-sub">{{ bestPalace ? directionName(bestPalace.direction) : '—' }}</div>
          </div>
          <div class="kyr-card kyr-core">
            <div class="kyr-core-label">{{ $t('kanyu.report.coreWorstStar') }}</div>
            <div class="kyr-core-value kyr-core-value-warn kyr-core-value-text">{{ starName(worstPalace?.star ?? '绝命') }}</div>
            <div class="kyr-core-sub">{{ worstPalace ? directionName(worstPalace.direction) : '—' }}</div>
          </div>
          <div class="kyr-card kyr-core kyr-core-chart">
            <div class="kyr-core-label">{{ $t('kanyu.report.coreStarChart') }}</div>
            <div class="kyr-bars">
              <div v-for="s in starStats" :key="s.key" class="kyr-bar-row">
                <span class="kyr-bar-name" :class="s.auspicious ? 'kyr-bar-name-good' : 'kyr-bar-name-warn'">{{ s.label }}</span>
                <span class="kyr-bar-wrap">
                  <span class="kyr-bar" :class="s.auspicious ? 'kyr-bar-good' : 'kyr-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="kyr-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="kyr-row kyr-pans">
        <!-- 八宫吉凶盘 -->
        <div class="kyr-card kyr-pan">
          <h3 class="kyr-pan-title">
            {{ $t('kanyu.report.panTitle') }}
            <span class="kyr-pan-legend">{{ $t('kanyu.report.panLegend') }}</span>
          </h3>
          <div class="kyr-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="kyr-cell"
              :class="cellClass(cell)"
            >
              <div class="kyr-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="kyr-cell-stars">
                <span v-if="cell.star" class="kyr-star" :class="cell.auspicious ? 'kyr-star-lucky' : 'kyr-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="kyr-star kyr-star-plain">{{ $t('kanyu.report.centerPalace') }}</span>
                <span v-if="cell.level" class="kyr-cell-level" :class="cell.auspicious ? 'kyr-level-good' : 'kyr-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="kyr-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="kyr-badge kyr-badge-good">{{ $t('kanyu.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="kyr-badge kyr-badge-warn">{{ $t('kanyu.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="kyr-badge kyr-badge-zhai">{{ $t('kanyu.report.badgeZhai') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 星曜方位雷达图 -->
        <div class="kyr-card kyr-pan">
          <h3 class="kyr-pan-title">{{ $t('kanyu.report.radarTitle') }}</h3>
          <div class="kyr-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="kyr-radar" xmlns="http://www.w3.org/2000/svg">
              <polygon
                v-for="lvl in [1, 2, 3, 4]"
                :key="lvl"
                :points="ringPoints(lvl)"
                fill="none"
                stroke="#d8d0bd"
                stroke-width="0.6"
              />
              <g v-for="(label, i) in radarLabels" :key="i">
                <line
                  :x1="0" :y1="0"
                  :x2="RADAR_AXIS_POINTS[i]!.x" :y2="RADAR_AXIS_POINTS[i]!.y"
                  stroke="#e6dfcd"
                  stroke-width="0.6"
                />
                <text
                  :x="RADAR_LABEL_POINTS[i]!.x" :y="RADAR_LABEL_POINTS[i]!.y"
                  class="kyr-radar-label"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ label }}</text>
              </g>
              <polygon :points="radarSeriesPoints" fill="rgba(140, 109, 31, 0.14)" stroke="none" />
              <polyline :points="radarSeriesPoints" fill="none" stroke="#8c6d1f" stroke-width="1.4" />
              <circle
                v-for="(p, i) in radarPalaces"
                :key="p.name"
                :cx="RADAR_VALUE_POINTS[i]!.x" :cy="RADAR_VALUE_POINTS[i]!.y"
                r="2.2"
                :fill="p.auspicious ? '#4a7c59' : '#8c2f26'"
              />
            </svg>
            <div class="kyr-radar-legend">
              <span class="kyr-radar-legend-item"><i class="kyr-radar-swatch kyr-radar-swatch-value" />{{ $t('kanyu.report.radarValue') }}</span>
              <span class="kyr-radar-legend-item"><i class="kyr-radar-dot kyr-radar-dot-good" />{{ $t('kanyu.report.radarLucky') }}</span>
              <span class="kyr-radar-legend-item"><i class="kyr-radar-dot kyr-radar-dot-warn" />{{ $t('kanyu.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="kyr-section">
        <div class="kyr-card">
          <h3 class="kyr-card-title">{{ $t('kanyu.report.tableTitle') }}</h3>
          <div class="kyr-table-wrap">
            <table class="kyr-table">
              <thead>
                <tr>
                  <th>{{ $t('kanyu.report.tablePalace') }}</th>
                  <th>{{ $t('kanyu.report.tableDirection') }}</th>
                  <th>{{ $t('kanyu.report.tableStar') }}</th>
                  <th>{{ $t('kanyu.report.tableLevel') }}</th>
                  <th>{{ $t('kanyu.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="kyr-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="kyr-star" :class="p.auspicious ? 'kyr-star-lucky' : 'kyr-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="kyr-badge" :class="p.auspicious ? 'kyr-badge-good' : 'kyr-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="kyr-table-note">{{ $t(`kanyu.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="kyr-section">
        <div class="kyr-card">
          <h3 class="kyr-card-title">{{ $t('kanyu.report.remedyTitle') }}</h3>
          <div class="kyr-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="kyr-remedy">
              <div class="kyr-remedy-head">
                <span class="kyr-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="kyr-badge kyr-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="kyr-remedy-body">
                {{ $t(`kanyu.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="kyr-row kyr-ai-row">
        <div class="kyr-card kyr-ai">
          <h3 class="kyr-ai-title"><span class="kyr-ai-no">01</span>{{ $t('kanyu.report.secOverview') }}</h3>
          <div class="kyr-ai-body kyr-md" v-html="renderSection(aiSections['宅基与命卦速览'])" />
        </div>
        <div class="kyr-card kyr-ai">
          <h3 class="kyr-ai-title"><span class="kyr-ai-no">02</span>{{ $t('kanyu.report.secPalaces') }}</h3>
          <div class="kyr-ai-body kyr-md kyr-md-tiles kyr-md-tiles-dir" v-html="renderSection(aiSections['八宫吉凶一览'])" />
        </div>
      </section>

      <section class="kyr-row kyr-ai-row">
        <div class="kyr-card kyr-ai">
          <h3 class="kyr-ai-title"><span class="kyr-ai-no">03</span>{{ $t('kanyu.report.secLayout') }}</h3>
          <div class="kyr-ai-body kyr-md kyr-md-tiles" v-html="renderSection(aiSections['布局建议'])" />
        </div>
        <div class="kyr-card kyr-ai">
          <h3 class="kyr-ai-title"><span class="kyr-ai-no">04</span>{{ $t('kanyu.report.secRemedy') }}</h3>
          <div class="kyr-ai-body kyr-md kyr-md-tiles kyr-md-tiles-warn" v-html="renderSection(aiSections['化解与提醒'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="kyr-streaming">
        <span class="kyr-streaming-dot" />
        {{ $t('kanyu.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="kyr-error">
        <p>{{ error }}</p>
        <button type="button" class="kyr-retry" @click="$emit('retry')">{{ $t('kanyu.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="kyr-foot">
        <span class="kyr-foot-note">ⓘ {{ $t('kanyu.disclaimer') }}</span>
        <span class="kyr-seal kyr-seal-foot">{{ $t('kanyu.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Gua, Star, PalaceResult } from '~/utils/bazhai'
import type { KanyuCalcResult } from '~~/server/api/tools/fengshui/calc.post'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: KanyuCalcResult
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

const zhaiGua = computed<Gua>(() => props.result.sittingMountain?.palace ?? props.result.mingGua)

const DONGSI: Gua[] = ['坎', '震', '巽', '离']
const mingZhaiMatch = computed(() =>
  DONGSI.includes(props.result.mingGua) === DONGSI.includes(zhaiGua.value))

const genderText = computed(() => (props.result.gender === 'male' ? t('common.male') : t('common.female')))
const birthText = computed(() => {
  const r = props.result
  return r.effectiveBirthYear === r.birthYear
    ? String(r.birthYear)
    : `${r.birthYear}（${t('kanyu.report.effectiveYearNote', { year: r.effectiveBirthYear })}）`
})
const birthHourText = computed(() =>
  props.result.birthHour ? props.result.birthHour : t('kanyu.unknownHour'))
const dongsiMingText = computed(() => t(`kanyu.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`kanyu.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'kanyu.report.matchYes' : 'kanyu.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'kanyu.report.verdictGood' : 'kanyu.report.verdictCaution'))

const titleText = computed(() =>
  t('kanyu.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))

const subtitleText = computed(() =>
  t('kanyu.report.subtitle', { sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'kanyu.report.matchNoteYes' : 'kanyu.report.matchNoteNo', {
    ming: dongsiMingText.value,
    zhai: dongsiZhaiText.value,
  }))

/* ---------- 宫位工具 ---------- */

const GUA_NAME_KEY: Record<string, string> = {
  坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li', 中: 'zhong',
}
const DIRECTION_KEY: Record<string, string> = {
  北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw',
}
const STAR_KEY: Record<Star, string> = {
  生气: 'shengqi', 延年: 'yannian', 天医: 'tianyi', 伏位: 'fuwei',
  绝命: 'jueming', 五鬼: 'wugui', 祸害: 'huohai', 六煞: 'liusha',
}
const LEVEL_KEY: Record<string, string> = {
  大吉: 'daJi', 吉: 'ji', 小吉: 'xiaoJi', 大凶: 'daXiong', 凶: 'xiong',
}
// 吉凶数值：大吉 4 / 吉 3 / 小吉 2 / 凶 1 / 大凶 0.4（雷达图用）
const LEVEL_SCORE: Record<string, number> = {
  大吉: 4, 吉: 3, 小吉: 2, 凶: 1, 大凶: 0.4,
}

function guaName(name: string): string {
  return t(`kanyu.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`kanyu.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`kanyu.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`kanyu.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
}

// 九宫格按上南下北排列：巽 离 坤 / 震 中 兑 / 艮 坎 乾
const GRID_ORDER: (Gua | '中')[] = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
const gridCells = computed<GridCell[]>(() =>
  GRID_ORDER.map((name) => {
    if (name === '中') {
      return { name: '中', direction: null, palaceNumber: null, star: null, auspicious: true, level: null }
    }
    return props.result.palaces.find(p => p.name === name)!
  }))

// 表格按罗盘顺时针：坎（北）起
const TABLE_ORDER: Gua[] = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾']
const palaceOrder = computed(() =>
  TABLE_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))

const RADAR_ORDER: Gua[] = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾']
const radarPalaces = computed(() =>
  RADAR_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))
const radarLabels = computed(() => radarPalaces.value.map(p => guaName(p.name)))

/* ---------- 吉凶统计 ---------- */

const auspiciousPalaces = computed(() => props.result.palaces.filter(p => p.auspicious))
const inauspiciousPalaces = computed(() => props.result.palaces.filter(p => !p.auspicious))

const bestPalace = computed(() => props.result.palaces.find(p => p.star === '生气') ?? null)
const worstPalace = computed(() => props.result.palaces.find(p => p.star === '绝命') ?? null)

// 柱状图：八星按吉凶值排序，值 = 吉凶分 / 4
const starStats = computed(() =>
  [...props.result.palaces]
    .sort((a, b) => (LEVEL_SCORE[b.level] ?? 0) - (LEVEL_SCORE[a.level] ?? 0))
    .map(p => ({
      key: STAR_KEY[p.star],
      label: starName(p.star),
      direction: directionName(p.direction),
      value: (LEVEL_SCORE[p.level] ?? 1) / 4,
      auspicious: p.auspicious,
    })))

function cellClass(cell: GridCell): string {
  if (cell.name === '中') return 'kyr-cell-center'
  return cell.auspicious ? 'kyr-cell-lucky' : 'kyr-cell-ominous'
}

/* ---------- 雷达图 ---------- */

const RADAR_R = 88
function radarPoint(i: number, value: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2
  const r = (value / 4) * RADAR_R
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}
// html-to-image 对 SVG transform 序列化有兼容问题，角度全部预计算为坐标
const RADAR_AXIS_POINTS = Array.from({ length: 8 }, (_, i) => radarPoint(i, 4))
const RADAR_LABEL_POINTS = Array.from({ length: 8 }, (_, i) => radarPoint(i, 4.75))
const RADAR_VALUE_POINTS = computed(() =>
  radarPalaces.value.map((p, i) => radarPoint(i, LEVEL_SCORE[p.level] ?? 1)))

function ringPoints(level: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const pt = radarPoint(i, level)
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
}
const radarSeriesPoints = computed(() =>
  RADAR_VALUE_POINTS.value.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' '))

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

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="kyr-pending">${t('kanyu.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.kyr {
  --kyr-bg: #f2ede3;
  --kyr-sheet: #faf6ec;
  --kyr-card: #fffdf6;
  --kyr-ink: #2e2a24;
  --kyr-ink-soft: #55503f;
  --kyr-ink-faint: #8a8272;
  --kyr-line: #d8d0bd;
  --kyr-line-soft: #e6dfcd;
  --kyr-accent: #8c2f26;
  --kyr-accent-soft: #a8512e;
  --kyr-star: #8c6d1f;
  --kyr-green: #4a7c59;
  border-radius: 12px;
  background: var(--kyr-bg);
  padding: 18px;
  color: var(--kyr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.kyr-sheet {
  background: var(--kyr-sheet);
  border: 1px solid var(--kyr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.kyr-head { border-bottom: 2px solid var(--kyr-ink); padding-bottom: 16px; }
.kyr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.kyr-brand { display: flex; align-items: center; gap: 8px; }
.kyr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--kyr-accent);
  color: var(--kyr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.kyr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--kyr-ink-soft); }
.kyr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--kyr-ink-faint); }
.kyr-verdict { color: var(--kyr-green); font-weight: 600; }
.kyr-verdict-warn { color: var(--kyr-accent); }
.kyr-rating { letter-spacing: 1px; }

.kyr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.kyr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--kyr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.kyr-head-bottom { text-align: center; }
.kyr-meta-line { margin: 2px 0; font-size: 12px; color: var(--kyr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.kyr-row { display: grid; gap: 14px; margin-top: 16px; }
.kyr-row-top { grid-template-columns: 1fr 2.4fr; }
.kyr-pans { grid-template-columns: 1.2fr 1fr; }
.kyr-ai-row { grid-template-columns: 1fr 1fr; }
.kyr-section { margin-top: 16px; }

.kyr-card {
  background: var(--kyr-card);
  border: 1px solid var(--kyr-line);
  padding: 14px 16px;
  min-width: 0;
}
.kyr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--kyr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.kyr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.kyr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.kyr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.kyr-ico { color: var(--kyr-accent-soft); font-size: 12px; }
.kyr-profile-label { color: var(--kyr-ink-faint); min-width: 30px; }
.kyr-profile-value { color: var(--kyr-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.kyr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kyr-mini { border: 1px dashed var(--kyr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.kyr-mini-wide { grid-column: 1 / -1; }
.kyr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--kyr-accent-soft); letter-spacing: 1px; }
.kyr-mini-head-warn { color: var(--kyr-accent); }
.kyr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--kyr-ink-soft); }
.kyr-point { margin-bottom: 7px; }
.kyr-point:last-child { margin-bottom: 0; }
.kyr-point-title { font-size: 12px; font-weight: 700; color: var(--kyr-ink); display: flex; gap: 5px; align-items: baseline; }
.kyr-point-title-warn { color: var(--kyr-accent); }
.kyr-point-ico { font-size: 10px; color: var(--kyr-star); }
.kyr-point-desc { font-size: 11px; color: var(--kyr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 星曜统计卡 ---------- */
.kyr-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.kyr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.kyr-core-chart { grid-column: span 1; }
.kyr-core-label { font-size: 11px; color: var(--kyr-ink-faint); letter-spacing: 1px; }
.kyr-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.kyr-core-value-text { font-size: 20px; }
.kyr-core-value-good { color: var(--kyr-star); }
.kyr-core-value-warn { color: var(--kyr-accent); }
.kyr-core-sub { font-size: 10px; color: var(--kyr-ink-faint); }

.kyr-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.kyr-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.kyr-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.kyr-bar-name-good { color: var(--kyr-star); }
.kyr-bar-name-warn { color: var(--kyr-accent); }
.kyr-bar-wrap { flex: 1; height: 6px; background: var(--kyr-line-soft); }
.kyr-bar { display: block; height: 100%; }
.kyr-bar-good { background: var(--kyr-star); }
.kyr-bar-warn { background: var(--kyr-accent); }
.kyr-bar-dir { width: 22px; text-align: right; color: var(--kyr-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.kyr-pan { padding: 12px; }
.kyr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.kyr-pan-legend { display: block; font-size: 9px; color: var(--kyr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.kyr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.kyr-cell {
  border: 1px solid var(--kyr-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--kyr-card);
}
.kyr-cell-lucky { border-color: var(--kyr-star); background: rgba(140, 109, 31, 0.05); }
.kyr-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.kyr-cell-center { background: var(--kyr-line-soft); }
.kyr-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--kyr-ink-faint); }
.kyr-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.kyr-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.kyr-star-plain { color: var(--kyr-ink); }
.kyr-star-lucky { color: var(--kyr-star); }
.kyr-star-ominous { color: var(--kyr-accent); }
.kyr-cell-level { font-size: 10px; }
.kyr-level-good { color: var(--kyr-star); }
.kyr-level-warn { color: var(--kyr-accent); }
.kyr-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.kyr-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.kyr-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--kyr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.kyr-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--kyr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.kyr-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--kyr-star); border: 1px solid rgba(140, 109, 31, 0.4); }

/* ---------- 雷达图 ---------- */
.kyr-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.kyr-radar { width: 100%; max-width: 320px; }
.kyr-radar-label { font-size: 8.5px; fill: var(--kyr-ink-soft); font-weight: 700; }
.kyr-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--kyr-ink-faint); flex-wrap: wrap; justify-content: center; }
.kyr-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.kyr-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.kyr-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.kyr-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.kyr-radar-dot-good { background: #4a7c59; }
.kyr-radar-dot-warn { background: #8c2f26; }

/* ---------- 八宫数据表 ---------- */
.kyr-table-wrap { overflow-x: auto; }
.kyr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.kyr-table th, .kyr-table td {
  border: 1px solid var(--kyr-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.kyr-table thead th {
  background: var(--kyr-line-soft);
  font-weight: 700;
  color: var(--kyr-ink);
  letter-spacing: 1px;
}
.kyr-table td { color: var(--kyr-ink-soft); }
.kyr-table-palace { font-weight: 700; color: var(--kyr-ink); }
.kyr-table .kyr-star { font-size: 14px; }
.kyr-table .kyr-badge { font-size: 9.5px; }
.kyr-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.kyr-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kyr-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.kyr-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.kyr-remedy-title { font-size: 12px; font-weight: 700; color: var(--kyr-accent); letter-spacing: 1px; }
.kyr-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--kyr-ink-soft); }

/* ---------- AI 章节 ---------- */
.kyr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--kyr-line-soft);
  padding-bottom: 8px;
}
.kyr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--kyr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.kyr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--kyr-ink-soft); }

.kyr-md :deep(p) { margin: 0 0 0.7em; }
.kyr-md :deep(p:last-child) { margin-bottom: 0; }
.kyr-md :deep(strong) { color: var(--kyr-ink); font-weight: 700; }
.kyr-md :deep(ul), .kyr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.kyr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.kyr-md :deep(h3), .kyr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--kyr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.kyr-md { overflow-x: auto; }
.kyr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--kyr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.kyr-md :deep(.kyr-pending), .kyr-pending { color: var(--kyr-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片（02/03/04 区块） ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.kyr-md-tiles :deep(ul), .kyr-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.kyr-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--kyr-line-soft);
  border-left: 3px solid var(--kyr-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--kyr-ink-soft);
}
.kyr-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--kyr-ink);
  margin-bottom: 3px;
}
/* 02 八宫一览：八条正好铺 2 列 x 4 行 */
.kyr-md-tiles-dir :deep(li) { border-left-color: var(--kyr-accent-soft); }
/* 04 化解提醒：凶方用朱砂色强调 */
.kyr-md-tiles-warn :deep(li) { border-left-color: var(--kyr-accent); }
.kyr-md-tiles-warn :deep(li strong) { color: var(--kyr-accent); }

.kyr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--kyr-ink-faint); letter-spacing: 1px;
}
.kyr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--kyr-accent);
  animation: kyr-pulse 1s ease-in-out infinite;
}
@keyframes kyr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.kyr-error { margin-top: 14px; text-align: center; color: var(--kyr-accent); font-size: 12px; }
.kyr-retry {
  margin-top: 8px;
  border: 1px solid var(--kyr-accent);
  background: transparent;
  color: var(--kyr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.kyr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.kyr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--kyr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.kyr-foot-note { font-size: 10px; color: var(--kyr-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.kyr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .kyr-row-top { grid-template-columns: 1fr; }
  .kyr-pans { grid-template-columns: 1fr; }
  .kyr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .kyr-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .kyr { padding: 8px; }
  .kyr-sheet { padding: 16px 12px; }
  .kyr-ai-row { grid-template-columns: 1fr; }
  .kyr-overview-grid { grid-template-columns: 1fr; }
  .kyr-remedy-grid { grid-template-columns: 1fr; }
  .kyr-md-tiles :deep(ul), .kyr-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .kyr-title { font-size: 20px; letter-spacing: 2px; }
  .kyr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .kyr-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .kyr-pan { padding: 8px; }
  .kyr-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .kyr-star { font-size: 13px; }
  .kyr-cell-head { font-size: 8px; }
  .kyr-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .kyr-table { min-width: 520px; }
}
</style>
