<template>
  <div>
    <div v-if="phase === 'form'" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
      <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
        {{ t('numericEnergy.disclaimer') }}
      </p>
    </div>

    <div v-if="phase === 'form'" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
      <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
      <form class="p-6 space-y-5" @submit.prevent="handleSubmit">
        <UInput
          :model-value="input"
          @update:model-value="handleInput"
          class="w-full"
          :placeholder="t(scenarioConfig.placeholderKey)"
          :maxlength="maxLength"
          size="lg"
          :ui="{
            base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
          }"
        />

        <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">
          {{ t(scenarioConfig.helpKey) }}
        </p>

        <button
          type="button"
          @click="handleSubmit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-base font-medium text-white transition-all duration-300 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-border-hover)]"
        >
          <UIcon name="i-heroicons-sparkles" class="h-5 w-5 shrink-0" />
          {{ t(scenarioConfig.ctaKey) }}
        </button>
      </form>
    </div>

    <div v-if="phase === 'result' && analysis">
      <div class="ne-stage">
        <div ref="posterRef" class="ne-poster" :class="`ne-poster--${props.scenario}`">
        <div class="ne-scene" aria-hidden="true">
          <span class="ne-scene-glow" />
          <svg v-if="props.scenario === 'phone'" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round">
            <circle cx="42" cy="66" r="7" stroke-width="4" />
            <path d="M64 41c11 10 11 40 0 50M79 27c19 18 19 58 0 76" stroke-width="5" />
            <path d="M28 52v30M42 41v48M56 30v70" stroke-opacity=".45" stroke-width="3" />
          </svg>
          <svg v-else-if="props.scenario === 'plate'" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round">
            <rect x="15" y="44" width="90" height="38" rx="9" stroke-width="5" />
            <path d="M35 63h54M46 51h32" stroke-dasharray="9 12" stroke-width="5" />
            <path d="M25 82l-8 16M96 82l8 16" stroke-width="4" />
          </svg>
          <svg v-else-if="props.scenario === 'door'" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round">
            <path d="M29 101V59a31 31 0 1 1 62 0v42H29Z" stroke-width="5" />
            <path d="M47 74h26M60 74v27" stroke-width="4" />
          </svg>
          <svg v-else viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round">
            <rect x="17" y="34" width="86" height="57" rx="10" stroke-width="5" />
            <rect x="33" y="56" width="20" height="13" rx="3" stroke-width="4" />
            <path d="M72 57h21M72 68h14" stroke-width="5" />
          </svg>
        </div>

        <div class="ne-main relative">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="ne-kicker font-semibold uppercase tracking-[.2em] text-[var(--ne-accent)]">
                {{ t('numericEnergy.poster.kicker') }} · {{ t(`numericEnergy.poster.scene.${props.scenario}`) }}
              </p>
              <h3 class="ne-title mt-1 font-serif font-bold leading-snug break-words [writing-mode:horizontal-tb] [unicode-bidi:plaintext]">
                {{ posterTitle || t(`${scenarioBase}.longTitle`) }}
              </h3>
            </div>
          </div>

          <div class="mt-3 rounded-2xl border border-[color:var(--ne-border)] bg-white/62 p-3 shadow-[0_12px_26px_-22px_rgba(31,49,77,.42)] backdrop-blur-none">
            <div class="flex items-center gap-3">
              <div class="ne-ring relative shrink-0">
                <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(148,163,184,.28)" stroke-width="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ne-accent)" stroke-width="10" stroke-linecap="round" :stroke-dasharray="scoreCircumference" :stroke-dashoffset="scoreDashOffset" />
                </svg>
                <div class="absolute inset-0 grid place-items-center">
                  <span class="ne-score font-serif font-bold text-[var(--ne-ink)]">{{ analysis.score }}</span>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex min-h-6 items-center justify-between gap-2">
                  <span class="ne-display min-w-0 truncate font-mono font-semibold tracking-[.08em] text-[var(--ne-ink)]">{{ analysis.display }}</span>
                  <span class="element-pill shrink-0" :class="dominantElementClass">{{ dominantElementLabel }}</span>
                </div>
                <p class="ne-band mt-1 line-clamp-2 leading-snug text-[var(--ne-muted)]">
                  {{ interpretation.score || scoreBandLabel }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="star in analysis.stars"
                :key="star.digit"
                class="ne-count rounded-md border border-[color:var(--ne-border)] bg-white/55 px-1.5 py-0.5 font-mono text-[var(--ne-muted)]"
              >{{ star.digit }} × {{ star.count }}</span>
            </div>
          </div>
        </div>

        <section class="ne-section mt-3 flex-1">
          <div class="flex items-center justify-between">
            <h4 class="ne-heading font-semibold uppercase tracking-[.14em] text-[var(--ne-accent)]">{{ t('numericEnergy.poster.aiReading') }}</h4>
            <span v-if="streaming" class="ne-status rounded-full border border-current/20 px-1.5 py-0.5 opacity-75">{{ t('numericEnergy.status.streaming') }}</span>
          </div>

          <p class="ne-summary mt-1 whitespace-pre-line leading-snug text-[var(--ne-ink)]">{{ interpretation.summary || aiError || '—' }}</p>

          <div v-if="interpretation.stars.length" class="mt-2 space-y-1">
            <p v-for="(star, index) in interpretation.stars" :key="`${index}-${star.digit}`" class="ne-body line-clamp-2 leading-snug text-[var(--ne-body)]">
              <strong class="font-medium text-[var(--ne-ink)]">{{ star.name ? `${star.digit} · ${star.name}` : star.digit }}</strong>
              <span> — {{ star.meaning }}</span>
            </p>
          </div>

          <div v-if="interpretation.combos.length" class="mt-2 rounded-xl bg-black/[.04] p-2">
            <p class="ne-heading font-semibold uppercase tracking-[.12em] text-[var(--ne-accent)]">{{ t('numericEnergy.poster.combos') }}</p>
            <p v-for="(combo, index) in interpretation.combos" :key="`${index}-${combo.label}`" class="ne-body mt-1 line-clamp-2 leading-snug text-[var(--ne-body)]">
              <strong class="font-medium text-[var(--ne-ink)]">{{ combo.label }}</strong>
              <span> · {{ combo.meaning }}</span>
            </p>
          </div>

          <div v-if="interpretation.tips.length" class="mt-2 rounded-xl border border-[color:var(--ne-border)] bg-white/55 p-2">
            <p class="ne-heading font-semibold uppercase tracking-[.12em] text-[var(--ne-accent)]">{{ t('numericEnergy.poster.tips') }}</p>
            <ul class="ne-body mt-1 list-disc pl-3.5 leading-snug text-[var(--ne-body)]">
              <li v-for="tip in interpretation.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </section>

        <div class="ne-footer mt-4 flex items-end gap-2 border-t border-[color:var(--ne-border)] pt-3">
          <div class="min-w-0 flex-1">
            <p class="ne-site font-semibold text-[var(--ne-ink)]">{{ siteDomain }}</p>
            <p class="ne-disclaimer mt-1 line-clamp-2 leading-snug text-[var(--ne-muted)]">
              {{ t('numericEnergy.disclaimer') }}
            </p>
          </div>
          <!-- Single QR action points back to the exact scenario tool page. -->
          <div class="ne-poster-qr shrink-0 rounded-xl bg-white p-1 shadow-sm">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="ne-poster-qr-img" v-html="qrSvg" />
          </div>
        </div>
      </div>
      </div>

      <div class="mt-6 flex justify-center gap-3">
        <AppShareButton
          tool="numeric-energy"
          :name="shortTitle"
          :summary="summaryText"
          :share-target="posterRef ?? undefined"
          :filename="`numeric-energy-${analysis.scenario}-${analysis.display}.png`"
          :disabled="streaming"
        />
        <UButton variant="soft" @click="reset">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ t('numericEnergy.action.again') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NumericEnergyResult, NumericEnergyScenario } from '~~/server/utils/tools/numeric-energy'

