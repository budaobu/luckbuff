<template>
  <div class="swc">
    <div class="swc-sheet">
      <!-- ============ 顶部：大字标题（命理鉴定证书） ============ -->
      <header class="swc-head">
        <p class="swc-kicker">{{ $t('sancaiWuge.poster.kicker') }}</p>
        <h2 class="swc-title">{{ $t('sancaiWuge.poster.title') }}</h2>
        <p class="swc-serial">{{ $t('sancaiWuge.poster.serial') }}</p>
      </header>

      <!-- ============ 主推姓名：视觉权重最大，逐字大字 + 笔画标注 ============ -->
      <section class="swc-name">
        <span class="swc-name-flag">{{ $t('sancaiWuge.poster.nameFlag') }}</span>
        <div class="swc-name-chars">
          <span v-for="(c, i) in top.chars" :key="i" class="swc-name-char">
            <span class="swc-name-glyph">{{ c.char }}</span>
            <span class="swc-name-stroke">{{ c.strokes }}{{ $t('sancaiWuge.poster.strokeSuffix') }}</span>
          </span>
        </div>
        <p class="swc-name-pinyin">{{ top.pinyin }}</p>
        <!-- 幽默隐士一句克制点评：AI 流式融入，未至用本地短评兜底 -->
        <p class="swc-name-comment" :class="{ 'swc-comment-pending': !aiContent }">
          {{ aiContent || top.briefComment }}
        </p>
      </section>

      <!-- ============ 五格剖象图：字卡 + 五格连线 ============ -->
      <section class="swc-diagram">
        <span class="swc-diagram-flag">{{ $t('sancaiWuge.poster.wugeTitle') }}</span>
        <div class="swc-diagram-body">
          <!-- 字卡行 -->
          <div class="swc-diagram-chars">
            <span v-for="(c, i) in top.chars" :key="i" class="swc-diagram-char">{{ c.char }}</span>
          </div>
          <!-- 五格格带：每格一条 bracket 横线示意覆盖哪些字 -->
          <div class="swc-diagram-grids">
            <div v-for="g in gridRows" :key="g.key" class="swc-grid-row">
              <span class="swc-grid-label">
                <em>{{ g.name }}</em>
                <b>{{ g.value }}</b>
                <i class="swc-grid-fortune" :class="fortuneClass(g.fortune)">{{ fortuneText(g.fortune) }}</i>
              </span>
              <span class="swc-grid-track">
                <span
                  class="swc-grid-bracket"
                  :style="{ left: g.left + '%', width: g.width + '%' }"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 三才配置：三个五行印章色块 ============ -->
      <section class="swc-sancai">
        <span class="swc-sancai-flag">{{ $t('sancaiWuge.poster.sancaiTitle') }}</span>
        <div class="swc-sancai-body">
          <div class="swc-sancai-seals">
            <span
              v-for="(w, i) in sancaiSeals"
              :key="i"
              class="swc-sancai-seal"
              :class="`swc-wuxing-${w.element}`"
            >
              <b>{{ w.element }}</b>
              <em>{{ w.label }}</em>
            </span>
          </div>
          <div class="swc-sancai-meta">
            <p class="swc-sancai-combo">
              {{ top.sancai.combo }}
              <i class="swc-grid-fortune" :class="fortuneClass(top.sancai.luck)">{{ fortuneText(top.sancai.luck) }}</i>
            </p>
            <p class="swc-sancai-desc">{{ top.sancai.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 综合评分 / 等级 / 五格运势：大字号突出 ============ -->
      <section class="swc-score">
        <div class="swc-score-cell swc-score-main">
          <span class="swc-score-label">{{ $t('sancaiWuge.poster.scoreLabel') }}</span>
          <b class="swc-score-value">{{ top.score }}</b>
        </div>
        <div class="swc-score-cell">
          <span class="swc-score-label">{{ $t('sancaiWuge.poster.gradeLabel') }}</span>
          <b class="swc-score-grade">{{ gradeText(top.grade) }}</b>
        </div>
        <div class="swc-score-cell">
          <span class="swc-score-label">{{ $t('sancaiWuge.poster.luckLabel') }}</span>
          <b class="swc-score-luck">{{ luckText(top.overallLuck) }}</b>
        </div>
      </section>

      <!-- ============ 备选名录：其余候选一行式列表 ============ -->
      <section v-if="others.length" class="swc-others">
        <span class="swc-others-flag">{{ $t('sancaiWuge.poster.othersTitle') }}</span>
        <ul class="swc-others-list">
          <li v-for="(c, i) in others" :key="i" class="swc-others-row">
            <span class="swc-others-name">{{ c.fullName }}</span>
            <span class="swc-others-score">{{ c.score }}</span>
            <span class="swc-others-grade">{{ gradeText(c.grade) }}</span>
            <span class="swc-others-comment">{{ c.briefComment }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 底部：归档编号 + 盖印日期章 + 唯一二维码 ============ -->
      <footer class="swc-foot">
        <div class="swc-archive">
          <div class="swc-archive-text">
            <p class="swc-archive-no">
              <em>{{ $t('sancaiWuge.poster.archiveLabel') }}</em>
              {{ $t('sancaiWuge.poster.archiveNo', { no: archiveNo }) }}
            </p>
            <p class="swc-archive-date">
              <em>{{ $t('sancaiWuge.poster.archiveDateLabel') }}</em>
              {{ archiveDate }}
            </p>
          </div>
          <div class="swc-archive-seal" aria-hidden="true">
            <span class="swc-archive-seal-text">{{ archiveSealText }}</span>
            <span class="swc-archive-seal-date">{{ archiveDate }}</span>
          </div>
        </div>
        <!-- 引流二维码与档案块分离，独立成行：整张证书唯一行动点 -->
        <div class="swc-foot-row">
          <div class="swc-seal-stamp">{{ $t('sancaiWuge.poster.seal') }}</div>
          <div class="swc-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="swc-qr-img" v-html="qrSvg" />
            <span v-else class="swc-qr-inner">{{ $t('sancaiWuge.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SancaiWugeCandidate, SancaiFortuneTier } from '~/types/sancai-wuge'

interface Props {
  /** 主推候选（评分最高，完整证书主体） */
  top: SancaiWugeCandidate
  /** 其余候选（一行式列表） */
  others?: SancaiWugeCandidate[]
  surname: string
  /** 主推候选的 AI 流式点评（一句），流式追加实时融入 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  others: () => [],
  aiContent: '',
})
const { t } = useI18n()

/* ---------- 五格剖象图：每格覆盖哪些字（按姓氏/名字字数算 bracket 位置） ---------- */

const GRID_KEYS = ['tiange', 'renge', 'dige', 'waige', 'zongge'] as const

const gridRows = computed(() => {
  const total = props.top.chars.length
  const surnameLen = props.top.chars.length - props.top.givenName.length
  const givenLen = props.top.givenName.length
  const pct = (n: number) => (n / total) * 100

  // 各格覆盖的字区间 [start, end)（0 起，按字索引）
  // 天格=姓；人格=姓末+名首；地格=名；外格=首末两字；总格=全部
  const ranges: Record<(typeof GRID_KEYS)[number], [number, number]> = {
    tiange: [0, surnameLen],
    renge: [surnameLen - 1, Math.min(surnameLen + 1, total)],
    dige: [surnameLen, total],
    waige: [0, total], // 外格=总-人+1，传统跨首末，整带示意
    zongge: [0, total],
  }

  return GRID_KEYS.map((key) => {
    const [start, end] = ranges[key]
    const g = props.top.grids[key]
    return {
      key,
      name: g.name,
      value: g.value,
      fortune: g.fortune,
      left: pct(start),
      width: pct(end - start),
    }
  })
})

/* ---------- 三才印章色块 ---------- */

const sancaiSeals = computed(() => [
  { element: props.top.sancai.tian, label: t('sancaiWuge.tiange') },
  { element: props.top.sancai.ren, label: t('sancaiWuge.renge') },
  { element: props.top.sancai.di, label: t('sancaiWuge.dige') },
])

/* ---------- 吉凶/等级/运势 → i18n 文案 + 色级 ---------- */

const FORTUNE_KEY: Record<SancaiFortuneTier, string> = {
  大吉: 'daJi', 吉: 'ji', 半吉: 'banJi', 凶: 'xiong', 大凶: 'daXiong',
}
const fortuneText = (f: string) => t(`sancaiWuge.poster.fortune.${FORTUNE_KEY[f as SancaiFortuneTier] ?? 'ji'}`)
const fortuneClass = (f: string) =>
  f.includes('大吉') || (f.includes('吉') && !f.includes('凶')) ? 'swc-fortune-good'
    : f.includes('半吉') ? 'swc-fortune-mid'
    : 'swc-fortune-bad'

const GRADE_KEY: Record<string, string> = {
  极佳: 'excellent', 优秀: 'great', 良好: 'good', 中等: 'fair', 一般: 'normal',
}
const gradeText = (g: string) => t(`sancaiWuge.poster.grade.${GRADE_KEY[g] ?? 'normal'}`)

const LUCK_KEY: Record<string, string> = {
  上吉: 'top', 吉: 'good', 中吉: 'mid', 平: 'flat', 需谨慎: 'caution',
}
const luckText = (l: string) => t(`sancaiWuge.poster.luck.${LUCK_KEY[l] ?? 'flat'}`)

/* ---------- 归档编号 + 盖印日期：档案感落款 ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

const archiveDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const archiveNo = computed(() => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const g = props.top.grids
  const seed = `${props.top.fullName}|${g.tiange.value}|${g.renge.value}|${g.dige.value}|${g.waige.value}|${g.zongge.value}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `${ymd}-${String(h % 10000).padStart(4, '0')}`
})

const archiveSealText = computed(() =>
  t('sancaiWuge.poster.archiveSeal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：直达工具页（整张证书唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/sancai-wuge`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})
</script>

<style scoped>
/* ========== 命理鉴定证书海报（与 XiaoLiurenSeekingPoster 等同源纸质配色） ========== */
.swc {
  --swc-bg: #e9e2d0;
  --swc-sheet: #f7f1e0;
  --swc-ink: #2e2a24;
  --swc-ink-soft: #55503f;
  --swc-ink-faint: #8a8272;
  --swc-line: #d8d0bd;
  --swc-line-soft: #e6dfcd;
  --swc-accent: #8c2f26;
  --swc-accent-deep: #6e231c;
  --swc-green: #4a7c59;
  --swc-green-deep: #3a6449;
  --swc-gold: #a8872f;
  background: var(--swc-bg);
  background-image:
    repeating-linear-gradient(0deg, rgba(120, 100, 60, 0.04) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 18% 12%, rgba(140, 47, 38, 0.05), transparent 40%),
    radial-gradient(circle at 85% 78%, rgba(74, 124, 89, 0.05), transparent 45%);
  padding: 16px;
  color: var(--swc-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.swc-sheet {
  background: var(--swc-sheet);
  border: 1px solid var(--swc-line);
  box-shadow: 0 3px 18px rgba(60, 48, 30, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 证书双框：内描一道细线，仿正式文书 */
.swc-sheet::before {
  content: '';
  position: absolute;
  inset: 7px;
  border: 1px solid var(--swc-line);
  pointer-events: none;
}

/* ---------- 顶部：大字标题 ---------- */
.swc-head {
  text-align: center;
  padding: 6px 0 14px;
  border-bottom: 3px double var(--swc-ink);
}
.swc-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--swc-ink-faint);
}
.swc-title {
  margin: 4px 0 2px;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1;
  color: var(--swc-accent);
  text-shadow:
    2px 2px 0 rgba(140, 47, 38, 0.18),
    0 0 1px var(--swc-accent-deep);
}
.swc-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--swc-ink-faint);
}

/* ---------- 主推姓名区（视觉权重最大） ---------- */
.swc-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 8px 14px;
  border-bottom: 1px solid var(--swc-line);
  text-align: center;
}
.swc-name-flag {
  font-size: 10px;
  letter-spacing: 3px;
  color: #f5efe0;
  background: var(--swc-ink);
  padding: 2px 12px;
  border-radius: 3px;
}
.swc-name-chars {
  display: flex;
  justify-content: center;
  gap: 18px;
}
.swc-name-char {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.swc-name-glyph {
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1;
  color: var(--swc-ink);
  text-shadow: 1px 1px 0 rgba(46, 42, 36, 0.12);
}
.swc-name-stroke {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--swc-ink-faint);
}
.swc-name-pinyin {
  margin: 0;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--swc-ink-soft);
}
.swc-name-comment {
  margin: 6px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--swc-ink-soft);
}
.swc-comment-pending { color: var(--swc-ink-faint); font-style: italic; }

/* ---------- 五格剖象图 ---------- */
.swc-diagram {
  margin: 12px 0 0;
  border-top: 1px solid var(--swc-line);
  padding: 11px 4px 4px;
}
.swc-diagram-flag {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: var(--swc-ink);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
  margin-bottom: 10px;
}
.swc-diagram-chars {
  display: flex;
  justify-content: stretch;
  margin-bottom: 4px;
}
/* 与格带同轨：左侧留与格名列等宽(118px)+gap(10px) 的占位，让字卡与 bracket 共用一套横向刻度 */
.swc-diagram-chars::before {
  content: '';
  flex-shrink: 0;
  width: 128px;
}
.swc-diagram-char {
  flex: 1;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--swc-ink);
  padding: 4px 0;
  border: 1px solid var(--swc-line-soft);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin: 0 3px;
}
.swc-diagram-grids { display: flex; flex-direction: column; gap: 5px; }
.swc-grid-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.swc-grid-label {
  flex-shrink: 0;
  width: 118px;
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}
.swc-grid-label em {
  font-style: normal;
  font-weight: 700;
  color: var(--swc-ink);
  letter-spacing: 1px;
}
.swc-grid-label b {
  font-size: 15px;
  color: var(--swc-accent-deep);
  font-weight: 800;
}
.swc-grid-fortune {
  font-style: normal;
  font-size: 10px;
  padding: 0 5px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  border: 1px solid;
}
.swc-fortune-good { color: var(--swc-green-deep); border-color: var(--swc-green); background: rgba(74, 124, 89, 0.08); }
.swc-fortune-mid { color: var(--swc-gold); border-color: var(--swc-gold); background: rgba(168, 135, 47, 0.08); }
.swc-fortune-bad { color: var(--swc-accent); border-color: var(--swc-accent); background: rgba(140, 47, 38, 0.08); }
.swc-grid-track {
  position: relative;
  flex: 1;
  height: 16px;
}
/* bracket 横线：底边 + 左右两竖，示意该格覆盖的字区间 */
.swc-grid-bracket {
  position: absolute;
  top: 4px;
  height: 9px;
  border-bottom: 1.5px solid var(--swc-ink-soft);
  border-left: 1.5px solid var(--swc-ink-soft);
  border-right: 1.5px solid var(--swc-ink-soft);
  opacity: 0.75;
}

/* ---------- 三才配置：五行印章色块 ---------- */
.swc-sancai {
  margin: 12px 0 0;
  border-top: 1px solid var(--swc-line);
  padding: 11px 4px 4px;
}
.swc-sancai-flag {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: var(--swc-ink);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
  margin-bottom: 10px;
}
.swc-sancai-body {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.swc-sancai-seals { display: flex; gap: 10px; flex-shrink: 0; }
.swc-sancai-seal {
  width: 52px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 5px;
  border: 1.5px solid;
  box-shadow: 0 1px 3px rgba(60, 48, 30, 0.12);
}
.swc-sancai-seal b { font-size: 24px; font-weight: 900; line-height: 1; }
.swc-sancai-seal em { font-style: normal; font-size: 9px; letter-spacing: 1px; opacity: 0.85; }
/* 五行配色：木绿 / 火朱 / 土黄 / 金白描边 / 水黑 */
.swc-wuxing-木 { color: #2f5b3c; border-color: #4a7c59; background: rgba(74, 124, 89, 0.12); }
.swc-wuxing-火 { color: #8c2f26; border-color: #b23a2c; background: rgba(178, 58, 44, 0.12); }
.swc-wuxing-土 { color: #7a5b18; border-color: #a8872f; background: rgba(168, 135, 47, 0.14); }
.swc-wuxing-金 { color: #6a6152; border-color: #9a9082; background: rgba(255, 255, 255, 0.7); }
.swc-wuxing-水 { color: #2b3a4a; border-color: #466078; background: rgba(70, 96, 120, 0.12); }
.swc-sancai-meta { flex: 1; min-width: 0; }
.swc-sancai-combo {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--swc-ink);
  display: flex;
  align-items: center;
  gap: 8px;
}
.swc-sancai-desc {
  margin: 4px 0 0;
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--swc-ink-soft);
}

/* ---------- 综合评分 / 等级 / 五格运势 ---------- */
.swc-score {
  margin: 12px 0 0;
  border-top: 1px solid var(--swc-line);
  border-bottom: 1px solid var(--swc-line);
  display: flex;
  align-items: stretch;
  padding: 12px 4px;
}
.swc-score-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-left: 1px dashed var(--swc-line);
}
.swc-score-cell:first-child { border-left: none; }
.swc-score-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--swc-ink-faint);
}
.swc-score-value {
  font-size: 46px;
  font-weight: 900;
  line-height: 1;
  color: var(--swc-accent);
  text-shadow: 1px 1px 0 rgba(140, 47, 38, 0.15);
}
.swc-score-grade,
.swc-score-luck {
  font-size: 22px;
  font-weight: 800;
  color: var(--swc-ink);
  letter-spacing: 1px;
  padding-top: 12px;
}

/* ---------- 备选名录 ---------- */
.swc-others {
  margin: 12px 0 0;
  padding: 11px 4px 4px;
}
.swc-others-flag {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: var(--swc-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
  margin-bottom: 8px;
}
.swc-others-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.swc-others-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--swc-line-soft);
  border-left: 2px solid var(--swc-green);
  border-radius: 4px;
  padding: 6px 9px;
}
.swc-others-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--swc-ink);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.swc-others-score {
  font-size: 14px;
  font-weight: 800;
  color: var(--swc-accent-deep);
  flex-shrink: 0;
}
.swc-others-grade {
  font-size: 11px;
  color: var(--swc-ink-soft);
  flex-shrink: 0;
}
.swc-others-comment {
  font-size: 11px;
  color: var(--swc-ink-faint);
  letter-spacing: 0.2px;
  flex: 1;
  min-width: 0;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- 底部：归档编号 + 盖印日期章 ---------- */
.swc-foot {
  margin-top: 14px;
  border-top: 2px solid var(--swc-ink);
  padding-top: 12px;
}
.swc-archive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 4px 2px;
}
.swc-archive-text { min-width: 0; }
.swc-archive-no,
.swc-archive-date {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--swc-ink);
  line-height: 1.7;
}
.swc-archive-no { font-weight: 700; font-size: 14px; }
.swc-archive-no em,
.swc-archive-date em {
  font-style: normal;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--swc-ink-faint);
  margin-right: 8px;
}
.swc-archive-seal {
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  border: 2.5px solid rgba(178, 58, 44, 0.72);
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1.5px rgba(178, 58, 44, 0.28),
    inset 2px 1px 0 rgba(178, 58, 44, 0.15),
    inset -1px -2px 0 rgba(178, 58, 44, 0.12),
    0 0 0 1px rgba(178, 58, 44, 0.08);
  color: rgba(178, 58, 44, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-align: center;
  transform: rotate(-7deg);
  opacity: 0.86;
  background: radial-gradient(circle at 38% 32%, rgba(178, 58, 44, 0.06), transparent 60%);
}
.swc-archive-seal-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.3;
  white-space: pre-line;
}
.swc-archive-seal-date {
  font-size: 9px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.swc-foot-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.swc-seal-stamp {
  width: 40px;
  height: 40px;
  border: 2px solid var(--swc-accent);
  color: var(--swc-accent);
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
.swc-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.swc-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.swc-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.swc-qr-inner {
  font-size: 8px;
  color: var(--swc-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--swc-line);
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
  .swc { padding: 10px; }
  .swc-sheet { padding: 18px 14px 12px; }
  .swc-title { font-size: 42px; letter-spacing: 8px; }
  .swc-name-glyph { font-size: 52px; }
  .swc-score-value { font-size: 38px; }
  .swc-archive-seal { width: 78px; height: 78px; }
  .swc-archive-seal-text { font-size: 11px; }
}
</style>
