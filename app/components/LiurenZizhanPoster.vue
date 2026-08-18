<template>
  <div class="lzp">
    <div class="lzp-sheet">
      <!-- ============ 顶部：批命笺题头 ============ -->
      <header class="lzp-head">
        <p class="lzp-kicker">{{ $t('liurenZizhan.poster.kicker') }}</p>
        <h2 class="lzp-title">{{ $t('liurenZizhan.poster.title') }}</h2>
        <p class="lzp-serial">{{ $t('liurenZizhan.poster.serial') }}</p>
        <p class="lzp-overview" :class="{ 'lzp-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('liurenZizhan.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 所问之事：横批 ============ -->
      <section class="lzp-question">
        <span class="lzp-question-flag">{{ $t('liurenZizhan.poster.questionFlag') }}</span>
        <p class="lzp-question-text">{{ questionText }}</p>
      </section>

      <!-- ============ 视觉核心：所测之字 + 朱批圈注 ============ -->
      <section class="lzp-stage">
        <ul class="lzp-anno lzp-anno-left">
          <li v-for="(note, i) in leftAnnotations" :key="'l' + i" class="lzp-anno-item">
            <span class="lzp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="lzp-anno-text">{{ note.text }}</span>
          </li>
        </ul>

        <div class="lzp-char-wrap">
          <div class="lzp-char-box">
            <span class="lzp-char">{{ chart.char }}</span>
            <span class="lzp-circle lzp-circle-a" aria-hidden="true" />
            <span class="lzp-circle lzp-circle-b" aria-hidden="true" />
          </div>
          <p class="lzp-char-meta">{{ charMeta }}</p>
        </div>

        <ul class="lzp-anno lzp-anno-right">
          <li v-for="(note, i) in rightAnnotations" :key="'r' + i" class="lzp-anno-item">
            <span class="lzp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="lzp-anno-text">{{ note.text }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 精简课传：起课 + 三数落宫 ============ -->
      <div class="lzp-pan">
        <p class="lzp-pan-line">
          <span class="lzp-pan-flag">{{ $t('liurenZizhan.poster.panFlag') }}</span>
          <span class="lzp-pan-text">{{ panLine }}</span>
        </p>
        <p v-for="(step, i) in chart.steps" :key="i" class="lzp-pan-line">
          <span class="lzp-pan-flag" :class="{ 'lzp-pan-flag-key': i === chart.steps.length - 1 }">
            {{ stepFlag(i) }}
          </span>
          <span class="lzp-pan-text">{{ stepText(step, i) }}</span>
        </p>
      </div>

      <!-- ============ 课传走势白话 ============ -->
      <p class="lzp-rel" :class="{ 'lzp-pending': !aiParsed.rel }">
        <span class="lzp-rel-label">{{ $t('liurenZizhan.poster.relLabel') }}</span>
        <span>{{ aiParsed.rel || $t('liurenZizhan.poster.fieldPending') }}</span>
      </p>

      <!-- ============ 竖排断语（数字/英文横排镶嵌） ============ -->
      <section class="lzp-verdict">
        <div class="lzp-verdict-scroll">
          <span class="lzp-verdict-flag">{{ $t('liurenZizhan.poster.verdictFlag') }}</span>
          <p class="lzp-verdict-text" :class="{ 'lzp-pending': !aiParsed.verdict }">
            <template v-for="(seg, i) in verdictSegments" :key="i">
              <span v-if="seg.latin" class="lzp-tcu">{{ seg.text }}</span>
              <template v-else>{{ seg.text }}</template>
            </template>
          </p>
        </div>
      </section>

      <!-- ============ 收口提点 ============ -->
      <p class="lzp-note">
        <span class="lzp-note-label">{{ $t('liurenZizhan.poster.noteLabel') }}</span>
        <span :class="{ 'lzp-pending': !aiParsed.tip }">
          {{ aiParsed.tip || $t('liurenZizhan.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 底部：盖印落款 + 工具页二维码 ============ -->
      <footer class="lzp-foot">
        <div class="lzp-foot-row">
          <div class="lzp-sign">
            <p class="lzp-sign-line">{{ signDate }}</p>
            <p class="lzp-sign-line lzp-sign-who">{{ $t('liurenZizhan.poster.signWho') }}</p>
          </div>
          <div class="lzp-seal" aria-hidden="true">
            <span class="lzp-seal-text">{{ sealText }}</span>
          </div>
          <div class="lzp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="lzp-qr-img" v-html="qrSvg" />
            <span v-else class="lzp-qr-inner">{{ $t('liurenZizhan.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiurenZizhanChart } from '~/types/liuren-zizhan'
import type { XiaoLiurenStep } from '~/types/xiao-liuren'

interface Props {
  chart: LiurenZizhanChart
  question?: string
  /** AI 解读全文（OV:/PAL:/REL:/VERDICT:/TIP: 行协议），流式追加，海报实时融入 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  question: '',
  aiContent: '',
})
const { t } = useI18n()

const POSITION_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']
const positionName = (index: number) => POSITION_NAMES[((index % 6) + 6) % 6]!

const questionText = computed(() => props.question || t('liurenZizhan.noQuestion'))

const charMeta = computed(() =>
  t('liurenZizhan.poster.charMeta', { strokes: props.chart.strokes }),
)

/* ---------- 精简课传：只列断事直接用到的信息 ---------- */

const panLine = computed(() =>
  t('liurenZizhan.poster.panLine', {
    lunar: props.chart.lunarDate,
    hour: props.chart.hourBranch,
  }),
)

const stepFlagKeys = ['charFlag', 'dayFlag', 'hourFlag'] as const
function stepFlag(i: number): string {
  return t(`liurenZizhan.poster.${stepFlagKeys[i] ?? 'hourFlag'}`)
}

function stepText(step: XiaoLiurenStep, i: number): string {
  const name = positionName(step.positionIndex)
  const isFinal = i === props.chart.steps.length - 1
  const base = `${step.label} ${step.value} → ${name}`
  return isFinal
    ? `${base}｜${props.chart.finalPosition.summary}`
    : base
}

/* ---------- 盖印落款（只落日期与印，不留名号） ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date(props.chart.questionTime || Date.now())
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('liurenZizhan.poster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/liuren-zizhan`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})

/* ---------- AI 行协议解析：OV:/PAL:/REL:/VERDICT:/TIP: ---------- */

interface AnnoNote {
  part: string
  text: string
}

interface AiParsed {
  overview: string
  pals: AnnoNote[]
  rel: string
  verdict: string
  tip: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', pals: [], rel: '', verdict: '', tip: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const match = (line: string, tag: string) => line.startsWith(`${tag}:`) || line.startsWith(`${tag}：`)
  const body = (line: string, tag: string) => clean(line.slice(tag.length + 1))

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (match(line, 'OV')) { if (!out.overview) out.overview = truncate(body(line, 'OV'), 60); continue }
    if (match(line, 'REL')) { if (!out.rel) out.rel = truncate(body(line, 'REL'), 60); continue }
    if (match(line, 'VERDICT')) { if (!out.verdict) out.verdict = truncate(body(line, 'VERDICT'), 72); continue }
    if (match(line, 'TIP')) { if (!out.tip) out.tip = truncate(body(line, 'TIP'), 50); continue }
    if (match(line, 'PAL')) {
      if (out.pals.length >= 4) continue
      const raw = body(line, 'PAL')
      const m = raw.match(/^([「『]?[一-鿿⼀-⿟]{1,3}[」』]?)[，,、：:\s]*(.*)$/)
      const part = m ? m[1]!.replace(/[「」『』]/g, '') : '注'
      const noteText = m && m[2] ? m[2] : raw
      out.pals.push({ part: truncate(part, 3), text: truncate(noteText, 30) })
      continue
    }
  }

  return out
})

const leftAnnotations = computed(() => aiParsed.value.pals.filter((_, i) => i % 2 === 0))
const rightAnnotations = computed(() => aiParsed.value.pals.filter((_, i) => i % 2 === 1))

/* ---------- 竖排断语：数字/英文横排镶嵌 ---------- */

interface Segment {
  text: string
  latin: boolean
}

const verdictSegments = computed<Segment[]>(() => {
  const text = aiParsed.value.verdict || t('liurenZizhan.poster.verdictPending')
  const out: Segment[] = []
  const re = /[A-Za-z0-9]+/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), latin: false })
    out.push({ text: m[0], latin: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), latin: false })
  return out
})
</script>

<style scoped>
/* ========== 六壬字占海报：仿古宣纸 + 朱批，与测字批命笺同源 ========== */
.lzp {
  --lzp-bg: #e6dbc0;
  --lzp-sheet: #f4ecd6;
  --lzp-ink: #3a2e1f;
  --lzp-ink-soft: #5c4f3a;
  --lzp-ink-faint: #8f8265;
  --lzp-line: #d3c6a6;
  --lzp-line-soft: #e2d8bc;
  --lzp-cinnabar: #b23a2c;
  --lzp-cinnabar-deep: #8e2a1f;
  background: var(--lzp-bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 20% 14%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 82% 80%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--lzp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.lzp-sheet {
  background: var(--lzp-sheet);
  border: 1px solid var(--lzp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
.lzp-sheet::before,
.lzp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--lzp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.lzp-sheet::before { top: -6px; transform: scaleY(-1); }
.lzp-sheet::after { bottom: -6px; }

/* ---------- 顶部题头 ---------- */
.lzp-head {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 3px double var(--lzp-ink);
}
.lzp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--lzp-ink-faint);
}
.lzp-title {
  margin: 4px 0 2px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--lzp-cinnabar);
  text-shadow:
    1px 1px 0 rgba(178, 58, 44, 0.16),
    0 0 1px var(--lzp-cinnabar-deep);
}
.lzp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--lzp-ink-faint);
}
.lzp-overview {
  margin: 10px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--lzp-ink-soft);
}
.lzp-pending { color: var(--lzp-ink-faint); font-style: italic; }

