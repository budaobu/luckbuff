<template>
  <div class="lrp">
    <div class="lrp-sheet">
      <!-- ============ 顶部：大字标题（仿电线杆寻物启事） ============ -->
      <header class="lrp-head">
        <p class="lrp-kicker">{{ $t('liurenSeeking.poster.kicker') }}</p>
        <h2 class="lrp-title">{{ $t('liurenSeeking.poster.title') }}</h2>
        <p class="lrp-serial">{{ $t('liurenSeeking.poster.serial') }}</p>

        <!-- AI 点题：能否寻回 + 大致方位，融入标题下方副标语 -->
        <p class="lrp-overview" :class="{ 'lrp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('liurenSeeking.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 失物名称：用户输入回填，寻物启事的「主标的物」 ============ -->
      <section class="lrp-item">
        <span class="lrp-item-flag">{{ $t('liurenSeeking.poster.itemFlag') }}</span>
        <span class="lrp-item-name">{{ lostItemName }}</span>
        <div class="lrp-item-meta">
          <span v-if="lostTime" class="lrp-item-meta-row">
            <em>{{ $t('liurenSeeking.poster.lostTimeLabel') }}</em>{{ lostTime }}
          </span>
          <span v-if="lastSeenPlace" class="lrp-item-meta-row">
            <em>{{ $t('liurenSeeking.poster.lastPlaceLabel') }}</em>{{ lastSeenPlace }}
          </span>
        </div>
      </section>

      <!-- ============ 推算字段栏：方位 / 时辰 / 概率现状 ============ -->
      <section class="lrp-fields">
        <div class="lrp-field">
          <span class="lrp-field-label">{{ $t('liurenSeeking.poster.dirLabel') }}</span>
          <p class="lrp-field-value" :class="{ 'lrp-field-pending': !aiParsed.dir }">
            {{ aiParsed.dir || $t('liurenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="lrp-field">
          <span class="lrp-field-label">{{ $t('liurenSeeking.poster.timeLabel') }}</span>
          <p class="lrp-field-value" :class="{ 'lrp-field-pending': !aiParsed.time }">
            {{ aiParsed.time || $t('liurenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="lrp-field">
          <span class="lrp-field-label">{{ $t('liurenSeeking.poster.probLabel') }}</span>
          <p class="lrp-field-value" :class="{ 'lrp-field-pending': !aiParsed.prob }">
            {{ aiParsed.prob || $t('liurenSeeking.poster.fieldPending') }}
          </p>
        </div>
      </section>

      <!-- ============ AI 寻找建议：结构化小格子卡片 ============ -->
      <section v-if="aiParsed.tips.length" class="lrp-tips">
        <span class="lrp-tips-flag">{{ $t('liurenSeeking.poster.tipsTitle') }}</span>
        <ul class="lrp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="lrp-tips-cell">
            <span class="lrp-tips-dot" aria-hidden="true" />
            <span class="lrp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 大六壬卦师收口提示 ============ -->
      <p class="lrp-note">
        <span class="lrp-note-label">{{ $t('liurenSeeking.poster.noteLabel') }}</span>
        <span :class="{ 'lrp-field-pending': !aiParsed.note }">
          {{ aiParsed.note || $t('liurenSeeking.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 盘面落款：月将占时小字 ============ -->
      <div class="lrp-panline">
        {{ $t('liurenSeeking.poster.panLine', { yuejiang: yuejiang, shichen: shichen, ri: riGanzhi, shi: shiGanzhi }) }}
      </div>

      <!-- ============ 底部：归档编号 + 盖印日期章（档案感，无交互、无二维码） ============ -->
      <footer class="lrp-foot">
        <div class="lrp-archive">
          <div class="lrp-archive-text">
            <p class="lrp-archive-no">
              <em>{{ $t('liurenSeeking.poster.archiveLabel') }}</em>
              {{ $t('liurenSeeking.poster.archiveNo', { no: archiveNo }) }}
            </p>
            <p class="lrp-archive-date">
              <em>{{ $t('liurenSeeking.poster.archiveDateLabel') }}</em>
              {{ archiveDate }}
            </p>
          </div>
          <div class="lrp-archive-seal" aria-hidden="true">
            <span class="lrp-archive-seal-text">{{ archiveSealText }}</span>
            <span class="lrp-archive-seal-date">{{ archiveDate }}</span>
          </div>
        </div>
        <!-- 引流二维码与档案块分离，独立成行 -->
        <div class="lrp-foot-row">
          <div class="lrp-seal-stamp">{{ $t('liurenSeeking.poster.seal') }}</div>
          <div class="lrp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="lrp-qr-img" v-html="qrSvg" />
            <span v-else class="lrp-qr-inner">{{ $t('liurenSeeking.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 失物名称/特征（用户输入回填） */
  lostItemName: string
  /** 丢失/最后见到时间 */
  lostTime?: string
  /** 最后见到地点 */
  lastSeenPlace?: string
  /** 月将 */
  yuejiang: string
  /** 占时（时辰） */
  shichen: string
  /** 日干支 */
  riGanzhi: string
  /** 时干支 */
  shiGanzhi: string
  /** AI 解读全文（OV:/DIR:/TIME:/PROB:/TIP:/NOTE: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  lostTime: '',
  lastSeenPlace: '',
  aiContent: '',
})
const { t } = useI18n()

/* ---------- 归档编号 + 盖印日期：档案感落款 ---------- */

/**
 * 立档日期：取起课当日。编号尾号由盘面字段做简单 hash，
 * 保证同一课同一号、看起来煞有介事。
 */
const pad = (n: number) => String(n).padStart(2, '0')

const archiveDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const archiveNo = computed(() => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const seed = `${props.yuejiang}|${props.shichen}|${props.riGanzhi}|${props.shiGanzhi}|${props.lostItemName}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `${ymd}-${String(h % 10000).padStart(4, '0')}`
})

/** 盖印文字（可含 \n 分行），配合做旧印章 */
const archiveSealText = computed(() =>
  t('liurenSeeking.poster.archiveSeal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/liuren-seeking`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- AI 解读解析：OV:/DIR:/TIME:/PROB:/TIP:/NOTE: 行协议 ---------- */

interface AiParsed {
  overview: string
  dir: string
  time: string
  prob: string
  tips: string[]
  note: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', dir: '', time: '', prob: '', tips: [], note: '' }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const match = (line: string, tag: string) => line.startsWith(`${tag}:`) || line.startsWith(`${tag}：`)
  const body = (line: string, tag: string) => clean(line.slice(tag.length + 1))

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (match(line, 'OV')) { if (!out.overview) out.overview = truncate(body(line, 'OV'), 60); continue }
    if (match(line, 'DIR')) { if (!out.dir) out.dir = truncate(body(line, 'DIR'), 60); continue }
    if (match(line, 'TIME')) { if (!out.time) out.time = truncate(body(line, 'TIME'), 50); continue }
    if (match(line, 'PROB')) { if (!out.prob) out.prob = truncate(body(line, 'PROB'), 50); continue }
    if (match(line, 'TIP')) {
      const item = truncate(body(line, 'TIP'), 44)
      if (item && out.tips.length < 2) out.tips.push(item)
      continue
    }
    if (match(line, 'NOTE')) { if (!out.note) out.note = truncate(body(line, 'NOTE'), 60); continue }
  }

  return out
})
</script>

<style scoped>
/* ========== 纸刊寻物启事海报（与 QimenSeekingPoster/LiuyaoSeekingPoster 同源纸质配色） ========== */
.lrp {
  --lrp-bg: #e9e2d0;
  --lrp-sheet: #f7f1e0;
  --lrp-ink: #2e2a24;
  --lrp-ink-soft: #55503f;
  --lrp-ink-faint: #8a8272;
  --lrp-line: #d8d0bd;
  --lrp-line-soft: #e6dfcd;
  --lrp-accent: #8c2f26;
  --lrp-accent-deep: #6e231c;
  --lrp-green: #4a7c59;
  --lrp-green-deep: #3a6449;
  background: var(--lrp-bg);
  /* 仿旧纸张纹理：细密横条纹 + 局部色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(120, 100, 60, 0.04) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 18% 12%, rgba(140, 47, 38, 0.05), transparent 40%),
    radial-gradient(circle at 85% 78%, rgba(74, 124, 89, 0.05), transparent 45%);
  padding: 16px;
  color: var(--lrp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.lrp-sheet {
  background: var(--lrp-sheet);
  border: 1px solid var(--lrp-line);
  box-shadow: 0 3px 18px rgba(60, 48, 30, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 撕边效果：上下缘用锯齿状 radial 撕口 */
.lrp-sheet::before,
.lrp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--lrp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.lrp-sheet::before { top: -6px; transform: scaleY(-1); }
.lrp-sheet::after { bottom: -6px; }

/* ---------- 顶部：大字标题 ---------- */
.lrp-head {
  text-align: center;
  padding: 4px 0 14px;
  border-bottom: 3px double var(--lrp-ink);
}
.lrp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--lrp-ink-faint);
}
.lrp-title {
  margin: 4px 0 2px;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1;
  color: var(--lrp-accent);
  /* 粗楷体/毛笔字年代感：多重描边阴影 */
  text-shadow:
    2px 2px 0 rgba(140, 47, 38, 0.18),
    0 0 1px var(--lrp-accent-deep);
}
.lrp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--lrp-ink-faint);
}
.lrp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--lrp-ink-soft);
}
.lrp-overview-pending { color: var(--lrp-ink-faint); font-style: italic; }

/* ---------- 失物名称（主标的物） ---------- */
.lrp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 12px;
  border-bottom: 1px solid var(--lrp-line);
  text-align: center;
}
.lrp-item-flag {
  font-size: 10px;
  letter-spacing: 3px;
  color: #f5efe0;
  background: var(--lrp-ink);
  padding: 2px 10px;
  border-radius: 3px;
}
.lrp-item-name {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lrp-ink);
  line-height: 1.2;
  word-break: break-word;
}
.lrp-item-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 18px;
}
.lrp-item-meta-row {
  font-size: 12px;
  color: var(--lrp-ink-soft);
  letter-spacing: 0.5px;
}
.lrp-item-meta-row em {
  font-style: normal;
  color: var(--lrp-ink-faint);
  margin-right: 4px;
}

/* ---------- 推算字段栏 ---------- */
.lrp-fields { padding: 6px 0 2px; }
.lrp-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--lrp-line);
}
.lrp-field:last-child { border-bottom: none; }
.lrp-field-label {
  flex-shrink: 0;
  width: 58px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--lrp-accent);
  border: 1.5px solid var(--lrp-accent);
  border-radius: 4px;
  text-align: center;
  padding: 3px 0;
  margin-top: 1px;
  line-height: 1.2;
}
.lrp-field-value {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lrp-ink);
}
.lrp-field-pending { color: var(--lrp-ink-faint); font-style: italic; font-size: 12.5px; }

