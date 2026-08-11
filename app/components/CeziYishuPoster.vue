<template>
  <div class="czp">
    <div class="czp-sheet">
      <!-- ============ 顶部：批命笺题头 ============ -->
      <header class="czp-head">
        <p class="czp-kicker">{{ $t('ceziYishu.poster.kicker') }}</p>
        <h2 class="czp-title">{{ $t('ceziYishu.poster.title') }}</h2>
        <p class="czp-serial">{{ $t('ceziYishu.poster.serial') }}</p>
        <!-- AI 点题：这个字问这件事是什么兆头 -->
        <p class="czp-overview" :class="{ 'czp-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('ceziYishu.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 所问之事：签文式横批 ============ -->
      <section class="czp-question">
        <span class="czp-question-flag">{{ $t('ceziYishu.poster.questionFlag') }}</span>
        <p class="czp-question-text">{{ questionText }}</p>
      </section>

      <!-- ============ 视觉核心：所测之字 + 朱批圈注 ============ -->
      <section class="czp-stage">
        <!-- 左侧朱批（垂直批注栏） -->
        <ul class="czp-anno czp-anno-left">
          <li v-for="(note, i) in leftAnnotations" :key="'l' + i" class="czp-anno-item">
            <span class="czp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="czp-anno-text">{{ note.text }}</span>
          </li>
        </ul>

        <!-- 中央大字 -->
        <div class="czp-char-wrap">
          <div class="czp-char-box">
            <span class="czp-char">{{ mainChar }}</span>
            <!-- 朱批圈划：手绘感椭圆圈注 -->
            <span class="czp-circle czp-circle-a" aria-hidden="true" />
            <span class="czp-circle czp-circle-b" aria-hidden="true" />
          </div>
          <p class="czp-char-meta">
            {{ mainCharMeta }}
          </p>
        </div>

        <!-- 右侧朱批 -->
        <ul class="czp-anno czp-anno-right">
          <li v-for="(note, i) in rightAnnotations" :key="'r' + i" class="czp-anno-item">
            <span class="czp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="czp-anno-text">{{ note.text }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 拆解部件小字行（结构 + 五行，不另起图表） ============ -->
      <div class="czp-decomp">
        <span v-for="(c, i) in charBreakdown" :key="i" class="czp-decomp-cell">
          <em class="czp-decomp-part">{{ c.part }}</em>
          <span class="czp-decomp-info">{{ c.info }}</span>
        </span>
      </div>

      <!-- ============ 推演批注：起卦时辰 → 三卦推导 → 卦象，朱批小字行 ============ -->
      <div class="czp-derive">
        <p class="czp-derive-line">
          <span class="czp-derive-flag">{{ $t('ceziYishu.poster.timeFlag') }}</span>
          <span class="czp-derive-text">{{ timeLine }}</span>
        </p>
        <p v-for="(line, i) in derivationLines" :key="'d' + i" class="czp-derive-line">
          <span class="czp-derive-flag">{{ line.flag }}</span>
          <span class="czp-derive-text">{{ line.text }}</span>
        </p>
        <p class="czp-derive-line">
          <span class="czp-derive-flag">{{ $t('ceziYishu.poster.trigramFlag') }}</span>
          <span class="czp-derive-text">{{ trigramLine }}</span>
        </p>
      </div>

      <!-- ============ 卦象白话 ============ -->
      <p class="czp-hex" :class="{ 'czp-pending': !aiParsed.hex }">
        <span class="czp-hex-label">{{ $t('ceziYishu.poster.hexLabel') }}</span>
        <span class="czp-hex-name">{{ hexagramName }}</span>
        <span class="czp-hex-text">{{ aiParsed.hex || $t('ceziYishu.poster.fieldPending') }}</span>
      </p>

      <!-- ============ 竖排断语：字旁签文区 ============ -->
      <section class="czp-verdict">
        <div class="czp-verdict-scroll">
          <span class="czp-verdict-flag">{{ $t('ceziYishu.poster.verdictFlag') }}</span>
          <p class="czp-verdict-text" :class="{ 'czp-pending': !aiParsed.verdict }">
            {{ aiParsed.verdict || $t('ceziYishu.poster.verdictPending') }}
          </p>
        </div>
      </section>

      <!-- ============ 隐士收口提点 ============ -->
      <p class="czp-note">
        <span class="czp-note-label">{{ $t('ceziYishu.poster.noteLabel') }}</span>
        <span :class="{ 'czp-pending': !aiParsed.tip }">
          {{ aiParsed.tip || $t('ceziYishu.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 底部：盖印落款 + 工具页二维码 ============ -->
      <footer class="czp-foot">
        <div class="czp-foot-row">
          <div class="czp-sign">
            <p class="czp-sign-line">{{ signDate }}</p>
            <p class="czp-sign-line czp-sign-who">{{ $t('ceziYishu.poster.signWho') }}</p>
          </div>
          <div class="czp-seal" aria-hidden="true">
            <span class="czp-seal-text">{{ sealText }}</span>
          </div>
          <div class="czp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="czp-qr-img" v-html="qrSvg" />
            <span v-else class="czp-qr-inner">{{ $t('ceziYishu.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CeziYishuResult } from '~/types/cezi-yishu'

interface Props {
  /** 测字完整结果（拆字 / 卦象 / 时间） */
  result: CeziYishuResult
  /** AI 解读全文（OV:/PART:/HEX:/VERDICT:/TIP: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  aiContent: '',
})
const { t } = useI18n()

/* ---------- 所测之字（视觉核心） ---------- */

const chars = computed(() => props.result.analysis.chars)
const mainChar = computed(() => chars.value[0]?.char ?? props.result.input.chars.charAt(0) ?? '')

const mainCharMeta = computed(() => {
  const c = chars.value[0]
  if (!c) return ''
  return t('ceziYishu.poster.charMeta', {
    pinyin: c.pinyin,
    strokes: c.strokes,
    wuxing: c.wuxing,
  })
})

const questionText = computed(
  () => props.result.input.question || t('ceziYishu.noQuestion'),
)

const hexagramName = computed(() => {
  const h = props.result.hexagram
  return `${h.name} ${h.symbol}`
})

/* ---------- 推演批注：起卦时辰 / 三卦推导 / 卦象，朱批小字 ---------- */

const timeLine = computed(() => {
  const lunar = props.result.time.lunar
  return t('ceziYishu.poster.timeLine', {
    year: lunar.yearGanZhi,
    month: lunar.month,
    day: lunar.day,
    hour: lunar.hourZhi,
    sum: props.result.time.numbers.sum,
  })
})

const derivationLines = computed(() => {
  const d = props.result.derivation
  return [
    { flag: t('ceziYishu.poster.upperFlag'), text: d.upperFormula },
    { flag: t('ceziYishu.poster.lowerFlag'), text: d.lowerFormula },
    { flag: t('ceziYishu.poster.movingFlag'), text: d.movingLineFormula },
  ]
})

const trigramLine = computed(() => {
  const h = props.result.hexagram
  return t('ceziYishu.poster.trigramLine', {
    upperSymbol: h.upper.symbol,
    upperName: h.upper.name,
    upperNature: h.upper.nature,
    lowerSymbol: h.lower.symbol,
    lowerName: h.lower.name,
    lowerNature: h.lower.nature,
  })
})

/* ---------- 拆解部件小字行：直接复用 calc 拆出的偏旁/部件/结构 ---------- */

const charBreakdown = computed(() => {
  const c = chars.value[0]
  if (!c) return []
  const parts = c.components && c.components.length > 0 ? c.components : [c.char]
  return parts.slice(0, 4).map(part => ({
    part,
    info: `${c.radical} · ${c.wuxing}`,
  }))
})

/* ---------- 盖印落款 ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('ceziYishu.poster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/cezi-yishu`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})

/* ---------- AI 行协议解析：OV:/PART:/HEX:/VERDICT:/TIP: ---------- */

interface AnnoNote {
  part: string
  text: string
}

interface AiParsed {
  overview: string
  parts: AnnoNote[]
  hex: string
  verdict: string
  tip: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', parts: [], hex: '', verdict: '', tip: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const match = (line: string, tag: string) => line.startsWith(`${tag}:`) || line.startsWith(`${tag}：`)
  const body = (line: string, tag: string) => clean(line.slice(tag.length + 1))

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (match(line, 'OV')) { if (!out.overview) out.overview = truncate(body(line, 'OV'), 60); continue }
    if (match(line, 'HEX')) { if (!out.hex) out.hex = truncate(body(line, 'HEX'), 60); continue }
    if (match(line, 'VERDICT')) { if (!out.verdict) out.verdict = truncate(body(line, 'VERDICT'), 72); continue }
    if (match(line, 'TIP')) { if (!out.tip) out.tip = truncate(body(line, 'TIP'), 50); continue }
    if (match(line, 'PART')) {
      if (out.parts.length >= 4) continue
      const raw = body(line, 'PART')
      // 拆出部件名（首个汉字/词）做朱批标记，余下作批注
      const m = raw.match(/^([「『]?[一-鿿⼀-⿟]{1,3}[」』]?)[，,、：:\s]*(.*)$/)
      const part = m ? m[1]!.replace(/[「」『』]/g, '') : '注'
      const noteText = m && m[2] ? m[2] : raw
      out.parts.push({ part: truncate(part, 3), text: truncate(noteText, 30) })
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
.czp {
  /* 仿古宣纸泛黄色：比公文纸更暖、更旧 */
  --czp-bg: #e6dbc0;
  --czp-sheet: #f4ecd6;
  --czp-ink: #3a2e1f;
  --czp-ink-soft: #5c4f3a;
  --czp-ink-faint: #8f8265;
  --czp-line: #d3c6a6;
  --czp-line-soft: #e2d8bc;
  /* 朱批红：朱砂，不艳 */
  --czp-cinnabar: #b23a2c;
  --czp-cinnabar-deep: #8e2a1f;
  background: var(--czp-bg);
  /* 宣纸纹理：细密纤维横纹 + 局部做旧色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 20% 14%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 82% 80%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--czp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.czp-sheet {
  background: var(--czp-sheet);
  border: 1px solid var(--czp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 宣纸毛边：上下缘锯齿撕口 */
.czp-sheet::before,
.czp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--czp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.czp-sheet::before { top: -6px; transform: scaleY(-1); }
.czp-sheet::after { bottom: -6px; }

/* ---------- 顶部题头 ---------- */
.czp-head {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 3px double var(--czp-ink);
}
.czp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--czp-ink-faint);
}
.czp-title {
  margin: 4px 0 2px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--czp-cinnabar);
  text-shadow:
    1px 1px 0 rgba(178, 58, 44, 0.16),
    0 0 1px var(--czp-cinnabar-deep);
}
.czp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--czp-ink-faint);
}
.czp-overview {
  margin: 10px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--czp-ink-soft);
}
.czp-pending { color: var(--czp-ink-faint); font-style: italic; }

/* ---------- 所问之事横批 ---------- */
.czp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--czp-line);
  text-align: center;
}
.czp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--czp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.czp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--czp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 视觉核心：大字 + 朱批圈注 ---------- */
.czp-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 4px 14px;
}
.czp-char-wrap {
  flex-shrink: 0;
  text-align: center;
}
.czp-char-box {
  position: relative;
  display: inline-block;
  padding: 8px;
}
.czp-char {
  font-size: 148px;
  font-weight: 900;
  line-height: 1;
  color: var(--czp-ink);
  letter-spacing: 0;
  /* 毛笔字年代感：浓墨多重描边 */
  text-shadow:
    2px 2px 0 rgba(58, 46, 31, 0.14),
    0 0 1px #241c12;
}
/* 朱批手绘圈：两枚不规则椭圆，叠出圈划感 */
.czp-circle {
  position: absolute;
  border: 2.5px solid var(--czp-cinnabar);
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}
.czp-circle-a {
  inset: -4px -10px 0 -6px;
  transform: rotate(-6deg) scale(1.02);
  border-width: 2.5px 3px 2px 3px;
}
.czp-circle-b {
  inset: 2px -4px -6px -12px;
  transform: rotate(5deg);
  border-width: 2px 2.5px 3px 2px;
  opacity: 0.35;
}
.czp-char-meta {
  margin: 10px 0 0;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--czp-ink-faint);
}

