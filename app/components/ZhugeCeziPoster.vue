<template>
  <div class="zcp" :class="{ 'zcp-latin': !isZh }">
    <div class="zcp-sheet">
      <!-- 顶部解字批命笺题头 -->
      <header class="zcp-head">
        <p class="zcp-kicker">{{ $t('zhugeCeziPoster.kicker') }}</p>
        <h2 class="zcp-title">{{ $t('zhugeCeziPoster.title') }}</h2>
        <p class="zcp-serial">{{ $t('zhugeCeziPoster.serial') }}</p>
        <p class="zcp-overview" :class="{ 'zcp-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('zhugeCeziPoster.overviewPending') }}
        </p>
      </header>

      <!-- 所问之事横批 -->
      <section class="zcp-question">
        <span class="zcp-question-flag">{{ $t('zhugeCeziPoster.questionFlag') }}</span>
        <p class="zcp-question-text">{{ questionText }}</p>
      </section>

      <!-- 视觉核心：所测三字 + 朱批圈注 -->
      <section class="zcp-stage">
        <!-- 左侧朱批（AI 拆字批注） -->
        <ul class="zcp-anno zcp-anno-left">
          <li v-for="(note, i) in leftAnnotations" :key="'l' + i" class="zcp-anno-item">
            <span class="zcp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="zcp-anno-text">{{ note.text }}</span>
          </li>
        </ul>

        <!-- 中央三字并排，各占一席、各顶一圈朱批 -->
        <div class="zcp-chars">
          <div v-for="(c, i) in result.chars" :key="c.char + i" class="zcp-char-box">
            <span class="zcp-char">{{ c.char }}</span>
            <span class="zcp-circle zcp-circle-a" aria-hidden="true" />
            <span class="zcp-circle zcp-circle-b" aria-hidden="true" />
          </div>
        </div>

        <!-- 右侧朱批 -->
        <ul class="zcp-anno zcp-anno-right">
          <li v-for="(note, i) in rightAnnotations" :key="'r' + i" class="zcp-anno-item">
            <span class="zcp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="zcp-anno-text">{{ note.text }}</span>
          </li>
        </ul>
      </section>

      <!-- 逐字取数小字行：X画 → 取Y · 宫位，拆字动作落成批注 -->
      <div class="zcp-decomp">
        <span v-for="(c, i) in result.chars" :key="'d' + i" class="zcp-decomp-cell">
          <em class="zcp-decomp-part">{{ c.char }}</em>
          <span class="zcp-decomp-info">
            {{ $t('zhugeCeziPoster.decompInfo', { strokes: c.strokes, digit: c.digit, pos: posLabel(i) }) }}
          </span>
        </span>
      </div>

      <!-- 推演批注：组数 → 折签，朱批小字行 -->
      <div class="zcp-derive">
        <p class="zcp-derive-line">
          <span class="zcp-derive-flag">{{ $t('zhugeCeziPoster.groupFlag') }}</span>
          <span class="zcp-derive-text">{{ groupLine }}</span>
        </p>
        <p class="zcp-derive-line">
          <span class="zcp-derive-flag">{{ $t('zhugeCeziPoster.foldFlag') }}</span>
          <span class="zcp-derive-text">{{ foldLine }}</span>
        </p>
      </div>

      <!-- 签意白话 -->
      <p class="zcp-sign" :class="{ 'zcp-pending': !aiParsed.sign }">
        <span class="zcp-sign-label">{{ $t('zhugeCeziPoster.signLabel') }}</span>
        <span class="zcp-sign-name">{{ qianLine }}</span>
        <span class="zcp-sign-text">{{ aiParsed.sign || $t('zhugeCeziPoster.signPending') }}</span>
      </p>

      <!-- 竖排区：右签诗、左断语，从右往左读（非中文 locale 断语改横排，拉丁字母竖排会溢出） -->
      <section class="zcp-oracle" :class="{ 'zcp-oracle-h': !isZh }">
        <div class="zcp-scroll zcp-scroll-poem">
          <span class="zcp-scroll-flag">{{ $t('zhugeCeziPoster.poemFlag') }}</span>
          <p class="zcp-poem">
            <span v-for="(line, i) in poemLines" :key="i" class="zcp-poem-line">{{ line }}</span>
          </p>
        </div>
        <div class="zcp-scroll zcp-scroll-verdict" :class="{ 'zcp-scroll-h': !isZh }">
          <span class="zcp-scroll-flag">{{ $t('zhugeCeziPoster.verdictFlag') }}</span>
          <p class="zcp-verdict-text" :class="{ 'zcp-pending': !aiParsed.verdict }">
            {{ aiParsed.verdict || $t('zhugeCeziPoster.verdictPending') }}
          </p>
        </div>
      </section>

      <!-- 隐士收口提点 -->
      <p class="zcp-note">
        <span class="zcp-note-label">{{ $t('zhugeCeziPoster.noteLabel') }}</span>
        <span :class="{ 'zcp-pending': !aiParsed.tip }">
          {{ aiParsed.tip || $t('zhugeCeziPoster.notePending') }}
        </span>
      </p>

      <!-- 底部：盖印落款 + 工具页二维码 -->
      <footer class="zcp-foot">
        <div class="zcp-foot-row">
          <div class="zcp-sign">
            <p class="zcp-sign-line">{{ signDate }}</p>
            <p class="zcp-sign-line zcp-sign-who">{{ $t('zhugeCeziPoster.signWho') }}</p>
          </div>
          <div class="zcp-seal" aria-hidden="true">
            <span class="zcp-seal-text">{{ sealText }}</span>
          </div>
          <div class="zcp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="zcp-qr-img" v-html="qrSvg" />
            <span v-else class="zcp-qr-inner">{{ $t('zhugeCeziPoster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZhugeCeziResult } from '~/types/zhuge-cezi'

interface Props {
  /** 诸葛神数测字完整结果 */
  result: ZhugeCeziResult
  /** AI 解读全文（OV:/PART:/SIGN:/VERDICT:/TIP: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  aiContent: '',
})
const { t, locale } = useI18n()

/* 拉丁字母竖排会旋转溢出，非中文 locale 断语改横排 */
const isZh = computed(() => locale.value.startsWith('zh'))

/* ---------- 所问之事 ---------- */

const questionText = computed(
  () => props.result.input.question || t('zhugeCeziPoster.noQuestion'),
)

/* ---------- 逐字取数：宫位 + 小字行 ---------- */

const posLabel = (i: number) =>
  [t('zhugeCeziPoster.posHundred'), t('zhugeCeziPoster.posTen'), t('zhugeCeziPoster.posOne')][i] ?? ''

/* ---------- 推演批注：组数 / 折签 ---------- */

const digits = computed(() => props.result.chars.map(c => c.digit).join(''))

const groupLine = computed(() =>
  t('zhugeCeziPoster.groupLine', { digits: digits.value, number: props.result.combinedNumber }),
)

const foldLine = computed(() => {
  const { combinedNumber, qianNumber } = props.result
  return combinedNumber > 384
    ? t('zhugeCeziPoster.foldReduce', { number: combinedNumber, qian: qianNumber })
    : t('zhugeCeziPoster.foldKeep', { number: combinedNumber })
})

const qianLine = computed(() =>
  t('zhugeCeziPoster.qianLine', {
    number: props.result.qianText.number,
    title: props.result.qianText.title,
  }),
)

/* ---------- 签诗竖排：按行/句读拆列，从右往左 ---------- */

const poemLines = computed(() => {
  const poem = props.result.qianText.poem || ''
  let lines = poem.split('\n').map(s => s.trim()).filter(Boolean)
  if (lines.length <= 1) {
    lines = poem.split(/[。；;]\s*/).map(s => s.trim()).filter(Boolean)
  }
  return lines.map(s => s.replace(/[，,。.；;、\s]+$/, '')).filter(Boolean).slice(0, 6)
})

/* ---------- 盖印落款 ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('zhugeCeziPoster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/zhuge-cezi`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})

/* ---------- AI 行协议解析：OV:/PART:/SIGN:/VERDICT:/TIP: ---------- */

interface AnnoNote {
  part: string
  text: string
}

interface AiParsed {
  overview: string
  parts: AnnoNote[]
  sign: string
  verdict: string
  tip: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', parts: [], sign: '', verdict: '', tip: '' }
  if (!text.trim()) return out

  // 截断：中文按字，拉丁文按词界，避免半个词
  const lim = (zh: number, en: number) => (isZh.value ? zh : en)
  const truncate = (s: string, n: number) => {
    if (s.length <= n) return s
    const cut = s.slice(0, n - 1)
    if (!isZh.value) {
      const sp = cut.lastIndexOf(' ')
      if (sp > n * 0.6) return `${cut.slice(0, sp)}…`
    }
    return `${cut}…`
  }
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const match = (line: string, tag: string) => line.startsWith(`${tag}:`) || line.startsWith(`${tag}：`)
  const body = (line: string, tag: string) => clean(line.slice(tag.length + 1))
  const chars = props.result.chars.map(c => c.char)

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (match(line, 'OV')) { if (!out.overview) out.overview = truncate(body(line, 'OV'), lim(60, 120)); continue }
    if (match(line, 'SIGN')) { if (!out.sign) out.sign = truncate(body(line, 'SIGN'), lim(60, 120)); continue }
    if (match(line, 'VERDICT')) { if (!out.verdict) out.verdict = truncate(body(line, 'VERDICT'), lim(72, 150)); continue }
    if (match(line, 'TIP')) { if (!out.tip) out.tip = truncate(body(line, 'TIP'), lim(50, 110)); continue }
    if (match(line, 'PART')) {
      if (out.parts.length >= 4) continue
      const raw = body(line, 'PART')
      // 拆出部件名（首个汉字/词）做朱批标记，余下作批注；英文批注可能不带汉字，
      // 退而找行内出现的所测之字，最后落「注」
      const m = raw.match(/^([「『]?[一-鿿⼀-⿟]{1,3}[」』]?)[，,、：:\s]*(.*)$/)
      const part = m
        ? m[1]!.replace(/[「」『』]/g, '')
        : (chars.find(c => raw.includes(c)) ?? '注')
      const noteText = m && m[2] ? m[2] : raw
      out.parts.push({ part: truncate(part, 3), text: truncate(noteText, lim(30, 56)) })
      continue
    }
  }

  return out
})

/* 朱批分左右两栏，围绕大字 */
const leftAnnotations = computed(() => aiParsed.value.parts.filter((_, i) => i % 2 === 0))
const rightAnnotations = computed(() => aiParsed.value.parts.filter((_, i) => i % 2 === 1))
</script>

<style scoped>
/* ========== 解字批命笺海报：仿古宣纸泛黄，与纸质海报同源但走古籍批注调性 ========== */
.zcp {
  /* 仿古宣纸泛黄色：比公文纸更暖、更旧 */
  --zcp-bg: #e6dbc0;
  --zcp-sheet: #f4ecd6;
  --zcp-ink: #3a2e1f;
  --zcp-ink-soft: #5c4f3a;
  --zcp-ink-faint: #8f8265;
  --zcp-line: #d3c6a6;
  --zcp-line-soft: #e2d8bc;
  /* 朱批红：朱砂，不艳 */
  --zcp-cinnabar: #b23a2c;
  --zcp-cinnabar-deep: #8e2a1f;
  background: var(--zcp-bg);
  /* 宣纸纹理：细密纤维横纹 + 局部做旧色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 20% 14%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 82% 80%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--zcp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.zcp-sheet {
  background: var(--zcp-sheet);
  border: 1px solid var(--zcp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 宣纸毛边：上下缘锯齿撕口 */
.zcp-sheet::before,
.zcp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--zcp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.zcp-sheet::before { top: -6px; transform: scaleY(-1); }
.zcp-sheet::after { bottom: -6px; }

/* ---------- 顶部题头 ---------- */
.zcp-head {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 3px double var(--zcp-ink);
}
.zcp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--zcp-ink-faint);
}
.zcp-title {
  margin: 4px 0 2px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--zcp-cinnabar);
  text-shadow:
    1px 1px 0 rgba(178, 58, 44, 0.16),
    0 0 1px var(--zcp-cinnabar-deep);
}
.zcp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--zcp-ink-faint);
}
.zcp-overview {
  margin: 10px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--zcp-ink-soft);
}
.zcp-pending { color: var(--zcp-ink-faint); font-style: italic; }

