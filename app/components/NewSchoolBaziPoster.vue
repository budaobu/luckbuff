<template>
  <div class="nsb">
    <div class="nsb-sheet">
      <div class="nsb-frame" aria-hidden="true" />

      <header class="nsb-head">
        <div class="nsb-brand-row">
          <span class="nsb-brand">{{ $t('newSchoolBazi.poster.brand') }}</span>
          <span class="nsb-meta">{{ generatedAt }}</span>
        </div>
        <h1 class="nsb-title">{{ title || $t('newSchoolBazi.poster.title') }}</h1>
        <p class="nsb-subtitle">
          {{ $t('newSchoolBazi.poster.subtitle', { dayMaster: chart.riZhu, strength: chart.riZhuStrength }) }}
        </p>
        <p class="nsb-method">{{ methodNotice || $t('newSchoolBazi.methodNotice') }}</p>

        <div class="nsb-pillars">
          <div v-for="pillar in pillarItems" :key="pillar.label" class="nsb-pillar">
            <span class="nsb-pillar-label">{{ pillar.label }}</span>
            <span class="nsb-pillar-ganzhi" :class="{ 'nsb-horizontal': !verticalGanzhi }">
              {{ pillar.ganzhi }}
            </span>
            <span class="nsb-pillar-god">{{ pillar.god }}</span>
          </div>
        </div>
      </header>

      <section class="nsb-core">
        <div class="nsb-core-grid">
          <div class="nsb-cell">
            <span>{{ $t('newSchoolBazi.poster.geju') }}</span>
            <b>{{ chart.geju }}</b>
          </div>
          <div class="nsb-cell">
            <span>{{ $t('newSchoolBazi.poster.support') }}</span>
            <b>{{ chart.supportScore }}%</b>
          </div>
          <div class="nsb-cell">
            <span>{{ $t('newSchoolBazi.poster.xiyong') }}</span>
            <b>{{ chart.xiyong }}</b>
          </div>
          <div class="nsb-cell">
            <span>{{ $t('newSchoolBazi.poster.jishen') }}</span>
            <b>{{ chart.jishen }}</b>
          </div>
        </div>

        <div class="nsb-rules">
          <p>{{ $t('newSchoolBazi.poster.benqi') }}</p>
          <p>{{ $t('newSchoolBazi.poster.adjacent') }}</p>
          <p>{{ $t('newSchoolBazi.poster.xushi') }}</p>
        </div>
      </section>

      <section class="nsb-reading">
        <div class="nsb-reading-head">{{ $t('newSchoolBazi.poster.reading') }}</div>

        <template v-if="summary || points.length">
          <p class="nsb-summary">{{ summary }}</p>
          <div class="nsb-points">
            <p v-for="point in points" :key="point">{{ point }}</p>
          </div>
          <div v-if="actions.length" class="nsb-actions">
            <span v-for="action in actions" :key="action">{{ action }}</span>
          </div>
        </template>

        <div v-else-if="streaming" class="nsb-pending">
          <span class="nsb-skeleton" />
          <span class="nsb-skeleton nsb-skeleton-short" />
        </div>

        <p v-else-if="error" class="nsb-error">{{ error }}</p>
        <p v-else class="nsb-error">{{ $t('newSchoolBazi.readingFailed') }}</p>
      </section>

      <footer class="nsb-foot">
        <div class="nsb-disclaimer-row">
          <p class="nsb-disclaimer">
            {{ disclaimer || $t('newSchoolBazi.poster.disclaimer') }}
          </p>
          <div class="nsb-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" v-html="qrSvg" />
            <span v-else>QR</span>
          </div>
        </div>
        <div class="nsb-site-row">
          <span>{{ siteDomain }}</span>
          <span>{{ $t('newSchoolBazi.poster.seal') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewSchoolBaziChart } from '~/types/new-school-bazi'

interface Props {
  chart: NewSchoolBaziChart
  aiContent: string
  methodNotice?: string
  streaming?: boolean
  error?: string | null
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  methodNotice: '',
  streaming: false,
  error: null,
  name: '',
})

