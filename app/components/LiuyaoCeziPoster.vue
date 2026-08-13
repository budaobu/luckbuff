<template>
  <div class="lcp">
    <div class="lcp-sheet">
      <!-- 顶部解字批命笺题头 -->
      <header class="lcp-head">
        <p class="lcp-kicker">{{ $t('liuyaoCeziPoster.kicker') }}</p>
        <h2 class="lcp-title">{{ $t('liuyaoCeziPoster.title') }}</h2>
        <p class="lcp-serial">{{ $t('liuyaoCeziPoster.serial') }}</p>
        <p class="lcp-overview" :class="{ 'lcp-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('liuyaoCeziPoster.overviewPending') }}
        </p>
      </header>

      <!-- 所问之事横批 -->
      <section class="lcp-question">
        <span class="lcp-question-flag">{{ $t('liuyaoCeziPoster.questionFlag') }}</span>
        <p class="lcp-question-text">{{ questionText }}</p>
      </section>

      <!-- 视觉核心：所测之字 + 朱批圈注 -->
      <section class="lcp-stage">
        <!-- 左侧朱批：上卦 + 体卦 -->
        <ul class="lcp-anno lcp-anno-left">
          <li v-for="(note, i) in leftAnnotations" :key="'l' + i" class="lcp-anno-item">
            <span class="lcp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="lcp-anno-text">{{ note.text }}</span>
          </li>
        </ul>

        <!-- 中央大字 + 朱批圈注 -->
        <div class="lcp-char-wrap">
          <div class="lcp-char-box">
            <span class="lcp-char">{{ mainChar }}</span>
            <span class="lcp-circle lcp-circle-a" aria-hidden="true" />
            <span class="lcp-circle lcp-circle-b" aria-hidden="true" />
          </div>
          <p class="lcp-char-meta">{{ mainCharMeta }}</p>
        </div>

        <!-- 右侧朱批：下卦 + 用卦 -->
        <ul class="lcp-anno lcp-anno-right">
          <li v-for="(note, i) in rightAnnotations" :key="'r' + i" class="lcp-anno-item">
            <span class="lcp-anno-mark" aria-hidden="true">{{ note.part }}</span>
            <span class="lcp-anno-text">{{ note.text }}</span>
          </li>
        </ul>
      </section>

      <!-- 本卦展示：卦象符号 + 名称，拆字行 -->
      <div class="lcp-hexrow">
        <span class="lcp-hexrow-symbol">{{ result.hexagram.symbol }}</span>
        <span class="lcp-hexrow-name">{{ result.hexagram.name }}</span>
        <span class="lcp-hexrow-moving">
          {{ $t('liuyaoCeziPoster.movingPrefix') }}{{ result.hexagram.movingLine }}{{ $t('liuyaoCeziPoster.movingUnit') }}
        </span>
      </div>

      <!-- 推演批注笔墨起卦三行 -->
      <div class="lcp-derive">
        <p class="lcp-derive-line">
          <span class="lcp-derive-flag">{{ $t('liuyaoCeziPoster.upperFlag') }}</span>
          <span class="lcp-derive-text">{{ result.derivation.upperFormula }}</span>
        </p>
        <p class="lcp-derive-line">
          <span class="lcp-derive-flag">{{ $t('liuyaoCeziPoster.lowerFlag') }}</span>
          <span class="lcp-derive-text">{{ result.derivation.lowerFormula }}</span>
        </p>
        <p class="lcp-derive-line">
          <span class="lcp-derive-flag">{{ $t('liuyaoCeziPoster.movingFlag') }}</span>
          <span class="lcp-derive-text">{{ result.derivation.movingLineFormula }}</span>
        </p>
      </div>

      <!-- 体用关系白话 -->
      <p class="lcp-tiyong" :class="{ 'lcp-pending': !aiParsed.tiyong }">
        <span class="lcp-tiyong-label">{{ $t('liuyaoCeziPoster.tiyongLabel') }}</span>
        <span class="lcp-tiyong-text">{{ aiParsed.tiyong || $t('liuyaoCeziPoster.fieldPending') }}</span>
      </p>

      <!-- 竖排断语 -->
      <section class="lcp-verdict">
        <div class="lcp-verdict-scroll">
          <span class="lcp-verdict-flag">{{ $t('liuyaoCeziPoster.verdictFlag') }}</span>
          <p class="lcp-verdict-text" :class="{ 'lcp-pending': !aiParsed.verdict }">
            {{ aiParsed.verdict || $t('liuyaoCeziPoster.verdictPending') }}
          </p>
        </div>
      </section>

      <!-- 隐士收尾提点 -->
      <p class="lcp-note">
        <span class="lcp-note-label">{{ $t('liuyaoCeziPoster.noteLabel') }}</span>
        <span :class="{ 'lcp-pending': !aiParsed.tip }">
          {{ aiParsed.tip || $t('liuyaoCeziPoster.notePending') }}
        </span>
      </p>

      <!-- 底部：盖章落款 + 工具页二维码 -->
      <footer class="lcp-foot">
        <div class="lcp-foot-row">
          <div class="lcp-sign">
            <p class="lcp-sign-line">{{ signDate }}</p>
            <p class="lcp-sign-line lcp-sign-who">{{ $t('liuyaoCeziPoster.signWho') }}</p>
          </div>
          <div class="lcp-seal" aria-hidden="true">
            <span class="lcp-seal-text">{{ sealText }}</span>
          </div>
          <div class="lcp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="lcp-qr-img" v-html="qrSvg" />
            <span v-else class="lcp-qr-inner">{{ $t('liuyaoCeziPoster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiuyaoCeziResult } from '~/types/liuyao-cezi'

interface Props {
  /** 六爹测字完整结果 */
  result: LiuyaoCeziResult
  /** AI 解读全文（OV:/TIYONG:/VERDICT:/TIP: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  aiContent: '',
})
const { t } = useI18n()

/* ---------- 所测之字（视觉核心） ---------- */

const mainChar = computed(() => props.result.analysis.char ?? props.result.input.char ?? '')

const mainCharMeta = computed(() => {
  const a = props.result.analysis
  const est = a.estimated ? t('liuyaoCeziPoster.strokeEstimated') : ''
  return `${a.strokes}${t('liuyaoCeziPoster.strokeUnit')}${est}`
})

const questionText = computed(
  () => props.result.input.question || t('liuyaoCeziPoster.noQuestion'),
)

/* ---------- 左右注批：取自卦象结构 + 体用关系 ---------- */

interface AnnoNote {
  part: string
  text: string
}

// 固定四个批注项：上卦 / 下卦 / 体卦 / 用卦
const fixedAnnotations = computed<AnnoNote[]>(() => {
  const h = props.result.hexagram
  const b = props.result.body
  return [
    { part: h.upper.symbol, text: `${h.upper.name}·${h.upper.nature}` },
    { part: h.lower.symbol, text: `${h.lower.name}·${h.lower.nature}` },
    { part: t('liuyaoCeziPoster.tiLabel'), text: `${b.tiTrigram.name}（${b.tiWuxing}）` },
    { part: t('liuyaoCeziPoster.yongLabel'), text: `${b.yongTrigram.name}（${b.yongTrigram.wuxing}）` },
  ]
})

const leftAnnotations = computed(() => fixedAnnotations.value.filter((_, i) => i % 2 === 0))
const rightAnnotations = computed(() => fixedAnnotations.value.filter((_, i) => i % 2 === 1))

/* ---------- 盖茉落款 ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const signDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const sealText = computed(() =>
  t('liuyaoCeziPoster.seal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达本工具页 ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/liuyao-cezi`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})

/* ---------- AI 行协议解析：OV:/TIYONG:/VERDICT:/TIP: ---------- */

interface AiParsed {
  overview: string
  tiyong: string
  verdict: string
  tip: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', tiyong: '', verdict: '', tip: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const match = (line: string, tag: string) => line.startsWith(`${tag}:`) || line.startsWith(`${tag}：`)
  const body = (line: string, tag: string) => clean(line.slice(tag.length + 1))

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (match(line, 'OV')) { if (!out.overview) out.overview = truncate(body(line, 'OV'), 60); continue }
    if (match(line, 'TIYONG')) { if (!out.tiyong) out.tiyong = truncate(body(line, 'TIYONG'), 60); continue }
    if (match(line, 'VERDICT')) { if (!out.verdict) out.verdict = truncate(body(line, 'VERDICT'), 72); continue }
    if (match(line, 'TIP')) { if (!out.tip) out.tip = truncate(body(line, 'TIP'), 50); continue }
  }

  return out
})
</script>

<style scoped>
/* ========== 解字批命笺海报：仿古宣纸泛黄，与纸质海报同源但走古籍批注调性 ========== */
.lcp {
  /* 仿古宣纸泛黄色：比公文纸更暖、更旧 */
  --lcp-bg: #e6dbc0;
  --lcp-sheet: #f4ecd6;
  --lcp-ink: #3a2e1f;
  --lcp-ink-soft: #5c4f3a;
  --lcp-ink-faint: #8f8265;
  --lcp-line: #d3c6a6;
  --lcp-line-soft: #e2d8bc;
  /* 朱批红：朱砂，不艳 */
  --lcp-cinnabar: #b23a2c;
  --lcp-cinnabar-deep: #8e2a1f;
  background: var(--lcp-bg);
  /* 宣纸纹理：细密纤维横纹 + 局部做旧色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 20% 14%, rgba(178, 58, 44, 0.04), transparent 42%),
    radial-gradient(circle at 82% 80%, rgba(120, 100, 60, 0.05), transparent 46%);
  padding: 16px;
  color: var(--lcp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.lcp-sheet {
  background: var(--lcp-sheet);
  border: 1px solid var(--lcp-line);
  box-shadow: 0 3px 18px rgba(90, 70, 40, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 宣纸毛边：上下缘锯齿撕口 */
.lcp-sheet::before,
.lcp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--lcp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.lcp-sheet::before { top: -6px; transform: scaleY(-1); }
.lcp-sheet::after { bottom: -6px; }

/* ---------- 顶部题头 ---------- */
.lcp-head {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 3px double var(--lcp-ink);
}
.lcp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--lcp-ink-faint);
}
.lcp-title {
  margin: 4px 0 2px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--lcp-cinnabar);
  text-shadow:
    1px 1px 0 rgba(178, 58, 44, 0.16),
    0 0 1px var(--lcp-cinnabar-deep);
}
.lcp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--lcp-ink-faint);
}
.lcp-overview {
  margin: 10px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--lcp-ink-soft);
}
.lcp-pending { color: var(--lcp-ink-faint); font-style: italic; }