/* 朱批注栏：竖排小字，圈出部件 + 批注 */
.czp-anno {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.czp-anno-left { align-items: flex-start; text-align: left; }
.czp-anno-right { align-items: flex-end; text-align: right; }
.czp-anno-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 92px;
}
.czp-anno-right .czp-anno-item { align-items: flex-end; }
.czp-anno-mark {
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  color: var(--czp-cinnabar);
  border: 1.5px solid var(--czp-cinnabar);
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
.czp-anno-text {
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  color: var(--czp-cinnabar-deep);
  word-break: break-word;
}

/* ---------- 拆解部件小字行 ---------- */
.czp-decomp {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  padding: 8px 4px 4px;
  border-top: 1px dashed var(--czp-line);
}
.czp-decomp-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}
.czp-decomp-part {
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  color: var(--czp-ink);
}
.czp-decomp-info {
  font-size: 10.5px;
  letter-spacing: 0.5px;
  color: var(--czp-ink-faint);
}

/* ---------- 推演批注：起卦时辰 → 三卦推导 → 卦象，朱批小字行 ---------- */
.czp-derive {
  margin: 12px 2px 0;
  padding: 8px 10px;
  border-top: 1px dashed var(--czp-line);
  border-bottom: 1px dashed var(--czp-line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.czp-derive-line {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--czp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.czp-derive-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--czp-cinnabar);
  border: 1px solid var(--czp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.czp-derive-text {
  word-break: break-word;
}

/* ---------- 卦象白话 ---------- */
.czp-hex {
  margin: 12px 2px 0;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--czp-ink-soft);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--czp-line-soft);
  border-left: 2px solid var(--czp-cinnabar);
  border-radius: 4px;
}
.czp-hex-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--czp-cinnabar);
  border: 1px solid var(--czp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}
