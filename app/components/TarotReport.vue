<template>
  <div class="tr">
    <div class="tr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="tr-head">
        <div class="tr-head-top">
          <div class="tr-brand">
            <div class="tr-seal">{{ $t('tarot.report.seal') }}</div>
            <span class="tr-brand-name">{{ $t('tarot.report.brandName') }}</span>
          </div>
          <div class="tr-head-right">
            <span>{{ $t('tarot.report.generatedAt') }}：{{ generatedAt }}</span>
            <span>{{ $t('tarot.report.spreadLabel') }}：{{ result.spread_name }}</span>
          </div>
        </div>

        <h1 class="tr-title">{{ $t('tarot.report.title') }}</h1>
        <p class="tr-subtitle">{{ subtitleText }}</p>
        <p class="tr-meta-line">{{ metaLine }}</p>
      </header>

      <!-- ============ 牌阵统计小卡 ============ -->
      <section class="tr-section">
        <div class="tr-quad">
          <div class="tr-card tr-mini tr-mini-accent">
            <div class="tr-mini-label">{{ $t('tarot.report.cardCountCard') }}</div>
            <div class="tr-mini-value">{{ result.cards.length }}<span class="tr-mini-unit">{{ $t('tarot.report.cardUnit') }}</span></div>
            <div class="tr-mini-sub">{{ result.spread_name }}</div>
          </div>
          <div class="tr-card tr-mini">
            <div class="tr-mini-label">{{ $t('tarot.report.majorCard') }}</div>
            <div class="tr-mini-value">{{ majorCount }}<span class="tr-mini-unit">/ {{ result.cards.length }}</span></div>
            <div class="tr-mini-sub">{{ $t('tarot.report.majorSub') }}</div>
          </div>
          <div class="tr-card tr-mini">
            <div class="tr-mini-label">{{ $t('tarot.report.uprightCard') }}</div>
            <div class="tr-mini-value">{{ uprightCount }}<span class="tr-mini-unit">/ {{ result.cards.length }}</span></div>
            <div class="tr-mini-sub">{{ $t('tarot.report.uprightSub') }}</div>
          </div>
          <div class="tr-card tr-mini">
            <div class="tr-mini-label">{{ $t('tarot.report.dominantCard') }}</div>
            <div class="tr-mini-value">{{ dominantElement }}</div>
            <div class="tr-mini-sub">{{ $t('tarot.report.dominantSub') }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 元素分布 ============ -->
      <section class="tr-section">
        <div class="tr-card">
          <h3 class="tr-card-title">{{ $t('tarot.report.elementTitle') }}</h3>
          <div class="tr-elements">
            <div v-for="e in elementList" :key="e.name" class="tr-element-row">
              <span class="tr-element-name">{{ e.name }}</span>
              <span class="tr-element-bar-wrap">
                <span class="tr-element-bar" :style="{ width: e.pct + '%', background: e.color }" />
              </span>
              <span class="tr-element-num">{{ e.count }}{{ $t('tarot.report.cardUnit') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 抽牌结果表 ============ -->
      <section class="tr-section">
        <div class="tr-card">
          <h3 class="tr-card-title">{{ $t('tarot.report.cardsTitle') }}</h3>
          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ $t('tarot.report.colPosition') }}</th>
                  <th>{{ $t('tarot.report.colCard') }}</th>
                  <th>{{ $t('tarot.report.colOrientation') }}</th>
                  <th>{{ $t('tarot.report.colArcana') }}</th>
                  <th>{{ $t('tarot.report.colElement') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(card, i) in result.cards" :key="i" :class="{ 'tr-tr-major': card.is_major }">
                  <td class="tr-td-no">{{ i + 1 }}</td>
                  <td class="tr-td-pos">{{ card.position }}</td>
                  <td class="tr-td-card">{{ card.card }}</td>
                  <td>
                    <span class="tr-orient" :class="card.orientation === '正位' ? 'tr-orient-up' : 'tr-orient-rev'">
                      {{ card.orientation === '正位' ? '↑' : '↓' }} {{ orientationText(card.orientation) }}
                    </span>
                  </td>
                  <td>{{ card.is_major ? $t('tarot.report.arcanaMajor') : $t('tarot.report.arcanaMinor') }}</td>
                  <td>{{ card.element }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="tr-section">
        <div class="tr-ai-grid">
          <div v-for="(s, i) in aiSections" :key="i" class="tr-card tr-ai">
            <h3 class="tr-ai-title">
              <span class="tr-ai-no">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.title }}
            </h3>
            <div class="tr-ai-body tr-md" v-html="s.html" />
          </div>
        </div>

        <!-- 流式中提示 -->
        <div v-if="streaming" class="tr-streaming">
          <span class="tr-streaming-dot" />
          {{ $t('tarot.report.streamingHint') }}
        </div>

        <!-- AI 错误 -->
        <div v-if="error" class="tr-error">
          <p>{{ error }}</p>
          <button type="button" class="tr-retry" @click="$emit('retry')">{{ $t('tarot.report.retry') }}</button>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="tr-foot">
        <span class="tr-foot-note">ⓘ {{ $t('tarot.disclaimer') }}</span>
        <span class="tr-seal tr-seal-foot">{{ $t('tarot.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface TarotCard {
  position: string
  card: string
  orientation: string
  is_major: boolean
  element: string
}

interface TarotDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  time_factor: string
  cards: TarotCard[]
}

interface Props {
  result: TarotDrawResult
  analysis: string
  streaming: boolean
  error?: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const questionText = computed(() => props.result.question || t('tarot.noQuestion'))

const subtitleText = computed(() =>
  t('tarot.report.subtitle', { spread: props.result.spread_name, question: questionText.value }))

const genderText = computed(() => {
  if (props.result.gender === 'male') return t('tarot.male')
  if (props.result.gender === 'female') return t('tarot.female')
  return t('tarot.report.genderUnspecified')
})

const TIME_FACTOR_KEYS: Record<string, string> = {
  morning: 'timeMorning',
  afternoon: 'timeAfternoon',
  night: 'timeNight',
}

const metaLine = computed(() =>
  `${t('tarot.report.genderLabel')} ${genderText.value} · ${t('tarot.report.timeLabel')} ${t(`tarot.report.${TIME_FACTOR_KEYS[props.result.time_factor] ?? 'timeNight'}`)} · Seed ${props.result.seed}`)

const majorCount = computed(() => props.result.cards.filter(c => c.is_major).length)
const uprightCount = computed(() => props.result.cards.filter(c => c.orientation === '正位').length)

const ELEMENT_COLORS: Record<string, string> = {
  火: '#a8512e',
  水: '#4a6a8a',
  风: '#7d8a6a',
  土: '#8a6d3b',
}

const elementList = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of props.result.cards) {
    counts[c.element] = (counts[c.element] || 0) + 1
  }
  const order = ['火', '水', '风', '土']
  const names = [...order.filter(e => counts[e]), ...Object.keys(counts).filter(e => !order.includes(e))]
  const max = Math.max(1, ...names.map(n => counts[n]!))
  return names.map(name => ({
    name,
    count: counts[name]!,
    pct: Math.round((counts[name]! / max) * 100),
    color: ELEMENT_COLORS[name] ?? '#8c6d1f',
  }))
})

const dominantElement = computed(() => elementList.value[0]?.name ?? '—')

function orientationText(orientation: string): string {
  return orientation === '正位' ? t('tarot.report.uprightTag') : t('tarot.report.reversedTag')
}

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('tarot.report.pending'))