/* ---------- 所问之事横批 ---------- */
.lcp-question {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--lcp-line);
  text-align: center;
}
.lcp-question-flag {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: #f4ecd6;
  background: var(--lcp-cinnabar);
  padding: 2px 8px;
  border-radius: 3px;
}
.lcp-question-text {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--lcp-ink);
  line-height: 1.5;
  word-break: break-word;
}

/* ---------- 视觉核心：大字 + 朱批圈注 ---------- */
.lcp-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 4px 14px;
}
.lcp-char-wrap {
  flex-shrink: 0;
  text-align: center;
}
.lcp-char-box {
  position: relative;
  display: inline-block;
  padding: 8px;
}
.lcp-char {
  font-size: 148px;
  font-weight: 900;
  line-height: 1;
  color: var(--lcp-ink);
  letter-spacing: 0;
  /* 毛笔字年代感：浓墨多重描边 */
  text-shadow:
    2px 2px 0 rgba(58, 46, 31, 0.14),
    0 0 1px #241c12;
}
/* 朱批手绘圈：两枚不规则椭圆，叠出圈划感 */
.lcp-circle {
  position: absolute;
  border: 2.5px solid var(--lcp-cinnabar);
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}
.lcp-circle-a {
  inset: -4px -10px 0 -6px;
  transform: rotate(-6deg) scale(1.02);
  border-width: 2.5px 3px 2px 3px;
}
.lcp-circle-b {
  inset: 2px -4px -6px -12px;
  transform: rotate(5deg);
  border-width: 2px 2.5px 3px 2px;
  opacity: 0.35;
}
.lcp-char-meta {
  margin: 10px 0 0;
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--lcp-ink-faint);
}