/* ---------- 所问之事横批 ---------- */
.lzp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--lzp-line);
  text-align: center;
}
.lzp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--lzp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.lzp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--lzp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 视觉核心：大字 + 朱批圈注 ---------- */
.lzp-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 4px 14px;
}
.lzp-char-wrap {
  flex-shrink: 0;
  text-align: center;
}
.lzp-char-box {
  position: relative;
  display: inline-block;
  padding: 8px;
}
.lzp-char {
  font-size: 148px;
  font-weight: 900;
  line-height: 1;
  color: var(--lzp-ink);
  letter-spacing: 0;
  text-shadow:
    2px 2px 0 rgba(58, 46, 31, 0.14),
    0 0 1px #241c12;
}
.lzp-circle {
  position: absolute;
  border: 2.5px solid var(--lzp-cinnabar);
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}
.lzp-circle-a {
  inset: -4px -10px 0 -6px;
  transform: rotate(-6deg) scale(1.02);
  border-width: 2.5px 3px 2px 3px;
}
.lzp-circle-b {
  inset: 2px -4px -6px -12px;
  transform: rotate(5deg);
  border-width: 2px 2.5px 3px 2px;
  opacity: 0.35;
}
.lzp-char-meta {
  margin: 10px 0 0;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--lzp-ink-faint);
}

