<template>
  <div class="jcp">
    <div class="jcp-sheet">
      <!-- ============ 顶部：品牌横条 ============ -->
      <div class="jcp-topbar">
        <span class="jcp-brand">{{ $t('jishi.poster.brand') }}</span>
        <span class="jcp-serial">{{ $t('jishi.poster.serial') }}</span>
      </div>

      <!-- ============ 头部：日期 ============ -->
      <header class="jcp-head">
        <p class="jcp-solar">{{ solarText }}</p>
        <p class="jcp-week">{{ weekText }}</p>
        <div class="jcp-day-wrap">
          <span class="jcp-day-num">{{ dayNum }}</span>
          <div class="jcp-day-side">
            <span class="jcp-lunar">{{ lunarDate }}</span>
            <span class="jcp-ganzhi">{{ dayGanZhi }}{{ $t('jishi.poster.dayUnit') }}</span>
          </div>
        </div>
        <div class="jcp-head-tags">
          <span class="jcp-tag">{{ $t('jishi.poster.tagJianChu') }} · {{ jianChu }}</span>
          <span class="jcp-tag">{{ $t('jishi.poster.tagMonthZhi') }} · {{ monthZhi }}</span>
          <span class="jcp-tag">{{ jieQiText }}</span>
        </div>

        <!-- AI 概述融入头部副标语（取「今日整体概述」首句；未生成则显示占位格言） -->
        <p class="jcp-overview" :class="{ 'jcp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('jishi.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ AI 宜忌栏：结构化小格子卡片（融入海报） ============ -->
      <section v-if="aiParsed.yiji.length" class="jcp-yiji">
        <span class="jcp-yiji-flag">{{ $t('jishi.poster.yiLabel') }}</span>
        <ul class="jcp-yiji-grid">
          <li v-for="(item, i) in aiParsed.yiji" :key="i" class="jcp-yiji-cell">
            <span class="jcp-yiji-dot" aria-hidden="true" />
            <span class="jcp-yiji-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 中部：十二时辰 ============ -->
      <section class="jcp-hours">
        <div class="jcp-hours-head">
          <span class="jcp-hours-title">{{ $t('jishi.poster.hoursTitle') }}</span>
          <span class="jcp-hours-count">
            {{ $t('jishi.poster.countJi', { n: jiCount }) }} · {{ $t('jishi.poster.countXiong', { n: xiongCount }) }}
          </span>
        </div>
        <ul class="jcp-hours-list">
          <li
            v-for="item in shiChen"
            :key="item.dizhi"
            class="jcp-hour"
            :class="item.type === '黄道' ? 'jcp-hour-ji' : 'jcp-hour-xiong'"
          >
            <div class="jcp-hour-main">
              <span class="jcp-hour-name">{{ item.dizhi }}{{ $t('jishi.poster.hourUnit') }}</span>
              <span class="jcp-hour-range">{{ item.timeRange }}</span>
            </div>
            <div class="jcp-hour-body">
              <span class="jcp-hour-tianshen">{{ item.tianShen }}</span>
              <!-- AI 简述优先，未覆盖的时辰回退到隐士兜底句 -->
              <span class="jcp-hour-desc" :class="{ 'jcp-hour-desc-ai': aiParsed.byHour[item.dizhi] }">
                {{ aiParsed.byHour[item.dizhi] || hourDesc(item.dizhi) }}
              </span>
            </div>
            <span class="jcp-hour-seal" :class="item.type === '黄道' ? 'jcp-seal-ji' : 'jcp-seal-xiong'">
              {{ item.type === '黄道' ? $t('jishi.poster.ji') : $t('jishi.poster.xiong') }}
            </span>
          </li>
        </ul>
      </section>

      <!-- ============ 底部：落款 ============ -->
      <footer class="jcp-foot">
        <div class="jcp-foot-brand">
          <div class="jcp-seal-stamp">{{ $t('jishi.poster.seal') }}</div>
          <div class="jcp-foot-meta">
            <span class="jcp-foot-site">{{ siteDomain }}</span>
            <span class="jcp-foot-note">{{ $t('jishi.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="jcp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="jcp-qr-img" v-html="qrSvg" />
          <span v-else class="jcp-qr-inner">{{ $t('jishi.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'

interface ShiChenItem {
  dizhi: DiZhi
  timeRange: string
  tianShen: string
  type: '黄道' | '黑道'
}

interface Props {
  date: string
  dayGanZhi: string
  monthZhi: string
  jianChu: string
  jieQi: { name: string | null; isToday: boolean; isNear: boolean }
  shiChen: ShiChenItem[]
  lunarDate: string
  weekDay: number
  /** AI 解读全文（markdown，四段结构）。流式追加，海报实时融合。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  // 当前工具页 URL，扫码直达工具页
  const url = `${window.location.origin}/tools/jishi`
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
  const [, , d] = props.date.split('-').map(Number)
  return d || ''
})

const solarText = computed(() => {
  const [y, m, d] = props.date.split('-').map(Number)
  if (locale.value === 'en') {
    return new Date(y!, (m || 1) - 1, d || 1).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }
  return t('jishi.poster.solarFmt', { y, m, d })
})

const weekText = computed(() => {
  const names = t('jishi.poster.weekNames')
  const arr = names.split(',')
  return locale.value === 'en' ? arr[props.weekDay] : `${t('jishi.poster.weekPrefix')}${arr[props.weekDay]}`
})

const jieQiText = computed(() => {
  if (!props.jieQi.name) return t('jishi.poster.noJieQi')
  return props.jieQi.isToday
    ? t('jishi.poster.jieQiToday', { name: props.jieQi.name })
    : t('jishi.poster.jieQiNear', { name: props.jieQi.name })
})

/* ---------- 时辰统计 ---------- */

const jiCount = computed(() => props.shiChen.filter(s => s.type === '黄道').length)
const xiongCount = computed(() => props.shiChen.filter(s => s.type === '黑道').length)

/* ---------- AI 解读解析：拆四段，映射进海报 ---------- */

interface AiParsed {
  /** 概述（OV: 行内容） */
  overview: string
  /** 宜忌要点（YI: 行，逐条） */
  yiji: string[]
  /** 按时辰的简述（JI:/XIONG: 行） */
  byHour: Record<string, string>
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', yiji: [], byHour: {} }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/[。.\s]+$/, '').trim()
  const validDizhi = new Set(props.shiChen.map(s => s.dizhi as string))

  // AI 按行协议输出：OV: / YI: / JI: / XIONG:。流式追加，逐行解析。
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('OV:') || line.startsWith('OV：')) {
      if (!out.overview) out.overview = truncate(clean(line.slice(3)), 60)
      continue
    }

    if (line.startsWith('YI:') || line.startsWith('YI：')) {
      const item = truncate(clean(line.slice(3)), 26)
      if (item && out.yiji.length < 4) out.yiji.push(item)
      continue
    }

    const isJi = line.startsWith('JI:') || line.startsWith('JI：')
    const isXiong = line.startsWith('XIONG:') || line.startsWith('XIONG：')
    if (!isJi && !isXiong) continue

    const body = line.slice(isJi ? 3 : 6).trim()
    // 「时辰（时段）天神 | 建议」，| 分隔
    const pipeIdx = body.search(/[|｜]/)
    const head = pipeIdx >= 0 ? body.slice(0, pipeIdx) : body
    const tip = pipeIdx >= 0 ? body.slice(pipeIdx + 1) : ''
    const anchor = head.match(/([子丑寅卯辰巳午未申酉戌亥])时/)
    if (!anchor) continue
    const dizhi = anchor[1]!
    if (!validDizhi.has(dizhi) || out.byHour[dizhi]) continue
    let desc = clean(tip)
    if (!desc) {
      // 无 | 分隔时，剥掉时辰头部（时辰+时段括号+天神+冒号）取剩余
      desc = clean(head.slice((anchor.index ?? 0) + anchor[0].length).replace(/^[（(][^)）]*[)）]?\s*\S{0,4}\s*[：:]?/, ''))
    }
    if (desc) out.byHour[dizhi] = truncate(desc, 32)
  }

  return out
})

/**
 * 十二时辰兜底「宜事简述」（AI 未覆盖时用）。确定性文案，
 * 走「幽默隐士」口吻——久居深山、看淡世事的老先生，机智温暖、带善意调侃。
 */
function hourDesc(dizhi: DiZhi): string {
  return t(`jishi.poster.hourDesc.${dizhi}`)
}
</script>

<style scoped>
/* ========== 纸质台历海报（与 HuangdaoReport 同源纸质配色，竖版台历版式） ========== */
.jcp {
  --jcp-bg: #efe9db;
  --jcp-sheet: #faf5e9;
  --jcp-ink: #2e2a24;
  --jcp-ink-soft: #55503f;
  --jcp-ink-faint: #8a8272;
  --jcp-line: #d8d0bd;
  --jcp-line-soft: #e6dfcd;
  --jcp-accent: #8c2f26;
  --jcp-accent-deep: #6e231c;
  --jcp-accent-soft: #a8512e;
  --jcp-green: #4a7c59;
  --jcp-green-deep: #3a6449;
  background: var(--jcp-bg);
  padding: 14px;
  color: var(--jcp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.jcp-sheet {
  background: var(--jcp-sheet);
  border: 1px solid var(--jcp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
/* 顶部台历打孔暗示 */
.jcp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--jcp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.jcp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--jcp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--jcp-ink-faint);
}
.jcp-brand { font-weight: 700; color: var(--jcp-ink-soft); }
.jcp-serial { letter-spacing: 1px; }

/* ---------- 头部日期 ---------- */
.jcp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--jcp-ink);
}
.jcp-solar {
  margin: 0;
  font-size: 15px;
  letter-spacing: 2px;
  color: var(--jcp-ink-soft);
}
.jcp-week {
  margin: 4px 0 0;
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--jcp-accent);
  font-weight: 700;
}
.jcp-day-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}
.jcp-day-num {
  font-size: 92px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: 2px;
  color: var(--jcp-ink);
}
.jcp-day-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-left: 1px solid var(--jcp-line);
  padding-left: 16px;
}
.jcp-lunar { font-size: 20px; font-weight: 700; color: var(--jcp-ink); letter-spacing: 1px; }
.jcp-ganzhi { font-size: 13px; color: var(--jcp-ink-soft); letter-spacing: 2px; }
.jcp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.jcp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--jcp-ink-soft);
  border: 1px solid var(--jcp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}

