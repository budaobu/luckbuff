<template>
  <div class="wcp">
    <div class="wcp-sheet">
      <!-- ============ 顶部：品牌横条 ============ -->
      <div class="wcp-topbar">
        <span class="wcp-brand">{{ $t('wuxingChuanyi.poster.brand') }}</span>
        <span class="wcp-serial">{{ $t('wuxingChuanyi.poster.serial') }}</span>
      </div>

      <!-- ============ 头部：日期 ============ -->
      <header class="wcp-head">
        <p class="wcp-solar">{{ solarText }}</p>
        <p class="wcp-week">{{ weekText }}</p>
        <div class="wcp-day-wrap">
          <span class="wcp-day-num">{{ dayNum }}</span>
          <div class="wcp-day-side">
            <span class="wcp-lunar">{{ lunarDate }}</span>
            <span class="wcp-ganzhi">{{ queryGanzhi.gan }}{{ queryGanzhi.zhi }}{{ $t('wuxingChuanyi.poster.dayUnit') }}</span>
          </div>
        </div>
        <div class="wcp-head-tags">
          <span class="wcp-tag">{{ $t('wuxingChuanyi.poster.tagDayWuxing') }} · {{ wuxingName(queryRiGanWuxing) }}</span>
          <span class="wcp-tag">{{ $t('wuxingChuanyi.poster.tagXiYong') }} · {{ wuxingName(xiyongWuxing) }}</span>
          <span class="wcp-tag">{{ $t('wuxingChuanyi.poster.tagJiShen') }} · {{ wuxingName(jishenWuxing) }}</span>
        </div>

        <!-- AI 概述融入头部副标语（取 OV: 行；未生成则显示占位格言） -->
        <p class="wcp-overview" :class="{ 'wcp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('wuxingChuanyi.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 中部：三色穿衣栏 ============ -->
      <section class="wcp-colors">
        <div class="wcp-colors-head">
          <span class="wcp-colors-title">{{ $t('wuxingChuanyi.poster.colorsTitle') }}</span>
          <span class="wcp-colors-sub">{{ $t('wuxingChuanyi.poster.wuxingOfDay', { wx: wuxingName(queryRiGanWuxing) }) }}</span>
        </div>
        <ul class="wcp-colors-list">
          <li
            v-for="row in colorRows"
            :key="row.key"
            class="wcp-color"
            :class="`wcp-color-${row.key}`"
          >
            <span class="wcp-color-flag">{{ row.flag }}</span>
            <div class="wcp-color-body">
              <div class="wcp-color-main">
                <span class="wcp-color-wuxing">{{ wuxingName(row.set.wuxing) }}</span>
                <div class="wcp-swatches">
                  <span
                    v-for="(color, i) in row.set.colors"
                    :key="i"
                    class="wcp-swatch"
                    :style="{ background: swatchColor(color) }"
                    :title="color"
                  />
                </div>
              </div>
              <p class="wcp-color-names">{{ row.set.colors.join('、') }}</p>
              <p class="wcp-color-reason">{{ row.set.reason }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- ============ AI 穿搭要点：结构化小格子卡片（融入海报） ============ -->
      <section v-if="aiParsed.tips.length" class="wcp-tips">
        <span class="wcp-tips-flag">{{ $t('wuxingChuanyi.poster.tipsTitle') }}</span>
        <ul class="wcp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="wcp-tips-cell">
            <span class="wcp-tips-dot" aria-hidden="true" />
            <span class="wcp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ AI 收口叮嘱 ============ -->
      <p v-if="aiParsed.note" class="wcp-note">
        <span class="wcp-note-label">{{ $t('wuxingChuanyi.poster.noteLabel') }}</span>
        {{ aiParsed.note }}
      </p>

      <!-- ============ 底部：落款 ============ -->
      <footer class="wcp-foot">
        <div class="wcp-foot-brand">
          <div class="wcp-seal-stamp">{{ $t('wuxingChuanyi.poster.seal') }}</div>
          <div class="wcp-foot-meta">
            <span class="wcp-foot-site">{{ siteDomain }}</span>
            <span class="wcp-foot-note">{{ $t('wuxingChuanyi.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="wcp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="wcp-qr-img" v-html="qrSvg" />
          <span v-else class="wcp-qr-inner">{{ $t('wuxingChuanyi.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WuxingColorSet {
  wuxing: string
  colors: string[]
  reason: string
}

interface Props {
  queryDate: string
  queryGanzhi: { gan: string; zhi: string }
  queryRiGanWuxing: string
  xiyongWuxing: string
  jishenWuxing: string
  daJi: WuxingColorSet
  ciJi: WuxingColorSet
  buYi: WuxingColorSet
  /** 农历日期，如「六月廿八」 */
  lunarDate: string
  /** 公历星期（0=周日 … 6=周六） */
  weekDay: number
  /** AI 解读全文（OV:/TIP:/NOTE: 行协议）。流式追加，海报实时融合。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/wuxing-chuanyi`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- 头部日期派生 ---------- */

const dayNum = computed(() => {
  const [, , d] = props.queryDate.split('-').map(Number)
  return d || ''
})

const solarText = computed(() => {
  const [y, m, d] = props.queryDate.split('-').map(Number)
  if (locale.value === 'en') {
    return new Date(y || 1970, (m || 1) - 1, d || 1).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }
  return t('wuxingChuanyi.poster.solarFmt', { y, m, d })
})

const weekText = computed(() => {
  const names = t('wuxingChuanyi.poster.weekNames')
  const arr = names.split(',')
  return locale.value === 'en' ? arr[props.weekDay] : `${t('wuxingChuanyi.poster.weekPrefix')}${arr[props.weekDay]}`
})

/* ---------- 五行名本地化（中文艺名 → 当前语言） ---------- */

function wuxingName(wx: string): string {
  const name = t(`wuxingChuanyi.poster.wuxingName.${wx}`)
  // i18n 缺失时回退原值
  return name === `wuxingChuanyi.poster.wuxingName.${wx}` ? wx : name
}

/* ---------- 三色行 ---------- */

const colorRows = computed(() => [
  { key: 'daji', flag: t('wuxingChuanyi.poster.daJiFlag'), set: props.daJi },
  { key: 'ciji', flag: t('wuxingChuanyi.poster.ciJiFlag'), set: props.ciJi },
  { key: 'buyi', flag: t('wuxingChuanyi.poster.buYiFlag'), set: props.buYi },
])

/* 颜色名 → 纸面可渲染的色块（cover 常见中文/英文颜色词） */
const COLOR_HEX: Record<string, string> = {
  绿色: '#4a7c59', 青色: '#3e7d6b', 翠绿: '#2f8f5b',
  红色: '#a8352a', 粉色: '#d08a93', 紫色: '#6e4a7c', 橙色: '#c97b2e',
  黄色: '#c9a227', 棕色: '#7a5230', 卡其色: '#a68a5b', 米色: '#d9cba6',
  白色: '#e9e4d6', 金色: '#b8912f', 银色: '#b6b3ab', 杏色: '#d9a06b',
  黑色: '#2e2a24', 蓝色: '#2f5a8c', 灰色: '#7d7a72', 深蓝色: '#26436b',
  green: '#4a7c59', teal: '#3e7d6b', red: '#a8352a', pink: '#d08a93',
  purple: '#6e4a7c', orange: '#c97b2e', yellow: '#c9a227', brown: '#7a5230',
  khaki: '#a68a5b', beige: '#d9cba6', white: '#e9e4d6', gold: '#b8912f',
  silver: '#b6b3ab', apricot: '#d9a06b', black: '#2e2a24', blue: '#2f5a8c',
  gray: '#7d7a72', grey: '#7d7a72', navy: '#26436b',
}

function swatchColor(color: string): string {
  const hit = COLOR_HEX[color] || COLOR_HEX[color.trim().toLowerCase()]
  return hit || 'var(--wcp-line)'
}

/* ---------- AI 解读解析：OV:/TIP:/NOTE: 行协议，映射进海报 ---------- */

interface AiParsed {
  overview: string
  tips: string[]
  note: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', tips: [], note: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/[。.\s]+$/, '').trim()

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('OV:') || line.startsWith('OV：')) {
      if (!out.overview) out.overview = truncate(clean(line.slice(3)), 60)
      continue
    }
    if (line.startsWith('TIP:') || line.startsWith('TIP：')) {
      const item = truncate(clean(line.slice(4)), 40)
      if (item && out.tips.length < 4) out.tips.push(item)
      continue
    }
    if (line.startsWith('NOTE:') || line.startsWith('NOTE：')) {
      if (!out.note) out.note = truncate(clean(line.slice(5)), 60)
      continue
    }
  }

  return out
})
</script>

<style scoped>
/* ========== 纸质日历海报（与 JishiCalendarPoster 同源纸质配色，竖版日历版式） ========== */
.wcp {
  --wcp-bg: #efe9db;
  --wcp-sheet: #faf5e9;
  --wcp-ink: #2e2a24;
  --wcp-ink-soft: #55503f;
  --wcp-ink-faint: #8a8272;
  --wcp-line: #d8d0bd;
  --wcp-line-soft: #e6dfcd;
  --wcp-accent: #8c2f26;
  --wcp-accent-deep: #6e231c;
  --wcp-green: #4a7c59;
  --wcp-green-deep: #3a6449;
  --wcp-gold: #9a7a24;
  background: var(--wcp-bg);
  padding: 14px;
  color: var(--wcp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.wcp-sheet {
  background: var(--wcp-sheet);
  border: 1px solid var(--wcp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
/* 顶部台历打孔暗示 */
.wcp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--wcp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.wcp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--wcp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--wcp-ink-faint);
}
.wcp-brand { font-weight: 700; color: var(--wcp-ink-soft); }
.wcp-serial { letter-spacing: 1px; }

/* ---------- 头部日期 ---------- */
.wcp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--wcp-ink);
}
.wcp-solar {
  margin: 0;
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--wcp-ink-soft);
}
.wcp-week {
  margin: 4px 0 0;
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--wcp-accent);
  font-weight: 700;
}
.wcp-day-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}
.wcp-day-num {
  font-size: 92px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: 2px;
  color: var(--wcp-ink);
}
.wcp-day-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-left: 1px solid var(--wcp-line);
  padding-left: 16px;
}
.wcp-lunar { font-size: 20px; font-weight: 700; color: var(--wcp-ink); letter-spacing: 1px; }
.wcp-ganzhi { font-size: 13px; color: var(--wcp-ink-soft); letter-spacing: 2px; }
.wcp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.wcp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--wcp-ink-soft);
  border: 1px solid var(--wcp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}