/* ---------- 所问之事横批 ---------- */
.zcp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--zcp-line);
  text-align: center;
}
.zcp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--zcp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.zcp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--zcp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 视觉核心：三字并排 + 朱批圈注 ---------- */
.zcp-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 4px 14px;
}
.zcp-chars {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
}
.zcp-char-box {
  position: relative;
  display: inline-block;
  padding: 8px;
}
.zcp-char {
  font-size: 92px;
  font-weight: 900;
  line-height: 1;
  color: var(--zcp-ink);
  letter-spacing: 0;
  /* 毛笔字年代感：浓墨多重描边 */
  text-shadow:
    2px 2px 0 rgba(58, 46, 31, 0.14),
    0 0 1px #241c12;
}
/* 朱批手绘圈：两枚不规则椭圆，叠出圈划感 */
.zcp-circle {
  position: absolute;
  border: 2.5px solid var(--zcp-cinnabar);
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}
.zcp-circle-a {
  inset: -4px -10px 0 -6px;
  transform: rotate(-6deg) scale(1.02);
  border-width: 2.5px 3px 2px 3px;
}
.zcp-circle-b {
  inset: 2px -4px -6px -12px;
  transform: rotate(5deg);
  border-width: 2px 2.5px 3px 2px;
  opacity: 0.35;
}