/* AI 概述：融入头部副标语，衬线斜体感 */
.jcp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--jcp-ink-soft);
}
.jcp-overview-pending { color: var(--jcp-ink-faint); font-style: italic; }

/* ---------- AI 宜忌栏：结构化小格子卡片，双线夹出 ---------- */
.jcp-yiji {
  margin: 12px 0 0;
  border-top: 1px solid var(--jcp-line);
  border-bottom: 1px solid var(--jcp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.jcp-yiji-flag {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--jcp-green);
  color: #f5efe0;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.jcp-yiji-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.jcp-yiji-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--jcp-line-soft);
  border-left: 2px solid var(--jcp-green);
  border-radius: 4px;
  padding: 5px 8px;
  min-width: 0;
}
.jcp-yiji-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--jcp-green);
  margin-top: 6px;
}
.jcp-yiji-item {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--jcp-ink-soft);
  word-break: break-word;
}

/* ---------- 中部十二时辰 ---------- */
.jcp-hours { padding: 14px 0 4px; }
.jcp-hours-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  padding: 0 2px;
}
.jcp-hours-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--jcp-ink);
}
.jcp-hours-count { font-size: 11px; letter-spacing: 1px; color: var(--jcp-ink-faint); }

.jcp-hours-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--jcp-line);
}
.jcp-hour {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 4px;
  border-bottom: 1px solid var(--jcp-line-soft);
  position: relative;
}
.jcp-hour:last-child { border-bottom: 1px solid var(--jcp-line); }
/* 左缘墨色条区分吉凶 */
.jcp-hour::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--jcp-line);
}
.jcp-hour-ji::before { background: var(--jcp-green); }
.jcp-hour-xiong::before { background: var(--jcp-accent); }

