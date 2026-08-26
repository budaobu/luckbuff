<template>
  <div class="tzp">
    <div class="tzp-sheet">
      <!-- ============ 顶部：品牌横条 ============ -->
      <div class="tzp-topbar">
        <span class="tzp-brand">{{ $t('ticheZeri.poster.brand') }}</span>
        <span class="tzp-serial">{{ $t('ticheZeri.poster.serial') }}</span>
      </div>

      <!-- ============ 头部：窗口与车主信息 ============ -->
      <header class="tzp-head">
        <p class="tzp-kicker">{{ $t('ticheZeri.poster.kicker') }}</p>
        <p class="tzp-window">{{ windowText }}</p>
        <div class="tzp-owner">
          <span class="tzp-tag">{{ $t('ticheZeri.poster.ownerLabel') }} · {{ owner.shengXiao }}</span>
          <span class="tzp-tag">{{ $t('ticheZeri.poster.dayMasterLabel') }} · {{ owner.dayMasterWuxing }}</span>
          <span class="tzp-tag">{{ $t('ticheZeri.poster.xiyongLabel') }} · {{ owner.xiyong }}</span>
        </div>

        <!-- AI 概述融入头部副标语 -->
        <p class="tzp-overview" :class="{ 'tzp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('ticheZeri.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 最优推荐吉日：hero 区 ============ -->
      <section class="tzp-best">
        <div class="tzp-best-flag">{{ $t('ticheZeri.poster.bestFlag') }}</div>
        <div class="tzp-best-main">
          <div class="tzp-best-date">
            <span class="tzp-best-md">{{ bestMd }}</span>
            <span class="tzp-best-week">{{ bestWeek }}</span>
          </div>
          <div class="tzp-best-day">
            <span class="tzp-best-ganzhi">{{ best.dayGanZhi }}</span>
            <span class="tzp-best-jianchu">{{ best.jianChu }}{{ $t('ticheZeri.poster.jianChuUnit') }}</span>
          </div>
          <div class="tzp-best-seal">{{ $t('ticheZeri.poster.seal') }}</div>
        </div>
        <div class="tzp-best-meta">
          <span>{{ best.lunarDate }}</span>
          <span>{{ best.tianShenLuck }}{{ best.tianShen }}</span>
          <span class="tzp-best-score">{{ $t('ticheZeri.poster.scoreLabel') }} {{ best.dayScore }}</span>
        </div>
        <p class="tzp-best-ai" :class="{ 'tzp-best-ai-pending': !aiParsed.best }">
          {{ aiParsed.best || $t('ticheZeri.poster.bestPending') }}
        </p>
      </section>

      <!-- ============ 候选吉日榜单 ============ -->
      <section class="tzp-rank">
        <div class="tzp-rank-head">
          <span class="tzp-rank-title">{{ $t('ticheZeri.poster.listTitle') }}</span>
          <span class="tzp-rank-count">{{ $t('ticheZeri.poster.listCount', { n: totalCount }) }}</span>
        </div>
        <ul class="tzp-rank-list">
          <li
            v-for="item in topList"
            :key="item.rank"
            class="tzp-rank-row"
            :class="{ 'tzp-rank-row-best': item.rank === 1 }"
          >
            <span class="tzp-rank-no" :class="{ 'tzp-rank-no-best': item.rank === 1 }">{{ item.rank }}</span>
            <div class="tzp-rank-when">
              <span class="tzp-rank-date">{{ shortDate(item.date) }} {{ rankWeek(item) }}</span>
              <span class="tzp-rank-ganzhi">{{ item.dayGanZhi }}{{ $t('ticheZeri.poster.dayUnit') }}</span>
            </div>
            <div class="tzp-rank-info">
              <span class="tzp-rank-jianchu">{{ item.jianChu }}{{ $t('ticheZeri.poster.jianChuUnit') }}</span>
              <span class="tzp-rank-tianshen" :class="item.tianShenLuck === '吉' ? 'tzp-ts-ji' : 'tzp-ts-xiong'">
                {{ item.tianShen }}
              </span>
            </div>
            <span class="tzp-rank-score">{{ item.dayScore }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ AI 锦囊 ============ -->
      <section v-if="aiParsed.tips.length" class="tzp-tips">
        <span class="tzp-tips-flag">{{ $t('ticheZeri.poster.tipLabel') }}</span>
        <ul class="tzp-tips-grid">
          <li v-for="(tip, i) in aiParsed.tips" :key="i" class="tzp-tips-cell">
            <span class="tzp-tips-dot" aria-hidden="true" />
            <span class="tzp-tips-item">{{ tip }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 提示与免责 ============ -->
      <section class="tzp-note">
        <p v-if="aiParsed.note" class="tzp-note-ai">{{ aiParsed.note }}</p>
        <p class="tzp-note-static">{{ $t('ticheZeri.poster.staticNote') }}</p>
      </section>

      <!-- ============ 底部：落款 ============ -->
      <footer class="tzp-foot">
        <div class="tzp-foot-brand">
          <div class="tzp-seal-stamp">{{ $t('ticheZeri.poster.sealStamp') }}</div>
          <div class="tzp-foot-meta">
            <span class="tzp-foot-site">{{ siteDomain }}</span>
            <span class="tzp-foot-note">{{ $t('ticheZeri.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="tzp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="tzp-qr-img" v-html="qrSvg" />
          <span v-else class="tzp-qr-inner">{{ $t('ticheZeri.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RankedDay {
  rank: number
  date: string
  lunarDate: string
  dayGanZhi: string
  week: string
  jianChu: string
  tianShen: string
  tianShenLuck: string
  dayScore: number
  tags: string[]
}

interface OwnerInfo {
  shengXiao: string
  dayMasterWuxing: string
  xiyong: string
}

interface Props {
  startDate: string
  endDate: string
  owner: OwnerInfo
  best: RankedDay
  topList: RankedDay[]
  totalCount: number
  /** AI 解读全文（OV:/BEST:/TIP:/NOTE: 行协议）。流式追加，海报实时融合。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/tiche-zeri`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- 头部与 hero 派生 ---------- */

function fmtMd(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  if (locale.value === 'en') {
    return new Date(y!, (m || 1) - 1, d || 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return t('ticheZeri.poster.mdFmt', { m, d })
}

const windowText = computed(() => `${fmtMd(props.startDate)} – ${fmtMd(props.endDate)}`)

const bestMd = computed(() => fmtMd(props.best.date))

const bestWeek = computed(() => {
  if (locale.value === 'en') {
    const [y, m, d] = props.best.date.split('-').map(Number)
    return new Date(y!, (m || 1) - 1, d || 1).toLocaleDateString('en-US', { weekday: 'short' })
  }
  return `${t('ticheZeri.poster.weekPrefix')}${props.best.week}`
})

function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m}/${d}`
}

function rankWeek(item: RankedDay): string {
  if (locale.value !== 'en') return item.week
  const [y, m, d] = item.date.split('-').map(Number)
  return new Date(y!, (m || 1) - 1, d || 1).toLocaleDateString('en-US', { weekday: 'short' })
}

/* ---------- AI 解读解析：拆行协议，映射进海报 ---------- */

interface AiParsed {
  overview: string
  best: string
  tips: string[]
  note: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', best: '', tips: [], note: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').trim()

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('OV:') || line.startsWith('OV：')) {
      if (!out.overview) out.overview = truncate(clean(line.slice(3)), 72)
      continue
    }
    if (line.startsWith('BEST:') || line.startsWith('BEST：')) {
      if (!out.best) out.best = truncate(clean(line.slice(5)), 80)
      continue
    }
    if (line.startsWith('TIP:') || line.startsWith('TIP：')) {
      const tip = truncate(clean(line.slice(4)), 56)
      if (tip && out.tips.length < 3) out.tips.push(tip)
      continue
    }
    if (line.startsWith('NOTE:') || line.startsWith('NOTE：')) {
      if (!out.note) out.note = truncate(clean(line.slice(5)), 56)
      continue
    }
  }

  return out
})
</script>

<style scoped>
/* ========== 纸质择日海报（与 PoufuchanZeriPoster 同源纸质配色，竖版比例） ========== */
.tzp {
  --tzp-bg: #efe9db;
  --tzp-sheet: #faf5e9;
  --tzp-ink: #2e2a24;
  --tzp-ink-soft: #55503f;
  --tzp-ink-faint: #8a8272;
  --tzp-line: #d8d0bd;
  --tzp-line-soft: #e6dfcd;
  --tzp-accent: #8c2f26;
  --tzp-accent-deep: #6e231c;
  --tzp-green: #4a7c59;
  --tzp-green-deep: #3a6449;
  background: var(--tzp-bg);
  padding: 14px;
  color: var(--tzp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.tzp-sheet {
  background: var(--tzp-sheet);
  border: 1px solid var(--tzp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
}

/* ---------- 顶部品牌横条 ---------- */
.tzp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--tzp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--tzp-ink-faint);
}
.tzp-brand { font-weight: 700; color: var(--tzp-ink-soft); }
.tzp-serial { letter-spacing: 1px; }

/* ---------- 头部 ---------- */
.tzp-head {
  text-align: center;
  padding: 14px 0 12px;
  border-bottom: 2px solid var(--tzp-ink);
}
.tzp-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--tzp-accent);
  font-weight: 700;
}
.tzp-window {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--tzp-ink);
}
.tzp-owner {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.tzp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--tzp-ink-soft);
  border: 1px solid var(--tzp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}
.tzp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--tzp-ink-soft);
}
.tzp-overview-pending { color: var(--tzp-ink-faint); font-style: italic; }

/* ---------- 最优推荐 hero ---------- */
.tzp-best {
  margin-top: 14px;
  border: 1.5px solid var(--tzp-accent);
  border-radius: 8px;
  background: rgba(140, 47, 38, 0.05);
  padding: 12px 14px 12px;
  position: relative;
}
.tzp-best-flag {
  position: absolute;
  top: -10px;
  left: 14px;
  background: var(--tzp-accent);
  color: #f5efe0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 2px 10px;
  border-radius: 4px;
}
.tzp-best-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
}
.tzp-best-date { display: flex; flex-direction: column; align-items: flex-start; }
.tzp-best-md { font-size: 34px; font-weight: 700; line-height: 1.05; color: var(--tzp-ink); letter-spacing: 1px; }
.tzp-best-week { font-size: 11px; color: var(--tzp-ink-faint); letter-spacing: 2px; margin-top: 4px; }
.tzp-best-day { display: flex; flex-direction: column; align-items: center; flex: 1; }
.tzp-best-ganzhi { font-size: 40px; font-weight: 700; line-height: 1; color: var(--tzp-accent-deep); letter-spacing: 3px; }
.tzp-best-jianchu { font-size: 11px; color: var(--tzp-ink-soft); letter-spacing: 1px; margin-top: 4px; }
.tzp-best-seal {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 2.5px solid var(--tzp-accent);
  color: var(--tzp-accent);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.15;
  border-radius: 6px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.tzp-best-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--tzp-line);
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--tzp-ink-soft);
}
.tzp-best-score { font-weight: 700; color: var(--tzp-accent-deep); }
.tzp-best-ai {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--tzp-ink);
  text-align: center;
  letter-spacing: 0.3px;
}
.tzp-best-ai-pending { color: var(--tzp-ink-faint); font-style: italic; }

/* ---------- 候选榜单 ---------- */
.tzp-rank { padding: 14px 0 4px; }
.tzp-rank-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  padding: 0 2px;
}
.tzp-rank-title { font-size: 14px; font-weight: 700; letter-spacing: 3px; color: var(--tzp-ink); }
.tzp-rank-count { font-size: 11px; letter-spacing: 1px; color: var(--tzp-ink-faint); }
.tzp-rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--tzp-line);
}
.tzp-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 4px;
  border-bottom: 1px solid var(--tzp-line-soft);
}
.tzp-rank-row-best {
  background: rgba(140, 47, 38, 0.06);
  border-bottom: 1px solid var(--tzp-accent);
}
.tzp-rank-no {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--tzp-line);
  color: var(--tzp-ink-faint);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tzp-rank-no-best {
  background: var(--tzp-accent);
  border-color: var(--tzp-accent-deep);
  color: #f5efe0;
  font-weight: 700;
}
.tzp-rank-when { display: flex; flex-direction: column; min-width: 86px; flex-shrink: 0; }
.tzp-rank-date { font-size: 13px; font-weight: 700; color: var(--tzp-ink); letter-spacing: 0.5px; }
.tzp-rank-ganzhi { font-size: 10px; color: var(--tzp-ink-faint); letter-spacing: 0.5px; margin-top: 1px; }
.tzp-rank-info { flex: 1; display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.tzp-rank-jianchu { font-size: 14px; font-weight: 700; color: var(--tzp-ink); letter-spacing: 1px; }
.tzp-rank-tianshen { font-size: 10.5px; letter-spacing: 1px; }
.tzp-ts-ji { color: var(--tzp-green-deep); }
.tzp-ts-xiong { color: var(--tzp-accent); }
.tzp-rank-score {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--tzp-ink-soft);
  min-width: 24px;
  text-align: right;
}
.tzp-rank-row-best .tzp-rank-score { color: var(--tzp-accent-deep); }

/* ---------- AI 锦囊 ---------- */
.tzp-tips {
  margin: 12px 0 0;
  border-top: 1px solid var(--tzp-line);
  border-bottom: 1px solid var(--tzp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.tzp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--tzp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.tzp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tzp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--tzp-line-soft);
  border-left: 2px solid var(--tzp-green);
  border-radius: 4px;
  padding: 5px 8px;
  min-width: 0;
}
.tzp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--tzp-green);
  margin-top: 6px;
}
.tzp-tips-item {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--tzp-ink-soft);
  word-break: break-word;
}

/* ---------- 提示与免责 ---------- */
.tzp-note { padding: 10px 2px 0; text-align: center; }
.tzp-note-ai { margin: 0 0 6px; font-size: 11.5px; line-height: 1.6; color: var(--tzp-ink-soft); }
.tzp-note-static { margin: 0; font-size: 10px; line-height: 1.6; color: var(--tzp-ink-faint); letter-spacing: 0.3px; }

/* ---------- 底部落款 ---------- */
.tzp-foot {
  margin-top: 14px;
  border-top: 1px solid var(--tzp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.tzp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tzp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--tzp-accent);
  color: var(--tzp-accent);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  flex-shrink: 0;
}
.tzp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.tzp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--tzp-ink); }
.tzp-foot-note { font-size: 9.5px; color: var(--tzp-ink-faint); letter-spacing: 0.5px; }
.tzp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tzp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.tzp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.tzp-qr-inner {
  font-size: 8px;
  color: var(--tzp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--tzp-line);
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

/* ---------- 移动端微调 ---------- */
@media (max-width: 400px) {
  .tzp { padding: 8px; }
  .tzp-sheet { padding: 16px 12px 12px; }
  .tzp-best-main { flex-wrap: wrap; }
  .tzp-best-day { flex-basis: 100%; order: 3; margin-top: 8px; }
  .tzp-best-md { font-size: 28px; }
  .tzp-best-ganzhi { font-size: 32px; white-space: nowrap; }
  .tzp-rank-when { min-width: 74px; }
}
</style>
