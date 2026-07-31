<template>
  <div class="sfs">
    <div class="sfs-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="sfs-head">
        <div class="sfs-head-top">
          <div class="sfs-brand">
            <div class="sfs-seal">{{ $t('studyFengshui.report.seal') }}</div>
            <span class="sfs-brand-name">{{ $t('studyFengshui.report.brandName') }}</span>
          </div>
          <div class="sfs-head-right">
            <span class="sfs-time">{{ $t('studyFengshui.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="sfs-rating">{{ $t('studyFengshui.report.rating') }}</span>
            <span class="sfs-verdict" :class="{ 'sfs-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="sfs-title">{{ titleText }}</h1>
        <p class="sfs-subtitle">{{ subtitleText }}</p>

        <div class="sfs-head-bottom">
          <p class="sfs-meta-line">
            {{ $t('studyFengshui.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('studyFengshui.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="sfs-meta-line">
            {{ $t('studyFengshui.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('studyFengshui.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>
      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="sfs-row sfs-row-top">
        <div class="sfs-card sfs-profile">
          <div class="sfs-profile-line">
            <span class="sfs-ico">⚥</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileGender') }}</span>
            <span class="sfs-profile-value">{{ genderText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">◷</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileBirth') }}</span>
            <span class="sfs-profile-value">{{ birthText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">⌖</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileFacing') }}</span>
            <span class="sfs-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">▤</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileDesk') }}</span>
            <span class="sfs-profile-value">{{ result.deskDirection }}° · {{ deskSittingText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">☰</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileUsage') }}</span>
            <span class="sfs-profile-value">{{ roomUsageText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">☯</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileMing') }}</span>
            <span class="sfs-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
          <div class="sfs-profile-line">
            <span class="sfs-ico">✎</span>
            <span class="sfs-profile-label">{{ $t('studyFengshui.report.profileGan') }}</span>
            <span class="sfs-profile-value">{{ result.yearGan }}</span>
          </div>
        </div>

        <div class="sfs-card sfs-overview">
          <h3 class="sfs-card-title">{{ $t('studyFengshui.report.overviewTitle') }}</h3>
          <div class="sfs-overview-grid">
            <div class="sfs-mini">
              <h4 class="sfs-mini-head">★ {{ $t('studyFengshui.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="sfs-point">
                <div class="sfs-point-title"><span class="sfs-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="sfs-point-desc">{{ $t('studyFengshui.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="sfs-mini">
              <h4 class="sfs-mini-head sfs-mini-head-warn">⊘ {{ $t('studyFengshui.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="sfs-point">
                <div class="sfs-point-title sfs-point-title-warn"><span class="sfs-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="sfs-point-desc">{{ $t('studyFengshui.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="sfs-mini sfs-mini-wide">
              <h4 class="sfs-mini-head">{{ $t('studyFengshui.report.matchNoteTitle') }}</h4>
              <p class="sfs-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>
      <!-- ============ 核心指标 + 星曜柱状图 ============ -->
      <section class="sfs-section">
        <h3 class="sfs-section-title">{{ $t('studyFengshui.report.statsTitle') }}</h3>
        <div class="sfs-core-grid">
          <div class="sfs-card sfs-core">
            <div class="sfs-core-label">{{ $t('studyFengshui.report.coreLuckyCount') }}</div>
            <div class="sfs-core-value sfs-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="sfs-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="sfs-card sfs-core">
            <div class="sfs-core-label">{{ $t('studyFengshui.report.coreCautionCount') }}</div>
            <div class="sfs-core-value sfs-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="sfs-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="sfs-card sfs-core">
            <div class="sfs-core-label">{{ $t('studyFengshui.report.coreDeskStar') }}</div>
            <div class="sfs-core-value sfs-core-value-text" :class="result.deskAuspicious ? 'sfs-core-value-good' : 'sfs-core-value-warn'">{{ starName(result.deskStar) }}</div>
            <div class="sfs-core-sub">{{ levelName(result.deskStarLevel) }}</div>
          </div>
          <div class="sfs-card sfs-core">
            <div class="sfs-core-label">{{ $t('studyFengshui.report.coreWenchangDir') }}</div>
            <div class="sfs-core-value sfs-core-value-good sfs-core-value-text">{{ primaryWenchang ? directionName(primaryWenchang.direction) : '—' }}</div>
            <div class="sfs-core-sub">{{ primaryWenchang ? wenchangTypeName(primaryWenchang.type) : '—' }}</div>
          </div>
          <div class="sfs-card sfs-core sfs-core-chart">
            <div class="sfs-core-label">{{ $t('studyFengshui.report.coreStarChart') }}</div>
            <div class="sfs-bars">
              <div v-for="s in starStats" :key="s.key" class="sfs-bar-row">
                <span class="sfs-bar-name" :class="s.auspicious ? 'sfs-bar-name-good' : 'sfs-bar-name-warn'">{{ s.label }}</span>
                <span class="sfs-bar-wrap">
                  <span class="sfs-bar" :class="s.auspicious ? 'sfs-bar-good' : 'sfs-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="sfs-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="sfs-row sfs-pans">
        <div class="sfs-card sfs-pan">
          <h3 class="sfs-pan-title">
            {{ $t('studyFengshui.report.panTitle') }}
            <span class="sfs-pan-legend">{{ $t('studyFengshui.report.panLegend') }}</span>
          </h3>
          <div class="sfs-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="sfs-cell"
              :class="cellClass(cell)"
            >
              <div class="sfs-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="sfs-cell-stars">
                <span v-if="cell.star" class="sfs-star" :class="cell.auspicious ? 'sfs-star-lucky' : 'sfs-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="sfs-star sfs-star-plain">{{ $t('studyFengshui.report.centerPalace') }}</span>
                <span v-if="cell.level" class="sfs-cell-level" :class="cell.auspicious ? 'sfs-level-good' : 'sfs-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="sfs-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="sfs-badge sfs-badge-good">{{ $t('studyFengshui.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="sfs-badge sfs-badge-warn">{{ $t('studyFengshui.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="sfs-badge sfs-badge-zhai">{{ $t('studyFengshui.report.badgeZhai') }}</span>
                <span v-if="cell.name === deskPalaceName" class="sfs-badge sfs-badge-desk">{{ $t('studyFengshui.report.badgeDesk') }}</span>
                <span v-if="cell.star && wenchangDirections.includes(cell.direction)" class="sfs-badge sfs-badge-wenchang">{{ $t('studyFengshui.report.badgeWenchang') }}</span>
                <span v-if="cell.star && result.desk.bestDirections.includes(cell.direction)" class="sfs-badge sfs-badge-best">{{ $t('studyFengshui.report.badgeDeskBest') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sfs-card sfs-pan">
          <h3 class="sfs-pan-title">{{ $t('studyFengshui.report.radarTitle') }}</h3>
          <div class="sfs-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="sfs-radar" xmlns="http://www.w3.org/2000/svg">
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
                  :x2="RADAR_AXIS_POINTS[i].x" :y2="RADAR_AXIS_POINTS[i].y"
                  stroke="#e6dfcd"
                  stroke-width="0.6"
                />
                <text
                  :x="RADAR_LABEL_POINTS[i].x" :y="RADAR_LABEL_POINTS[i].y"
                  class="sfs-radar-label"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ label }}</text>
              </g>
              <polygon :points="radarSeriesPoints" fill="rgba(140, 109, 31, 0.14)" stroke="none" />
              <polyline :points="radarSeriesPoints" fill="none" stroke="#8c6d1f" stroke-width="1.4" />
              <circle
                v-for="(p, i) in radarPalaces"
                :key="p.name"
                :cx="RADAR_VALUE_POINTS[i].x" :cy="RADAR_VALUE_POINTS[i].y"
                r="2.2"
                :fill="p.auspicious ? '#4a7c59' : '#8c2f26'"
              />
            </svg>
            <div class="sfs-radar-legend">
              <span class="sfs-radar-legend-item"><i class="sfs-radar-swatch sfs-radar-swatch-value" />{{ $t('studyFengshui.report.radarValue') }}</span>
              <span class="sfs-radar-legend-item"><i class="sfs-radar-dot sfs-radar-dot-good" />{{ $t('studyFengshui.report.radarLucky') }}</span>
              <span class="sfs-radar-legend-item"><i class="sfs-radar-dot sfs-radar-dot-warn" />{{ $t('studyFengshui.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>
      <!-- ============ 书房布局建议 ============ -->
      <section class="sfs-section">
        <div class="sfs-card">
          <h3 class="sfs-card-title">{{ $t('studyFengshui.report.layoutTitle') }}</h3>
          <div class="sfs-layout-grid">
            <!-- 书桌朝向 -->
            <div class="sfs-layout-item">
              <div class="sfs-layout-head">
                <span class="sfs-layout-title">▤ {{ $t('studyFengshui.report.deskTitle') }}</span>
                <span class="sfs-badge" :class="result.deskAuspicious ? 'sfs-badge-good' : 'sfs-badge-warn'">
                  {{ starName(result.deskStar) }} · {{ levelName(result.deskStarLevel) }}
                </span>
              </div>
              <p class="sfs-layout-body">{{ result.desk.note }}</p>
              <div class="sfs-dir-line">
                <span class="sfs-dir-label">{{ $t('studyFengshui.report.dirBest') }}</span>
                <span v-for="dir in result.desk.bestDirections" :key="'db-' + dir" class="sfs-dir-chip sfs-dir-chip-good">{{ directionName(dir) }}</span>
              </div>
              <div v-if="result.desk.avoidDirections.length" class="sfs-dir-line">
                <span class="sfs-dir-label">{{ $t('studyFengshui.report.dirAvoid') }}</span>
                <span v-for="dir in result.desk.avoidDirections" :key="'da-' + dir" class="sfs-dir-chip sfs-dir-chip-warn">{{ directionName(dir) }}</span>
              </div>
              <p class="sfs-layout-note">{{ $t('studyFengshui.report.deskCurrentNote', { degree: result.deskDirection, star: starName(result.deskStar), level: levelName(result.deskStarLevel) }) }}</p>
            </div>

            <!-- 文昌位 -->
            <div class="sfs-layout-item">
              <div class="sfs-layout-head">
                <span class="sfs-layout-title">✎ {{ $t('studyFengshui.report.wenchangTitle') }}</span>
              </div>
              <div v-for="w in result.wenchang" :key="w.type" class="sfs-wenchang-line">
                <span class="sfs-wenchang-type">{{ wenchangTypeName(w.type) }}</span>
                <span class="sfs-wenchang-dir">{{ directionName(w.direction) }}</span>
                <span class="sfs-wenchang-note">{{ w.note }}</span>
              </div>
            </div>

            <!-- 书架与收纳 -->
            <div class="sfs-layout-item">
              <div class="sfs-layout-head">
                <span class="sfs-layout-title">▥ {{ $t('studyFengshui.report.shelfTitle') }}</span>
              </div>
              <p class="sfs-layout-body">{{ $t('studyFengshui.report.shelfBody') }}</p>
              <div class="sfs-dir-line">
                <span class="sfs-dir-label">{{ $t('studyFengshui.report.shelfGood') }}</span>
                <span v-for="p in auspiciousPalaces" :key="'sg-' + p.name" class="sfs-dir-chip sfs-dir-chip-good">{{ directionName(p.direction) }}</span>
              </div>
              <div class="sfs-dir-line">
                <span class="sfs-dir-label">{{ $t('studyFengshui.report.shelfAvoid') }}</span>
                <span v-for="p in inauspiciousPalaces" :key="'sa-' + p.name" class="sfs-dir-chip sfs-dir-chip-warn">{{ directionName(p.direction) }}</span>
              </div>
            </div>

            <!-- 房间合用提醒 -->
            <div class="sfs-layout-item">
              <div class="sfs-layout-head">
                <span class="sfs-layout-title">☰ {{ $t('studyFengshui.report.usageTitle') }}</span>
                <span class="sfs-badge sfs-badge-zhai">{{ roomUsageText }}</span>
              </div>
              <p class="sfs-layout-body">{{ $t(`studyFengshui.report.usageNote.${result.roomUsage}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="sfs-section">
        <div class="sfs-card">
          <h3 class="sfs-card-title">{{ $t('studyFengshui.report.tableTitle') }}</h3>
          <div class="sfs-table-wrap">
            <table class="sfs-table">
              <thead>
                <tr>
                  <th>{{ $t('studyFengshui.report.tablePalace') }}</th>
                  <th>{{ $t('studyFengshui.report.tableDirection') }}</th>
                  <th>{{ $t('studyFengshui.report.tableStar') }}</th>
                  <th>{{ $t('studyFengshui.report.tableLevel') }}</th>
                  <th>{{ $t('studyFengshui.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="sfs-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="sfs-star" :class="p.auspicious ? 'sfs-star-lucky' : 'sfs-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="sfs-badge" :class="p.auspicious ? 'sfs-badge-good' : 'sfs-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="sfs-table-note">{{ $t(`studyFengshui.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="sfs-section">
        <div class="sfs-card">
          <h3 class="sfs-card-title">{{ $t('studyFengshui.report.remedyTitle') }}</h3>
          <div class="sfs-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="sfs-remedy">
              <div class="sfs-remedy-head">
                <span class="sfs-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="sfs-badge sfs-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="sfs-remedy-body">
                {{ $t(`studyFengshui.report.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-07 ============ -->
      <section class="sfs-row sfs-ai-row">
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">01</span>{{ $t('studyFengshui.report.secOverview') }}</h3>
          <div class="sfs-ai-body sfs-md" v-html="renderSection(aiSections[AI_KEYS.overview])" />
        </div>
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">02</span>{{ $t('studyFengshui.report.secPalaces') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-md-tiles sfs-md-tiles-dir" v-html="renderSection(aiSections[AI_KEYS.palaces])" />
        </div>
      </section>

      <section class="sfs-row sfs-ai-row">
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">03</span>{{ $t('studyFengshui.report.secDesk') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.desk])" />
        </div>
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">04</span>{{ $t('studyFengshui.report.secWenchang') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.wenchang])" />
        </div>
      </section>

      <section class="sfs-row sfs-ai-row">
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">05</span>{{ $t('studyFengshui.report.secShelf') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-md-tiles" v-html="renderSection(aiSections[AI_KEYS.shelf])" />
        </div>
        <div class="sfs-card sfs-ai">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">06</span>{{ $t('studyFengshui.report.secRemedy') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-md-tiles sfs-md-tiles-warn" v-html="renderSection(aiSections[AI_KEYS.remedy])" />
        </div>
      </section>

      <!-- 山人小结 -->
      <section class="sfs-section">
        <div class="sfs-card sfs-verse">
          <h3 class="sfs-ai-title"><span class="sfs-ai-no">07</span>{{ $t('studyFengshui.report.secVerse') }}</h3>
          <div class="sfs-ai-body sfs-md sfs-verse-body" v-html="renderSection(aiSections[AI_KEYS.verse])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="sfs-streaming">
        <span class="sfs-streaming-dot" />
        {{ $t('studyFengshui.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="sfs-error">
        <p>{{ error }}</p>
        <button type="button" class="sfs-retry" @click="$emit('retry')">{{ $t('studyFengshui.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="sfs-foot">
        <span class="sfs-foot-note">ⓘ {{ $t('studyFengshui.disclaimer') }}</span>
        <span class="sfs-seal sfs-seal-foot">{{ $t('studyFengshui.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { findMountain24, findNearestMountain24Center, normalizeDegree } from '~/utils/bazhai'
import type { Gua, Star, PalaceResult } from '~/utils/bazhai'
import type { StudyFengshuiResult } from '~/utils/study-fengshui'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: StudyFengshuiResult
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

const ROOM_USAGE_KEY: Record<string, string> = {
  independent: 'roomUsageIndependent', withBedroom: 'roomUsageWithBedroom',
  withLivingRoom: 'roomUsageWithLivingRoom', withDining: 'roomUsageWithDining',
}
const roomUsageText = computed(() => t(`studyFengshui.${ROOM_USAGE_KEY[props.result.roomUsage] ?? 'roomUsageIndependent'}`))

const genderText = computed(() => (props.result.gender === 'male' ? t('common.male') : t('common.female')))
const birthText = computed(() =>
  `${props.result.birthYear}-${String(props.result.birthMonth).padStart(2, '0')}-${String(props.result.birthDay).padStart(2, '0')}`)
const dongsiMingText = computed(() => t(`studyFengshui.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`studyFengshui.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'studyFengshui.report.matchYes' : 'studyFengshui.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'studyFengshui.report.verdictGood' : 'studyFengshui.report.verdictCaution'))

const titleText = computed(() =>
  t('studyFengshui.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))
const subtitleText = computed(() =>
  t('studyFengshui.report.subtitle', { sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

// 书桌所在方位：与引擎保持一致，直接用 deskDirection（人面对方向）查山
const deskSittingMountain = computed(() => {
  const deg = normalizeDegree(props.result.deskDirection)
  return findMountain24(deg) ?? findNearestMountain24Center(deg)
})
const deskSittingText = computed(() =>
  deskSittingMountain.value ? `${deskSittingMountain.value.name}（${guaName(deskSittingMountain.value.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'studyFengshui.report.matchNoteYes' : 'studyFengshui.report.matchNoteNo', {
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
  return t(`studyFengshui.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`studyFengshui.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`studyFengshui.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`studyFengshui.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
}
function wenchangTypeName(type: string): string {
  return type === '本命文昌' ? t('studyFengshui.report.wenchangBenming') : t('studyFengshui.report.wenchangFixed')
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

const deskPalaceName = computed<Gua | null>(() => deskSittingMountain.value?.palace ?? null)

const wenchangDirections = computed(() => props.result.wenchang.map(w => w.direction))
const primaryWenchang = computed(() => props.result.wenchang[0] ?? null)

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
  if (cell.name === '中') return 'sfs-cell-center'
  return cell.auspicious ? 'sfs-cell-lucky' : 'sfs-cell-ominous'
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
  desk: '书桌朝向建议',
  wenchang: '文昌位强化',
  shelf: '书架与收纳',
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
    return `<p class="sfs-pending">${t('studyFengshui.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.sfs {
  --sfs-bg: #f2ede3;
  --sfs-sheet: #faf6ec;
  --sfs-card: #fffdf6;
  --sfs-ink: #2e2a24;
  --sfs-ink-soft: #55503f;
  --sfs-ink-faint: #8a8272;
  --sfs-line: #d8d0bd;
  --sfs-line-soft: #e6dfcd;
  --sfs-accent: #8c2f26;
  --sfs-accent-soft: #a8512e;
  --sfs-star: #8c6d1f;
  --sfs-green: #4a7c59;
  --sfs-teal: #3d6b6e;
  border-radius: 12px;
  background: var(--sfs-bg);
  padding: 18px;
  color: var(--sfs-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.sfs-sheet {
  background: var(--sfs-sheet);
  border: 1px solid var(--sfs-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.sfs-head { border-bottom: 2px solid var(--sfs-ink); padding-bottom: 16px; }
.sfs-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.sfs-brand { display: flex; align-items: center; gap: 8px; }
.sfs-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--sfs-accent);
  color: var(--sfs-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.sfs-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--sfs-ink-soft); }
.sfs-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--sfs-ink-faint); }
.sfs-verdict { color: var(--sfs-green); font-weight: 600; }
.sfs-verdict-warn { color: var(--sfs-accent); }
.sfs-rating { letter-spacing: 1px; }

.sfs-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.sfs-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--sfs-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.sfs-head-bottom { text-align: center; }
.sfs-meta-line { margin: 2px 0; font-size: 12px; color: var(--sfs-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.sfs-row { display: grid; gap: 14px; margin-top: 16px; }
.sfs-row-top { grid-template-columns: 1fr 2.4fr; }
.sfs-pans { grid-template-columns: 1.2fr 1fr; }
.sfs-ai-row { grid-template-columns: 1fr 1fr; }
.sfs-section { margin-top: 16px; }

.sfs-card {
  background: var(--sfs-card);
  border: 1px solid var(--sfs-line);
  padding: 14px 16px;
  min-width: 0;
}
.sfs-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--sfs-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.sfs-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.sfs-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.sfs-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.sfs-ico { color: var(--sfs-accent-soft); font-size: 12px; }
.sfs-profile-label { color: var(--sfs-ink-faint); min-width: 30px; }
.sfs-profile-value { color: var(--sfs-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.sfs-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sfs-mini { border: 1px dashed var(--sfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.sfs-mini-wide { grid-column: 1 / -1; }
.sfs-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--sfs-accent-soft); letter-spacing: 1px; }
.sfs-mini-head-warn { color: var(--sfs-accent); }
.sfs-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--sfs-ink-soft); }
.sfs-point { margin-bottom: 7px; }
.sfs-point:last-child { margin-bottom: 0; }
.sfs-point-title { font-size: 12px; font-weight: 700; color: var(--sfs-ink); display: flex; gap: 5px; align-items: baseline; }
.sfs-point-title-warn { color: var(--sfs-accent); }
.sfs-point-ico { font-size: 10px; color: var(--sfs-star); }
.sfs-point-desc { font-size: 11px; color: var(--sfs-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 核心指标 + 柱状图 ---------- */
.sfs-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.sfs-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.sfs-core-label { font-size: 11px; color: var(--sfs-ink-faint); letter-spacing: 1px; }
.sfs-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.sfs-core-value-text { font-size: 20px; }
.sfs-core-value-good { color: var(--sfs-star); }
.sfs-core-value-warn { color: var(--sfs-accent); }
.sfs-core-sub { font-size: 10px; color: var(--sfs-ink-faint); }

.sfs-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.sfs-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.sfs-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.sfs-bar-name-good { color: var(--sfs-star); }
.sfs-bar-name-warn { color: var(--sfs-accent); }
.sfs-bar-wrap { flex: 1; height: 6px; background: var(--sfs-line-soft); }
.sfs-bar { display: block; height: 100%; }
.sfs-bar-good { background: var(--sfs-star); }
.sfs-bar-warn { background: var(--sfs-accent); }
.sfs-bar-dir { width: 22px; text-align: right; color: var(--sfs-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.sfs-pan { padding: 12px; }
.sfs-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.sfs-pan-legend { display: block; font-size: 9px; color: var(--sfs-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.sfs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.sfs-cell {
  border: 1px solid var(--sfs-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--sfs-card);
}
.sfs-cell-lucky { border-color: var(--sfs-star); background: rgba(140, 109, 31, 0.05); }
.sfs-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.sfs-cell-center { background: var(--sfs-line-soft); }
.sfs-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--sfs-ink-faint); }
.sfs-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.sfs-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.sfs-star-plain { color: var(--sfs-ink); }
.sfs-star-lucky { color: var(--sfs-star); }
.sfs-star-ominous { color: var(--sfs-accent); }
.sfs-cell-level { font-size: 10px; }
.sfs-level-good { color: var(--sfs-star); }
.sfs-level-warn { color: var(--sfs-accent); }
.sfs-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.sfs-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.sfs-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--sfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.sfs-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--sfs-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.sfs-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--sfs-star); border: 1px solid rgba(140, 109, 31, 0.4); }
.sfs-badge-desk { background: rgba(61, 107, 110, 0.12); color: var(--sfs-teal); border: 1px solid rgba(61, 107, 110, 0.4); }
.sfs-badge-wenchang { background: rgba(61, 107, 110, 0.08); color: var(--sfs-teal); border: 1px dashed rgba(61, 107, 110, 0.45); }
.sfs-badge-best { background: rgba(140, 109, 31, 0.16); color: var(--sfs-star); border: 1px solid rgba(140, 109, 31, 0.5); }

/* ---------- 雷达图 ---------- */
.sfs-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.sfs-radar { width: 100%; max-width: 320px; }
.sfs-radar-label { font-size: 8.5px; fill: var(--sfs-ink-soft); font-weight: 700; }
.sfs-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--sfs-ink-faint); flex-wrap: wrap; justify-content: center; }
.sfs-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.sfs-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.sfs-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.sfs-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.sfs-radar-dot-good { background: #4a7c59; }
.sfs-radar-dot-warn { background: #8c2f26; }

/* ---------- 书房布局建议 ---------- */
.sfs-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sfs-layout-item { border: 1px dashed var(--sfs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.sfs-layout-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.sfs-layout-title { font-size: 12px; font-weight: 700; color: var(--sfs-ink); letter-spacing: 1px; }
.sfs-layout-body { margin: 0 0 8px; font-size: 11px; line-height: 1.7; color: var(--sfs-ink-soft); }
.sfs-layout-note { margin: 8px 0 0; font-size: 10.5px; line-height: 1.6; color: var(--sfs-ink-faint); border-top: 1px dashed var(--sfs-line-soft); padding-top: 6px; }
.sfs-dir-line { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.sfs-dir-label { font-size: 10px; color: var(--sfs-ink-faint); letter-spacing: 1px; }
.sfs-dir-chip {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.sfs-dir-chip-good { background: rgba(74, 124, 89, 0.12); color: var(--sfs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.sfs-dir-chip-warn { background: rgba(140, 47, 38, 0.1); color: var(--sfs-accent); border: 1px solid rgba(140, 47, 38, 0.3); }
.sfs-wenchang-line { display: flex; align-items: baseline; gap: 6px; font-size: 11px; margin-bottom: 7px; flex-wrap: wrap; }
.sfs-wenchang-line:last-child { margin-bottom: 0; }
.sfs-wenchang-type { font-weight: 700; color: var(--sfs-ink); letter-spacing: 1px; flex-shrink: 0; }
.sfs-wenchang-dir { color: var(--sfs-teal); font-weight: 700; flex-shrink: 0; }
.sfs-wenchang-note { color: var(--sfs-ink-faint); font-size: 10.5px; line-height: 1.6; }

/* ---------- 八宫数据表 ---------- */
.sfs-table-wrap { overflow-x: auto; }
.sfs-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.sfs-table th, .sfs-table td {
  border: 1px solid var(--sfs-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.sfs-table thead th {
  background: var(--sfs-line-soft);
  font-weight: 700;
  color: var(--sfs-ink);
  letter-spacing: 1px;
}
.sfs-table td { color: var(--sfs-ink-soft); }
.sfs-table-palace { font-weight: 700; color: var(--sfs-ink); }
.sfs-table .sfs-star { font-size: 14px; }
.sfs-table .sfs-badge { font-size: 9.5px; }
.sfs-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.sfs-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sfs-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.sfs-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.sfs-remedy-title { font-size: 12px; font-weight: 700; color: var(--sfs-accent); letter-spacing: 1px; }
.sfs-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--sfs-ink-soft); }

/* ---------- AI 章节 ---------- */
.sfs-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--sfs-line-soft);
  padding-bottom: 8px;
}
.sfs-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--sfs-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.sfs-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--sfs-ink-soft); }

.sfs-md :deep(p) { margin: 0 0 0.7em; }
.sfs-md :deep(p:last-child) { margin-bottom: 0; }
.sfs-md :deep(strong) { color: var(--sfs-ink); font-weight: 700; }
.sfs-md :deep(ul), .sfs-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.sfs-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.sfs-md :deep(h3), .sfs-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--sfs-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.sfs-md { overflow-x: auto; }
.sfs-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--sfs-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.sfs-md :deep(.sfs-pending), .sfs-pending { color: var(--sfs-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片 ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.sfs-md-tiles :deep(ul), .sfs-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sfs-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--sfs-line-soft);
  border-left: 3px solid var(--sfs-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--sfs-ink-soft);
}
.sfs-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--sfs-ink);
  margin-bottom: 3px;
}
/* 02 八方一览：八条正好铺 2 列 x 4 行 */
.sfs-md-tiles-dir :deep(li) { border-left-color: var(--sfs-accent-soft); }
/* 06 化解提醒：凶方用朱砂色强调 */
.sfs-md-tiles-warn :deep(li) { border-left-color: var(--sfs-accent); }
.sfs-md-tiles-warn :deep(li strong) { color: var(--sfs-accent); }

/* 07 山人小结：题跋居中 */
.sfs-verse { background: rgba(140, 109, 31, 0.04); }
.sfs-verse-body { text-align: center; font-size: 13px; letter-spacing: 1px; color: var(--sfs-ink); }

.sfs-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--sfs-ink-faint); letter-spacing: 1px;
}
.sfs-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--sfs-accent);
  animation: sfs-pulse 1s ease-in-out infinite;
}
@keyframes sfs-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.sfs-error { margin-top: 14px; text-align: center; color: var(--sfs-accent); font-size: 12px; }
.sfs-retry {
  margin-top: 8px;
  border: 1px solid var(--sfs-accent);
  background: transparent;
  color: var(--sfs-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.sfs-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.sfs-foot {
  margin-top: 18px;
  border-top: 1px solid var(--sfs-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.sfs-foot-note { font-size: 10px; color: var(--sfs-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.sfs-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .sfs-row-top { grid-template-columns: 1fr; }
  .sfs-pans { grid-template-columns: 1fr; }
  .sfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .sfs-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .sfs { padding: 8px; }
  .sfs-sheet { padding: 16px 12px; }
  .sfs-ai-row { grid-template-columns: 1fr; }
  .sfs-overview-grid { grid-template-columns: 1fr; }
  .sfs-layout-grid { grid-template-columns: 1fr; }
  .sfs-remedy-grid { grid-template-columns: 1fr; }
  .sfs-md-tiles :deep(ul), .sfs-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .sfs-title { font-size: 20px; letter-spacing: 2px; }
  .sfs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .sfs-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .sfs-pan { padding: 8px; }
  .sfs-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .sfs-star { font-size: 13px; }
  .sfs-cell-head { font-size: 8px; }
  .sfs-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .sfs-table { min-width: 520px; }
}
</style>