const props = defineProps<{ scenario: NumericEnergyScenario }>()
const { t, locale } = useI18n()
const toast = useToast()

const siteDomain = 'www.ososn.com'

const phase = ref<'form' | 'result'>('form')
const input = ref('')
const submitting = ref(false)
const analysis = ref<NumericEnergyResult | null>(null)
const posterRef = ref<HTMLDivElement | null>(null)
const qrSvg = ref('')
const aiContent = ref('')
const streaming = ref(false)
const aiError = ref<string | null>(null)

const scenarioBase = computed(() => `numericEnergy.scenarios.${props.scenario}`)
const scenarioConfig = computed(() => ({
  placeholderKey: `${scenarioBase.value}.placeholder`,
  helpKey: `${scenarioBase.value}.help`,
  ctaKey: `${scenarioBase.value}.cta`,
}))
function handleInput(value: string) {
  input.value = String(value ?? '')
}
const maxLength = computed(() => props.scenario === 'card' ? 8 : undefined)

function sanitizeModelCopy(value: string) {
  return value.replaceAll('幽默隐士', '沉静观察者').replaceAll('隐士', '沉静观察者')
}

const scoreCircumference = Math.round(2 * Math.PI * 52)
const scoreDashOffset = computed(() => {
  const ratio = Math.min(100, Math.max(0, analysis.value?.score ?? 0)) / 100
  return scoreCircumference * (1 - ratio)
})
const scoreBandLabel = computed(() => analysis.value ? t(`numericEnergy.band.${analysis.value.scoreBand}`) : '')
const dominantElementLabel = computed(() => analysis.value ? t(`numericEnergy.element.${analysis.value.dominantElement}`) : '')
const dominantElementClass = computed(() => analysis.value ? `element-${analysis.value.dominantElement}` : '')
const shortTitle = computed(() => interpretation.value.title || t(`${scenarioBase.value}.longTitle`))
const summaryText = computed(() => interpretation.value.summary || `${analysis.value?.display} · ${analysis.value?.score}`)
const aiSummary = computed(() => interpretation.value.summary)
const posterTitle = computed(() => interpretation.value.title)