const aiSections = computed<{ title: string; html: string }[]>(() => {
  const text = props.analysis || ''
  const out: { title: string; html: string }[] = []
  if (text) {
    const parts = text.split(/(?=^## )/m).filter(p => p.trim())
    for (const part of parts) {
      const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('tarot.report.untitledSection')
      const body = part.replace(/^## .+\n?/, '').trim()
      if (body) out.push({ title, html: marked.parse(body, { async: false }) as string })
    }
  }
  // 流式尚未产出章节时，先展示占位卡
  if (!out.length) {
    out.push({ title: t('tarot.report.untitledSection'), html: `<p class="tr-pending">${pendingText.value}</p>` })
  }
  return out
})
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bazi-ziwei 报告色系） ========== */
.tr {
  --tr-bg: #f2ede3;
  --tr-sheet: #faf6ec;
  --tr-card: #fffdf6;
  --tr-ink: #2e2a24;
  --tr-ink-soft: #55503f;
  --tr-ink-faint: #8a8272;
  --tr-line: #d8d0bd;
  --tr-line-soft: #e6dfcd;
  --tr-accent: #8c2f26;
  --tr-accent-soft: #a8512e;
  --tr-star: #8c6d1f;
  --tr-green: #4a7c59;
  border-radius: 12px;
  background: var(--tr-bg);
  padding: 18px;
  color: var(--tr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.tr-sheet {
  background: var(--tr-sheet);
  border: 1px solid var(--tr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.tr-head { border-bottom: 2px solid var(--tr-ink); padding-bottom: 16px; }
.tr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.tr-brand { display: flex; align-items: center; gap: 8px; }
.tr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--tr-accent);
  color: var(--tr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.tr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--tr-ink-soft); }
.tr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--tr-ink-faint); }

.tr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.tr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--tr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 8px;
}
.tr-meta-line { text-align: center; margin: 0; font-size: 11px; color: var(--tr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/区块 ---------- */
.tr-section { margin-top: 16px; }
.tr-card {
  background: var(--tr-card);
  border: 1px solid var(--tr-line);
  padding: 14px 16px;
  min-width: 0;
}
.tr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--tr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 统计小卡 ---------- */
.tr-quad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.tr-mini { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.tr-mini-accent { border: 1.5px solid var(--tr-accent); background: rgba(140, 47, 38, 0.04); }
.tr-mini-label { font-size: 11px; color: var(--tr-ink-faint); letter-spacing: 1px; }
.tr-mini-value { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
.tr-mini-unit { font-size: 11px; font-weight: 400; color: var(--tr-ink-faint); margin-left: 3px; }
.tr-mini-sub { font-size: 10.5px; color: var(--tr-ink-faint); line-height: 1.5; }

/* ---------- 元素分布条形 ---------- */
.tr-elements { display: flex; flex-direction: column; gap: 6px; }
.tr-element-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.tr-element-name { width: 16px; font-weight: 700; color: var(--tr-ink-soft); }
.tr-element-bar-wrap { flex: 1; height: 8px; background: var(--tr-line-soft); }
.tr-element-bar { display: block; height: 100%; }
.tr-element-num { width: 34px; text-align: right; color: var(--tr-ink-faint); }

/* ---------- 抽牌结果表 ---------- */
.tr-table-wrap { overflow-x: auto; }
.tr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.tr-table th, .tr-table td {
  border: 1px solid var(--tr-line);
  padding: 5px 8px;
  text-align: left;
  line-height: 1.5;
}
.tr-table thead th {
  background: var(--tr-line-soft);
  font-weight: 700;
  color: var(--tr-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.tr-table td { color: var(--tr-ink-soft); }
.tr-td-no { color: var(--tr-ink-faint); }
.tr-td-pos { font-weight: 700; color: var(--tr-ink); white-space: nowrap; }
.tr-td-card { font-weight: 700; color: var(--tr-ink); white-space: nowrap; }
.tr-tr-major { background: rgba(140, 109, 31, 0.05); }
.tr-orient { white-space: nowrap; font-size: 10.5px; }
.tr-orient-up { color: var(--tr-star); font-weight: 700; }
.tr-orient-rev { color: var(--tr-accent-soft); }

/* ---------- AI 章节 ---------- */
.tr-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.tr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--tr-line-soft);
  padding-bottom: 8px;
}
.tr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--tr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.tr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--tr-ink-soft); }

.tr-md :deep(p) { margin: 0 0 0.7em; }
.tr-md :deep(p:last-child) { margin-bottom: 0; }
.tr-md :deep(strong) { color: var(--tr-ink); font-weight: 700; }
.tr-md :deep(ul), .tr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.tr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.tr-md :deep(h3), .tr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--tr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.tr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.tr-md :deep(th), .tr-md :deep(td) { border: 1px solid var(--tr-line); padding: 4px 6px; text-align: left; }
.tr-md :deep(th) { background: var(--tr-line-soft); font-weight: 700; color: var(--tr-ink); }
.tr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--tr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.tr-md :deep(.tr-pending), .tr-pending { color: var(--tr-ink-faint); font-style: italic; }

.tr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--tr-ink-faint); letter-spacing: 1px;
}
.tr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--tr-accent);
  animation: tr-pulse 1s ease-in-out infinite;
}
@keyframes tr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.tr-error { margin-top: 14px; text-align: center; color: var(--tr-accent); font-size: 12px; }
.tr-retry {
  margin-top: 8px;
  border: 1px solid var(--tr-accent);
  background: transparent;
  color: var(--tr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.tr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.tr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--tr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.tr-foot-note { font-size: 10px; color: var(--tr-ink-faint); max-width: 80%; }
.tr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .tr-quad { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .tr { padding: 8px; }
  .tr-sheet { padding: 16px 12px; }
  .tr-title { font-size: 22px; letter-spacing: 2px; }
  .tr-ai-grid { grid-template-columns: 1fr; }
  .tr-quad { grid-template-columns: 1fr 1fr; }
  .tr-mini-value { font-size: 18px; }
  .tr-table { min-width: 520px; }
  .tr-foot-note { max-width: 100%; }
}
</style>
