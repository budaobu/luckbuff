<template>
  <section class="ta3d" data-testid="thai-astro-3d">
    <div class="ta3d-topbar">
      <div class="ta3d-identity">
        <strong>{{ result.input.location.name }}</strong>
        <span>{{ result.input.birthDate }} {{ result.input.birthTime }} · {{ result.input.location.timezone }}</span>
      </div>
      <div class="ta3d-controls">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="reducedMotion"
          :aria-pressed="isAnimating"
          data-testid="thai-astro-animation-toggle"
          @click="toggleAnimation"
        >
          <UIcon :name="isAnimating ? 'i-heroicons-pause' : 'i-heroicons-play'" class="h-4 w-4" />
          {{ isAnimating ? t('thaiAstro.threeD.pause') : t('thaiAstro.threeD.play') }}
        </UButton>
        <UButton color="neutral" variant="outline" size="sm" data-testid="thai-astro-true-position" @click="showTruePositions">
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
          {{ t('thaiAstro.threeD.truePositions') }}
        </UButton>
        <UButton color="neutral" variant="outline" size="sm" @click="resetView">
          <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          {{ t('thaiAstro.threeD.resetView') }}
        </UButton>
      </div>
    </div>

    <p v-if="reducedMotion" class="ta3d-note">
      {{ t('thaiAstro.threeD.reducedMotion') }}
    </p>
    <p v-if="chartError" class="ta3d-note ta3d-error" role="status">
      {{ t('thaiAstro.threeD.unavailable') }}
    </p>

    <div class="ta3d-stage-row">
      <div class="ta3d-stage">
        <div ref="stageRoot" class="ta3d-canvas" data-testid="thai-astro-3d-stage" />
        <div
          class="ta3d-meteors"
          :class="{ 'is-running': isAnimating && !reducedMotion }"
          aria-hidden="true"
        >
          <span
            v-for="meteor in meteors"
            :key="meteor.delay"
            :style="{
              '--x': meteor.x,
              '--y': meteor.y,
              '--delay': meteor.delay,
              '--duration': meteor.duration,
            }"
          />
        </div>
        <div
          v-if="hovered"
          class="ta3d-tooltip"
          :style="{ left: `${Math.min(hovered.x + 16, windowWidth - 260)}px`, top: `${hovered.y + 16}px` }"
        >
          <span v-if="hovered.selection.kind === 'planet'">{{ planetTooltip(hovered.selection.key) }}</span>
          <span v-else>{{ houseTooltip(hovered.selection.number) }}</span>
        </div>
      </div>

      <aside class="ta3d-detail" data-testid="thai-astro-selected-detail">
        <template v-if="selected?.kind === 'planet'">
          <h3>{{ bodyName(selected.key) }}</h3>
          <p v-for="line in planetDetails(selected.key)" :key="line">{{ line }}</p>
        </template>
        <template v-else-if="selected">
          <h3>{{ houseDetailTitle(selected.number) }}</h3>
          <p v-for="line in houseDetails(selected.number)" :key="line">{{ line }}</p>
        </template>
        <template v-else>
          <h3>{{ t('thaiAstro.threeD.detailTitle') }}</h3>
          <p>{{ t('thaiAstro.threeD.detailHint') }}</p>
        </template>

        <dl class="ta3d-quick">
          <div><dt>{{ t('thaiAstro.ascendant') }}</dt><dd>{{ signName(result.ascendant.signKey) }} {{ formatDMS(result.ascendant) }}</dd></div>
          <div><dt>{{ t('thaiAstro.tanuseth') }}</dt><dd>{{ result.tanuseth.bodyKey ? `${bodyName(result.tanuseth.bodyKey)} #${result.tanuseth.number}` : '—' }}</dd></div>
          <div><dt>{{ t('thaiAstro.taksa') }}</dt><dd>{{ bodyName(result.taksa.dayKey) }}</dd></div>
          <div><dt>{{ t('thaiAstro.panchangTitle') }}</dt><dd>{{ weekdayName(result.panchang.weekdayKey) }} · {{ panchangName('tithis', result.panchang.tithiKey) }}</dd></div>
        </dl>
      </aside>
    </div>

    <details class="ta3d-data" open>
      <summary>{{ t('thaiAstro.threeD.dataTables') }}</summary>
      <div class="ta3d-table-wrap">
        <table data-testid="thai-astro-planet-table">
          <caption>{{ t('thaiAstro.planetsTitle') }}</caption>
          <thead>
            <tr>
              <th>{{ t('thaiAstro.body') }}</th><th>{{ t('thaiAstro.sign') }}</th><th>{{ t('thaiAstro.degree') }}</th>
              <th>{{ t('thaiAstro.house') }}</th><th>{{ t('thaiAstro.mansion') }}</th><th>{{ t('thaiAstro.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="planet in result.planets" :key="planet.key" :data-planet-key="planet.key">
              <td>{{ planet.symbol }} {{ bodyName(planet.key) }}</td>
              <td>{{ signName(planet.signKey) }}</td>
              <td>{{ formatDMS(planet) }}</td>
              <td>H{{ planet.house }} {{ houseName(planet.houseKey) }}</td>
              <td>{{ mansionName(planet.nakshatraKey) }} p{{ planet.pada }}</td>
              <td>{{ planet.statuses.map(statusName).concat(planet.isRetrograde ? ['R'] : []).join(' · ') || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <table data-testid="thai-astro-house-table">
          <caption>{{ t('thaiAstro.housesTitle') }}</caption>
          <thead><tr><th>#</th><th>{{ t('thaiAstro.sign') }}</th><th>{{ t('thaiAstro.lord') }}</th><th>{{ t('thaiAstro.occupants') }}</th></tr></thead>
          <tbody>
            <tr v-for="house in result.houses" :key="house.number">
              <td>H{{ house.number }} {{ houseName(house.key) }}</td>
              <td>{{ signName(house.signKey) }}</td>
              <td>{{ bodyName(house.signLordKey) }}</td>
              <td>{{ house.occupants.map(bodyName).join(' · ') || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <table>
          <caption>{{ t('thaiAstro.overlaysTitle') }}</caption>
          <thead><tr><th>{{ t('thaiAstro.body') }}</th><th>{{ t('thaiAstro.triyanga') }}</th><th>{{ t('thaiAstro.navamsa') }}</th><th>{{ t('thaiAstro.mansionLord') }}</th></tr></thead>
          <tbody>
            <tr v-for="planet in result.planets" :key="`overlay-${planet.key}`">
              <td>{{ bodyName(planet.key) }}</td>
              <td>{{ triyangaName(planet) }} · {{ signName(triyangaSign(planet.longitude)) }}</td>
              <td>{{ navamsaName(planet.longitude) }} · {{ signName(navamsaSign(planet.longitude)) }}</td>
              <td>{{ bodyName(planet.nakshatraLordKey as ThaiBodyKey) }}</td>
            </tr>
          </tbody>
        </table>

        <table>
          <caption>{{ t('thaiAstro.taksa') }}</caption>
          <tbody>
            <tr v-for="item in result.taksa.positions" :key="item.role">
              <th scope="row">{{ taksaRoleName(item.role) }}</th>
              <td>{{ bodyName(item.bodyKey) }}</td>
            </tr>
          </tbody>
        </table>

        <table>
          <caption>{{ t('thaiAstro.methodologyTitle') }}</caption>
          <tbody>
            <tr><th scope="row">{{ t('thaiAstro.birthUtc') }}</th><td>{{ formatDateTime(result.input.birthUtc) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.location') }}</th><td>{{ result.input.location.name }} · {{ result.input.location.latitude }}, {{ result.input.location.longitude }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.engine') }}</th><td>{{ result.methodology.ayanamsa }} · {{ result.methodology.ayanamsha.toFixed(3) }}°</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.houseSystem') }}</th><td>{{ result.methodology.houseSystem }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.thaiKetu') }}</th><td>{{ result.methodology.thaiKetu }}</td></tr>
          </tbody>
        </table>

        <table>
          <caption>{{ t('thaiAstro.panchangTitle') }}</caption>
          <tbody>
            <tr><th scope="row">{{ t('thaiAstro.weekday') }}</th><td>{{ weekdayName(result.panchang.weekdayKey) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.tithi') }}</th><td>{{ panchangName('tithis', result.panchang.tithiKey) }} · {{ panchangName('pakshas', result.panchang.pakshaKey) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.moonMansion') }}</th><td>{{ mansionName(result.panchang.moonNakshatraKey) }} · {{ panchangName('yogas', result.panchang.yogaKey) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.karana') }}</th><td>{{ panchangName('karanas', result.panchang.karanaKey) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.sunrise') }}</th><td>{{ formatDateTime(result.panchang.sunrise) }}</td></tr>
            <tr><th scope="row">{{ t('thaiAstro.sunset') }}</th><td>{{ formatDateTime(result.panchang.sunset) }}</td></tr>
          </tbody>
        </table>
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
import type {
  ThaiAstroChartResult,
  ThaiBodyKey,
  ThaiHouseKey,
  ThaiSignKey,
  ThaiStatusKey,
  ThaiTaksaRole,
} from '~~/server/utils/tools/thai-astro-paipan'
import type { ThaiAstro3DSelection } from '~/utils/thai-astro-3d/model'
import type { ThaiAstro3DHover, ThaiAstro3DMount } from '~/utils/thai-astro-3d/renderer'

const props = defineProps<{ result: ThaiAstroChartResult }>()
const { t } = useI18n()
const stageRoot = ref<HTMLElement | null>(null)
const mount = shallowRef<ThaiAstro3DMount | null>(null)
const isAnimating = ref(false)
const reducedMotion = ref(false)
const chartError = ref('')
const hovered = ref<ThaiAstro3DHover | null>(null)
const selected = ref<ThaiAstro3DSelection | null>(null)
const windowWidth = ref(1280)
const meteors = [
  { x: '8%', y: '13%', delay: '0.4s', duration: '5.4s' },
  { x: '36%', y: '6%', delay: '2.1s', duration: '6.2s' },
  { x: '63%', y: '11%', delay: '3.6s', duration: '5.8s' },
  { x: '18%', y: '27%', delay: '4.9s', duration: '6.6s' },
  { x: '48%', y: '21%', delay: '1.4s', duration: '5.1s' },
  { x: '74%', y: '24%', delay: '5.8s', duration: '6.9s' },
]

const BODY_KEYS: Record<string, string> = {
  Sun: 'sun', Moon: 'moon', Mars: 'mars', Mercury: 'mercury', Jupiter: 'jupiter', Ketu: 'thaiKetu',
  Venus: 'venus', Saturn: 'saturn', Rahu: 'rahu', ThaiKetu: 'thaiKetu', Uranus: 'uranus',
}
const SIGN_KEYS: ThaiSignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]
const HOUSE_KEYS: Record<ThaiHouseKey, string> = {
  tanu: 'tanu', katumpha: 'katumpha', sahatcha: 'sahatcha', phanthu: 'phanthu',
  putta: 'putta', ari: 'ari', patni: 'patni', marana: 'marana',
  supha: 'supha', kamma: 'kamma', lapha: 'lapha', vinat: 'vinat',
}