/* AI 概述：融入头部副标语 */
.wcp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--wcp-ink-soft);
}
.wcp-overview-pending { color: var(--wcp-ink-faint); font-style: italic; }

/* ---------- 中部三色穿衣栏 ---------- */
.wcp-colors { padding: 14px 0 4px; }
.wcp-colors-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  padding: 0 2px;
}
.wcp-colors-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--wcp-ink);
}
.wcp-colors-sub { font-size: 11px; letter-spacing: 1px; color: var(--wcp-ink-faint); }

.wcp-colors-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--wcp-line);
}
.wcp-color {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px solid var(--wcp-line-soft);
  position: relative;
}
.wcp-color:last-child { border-bottom: 1px solid var(--wcp-line); }
/* 左缘墨色条区分吉凶 */
.wcp-color::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--wcp-line);
}
.wcp-color-daji::before { background: var(--wcp-green); }
.wcp-color-ciji::before { background: var(--wcp-gold); }
.wcp-color-buyi::before { background: var(--wcp-accent); }

.wcp-color-flag {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
  line-height: 1.1;
  text-align: center;
  margin-top: 2px;
  padding: 2px;
}
.wcp-color-daji .wcp-color-flag {
  background: var(--wcp-green);
  border: 2px solid var(--wcp-green-deep);
  color: #f5efe0;
  transform: rotate(-4deg);
  box-shadow: 0 1px 3px rgba(60, 48, 30, 0.2);
}
.wcp-color-ciji .wcp-color-flag {
  background: transparent;
  border: 2px solid var(--wcp-gold);
  color: var(--wcp-gold);
  transform: rotate(2deg);
}
.wcp-color-buyi .wcp-color-flag {
  background: transparent;
  border: 2.5px solid var(--wcp-accent);
  color: var(--wcp-accent);
  transform: rotate(3deg);
}

