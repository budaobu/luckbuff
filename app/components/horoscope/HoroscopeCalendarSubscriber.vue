<template>
  <section class="hcs">
    <header>
      <h2>{{ $t('horoscope.calendar.title') }}</h2>
      <p>{{ $t('horoscope.calendar.subtitle') }}</p>
    </header>

    <form class="hcs-grid" @submit.prevent>
      <label>
        <span>{{ $t('horoscope.calendar.sign') }}</span>
        <USelect
          v-model="sign"
          :items="signOptions"
          value-key="value"
          color="warning"
          class="w-full"
          :ui="selectUi"
        />
      </label>

      <fieldset>
        <legend>{{ $t('horoscope.calendar.range') }}</legend>
        <div class="hcs-segments">
          <button type="button" :class="{ active: range === 1 }" @click="range = 1">{{ $t('horoscope.calendar.today') }}</button>
          <button type="button" :class="{ active: range === 3 }" @click="range = 3">{{ $t('horoscope.calendar.threeDays') }}</button>
          <button type="button" :class="{ active: range === 7 }" @click="range = 7">{{ $t('horoscope.calendar.sevenDays') }}</button>
        </div>
      </fieldset>

      <fieldset class="hcs-types">
        <legend>{{ $t('horoscope.calendar.types') }}</legend>
        <label v-for="type in typeOptions" :key="type.value">
          <input v-model="selectedTypes" type="checkbox" :value="type.value">
          <span>{{ type.label }}</span>
        </label>
      </fieldset>
    </form>

    <div class="hcs-actions">
      <button type="button" :disabled="!selectedTypes.length" @click="subscribe">
        <UIcon name="i-heroicons-calendar-days" class="h-4 w-4" />
        {{ $t('horoscope.calendar.subscribe') }}
      </button>
      <a :href="calendarUrl" :download="`${sign}-horoscope-${range}d.ics`">
        <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
        {{ $t('horoscope.calendar.download') }}
      </a>
      <button type="button" @click="copyUrl">
        <UIcon :name="copied ? 'i-heroicons-check' : 'i-heroicons-link'" class="h-4 w-4" />
        {{ copied ? $t('horoscope.calendar.copied') : $t('horoscope.calendar.copy') }}
      </button>
    </div>

    <label class="hcs-url">
      <span>{{ $t('horoscope.calendar.url') }}</span>
      <input :value="calendarUrl" readonly @focus="selectUrlText">
    </label>
    <p class="hcs-hint">{{ $t('horoscope.calendar.hint') }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ signs: Array<{ slug: string; nameZh: string }> }>()
const { t } = useI18n()
const toast = useToast()

const sign = ref(props.signs[0]?.slug ?? 'aries')
const range = ref<1 | 3 | 7>(3)
const selectedTypes = ref<string[]>(['overall', 'love', 'work', 'wealth', 'health', 'lucky-number', 'lucky-color'])
const calendarUrl = ref('')
const copied = ref(false)

const typeOptions = computed(() => [
  { value: 'overall', label: t('horoscope.calendar.overallIndex') },
  { value: 'lucky-number', label: t('horoscope.fields.luckyNumber') },
  { value: 'lucky-color', label: t('horoscope.fields.luckyColor') },
  { value: 'love', label: t('horoscope.fields.love') },
  { value: 'work', label: t('horoscope.fields.work') },
  { value: 'wealth', label: t('horoscope.fields.wealth') },
  { value: 'health', label: t('horoscope.fields.health') },
])

const signOptions = computed(() => props.signs.map(sign => ({
  label: t(`horoscope.signs.${sign.slug}`),
  value: sign.slug,
})))

const selectUi = {
  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

function updateUrl() {
  if (import.meta.server) return
  const params = new URLSearchParams({
    sign: sign.value,
    range: String(range.value),
    types: selectedTypes.value.join(','),
  })
  calendarUrl.value = `${window.location.origin}/api/horoscope/ics?${params.toString()}`
}

function selectUrlText(event: FocusEvent) {
  const input = event.target as HTMLInputElement | null
  input?.select()
}

function webcalUrl() {
  return calendarUrl.value.replace(/^https?:\/\//, 'webcal://')
}

function subscribe() {
  if (!calendarUrl.value || !selectedTypes.value.length) return
  window.location.href = webcalUrl()
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(calendarUrl.value)
    copied.value = true
    toast.add({ title: t('horoscope.calendar.copied'), color: 'success' })
    window.setTimeout(() => { copied.value = false }, 1800)
  }
  catch {
    toast.add({ title: t('horoscope.calendar.copyFailed'), color: 'error' })
  }
}

watch([sign, range, selectedTypes], updateUrl, { deep: true })
onMounted(updateUrl)
</script>

<style scoped>
.hcs { display: grid; gap: 16px; border: 1px solid var(--border-subtle); border-radius: 14px; background: var(--surface-card); padding: 22px; }
.hcs header h2 { margin: 0; font-size: 20px; }
.hcs header p { margin: 6px 0 0; color: var(--text-muted); font-size: 14px; line-height: 1.6; }
.hcs-grid { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 14px; align-items: start; }
.hcs label, .hcs fieldset { min-width: 0; border: 0; margin: 0; padding: 0; }
.hcs label > span, .hcs legend { display: block; margin-bottom: 6px; color: var(--text-faint); font-size: 12px; }
.hcs-url input { width: 100%; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-input); color: var(--text-primary); padding: 10px; }
.hcs-segments { display: inline-grid; grid-template-columns: repeat(3, minmax(76px, auto)); overflow: hidden; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-input); }
.hcs-segments button { min-height: 40px; border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.hcs-segments button.active { background: var(--accent-bg); color: var(--accent); font-weight: 600; }
.hcs-types { display: grid; grid-column: 1 / -1; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px 12px; }
.hcs-types label { display: flex; align-items: center; gap: 7px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-input); min-height: 44px; padding: 8px 10px; cursor: pointer; }
.hcs-types input { accent-color: var(--accent); }
.hcs-types span { line-height: 1.35; white-space: normal; }
.hcs-actions { display: flex; flex-wrap: wrap; gap: 9px; }
.hcs-actions button, .hcs-actions a { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--accent-border); border-radius: 8px; background: var(--accent-bg); color: var(--accent); padding: 9px 13px; text-decoration: none; cursor: pointer; }
.hcs-url span { display: block; margin-bottom: 6px; color: var(--text-faint); font-size: 12px; }
.hcs-hint { margin: -4px 0 0; color: var(--text-faint); font-size: 12px; }
@media (max-width: 760px) {
  .hcs-grid { grid-template-columns: 1fr; }
  .hcs-types { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 420px) {
  .hcs-types { grid-template-columns: 1fr; }
  .hcs-actions button, .hcs-actions a { width: 100%; }
}
</style>
