<template>
  <section class="acs">
    <header>
      <h2>{{ $t('almanacCalendar.calendar.title') }}</h2>
      <p>{{ $t('almanacCalendar.calendar.subtitle') }}</p>
    </header>

    <fieldset class="acs-types">
      <legend>{{ $t('almanacCalendar.calendar.types') }}</legend>
      <label
        v-for="type in typeOptions"
        :key="type.value"
      >
        <input
          v-model="selectedTypes"
          type="checkbox"
          :value="type.value"
        >
        <span>{{ type.label }}</span>
      </label>
    </fieldset>

    <div class="acs-actions">
      <button
        type="button"
        :disabled="!selectedTypes.length"
        @click="subscribe"
      >
        <UIcon
          name="i-heroicons-calendar-days"
          class="h-4 w-4"
        />
        {{ $t('almanacCalendar.calendar.subscribe') }}
      </button>
      <a
        :href="calendarUrl"
        download="ososn-almanac.ics"
      >
        <UIcon
          name="i-heroicons-arrow-down-tray"
          class="h-4 w-4"
        />
        {{ $t('almanacCalendar.calendar.download') }}
      </a>
      <button
        type="button"
        :disabled="!calendarUrl"
        @click="copyUrl"
      >
        <UIcon
          :name="copied ? 'i-heroicons-check' : 'i-heroicons-link'"
          class="h-4 w-4"
        />
        {{ copied ? $t('almanacCalendar.calendar.copied') : $t('almanacCalendar.calendar.copy') }}
      </button>
    </div>

    <label class="acs-url">
      <span>{{ $t('almanacCalendar.calendar.url') }}</span>
      <input
        :value="calendarUrl"
        readonly
        @focus="selectUrlText"
      >
    </label>
    <p class="acs-hint">
      {{ $t('almanacCalendar.calendar.hint') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const toast = useToast()

const selectedTypes = ref(['yi', 'ji', 'festivals'])
const calendarUrl = ref('')
const copied = ref(false)

const typeOptions = computed(() => [
  { value: 'yi', label: t('almanacCalendar.types.yi') },
  { value: 'ji', label: t('almanacCalendar.types.ji') },
  { value: 'festivals', label: t('almanacCalendar.types.festivals') },
])

function updateUrl() {
  if (import.meta.server || !selectedTypes.value.length) return
  const params = new URLSearchParams({
    locale: locale.value,
    types: selectedTypes.value.join(','),
  })
  calendarUrl.value = `${window.location.origin}/api/tools/almanac-calendar.ics?${params.toString()}`
}

function selectUrlText(event: FocusEvent) {
  (event.target as HTMLInputElement | null)?.select()
}

function subscribe() {
  if (!calendarUrl.value) return
  window.location.href = calendarUrl.value.replace(/^https?:\/\//, 'webcal://')
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(calendarUrl.value)
    copied.value = true
    toast.add({ title: t('almanacCalendar.calendar.copied'), color: 'success' })
    window.setTimeout(() => {
      copied.value = false
    }, 1800)
  }
  catch {
    toast.add({ title: t('almanacCalendar.calendar.copyFailed'), color: 'error' })
  }
}

watch([locale, selectedTypes], updateUrl, { deep: true })
onMounted(updateUrl)
</script>

<style scoped>
.acs {
  display: grid;
  gap: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.acs header h2 {
  margin: 0;
  font-size: 19px;
}

.acs header p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.acs-types {
  margin: 0;
  padding: 0;
  border: 0;
}

.acs-types legend,
.acs-url span {
  margin-bottom: 7px;
  color: var(--text-faint);
  font-size: 12px;
}

.acs-types {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.acs-types label {
  display: flex;
  align-items: center;
  min-height: 42px;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-input);
  padding: 8px 10px;
  cursor: pointer;
}

.acs-types input {
  accent-color: var(--accent);
}

.acs-types span {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.35;
}

.acs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.acs-actions button,
.acs-actions a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  background: var(--accent-bg);
  color: var(--accent);
  padding: 9px 13px;
  text-decoration: none;
  cursor: pointer;
}

.acs-actions button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.acs-url {
  display: block;
}

.acs-url input {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-input);
  color: var(--text-primary);
  padding: 10px;
}

.acs-hint {
  margin: -4px 0 0;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 680px) {
  .acs-types {
    grid-template-columns: 1fr;
  }

  .acs-actions button,
  .acs-actions a {
    width: 100%;
    justify-content: center;
  }
}
</style>
