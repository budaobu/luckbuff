<template>
  <div class="mbp">
    <div class="mbp-sheet">
      <div class="mbp-mesh" aria-hidden="true" />

      <header class="mbp-head">
        <div class="mbp-brand-row">
          <span class="mbp-brand">{{ $t('mangpaiBazi.poster.brand') }}</span>
          <span class="mbp-era">{{ result.flowYear.year }} · {{ result.flowYear.gan }}{{ result.flowYear.zhi }}</span>
        </div>

        <h1 class="mbp-title">{{ $t('mangpaiBazi.poster.title') }}</h1>
        <p class="mbp-subtitle">{{ $t('mangpaiBazi.poster.subtitle', { dayMaster: result.dayMaster.gan, strength: result.chart.riZhuStrength }) }}</p>

        <div class="mbp-pillars" aria-hidden="false">
          <div
            v-for="item in pillarItems"
            :key="item.label"
            class="mbp-pillar"
          >
            <span class="mbp-pillar-label">{{ item.label }}</span>
            <span class="mbp-pillar-ganzhi">{{ item.ganzhi }}</span>
            <span class="mbp-pillar-god">{{ item.god }}</span>
          </div>
        </div>

        <p class="mbp-overview">
          <span v-if="!overview && streaming" class="mbp-skeleton" />
          <template v-else>{{ overview || $t('mangpaiBazi.poster.pending') }}</template>
        </p>
      </header>

      <section class="mbp-ring">
        <div class="mbp-ring-title">
          <span>{{ $t('mangpaiBazi.poster.godRing') }}</span>
          <b>{{ result.shensha.flowYearBranch }}{{ $t('mangpaiBazi.poster.godStart') }}</b>
        </div>
        <div class="mbp-ring-grid">
          <span
            v-for="god in result.shensha.ring"
            :key="god.branch"
            class="mbp-ring-cell"
            :class="{ 'is-flow-year': god.branch === result.shensha.flowYearBranch }"
          >
            <i>{{ god.branch }}</i>{{ god.name }}
          </span>
        </div>
      </section>

      <section
        v-for="section in activeSections"
        :key="section.id"
        class="mbp-section"
        :class="`mbp-${section.id}`"
      >
        <div class="mbp-section-head">
          <span class="mbp-section-name">{{ $t(`mangpaiBazi.poster.sections.${section.id}`) }}</span>
          <span v-if="section.periods.length" class="mbp-years">
            {{ section.periods.join(' · ') }}
          </span>
        </div>
        <p class="mbp-verdict">{{ section.text }}</p>
        <p class="mbp-basis">
          {{ $t('mangpaiBazi.poster.basisPrefix') }}{{ section.basis }}
        </p>
      </section>

      <section v-if="streaming" class="mbp-section mbp-section-pending">
        <div class="mbp-section-head">
          <span class="mbp-section-name">{{ $t('mangpaiBazi.poster.generating') }}</span>
        </div>
        <span class="mbp-skeleton mbp-skeleton-wide" />
      </section>

      <p v-if="error && !hasSections" class="mbp-error">{{ error }}</p>

      <footer class="mbp-foot">
        <div class="mbp-sign">
          <span class="mbp-seal">{{ $t('mangpaiBazi.poster.seal') }}</span>
          <span class="mbp-site">{{ siteDomain }}</span>
        </div>
        <div class="mbp-disclaimer-row">
          <p class="mbp-disclaimer">{{ $t('mangpaiBazi.poster.disclaimer') }}</p>
          <div class="mbp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" v-html="qrSvg" />
            <span v-else>QR</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MangpaiCalcResult, MangpaiPosterData, MangpaiSection } from '~/types/mangpai-bazi'

interface Props {
  result: MangpaiCalcResult
  data: MangpaiPosterData
  streaming?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  error: null,
})

const { t } = useI18n()
const siteDomain = 'www.ososn.com'
const overview = computed(() => props.data.overview)
const hasSections = computed(() => Object.keys(props.data.sections).length > 0)

