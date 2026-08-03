<template>
  <div class="bfs">
    <div class="bfs-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bfs-head">
        <div class="bfs-head-top">
          <div class="bfs-brand">
            <div class="bfs-seal">{{ $t('bedroomFengshui.report.seal') }}</div>
            <span class="bfs-brand-name">{{ $t('bedroomFengshui.report.brandName') }}</span>
          </div>
          <div class="bfs-head-right">
            <span class="bfs-time">{{ $t('bedroomFengshui.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bfs-rating">{{ $t('bedroomFengshui.report.rating') }}</span>
            <span class="bfs-verdict" :class="{ 'bfs-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="bfs-title">{{ titleText }}</h1>
        <p class="bfs-subtitle">{{ subtitleText }}</p>

        <div class="bfs-head-bottom">
          <p class="bfs-meta-line">
            {{ $t('bedroomFengshui.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('bedroomFengshui.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="bfs-meta-line">
            {{ $t('bedroomFengshui.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('bedroomFengshui.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="bfs-row bfs-row-top">
        <div class="bfs-card bfs-profile">
          <div class="bfs-profile-line">
            <span class="bfs-ico">⚥</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileGender') }}</span>
            <span class="bfs-profile-value">{{ genderText }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">◷</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileBirth') }}</span>
            <span class="bfs-profile-value">{{ birthText }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">⌖</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileFacing') }}</span>
            <span class="bfs-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">▤</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileBed') }}</span>
            <span class="bfs-profile-value">{{ result.bedDirection }}° · {{ bedSittingText }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">☯</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileMing') }}</span>
            <span class="bfs-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">✎</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileGan') }}</span>
            <span class="bfs-profile-value">{{ result.yearGan }}</span>
          </div>
          <div class="bfs-profile-line">
            <span class="bfs-ico">⚠</span>
            <span class="bfs-profile-label">{{ $t('bedroomFengshui.report.profileTaboo') }}</span>
            <span class="bfs-profile-value">{{ tabooSummaryText }}</span>
          </div>
        </div>

        <div class="bfs-card bfs-overview">
          <h3 class="bfs-card-title">{{ $t('bedroomFengshui.report.overviewTitle') }}</h3>
          <div class="bfs-overview-grid">
            <div class="bfs-mini">
              <h4 class="bfs-mini-head">★ {{ $t('bedroomFengshui.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="bfs-point">
                <div class="bfs-point-title"><span class="bfs-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="bfs-point-desc">{{ $t('bedroomFengshui.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="bfs-mini">
              <h4 class="bfs-mini-head bfs-mini-head-warn">⊘ {{ $t('bedroomFengshui.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="bfs-point">
                <div class="bfs-point-title bfs-point-title-warn"><span class="bfs-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="bfs-point-desc">{{ $t('bedroomFengshui.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="bfs-mini bfs-mini-wide">
              <h4 class="bfs-mini-head">{{ $t('bedroomFengshui.report.matchNoteTitle') }}</h4>
              <p class="bfs-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 核心指标 + 星曜柱状图 ============ -->
      <section class="bfs-section">
        <h3 class="bfs-section-title">{{ $t('bedroomFengshui.report.statsTitle') }}</h3>
        <div class="bfs-core-grid">
          <div class="bfs-card bfs-core">
            <div class="bfs-core-label">{{ $t('bedroomFengshui.report.coreLuckyCount') }}</div>
            <div class="bfs-core-value bfs-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="bfs-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="bfs-card bfs-core">
            <div class="bfs-core-label">{{ $t('bedroomFengshui.report.coreCautionCount') }}</div>
            <div class="bfs-core-value bfs-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="bfs-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="bfs-card bfs-core">
            <div class="bfs-core-label">{{ $t('bedroomFengshui.report.coreBedStar') }}</div>
            <div class="bfs-core-value bfs-core-value-text" :class="result.bedAuspicious ? 'bfs-core-value-good' : 'bfs-core-value-warn'">{{ starName(result.bedStar) }}</div>
            <div class="bfs-core-sub">{{ levelName(result.bedStarLevel) }}</div>
          </div>
          <div class="bfs-card bfs-core">
            <div class="bfs-core-label">{{ $t('bedroomFengshui.report.coreTabooCount') }}</div>
            <div class="bfs-core-value" :class="result.tabooWarnings.length ? 'bfs-core-value-warn' : 'bfs-core-value-good'">{{ result.tabooWarnings.length }}</div>
            <div class="bfs-core-sub">{{ tabooSummaryText }}</div>
          </div>
          <div class="bfs-card bfs-core bfs-core-chart">
            <div class="bfs-core-label">{{ $t('bedroomFengshui.report.coreStarChart') }}</div>
            <div class="bfs-bars">
              <div v-for="s in starStats" :key="s.key" class="bfs-bar-row">
                <span class="bfs-bar-name" :class="s.auspicious ? 'bfs-bar-name-good' : 'bfs-bar-name-warn'">{{ s.label }}</span>
                <span class="bfs-bar-wrap">
                  <span class="bfs-bar" :class="s.auspicious ? 'bfs-bar-good' : 'bfs-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="bfs-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="bfs-row bfs-pans">
        <div class="bfs-card bfs-pan">
          <h3 class="bfs-pan-title">
            {{ $t('bedroomFengshui.report.panTitle') }}
            <span class="bfs-pan-legend">{{ $t('bedroomFengshui.report.panLegend') }}</span>
          </h3>
          <div class="bfs-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="bfs-cell"
              :class="cellClass(cell)"
            >
              <div class="bfs-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="bfs-cell-stars">
                <span v-if="cell.star" class="bfs-star" :class="cell.auspicious ? 'bfs-star-lucky' : 'bfs-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="bfs-star bfs-star-plain">{{ $t('bedroomFengshui.report.centerPalace') }}</span>
                <span v-if="cell.level" class="bfs-cell-level" :class="cell.auspicious ? 'bfs-level-good' : 'bfs-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="bfs-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="bfs-badge bfs-badge-good">{{ $t('bedroomFengshui.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="bfs-badge bfs-badge-warn">{{ $t('bedroomFengshui.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="bfs-badge bfs-badge-zhai">{{ $t('bedroomFengshui.report.badgeZhai') }}</span>
                <span v-if="cell.name === bedPalaceName" class="bfs-badge bfs-badge-bed">{{ $t('bedroomFengshui.report.badgeBed') }}</span>
                <span v-if="cell.star && result.bed.bestDirections.includes(cell.direction)" class="bfs-badge bfs-badge-best">{{ $t('bedroomFengshui.report.badgeBedBest') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bfs-card bfs-pan">
          <h3 class="bfs-pan-title">{{ $t('bedroomFengshui.report.radarTitle') }}</h3>
          <div class="bfs-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="bfs-radar" xmlns="http://www.w3.org/2000/svg">
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
                  class="bfs-radar-label"
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
            <div class="bfs-radar-legend">
              <span class="bfs-radar-legend-item"><i class="bfs-radar-swatch bfs-radar-swatch-value" />{{ $t('bedroomFengshui.report.radarValue') }}</span>
              <span class="bfs-radar-legend-item"><i class="bfs-radar-dot bfs-radar-dot-good" />{{ $t('bedroomFengshui.report.radarLucky') }}</span>
              <span class="bfs-radar-legend-item"><i class="bfs-radar-dot bfs-radar-dot-warn" />{{ $t('bedroomFengshui.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 床位布局建议 ============ -->
      <section class="bfs-section">
        <div class="bfs-card">
          <h3 class="bfs-card-title">{{ $t('bedroomFengshui.report.layoutTitle') }}</h3>
          <div class="bfs-layout-grid">
            <!-- 床位朝向 -->
            <div class="bfs-layout-item">
              <div class="bfs-layout-head">
                <span class="bfs-layout-title">▤ {{ $t('bedroomFengshui.report.bedTitle') }}</span>
                <span class="bfs-badge" :class="result.bedAuspicious ? 'bfs-badge-good' : 'bfs-badge-warn'">
                  {{ starName(result.bedStar) }} · {{ levelName(result.bedStarLevel) }}
                </span>
              </div>
              <p class="bfs-layout-body">{{ result.bed.note }}</p>
              <div class="bfs-dir-line">
                <span class="bfs-dir-label">{{ $t('bedroomFengshui.report.dirBest') }}</span>
                <span v-for="dir in result.bed.bestDirections" :key="'bb-' + dir" class="bfs-dir-chip bfs-dir-chip-good">{{ directionName(dir) }}</span>
              </div>
              <div v-if="result.bed.avoidDirections.length" class="bfs-dir-line">
                <span class="bfs-dir-label">{{ $t('bedroomFengshui.report.dirAvoid') }}</span>
                <span v-for="dir in result.bed.avoidDirections" :key="'ba-' + dir" class="bfs-dir-chip bfs-dir-chip-warn">{{ directionName(dir) }}</span>
              </div>
              <p class="bfs-layout-note">{{ $t('bedroomFengshui.report.bedCurrentNote', { degree: result.bedDirection, star: starName(result.bedStar), level: levelName(result.bedStarLevel) }) }}</p>
            </div>

            <!-- 卧室禁忌自查 -->
            <div class="bfs-layout-item">
              <div class="bfs-layout-head">
                <span class="bfs-layout-title">⚠ {{ $t('bedroomFengshui.report.tabooTitle') }}</span>
                <span class="bfs-badge" :class="result.tabooWarnings.length ? 'bfs-badge-warn' : 'bfs-badge-good'">
                  {{ result.tabooWarnings.length ? $t('bedroomFengshui.report.tabooHas', { count: result.tabooWarnings.length }) : $t('bedroomFengshui.report.tabooNone') }}
                </span>
              </div>
              <template v-if="result.tabooWarnings.length">
                <div v-for="(w, idx) in result.tabooWarnings" :key="w.key + idx" class="bfs-taboo-line">
                  <span class="bfs-taboo-sev" :class="w.severity === 'high' ? 'bfs-taboo-sev-high' : 'bfs-taboo-sev-mid'">
                    {{ w.severity === 'high' ? $t('bedroomFengshui.report.severityHigh') : $t('bedroomFengshui.report.severityMedium') }}
                  </span>
                  <span class="bfs-taboo-msg">{{ w.message }}</span>
                </div>
              </template>
              <p v-else class="bfs-layout-body">{{ $t('bedroomFengshui.report.tabooNoneBody') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="bfs-section">
        <div class="bfs-card">
          <h3 class="bfs-card-title">{{ $t('bedroomFengshui.report.tableTitle') }}</h3>
          <div class="bfs-table-wrap">
            <table class="bfs-table">
              <thead>
                <tr>
                  <th>{{ $t('bedroomFengshui.report.tablePalace') }}</th>
                  <th>{{ $t('bedroomFengshui.report.tableDirection') }}</th>
                  <th>{{ $t('bedroomFengshui.report.tableStar') }}</th>
                  <th>{{ $t('bedroomFengshui.report.tableLevel') }}</th>
                  <th>{{ $t('bedroomFengshui.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="bfs-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="bfs-star" :class="p.auspicious ? 'bfs-star-lucky' : 'bfs-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="bfs-badge" :class="p.auspicious ? 'bfs-badge-good' : 'bfs-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="bfs-table-note">{{ $t(`bedroomFengshui.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="bfs-section">
        <div class="bfs-card">
          <h3 class="bfs-card-title">{{ $t('bedroomFengshui.report.remedyTitle') }}</h3>
          <div class="bfs-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="bfs-remedy">
              <div class="bfs-remedy-head">
                <span class="bfs-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="bfs-badge bfs-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="bfs-remedy-body">
                {{ $t(`bedroomFengshui.report.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-07 ============ -->
      <section class="bfs-row bfs-ai-row">
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">01</span>{{ $t('bedroomFengshui.report.secOverview') }}</h3>
          <div class="bfs-ai-body bfs-md" v-html="renderSection(aiSections[AI_KEYS.overview])" />
        </div>
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">02</span>{{ $t('bedroomFengshui.report.secPalaces') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-md-tiles bfs-md-tiles-dir" v-html="renderSection(aiSections[AI_KEYS.palaces])" />
        </div>
      </section>

      <section class="bfs-row bfs-ai-row">
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">03</span>{{ $t('bedroomFengshui.report.secBed') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.bed])" />
        </div>
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">04</span>{{ $t('bedroomFengshui.report.secTaboo') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-md-tiles bfs-md-tiles-warn" v-html="renderSection(aiSections[AI_KEYS.taboo])" />
        </div>
      </section>

      <section class="bfs-row bfs-ai-row">
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">05</span>{{ $t('bedroomFengshui.report.secLayout') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.layout])" />
        </div>
        <div class="bfs-card bfs-ai">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">06</span>{{ $t('bedroomFengshui.report.secRemedy') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-md-tiles bfs-md-tiles-warn" v-html="renderSection(aiSections[AI_KEYS.remedy])" />
        </div>
      </section>

      <!-- 山人小结 -->
      <section class="bfs-section">
        <div class="bfs-card bfs-verse">
          <h3 class="bfs-ai-title"><span class="bfs-ai-no">07</span>{{ $t('bedroomFengshui.report.secVerse') }}</h3>
          <div class="bfs-ai-body bfs-md bfs-verse-body" v-html="renderSection(aiSections[AI_KEYS.verse])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bfs-streaming">
        <span class="bfs-streaming-dot" />
        {{ $t('bedroomFengshui.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bfs-error">
        <p>{{ error }}</p>
        <button type="button" class="bfs-retry" @click="$emit('retry')">{{ $t('bedroomFengshui.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bfs-foot">
        <span class="bfs-foot-note">ⓘ {{ $t('bedroomFengshui.disclaimer') }}</span>
        <span class="bfs-seal bfs-seal-foot">{{ $t('bedroomFengshui.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { findMountain24, findNearestMountain24Center, normalizeDegree } from '~/utils/bazhai'
import type { Gua, Star, PalaceResult } from '~/utils/bazhai'
import type { BedroomFengshuiResult } from '~/utils/bedroom-fengshui'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: BedroomFengshuiResult
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
const birthText = computed(() =>
  `${props.result.birthYear}-${String(props.result.birthMonth).padStart(2, '0')}-${String(props.result.birthDay).padStart(2, '0')}`)
const dongsiMingText = computed(() => t(`bedroomFengshui.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`bedroomFengshui.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'bedroomFengshui.report.matchYes' : 'bedroomFengshui.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'bedroomFengshui.report.verdictGood' : 'bedroomFengshui.report.verdictCaution'))

const titleText = computed(() =>
  t('bedroomFengshui.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))
const subtitleText = computed(() =>
  t('bedroomFengshui.report.subtitle', { sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

// 床位所在方位：与引擎保持一致，以床头朝向（人躺卧头部所指）对应的宫位定吉凶
const bedSittingMountain = computed(() => {
  const deg = normalizeDegree(props.result.bedDirection)
  return findMountain24(deg) ?? findNearestMountain24Center(deg)
})
const bedSittingText = computed(() =>
  bedSittingMountain.value ? `${bedSittingMountain.value.name}（${guaName(bedSittingMountain.value.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'bedroomFengshui.report.matchNoteYes' : 'bedroomFengshui.report.matchNoteNo', {
    ming: dongsiMingText.value,
    zhai: dongsiZhaiText.value,
  }))

const tabooSummaryText = computed(() =>
  props.result.tabooWarnings.length
    ? t('bedroomFengshui.report.tabooHas', { count: props.result.tabooWarnings.length })
    : t('bedroomFengshui.report.tabooNone'))

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
// 吉凶数值：大吉 4 / 吉 3 / 小吉 2 / 凶 1 / 大凶 0.4（雷达图与柱状图用）
const LEVEL_SCORE: Record<string, number> = {
  大吉: 4, 吉: 3, 小吉: 2, 凶: 1, 大凶: 0.4,
}

function guaName(name: string): string {
  return t(`bedroomFengshui.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`bedroomFengshui.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`bedroomFengshui.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`bedroomFengshui.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
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

// 表格/雷达按罗盘顺时针：坎（北）起
const COMPASS_ORDER: Gua[] = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾']
const palaceOrder = computed(() =>
  COMPASS_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))
const radarPalaces = computed(() =>
  COMPASS_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))
const radarLabels = computed(() => radarPalaces.value.map(p => guaName(p.name)))

const bedPalaceName = computed<Gua | null>(() => bedSittingMountain.value?.palace ?? null)

/* ---------- 吉凶统计 ---------- */

const auspiciousPalaces = computed(() => props.result.palaces.filter(p => p.auspicious))
const inauspiciousPalaces = computed(() => props.result.palaces.filter(p => !p.auspicious))

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
  if (cell.name === '中') return 'bfs-cell-center'
  return cell.auspicious ? 'bfs-cell-lucky' : 'bfs-cell-ominous'
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

// 提示词固定输出这 7 个 ## 标题，用作分区索引
const AI_KEYS = {
  overview: '命卦与宅卦速览',
  palaces: '八方吉凶一览',
  bed: '床位朝向建议',
  taboo: '卧室禁忌自查',
  layout: '卧室布局与助眠/助姻缘建议',
  remedy: '凶方化解建议',
  verse: '山人小结',
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
    return `<p class="bfs-pending">${t('bedroomFengshui.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.bfs {
  --bfs-bg: #f2ede3;
  --bfs-sheet: #faf6ec;
  --bfs-card: #fffdf6;
  --bfs-ink: #2e2a24;
  --bfs-ink-soft: #55503f;
  --bfs-ink-faint: #8a8272;
  --bfs-line: #d8d0bd;
  --bfs-line-soft: #e6dfcd;
  --bfs-accent: #8c2f26;
  --bfs-accent-soft: #a8512e;
  --bfs-star: #8c6d1f;
  --bfs-green: #4a7c59;
  --bfs-teal: #3d6b6e;
  border-radius: 12px;
  background: var(--bfs-bg);
  padding: 18px;
  color: var(--bfs-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.bfs-sheet {
  background: var(--bfs-sheet);
  border: 1px solid var(--bfs-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bfs-head { border-bottom: 2px solid var(--bfs-ink); padding-bottom: 16px; }
.bfs-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bfs-brand { display: flex; align-items: center; gap: 8px; }
.bfs-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bfs-accent);
  color: var(--bfs-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.bfs-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bfs-ink-soft); }
.bfs-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bfs-ink-faint); }
.bfs-verdict { color: var(--bfs-green); font-weight: 600; }
.bfs-verdict-warn { color: var(--bfs-accent); }
.bfs-rating { letter-spacing: 1px; }

.bfs-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.bfs-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--bfs-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.bfs-head-bottom { text-align: center; }
.bfs-meta-line { margin: 2px 0; font-size: 12px; color: var(--bfs-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bfs-row { display: grid; gap: 14px; margin-top: 16px; }
.bfs-row-top { grid-template-columns: 1fr 2.4fr; }
.bfs-pans { grid-template-columns: 1.2fr 1fr; }
.bfs-ai-row { grid-template-columns: 1fr 1fr; }
.bfs-section { margin-top: 16px; }

.bfs-card {
  background: var(--bfs-card);
  border: 1px solid var(--bfs-line);
  padding: 14px 16px;
  min-width: 0;
}
.bfs-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--bfs-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.bfs-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.bfs-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bfs-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bfs-ico { color: var(--bfs-accent-soft); font-size: 12px; }
.bfs-profile-label { color: var(--bfs-ink-faint); min-width: 30px; }
.bfs-profile-value { color: var(--bfs-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.bfs-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bfs-mini { border: 1px dashed var(--bfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bfs-mini-wide { grid-column: 1 / -1; }
.bfs-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--bfs-accent-soft); letter-spacing: 1px; }
.bfs-mini-head-warn { color: var(--bfs-accent); }
.bfs-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--bfs-ink-soft); }
.bfs-point { margin-bottom: 7px; }
.bfs-point:last-child { margin-bottom: 0; }
.bfs-point-title { font-size: 12px; font-weight: 700; color: var(--bfs-ink); display: flex; gap: 5px; align-items: baseline; }
.bfs-point-title-warn { color: var(--bfs-accent); }
.bfs-point-ico { font-size: 10px; color: var(--bfs-star); }
.bfs-point-desc { font-size: 11px; color: var(--bfs-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 核心指标 + 柱状图 ---------- */
.bfs-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.bfs-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.bfs-core-label { font-size: 11px; color: var(--bfs-ink-faint); letter-spacing: 1px; }
.bfs-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.bfs-core-value-text { font-size: 20px; }
.bfs-core-value-good { color: var(--bfs-star); }
.bfs-core-value-warn { color: var(--bfs-accent); }
.bfs-core-sub { font-size: 10px; color: var(--bfs-ink-faint); }

.bfs-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.bfs-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bfs-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.bfs-bar-name-good { color: var(--bfs-star); }
.bfs-bar-name-warn { color: var(--bfs-accent); }
.bfs-bar-wrap { flex: 1; height: 6px; background: var(--bfs-line-soft); }
.bfs-bar { display: block; height: 100%; }
.bfs-bar-good { background: var(--bfs-star); }
.bfs-bar-warn { background: var(--bfs-accent); }
.bfs-bar-dir { width: 22px; text-align: right; color: var(--bfs-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.bfs-pan { padding: 12px; }
.bfs-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bfs-pan-legend { display: block; font-size: 9px; color: var(--bfs-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.bfs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.bfs-cell {
  border: 1px solid var(--bfs-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--bfs-card);
}
.bfs-cell-lucky { border-color: var(--bfs-star); background: rgba(140, 109, 31, 0.05); }
.bfs-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.bfs-cell-center { background: var(--bfs-line-soft); }
.bfs-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--bfs-ink-faint); }
.bfs-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.bfs-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.bfs-star-plain { color: var(--bfs-ink); }
.bfs-star-lucky { color: var(--bfs-star); }
.bfs-star-ominous { color: var(--bfs-accent); }
.bfs-cell-level { font-size: 10px; }
.bfs-level-good { color: var(--bfs-star); }
.bfs-level-warn { color: var(--bfs-accent); }
.bfs-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.bfs-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.bfs-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--bfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bfs-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--bfs-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.bfs-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--bfs-star); border: 1px solid rgba(140, 109, 31, 0.4); }
.bfs-badge-bed { background: rgba(61, 107, 110, 0.12); color: var(--bfs-teal); border: 1px solid rgba(61, 107, 110, 0.4); }
.bfs-badge-best { background: rgba(140, 109, 31, 0.16); color: var(--bfs-star); border: 1px solid rgba(140, 109, 31, 0.5); }

/* ---------- 雷达图 ---------- */
.bfs-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bfs-radar { width: 100%; max-width: 320px; }
.bfs-radar-label { font-size: 8.5px; fill: var(--bfs-ink-soft); font-weight: 700; }
.bfs-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--bfs-ink-faint); flex-wrap: wrap; justify-content: center; }
.bfs-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.bfs-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.bfs-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.bfs-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.bfs-radar-dot-good { background: #4a7c59; }
.bfs-radar-dot-warn { background: #8c2f26; }

/* ---------- 床位布局建议 ---------- */
.bfs-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bfs-layout-item { border: 1px dashed var(--bfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bfs-layout-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.bfs-layout-title { font-size: 12px; font-weight: 700; color: var(--bfs-ink); letter-spacing: 1px; }
.bfs-layout-body { margin: 0 0 8px; font-size: 11px; line-height: 1.7; color: var(--bfs-ink-soft); }
.bfs-layout-note { margin: 8px 0 0; font-size: 10.5px; line-height: 1.6; color: var(--bfs-ink-faint); border-top: 1px dashed var(--bfs-line-soft); padding-top: 6px; }
.bfs-dir-line { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.bfs-dir-label { font-size: 10px; color: var(--bfs-ink-faint); letter-spacing: 1px; }
.bfs-dir-chip {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.bfs-dir-chip-good { background: rgba(74, 124, 89, 0.12); color: var(--bfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bfs-dir-chip-warn { background: rgba(140, 47, 38, 0.1); color: var(--bfs-accent); border: 1px solid rgba(140, 47, 38, 0.3); }
.bfs-taboo-line { display: flex; align-items: baseline; gap: 6px; font-size: 11px; margin-bottom: 7px; }
.bfs-taboo-line:last-child { margin-bottom: 0; }
.bfs-taboo-sev {
  font-size: 9px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
  flex-shrink: 0;
}
.bfs-taboo-sev-high { background: rgba(140, 47, 38, 0.12); color: var(--bfs-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.bfs-taboo-sev-mid { background: rgba(140, 109, 31, 0.12); color: var(--bfs-star); border: 1px solid rgba(140, 109, 31, 0.35); }
.bfs-taboo-msg { color: var(--bfs-ink-soft); line-height: 1.6; }

/* ---------- 八宫数据表 ---------- */
.bfs-table-wrap { overflow-x: auto; }
.bfs-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.bfs-table th, .bfs-table td {
  border: 1px solid var(--bfs-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.bfs-table thead th {
  background: var(--bfs-line-soft);
  font-weight: 700;
  color: var(--bfs-ink);
  letter-spacing: 1px;
}
.bfs-table td { color: var(--bfs-ink-soft); }
.bfs-table-palace { font-weight: 700; color: var(--bfs-ink); }
.bfs-table .bfs-star { font-size: 14px; }
.bfs-table .bfs-badge { font-size: 9.5px; }
.bfs-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.bfs-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bfs-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.bfs-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.bfs-remedy-title { font-size: 12px; font-weight: 700; color: var(--bfs-accent); letter-spacing: 1px; }
.bfs-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--bfs-ink-soft); }

/* ---------- AI 章节 ---------- */
.bfs-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bfs-line-soft);
  padding-bottom: 8px;
}
.bfs-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--bfs-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.bfs-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bfs-ink-soft); }

.bfs-md :deep(p) { margin: 0 0 0.7em; }
.bfs-md :deep(p:last-child) { margin-bottom: 0; }
.bfs-md :deep(strong) { color: var(--bfs-ink); font-weight: 700; }
.bfs-md :deep(ul), .bfs-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bfs-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bfs-md :deep(h3), .bfs-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--bfs-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.bfs-md { overflow-x: auto; }
.bfs-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bfs-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bfs-md :deep(.bfs-pending), .bfs-pending { color: var(--bfs-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片 ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.bfs-md-tiles :deep(ul), .bfs-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.bfs-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--bfs-line-soft);
  border-left: 3px solid var(--bfs-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--bfs-ink-soft);
}
.bfs-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--bfs-ink);
  margin-bottom: 3px;
}
/* 02 八方一览：八条正好铺 2 列 x 4 行 */
.bfs-md-tiles-dir :deep(li) { border-left-color: var(--bfs-accent-soft); }
/* 04/06 禁忌与化解：凶方用朱砂色强调 */
.bfs-md-tiles-warn :deep(li) { border-left-color: var(--bfs-accent); }
.bfs-md-tiles-warn :deep(li strong) { color: var(--bfs-accent); }

/* 07 山人小结：题跋居中 */
.bfs-verse { background: rgba(140, 109, 31, 0.04); }
.bfs-verse-body { text-align: center; font-size: 13px; letter-spacing: 1px; color: var(--bfs-ink); }

.bfs-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--bfs-ink-faint); letter-spacing: 1px;
}
.bfs-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--bfs-accent);
  animation: bfs-pulse 1s ease-in-out infinite;
}
@keyframes bfs-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bfs-error { margin-top: 14px; text-align: center; color: var(--bfs-accent); font-size: 12px; }
.bfs-retry {
  margin-top: 8px;
  border: 1px solid var(--bfs-accent);
  background: transparent;
  color: var(--bfs-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bfs-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.bfs-foot {
  margin-top: 18px;
  border-top: 1px solid var(--bfs-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.bfs-foot-note { font-size: 10px; color: var(--bfs-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.bfs-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .bfs-row-top { grid-template-columns: 1fr; }
  .bfs-pans { grid-template-columns: 1fr; }
  .bfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .bfs-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .bfs { padding: 8px; }
  .bfs-sheet { padding: 16px 12px; }
  .bfs-ai-row { grid-template-columns: 1fr; }
  .bfs-overview-grid { grid-template-columns: 1fr; }
  .bfs-layout-grid { grid-template-columns: 1fr; }
  .bfs-remedy-grid { grid-template-columns: 1fr; }
  .bfs-md-tiles :deep(ul), .bfs-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .bfs-title { font-size: 20px; letter-spacing: 2px; }
  .bfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .bfs-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .bfs-pan { padding: 8px; }
  .bfs-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .bfs-star { font-size: 13px; }
  .bfs-cell-head { font-size: 8px; }
  .bfs-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .bfs-table { min-width: 520px; }
}
</style>