function bodyName(key?: ThaiBodyKey | string | null) {
  return key ? t(`thaiAstro.bodies.${BODY_KEYS[key] ?? key}`) : '—'
}
function signName(key?: ThaiSignKey | null) {
  return key ? t(`thaiAstro.signs.${key}`) : '—'
}
function houseName(key: ThaiHouseKey) {
  return t(`thaiAstro.houses.${HOUSE_KEYS[key]}`)
}
function statusName(key: ThaiStatusKey) {
  return t(`thaiAstro.statuses.${key}`)
}
function mansionName(key?: string | null) {
  const names: Record<string, string> = {
    ashwini: 'Ashwini', bharani: 'Bharani', krittika: 'Krittika', rohini: 'Rohini',
    mrigashira: 'Mrigashira', ardra: 'Ardra', punarvasu: 'Punarvasu', pushya: 'Pushya',
    ashlesha: 'Ashlesha', magha: 'Magha', purva_phalguni: 'Purva Phalguni',
    uttara_phalguni: 'Uttara Phalguni', hasta: 'Hasta', chitra: 'Chitra', swati: 'Swati',
    vishakha: 'Vishakha', anuradha: 'Anuradha', jyeshtha: 'Jyeshtha', mula: 'Mula',
    purva_ashadha: 'Purva Ashadha', uttara_ashadha: 'Uttara Ashadha', shravana: 'Shravana',
    dhanishta: 'Dhanishtha', shatabhisha: 'Shatabhisha', purva_bhadrapada: 'Purva Bhadrapada',
    uttara_bhadrapada: 'Uttara Bhadrapada', revati: 'Revati',
  }
  const label = key ? names[key] : null
  return label ? t(`vedic.chart.nakshatraNames.${label}`) : key || '—'
}
function weekdayName(key?: string | null) {
  return key ? t(`thaiAstro.panchangValues.weekdays.${key}`) : '—'
}
function panchangName(category: 'pakshas' | 'tithis' | 'yogas' | 'karanas', key?: string | null) {
  return key ? t(`thaiAstro.panchangValues.${category}.${key}`) : '—'
}

