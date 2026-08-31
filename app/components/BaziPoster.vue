<template>
  <div class="bzp">
    <div class="bzp-sheet">
      <!-- 品牌栏 -->
      <header class="bzp-masthead">
        <div class="bzp-brand">
          <span class="bzp-seal">{{ $t('bazi.poster.seal') }}</span>
          <span class="bzp-brand-name">{{ $t('bazi.poster.brand') }}</span>
        </div>
        <div class="bzp-masthead-meta">
          <span>{{ generatedAt }}</span>
          <span>{{ $t('bazi.poster.issue') }}</span>
        </div>
      </header>

      <!-- 封面标题 -->
      <section class="bzp-cover">
        <div class="bzp-cover-main">
          <p class="bzp-kicker">BAZI · FOUR PILLARS</p>
          <h1 class="bzp-title">{{ name || $t('bazi.chartTitleNoName') }}</h1>
          <p class="bzp-subtitle">{{ $t('bazi.subtitle') }}</p>
        </div>
        <aside class="bzp-profile">
          <div class="bzp-profile-line">
            <span>{{ $t('profileForm.birthDate') }}</span>
            <strong>{{ birthText }}</strong>
          </div>
          <div class="bzp-profile-line">
            <span>{{ $t('profileForm.birthHour') }}</span>
            <strong>{{ birthHour || $t('common.unknown') }}</strong>
          </div>
          <div class="bzp-profile-line">
            <span>{{ $t('profileForm.gender') }}</span>
            <strong>{{ gender === 'male' ? $t('common.male') : $t('common.female') }}</strong>
          </div>
          <div class="bzp-profile-line">
            <span>{{ $t('bazi.panPreview') }}</span>
            <strong>{{ dayMaster }} · {{ chart.geju }}</strong>
          </div>
        </aside>
      </section>

      <!-- AI 总论：流式覆盖封面导语 -->
      <section class="bzp-lede">
        <span class="bzp-lede-mark">{{ $t('bazi.overviewTitle') }}</span>
        <p class="bzp-lede-text" :class="{ 'bzp-pending': !reading.overview }">
          {{ reading.overview || $t('bazi.aiInterpreting') }}
          <span v-if="streaming" class="bzp-caret" aria-hidden="true" />
        </p>
      </section>

      <!-- 四柱排盘 -->
      <section class="bzp-pillars">
        <div v-for="pillar in pillars" :key="pillar.label" class="bzp-pillar">
          <span class="bzp-pillar-label">{{ pillar.label }}</span>
          <span class="bzp-pillar-shishen">{{ pillar.shishen }}</span>
          <span class="bzp-pillar-gan">{{ pillar.gan }}</span>
          <span class="bzp-pillar-zhi">{{ pillar.zhi }}</span>
          <span class="bzp-pillar-canggan">{{ pillar.canggan }}</span>
        </div>
      </section>

      <!-- 核心判定 + 五行 -->
      <section class="bzp-core">
        <div class="bzp-core-grid">
          <div class="bzp-core-cell">
            <span>{{ $t('baziPan.riZhu') }}</span>
            <strong>{{ dayMaster }}</strong>
          </div>
          <div class="bzp-core-cell">
            <span>{{ $t('bazi.poster.strength') }}</span>
            <strong>{{ chart.riZhuStrength }}</strong>
          </div>
          <div class="bzp-core-cell">
            <span>{{ $t('bazi.gejuAnalysis') }}</span>
            <strong>{{ chart.geju }}</strong>
          </div>
          <div class="bzp-core-cell">
            <span>{{ $t('bazi.poster.xiyong') }}</span>
            <strong>{{ chart.xiyong }}</strong>
          </div>
          <div class="bzp-core-cell">
            <span>{{ $t('bazi.poster.jishen') }}</span>
            <strong>{{ chart.jishen }}</strong>
          </div>
        </div>

        <div class="bzp-wuxing">
          <div class="bzp-section-head">
            <span class="bzp-section-no">01</span>
            <h2>{{ $t('bazi.wuxingTitle') }}</h2>
          </div>
          <div class="bzp-wuxing-grid">
            <div v-for="item in wuxingList" :key="item.name" class="bzp-wuxing-row">
              <span class="bzp-wuxing-name">{{ item.name }}</span>
              <span class="bzp-wuxing-track">
                <span class="bzp-wuxing-fill" :style="{ width: `${item.value}%`, background: item.color }" />
              </span>
              <span class="bzp-wuxing-value">{{ item.value }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 本地确定性分析 -->
      <section class="bzp-analysis">
        <div class="bzp-section-head bzp-section-head-wide">
          <span class="bzp-section-no">02</span>
          <h2>{{ $t('bazi.comprehensiveAnalysis') }}</h2>
          <span class="bzp-section-note">{{ $t('bazi.aiDisclaimer') }}</span>
        </div>
        <div class="bzp-analysis-grid">
          <article v-for="(item, index) in analysisItems" :key="item.title" class="bzp-analysis-item">
            <div class="bzp-analysis-title">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <h3>{{ item.title }}</h3>
            </div>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </section>

      <!-- AI 结构化解读 -->
      <section class="bzp-reading">
        <div class="bzp-section-head bzp-section-head-wide">
          <span class="bzp-section-no">03</span>
          <h2>{{ $t('bazi.aiInterpret') }}</h2>
          <span v-if="streaming" class="bzp-live">
            <i />{{ $t('bazi.interpreting') }}
          </span>
        </div>

        <div v-if="error" class="bzp-error">
          <p>{{ error }}</p>
          <button type="button" @click="$emit('retry')">{{ $t('bazi.retry') }}</button>
        </div>

        <div v-else class="bzp-reading-grid">
          <article v-for="section in sections" :key="section.key" class="bzp-reading-card">
            <h3>{{ $t(`bazi.${section.titleKey}`) }}</h3>
            <p class="bzp-reading-summary">{{ section.summary || $t('bazi.aiInterpreting') }}</p>
            <p class="bzp-reading-detail">{{ section.detail }}</p>
            <div v-if="section.tags.length" class="bzp-tags">
              <span v-for="tag in section.tags" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </div>

        <div v-if="!error" class="bzp-scores">
          <div
            v-for="score in scoreItems"
            :key="score.key"
            class="bzp-score"
          >
            <span>{{ score.label }}</span>
            <em>{{ score.value }}</em>
            <span class="bzp-score-track">
              <i :style="{ width: `${score.value}%` }" />
            </span>
          </div>
        </div>

        <!-- 大运 -->
        <div class="bzp-dayun">
          <h3>{{ $t('bazi.dayunTable') }}</h3>
          <div class="bzp-dayun-track">
            <div
              v-for="d in chart.dayuns"
              :key="d.index"
              class="bzp-dayun-item"
              :class="{ 'is-current': chart.currentDaYun?.index === d.index }"
            >
              <span class="bzp-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
              <strong>{{ d.gan }}{{ d.zhi }}</strong>
              <span class="bzp-dayun-score">{{ reading.dayunScores.find(item => item.index === d.index)?.score ?? d.score ?? '—' }}</span>
              <span v-if="chart.currentDaYun?.index === d.index" class="bzp-current-tag">{{ $t('bazi.currentLabel') }}</span>
            </div>
          </div>
          <div v-if="reading.dayunScores.length" class="bzp-dayun-notes">
            <p v-for="item in reading.dayunScores" :key="item.index">
              <strong>{{ item.ganZhi }} · {{ item.ageRange }}</strong>{{ item.fortune }} · {{ item.analysis }}
            </p>
          </div>
        </div>

        <!-- 关键时期 + 建议 -->
        <div class="bzp-footer-grid">
          <div v-if="reading.historicalPredictions.length" class="bzp-history">
            <h3>{{ $t('bazi.historicalCalibration') }}</h3>
            <div v-for="item in reading.historicalPredictions" :key="`${item.age}-${item.year}`" class="bzp-history-row">
              <strong>{{ item.age }} / {{ item.year }}</strong>
              <p>{{ item.description }}</p>
            </div>
          </div>
          <div v-if="reading.advice.length" class="bzp-advice">
            <h3>{{ $t('bazi.comprehensiveAdvice') }}</h3>
            <p v-for="(item, index) in reading.advice" :key="index">{{ item }}</p>
          </div>
        </div>
      </section>

      <!-- 落款 -->
      <footer class="bzp-foot">
        <span>www.ososn.com</span>
        <span>{{ $t('bazi.aiDisclaimer') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart } from '~/types/bazi'
import type { DiZhi } from '~/types/user'
import { generateAnalysis } from '~/utils/bazi/analysisText'

interface Props {
  chart: BaziChart
  aiContent: string
  streaming: boolean
  error: string | null
  birthDate: string
  birthHour?: DiZhi
  gender: 'male' | 'female'
  name: string
}

const props = defineProps<Props>()
defineEmits<{ retry: [] }>()
const { t, locale } = useI18n()

const generatedAt = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date()))