.jcp-hour-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 62px;
  flex-shrink: 0;
}
.jcp-hour-name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--jcp-ink);
  line-height: 1;
}
.jcp-hour-range { font-size: 10px; color: var(--jcp-ink-faint); letter-spacing: 0.5px; margin-top: 3px; }

.jcp-hour-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.jcp-hour-tianshen { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--jcp-ink-soft); }
.jcp-hour-ji .jcp-hour-tianshen { color: var(--jcp-green-deep); }
.jcp-hour-xiong .jcp-hour-tianshen { color: var(--jcp-accent-deep); }
.jcp-hour-desc {
  font-size: 12px;
  line-height: 1.55;
  color: var(--jcp-ink-soft);
  letter-spacing: 0.3px;
}
/* AI 覆盖的简述略微加深，与兜底句区分 */
.jcp-hour-desc-ai { color: var(--jcp-ink); }

/* ---------- 吉/凶印章：一实一虚，显著区分 ---------- */
.jcp-hour-seal {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
}
/* 吉：实色填充印章 */
.jcp-seal-ji {
  background: var(--jcp-green);
  border: 2px solid var(--jcp-green-deep);
  color: #f5efe0;
  transform: rotate(-4deg);
  box-shadow: 0 1px 3px rgba(60, 48, 30, 0.2);
}
/* 凶：镂空印章——透明底 + 粗描边 + 字上色 */
.jcp-seal-xiong {
  background: transparent;
  border: 2.5px solid var(--jcp-accent);
  color: var(--jcp-accent);
  transform: rotate(3deg);
  box-shadow: none;
}

/* ---------- 底部落款 ---------- */
.jcp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--jcp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.jcp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.jcp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--jcp-accent);
  color: var(--jcp-accent);
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
.jcp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.jcp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--jcp-ink); }
.jcp-foot-note { font-size: 9.5px; color: var(--jcp-ink-faint); letter-spacing: 0.5px; }
.jcp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.jcp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.jcp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.jcp-qr-inner {
  font-size: 8px;
  color: var(--jcp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--jcp-line);
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
  .jcp { padding: 8px; }
  .jcp-sheet { padding: 16px 12px 12px; }
  .jcp-day-num { font-size: 76px; }
  .jcp-hour-main { min-width: 54px; }
  .jcp-hour-name { font-size: 17px; }
  .jcp-hour-seal { width: 30px; height: 30px; font-size: 14px; }
}
</style>