interface ParsedStar { digit: string; name: string; meaning: string }
interface ParsedCombo { label: string; meaning: string }
const interpretation = computed(() => {
  const lines = aiContent.value.split(/\n+/).map(line => line.trim()).filter(Boolean)
  let title = ''
  let score = ''
  let summary = ''
  const stars: ParsedStar[] = []
  const combos: ParsedCombo[] = []
  const tips: string[] = []

  for (const line of lines) {
    if (line.startsWith('TITLE:')) title = line.replace(/^TITLE:\s*/, '').slice(0, 80)
    else if (line.startsWith('SCORE:')) score += line.replace(/^SCORE:\s*/, '')
    else if (line.startsWith('SUMMARY:')) summary += line.replace(/^SUMMARY:\s*/, '')
    else if (line.startsWith('STAR:')) {
      const [digit = '', name = '', meaning = ''] = line.replace(/^STAR:\s*/, '').split('|').map(part => part.trim())
      if (digit && meaning) stars.push({ digit, name, meaning })
    }
    else if (line.startsWith('COMBO:')) {
      const [label = '', meaning = ''] = line.replace(/^COMBO:\s*/, '').split('|').map(part => part.trim())
      if (label && meaning) combos.push({ label, meaning })
    }
    else if (line.startsWith('TIP:')) tips.push(line.replace(/^TIP:\s*/, '').slice(0, 160))
  }

  return { title, score, summary, stars, combos, tips }
})

async function handleSubmit() {
  if (!input.value.trim()) return
  if (phase.value !== 'form') reset()

  submitting.value = true
  try {
    analysis.value = await $fetch<NumericEnergyResult>('/api/tools/numeric-energy/calc', {
      method: 'POST',
      body: { scenario: props.scenario, input: input.value },
    })
    phase.value = 'result'
    await nextTick()
    setTimeout(() => void startReading(), 240)
  }
  catch (error: any) {
    toast.add({
      title: t('numericEnergy.status.failed'),
      description: error?.data?.statusMessage || error?.message || t('numericEnergy.status.checkInput'),
      color: 'error',
    })
  }
  finally {
    submitting.value = false
  }
}

async function startReading() {
  if (!analysis.value) return
  aiContent.value = ''
  aiError.value = null
  streaming.value = true

  await nextTick()
  try {
    const response = await fetch('/api/tools/numeric-energy/reading', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenario: analysis.value.scenario, input: analysis.value.display, locale: locale.value }),
    })
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
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
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const data = JSON.parse(payload) as { type?: string; text?: string; message?: string }
          if (data.type === 'text' && data.text) aiContent.value += sanitizeModelCopy(data.text)
          else if (data.type === 'error') aiError.value = data.message || t('numericEnergy.status.aiUnavailable')
        }
        catch {}
      }
    }
  }
  catch (error: any) {
    aiError.value = error?.message || t('numericEnergy.status.aiUnavailable')
  }
  finally {
    streaming.value = false
  }
}

function reset() {
  phase.value = 'form'
  input.value = ''
  analysis.value = null
  aiContent.value = ''
  aiError.value = null
  streaming.value = false
}

onMounted(async () => {
  const url = `${window.location.origin}/tools/numeric-energy-${props.scenario}`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#191919', light: '#00000000' },
  })
})

defineExpose({ handleSubmit, startReading })
</script>

<style scoped>
.ne-stage {
  width: min(100%, 31rem);
  margin-inline: auto;
  container-type: inline-size;
}

@media (min-width: 1024px) {
  .ne-stage {
    width: min(62vw, 33rem);
  }
}