const birthText = computed(() => props.birthDate.replaceAll('-', ' / '))
const dayMaster = computed(() => `${props.chart.riZhu}${props.chart.day.zhi}`)

const pillars = computed(() => {
  const labels = [
    t('baziPan.yearPillar'),
    t('baziPan.monthPillar'),
    t('baziPan.dayPillar'),
    t('baziPan.hourPillar'),
  ]
  const list = [props.chart.year, props.chart.month, props.chart.day, props.chart.hour]

  return list.map((pillar, index) => ({
    label: labels[index],
    shishen: pillar
      ? (index === 2 ? t('baziPan.riZhu') : pillar.shishen || '—')
      : '—',
    gan: pillar?.gan ?? '—',
    zhi: pillar?.zhi ?? '—',
    canggan: pillar?.canggan.map(item => `${item.gan}·${item.type}`).join(' ') || '—',
  }))
})

const wuxingColors: Record<string, string> = {
  木: '#4a7c59',
  火: '#a8512e',
  土: '#8a6b3a',
  金: '#7f7a6c',
  水: '#3f5a6c',
}

const wuxingList = computed(() => Object.entries(props.chart.wuxingScore)
  .map(([name, value]) => ({ name, value, color: wuxingColors[name] ?? '#55503f' })))

const analysisItems = computed(() => {
  const titleMap: Record<string, string> = {
    日主分析: t('bazi.riZhuAnalysis'),
    十神分析: t('bazi.shiShenAnalysis'),
    五行平衡: t('bazi.wuxingTitle'),
    格局判定: t('bazi.gejuAnalysis'),
    大运分析: t('bazi.dayunAnalysis'),
    流年分析: t('bazi.liuNianAnalysis'),
  }
  return Object.entries(generateAnalysis(props.chart))
    .map(([key, body]) => ({ title: titleMap[key] ?? key, body }))
})

