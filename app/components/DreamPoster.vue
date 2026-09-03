<template>
  <div class="dmp">
    <div class="dmp-sheet">
      <header class="dmp-head">
        <p class="dmp-kicker">{{ $t('dream.poster.kicker') }}</p>
        <h2 class="dmp-title">{{ $t('dream.poster.title') }}</h2>
        <p class="dmp-overview" :class="{ 'dmp-pending': !parsed.ov }">
          {{ parsed.ov || $t('dream.poster.pending') }}
        </p>
      </header>

      <section class="dmp-dream">
        <span class="dmp-dream-flag">{{ $t('dream.poster.dreamLabel') }}</span>
        <p class="dmp-dream-text">{{ truncatedDream }}</p>
      </section>

      <section class="dmp-fields">
        <div v-for="field in displayFields" :key="field.key" class="dmp-field">
          <span class="dmp-field-label">{{ field.label }}</span>
          <p class="dmp-field-value" :class="{ 'dmp-pending': !field.value }">
            {{ field.value || $t('dream.poster.pending') }}
          </p>
        </div>
      </section>

      <p v-if="parsed.tip" class="dmp-tip">
        <span class="dmp-tip-dot" aria-hidden="true" />
        {{ parsed.tip }}
      </p>

      <p class="dmp-note">
        <span class="dmp-note-label">{{ $t('dream.poster.noteLabel') }}</span>
        <span :class="{ 'dmp-pending': !parsed.note }">
          {{ parsed.note || $t('dream.poster.pending') }}
        </span>
      </p>

      <footer class="dmp-foot">
        <span class="dmp-brand">ososn</span>
        <span class="dmp-date">{{ today }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  dream: string
  content: string
}>()

const { t } = useI18n()

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
    work: map['WORK'] || '',
    love: map['LOVE'] || '',
    health: map['HEALTH'] || '',
    tip: map['TIP'] || '',
    note: map['NOTE'] || '',
  }
})

const displayFields = computed(() => [
  { key: 'sym', label: t('dream.poster.fieldSym'), value: parsed.value.sym },
  { key: 'work', label: t('dream.poster.fieldWork'), value: parsed.value.work },
  { key: 'love', label: t('dream.poster.fieldLove'), value: parsed.value.love },
  { key: 'health', label: t('dream.poster.fieldHealth'), value: parsed.value.health },
])

const truncatedDream = computed(() => {
  const d = props.dream.trim()
  return d.length > 80 ? d.slice(0, 80) + '…' : d
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})
</script>

<style scoped>
.dmp {
  --dmp-paper: #f5f0e6;
  --dmp-ink: #3a2e24;
  --dmp-muted: #7a6b58;
  --dmp-accent: #8b6f47;
  --dmp-border: #d4c4a8;
  max-width: 420px;
  margin: 0 auto;
}
.dmp-sheet {
  background: var(--dmp-paper);
  border: 1px solid var(--dmp-border);
  border-radius: 6px;
  padding: 24px 20px 16px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  color: var(--dmp-ink);
  position: relative;
  overflow: hidden;
}
.dmp-sheet::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid var(--dmp-border);
  border-radius: 3px;
  pointer-events: none;
}
.dmp-head {
  text-align: center;
  margin-bottom: 16px;
}
.dmp-kicker {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--dmp-accent);
  margin-bottom: 4px;
}
.dmp-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.08em;
}
.dmp-overview {
  font-size: 13px;
  color: var(--dmp-accent);
  margin-top: 8px;
  line-height: 1.5;
}
.dmp-dream {
  border-top: 1px solid var(--dmp-border);
  padding-top: 12px;
  margin-bottom: 12px;
}
.dmp-dream-flag {
  display: block;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--dmp-muted);
  margin-bottom: 4px;
}
.dmp-dream-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--dmp-ink);
  margin: 0;
}
.dmp-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.dmp-field {
  background: rgba(255,255,255,0.4);
  border: 1px solid var(--dmp-border);
  border-radius: 4px;
  padding: 8px;
}
.dmp-field-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--dmp-muted);
  margin-bottom: 3px;
}
.dmp-field-value {
  font-size: 11px;
  line-height: 1.5;
  margin: 0;
}
.dmp-tip {
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 10px;
  padding-left: 14px;
  position: relative;
}
.dmp-tip-dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dmp-accent);
}
.dmp-note {
  border-top: 1px dashed var(--dmp-border);
  padding-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
  color: var(--dmp-muted);
  margin: 0 0 12px;
}
.dmp-note-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 2px;
  color: var(--dmp-accent);
}
.dmp-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  color: var(--dmp-muted);
  letter-spacing: 0.1em;
}
.dmp-pending {
  opacity: 0.35;
}
</style>
