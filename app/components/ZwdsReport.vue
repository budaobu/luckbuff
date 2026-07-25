<template>
  <div class="zwr">
    <div class="zwr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zwr-head">
        <div class="zwr-head-top">
          <div class="zwr-brand">
            <div class="zwr-seal">{{ $t('zwdsReport.seal') }}</div>
            <span class="zwr-brand-name">{{ $t('zwdsReport.brandName') }}</span>
          </div>
          <div class="zwr-head-right">
            <span class="zwr-time">{{ $t('zwdsReport.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zwr-verdict">✓ {{ ratingLabel(currentLiunian.rating) }} · {{ currentLiunian.yearGanZhi }}</span>
          </div>
        </div>

        <h1 class="zwr-title">{{ titleText }}</h1>
        <p class="zwr-subtitle">{{ subtitleText }}</p>

        <div class="zwr-head-bottom">
          <p class="zwr-meta-line">{{ mingZhuShenZhu }}</p>
          <p class="zwr-meta-line">{{ yinyangJu }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 命格速览 ============ -->
      <section class="zwr-row zwr-row-top">
        <div class="zwr-card zwr-profile">
          <div class="zwr-profile-line">
            <span class="zwr-ico">☀</span>
            <span class="zwr-profile-label">{{ $t('zwdsReport.solarLabel') }}</span>
            <span class="zwr-profile-value">{{ solarText }}</span>
          </div>
          <div class="zwr-profile-line">
            <span class="zwr-ico">☽</span>
            <span class="zwr-profile-label">{{ $t('zwdsReport.lunarLabel') }}</span>
            <span class="zwr-profile-value">{{ lunarText }}</span>
          </div>
          <div class="zwr-profile-line">
            <span class="zwr-ico">⚥</span>
            <span class="zwr-profile-label">{{ $t('zwdsReport.genderLabel') }}</span>
            <span class="zwr-profile-value">{{ genderText }}</span>
          </div>
          <div class="zwr-profile-line">
            <span class="zwr-ico">♒</span>
            <span class="zwr-profile-label">{{ $t('zwdsReport.ageLabel') }}</span>
            <span class="zwr-profile-value">{{ ageText }}</span>
          </div>
        </div>

        <div class="zwr-card">
          <h3 class="zwr-card-title">{{ $t('zwdsReport.overviewTitle') }}</h3>
          <div class="zwr-yinzheng-grid">
            <div class="zwr-mini">
              <h4 class="zwr-mini-head">{{ $t('zwdsReport.mingGongTitle') }}</h4>
              <p class="zwr-mini-body">{{ mingThemeText }}</p>
            </div>
            <div class="zwr-mini">
              <h4 class="zwr-mini-head">{{ $t('zwdsReport.shenGongTitle') }}</h4>
              <p class="zwr-mini-body">{{ shenThemeText }}</p>
            </div>
            <div class="zwr-mini">
              <h4 class="zwr-mini-head zwr-mini-head-star">★ {{ $t('zwdsReport.advantagesTitle') }}</h4>
              <p class="zwr-mini-body">{{ advantagesText }}</p>
            </div>
            <div class="zwr-mini">
              <h4 class="zwr-mini-head zwr-mini-head-warn">⊘ {{ $t('zwdsReport.concernsTitle') }}</h4>
              <p class="zwr-mini-body">{{ concernsText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 命盘核心数据 ============ -->
      <section class="zwr-section">
        <h3 class="zwr-section-title">{{ $t('zwdsReport.coreDataTitle') }}</h3>
        <div class="zwr-core-grid">
          <div class="zwr-card zwr-core">
            <div class="zwr-core-label">{{ $t('zwdsReport.wuxingJuLabel') }}</div>
            <div class="zwr-core-value">{{ chart.wuxingJu }}<span class="zwr-core-unit">{{ $t('zwdsPan.wuxingBureau') }}</span></div>
            <div class="zwr-core-sub">{{ $t('zwdsReport.coreSubMing') }}</div>
          </div>
          <div class="zwr-card zwr-core">
            <div class="zwr-core-label">{{ $t('zwdsReport.mingGongLabel') }}</div>
            <div class="zwr-core-value">{{ chart.mingGong.zhi }}<span class="zwr-core-unit">宫</span></div>
            <div class="zwr-core-sub">{{ mingStarsText }}</div>
          </div>
          <div class="zwr-card zwr-core">
            <div class="zwr-core-label">{{ $t('zwdsReport.shenGongLabel') }}</div>
            <div class="zwr-core-value">{{ chart.shenGong.zhi }}<span class="zwr-core-unit">宫</span></div>
            <div class="zwr-core-sub">{{ shenStarsText }}</div>
          </div>
          <div class="zwr-card zwr-core">
            <div class="zwr-core-label">{{ $t('zwdsReport.sihuaStatTitle') }}</div>
            <div class="zwr-sihua-stats">
              <div v-for="row in sihuaStats" :key="row.type" class="zwr-sihua-row">
                <span class="zwr-sihua-chip" :class="'zwr-sihua-' + row.type">{{ row.type }}</span>
                <span class="zwr-sihua-bar-wrap"><span class="zwr-sihua-bar" :class="'zwr-sihua-bar-' + row.type" :style="{ width: row.pct + '%' }" /></span>
                <span class="zwr-sihua-count">{{ row.count }}</span>
              </div>
            </div>
            <div class="zwr-core-sub">{{ $t('zwdsReport.sihuaStatSub', { total: benmingSiHua.length }) }}</div>
          </div>
          <div class="zwr-card zwr-core">
            <div class="zwr-core-label">{{ $t('zwdsReport.currentDaxianLabel') }}</div>
            <template v-if="chart.currentDaXian">
              <div class="zwr-core-value zwr-core-value-sm">{{ chart.currentDaXian.gongName }}<span class="zwr-core-unit">宫</span></div>
              <div class="zwr-core-sub">
                {{ $t('zwdsReport.daxianRange', { start: chart.currentDaXian.ageRange[0], end: chart.currentDaXian.ageRange[1] }) }}
              </div>
            </template>
            <div v-else class="zwr-core-value zwr-core-value-sm">{{ $t('zwdsReport.noDaxian') }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 命盘 ============ -->
      <section class="zwr-row zwr-pans">
        <div class="zwr-card zwr-pan">
          <h3 class="zwr-pan-title">
            {{ $t('zwdsReport.panTitle') }}
            <span class="zwr-pan-legend">{{ sihuaLegend }}</span>
          </h3>
          <div class="zwr-zwds-grid">
            <template v-for="pos in panPositions" :key="pos.key">
              <div v-if="pos.isCenter" class="zwr-zwds-center">
                <div class="zwr-zwds-center-title">{{ $t('zwdsReport.centerTitle') }}</div>
                <div class="zwr-zwds-center-line">{{ yinyangJu }}</div>
                <div class="zwr-zwds-center-line">{{ mingZhuShenZhu }}</div>
                <div class="zwr-zwds-center-pillars">
                  <span>{{ chart.yearGan }}<i>{{ chart.yearZhi }}</i></span>
                </div>
                <div v-if="!hasHour" class="zwr-zwds-center-warn">⚠ {{ $t('zwdsReport.unknownHour') }}</div>
              </div>
              <div
                v-else
                class="zwr-gong"
                :class="{ 'zwr-gong-ming': pos.gong?.isMing, 'zwr-gong-daxian': pos.gong?.isCurrentDaXian }"
              >
                <div class="zwr-gong-head">
                  <span class="zwr-gong-zhi">{{ pos.zhi }}</span>
                  <span class="zwr-gong-name">{{ pos.gong?.name }}宫</span>
                  <span v-if="pos.gong?.isMing" class="zwr-gong-tag">{{ $t('zwdsReport.mingTag') }}</span>
                  <span v-else-if="pos.gong?.isShen" class="zwr-gong-tag zwr-gong-tag-shen">{{ $t('zwdsReport.shenTag') }}</span>
                  <span class="zwr-gong-gan">{{ gongGan(pos.zhi!) }}</span>
                </div>
                <div class="zwr-gong-stars">
                  <span
                    v-for="star in pos.gong?.mainStars"
                    :key="star"
                    class="zwr-star-main"
                  >{{ star }}<em v-for="s in starSihua(pos.gong!, star)" :key="s" class="zwr-sihua" :class="'zwr-sihua-' + s">{{ s }}</em></span>
                  <span v-if="!pos.gong?.mainStars.length" class="zwr-star-none">{{ $t('zwdsReport.noMainStar') }}</span>
                </div>
                <div class="zwr-gong-aux">
                  <span v-for="star in pos.gong?.auxStars" :key="star" class="zwr-star-aux">{{ star }}</span>
                </div>
                <div class="zwr-gong-daxian">{{ gongDaXian(pos.zhi!) }}</div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-06（3×2 网格） ============ -->
      <section class="zwr-row zwr-ai-row">
        <div v-for="(n, i) in 3" :key="n" class="zwr-card zwr-ai">
          <h3 class="zwr-ai-title"><span class="zwr-ai-no">0{{ n }}</span>{{ aiTitle(i) }}</h3>
          <div class="zwr-ai-body zwr-md" v-html="renderSection(aiSections[aiTitle(i)])" />
        </div>
      </section>

      <section class="zwr-row zwr-ai-row">
        <div v-for="(n, i) in 3" :key="n" class="zwr-card zwr-ai">
          <h3 class="zwr-ai-title"><span class="zwr-ai-no">0{{ n + 3 }}</span>{{ aiTitle(i + 3) }}</h3>
          <div class="zwr-ai-body zwr-md" v-html="renderSection(aiSections[aiTitle(i + 3)])" />
        </div>
      </section>

      <!-- ============ 十二宫详览 ============ -->
      <section class="zwr-section">
        <div class="zwr-card zwr-ai">
          <h3 class="zwr-ai-title"><span class="zwr-ai-no">07</span>{{ $t('zwdsReport.gongTableTitle') }}</h3>
          <div class="zwr-table-wrap">
            <table class="zwr-table">
              <thead>
                <tr>
                  <th>{{ $t('zwdsReport.colGong') }}</th>
                  <th>{{ $t('zwdsReport.colZhi') }}</th>
                  <th>{{ $t('zwdsReport.colMainStar') }}</th>
                  <th>{{ $t('zwdsReport.colAuxStar') }}</th>
                  <th>{{ $t('zwdsReport.colSihua') }}</th>
                  <th>{{ $t('zwdsReport.colBrief') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in benmingAnalysis"
                  :key="item.gong.name"
                  :class="{ 'zwr-tr-ming': item.isMing }"
                >
                  <th class="zwr-table-rowhead">
                    {{ item.gong.name }}宫
                    <span v-if="item.isMing" class="zwr-gong-tag">{{ $t('zwdsReport.mingTag') }}</span>
                    <span v-else-if="item.isShen" class="zwr-gong-tag zwr-gong-tag-shen">{{ $t('zwdsReport.shenTag') }}</span>
                  </th>
                  <td>{{ item.gong.zhi }}</td>
                  <td>{{ item.gong.mainStars.join('、') || $t('zwdsReport.noMainStar') }}</td>
                  <td>{{ item.gong.auxStars.join('、') || '—' }}</td>
                  <td>
                    <span
                      v-for="s in item.gong.siHua"
                      :key="s.star + s.type"
                      class="zwr-sihua zwr-sihua-inline"
                      :class="'zwr-sihua-' + s.type"
                    >{{ s.type }}</span>
                    <span v-if="!item.gong.siHua.length">—</span>
                  </td>
                  <td class="zwr-td-brief">{{ item.brief }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 大限走势 ============ -->
      <section class="zwr-section">
        <div class="zwr-card zwr-ai">
          <h3 class="zwr-ai-title"><span class="zwr-ai-no">08</span>{{ $t('zwdsReport.daxianTitle') }}</h3>

          <!-- 大限选择器 -->
          <div class="zwr-daxian-picker">
            <button
              v-for="(dx, idx) in chart.daXians"
              :key="dx.index"
              type="button"
              class="zwr-daxian-btn"
              :class="{
                'zwr-daxian-btn-active': selectedDaxianIndex === idx,
                'zwr-daxian-btn-current': dx.ageRange[0] <= chart.currentAge && dx.ageRange[1] >= chart.currentAge,
              }"
              @click="selectedDaxianIndex = idx"
            >
              <span class="zwr-daxian-btn-no">第{{ dx.index }}限</span>
              <span class="zwr-daxian-btn-age">{{ dx.ageRange[0] }}-{{ dx.ageRange[1] }}岁</span>
            </button>
          </div>

          <template v-if="currentDaxianAnalysis">
            <!-- 概览 -->
            <p class="zwr-daxian-overview">
              <span v-if="currentDaxianAnalysis.isCurrent" class="zwr-current-badge">{{ $t('zwdsReport.currentBadge') }}</span>
              {{ currentDaxianAnalysis.overview }}
            </p>

            <!-- 时间轴图表 -->
            <div class="zwr-daxian-chart">
              <div
                v-for="row in daxianChartRows"
                :key="row.dim"
                class="zwr-daxian-chart-row"
              >
                <span class="zwr-daxian-chart-dim">{{ row.dim }}</span>
                <div class="zwr-daxian-chart-cells">
                  <span
                    v-for="(cell, i) in row.cells"
                    :key="i"
                    class="zwr-daxian-cell"
                    :class="['zwr-trend-' + cell.trend, { 'zwr-daxian-cell-current': cell.isCurrent, 'zwr-daxian-cell-active': i === selectedDaxianIndex }]"
                    @click="selectedDaxianIndex = i"
                  >{{ trendLabel(cell.trend) }}</span>
                </div>
              </div>
              <div class="zwr-daxian-chart-axis">
                <span class="zwr-daxian-chart-dim" />
                <div class="zwr-daxian-chart-cells">
                  <span v-for="(dx, i) in chart.daXians" :key="i" class="zwr-daxian-axis-label">{{ dx.ageRange[0] }}</span>
                </div>
              </div>
            </div>

            <!-- 选中大限四维走势 -->
            <div class="zwr-trend-grid">
              <div
                v-for="dim in currentDaxianAnalysis.dimensions"
                :key="dim.name"
                class="zwr-trend-card"
              >
                <div class="zwr-trend-head">
                  <span class="zwr-trend-name">{{ dim.name }}</span>
                  <span class="zwr-trend-badge" :class="'zwr-trend-badge-' + dim.trend">{{ trendLabel(dim.trend) }}</span>
                </div>
                <p class="zwr-trend-text">{{ dim.text }}</p>
              </div>
            </div>

            <!-- 时间节点 -->
            <div class="zwr-timehint">
              <span class="zwr-timehint-label">{{ $t('zwdsAnalysis.timeNodeTitle') }}</span>
              {{ currentDaxianAnalysis.timeHint }}
            </div>
          </template>
        </div>
      </section>

      <!-- ============ 流年详析 ============ -->
      <section class="zwr-section">
        <div class="zwr-card zwr-ai">
          <h3 class="zwr-ai-title"><span class="zwr-ai-no">09</span>{{ $t('zwdsReport.liunianTitle') }}</h3>

          <!-- 年份选择 -->
          <div class="zwr-year-picker">
            <button
              v-for="y in yearOptions"
              :key="y"
              type="button"
              class="zwr-year-btn"
              :class="{
                'zwr-year-btn-active': selectedYear === y,
                'zwr-year-btn-current': y === currentYear,
              }"
              @click="selectedYear = y"
            >{{ y }}</button>
          </div>

          <template v-if="currentLiunianSelected">
            <!-- 概览 + 评级 -->
            <div class="zwr-liunian-top">
              <div class="zwr-liunian-info">
                <div class="zwr-liunian-line">
                  <span class="zwr-liunian-label">{{ $t('zwdsAnalysis.currentYearLabel') }}</span>
                  <span class="zwr-liunian-value">{{ currentLiunianSelected.yearGanZhi }}</span>
                </div>
                <div class="zwr-liunian-line">
                  <span class="zwr-liunian-label">{{ $t('zwdsAnalysis.taisuiEntryLabel') }}</span>
                  <span class="zwr-liunian-value">{{ currentLiunianSelected.taiSuiGong }}宫（{{ currentLiunianSelected.taiSuiZhi }}）</span>
                </div>
                <div class="zwr-liunian-line">
                  <span class="zwr-liunian-label">{{ $t('zwdsReport.liunianSihuaLabel') }}</span>
                  <span class="zwr-liunian-sihua">
                    <span
                      v-for="s in currentLiunianSelected.liuNianSiHua"
                      :key="s.star + s.type"
                      class="zwr-sihua-chip"
                      :class="'zwr-sihua-' + s.type"
                    >{{ s.star }}化{{ s.type }}</span>
                  </span>
                </div>
                <p class="zwr-liunian-summary">{{ currentLiunianSelected.summary }}</p>
              </div>
              <div class="zwr-rating-box" :class="'zwr-rating-' + currentLiunianSelected.rating">
                <div class="zwr-rating-label">{{ ratingLabel(currentLiunianSelected.rating) }}</div>
                <div class="zwr-rating-text">{{ ratingText(currentLiunianSelected.rating) }}</div>
              </div>
            </div>

            <!-- 四维当年 -->
            <div class="zwr-trend-grid">
              <div
                v-for="dim in currentLiunianSelected.dimensions"
                :key="dim.name"
                class="zwr-trend-card"
              >
                <div class="zwr-trend-head">
                  <span class="zwr-trend-name">{{ dim.name }}</span>
                </div>
                <p class="zwr-trend-text">{{ dim.text }}</p>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zwr-streaming">
        <span class="zwr-streaming-dot" />
        {{ $t('zwdsReport.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zwr-error">
        <p>{{ error }}</p>
        <button type="button" class="zwr-retry" @click="$emit('retry')">{{ $t('zwds.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zwr-foot">
        <span class="zwr-foot-note">ⓘ {{ $t('zwdsReport.footerNote') }}</span>
        <span class="zwr-seal zwr-seal-foot">{{ $t('zwdsReport.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ZwdsChart, ZwdsGong, ZwdsDaXian } from '~/types/zwds'
import type { TianGan, DiZhi } from '~/types/user'
import {
  generateBenmingAnalysis,
  getDaxianAnalysis,
  getLiunianAnalysis,
  type DaxianAnalysis,
  type LiunianAnalysis,
} from '~/utils/zwds/analysis'

interface Props {
  chart: ZwdsChart
  aiContent: string
  streaming: boolean
  error: string | null
  birthDate: string
  birthHour?: DiZhi
  gender: 'male' | 'female'
  name?: string
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

const birthYear = computed(() => Number(props.birthDate.split('-')[0] || 0))

const ageText = computed(() => {
  const age = props.chart.currentAge || (new Date().getFullYear() - birthYear.value)
  return t('zwdsReport.ageValue', { age, year: new Date().getFullYear() })
})

const genderText = computed(() =>
  props.gender === 'male' ? t('zwdsReport.genderMale') : t('zwdsReport.genderFemale'))

const solarText = computed(() => {
  const h = props.birthHour ? t('zwdsReport.hourSuffix', { hour: props.birthHour }) : ''
  return `${props.birthDate}${h}`
})

const lunarText = computed(() =>
  t('zwdsReport.lunarValue', {
    year: birthYear.value,
    month: props.chart.lunarMonth,
    day: props.chart.lunarDay,
  }))

const hasHour = computed(() => !!props.birthHour)

/** 命宫主星 → 命主星 */
const MING_ZHU_MAP: Record<string, string> = {
  子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲', 辰: '廉贞', 巳: '武曲',
  午: '破军', 未: '武曲', 申: '廉贞', 酉: '文曲', 戌: '禄存', 亥: '巨门',
}

/** 生年支 → 身主星 */
const SHEN_ZHU_MAP: Record<string, string> = {
  子: '火星', 丑: '天相', 寅: '天梁', 卯: '天同', 辰: '文昌', 巳: '天机',
  午: '火星', 未: '天相', 申: '天梁', 酉: '天同', 戌: '文昌', 亥: '天机',
}

const mingZhuShenZhu = computed(() => t('zwdsReport.mingShenZhu', {
  ming: MING_ZHU_MAP[props.chart.mingGong.zhi] ?? '—',
  shen: SHEN_ZHU_MAP[props.chart.yearZhi] ?? '—',
}))

const YANG_GAN: TianGan[] = ['甲', '丙', '戊', '庚', '壬']
const genderYinyang = computed(() => {
  const yang = YANG_GAN.includes(props.chart.yearGan)
  const key = props.gender === 'male'
    ? (yang ? 'yyYangMale' : 'yyYinMale')
    : (yang ? 'yyYangFemale' : 'yyYinFemale')
  return t(`zwdsReport.${key}`)
})

const yinyangJu = computed(() => t('zwdsReport.yinyangJuValue', {
  yy: genderYinyang.value,
  ju: props.chart.wuxingJu,
}))

function getJieDuiZhi(zhi: DiZhi): DiZhi {
  const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
  const idx = ZHI_ORDER.indexOf(zhi)
  return ZHI_ORDER[(idx + 6) % 12]!
}

function gongStarsText(gong: ZwdsGong): string {
  return gong.mainStars.length > 0
    ? gong.mainStars.join('、')
    : `${t('zwdsAnalysis.borrowLabel')}${getJieDuiZhi(gong.zhi)}`
}

const mingStarsText = computed(() => gongStarsText(props.chart.mingGong))
const shenStarsText = computed(() => gongStarsText(props.chart.shenGong))

const titleText = computed(() => {
  const mainStar = props.chart.mingGong.mainStars[0]
  return mainStar
    ? t('zwdsReport.titleWithStar', { star: mainStar, ju: props.chart.wuxingJu })
    : t('zwdsReport.titleNoStar', { ju: props.chart.wuxingJu })
})

const subtitleText = computed(() => {
  const c = props.chart.mingGong
  return t('zwdsReport.subtitleValue', {
    zhi: c.zhi,
    stars: mingStarsText.value,
    shenZhi: props.chart.shenGong.zhi,
  })
})

/* ---------- 命格速览（本命静态 + AI 综合建议） ---------- */

const benmingSiHua = computed(() => {
  const result: { type: string; star: string; gongName: string }[] = []
  for (const g of props.chart.gongs) {
    for (const s of g.siHua) {
      result.push({ type: s.type, star: s.star, gongName: g.name })
    }
  }
  return result
})

const mingThemeText = computed(() => {
  const c = props.chart.mingGong
  return t('zwdsReport.mingThemeValue', {
    zhi: c.zhi,
    stars: mingStarsText.value,
    ju: props.chart.wuxingJu,
  })
})

const shenThemeText = computed(() => {
  const c = props.chart.shenGong
  return t('zwdsReport.shenThemeValue', {
    zhi: c.zhi,
    stars: shenStarsText.value,
  })
})

const sihuaChipsText = computed(() => {
  if (!benmingSiHua.value.length) return t('zwdsAnalysis.sihuaPeace')
  return benmingSiHua.value.map(s => `${s.star}化${s.type}→${s.gongName}宫`).join('；')
})

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

function findSection(re: RegExp): string {
  const entry = Object.entries(aiSections.value).find(([k]) => re.test(k))
  return entry?.[1] ?? ''
}

const pendingText = computed(() => t('zwdsReport.pending'))

const adviceLines = computed(() => {
  const content = findSection(/综合建议/)
  if (!content) return []
  return content
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)
})

const advantagesText = computed(() => adviceLines.value[0] || t('zwdsReport.advFallback', { sihua: sihuaChipsText.value }))
const concernsText = computed(() => adviceLines.value[1] || t('zwdsReport.concernFallback', { sihua: sihuaChipsText.value }))

/* ---------- 四化统计 ---------- */

const SIHUA_TYPES = ['禄', '权', '科', '忌'] as const

const sihuaStats = computed(() => {
  const counts = SIHUA_TYPES.map(type => ({
    type,
    count: benmingSiHua.value.filter(s => s.type === type).length,
  }))
  const max = Math.max(...counts.map(c => c.count), 1)
  return counts.map(c => ({ ...c, pct: Math.round((c.count / max) * 100) }))
})

/* ---------- 命盘 ---------- */

const GAN_LIST: TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

const panLayout = [
  { key: '巳', zhi: '巳' as DiZhi }, { key: '午', zhi: '午' as DiZhi },
  { key: '未', zhi: '未' as DiZhi }, { key: '申', zhi: '申' as DiZhi },
  { key: '辰', zhi: '辰' as DiZhi }, { key: 'center', isCenter: true },
  { key: '酉', zhi: '酉' as DiZhi }, { key: '卯', zhi: '卯' as DiZhi },
  { key: '戌', zhi: '戌' as DiZhi }, { key: '寅', zhi: '寅' as DiZhi },
  { key: '丑', zhi: '丑' as DiZhi }, { key: '子', zhi: '子' as DiZhi },
  { key: '亥', zhi: '亥' as DiZhi },
]
const panPositions = computed(() => panLayout.map(pos => {
  if ('isCenter' in pos && pos.isCenter) return { key: pos.key, isCenter: true as const }
  const gong = props.chart.gongs.find(g => g.zhi === pos.zhi)
  return { key: pos.key, zhi: pos.zhi as DiZhi, gong: gong || null }
}))

/** 宫干：五虎遁，由年干起寅宫 */
const YIN_GAN_BY_YEAR_GAN: Record<string, TianGan> = {
  甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲',
}
function gongGan(zhi: DiZhi): TianGan {
  const yinGan = YIN_GAN_BY_YEAR_GAN[props.chart.yearGan] ?? '丙'
  const startIdx = GAN_LIST.indexOf(yinGan)
  const offset = ZHI_ORDER.indexOf(zhi)
  return GAN_LIST[(startIdx + offset) % 10]!
}

function starSihua(gong: ZwdsGong, star: string): string[] {
  return gong.siHua.filter(s => s.star === star).map(s => s.type)
}

function gongDaXian(zhi: DiZhi): string {
  const dx: ZwdsDaXian | undefined = props.chart.daXians.find(d => d.gongZhi === zhi)
  return dx ? `${t('zwdsReport.daxianLabel')} ${dx.ageRange[0]}-${dx.ageRange[1]}` : ''
}

const sihuaLegend = computed(() => {
  const parts = benmingSiHua.value.map(s => `${s.star}${s.type}`)
  return parts.length ? `${t('zwdsReport.sihuaPrefix')}${parts.join(' / ')}` : ''
})

/* ---------- 十二宫详览 ---------- */

const benmingAnalysis = computed(() => generateBenmingAnalysis(props.chart))

/* ---------- AI 章节 ---------- */

const aiKeys = ['命格总览', '命宫解读', '事业与财帛', '感情与婚姻', '健康与抗压', '综合建议'] as const

function aiTitle(i: number): string {
  const key = aiKeys[i] ?? ''
  // AI 输出双语标题时（"命格总览 / ..."），尝试匹配完整标题或中文部分
  const found = Object.keys(aiSections.value).find(k => k === key || k.split(' / ')[0] === key)
  return found ?? key
}

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zwr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/* ---------- 大限走势 ---------- */

const selectedDaxianIndex = ref(0)

onMounted(() => {
  const currentIdx = props.chart.daXians.findIndex(
    d => d.ageRange[0] <= props.chart.currentAge && d.ageRange[1] >= props.chart.currentAge,
  )
  if (currentIdx >= 0) selectedDaxianIndex.value = currentIdx
})

const daxianAnalyses = computed<DaxianAnalysis[]>(() =>
  props.chart.daXians.map((_, i) => getDaxianAnalysis(props.chart, i)))

const currentDaxianAnalysis = computed<DaxianAnalysis | null>(() => {
  if (selectedDaxianIndex.value < 0 || selectedDaxianIndex.value >= daxianAnalyses.value.length) return null
  return daxianAnalyses.value[selectedDaxianIndex.value]!
})

type Trend = '上升' | '平稳' | '波动' | '调整'

const daxianChartRows = computed(() => {
  const dims = ['感情', '事业', '财运', '健康']
  return dims.map((dim, dimIdx) => ({
    dim,
    cells: daxianAnalyses.value.map(a => ({
      trend: a.dimensions[dimIdx]?.trend as Trend,
      isCurrent: a.isCurrent,
    })),
  }))
})

function trendLabel(trend: string): string {
  switch (trend) {
    case '上升': return t('zwdsAnalysis.trendUp')
    case '平稳': return t('zwdsAnalysis.trendStable')
    case '波动': return t('zwdsAnalysis.trendFluctuate')
    case '调整': return t('zwdsAnalysis.trendAdjust')
    default: return trend
  }
}

/* ---------- 流年 ---------- */

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const yearOptions = computed(() => {
  const years = new Set<number>()
  for (let y = currentYear - 2; y <= currentYear + 3; y++) years.add(y)
  return Array.from(years).sort((a, b) => a - b)
})

const currentLiunian = computed<LiunianAnalysis>(() => getLiunianAnalysis(props.chart, currentYear))

const currentLiunianSelected = computed<LiunianAnalysis | null>(() =>
  getLiunianAnalysis(props.chart, selectedYear.value))

function ratingText(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('zwdsAnalysis.ratingShunSui')
    case 'stable': return t('zwdsAnalysis.ratingPingWen')
    case 'liuYi': return t('zwdsAnalysis.ratingLiuYi')
    case 'jinShen': return t('zwdsAnalysis.ratingJinShen')
    case 'yiBan': return t('zwdsAnalysis.ratingYiBan')
    default: return t('zwdsAnalysis.ratingPingWen')
  }
}

function ratingLabel(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('zwdsAnalysis.ratingLabelShunSui')
    case 'stable': return t('zwdsAnalysis.ratingLabelStable')
    case 'liuYi': return t('zwdsAnalysis.ratingLabelLiuYi')
    case 'jinShen': return t('zwdsAnalysis.ratingLabelJinShen')
    case 'yiBan': return t('zwdsAnalysis.ratingLabelYiBan')
    default: return t('zwdsAnalysis.ratingLabelStable')
  }
}

function getSummary(): string {
  const parts: string[] = []
  parts.push(`【${t('zwdsAnalysis.lifePalaceLabel')}】${props.chart.mingGong.zhi}（${mingStarsText.value}），${props.chart.wuxingJu}${t('zwdsPan.wuxingBureau')}`)
  parts.push(`【${t('zwdsAnalysis.bodyPalaceLabel')}】${props.chart.shenGong.zhi}（${shenStarsText.value}）`)
  const dx = props.chart.currentDaXian
  if (dx) parts.push(`【${t('zwdsAnalysis.currentDaXian')}】${dx.index} ${dx.gongName}宫（${dx.gongZhi}）${dx.ageRange[0]}-${dx.ageRange[1]}${t('zwdsPan.sui')}`)
  const liu = getLiunianAnalysis(props.chart, currentYear)
  parts.push(`【${currentYear}${t('zwds.liuNian')}】${liu.summary}`)
  return parts.join('\n')
}

defineExpose({ getSummary })
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.zwr {
  --zwr-bg: #f2ede3;
  --zwr-sheet: #faf6ec;
  --zwr-card: #fffdf6;
  --zwr-ink: #2e2a24;
  --zwr-ink-soft: #55503f;
  --zwr-ink-faint: #8a8272;
  --zwr-line: #d8d0bd;
  --zwr-line-soft: #e6dfcd;
  --zwr-accent: #8c2f26;
  --zwr-accent-soft: #a8512e;
  --zwr-star: #8c6d1f;
  --zwr-green: #4a7c59;
  --zwr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--zwr-bg);
  padding: 18px;
  color: var(--zwr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zwr-sheet {
  background: var(--zwr-sheet);
  border: 1px solid var(--zwr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zwr-head { border-bottom: 2px solid var(--zwr-ink); padding-bottom: 16px; }
.zwr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zwr-brand { display: flex; align-items: center; gap: 8px; }
.zwr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zwr-accent);
  color: var(--zwr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zwr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zwr-ink-soft); }
.zwr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zwr-ink-faint); }
.zwr-verdict { color: var(--zwr-green); font-weight: 600; }

.zwr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.zwr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zwr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zwr-head-bottom { text-align: center; }
.zwr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zwr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zwr-row { display: grid; gap: 14px; margin-top: 16px; }
.zwr-row-top { grid-template-columns: 1fr 2.4fr; }
.zwr-pans { grid-template-columns: 1fr; }
.zwr-ai-row { grid-template-columns: repeat(3, 1fr); }
.zwr-section { margin-top: 16px; }

.zwr-card {
  background: var(--zwr-card);
  border: 1px solid var(--zwr-line);
  padding: 14px 16px;
}
.zwr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--zwr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.zwr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 命主信息卡 ---------- */
.zwr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.zwr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.zwr-ico { color: var(--zwr-accent-soft); font-size: 12px; }
.zwr-profile-label { color: var(--zwr-ink-faint); min-width: 30px; }
.zwr-profile-value { color: var(--zwr-ink); letter-spacing: 0.5px; }

/* ---------- 命格速览 ---------- */
.zwr-yinzheng-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.zwr-mini { border: 1px dashed var(--zwr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.zwr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--zwr-accent-soft); letter-spacing: 1px; }
.zwr-mini-head-star { color: var(--zwr-star); }
.zwr-mini-head-warn { color: var(--zwr-accent); }
.zwr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--zwr-ink-soft); }

/* ---------- 核心数据五卡 ---------- */
.zwr-core-grid { display: grid; grid-template-columns: 0.9fr 1fr 1fr 1.5fr 1fr; gap: 10px; }
.zwr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; }
.zwr-core-label { font-size: 11px; color: var(--zwr-ink-faint); letter-spacing: 1px; display: flex; justify-content: center; gap: 4px; }
.zwr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.zwr-core-value-sm { font-size: 17px; }
.zwr-core-unit { font-size: 12px; font-weight: 400; color: var(--zwr-ink-faint); margin-left: 2px; letter-spacing: 0; }
.zwr-core-sub { font-size: 10px; color: var(--zwr-ink-faint); }

.zwr-sihua-stats { display: flex; flex-direction: column; gap: 4px; }
.zwr-sihua-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zwr-sihua-chip {
  font-style: normal;
  display: inline-block;
  min-width: 16px;
  text-align: center;
  font-size: 9px;
  border: 1px solid currentColor;
  padding: 0 3px;
  line-height: 1.5;
  border-radius: 2px;
  white-space: nowrap;
}
.zwr-sihua-bar-wrap { flex: 1; height: 6px; background: var(--zwr-line-soft); }
.zwr-sihua-bar { display: block; height: 100%; }
.zwr-sihua-count { width: 14px; text-align: right; color: var(--zwr-ink-faint); }

.zwr-sihua-禄 { color: #8c6d1f; }
.zwr-sihua-权 { color: #a8512e; }
.zwr-sihua-科 { color: #4a7c59; }
.zwr-sihua-忌 { color: #8c2f26; }
.zwr-sihua-bar-禄 { background: #8c6d1f; }
.zwr-sihua-bar-权 { background: #a8512e; }
.zwr-sihua-bar-科 { background: #4a7c59; }
.zwr-sihua-bar-忌 { background: #8c2f26; }

/* ---------- 命盘 ---------- */
.zwr-pan { padding: 12px; }
.zwr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zwr-pan-legend { display: block; font-size: 9px; color: var(--zwr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.zwr-zwds-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, minmax(86px, auto));
  gap: 2px;
}
.zwr-zwds-center {
  grid-column: 2 / span 2; grid-row: 2 / span 2;
  border: 1px solid var(--zwr-line);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; padding: 8px; text-align: center;
  background: var(--zwr-sheet);
}
.zwr-zwds-center-title { font-size: 12px; font-weight: 700; letter-spacing: 2px; }
.zwr-zwds-center-line { font-size: 10px; color: var(--zwr-ink-faint); }
.zwr-zwds-center-pillars { display: flex; gap: 6px; margin-top: 4px; }
.zwr-zwds-center-pillars span {
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid var(--zwr-line); padding: 2px 8px;
  font-size: 13px; font-weight: 700; line-height: 1.3;
}
.zwr-zwds-center-pillars i { font-style: normal; font-size: 10px; color: var(--zwr-ink-faint); font-weight: 400; }
.zwr-zwds-center-warn { font-size: 9px; color: var(--zwr-accent-soft); margin-top: 2px; }

.zwr-gong {
  border: 1px solid var(--zwr-line-soft);
  padding: 4px 5px;
  display: flex; flex-direction: column; gap: 2px;
  background: var(--zwr-card);
  overflow: hidden;
}
.zwr-gong-ming { border: 1.5px solid var(--zwr-accent); background: rgba(140, 47, 38, 0.04); }
.zwr-gong-daxian:not(.zwr-gong-ming) { background: rgba(74, 124, 89, 0.05); }
.zwr-gong-head { display: flex; align-items: baseline; gap: 4px; font-size: 9px; color: var(--zwr-ink-faint); }
.zwr-gong-zhi { color: var(--zwr-ink-faint); }
.zwr-gong-name { font-weight: 700; color: var(--zwr-ink-soft); font-size: 10px; }
.zwr-gong-ming .zwr-gong-name { color: var(--zwr-accent); }
.zwr-gong-tag { font-size: 8px; border: 1px solid var(--zwr-accent); color: var(--zwr-accent); padding: 0 2px; line-height: 1.4; }
.zwr-gong-tag-shen { border-color: var(--zwr-blue); color: var(--zwr-blue); }
.zwr-gong-gan { margin-left: auto; }
.zwr-gong-stars { display: flex; flex-wrap: wrap; gap: 2px 4px; }
.zwr-star-main { font-size: 12px; font-weight: 700; color: var(--zwr-ink); }
.zwr-star-none { font-size: 10px; color: var(--zwr-ink-faint); font-style: italic; }
.zwr-sihua {
  font-style: normal; font-size: 8px; margin-left: 1px;
  border: 1px solid currentColor; padding: 0 1px; line-height: 1.2;
  vertical-align: super;
}
.zwr-sihua-inline { vertical-align: baseline; font-size: 9px; padding: 0 3px; margin-right: 2px; }
.zwr-gong-aux { display: flex; flex-wrap: wrap; gap: 2px 4px; }
.zwr-star-aux { font-size: 9px; color: var(--zwr-ink-faint); }
.zwr-gong-daxian { margin-top: auto; font-size: 8px; color: var(--zwr-ink-faint); border-top: 1px dashed var(--zwr-line-soft); padding-top: 2px; }

/* ---------- AI 章节 ---------- */
.zwr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zwr-line-soft);
  padding-bottom: 8px;
}
.zwr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zwr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zwr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zwr-ink-soft); }

.zwr-md :deep(p) { margin: 0 0 0.7em; }
.zwr-md :deep(p:last-child) { margin-bottom: 0; }
.zwr-md :deep(strong) { color: var(--zwr-ink); font-weight: 700; }
.zwr-md :deep(ul), .zwr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zwr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zwr-md :deep(h3), .zwr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zwr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zwr-md { overflow-x: auto; }
.zwr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.zwr-md :deep(th), .zwr-md :deep(td) { border: 1px solid var(--zwr-line); padding: 4px 6px; text-align: left; }
.zwr-md :deep(th) { background: var(--zwr-line-soft); font-weight: 700; color: var(--zwr-ink); }
.zwr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--zwr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.zwr-md :deep(.zwr-pending), .zwr-pending { color: var(--zwr-ink-faint); font-style: italic; }

/* ---------- 十二宫详览表格 ---------- */
.zwr-table-wrap { overflow-x: auto; }
.zwr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.zwr-table th, .zwr-table td {
  border: 1px solid var(--zwr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.zwr-table thead th {
  background: var(--zwr-line-soft);
  font-weight: 700;
  color: var(--zwr-ink);
  text-align: center;
  letter-spacing: 1px;
}
.zwr-table-rowhead {
  background: var(--zwr-line-soft);
  font-weight: 700;
  color: var(--zwr-ink);
  white-space: nowrap;
  font-size: 11px;
}
.zwr-tr-ming .zwr-table-rowhead { color: var(--zwr-accent); }
.zwr-table td { color: var(--zwr-ink-soft); }
.zwr-td-brief { font-size: 10.5px; color: var(--zwr-ink-faint); min-width: 220px; }

/* ---------- 大限走势 ---------- */
.zwr-daxian-picker { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 10px; }
.zwr-daxian-btn {
  flex: 0 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  border: 1px solid var(--zwr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 5px 10px;
  cursor: pointer;
  font-family: inherit;
  color: var(--zwr-ink-soft);
}
.zwr-daxian-btn:hover { border-color: var(--zwr-accent-soft); }
.zwr-daxian-btn-active { border-color: var(--zwr-accent); background: rgba(140, 47, 38, 0.06); color: var(--zwr-accent); }
.zwr-daxian-btn-current:not(.zwr-daxian-btn-active) { border-color: var(--zwr-green); }
.zwr-daxian-btn-no { font-size: 10px; font-weight: 700; letter-spacing: 1px; }
.zwr-daxian-btn-age { font-size: 9px; color: var(--zwr-ink-faint); }

.zwr-daxian-overview { font-size: 12px; line-height: 1.8; color: var(--zwr-ink-soft); margin: 0 0 12px; }
.zwr-current-badge {
  display: inline-block;
  font-size: 9px; font-weight: 700;
  color: var(--zwr-green);
  border: 1px solid var(--zwr-green);
  padding: 0 5px; line-height: 1.6;
  margin-right: 6px;
  letter-spacing: 1px;
}

.zwr-daxian-chart { margin-bottom: 12px; overflow-x: auto; }
.zwr-daxian-chart-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; min-width: 460px; width: 460px; }
.zwr-daxian-chart-axis { display: flex; align-items: center; gap: 8px; min-width: 460px; width: 460px; }
.zwr-daxian-chart-dim { width: 30px; flex-shrink: 0; font-size: 10px; color: var(--zwr-ink-faint); text-align: right; }
.zwr-daxian-chart-cells { flex: 1; display: flex; gap: 2px; }
.zwr-daxian-cell {
  flex: 1;
  text-align: center;
  font-size: 9px;
  padding: 3px 0;
  cursor: pointer;
  border: 1px solid transparent;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
}
.zwr-daxian-cell:hover { border-color: var(--zwr-accent-soft); }
.zwr-daxian-cell-active { border-color: var(--zwr-accent); font-weight: 700; }
.zwr-daxian-cell-current { box-shadow: inset 0 -2px 0 var(--zwr-ink); }
.zwr-daxian-axis-label { flex: 1; text-align: center; font-size: 8px; color: var(--zwr-ink-faint); }

.zwr-trend-上升 { background: rgba(74, 124, 89, 0.16); color: var(--zwr-green); }
.zwr-trend-平稳 { background: rgba(74, 106, 138, 0.14); color: var(--zwr-blue); }
.zwr-trend-波动 { background: rgba(168, 81, 46, 0.14); color: var(--zwr-accent-soft); }
.zwr-trend-调整 { background: rgba(140, 109, 31, 0.14); color: var(--zwr-star); }

.zwr-trend-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.zwr-trend-card { border: 1px solid var(--zwr-line); background: rgba(255, 255, 255, 0.45); padding: 10px 12px; }
.zwr-trend-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.zwr-trend-name { font-size: 11.5px; font-weight: 700; color: var(--zwr-ink); letter-spacing: 1px; }
.zwr-trend-badge { font-size: 9px; padding: 1px 6px; border: 1px solid currentColor; letter-spacing: 1px; }
.zwr-trend-badge-上升 { color: var(--zwr-green); }
.zwr-trend-badge-平稳 { color: var(--zwr-blue); }
.zwr-trend-badge-波动 { color: var(--zwr-accent-soft); }
.zwr-trend-badge-调整 { color: var(--zwr-star); }
.zwr-trend-text { margin: 0; font-size: 10.5px; color: var(--zwr-ink-faint); line-height: 1.6; }

.zwr-timehint {
  margin-top: 12px;
  border: 1px dashed var(--zwr-line);
  padding: 8px 12px;
  font-size: 11px; color: var(--zwr-ink-faint); line-height: 1.65;
}
.zwr-timehint-label { font-weight: 700; color: var(--zwr-ink-soft); margin-right: 6px; }

/* ---------- 流年 ---------- */
.zwr-year-picker { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.zwr-year-btn {
  border: 1px solid var(--zwr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  color: var(--zwr-ink-soft);
  letter-spacing: 1px;
}
.zwr-year-btn:hover { border-color: var(--zwr-accent-soft); }
.zwr-year-btn-active { border-color: var(--zwr-accent); background: rgba(140, 47, 38, 0.06); color: var(--zwr-accent); font-weight: 700; }
.zwr-year-btn-current:not(.zwr-year-btn-active) { border-color: var(--zwr-green); color: var(--zwr-green); }

.zwr-liunian-top { display: grid; grid-template-columns: 1.8fr 1fr; gap: 12px; margin-bottom: 12px; }
.zwr-liunian-info { border: 1px solid var(--zwr-line); background: rgba(255, 255, 255, 0.45); padding: 12px 14px; }
.zwr-liunian-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; margin-bottom: 6px; }
.zwr-liunian-label { color: var(--zwr-ink-faint); min-width: 60px; font-size: 11px; }
.zwr-liunian-value { color: var(--zwr-ink); font-weight: 700; letter-spacing: 1px; }
.zwr-liunian-sihua { display: flex; flex-wrap: wrap; gap: 4px; }
.zwr-liunian-summary { margin: 8px 0 0; font-size: 11px; color: var(--zwr-ink-faint); line-height: 1.7; border-top: 1px dashed var(--zwr-line-soft); padding-top: 8px; }

.zwr-rating-box {
  border: 1.5px solid var(--zwr-line);
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px; justify-content: center;
  text-align: center;
}
.zwr-rating-label { font-size: 24px; font-weight: 700; letter-spacing: 4px; }
.zwr-rating-text { font-size: 11px; color: var(--zwr-ink-soft); line-height: 1.7; text-align: left; }
.zwr-rating-shunSui { border-color: var(--zwr-green); background: rgba(74, 124, 89, 0.05); }
.zwr-rating-shunSui .zwr-rating-label { color: var(--zwr-green); }
.zwr-rating-stable { border-color: var(--zwr-blue); background: rgba(74, 106, 138, 0.05); }
.zwr-rating-stable .zwr-rating-label { color: var(--zwr-blue); }
.zwr-rating-liuYi { border-color: var(--zwr-accent-soft); background: rgba(168, 81, 46, 0.05); }
.zwr-rating-liuYi .zwr-rating-label { color: var(--zwr-accent-soft); }
.zwr-rating-jinShen { border-color: var(--zwr-accent); background: rgba(140, 47, 38, 0.05); }
.zwr-rating-jinShen .zwr-rating-label { color: var(--zwr-accent); }
.zwr-rating-yiBan .zwr-rating-label { color: var(--zwr-ink-soft); }

/* ---------- 流式 / 错误 ---------- */
.zwr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zwr-ink-faint); letter-spacing: 1px;
}
.zwr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zwr-accent);
  animation: zwr-pulse 1s ease-in-out infinite;
}
@keyframes zwr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zwr-error { margin-top: 14px; text-align: center; color: var(--zwr-accent); font-size: 12px; }
.zwr-retry {
  margin-top: 8px;
  border: 1px solid var(--zwr-accent);
  background: transparent;
  color: var(--zwr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zwr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zwr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zwr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zwr-foot-note { font-size: 10px; color: var(--zwr-ink-faint); }
.zwr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zwr-row-top { grid-template-columns: 1fr; }
  .zwr-ai-row { grid-template-columns: 1fr 1fr; }
  .zwr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .zwr-trend-grid { grid-template-columns: repeat(2, 1fr); }
  .zwr-liunian-top { grid-template-columns: 1fr; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.zwr-pan, .zwr-ai, .zwr-zwds-grid, .zwr-daxian-chart, .zwr-liunian-top { min-width: 0; }

@media (max-width: 720px) {
  .zwr { padding: 8px; }
  .zwr-sheet { padding: 16px 12px; }
  .zwr-ai-row { grid-template-columns: 1fr; }
  .zwr-yinzheng-grid { grid-template-columns: 1fr; }
  .zwr-title { font-size: 22px; letter-spacing: 2px; }
  .zwr-core-grid { grid-template-columns: 1fr 1fr; }
  .zwr-trend-grid { grid-template-columns: 1fr; }

  /* 紫微十二宫盘：缩小宫位内容，保住 4x4 结构 */
  .zwr-pan { padding: 8px; }
  .zwr-zwds-grid { grid-template-rows: repeat(4, minmax(64px, auto)); }
  .zwr-gong { padding: 3px 3px; gap: 1px; }
  .zwr-gong-name { font-size: 9px; }
  .zwr-star-main { font-size: 10px; }
  .zwr-star-aux { font-size: 8px; }
  .zwr-gong-daxian { font-size: 7px; }
  .zwr-gong-head { font-size: 8px; }
  .zwr-zwds-center { padding: 4px; gap: 2px; }
  .zwr-zwds-center-title { font-size: 10px; letter-spacing: 1px; }
  .zwr-zwds-center-line { font-size: 8px; }

  /* 详览表：表格给最小宽度，容器滚动 */
  .zwr-table { min-width: 640px; }
  .zwr-td-brief { min-width: 180px; }

  /* 大限走势图：固定内容宽度，容器内横向滚动 */
  .zwr-daxian-chart { overflow-x: auto; }
  .zwr-section .zwr-ai { overflow-x: auto; }
}
</style>