/* 朱批注栏：竖排小字，圈出部件 + 批注 */
.lcp-anno {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lcp-anno-left { align-items: flex-start; text-align: left; }
.lcp-anno-right { align-items: flex-end; text-align: right; }
.lcp-anno-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 92px;
}
.lcp-anno-right .lcp-anno-item { align-items: flex-end; }
.lcp-anno-mark {
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  color: var(--lcp-cinnabar);
  border: 1.5px solid var(--lcp-cinnabar);
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
.lcp-anno-text {
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.3px;
  color: var(--lcp-cinnabar-deep);
  word-break: break-word;
}

/* ---------- 拆解部件小字行 ---------- */
.lcp-decomp {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  padding: 8px 4px 4px;
  border-top: 1px dashed var(--lcp-line);
}
.lcp-decomp-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}
.lcp-decomp-part {
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  color: var(--lcp-ink);
}
.lcp-decomp-info {
  font-size: 10.5px;
  letter-spacing: 0.5px;
  color: var(--lcp-ink-faint);
}

/* ---------- 推演批注：笔画起卦 → 上下卦 → 动爻，朱批小字行 ---------- */
.lcp-derive {
  margin: 12px 2px 0;
  padding: 8px 10px;
  border-top: 1px dashed var(--lcp-line);
  border-bottom: 1px dashed var(--lcp-line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.lcp-derive-line {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lcp-ink-soft);
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.lcp-derive-flag {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--lcp-cinnabar);
  border: 1px solid var(--lcp-cinnabar);
  border-radius: 3px;
  padding: 0.5px 4px;
  opacity: 0.85;
}
.lcp-derive-text {
  word-break: break-word;
}

/* ---------- 卦象白话 ---------- */
.lcp-hex {
  margin: 12px 2px 0;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lcp-ink-soft);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--lcp-line-soft);
  border-left: 2px solid var(--lcp-cinnabar);
  border-radius: 4px;
}
.lcp-hex-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lcp-cinnabar);
  border: 1px solid var(--lcp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}
