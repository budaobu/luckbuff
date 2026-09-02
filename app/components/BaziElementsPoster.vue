<template>
  <div class="bze">
    <article class="bze-sheet">
      <header class="bze-head">
        <div class="bze-brand">
          <span class="bze-seal">{{ $t('baziElements.poster.seal') }}</span>
          <div>
            <p class="bze-kicker">{{ $t('baziElements.poster.kicker') }}</p>
            <h1>{{ name || $t('baziElements.poster.titleNoName') }}</h1>
          </div>
        </div>
        <dl class="bze-identity">
          <div>
            <dt>{{ $t('profileForm.birthDate') }}</dt>
            <dd>{{ birthDate }}</dd>
          </div>
          <div>
            <dt>{{ $t('profileForm.birthHour') }}</dt>
            <dd>{{ birthHour || $t('common.unknown') }}</dd>
          </div>
          <div>
            <dt>{{ $t('profileForm.gender') }}</dt>
            <dd>{{ gender === 'male' ? $t('common.male') : $t('common.female') }}</dd>
          </div>
        </dl>
      </header>

      <section class="bze-core">
        <div class="bze-pillars">
          <div v-for="pillar in result.pillars" :key="pillar.label" class="bze-pillar">
            <span>{{ pillarLabel(pillar.label) }}</span>
            <strong>{{ pillar.gan }}<i>{{ pillar.zhi }}</i></strong>
            <small>{{ pillar.shishen || '—' }}</small>
          </div>
        </div>
        <dl class="bze-facts">
          <div>
            <dt>{{ $t('baziPan.riZhu') }}</dt>
            <dd>{{ result.dayMaster }}</dd>
          </div>
          <div>
            <dt>{{ $t('bazi.poster.strength') }}</dt>
            <dd>{{ result.strength }}</dd>
          </div>
          <div>
            <dt>{{ $t('bazi.gejuAnalysis') }}</dt>
            <dd>{{ result.geju }}</dd>
          </div>
          <div>
            <dt>{{ $t('baziElements.poster.balance') }}</dt>
            <dd>{{ balanceLabel }}</dd>
          </div>
        </dl>
      </section>

      <section class="bze-distribution">
        <header>
          <h2>{{ $t('bazi.wuxingTitle') }}</h2>
          <span>{{ $t('bazi.wuxingSubtitle') }}</span>
        </header>
        <div class="bze-bars">
          <div v-for="element in result.elements" :key="element.key" class="bze-bar">
            <div class="bze-bar-label">
              <strong>{{ $t(`bazi.${elementKeyMap[element.key]}`) }}</strong>
              <span>{{ levelLabel(element.level) }}</span>
            </div>
            <div class="bze-track" :class="{ 'bze-track-empty': element.score === 0 }">
              <i :style="{ width: `${Math.max(element.score, 2)}%` }" />
              <b>{{ element.score }}%</b>
            </div>
          </div>
        </div>
      </section>

      <section class="bze-focus">
        <header>
          <h2>{{ $t('baziElements.poster.focusTitle') }}</h2>
          <span>{{ $t('baziElements.poster.focusNote') }}</span>
        </header>
        <div class="bze-focus-list">
          <div v-for="item in result.focus" :key="`${item.key}-${item.reason}`" class="bze-focus-item">
            <strong>{{ $t(`bazi.${elementKeyMap[item.key]}`) }}</strong>
            <span>{{ reasonLabel(item.reason) }}</span>
          </div>
        </div>
        <dl class="bze-yong">
          <div>
            <dt>{{ $t('bazi.poster.xiyong') }}</dt>
            <dd>{{ result.favorable.join('、') || '—' }}</dd>
          </div>
          <div>
            <dt>{{ $t('bazi.poster.jishen') }}</dt>
            <dd>{{ result.unfavorable.join('、') || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="bze-reading">
        <header>
          <h2>{{ $t('baziElements.poster.readingTitle') }}</h2>
          <span v-if="streaming" class="bze-live"><i />{{ $t('bazi.interpreting') }}</span>
        </header>

        <div v-if="error" class="bze-error">
          <p>{{ error }}</p>
          <button type="button" @click="$emit('retry')">{{ $t('bazi.retry') }}</button>
        </div>
        <template v-else>
          <p class="bze-overview">{{ reading.overview || $t('bazi.aiInterpreting') }}</p>
          <dl class="bze-reading-grid">
            <div>
              <dt>{{ $t('baziElements.reading.gap') }}</dt>
              <dd>{{ reading.gap }}</dd>
            </div>
            <div>
              <dt>{{ $t('baziElements.reading.use') }}</dt>
              <dd>{{ reading.use }}</dd>
            </div>
            <div class="bze-reading-wide">
              <dt>{{ $t('baziElements.reading.adjust') }}</dt>
              <dd>{{ reading.adjust }}</dd>
            </div>
            <div class="bze-reading-wide">
              <dt>{{ $t('baziElements.reading.tips') }}</dt>
              <dd>
                <p v-for="(tip, index) in reading.tips" :key="index">{{ tip }}</p>
              </dd>
            </div>
          </dl>
          <p v-if="reading.note" class="bze-note">{{ reading.note }}</p>
        </template>
      </section>

      <footer class="bze-foot">
        <span>www.ososn.com</span>
        <span>{{ $t('baziElements.poster.disclaimer') }}</span>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { BaziElementsResult } from '~~/server/utils/tools/bazi-elements'
import type { DiZhi } from '~/types/user'

interface Props {
  result: BaziElementsResult
  aiContent: string
  streaming: boolean
  error: string | null
  name?: string
  birthDate: string
  birthHour?: DiZhi
  gender: 'male' | 'female'
}

const props = defineProps<Props>()
defineEmits<{ retry: [] }>()
const { t, locale } = useI18n()

const elementKeyMap = { 木: 'wuxingWood', 火: 'wuxingFire', 土: 'wuxingEarth', 金: 'wuxingMetal', 水: 'wuxingWater' } as const
const levelKeyMap = {
  missing: 'levels.missing',
  low: 'levels.low',
  balanced: 'levels.balanced',
  strong: 'levels.strong',
  dominant: 'levels.dominant',
} as const
const reasonKeyMap = {
  'favorable-missing': 'reasons.favorableMissing',
  'favorable-low': 'reasons.favorableLow',
  favorable: 'reasons.favorable',
  missing: 'reasons.missing',
  low: 'reasons.low',
} as const
const balanceKeyMap = {
  balanced: 'balance.balanced',
  varied: 'balance.varied',
  skewed: 'balance.skewed',
  gap: 'balance.gap',
  'multi-gap': 'balance.multiGap',
} as const

const generatedAt = computed(() => new Intl.DateTimeFormat(locale.value, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date()))
const balanceLabel = computed(() => t(`baziElements.${balanceKeyMap[props.result.balanceState]}`))

function pillarLabel(label: 'year' | 'month' | 'day' | 'hour') {
  const map = {
    year: 'baziPan.yearPillar',
    month: 'baziPan.monthPillar',
    day: 'baziPan.dayPillar',
    hour: 'baziPan.hourPillar',
  } as const
  return t(map[label])
}

function levelLabel(level: keyof typeof levelKeyMap) {
  return t(`baziElements.${levelKeyMap[level]}`)
}

function reasonLabel(reason: keyof typeof reasonKeyMap) {
  return t(`baziElements.${reasonKeyMap[reason]}`)
}

interface ElementReading {
  overview: string
  gap: string
  use: string
  adjust: string
  tips: string[]
  note: string
}

const reading = computed<ElementReading>(() => {
  const value: ElementReading = {
    overview: '',
    gap: '',
    use: '',
    adjust: '',
    tips: [],
    note: '',
  }

  for (const rawLine of props.aiContent.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const [key = '', ...values] = line.split(':').map(part => part.trim())
    const text = values.join(':')
    if (!text) continue
    if (key === 'OV') value.overview = text
    else if (key === 'GAP') value.gap = text
    else if (key === 'USE') value.use = text
    else if (key === 'ADJUST') value.adjust = text
    else if (key === 'TIP') value.tips.push(text)
    else if (key === 'NOTE') value.note = text
  }
  return value
})
</script>

<style scoped>
.bze {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 12px;
  color: #253430;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.bze-sheet {
  background:
    radial-gradient(circle at 82% 8%, rgba(63, 125, 97, 0.18), transparent 34%),
    linear-gradient(135deg, #e9f0e7 0%, #f7f1e3 58%, #f2e7d2 100%);
  border: 1px solid rgba(24, 58, 49, 0.16);
  box-shadow: 0 18px 45px rgba(24, 58, 49, 0.12);
  padding: clamp(18px, 3.4vw, 38px);
}

.bze-head,
.bze-core,
.bze-distribution,
.bze-focus,
.bze-reading {
  border-bottom: 1px solid rgba(24, 58, 49, 0.18);
}

.bze-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
  gap: 24px;
  align-items: start;
  padding-bottom: 24px;
}

.bze-brand {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.bze-seal {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  border-radius: 6px;
  background: #183a31;
  color: #f7f1e3;
  font-size: 12px;
  line-height: 1.1;
  text-align: center;
}

.bze-kicker {
  margin: 0 0 5px;
  color: #a5522c;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 42px);
  line-height: 1.15;
}

.bze-identity {
  margin: 0;
  display: grid;
  gap: 8px;
  border-left: 2px solid #b35b33;
  padding-left: 14px;
}

.bze-identity div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.bze-identity dt {
  color: #5c6a64;
  font-size: 12px;
}

.bze-identity dd {
  margin: 0;
  font-weight: 650;
}

.bze-core {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
  gap: 24px;
  padding: 24px 0;
}

.bze-pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.bze-pillar {
  min-width: 0;
  border: 1px solid rgba(24, 58, 49, 0.2);
  padding: 14px 8px;
  text-align: center;
  background: rgba(255, 253, 246, 0.68);
}

.bze-pillar span,
.bze-pillar small {
  display: block;
  font-size: 11px;
  color: #5c6a64;
}

.bze-pillar strong {
  display: block;
  margin: 7px 0 4px;
  font-size: clamp(20px, 2.4vw, 28px);
}

.bze-pillar i {
  font-style: normal;
  margin-left: 2px;
  color: #3f7d61;
}

.bze-facts {
  margin: 0;
  display: grid;
  gap: 8px;
}

.bze-facts div {
  display: flex;
  align-items: baseline;
  gap: 12px;
  border-bottom: 1px dashed rgba(24, 58, 49, 0.16);
  padding-bottom: 6px;
}

.bze-facts dt {
  min-width: 72px;
  font-size: 12px;
  color: #5c6a64;
}

.bze-facts dd {
  margin: 0;
  font-weight: 650;
}

.bze-distribution,
.bze-focus,
.bze-reading {
  padding: 24px 0;
}

.bze-distribution header,
.bze-focus header,
.bze-reading header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  font-size: clamp(17px, 2vw, 21px);
}

.bze-distribution header span,
.bze-focus header span {
  color: #5c6a64;
  font-size: 12px;
}

.bze-bars {
  display: grid;
  gap: 10px;
}

.bze-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.bze-bar-label span {
  color: #a5522c;
}

.bze-track {
  position: relative;
  height: 20px;
  background: rgba(24, 58, 49, 0.09);
  border-radius: 4px;
  overflow: hidden;
}

.bze-track i {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #3f7d61, #d7a545);
}

.bze-track-empty i {
  background: repeating-linear-gradient(45deg, #d8bfae 0 5px, #e6d4c6 5px 10px);
}

.bze-track b {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}

.bze-focus-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.bze-focus-item {
  min-width: 0;
  border-left: 3px solid #b35b33;
  background: rgba(255, 253, 246, 0.68);
  padding: 10px 12px;
}

.bze-focus-item strong {
  display: block;
  font-size: 19px;
}

.bze-focus-item span {
  font-size: 12px;
  color: #5c6a64;
}

.bze-yong {
  margin: 14px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.bze-yong div {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.bze-yong dt {
  flex: 0 0 auto;
  font-size: 12px;
  color: #5c6a64;
}

.bze-yong dd {
  margin: 0;
  font-weight: 650;
}

.bze-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a5522c;
  font-size: 12px;
}

.bze-live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a5522c;
  animation: bze-pulse 1.2s infinite;
}

.bze-overview {
  margin: 0 0 14px;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.7;
}

.bze-reading-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.bze-reading-grid dt {
  color: #3f7d61;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.bze-reading-grid dd {
  margin: 0;
  line-height: 1.65;
}

.bze-reading-wide {
  grid-column: 1 / -1;
}

.bze-reading-wide dd p {
  margin: 0 0 5px;
}

.bze-note {
  margin: 14px 0 0;
  padding-top: 10px;
  border-top: 1px dashed rgba(24, 58, 49, 0.2);
  color: #5c6a64;
  font-size: 12px;
}

.bze-error {
  border: 1px solid rgba(165, 82, 44, 0.35);
  background: rgba(165, 82, 44, 0.08);
  padding: 14px;
}

.bze-error p {
  margin: 0 0 8px;
}

.bze-error button {
  border: 0;
  background: #a5522c;
  color: #fff;
  padding: 6px 12px;
  cursor: pointer;
}

.bze-foot {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 16px;
  color: #5c6a64;
  font-size: 12px;
}

@keyframes bze-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

@media (max-width: 760px) {
  .bze-head,
  .bze-core {
    grid-template-columns: 1fr;
  }

  .bze-pillars {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bze-focus-list,
  .bze-yong,
  .bze-reading-grid {
    grid-template-columns: 1fr;
  }

  .bze-distribution header,
  .bze-focus header,
  .bze-reading header {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .bze-foot {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
