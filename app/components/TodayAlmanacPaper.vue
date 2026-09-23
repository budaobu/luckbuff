<template>
  <article class="ta-paper" :class="{ 'is-tearing': isTearing }" :aria-label="day ? day.date : t('todayAlmanac.loading')">
    <div class="ta-paper-inner">
      <header class="ta-masthead">
        <div class="ta-masthead-main">
          <h1 class="ta-title">{{ t('todayAlmanac.title') }}</h1>
          <p class="ta-quote-label">{{ t('todayAlmanac.dailyQuoteLabel') }}</p>
          <p class="ta-quote-text">{{ day?.dailyQuote.text || t('todayAlmanac.loading') }}</p>
          <p v-if="day" class="ta-quote-source">{{ dailyQuoteSource }}</p>
        </div>
        <div class="ta-actions">
          <slot name="actions" />
        </div>
      </header>

      <section class="ta-hero">
        <div class="ta-hero-date">
          <div class="ta-solar">
            <span class="ta-year">{{ day?.date.slice(0, 4) || '—' }}</span>
            <span class="ta-month">{{ monthName }}{{ monthLengthMark }}</span>
          </div>
          <div class="ta-day">
            <span class="ta-day-number">{{ dayNumber }}</span>
          </div>
          <div class="ta-weekday">
            <span>{{ weekdayLabel(day?.weekday ?? 0) }}</span>
            <span>{{ day?.date || '—' }}</span>
          </div>
        </div>
        <div class="ta-hero-side">
          <div class="ta-seal">
            <span>{{ day?.lunar.yearShengXiao || '—' }}</span>
          </div>
          <dl class="ta-pillar-list">
            <div>
              <dt>{{ t('todayAlmanac.yearGanZhi') }}</dt>
              <dd>{{ day?.lunar.yearGanZhi || '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('todayAlmanac.monthGanZhi') }}</dt>
              <dd>{{ day?.lunar.monthGanZhi || '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('todayAlmanac.dayGanZhi') }}</dt>
              <dd>{{ day?.lunar.dayGanZhi || '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('todayAlmanac.lunarDate') }}</dt>
              <dd>{{ lunarText }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="ta-advice">
        <div class="ta-advice-column ta-yi" data-ta-ai-target>
          <h2>{{ t('todayAlmanac.yi') }}</h2>
          <p>{{ day?.yi.join('、') || t('common.none') }}</p>
        </div>

        <div class="ta-hours" data-ta-ai-target>
          <h3>{{ t('todayAlmanac.luckyHours') }}</h3>
          <ol class="ta-hour-grid">
            <li
              v-for="hour in day?.hours || []"
              :key="hour.startTime"
              :class="hour.luck === '吉' ? 'is-good' : hour.luck === '凶' ? 'is-bad' : 'is-neutral'"
            >
              <span class="ta-hour-name">{{ hour.zhi }}</span>
              <span class="ta-hour-time">{{ hour.startTime.slice(0, 2) }}</span>
              <span class="ta-hour-meta">{{ hour.tianShen }} {{ hour.luck }}</span>
            </li>
          </ol>
          <p v-if="day" class="ta-clash">
            {{ t('todayAlmanac.chongSha') }} {{ day.chongDesc }} · {{ day.sha }}
          </p>
        </div>

        <div class="ta-advice-column ta-ji" data-ta-ai-target>
          <h2>{{ t('todayAlmanac.ji') }}</h2>
          <p>{{ day?.ji.join('、') || t('common.none') }}</p>
        </div>
      </section>

      <section class="ta-cosmology">
        <dl>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.jianChu') }}</dt>
            <dd>{{ day?.jianChu || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.tianShenType') }}</dt>
            <dd>{{ day ? `${day.tianShen} · ${day.tianShenLuck}` : '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.dayLu') }}</dt>
            <dd>{{ day?.dayLu || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.taiShen') }}</dt>
            <dd>{{ day?.taiShen || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.nobleHours') }}</dt>
            <dd>{{ nobleHoursText }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.luckyZodiacs') }}</dt>
            <dd>{{ luckyZodiacsText }}</dd>
          </div>
        </dl>
      </section>

      <section class="ta-directions">
        <dl>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.xiDirection') }}</dt>
            <dd>{{ day?.positions.xi || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.caiDirection') }}</dt>
            <dd>{{ day?.positions.cai || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.fuDirection') }}</dt>
            <dd>{{ day?.positions.fu || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.yangGui') }}</dt>
            <dd>{{ day?.positions.yangGui || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.yinGui') }}</dt>
            <dd>{{ day?.positions.yinGui || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.taiSui') }}</dt>
            <dd>{{ day?.positions.taiSui || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="ta-details">
        <dl>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.jiShen') }}</dt>
            <dd>{{ day?.jiShen.join('、') || t('common.none') }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.xiongSha') }}</dt>
            <dd>{{ day?.xiongSha.join('、') || t('common.none') }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.pengZu') }}</dt>
            <dd>{{ day ? `${day.pengZuGan}；${day.pengZuZhi}` : '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.xunKong') }}</dt>
            <dd>{{ day?.xunKong || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.nineStar') }}</dt>
            <dd>{{ day?.nineStar || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.jieQi') }}</dt>
            <dd>{{ jieQiText }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.hou') }}</dt>
            <dd>{{ day ? `${day.season.hou} · ${day.season.wuHou}` : '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.yueXiang') }}</dt>
            <dd>{{ day?.season.yueXiang || '—' }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.festivals') }}</dt>
            <dd>{{ day?.festivals.join('、') || t('common.none') }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.naYin') }}</dt>
            <dd>{{ naYinText }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.dayWuxing') }}</dt>
            <dd>{{ day?.colors.dayWuxing || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="ta-colors">
        <dl>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.luckyColor') }}</dt>
            <dd>{{ day?.colors.daJi.colors.join('、') || t('common.none') }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.secondaryColor') }}</dt>
            <dd>{{ day?.colors.ciJi.colors.join('、') || t('common.none') }}</dd>
          </div>
          <div data-ta-ai-target>
            <dt>{{ t('todayAlmanac.avoidColor') }}</dt>
            <dd>{{ day?.colors.buYi.colors.join('、') || t('common.none') }}</dd>
          </div>
        </dl>
      </section>

      <footer class="ta-footer">
        <p>{{ t('todayAlmanac.disclaimer') }}</p>
        <div class="ta-footer-meta">
          <span v-if="day">{{ t('todayAlmanac.timezone') }} · {{ day.timezone }}</span>
          <span>{{ t('todayAlmanac.luckyNumbers') }}: {{ day?.luckyNumbers.join(' · ') || t('common.none') }}</span>
        </div>
        <div class="ta-nav">
          <button
            type="button"
            class="ta-nav-button"
            :disabled="disabled || !day"
            @click="emit('today')"
          >
            {{ t('todayAlmanac.backToday') }}
          </button>
          <button
            type="button"
            class="ta-nav-button is-primary"
            :disabled="disabled || !day"
            @click="requestAdvance"
          >
            {{ t('todayAlmanac.tearAction') }}
          </button>
        </div>
      </footer>
    </div>
    <div aria-hidden="true" class="ta-tear-layer">
      <i class="ta-tear-line" />
      <i class="ta-tear-flap" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { TodayAlmanac } from '~/types/today-almanac'

const props = defineProps<{
  day: TodayAlmanac | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  advance: []
  today: []
}>()

const { t, locale } = useI18n()
const isTearing = ref(false)
let tearTimer: ReturnType<typeof setTimeout> | null = null

const dayNumber = computed(() => {
  if (!props.day?.date) return '—'
  const value = props.day.date.split('-')[2]
  return value ? String(Number(value)) : '—'
})

const monthName = computed(() => {
  if (!props.day?.date) return '—'
  const value = Number(props.day.date.split('-')[1])
  const months = locale.value === 'en'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return months[value - 1] || '—'
})

const monthLengthMark = computed(() => {
  if (!props.day?.date) return ''
  const [year, month] = props.day.date.split('-').map(Number)
  if (!year || !month) return ''
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return locale.value === 'en' ? ` · ${days} days` : days === 31 ? '大' : '小'
})

function requestAdvance() {
  if (props.disabled || isTearing.value) return
  isTearing.value = true
  emit('advance')
  if (tearTimer) clearTimeout(tearTimer)
  tearTimer = setTimeout(() => {
    isTearing.value = false
    tearTimer = null
  }, 320)
}

onBeforeUnmount(() => {
  if (tearTimer) clearTimeout(tearTimer)
})

const lunarText = computed(() => {
  const day = props.day
  if (!day) return '—'
  return `${day.lunar.yearInChinese}年 ${day.lunar.monthInChinese}月${day.lunar.dayInChinese}`
})

const dailyQuoteSource = computed(() => {
  const day = props.day
  if (!day) return ''

  const sourceKey = day.dailyQuote.sourceType === 'traditional'
    ? 'todayAlmanac.quoteTraditional'
    : day.dailyQuote.sourceType === 'derived'
      ? 'todayAlmanac.quoteDerived'
      : 'todayAlmanac.quoteFallback'

  return `${day.dailyQuote.sourceSystem.join(' × ')} · ${t(sourceKey)}`
})

const nobleHoursText = computed(() => {
  const hours = props.day?.nobleHours || []
  return hours.map(hour => `${hour.label} ${hour.startTime}–${hour.endTime} ${hour.ganZhi}`).join('；') || t('common.none')
})

const luckyZodiacsText = computed(() => {
  const items = props.day?.luckyZodiacs || []
  return items.map(item => `${item.zodiac}（${item.relation}）`).join('、') || t('common.none')
})

const jieQiText = computed(() => {
  const day = props.day
  if (!day) return '—'
  return day.season.jieQi || `${day.season.nextJieQi.name} ${day.season.nextJieQi.date}`
})

const naYinText = computed(() => {
  const day = props.day
  if (!day) return '—'
  return `${day.lunar.yearNaYin} · ${day.lunar.monthNaYin} · ${day.lunar.dayNaYin}`
})

function weekdayLabel(weekday: number) {
  const labels = locale.value === 'en'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return labels[weekday] || ''
}
</script>

<style scoped>
.ta-paper {
  --ta-paper: #f7f0e4;
  --ta-ink: #a5161b;
  --ta-muted: rgba(165, 22, 27, .72);
  --ta-line: rgba(165, 22, 27, .24);
  --ta-line-strong: rgba(165, 22, 27, .46);
  --ta-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ta-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  position: relative;
  overflow: hidden;
  width: min(720px, 100%);
  margin: 0 auto;
  color: var(--ta-ink);
  background-color: var(--ta-paper);
  background-image:
    radial-gradient(circle at 1px 1px, rgba(80, 30, 20, .035) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, .18), transparent 42%);
  background-size: 4px 4px, 100% 100%;
  border: 1px solid rgba(120, 25, 20, .24);
  border-radius: 2px;
  box-shadow: 0 16px 34px rgba(64, 12, 12, .10);
  font-family: "Noto Serif SC", "Songti SC", "SimSun", serif;
  font-variant-numeric: tabular-nums;
}

.ta-paper-inner {
  padding: 24px;
}

.ta-masthead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ta-line);
}

.ta-title {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: .08em;
}

.ta-subtitle {
  margin: 6px 0 0;
  max-width: 34em;
  color: var(--ta-muted);
  font-size: 12px;
  line-height: 1.65;
}

.ta-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
}

.ta-quote-label {
  margin: 6px 0 0;
  color: var(--ta-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
}

.ta-quote-text {
  margin: 3px 0 0;
  max-width: 34em;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.6;
}

.ta-quote-source {
  margin: 4px 0 0;
  color: var(--ta-muted);
  font-size: 10px;
  line-height: 1.5;
}

.ta-hero {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 24px;
  align-items: start;
  padding: 18px 0 20px;
  border-bottom: 1px solid var(--ta-line);
}

.ta-solar {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--ta-muted);
  font-size: 13px;
}

.ta-year {
  font-size: 18px;
  font-weight: 700;
}

.ta-month {
  letter-spacing: .06em;
}

.ta-day {
  margin: 4px 0 2px;
}

.ta-day-number {
  display: block;
  font-size: clamp(4.6rem, 15vw, 7.4rem);
  font-weight: 800;
  line-height: .9;
  letter-spacing: -.02em;
}

.ta-weekday {
  display: grid;
  gap: 2px;
  color: var(--ta-muted);
  font-size: 13px;
}

.ta-weekday span:last-child {
  font-size: 11px;
}

.ta-hero-side {
  display: grid;
  gap: 12px;
}

.ta-seal {
  display: grid;
  gap: 2px;
  align-self: start;
  justify-items: center;
  width: max-content;
  min-width: 58px;
  padding: 8px 10px;
  background: var(--ta-ink);
  border-radius: 2px;
  color: var(--ta-paper);
  text-align: center;
}

.ta-seal span {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.ta-pillar-list {
  margin: 0;
  border-top: 1px solid var(--ta-line);
}

.ta-pillar-list div {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 8px;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--ta-line);
}

.ta-pillar-list dt,
.ta-cosmology dt,
.ta-directions dt,
.ta-details dt,
.ta-colors dt {
  color: var(--ta-muted);
  font-size: 11px;
  letter-spacing: .04em;
}

.ta-pillar-list dd,
.ta-cosmology dd,
.ta-directions dd,
.ta-details dd,
.ta-colors dd {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.ta-advice {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 120px;
  padding: 16px 0;
  border-bottom: 1px solid var(--ta-line);
}

.ta-advice-column {
  padding: 0 10px;
  text-align: center;
}

.ta-advice-column h2 {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.ta-advice-column p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

.ta-hours {
  padding: 0 16px;
  border-left: 1px solid var(--ta-line);
  border-right: 1px solid var(--ta-line);
}

.ta-hours h3 {
  margin: 0 0 10px;
  color: var(--ta-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-align: center;
}

.ta-hour-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ta-hour-grid li {
  display: grid;
  justify-items: center;
  gap: 1px;
  min-height: 46px;
  padding: 6px 4px;
  border: 1px solid var(--ta-line);
  font-size: 11px;
  line-height: 1.2;
}

.ta-hour-grid .is-good {
  background: var(--ta-ink);
  border-color: var(--ta-ink);
  color: var(--ta-paper);
}

.ta-hour-grid .is-neutral {
  color: var(--ta-muted);
}

.ta-hour-name {
  font-size: 15px;
  font-weight: 700;
}

.ta-hour-time {
  font-size: 10px;
}

.ta-hour-meta {
  font-size: 9px;
  opacity: .78;
}

.ta-clash {
  margin: 10px 0 0;
  color: var(--ta-muted);
  font-size: 11px;
  text-align: center;
}

.ta-cosmology,
.ta-directions,
.ta-details,
.ta-colors {
  padding: 14px 0;
  border-bottom: 1px solid var(--ta-line);
}

.ta-cosmology dl,
.ta-directions dl,
.ta-details dl,
.ta-colors dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 22px;
  row-gap: 12px;
  margin: 0;
}

.ta-cosmology div,
.ta-directions div,
.ta-details div,
.ta-colors div {
  display: grid;
  gap: 3px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(165, 22, 27, .12);
}

.ta-footer {
  padding: 14px 0 0;
  color: var(--ta-muted);
  font-size: 10px;
  line-height: 1.6;
}

.ta-footer p {
  margin: 0 0 10px;
}

.ta-footer-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--ta-line);
}

.ta-nav {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.ta-nav-button {
  padding: 5px 9px;
  border: 1px solid var(--ta-line-strong);
  border-radius: 1px;
  background: transparent;
  color: var(--ta-ink);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: transform 140ms var(--ta-ease-out);
}

.ta-nav-button:active:not(:disabled) {
  transform: scale(.97);
}

.ta-nav-button.is-primary {
  background: var(--ta-ink);
  border-color: var(--ta-ink);
  color: var(--ta-paper);
}

.ta-nav-button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.ta-nav-button:focus-visible {
  outline: 2px solid var(--ta-ink);
  outline-offset: 2px;
}

.ta-tear-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
}

.ta-tear-line {
  position: absolute;
  top: 91%;
  right: 5%;
  left: 5%;
  height: 2px;
  background: repeating-linear-gradient(90deg, transparent 0 4px, rgba(165, 22, 27, .52) 4px 8px);
  opacity: 0;
  transform: scaleX(.42);
}

.ta-tear-flap {
  position: absolute;
  right: -3%;
  bottom: -2%;
  left: -3%;
  height: 12%;
  background:
    linear-gradient(180deg, rgba(165, 22, 27, .18), rgba(255, 251, 242, .98) 24%, var(--ta-paper)),
    var(--ta-paper);
  box-shadow: 0 -10px 24px rgba(64, 12, 12, .18);
  filter: drop-shadow(0 8px 12px rgba(64, 12, 12, .16));
  clip-path: polygon(0 16%, 4% 4%, 9% 14%, 14% 2%, 19% 12%, 25% 4%, 31% 15%, 37% 5%, 43% 13%, 49% 3%, 55% 12%, 61% 4%, 67% 14%, 73% 5%, 79% 13%, 85% 4%, 91% 12%, 96% 5%, 100% 15%, 100% 100%, 0 100%);
  opacity: 0;
  transform-origin: 50% 0;
  transform: translate3d(0, -8%, 0) rotate(0deg);
}

.is-tearing .ta-tear-layer {
  animation: ta-tear-layer-opacity 260ms var(--ta-ease-out) both;
}

.is-tearing .ta-tear-line {
  animation: ta-tear-line 180ms var(--ta-ease-in-out) both;
}

.is-tearing .ta-tear-flap {
  animation: ta-tear-flap 260ms var(--ta-ease-out) both;
}

@keyframes ta-tear-layer-opacity {
  0% { opacity: .18; }
  28% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes ta-tear-line {
  0% {
    opacity: 0;
    transform: scaleX(.42);
  }
  32% {
    opacity: .9;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(1.04);
  }
}

@keyframes ta-tear-flap {
  0% {
    opacity: 0;
    transform: translate3d(0, -8%, 0) rotate(0deg);
  }
  22% {
    opacity: .94;
    transform: translate3d(0, 2%, 0) rotate(.24deg);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, 60%, 0) rotate(-.5deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ta-nav-button {
    transition: opacity 120ms ease;
  }

  .ta-nav-button:active:not(:disabled) {
    transform: none;
  }

  .ta-tear-line,
  .ta-tear-flap {
    transform: none;
  }

  .is-tearing .ta-tear-line,
  .is-tearing .ta-tear-flap {
    animation: ta-tear-fade 140ms ease both;
  }
}

@keyframes ta-tear-fade {
  0% { opacity: .4; }
  100% { opacity: 0; }
}

@media (max-width: 760px) {
  .ta-paper-inner {
    padding: 18px;
  }

  .ta-masthead {
    gap: 10px;
  }

  .ta-hero {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .ta-advice {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .ta-hours {
    padding: 0;
    border-left: 0;
    border-right: 0;
  }

  .ta-hour-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ta-cosmology dl,
  .ta-directions dl,
  .ta-colors dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 12px;
  }

  .ta-details dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 12px;
  }

  .ta-footer-meta {
    flex-direction: column;
  }

  .ta-nav {
    justify-content: stretch;
  }

  .ta-nav-button {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .ta-paper-inner {
    padding: 14px;
  }

  .ta-hour-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ta-cosmology dl,
  .ta-directions dl,
  .ta-details dl,
  .ta-colors dl {
    grid-template-columns: 1fr;
  }
}
</style>
