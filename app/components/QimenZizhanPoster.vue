<template>
  <div class="qzp">
    <div class="qzp-sheet">
      <!-- ============ 顶部：批命笺题头 ============ -->
      <header class="qzp-head">
        <p class="qzp-kicker">{{ $t('qimenZizhan.poster.kicker') }}</p>
        <h2 class="qzp-title">{{ $t('qimenZizhan.poster.title') }}</h2>
        <p class="qzp-serial">{{ $t('qimenZizhan.poster.serial') }}</p>
        <p class="qzp-overview" :class="{ 'qzp-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('qimenZizhan.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 所问之事：横批 ============ -->
      <section class="qzp-question">
        <span class="qzp-question-flag">{{ $t('qimenZizhan.poster.questionFlag') }}</span>
        <p class="qzp-question-text">{{ questionText }}</p>
      </section>

      <!-- ============ 视觉核心：所测之字 + 朱批圈注 ============ -->
      <section class="qzp-stage">
        <ul class="qzp-anno qzp-anno-left">
          <li v-for="(note, i) in leftAnnotations" :key="'l' + i" class="qzp-anno-item">
            <span class="qzp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="qzp-anno-text">{{ note.text }}</span>
          </li>
        </ul>

        <div class="qzp-char-wrap">
          <div class="qzp-char-box">
            <span class="qzp-char">{{ chart.char }}</span>
            <span class="qzp-circle qzp-circle-a" aria-hidden="true" />
            <span class="qzp-circle qzp-circle-b" aria-hidden="true" />
          </div>
          <p class="qzp-char-meta">{{ charMeta }}</p>
        </div>

        <ul class="qzp-anno qzp-anno-right">
          <li v-for="(note, i) in rightAnnotations" :key="'r' + i" class="qzp-anno-item">
            <span class="qzp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="qzp-anno-text">{{ note.text }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 精简盘面：起局 + 用神三宫（星门神） ============ -->
      <div class="qzp-pan">
        <p class="qzp-pan-line">
          <span class="qzp-pan-flag">{{ $t('qimenZizhan.poster.panFlag') }}</span>
          <span class="qzp-pan-text">{{ panLine }}</span>
        </p>
        <p class="qzp-pan-line">
          <span class="qzp-pan-flag qzp-pan-flag-key">{{ $t('qimenZizhan.poster.ziFlag') }}</span>
          <span class="qzp-pan-text">{{ palaceText(chart.ziPalace) }}</span>
        </p>
        <p class="qzp-pan-line">
          <span class="qzp-pan-flag">{{ $t('qimenZizhan.poster.riFlag') }}</span>
          <span class="qzp-pan-text">{{ palaceText(chart.riPalace) }}</span>
        </p>
        <p class="qzp-pan-line">
          <span class="qzp-pan-flag">{{ $t('qimenZizhan.poster.shiFlag') }}</span>
          <span class="qzp-pan-text">{{ palaceText(chart.shiPalace) }}</span>
        </p>
      </div>

      <!-- ============ 宫位生克白话 ============ -->
      <p class="qzp-rel" :class="{ 'qzp-pending': !aiParsed.rel }">
        <span class="qzp-rel-label">{{ $t('qimenZizhan.poster.relLabel') }}</span>
        <span>{{ aiParsed.rel || $t('qimenZizhan.poster.fieldPending') }}</span>
      </p>

      <!-- ============ 竖排断语（数字/英文横排镶嵌） ============ -->
      <section class="qzp-verdict">
        <div class="qzp-verdict-scroll">
          <span class="qzp-verdict-flag">{{ $t('qimenZizhan.poster.verdictFlag') }}</span>
          <p class="qzp-verdict-text" :class="{ 'qzp-pending': !aiParsed.verdict }">
            <template v-for="(seg, i) in verdictSegments" :key="i">
              <span v-if="seg.latin" class="qzp-tcu">{{ seg.text }}</span>
              <template v-else>{{ seg.text }}</template>
            </template>
          </p>
        </div>
      </section>

      <!-- ============ 收口提点 ============ -->
      <p class="qzp-note">
        <span class="qzp-note-label">{{ $t('qimenZizhan.poster.noteLabel') }}</span>
        <span :class="{ 'qzp-pending': !aiParsed.tip }">
          {{ aiParsed.tip || $t('qimenZizhan.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 底部：盖印落款 + 工具页二维码 ============ -->
      <footer class="qzp-foot">
        <div class="qzp-foot-row">
          <div class="qzp-sign">
            <p class="qzp-sign-line">{{ signDate }}</p>
            <p class="qzp-sign-line qzp-sign-who">{{ $t('qimenZizhan.poster.signWho') }}</p>
          </div>
          <div class="qzp-seal" aria-hidden="true">
            <span class="qzp-seal-text">{{ sealText }}</span>
          </div>
          <div class="qzp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="qzp-qr-img" v-html="qrSvg" />
            <span v-else class="qzp-qr-inner">{{ $t('qimenZizhan.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QimenZizhanChart, ZizhanPalaceInfo } from '~/types/qimen-zizhan'

interface Props {
  chart: QimenZizhanChart
  question?: string
  /** AI 解读全文（OV:/PAL:/REL:/VERDICT:/TIP: 行协议），流式追加，海报实时融入 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  question: '',
  aiContent: '',
})
const { t } = useI18n()

const questionText = computed(() => props.question || t('qimenZizhan.noQuestion'))

const charMeta = computed(() => {
  const zi = props.chart.ziPalace
  return t('qimenZizhan.poster.charMeta', {
    strokes: props.chart.strokes,
    gongName: zi.gongName,
    gong: zi.gong,
    direction: zi.direction,
  })
})

/* ---------- 精简盘面：只列断事直接用到的信息 ---------- */

const panLine = computed(() => {
  const pan = props.chart.pan
  const yy = pan.yinYang === 'yang' ? t('qimenZizhan.poster.yang') : t('qimenZizhan.poster.yin')
  return t('qimenZizhan.poster.panLine', {
    yinyang: yy,
    ju: pan.juShu,
    jieqi: pan.jieqi,
    ri: pan.riGanzhi,
    shi: pan.shiGanzhi,
  })
})

function palaceText(p: ZizhanPalaceInfo): string {
  const men = p.men || t('qimenZizhan.poster.noMen')
  const jiGong = p.gong === 5 ? t('qimenZizhan.poster.jiKun') : ''
  return `${p.gongName}${p.gong}宫 · ${p.direction}${jiGong}｜${p.xing} · ${men} · ${p.shen}`
}

/* ---------- 盖印落款（只落日期与印，不留名号） ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date(props.chart.questionTime || Date.now())
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('qimenZizhan.poster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/qimen-zizhan`
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
  const text = aiParsed.value.verdict || t('qimenZizhan.poster.verdictPending')
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
/* ========== 奇门字占海报：仿古宣纸 + 朱批，与测字批命笺同源 ========== */
.qzp {
  --qzp-bg: #e6dbc0;
  --qzp-sheet: #f4ecd6;
  --qzp-ink: #3a2e1f;
  --qzp-ink-soft: #5c4f3a;
  --qzp-ink-faint: #8f8265;
  --qzp-line: #d3c6a6;
  --qzp-line-soft: #e2d8bc;
  --qzp-cinnabar: #b23a2c;
  --qzp-cinnabar-deep: #8e2a1f;
  background: var(--qzp-bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 20% 14%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 82% 80%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--qzp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.qzp-sheet {
  background: var(--qzp-sheet);
  border: 1px solid var(--qzp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
.qzp-sheet::before,
.qzp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--qzp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.qzp-sheet::before { top: -6px; transform: scaleY(-1); }
.qzp-sheet::after { bottom: -6px; }

/* ---------- 顶部题头 ---------- */
.qzp-head {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 3px double var(--qzp-ink);
}
.qzp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--qzp-ink-faint);
}
.qzp-title {
  margin: 4px 0 2px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--qzp-cinnabar);
  text-shadow:
    1px 1px 0 rgba(178, 58, 44, 0.16),
    0 0 1px var(--qzp-cinnabar-deep);
}
.qzp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--qzp-ink-faint);
}
.qzp-overview {
  margin: 10px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--qzp-ink-soft);
}
.qzp-pending { color: var(--qzp-ink-faint); font-style: italic; }

/* ---------- 所问之事横批 ---------- */
.qzp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--qzp-line);
  text-align: center;
}
.qzp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--qzp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.qzp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--qzp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 视觉核心：大字 + 朱批圈注 ---------- */
.qzp-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 4px 14px;
}
.qzp-char-wrap {
  flex-shrink: 0;
  text-align: center;
}
.qzp-char-box {
  position: relative;
  display: inline-block;
  padding: 8px;
}
.qzp-char {
  font-size: 148px;
  font-weight: 900;
  line-height: 1;
  color: var(--qzp-ink);
  letter-spacing: 0;
  text-shadow:
    2px 2px 0 rgba(58, 46, 31, 0.14),
    0 0 1px #241c12;
}
.qzp-circle {
  position: absolute;
  border: 2.5px solid var(--qzp-cinnabar);
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}
.qzp-circle-a {
  inset: -4px -10px 0 -6px;
  transform: rotate(-6deg) scale(1.02);
  border-width: 2.5px 3px 2px 3px;
}
.qzp-circle-b {
  inset: 2px -4px -6px -12px;
  transform: rotate(5deg);
  border-width: 2px 2.5px 3px 2px;
  opacity: 0.35;
}
.qzp-char-meta {
  margin: 10px 0 0;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--qzp-ink-faint);
}

.qzp-anno {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.qzp-anno-left { align-items: flex-start; text-align: left; }
.qzp-anno-right { align-items: flex-end; text-align: right; }
.qzp-anno-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 92px;
}
.qzp-anno-right .qzp-anno-item { align-items: flex-end; }
.qzp-anno-mark {
  display: inline-flex;
  font-size: 16px;
  font-weight: 700;
  color: var(--qzp-cinnabar);
  border: 1.5px solid var(--qzp-cinnabar);
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
.qzp-anno-text {
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  color: var(--qzp-cinnabar-deep);
  word-break: break-word;
}

/* ---------- 精简盘面：起局 + 用神三宫 ---------- */
.qzp-pan {
  margin: 12px 2px 0;
  padding: 8px 10px;
  border-top: 1px dashed var(--qzp-line);
  border-bottom: 1px dashed var(--qzp-line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.qzp-pan-line {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--qzp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.qzp-pan-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--qzp-cinnabar);
  border: 1px solid var(--qzp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.qzp-pan-flag-key {
  color: #f4ecd6;
  background: var(--qzp-cinnabar);
  opacity: 1;
}
.qzp-pan-text {
  word-break: break-word;
}

/* ---------- 宫位生克白话 ---------- */
.qzp-rel {
  margin: 12px 2px 0;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--qzp-ink-soft);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--qzp-line-soft);
  border-left: 2px solid var(--qzp-cinnabar);
  border-radius: 4px;
}
.qzp-rel-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--qzp-cinnabar);
  border: 1px solid var(--qzp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 竖排断语 ---------- */
.qzp-verdict {
  margin: 14px 0 0;
  display: flex;
  justify-content: center;
}
.qzp-verdict-scroll {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--qzp-line);
  border-bottom: 1px solid var(--qzp-line);
  writing-mode: vertical-rl;
  max-height: 200px;
}
.qzp-verdict-flag {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--qzp-cinnabar);
  padding-top: 2px;
}
.qzp-verdict-text {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--qzp-ink);
}
/* 竖排区内阿拉伯数字/英文横排镶嵌，不随中文旋转 */
.qzp-tcu {
  text-combine-upright: all;
  -webkit-text-combine: horizontal;
  letter-spacing: 0;
}

/* ---------- 收口提点 ---------- */
.qzp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--qzp-ink-soft);
  letter-spacing: 0.3px;
}
.qzp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--qzp-cinnabar);
  border: 1px solid var(--qzp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部：盖印落款 + 二维码 ---------- */
.qzp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--qzp-ink);
  padding-top: 12px;
}
.qzp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.qzp-sign {
  min-width: 0;
}
.qzp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--qzp-ink-faint);
  line-height: 1.7;
}
.qzp-sign-who {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--qzp-ink);
}
.qzp-seal {
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
.qzp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.qzp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qzp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.qzp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.qzp-qr-inner {
  font-size: 8px;
  color: var(--qzp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--qzp-line);
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
  .qzp { padding: 10px; }
  .qzp-sheet { padding: 18px 14px 12px; }
  .qzp-title { font-size: 28px; letter-spacing: 7px; }
  .qzp-char { font-size: 112px; }
  .qzp-stage { gap: 4px; padding: 14px 0 10px; }
  .qzp-anno-item { max-width: 76px; }
  .qzp-verdict-text { font-size: 16px; letter-spacing: 3px; }
  .qzp-seal { width: 54px; height: 54px; }
}
</style>
