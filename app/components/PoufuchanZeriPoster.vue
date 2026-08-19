<template>
  <div class="pzp">
    <div class="pzp-sheet">
      <!-- ============ 顶部：品牌横条 ============ -->
      <div class="pzp-topbar">
        <span class="pzp-brand">{{ $t('poufuchanZeri.poster.brand') }}</span>
        <span class="pzp-serial">{{ $t('poufuchanZeri.poster.serial') }}</span>
      </div>

      <!-- ============ 头部：窗口与父母信息 ============ -->
      <header class="pzp-head">
        <p class="pzp-kicker">{{ $t('poufuchanZeri.poster.kicker') }}</p>
        <p class="pzp-window">{{ windowText }}</p>
        <div class="pzp-parents">
          <span class="pzp-tag">{{ $t('poufuchanZeri.poster.motherLabel') }} · {{ mother.shengXiao }}</span>
          <span class="pzp-tag">{{ $t('poufuchanZeri.poster.fatherLabel') }} · {{ father.shengXiao }}</span>
        </div>

        <!-- AI 概述融入头部副标语 -->
        <p class="pzp-overview" :class="{ 'pzp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('poufuchanZeri.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 最优推荐时刻：hero 区 ============ -->
      <section class="pzp-best">
        <div class="pzp-best-flag">{{ $t('poufuchanZeri.poster.bestFlag') }}</div>
        <div class="pzp-best-main">
          <div class="pzp-best-date">
            <span class="pzp-best-md">{{ bestMd }}</span>
            <span class="pzp-best-week">{{ bestWeek }}</span>
          </div>
          <div class="pzp-best-hour">
            <span class="pzp-best-dizhi">{{ best.dizhi }}{{ $t('poufuchanZeri.poster.hourUnit') }}</span>
            <span class="pzp-best-range">{{ best.timeRange }}</span>
          </div>
          <div class="pzp-best-seal">{{ $t('poufuchanZeri.poster.seal') }}</div>
        </div>
        <div class="pzp-best-meta">
          <span>{{ best.dayGanZhi }}{{ $t('poufuchanZeri.poster.dayUnit') }} · {{ best.hourGanZhi }}{{ $t('poufuchanZeri.poster.hourUnit') }}</span>
          <span>{{ best.tianShenType }}{{ best.tianShen }}</span>
          <span class="pzp-best-score">{{ $t('poufuchanZeri.poster.scoreLabel') }} {{ best.totalScore }}</span>
        </div>
        <p class="pzp-best-ai" :class="{ 'pzp-best-ai-pending': !aiParsed.best }">
          {{ aiParsed.best || $t('poufuchanZeri.poster.bestPending') }}
        </p>
      </section>

      <!-- ============ 候选时辰榜单 ============ -->
      <section class="pzp-rank">
        <div class="pzp-rank-head">
          <span class="pzp-rank-title">{{ $t('poufuchanZeri.poster.listTitle') }}</span>
          <span class="pzp-rank-count">{{ $t('poufuchanZeri.poster.listCount', { n: totalCount }) }}</span>
        </div>
        <ul class="pzp-rank-list">
          <li
            v-for="item in topList"
            :key="item.rank"
            class="pzp-rank-row"
            :class="{ 'pzp-rank-row-best': item.rank === 1 }"
          >
            <span class="pzp-rank-no" :class="{ 'pzp-rank-no-best': item.rank === 1 }">{{ item.rank }}</span>
            <div class="pzp-rank-when">
              <span class="pzp-rank-date">{{ shortDate(item.date) }} {{ item.week }}</span>
              <span class="pzp-rank-ganzhi">{{ item.dayGanZhi }}{{ $t('poufuchanZeri.poster.dayUnit') }}</span>
            </div>
            <div class="pzp-rank-hour">
              <span class="pzp-rank-dizhi">{{ item.dizhi }}{{ $t('poufuchanZeri.poster.hourUnit') }}</span>
              <span class="pzp-rank-tianshen" :class="item.tianShenType === '黄道' ? 'pzp-ts-ji' : 'pzp-ts-xiong'">
                {{ item.tianShen }}
              </span>
            </div>
            <span class="pzp-rank-score">{{ item.totalScore }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ AI 锦囊 ============ -->
      <section v-if="aiParsed.tips.length" class="pzp-tips">
        <span class="pzp-tips-flag">{{ $t('poufuchanZeri.poster.tipLabel') }}</span>
        <ul class="pzp-tips-grid">
          <li v-for="(tip, i) in aiParsed.tips" :key="i" class="pzp-tips-cell">
            <span class="pzp-tips-dot" aria-hidden="true" />
            <span class="pzp-tips-item">{{ tip }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 提示与免责 ============ -->
      <section class="pzp-note">
        <p v-if="aiParsed.note" class="pzp-note-ai">{{ aiParsed.note }}</p>
        <p class="pzp-note-medical">{{ $t('poufuchanZeri.poster.medicalNote') }}</p>
      </section>

      <!-- ============ 底部：落款 ============ -->
      <footer class="pzp-foot">
        <div class="pzp-foot-brand">
          <div class="pzp-seal-stamp">{{ $t('poufuchanZeri.poster.sealStamp') }}</div>
          <div class="pzp-foot-meta">
            <span class="pzp-foot-site">{{ siteDomain }}</span>
            <span class="pzp-foot-note">{{ $t('poufuchanZeri.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="pzp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="pzp-qr-img" v-html="qrSvg" />
          <span v-else class="pzp-qr-inner">{{ $t('poufuchanZeri.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'

interface RankedCandidate {
  rank: number
  date: string
  lunarDate: string
  dayGanZhi: string
  week: string
  dizhi: DiZhi
  timeRange: string
  hourGanZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  dayScore: number
  hourScore: number
  totalScore: number
  tags: string[]
}

interface PersonInfo {
  birthDate: string
  shengXiao: string
}

interface Props {
  startDate: string
  endDate: string
  mother: PersonInfo
  father: PersonInfo
  best: RankedCandidate
  topList: RankedCandidate[]
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
  const url = `${window.location.origin}/tools/poufuchan-zeri`
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
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return t('poufuchanZeri.poster.mdFmt', { m, d })
}

const windowText = computed(() => `${fmtMd(props.startDate)} – ${fmtMd(props.endDate)}`)

const bestMd = computed(() => fmtMd(props.best.date))

const bestWeek = computed(() => {
  if (locale.value === 'en') {
    const [y, m, d] = props.best.date.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-US', { weekday: 'short' })
  }
  return `${t('poufuchanZeri.poster.weekPrefix')}${props.best.week}`
})

function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m}/${d}`
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
/* ========== 纸质择日海报（与 JishiCalendarPoster 同源纸质配色，竖版比例） ========== */
.pzp {
  --pzp-bg: #efe9db;
  --pzp-sheet: #faf5e9;
  --pzp-ink: #2e2a24;
  --pzp-ink-soft: #55503f;
  --pzp-ink-faint: #8a8272;
  --pzp-line: #d8d0bd;
  --pzp-line-soft: #e6dfcd;
  --pzp-accent: #8c2f26;
  --pzp-accent-deep: #6e231c;
  --pzp-green: #4a7c59;
  --pzp-green-deep: #3a6449;
  background: var(--pzp-bg);
  padding: 14px;
  color: var(--pzp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.pzp-sheet {
  background: var(--pzp-sheet);
  border: 1px solid var(--pzp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
}

/* ---------- 顶部品牌横条 ---------- */
.pzp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--pzp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--pzp-ink-faint);
}
.pzp-brand { font-weight: 700; color: var(--pzp-ink-soft); }
.pzp-serial { letter-spacing: 1px; }

/* ---------- 头部 ---------- */
.pzp-head {
  text-align: center;
  padding: 14px 0 12px;
  border-bottom: 2px solid var(--pzp-ink);
}
.pzp-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--pzp-accent);
  font-weight: 700;
}
.pzp-window {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--pzp-ink);
}
.pzp-parents {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.pzp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--pzp-ink-soft);
  border: 1px solid var(--pzp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}
.pzp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--pzp-ink-soft);
}
.pzp-overview-pending { color: var(--pzp-ink-faint); font-style: italic; }

/* ---------- 最优推荐 hero ---------- */
.pzp-best {
  margin-top: 14px;
  border: 1.5px solid var(--pzp-accent);
  border-radius: 8px;
  background: rgba(140, 47, 38, 0.05);
  padding: 12px 14px 12px;
  position: relative;
}
.pzp-best-flag {
  position: absolute;
  top: -10px;
  left: 14px;
  background: var(--pzp-accent);
  color: #f5efe0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 2px 10px;
  border-radius: 4px;
}
.pzp-best-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
}
.pzp-best-date { display: flex; flex-direction: column; align-items: flex-start; }
.pzp-best-md { font-size: 34px; font-weight: 700; line-height: 1.05; color: var(--pzp-ink); letter-spacing: 1px; }
.pzp-best-week { font-size: 11px; color: var(--pzp-ink-faint); letter-spacing: 2px; margin-top: 4px; }
.pzp-best-hour { display: flex; flex-direction: column; align-items: center; flex: 1; }
.pzp-best-dizhi { font-size: 44px; font-weight: 700; line-height: 1; color: var(--pzp-accent-deep); letter-spacing: 2px; }
.pzp-best-range { font-size: 11px; color: var(--pzp-ink-soft); letter-spacing: 1px; margin-top: 4px; }
.pzp-best-seal {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 2.5px solid var(--pzp-accent);
  color: var(--pzp-accent);
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
.pzp-best-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--pzp-line);
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--pzp-ink-soft);
}
.pzp-best-score { font-weight: 700; color: var(--pzp-accent-deep); }
.pzp-best-ai {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--pzp-ink);
  text-align: center;
  letter-spacing: 0.3px;
}
.pzp-best-ai-pending { color: var(--pzp-ink-faint); font-style: italic; }

/* ---------- 候选榜单 ---------- */
.pzp-rank { padding: 14px 0 4px; }
.pzp-rank-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  padding: 0 2px;
}
.pzp-rank-title { font-size: 14px; font-weight: 700; letter-spacing: 3px; color: var(--pzp-ink); }
.pzp-rank-count { font-size: 11px; letter-spacing: 1px; color: var(--pzp-ink-faint); }
.pzp-rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--pzp-line);
}
.pzp-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 4px;
  border-bottom: 1px solid var(--pzp-line-soft);
}
.pzp-rank-row-best {
  background: rgba(140, 47, 38, 0.06);
  border-bottom: 1px solid var(--pzp-accent);
}
.pzp-rank-no {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--pzp-line);
  color: var(--pzp-ink-faint);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pzp-rank-no-best {
  background: var(--pzp-accent);
  border-color: var(--pzp-accent-deep);
  color: #f5efe0;
  font-weight: 700;
}
.pzp-rank-when { display: flex; flex-direction: column; min-width: 86px; flex-shrink: 0; }
.pzp-rank-date { font-size: 13px; font-weight: 700; color: var(--pzp-ink); letter-spacing: 0.5px; }
.pzp-rank-ganzhi { font-size: 10px; color: var(--pzp-ink-faint); letter-spacing: 0.5px; margin-top: 1px; }
.pzp-rank-hour { flex: 1; display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.pzp-rank-dizhi { font-size: 15px; font-weight: 700; color: var(--pzp-ink); letter-spacing: 1px; }
.pzp-rank-tianshen { font-size: 10.5px; letter-spacing: 1px; }
.pzp-ts-ji { color: var(--pzp-green-deep); }
.pzp-ts-xiong { color: var(--pzp-accent); }
.pzp-rank-score {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--pzp-ink-soft);
  min-width: 24px;
  text-align: right;
}
.pzp-rank-row-best .pzp-rank-score { color: var(--pzp-accent-deep); }

/* ---------- AI 锦囊 ---------- */
.pzp-tips {
  margin: 12px 0 0;
  border-top: 1px solid var(--pzp-line);
  border-bottom: 1px solid var(--pzp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.pzp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--pzp-green);
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
.pzp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pzp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--pzp-line-soft);
  border-left: 2px solid var(--pzp-green);
  border-radius: 4px;
  padding: 5px 8px;
  min-width: 0;
}
.pzp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--pzp-green);
  margin-top: 6px;
}
.pzp-tips-item {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--pzp-ink-soft);
  word-break: break-word;
}

/* ---------- 提示与免责 ---------- */
.pzp-note { padding: 10px 2px 0; text-align: center; }
.pzp-note-ai { margin: 0 0 6px; font-size: 11.5px; line-height: 1.6; color: var(--pzp-ink-soft); }
.pzp-note-medical { margin: 0; font-size: 10px; line-height: 1.6; color: var(--pzp-ink-faint); letter-spacing: 0.3px; }

/* ---------- 底部落款 ---------- */
.pzp-foot {
  margin-top: 14px;
  border-top: 1px solid var(--pzp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.pzp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.pzp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--pzp-accent);
  color: var(--pzp-accent);
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
.pzp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.pzp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--pzp-ink); }
.pzp-foot-note { font-size: 9.5px; color: var(--pzp-ink-faint); letter-spacing: 0.5px; }
.pzp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pzp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.pzp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.pzp-qr-inner {
  font-size: 8px;
  color: var(--pzp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--pzp-line);
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
  .pzp { padding: 8px; }
  .pzp-sheet { padding: 16px 12px 12px; }
  .pzp-best-main { flex-wrap: wrap; }
  .pzp-best-hour { flex-basis: 100%; order: 3; margin-top: 8px; }
  .pzp-best-md { font-size: 28px; }
  .pzp-best-dizhi { font-size: 36px; white-space: nowrap; }
  .pzp-best-range { white-space: nowrap; }
  .pzp-rank-when { min-width: 74px; }
}
</style>
