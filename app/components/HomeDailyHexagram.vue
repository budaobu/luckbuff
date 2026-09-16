<template>
  <section class="mx-auto w-full max-w-7xl px-6 py-20" aria-labelledby="daily-hexagram-title">
    <div v-reveal class="home-section-head">
      <h2 id="daily-hexagram-title" class="section-title font-serif">
        {{ $t('home.dailyHexagram.title') }}
      </h2>
      <p class="daily-desc">
        {{ $t('home.dailyHexagram.description') }}
      </p>
    </div>

    <article v-reveal class="daily-panel">
      <div class="daily-figure">
        <div
          class="daily-lines"
          :class="{ 'is-rolling': rolling }"
          role="img"
          :aria-label="hexagram.name"
        >
          <div
            v-for="(line, index) in displayLines"
            :key="`${hexagram.id}-${index}`"
            class="hexagram-line"
            :class="{ 'is-yang': line.isYang, 'is-moving': line.isMoving }"
          >
            <span v-if="line.isYang" class="line-bar" />
            <template v-else>
              <span class="line-bar" />
              <span class="line-bar" />
            </template>
          </div>
        </div>
        <p class="daily-figure-caption">
          {{ $t('home.dailyHexagram.index', { n: hexagram.id }) }}
        </p>
      </div>

      <div class="daily-body">
        <div class="daily-index">
          <span class="index-rule" aria-hidden="true" />
          <span>{{ $t('home.dailyHexagram.index', { n: hexagram.id }) }}</span>
        </div>

        <div class="daily-title">
          <h3>{{ shortName }}</h3>
          <p>{{ hexagram.name }}</p>
        </div>

        <div class="daily-tags">
          <span class="daily-tag">
            {{ upperTrigram.name }}{{ $t('home.dailyHexagram.upperSuffix') }}
            /
            {{ lowerTrigram.name }}{{ $t('home.dailyHexagram.lowerSuffix') }}
          </span>
          <span class="daily-tag">{{ hexagram.meaning }}</span>
          <span class="daily-tag daily-tag-accent">{{ upperTrigram.wuxing }}</span>
        </div>

        <blockquote class="daily-guaci">
          {{ shortName }}：{{ hexagram.guaci }}
        </blockquote>

        <div class="daily-hermit">
          <span>{{ $t('home.dailyHexagram.hermitLabel') }}</span>
          <p>{{ reading }}</p>
        </div>

        <div class="daily-actions">
          <button
            type="button"
            class="daily-cast-button"
            :disabled="rolling"
            :aria-busy="rolling"
            @click="castHexagram"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="h-4 w-4"
              :class="{ 'daily-button-icon-rolling': rolling }"
            />
            {{ rolling ? $t('home.dailyHexagram.casting') : $t('home.dailyHexagram.cast') }}
          </button>
          <p class="daily-notice">
            {{ $t('home.dailyHexagram.notice') }}
          </p>
        </div>
      </div>
    </article>

    <p class="daily-sr-only" aria-live="polite">
      {{ resultStatus }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { GuaInfo } from '~/types/zhouyi'
import {
  createHexagramCast,
  createStaticHexagramCast,
  getDailyHexagram,
  getDailyHexagramReading,
  getDailyTrigram,
  getHexagramById,
  rollHexagramLineValue,
  type HexagramLineValue,
} from '~/data/daily-hexagram'
import { getGuaStrategy } from '~/utils/zhouyi/strategy'

const { t } = useI18n()

const initialCast = createStaticHexagramCast(getHexagramById(54))
const hexagram = ref<GuaInfo>(initialCast.gua)
const lineValues = ref<HexagramLineValue[]>([...initialCast.lineValues])
const movingLines = ref<number[]>([...initialCast.movingLines])
const changedGua = ref<GuaInfo | undefined>(initialCast.changedGua)
const rolling = ref(false)

let castTimer: number | undefined

const shortName = computed(() => getGuaStrategy(hexagram.value.id)?.name || hexagram.value.name)
const reading = computed(() => getDailyHexagramReading(hexagram.value.id))
const upperTrigram = computed(() => getDailyTrigram(hexagram.value.shangGua))
const lowerTrigram = computed(() => getDailyTrigram(hexagram.value.xiaGua))

const displayLines = computed(() => {
  return [...lineValues.value].reverse().map((value, index) => ({
    isYang: value === 7 || value === 9,
    isMoving: value === 6 || value === 9,
  }))
})

const resultStatus = computed(() => {
  if (rolling.value) return t('home.dailyHexagram.casting')
  if (!movingLines.value.length) return `${hexagram.value.name} · ${reading.value}`
  const changedName = changedGua.value ? ` · ${t('home.dailyHexagram.changed', { name: changedGua.value.name })}` : ''
  return `${hexagram.value.name} · ${t('home.dailyHexagram.moving', { n: movingLines.value[0] ?? 0 })}${changedName}`
})

function showHexagram(value: GuaInfo) {
  hexagram.value = value
}

function showCast(cast: ReturnType<typeof createHexagramCast>) {
  hexagram.value = cast.gua
  lineValues.value = [...cast.lineValues]
  movingLines.value = [...cast.movingLines]
  changedGua.value = cast.changedGua
}

function castHexagram() {
  if (rolling.value) return
  rolling.value = true

  castTimer = window.setTimeout(() => {
    showCast(createHexagramCast(Array.from({ length: 6 }, rollHexagramLineValue)))
    rolling.value = false
    castTimer = undefined
  }, 700)
}

onMounted(() => {
  showHexagram(getDailyHexagram())
  showCast(createStaticHexagramCast(hexagram.value))
})

onBeforeUnmount(() => {
  if (castTimer !== undefined) {
    window.clearTimeout(castTimer)
    castTimer = undefined
  }
})
</script>

<style scoped>
.daily-desc {
  max-width: 42em;
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
  text-wrap: pretty;
}

.daily-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 28px;
  margin-top: 48px;
  padding: 28px 24px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  background:
    radial-gradient(circle at 12% 14%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 52%),
    var(--surface-card);
  box-shadow: 0 24px 70px -56px rgba(0, 0, 0, 0.55);
}