.lzp-anno {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lzp-anno-left { align-items: flex-start; text-align: left; }
.lzp-anno-right { align-items: flex-end; text-align: right; }
.lzp-anno-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 92px;
}
.lzp-anno-right .lzp-anno-item { align-items: flex-end; }
.lzp-anno-mark {
  display: inline-flex;
  font-size: 16px;
  font-weight: 700;
  color: var(--lzp-cinnabar);
  border: 1.5px solid var(--lzp-cinnabar);
  border-radius: 50%;
  min-width: 30px;
  height: 30px;
  padding: 0 3px;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform: rotate(-6deg);
  opacity: 0.85;
}
.lzp-anno-text {
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  color: var(--lzp-cinnabar-deep);
  word-break: break-word;
}

/* ---------- 精简课传：起课 + 三数落宫 ---------- */
.lzp-pan {
  margin: 12px 2px 0;
  padding: 8px 10px;
  border-top: 1px dashed var(--lzp-line);
  border-bottom: 1px dashed var(--lzp-line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.lzp-pan-line {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lzp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.lzp-pan-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--lzp-cinnabar);
  border: 1px solid var(--lzp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.lzp-pan-flag-key {
  color: #f4ecd6;
  background: var(--lzp-cinnabar);
  opacity: 1;
}
.lzp-pan-text {
  word-break: break-word;
}

/* ---------- 课传走势白话 ---------- */
.lzp-rel {
  margin: 12px 2px 0;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lzp-ink-soft);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--lzp-line-soft);
  border-left: 2px solid var(--lzp-cinnabar);
  border-radius: 4px;
}
.lzp-rel-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lzp-cinnabar);
  border: 1px solid var(--lzp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 竖排断语 ---------- */
.lzp-verdict {
  margin: 14px 0 0;
  display: flex;
  justify-content: center;
}
.lzp-verdict-scroll {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--lzp-line);
  border-bottom: 1px solid var(--lzp-line);
  writing-mode: vertical-rl;
  max-height: 200px;
}
.lzp-verdict-flag {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--lzp-cinnabar);
  padding-top: 2px;
}
.lzp-verdict-text {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--lzp-ink);
}
/* 竖排区内阿拉伯数字/英文横排镶嵌，不随中文旋转 */
.lzp-tcu {
  text-combine-upright: all;
  -webkit-text-combine: horizontal;
  letter-spacing: 0;
}

/* ---------- 收口提点 ---------- */
.lzp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--lzp-ink-soft);
  letter-spacing: 0.3px;
}
.lzp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lzp-cinnabar);
  border: 1px solid var(--lzp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部：盖印落款 + 二维码 ---------- */
.lzp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--lzp-ink);
  padding-top: 12px;
}
.lzp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.lzp-sign {
  min-width: 0;
}
.lzp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--lzp-ink-faint);
  line-height: 1.7;
}
.lzp-sign-who {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lzp-ink);
}
.lzp-seal {
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
.lzp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.lzp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lzp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.lzp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.lzp-qr-inner {
  font-size: 8px;
  color: var(--lzp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--lzp-line);
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
  .lzp { padding: 10px; }
  .lzp-sheet { padding: 18px 14px 12px; }
  .lzp-title { font-size: 28px; letter-spacing: 7px; }
  .lzp-char { font-size: 112px; }
  .lzp-stage { gap: 4px; padding: 14px 0 10px; }
  .lzp-anno-item { max-width: 76px; }
  .lzp-verdict-text { font-size: 16px; letter-spacing: 3px; }
  .lzp-seal { width: 54px; height: 54px; }
}
</style>
