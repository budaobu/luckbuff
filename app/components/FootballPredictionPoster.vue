<template>
  <article ref="rootRef" class="football-poster">
    <section class="pitch">
      <div class="pitch-lines" aria-hidden="true">
        <span class="center-line" />
        <span class="center-circle" />
        <span class="penalty penalty-left" />
        <span class="penalty penalty-right" />
      </div>

      <div class="pitch-top">
        <span class="method">{{ methodLabel }}</span>
        <span class="competition">{{ result.match.competition }}</span>
      </div>

      <div class="teams">
        <span class="team">{{ result.match.homeTeam }}</span>
        <span class="score">{{ result.prediction.primaryScore.home }}-{{ result.prediction.primaryScore.away }}</span>
        <span class="team">{{ result.match.awayTeam }}</span>
      </div>

      <div class="pitch-meta">
        <span>{{ formattedKickoff }}</span>
        <span v-if="result.match.venue">{{ result.match.venue }}</span>
      </div>

      <svg class="ball" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#fff" stroke="#123524" stroke-width="3" />
        <path d="M32 18l12 9-4 14H24l-4-14z" fill="#123524" />
        <path d="M32 18v-11M44 27l11-5M40 41l7 9M24 41l-7 9M20 27L9 22" stroke="#123524" stroke-width="3" fill="none" />
      </svg>
    </section>

    <section class="main">
      <div class="probability-head">
        <h2>{{ $t('footballPrediction.poster.outcome') }}</h2>
        <strong>{{ outcomeText }}</strong>
      </div>

      <div class="probabilities">
        <div class="probability">
          <div class="probability-label">
            <span>{{ result.match.homeTeam }}</span>
            <b>{{ result.prediction.probabilities.home }}%</b>
          </div>
          <span class="bar"><i class="home" :style="{ width: `${result.prediction.probabilities.home}%` }" /></span>
        </div>
        <div class="probability">
          <div class="probability-label">
            <span>{{ $t('footballPrediction.poster.draw') }}</span>
            <b>{{ result.prediction.probabilities.draw }}%</b>
          </div>
          <span class="bar"><i class="draw" :style="{ width: `${result.prediction.probabilities.draw}%` }" /></span>
        </div>
        <div class="probability">
          <div class="probability-label">
            <span>{{ result.match.awayTeam }}</span>
            <b>{{ result.prediction.probabilities.away }}%</b>
          </div>
          <span class="bar"><i class="away" :style="{ width: `${result.prediction.probabilities.away}%` }" /></span>
        </div>
      </div>

      <div class="grid">
        <div v-if="result.liuyao" class="chart-card">
          <span class="card-title">{{ $t('footballPrediction.poster.liuyaoChart') }}</span>
          <p class="hexagram">{{ result.liuyao.primary }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.transform') }} {{ result.liuyao.transformed }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.nuclear') }} {{ result.liuyao.nuclear }}</p>
          <div class="lines" aria-hidden="true">
            <span v-for="(line, index) in result.liuyao.lines" :key="index" class="line-row">
              <i :class="{ yin: line.value === 6 || line.value === 8 }">
                <template v-if="line.value === 6 || line.value === 8">
                  <b /><b />
                </template>
              </i>
              <em v-if="line.moving">{{ $t('footballPrediction.poster.moving') }}</em>
            </span>
          </div>
        </div>

        <div v-if="result.qimen" class="chart-card">
          <span class="card-title">{{ $t('footballPrediction.poster.qimenChart') }}</span>
          <p class="hexagram">{{ result.qimen.title }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.dayPillar') }} {{ result.qimen.dayGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.timePillar') }} {{ result.qimen.timeGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.zhifu') }} {{ result.qimen.zhifu }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.zhishi') }} {{ result.qimen.zhishi }}</p>
        </div>

        <div v-if="result.liuren" class="chart-card">
          <span class="card-title">{{ $t('footballPrediction.poster.liurenChart') }}</span>
          <p class="hexagram">{{ $t('footballPrediction.poster.yuejiang') }}{{ result.liuren.yuejiang }}{{ $t('footballPrediction.poster.adds') }}{{ result.liuren.shichen }}{{ $t('footballPrediction.poster.hourUnit') }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.yearPillar') }} {{ result.liuren.yearGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.monthPillar') }} {{ result.liuren.monthGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.dayPillar') }} {{ result.liuren.dayGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.timePillar') }} {{ result.liuren.hourGanzhi }}</p>
          <p class="muted">{{ $t('footballPrediction.poster.birthYear') }} {{ result.liuren.birthYear }} · {{ result.liuren.birthYearBranch }}</p>
        </div>

        <div class="chart-card">
          <span class="card-title">{{ $t('footballPrediction.poster.keySignals') }}</span>
          <dl>
            <div v-for="signal in result.signals" :key="signal.key" class="signal">
              <dt>{{ signalLabel(signal.key) }}</dt>
              <dd>{{ signal.value || '-' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="conclusion">
        <p>{{ conclusion }}</p>
        <div v-if="result.prediction.alternateScores.length" class="alternates">
          <span>{{ $t('footballPrediction.poster.alternates') }}</span>
          <strong v-for="score in result.prediction.alternateScores" :key="`${score.home}-${score.away}`">
            {{ score.home }}-{{ score.away }}
          </strong>
        </div>
      </div>
    </section>

    <footer class="poster-footer">
      <div class="brand">
        <strong>ososn</strong>
        <span>{{ $t('footballPrediction.poster.disclaimer') }}</span>
      </div>
      <div class="qr" aria-hidden="true">
        <span v-if="qrSvg" class="qr-svg" v-html="qrSvg" />
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { FootballPredictionResult, FootballSignal } from '~/types/football-prediction'

const props = defineProps<{
  result: FootballPredictionResult
  methodLabel: string
}>()

const { t, locale } = useI18n()
const rootRef = ref<HTMLElement>()
const qrSvg = ref('')

const localeTag = computed(() => locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN')

const formattedKickoff = computed(() => {
  const date = new Date(props.result.match.kickoff)
  return new Intl.DateTimeFormat(localeTag.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
})

const outcomeText = computed(() => {
  const { homeTeam, awayTeam } = props.result.match
  if (props.result.prediction.outcome === 'home') {
    return t('footballPrediction.poster.homeWin', { team: homeTeam })
  }
  if (props.result.prediction.outcome === 'away') {
    return t('footballPrediction.poster.awayWin', { team: awayTeam })
  }
  return t('footballPrediction.poster.draw')
})

const conclusion = computed(() => {
  const { homeTeam, awayTeam } = props.result.match
  const score = `${props.result.prediction.primaryScore.home}-${props.result.prediction.primaryScore.away}`
  if (props.result.prediction.outcome === 'home') {
    return t('footballPrediction.poster.homeConclusion', { team: homeTeam, score })
  }
  if (props.result.prediction.outcome === 'away') {
    return t('footballPrediction.poster.awayConclusion', { team: awayTeam, score })
  }
  return t('footballPrediction.poster.drawConclusion', { home: homeTeam, away: awayTeam, score })
})

function signalLabel(key: FootballSignal['key']) {
  const map: Record<FootballSignal['key'], string> = {
    shi: t('footballPrediction.poster.shi'),
    ying: t('footballPrediction.poster.ying'),
    moving: t('footballPrediction.poster.movingCount'),
    homePalace: t('footballPrediction.poster.homePalace'),
    awayPalace: t('footballPrediction.poster.awayPalace'),
    keyPalace: t('footballPrediction.poster.keyPalace'),
    homeState: t('footballPrediction.poster.homeState'),
    awayState: t('footballPrediction.poster.awayState'),
    birthRelation: t('footballPrediction.poster.birthRelation'),
  }
  return map[key]
}

onMounted(async () => {
  const QRCode = await import('qrcode')
  qrSvg.value = await QRCode.default.toString(window.location.href, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#123524', light: '#00000000' },
  })
})

defineExpose({ rootRef })
</script>

<style scoped>
.football-poster {
  width: min(720px, 100%);
  margin: 0 auto;
  overflow: hidden;
  color: #f8fbf8;
  background: #0d2018;
  border: 1px solid rgba(234, 255, 243, 0.16);
  border-radius: 20px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
}

.pitch {
  position: relative;
  min-height: 260px;
  padding: 28px clamp(20px, 5%, 40px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.09), transparent 34%),
    repeating-linear-gradient(90deg, #185c3b 0 58px, #155333 58px 116px);
}

.pitch-lines,
.pitch-lines span {
  position: absolute;
  pointer-events: none;
}

.pitch-lines {
  inset: 12px;
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.center-line {
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.32);
}

.center-circle {
  left: 50%;
  top: 50%;
  width: 96px;
  height: 96px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
}

.penalty {
  top: 50%;
  width: 62px;
  height: 124px;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.penalty-left {
  left: -1px;
  border-left: 0;
}

.penalty-right {
  right: -1px;
  border-right: 0;
}

.pitch-top,
.pitch-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: clamp(10px, 1.7vw, 12px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(238, 255, 245, 0.72);
}

.pitch-top {
  position: relative;
  z-index: 1;
}

.method {
  padding: 4px 9px;
  color: #f4fff9;
  background: rgba(13, 32, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
}

.competition {
  overflow: hidden;
  max-width: 56%;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.teams {
  position: relative;
  z-index: 1;
  align-items: center;
  gap: clamp(12px, 3%, 20px);
  margin: 36px 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.team {
  font-family: Georgia, serif;
  font-size: clamp(20px, 4.4vw, 36px);
  font-weight: 700;
  line-height: 1.12;
  text-wrap: balance;
}

.team:first-child {
  text-align: right;
}

.score {
  min-width: clamp(74px, 15vw, 116px);
  padding: 9px 14px;
  font-size: clamp(24px, 5vw, 40px);
  line-height: 1;
  text-align: center;
  color: #0d2018;
  background: #f2fff7;
  border-radius: 14px;
  font-variant-numeric: tabular-nums;
}

.pitch-meta {
  position: relative;
  z-index: 1;
  text-transform: none;
  letter-spacing: 0;
}

.ball {
  position: absolute;
  right: 20px;
  bottom: 64px;
  width: 38px;
  opacity: 0.85;
}

.main {
  padding: clamp(20px, 4%, 34px);
}

.probability-head {
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  display: flex;
}

.probability-head h2 {
  margin: 0;
  font-size: clamp(15px, 2.6vw, 19px);
}

.probability-head strong {
  color: #7ff0b1;
  font-size: clamp(13px, 2.4vw, 16px);
  text-align: right;
}

.probabilities {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.probability-label,
.probability {
  display: grid;
}

.probability-label {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  font-size: clamp(12px, 2vw, 14px);
}

.probability-label span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.probability-label b {
  color: #d8ffe8;
  font-variant-numeric: tabular-nums;
}

.bar {
  height: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.bar .home {
  background: linear-gradient(90deg, #37d185, #98f7c6);
}

.bar .draw {
  background: linear-gradient(90deg, #f0c04f, #ffe7a1);
}

.bar .away {
  background: linear-gradient(90deg, #5d9ae8, #b8d8ff);
}

.grid {
  margin-top: 24px;
  gap: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid > :only-child {
  grid-column: 1 / -1;
}

.chart-card {
  min-width: 0;
  padding: 16px;
  background: rgba(248, 251, 248, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 14px;
}

.card-title {
  display: block;
  margin-bottom: 12px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(232, 255, 242, 0.62);
}

.hexagram {
  margin: 0 0 4px;
  color: #f8fbf8;
  font-family: Georgia, serif;
  font-size: clamp(17px, 2.8vw, 22px);
  font-weight: 700;
}

.muted {
  margin: 3px 0;
  color: rgba(240, 255, 247, 0.68);
  font-size: clamp(11px, 1.8vw, 12.5px);
}

.lines {
  margin-top: 16px;
  display: grid;
  gap: 6px;
}

.line-row {
  align-items: center;
  gap: 7px;
  display: flex;
}

.line-row i {
  width: 50px;
  height: 6px;
  background: #effef5;
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
}

.line-row i.yin {
  background: transparent;
}

.line-row b {
  width: 22px;
  height: 6px;
  background: #effef5;
}

.line-row em {
  color: #7ff0b1;
  font-size: 9px;
  font-style: normal;
}

.chart-card dl {
  margin: 0;
  display: grid;
  gap: 10px;
}

.signal dt {
  color: rgba(237, 255, 244, 0.58);
  font-size: 10.5px;
}

.signal dd {
  margin: 2px 0 0;
  color: #f2fff8;
  font-size: clamp(12px, 2vw, 13.5px);
  line-height: 1.35;
}

.conclusion {
  margin-top: 18px;
  padding: 17px;
  background: linear-gradient(90deg, rgba(81, 224, 149, 0.16), rgba(248, 251, 248, 0.06));
  border: 1px solid rgba(127, 240, 177, 0.22);
  border-radius: 14px;
}

.conclusion p {
  margin: 0;
  color: #f6fff9;
  font-size: clamp(13px, 2.3vw, 15px);
  line-height: 1.6;
}

.alternates {
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  color: rgba(236, 255, 244, 0.66);
  font-size: 11px;
}

.alternates strong {
  padding: 3px 7px;
  color: #eafff3;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
}

.poster-footer {
  padding: 16px clamp(20px, 4%, 34px) 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #0a1811;
}

.brand {
  display: grid;
  gap: 3px;
}

.brand strong {
  font-size: 15px;
  letter-spacing: 0.14em;
}

.brand span {
  color: rgba(237, 255, 244, 0.54);
  font-size: 10.5px;
}

.qr {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  padding: 4px;
  background: #f4fff8;
  border-radius: 7px;
}

.qr-svg :deep(svg),
:deep(.qr-svg svg) {
  width: 100%;
  height: 100%;
}

@media (max-width: 620px) {
  .pitch {
    min-height: 228px;
  }

  .center-circle {
    width: 72px;
    height: 72px;
  }

  .ball {
    display: none;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 400px) {
  .teams {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .team:first-child {
    text-align: center;
  }

  .score {
    justify-self: center;
  }

  .pitch-meta {
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
}
</style>
