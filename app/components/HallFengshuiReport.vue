<template>
  <div class="hfs">
    <div class="hfs-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="hfs-head">
        <div class="hfs-head-top">
          <div class="hfs-brand">
            <div class="hfs-seal">{{ $t('hallFengshui.report.seal') }}</div>
            <span class="hfs-brand-name">{{ $t('hallFengshui.report.brandName') }}</span>
          </div>
          <div class="hfs-head-right">
            <span class="hfs-time">{{ $t('hallFengshui.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="hfs-rating">{{ $t('hallFengshui.report.rating') }}</span>
            <span class="hfs-verdict" :class="{ 'hfs-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="hfs-title">{{ titleText }}</h1>
        <p class="hfs-subtitle">{{ subtitleText }}</p>

        <div class="hfs-head-bottom">
          <p class="hfs-meta-line">
            {{ $t('hallFengshui.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('hallFengshui.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="hfs-meta-line">
            {{ $t('hallFengshui.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('hallFengshui.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>
      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="hfs-row hfs-row-top">
        <div class="hfs-card hfs-profile">
          <div class="hfs-profile-line">
            <span class="hfs-ico">⚥</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileGender') }}</span>
            <span class="hfs-profile-value">{{ genderText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">◷</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileBirth') }}</span>
            <span class="hfs-profile-value">{{ birthText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">⌖</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileFacing') }}</span>
            <span class="hfs-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">▤</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileSofa') }}</span>
            <span class="hfs-profile-value">{{ result.sofaDirection }}° · {{ sofaSittingText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">☰</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileFlow') }}</span>
            <span class="hfs-profile-value">{{ entrywayFlowText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">☯</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileMing') }}</span>
            <span class="hfs-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
          <div class="hfs-profile-line">
            <span class="hfs-ico">✎</span>
            <span class="hfs-profile-label">{{ $t('hallFengshui.report.profileGan') }}</span>
            <span class="hfs-profile-value">{{ result.yearGan }}</span>
          </div>
        </div>

        <div class="hfs-card hfs-overview">
          <h3 class="hfs-card-title">{{ $t('hallFengshui.report.overviewTitle') }}</h3>
          <div class="hfs-overview-grid">
            <div class="hfs-mini">
              <h4 class="hfs-mini-head">★ {{ $t('hallFengshui.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="hfs-point">
                <div class="hfs-point-title"><span class="hfs-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="hfs-point-desc">{{ $t('hallFengshui.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="hfs-mini">
              <h4 class="hfs-mini-head hfs-mini-head-warn">⊘ {{ $t('hallFengshui.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="hfs-point">
                <div class="hfs-point-title hfs-point-title-warn"><span class="hfs-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="hfs-point-desc">{{ $t('hallFengshui.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="hfs-mini hfs-mini-wide">
              <h4 class="hfs-mini-head">{{ $t('hallFengshui.report.matchNoteTitle') }}</h4>
              <p class="hfs-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>
      <!-- ============ 核心指标 + 星曜柱状图 ============ -->
      <section class="hfs-section">
        <h3 class="hfs-section-title">{{ $t('hallFengshui.report.statsTitle') }}</h3>
        <div class="hfs-core-grid">
          <div class="hfs-card hfs-core">
            <div class="hfs-core-label">{{ $t('hallFengshui.report.coreLuckyCount') }}</div>
            <div class="hfs-core-value hfs-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="hfs-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="hfs-card hfs-core">
            <div class="hfs-core-label">{{ $t('hallFengshui.report.coreCautionCount') }}</div>
            <div class="hfs-core-value hfs-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="hfs-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="hfs-card hfs-core">
            <div class="hfs-core-label">{{ $t('hallFengshui.report.coreSofaStar') }}</div>
            <div class="hfs-core-value hfs-core-value-text" :class="result.sofaAuspicious ? 'hfs-core-value-good' : 'hfs-core-value-warn'">{{ starName(result.sofaStar) }}</div>
            <div class="hfs-core-sub">{{ levelName(result.sofaStarLevel) }}</div>
          </div>
          <div class="hfs-card hfs-core">
            <div class="hfs-core-label">{{ $t('hallFengshui.report.coreWealthDir') }}</div>
            <div class="hfs-core-value hfs-core-value-good hfs-core-value-text">{{ directionName(result.wealth.direction) }}</div>
            <div class="hfs-core-sub">{{ starName(result.wealth.star) }} · {{ $t('hallFengshui.report.wealthLiqi') }}</div>
          </div>
          <div class="hfs-card hfs-core hfs-core-chart">
            <div class="hfs-core-label">{{ $t('hallFengshui.report.coreStarChart') }}</div>
            <div class="hfs-bars">
              <div v-for="s in starStats" :key="s.key" class="hfs-bar-row">
                <span class="hfs-bar-name" :class="s.auspicious ? 'hfs-bar-name-good' : 'hfs-bar-name-warn'">{{ s.label }}</span>
                <span class="hfs-bar-wrap">
                  <span class="hfs-bar" :class="s.auspicious ? 'hfs-bar-good' : 'hfs-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="hfs-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="hfs-row hfs-pans">
        <div class="hfs-card hfs-pan">
          <h3 class="hfs-pan-title">
            {{ $t('hallFengshui.report.panTitle') }}
            <span class="hfs-pan-legend">{{ $t('hallFengshui.report.panLegend') }}</span>
          </h3>
          <div class="hfs-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="hfs-cell"
              :class="cellClass(cell)"
            >
              <div class="hfs-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="hfs-cell-stars">
                <span v-if="cell.star" class="hfs-star" :class="cell.auspicious ? 'hfs-star-lucky' : 'hfs-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="hfs-star hfs-star-plain">{{ $t('hallFengshui.report.centerPalace') }}</span>
                <span v-if="cell.level" class="hfs-cell-level" :class="cell.auspicious ? 'hfs-level-good' : 'hfs-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="hfs-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="hfs-badge hfs-badge-good">{{ $t('hallFengshui.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="hfs-badge hfs-badge-warn">{{ $t('hallFengshui.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="hfs-badge hfs-badge-zhai">{{ $t('hallFengshui.report.badgeZhai') }}</span>
                <span v-if="cell.name === sofaPalaceName" class="hfs-badge hfs-badge-sofa">{{ $t('hallFengshui.report.badgeSofa') }}</span>
                <span v-if="cell.star && cell.direction === result.wealth.direction" class="hfs-badge hfs-badge-wealth">{{ $t('hallFengshui.report.badgeWealth') }}</span>
                <span v-if="cell.star && result.sofa.bestDirections.includes(cell.direction)" class="hfs-badge hfs-badge-best">{{ $t('hallFengshui.report.badgeSofaBest') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hfs-card hfs-pan">
          <h3 class="hfs-pan-title">{{ $t('hallFengshui.report.radarTitle') }}</h3>
          <div class="hfs-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="hfs-radar" xmlns="http://www.w3.org/2000/svg">
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
                  class="hfs-radar-label"
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
            <div class="hfs-radar-legend">
              <span class="hfs-radar-legend-item"><i class="hfs-radar-swatch hfs-radar-swatch-value" />{{ $t('hallFengshui.report.radarValue') }}</span>
              <span class="hfs-radar-legend-item"><i class="hfs-radar-dot hfs-radar-dot-good" />{{ $t('hallFengshui.report.radarLucky') }}</span>
              <span class="hfs-radar-legend-item"><i class="hfs-radar-dot hfs-radar-dot-warn" />{{ $t('hallFengshui.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>
      <!-- ============ 厅堂布局建议 ============ -->
      <section class="hfs-section">
        <div class="hfs-card">
          <h3 class="hfs-card-title">{{ $t('hallFengshui.report.layoutTitle') }}</h3>
          <div class="hfs-layout-grid">
            <!-- 沙发与待客区 -->
            <div class="hfs-layout-item">
              <div class="hfs-layout-head">
                <span class="hfs-layout-title">▤ {{ $t('hallFengshui.report.sofaTitle') }}</span>
                <span class="hfs-badge" :class="result.sofaAuspicious ? 'hfs-badge-good' : 'hfs-badge-warn'">
                  {{ starName(result.sofaStar) }} · {{ levelName(result.sofaStarLevel) }}
                </span>
              </div>
              <p class="hfs-layout-body">{{ result.sofa.note }}</p>
              <div class="hfs-dir-line">
                <span class="hfs-dir-label">{{ $t('hallFengshui.report.dirBest') }}</span>
                <span v-for="dir in result.sofa.bestDirections" :key="'sb-' + dir" class="hfs-dir-chip hfs-dir-chip-good">{{ directionName(dir) }}</span>
              </div>
              <div v-if="result.sofa.avoidDirections.length" class="hfs-dir-line">
                <span class="hfs-dir-label">{{ $t('hallFengshui.report.dirAvoid') }}</span>
                <span v-for="dir in result.sofa.avoidDirections" :key="'sa-' + dir" class="hfs-dir-chip hfs-dir-chip-warn">{{ directionName(dir) }}</span>
              </div>
              <p class="hfs-layout-note">{{ $t('hallFengshui.report.sofaCurrentNote', { degree: result.sofaDirection, star: starName(result.sofaStar), level: levelName(result.sofaStarLevel) }) }}</p>
            </div>

            <!-- 财位 -->
            <div class="hfs-layout-item">
              <div class="hfs-layout-head">
                <span class="hfs-layout-title">✪ {{ $t('hallFengshui.report.wealthTitle') }}</span>
                <span class="hfs-badge hfs-badge-wealth">{{ directionName(result.wealth.direction) }} · {{ starName(result.wealth.star) }}</span>
              </div>
              <div class="hfs-wealth-line">
                <span class="hfs-wealth-type">{{ $t('hallFengshui.report.wealthLiqi') }}</span>
                <span class="hfs-wealth-dir">{{ directionName(result.wealth.direction) }}</span>
                <span class="hfs-wealth-note">{{ starName(result.wealth.star) }}</span>
              </div>
              <div class="hfs-wealth-line">
                <span class="hfs-wealth-type">{{ $t('hallFengshui.report.wealthMing') }}</span>
                <span class="hfs-wealth-dir">{{ result.wealth.diagonalArea }}</span>
                <span class="hfs-wealth-note">{{ $t('hallFengshui.report.wealthMingNote') }}</span>
              </div>
              <p class="hfs-layout-note">{{ result.wealth.note }}</p>
            </div>

            <!-- 茶几与动线陈设 -->
            <div class="hfs-layout-item">
              <div class="hfs-layout-head">
                <span class="hfs-layout-title">▥ {{ $t('hallFengshui.report.decorTitle') }}</span>
              </div>
              <p class="hfs-layout-body">{{ $t('hallFengshui.report.decorBody') }}</p>
              <div class="hfs-dir-line">
                <span class="hfs-dir-label">{{ $t('hallFengshui.report.decorGood') }}</span>
                <span v-for="p in auspiciousPalaces" :key="'dg-' + p.name" class="hfs-dir-chip hfs-dir-chip-good">{{ directionName(p.direction) }}</span>
              </div>
              <div class="hfs-dir-line">
                <span class="hfs-dir-label">{{ $t('hallFengshui.report.decorAvoid') }}</span>
                <span v-for="p in inauspiciousPalaces" :key="'da-' + p.name" class="hfs-dir-chip hfs-dir-chip-warn">{{ directionName(p.direction) }}</span>
              </div>
            </div>

            <!-- 玄关与动线 -->
            <div class="hfs-layout-item">
              <div class="hfs-layout-head">
                <span class="hfs-layout-title">☰ {{ $t('hallFengshui.report.flowTitle') }}</span>
                <span class="hfs-badge hfs-badge-zhai">{{ entrywayFlowText }}</span>
              </div>
              <p class="hfs-layout-body">{{ $t(`hallFengshui.report.flowNote.${result.entrywayFlow}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="hfs-section">
        <div class="hfs-card">
          <h3 class="hfs-card-title">{{ $t('hallFengshui.report.tableTitle') }}</h3>
          <div class="hfs-table-wrap">
            <table class="hfs-table">
              <thead>
                <tr>
                  <th>{{ $t('hallFengshui.report.tablePalace') }}</th>
                  <th>{{ $t('hallFengshui.report.tableDirection') }}</th>
                  <th>{{ $t('hallFengshui.report.tableStar') }}</th>
                  <th>{{ $t('hallFengshui.report.tableLevel') }}</th>
                  <th>{{ $t('hallFengshui.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="hfs-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="hfs-star" :class="p.auspicious ? 'hfs-star-lucky' : 'hfs-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="hfs-badge" :class="p.auspicious ? 'hfs-badge-good' : 'hfs-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="hfs-table-note">{{ $t(`hallFengshui.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="hfs-section">
        <div class="hfs-card">
          <h3 class="hfs-card-title">{{ $t('hallFengshui.report.remedyTitle') }}</h3>
          <div class="hfs-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="hfs-remedy">
              <div class="hfs-remedy-head">
                <span class="hfs-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="hfs-badge hfs-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="hfs-remedy-body">
                {{ $t(`hallFengshui.report.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-07 ============ -->
      <section class="hfs-row hfs-ai-row">
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">01</span>{{ $t('hallFengshui.report.secOverview') }}</h3>
          <div class="hfs-ai-body hfs-md" v-html="renderSection(aiSections[AI_KEYS.overview])" />
        </div>
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">02</span>{{ $t('hallFengshui.report.secPalaces') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-md-tiles hfs-md-tiles-dir" v-html="renderSection(aiSections[AI_KEYS.palaces])" />
        </div>
      </section>

      <section class="hfs-row hfs-ai-row">
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">03</span>{{ $t('hallFengshui.report.secSofa') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.sofa])" />
        </div>
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">04</span>{{ $t('hallFengshui.report.secWealth') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.wealth])" />
        </div>
      </section>

      <section class="hfs-row hfs-ai-row">
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">05</span>{{ $t('hallFengshui.report.secFlow') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.flow])" />
        </div>
        <div class="hfs-card hfs-ai">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">06</span>{{ $t('hallFengshui.report.secRemedy') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-md-tiles hfs-md-tiles-warn" v-html="renderSection(aiSections[AI_KEYS.remedy])" />
        </div>
      </section>

      <!-- 山人小结 -->
      <section class="hfs-section">
        <div class="hfs-card hfs-verse">
          <h3 class="hfs-ai-title"><span class="hfs-ai-no">07</span>{{ $t('hallFengshui.report.secVerse') }}</h3>
          <div class="hfs-ai-body hfs-md hfs-verse-body" v-html="renderSection(aiSections[AI_KEYS.verse])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="hfs-streaming">
        <span class="hfs-streaming-dot" />
        {{ $t('hallFengshui.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="hfs-error">
        <p>{{ error }}</p>
        <button type="button" class="hfs-retry" @click="$emit('retry')">{{ $t('hallFengshui.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="hfs-foot">
        <span class="hfs-foot-note">ⓘ {{ $t('hallFengshui.disclaimer') }}</span>
        <span class="hfs-seal hfs-seal-foot">{{ $t('hallFengshui.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { findMountain24, findNearestMountain24Center, normalizeDegree } from '~/utils/bazhai'
import type { Gua, Star, PalaceResult } from '~/utils/bazhai'
import type { HallFengshuiResult } from '~/utils/hall-fengshui'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: HallFengshuiResult
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

const ENTRYWAY_FLOW_KEY: Record<string, string> = {
  straight: 'entrywayFlowStraight', curved: 'entrywayFlowCurved', open: 'entrywayFlowOpen',
}
const entrywayFlowText = computed(() => t(`hallFengshui.${ENTRYWAY_FLOW_KEY[props.result.entrywayFlow] ?? 'entrywayFlowStraight'}`))

const genderText = computed(() => (props.result.gender === 'male' ? t('common.male') : t('common.female')))
const birthText = computed(() =>
  `${props.result.birthYear}-${String(props.result.birthMonth).padStart(2, '0')}-${String(props.result.birthDay).padStart(2, '0')}`)
const dongsiMingText = computed(() => t(`hallFengshui.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`hallFengshui.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'hallFengshui.report.matchYes' : 'hallFengshui.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'hallFengshui.report.verdictGood' : 'hallFengshui.report.verdictCaution'))

const titleText = computed(() =>
  t('hallFengshui.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))
const subtitleText = computed(() =>
  t('hallFengshui.report.subtitle', { sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

// 沙发所在方位：人坐在沙发上面对的方向，其反向为所在方位山向
const sofaSittingMountain = computed(() => {
  const deg = normalizeDegree(props.result.sofaDirection + 180)
  return findMountain24(deg) ?? findNearestMountain24Center(deg)
})
const sofaSittingText = computed(() =>
  sofaSittingMountain.value ? `${sofaSittingMountain.value.name}（${guaName(sofaSittingMountain.value.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'hallFengshui.report.matchNoteYes' : 'hallFengshui.report.matchNoteNo', {
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
// 吉凶数值：大吉 4 / 吉 3 / 小吉 2 / 凶 1 / 大凶 0.4（雷达图与柱状图用）
const LEVEL_SCORE: Record<string, number> = {
  大吉: 4, 吉: 3, 小吉: 2, 凶: 1, 大凶: 0.4,
}

function guaName(name: string): string {
  return t(`hallFengshui.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`hallFengshui.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`hallFengshui.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`hallFengshui.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
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

const sofaPalaceName = computed<Gua | null>(() => sofaSittingMountain.value?.palace ?? null)

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
  if (cell.name === '中') return 'hfs-cell-center'
  return cell.auspicious ? 'hfs-cell-lucky' : 'hfs-cell-ominous'
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
  sofa: '沙发与待客区摆放',
  wealth: '财位布局',
  flow: '玄关与动线建议',
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
    return `<p class="hfs-pending">${t('hallFengshui.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.hfs {
  --hfs-bg: #f2ede3;
  --hfs-sheet: #faf6ec;
  --hfs-card: #fffdf6;
  --hfs-ink: #2e2a24;
  --hfs-ink-soft: #55503f;
  --hfs-ink-faint: #8a8272;
  --hfs-line: #d8d0bd;
  --hfs-line-soft: #e6dfcd;
  --hfs-accent: #8c2f26;
  --hfs-accent-soft: #a8512e;
  --hfs-star: #8c6d1f;
  --hfs-green: #4a7c59;
  --hfs-teal: #3d6b6e;
  border-radius: 12px;
  background: var(--hfs-bg);
  padding: 18px;
  color: var(--hfs-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.hfs-sheet {
  background: var(--hfs-sheet);
  border: 1px solid var(--hfs-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.hfs-head { border-bottom: 2px solid var(--hfs-ink); padding-bottom: 16px; }
.hfs-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.hfs-brand { display: flex; align-items: center; gap: 8px; }
.hfs-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--hfs-accent);
  color: var(--hfs-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.hfs-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--hfs-ink-soft); }
.hfs-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--hfs-ink-faint); }
.hfs-verdict { color: var(--hfs-green); font-weight: 600; }
.hfs-verdict-warn { color: var(--hfs-accent); }
.hfs-rating { letter-spacing: 1px; }

.hfs-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.hfs-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--hfs-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.hfs-head-bottom { text-align: center; }
.hfs-meta-line { margin: 2px 0; font-size: 12px; color: var(--hfs-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.hfs-row { display: grid; gap: 14px; margin-top: 16px; }
.hfs-row-top { grid-template-columns: 1fr 2.4fr; }
.hfs-pans { grid-template-columns: 1.2fr 1fr; }
.hfs-ai-row { grid-template-columns: 1fr 1fr; }
.hfs-section { margin-top: 16px; }

.hfs-card {
  background: var(--hfs-card);
  border: 1px solid var(--hfs-line);
  padding: 14px 16px;
  min-width: 0;
}
.hfs-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--hfs-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.hfs-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.hfs-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.hfs-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.hfs-ico { color: var(--hfs-accent-soft); font-size: 12px; }
.hfs-profile-label { color: var(--hfs-ink-faint); min-width: 30px; }
.hfs-profile-value { color: var(--hfs-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.hfs-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hfs-mini { border: 1px dashed var(--hfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.hfs-mini-wide { grid-column: 1 / -1; }
.hfs-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--hfs-accent-soft); letter-spacing: 1px; }
.hfs-mini-head-warn { color: var(--hfs-accent); }
.hfs-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--hfs-ink-soft); }
.hfs-point { margin-bottom: 7px; }
.hfs-point:last-child { margin-bottom: 0; }
.hfs-point-title { font-size: 12px; font-weight: 700; color: var(--hfs-ink); display: flex; gap: 5px; align-items: baseline; }
.hfs-point-title-warn { color: var(--hfs-accent); }
.hfs-point-ico { font-size: 10px; color: var(--hfs-star); }
.hfs-point-desc { font-size: 11px; color: var(--hfs-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 核心指标 + 柱状图 ---------- */
.hfs-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.hfs-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.hfs-core-label { font-size: 11px; color: var(--hfs-ink-faint); letter-spacing: 1px; }
.hfs-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.hfs-core-value-text { font-size: 20px; }
.hfs-core-value-good { color: var(--hfs-star); }
.hfs-core-value-warn { color: var(--hfs-accent); }
.hfs-core-sub { font-size: 10px; color: var(--hfs-ink-faint); }

.hfs-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.hfs-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.hfs-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.hfs-bar-name-good { color: var(--hfs-star); }
.hfs-bar-name-warn { color: var(--hfs-accent); }
.hfs-bar-wrap { flex: 1; height: 6px; background: var(--hfs-line-soft); }
.hfs-bar { display: block; height: 100%; }
.hfs-bar-good { background: var(--hfs-star); }
.hfs-bar-warn { background: var(--hfs-accent); }
.hfs-bar-dir { width: 22px; text-align: right; color: var(--hfs-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.hfs-pan { padding: 12px; }
.hfs-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.hfs-pan-legend { display: block; font-size: 9px; color: var(--hfs-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.hfs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.hfs-cell {
  border: 1px solid var(--hfs-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--hfs-card);
}
.hfs-cell-lucky { border-color: var(--hfs-star); background: rgba(140, 109, 31, 0.05); }
.hfs-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.hfs-cell-center { background: var(--hfs-line-soft); }
.hfs-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--hfs-ink-faint); }
.hfs-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.hfs-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.hfs-star-plain { color: var(--hfs-ink); }
.hfs-star-lucky { color: var(--hfs-star); }
.hfs-star-ominous { color: var(--hfs-accent); }
.hfs-cell-level { font-size: 10px; }
.hfs-level-good { color: var(--hfs-star); }
.hfs-level-warn { color: var(--hfs-accent); }
.hfs-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.hfs-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.hfs-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--hfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.hfs-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--hfs-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.hfs-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--hfs-star); border: 1px solid rgba(140, 109, 31, 0.4); }
.hfs-badge-sofa { background: rgba(61, 107, 110, 0.12); color: var(--hfs-teal); border: 1px solid rgba(61, 107, 110, 0.4); }
.hfs-badge-wealth { background: rgba(140, 109, 31, 0.16); color: var(--hfs-star); border: 1px solid rgba(140, 109, 31, 0.5); }
.hfs-badge-best { background: rgba(61, 107, 110, 0.08); color: var(--hfs-teal); border: 1px dashed rgba(61, 107, 110, 0.45); }

/* ---------- 雷达图 ---------- */
.hfs-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.hfs-radar { width: 100%; max-width: 320px; }
.hfs-radar-label { font-size: 8.5px; fill: var(--hfs-ink-soft); font-weight: 700; }
.hfs-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--hfs-ink-faint); flex-wrap: wrap; justify-content: center; }
.hfs-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.hfs-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.hfs-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.hfs-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.hfs-radar-dot-good { background: #4a7c59; }
.hfs-radar-dot-warn { background: #8c2f26; }

/* ---------- 厅堂布局建议 ---------- */
.hfs-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hfs-layout-item { border: 1px dashed var(--hfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.hfs-layout-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.hfs-layout-title { font-size: 12px; font-weight: 700; color: var(--hfs-ink); letter-spacing: 1px; }
.hfs-layout-body { margin: 0 0 8px; font-size: 11px; line-height: 1.7; color: var(--hfs-ink-soft); }
.hfs-layout-note { margin: 8px 0 0; font-size: 10.5px; line-height: 1.6; color: var(--hfs-ink-faint); border-top: 1px dashed var(--hfs-line-soft); padding-top: 6px; }
.hfs-dir-line { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.hfs-dir-label { font-size: 10px; color: var(--hfs-ink-faint); letter-spacing: 1px; }
.hfs-dir-chip {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.hfs-dir-chip-good { background: rgba(74, 124, 89, 0.12); color: var(--hfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.hfs-dir-chip-warn { background: rgba(140, 47, 38, 0.1); color: var(--hfs-accent); border: 1px solid rgba(140, 47, 38, 0.3); }
.hfs-wealth-line { display: flex; align-items: baseline; gap: 6px; font-size: 11px; margin-bottom: 7px; flex-wrap: wrap; }
.hfs-wealth-line:last-of-type { margin-bottom: 0; }
.hfs-wealth-type { font-weight: 700; color: var(--hfs-ink); letter-spacing: 1px; flex-shrink: 0; }
.hfs-wealth-dir { color: var(--hfs-star); font-weight: 700; flex-shrink: 0; }
.hfs-wealth-note { color: var(--hfs-ink-faint); font-size: 10.5px; line-height: 1.6; }

/* ---------- 八宫数据表 ---------- */
.hfs-table-wrap { overflow-x: auto; }
.hfs-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.hfs-table th, .hfs-table td {
  border: 1px solid var(--hfs-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.hfs-table thead th {
  background: var(--hfs-line-soft);
  font-weight: 700;
  color: var(--hfs-ink);
  letter-spacing: 1px;
}
.hfs-table td { color: var(--hfs-ink-soft); }
.hfs-table-palace { font-weight: 700; color: var(--hfs-ink); }
.hfs-table .hfs-star { font-size: 14px; }
.hfs-table .hfs-badge { font-size: 9.5px; }
.hfs-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.hfs-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hfs-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.hfs-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.hfs-remedy-title { font-size: 12px; font-weight: 700; color: var(--hfs-accent); letter-spacing: 1px; }
.hfs-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--hfs-ink-soft); }

/* ---------- AI 章节 ---------- */
.hfs-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--hfs-line-soft);
  padding-bottom: 8px;
}
.hfs-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--hfs-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.hfs-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--hfs-ink-soft); }

.hfs-md :deep(p) { margin: 0 0 0.7em; }
.hfs-md :deep(p:last-child) { margin-bottom: 0; }
.hfs-md :deep(strong) { color: var(--hfs-ink); font-weight: 700; }
.hfs-md :deep(ul), .hfs-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.hfs-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.hfs-md :deep(h3), .hfs-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--hfs-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.hfs-md { overflow-x: auto; }
.hfs-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--hfs-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.hfs-md :deep(.hfs-pending), .hfs-pending { color: var(--hfs-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片 ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.hfs-md-tiles :deep(ul), .hfs-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hfs-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--hfs-line-soft);
  border-left: 3px solid var(--hfs-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--hfs-ink-soft);
}
.hfs-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--hfs-ink);
  margin-bottom: 3px;
}
/* 02 八方一览：八条正好铺 2 列 x 4 行 */
.hfs-md-tiles-dir :deep(li) { border-left-color: var(--hfs-accent-soft); }
/* 06 化解提醒：凶方用朱砂色强调 */
.hfs-md-tiles-warn :deep(li) { border-left-color: var(--hfs-accent); }
.hfs-md-tiles-warn :deep(li strong) { color: var(--hfs-accent); }

/* 07 山人小结：题跋居中 */
.hfs-verse { background: rgba(140, 109, 31, 0.04); }
.hfs-verse-body { text-align: center; font-size: 13px; letter-spacing: 1px; color: var(--hfs-ink); }

.hfs-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--hfs-ink-faint); letter-spacing: 1px;
}
.hfs-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--hfs-accent);
  animation: hfs-pulse 1s ease-in-out infinite;
}
@keyframes hfs-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.hfs-error { margin-top: 14px; text-align: center; color: var(--hfs-accent); font-size: 12px; }
.hfs-retry {
  margin-top: 8px;
  border: 1px solid var(--hfs-accent);
  background: transparent;
  color: var(--hfs-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.hfs-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.hfs-foot {
  margin-top: 18px;
  border-top: 1px solid var(--hfs-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.hfs-foot-note { font-size: 10px; color: var(--hfs-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.hfs-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .hfs-row-top { grid-template-columns: 1fr; }
  .hfs-pans { grid-template-columns: 1fr; }
  .hfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .hfs-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .hfs { padding: 8px; }
  .hfs-sheet { padding: 16px 12px; }
  .hfs-ai-row { grid-template-columns: 1fr; }
  .hfs-overview-grid { grid-template-columns: 1fr; }
  .hfs-layout-grid { grid-template-columns: 1fr; }
  .hfs-remedy-grid { grid-template-columns: 1fr; }
  .hfs-md-tiles :deep(ul), .hfs-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .hfs-title { font-size: 20px; letter-spacing: 2px; }
  .hfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .hfs-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .hfs-pan { padding: 8px; }
  .hfs-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .hfs-star { font-size: 13px; }
  .hfs-cell-head { font-size: 8px; }
  .hfs-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .hfs-table { min-width: 520px; }
}
</style>