.ne-poster {
  --ne-bg-from: #f8fafc;
  --ne-bg-mid: #f1f5f9;
  --ne-bg-to: #ffffff;
  --ne-glow: #cbd5e1;
  --ne-border: #dbe2ea;
  --ne-accent: #2563eb;
  --ne-ink: #16233a;
  --ne-body: #34455c;
  --ne-muted: #64748b;

  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;
  width: 100%;
  margin-inline: auto;
  aspect-ratio: 3 / 5;
  padding: clamp(1.1rem, 4.8cqw, 1.85rem);
  border: 1px solid var(--ne-border);
  border-radius: 28px;
  color: var(--ne-body);
  box-shadow: 0 26px 60px -42px rgb(15 23 42 / .55);
  background-color: var(--ne-bg-to);
  background-image:
    linear-gradient(145deg, rgb(255 255 255 / .86), rgb(255 255 255 / .38), transparent),
    radial-gradient(circle at 78% 11%, var(--ne-glow) 0%, transparent 36%),
    linear-gradient(168deg, var(--ne-bg-from), var(--ne-bg-mid), var(--ne-bg-to));
}

.ne-poster--phone {
  --ne-bg-from: #eefaff;
  --ne-bg-mid: #dceefc;
  --ne-bg-to: #f8fcff;
  --ne-glow: #90ddfa;
  --ne-border: #b8dceb;
  --ne-accent: #0277ad;
  --ne-ink: #10384c;
  --ne-body: #2c586d;
  --ne-muted: #587788;
}

.ne-poster--plate {
  --ne-bg-from: #fff7eb;
  --ne-bg-mid: #fcecd7;
  --ne-bg-to: #fffaf2;
  --ne-glow: #fbc67d;
  --ne-border: #eed7ae;
  --ne-accent: #c05e12;
  --ne-ink: #47290f;
  --ne-body: #654320;
  --ne-muted: #7c6144;
}

.ne-poster--door {
  --ne-bg-from: #eefdf3;
  --ne-bg-mid: #dcf4e6;
  --ne-bg-to: #f7fdf9;
  --ne-glow: #94deba;
  --ne-border: #b8dbc8;
  --ne-accent: #087351;
  --ne-ink: #12392c;
  --ne-body: #30574a;
  --ne-muted: #587468;
}

.ne-poster--card {
  --ne-bg-from: #f6f2ff;
  --ne-bg-mid: #ece4fb;
  --ne-bg-to: #fbf9ff;
  --ne-glow: #cbbdf6;
  --ne-border: #d9cdf2;
  --ne-accent: #6d33cb;
  --ne-ink: #2f1d4d;
  --ne-body: #453567;
  --ne-muted: #656280;
}

.ne-scene {
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 0;
  width: 11rem;
  height: 12rem;
  color: var(--ne-accent);
  opacity: .1;
  overflow: hidden;
  border-bottom-left-radius: 9999px;
}

.ne-scene-glow {
  position: absolute;
  top: -32%;
  right: -18%;
  width: 135%;
  height: 128%;
  border-radius: 9999px;
  background: var(--ne-glow);
  opacity: .34;
}

.ne-scene svg,
.ne-scene-glow {
  height: 100%;
  width: 100%;
}

.ne-main {
  z-index: 1;
}

.ne-footer {
  z-index: 1;
}

.element-pill {
  padding: .125rem .425rem;
  border-radius: 9999px;
  font-weight: 600;
}

.element-water { background-color: #dbeafe; color: #075985; }
.element-wood { background-color: #dcfce7; color: #166534; }
.element-fire { background-color: #fee2e2; color: #991b1b; }
.element-earth { background-color: #fef3c7; color: #92400e; }
.element-metal { background-color: #f1f5f9; color: #334155; }

.ne-poster :deep(svg) {
  display: block;
  height: 100%;
  width: 100%;
}

.ne-kicker { font-size: clamp(12px, 2.6cqw, 16px); }
.ne-title {
  font-size: clamp(22px, 4.9cqw, 29px);
  line-height: 1.24;
}
.ne-ring {
  height: clamp(3.8rem, 13.2cqw, 4.7rem);
  width: clamp(3.8rem, 13.2cqw, 4.7rem);
}
.ne-score { font-size: clamp(18px, 3.5cqw, 21px); }
.ne-display { font-size: clamp(14px, 2.95cqw, 17px); }
.element-pill { font-size: clamp(11px, 2.4cqw, 14px); }
.ne-band { font-size: clamp(13px, 2.85cqw, 17px); }
.ne-count { font-size: clamp(12px, 2.45cqw, 14px); }
.ne-heading { font-size: clamp(11px, 2.35cqw, 14px); }
.ne-status { font-size: clamp(10px, 2.15cqw, 12.5px); }
.ne-summary {
  font-size: clamp(16px, 3.35cqw, 20px);
  line-height: 1.42;
}
.ne-body { font-size: clamp(13.5px, 2.9cqw, 16.5px); }
.ne-site { font-size: clamp(13px, 2.65cqw, 15px); }
.ne-disclaimer { font-size: clamp(10.5px, 2.25cqw, 13px); }

.ne-poster-qr {
  width: clamp(3.8rem, 12.5cqw, 4.8rem);
  aspect-ratio: 1;
}
</style>