/* 朱批注栏：竖排小字，圈出部件 + 批注 */
.zcp-anno {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.zcp-anno-left { align-items: flex-start; text-align: left; }
.zcp-anno-right { align-items: flex-end; text-align: right; }
.zcp-anno-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 92px;
}
.zcp-anno-right .zcp-anno-item { align-items: flex-end; }
.zcp-anno-mark {
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  color: var(--zcp-cinnabar);
  border: 1.5px solid var(--zcp-cinnabar);
  border-radius: 50%;
  min-width: 30px;
  height: 30px;
  padding: 0 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform: rotate(-6deg);
  opacity: 0.85;
}
.zcp-anno-text {
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  color: var(--zcp-cinnabar-deep);
  word-break: break-word;
}

/* ---------- 逐字取数小字行 ---------- */
.zcp-decomp {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  padding: 8px 4px 4px;
  border-top: 1px dashed var(--zcp-line);
}
.zcp-decomp-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}
.zcp-decomp-part {
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  color: var(--zcp-ink);
}
.zcp-decomp-info {
  font-size: 10.5px;
  letter-spacing: 0.5px;
  color: var(--zcp-ink-faint);
}

/* ---------- 推演批注：组数 → 折签，朱批小字行 ---------- */
.zcp-derive {
  margin: 12px 2px 0;
  padding: 8px 10px;
  border-top: 1px dashed var(--zcp-line);
  border-bottom: 1px dashed var(--zcp-line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.zcp-derive-line {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--zcp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.zcp-derive-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--zcp-cinnabar);
  border: 1px solid var(--zcp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.zcp-derive-text {
  word-break: break-word;
}

/* ---------- 签意白话 ---------- */
.zcp-sign {
  margin: 12px 2px 0;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--zcp-ink-soft);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--zcp-line-soft);
  border-left: 2px solid var(--zcp-cinnabar);
  border-radius: 4px;
}
.zcp-sign-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--zcp-cinnabar);
  border: 1px solid var(--zcp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}