.czp-hex-name {
  font-weight: 700;
  color: var(--czp-ink);
  margin-right: 6px;
}

/* ---------- 竖排断语：签文区 ---------- */
.czp-verdict {
  margin: 14px 0 0;
  display: flex;
  justify-content: center;
}
.czp-verdict-scroll {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--czp-line);
  border-bottom: 1px solid var(--czp-line);
  /* 竖排：从右往左 */
  writing-mode: vertical-rl;
  max-height: 200px;
}
.czp-verdict-flag {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--czp-cinnabar);
  padding-top: 2px;
}
.czp-verdict-text {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--czp-ink);
}

/* ---------- 隐士收口提点 ---------- */
.czp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--czp-ink-soft);
  letter-spacing: 0.3px;
}
.czp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--czp-cinnabar);
  border: 1px solid var(--czp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部：盖印落款 + 二维码 ---------- */
.czp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--czp-ink);
  padding-top: 12px;
}
.czp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.czp-sign {
  min-width: 0;
}
.czp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--czp-ink-faint);
  line-height: 1.7;
}
.czp-sign-who {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--czp-ink);
}
/* 仿盖印：方形朱文章，做旧、微歪斜 */
.czp-seal {
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
.czp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.czp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.czp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.czp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.czp-qr-inner {
  font-size: 8px;
  color: var(--czp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--czp-line);
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
  .czp { padding: 10px; }
  .czp-sheet { padding: 18px 14px 12px; }
  .czp-title { font-size: 28px; letter-spacing: 7px; }
  .czp-char { font-size: 112px; }
  .czp-stage { gap: 4px; padding: 14px 0 10px; }
  .czp-anno-item { max-width: 76px; }
  .czp-verdict-text { font-size: 16px; letter-spacing: 3px; }
  .czp-seal { width: 54px; height: 54px; }
}
</style>
