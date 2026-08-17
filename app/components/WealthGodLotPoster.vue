<template>
  <div class="wgp" :class="{ 'wgp-latin': !isZh }">
    <div class="wgp-sheet">
      <!-- 顶部品牌横条 -->
      <div class="wgp-topbar">
        <span class="wgp-brand">{{ $t('wealthGodPoster.kicker') }}</span>
        <span class="wgp-serial">{{ $t('wealthGodPoster.serial') }}</span>
      </div>

      <!-- 头部：签号 + 典故名 + 吉凶印章 -->
      <header class="wgp-head">
        <div class="wgp-head-main">
          <p class="wgp-number">{{ $t('wealthGodPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="wgp-title" :class="titleSizeClass">{{ result.fortune.title }}</h2>
        </div>
        <div class="wgp-level-seal" aria-hidden="true">
          <span class="wgp-level-text">{{ result.fortune.level }}</span>
        </div>
      </header>

      <!-- 所问之事横批 -->
      <section class="wgp-question">
        <span class="wgp-question-flag">{{ $t('wealthGodPoster.questionFlag') }}</span>
        <p class="wgp-question-text">{{ questionText }}</p>
      </section>

      <!-- 财神纹章：百签通用的铜钱元宝线稿（典故名已在头部，此处只做装饰） -->
      <section class="wgp-emblem" aria-hidden="true">
        <svg viewBox="0 0 200 72" class="wgp-emblem-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- 左云纹 -->
          <path d="M14 40 q6 -10 14 -6 q2 -8 12 -7 q8 1 9 8 q8 -1 10 6 q1 7 -7 8 l-32 0 q-8 -2 -6 -9" opacity="0.55" />
          <!-- 铜钱：外圆内方孔 -->
          <circle cx="68" cy="36" r="17" />
          <circle cx="68" cy="36" r="13.5" opacity="0.45" />
          <rect x="62.5" y="30.5" width="11" height="11" />
          <!-- 元宝 -->
          <path d="M100 24 q-12 4 -15 14 q-3 10 6 14 q4 2 9 2 q5 0 9 -2 q9 -4 6 -14 q-3 -10 -15 -14 Z" />
          <path d="M100 24 q-6 6 -6 14 q0 8 6 12 q6 -4 6 -12 q0 -8 -6 -14" opacity="0.5" />
          <!-- 铜钱 -->
          <circle cx="132" cy="36" r="17" />
          <circle cx="132" cy="36" r="13.5" opacity="0.45" />
          <rect x="126.5" y="30.5" width="11" height="11" />
          <!-- 右云纹 -->
          <path d="M186 40 q-6 -10 -14 -6 q-2 -8 -12 -7 q-8 1 -9 8 q-8 -1 -10 6 q-1 7 7 8 l32 0 q8 -2 6 -9" opacity="0.55" />
        </svg>
      </section>

      <!-- 签诗竖排：从右往左读，阿拉伯数字/英文横排镶嵌 -->
      <section class="wgp-oracle">
        <div class="wgp-scroll">
          <span class="wgp-scroll-flag">{{ $t('wealthGodPoster.poemFlag') }}</span>
          <p class="wgp-poem">
            <span v-for="(line, i) in poemLines" :key="i" class="wgp-poem-line">
              <template v-for="(seg, j) in line" :key="j">
                <span v-if="seg.latin" class="wgp-tcu">{{ seg.text }}</span>
                <template v-else>{{ seg.text }}</template>
              </template>
            </span>
          </p>
        </div>
      </section>

      <!-- 签意 / 签示 / 财运指引 -->
      <section class="wgp-verdicts">
        <p class="wgp-verdict-line">
          <span class="wgp-verdict-flag">{{ $t('wealthGodPoster.explanationLabel') }}</span>
          <span class="wgp-verdict-text">{{ result.fortune.explanation }}</span>
        </p>
        <p class="wgp-verdict-line">
          <span class="wgp-verdict-flag">{{ $t('wealthGodPoster.adviceLabel') }}</span>
          <span class="wgp-verdict-text">{{ result.fortune.advice }}</span>
        </p>
        <p class="wgp-verdict-line">
          <span class="wgp-verdict-flag">{{ $t('wealthGodPoster.guidanceLabel') }}</span>
          <span class="wgp-verdict-text" :class="{ 'wgp-pending': !guidance }">
            {{ guidance || $t('wealthGodPoster.guidancePending') }}
          </span>
        </p>
      </section>

      <!-- 底部：落款 + 盖印 + 工具页二维码（整张海报唯一二维码） -->
      <footer class="wgp-foot">
        <div class="wgp-foot-row">
          <div class="wgp-sign">
            <p class="wgp-sign-line">{{ signDate }}</p>
            <p class="wgp-sign-line wgp-sign-site">{{ siteDomain }}</p>
            <p class="wgp-sign-line wgp-sign-note">{{ $t('wealthGodPoster.footerNote') }}</p>
          </div>
          <div class="wgp-seal" aria-hidden="true">
            <span class="wgp-seal-text">{{ sealText }}</span>
          </div>
          <div class="wgp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="wgp-qr-img" v-html="qrSvg" />
            <span v-else class="wgp-qr-inner">{{ $t('wealthGodPoster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WealthGodFortune {
  number: number
  title: string
  level: string
  levelCode: string
  poem: string
  explanation: string
  advice: string
}

interface Props {
  /** 抽签结果（calc 接口返回） */
  result: {
    lotType: { id: string; name: string; count: number }
    fortune: WealthGodFortune
    question?: string
  }
  /** AI 解读全文（markdown 三段结构）。流式追加，海报实时融入「财运指引」。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()

/* 拉丁字母竖排会旋转溢出；签诗为中文原文保持竖排，其余文案按 locale 横排 */
const isZh = computed(() => locale.value.startsWith('zh'))

const siteDomain = 'www.ososn.com'

/* ---------- 所问之事 ---------- */

const questionText = computed(
  () => props.result.question || t('wealthGodPoster.noQuestion'),
)

/* ---------- 典故名长度跨度大（4~13 字），按长度降档字号防溢出 ---------- */

const titleSizeClass = computed(() => {
  const len = (props.result.fortune.title || '').length
  if (len > 10) return 'wgp-title-xl'
  if (len > 7) return 'wgp-title-lg'
  return ''
})

/* ---------- 签诗竖排：按句读拆列；ASCII 片段 text-combine-upright 横排镶嵌 ---------- */

interface PoemSegment {
  text: string
  latin: boolean
}

function splitLatinRuns(line: string): PoemSegment[] {
  const out: PoemSegment[] = []
  const re = /[A-Za-z0-9]+/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), latin: false })
    out.push({ text: m[0], latin: true })
    last = m.index + m[0].length
  }
  if (last < line.length) out.push({ text: line.slice(last), latin: false })
  return out
}

const poemLines = computed<PoemSegment[][]>(() => {
  const poem = props.result.fortune.poem || ''
  let lines = poem.split('\n').map(s => s.trim()).filter(Boolean)
  if (lines.length <= 1) {
    lines = poem.split(/[。；;]\s*/).map(s => s.trim()).filter(Boolean)
  }
  return lines
    .map(s => s.replace(/[，,。.；;、\s]+$/, ''))
    .filter(Boolean)
    .slice(0, 6)
    .map(splitLatinRuns)
})

/* ---------- 财运指引：从 AI 三段解读中取「财运指引」首句，白话简短判断 ---------- */

const guidance = computed(() => {
  const text = props.aiContent || ''
  if (!text.trim()) return ''
  const m = text.match(/##\s*(?:财运指引|財運指引)\s*\n([\s\S]*?)(?=\n##\s|$)/)
    || text.match(/##\s*(?:Wealth Guidance|Guidance)\s*\n([\s\S]*?)(?=\n##\s|$)/i)
  if (!m) return ''
  const body = m[1]!.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  if (!body) return ''
  // 取首句（句号/问号/叹号为界），超长截断
  const sentenceEnd = body.search(/[。！？.!?]/)
  const first = sentenceEnd >= 0 ? body.slice(0, sentenceEnd + 1) : body
  const limit = isZh.value ? 64 : 140
  return first.length > limit ? `${first.slice(0, limit - 1)}…` : first
})

/* ---------- 盖印落款 ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date()
  if (locale.value === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('wealthGodPoster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/5-god-of-wealth-lot`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})
</script>

<style scoped>
/* ========== 庙宇签谱海报：仿古宣纸 + 朱砂印章，与观音签谱同源纸质调性 ========== */
.wgp {
  --wgp-bg: #e6dbc0;
  --wgp-sheet: #f4ecd6;
  --wgp-ink: #3a2e1f;
  --wgp-ink-soft: #5c4f3a;
  --wgp-ink-faint: #8f8265;
  --wgp-line: #d3c6a6;
  --wgp-cinnabar: #b23a2c;
  background: var(--wgp-bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 78% 10%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 18% 84%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--wgp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.wgp-sheet {
  background: var(--wgp-sheet);
  border: 1px solid var(--wgp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 宣纸毛边：上下缘锯齿撕口 */
.wgp-sheet::before,
.wgp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--wgp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.wgp-sheet::before { top: -6px; transform: scaleY(-1); }
.wgp-sheet::after { bottom: -6px; }

/* ---------- 顶部品牌横条 ---------- */
.wgp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--wgp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--wgp-ink-faint);
}
.wgp-brand { font-weight: 700; color: var(--wgp-ink-soft); }
.wgp-serial { letter-spacing: 1px; }

/* ---------- 头部：签号 + 典故名 + 吉凶印章 ---------- */
.wgp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 2px 14px;
  border-bottom: 3px double var(--wgp-ink);
}
.wgp-head-main { min-width: 0; }
.wgp-number {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--wgp-ink-faint);
}
.wgp-title {
  margin: 4px 0 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1.2;
  color: var(--wgp-ink);
}
.wgp-title-lg { font-size: 24px; letter-spacing: 4px; }
.wgp-title-xl { font-size: 18px; letter-spacing: 2px; }
/* 吉凶等级：方形印章式边框文字标注，无星级/色彩分级图标 */
.wgp-level-seal {
  flex-shrink: 0;
  min-width: 62px;
  height: 62px;
  padding: 4px;
  border: 2.5px solid var(--wgp-cinnabar);
  border-radius: 6px;
  color: var(--wgp-cinnabar);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(-4deg);
  background: radial-gradient(circle at 38% 32%, rgba(178, 58, 44, 0.07), transparent 60%);
  box-shadow: inset 0 0 0 1.5px rgba(178, 58, 44, 0.22);
}
.wgp-level-text {
  font-size: 19px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.2;
}
.wgp-latin .wgp-level-text { font-size: 12px; letter-spacing: 0.5px; }

/* ---------- 所问之事横批 ---------- */
.wgp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--wgp-line);
  text-align: center;
}
.wgp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--wgp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.wgp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--wgp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 财神纹章 ---------- */
.wgp-emblem {
  display: flex;
  justify-content: center;
  padding: 12px 8px 4px;
  color: var(--wgp-ink);
}
.wgp-emblem-svg {
  display: block;
  width: 200px;
  max-width: 62%;
  height: auto;
  opacity: 0.7;
}

/* ---------- 签诗竖排 ---------- */
.wgp-oracle {
  margin: 8px 0 0;
  display: flex;
  justify-content: center;
}
.wgp-scroll {
  padding: 14px 16px;
  border-top: 1px solid var(--wgp-line);
  border-bottom: 1px solid var(--wgp-line);
  /* 竖排块流：从右往左，子块依次成列（flex 在此浏览器下会把列压成横向 rtl，勿改回 flex） */
  writing-mode: vertical-rl;
  max-height: 260px;
}
.wgp-scroll-flag {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--wgp-cinnabar);
  padding-top: 2px;
  margin-left: 10px;
}
.wgp-poem {
  margin: 0;
}
.wgp-poem-line {
  display: block;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--wgp-ink);
  margin-left: 10px;
}
/* 竖排区内阿拉伯数字/英文横排镶嵌，不随中文旋转 */
.wgp-tcu {
  text-combine-upright: all;
  -webkit-text-combine: horizontal;
  letter-spacing: 0;
}

