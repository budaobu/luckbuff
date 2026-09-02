<template>
  <div class="ncp">
    <article class="ncp-sheet">
      <header class="ncp-head">
        <div class="ncp-brand">
          <span class="ncp-seal">{{ $t('nameCompatibility.poster.seal') }}</span>
          <div>
            <p class="ncp-kicker">{{ $t('nameCompatibility.poster.kicker') }}</p>
            <h1>{{ $t('nameCompatibility.poster.title', { a: result.nameA.name, b: result.nameB.name }) }}</h1>
          </div>
        </div>
        <span class="ncp-pattern">{{ $t(`nameCompatibility.pattern.${result.pattern}`) }}</span>
      </header>

      <section class="ncp-pair">
        <div class="ncp-side">
          <small>A</small>
          <strong>{{ result.nameA.name }}</strong>
          <span>{{ $t('nameCompatibility.personalityElement') }} · {{ result.nameA.personalityElement }}</span>
          <b>{{ result.nameA.personalityFortune }}</b>
        </div>
        <div class="ncp-flow">
          <UIcon name="i-heroicons-arrows-right-left" />
          <span>{{ flowLabel }}</span>
        </div>
        <div class="ncp-side">
          <small>B</small>
          <strong>{{ result.nameB.name }}</strong>
          <span>{{ $t('nameCompatibility.personalityElement') }} · {{ result.nameB.personalityElement }}</span>
          <b>{{ result.nameB.personalityFortune }}</b>
        </div>
      </section>

      <section class="ncp-grid-section">
        <header>
          <h2>{{ $t('nameCompatibility.poster.gridTitle') }}</h2>
          <span>{{ $t('nameCompatibility.poster.gridNote') }}</span>
        </header>
        <div class="ncp-grid-cards">
          <div v-for="side in [result.nameA, result.nameB]" :key="side.name" class="ncp-grid-card">
            <span>{{ side.name }}</span>
            <strong>{{ side.totalValue }}</strong>
            <em>{{ side.totalFortune }}</em>
          </div>
          <div class="ncp-signals">
            <p v-for="signal in result.sharedSignals" :key="signal" class="shared">
              {{ $t(`nameCompatibility.signals.${signal}`) }}
            </p>
            <p v-for="signal in result.cautionSignals" :key="signal" class="caution">
              {{ $t(`nameCompatibility.signals.${signal}`) }}
            </p>
          </div>
        </div>
      </section>

      <section class="ncp-reading">
        <header>
          <h2>{{ $t('nameCompatibility.poster.readingTitle') }}</h2>
          <span v-if="streaming" class="live"><i />{{ $t('nameCompatibility.interpreting') }}</span>
        </header>
        <div v-if="error" class="error">
          <p>{{ error }}</p>
          <button type="button" @click="$emit('retry')">{{ $t('common.retry') }}</button>
        </div>
        <template v-else>
          <p class="overview">{{ reading.overview || $t('nameCompatibility.aiPending') }}</p>
          <dl>
            <div>
              <dt>{{ $t('nameCompatibility.reading.match') }}</dt>
              <dd>{{ reading.match }}</dd>
            </div>
            <div>
              <dt>{{ $t('nameCompatibility.reading.grid') }}</dt>
              <dd>{{ reading.grid }}</dd>
            </div>
            <div class="wide">
              <dt>{{ $t('nameCompatibility.reading.flow') }}</dt>
              <dd>{{ reading.flow }}</dd>
            </div>
            <div class="wide">
              <dt>{{ $t('nameCompatibility.reading.tips') }}</dt>
              <dd>
                <p v-for="tip in reading.tips" :key="tip">{{ tip }}</p>
              </dd>
            </div>
          </dl>
          <p v-if="reading.note" class="note">{{ reading.note }}</p>
        </template>
      </section>

      <footer>
        <span>www.ososn.com</span>
        <span>{{ $t('nameCompatibility.poster.disclaimer') }}</span>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { NameCompatibilityResult } from '~~/server/utils/name-compatibility/engine'

const props = defineProps<{
  result: NameCompatibilityResult
  aiContent: string
  streaming: boolean
  error: string | null
}>()

defineEmits<{ retry: [] }>()
const { t } = useI18n()

const flowLabel = computed(() => t(`nameCompatibility.flow.${props.result.elementFlow}`, {
  a: props.result.nameA.personalityElement,
  b: props.result.nameB.personalityElement,
}))

interface CompatibilityReading {
  overview: string
  match: string
  grid: string
  flow: string
  tips: string[]
  note: string
}

const reading = computed<CompatibilityReading>(() => {
  const value: CompatibilityReading = { overview: '', match: '', grid: '', flow: '', tips: [], note: '' }
  for (const rawLine of props.aiContent.split(/\r?\n/)) {
    const [key = '', ...values] = rawLine.trim().split(':').map(part => part.trim())
    const text = values.join(':')
    if (!text) continue
    if (key === 'OV') value.overview = text
    else if (key === 'MATCH') value.match = text
    else if (key === 'GRID') value.grid = text
    else if (key === 'FLOW') value.flow = text
    else if (key === 'TIP') value.tips.push(text)
    else if (key === 'NOTE') value.note = text
  }
  return value
})
</script>