.wcp-color-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.wcp-color-main { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.wcp-color-wuxing {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wcp-ink);
}
.wcp-color-daji .wcp-color-wuxing { color: var(--wcp-green-deep); }
.wcp-color-buyi .wcp-color-wuxing { color: var(--wcp-accent-deep); }

.wcp-swatches { display: flex; gap: 5px; flex-shrink: 0; }
.wcp-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(60, 48, 30, 0.25);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}
.wcp-color-names {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--wcp-ink);
}
.wcp-color-reason {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--wcp-ink-soft);
  letter-spacing: 0.3px;
}

/* ---------- AI 穿搭要点：结构化小格子卡片 ---------- */
.wcp-tips {
  margin: 12px 0 0;
  border-top: 1px solid var(--wcp-line);
  border-bottom: 1px solid var(--wcp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.wcp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--wcp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  letter-spacing: 0;
}
.wcp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.wcp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--wcp-line-soft);
  border-left: 2px solid var(--wcp-green);
  border-radius: 4px;
  padding: 5px 8px;
  min-width: 0;
}
.wcp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--wcp-green);
  margin-top: 6px;
}
.wcp-tips-item {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--wcp-ink-soft);
  word-break: break-word;
}

/* ---------- AI 收口叮嘱 ---------- */
.wcp-note {
  margin: 12px 2px 0;
  font-size: 12px;
  line-height: 1.65;
  color: var(--wcp-ink-soft);
  letter-spacing: 0.3px;
}
.wcp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--wcp-accent);
  border: 1px solid var(--wcp-accent);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部落款 ---------- */
.wcp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--wcp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.wcp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.wcp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--wcp-accent);
  color: var(--wcp-accent);
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
.wcp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.wcp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--wcp-ink); }
.wcp-foot-note { font-size: 9.5px; color: var(--wcp-ink-faint); letter-spacing: 0.5px; }
.wcp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wcp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.wcp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.wcp-qr-inner {
  font-size: 8px;
  color: var(--wcp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--wcp-line);
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
  .wcp { padding: 8px; }
  .wcp-sheet { padding: 16px 12px 12px; }
  .wcp-day-num { font-size: 76px; }
  .wcp-color-flag { width: 30px; height: 30px; font-size: 12px; }
  .wcp-swatch { width: 15px; height: 15px; }
}
</style>