type SectionKey = 'personality' | 'career' | 'relationship' | 'health'

interface PosterSection {
  key: SectionKey
  titleKey: string
  summary: string
  detail: string
  tags: string[]
}

interface PosterReading {
  overview: string
  sections: Record<SectionKey, PosterSection>
  scores: Record<string, number>
  dayunScores: { index: number; ganZhi: string; ageRange: string; score: number; fortune: string; analysis: string }[]
  historicalPredictions: { age: number; year: number; description: string }[]
  advice: string[]
}

function emptySection(key: SectionKey, titleKey: string): PosterSection {
  return { key, titleKey, summary: '', detail: '', tags: [] }
}

const reading = computed<PosterReading>(() => {
  const result: PosterReading = {
    overview: '',
    sections: {
      personality: emptySection('personality', 'personalityTitle'),
      career: emptySection('career', 'careerTitle'),
      relationship: emptySection('relationship', 'relationshipTitle'),
      health: emptySection('health', 'healthTitle'),
    },
    scores: {},
    dayunScores: [],
    historicalPredictions: [],
    advice: [],
  }

  const validSections = new Set(Object.keys(result.sections))
  const currentYear = new Date().getFullYear()
  for (const rawLine of props.aiContent.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const [key = '', ...values] = line.split('|').map(part => part.trim())

    if (key === 'OV' && values[0]) result.overview = values[0]
    if (key === 'PS' && validSections.has(values[0] ?? '')) result.sections[values[0] as SectionKey]!.summary = values[1] ?? ''
    if (key === 'PD' && validSections.has(values[0] ?? '')) result.sections[values[0] as SectionKey]!.detail = values[1] ?? ''
    if (key === 'PT' && validSections.has(values[0] ?? '')) result.sections[values[0] as SectionKey]!.tags = values.slice(1, 4)
    if (key === 'SCR' && values[0] && values[1]) result.scores[values[0]] = Number(values[1]) || 0
    if (key === 'DYD' && values.length >= 6) {
      result.dayunScores.push({
        index: Number(values[0]),
        ganZhi: values[1] ?? '',
        ageRange: values[2] ?? '',
        score: Number(values[3]) || 0,
        fortune: values[4] ?? '',
        analysis: values[5] ?? '',
      })
    }
    if (key === 'HIS' && values[0]) {
      const age = Number(values[0]) || 0
      const explicitYear = Number(values[1])
      const hasExplicitYear = values.length >= 3 && explicitYear >= 1900
      result.historicalPredictions.push({
        age,
        year: hasExplicitYear ? explicitYear : Math.max(1900, currentYear - age),
        description: hasExplicitYear ? values[2] ?? '' : values[1] ?? '',
      })
    }
    if (key === 'ADV' && values[0]) result.advice.push(values[0])
  }

  return result
})

