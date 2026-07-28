<template>
  <div class="zyr">
    <div class="zyr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zyr-head">
        <div class="zyr-head-top">
          <div class="zyr-brand">
            <div class="zyr-seal">{{ $t('baziZhengyuan.report.seal') }}</div>
            <span class="zyr-brand-name">{{ $t('baziZhengyuan.report.brandName') }}</span>
          </div>
          <div class="zyr-head-right">
            <span class="zyr-time">{{ $t('baziZhengyuan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zyr-verdict">✓ {{ verdictText }}</span>
          </div>
        </div>

        <h1 class="zyr-title">{{ titleText }}</h1>
        <p class="zyr-subtitle">{{ subtitleText }}</p>

        <div class="zyr-head-bottom">
          <p class="zyr-meta-line">
            {{ result.profile.name ? $t('baziZhengyuan.nameLabel') + '：' + result.profile.name + ' · ' : '' }}{{ $t('baziZhengyuan.birthDateLabel') }}：{{ result.profile.birthDate }} · {{ genderText }}
          </p>
          <p class="zyr-meta-line">{{ $t('baziZhengyuan.resultSubtitle', { riZhu: result.riZhu, strength: result.riZhuStrength }) }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 画像速览 ============ -->
      <section class="zyr-row zyr-row-top">
        <div class="zyr-card zyr-profile">
          <div class="zyr-profile-line">
            <span class="zyr-ico">☀</span>
            <span class="zyr-profile-label">{{ $t('baziZhengyuan.report.solarLabel') }}</span>
            <span class="zyr-profile-value">{{ solarText }}</span>
          </div>
          <div class="zyr-profile-line">
            <span class="zyr-ico">⚥</span>
            <span class="zyr-profile-label">{{ $t('baziZhengyuan.report.genderLabel') }}</span>
            <span class="zyr-profile-value">{{ genderText }}</span>
          </div>
          <div class="zyr-profile-line">
            <span class="zyr-ico">♒</span>
            <span class="zyr-profile-label">{{ $t('baziZhengyuan.report.ageLabel') }}</span>
            <span class="zyr-profile-value">{{ ageText }}</span>
          </div>
          <div class="zyr-profile-line">
            <span class="zyr-ico">❖</span>
            <span class="zyr-profile-label">{{ $t('baziZhengyuan.report.dayunLabel') }}</span>
            <span class="zyr-profile-value">{{ currentDayunText }}</span>
          </div>
        </div>

        <div class="zyr-card">
          <h3 class="zyr-card-title">{{ $t('baziZhengyuan.report.overviewTitle') }}</h3>
          <div class="zyr-overview-grid">
            <div class="zyr-mini">
              <h4 class="zyr-mini-head zyr-mini-head-star">♡ {{ $t('baziZhengyuan.report.timingLabel') }}</h4>
              <p class="zyr-mini-body">{{ $t(`baziZhengyuan.timing.${marriage.marriageTiming.tendency}`) }}</p>
              <p v-if="marriage.marriageTiming.signals.length" class="zyr-mini-desc">
                {{ marriage.marriageTiming.signals.slice(0, 2).join('；') }}
              </p>
            </div>
            <div class="zyr-mini">
              <h4 class="zyr-mini-head zyr-mini-head-star">✿ {{ $t('baziZhengyuan.report.spouseStarLabel') }}</h4>
              <p class="zyr-mini-body">
                {{ marriage.spouseStar.kind }}（{{ marriage.spouseStar.wuxing }}）· {{ $t(`baziZhengyuan.starStrength.${marriage.spouseStar.strength}`) }}
              </p>
              <p class="zyr-mini-desc">
                {{ marriage.spouseStar.isFavorable ? $t('baziZhengyuan.starFavorable') : $t('baziZhengyuan.starNotFavorable') }}
                <template v-if="marriage.spouseStar.locations.length"> · {{ marriage.spouseStar.locations.join('、') }}</template>
              </p>
            </div>
            <div class="zyr-mini">
              <h4 class="zyr-mini-head">❀ {{ $t('baziZhengyuan.report.peachLabel') }}</h4>
              <p class="zyr-mini-body">
                {{ marriage.peachBlossom.star }}
                <template v-if="marriage.peachBlossom.positions.length"> · {{ $t('baziZhengyuan.peachIn', { pillars: marriage.peachBlossom.positions.join('、') }) }}</template>
                <template v-else> · {{ $t('baziZhengyuan.peachAbsent') }}</template>
              </p>
              <p v-if="marriage.peachBlossom.innerWall || marriage.peachBlossom.outerWall" class="zyr-mini-desc">
                <template v-if="marriage.peachBlossom.innerWall">{{ $t('baziZhengyuan.peachInner') }}</template>
                <template v-if="marriage.peachBlossom.innerWall && marriage.peachBlossom.outerWall"> · </template>
                <template v-if="marriage.peachBlossom.outerWall">{{ $t('baziZhengyuan.peachOuter') }}</template>
              </p>
            </div>
            <div class="zyr-mini">
              <h4 class="zyr-mini-head">✦ {{ $t('baziZhengyuan.report.hongluanLabel') }}</h4>
              <p class="zyr-mini-body">
                {{ $t('baziZhengyuan.hongLuanLabel') }} {{ marriage.hongLuan.star }}<template v-if="marriage.hongLuan.palace">（{{ $t('baziZhengyuan.starInPalace', { palace: marriage.hongLuan.palace }) }}）</template>
              </p>
              <p class="zyr-mini-desc">
                {{ $t('baziZhengyuan.tianXiLabel') }} {{ marriage.tianXi.star }}<template v-if="marriage.tianXi.palace">（{{ $t('baziZhengyuan.starInPalace', { palace: marriage.tianXi.palace }) }}）</template>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 命局核心数据 ============ -->
      <section class="zyr-section">
        <h3 class="zyr-section-title">{{ $t('baziZhengyuan.report.coreDataTitle') }}</h3>
        <div class="zyr-core-grid">
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('baziZhengyuan.report.gejuLabel') }}</div>
            <div class="zyr-core-value zyr-core-value-sm">{{ result.geju }}</div>
            <div class="zyr-core-sub">{{ $t('baziZhengyuan.report.xiyongPrefix') }}{{ result.xiyong }}</div>
          </div>
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('baziZhengyuan.report.wangshaiLabel') }}</div>
            <div class="zyr-core-value">{{ result.riZhuStrength }}</div>
            <div class="zyr-gauge">
              <div class="zyr-gauge-track">
                <span class="zyr-gauge-zone zyr-gauge-zone-weak" />
                <span class="zyr-gauge-zone zyr-gauge-zone-mid" />
                <span class="zyr-gauge-zone zyr-gauge-zone-strong" />
                <span class="zyr-gauge-pointer" :style="{ left: gaugePos + '%' }" />
              </div>
              <div class="zyr-gauge-marks">
                <span>{{ $t('baziZhengyuan.report.weakLabel') }}</span>
                <span>{{ $t('baziZhengyuan.report.midLabel') }}</span>
                <span>{{ $t('baziZhengyuan.report.strongLabel') }}</span>
              </div>
            </div>
          </div>
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('baziZhengyuan.report.yuelingLabel') }}</div>
            <div class="zyr-yueling">
              <span v-for="(w, i) in yuelingList" :key="i" class="zyr-yueling-item">
                <em class="zyr-yueling-char">{{ w.char }}</em><i class="zyr-yueling-state">{{ w.state }}</i>
              </span>
            </div>
          </div>
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('baziZhengyuan.report.wuxingLabel') }}</div>
            <div class="zyr-wuxing">
              <div v-for="w in wuxingList" :key="w.name" class="zyr-wuxing-row">
                <span class="zyr-wuxing-dot" :style="{ background: w.color }" />
                <span class="zyr-wuxing-name">{{ w.name }}</span>
                <span class="zyr-wuxing-bar-wrap"><span class="zyr-wuxing-bar" :style="{ width: w.pct + '%', background: w.color }" /></span>
                <span class="zyr-wuxing-pct">{{ w.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 四柱盘 ============ -->
      <section class="zyr-section">
        <div class="zyr-card zyr-pan">
          <h3 class="zyr-pan-title">{{ $t('baziZhengyuan.report.baziPanTitle') }}</h3>
          <div class="zyr-bazi-grid">
            <div v-for="p in pillars" :key="p.label" class="zyr-pillar">
              <div class="zyr-pillar-head">{{ p.label }}</div>
              <div class="zyr-pillar-shishen">{{ p.shishen }}</div>
              <div class="zyr-pillar-gan" :class="{ 'zyr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
              <div class="zyr-pillar-zhi" :class="{ 'zyr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
              <div class="zyr-pillar-canggan">
                <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
              </div>
            </div>
          </div>

          <!-- 大运 -->
          <div v-if="chart.dayuns?.length" class="zyr-dayun">
            <div class="zyr-dayun-title">{{ $t('baziZhengyuan.report.dayunTitle', { age: chart.qiyunAge }) }}</div>
            <div class="zyr-dayun-row">
              <div
                v-for="d in chart.dayuns"
                :key="d.index"
                class="zyr-dayun-item"
                :class="{ 'zyr-dayun-current': d === chart.currentDaYun }"
              >
                <span class="zyr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                <span class="zyr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
              </div>
            </div>
          </div>

          <!-- 流年 -->
          <div class="zyr-dayun">
            <div class="zyr-dayun-title">{{ $t('baziZhengyuan.report.liunianTitle') }}</div>
            <div class="zyr-dayun-row">
              <div
                v-for="ln in liunianList"
                :key="ln.year"
                class="zyr-dayun-item"
                :class="{ 'zyr-dayun-current': ln.current }"
              >
                <span class="zyr-dayun-year">{{ ln.year }}</span>
                <span class="zyr-dayun-gz">{{ ln.ganZhi }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 婚恋命盘详析 ============ -->
      <section class="zyr-section">
        <h3 class="zyr-section-title">{{ $t('baziZhengyuan.report.marriageTitle') }}</h3>
        <div class="zyr-marriage-grid">
          <!-- 夫妻宫 -->
          <div class="zyr-card zyr-mcard">
            <div class="zyr-mcard-label">{{ $t('baziZhengyuan.spousePalaceLabel') }}</div>
            <div class="zyr-mcard-value">{{ marriage.spousePalace.zhi }}（{{ marriage.spousePalace.wuxing }}）</div>
            <div class="zyr-mcard-tags">
              <span class="zyr-tag">{{ $t('baziZhengyuan.sitsOn', { shishen: marriage.spousePalace.shiShen }) }}</span>
              <span v-for="h in marriage.spousePalace.heWith" :key="'he' + h" class="zyr-tag zyr-tag-good">{{ $t('baziZhengyuan.heWith', { pillars: h }) }}</span>
              <span v-for="c in marriage.spousePalace.chongBy" :key="'chong' + c" class="zyr-tag zyr-tag-warn">{{ $t('baziZhengyuan.chongBy', { pillars: c }) }}</span>
              <span v-if="marriage.spousePalace.peachBlossom" class="zyr-tag zyr-tag-peach">{{ $t('baziZhengyuan.report.peachSeatTag') }}</span>
            </div>
          </div>

          <!-- 配偶细节 -->
          <div class="zyr-card zyr-mcard">
            <div class="zyr-mcard-label">{{ $t('baziZhengyuan.report.spouseDetailsLabel') }}</div>
            <div class="zyr-mcard-value zyr-mcard-value-sm">{{ marriage.spouseDetails.appearance }}</div>
            <div class="zyr-mcard-tags">
              <span class="zyr-tag">{{ $t(`baziZhengyuan.report.ageGap.${marriage.spouseDetails.ageGap}`) }}</span>
              <span class="zyr-tag" :class="marriage.spouseDetails.supportiveness === 'supportive' ? 'zyr-tag-good' : marriage.spouseDetails.supportiveness === 'draining' ? 'zyr-tag-warn' : ''">{{ $t(`baziZhengyuan.report.support.${marriage.spouseDetails.supportiveness}`) }}</span>
              <span class="zyr-tag">{{ $t(`baziZhengyuan.report.channel.${marriage.spouseDetails.meetChannel}`) }}</span>
            </div>
            <p class="zyr-mcard-note">{{ $t('baziZhengyuan.directionLabel') }}{{ marriage.spouseDetails.direction }}</p>
          </div>

          <!-- 相处模式 -->
          <div class="zyr-card zyr-mcard">
            <div class="zyr-mcard-label">{{ $t('baziZhengyuan.report.dynamicsLabel') }}</div>
            <div class="zyr-mcard-value zyr-mcard-value-sm">{{ $t(`baziZhengyuan.report.pattern.${marriage.relationshipDynamics.pattern}`) }}</div>
            <p class="zyr-mcard-note">{{ marriage.relationshipDynamics.note }}</p>
          </div>

          <!-- 稳定性信号 -->
          <div class="zyr-card zyr-mcard">
            <div class="zyr-mcard-label">{{ $t('baziZhengyuan.report.stabilityLabel') }}</div>
            <div class="zyr-stab">
              <div class="zyr-stab-col">
                <div class="zyr-stab-head zyr-stab-head-good">＋ {{ $t('baziZhengyuan.report.goodSignalsLabel') }}</div>
                <ul class="zyr-stab-list">
                  <li v-for="(s, i) in marriage.stability.goodSignals.slice(0, 3)" :key="i">{{ s }}</li>
                  <li v-if="!marriage.stability.goodSignals.length" class="zyr-stab-empty">{{ $t('baziZhengyuan.report.noSignal') }}</li>
                </ul>
              </div>
              <div class="zyr-stab-col">
                <div class="zyr-stab-head zyr-stab-head-warn">－ {{ $t('baziZhengyuan.report.riskSignalsLabel') }}</div>
                <ul class="zyr-stab-list">
                  <li v-for="(s, i) in marriage.stability.riskSignals.slice(0, 3)" :key="i">{{ s }}</li>
                  <li v-if="!marriage.stability.riskSignals.length" class="zyr-stab-empty">{{ $t('baziZhengyuan.report.noSignal') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 应期年份柱状图 -->
        <div class="zyr-card zyr-timing">
          <h4 class="zyr-timing-title">{{ $t('baziZhengyuan.timingYearsTitle') }}</h4>
          <div class="zyr-timing-chart">
            <div
              v-for="y in marriage.timingYears"
              :key="y.year"
              class="zyr-timing-col"
            >
              <span class="zyr-timing-score" :class="{ 'zyr-timing-score-hot': y.score >= 4 }">{{ y.score >= 3 ? y.score : '' }}</span>
              <div
                class="zyr-timing-bar"
                :class="y.score >= 4 ? 'zyr-timing-bar-hot' : y.score >= 3 ? 'zyr-timing-bar-mid' : 'zyr-timing-bar-low'"
                :style="{ height: `${8 + y.score * 16}px` }"
              />
              <span class="zyr-timing-year">{{ y.year }}</span>
              <span class="zyr-timing-gz">{{ y.ganZhi }}</span>
            </div>
          </div>
          <div v-if="topTimingYears.length" class="zyr-timing-tops">
            <span class="zyr-timing-tops-label">{{ $t('baziZhengyuan.report.topYearsLabel') }}</span>
            <span v-for="y in topTimingYears" :key="y.year" class="zyr-tag zyr-tag-good">
              {{ y.year }}（{{ y.ganZhi }}，{{ $t('baziZhengyuan.ageSuffix', { age: y.age }) }}）
            </span>
            <span v-if="topTimingYears[0]?.reasons.length" class="zyr-timing-tops-reasons">
              {{ topTimingYears[0]!.reasons.join('、') }}
            </span>
          </div>
        </div>
      </section>

      <!-- ============ AI 解读章节 01-04 ============ -->
      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">01</span>{{ $t('baziZhengyuan.report.secTiming') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['正缘出现时间'])" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">02</span>{{ $t('baziZhengyuan.report.secSigns') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['正缘出现征兆'])" />
        </div>
      </section>

      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">03</span>{{ $t('baziZhengyuan.report.secPortrait') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['正缘画像'])" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">04</span>{{ $t('baziZhengyuan.report.secTone') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['婚姻基调与稳定性'])" />
        </div>
      </section>

      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">05</span>{{ $t('baziZhengyuan.report.secPeach') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['桃花与异性缘'])" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">06</span>{{ $t('baziZhengyuan.report.secDetails') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['正缘细节补充'])" />
        </div>
      </section>

      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">07</span>{{ $t('baziZhengyuan.report.secStuck') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['感情卡点与化解'])" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">08</span>{{ $t('baziZhengyuan.report.secMurmur') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(aiSections['隐士的碎碎念'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zyr-streaming">
        <span class="zyr-streaming-dot" />
        {{ $t('baziZhengyuan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zyr-error">
        <p>{{ error }}</p>
        <button type="button" class="zyr-retry" @click="$emit('retry')">{{ $t('baziZhengyuan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zyr-foot">
        <span class="zyr-foot-note">ⓘ {{ $t('baziZhengyuan.report.footerNote') }}</span>
        <span class="zyr-seal zyr-seal-foot">{{ $t('baziZhengyuan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { BaziZhengyuanCalcResult } from '~/types/bazi-zhengyuan'
import type { TianGan, DiZhi } from '~/types/user'
import { getShiShenFull } from '~/utils/bazi/shishen'

interface Props {
  result: BaziZhengyuanCalcResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

const chart = computed(() => props.result.chart)
const marriage = computed(() => props.result.marriage)

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const birthYear = computed(() => Number(props.result.profile.birthDate.split('-')[0] || 0))

const ageText = computed(() =>
  t('baziZhengyuan.report.ageValue', { age: Math.max(new Date().getFullYear() - birthYear.value, 0), year: new Date().getFullYear() }))

const genderText = computed(() =>
  props.result.profile.gender === 'male' ? t('baziZhengyuan.report.genderMale') : t('baziZhengyuan.report.genderFemale'))

const solarText = computed(() => {
  const h = props.result.profile.birthHour ? t('baziZhengyuan.report.hourSuffix', { hour: props.result.profile.birthHour }) : ''
  return `${props.result.profile.birthDate}${h}`
})

const currentDayunText = computed(() => {
  const d = chart.value.currentDaYun
  return d ? `${d.gan}${d.zhi}（${d.ageRange[0]}-${d.ageRange[1]}${t('baziZhengyuan.report.ageUnit')}）` : '—'
})

const verdictText = computed(() => t(`baziZhengyuan.report.verdict.${marriage.value.marriageTiming.tendency}`))

const titleText = computed(() => {
  const m = marriage.value
  return m.spouseStar.found
    ? t('baziZhengyuan.report.titleWithStar', { riZhu: props.result.riZhu, star: m.spouseStar.kind })
    : t('baziZhengyuan.report.titleNoStar', { riZhu: props.result.riZhu })
})

const subtitleText = computed(() => t('baziZhengyuan.report.subtitle', {
  direction: marriage.value.spouseDetails.direction,
  timing: t(`baziZhengyuan.timing.${marriage.value.marriageTiming.tendency}`),
}))

const gaugePos = computed(() => {
  const map: Record<string, number> = { 从弱: 8, 身弱: 32, 身旺: 68, 从强: 92 }
  return map[props.result.riZhuStrength] ?? 50
})

/** 月令旺相：由月支季节推导五行旺衰（死/囚/休/相/旺） */
const ZHI_WUXING: Record<string, string> = {
  寅: '木', 卯: '木', 巳: '火', 午: '火', 申: '金', 酉: '金',
  亥: '水', 子: '水', 辰: '土', 戌: '土', 丑: '土', 未: '土',
}
const WX_SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const WX_KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const yuelingList = computed(() => {
  const season = ZHI_WUXING[chart.value.month.zhi] ?? '土'
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
    pct: Math.round(chart.value.wuxingScore?.[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

/** 四柱 */
const pillars = computed(() => {
  const c = chart.value
  const riZhu = props.result.riZhu
  const mk = (label: string, p: typeof c.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('baziZhengyuan.report.rizhuTag') : (p ? getShiShenFull(riZhu, p.gan) : '—'),
    canggan: (p as any)?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('baziZhengyuan.yearPillar'), c.year),
    mk(t('baziZhengyuan.monthPillar'), c.month),
    mk(t('baziZhengyuan.dayPillar'), c.day, true),
    mk(t('baziZhengyuan.hourPillar'), c.hour ?? null),
  ]
})

/** 流年（当前年前后各五年） */
const GAN_LIST: TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI_LIST: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const liunianList = computed(() => {
  const now = new Date().getFullYear()
  const out: { year: number; ganZhi: string; current: boolean }[] = []
  for (let y = now - 5; y <= now + 4; y++) {
    // 1984 = 甲子
    const idx = ((y - 1984) % 60 + 60) % 60
    out.push({ year: y, ganZhi: `${GAN_LIST[idx % 10]}${ZHI_LIST[idx % 12]}`, current: y === now })
  }
  return out
})

/** 应期高分年份（评分 ≥3，取前 3 个） */
const topTimingYears = computed(() =>
  marriage.value.timingYears.filter(y => y.score >= 3).slice(0, 3))

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
    return `<p class="zyr-pending">${t('baziZhengyuan.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.zyr {
  --zyr-bg: #f2ede3;
  --zyr-sheet: #faf6ec;
  --zyr-card: #fffdf6;
  --zyr-ink: #2e2a24;
  --zyr-ink-soft: #55503f;
  --zyr-ink-faint: #8a8272;
  --zyr-line: #d8d0bd;
  --zyr-line-soft: #e6dfcd;
  --zyr-accent: #8c2f26;
  --zyr-accent-soft: #a8512e;
  --zyr-star: #8c6d1f;
  --zyr-green: #4a7c59;
  border-radius: 12px;
  background: var(--zyr-bg);
  padding: 18px;
  color: var(--zyr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zyr-sheet {
  background: var(--zyr-sheet);
  border: 1px solid var(--zyr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zyr-head { border-bottom: 2px solid var(--zyr-ink); padding-bottom: 16px; }
.zyr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zyr-brand { display: flex; align-items: center; gap: 8px; }
.zyr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zyr-accent);
  color: var(--zyr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zyr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zyr-ink-soft); }
.zyr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zyr-ink-faint); }
.zyr-verdict { color: var(--zyr-green); font-weight: 600; }

.zyr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.zyr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zyr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zyr-head-bottom { text-align: center; }
.zyr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zyr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zyr-row { display: grid; gap: 14px; margin-top: 16px; }
.zyr-row-top { grid-template-columns: 1fr 2.6fr; }
.zyr-ai-row { grid-template-columns: 1fr 1fr; }
.zyr-section { margin-top: 16px; }

.zyr-card {
  background: var(--zyr-card);
  border: 1px solid var(--zyr-line);
  padding: 14px 16px;
}
.zyr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--zyr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.zyr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 命主信息卡 ---------- */
.zyr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.zyr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.zyr-ico { color: var(--zyr-accent-soft); font-size: 12px; }
.zyr-profile-label { color: var(--zyr-ink-faint); min-width: 30px; }
.zyr-profile-value { color: var(--zyr-ink); letter-spacing: 0.5px; }

/* ---------- 画像速览 ---------- */
.zyr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.zyr-mini { border: 1px dashed var(--zyr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.zyr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--zyr-accent-soft); letter-spacing: 1px; }
.zyr-mini-head-star { color: var(--zyr-star); }
.zyr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--zyr-ink); font-weight: 600; }
.zyr-mini-desc { margin: 3px 0 0; font-size: 11px; line-height: 1.6; color: var(--zyr-ink-faint); }

/* ---------- 核心数据四卡 ---------- */
.zyr-core-grid { display: grid; grid-template-columns: 1.1fr 1.3fr 1.2fr 1.5fr; gap: 10px; }
.zyr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.zyr-core-label { font-size: 11px; color: var(--zyr-ink-faint); letter-spacing: 1px; }
.zyr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.zyr-core-value-sm { font-size: 16px; letter-spacing: 1px; }
.zyr-core-sub { font-size: 10px; color: var(--zyr-ink-faint); }

.zyr-gauge { margin-top: 4px; }
.zyr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--zyr-line); overflow: hidden; }
.zyr-gauge-zone { height: 100%; }
.zyr-gauge-zone-weak { flex: 35; background: linear-gradient(90deg, #b8cdc0, #d9e4dc); }
.zyr-gauge-zone-mid { flex: 30; background: #efe9d8; }
.zyr-gauge-zone-strong { flex: 35; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.zyr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--zyr-ink); transform: translateX(-1px);
}
.zyr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--zyr-ink-faint); margin-top: 3px; }

.zyr-yueling { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; align-items: baseline; }
.zyr-yueling-item { display: inline-flex; align-items: baseline; gap: 2px; }
.zyr-yueling-char { font-style: normal; font-size: 15px; font-weight: 700; }
.zyr-yueling-state { font-style: normal; font-size: 11px; color: var(--zyr-ink-faint); }

.zyr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.zyr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zyr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.zyr-wuxing-name { width: 12px; color: var(--zyr-ink-soft); }
.zyr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--zyr-line-soft); }
.zyr-wuxing-bar { display: block; height: 100%; }
.zyr-wuxing-pct { width: 28px; text-align: right; color: var(--zyr-ink-faint); }

/* ---------- 八字盘 ---------- */
.zyr-pan { padding: 12px; }
.zyr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }

.zyr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.zyr-pillar { border: 1px solid var(--zyr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.zyr-pillar-head { font-size: 9px; color: var(--zyr-ink-faint); letter-spacing: 1px; }
.zyr-pillar-shishen { font-size: 10px; color: var(--zyr-accent-soft); min-height: 14px; }
.zyr-pillar-gan { font-size: 26px; font-weight: 700; line-height: 1.2; }
.zyr-pillar-zhi { font-size: 26px; font-weight: 700; line-height: 1.2; color: var(--zyr-ink-soft); }
.zyr-pillar-rimu { color: var(--zyr-accent); }
.zyr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--zyr-ink-faint); line-height: 1.5; min-height: 42px; }
.zyr-pillar-canggan i { font-style: normal; opacity: 0.7; }

.zyr-dayun { margin-top: 10px; }
.zyr-dayun-title { font-size: 10px; color: var(--zyr-ink-faint); margin-bottom: 4px; letter-spacing: 1px; }
.zyr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.zyr-dayun-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--zyr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.zyr-dayun-current { border-color: var(--zyr-accent); background: rgba(140, 47, 38, 0.05); }
.zyr-dayun-gz { font-size: 12px; font-weight: 700; }
.zyr-dayun-age { font-size: 8px; color: var(--zyr-ink-faint); }
.zyr-dayun-year { font-size: 9px; color: var(--zyr-ink-faint); }

/* ---------- 婚恋命盘详析 ---------- */
.zyr-marriage-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.zyr-mcard { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
.zyr-mcard-label { font-size: 11px; color: var(--zyr-ink-faint); letter-spacing: 1px; text-align: center; }
.zyr-mcard-value { font-size: 19px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zyr-mcard-value-sm { font-size: 14px; line-height: 1.5; }
.zyr-mcard-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.zyr-mcard-note { margin: 0; font-size: 10.5px; color: var(--zyr-ink-faint); line-height: 1.6; text-align: center; }

.zyr-tag {
  display: inline-block;
  font-size: 10px;
  padding: 1px 8px;
  border: 1px solid var(--zyr-line);
  color: var(--zyr-ink-soft);
  background: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.zyr-tag-good { background: rgba(74, 124, 89, 0.12); color: var(--zyr-green); border-color: rgba(74, 124, 89, 0.35); }
.zyr-tag-warn { background: rgba(140, 47, 38, 0.1); color: var(--zyr-accent); border-color: rgba(140, 47, 38, 0.3); }
.zyr-tag-peach { background: rgba(168, 81, 46, 0.12); color: var(--zyr-accent-soft); border-color: rgba(168, 81, 46, 0.35); }

.zyr-stab { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.zyr-stab-head { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
.zyr-stab-head-good { color: var(--zyr-green); }
.zyr-stab-head-warn { color: var(--zyr-accent); }
.zyr-stab-list { margin: 0; padding: 0; list-style: none; }
.zyr-stab-list li { font-size: 10.5px; color: var(--zyr-ink-soft); line-height: 1.6; }
.zyr-stab-empty { color: var(--zyr-ink-faint); font-style: italic; }

/* ---------- 应期年份柱状图 ---------- */
.zyr-timing { margin-top: 10px; }
.zyr-timing-title { margin: 0 0 12px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--zyr-ink-soft); text-align: center; }
.zyr-timing-chart {
  display: flex; align-items: flex-end; justify-content: center;
  gap: 8px;
  border-bottom: 1px solid var(--zyr-line);
  padding: 0 8px;
  overflow-x: auto;
}
.zyr-timing-col { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 0 0 auto; min-width: 34px; }
.zyr-timing-score { font-size: 9px; color: var(--zyr-ink-faint); min-height: 12px; }
.zyr-timing-score-hot { color: var(--zyr-accent); font-weight: 700; }
.zyr-timing-bar { width: 22px; }
.zyr-timing-bar-hot { background: linear-gradient(180deg, #a8512e, #8c2f26); }
.zyr-timing-bar-mid { background: #c9a86a; }
.zyr-timing-bar-low { background: var(--zyr-line); }
.zyr-timing-year { font-size: 10px; font-weight: 700; color: var(--zyr-ink); margin-top: 3px; }
.zyr-timing-gz { font-size: 9px; color: var(--zyr-ink-faint); }
.zyr-timing-tops {
  margin-top: 10px;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px;
}
.zyr-timing-tops-label { font-size: 10.5px; color: var(--zyr-ink-faint); letter-spacing: 1px; }
.zyr-timing-tops-reasons { font-size: 10px; color: var(--zyr-ink-faint); }

/* ---------- AI 章节 ---------- */
.zyr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zyr-line-soft);
  padding-bottom: 8px;
}
.zyr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zyr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zyr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zyr-ink-soft); }

.zyr-md :deep(p) { margin: 0 0 0.7em; }
.zyr-md :deep(p:last-child) { margin-bottom: 0; }
.zyr-md :deep(strong) { color: var(--zyr-ink); font-weight: 700; }
.zyr-md :deep(ul), .zyr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zyr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zyr-md :deep(h3), .zyr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zyr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zyr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--zyr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.zyr-md :deep(.zyr-pending), .zyr-pending { color: var(--zyr-ink-faint); font-style: italic; }

.zyr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zyr-ink-faint); letter-spacing: 1px;
}
.zyr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zyr-accent);
  animation: zyr-pulse 1s ease-in-out infinite;
}
@keyframes zyr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zyr-error { margin-top: 14px; text-align: center; color: var(--zyr-accent); font-size: 12px; }
.zyr-retry {
  margin-top: 8px;
  border: 1px solid var(--zyr-accent);
  background: transparent;
  color: var(--zyr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zyr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zyr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zyr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zyr-foot-note { font-size: 10px; color: var(--zyr-ink-faint); }
.zyr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zyr-row-top { grid-template-columns: 1fr; }
  .zyr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .zyr-marriage-grid { grid-template-columns: repeat(2, 1fr); }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.zyr-pan, .zyr-ai, .zyr-bazi-grid, .zyr-dayun, .zyr-timing, .zyr-mcard { min-width: 0; }

@media (max-width: 720px) {
  .zyr { padding: 8px; }
  .zyr-sheet { padding: 16px 12px; }
  .zyr-ai-row { grid-template-columns: 1fr; }
  .zyr-overview-grid { grid-template-columns: 1fr; }
  .zyr-title { font-size: 22px; letter-spacing: 2px; }
  .zyr-core-grid { grid-template-columns: 1fr 1fr; }
  .zyr-marriage-grid { grid-template-columns: 1fr; }

  .zyr-pan { padding: 8px; }
  .zyr-pillar-gan, .zyr-pillar-zhi { font-size: 19px; }
  .zyr-pillar-shishen { font-size: 9px; }
  .zyr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .zyr-pillar-head { font-size: 8px; }

  .zyr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .zyr-dayun-item { flex: 0 0 auto; min-width: 48px; }
}
</style>
