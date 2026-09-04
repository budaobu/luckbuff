<template>
  <div
    ref="reportRoot"
    class="bpr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
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
        <div class="bpr-subsection-title">{{ $t('baziChart.themeTitle') }}</div>
        <div class="bpr-card bpr-theme-list">
          <article v-for="theme in result.natalThemes" :key="theme.id">
            <header class="bpr-theme-head">
              <strong>{{ theme.title }}</strong>
              <span class="bpr-theme-score">{{ theme.score }}<small>/100</small></span>
              <em :class="theme.score >= 70 ? 'is-good' : theme.score >= 40 ? 'is-mixed' : 'is-risk'">
                {{ theme.status }}
              </em>
              <small>{{ $t('baziChart.themeEvidence') }}：{{ theme.evidenceLevel }}</small>
            </header>
            <div v-if="theme.tags.length" class="bpr-pill-tags">
              <span v-for="tag in theme.tags" :key="`${theme.id}-${tag}`">{{ tag }}</span>
            </div>
            <small v-else class="bpr-theme-empty">—</small>
          </article>
        </div>
        <p class="bpr-theme-note">{{ $t('baziChart.themeNote') }}</p>

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

    <Teleport to="body">
      <Transition name="bpr-insight">
        <div
          v-if="insightOpen"
          class="bpr-insight-layer"
          role="presentation"
          @click.self="closeInsight"
        >
          <section
            class="bpr-insight"
            role="dialog"
            aria-modal="true"
            :aria-label="insightTitle || $t('baziChart.aiPanelTitle')"
          >
            <header class="bpr-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('baziChart.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('baziChart.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('baziChart.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="bpr-insight-body">
              <div v-if="insightStatus === 'connecting'" class="bpr-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('baziChart.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="bpr-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="bpr-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="bpr-insight-foot">
              <small>{{ $t('baziChart.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="bpr-insight-auth">
              <p>{{ $t('baziChart.aiLoginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">
                  <UIcon name="i-simple-icons-google" class="h-4 w-4" />
                  Google
                </button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">
                  <UIcon name="i-simple-icons-telegram" class="h-4 w-4" />
                  Telegram
                </button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'

const props = defineProps<{ result: BaziChartResult }>()
const toast = useToast()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()

const fourPillars = computed(() => props.result.pillars.map(pillar => pillar.ganzhi).join(' '))
const reportRoot = ref<HTMLElement | null>(null)

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('baziChart.aiFullReport')
  : t('baziChart.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.bpr-chart-row:not(.bpr-chart-head) > div',
  '.bpr-char',
  '.bpr-methodology',
  '.bpr-methodology dl > div',
  '.bpr-birth-grid > div',
  '.bpr-energy-head',
  '.bpr-card',
  'article',
  '.bpr-bar',
  '.bpr-dayun-meta > div',
  '.bpr-annual-list > div',
  '.bpr-structure-grid > div',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const row = node.closest<HTMLElement>('.bpr-chart-row')
  if (node.classList.contains('bpr-char') || row) {
    const rowLabel = normalizeText(row?.querySelector<HTMLElement>(':scope > span')?.textContent ?? '')
    const value = normalizeText(node.textContent ?? '')
    return [rowLabel, value].filter(Boolean).join(' · ')
  }

  const explicit = node.querySelector<HTMLElement>('h3, strong, dt, span')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.bpr-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(explicit?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.bpr-section-label h2')?.textContent ?? '')
  const stack = node.closest<HTMLElement>('.bpr-body-stack')
  const subsection = stack?.querySelector<HTMLElement>('.bpr-subsection-title')
  const subsectionTitle = normalizeText(subsection?.textContent ?? '')
  const content = normalizeText(node.innerText || node.textContent || '')
  return {
    section: sectionTitle,
    group: subsectionTitle,
    content: content.slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.bprAiTarget) continue

    node.dataset.bprAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.bprAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('baziChart.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.bprAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-bpr-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.bprAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-bpr-ai-target]')
  if (target) activateTarget(target)
}

function compactBaziContext() {
  const r = props.result
  return [
    `四柱：${r.pillars.map(p => p.ganzhi).join(' ')}`,
    `出生：${r.birth.solarText} ${r.birth.genderText}；地点：${r.birth.locationName}；校正时辰：${r.birth.effectiveHour}`,
    `节气/司令：${r.birth.solarTerm.previous.name} → ${r.birth.solarTerm.next.name}，进度 ${r.birth.solarTerm.progress}%，司令 ${r.birth.solarTerm.siLing.ganzhi}`,
    `日主：${r.energy.strength}（支持比 ${r.energy.supportRatio}%，${r.energy.rootStatus}）`,
    `格局：${r.pattern.name} / ${r.pattern.status}；取格：${r.pattern.monthMainQi}`,
    `用神：${r.energy.primaryUseGod}；辅助：${r.energy.supportUseGod}；忌神：${r.energy.avoidGod}`,
    `十神：${r.energy.tenGods.map(item => `${item.name} ${item.percent}%`).join('、')}`,
    `五行：${r.energy.wuxing.map(item => `${item.label} ${item.percent}%（${item.stateLabel}）`).join('、')}`,
    `主题信号：${r.natalThemes.map(item => `${item.title} ${item.score}/100 ${item.status} [${item.tags.join('+') || '无'}]`).join('；')}`,
    `原局关系：${r.relations.map(item => `${item.value}${item.type}@${item.positions.join('/')}（${item.intensity}）`).join('；') || '未检出'}`,
    `神煞：${r.shensha.map(item => `${item.name}@${item.positions.join('/')}（${item.classification}）`).join('；') || '未检出'}`,
    '大运流年：',
    ...r.dayuns.map(dayun => [
      `  ${dayun.index}. ${dayun.startYear}-${dayun.endYear} ${dayun.ganzhi}（${dayun.startAge}-${dayun.endAge}岁）${dayun.isCurrent ? '[当前]' : ''}`,
      ...dayun.liunian.map(year => `    ${year.year} ${year.ganzhi}：${year.shishenGan}/${year.shishenZhi}，${year.intensity}；${year.summary}`),
    ].flat()),
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({
    mode: 'target',
    target,
    title: target.label,
  })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('baziChart.aiFullReportTitle')
  await streamInsight({ mode: 'full', title: insightTitle.value })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void startFullReport()
    return
  }
  authRequired.value = true
}

async function streamInsight(payload: { mode: 'target' | 'full', target?: Record<string, string>, title?: string }) {
  insightAbort?.abort()
  insightAbort = new AbortController()
  insightOpen.value = true
  insightMode.value = payload.mode
  insightTitle.value = payload.title || ''
  insightContent.value = ''
  insightError.value = ''
  authRequired.value = false
  insightStatus.value = 'connecting'
  try {
    const response = await fetch('/api/tools/bazi-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({
        ...payload,
        chart: props.result,
        chartContext: compactBaziContext(),
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const data = await response.json()
        message = data.message || data.statusMessage || message
      } catch { /* keep HTTP code */ }
      throw new Error(message)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const payloadText = line.slice(5).trim()
        if (!payloadText || payloadText === '[DONE]') continue

        try {
          const chunk = JSON.parse(payloadText)
          if (chunk.type === 'text' && chunk.text) {
            insightStatus.value = 'streaming'
            insightContent.value += chunk.text
          }
          else if (chunk.type === 'error') {
            throw new Error(chunk.message || t('baziChart.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('baziChart.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('baziChart.aiError')
  }
  finally {
    insightAbort = null
  }
}

function closeInsight() {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = false
  insightStatus.value = 'connecting'
  insightContent.value = ''
}

watch(() => props.result, async () => {
  await nextTick()
  initializeTargets()
}, { immediate: true })

onMounted(() => {
  nextTick(initializeTargets)
})

onBeforeUnmount(() => {
  insightAbort?.abort()
})

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

[data-bpr-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-bpr-ai-target]::after {
  content: '✦';
  position: absolute;
  z-index: 5;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg));
  color: var(--accent);
  font-size: 10px;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  transform: translateY(2px);
  transition: opacity 140ms ease, transform 140ms ease;
}

[data-bpr-ai-target]:hover,
[data-bpr-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-bpr-ai-target]:hover::after,
[data-bpr-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-bpr-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
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
  align-items: flex-start;
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

.bpr-theme-list {
  display: grid;
  gap: 14px;
}

.bpr-theme-list article + article {
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
}

.bpr-theme-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.bpr-theme-head strong {
  font-size: 14px;
}

.bpr-theme-score {
  color: var(--accent);
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.bpr-theme-score small {
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 500;
}

.bpr-theme-head em {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-style: normal;
}

.bpr-theme-head em.is-good {
  background: color-mix(in srgb, #16a34a 10%, transparent);
  color: #15803d;
}

.bpr-theme-head em.is-mixed {
  background: var(--accent-bg);
  color: var(--accent);
}

.bpr-theme-head em.is-risk {
  background: color-mix(in srgb, #dc2626 9%, transparent);
  color: #b91c1c;
}

.bpr-theme-head small {
  margin-left: auto;
  color: var(--text-faint);
  font-size: 11px;
}

.bpr-theme-empty {
  color: var(--text-faint);
  font-size: 12px;
}

.bpr-theme-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.bpr-insight-layer {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: end center;
  padding: 24px;
  background: color-mix(in srgb, rgba(15, 18, 24, 0.52), transparent);
  backdrop-filter: blur(8px);
}

.bpr-insight {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(560px, 100%);
  max-height: min(74vh, 680px);
  overflow: hidden;
  border: 1px solid var(--border-medium);
  border-radius: 18px;
  background: var(--surface-dropdown);
  box-shadow: var(--shadow-panel);
}

.bpr-insight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.bpr-insight-head p {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}

.bpr-insight-head h3 {
  margin: 6px 0 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.bpr-insight-head button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-faint);
  cursor: pointer;
}

.bpr-insight-body {
  min-height: 108px;
  overflow: auto;
  padding: 18px 20px;
}

.bpr-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.bpr-insight-status,
.bpr-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.bpr-insight-error {
  color: #b91c1c;
}

.bpr-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
}

.bpr-insight-foot small {
  min-width: 0;
  color: var(--text-placeholder);
  font-size: 10px;
  line-height: 1.4;
}

.bpr-insight-foot button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.bpr-insight-auth {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-card);
}

.bpr-insight-auth p {
  margin: 0 0 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.bpr-insight-auth div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.bpr-insight-auth button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-input);
  color: var(--text-body);
  font-size: 12px;
  cursor: pointer;
}

.bpr-insight-enter-active,
.bpr-insight-leave-active {
  transition: opacity 180ms ease;
}

.bpr-insight-enter-active .bpr-insight,
.bpr-insight-leave-active .bpr-insight {
  transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease;
}

.bpr-insight-enter-from,
.bpr-insight-leave-to {
  opacity: 0;
}

.bpr-insight-enter-from .bpr-insight,
.bpr-insight-leave-to .bpr-insight {
  opacity: 0;
  transform: translateY(18px);
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