const sections = computed(() => Object.values(reading.value.sections))
const scoreItems = computed(() => [
  { key: 'relationship', label: t('fortuneRadar.labels.relationship') },
  { key: 'career', label: t('fortuneRadar.labels.career') },
  { key: 'wealth', label: t('fortuneRadar.labels.wealth') },
  { key: 'health', label: t('fortuneRadar.labels.health') },
  { key: 'study', label: t('fortuneRadar.labels.study') },
].map(item => ({ ...item, value: reading.value.scores[item.key] ?? 0 })))
</script>

<style scoped>
.bzp {
  --bzp-bg: #efe8d8;
  --bzp-paper: #faf5e8;
  --bzp-card: #fffdf5;
  --bzp-ink: #2e2a24;
  --bzp-soft: #55503f;
  --bzp-faint: #8a8272;
  --bzp-line: #d8cfba;
  --bzp-soft-line: #e7dfcc;
  --bzp-red: #8c2f26;
  --bzp-rust: #a8512e;
  --bzp-green: #4a7c59;
  background: var(--bzp-bg);
  color: var(--bzp-ink);
  padding: 12px;
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bzp-sheet {
  min-width: 0;
  background: var(--bzp-paper);
  border: 1px solid var(--bzp-line);
  box-shadow: 0 3px 22px rgba(59, 47, 29, 0.13);
  padding: 20px 22px 16px;
}

.bzp-masthead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid var(--bzp-ink);
  padding-bottom: 10px;
}

.bzp-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bzp-seal {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  padding: 3px;
  border: 2px solid var(--bzp-red);
  color: var(--bzp-red);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.15;
  white-space: pre-line;
  text-align: center;
  letter-spacing: 1px;
  transform: rotate(-4deg);
}

.bzp-brand-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
}

.bzp-masthead-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 10px;
  color: var(--bzp-faint);
  letter-spacing: 1px;
}

.bzp-cover {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 18px;
  padding: 22px 0 18px;
  border-bottom: 1px solid var(--bzp-line);
}

.bzp-kicker {
  margin: 0;
  font-size: 11px;
  color: var(--bzp-rust);
  letter-spacing: 5px;
}

.bzp-title {
  margin: 10px 0 0;
  font-size: 46px;
  line-height: 1.05;
  letter-spacing: 2px;
}

.bzp-subtitle {
  margin: 10px 0 0;
  color: var(--bzp-soft);
  font-size: 14px;
}

.bzp-profile {
  border-left: 1px solid var(--bzp-line);
  padding-left: 18px;
  display: grid;
  align-content: center;
  gap: 9px;
}

.bzp-profile-line {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 8px;
  font-size: 11px;
  align-items: baseline;
}

.bzp-profile-line span:first-child {
  color: var(--bzp-faint);
}

.bzp-profile-line strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bzp-lede {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  background: var(--bzp-card);
  border-top: 3px solid var(--bzp-red);
  border-bottom: 1px solid var(--bzp-line);
  padding: 16px 14px;
}

.bzp-lede-mark {
  writing-mode: vertical-rl;
  border: 1px solid var(--bzp-line);
  color: var(--bzp-red);
  padding: 8px 5px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 4px;
}