.lcp-hex-name {
  font-weight: 700;
  color: var(--lcp-ink);
  margin-right: 6px;
}

/* ---------- 竖排断语：签文区 ---------- */
.lcp-verdict {
  margin: 14px 0 0;
  display: flex;
  justify-content: center;
}
.lcp-verdict-scroll {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--lcp-line);
  border-bottom: 1px solid var(--lcp-line);
  /* 竖排：从右往左 */
  writing-mode: vertical-rl;
  max-height: 200px;
}
.lcp-verdict-flag {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--lcp-cinnabar);
  padding-top: 2px;
}
.lcp-verdict-text {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1.5;
  color: var(--lcp-ink);
}

/* ---------- 隐士收口提点 ---------- */
.lcp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--lcp-ink-soft);
  letter-spacing: 0.3px;
}
.lcp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lcp-cinnabar);
  border: 1px solid var(--lcp-cinnabar);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 底部：盖印落款 + 二维码 ---------- */
.lcp-foot {
  margin-top: 16px;
  border-top: 2px solid var(--lcp-ink);
  padding-top: 12px;
}
.lcp-foot-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.lcp-sign {
  min-width: 0;
}
.lcp-sign-line {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--lcp-ink-faint);
  line-height: 1.7;
}
.lcp-sign-who {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lcp-ink);
}
/* 仿盖印：方形朱文章，做旧、微歪斜 */
.lcp-seal {
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
.lcp-seal-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: pre-line;
}
.lcp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lcp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.lcp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.lcp-qr-inner {
  font-size: 8px;
  color: var(--lcp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--lcp-line);
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
  .lcp { padding: 10px; }
  .lcp-sheet { padding: 18px 14px 12px; }
  .lcp-title { font-size: 28px; letter-spacing: 7px; }
  .lcp-char { font-size: 112px; }
  .lcp-stage { gap: 4px; padding: 14px 0 10px; }
  .lcp-anno-item { max-width: 76px; }
  .lcp-verdict-text { font-size: 16px; letter-spacing: 3px; }
  .lcp-seal { width: 54px; height: 54px; }
}
</style>
