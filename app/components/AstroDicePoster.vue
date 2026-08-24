<template>
  <div class="adp">
    <div class="adp-sheet">
      <!-- 顶部：品牌横条 -->
      <div class="adp-topbar">
        <span class="adp-brand">{{ $t('astroDice.poster.brand') }}</span>
        <span class="adp-serial">№ {{ serial }}</span>
      </div>

      <!-- 头部：三骰组合 -->
      <header class="adp-head">
        <p class="adp-kicker">{{ $t('astroDice.poster.kicker') }}</p>
        <div class="adp-dice-row">
          <div v-for="d in diceRow" :key="d.dim" class="adp-die">
            <span class="adp-die-glyph" :class="`adp-die-${d.dim}`">{{ d.glyph }}</span>
            <span class="adp-die-name">{{ d.name }}</span>
            <span class="adp-die-dim">{{ d.dimLabel }}</span>
          </div>
        </div>
        <div class="adp-head-tags">
          <span class="adp-tag" :class="{ 'adp-tag-warn': dignityWarn }">
            {{ dignityLabel }}
          </span>
          <span class="adp-tag">{{ $t(`astroDice.element.${result.lucky.element}`) }}</span>
        </div>

        <!-- AI 总览融入头部副标语；未到齐前用骨架条占位，不放兜底文案冒充 -->
        <p class="adp-overview">
          <span v-if="overviewPending" class="adp-skel adp-skel-overview" aria-hidden="true" />
          <template v-else>{{ overviewText }}</template>
        </p>
      </header>

      <!-- 契合指数 -->
      <section class="adp-score">
        <div class="adp-score-main">
          <span class="adp-score-label">{{ $t('astroDice.poster.scoreLabel') }}</span>
          <span class="adp-score-num">{{ result.score }}</span>
        </div>
        <span class="adp-grade-seal" :class="gradeSealClass">{{ gradeLabel }}</span>
      </section>

      <!-- 三维度解读 -->
      <section class="adp-dims">
        <div v-for="dim in dimItems" :key="dim.key" class="adp-dim">
          <div class="adp-dim-head">
            <span class="adp-dim-glyph">{{ dim.glyph }}</span>
            <div class="adp-dim-title">
              <span class="adp-dim-name">{{ dim.name }}</span>
              <span class="adp-dim-keyword">{{ dim.keyword }}</span>
            </div>
          </div>
          <span v-if="dim.pending" class="adp-skel adp-skel-dim" aria-hidden="true" />
          <span v-else class="adp-dim-text">{{ dim.text }}</span>
        </div>
      </section>

      <!-- 开运 -->
      <section class="adp-kaiyun">
        <span class="adp-kaiyun-label">{{ $t('astroDice.poster.kaiyunLabel') }}</span>
        <span v-if="kaiyunPending" class="adp-skel adp-skel-kaiyun" aria-hidden="true" />
        <span v-else class="adp-kaiyun-text">{{ kaiyunText }}</span>
      </section>

      <!-- 底部：落款 -->
      <footer class="adp-foot">
        <div class="adp-foot-brand">
          <div class="adp-seal-stamp">{{ $t('astroDice.poster.seal') }}</div>
          <div class="adp-foot-meta">
            <span class="adp-foot-site">{{ siteDomain }}</span>
            <span class="adp-foot-note">{{ $t('astroDice.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="adp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="adp-qr-img" v-html="qrSvg" />
          <span v-else class="adp-qr-inner">{{ $t('astroDice.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AstroDiceCalcResult, AstroDiceFace } from '~/types/astro-dice'

interface Props {
  result: AstroDiceCalcResult
  /** AI 行协议文案（OV:/PL:/SG:/HS:/KY:），流式追加，海报实时融合 */
  aiContent?: string
  /** AI 彻底失败时为 true，槽位才落确定性兜底文案；流式未到时显示骨架条 */
  aiFailed?: boolean
}

const props = withDefaults(defineProps<Props>(), { aiContent: '', aiFailed: false })
const { t, locale } = useI18n()

const siteDomain = 'www.ososn.com'

const serial = computed(() => props.result.seed.slice(0, 8).toUpperCase())

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/astro-dice`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#232034', light: '#00000000' },
  })
})

/* ---------- 本地化取名 ---------- */

function faceName(face: AstroDiceFace): string {
  if (locale.value === 'en') return face.nameEn
  if (locale.value === 'zh-TW') return face.nameTw
  return face.nameZh
}

function faceKeyword(face: AstroDiceFace): string {
  if (locale.value === 'en') return face.keywordEn
  if (locale.value === 'zh-TW') return face.keywordTw
  return face.keywordZh
}

/* ---------- 头部三骰 ---------- */

const diceRow = computed(() => [
  { dim: 'planet', glyph: props.result.planet.glyph, name: faceName(props.result.planet), dimLabel: t('astroDice.poster.dimPlanet') },
  { dim: 'sign', glyph: props.result.sign.glyph, name: faceName(props.result.sign), dimLabel: t('astroDice.poster.dimSign') },
  { dim: 'house', glyph: props.result.house.glyph, name: faceName(props.result.house), dimLabel: t('astroDice.poster.dimHouse') },
])

/* ---------- 庙旺与评级 ---------- */

const dignityLabel = computed(() => {
  if (props.result.dignity.type === 'neutral') return t('astroDice.poster.dignityNeutral')
  const typeLabel = t(`astroDice.poster.dignity.${props.result.dignity.type}`)
  return t('astroDice.poster.dignityTag', { planet: faceName(props.result.planet), type: typeLabel })
})

const dignityWarn = computed(() =>
  props.result.dignity.type === 'detriment' || props.result.dignity.type === 'fall',
)

const gradeLabel = computed(() => t(`astroDice.poster.grade.${props.result.grade}`))

const gradeSealClass = computed(() => {
  if (props.result.grade === 'daji' || props.result.grade === 'ji') return 'adp-grade-ji'
  if (props.result.grade === 'xiong') return 'adp-grade-xiong'
  return 'adp-grade-ping'
})

/** AI 未给总览时，按评定等级回退到确定性文案（仅 AI 失败才用） */
const gradeOverview = computed(() => t(`astroDice.poster.gradeOverview.${props.result.grade}`))

/** AI 槽位：流式未到 → 骨架条；AI 失败 → 兜底文案；否则 AI 原文。文案只增不换 */
const overviewPending = computed(() => !aiParsed.value.overview && !props.aiFailed)
const overviewText = computed(() => aiParsed.value.overview || gradeOverview.value)

/* ---------- AI 行协议解析 ---------- */

interface AiParsed {
  overview: string
  dims: { planet: string, sign: string, house: string }
  kaiyun: string
}

const LINE_PREFIX: Record<string, keyof AiParsed['dims']> = {
  PL: 'planet',
  SG: 'sign',
  HS: 'house',
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = {
    overview: '',
    dims: { planet: '', sign: '', house: '' },
    kaiyun: '',
  }
  if (!text.trim()) return out

  // 英文字符宽度约为中文一半，截断阈值相应放宽，避免断在单词中间
  const en = locale.value === 'en'
  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const match = line.match(/^([A-Z]{2})\s*[：:]\s*(.*)$/)
    if (!match) continue
    const prefix = match[1]!
    const body = clean(match[2] ?? '')
    if (!body) continue

    if (prefix === 'OV') {
      if (!out.overview) out.overview = truncate(body, en ? 110 : 60)
      continue
    }
    if (prefix === 'KY') {
      if (!out.kaiyun) out.kaiyun = truncate(body, en ? 64 : 32)
      continue
    }
    const dimKey = LINE_PREFIX[prefix]
    if (dimKey && !out.dims[dimKey]) out.dims[dimKey] = truncate(body, en ? 44 : 20)
  }

  return out
})

/* ---------- 三维度：AI 优先，未覆盖用关键词兜底 ---------- */

const dimItems = computed(() => {
  const defs: Array<{ key: keyof AiParsed['dims'], face: AstroDiceFace, nameKey: string }> = [
    { key: 'planet', face: props.result.planet, nameKey: 'astroDice.poster.dimPlanet' },
    { key: 'sign', face: props.result.sign, nameKey: 'astroDice.poster.dimSign' },
    { key: 'house', face: props.result.house, nameKey: 'astroDice.poster.dimHouse' },
  ]
  return defs.map(d => ({
    key: d.key,
    glyph: d.face.glyph,
    name: `${t(d.nameKey)} · ${faceName(d.face)}`,
    keyword: faceKeyword(d.face),
    text: aiParsed.value.dims[d.key] || (props.aiFailed ? t(`astroDice.poster.dimFallback.${d.key}`) : ''),
    pending: !aiParsed.value.dims[d.key] && !props.aiFailed,
  }))
})

/** 开运行：AI 优先；AI 失败才用元素幸运色方位拼确定性文案 */
const kaiyunPending = computed(() => !aiParsed.value.kaiyun && !props.aiFailed)
const kaiyunText = computed(() => {
  if (aiParsed.value.kaiyun) return aiParsed.value.kaiyun
  return t('astroDice.poster.kaiyunFallback', {
    color: t(`astroDice.luckyColor.${props.result.lucky.element}`),
    direction: t(`astroDice.luckyDirection.${props.result.lucky.element}`),
  })
})
</script>

<style scoped>
/* ========== 星夜占星骰子海报（纸质竖版，靛蓝夜空金配色） ========== */
.adp {
  --adp-bg: #e9e6f0;
  --adp-sheet: #f6f3ee;
  --adp-ink: #232034;
  --adp-ink-soft: #4a4560;
  --adp-ink-faint: #8b86a0;
  --adp-line: #d5cfdf;
  --adp-line-soft: #e4dfec;
  --adp-accent: #5b4a9e;
  --adp-accent-deep: #443678;
  --adp-gold: #a8791f;
  --adp-green: #4a7c59;
  --adp-green-deep: #3a6449;
  --adp-warn: #8c2f26;
  background: var(--adp-bg);
  padding: 14px;
  color: var(--adp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.adp-sheet {
  background: var(--adp-sheet);
  border: 1px solid var(--adp-line);
  box-shadow: 0 2px 16px rgba(40, 34, 70, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
.adp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--adp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.adp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--adp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--adp-ink-faint);
}
.adp-brand { font-weight: 700; color: var(--adp-ink-soft); }
.adp-serial { font-variant-numeric: tabular-nums; letter-spacing: 1px; }

/* ---------- 头部三骰 ---------- */
.adp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--adp-ink);
}
.adp-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--adp-accent);
  font-weight: 700;
}
.adp-dice-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 14px;
}
.adp-die {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
.adp-die-glyph {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  line-height: 1;
  border-radius: 12px;
  border: 1.5px solid var(--adp-line);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 3px rgba(40, 34, 70, 0.1);
}
.adp-die-planet { color: #6d28d9; }
.adp-die-sign { color: #b45309; }
.adp-die-house { color: #0369a1; }
.adp-die-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--adp-ink);
  letter-spacing: 1px;
  white-space: nowrap;
}
.adp-die-dim {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--adp-ink-faint);
}
.adp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.adp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--adp-ink-soft);
  border: 1px solid var(--adp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}
.adp-tag-warn {
  color: var(--adp-warn);
  border-color: var(--adp-warn);
}

.adp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--adp-ink-soft);
}

/* ---------- AI 槽位骨架条（文案未到前的占位，不用兜底文案冒充） ---------- */
.adp-skel {
  display: inline-block;
  height: 0.9em;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--adp-line-soft) 25%, #f2eef8 50%, var(--adp-line-soft) 75%);
  background-size: 200% 100%;
  animation: adp-shimmer 1.3s linear infinite;
  vertical-align: middle;
}
.adp-skel-overview { width: 72%; }
.adp-skel-dim { width: 58%; }
.adp-skel-kaiyun { width: 52%; }
@keyframes adp-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* ---------- 契合指数 ---------- */
.adp-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 6px;
  border-bottom: 1px solid var(--adp-line);
}
.adp-score-main { display: flex; align-items: baseline; gap: 10px; }
.adp-score-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--adp-ink-soft);
  font-weight: 700;
}
.adp-score-num {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: var(--adp-gold);
  font-variant-numeric: tabular-nums;
}
.adp-grade-seal {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-4deg);
  letter-spacing: 1px;
}
.adp-grade-ji {
  background: var(--adp-green);
  border: 2px solid var(--adp-green-deep);
  color: #f5efe0;
  box-shadow: 0 1px 3px rgba(40, 34, 70, 0.2);
}
.adp-grade-xiong {
  background: transparent;
  border: 2.5px solid var(--adp-warn);
  color: var(--adp-warn);
}
.adp-grade-ping {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid var(--adp-line);
  color: var(--adp-ink-soft);
}

/* ---------- 三维度解读 ---------- */
.adp-dims {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 2px 0;
}
.adp-dim {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--adp-line-soft);
  border-left: 2px solid var(--adp-accent);
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.adp-dim-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.adp-dim-glyph {
  font-size: 18px;
  line-height: 1;
  color: var(--adp-accent);
}
.adp-dim-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.adp-dim-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--adp-ink);
}
.adp-dim-keyword {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--adp-ink-faint);
}
.adp-dim-text {
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--adp-ink-soft);
  word-break: break-word;
}

/* ---------- 开运 ---------- */
.adp-kaiyun {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}
.adp-kaiyun-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #f5efe0;
  background: var(--adp-accent);
  border-radius: 4px;
  padding: 4px 8px;
}
.adp-kaiyun-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--adp-ink);
  letter-spacing: 0.5px;
}

/* ---------- 底部落款 ---------- */
.adp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--adp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.adp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.adp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--adp-accent);
  color: var(--adp-accent);
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
.adp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.adp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--adp-ink); }
.adp-foot-note { font-size: 9.5px; color: var(--adp-ink-faint); letter-spacing: 0.5px; }
.adp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.adp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.adp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.adp-qr-inner {
  font-size: 8px;
  color: var(--adp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--adp-line);
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
  .adp { padding: 8px; }
  .adp-sheet { padding: 16px 12px 12px; }
  .adp-die-glyph { width: 48px; height: 48px; font-size: 26px; }
  .adp-die-name { font-size: 12.5px; }
  .adp-score-num { font-size: 36px; }
  .adp-grade-seal { width: 46px; height: 46px; font-size: 15px; }
}
</style>
