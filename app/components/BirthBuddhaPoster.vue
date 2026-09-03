<template>
  <div class="bbp">
    <div class="bbp-sheet">
      <header class="bbp-head">
        <p class="bbp-kicker">{{ $t('birthBuddha.poster.kicker') }}</p>
        <h2 class="bbp-title">{{ $t('birthBuddha.poster.title') }}</h2>
        <div class="bbp-buddha-name">{{ buddha }}</div>
        <p class="bbp-overview" :class="{ 'bbp-pending': !parsed.ov }">
          {{ parsed.ov || $t('birthBuddha.poster.pending') }}
        </p>
      </header>

      <section class="bbp-meta">
        <div class="bbp-meta-cell">
          <span class="bbp-meta-label">{{ $t('birthBuddha.poster.yearLabel') }}</span>
          <span class="bbp-meta-value">{{ year }} {{ zodiac.name }}</span>
        </div>
        <div class="bbp-meta-cell">
          <span class="bbp-meta-label">{{ $t('birthBuddha.poster.buddhaLabel') }}</span>
          <span class="bbp-meta-value">{{ buddha }}</span>
        </div>
      </section>

      <section class="bbp-fields">
        <div v-for="field in displayFields" :key="field.key" class="bbp-field">
          <span class="bbp-field-label">{{ field.label }}</span>
          <p class="bbp-field-value" :class="{ 'bbp-pending': !field.value }">
            {{ field.value || $t('birthBuddha.poster.pending') }}
          </p>
        </div>
      </section>

      <p v-if="parsed.tip" class="bbp-tip">
        <span class="bbp-tip-dot" aria-hidden="true" />
        {{ parsed.tip }}
      </p>

      <p class="bbp-note">
        <span :class="{ 'bbp-pending': !parsed.note }">
          {{ parsed.note || $t('birthBuddha.poster.pending') }}
        </span>
      </p>

      <footer class="bbp-foot">
        <span class="bbp-brand">ososn</span>
        <span class="bbp-date">{{ today }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  year: number
  zodiac: { key: string; name: string; buddha: string }
  content: string
}>()

const { t } = useI18n()

const buddha = computed(() => props.zodiac.buddha)

const parsed = computed(() => {
  const map: Record<string, string> = {}
  const lines = props.content.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (value && !map[key]) map[key] = value
  }
  return {
    ov: map['OV'] || '',
    sym: map['SYM'] || '',
    char: map['CHAR'] || '',
    work: map['WORK'] || '',
    love: map['LOVE'] || '',
    tip: map['TIP'] || '',
    note: map['NOTE'] || '',
  }
})

const displayFields = computed(() => [
  { key: 'sym', label: t('birthBuddha.poster.fieldSym'), value: parsed.value.sym },
  { key: 'char', label: t('birthBuddha.poster.fieldChar'), value: parsed.value.char },
  { key: 'work', label: t('birthBuddha.poster.fieldWork'), value: parsed.value.work },
  { key: 'love', label: t('birthBuddha.poster.fieldLove'), value: parsed.value.love },
])

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})
</script>

<style scoped>
.bbp {
  --bbp-paper: #f0ebe0;
  --bbp-ink: #3a3028;
  --bbp-muted: #7a6b58;
  --bbp-accent: #8b6f47;
  --bbp-border: #d0c0a0;
  max-width: 420px;
  margin: 0 auto;
}
.bbp-sheet {
  background: var(--bbp-paper);
  border: 1px solid var(--bbp-border);
  border-radius: 6px;
  padding: 24px 20px 16px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  color: var(--bbp-ink);
  position: relative;
  overflow: hidden;
  text-align: center;
}
.bbp-sheet::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid var(--bbp-border);
  border-radius: 3px;
  pointer-events: none;
}
.bbp-head {
  margin-bottom: 14px;
}
.bbp-kicker {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--bbp-accent);
  margin-bottom: 4px;
}
.bbp-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.08em;
}
.bbp-buddha-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--bbp-accent);
  margin-top: 10px;
  letter-spacing: 0.12em;
}
.bbp-overview {
  font-size: 12px;
  color: var(--bbp-muted);
  margin-top: 6px;
  line-height: 1.5;
}
.bbp-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.bbp-meta-cell {
  background: rgba(255,255,255,0.4);
  border: 1px solid var(--bbp-border);
  border-radius: 4px;
  padding: 8px;
}
.bbp-meta-label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--bbp-muted);
  margin-bottom: 3px;
}
.bbp-meta-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--bbp-ink);
}
.bbp-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.bbp-field {
  background: rgba(255,255,255,0.4);
  border: 1px solid var(--bbp-border);
  border-radius: 4px;
  padding: 8px;
  text-align: left;
}
.bbp-field-label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--bbp-muted);
  margin-bottom: 3px;
}
.bbp-field-value {
  font-size: 11px;
  line-height: 1.5;
  margin: 0;
}
.bbp-tip {
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 10px;
  padding-left: 14px;
  position: relative;
  text-align: left;
}
.bbp-tip-dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bbp-accent);
}
.bbp-note {
  border-top: 1px dashed var(--bbp-border);
  padding-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--bbp-muted);
  margin: 0 0 12px;
}
.bbp-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  color: var(--bbp-muted);
  letter-spacing: 0.1em;
}
.bbp-pending {
  opacity: 0.35;
}
</style>
