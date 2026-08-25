<template>
  <div class="ofs">
    <div class="ofs-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="ofs-head">
        <div class="ofs-head-top">
          <div class="ofs-brand">
            <div class="ofs-seal">{{ $t('officeFengshui.report.seal') }}</div>
            <span class="ofs-brand-name">{{ $t('officeFengshui.report.brandName') }}</span>
          </div>
          <div class="ofs-head-right">
            <span class="ofs-time">{{ $t('officeFengshui.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="ofs-rating">{{ $t('officeFengshui.report.rating') }}</span>
            <span class="ofs-verdict" :class="{ 'ofs-verdict-warn': !mingZhaiMatch }">
              {{ mingZhaiMatch ? '✓' : '△' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="ofs-title">{{ titleText }}</h1>
        <p class="ofs-subtitle">{{ subtitleText }}</p>

        <div class="ofs-head-bottom">
          <p class="ofs-meta-line">
            {{ $t('officeFengshui.report.metaMing', { gua: guaName(result.mingGua), number: result.mingGuaNumber, dongsi: dongsiMingText }) }}
            · {{ $t('officeFengshui.report.metaZhai', { gua: guaName(zhaiGua), dongsi: dongsiZhaiText }) }}
          </p>
          <p class="ofs-meta-line">
            {{ $t('officeFengshui.report.metaSitting', { sitting: sittingText, facing: facingText }) }}
            · {{ $t('officeFengshui.report.metaMatch', { match: matchText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="ofs-row ofs-row-top">
        <div class="ofs-card ofs-profile">
          <div class="ofs-profile-line">
            <span class="ofs-ico">▣</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileRoom') }}</span>
            <span class="ofs-profile-value">{{ roomTypeText }}</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">⚥</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileGender') }}</span>
            <span class="ofs-profile-value">{{ genderText }}</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">◷</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileBirth') }}</span>
            <span class="ofs-profile-value">{{ birthText }}</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">⌖</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileFacing') }}</span>
            <span class="ofs-profile-value">{{ result.direction }}° · {{ facingText }}</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">⌘</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileDesk') }}</span>
            <span class="ofs-profile-value">{{ result.deskDirection }}°</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">☰</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileUsage') }}</span>
            <span class="ofs-profile-value">{{ officeUsageText }}</span>
          </div>
          <div class="ofs-profile-line">
            <span class="ofs-ico">☯</span>
            <span class="ofs-profile-label">{{ $t('officeFengshui.report.profileMing') }}</span>
            <span class="ofs-profile-value">{{ guaName(result.mingGua) }}（{{ result.mingGuaNumber }}）· {{ dongsiMingText }}</span>
          </div>
        </div>

        <div class="ofs-card ofs-overview">
          <h3 class="ofs-card-title">{{ $t('officeFengshui.report.overviewTitle') }}</h3>
          <div class="ofs-overview-grid">
            <div class="ofs-mini">
              <h4 class="ofs-mini-head">★ {{ $t('officeFengshui.report.luckyTitle') }}</h4>
              <div v-for="p in auspiciousPalaces" :key="p.name" class="ofs-point">
                <div class="ofs-point-title"><span class="ofs-point-ico">★</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="ofs-point-desc">{{ $t('officeFengshui.report.luckyDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="ofs-mini">
              <h4 class="ofs-mini-head ofs-mini-head-warn">⊘ {{ $t('officeFengshui.report.cautionTitle') }}</h4>
              <div v-for="p in inauspiciousPalaces" :key="p.name" class="ofs-point">
                <div class="ofs-point-title ofs-point-title-warn"><span class="ofs-point-ico">⊘</span>{{ starName(p.star) }}（{{ directionName(p.direction) }}）</div>
                <div class="ofs-point-desc">{{ $t('officeFengshui.report.cautionDesc', { level: levelName(p.level), palace: guaName(p.name) }) }}</div>
              </div>
            </div>
            <div class="ofs-mini ofs-mini-wide">
              <h4 class="ofs-mini-head">{{ $t('officeFengshui.report.matchNoteTitle') }}</h4>
              <p class="ofs-mini-body">{{ matchNoteText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 星曜统计 ============ -->
      <section class="ofs-section">
        <h3 class="ofs-section-title">{{ $t('officeFengshui.report.statsTitle') }}</h3>
        <div class="ofs-core-grid">
          <div class="ofs-card ofs-core">
            <div class="ofs-core-label">{{ $t('officeFengshui.report.coreLuckyCount') }}</div>
            <div class="ofs-core-value ofs-core-value-good">{{ auspiciousPalaces.length }}</div>
            <div class="ofs-core-sub">{{ auspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="ofs-card ofs-core">
            <div class="ofs-core-label">{{ $t('officeFengshui.report.coreCautionCount') }}</div>
            <div class="ofs-core-value ofs-core-value-warn">{{ inauspiciousPalaces.length }}</div>
            <div class="ofs-core-sub">{{ inauspiciousPalaces.map(p => guaName(p.name)).join(' · ') }}</div>
          </div>
          <div class="ofs-card ofs-core">
            <div class="ofs-core-label">{{ $t('officeFengshui.report.coreDeskStar') }}</div>
            <div class="ofs-core-value ofs-core-value-text" :class="result.deskAuspicious ? 'ofs-core-value-good' : 'ofs-core-value-warn'">{{ starName(result.deskStar) }}</div>
            <div class="ofs-core-sub">{{ levelName(result.deskStarLevel) }}</div>
          </div>
          <div class="ofs-card ofs-core">
            <div class="ofs-core-label">{{ $t('officeFengshui.report.coreWealthDir') }}</div>
            <div class="ofs-core-value ofs-core-value-good ofs-core-value-text">{{ directionName(result.wealth.direction) }}</div>
            <div class="ofs-core-sub">{{ starName(result.wealth.star) }}</div>
          </div>
          <div class="ofs-card ofs-core ofs-core-chart">
            <div class="ofs-core-label">{{ $t('officeFengshui.report.coreStarChart') }}</div>
            <div class="ofs-bars">
              <div v-for="s in starStats" :key="s.key" class="ofs-bar-row">
                <span class="ofs-bar-name" :class="s.auspicious ? 'ofs-bar-name-good' : 'ofs-bar-name-warn'">{{ s.label }}</span>
                <span class="ofs-bar-wrap">
                  <span class="ofs-bar" :class="s.auspicious ? 'ofs-bar-good' : 'ofs-bar-warn'" :style="{ width: (s.value * 100) + '%' }" />
                </span>
                <span class="ofs-bar-dir">{{ s.direction }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫吉凶盘 + 星曜方位雷达 ============ -->
      <section class="ofs-row ofs-pans">
        <!-- 八宫吉凶盘 -->
        <div class="ofs-card ofs-pan">
          <h3 class="ofs-pan-title">
            {{ $t('officeFengshui.report.panTitle') }}
            <span class="ofs-pan-legend">{{ $t('officeFengshui.report.panLegend') }}</span>
          </h3>
          <div class="ofs-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="ofs-cell"
              :class="cellClass(cell)"
            >
              <div class="ofs-cell-head">
                <span>{{ guaName(cell.name) }}</span>
                <span>{{ cell.direction ? directionName(cell.direction) : '—' }}</span>
              </div>
              <div class="ofs-cell-stars">
                <span v-if="cell.star" class="ofs-star" :class="cell.auspicious ? 'ofs-star-lucky' : 'ofs-star-ominous'">{{ starName(cell.star) }}</span>
                <span v-else class="ofs-star ofs-star-plain">{{ $t('officeFengshui.report.centerPalace') }}</span>
                <span v-if="cell.level" class="ofs-cell-level" :class="cell.auspicious ? 'ofs-level-good' : 'ofs-level-warn'">{{ levelName(cell.level) }}</span>
              </div>
              <div class="ofs-cell-badges">
                <span v-if="cell.name !== '中' && cell.auspicious" class="ofs-badge ofs-badge-good">{{ $t('officeFengshui.report.badgeJi') }}</span>
                <span v-if="cell.name !== '中' && !cell.auspicious" class="ofs-badge ofs-badge-warn">{{ $t('officeFengshui.report.badgeXiong') }}</span>
                <span v-if="cell.name === zhaiGua" class="ofs-badge ofs-badge-zhai">{{ $t('officeFengshui.report.badgeZhai') }}</span>
                <span v-if="cell.name === deskPalaceName" class="ofs-badge ofs-badge-desk">{{ $t('officeFengshui.report.badgeDesk') }}</span>
                <span v-if="cell.star && cell.direction === result.wealth.direction" class="ofs-badge ofs-badge-wealth">{{ $t('officeFengshui.report.badgeWealth') }}</span>
                <span v-if="cell.star && wenchangDirections.includes(cell.direction)" class="ofs-badge ofs-badge-wenchang">{{ $t('officeFengshui.report.badgeWenchang') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 星曜方位雷达图 -->
        <div class="ofs-card ofs-pan">
          <h3 class="ofs-pan-title">{{ $t('officeFengshui.report.radarTitle') }}</h3>
          <div class="ofs-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="ofs-radar" xmlns="http://www.w3.org/2000/svg">
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
                  class="ofs-radar-label"
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
            <div class="ofs-radar-legend">
              <span class="ofs-radar-legend-item"><i class="ofs-radar-swatch ofs-radar-swatch-value" />{{ $t('officeFengshui.report.radarValue') }}</span>
              <span class="ofs-radar-legend-item"><i class="ofs-radar-dot ofs-radar-dot-good" />{{ $t('officeFengshui.report.radarLucky') }}</span>
              <span class="ofs-radar-legend-item"><i class="ofs-radar-dot ofs-radar-dot-warn" />{{ $t('officeFengshui.report.radarOminous') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 办公布局建议 ============ -->
      <section class="ofs-section">
        <div class="ofs-card">
          <h3 class="ofs-card-title">{{ $t('officeFengshui.report.layoutTitle') }}</h3>
          <div class="ofs-layout-grid">
            <!-- 办公桌朝向 -->
            <div class="ofs-layout-item">
              <div class="ofs-layout-head">
                <span class="ofs-layout-title">⌘ {{ $t('officeFengshui.report.deskTitle') }}</span>
                <span class="ofs-badge" :class="result.deskAuspicious ? 'ofs-badge-good' : 'ofs-badge-warn'">
                  {{ starName(result.deskStar) }} · {{ levelName(result.deskStarLevel) }}
                </span>
              </div>
              <p class="ofs-layout-body">{{ result.desk.note }}</p>
              <div class="ofs-dir-line">
                <span class="ofs-dir-label">{{ $t('officeFengshui.report.dirBest') }}</span>
                <span v-for="dir in result.desk.bestDirections" :key="'db-' + dir" class="ofs-dir-chip ofs-dir-chip-good">{{ directionName(dir) }}</span>
              </div>
              <div v-if="result.desk.avoidDirections.length" class="ofs-dir-line">
                <span class="ofs-dir-label">{{ $t('officeFengshui.report.dirAvoid') }}</span>
                <span v-for="dir in result.desk.avoidDirections" :key="'da-' + dir" class="ofs-dir-chip ofs-dir-chip-warn">{{ directionName(dir) }}</span>
              </div>
              <p class="ofs-layout-note">{{ $t('officeFengshui.report.deskCurrentNote', { degree: result.deskDirection, star: starName(result.deskStar), level: levelName(result.deskStarLevel) }) }}</p>
            </div>

            <!-- 座位朝向 -->
            <div class="ofs-layout-item">
              <div class="ofs-layout-head">
                <span class="ofs-layout-title">♔ {{ $t('officeFengshui.report.seatTitle') }}</span>
              </div>
              <p class="ofs-layout-body">{{ result.seat.note }}</p>
              <div class="ofs-dir-line">
                <span class="ofs-dir-label">{{ $t('officeFengshui.report.dirBest') }}</span>
                <span v-for="dir in result.seat.bestDirections" :key="'sb-' + dir" class="ofs-dir-chip ofs-dir-chip-good">{{ directionName(dir) }}</span>
              </div>
              <div v-if="result.seat.avoidDirections.length" class="ofs-dir-line">
                <span class="ofs-dir-label">{{ $t('officeFengshui.report.dirAvoid') }}</span>
                <span v-for="dir in result.seat.avoidDirections" :key="'sa-' + dir" class="ofs-dir-chip ofs-dir-chip-warn">{{ directionName(dir) }}</span>
              </div>
            </div>

            <!-- 文昌位 -->
            <div class="ofs-layout-item">
              <div class="ofs-layout-head">
                <span class="ofs-layout-title">✎ {{ $t('officeFengshui.report.wenchangTitle') }}</span>
              </div>
              <div v-for="w in result.wenchang" :key="w.type" class="ofs-wenchang-line">
                <span class="ofs-wenchang-type">{{ wenchangTypeName(w.type) }}</span>
                <span class="ofs-wenchang-dir">{{ directionName(w.direction) }}</span>
                <span class="ofs-wenchang-note">{{ w.note }}</span>
              </div>
            </div>

            <!-- 财位 -->
            <div class="ofs-layout-item">
              <div class="ofs-layout-head">
                <span class="ofs-layout-title">◉ {{ $t('officeFengshui.report.wealthTitle') }}</span>
                <span class="ofs-badge ofs-badge-wealth">{{ directionName(result.wealth.direction) }} · {{ starName(result.wealth.star) }}</span>
              </div>
              <p class="ofs-layout-body">{{ result.wealth.note }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八宫数据表 ============ -->
      <section class="ofs-section">
        <div class="ofs-card">
          <h3 class="ofs-card-title">{{ $t('officeFengshui.report.tableTitle') }}</h3>
          <div class="ofs-table-wrap">
            <table class="ofs-table">
              <thead>
                <tr>
                  <th>{{ $t('officeFengshui.report.tablePalace') }}</th>
                  <th>{{ $t('officeFengshui.report.tableDirection') }}</th>
                  <th>{{ $t('officeFengshui.report.tableStar') }}</th>
                  <th>{{ $t('officeFengshui.report.tableLevel') }}</th>
                  <th>{{ $t('officeFengshui.report.tableUse') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="ofs-table-palace">{{ guaName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="ofs-star" :class="p.auspicious ? 'ofs-star-lucky' : 'ofs-star-ominous'">{{ starName(p.star) }}</span></td>
                  <td>
                    <span class="ofs-badge" :class="p.auspicious ? 'ofs-badge-good' : 'ofs-badge-warn'">{{ levelName(p.level) }}</span>
                  </td>
                  <td class="ofs-table-note">{{ $t(`officeFengshui.report.starUse.${starKey(p.star)}`) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 凶方化解建议 ============ -->
      <section class="ofs-section">
        <div class="ofs-card">
          <h3 class="ofs-card-title">{{ $t('officeFengshui.report.remedyTitle') }}</h3>
          <div class="ofs-remedy-grid">
            <div v-for="item in inauspiciousPalaces" :key="item.name" class="ofs-remedy">
              <div class="ofs-remedy-head">
                <span class="ofs-remedy-title">{{ directionName(item.direction) }} · {{ starName(item.star) }}</span>
                <span class="ofs-badge ofs-badge-warn">{{ levelName(item.level) }}</span>
              </div>
              <p class="ofs-remedy-body">
                {{ $t(`officeFengshui.report.remedy.${starKey(item.star)}`, { direction: directionName(item.direction) }) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="ofs-row ofs-ai-row">
        <div class="ofs-card ofs-ai">
          <h3 class="ofs-ai-title"><span class="ofs-ai-no">01</span>{{ $t('officeFengshui.report.secOverview') }}</h3>
          <div class="ofs-ai-body ofs-md" v-html="renderSection(aiSections['宅基与命卦速览'])" />
        </div>
        <div class="ofs-card ofs-ai">
          <h3 class="ofs-ai-title"><span class="ofs-ai-no">02</span>{{ $t('officeFengshui.report.secPalaces') }}</h3>
          <div class="ofs-ai-body ofs-md ofs-md-tiles ofs-md-tiles-dir" v-html="renderSection(aiSections['八宫吉凶一览'])" />
        </div>
      </section>

      <section class="ofs-row ofs-ai-row">
        <div class="ofs-card ofs-ai">
          <h3 class="ofs-ai-title"><span class="ofs-ai-no">03</span>{{ $t('officeFengshui.report.secLayout') }}</h3>
          <div class="ofs-ai-body ofs-md ofs-md-tiles" v-html="renderSection(aiSections['布局建议'])" />
        </div>
        <div class="ofs-card ofs-ai">
          <h3 class="ofs-ai-title"><span class="ofs-ai-no">04</span>{{ $t('officeFengshui.report.secRemedy') }}</h3>
          <div class="ofs-ai-body ofs-md ofs-md-tiles ofs-md-tiles-warn" v-html="renderSection(aiSections['化解与提醒'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="ofs-streaming">
        <span class="ofs-streaming-dot" />
        {{ $t('officeFengshui.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="ofs-error">
        <p>{{ error }}</p>
        <button type="button" class="ofs-retry" @click="$emit('retry')">{{ $t('officeFengshui.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="ofs-foot">
        <span class="ofs-foot-note">ⓘ {{ $t('officeFengshui.disclaimer') }}</span>
        <span class="ofs-seal ofs-seal-foot">{{ $t('officeFengshui.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Gua, Star, PalaceResult } from '~/utils/bazhai'
import type { OfficeFengshuiResult } from '~/utils/office-fengshui'

type CenterCell = { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }
type GridCell = PalaceResult | CenterCell

interface Props {
  result: OfficeFengshuiResult
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

const ROOM_TYPE_KEY: Record<string, string> = {
  office: 'roomOffice', study: 'roomStudy', bedroom: 'roomBedroom', hall: 'roomHall',
}
const OFFICE_USAGE_KEY: Record<string, string> = {
  independent: 'officeUsageIndependent', openPlan: 'officeUsageOpenPlan',
  shared: 'officeUsageShared', homeOffice: 'officeUsageHomeOffice',
}
const roomTypeText = computed(() => t(`officeFengshui.${ROOM_TYPE_KEY[props.result.roomType] ?? 'roomOffice'}`))
const officeUsageText = computed(() => t(`officeFengshui.${OFFICE_USAGE_KEY[props.result.officeUsage] ?? 'officeUsageIndependent'}`))

const genderText = computed(() => (props.result.gender === 'male' ? t('common.male') : t('common.female')))
const birthText = computed(() =>
  `${props.result.birthYear}-${String(props.result.birthMonth).padStart(2, '0')}-${String(props.result.birthDay).padStart(2, '0')}`)
const dongsiMingText = computed(() => t(`officeFengshui.report.dongsi.${DONGSI.includes(props.result.mingGua) ? 'dong' : 'xi'}`))
const dongsiZhaiText = computed(() => t(`officeFengshui.report.dongsi.${DONGSI.includes(zhaiGua.value) ? 'dong' : 'xi'}`))
const matchText = computed(() => t(mingZhaiMatch.value ? 'officeFengshui.report.matchYes' : 'officeFengshui.report.matchNo'))
const verdict = computed(() => t(mingZhaiMatch.value ? 'officeFengshui.report.verdictGood' : 'officeFengshui.report.verdictCaution'))

const titleText = computed(() =>
  t('officeFengshui.report.title', { gua: guaName(props.result.mingGua), dongsi: dongsiMingText.value }))

const subtitleText = computed(() =>
  t('officeFengshui.report.subtitle', { sitting: sittingText.value }))

const sittingText = computed(() =>
  props.result.sittingMountain ? `${props.result.sittingMountain.name}（${guaName(props.result.sittingMountain.palace)}）` : '—')
const facingText = computed(() =>
  props.result.mountain ? `${props.result.mountain.name}（${guaName(props.result.mountain.palace)}）` : '—')

const matchNoteText = computed(() =>
  t(mingZhaiMatch.value ? 'officeFengshui.report.matchNoteYes' : 'officeFengshui.report.matchNoteNo', {
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
  return t(`officeFengshui.palaceNames.${GUA_NAME_KEY[name] ?? 'li'}`)
}
function directionName(dir: string): string {
  return t(`officeFengshui.directions.${DIRECTION_KEY[dir] ?? 'n'}`)
}
function starKey(star: Star): string {
  return STAR_KEY[star]
}
function starName(star: Star): string {
  return t(`officeFengshui.stars.${STAR_KEY[star]}`)
}
function levelName(level: string): string {
  return t(`officeFengshui.report.levels.${LEVEL_KEY[level] ?? 'ji'}`)
}
function wenchangTypeName(type: string): string {
  return type === '本命文昌' ? t('officeFengshui.report.wenchangBenming') : t('officeFengshui.report.wenchangFixed')
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

// 办公桌朝向（人面对的方向）反推其背靠宫位，用于盘上标注
const deskPalaceName = computed<Gua | null>(() => {
  const deskPalace = props.result.palaces.find(p => p.star === props.result.deskStar && p.level === props.result.deskStarLevel)
  return deskPalace?.name ?? null
})

const wenchangDirections = computed(() => props.result.wenchang.map(w => w.direction))

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
  if (cell.name === '中') return 'ofs-cell-center'
  return cell.auspicious ? 'ofs-cell-lucky' : 'ofs-cell-ominous'
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
    return `<p class="ofs-pending">${t('officeFengshui.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.ofs {
  --ofs-bg: #f2ede3;
  --ofs-sheet: #faf6ec;
  --ofs-card: #fffdf6;
  --ofs-ink: #2e2a24;
  --ofs-ink-soft: #55503f;
  --ofs-ink-faint: #8a8272;
  --ofs-line: #d8d0bd;
  --ofs-line-soft: #e6dfcd;
  --ofs-accent: #8c2f26;
  --ofs-accent-soft: #a8512e;
  --ofs-star: #8c6d1f;
  --ofs-green: #4a7c59;
  --ofs-teal: #3d6b6e;
  border-radius: 12px;
  background: var(--ofs-bg);
  padding: 18px;
  color: var(--ofs-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  container-type: inline-size;
}

.ofs-sheet {
  background: var(--ofs-sheet);
  border: 1px solid var(--ofs-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.ofs-head { border-bottom: 2px solid var(--ofs-ink); padding-bottom: 16px; }
.ofs-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ofs-brand { display: flex; align-items: center; gap: 8px; }
.ofs-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--ofs-accent);
  color: var(--ofs-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.ofs-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--ofs-ink-soft); }
.ofs-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--ofs-ink-faint); }
.ofs-verdict { color: var(--ofs-green); font-weight: 600; }
.ofs-verdict-warn { color: var(--ofs-accent); }
.ofs-rating { letter-spacing: 1px; }

.ofs-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.ofs-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--ofs-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.ofs-head-bottom { text-align: center; }
.ofs-meta-line { margin: 2px 0; font-size: 12px; color: var(--ofs-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.ofs-row { display: grid; gap: 14px; margin-top: 16px; }
.ofs-row-top { grid-template-columns: 1fr 2.4fr; }
.ofs-pans { grid-template-columns: 1.2fr 1fr; }
.ofs-ai-row { grid-template-columns: 1fr 1fr; }
.ofs-section { margin-top: 16px; }

.ofs-card {
  background: var(--ofs-card);
  border: 1px solid var(--ofs-line);
  padding: 14px 16px;
  min-width: 0;
}
.ofs-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--ofs-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.ofs-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.ofs-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.ofs-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.ofs-ico { color: var(--ofs-accent-soft); font-size: 12px; }
.ofs-profile-label { color: var(--ofs-ink-faint); min-width: 30px; }
.ofs-profile-value { color: var(--ofs-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.ofs-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ofs-mini { border: 1px dashed var(--ofs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.ofs-mini-wide { grid-column: 1 / -1; }
.ofs-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--ofs-accent-soft); letter-spacing: 1px; }
.ofs-mini-head-warn { color: var(--ofs-accent); }
.ofs-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--ofs-ink-soft); }
.ofs-point { margin-bottom: 7px; }
.ofs-point:last-child { margin-bottom: 0; }
.ofs-point-title { font-size: 12px; font-weight: 700; color: var(--ofs-ink); display: flex; gap: 5px; align-items: baseline; }
.ofs-point-title-warn { color: var(--ofs-accent); }
.ofs-point-ico { font-size: 10px; color: var(--ofs-star); }
.ofs-point-desc { font-size: 11px; color: var(--ofs-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 星曜统计卡 ---------- */
.ofs-core-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 2fr; gap: 10px; }
.ofs-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.ofs-core-chart { grid-column: span 1; }
.ofs-core-label { font-size: 11px; color: var(--ofs-ink-faint); letter-spacing: 1px; }
.ofs-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.ofs-core-value-text { font-size: 20px; }
.ofs-core-value-good { color: var(--ofs-star); }
.ofs-core-value-warn { color: var(--ofs-accent); }
.ofs-core-sub { font-size: 10px; color: var(--ofs-ink-faint); }

.ofs-bars { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.ofs-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.ofs-bar-name { width: 24px; flex-shrink: 0; font-weight: 700; }
.ofs-bar-name-good { color: var(--ofs-star); }
.ofs-bar-name-warn { color: var(--ofs-accent); }
.ofs-bar-wrap { flex: 1; height: 6px; background: var(--ofs-line-soft); }
.ofs-bar { display: block; height: 100%; }
.ofs-bar-good { background: var(--ofs-star); }
.ofs-bar-warn { background: var(--ofs-accent); }
.ofs-bar-dir { width: 22px; text-align: right; color: var(--ofs-ink-faint); flex-shrink: 0; }

/* ---------- 八宫吉凶盘 ---------- */
.ofs-pan { padding: 12px; }
.ofs-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.ofs-pan-legend { display: block; font-size: 9px; color: var(--ofs-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.ofs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.ofs-cell {
  border: 1px solid var(--ofs-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--ofs-card);
}
.ofs-cell-lucky { border-color: var(--ofs-star); background: rgba(140, 109, 31, 0.05); }
.ofs-cell-ominous { border-color: rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.04); }
.ofs-cell-center { background: var(--ofs-line-soft); }
.ofs-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--ofs-ink-faint); }
.ofs-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.ofs-star { font-size: 17px; font-weight: 700; line-height: 1.2; }
.ofs-star-plain { color: var(--ofs-ink); }
.ofs-star-lucky { color: var(--ofs-star); }
.ofs-star-ominous { color: var(--ofs-accent); }
.ofs-cell-level { font-size: 10px; }
.ofs-level-good { color: var(--ofs-star); }
.ofs-level-warn { color: var(--ofs-accent); }
.ofs-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; min-height: 14px; }
.ofs-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.ofs-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--ofs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.ofs-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--ofs-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.ofs-badge-zhai { background: rgba(140, 109, 31, 0.12); color: var(--ofs-star); border: 1px solid rgba(140, 109, 31, 0.4); }
.ofs-badge-desk { background: rgba(61, 107, 110, 0.12); color: var(--ofs-teal); border: 1px solid rgba(61, 107, 110, 0.4); }
.ofs-badge-wealth { background: rgba(140, 109, 31, 0.16); color: var(--ofs-star); border: 1px solid rgba(140, 109, 31, 0.5); }
.ofs-badge-wenchang { background: rgba(61, 107, 110, 0.08); color: var(--ofs-teal); border: 1px dashed rgba(61, 107, 110, 0.45); }

/* ---------- 雷达图 ---------- */
.ofs-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ofs-radar { width: 100%; max-width: 320px; }
.ofs-radar-label { font-size: 8.5px; fill: var(--ofs-ink-soft); font-weight: 700; }
.ofs-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--ofs-ink-faint); flex-wrap: wrap; justify-content: center; }
.ofs-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.ofs-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.ofs-radar-swatch-value { background: rgba(140, 109, 31, 0.5); }
.ofs-radar-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.ofs-radar-dot-good { background: #4a7c59; }
.ofs-radar-dot-warn { background: #8c2f26; }

/* ---------- 办公布局建议 ---------- */
.ofs-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ofs-layout-item { border: 1px dashed var(--ofs-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.ofs-layout-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.ofs-layout-title { font-size: 12px; font-weight: 700; color: var(--ofs-ink); letter-spacing: 1px; }
.ofs-layout-body { margin: 0 0 8px; font-size: 11px; line-height: 1.7; color: var(--ofs-ink-soft); }
.ofs-layout-note { margin: 8px 0 0; font-size: 10.5px; line-height: 1.6; color: var(--ofs-ink-faint); border-top: 1px dashed var(--ofs-line-soft); padding-top: 6px; }
.ofs-dir-line { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.ofs-dir-label { font-size: 10px; color: var(--ofs-ink-faint); letter-spacing: 1px; }
.ofs-dir-chip {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.ofs-dir-chip-good { background: rgba(74, 124, 89, 0.12); color: var(--ofs-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.ofs-dir-chip-warn { background: rgba(140, 47, 38, 0.1); color: var(--ofs-accent); border: 1px solid rgba(140, 47, 38, 0.3); }
.ofs-wenchang-line { display: flex; align-items: baseline; gap: 6px; font-size: 11px; margin-bottom: 7px; flex-wrap: wrap; }
.ofs-wenchang-line:last-child { margin-bottom: 0; }
.ofs-wenchang-type { font-weight: 700; color: var(--ofs-ink); letter-spacing: 1px; flex-shrink: 0; }
.ofs-wenchang-dir { color: var(--ofs-teal); font-weight: 700; flex-shrink: 0; }
.ofs-wenchang-note { color: var(--ofs-ink-faint); font-size: 10.5px; line-height: 1.6; }

/* ---------- 八宫数据表 ---------- */
.ofs-table-wrap { overflow-x: auto; }
.ofs-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.ofs-table th, .ofs-table td {
  border: 1px solid var(--ofs-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.ofs-table thead th {
  background: var(--ofs-line-soft);
  font-weight: 700;
  color: var(--ofs-ink);
  letter-spacing: 1px;
}
.ofs-table td { color: var(--ofs-ink-soft); }
.ofs-table-palace { font-weight: 700; color: var(--ofs-ink); }
.ofs-table .ofs-star { font-size: 14px; }
.ofs-table .ofs-badge { font-size: 9.5px; }
.ofs-table-note { text-align: left; font-size: 10.5px; }

/* ---------- 凶方化解建议 ---------- */
.ofs-remedy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ofs-remedy { border: 1px dashed rgba(140, 47, 38, 0.35); background: rgba(140, 47, 38, 0.03); padding: 10px 12px; }
.ofs-remedy-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.ofs-remedy-title { font-size: 12px; font-weight: 700; color: var(--ofs-accent); letter-spacing: 1px; }
.ofs-remedy-body { margin: 0; font-size: 11px; line-height: 1.7; color: var(--ofs-ink-soft); }

/* ---------- AI 章节 ---------- */
.ofs-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--ofs-line-soft);
  padding-bottom: 8px;
}
.ofs-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--ofs-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.ofs-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--ofs-ink-soft); }

.ofs-md :deep(p) { margin: 0 0 0.7em; }
.ofs-md :deep(p:last-child) { margin-bottom: 0; }
.ofs-md :deep(strong) { color: var(--ofs-ink); font-weight: 700; }
.ofs-md :deep(ul), .ofs-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.ofs-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.ofs-md :deep(h3), .ofs-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--ofs-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.ofs-md { overflow-x: auto; }
.ofs-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--ofs-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.ofs-md :deep(.ofs-pending), .ofs-pending { color: var(--ofs-ink-faint); font-style: italic; }

/* ---------- AI 小格卡片（02/03/04 区块） ---------- */
/* 提示词约束了「- **标题**：内容」的列表格式，这里把每个列表项渲染成小格子卡片 */
.ofs-md-tiles :deep(ul), .ofs-md-tiles :deep(ol) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ofs-md-tiles :deep(li) {
  margin: 0;
  border: 1px solid var(--ofs-line-soft);
  border-left: 3px solid var(--ofs-star);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  color: var(--ofs-ink-soft);
}
.ofs-md-tiles :deep(li strong) {
  display: block;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--ofs-ink);
  margin-bottom: 3px;
}
/* 02 八宫一览：八条正好铺 2 列 x 4 行 */
.ofs-md-tiles-dir :deep(li) { border-left-color: var(--ofs-accent-soft); }
/* 04 化解提醒：凶方用朱砂色强调 */
.ofs-md-tiles-warn :deep(li) { border-left-color: var(--ofs-accent); }
.ofs-md-tiles-warn :deep(li strong) { color: var(--ofs-accent); }

.ofs-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--ofs-ink-faint); letter-spacing: 1px;
}
.ofs-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ofs-accent);
  animation: ofs-pulse 1s ease-in-out infinite;
}
@keyframes ofs-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.ofs-error { margin-top: 14px; text-align: center; color: var(--ofs-accent); font-size: 12px; }
.ofs-retry {
  margin-top: 8px;
  border: 1px solid var(--ofs-accent);
  background: transparent;
  color: var(--ofs-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.ofs-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.ofs-foot {
  margin-top: 18px;
  border-top: 1px solid var(--ofs-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.ofs-foot-note { font-size: 10px; color: var(--ofs-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.ofs-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ----------
   截图目标固定 1080px 宽但视口可能是手机，媒体查询不可靠，
   所以 desktop 布局兜底 + container query 覆盖窄容器 */
@container (max-width: 1100px) {
  .ofs-row-top { grid-template-columns: 1fr; }
  .ofs-pans { grid-template-columns: 1fr; }
  .ofs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .ofs-core-chart { grid-column: 1 / -1; }
}

@container (max-width: 720px) {
  .ofs { padding: 8px; }
  .ofs-sheet { padding: 16px 12px; }
  .ofs-ai-row { grid-template-columns: 1fr; }
  .ofs-overview-grid { grid-template-columns: 1fr; }
  .ofs-layout-grid { grid-template-columns: 1fr; }
  .ofs-remedy-grid { grid-template-columns: 1fr; }
  .ofs-md-tiles :deep(ul), .ofs-md-tiles :deep(ol) { grid-template-columns: 1fr; }
  .ofs-title { font-size: 20px; letter-spacing: 2px; }
  .ofs-core-grid { grid-template-columns: repeat(2, 1fr); }
  .ofs-core-chart { grid-column: 1 / -1; }

  /* 八宫盘：缩小内容，保住 3x3 结构 */
  .ofs-pan { padding: 8px; }
  .ofs-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .ofs-star { font-size: 13px; }
  .ofs-cell-head { font-size: 8px; }
  .ofs-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .ofs-table { min-width: 520px; }
}
</style>
