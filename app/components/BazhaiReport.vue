<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('bazhai.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('bazhai.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('bazhai.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('bazhai.report.rating') }}</span>
            <span class="bzr-verdict" :class="{ 'bzr-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">
            {{ $t('bazhai.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('bazhai.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="bzr-meta-line">
            {{ $t('bazhai.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('bazhai.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="bzr-row bzr-row-top">
        <div class="bzr-card bzr-profile">
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('bazhai.report.profileGender') }}</span>
            <span class="bzr-profile-value">{{ genderText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">◷</span>
            <span class="bzr-profile-label">{{ $t('bazhai.report.profileBirthYear') }}</span>
            <span class="bzr-profile-value">{{ result.birthYear }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⌖</span>
            <span class="bzr-profile-label">{{ $t('bazhai.report.profileDirection') }}</span>
            <span class="bzr-profile-value">{{ result.direction }}°（{{ facingText }}）</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☯</span>
            <span class="bzr-profile-label">{{ $t('bazhai.report.profileMing') }}</span>
            <span class="bzr-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
        </div>

        <div class="bzr-card bzr-overview">
          <h3 class="bzr-card-title">{{ $t('bazhai.report.overviewTitle') }}</h3>
          <div class="bzr-overview-grid">
            <div class="bzr-mini">
              <h4 class="bzr-mini-head">★ {{ $t('bazhai.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="bzr-point">
                <div class="bzr-point-title"><span class="bzr-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="bzr-point-desc">{{ $t('bazhai.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="bzr-mini">
              <h4 class="bzr-mini-head bzr-mini-head-warn">⊘ {{ $t('bazhai.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="bzr-point">
                <div class="bzr-point-title bzr-point-title-warn"><span class="bzr-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="bzr-point-desc">{{ $t('bazhai.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="bzr-mini bzr-mini-wide">
              <h4 class="bzr-mini-head">{{ $t('bazhai.report.matchNoteTitle') }}</h4>
              <p class="bzr-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 星曜统计 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('bazhai.report.statsTitle') }}</h3>
        <div class="bzr-core-grid">
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazhai.report.coreLuckyCount') }}</div>
            <div class="bzr-core-value bzr-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="bzr-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazhai.report.coreCautionCount') }}</div>
            <div class="bzr-core-value bzr-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="bzr-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazhai.report.coreBestStar') }}</div>
            <div class="bzr-core-value bzr-core-value-good bzr-core-value-text">{{ starName(bestPalace?.star ?? '生气') }}</div>
            <div class="bzr-core-sub">{{ bestPalace ? directionName(bestPalace.direction) : '—' }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazhai.report.coreWorstStar') }}</div>
            <div class="bzr-core-value bzr-core-value-warn bzr-core-value-text">{{ starName(worstPalace?.star ?? '绝命') }}</div>
            <div class="bzr-core-sub">{{ worstPalace ? directionName(worstPalace.direction) : '—' }}</div>
          </div>
          <div class="bzr-card bzr-core bzr-core-chart">
            <div class="bzr-core-label">{{ $t('bazhai.report.coreStarChart') }}</div>
            <div class="bzr-bars">
              <div v-for="s in starStats" :key="s.key" class="bzr-bar-row">
                <span class="bzr-bar-name" :class="s.auspicious ? 'bzr-bar-name-good' : 'bzr-bar-name-warn'">{{ s.label }}</span>
                <span class="bzr-bar-wrap">
                  <span class="bzr-bar" :class="s.auspicious ? 'bzr-bar-good' : 'bzr-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="bzr-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="bzr-row bzr-pans">
        <!-- 八宫吉凶盘 -->
        <div class="bzr-card bzr-pan">
          <h3 class="bzr-pan-title">
            {{ $t('bazhai.report.panTitle') }}
            <span class="bzr-pan-legend">{{ $t('bazhai.report.panLegend') }}</span>
          </h3>
          <div class="bzr-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="bzr-cell"
              :class="cellClass(cell)"
            >
              <div class="bzr-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="bzr-cell-stars">
                <span v-if="cell.star" class="bzr-star" :class="cell.auspicious ? 'bzr-star-lucky' : 'bzr-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="bzr-star bzr-star-plain">{{ $t('bazhai.report.centerPalace') }}</span>
                <span v-if="cell.level" class="bzr-cell-level" :class="cell.auspicious ? 'bzr-level-good' : 'bzr-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="bzr-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="bzr-badge bzr-badge-good">{{ $t('bazhai.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="bzr-badge bzr-badge-warn">{{ $t('bazhai.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="bzr-badge bzr-badge-zhai">{{ $t('bazhai.report.badgeZhai') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 星曜方位雷达图 -->
        <div class="bzr-card bzr-pan">
          <h3 class="bzr-pan-title">{{ $t('bazhai.report.radarTitle') }}</h3>
          <div class="bzr-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="bzr-radar" xmlns="http://www.w3.org/2000/svg">
              <!-- 轴网格 -->
              <polygon
                v-for="lvl in [1, 2, 3, 4]"
                :key="lvl"
                :points="ringPoints(lvl)"
                fill="none"
                stroke="#d8d0bd"
                stroke-width="0.6"
              />
              <!-- 轴线 + 标签 -->
              <g v-for="(label, i) in radarLabels" :key="i">
                <line
                  :x1="0" :y1="0"
                  :x2="RADAR_AXIS_POINTS[i]!.x" :y2="RADAR_AXIS_POINTS[i]!.y"
                  stroke="#e6dfcd"
                  stroke-width="0.6"
                />
                <text
                  :x="RADAR_LABEL_POINTS[i]!.x" :y="RADAR_LABEL_POINTS[i]!.y"
                  class="bzr-radar-label"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ label }}</text>
              </g>
              <!-- 吉凶值系列 -->
              <polygon :points="radarSeriesPoints" fill="rgba(140, 109, 31, 0.14)" stroke="none" />
              <polyline :points="radarSeriesPoints" fill="none" stroke="#8c6d1f" stroke-width="1.4" />
              <!-- 各方位星曜标注点 -->
              <circle
                v-for="(p, i) in radarPalaces"
                :key="p.name"
                :cx="RADAR_VALUE_POINTS[i]!.x" :cy="RADAR_VALUE_POINTS[i]!.y"
                r="2.2"
                :fill="p.auspicious ? '#4a7c59' : '#8c2f26'"
              />
            </svg>
            <div class="bzr-radar-legend">
              <span class="bzr-radar-legend-item"><i class="bzr-radar-swatch bzr-radar-swatch-value" />{{ $t('bazhai.report.radarValue') }}</span>
              <span class="bzr-radar-legend-item"><i class="bzr-radar-dot bzr-radar-dot-good" />{{ $t('bazhai.report.radarLucky') }}</span>
              <span class="bzr-radar-legend-item"><i class="bzr-radar-dot bzr-radar-dot-warn" />{{ $t('bazhai.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="bzr-section">
        <div class="bzr-card">
          <h3 class="bzr-card-title">{{ $t('bazhai.report.tableTitle') }}</h3>
          <div class="bzr-table-wrap">
            <table class="bzr-table">
              <thead>
                <tr>
                  <th>{{ $t('bazhai.report.tablePalace') }}</th>
                  <th>{{ $t('bazhai.report.tableDirection') }}</th>
                  <th>{{ $t('bazhai.report.tableStar') }}</th>
                  <th>{{ $t('bazhai.report.tableLevel') }}</th>
                  <th>{{ $t('bazhai.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="bzr-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="bzr-star" :class="p.auspicious ? 'bzr-star-lucky' : 'bzr-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="bzr-badge" :class="p.auspicious ? 'bzr-badge-good' : 'bzr-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="bzr-table-note">{{ $t(`bazhai.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="bzr-section">
        <div class="bzr-card">
          <h3 class="bzr-card-title">{{ $t('bazhai.report.remedyTitle') }}</h3>
          <div class="bzr-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="bzr-remedy">
              <div class="bzr-remedy-head">
                <span class="bzr-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="bzr-badge bzr-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="bzr-remedy-body">
                {{ $t(`bazhai.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('bazhai.report.secMingZhai') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['命卦与宅卦速览'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('bazhai.report.secDirections') }}</h3>
          <div class="bzr-ai-body bzr-md bzr-md-tiles bzr-md-tiles-dir" v-html="renderSection(aiSections['八方吉凶一览'])" />
        </div>
      </section>

      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('bazhai.report.secAdvice') }}</h3>
          <div class="bzr-ai-body bzr-md bzr-md-tiles" v-html="renderSection(aiSections['吉凶方位利用建议'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('bazhai.report.secRemedy') }}</h3>
          <div class="bzr-ai-body bzr-md bzr-md-tiles bzr-md-tiles-warn" v-html="renderSection(aiSections['凶方化解提示'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('bazhai.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('bazhai.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('bazhai.disclaimer') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('bazhai.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { BazhaiResult, Gua, Direction, Star, PalaceResult } from '~/utils/bazhai'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: BazhaiResult
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
const dongsiMingText = computed(() => t(`bazhai.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`bazhai.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'bazhai.report.matchYes' : 'bazhai.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'bazhai.report.verdictGood' : 'bazhai.report.verdictCaution'))

const titleText = computed(() =>
  t('bazhai.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))

const subtitleText = computed(() =>
  t('bazhai.report.subtitle', { year: props.result.birthYear, sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'bazhai.report.matchNoteYes' : 'bazhai.report.matchNoteNo', {
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
  return t(`bazhai.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`bazhai.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`bazhai.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`bazhai.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
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
  if (cell.name === '中') return 'bzr-cell-center'
  return cell.auspicious ? 'bzr-cell-lucky' : 'bzr-cell-ominous'
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
    return `<p class="bzr-pending">${t('bazhai.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
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
  border-radius: 12px;
  background: var(--bzr-bg);
  padding: 18px;
  color: var(--bzr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
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
  white-space: pre-line;
}
.bzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bzr-ink-soft); }
.bzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-verdict { color: var(--bzr-green); font-weight: 600; }
.bzr-verdict-warn { color: var(--bzr-accent); }
.bzr-rating { letter-spacing: 1px; }

.bzr-title {
  margin: 14px 0 6px;
  font-size: 28px;
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
.bzr-row-top { grid-template-columns: 1fr 2.4fr; }
.bzr-pans { grid-template-columns: 1.2fr 1fr; }
.bzr-ai-row { grid-template-columns: 1fr 1fr; }
.bzr-section { margin-top: 16px; }

.bzr-card {
  background: var(--bzr-card);
  border: 1px solid var(--bzr-line);
  padding: 14px 16px;
  min-width: 0;
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

/* ---------- 排盘档案卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 30px; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.bzr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-mini { border: 1px dashed var(--bzr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bzr-mini-wide { grid-column: 1 / -1; }
.bzr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--bzr-accent-soft); letter-spacing: 1px; }
.bzr-mini-head-warn { color: var(--bzr-accent); }
.bzr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--bzr-ink-soft); }
.bzr-point { margin-bottom: 7px; }
.bzr-point:last-child { margin-bottom: 0; }
.bzr-point-title { font-size: 12px; font-weight: 700; color: var(--bzr-ink); display: flex; gap: 5px; align-items: baseline; }
.bzr-point-title-warn { color: var(--bzr-accent); }
.bzr-point-ico { font-size: 10px; color: var(--bzr-star); }
.bzr-point-desc { font-size: 11px; color: var(--bzr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 星曜统计卡 ---------- */
.bzr-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.bzr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.bzr-core-chart { grid-column: span 1; }
.bzr-core-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.bzr-core-value-text { font-size: 20px; }
.bzr-core-value-good { color: var(--bzr-star); }
.bzr-core-value-warn { color: var(--bzr-accent); }
.bzr-core-sub { font-size: 10px; color: var(--bzr-ink-faint); }

.bzr-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.bzr-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bzr-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.bzr-bar-name-good { color: var(--bzr-star); }
.bzr-bar-name-warn { color: var(--bzr-accent); }
.bzr-bar-wrap { flex: 1; height: 6px; background: var(--bzr-line-soft); }
.bzr-bar { display: block; height: 100%; }
.bzr-bar-good { background: var(--bzr-star); }
.bzr-bar-warn { background: var(--bzr-accent); }
.bzr-bar-dir { width: 22px; text-align: right; color: var(--bzr-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.bzr-pan { padding: 12px; }
.bzr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bzr-pan-legend { display: block; font-size: 9px; color: var(--bzr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.bzr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.bzr-cell {
  border: 1px solid var(--bzr-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--bzr-card);
}
.bzr-cell-lucky { border-color: var(--bzr-star); background: rgba(140, 109, 31, 0.05); }
.bzr-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.bzr-cell-center { background: var(--bzr-line-soft); }
.bzr-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--bzr-ink-faint); }
.bzr-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.bzr-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.bzr-star-plain { color: var(--bzr-ink); }
.bzr-star-lucky { color: var(--bzr-star); }
.bzr-star-ominous { color: var(--bzr-accent); }
.bzr-cell-level { font-size: 10px; }
.bzr-level-good { color: var(--bzr-star); }
.bzr-level-warn { color: var(--bzr-accent); }
.bzr-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.bzr-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.bzr-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--bzr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bzr-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--bzr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.bzr-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--bzr-star); border: 1px solid rgba(140, 109, 31, 0.4); }

/* ---------- 雷达图 ---------- */
.bzr-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bzr-radar { width: 100%; max-width: 320px; }
.bzr-radar-label { font-size: 8.5px; fill: var(--bzr-ink-soft); font-weight: 700; }
.bzr-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--bzr-ink-faint); flex-wrap: wrap; justify-content: center; }
.bzr-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.bzr-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.bzr-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.bzr-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.bzr-radar-dot-good { background: #4a7c59; }
.bzr-radar-dot-warn { background: #8c2f26; }

/* ---------- 八宫数据表 ---------- */
.bzr-table-wrap { overflow-x: auto; }
.bzr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.bzr-table th, .bzr-table td {
  border: 1px solid var(--bzr-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.bzr-table thead th {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  letter-spacing: 1px;
}
.bzr-table td { color: var(--bzr-ink-soft); }
.bzr-table-palace { font-weight: 700; color: var(--bzr-ink); }
.bzr-table .bzr-star { font-size: 14px; }
.bzr-table .bzr-badge { font-size: 9.5px; }
.bzr-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.bzr-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.bzr-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.bzr-remedy-title { font-size: 12px; font-weight: 700; color: var(--bzr-accent); letter-spacing: 1px; }
.bzr-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--bzr-ink-soft); }

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
.bzr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bzr-md :deep(.bzr-pending), .bzr-pending { color: var(--bzr-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片（02/03/04 区块） ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.bzr-md-tiles :deep(ul), .bzr-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.bzr-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--bzr-line-soft);
  border-left: 3px solid var(--bzr-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--bzr-ink-soft);
}
.bzr-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--bzr-ink);
  margin-bottom: 3px;
}
/* 02 八方一览：八条正好铺 2 列 x 4 行 */
.bzr-md-tiles-dir :deep(li) { border-left-color: var(--bzr-accent-soft); }
/* 04 化解提示：凶方用朱砂色强调 */
.bzr-md-tiles-warn :deep(li) { border-left-color: var(--bzr-accent); }
.bzr-md-tiles-warn :deep(li strong) { color: var(--bzr-accent); }

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
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.bzr-foot-note { font-size: 10px; color: var(--bzr-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.bzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-pans { grid-template-columns: 1fr; }
  .bzr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .bzr-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-overview-grid { grid-template-columns: 1fr; }
  .bzr-remedy-grid { grid-template-columns: 1fr; }
  .bzr-md-tiles :deep(ul), .bzr-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .bzr-title { font-size: 20px; letter-spacing: 2px; }
  .bzr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .bzr-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .bzr-pan { padding: 8px; }
  .bzr-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .bzr-star { font-size: 13px; }
  .bzr-cell-head { font-size: 8px; }
  .bzr-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .bzr-table { min-width: 520px; }
}
</style>
