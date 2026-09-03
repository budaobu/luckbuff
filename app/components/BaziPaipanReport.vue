<template>
  <div class="bpr">
    <section class="bpr-card bpr-hero">
      <dl class="bpr-birth-grid">
        <div>
          <dt>{{ $t('baziChart.solar') }}</dt>
          <dd>{{ result.birth.solarText }}</dd>
          <small>{{ $t('baziChart.calendar') }}</small>
        </div>
        <div>
          <dt>{{ $t('baziChart.location') }}</dt>
          <dd>{{ result.birth.locationName }}</dd>
          <small>{{ result.birth.coordinates || '—' }}</small>
        </div>
        <div>
          <dt>{{ $t('baziChart.trueSolar') }}</dt>
          <dd>{{ result.birth.clockText }}</dd>
          <small>
            <strong class="bpr-true-solar">{{ result.birth.trueSolarText }}</strong>
            · {{ result.birth.effectiveHour }}时
          </small>
        </div>
        <div>
          <dt>{{ $t('profileForm.gender') }}</dt>
          <dd>{{ result.birth.genderText }}</dd>
          <small>{{ result.birth.zodiac }} · {{ result.birth.season }}季</small>
        </div>
      </dl>

      <div class="bpr-pillars-copy">
        <span>{{ fourPillars }}</span>
        <button type="button" @click="copyPillars">
          <UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" />
          {{ $t('baziChart.copy') }}
        </button>
      </div>
    </section>

    <section class="bpr-section">
      <header class="bpr-section-label">
        <h2>{{ $t('baziChart.chartTitle') }}</h2>
        <p>{{ $t('baziChart.chartSubtitle') }}</p>
      </header>

      <div class="bpr-card bpr-chart-card">
        <div class="bpr-chart-table">
          <div class="bpr-chart-row bpr-chart-head">
            <span />
            <div v-for="pillar in result.pillars" :key="`head-${pillar.key}`">
              <strong>{{ pillar.label }}</strong>
              <em v-if="pillar.tag">{{ pillar.tag }}</em>
            </div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.stem') }}</span>
            <div v-for="pillar in result.pillars" :key="`gan-${pillar.key}`" class="bpr-char">{{ pillar.gan }}</div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.stemTenGod') }}</span>
            <div v-for="pillar in result.pillars" :key="`gan-god-${pillar.key}`">{{ pillar.shishenGan }}</div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.branch') }}</span>
            <div v-for="pillar in result.pillars" :key="`zhi-${pillar.key}`" class="bpr-char">{{ pillar.zhi }}</div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.hiddenStems') }}</span>
            <div
              v-for="pillar in result.pillars"
              :key="`hidden-${pillar.key}`"
              class="bpr-muted"
              :title="pillar.hiddenStems.map(item => `${item.gan}·${item.type}`).join(' / ')"
            >
              {{ pillar.hiddenStems.map(item => item.gan).join(' / ') }}
            </div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.hiddenTenGods') }}</span>
            <div v-for="pillar in result.pillars" :key="`hidden-god-${pillar.key}`" class="bpr-muted">
              {{ pillar.hiddenStems.map(item => item.shishen).join(' / ') }}
            </div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.nayin') }}</span>
            <div v-for="pillar in result.pillars" :key="`nayin-${pillar.key}`">{{ pillar.nayin }}</div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.diShi') }}</span>
            <div v-for="pillar in result.pillars" :key="`dishi-${pillar.key}`">
              {{ pillar.diShi }}
              <small>{{ pillar.selfSitting }}</small>
            </div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.xunKong') }}</span>
            <div v-for="pillar in result.pillars" :key="`void-${pillar.key}`" class="bpr-tag-cell">
              <span v-for="item in pillar.xunKong" :key="`${pillar.key}-${item}`">{{ item }}</span>
            </div>
          </div>
          <div class="bpr-chart-row bpr-shensha-row">
            <span>{{ $t('baziChart.shenshaTitle') }}</span>
            <div v-for="pillar in result.pillars" :key="`shensha-${pillar.key}`" class="bpr-pill-tags">
              <span v-for="item in pillar.shensha" :key="`${pillar.key}-${item.name}`" :class="`is-${item.classification}`">
                {{ item.name }}
              </span>
              <small v-if="!pillar.shensha.length">—</small>
            </div>
          </div>
          <div class="bpr-chart-row">
            <span>{{ $t('baziChart.shenshaCombination') }}</span>
            <div v-for="pillar in result.pillars" :key="`combo-${pillar.key}`" class="bpr-pill-tags">
              <span
                v-for="combo in result.shenshaCombinations.filter(item => item.positions.includes(pillar.label))"
                :key="combo.name"
                class="is-combo"
              >{{ combo.name }}</span>
              <small v-if="!result.shenshaCombinations.some(item => item.positions.includes(pillar.label))">无</small>
            </div>
          </div>
        </div>

        <div class="bpr-methodology">
          <strong>{{ $t('baziChart.methodology') }}</strong>
          <dl>
            <div><dt>{{ $t('baziChart.school') }}</dt><dd>{{ result.methodology.school }}</dd></div>
            <div><dt>{{ $t('baziChart.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
            <div><dt>{{ $t('baziChart.trueSolar') }}</dt><dd>{{ result.methodology.trueSolarTime }}</dd></div>
            <div><dt>{{ $t('baziChart.dayBoundary') }}</dt><dd>{{ result.methodology.dayBoundary }}</dd></div>
            <div><dt>{{ $t('baziChart.monthRule') }}</dt><dd>{{ result.methodology.monthRule }}</dd></div>
            <div><dt>{{ $t('baziChart.scorePolicy') }}</dt><dd>{{ result.methodology.scorePolicy }}</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="bpr-section">
      <header class="bpr-section-label">
        <h2>{{ $t('baziChart.wuxingTitle') }}</h2>
        <p>{{ $t('baziChart.energySubtitle') }}</p>
      </header>
      <div class="bpr-body-stack">
        <div class="bpr-card bpr-energy-head">
          <strong>{{ result.energy.strength }} · {{ result.energy.rootStatus }}</strong>
          <p>{{ result.energy.strengthLabel }} · 支持比 {{ result.energy.supportRatio }}% · 月令 {{ result.energy.monthCommand }} · 进度 {{ result.energy.monthProgress }}%</p>
          <p>{{ result.energy.monthCommandDetail }}</p>
          <p>{{ result.energy.adjustment }}</p>
        </div>

        <div class="bpr-energy-triple">
          <div class="bpr-card"><span>天时</span><strong>{{ result.energy.monthCommand }}</strong><small>{{ result.energy.monthCommandDetail }}</small></div>
          <div class="bpr-card"><span>人和</span><strong>{{ result.energy.supportRatio }}%</strong><small>{{ result.energy.strengthLabel }}</small></div>
          <div class="bpr-card"><span>地利</span><strong>{{ result.energy.rootStatus }}</strong><small>根气质量 {{ result.energy.rootQuality }}%</small></div>
        </div>

        <div class="bpr-subsection-title">{{ $t('baziChart.tenGodRatio') }}</div>
        <div class="bpr-card bpr-bars">
          <div v-for="item in result.energy.tenGods" :key="item.name" class="bpr-bar">
            <span>{{ item.name }}</span>
            <i><em :style="{ width: `${item.percent}%` }" /></i>
            <strong>{{ item.percent }}%</strong>
          </div>
        </div>

        <div class="bpr-subsection-title">{{ $t('baziChart.elementDistribution') }}</div>
        <div class="bpr-element-grid">
          <article v-for="item in result.energy.wuxing" :key="item.key" class="bpr-card bpr-element">
            <header>
              <strong>{{ item.label }}</strong>
              <span>{{ item.percent }}%</span>
            </header>
            <p>{{ item.role }} · {{ item.stateLabel }} · {{ item.direction }}</p>
            <div class="bpr-bar"><i><em :style="{ width: `${item.percent}%` }" /></i></div>
            <small>{{ item.evidence }} · {{ item.organs }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="bpr-section">
      <header class="bpr-section-label">
        <h2>{{ $t('baziChart.signalTitle') }}</h2>
        <p>{{ $t('baziChart.signalSubtitle') }}</p>
      </header>
      <div class="bpr-body-stack">
        <div class="bpr-subsection-title">{{ $t('baziChart.relationTitle') }}</div>
        <div v-if="result.relations.length" class="bpr-card bpr-signal-list">
          <article v-for="signal in result.relations" :key="signal.id">
            <div class="bpr-signal-main">
              <strong>{{ signal.value }}{{ signal.type }}</strong>
              <small>{{ signal.positions.join(' · ') }}</small>
            </div>
            <p>{{ signal.impact }}</p>
            <div class="bpr-signal-tags">
              <span class="is-intensity">{{ signal.intensity }}</span>
              <span>{{ signal.status }}</span>
            </div>
          </article>
        </div>
        <p v-else class="bpr-empty">{{ $t('baziChart.noRelation') }}</p>

        <div class="bpr-subsection-title">{{ $t('baziChart.keyShensha') }}</div>
        <div v-if="result.shensha.length" class="bpr-card bpr-shensha-grid">
          <article v-for="item in result.shensha" :key="`${item.name}-${item.positions.join('/')}`">
            <strong>{{ item.name }}</strong>
            <em>{{ item.classification }}</em>
            <small>{{ item.positions.join(' · ') }}</small>
            <p>{{ item.description }}</p>
          </article>
        </div>

        <div v-if="result.shenshaCombinations.length" class="bpr-card bpr-combo-list">
          <article v-for="item in result.shenshaCombinations" :key="`${item.name}-${item.value}`">
            <strong>{{ item.name }}</strong>
            <small>{{ item.value }}</small>
            <p>{{ item.note }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="bpr-section">
      <header class="bpr-section-label">
        <h2>{{ $t('baziChart.dayunTitle') }}</h2>
        <p>{{ $t('baziChart.dayunSubtitle') }}</p>
      </header>
      <div class="bpr-body-stack">
        <div class="bpr-card bpr-dayun-meta">
          <div>
            <span>{{ $t('baziChart.qiyun') }}</span>
            <strong>{{ result.dayunMeta.startText }}</strong>
          </div>
          <div>
            <span>{{ $t('baziChart.qiyunDate') }}</span>
            <strong>{{ result.dayunMeta.startDate }}</strong>
          </div>
          <div>
            <span>{{ $t('baziChart.dayunDirection') }}</span>
            <strong>{{ result.dayunMeta.direction }}</strong>
          </div>
        </div>
        <div class="bpr-card bpr-cycle-list">
          <article v-for="cycle in result.dayuns" :key="cycle.index" :class="{ 'is-current': cycle.isCurrent }">
            <header>
              <strong>{{ cycle.startYear }}-{{ cycle.endYear }} {{ cycle.ganzhi }}</strong>
              <span>{{ cycle.startAge }}-{{ cycle.endAge }}</span>
              <em v-if="cycle.isCurrent">{{ $t('baziChart.current') }}</em>
            </header>
            <p>{{ cycle.shishenGan }} / {{ cycle.shishenZhi }}</p>
            <div v-if="cycle.shensha.length" class="bpr-pill-tags">
              <span v-for="item in cycle.shensha" :key="`${cycle.index}-${item.name}`">{{ item.name }}</span>
            </div>
            <div v-if="cycle.liunian.length" class="bpr-annual-list">
              <div v-for="year in cycle.liunian" :key="`${cycle.index}-${year.year}`" class="bpr-annual">
                <strong>{{ year.year }} {{ year.ganzhi }}</strong>
                <span>{{ year.shishenGan }} / {{ year.shishenZhi }}</span>
                <em>{{ year.intensity }}</em>
                <p>{{ year.summary }}</p>
                <small v-if="year.energyShifts.length">{{ year.energyShifts.join(' · ') }}</small>
                <p v-for="signal in year.signals" :key="`${year.year}-${signal.value}-${signal.type}`">
                  {{ signal.value }}{{ signal.type }} · {{ signal.positions.join(' / ') }} · {{ signal.impact }}
                </p>
                <div class="bpr-pill-tags">
                  <span v-for="item in year.shensha" :key="`${year.year}-${item.name}`">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="bpr-section">
      <header class="bpr-section-label">
        <h2>{{ $t('baziChart.structureTitle') }}</h2>
        <p>{{ $t('baziChart.structureSubtitle') }}</p>
      </header>
      <div class="bpr-body-stack">
        <div class="bpr-structure-grid">
          <div class="bpr-card"><span>{{ $t('baziChart.dayStrength') }}</span><strong>{{ result.structure.dayStrength }}</strong><small>{{ result.structure.supportRatio }}%</small></div>
          <div class="bpr-card"><span>{{ $t('baziChart.rootStatus') }}</span><strong>{{ result.structure.rootStatus }}</strong><small>根气 {{ result.energy.rootQuality }}%</small></div>
          <div class="bpr-card"><span>{{ $t('baziChart.forceDistribution') }}</span><strong>{{ result.structure.forceDistribution }}</strong><small>{{ result.energy.supportUseGod }} 帮身</small></div>
          <div class="bpr-card"><span>{{ $t('baziChart.patternStatus') }}</span><strong>{{ result.structure.pattern }}</strong><small>{{ result.structure.patternEvidence }}</small></div>
        </div>
        <div class="bpr-card bpr-evidence">
          <strong>{{ $t('baziChart.evidence') }}</strong>
          <p v-for="item in result.structure.evidence" :key="item">{{ item }}</p>
        </div>
        <div class="bpr-structure-grid">
          <div class="bpr-card"><span>{{ $t('baziChart.primaryUse') }}</span><strong>{{ result.energy.primaryUseGod }}</strong><small>{{ result.energy.adjustment }}</small></div>
          <div class="bpr-card"><span>{{ $t('baziChart.supportUse') }}</span><strong>{{ result.energy.supportUseGod }}</strong><small>{{ result.energy.rootStatus }}</small></div>
          <div class="bpr-card"><span>{{ $t('baziChart.avoidGod') }}</span><strong>{{ result.energy.avoidGod }}</strong><small>{{ result.energy.monthCommand }}</small></div>
        </div>
        <div class="bpr-card bpr-extras">
          <article v-for="item in [result.extras.taiYuan, result.extras.mingGong, result.extras.shenGong]" :key="item.label">
            <strong>{{ item.label }}</strong>
            <span>{{ item.ganzhi }} · {{ item.nayin }} · {{ item.shishen }}</span>
            <div v-if="item.shensha.length" class="bpr-pill-tags">
              <span v-for="shen in item.shensha" :key="`${item.label}-${shen.name}`">{{ shen.name }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <p class="bpr-disclaimer">{{ $t('baziChart.disclaimer') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'

const props = defineProps<{ result: BaziChartResult }>()
const toast = useToast()
const { t } = useI18n()

const fourPillars = computed(() => props.result.pillars.map(pillar => pillar.ganzhi).join(' '))

async function copyPillars() {
  await navigator.clipboard.writeText(fourPillars.value)
  toast.add({ title: t('share.textCopied'), color: 'success' })
}
</script>

<style scoped>
.bpr {
  display: grid;
  gap: 34px;
}

.bpr-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.bpr-hero {
  display: grid;
  gap: 18px;
}

.bpr-birth-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.bpr-birth-grid > div {
  min-width: 0;
  padding: 0 20px;
}

.bpr-birth-grid > div:first-child {
  padding-left: 0;
}

.bpr-birth-grid dt {
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-birth-grid dd {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 700;
}

.bpr-birth-grid small {
  display: block;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.bpr-true-solar {
  color: var(--accent);
}

.bpr-pillars-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent-bg) 72%, var(--surface-card));
}

.bpr-pillars-copy > span {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
}

.bpr-pillars-copy button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--surface-bg);
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
}

.bpr-section {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.bpr-section-label {
  position: sticky;
  top: 92px;
}

.bpr-section-label h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}

.bpr-section-label p {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.bpr-body-stack {
  display: grid;
  gap: 14px;
}

.bpr-chart-table {
  display: grid;
  min-width: 760px;
}

.bpr-chart-card {
  overflow-x: auto;
}

.bpr-chart-row {
  display: grid;
  grid-template-columns: 112px repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--border-subtle);
}

.bpr-chart-row:first-child {
  border-top: 0;
}

.bpr-chart-row > span {
  padding: 13px 12px 13px 0;
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-chart-row > div {
  min-width: 0;
  padding: 13px 10px;
  border-left: 1px solid var(--border-subtle);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.bpr-chart-head > div {
  background: color-mix(in srgb, var(--surface-input) 58%, transparent);
}

.bpr-chart-head strong {
  display: block;
}

.bpr-chart-head em {
  display: inline-flex;
  margin-top: 6px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-style: normal;
}

.bpr-char {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 22px;
  font-weight: 800;
}

.bpr-muted {
  color: var(--text-muted);
}

.bpr-chart-row small {
  display: block;
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 11px;
}

.bpr-pill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.bpr-pill-tags span {
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.bpr-pill-tags .is-吉 {
  background: color-mix(in srgb, #16a34a 10%, transparent);
  color: #15803d;
}

.bpr-pill-tags .is-凶 {
  background: color-mix(in srgb, #dc2626 9%, transparent);
  color: #b91c1c;
}

.bpr-pill-tags .is-combo {
  background: var(--accent-bg);
  color: var(--accent);
}

.bpr-methodology {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.bpr-methodology strong {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
}

.bpr-methodology dl {
  margin: 14px 0 0;
}

.bpr-methodology > dl > div {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 12px;
  padding: 6px 0;
}

.bpr-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-methodology dd {
  margin: 0;
  color: var(--text-body);
  font-size: 13px;
}

.bpr-subsection-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.bpr-subsection-title::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

.bpr-energy-head p {
  margin: 10px 0 0;
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.75;
}

.bpr-energy-triple {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.bpr-energy-triple span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-energy-triple strong {
  display: block;
  margin-top: 6px;
  font-size: 17px;
}

.bpr-energy-triple small {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.bpr-bars {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 32px;
}

.bpr-bar {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.bpr-bar i {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-input);
}

.bpr-bar em {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.bpr-bar strong {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.bpr-element-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.bpr-element header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 15px;
}

.bpr-element p {
  margin: 8px 0 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-element small {
  display: block;
  margin-top: 10px;
  color: var(--text-faint);
  font-size: 11px;
  line-height: 1.5;
}

.bpr-signal-list {
  display: grid;
  gap: 14px;
}

.bpr-signal-list article + article {
  border-top: 1px solid var(--border-subtle);
  padding-top: 14px;
}

.bpr-signal-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.bpr-signal-main small {
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-signal-list p {
  margin: 7px 0 8px;
  color: var(--text-body);
  font-size: 13px;
}

.bpr-signal-tags {
  display: flex;
  gap: 6px;
}

.bpr-signal-tags span {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 11px;
}

.bpr-signal-tags .is-intensity {
  background: var(--accent-bg);
  color: var(--accent);
}

.bpr-shensha-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.bpr-shensha-grid strong {
  margin-right: 7px;
  font-size: 14px;
}

.bpr-shensha-grid em {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 10px;
  font-style: normal;
}

.bpr-shensha-grid small {
  display: block;
  margin: 5px 0 7px;
  color: var(--accent);
  font-size: 11px;
}

.bpr-shensha-grid p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.bpr-combo-list article + article {
  margin-top: 12px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 12px;
}

.bpr-combo-list strong {
  margin-right: 8px;
  font-size: 14px;
}

.bpr-combo-list small {
  color: var(--text-faint);
  font-size: 11px;
}

.bpr-combo-list p {
  margin: 6px 0 0;
  color: var(--text-body);
  font-size: 13px;
}

.bpr-cycle-list {
  display: grid;
  gap: 14px;
}

.bpr-dayun-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.bpr-dayun-meta span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-dayun-meta strong {
  display: block;
  margin-top: 6px;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.bpr-cycle-list article {
  padding-left: 14px;
  border-left: 2px solid var(--border-light);
}

.bpr-cycle-list .is-current {
  border-left-color: var(--accent);
}

.bpr-cycle-list header {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.bpr-cycle-list header strong {
  font-size: 15px;
}

.bpr-cycle-list header span {
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-cycle-list header em {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-style: normal;
}

.bpr-cycle-list > article > p {
  margin: 6px 0 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-annual-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.bpr-annual {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface-input);
}

.bpr-annual strong {
  font-size: 13px;
}

.bpr-annual span {
  margin-left: 8px;
  color: var(--text-faint);
  font-size: 11px;
}

.bpr-annual em {
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 10px;
  font-style: normal;
}

.bpr-annual p {
  margin: 5px 0 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-structure-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.bpr-structure-grid span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-structure-grid strong {
  display: block;
  margin-top: 7px;
  font-size: 18px;
}

.bpr-structure-grid small {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.bpr-evidence strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.bpr-evidence p {
  margin: 6px 0 0;
  color: var(--text-body);
  font-size: 13px;
  line-height: 1.7;
}

.bpr-extras {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.bpr-extras strong {
  display: block;
  font-size: 14px;
}

.bpr-extras span {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-extras .bpr-pill-tags {
  margin-top: 8px;
}

.bpr-empty {
  margin: 0;
  color: var(--text-faint);
  font-size: 13px;
}

.bpr-disclaimer {
  margin: -8px 0 0;
  color: var(--text-placeholder);
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1000px) {
  .bpr-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .bpr-section-label {
    position: static;
  }

  .bpr-section-label h2 {
    font-size: 26px;
  }
}

@media (max-width: 820px) {
  .bpr-birth-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 0;
  }

  .bpr-birth-grid > div:nth-child(odd) {
    padding-left: 0;
  }

  .bpr-bars,
  .bpr-element-grid,
  .bpr-shensha-grid,
  .bpr-dayun-meta,
  .bpr-energy-triple {
    grid-template-columns: 1fr;
  }

  .bpr-structure-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bpr-extras {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .bpr-pillars-copy {
    align-items: stretch;
    flex-direction: column;
  }

  .bpr-structure-grid {
    grid-template-columns: 1fr;
  }
}
</style>
