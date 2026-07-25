<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('bazi.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('bazi.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('bazi.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('bazi.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ pillarsMeta }}</p>
          <p class="bzr-meta-line">{{ xijiMeta }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 人生总论 ============ -->
      <section class="bzr-row bzr-row-top">
        <div class="bzr-card bzr-profile">
          <div class="bzr-profile-line">
            <span class="bzr-ico">☀</span>
            <span class="bzr-profile-label">{{ $t('bazi.report.solarLabel') }}</span>
            <span class="bzr-profile-value">{{ solarText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('bazi.report.genderLabel') }}</span>
            <span class="bzr-profile-value">{{ genderText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">♒</span>
            <span class="bzr-profile-label">{{ $t('bazi.report.ageLabel') }}</span>
            <span class="bzr-profile-value">{{ ageText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⛩</span>
            <span class="bzr-profile-label">{{ $t('bazi.report.dayunLabel') }}</span>
            <span class="bzr-profile-value">{{ dayunText }}</span>
          </div>
        </div>

        <div class="bzr-card bzr-overview">
          <h3 class="bzr-card-title">{{ $t('bazi.report.overviewTitle') }}</h3>
          <p class="bzr-overview-text">{{ aiResult?.overview || pendingText }}</p>
          <div class="bzr-yueling">
            <span v-for="(w, i) in yuelingList" :key="i" class="bzr-yueling-item">
              <em class="bzr-yueling-char">{{ w.char }}</em><i class="bzr-yueling-state">{{ w.state }}</i>
            </span>
          </div>
          <p class="bzr-yueling-caption">{{ $t('bazi.report.yuelingLabel') }}</p>
        </div>
      </section>

      <!-- ============ 命盘核心数据 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('bazi.report.coreDataTitle') }}</h3>
        <div class="bzr-core-grid">
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazi.report.gejuLabel') }}</div>
            <div class="bzr-core-value">{{ chart.geju }}</div>
            <div class="bzr-core-sub">{{ $t('bazi.report.confidenceHigh') }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazi.report.wangshaiLabel') }}</div>
            <div class="bzr-core-value">{{ chart.riZhuStrength }}</div>
            <div class="bzr-gauge">
              <div class="bzr-gauge-track">
                <span class="bzr-gauge-zone bzr-gauge-zone-weak" />
                <span class="bzr-gauge-zone bzr-gauge-zone-mid" />
                <span class="bzr-gauge-zone bzr-gauge-zone-strong" />
                <span class="bzr-gauge-pointer" :style="{ left: gaugePos + '%' }" />
              </div>
              <div class="bzr-gauge-marks">
                <span>{{ $t('bazi.report.weakLabel') }}</span>
                <span>{{ $t('bazi.report.midLabel') }}</span>
                <span>{{ $t('bazi.report.strongLabel') }}</span>
              </div>
            </div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazi.report.xiyongLabel') }}</div>
            <div class="bzr-yongshen">
              <span v-for="g in xiyongList" :key="g" class="bzr-yongshen-char">{{ g }}</span>
            </div>
            <div class="bzr-core-sub">{{ $t('bazi.report.jishenLabel') }}：{{ chart.jishen }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('bazi.report.wuxingLabel') }}</div>
            <div class="bzr-wuxing">
              <div v-for="w in wuxingList" :key="w.name" class="bzr-wuxing-row">
                <span class="bzr-wuxing-dot" :style="{ background: w.color }" />
                <span class="bzr-wuxing-name">{{ w.name }}</span>
                <span class="bzr-wuxing-bar-wrap"><span class="bzr-wuxing-bar" :style="{ width: w.pct + '%', background: w.color }" /></span>
                <span class="bzr-wuxing-pct">{{ w.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八字四柱盘 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-pan">
          <h3 class="bzr-pan-title">{{ $t('bazi.report.panTitle') }}</h3>
          <div class="bzr-bazi">
            <div class="bzr-bazi-grid">
              <div v-for="p in pillars" :key="p.label" class="bzr-pillar">
                <div class="bzr-pillar-head">{{ p.label }}</div>
                <div class="bzr-pillar-shishen">{{ p.shishen }}</div>
                <div class="bzr-pillar-gan" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="bzr-pillar-zhi" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="bzr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>
            <div v-if="!chart.hour" class="bzr-pan-note">⚠ {{ $t('bazi.report.hourUnknown') }}</div>

            <!-- 大运 -->
            <div class="bzr-dayun">
              <div class="bzr-dayun-title">{{ $t('bazi.report.dayunTitle', { age: chart.qiyunAge }) }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="d in chart.dayuns"
                  :key="d.index"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': d === chart.currentDaYun }"
                >
                  <span class="bzr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="bzr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>

            <!-- 流年 -->
            <div class="bzr-dayun">
              <div class="bzr-dayun-title">{{ $t('bazi.report.liunianTitle') }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="ln in liunianList"
                  :key="ln.year"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': ln.current }"
                >
                  <span class="bzr-dayun-year">{{ ln.year }}</span>
                  <span class="bzr-dayun-gz">{{ ln.ganZhi }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 五行力量分布（雷达图 + 分析） ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">{{ $t('bazi.report.chartNo') }}</span>{{ $t('bazi.report.wuxingChartTitle') }}</h3>
          <div class="bzr-wuxing-chart">
            <div class="bzr-radar-wrap">
              <Radar v-if="wuxingChartData" :data="wuxingChartData" :options="wuxingChartOptions" />
            </div>
            <div class="bzr-wuxing-side">
              <p class="bzr-analysis-text">{{ analysis['五行平衡'] ?? '' }}</p>
              <div class="bzr-wuxing-legend">
                <span v-for="w in wuxingList" :key="w.name" class="bzr-wuxing-legend-item">
                  <i class="bzr-wuxing-dot" :style="{ background: w.color }" />{{ w.name }} {{ w.pct }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 四维度 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('bazi.report.secPersonality') }}</h3>
          <template v-if="aiResult">
            <div class="bzr-tags">
              <span v-for="tag in aiResult.personality.tags" :key="tag" class="bzr-tag">{{ tag }}</span>
            </div>
            <p class="bzr-dim-summary">{{ aiResult.personality.summary }}</p>
            <p class="bzr-ai-body">{{ aiResult.personality.detail }}</p>
          </template>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('bazi.report.secCareer') }}</h3>
          <template v-if="aiResult">
            <div class="bzr-tags">
              <span v-for="tag in aiResult.career.tags" :key="tag" class="bzr-tag">{{ tag }}</span>
            </div>
            <p class="bzr-dim-summary">{{ aiResult.career.summary }}</p>
            <p class="bzr-ai-body">{{ aiResult.career.detail }}</p>
            <div class="bzr-dim-extra">
              <div class="bzr-dim-extra-label">{{ $t('bazi.report.wealthTrendLabel') }}</div>
              <div class="bzr-dim-extra-value">{{ aiResult.career.wealthTrend }}</div>
            </div>
          </template>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
      </section>

      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('bazi.report.secRelationship') }}</h3>
          <template v-if="aiResult">
            <div class="bzr-tags">
              <span v-for="tag in aiResult.relationship.tags" :key="tag" class="bzr-tag">{{ tag }}</span>
            </div>
            <p class="bzr-dim-summary">{{ aiResult.relationship.summary }}</p>
            <p class="bzr-ai-body">{{ aiResult.relationship.detail }}</p>
            <div class="bzr-dim-extra">
              <div class="bzr-dim-extra-label">{{ $t('bazi.report.marriageTimingLabel') }}</div>
              <div class="bzr-dim-extra-value">{{ aiResult.relationship.timing }}</div>
            </div>
          </template>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('bazi.report.secHealth') }}</h3>
          <template v-if="aiResult">
            <div class="bzr-tags">
              <span v-for="tag in aiResult.health.tags" :key="tag" class="bzr-tag">{{ tag }}</span>
            </div>
            <p class="bzr-dim-summary">{{ aiResult.health.summary }}</p>
            <p class="bzr-ai-body">{{ aiResult.health.detail }}</p>
            <div class="bzr-dim-extra">
              <div class="bzr-dim-extra-label">{{ $t('bazi.report.seasonalNoteLabel') }}</div>
              <div class="bzr-dim-extra-value">{{ aiResult.health.seasons }}</div>
            </div>
          </template>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
      </section>

      <!-- ============ 05 运势五维评分 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">05</span>{{ $t('bazi.report.secDimension') }}</h3>
          <div v-if="aiResult" class="bzr-dimscore">
            <div class="bzr-radar-wrap">
              <Radar v-if="dimChartData" :data="dimChartData" :options="dimChartOptions" />
            </div>
            <div class="bzr-dimscore-list">
              <div v-for="d in dimScoreList" :key="d.key" class="bzr-dimscore-row">
                <span class="bzr-dimscore-dot" :style="{ background: d.color }" />
                <span class="bzr-dimscore-name">{{ d.label }}</span>
                <span class="bzr-dimscore-bar-wrap">
                  <span class="bzr-dimscore-bar" :style="{ width: d.score + '%', background: d.color }" />
                </span>
                <span class="bzr-dimscore-score" :style="{ color: d.color }">{{ d.score }}</span>
                <span class="bzr-dimscore-level">{{ d.level }}</span>
              </div>
            </div>
          </div>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
      </section>

      <!-- ============ 06 大运走势（蜡烛图） ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">06</span>{{ $t('bazi.report.secDayunChart') }}</h3>
          <p class="bzr-chart-sub">{{ $t('bazi.report.dayunChartSub') }}</p>

          <div class="bzr-legend">
            <span class="bzr-legend-item"><i class="bzr-legend-swatch bzr-legend-rise" />{{ $t('bazi.report.risingTrend') }}</span>
            <span class="bzr-legend-item"><i class="bzr-legend-swatch bzr-legend-fall" />{{ $t('bazi.report.fallingTrend') }}</span>
            <span class="bzr-legend-item"><i class="bzr-legend-swatch bzr-legend-current" />{{ $t('bazi.report.currentDayun') }}</span>
          </div>

          <div class="bzr-candle-scroll">
            <div class="bzr-candle-inner">
              <div class="bzr-candle-chart">
                <!-- Y 轴 -->
                <div class="bzr-candle-y" :style="{ height: CHART_H + 'px' }">
                  <span
                    v-for="(tick, i) in candleData.yTicks"
                    :key="i"
                    class="bzr-candle-tick"
                    :style="{ top: tick.pos + '%' }"
                  >{{ tick.value }}</span>
                </div>
                <!-- 蜡烛区 -->
                <div class="bzr-candle-body" :style="{ height: CHART_H + 'px' }">
                  <div class="bzr-candle-grid">
                    <div
                      v-for="(tick, i) in candleData.yTicks"
                      :key="'g' + i"
                      class="bzr-candle-gridline"
                      :style="{ top: tick.pos + '%' }"
                    />
                  </div>
                  <div class="bzr-candle-items">
                    <div v-for="(d, idx) in candleData.items" :key="idx" class="bzr-candle-col">
                      <div class="bzr-candle-stick" :style="{ height: CHART_H + 'px' }">
                        <div
                          class="bzr-candle-shadow"
                          :class="{ 'bzr-candle-cur': d.isCurrent, 'bzr-candle-down': !d.isRising }"
                          :style="{ bottom: d.upperShadowBottom + 'px', height: d.upperShadowH + 'px' }"
                        />
                        <div
                          class="bzr-candle-shadow"
                          :class="{ 'bzr-candle-cur': d.isCurrent, 'bzr-candle-down': !d.isRising }"
                          :style="{ bottom: d.lowerShadowBottom + 'px', height: d.lowerShadowH + 'px' }"
                        />
                        <div
                          class="bzr-candle-bar"
                          :class="{ 'bzr-candle-cur': d.isCurrent, 'bzr-candle-down': !d.isRising }"
                          :style="{ bottom: d.bodyBottom + 'px', height: d.bodyH + 'px' }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 底部标签 -->
              <div class="bzr-candle-x">
                <div class="bzr-candle-y-space" />
                <div class="bzr-candle-x-items">
                  <div v-for="(d, idx) in candleData.items" :key="'x' + idx" class="bzr-candle-x-col">
                    <span
                      class="bzr-candle-change"
                      :class="{ 'bzr-candle-change-down': !d.isRising, 'bzr-candle-change-cur': d.isCurrent && d.isRising }"
                    >{{ d.change >= 0 ? '+' : '' }}{{ d.change }}</span>
                    <span class="bzr-candle-gz" :class="{ 'bzr-candle-gz-cur': d.isCurrent }">{{ d.gan }}{{ d.zhi }}</span>
                    <span class="bzr-candle-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}{{ $t('bazi.report.ageSuffix') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 大运评分明细表 -->
          <div v-if="aiResult?.dayunScores?.length" class="bzr-table-wrap">
            <table class="bzr-table">
              <thead>
                <tr>
                  <th>{{ $t('bazi.report.dayunCol') }}</th>
                  <th>{{ $t('bazi.report.ageCol') }}</th>
                  <th>{{ $t('bazi.report.scoreCol') }}</th>
                  <th>{{ $t('bazi.report.fortuneCol') }}</th>
                  <th>{{ $t('bazi.report.analysisCol') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in aiResult.dayunScores" :key="s.index">
                  <td class="bzr-table-gz">{{ s.ganZhi }}</td>
                  <td>{{ s.ageRange }}</td>
                  <td>
                    <span class="bzr-dimscore-bar-wrap bzr-table-bar">
                      <span class="bzr-dimscore-bar" :style="{ width: s.score + '%', background: scoreColor(s.score) }" />
                    </span>
                    {{ s.score }}
                  </td>
                  <td>
                    <span class="bzr-mark" :class="fortuneMarkClass(s.fortune)">{{ s.fortune || '—' }}</span>
                  </td>
                  <td>{{ s.analysis }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 07 历史事件校准 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">07</span>{{ $t('bazi.report.secHistorical') }}</h3>
          <p class="bzr-chart-sub">{{ $t('bazi.report.historicalSub') }}</p>
          <div v-if="aiResult" class="bzr-hist">
            <div class="bzr-hist-line" />
            <div class="bzr-hist-items">
              <div v-for="p in aiResult.historicalPredictions" :key="p.year" class="bzr-hist-item">
                <div class="bzr-hist-head">
                  <span class="bzr-hist-age">{{ p.age }}{{ $t('bazi.report.ageSuffix') }}</span>
                  <span class="bzr-hist-year">{{ p.year }}</span>
                </div>
                <p class="bzr-hist-desc">{{ p.description }}</p>
              </div>
            </div>
          </div>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
      </section>

      <!-- ============ 08 格局与岁运（确定性分析） ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">08</span>{{ $t('bazi.report.secDeterministic') }}</h3>
          <p class="bzr-chart-sub">{{ $t('bazi.report.deterministicSub') }}</p>
          <div class="bzr-det-grid">
            <div v-for="card in deterministicCards" :key="card.title" class="bzr-det">
              <h4 class="bzr-det-title">{{ card.title }}</h4>
              <p class="bzr-det-body">{{ card.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 09 综合建议 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">09</span>{{ $t('bazi.report.secAdvice') }}</h3>
          <p class="bzr-chart-sub">{{ $t('bazi.report.adviceSub') }}</p>
          <div v-if="aiResult" class="bzr-advice">
            <div v-for="(advice, i) in aiResult.comprehensiveAdvice" :key="i" class="bzr-advice-item">
              <span class="bzr-advice-num">{{ i + 1 }}</span>
              <p class="bzr-advice-text">{{ advice }}</p>
            </div>
          </div>
          <p v-else class="bzr-pending">{{ pendingText }}</p>
        </div>
      </section>

      <!-- 加载中提示 -->
      <div v-if="loading" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('bazi.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('bazi.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('bazi.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('bazi.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import type { BaziChart, BaziAiResult } from '~/types/bazi'
import type { DiZhi } from '~/types/user'
import { generateAnalysis } from '~/utils/bazi/analysisText'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  chart: BaziChart
  aiResult: BaziAiResult | null
  loading: boolean
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
  return t('bazi.report.ageValue', { age, year: new Date().getFullYear() })
})

const genderText = computed(() =>
  props.gender === 'male' ? t('bazi.report.genderMale') : t('bazi.report.genderFemale'))

const solarText = computed(() => {
  const h = props.birthHour ? t('bazi.report.hourSuffix', { hour: props.birthHour }) : ''
  return `${props.birthDate}${h}`
})

const dayunText = computed(() => {
  const d = props.chart.currentDaYun
  return d
    ? `${d.gan}${d.zhi}（${d.ageRange[0]}-${d.ageRange[1]}${t('bazi.report.ageSuffix')}）`
    : t('bazi.report.noDayun')
})

const GAN_WUXING_MAP: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const titleText = computed(() => {
  const wx = GAN_WUXING_MAP[props.chart.riZhu] ?? ''
  return t('bazi.report.title', { wx, rizhu: props.chart.riZhu, geju: props.chart.geju })
})

const subtitleText = computed(() => {
  if (props.aiResult?.overview) return props.aiResult.overview
  return t('bazi.report.subtitleFallback', {
    geju: props.chart.geju, strength: props.chart.riZhuStrength,
  })
})

const pillarsMeta = computed(() => {
  const c = props.chart
  const parts = [
    `${c.year.gan}${c.year.zhi}`, `${c.month.gan}${c.month.zhi}`,
    `${c.day.gan}${c.day.zhi}`, c.hour ? `${c.hour.gan}${c.hour.zhi}` : '——',
  ]
  return t('bazi.report.pillarsMeta', { pillars: parts.join('　') })
})

const xijiMeta = computed(() => t('bazi.report.xijiMeta', {
  xiyong: props.chart.xiyong, jishen: props.chart.jishen,
}))

const verdict = computed(() => t(`bazi.report.verdict_${props.chart.riZhuStrength}`))

const pendingText = computed(() => t('bazi.report.pending'))

/** 喜用神字符 */
const xiyongList = computed(() => {
  const raw = props.chart.xiyong || ''
  return raw.split(/[、，,\s]+/).filter(Boolean).slice(0, 4)
})

/** 月令旺相 */
const ZHI_WUXING: Record<string, string> = {
  寅: '木', 卯: '木', 巳: '火', 午: '火', 申: '金', 酉: '金',
  亥: '水', 子: '水', 辰: '土', 戌: '土', 丑: '土', 未: '土',
}
const WX_SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const WX_KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const yuelingList = computed(() => {
  const season = ZHI_WUXING[props.chart.month.zhi] ?? '土'
  const states: Record<string, string> = {}
  for (const wx of ['木', '火', '土', '金', '水']) {
    if (wx === season) states[wx] = '旺'
    else if (WX_SHENG[season] === wx) states[wx] = '相'
    else if (WX_SHENG[wx] === season) states[wx] = '休'
    else if (WX_KE[wx] === season) states[wx] = '囚'
    else states[wx] = '死'
  }
  return ['水', '木', '金', '土', '火'].map(wx => ({ char: wx, state: states[wx]! }))
})

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
const wuxingList = computed(() =>
  (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    pct: Math.round(props.chart.wuxingScore[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

/** 四柱 */
const pillars = computed(() => {
  const c = props.chart
  const mk = (label: string, p: typeof c.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('bazi.report.rizhuTag') : (p?.shishen ?? '—'),
    canggan: p?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('bazi.report.yearPillar'), c.year),
    mk(t('bazi.report.monthPillar'), c.month),
    mk(t('bazi.report.dayPillar'), c.day, true),
    mk(t('bazi.report.hourPillar'), c.hour),
  ]
})

/** 流年（当前年前后各五年） */
const GAN_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const ZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const liunianList = computed(() => {
  const now = new Date().getFullYear()
  const out: { year: number; ganZhi: string; current: boolean }[] = []
  for (let y = now - 5; y <= now + 4; y++) {
    const idx = ((y - 1984) % 60 + 60) % 60
    out.push({ year: y, ganZhi: `${GAN_LIST[idx % 10]}${ZHI_LIST[idx % 12]}`, current: y === now })
  }
  return out
})

const gaugePos = computed(() => {
  const map: Record<string, number> = { 从弱: 8, 身弱: 32, 身旺: 68, 从强: 92 }
  return map[props.chart.riZhuStrength] ?? 50
})

/* ---------- 确定性分析文本 ---------- */

const analysis = computed(() => generateAnalysis(props.chart))

const deterministicCards = computed(() => ([
  { title: t('bazi.riZhuAnalysis'), text: analysis.value['日主分析'] ?? '' },
  { title: t('bazi.shiShenAnalysis'), text: analysis.value['十神分析'] ?? '' },
  { title: t('bazi.gejuAnalysis'), text: analysis.value['格局判定'] ?? '' },
  { title: t('bazi.dayunAnalysis'), text: analysis.value['大运分析'] ?? '' },
  { title: t('bazi.liuNianAnalysis'), text: analysis.value['流年分析'] ?? '' },
]))

/* ---------- 五行雷达图 ---------- */

const wuxingChartData = computed(() => ({
  labels: wuxingList.value.map(w => w.name),
  datasets: [{
    label: t('bazi.report.wuxingLabel'),
    data: wuxingList.value.map(w => w.pct),
    backgroundColor: 'rgba(140, 108, 31, 0.16)',
    borderColor: '#8c6d1f',
    pointBackgroundColor: wuxingList.value.map(w => w.color),
    pointBorderColor: '#faf6ec',
    pointBorderWidth: 1.5,
    pointRadius: 4,
    borderWidth: 1.5,
  }],
}))

const paperChartScales = {
  r: {
    beginAtZero: true,
    max: 50,
    ticks: { display: false, stepSize: 10 },
    grid: { color: 'rgba(85, 80, 63, 0.16)' },
    angleLines: { color: 'rgba(85, 80, 63, 0.16)' },
    pointLabels: {
      color: '#55503f',
      font: { size: 12, family: "'Noto Serif SC', 'Songti SC', 'SimSun', serif" },
    },
  },
}

const paperTooltip = {
  backgroundColor: 'rgba(46, 42, 36, 0.95)',
  titleColor: '#f5efe0',
  bodyColor: '#e6dfcd',
  borderColor: 'rgba(140, 108, 31, 0.5)',
  borderWidth: 1,
  displayColors: false,
}

const wuxingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: paperChartScales,
  plugins: { legend: { display: false }, tooltip: paperTooltip },
}

/* ---------- 五维评分 ---------- */

const DIM_DEFS = [
  { key: '感情运', labelKey: 'dimRelationship', color: '#a8512e' },
  { key: '事业运', labelKey: 'dimCareer', color: '#8c6d1f' },
  { key: '财运', labelKey: 'dimWealth', color: '#8a6d3b' },
  { key: '健康运', labelKey: 'dimHealth', color: '#4a7c59' },
  { key: '学业运', labelKey: 'dimStudy', color: '#4a6a8a' },
] as const

function dimLevel(score: number): string {
  if (score >= 85) return t('bazi.report.levelExcellent')
  if (score >= 70) return t('bazi.report.levelGood')
  if (score >= 55) return t('bazi.report.levelStable')
  if (score >= 40) return t('bazi.report.levelWeak')
  return t('bazi.report.levelLow')
}

const dimScoreList = computed(() => {
  const scores: Partial<Record<string, number>> = props.aiResult?.dimensionScores ?? {}
  return DIM_DEFS.map(d => {
    const score = Math.round(scores[d.key] ?? 50)
    return { key: d.key, label: t(`bazi.report.${d.labelKey}`), score, color: d.color, level: dimLevel(score) }
  })
})

const dimChartData = computed(() => ({
  labels: dimScoreList.value.map(d => d.label),
  datasets: [{
    label: t('bazi.report.secDimension'),
    data: dimScoreList.value.map(d => d.score),
    backgroundColor: 'rgba(140, 108, 31, 0.16)',
    borderColor: '#8c6d1f',
    pointBackgroundColor: dimScoreList.value.map(d => d.color),
    pointBorderColor: '#faf6ec',
    pointBorderWidth: 1.5,
    pointRadius: 4,
    borderWidth: 1.5,
  }],
}))

const dimChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      ...paperChartScales.r,
      max: 100,
      ticks: { display: false, stepSize: 20 },
    },
  },
  plugins: { legend: { display: false }, tooltip: paperTooltip },
}

function scoreColor(score: number): string {
  if (score >= 70) return '#4a7c59'
  if (score >= 50) return '#8c6d1f'
  return '#a8512e'
}

function fortuneMarkClass(fortune: string): string {
  if (/大吉|吉/.test(fortune)) return 'bzr-mark-same'
  if (/大凶|凶/.test(fortune)) return 'bzr-mark-conflict'
  return 'bzr-mark-partial'
}

/* ---------- 大运蜡烛图 ---------- */

const CHART_H = 200

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

/** 与 DayunCandlestick 一致的确定性 OHLC 兜底 */
function generateOHLC(index: number, score: number) {
  const hash = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }
  const open = clamp(score + (hash(index * 7 + 1) * 16 - 8))
  const close = clamp(score + (hash(index * 13 + 3) * 16 - 8))
  const high = clamp(Math.max(open, close) + hash(index * 17 + 5) * 12 + 4)
  const low = clamp(Math.min(open, close) - hash(index * 19 + 7) * 12 - 4)
  return { open, close, high, low }
}

const candleData = computed(() => {
  const rawItems = props.chart.dayuns.map((d) => {
    const ds = props.aiResult?.dayunScores?.find(s => s.index === d.index)
    const score = ds?.score ?? d.score ?? 50

    let open = ds?.open
    let close = ds?.close
    let high = ds?.high
    let low = ds?.low

    if (open == null || close == null || high == null || low == null) {
      const fallback = generateOHLC(d.index, score)
      open = fallback.open
      close = fallback.close
      high = fallback.high
      low = fallback.low
    }

    const minOC = Math.min(open, close)
    const maxOC = Math.max(open, close)
    low = Math.min(low, minOC)
    high = Math.max(high, maxOC)

    return {
      ...d,
      open,
      close,
      high,
      low,
      isCurrent: d.ageRange[0] <= props.chart.currentAge && d.ageRange[1] >= props.chart.currentAge,
      isRising: close >= open,
      change: Math.round(close - open),
    }
  })

  const globalLow = Math.min(...rawItems.map(d => d.low))
  const globalHigh = Math.max(...rawItems.map(d => d.high))
  const padding = Math.max(5, (globalHigh - globalLow) * 0.12)
  const yMin = Math.max(0, Math.floor(globalLow - padding))
  const yMax = Math.min(100, Math.ceil(globalHigh + padding))
  const yRange = yMax - yMin

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    pos: p * 100,
    value: Math.round(yMax - yRange * p),
  }))

  const toPx = (v: number): number => {
    if (yRange <= 0) return CHART_H / 2
    return ((v - yMin) / yRange) * CHART_H
  }

  const items = rawItems.map((d) => {
    const openY = toPx(d.open)
    const closeY = toPx(d.close)
    const highY = toPx(d.high)
    const lowY = toPx(d.low)
    const bodyBottom = Math.min(openY, closeY)
    const bodyTop = Math.max(openY, closeY)
    return {
      ...d,
      upperShadowBottom: bodyTop,
      upperShadowH: Math.max(1, highY - bodyTop),
      lowerShadowBottom: lowY,
      lowerShadowH: Math.max(1, bodyBottom - lowY),
      bodyBottom,
      bodyH: Math.max(4, bodyTop - bodyBottom),
    }
  })

  return { yTicks, items }
})
</script>

<style scoped>
/* ========== 纸质报告主题（与 BaziZiweiReport 一致） ========== */
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
}
.bzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bzr-ink-soft); }
.bzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-verdict { color: var(--bzr-green); font-weight: 600; }
.bzr-rating { letter-spacing: 1px; }