.zcp-sign-name {
  font-weight: 700;
  color: var(--zcp-ink);
  margin-right: 6px;
}

/* ---------- 竖排区：右签诗、左断语 ---------- */
.zcp-oracle {
  margin: 14px 0 0;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 14px;
}
.zcp-scroll {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid var(--zcp-line);
  border-bottom: 1px solid var(--zcp-line);
  /* 竖排：从右往左 */
  writing-mode: vertical-rl;
  max-height: 220px;
}
.zcp-scroll-flag {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--zcp-cinnabar);
  padding-top: 2px;
}
.zcp-poem {
  margin: 0;
  display: flex;
  gap: 8px;
}
.zcp-poem-line {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 3px;
  line-height: 1.5;
  color: var(--zcp-ink-soft);
}
.zcp-verdict-text {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--zcp-ink);
}

/* ---------- 非中文 locale：断语改横排签文块，签诗（中文原文）仍竖排 ---------- */
.zcp-oracle-h {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}
.zcp-oracle-h .zcp-scroll-poem {
  align-self: center;
}
.zcp-scroll-h {
  writing-mode: horizontal-tb;
  max-height: none;
  display: block;
  text-align: center;
}
.zcp-scroll-h .zcp-scroll-flag {
  display: inline-block;
  padding-top: 0;
  margin-bottom: 4px;
  letter-spacing: 2px;
}
.zcp-scroll-h .zcp-verdict-text {
  font-size: 15.5px;
  letter-spacing: 0.5px;
  line-height: 1.8;
}
/* 拉丁文批注栏：放宽栏宽、按词换行，别硬切单词 */
.zcp-latin .zcp-anno-item {
  max-width: 124px;
}
.zcp-latin .zcp-anno-text {
  font-size: 10px;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* ---------- 隐士收口提点 ---------- */
.zcp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--zcp-ink-soft);
  letter-spacing: 0.3px;
}
.zcp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--zcp-cinnabar);
  border: 1px solid var(--zcp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部：盖印落款 + 二维码 ---------- */
.zcp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--zcp-ink);
  padding-top: 12px;
}
.zcp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.zcp-sign {
  min-width: 0;
}
.zcp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--zcp-ink-faint);
  line-height: 1.7;
}
.zcp-sign-who {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--zcp-ink);
}
/* 仿盖印：方形朱文章，做旧、微歪斜 */
.zcp-seal {
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
.zcp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.zcp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.zcp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.zcp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.zcp-qr-inner {
  font-size: 8px;
  color: var(--zcp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--zcp-line);
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
  .zcp { padding: 10px; }
  .zcp-sheet { padding: 18px 14px 12px; }
  .zcp-title { font-size: 28px; letter-spacing: 7px; }
  .zcp-char { font-size: 64px; }
  .zcp-chars { gap: 4px; }
  .zcp-stage { gap: 4px; padding: 14px 0 10px; }
  .zcp-anno-item { max-width: 64px; }
  .zcp-latin .zcp-anno-item { max-width: 88px; }
  .zcp-oracle { gap: 8px; }
  .zcp-poem-line { font-size: 14px; letter-spacing: 2px; }
  .zcp-verdict-text { font-size: 16px; letter-spacing: 3px; }
  .zcp-scroll-h .zcp-verdict-text { font-size: 14px; letter-spacing: 0.3px; }
  .zcp-seal { width: 54px; height: 54px; }
}
</style>