<style scoped>
.ncp {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 12px;
  color: #372c2c;
  font-family: 'Noto Serif SC', serif;
}

.ncp-sheet {
  background: linear-gradient(135deg, #fff6f4 0%, #fbf3ef 58%, #f6ece6 100%);
  border: 1px solid rgba(93, 38, 41, 0.16);
  box-shadow: 0 18px 45px rgba(93, 38, 41, 0.10);
  padding: clamp(18px, 3vw, 36px);
}

.ncp-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(93, 38, 41, 0.16);
}

.ncp-brand {
  display: flex;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.ncp-seal {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  border-radius: 6px;
  background: #5d2629;
  color: #fff5f0;
  font-size: 12px;
  text-align: center;
  line-height: 1.1;
}

.ncp-kicker {
  margin: 0 0 5px;
  color: #a45549;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(22px, 3.4vw, 38px);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.ncp-pattern {
  flex: 0 0 auto;
  border: 1px solid #5d2629;
  color: #5d2629;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
}

.ncp-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px minmax(0, 1fr);
  align-items: stretch;
  gap: 14px;
  padding: 24px 0;
  border-bottom: 1px solid rgba(93, 38, 41, 0.16);
}

.ncp-side {
  min-width: 0;
  background: rgba(255, 253, 250, 0.78);
  border: 1px solid rgba(93, 38, 41, 0.14);
  padding: 18px;
  display: grid;
  place-items: center;
  text-align: center;
}

.ncp-side small {
  color: #a45549;
  font-size: 11px;
  letter-spacing: 0.2em;
}

.ncp-side strong {
  margin: 8px 0 5px;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.ncp-side span {
  font-size: 12px;
  color: #756660;
}

.ncp-side b {
  margin-top: 8px;
}

.ncp-flow {
  align-self: center;
  min-height: 112px;
  display: grid;
  place-items: center;
  gap: 8px;
  text-align: center;
  border-left: 2px solid #a45549;
  border-right: 2px solid #a45549;
  color: #5d2629;
  font-size: 13px;
  font-weight: 700;
  padding: 12px;
}

.ncp-flow svg {
  width: 26px;
  height: 26px;
}

.ncp-grid-section,
.ncp-reading {
  padding: 24px 0;
  border-bottom: 1px solid rgba(93, 38, 41, 0.16);
}

.ncp-grid-section header,
.ncp-reading header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  font-size: clamp(17px, 2vw, 21px);
}

.ncp-grid-section header span,
.ncp-grid-card em,
.ncp-signals p {
  color: #756660;
}

.ncp-grid-section header span {
  font-size: 12px;
}

.ncp-grid-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.ncp-grid-card {
  padding: 16px;
  text-align: center;
  background: rgba(255, 253, 250, 0.8);
  border: 1px solid rgba(93, 38, 41, 0.13);
}

.ncp-grid-card span {
  display: block;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.ncp-grid-card strong {
  display: block;
  font-size: 35px;
  margin: 8px 0;
}

.ncp-grid-card em {
  font-style: normal;
  font-size: 13px;
}

.ncp-signals {
  border: 1px dashed rgba(93, 38, 41, 0.28);
  padding: 14px;
  display: grid;
  align-content: center;
  gap: 6px;
  font-size: 12px;
}

.ncp-signals .shared {
  color: #4b6b51;
}

.ncp-signals .caution {
  color: #a45549;
}

.ncp-reading header span {
  color: #a45549;
  font-size: 12px;
}

.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.live i {
  width: 7px;
  height: 7px;
  background: #a45549;
  border-radius: 50%;
  animation: pulse 1.2s infinite;
}

.overview {
  margin: 0 0 14px;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.7;
}

.ncp-reading dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

dt {
  color: #5d2629;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

dd {
  margin: 0;
  line-height: 1.65;
}

.wide {
  grid-column: 1 / -1;
}

.wide dd p {
  margin: 0 0 5px;
}

.note {
  margin: 14px 0 0;
  padding-top: 10px;
  border-top: 1px dashed rgba(93, 38, 41, 0.22);
  color: #756660;
  font-size: 12px;
}

.error {
  border: 1px solid rgba(164, 85, 73, 0.35);
  background: rgba(164, 85, 73, 0.08);
  padding: 14px;
}

.error p {
  margin: 0 0 8px;
  overflow-wrap: anywhere;
}

.error button {
  border: 0;
  background: #5d2629;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
}

.ncp-sheet footer {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-top: 16px;
  color: #756660;
  font-size: 12px;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@media (max-width: 760px) {
  .ncp-head {
    flex-direction: column;
  }

  .ncp-pair {
    grid-template-columns: 1fr;
  }

  .ncp-flow {
    min-height: 72px;
    border-left: 0;
    border-right: 0;
    border-top: 2px solid #a45549;
    border-bottom: 2px solid #a45549;
  }

  .ncp-grid-cards,
  .ncp-reading dl {
    grid-template-columns: 1fr;
  }

  .ncp-grid-section header,
  .ncp-reading header {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .ncp-sheet footer {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