.bzr-title { margin: 14px 0 6px; font-size: 30px; font-weight: 700; letter-spacing: 4px; text-align: center; }
.bzr-subtitle { text-align: center; font-size: 13px; color: var(--bzr-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.bzr-head-bottom { text-align: center; }
.bzr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bzr-row { display: grid; gap: 14px; margin-top: 16px; }
.bzr-row-top { grid-template-columns: 1fr 2.4fr; }
.bzr-ai-row { grid-template-columns: 1fr 1fr; }
.bzr-section { margin-top: 16px; }

.bzr-card { background: var(--bzr-card); border: 1px solid var(--bzr-line); padding: 14px 16px; }
.bzr-card-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.bzr-section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }

/* ---------- 命主信息卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 30px; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 人生总论卡 ---------- */
.bzr-overview { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-overview-text { margin: 0; font-size: 15px; font-weight: 700; color: var(--bzr-accent); line-height: 1.8; letter-spacing: 1px; text-align: center; }
.bzr-yueling { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; align-items: baseline; }
.bzr-yueling-item { display: inline-flex; align-items: baseline; gap: 2px; }
.bzr-yueling-char { font-style: normal; font-size: 15px; font-weight: 700; }
.bzr-yueling-state { font-style: normal; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-yueling-caption { margin: 0; text-align: center; font-size: 10px; color: var(--bzr-ink-faint); letter-spacing: 2px; }

/* ---------- 核心数据卡 ---------- */
.bzr-core-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr 1.4fr; gap: 10px; }
.bzr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; }
.bzr-core-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.bzr-core-sub { font-size: 10px; color: var(--bzr-ink-faint); }

.bzr-gauge { margin-top: 4px; }
.bzr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--bzr-line); overflow: hidden; }
.bzr-gauge-zone { height: 100%; }
.bzr-gauge-zone-weak { flex: 35; background: linear-gradient(90deg, #b8cdc0, #d9e4dc); }
.bzr-gauge-zone-mid { flex: 30; background: #efe9d8; }
.bzr-gauge-zone-strong { flex: 35; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.bzr-gauge-pointer { position: absolute; top: -2px; width: 2px; height: 12px; background: var(--bzr-ink); transform: translateX(-1px); }
.bzr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--bzr-ink-faint); margin-top: 3px; }

.bzr-yongshen { display: flex; justify-content: center; gap: 8px; }
.bzr-yongshen-char {
  width: 30px; height: 30px;
  border: 1.5px solid var(--bzr-ink);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}

.bzr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.bzr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bzr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.bzr-wuxing-name { width: 12px; color: var(--bzr-ink-soft); }
.bzr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--bzr-line-soft); }
.bzr-wuxing-bar { display: block; height: 100%; }
.bzr-wuxing-pct { width: 28px; text-align: right; color: var(--bzr-ink-faint); }