const { t, locale } = useI18n()
const siteDomain = 'www.ososn.com'
const verticalGanzhi = locale.value !== 'en'

const generatedAt = computed(() => new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).replace(/\//g, '-'))

const pillarItems = computed(() => {
  const items = [
    { label: t('newSchoolBazi.poster.year'), pillar: props.chart.year },
    { label: t('newSchoolBazi.poster.month'), pillar: props.chart.month },
    { label: t('newSchoolBazi.poster.day'), pillar: props.chart.day },
    { label: t('newSchoolBazi.poster.hour'), pillar: props.chart.hour },
  ]
  return items.map((item) => {
    if (!item.pillar) {
      return { label: item.label, ganzhi: t('newSchoolBazi.poster.unknown'), god: '' }
    }
    return {
      label: item.label,
      ganzhi: `${item.pillar.gan}${item.pillar.zhi}`,
      god: item.pillar.shishen || '',
    }
  })
})

const protocolLines = computed(() => props.aiContent
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean))

function lastProtocolLine(prefix: string): string {
  return protocolLines.value
    .filter(line => line.startsWith(`${prefix}:`))
    .pop()
    ?.slice(prefix.length + 1)
    .trim() ?? ''
}

const title = computed(() => lastProtocolLine('TITLE'))
const summary = computed(() => lastProtocolLine('SUMMARY'))
const disclaimer = computed(() => lastProtocolLine('DISCLAIMER'))
const points = computed(() => protocolLines.value
  .filter(line => line.startsWith('POINT:'))
  .map(line => line.slice(6).trim())
  .filter(Boolean)
  .slice(0, 3))
const actions = computed(() => protocolLines.value
  .filter(line => line.startsWith('ACTION:'))
  .map(line => line.slice(7).trim())
  .filter(Boolean)
  .slice(0, 2))