/* ---------- 签意 / 签示 / 财运指引 ---------- */
.wgp-verdicts {
  margin: 12px 2px 0;
  padding: 10px 10px;
  border-top: 1px dashed var(--wgp-line);
  border-bottom: 1px dashed var(--wgp-line);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.wgp-verdict-line {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  letter-spacing: 0.3px;
  color: var(--wgp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.wgp-verdict-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wgp-cinnabar);
  border: 1px solid var(--wgp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.wgp-verdict-text { word-break: break-word; }
.wgp-pending { color: var(--wgp-ink-faint); font-style: italic; }

/* ---------- 底部：落款 + 盖印 + 二维码 ---------- */
.wgp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--wgp-ink);
  padding-top: 12px;
}
.wgp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.wgp-sign { min-width: 0; }
.wgp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--wgp-ink-faint);
  line-height: 1.7;
}
.wgp-sign-site {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--wgp-ink);
}
.wgp-sign-note { font-size: 9.5px; }
/* 仿盖印：方形朱文章，做旧、微歪斜 */
.wgp-seal {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border: 2.5px solid rgba(178, 58, 44, 0.72);
  border-radius: 6px;
  box-shadow:
    inset 0 0 0 1.5px rgba(178, 58, 44, 0.26),
    inset 2px 1px 0 rgba(178, 58, 44, 0.14),
    0 0 0 1px rgba(178, 58, 44, 0.08);
  color: rgba(178, 58, 44, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(-6deg);
  opacity: 0.86;
  background: radial-gradient(circle at 38% 32%, rgba(178, 58, 44, 0.06), transparent 60%);
  padding: 4px;
}
.wgp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.wgp-latin .wgp-seal-text {
  font-size: 8.5px;
  letter-spacing: 0.5px;
  line-height: 1.3;
}
.wgp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wgp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.wgp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.wgp-qr-inner {
  font-size: 8px;
  color: var(--wgp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--wgp-line);
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
  .wgp { padding: 10px; }
  .wgp-sheet { padding: 18px 14px 12px; }
  .wgp-title { font-size: 26px; letter-spacing: 6px; }
  .wgp-title-lg { font-size: 20px; letter-spacing: 3px; }
  .wgp-title-xl { font-size: 15px; letter-spacing: 1.5px; }
  .wgp-level-seal { min-width: 54px; height: 54px; }
  .wgp-level-text { font-size: 16px; }
  .wgp-latin .wgp-level-text { font-size: 10.5px; }
  .wgp-poem-line { font-size: 18px; letter-spacing: 3px; }
  .wgp-scroll { max-height: 230px; padding: 12px 12px; }
  .wgp-seal { width: 54px; height: 54px; }
  .wgp-emblem-svg { width: 160px; }
}
</style>