/* ---------- 八字盘 ---------- */
.bzr-pan { padding: 12px; }
.bzr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bzr-pan-note { margin-top: 8px; font-size: 11px; color: var(--bzr-accent-soft); }
.bzr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.bzr-pillar { border: 1px solid var(--bzr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.bzr-pillar-head { font-size: 9px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-pillar-shishen { font-size: 10px; color: var(--bzr-accent-soft); min-height: 14px; }
.bzr-pillar-gan { font-size: 26px; font-weight: 700; line-height: 1.2; }
.bzr-pillar-zhi { font-size: 26px; font-weight: 700; line-height: 1.2; color: var(--bzr-ink-soft); }
.bzr-pillar-rimu { color: var(--bzr-accent); }
.bzr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--bzr-ink-faint); line-height: 1.5; min-height: 42px; }
.bzr-pillar-canggan i { font-style: normal; opacity: 0.7; }

.bzr-dayun { margin-top: 10px; }
.bzr-dayun-title { font-size: 10px; color: var(--bzr-ink-faint); margin-bottom: 4px; letter-spacing: 1px; }
.bzr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.bzr-dayun-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--bzr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.bzr-dayun-current { border-color: var(--bzr-accent); background: rgba(140, 47, 38, 0.05); }
.bzr-dayun-gz { font-size: 12px; font-weight: 700; }
.bzr-dayun-age { font-size: 8px; color: var(--bzr-ink-faint); }
.bzr-dayun-year { font-size: 9px; color: var(--bzr-ink-faint); }

/* ---------- AI 章节通用 ---------- */
.bzr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
}
.bzr-ai-no { font-size: 11px; color: #f5efe0; background: var(--bzr-ink); padding: 2px 6px; letter-spacing: 1px; }
.bzr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bzr-ink-soft); margin: 0; }
.bzr-chart-sub { margin: -2px 0 12px; font-size: 10.5px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-pending { color: var(--bzr-ink-faint); font-style: italic; font-size: 12.5px; margin: 0; }

/* ---------- 四维度卡 ---------- */
.bzr-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.bzr-tag {
  font-size: 10px; padding: 1px 8px;
  border: 1px solid var(--bzr-line);
  color: var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.06);
  border-radius: 2px; letter-spacing: 1px;
}
.bzr-dim-summary { margin: 0 0 6px; font-size: 12.5px; font-weight: 700; color: var(--bzr-ink); line-height: 1.7; }
.bzr-dim-extra { margin-top: 10px; border: 1px dashed var(--bzr-line); background: rgba(255, 255, 255, 0.45); padding: 8px 10px; }
.bzr-dim-extra-label { font-size: 10px; color: var(--bzr-ink-faint); letter-spacing: 1px; margin-bottom: 3px; }
.bzr-dim-extra-value { font-size: 12px; color: var(--bzr-ink-soft); line-height: 1.6; }

