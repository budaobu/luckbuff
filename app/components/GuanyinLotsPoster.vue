<template>
  <div class="gyp" :class="{ 'gyp-latin': !isZh }">
    <div class="gyp-sheet">
      <!-- 顶部品牌横条 -->
      <div class="gyp-topbar">
        <span class="gyp-brand">{{ $t('guanyinPoster.kicker') }}</span>
        <span class="gyp-serial">{{ $t('guanyinPoster.serial') }}</span>
      </div>

      <!-- 头部：签号 + 典故名 + 吉凶印章 -->
      <header class="gyp-head">
        <div class="gyp-head-main">
          <p class="gyp-number">{{ $t('guanyinPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="gyp-title">{{ result.fortune.title }}</h2>
        </div>
        <div class="gyp-level-seal" aria-hidden="true">
          <span class="gyp-level-text">{{ result.fortune.level }}</span>
        </div>
      </header>

      <!-- 所问之事横批 -->
      <section class="gyp-question">
        <span class="gyp-question-flag">{{ $t('guanyinPoster.questionFlag') }}</span>
        <p class="gyp-question-text">{{ questionText }}</p>
      </section>

      <!-- 典故插画：有素材用黑白线条插画，无素材落文字注脚 -->
      <section class="gyp-story">
        <img
          v-if="illustrationSrc"
          :src="illustrationSrc"
          :alt="$t('guanyinPoster.illustrationAlt', { title: result.fortune.title })"
          class="gyp-story-img"
        >
        <p v-else class="gyp-story-note">{{ $t('guanyinPoster.storyFallback', { title: result.fortune.title }) }}</p>
      </section>

      <!-- 签诗竖排：从右往左读，阿拉伯数字/英文横排镶嵌 -->
      <section class="gyp-oracle">
        <div class="gyp-scroll">
          <span class="gyp-scroll-flag">{{ $t('guanyinPoster.poemFlag') }}</span>
          <p class="gyp-poem">
            <span v-for="(line, i) in poemLines" :key="i" class="gyp-poem-line">
              <template v-for="(seg, j) in line" :key="j">
                <span v-if="seg.latin" class="gyp-tcu">{{ seg.text }}</span>
                <template v-else>{{ seg.text }}</template>
              </template>
            </span>
          </p>
        </div>
      </section>

      <!-- 签意 / 签示 / 问事指引 -->
      <section class="gyp-verdicts">
        <p class="gyp-verdict-line">
          <span class="gyp-verdict-flag">{{ $t('guanyinPoster.explanationLabel') }}</span>
          <span class="gyp-verdict-text">{{ result.fortune.explanation }}</span>
        </p>
        <p class="gyp-verdict-line">
          <span class="gyp-verdict-flag">{{ $t('guanyinPoster.adviceLabel') }}</span>
          <span class="gyp-verdict-text">{{ result.fortune.advice }}</span>
        </p>
        <p class="gyp-verdict-line">
          <span class="gyp-verdict-flag">{{ $t('guanyinPoster.guidanceLabel') }}</span>
          <span class="gyp-verdict-text" :class="{ 'gyp-pending': !guidance }">
            {{ guidance || $t('guanyinPoster.guidancePending') }}
          </span>
        </p>
      </section>

      <!-- 底部：落款 + 盖印 + 工具页二维码（整张海报唯一二维码） -->
      <footer class="gyp-foot">
        <div class="gyp-foot-row">
          <div class="gyp-sign">
            <p class="gyp-sign-line">{{ signDate }}</p>
            <p class="gyp-sign-line gyp-sign-site">{{ siteDomain }}</p>
            <p class="gyp-sign-line gyp-sign-note">{{ $t('guanyinPoster.footerNote') }}</p>
          </div>
          <div class="gyp-seal" aria-hidden="true">
            <span class="gyp-seal-text">{{ sealText }}</span>
          </div>
          <div class="gyp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="gyp-qr-img" v-html="qrSvg" />
            <span v-else class="gyp-qr-inner">{{ $t('guanyinPoster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GUANYIN_ILLUSTRATIONS } from '~/data/guanyin-illustrations'

interface GuanyinFortune {
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
    fortune: GuanyinFortune
    question?: string
  }
  /** AI 解读全文（markdown 三段结构）。流式追加，海报实时融入「问事指引」。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()

/* 拉丁字母竖排会旋转溢出；签诗为中文原文保持竖排，其余文案按 locale 横排 */
const isZh = computed(() => locale.value.startsWith('zh'))

const siteDomain = 'www.ososn.com'

/* ---------- 所问之事 ---------- */

const questionText = computed(
  () => props.result.question || t('guanyinPoster.noQuestion'),
)

/* ---------- 典故插画：按签号索引预制素材库，缺素材落文字注脚 ---------- */

const illustrationSrc = computed(() => GUANYIN_ILLUSTRATIONS[props.result.fortune.number] ?? '')

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

/* ---------- 问事指引：从 AI 三段解读中取「问事指引」首句，白话简短判断 ---------- */

const guidance = computed(() => {
  const text = props.aiContent || ''
  if (!text.trim()) return ''
  const m = text.match(/##\s*问事指引\s*\n([\s\S]*?)(?=\n##\s|$)/)
    || text.match(/##\s*Guidance\s*\n([\s\S]*?)(?=\n##\s|$)/i)
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
  t('guanyinPoster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/guanyin-lots`
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
/* ========== 庙宇签谱海报：仿古宣纸 + 朱砂印章，与批命笺同源纸质调性 ========== */
.gyp {
  --gyp-bg: #e6dbc0;
  --gyp-sheet: #f4ecd6;
  --gyp-ink: #3a2e1f;
  --gyp-ink-soft: #5c4f3a;
  --gyp-ink-faint: #8f8265;
  --gyp-line: #d3c6a6;
  --gyp-line-soft: #e2d8bc;
  --gyp-cinnabar: #b23a2c;
  --gyp-cinnabar-deep: #8e2a1f;
  background: var(--gyp-bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 78% 10%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 18% 84%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--gyp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.gyp-sheet {
  background: var(--gyp-sheet);
  border: 1px solid var(--gyp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 宣纸毛边：上下缘锯齿撕口 */
.gyp-sheet::before,
.gyp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--gyp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.gyp-sheet::before { top: -6px; transform: scaleY(-1); }
.gyp-sheet::after { bottom: -6px; }

/* ---------- 顶部品牌横条 ---------- */
.gyp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--gyp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--gyp-ink-faint);
}
.gyp-brand { font-weight: 700; color: var(--gyp-ink-soft); }
.gyp-serial { letter-spacing: 1px; }

/* ---------- 头部：签号 + 典故名 + 吉凶印章 ---------- */
.gyp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 2px 14px;
  border-bottom: 3px double var(--gyp-ink);
}
.gyp-head-main { min-width: 0; }
.gyp-number {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--gyp-ink-faint);
}
.gyp-title {
  margin: 4px 0 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1.1;
  color: var(--gyp-ink);
}
/* 吉凶等级：方形印章式边框文字标注，无星级/色彩分级图标 */
.gyp-level-seal {
  flex-shrink: 0;
  min-width: 62px;
  height: 62px;
  padding: 4px;
  border: 2.5px solid var(--gyp-cinnabar);
  border-radius: 6px;
  color: var(--gyp-cinnabar);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(-4deg);
  background: radial-gradient(circle at 38% 32%, rgba(178, 58, 44, 0.07), transparent 60%);
  box-shadow: inset 0 0 0 1.5px rgba(178, 58, 44, 0.22);
}
.gyp-level-text {
  font-size: 19px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.2;
}
.gyp-latin .gyp-level-text { font-size: 12px; letter-spacing: 0.5px; }

/* ---------- 所问之事横批 ---------- */
.gyp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--gyp-line);
  text-align: center;
}
.gyp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--gyp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.gyp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--gyp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 典故插画区 ---------- */
.gyp-story {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 8px 6px;
  min-height: 40px;
}
.gyp-story-img {
  display: block;
  width: 200px;
  max-width: 62%;
  height: auto;
  opacity: 0.92;
  mix-blend-mode: multiply;
}
.gyp-story-note {
  margin: 0;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--gyp-ink-faint);
  border: 1px dashed var(--gyp-line);
  padding: 4px 12px;
  border-radius: 999px;
}

/* ---------- 签诗竖排 ---------- */
.gyp-oracle {
  margin: 8px 0 0;
  display: flex;
  justify-content: center;
}
.gyp-scroll {
  padding: 14px 16px;
  border-top: 1px solid var(--gyp-line);
  border-bottom: 1px solid var(--gyp-line);
  /* 竖排块流：从右往左，子块依次成列（flex 在此浏览器下会把列压成横向 rtl，勿改回 flex） */
  writing-mode: vertical-rl;
  max-height: 260px;
}
.gyp-scroll-flag {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--gyp-cinnabar);
  padding-top: 2px;
  margin-left: 10px;
}
.gyp-poem {
  margin: 0;
}
.gyp-poem-line {
  display: block;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--gyp-ink);
  margin-left: 10px;
}
/* 竖排区内阿拉伯数字/英文横排镶嵌，不随中文旋转 */
.gyp-tcu {
  text-combine-upright: all;
  -webkit-text-combine: horizontal;
  letter-spacing: 0;
}

/* ---------- 签意 / 签示 / 问事指引 ---------- */
.gyp-verdicts {
  margin: 12px 2px 0;
  padding: 10px 10px;
  border-top: 1px dashed var(--gyp-line);
  border-bottom: 1px dashed var(--gyp-line);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.gyp-verdict-line {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  letter-spacing: 0.3px;
  color: var(--gyp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.gyp-verdict-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--gyp-cinnabar);
  border: 1px solid var(--gyp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.gyp-verdict-text { word-break: break-word; }
.gyp-pending { color: var(--gyp-ink-faint); font-style: italic; }

/* ---------- 底部：落款 + 盖印 + 二维码 ---------- */
.gyp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--gyp-ink);
  padding-top: 12px;
}
.gyp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.gyp-sign { min-width: 0; }
.gyp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--gyp-ink-faint);
  line-height: 1.7;
}
.gyp-sign-site {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gyp-ink);
}
.gyp-sign-note { font-size: 9.5px; }
/* 仿盖印：方形朱文章，做旧、微歪斜 */
.gyp-seal {
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
.gyp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.gyp-latin .gyp-seal-text {
  font-size: 8.5px;
  letter-spacing: 0.5px;
  line-height: 1.3;
}
.gyp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gyp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.gyp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.gyp-qr-inner {
  font-size: 8px;
  color: var(--gyp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--gyp-line);
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
  .gyp { padding: 10px; }
  .gyp-sheet { padding: 18px 14px 12px; }
  .gyp-title { font-size: 26px; letter-spacing: 6px; }
  .gyp-level-seal { min-width: 54px; height: 54px; }
  .gyp-level-text { font-size: 16px; }
  .gyp-latin .gyp-level-text { font-size: 10.5px; }
  .gyp-poem-line { font-size: 18px; letter-spacing: 3px; }
  .gyp-scroll { max-height: 230px; padding: 12px 12px; }
  .gyp-seal { width: 54px; height: 54px; }
  .gyp-story-img { width: 160px; }
}
</style>
