<template>
  <section class="cheer-shell" aria-labelledby="work-cheer-title">
    <div class="cheer-frame">
      <div v-reveal.stagger class="cheer-header-group">
        <div data-reveal-child class="cheer-topbar">
          <div class="cheer-brand">
            <span class="cheer-brand-icon">
              <UIcon name="i-heroicons-bolt" class="h-4 w-4" />
            </span>
            <h1 class="cheer-brand-name">{{ $t('workCheer.title') }}</h1>
          </div>
          <p class="cheer-date">{{ dateLabel }}</p>
        </div>

        <p data-reveal-child class="cheer-headline">{{ $t('workCheer.widget.headline') }}</p>
        <p data-reveal-child class="cheer-subline">{{ greeting }}</p>
      </div>

      <div v-if="!snapshot" class="cheer-body" aria-busy="true">
        <div class="cheer-card skeleton-card">
          <div class="skeleton-row">
            <div class="skeleton-line w-24" />
            <div class="skeleton-pill w-28" />
          </div>
          <div class="skeleton-clock">
            <span class="skeleton-currency" />
            <span
              v-for="digit in 6"
              :key="digit"
              class="skeleton-digit"
            />
            <span class="skeleton-separator" />
            <span class="skeleton-digit" />
          </div>
          <div class="skeleton-row">
            <div class="skeleton-line w-32" />
            <div class="skeleton-pill w-16" />
          </div>
        </div>

        <div class="cheer-card skeleton-card">
          <div class="skeleton-row">
            <div class="skeleton-stack">
              <div class="skeleton-line w-24" />
              <div class="skeleton-line w-40" />
            </div>
            <div class="skeleton-pill w-32 h-10" />
          </div>
          <div class="skeleton-progress" />
          <div class="skeleton-row">
            <div class="skeleton-line w-36" />
            <div class="skeleton-line w-12" />
          </div>
        </div>

        <div class="cheer-metrics">
          <div class="cheer-card skeleton-card">
            <div class="skeleton-line w-24" />
            <div class="skeleton-line w-28 h-7 mt-2" />
          </div>
          <div class="cheer-card skeleton-card">
            <div class="skeleton-line w-24" />
            <div class="skeleton-line w-32 h-7 mt-2" />
          </div>
        </div>

        <div class="cheer-card skeleton-card">
          <div class="skeleton-row">
            <div class="skeleton-line w-24" />
            <div class="skeleton-pill w-12" />
          </div>
          <div
            v-for="goal in 2"
            :key="goal"
            class="skeleton-goal"
          >
            <div class="skeleton-line w-36" />
            <div class="skeleton-progress" />
            <div class="skeleton-line w-48" />
          </div>
        </div>

        <div class="skeleton-footer">
          <div class="skeleton-line w-48" />
          <div class="skeleton-row">
            <div class="skeleton-pill w-24 h-9" />
            <div class="skeleton-pill w-24 h-9" />
          </div>
        </div>
      </div>

      <div v-else v-reveal.stagger class="cheer-body">
        <article data-reveal-child class="cheer-card cheer-earnings">
          <div class="cheer-card-heading">
            <span>{{ $t('workCheer.todayEarned') }}</span>
            <span
              class="cheer-demo-badge"
              :class="{ 'cheer-live': !demoMode }"
            >
              {{ demoMode ? $t('workCheer.widget.demoNotice') : $t('workCheer.widget.realtime') }}
            </span>
          </div>

          <div
            class="cheer-amount"
            :aria-label="settings.privacyMode ? $t('workCheer.privacy') : formatMoney(snapshot.todayEarned, 3)"
          >
            <template v-if="settings.privacyMode">
              <span class="cheer-privacy-value">••••</span>
            </template>
            <template v-else>
              <span class="cheer-currency">{{ currencySymbol }}</span>
              <WorkCheerFlipDigits class="cheer-digits" :chars="amountChars" />
            </template>
          </div>

          <div class="cheer-earnings-footer">
            <span>
              {{ $t('workCheer.widget.perSecond') }}
              <b>{{ settings.privacyMode ? '••••' : formatMoney(snapshot.secondsRate, 4) }}</b>
            </span>
            <span class="cheer-live-dot">{{ $t('workCheer.widget.realtime') }}</span>
          </div>
        </article>

        <article data-reveal-child class="cheer-card cheer-countdown">
          <div class="cheer-countdown-top">
            <div>
              <p class="cheer-card-label">{{ $t('workCheer.widget.toOff') }}</p>
              <p class="cheer-shift">{{ settings.startTime }} — {{ settings.endTime }} · {{ $t('workCheer.widget.breakIncluded') }}</p>
            </div>
            <strong class="cheer-count">{{ formatClock(snapshot.remainingSeconds) }}</strong>
          </div>
          <div class="cheer-progress">
            <div class="cheer-progress-fill" :style="{ width: `${Math.round(snapshot.progress * 100)}%` }" />
          </div>
          <div class="cheer-countdown-footer">
            <span>{{ $t('workCheer.widget.completedHours', {
              done: (snapshot.workedSeconds / 3600).toFixed(1),
              total: (snapshot.totalSeconds / 3600).toFixed(1),
            }) }}</span>
            <span>{{ Math.round(snapshot.progress * 100) }} %</span>
          </div>
        </article>

        <div data-reveal-child class="cheer-metrics">
          <article class="cheer-card">
            <p class="cheer-card-label">{{ $t('workCheer.widget.hourlyValue') }}</p>
            <strong class="cheer-metric">
              {{ settings.privacyMode ? '••••' : formatMoney(snapshot.hourlyValue) }}
            </strong>
          </article>
          <article class="cheer-card">
            <p class="cheer-card-label">{{ $t('workCheer.cycleEarned') }}</p>
            <strong class="cheer-metric">
              {{ settings.privacyMode ? '••••' : formatMoney(snapshot.cycleEarned) }}
            </strong>
          </article>
        </div>

        <article data-reveal-child class="cheer-card cheer-goal-board">
          <div class="cheer-goal-heading">
            <span>{{ $t('workCheer.goalsTitle') }}</span>
            <span>{{ snapshot.goals.length }}</span>
          </div>

          <div class="cheer-goal-list">
            <div v-for="item in snapshot.goals" :key="item.goal.id" class="cheer-goal">
              <div class="cheer-goal-title">
                <span>{{ item.goal.name || $t('workCheer.goalPlaceholder') }}</span>
                <strong>{{ settings.privacyMode ? '••••' : formatMoney(item.goal.amount) }}</strong>
              </div>

              <div class="cheer-goal-progress">
                <div :style="{ width: `${Math.round(item.progress * 100)}%` }" />
              </div>

              <div class="cheer-goal-footer">
                <span>
                  {{ settings.privacyMode ? '••••' : formatMoney(item.allocated) }}
                  / {{ settings.privacyMode ? '••••' : formatMoney(item.goal.amount) }}
                </span>
                <span>{{ Math.round(item.progress * 100) }}%</span>
              </div>
              <p class="cheer-goal-hint">{{ $t('workCheer.widget.goalHint', { hours: goalHours(item) }) }}</p>
            </div>
          </div>
        </article>

        <div data-reveal-child class="cheer-frame-footer">
          <p>{{ $t('workCheer.widget.periodFooter', { days: snapshot.periodDays }) }}</p>
          <div class="cheer-actions">
            <button type="button" class="cheer-action" @click="settings.privacyMode = !settings.privacyMode">
              {{ settings.privacyMode ? $t('workCheer.widget.showAmounts') : $t('workCheer.privacy') }}
            </button>
            <button type="button" class="cheer-action cheer-action-primary" @click="editOpen = true">
              {{ $t('workCheer.widget.editSettings') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="editOpen"
        class="cheer-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('workCheer.settingsTitle')"
        @click="closeOnBackdrop"
      >
      <div id="work-cheer-select-portal" class="cheer-select-portal" />

        <div class="cheer-modal">
          <div class="cheer-modal-header">
            <h2>{{ $t('workCheer.settingsTitle') }}</h2>
            <button type="button" class="cheer-close" :aria-label="$t('workCheer.widget.done')" @click="editOpen = false">
              <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
            </button>
          </div>

          <div class="cheer-modal-body">
            <div class="form-grid">
              <label class="modal-field">
                <span class="modal-field-label">{{ $t('workCheer.monthlySalary') }}</span>
                <input v-model.number="settings.monthlySalary" class="modal-input" type="number" min="0" step="100">
              </label>
              <label class="modal-field">
                <span class="modal-field-label">{{ $t('workCheer.cycleDay') }}</span>
                <input v-model.number="settings.cycleDay" class="modal-input" type="number" min="1" max="31">
              </label>
              <label class="modal-field">
                <span class="modal-field-label">{{ $t('workCheer.currency') }}</span>
                <USelect
                  v-model="settings.currency"
                  :items="currencyOptions"
                  color="neutral"
                  class="w-full"
                  portal="#work-cheer-select-portal"
                  :ui="selectUi"
                />
              </label>
              <div class="time-grid">
                <label class="modal-field">
                  <span class="modal-field-label">{{ $t('workCheer.startTime') }}</span>
                  <USelect
                    v-model="settings.startTime"
                    :items="timeOptions"
                    color="neutral"
                    class="w-full"
                    portal="#work-cheer-select-portal"
                    :ui="selectUi"
                  />
                </label>
                <label class="modal-field">
                  <span class="modal-field-label">{{ $t('workCheer.endTime') }}</span>
                  <USelect
                    v-model="settings.endTime"
                    :items="timeOptions"
                    color="neutral"
                    class="w-full"
                    portal="#work-cheer-select-portal"
                    :ui="selectUi"
                  />
                </label>
              </div>
            </div>

            <div class="form-block">
              <label class="check-row">
                <input v-model="settings.breakEnabled" type="checkbox">
                {{ $t('workCheer.breakEnabled') }}
              </label>
              <div v-if="settings.breakEnabled" class="time-grid">
                <label class="modal-field">
                  <span class="modal-field-label">{{ $t('workCheer.breakStart') }}</span>
                  <USelect
                    v-model="settings.breakStart"
                    :items="timeOptions"
                    color="neutral"
                    class="w-full"
                    portal="#work-cheer-select-portal"
                    :ui="selectUi"
                  />
                </label>
                <label class="modal-field">
                  <span class="modal-field-label">{{ $t('workCheer.breakEnd') }}</span>
                  <USelect
                    v-model="settings.breakEnd"
                    :items="timeOptions"
                    color="neutral"
                    class="w-full"
                    portal="#work-cheer-select-portal"
                    :ui="selectUi"
                  />
                </label>
              </div>
            </div>

            <div>
              <p class="modal-field-label">{{ $t('workCheer.weekdays') }}</p>
              <div class="weekday-grid">
                <button
                  v-for="day in 7"
                  :key="day - 1"
                  type="button"
                  :class="{ active: settings.weekdays.includes(day - 1) }"
                  @click="toggleWeekday(day - 1)"
                >
                  {{ $t(`workCheer.weekday.${day - 1}`) }}
                </button>
              </div>
            </div>

            <label class="modal-field">
              <span class="modal-field-label">{{ $t('workCheer.restDates') }}</span>
              <textarea
                class="modal-textarea"
                :value="settings.restDates.join(', ')"
                rows="2"
                :placeholder="$t('workCheer.datesPlaceholder')"
                @input="settings.restDates = parseDateList(($event.target as HTMLTextAreaElement).value)"
              />
            </label>
            <label class="modal-field">
              <span class="modal-field-label">{{ $t('workCheer.extraWorkDates') }}</span>
              <textarea
                class="modal-textarea"
                :value="settings.extraWorkDates.join(', ')"
                rows="2"
                :placeholder="$t('workCheer.datesPlaceholder')"
                @input="settings.extraWorkDates = parseDateList(($event.target as HTMLTextAreaElement).value)"
              />
            </label>

            <div class="goals-editor">
              <div class="goals-editor-header">
                <h3>{{ $t('workCheer.goalsTitle') }}</h3>
                <button type="button" @click="addGoal">{{ $t('workCheer.add') }}</button>
              </div>
              <div v-for="(goal, index) in settings.goals" :key="goal.id" class="goal-editor">
                <input v-model="goal.name" class="modal-input" maxlength="40" :placeholder="$t('workCheer.goalPlaceholder')">
                <div class="goal-editor-controls">
                    <input v-model.number="goal.amount" class="modal-input" type="number" min="0" step="10">
                  <button type="button" :disabled="index === 0" @click="moveGoal(index, -1)">
                    <UIcon name="i-heroicons-arrow-up" class="h-4 w-4" />
                  </button>
                  <button type="button" :disabled="index === settings.goals.length - 1" @click="moveGoal(index, 1)">
                    <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
                  </button>
                  <button type="button" class="danger" :disabled="settings.goals.length <= 1" @click="removeGoal(goal.id)">
                    <UIcon name="i-heroicons-trash" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="cheer-modal-footer">
            <button type="button" @click="resetSettings">{{ $t('workCheer.reset') }}</button>
            <button type="button" class="primary" @click="editOpen = false">{{ $t('workCheer.widget.done') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { useWorkCheer } from '~/composables/useWorkCheer'

const { t, locale } = useI18n()

const {
  settings,
  snapshot,
  now,
  ready,
  loaded,
  demoMode,
  resetSettings,
  addGoal,
  removeGoal,
  moveGoal,
  formatMoney,
  formatClock,
} = useWorkCheer()

const editOpen = ref(false)
const currencies = ['CNY', 'USD', 'EUR', 'JPY', 'KRW']

const greeting = computed(() => {
  const item = snapshot.value
  if (!item) return t('workCheer.connecting')
  if (item.status === 'rest') return t('workCheer.greeting.rest')
  if (item.status === 'before') return t('workCheer.greeting.before')
  if (item.status === 'break') return t('workCheer.greeting.break')
  if (item.status === 'after') return t('workCheer.greeting.after')
  if (item.progress < 0.25) return t('workCheer.greeting.start')
  if (item.progress < 0.75) return t('workCheer.greeting.middle')
  return t('workCheer.greeting.close')
})

const dateLabel = computed(() => {
  if (!now.value) return ''
  const tag = locale.value === 'en' ? 'en-GB' : locale.value
  const date = new Intl.DateTimeFormat(tag, { month: '2-digit', day: '2-digit' }).format(now.value)
  const weekday = new Intl.DateTimeFormat(tag, { weekday: 'short' }).format(now.value)
  return `${date} / ${weekday}`
})

const currencySymbol = computed(() => {
  try {
    const part = new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: settings.value.currency,
    }).formatToParts().find(part => part.type === 'currency')
    return part?.value ?? ''
  }
  catch {
    return ''
  }
})

const amountChars = computed(() => (snapshot.value ? snapshot.value.todayEarned.toFixed(3).split('') : []))

const currencyOptions = currencies.map(currency => ({ label: currency, value: currency }))

const timeOptions = computed(() => {
  const values = new Set<string>()
  for (let minute = 0; minute < 24 * 60; minute += 5) {
    values.add(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`)
  }
  for (const value of [
    settings.value.startTime,
    settings.value.endTime,
    settings.value.breakStart,
    settings.value.breakEnd,
  ]) {
    if (/^\d{2}:\d{2}$/.test(value)) values.add(value)
  }
  return [...values].sort().map(value => ({ label: value, value }))
})

const selectUi = {
  base: 'h-10 w-full border border-[#d8e2f1] rounded-lg bg-[#f7f9fd] px-3 text-[#22345c] text-sm focus:border-[#93aee6]',
  placeholder: 'text-[#61708f]',
  content: 'bg-white border border-[#d8e2f1] rounded-xl shadow-2xl max-h-[220px]',
  item: 'text-[#22345c] hover:bg-[#eaf0fc] data-[state=checked]:bg-[#eaf0fc] data-[state=checked]:text-[#3556a4]',
}

function goalHours(item: { remaining: number }) {
  const hourlyValue = snapshot.value?.hourlyValue ?? 0
  return hourlyValue > 0 ? (item.remaining / hourlyValue).toFixed(1) : '—'
}

function toggleWeekday(day: number) {
  settings.value.weekdays = settings.value.weekdays.includes(day)
    ? settings.value.weekdays.filter(value => value !== day)
    : [...settings.value.weekdays, day].sort()
}

function parseDateList(value: string) {
  return value.split(/[,;\s]+/).map(item => item.trim()).filter(Boolean)
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) editOpen.value = false
}

function onOverlayKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') editOpen.value = false
}

watch(editOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    window.addEventListener('keydown', onOverlayKeydown)
    document.body.style.overflow = 'hidden'
  }
  else {
    window.removeEventListener('keydown', onOverlayKeydown)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onOverlayKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.cheer-shell {
  display: flex;
  justify-content: center;
}

.cheer-frame {
  width: min(100%, 780px);
  padding: 18px;
  border: 1px solid #c9d8f0;
  border-radius: 26px;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.82), transparent 42%),
    linear-gradient(160deg, #e4edfa 0%, #d7e4f8 100%);
  box-shadow: 0 18px 55px rgba(31, 53, 103, 0.10);
  color: #22345c;
}

.cheer-topbar,
.cheer-earnings-footer,
.cheer-countdown-footer,
.cheer-goal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cheer-topbar {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(70, 100, 165, 0.14);
}

.cheer-brand,
.cheer-goal-heading {
  display: flex;
  align-items: center;
}

.cheer-brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border-radius: 9px;
  background: #3556a4;
  color: #fff;
}

.cheer-brand-name,
.cheer-count,
.cheer-metric,
.cheer-goal-title strong {
  font-weight: 700;
}

.cheer-brand-name {
  margin: 0;
  font-size: 15px;
}

.cheer-date,
.cheer-card-label,
.cheer-shift,
.cheer-goal-hint {
  color: #61708f;
}

.cheer-date {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.cheer-headline {
  margin-top: 20px;
  font-size: clamp(25px, 5vw, 40px);
  line-height: 1.15;
  color: #243d74;
}

.cheer-subline {
  min-height: 20px;
  margin-top: 8px;
  font-size: 14px;
  color: #61708f;
}

.cheer-body {
  margin-top: 20px;
}

.cheer-card {
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 5px 18px rgba(38, 64, 119, 0.06);
}

.cheer-body > * + *,
.cheer-metrics {
  margin-top: 14px;
}

.skeleton-card {
  overflow: hidden;
}

.skeleton-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.skeleton-stack {
  display: grid;
  gap: 8px;
}

.skeleton-line,
.skeleton-pill,
.skeleton-currency,
.skeleton-digit,
.skeleton-separator {
  background: linear-gradient(90deg, #e3ebf7 24%, #f4f8ff 48%, #e3ebf7 72%);
  background-size: 240% 100%;
  animation: skeleton-loading 1200ms linear infinite;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
}

.skeleton-pill {
  height: 28px;
  border-radius: 999px;
}

.skeleton-clock {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  margin: 16px 0;
}

.skeleton-currency {
  width: 22px;
  height: 28px;
  margin-right: 6px;
  border-radius: 6px;
}

.skeleton-digit {
  width: clamp(24px, 8vw, 52px);
  height: clamp(46px, 14vw, 88px);
  border-radius: 9px;
}

.skeleton-digit + .skeleton-digit,
.skeleton-separator + .skeleton-digit,
.skeleton-digit + .skeleton-separator {
  margin-left: 2px;
}

.skeleton-separator {
  width: 9px;
  height: 12px;
  border-radius: 4px;
}

.skeleton-progress {
  height: 6px;
  margin-top: 14px;
  border-radius: 999px;
}

.skeleton-goal {
  padding: 12px;
  border: 1px solid #e7eef9;
  border-radius: 13px;
  background: #fbfdff;
}

.skeleton-goal + .skeleton-goal {
  margin-top: 12px;
}

.skeleton-goal .skeleton-progress,
.skeleton-goal .skeleton-line {
  margin-top: 10px;
}

.skeleton-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
}

@keyframes skeleton-loading {
  from {
    background-position: 0 0;
  }

  to {
    background-position: -180% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-pill,
  .skeleton-currency,
  .skeleton-digit,
  .skeleton-separator {
    animation: none;
  }
}

.cheer-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.cheer-live,
.cheer-live-dot {
  color: #61708f;
  font-size: 12px;
}

.cheer-demo-badge {
  padding: 3px 8px;
  border: 1px solid #dbe4f3;
  border-radius: 999px;
  background: #f7f9fd;
  color: #61708f;
  font-size: 11px;
}

.cheer-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  margin: 16px 0;
}

.cheer-privacy-value {
  font-size: clamp(28px, 7vw, 44px);
  letter-spacing: 0.18em;
}

.cheer-currency {
  margin-right: 6px;
  font-size: clamp(22px, 5vw, 34px);
  font-weight: 700;
}

.cheer-digits {
  display: flex;
  align-items: center;
  min-width: 0;
}

.cheer-earnings-footer {
  font-size: 12px;
  color: #61708f;
}

.cheer-earnings-footer b {
  margin-left: 3px;
  color: #22345c;
  font-variant-numeric: tabular-nums;
}

.cheer-countdown-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cheer-card-label {
  font-size: 13px;
}

.cheer-shift {
  margin-top: 4px;
  font-size: 12px;
}

.cheer-count {
  font-size: clamp(25px, 6vw, 38px);
  color: #243d74;
  font-variant-numeric: tabular-nums;
}

.cheer-progress {
  height: 6px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6edf8;
}

.cheer-progress-fill,
.cheer-goal-progress > div {
  height: 100%;
  border-radius: inherit;
  background: #3a5bd0;
  transition: width 0.5s ease;
}

.cheer-countdown-footer,
.cheer-goal-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #61708f;
  font-variant-numeric: tabular-nums;
}

.cheer-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.cheer-metric {
  display: block;
  margin-top: 7px;
  font-size: clamp(20px, 4.5vw, 28px);
  color: #243d74;
  font-variant-numeric: tabular-nums;
}

.cheer-goal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;
  color: #61708f;
}

.cheer-goal-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.cheer-goal {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e7eef9;
  border-radius: 13px;
  background: #fbfdff;
}

.cheer-goal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 16px;
}

.cheer-goal-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheer-goal-title strong {
  color: #243d74;
  font-variant-numeric: tabular-nums;
}

.cheer-goal-progress {
  height: 6px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6edf8;
}

.cheer-goal-hint {
  margin-top: 8px;
  font-size: 12px;
}

.cheer-frame-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  font-size: 12px;
  color: #61708f;
}

.cheer-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.cheer-action {
  padding: 9px 14px;
  border: 1px solid #c9d8f0;
  border-radius: 10px;
  background: #fff;
  color: #243d74;
  font-size: 13px;
}

.cheer-action-primary {
  border-color: #3556a4;
  background: #3556a4;
  color: #fff;
}

.cheer-action:hover,
.goals-editor-header button:hover,
.goal-editor-controls button:hover,
.cheer-modal-footer button:hover {
  filter: brightness(0.97);
}

.cheer-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(10px, 3vw, 28px);
  background: rgba(12, 20, 36, 0.54);
  backdrop-filter: blur(4px);
}

.cheer-select-portal {
  position: fixed;
  inset: 0;
  z-index: 10001;
  pointer-events: none;
}

.cheer-modal {
  display: flex;
  flex-direction: column;
  width: min(100%, 780px);
  max-height: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  color: #22345c;
}

.cheer-modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #e3eaf5;
}

.cheer-modal-header h2 {
  font-size: 17px;
  font-weight: 700;
}

.cheer-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #d8e2f1;
  border-radius: 8px;
  background: #fff;
  color: #61708f;
}

.cheer-modal-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px 18px;
  overflow-x: hidden;
  overflow-y: auto;
}

.cheer-modal-body > * + *,
.goals-editor {
  margin-top: 15px;
}

.modal-field {
  display: block;
  min-width: 0;
}

.modal-field-label {
  display: block;
  min-height: 18px;
  margin: 0 0 7px;
  font-size: 12px;
  line-height: 18px;
  color: #61708f;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
  gap: 12px;
}

.time-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.modal-input,
.modal-textarea {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #d8e2f1;
  border-radius: 9px;
  background: #f7f9fd;
  color: #22345c;
  font-size: 14px;
  line-height: 38px;
}

.modal-textarea {
  height: auto;
  padding: 9px 10px;
  line-height: 1.45;
  resize: none;
}

.modal-input:focus,
.modal-textarea:focus {
  outline: 2px solid #93aee6;
}

.form-block {
  display: grid;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e3eaf5;
  border-radius: 12px;
  background: #fbfcfe;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.check-row input {
  width: auto;
  height: 18px;
}

.weekday-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.weekday-grid button {
  padding: 7px 10px;
  border: 1px solid #d8e2f1;
  border-radius: 8px;
  background: #fff;
  color: #61708f;
  font-size: 12px;
}

.weekday-grid button.active {
  border-color: #3556a4;
  background: #eaf0fc;
  color: #3556a4;
}

.goals-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goals-editor-header h3 {
  font-size: 15px;
  font-weight: 650;
}

.goals-editor-header button {
  padding: 7px 10px;
  border: 1px solid #d8e2f1;
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
}

.goal-editor {
  padding: 12px;
  border: 1px solid #e3eaf5;
  border-radius: 12px;
  background: #fbfcfe;
}

.goal-editor + .goal-editor {
  margin-top: 10px;
}

.goal-editor-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.goal-editor-controls input {
  flex: 1;
  min-width: 0;
}

.goal-editor-controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d8e2f1;
  border-radius: 8px;
  background: #fff;
  color: #3556a4;
}

.goal-editor-controls button:disabled {
  opacity: 0.35;
}

.goal-editor-controls .danger {
  color: #b4322e;
}

.cheer-modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  padding: 14px 18px;
  border-top: 1px solid #e3eaf5;
}

.cheer-modal-footer button {
  padding: 9px 14px;
  border: 1px solid #d8e2f1;
  border-radius: 10px;
  background: #fff;
  color: #243d74;
  font-size: 13px;
}

.cheer-modal-footer .primary {
  border-color: #3556a4;
  background: #3556a4;
  color: #fff;
}

@media (max-width: 560px) {
  .cheer-frame {
    padding: 14px;
    border-radius: 20px;
  }

  .cheer-metrics,
  .time-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .cheer-goal-list {
    grid-template-columns: 1fr;
  }

  .cheer-overlay {
    align-items: stretch;
    padding: 8px;
  }

  .cheer-modal {
    width: 100%;
    max-height: 100%;
    border-radius: 16px;
  }

  .cheer-frame-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .cheer-actions {
    width: 100%;
  }

  .cheer-action {
    flex: 1;
  }
}
</style>