/* ---------- 雷达图区 ---------- */
.bzr-wuxing-chart { display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px; align-items: center; }
.bzr-radar-wrap { position: relative; height: 240px; max-width: 320px; margin: 0 auto; width: 100%; }
.bzr-wuxing-side { min-width: 0; }
.bzr-analysis-text { margin: 0; font-size: 12.5px; line-height: 1.8; color: var(--bzr-ink-soft); }
.bzr-wuxing-legend { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px 12px; }
.bzr-wuxing-legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--bzr-ink-soft); }

.bzr-dimscore { display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px; align-items: center; }
.bzr-dimscore-list { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.bzr-dimscore-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.bzr-dimscore-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bzr-dimscore-name { width: 44px; color: var(--bzr-ink-soft); flex-shrink: 0; }
.bzr-dimscore-bar-wrap { flex: 1; height: 7px; background: var(--bzr-line-soft); display: block; }
.bzr-dimscore-bar { display: block; height: 100%; transition: width 0.7s ease-out; }
.bzr-dimscore-score { width: 24px; text-align: right; font-weight: 700; flex-shrink: 0; }
.bzr-dimscore-level {
  width: 30px; text-align: center; flex-shrink: 0;
  font-size: 9px; color: var(--bzr-ink-faint);
  border: 1px solid var(--bzr-line-soft);
  padding: 1px 0; letter-spacing: 1px;
}

/* ---------- 大运蜡烛图 ---------- */
.bzr-legend { display: flex; gap: 16px; font-size: 10px; color: var(--bzr-ink-faint); margin-bottom: 10px; flex-wrap: wrap; }
.bzr-legend-item { display: inline-flex; align-items: center; gap: 5px; }
.bzr-legend-swatch { width: 10px; height: 12px; display: inline-block; border-radius: 1px; }
.bzr-legend-rise { background: #4a7c59; }
.bzr-legend-fall { background: #a8512e; }
.bzr-legend-current { background: transparent; border: 1.5px solid var(--bzr-star); }

.bzr-candle-scroll { overflow-x: auto; }
.bzr-candle-inner { min-width: 560px; }
.bzr-candle-chart { display: flex; }
.bzr-candle-y { width: 36px; position: relative; flex-shrink: 0; }
.bzr-candle-tick { position: absolute; right: 6px; font-size: 9px; color: var(--bzr-ink-faint); line-height: 1; transform: translateY(-50%); }
.bzr-candle-body { flex: 1; position: relative; }
.bzr-candle-grid { position: absolute; inset: 0; pointer-events: none; }
.bzr-candle-gridline { position: absolute; left: 0; right: 0; border-top: 1px solid var(--bzr-line-soft); }
.bzr-candle-items { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: space-around; padding: 0 4px; }
.bzr-candle-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
.bzr-candle-stick { position: relative; width: 24px; }
.bzr-candle-shadow { position: absolute; left: 50%; transform: translateX(-50%); width: 2px; background: rgba(74, 124, 89, 0.55); }
.bzr-candle-shadow.bzr-candle-down { background: rgba(168, 81, 46, 0.55); }
.bzr-candle-shadow.bzr-candle-cur { background: rgba(140, 108, 31, 0.65); }
.bzr-candle-bar { position: absolute; left: 50%; transform: translateX(-50%); width: 14px; border-radius: 1px; background: rgba(74, 124, 89, 0.75); }
.bzr-candle-bar.bzr-candle-down { background: rgba(168, 81, 46, 0.7); }
.bzr-candle-bar.bzr-candle-cur { background: rgba(140, 108, 31, 0.85); border: 1.5px solid var(--bzr-star); }

.bzr-candle-x { display: flex; margin-top: 6px; }
.bzr-candle-y-space { width: 36px; flex-shrink: 0; }
.bzr-candle-x-items { flex: 1; display: flex; justify-content: space-around; padding: 0 4px; }
.bzr-candle-x-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
.bzr-candle-change { font-size: 9px; font-weight: 700; padding: 0 4px; margin-bottom: 2px; background: rgba(74, 124, 89, 0.12); color: var(--bzr-green); border-radius: 2px; }
.bzr-candle-change.bzr-candle-change-down { background: rgba(168, 81, 46, 0.12); color: var(--bzr-accent-soft); }
.bzr-candle-change.bzr-candle-change-cur { background: rgba(140, 108, 31, 0.16); color: var(--bzr-star); }
.bzr-candle-gz { font-size: 11px; font-weight: 700; color: var(--bzr-ink-soft); }
.bzr-candle-gz.bzr-candle-gz-cur { color: var(--bzr-star); }
.bzr-candle-age { font-size: 8px; color: var(--bzr-ink-faint); margin-top: 1px; }

/* ---------- 表格 ---------- */
.bzr-table-wrap { overflow-x: auto; margin-top: 14px; }
.bzr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.bzr-table th, .bzr-table td {
  border: 1px solid var(--bzr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.bzr-table thead th { background: var(--bzr-line-soft); font-weight: 700; color: var(--bzr-ink); text-align: center; letter-spacing: 1px; }
.bzr-table td { color: var(--bzr-ink-soft); }
.bzr-table-gz { font-weight: 700; color: var(--bzr-ink) !important; white-space: nowrap; }
.bzr-table-bar { width: 56px; display: inline-block; vertical-align: middle; margin-right: 6px; }

.bzr-mark { display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 2px; letter-spacing: 1px; white-space: nowrap; }
.bzr-mark-same { background: rgba(74, 124, 89, 0.14); color: var(--bzr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bzr-mark-partial { background: rgba(140, 108, 31, 0.1); color: var(--bzr-star); border: 1px solid rgba(140, 108, 31, 0.35); }
.bzr-mark-conflict { background: rgba(140, 47, 38, 0.12); color: var(--bzr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 历史事件时间轴 ---------- */
.bzr-hist { position: relative; }
.bzr-hist-line { position: absolute; left: 26px; top: 6px; bottom: 6px; width: 1px; background: var(--bzr-line); }
.bzr-hist-items { display: flex; flex-direction: column; gap: 10px; }
.bzr-hist-item {
  position: relative;
  border: 1px solid var(--bzr-line-soft);
  background: rgba(255, 255, 255, 0.45);
  padding: 8px 12px;
  margin-left: 40px;
}
.bzr-hist-item::before {
  content: '';
  position: absolute;
  left: -18px; top: 12px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--bzr-accent-soft);
  border: 1.5px solid var(--bzr-sheet);
}
.bzr-hist-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 3px; }
.bzr-hist-age {
  position: absolute; left: -40px; top: 8px;
  width: 30px; text-align: center;
  font-size: 10px; font-weight: 700; color: var(--bzr-accent);
}
.bzr-hist-year { font-size: 10px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-hist-desc { margin: 0; font-size: 12px; color: var(--bzr-ink-soft); line-height: 1.7; }

/* ---------- 格局与岁运 ---------- */
.bzr-det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-det { border: 1px dashed var(--bzr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bzr-det-title { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--bzr-accent-soft); letter-spacing: 1px; }
.bzr-det-body { margin: 0; font-size: 11.5px; line-height: 1.75; color: var(--bzr-ink-soft); }

/* ---------- 综合建议 ---------- */
.bzr-advice { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-advice-item {
  display: flex; gap: 8px; align-items: flex-start;
  border: 1px solid var(--bzr-line-soft);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 12px;
}
.bzr-advice-num {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--bzr-ink); color: #f5efe0;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.bzr-advice-text { margin: 0; font-size: 12px; color: var(--bzr-ink-soft); line-height: 1.7; }

/* ---------- 状态提示 ---------- */
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
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bzr-foot-note { font-size: 10px; color: var(--bzr-ink-faint); }
.bzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-core-grid { grid-template-columns: repeat(2, 1fr); }
}

.bzr-pan, .bzr-ai, .bzr-bazi, .bzr-bazi-grid, .bzr-dayun, .bzr-wuxing-chart, .bzr-dimscore { min-width: 0; }

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-title { font-size: 22px; letter-spacing: 2px; }
  .bzr-core-grid { grid-template-columns: 1fr 1fr; }
  .bzr-wuxing-chart, .bzr-dimscore { grid-template-columns: 1fr; }
  .bzr-det-grid { grid-template-columns: 1fr; }
  .bzr-advice { grid-template-columns: 1fr; }

  .bzr-pillar-gan, .bzr-pillar-zhi { font-size: 19px; }
  .bzr-pillar-shishen { font-size: 9px; }
  .bzr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .bzr-pillar-head { font-size: 8px; }

  .bzr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bzr-dayun-item { flex: 0 0 auto; min-width: 48px; }

  .bzr-table { min-width: 560px; }
}
</style>