.daily-figure {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 22px;
  min-height: 240px;
}

.daily-lines {
  display: grid;
  gap: 12px;
  width: 116px;
}

.hexagram-line {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  height: 10px;
}

.hexagram-line.is-yang {
  grid-template-columns: 1fr;
}

.line-bar {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  background: var(--text-primary);
  transition: opacity 180ms ease;
}

.hexagram-line.is-moving .line-bar {
  background: var(--accent);
}

.hexagram-line.is-moving::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  opacity: 1;
}

.daily-lines {
  position: relative;
}

.daily-lines.is-rolling .hexagram-line {
  animation: daily-line-roll 680ms ease-in-out;
}

.daily-lines.is-rolling .hexagram-line:nth-child(2) {
  animation-delay: 55ms;
}

.daily-lines.is-rolling .hexagram-line:nth-child(3) {
  animation-delay: 110ms;
}

.daily-lines.is-rolling .hexagram-line:nth-child(4) {
  animation-delay: 165ms;
}

.daily-lines.is-rolling .hexagram-line:nth-child(5) {
  animation-delay: 220ms;
}

.daily-lines.is-rolling .hexagram-line:nth-child(6) {
  animation-delay: 275ms;
}

@keyframes daily-line-roll {
  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }

  40% {
    opacity: 0.38;
    transform: scaleY(0.72);
  }

  70% {
    opacity: 0.76;
    transform: scaleY(1.06);
  }
}

.daily-figure-caption {
  color: var(--text-faint);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.daily-body {
  min-width: 0;
}

.daily-index {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.index-rule {
  width: 24px;
  height: 1px;
  background: var(--accent);
}

.daily-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.daily-title h3 {
  color: var(--text-primary);
  font-family: var(--font-serif, serif);
  font-size: clamp(1.75rem, 3.2vw, 2.35rem);
  font-weight: 600;
  line-height: 1.2;
}

.daily-title p {
  color: var(--text-muted);
  font-size: 15px;
}

.daily-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.daily-tag {
  padding: 5px 11px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.daily-tag-accent {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.daily-guaci {
  margin: 20px 0 0;
  padding-left: 14px;
  border-left: 2px solid var(--accent-border-hover);
  color: var(--text-body);
  font-size: 15px;
  line-height: 1.7;
  text-wrap: pretty;
}

.daily-hermit {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  margin-top: 18px;
}

.daily-hermit span {
  padding-top: 3px;
  color: var(--accent-muted);
  font-size: 12px;
  white-space: nowrap;
}

.daily-hermit p {
  color: var(--text-body);
  font-size: 15px;
  line-height: 1.7;
  text-wrap: pretty;
}

.daily-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 26px;
}

.daily-cast-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 27px;
  border: 1px solid var(--text-primary);
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--surface-bg);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  transition:
    transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 160ms ease,
    box-shadow 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .daily-cast-button:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
  }
}

.daily-cast-button:not(:disabled):active {
  transform: scale(0.98);
}

.daily-cast-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.daily-cast-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.daily-button-icon-rolling {
  animation: daily-icon-roll 800ms linear infinite;
}

@keyframes daily-icon-roll {
  to {
    transform: rotate(360deg);
  }
}

.daily-notice {
  max-width: 30em;
  color: var(--text-placeholder);
  font-size: 12px;
  line-height: 1.5;
}

.daily-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 900px) {
  .daily-panel {
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 40px;
    align-items: center;
    padding: 36px;
  }

  .daily-figure {
    min-height: 270px;
  }
}

@media (max-width: 480px) {
  .daily-panel {
    padding: 24px 18px;
  }

  .daily-hermit {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