const qrSvg = ref('')
onMounted(async () => {
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/new-school-bazi`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#715331', light: '#00000000' },
  })
})
</script>

<style scoped>
.nsb {
  --nsb-shell: #f2ece1;
  --nsb-paper: #fbf6ea;
  --nsb-card: #fffdf7;
  --nsb-line: #d7cdb8;
  --nsb-line-soft: #e5dcc9;
  --nsb-ink: #312a22;
  --nsb-muted: #6b6153;
  --nsb-faint: #948a79;
  --nsb-teal: #43696b;
  --nsb-cinnabar: #a1402f;
  --nsb-gold: #7b5a25;
  width: 100%;
  padding: 10px;
  color: var(--nsb-ink);
  background: var(--nsb-shell);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.nsb-sheet {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--nsb-line);
  background: var(--nsb-paper);
  box-shadow: inset 0 0 36px rgba(123, 90, 37, 0.07);
}

.nsb-frame {
  position: absolute;
  inset: 8px;
  border: 1px solid var(--nsb-line-soft);
  opacity: 0.45;
  pointer-events: none;
}

.nsb-head,
.nsb-core,
.nsb-reading,
.nsb-foot {
  position: relative;
  padding: 24px;
}

.nsb-head {
  text-align: center;
  border-bottom: 1px solid var(--nsb-line);
}

.nsb-brand-row {
  display: flex;
  justify-content: space-between;
  color: var(--nsb-faint);
  font-size: 11px;
  letter-spacing: 2px;
}

.nsb-brand {
  color: var(--nsb-gold);
  font-weight: 700;
}

.nsb-title {
  margin: 20px 0 0;
  font-size: clamp(30px, 7vw, 42px);
  line-height: 1.12;
  letter-spacing: 0;
}

.nsb-subtitle {
  margin: 12px auto 0;
  max-width: 28em;
  color: var(--nsb-muted);
  font-size: 14px;
  line-height: 1.6;
}

.nsb-method {
  min-height: 20px;
  margin: 16px auto 0;
  max-width: 32em;
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, var(--nsb-cinnabar) 38%, transparent);
  color: var(--nsb-cinnabar);
  background: color-mix(in srgb, var(--nsb-cinnabar) 7%, transparent);
  font-size: 11.5px;
  line-height: 1.5;
}

.nsb-pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.nsb-pillar {
  min-height: 148px;
  padding: 10px 6px;
  border: 1px solid var(--nsb-line);
  background: linear-gradient(180deg, color-mix(in srgb, var(--nsb-teal) 7%, transparent), transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.nsb-pillar-label {
  font-size: 11px;
  color: var(--nsb-gold);
  letter-spacing: 2px;
}

.nsb-pillar-ganzhi {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 4px;
}

.nsb-pillar-ganzhi.nsb-horizontal {
  writing-mode: horizontal-tb;
  text-orientation: mixed;
}

.nsb-pillar-god {
  min-height: 17px;
  font-size: 11px;
  color: var(--nsb-cinnabar);
}

.nsb-core {
  border-bottom: 1px solid var(--nsb-line);
}

.nsb-core-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.nsb-cell {
  min-width: 0;
  min-height: 84px;
  padding: 12px 8px;
  border: 1px solid var(--nsb-line-soft);
  background: var(--nsb-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.nsb-cell span {
  color: var(--nsb-muted);
  font-size: 11px;
  letter-spacing: 1px;
}

.nsb-cell b {
  font-size: 15px;
  line-height: 1.3;
}

.nsb-rules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.nsb-rules p {
  margin: 0;
  min-height: 68px;
  padding: 10px;
  color: var(--nsb-muted);
  border-left: 2px solid var(--nsb-teal);
  background: color-mix(in srgb, var(--nsb-teal) 5%, transparent);
  font-size: 11px;
  line-height: 1.55;
}

.nsb-reading-head {
  color: var(--nsb-gold);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 4px;
}

.nsb-summary {
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.75;
}

.nsb-points {
  display: grid;
  gap: 9px;
  margin-top: 16px;
}

.nsb-points p {
  margin: 0;
  padding-left: 12px;
  border-left: 2px solid var(--nsb-cinnabar);
  color: var(--nsb-ink);
  font-size: 13px;
  line-height: 1.7;
}

.nsb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.nsb-actions span {
  max-width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--nsb-teal);
  color: var(--nsb-teal);
  font-size: 11px;
  line-height: 1.4;
}

.nsb-pending {
  display: grid;
  gap: 12px;
  min-height: 110px;
  align-content: center;
}

.nsb-skeleton {
  display: block;
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(123, 90, 37, 0.22), transparent);
  animation: nsb-shimmer 1.3s infinite;
}

.nsb-skeleton-short {
  width: 58%;
}

@keyframes nsb-shimmer {
  from { transform: translateX(-35%); }
  to { transform: translateX(35%); }
}

.nsb-error {
  margin: 18px 0 0;
  color: var(--nsb-cinnabar);
  font-size: 12px;
  line-height: 1.6;
}

.nsb-foot {
  border-top: 1px solid var(--nsb-line);
}

.nsb-disclaimer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 46px;
  align-items: center;
  gap: 12px;
}

.nsb-disclaimer {
  margin: 0;
  color: var(--nsb-muted);
  font-size: 10.5px;
  line-height: 1.55;
}

.nsb-qr {
  width: 46px;
  height: 46px;
  overflow: hidden;
}

.nsb-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

.nsb-qr span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border: 1px solid var(--nsb-line);
  color: var(--nsb-faint);
  font-size: 9px;
}

.nsb-site-row {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: var(--nsb-gold);
  font-size: 11px;
  letter-spacing: 1px;
}

@media (max-width: 640px) {
  .nsb-head,
  .nsb-core,
  .nsb-reading,
  .nsb-foot {
    padding: 18px 15px;
  }

  .nsb-core-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .nsb-rules {
    grid-template-columns: 1fr;
  }

  .nsb-pillar {
    min-height: 126px;
  }

  .nsb-pillar-ganzhi {
    font-size: 20px;
  }
}
</style>