const pillarItems = computed(() => {
  const chart = props.result.chart
  const godOf = (pillar: typeof chart.year) =>
    props.result.shensha.natal.find(item => item.gan === pillar.gan && item.zhi === pillar.zhi)?.god ?? ''

  return [
    { label: t('mangpaiBazi.poster.year'), pillar: chart.year },
    { label: t('mangpaiBazi.poster.month'), pillar: chart.month },
    { label: t('mangpaiBazi.poster.day'), pillar: chart.day },
    { label: t('mangpaiBazi.poster.hour'), pillar: chart.hour },
  ].map((item) => {
    if (!item.pillar) {
      return { label: item.label, ganzhi: t('mangpaiBazi.poster.unknown'), god: '' }
    }
    return {
      label: item.label,
      ganzhi: `${item.pillar.gan}${item.pillar.zhi}`,
      god: godOf(item.pillar),
    }
  })
})

const sectionOrder: MangpaiSection['id'][] = [
  'family', 'career', 'wealth', 'marriage', 'health', 'timing',
]

const activeSections = computed(() =>
  sectionOrder
    .map(id => props.data.sections[id])
    .filter((section): section is MangpaiSection => Boolean(section)),
)

const qrSvg = ref('')
onMounted(async () => {
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/mangpai-bazi`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#e8c88a', light: '#00000000' },
  })
})
</script>

<style scoped>
.mbp {
  --mbp-shell: #0f0d0b;
  --mbp-sheet: #17130f;
  --mbp-paper: #221b15;
  --mbp-line: #3d3328;
  --mbp-line-soft: #2c251d;
  --mbp-ink: #f2ead9;
  --mbp-ink-soft: #c9bcab;
  --mbp-ink-faint: #8f8578;
  --mbp-bronze: #d3a661;
  --mbp-bronze-dark: #946f34;
  --mbp-cinnabar: #b5473a;
  --mbp-jade: #688a72;
  width: 100%;
  color: var(--mbp-ink);
  background: var(--mbp-shell);
  padding: 10px;
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.mbp-sheet {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(211, 166, 97, 0.11), transparent 32%),
    var(--mbp-sheet);
  border: 1px solid var(--mbp-line);
  box-shadow: inset 0 0 34px rgba(0, 0, 0, 0.42);
}

.mbp-mesh {
  position: absolute;
  inset: 8px;
  border: 1px solid var(--mbp-line-soft);
  opacity: 0.4;
  pointer-events: none;
}

.mbp-head {
  padding: 28px 22px 24px;
  border-bottom: 1px solid var(--mbp-line);
  text-align: center;
}

.mbp-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--mbp-ink-faint);
  font-size: 10px;
  letter-spacing: 3px;
}

.mbp-brand {
  color: var(--mbp-bronze);
  font-weight: 700;
}

.mbp-era {
  font-variant-numeric: tabular-nums;
}

.mbp-title {
  margin: 24px 0 0;
  font-size: clamp(30px, 9vw, 44px);
  line-height: 1;
  letter-spacing: 7px;
  font-weight: 700;
  text-shadow: 0 0 16px rgba(211, 166, 97, 0.15);
}

.mbp-subtitle {
  margin: 12px auto 0;
  max-width: 24em;
  color: var(--mbp-ink-soft);
  font-size: 12.5px;
  letter-spacing: 1.5px;
}

.mbp-pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}

.mbp-pillar {
  min-height: 142px;
  padding: 10px 6px;
  background: linear-gradient(180deg, rgba(211, 166, 97, 0.08), rgba(0, 0, 0, 0.25));
  border: 1px solid var(--mbp-line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.mbp-pillar-label {
  font-size: 10px;
  color: var(--mbp-bronze);
  letter-spacing: 2px;
}

.mbp-pillar-ganzhi {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 25px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 5px;
}

.mbp-pillar-god {
  min-height: 18px;
  font-size: 10px;
  color: var(--mbp-cinnabar);
  letter-spacing: 1px;
  white-space: nowrap;
}

.mbp-overview {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22px auto 0;
  max-width: 33em;
  font-size: 13px;
  line-height: 1.75;
  color: var(--mbp-ink);
}

.mbp-ring {
  padding: 16px 22px;
  border-bottom: 1px solid var(--mbp-line);
}

.mbp-ring-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--mbp-bronze);
  font-size: 11px;
  letter-spacing: 3px;
}

.mbp-ring-title b {
  color: var(--mbp-ink);
  font-weight: 700;
}

.mbp-ring-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 12px;
}

.mbp-ring-cell {
  min-width: 0;
  padding: 6px 3px;
  border: 1px solid var(--mbp-line-soft);
  background: rgba(34, 27, 21, 0.72);
  color: var(--mbp-ink-soft);
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mbp-ring-cell i {
  margin-right: 3px;
  color: var(--mbp-bronze);
  font-style: normal;
}

.mbp-ring-cell.is-flow-year {
  border-color: var(--mbp-cinnabar);
  color: var(--mbp-ink);
}

.mbp-section {
  position: relative;
  padding: 18px 22px 17px;
  border-bottom: 1px solid var(--mbp-line);
}

.mbp-section::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 2px;
  background: var(--mbp-bronze-dark);
}

.mbp-section-health::before { background: var(--mbp-jade); }
.mbp-section-timing::before { background: var(--mbp-cinnabar); }

.mbp-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mbp-section-name {
  color: var(--mbp-bronze);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
}

.mbp-years {
  flex-shrink: 0;
  border: 1px solid var(--mbp-bronze-dark);
  color: var(--mbp-bronze);
  padding: 3px 7px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  white-space: nowrap;
}

.mbp-verdict {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 0.4px;
}

.mbp-basis {
  margin: 8px 0 0;
  color: var(--mbp-ink-faint);
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.mbp-section-pending {
  display: flex;
  align-items: center;
  min-height: 78px;
}

.mbp-section-pending .mbp-section-head {
  width: 130px;
  flex-shrink: 0;
}

.mbp-skeleton {
  display: inline-block;
  width: 58%;
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(211, 166, 97, 0.28), transparent);
  animation: mbp-shimmer 1.3s infinite;
}

.mbp-skeleton-wide { width: 100%; }

@keyframes mbp-shimmer {
  from { transform: translateX(-35%); }
  to { transform: translateX(35%); }
}

.mbp-error {
  margin: 0;
  padding: 16px 22px;
  color: #d99388;
  font-size: 12px;
}

.mbp-foot {
  padding: 18px 22px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.24));
}

.mbp-sign {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mbp-seal {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border: 2px solid var(--mbp-cinnabar);
  color: var(--mbp-cinnabar);
  transform: rotate(-5deg);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}

.mbp-site {
  color: var(--mbp-bronze);
  font-size: 12px;
  letter-spacing: 1px;
}

.mbp-disclaimer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 46px;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  border-top: 1px solid var(--mbp-line-soft);
  padding-top: 12px;
}

.mbp-disclaimer {
  margin: 0;
  color: var(--mbp-ink-faint);
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.mbp-qr {
  width: 46px;
  height: 46px;
  overflow: hidden;
}

.mbp-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

.mbp-qr span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border: 1px solid var(--mbp-line);
  color: var(--mbp-ink-faint);
  font-size: 9px;
}

@media (max-width: 420px) {
  .mbp-head,
  .mbp-ring,
  .mbp-section,
  .mbp-foot {
    padding-left: 15px;
    padding-right: 15px;
  }

  .mbp-ring-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mbp-pillar-ganzhi {
    font-size: 21px;
  }

  .mbp-title {
    letter-spacing: 4px;
  }

  .mbp-section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .mbp-years {
    align-self: flex-start;
  }
}
</style>