function planet(key: ThaiBodyKey | string) {
  return props.result.planets.find(item => item.key === key)
}
function formatDMS(value: { degree: number, minute: number, second: number }) {
  return `${value.degree}° ${String(value.minute).padStart(2, '0')}′ ${String(value.second).padStart(2, '0')}″`
}
function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value))
}
function signIndexFromLongitude(longitude: number) {
  return Math.floor((((longitude % 360) + 360) % 360) / 30)
}
function indexToSign(index: number): ThaiSignKey {
  return SIGN_KEYS[((index % 12) + 12) % 12] ?? 'aries'
}
function triyangaSign(longitude: number): ThaiSignKey {
  const segment = Math.min(2, Math.floor(longitude % 30 / 10))
  return indexToSign(signIndexFromLongitude(longitude) + segment * 4)
}
function navamsaSign(longitude: number): ThaiSignKey {
  const sign = signIndexFromLongitude(longitude)
  const elementStart = Math.floor(sign / 3) * 3
  const segment = Math.min(8, Math.floor(longitude % 30 / (30 / 9)))
  return indexToSign(elementStart + segment)
}
function triyangaName(value: { longitude: number }) {
  const keys = ['first', 'second', 'third'] as const
  const segment = Math.min(2, Math.floor(value.longitude % 30 / 10))
  return t(`thaiAstro.triyangas.${keys[segment]}`)
}
function navamsaName(longitude: number) {
  const segment = Math.min(8, Math.floor(longitude % 30 / (30 / 9))) + 1
  return t('thaiAstro.navamsaNumber', { number: segment })
}
function taksaRoleName(key: ThaiTaksaRole) {
  const keys: Record<string, string> = {
    attendant: 'attendant', longevity: 'longevity', power: 'power', glory: 'glory',
    root: 'root', effort: 'effort', minister: 'minister', calamity: 'calamity',
  }
  return t(`thaiAstro.taksaRoles.${keys[key]}`)
}