.bzp-lede-text {
  margin: 0;
  min-height: 42px;
  font-size: 21px;
  line-height: 1.55;
  font-weight: 600;
}

.bzp-pending {
  color: var(--bzp-faint);
  font-weight: 400;
}

.bzp-caret {
  display: inline-block;
  width: 2px;
  height: 20px;
  margin-left: 4px;
  vertical-align: -3px;
  background: var(--bzp-red);
  animation: bzp-pulse 1s ease-in-out infinite;
}

.bzp-pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 20px 0;
  border-bottom: 1px solid var(--bzp-line);
}

.bzp-pillar {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 5px;
  min-width: 0;
  background: var(--bzp-card);
  border: 1px solid var(--bzp-line);
  padding: 12px 8px;
}

.bzp-pillar-label {
  font-size: 10px;
  color: var(--bzp-faint);
  letter-spacing: 2px;
}

.bzp-pillar-shishen {
  font-size: 9px;
  color: var(--bzp-rust);
  letter-spacing: 1px;
}

.bzp-pillar-gan,
.bzp-pillar-zhi {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  font-size: 29px;
  font-weight: 700;
}

.bzp-pillar-gan {
  border-bottom: 1px solid var(--bzp-soft-line);
}

.bzp-pillar:nth-child(3) .bzp-pillar-gan,
.bzp-pillar:nth-child(3) .bzp-pillar-zhi {
  color: var(--bzp-red);
}

.bzp-pillar-canggan {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  color: var(--bzp-faint);
}

.bzp-core {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 18px 0;
  border-bottom: 1px solid var(--bzp-line);
}

.bzp-core-grid {
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.bzp-core-cell {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  background: var(--bzp-card);
  border: 1px solid var(--bzp-soft-line);
  padding: 10px 12px;
}

.bzp-core-cell span:first-child {
  font-size: 10px;
  color: var(--bzp-faint);
  letter-spacing: 1px;
}

.bzp-core-cell strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.bzp-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}

.bzp-section-head-wide {
  align-items: baseline;
}

.bzp-section-no {
  font-size: 22px;
  font-weight: 700;
  color: var(--bzp-rust);
}

.bzp-section-head h2 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 3px;
}

.bzp-section-head::after,
.bzp-section-note {
  margin-left: auto;
}

.bzp-section-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--bzp-line);
}

.bzp-section-note {
  max-width: 320px;
  font-size: 9px;
  color: var(--bzp-faint);
}

.bzp-wuxing-grid {
  display: grid;
  gap: 9px;
}

.bzp-wuxing-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 40px;
  gap: 9px;
  align-items: center;
}

.bzp-wuxing-name {
  font-size: 13px;
  font-weight: 700;
}

.bzp-wuxing-track {
  height: 7px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--bzp-line);
}

.bzp-wuxing-fill,
.bzp-score-track i {
  display: block;
  height: 100%;
}

.bzp-wuxing-value {
  font-size: 10px;
  color: var(--bzp-soft);
  text-align: right;
}

.bzp-analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.bzp-analysis-item {
  min-width: 0;
  background: var(--bzp-card);
  border: 1px solid var(--bzp-soft-line);
  padding: 12px;
}

.bzp-analysis-title {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-bottom: 7px;
}

.bzp-analysis-title span {
  font-size: 10px;
  color: var(--bzp-rust);
}

.bzp-analysis-title h3 {
  margin: 0;
  font-size: 14px;
  letter-spacing: 1px;
}

.bzp-analysis-item p {
  margin: 0;
  font-size: 11px;
  line-height: 1.72;
  color: var(--bzp-soft);
}

.bzp-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--bzp-red);
  letter-spacing: 1px;
}

.bzp-live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: bzp-pulse 1s ease-in-out infinite;
}

.bzp-reading-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.bzp-reading-card {
  min-width: 0;
  border-top: 2px solid var(--bzp-ink);
  padding-top: 9px;
}

.bzp-reading-card h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 2px;
}

.bzp-reading-summary {
  margin: 7px 0 5px;
  font-size: 14px;
  font-weight: 700;
}

.bzp-reading-detail {
  margin: 0;
  min-height: 48px;
  font-size: 11px;
  line-height: 1.7;
  color: var(--bzp-soft);
}