/* ---------- AI 寻找建议：结构化小格子卡片 ---------- */
.lrp-tips {
  margin: 10px 0 0;
  border-top: 1px solid var(--lrp-line);
  border-bottom: 1px solid var(--lrp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.lrp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--lrp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.lrp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.lrp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--lrp-line-soft);
  border-left: 2px solid var(--lrp-green);
  border-radius: 4px;
  padding: 6px 8px;
  min-width: 0;
}
.lrp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lrp-green);
  margin-top: 6px;
}
.lrp-tips-item {
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--lrp-ink-soft);
  word-break: break-word;
}

/* ---------- 大六壬卦师收口提示 ---------- */
.lrp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--lrp-ink-soft);
  letter-spacing: 0.3px;
}
.lrp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lrp-accent);
  border: 1px solid var(--lrp-accent);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 盘面落款小字 ---------- */
.lrp-panline {
  margin-top: 12px;
  text-align: center;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--lrp-ink-faint);
}

/* ---------- 底部：归档编号 + 盖印日期章（档案感） ---------- */
.lrp-foot {
  margin-top: 14px;
  border-top: 2px solid var(--lrp-ink);
  padding-top: 12px;
}
.lrp-archive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 4px 2px;
}
.lrp-archive-text { min-width: 0; }
.lrp-archive-no,
.lrp-archive-date {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--lrp-ink);
  line-height: 1.7;
}
.lrp-archive-no { font-weight: 700; font-size: 14px; }
.lrp-archive-no em,
.lrp-archive-date em {
  font-style: normal;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--lrp-ink-faint);
  margin-right: 8px;
}
/* 仿盖印日期章：半透明朱红、做旧、边缘不齐、微歪斜 */
.lrp-archive-seal {
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  border: 2.5px solid rgba(178, 58, 44, 0.72);
  border-radius: 50%;
  /* 边缘不齐：多重不规则内描边 + 墨迹飞白 */
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
  /* 做旧：整体压半透明，让纸纹透出来 */
  opacity: 0.86;
  /* 墨迹不均：径向渐变让局部偏淡 */
  background: radial-gradient(circle at 38% 32%, rgba(178, 58, 44, 0.06), transparent 60%);
}
.lrp-archive-seal-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.3;
  white-space: pre-line;
}
.lrp-archive-seal-date {
  font-size: 9px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.lrp-foot-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.lrp-seal-stamp {
  width: 40px;
  height: 40px;
  border: 2px solid var(--lrp-accent);
  color: var(--lrp-accent);
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
.lrp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lrp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.lrp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.lrp-qr-inner {
  font-size: 8px;
  color: var(--lrp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--lrp-line);
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
  .lrp { padding: 10px; }
  .lrp-sheet { padding: 18px 14px 12px; }
  .lrp-title { font-size: 44px; letter-spacing: 6px; }
  .lrp-item-name { font-size: 24px; }
  .lrp-archive-seal { width: 78px; height: 78px; }
  .lrp-archive-seal-text { font-size: 11px; }
}
</style>