function planetTooltip(key: string) {
  const item = planet(key)
  if (!item) return bodyName(key)
  return `${bodyName(key)} · ${signName(item.signKey)} ${formatDMS(item)} · H${item.house} ${houseName(item.houseKey)}`
}
function planetDetails(key: string) {
  const item = planet(key)
  if (!item) return []
  return [
    `${signName(item.signKey)} · ${formatDMS(item)} · ${item.longitude.toFixed(3)}°`,
    `H${item.house} · ${houseName(item.houseKey)}`,
    `${mansionName(item.nakshatraKey)} p${item.pada} · ${bodyName(item.nakshatraLordKey as ThaiBodyKey)}`,
    `${item.statuses.map(statusName).join(' · ') || '—'}${item.isRetrograde ? ' · R' : ''}${item.isTanuseth ? ` · ${t('thaiAstro.tanusethMark')}` : ''}`,
  ]
}
function houseDetailTitle(number: number) {
  const house = props.result.houses[number - 1]
  return house ? `H${house.number} · ${houseName(house.key)}` : `H${number}`
}
function houseDetails(number: number) {
  const house = props.result.houses[number - 1]
  if (!house) return []
  return [
    `${signName(house.signKey)} · ${bodyName(house.signLordKey)}`,
    `${t('thaiAstro.occupants')}: ${house.occupants.map(bodyName).join(' · ') || '—'}`,
  ]
}
function houseTooltip(number: number) {
  return `${houseDetailTitle(number)} · ${signName(props.result.houses[number - 1]?.signKey)}`
}

function toggleAnimation() {
  isAnimating.value = !isAnimating.value
  if (isAnimating.value) selected.value = null
  mount.value?.setAnimating(isAnimating.value)
}
function showTruePositions() {
  isAnimating.value = false
  mount.value?.showTruePositions()
}
function resetView() {
  mount.value?.resetView()
}

function syncWindowWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  syncWindowWidth()
  window.addEventListener('resize', syncWindowWidth)
  await nextTick()
  if (!stageRoot.value) return
  const { mountThaiAstro3D } = await import('~/utils/thai-astro-3d/renderer')
  mount.value = await mountThaiAstro3D(stageRoot.value, props.result, {
    onHover: (value) => { hovered.value = value },
    onSelect: (value) => {
      selected.value = value
    },
    onError: (message) => {
      console.warn('[thai-astro-3d]', message)
      chartError.value = message
    },
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncWindowWidth)
  mount.value?.dispose()
  mount.value = null
})
</script>

<style scoped>
.ta3d {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: #05070d;
  color: #e7eaf0;
}

.ta3d-topbar,
.ta3d-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ta3d-controls {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.ta3d-identity {
  min-width: 0;
}

.ta3d-identity strong,
.ta3d-detail h3 {
  display: block;
  font-size: 16px;
  font-weight: 700;
}

.ta3d-identity span {
  display: block;
  margin-top: 3px;
  color: #96a2b4;
  font-size: 12px;
}

.ta3d-note {
  margin: 0;
  color: #96a2b4;
  font-size: 12px;
}

.ta3d-error {
  color: #fca5a5;
}

.ta3d-stage-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
}

.ta3d-stage {
  position: relative;
}

.ta3d-canvas {
  position: relative;
  width: 100%;
  height: min(64vh, 520px);
  min-height: 340px;
  border-radius: 8px;
  overflow: hidden;
}

.ta3d-canvas :deep(canvas) {
  display: block;
}

.ta3d-meteors {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.ta3d-meteors span {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 180px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg,
    transparent,
    rgba(207, 227, 255, 0.24),
    rgba(226, 240, 255, 0.92),
    #fff);
  transform: rotate(-24deg) translateX(-210px);
  opacity: 0;
  animation: ta3d-meteor var(--duration) linear infinite;
  animation-delay: var(--delay);
  animation-play-state: paused;
  will-change: transform, opacity;
}

.ta3d-meteors.is-running span {
  animation-play-state: running;
}

@keyframes ta3d-meteor {
  0% {
    transform: rotate(-24deg) translateX(-210px);
    opacity: 0;
  }

  12% {
    opacity: 0.85;
  }

  72% {
    opacity: 0.62;
  }

  100% {
    transform: rotate(-24deg) translateX(390px);
    opacity: 0;
  }
}

.ta3d-tooltip {
  position: fixed;
  z-index: 50;
  max-width: 240px;
  padding: 7px 9px;
  border: 1px solid rgba(214, 180, 104, 0.38);
  border-radius: 6px;
  background: rgba(8, 12, 20, 0.95);
  color: #e7eaf0;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: none;
}

.ta3d-detail {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgba(214, 180, 104, 0.22);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.ta3d-detail h3 {
  margin: 0 0 8px;
}

.ta3d-detail p {
  margin: 3px 0;
  color: #c4ccd8;
  font-size: 12px;
  line-height: 1.5;
}

.ta3d-quick {
  display: grid;
  gap: 9px;
  margin: 14px 0 0;
}

.ta3d-quick dt {
  color: #8c97a8;
  font-size: 11px;
}

.ta3d-quick dd {
  margin: 2px 0 0;
  font-size: 12px;
}

.ta3d-data summary {
  cursor: pointer;
  color: #c4ccd8;
  font-size: 13px;
}

.ta3d-table-wrap {
  display: grid;
  gap: 18px;
  margin-top: 14px;
}

.ta3d-data table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.ta3d-data caption {
  padding: 8px 0;
  color: #d6b468;
  font-weight: 700;
  text-align: left;
}

.ta3d-data th,
.ta3d-data td {
  padding: 7px 9px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  text-align: left;
  vertical-align: top;
}

.ta3d-data thead th {
  color: #96a2b4;
  font-size: 11px;
}

@media (max-width: 860px) {
  .ta3d {
    padding: 14px;
  }

  .ta3d-topbar,
  .ta3d-stage-row {
    display: grid;
  }

  .ta3d-topbar {
    align-items: start;
  }

  .ta3d-controls {
    justify-content: start;
  }

  .ta3d-stage-row {
    grid-template-columns: 1fr;
  }

  .ta3d-canvas {
    height: min(52vh, 380px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ta3d-meteors {
    display: none;
  }

  .ta3d {
    scroll-behavior: auto;
  }
}
</style>