.bzp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.bzp-tags span {
  border: 1px solid var(--bzp-line);
  color: var(--bzp-soft);
  font-size: 9px;
  padding: 2px 6px;
  letter-spacing: 1px;
}

.bzp-scores {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
  margin-top: 16px;
}

.bzp-score {
  min-width: 0;
  background: var(--bzp-card);
  border: 1px solid var(--bzp-soft-line);
  padding: 8px;
}

.bzp-score > span:first-child {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: var(--bzp-faint);
}

.bzp-score em {
  display: block;
  margin: 3px 0 5px;
  font-size: 21px;
  font-style: normal;
  font-weight: 700;
  color: var(--bzp-red);
}

.bzp-score-track {
  display: block;
  height: 4px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--bzp-line);
}

.bzp-dayun {
  margin-top: 16px;
}

.bzp-dayun h3,
.bzp-history h3,
.bzp-advice h3 {
  margin: 0 0 9px;
  font-size: 13px;
  letter-spacing: 2px;
}

.bzp-dayun-track {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.bzp-dayun-item {
  position: relative;
  flex: 0 0 auto;
  width: 58px;
  display: grid;
  justify-items: center;
  gap: 2px;
  background: var(--bzp-card);
  border: 1px solid var(--bzp-line);
  padding: 7px 5px;
}

.bzp-dayun-item.is-current {
  border-color: var(--bzp-red);
  box-shadow: inset 0 0 0 1px var(--bzp-red);
}

.bzp-dayun-age {
  font-size: 8px;
  color: var(--bzp-faint);
}

.bzp-dayun-item strong {
  font-size: 15px;
}

.bzp-dayun-score {
  font-size: 9px;
  color: var(--bzp-rust);
}

.bzp-current-tag {
  position: absolute;
  top: -7px;
  right: 2px;
  background: var(--bzp-red);
  color: var(--bzp-paper);
  font-size: 7px;
  padding: 1px 3px;
}

.bzp-dayun-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 14px;
  margin-top: 10px;
}

.bzp-dayun-notes p {
  margin: 0;
  min-width: 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--bzp-soft);
}

.bzp-dayun-notes strong {
  margin-right: 5px;
}

.bzp-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 16px;
}

.bzp-history-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  border-bottom: 1px dotted var(--bzp-line);
  padding: 5px 0;
}

.bzp-history-row strong {
  font-size: 11px;
  color: var(--bzp-red);
}

.bzp-history-row p,
.bzp-advice p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--bzp-soft);
}

.bzp-error {
  background: var(--bzp-card);
  border: 1px solid var(--bzp-red);
  padding: 16px;
  text-align: center;
}

.bzp-error p {
  margin: 0 0 9px;
  font-size: 12px;
  color: var(--bzp-red);
}

.bzp-error button {
  border: 1px solid var(--bzp-red);
  background: transparent;
  color: var(--bzp-red);
  font-family: inherit;
  font-size: 11px;
  padding: 5px 16px;
  cursor: pointer;
}

.bzp-error button:hover {
  background: rgba(140, 47, 38, 0.07);
}

.bzp-foot {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  border-top: 2px solid var(--bzp-ink);
  margin-top: 18px;
  padding-top: 9px;
  font-size: 9px;
  color: var(--bzp-faint);
}

@keyframes bzp-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}

@media (max-width: 900px) {
  .bzp-cover,
  .bzp-core,
  .bzp-analysis-grid,
  .bzp-reading-grid,
  .bzp-footer-grid,
  .bzp-dayun-notes {
    grid-template-columns: 1fr;
  }

  .bzp-profile {
    border-left: 0;
    border-top: 1px solid var(--bzp-line);
    padding: 14px 0 0;
  }

  .bzp-title {
    font-size: 35px;
  }

  .bzp-lede-text {
    font-size: 18px;
  }

  .bzp-scores {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bzp-section-note {
    display: none;
  }
}

@media (max-width: 520px) {
  .bzp {
    padding: 6px;
  }

  .bzp-sheet {
    padding: 14px 11px;
  }

  .bzp-pillars {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bzp-scores {
    grid-template-columns: 1fr;
  }

  .bzp-foot {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
