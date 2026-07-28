<template>
  <div class="lr">
    <div class="lr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="lr-head">
        <div class="lr-head-top">
          <div class="lr-brand">
            <div class="lr-seal">{{ $t('lenormand.report.seal') }}</div>
            <span class="lr-brand-name">{{ $t('lenormand.report.brandName') }}</span>
          </div>
          <div class="lr-head-right">
            <span>{{ $t('lenormand.report.generatedAt') }}：{{ generatedAt }}</span>
            <span>{{ $t('lenormand.report.spreadLabel') }}：{{ result.spread_name }}</span>
          </div>
        </div>

        <h1 class="lr-title">{{ $t('lenormand.report.title') }}</h1>
        <p class="lr-subtitle">{{ subtitleText }}</p>
        <p class="lr-meta-line">{{ metaLine }}</p>
      </header>

      <!-- ============ 牌阵统计小卡 ============ -->
      <section class="lr-section">
        <div class="lr-quad">
          <div class="lr-card lr-mini lr-mini-accent">
            <div class="lr-mini-label">{{ $t('lenormand.report.cardCountCard') }}</div>
            <div class="lr-mini-value">{{ result.cards.length }}<span class="lr-mini-unit">{{ $t('lenormand.report.cardUnit') }}</span></div>
            <div class="lr-mini-sub">{{ result.spread_name }}</div>
          </div>
          <div class="lr-card lr-mini">
            <div class="lr-mini-label">{{ $t('lenormand.report.personCard') }}</div>
            <div class="lr-mini-value">{{ personCardText }}</div>
            <div class="lr-mini-sub">{{ $t('lenormand.report.personSub') }}</div>
          </div>
          <div class="lr-card lr-mini">
            <div class="lr-mini-label">{{ $t('lenormand.report.polarityCard') }}</div>
            <div class="lr-mini-value">{{ polarityCounts.positive }} / {{ polarityCounts.neutral }} / {{ polarityCounts.negative }}</div>
            <div class="lr-mini-sub">{{ $t('lenormand.report.polaritySub') }}</div>
          </div>
          <div class="lr-card lr-mini">
            <div class="lr-mini-label">{{ $t('lenormand.report.dominantCard') }}</div>
            <div class="lr-mini-value">{{ dominantSuit.text }}</div>
            <div class="lr-mini-sub">{{ dominantSuit.name }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 花色分布 ============ -->
      <section class="lr-section">
        <div class="lr-card">
          <h3 class="lr-card-title">{{ $t('lenormand.report.suitTitle') }}</h3>
          <div class="lr-suits">
            <div v-for="s in suitList" :key="s.key" class="lr-suit-row">
              <span class="lr-suit-sym" :style="{ color: s.color }">{{ s.symbol }}</span>
              <span class="lr-suit-name">{{ s.name }}</span>
              <span class="lr-suit-bar-wrap">
                <span class="lr-suit-bar" :style="{ width: s.pct + '%', background: s.color }" />
              </span>
              <span class="lr-suit-num">{{ s.count }}{{ $t('lenormand.report.cardUnit') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 抽牌结果表 ============ -->
      <section class="lr-section">
        <div class="lr-card">
          <h3 class="lr-card-title">{{ $t('lenormand.report.cardsTitle') }}</h3>
          <div class="lr-table-wrap">
            <table class="lr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ $t('lenormand.report.colPosition') }}</th>
                  <th>{{ $t('lenormand.report.colCard') }}</th>
                  <th>{{ $t('lenormand.report.colNo') }}</th>
                  <th>{{ $t('lenormand.report.colKeyword') }}</th>
                  <th>{{ $t('lenormand.report.colSuit') }}</th>
                  <th>{{ $t('lenormand.report.colPerson') }}</th>
                  <th>{{ $t('lenormand.report.colPolarity') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(card, i) in result.cards" :key="i" :class="{ 'lr-tr-person': isPersonCard(card) }">
                  <td class="lr-td-no">{{ i + 1 }}</td>
                  <td class="lr-td-pos">{{ card.position }}</td>
                  <td class="lr-td-card">{{ card.name }}</td>
                  <td class="lr-td-no">{{ card.id }}</td>
                  <td>{{ card.keyword }}</td>
                  <td><span class="lr-suit-cell" :style="{ color: suitColor(card.suit) }">{{ suitText(card.suit) }}</span></td>
                  <td>
                    <span v-if="isPersonCard(card)" class="lr-person-tag">
                      {{ card.id === 28 ? $t('lenormand.report.personMale') : $t('lenormand.report.personFemale') }}
                    </span>
                    <span v-else>—</span>
                  </td>
                  <td>
                    <span class="lr-polarity" :class="'lr-polarity-' + card.polarity">
                      {{ polarityText(card.polarity) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="lr-section">
        <div class="lr-ai-grid">
          <div v-for="(s, i) in aiSections" :key="i" class="lr-card lr-ai">
            <h3 class="lr-ai-title">
              <span class="lr-ai-no">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.title }}
            </h3>
            <div class="lr-ai-body lr-md" v-html="s.html" />
          </div>
        </div>

        <!-- 流式中提示 -->
        <div v-if="streaming" class="lr-streaming">
          <span class="lr-streaming-dot" />
          {{ $t('lenormand.report.streamingHint') }}
        </div>

        <!-- AI 错误 -->
        <div v-if="error" class="lr-error">
          <p>{{ error }}</p>
          <button type="button" class="lr-retry" @click="$emit('retry')">{{ $t('lenormand.report.retry') }}</button>
        </div>
      </section>

      <!-- ============ 页脚 ============ -->
      <footer class="lr-foot">
        <span class="lr-foot-note">ⓘ {{ $t('lenormand.disclaimer') }}</span>
        <span class="lr-seal lr-seal-foot">{{ $t('lenormand.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface LenormandCard {
  position: string
  id: number
  name: string
  nameEn: string
  keyword: string
  suit: string
  polarity: string
}

interface LenormandDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  birthYear: number | null
  cards: LenormandCard[]
}

interface Props {
  result: LenormandDrawResult
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

const questionText = computed(() => props.result.question || t('lenormand.noQuestion'))

const subtitleText = computed(() =>
  t('lenormand.report.subtitle', { spread: props.result.spread_name, question: questionText.value }))

const genderText = computed(() => {
  if (props.result.gender === 'male') return t('lenormand.male')
  if (props.result.gender === 'female') return t('lenormand.female')
  return t('lenormand.report.genderUnspecified')
})

const birthYearText = computed(() =>
  props.result.birthYear
    ? t('lenormand.report.birthYearValue', { year: props.result.birthYear })
    : t('lenormand.report.birthYearUnknown'))

const metaLine = computed(() =>
  `${t('lenormand.report.genderLabel')} ${genderText.value} · ${t('lenormand.report.birthYearLabel')} ${birthYearText.value} · Seed ${props.result.seed}`)

const isPersonCard = (card: LenormandCard) => card.id === 28 || card.id === 29

const personCardText = computed(() => {
  const man = props.result.cards.find(c => c.id === 28)
  const woman = props.result.cards.find(c => c.id === 29)
  const parts: string[] = []
  if (man) parts.push(t('lenormand.report.personMale'))
  if (woman) parts.push(t('lenormand.report.personFemale'))
  return parts.length ? parts.join(' / ') : t('lenormand.report.personNone')
})

const polarityCounts = computed(() => {
  const counts = { positive: 0, neutral: 0, negative: 0 }
  for (const c of props.result.cards) {
    if (c.polarity === 'negative') counts.negative++
    else if (c.polarity === 'neutral') counts.neutral++
    else counts.positive++
  }
  return counts
})

/* ---------- 花色 ---------- */

interface SuitDef { key: string; symbol: string; color: string }

const SUIT_DEFS: Record<string, SuitDef> = {
  heart: { key: 'heart', symbol: '♥', color: '#8c2f26' },
  diamond: { key: 'diamond', symbol: '♦', color: '#a8512e' },
  club: { key: 'club', symbol: '♣', color: '#4a7c59' },
  spade: { key: 'spade', symbol: '♠', color: '#4a5568' },
}

const SUIT_ORDER = ['heart', 'diamond', 'club', 'spade']

const suitName = (key: string) => t(`lenormand.report.suit${key.charAt(0).toUpperCase()}${key.slice(1)}`)

const suitList = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of props.result.cards) {
    counts[c.suit] = (counts[c.suit] || 0) + 1
  }
  const present = SUIT_ORDER.filter(k => counts[k])
  const max = Math.max(1, ...present.map(k => counts[k]!))
  return present.map(k => ({
    key: k,
    symbol: SUIT_DEFS[k]!.symbol,
    color: SUIT_DEFS[k]!.color,
    name: suitName(k),
    count: counts[k]!,
    pct: Math.round((counts[k]! / max) * 100),
  }))
})

const dominantSuit = computed(() => {
  const top = suitList.value[0]
  if (!top) return { text: '—', name: '' }
  return { text: top.symbol, name: top.name }
})

const suitColor = (key: string) => SUIT_DEFS[key]?.color ?? '#8a8272'
const suitText = (key: string) => {
  const def = SUIT_DEFS[key]
  return def ? `${def.symbol} ${suitName(key)}` : '—'
}

const polarityText = (polarity: string) => {
  if (polarity === 'negative') return t('lenormand.report.polarityNegative')
  if (polarity === 'neutral') return t('lenormand.report.polarityNeutral')
  return t('lenormand.report.polarityPositive')
}

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('lenormand.report.pending'))

const aiSections = computed<{ title: string; html: string }[]>(() => {
  const text = props.analysis || ''
  const out: { title: string; html: string }[] = []
  if (text) {
    const parts = text.split(/(?=^## )/m).filter(p => p.trim())
    for (const part of parts) {
      const title = part.match(/^## (.+)/)?.[1]?.trim() ?? t('lenormand.report.untitledSection')
      const body = part.replace(/^## .+\n?/, '').trim()
      if (body) out.push({ title, html: marked.parse(body, { async: false }) as string })
    }
  }
  // 流式尚未产出章节时，先展示占位卡
  if (!out.length) {
    out.push({ title: t('lenormand.report.untitledSection'), html: `<p class="lr-pending">${pendingText.value}</p>` })
  }
  return out
})
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bazi-ziwei 报告色系） ========== */
.lr {
  --lr-bg: #f2ede3;
  --lr-sheet: #faf6ec;
  --lr-card: #fffdf6;
  --lr-ink: #2e2a24;
  --lr-ink-soft: #55503f;
  --lr-ink-faint: #8a8272;
  --lr-line: #d8d0bd;
  --lr-line-soft: #e6dfcd;
  --lr-accent: #8c2f26;
  --lr-accent-soft: #a8512e;
  --lr-star: #8c6d1f;
  --lr-green: #4a7c59;
  border-radius: 12px;
  background: var(--lr-bg);
  padding: 18px;
  color: var(--lr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.lr-sheet {
  background: var(--lr-sheet);
  border: 1px solid var(--lr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.lr-head { border-bottom: 2px solid var(--lr-ink); padding-bottom: 16px; }
.lr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.lr-brand { display: flex; align-items: center; gap: 8px; }
.lr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--lr-accent);
  color: var(--lr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.lr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--lr-ink-soft); }
.lr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--lr-ink-faint); }

.lr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.lr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--lr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 8px;
}
.lr-meta-line { text-align: center; margin: 0; font-size: 11px; color: var(--lr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/区块 ---------- */
.lr-section { margin-top: 16px; }
.lr-card {
  background: var(--lr-card);
  border: 1px solid var(--lr-line);
  padding: 14px 16px;
  min-width: 0;
}
.lr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--lr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 统计小卡 ---------- */
.lr-quad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.lr-mini { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.lr-mini-accent { border: 1.5px solid var(--lr-accent); background: rgba(140, 47, 38, 0.04); }
.lr-mini-label { font-size: 11px; color: var(--lr-ink-faint); letter-spacing: 1px; }
.lr-mini-value { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
.lr-mini-unit { font-size: 11px; font-weight: 400; color: var(--lr-ink-faint); margin-left: 3px; }
.lr-mini-sub { font-size: 10.5px; color: var(--lr-ink-faint); line-height: 1.5; }

/* ---------- 花色分布条形 ---------- */
.lr-suits { display: flex; flex-direction: column; gap: 6px; }
.lr-suit-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.lr-suit-sym { width: 16px; font-size: 13px; font-weight: 700; text-align: center; }
.lr-suit-name { width: 48px; font-weight: 700; color: var(--lr-ink-soft); }
.lr-suit-bar-wrap { flex: 1; height: 8px; background: var(--lr-line-soft); }
.lr-suit-bar { display: block; height: 100%; }
.lr-suit-num { width: 34px; text-align: right; color: var(--lr-ink-faint); }

/* ---------- 抽牌结果表 ---------- */
.lr-table-wrap { overflow-x: auto; }
.lr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.lr-table th, .lr-table td {
  border: 1px solid var(--lr-line);
  padding: 5px 8px;
  text-align: left;
  line-height: 1.5;
}
.lr-table thead th {
  background: var(--lr-line-soft);
  font-weight: 700;
  color: var(--lr-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.lr-table td { color: var(--lr-ink-soft); }
.lr-td-no { color: var(--lr-ink-faint); }
.lr-td-pos { font-weight: 700; color: var(--lr-ink); white-space: nowrap; }
.lr-td-card { font-weight: 700; color: var(--lr-ink); white-space: nowrap; }
.lr-tr-person { background: rgba(140, 109, 31, 0.05); }
.lr-suit-cell { white-space: nowrap; font-weight: 700; }
.lr-person-tag {
  white-space: nowrap;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--lr-star);
  border: 1px solid var(--lr-star);
  padding: 1px 6px;
}
.lr-polarity { white-space: nowrap; font-size: 10.5px; font-weight: 700; }
.lr-polarity-positive { color: var(--lr-green); }
.lr-polarity-neutral { color: var(--lr-ink-faint); }
.lr-polarity-negative { color: var(--lr-accent); }

/* ---------- AI 章节 ---------- */
.lr-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.lr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--lr-line-soft);
  padding-bottom: 8px;
}
.lr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--lr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.lr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--lr-ink-soft); }

.lr-md :deep(p) { margin: 0 0 0.7em; }
.lr-md :deep(p:last-child) { margin-bottom: 0; }
.lr-md :deep(strong) { color: var(--lr-ink); font-weight: 700; }
.lr-md :deep(ul), .lr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.lr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.lr-md :deep(h3), .lr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--lr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.lr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.lr-md :deep(th), .lr-md :deep(td) { border: 1px solid var(--lr-line); padding: 4px 6px; text-align: left; }
.lr-md :deep(th) { background: var(--lr-line-soft); font-weight: 700; color: var(--lr-ink); }
.lr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--lr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.lr-md :deep(.lr-pending), .lr-pending { color: var(--lr-ink-faint); font-style: italic; }

.lr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--lr-ink-faint); letter-spacing: 1px;
}
.lr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--lr-accent);
  animation: lr-pulse 1s ease-in-out infinite;
}
@keyframes lr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.lr-error { margin-top: 14px; text-align: center; color: var(--lr-accent); font-size: 12px; }
.lr-retry {
  margin-top: 8px;
  border: 1px solid var(--lr-accent);
  background: transparent;
  color: var(--lr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.lr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.lr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--lr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.lr-foot-note { font-size: 10px; color: var(--lr-ink-faint); max-width: 80%; }
.lr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .lr-quad { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .lr { padding: 8px; }
  .lr-sheet { padding: 16px 12px; }
  .lr-title { font-size: 22px; letter-spacing: 2px; }
  .lr-ai-grid { grid-template-columns: 1fr; }
  .lr-quad { grid-template-columns: 1fr 1fr; }
  .lr-mini-value { font-size: 18px; }
  .lr-table { min-width: 560px; }
  .lr-foot-note { max-width: 100%; }
}
</style>
