<template>
  <div class="qsp">
    <div class="qsp-sheet">
      <!-- ============ 顶部：大字标题（仿电线杆寻物启事） ============ -->
      <header class="qsp-head">
        <p class="qsp-kicker">{{ $t('qimenSeeking.poster.kicker') }}</p>
        <h2 class="qsp-title">{{ $t('qimenSeeking.poster.title') }}</h2>
        <p class="qsp-serial">{{ $t('qimenSeeking.poster.serial') }}</p>

        <!-- AI 点题：能否寻回 + 大致方位，融入标题下方副标语 -->
        <p class="qsp-overview" :class="{ 'qsp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('qimenSeeking.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 失物名称：用户输入回填，寻物启事的「主标的物」 ============ -->
      <section class="qsp-item">
        <span class="qsp-item-flag">{{ $t('qimenSeeking.poster.itemFlag') }}</span>
        <span class="qsp-item-name">{{ lostItemName }}</span>
        <div class="qsp-item-meta">
          <span v-if="lostTime" class="qsp-item-meta-row">
            <em>{{ $t('qimenSeeking.poster.lostTimeLabel') }}</em>{{ lostTime }}
          </span>
          <span v-if="lastSeenPlace" class="qsp-item-meta-row">
            <em>{{ $t('qimenSeeking.poster.lastPlaceLabel') }}</em>{{ lastSeenPlace }}
          </span>
        </div>
      </section>

      <!-- ============ 推算字段栏：方位 / 时辰 / 概率现状 ============ -->
      <section class="qsp-fields">
        <div class="qsp-field">
          <span class="qsp-field-label">{{ $t('qimenSeeking.poster.dirLabel') }}</span>
          <p class="qsp-field-value" :class="{ 'qsp-field-pending': !aiParsed.dir }">
            {{ aiParsed.dir || $t('qimenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="qsp-field">
          <span class="qsp-field-label">{{ $t('qimenSeeking.poster.timeLabel') }}</span>
          <p class="qsp-field-value" :class="{ 'qsp-field-pending': !aiParsed.time }">
            {{ aiParsed.time || $t('qimenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="qsp-field">
          <span class="qsp-field-label">{{ $t('qimenSeeking.poster.probLabel') }}</span>
          <p class="qsp-field-value" :class="{ 'qsp-field-pending': !aiParsed.prob }">
            {{ aiParsed.prob || $t('qimenSeeking.poster.fieldPending') }}
          </p>
        </div>
      </section>

      <!-- ============ AI 寻找建议：结构化小格子卡片 ============ -->
      <section v-if="aiParsed.tips.length" class="qsp-tips">
        <span class="qsp-tips-flag">{{ $t('qimenSeeking.poster.tipsTitle') }}</span>
        <ul class="qsp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="qsp-tips-cell">
            <span class="qsp-tips-dot" aria-hidden="true" />
            <span class="qsp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 奇门隐士收口提示 ============ -->
      <p class="qsp-note">
        <span class="qsp-note-label">{{ $t('qimenSeeking.poster.noteLabel') }}</span>
        <span :class="{ 'qsp-field-pending': !aiParsed.note }">
          {{ aiParsed.note || $t('qimenSeeking.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 盘面落款：遁局小字 ============ -->
      <div class="qsp-panline">
        {{ $t('qimenSeeking.poster.panLine', { dun: dunText, ju: juShu, ri: riGanzhi, shi: shiGanzhi }) }}
      </div>

      <!-- ============ 底部：联系方式撕条（换成品牌落款，重复几条） ============ -->
      <footer class="qsp-foot">
        <p class="qsp-foot-hint">{{ $t('qimenSeeking.poster.tearHint') }}</p>
        <div class="qsp-tears">
          <span v-for="n in tearCount" :key="n" class="qsp-tear">
            <span class="qsp-tear-site">{{ siteDomain }}</span>
            <span class="qsp-tear-brand">{{ $t('qimenSeeking.poster.brand') }}</span>
          </span>
        </div>
        <div class="qsp-foot-row">
          <div class="qsp-seal-stamp">{{ $t('qimenSeeking.poster.seal') }}</div>
          <div class="qsp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="qsp-qr-img" v-html="qrSvg" />
            <span v-else class="qsp-qr-inner">{{ $t('qimenSeeking.poster.qrHint') }}</span>
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
  /** 阳遁/阴遁 */
  yinYang: 'yang' | 'yin'
  juShu: number | string
  riGanzhi: string
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

const siteDomain = 'www.ososn.com'
/** 撕条条数：重复几条增加辨识度 */
const tearCount = 5

const dunText = computed(() => (props.yinYang === 'yang' ? t('qimenSeeking.poster.yang') : t('qimenSeeking.poster.yin')))

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/qimen-seeking`
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
/* ========== 纸刊寻物启事海报（与 JishiCalendarPoster/WuxingChuanyiPoster 同源纸质配色） ========== */
.qsp {
  --qsp-bg: #e9e2d0;
  --qsp-sheet: #f7f1e0;
  --qsp-ink: #2e2a24;
  --qsp-ink-soft: #55503f;
  --qsp-ink-faint: #8a8272;
  --qsp-line: #d8d0bd;
  --qsp-line-soft: #e6dfcd;
  --qsp-accent: #8c2f26;
  --qsp-accent-deep: #6e231c;
  --qsp-green: #4a7c59;
  --qsp-green-deep: #3a6449;
  background: var(--qsp-bg);
  /* 仿旧纸张纹理：细密横条纹 + 局部色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(120, 100, 60, 0.04) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 18% 12%, rgba(140, 47, 38, 0.05), transparent 40%),
    radial-gradient(circle at 85% 78%, rgba(74, 124, 89, 0.05), transparent 45%);
  padding: 16px;
  color: var(--qsp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.qsp-sheet {
  background: var(--qsp-sheet);
  border: 1px solid var(--qsp-line);
  box-shadow: 0 3px 18px rgba(60, 48, 30, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 撕边效果：上下缘用锯齿状 radial 撕口 */
.qsp-sheet::before,
.qsp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--qsp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.qsp-sheet::before { top: -6px; transform: scaleY(-1); }
.qsp-sheet::after { bottom: -6px; }

/* ---------- 顶部：大字标题 ---------- */
.qsp-head {
  text-align: center;
  padding: 4px 0 14px;
  border-bottom: 3px double var(--qsp-ink);
}
.qsp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--qsp-ink-faint);
}
.qsp-title {
  margin: 4px 0 2px;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1;
  color: var(--qsp-accent);
  /* 粗楷体/毛笔字年代感：多重描边阴影 */
  text-shadow:
    2px 2px 0 rgba(140, 47, 38, 0.18),
    0 0 1px var(--qsp-accent-deep);
}
.qsp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--qsp-ink-faint);
}
.qsp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--qsp-ink-soft);
}
.qsp-overview-pending { color: var(--qsp-ink-faint); font-style: italic; }

/* ---------- 失物名称（主标的物） ---------- */
.qsp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 12px;
  border-bottom: 1px solid var(--qsp-line);
  text-align: center;
}
.qsp-item-flag {
  font-size: 10px;
  letter-spacing: 3px;
  color: #f5efe0;
  background: var(--qsp-ink);
  padding: 2px 10px;
  border-radius: 3px;
}
.qsp-item-name {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--qsp-ink);
  line-height: 1.2;
  word-break: break-word;
}
.qsp-item-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 18px;
}
.qsp-item-meta-row {
  font-size: 12px;
  color: var(--qsp-ink-soft);
  letter-spacing: 0.5px;
}
.qsp-item-meta-row em {
  font-style: normal;
  color: var(--qsp-ink-faint);
  margin-right: 4px;
}

/* ---------- 推算字段栏 ---------- */
.qsp-fields { padding: 6px 0 2px; }
.qsp-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--qsp-line);
}
.qsp-field:last-child { border-bottom: none; }
.qsp-field-label {
  flex-shrink: 0;
  width: 58px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--qsp-accent);
  border: 1.5px solid var(--qsp-accent);
  border-radius: 4px;
  text-align: center;
  padding: 3px 0;
  margin-top: 1px;
  line-height: 1.2;
}
.qsp-field-value {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--qsp-ink);
}
.qsp-field-pending { color: var(--qsp-ink-faint); font-style: italic; font-size: 12.5px; }

/* ---------- AI 寻找建议：结构化小格子卡片 ---------- */
.qsp-tips {
  margin: 10px 0 0;
  border-top: 1px solid var(--qsp-line);
  border-bottom: 1px solid var(--qsp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.qsp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--qsp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.qsp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.qsp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--qsp-line-soft);
  border-left: 2px solid var(--qsp-green);
  border-radius: 4px;
  padding: 6px 8px;
  min-width: 0;
}
.qsp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--qsp-green);
  margin-top: 6px;
}
.qsp-tips-item {
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--qsp-ink-soft);
  word-break: break-word;
}

/* ---------- 奇门隐士收口提示 ---------- */
.qsp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--qsp-ink-soft);
  letter-spacing: 0.3px;
}
.qsp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--qsp-accent);
  border: 1px solid var(--qsp-accent);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 盘面落款小字 ---------- */
.qsp-panline {
  margin-top: 12px;
  text-align: center;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--qsp-ink-faint);
}

/* ---------- 底部：联系方式撕条 ---------- */
.qsp-foot {
  margin-top: 14px;
  border-top: 2px solid var(--qsp-ink);
  padding-top: 10px;
}
.qsp-foot-hint {
  margin: 0 0 8px;
  text-align: center;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--qsp-ink-faint);
}
.qsp-tears {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid var(--qsp-line);
  background: rgba(255, 255, 255, 0.4);
}
.qsp-tear {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 2px;
  /* 撕条之间的齿孔分隔线 */
  border-left: 1px dashed var(--qsp-line);
  transform: rotate(-0.5deg);
}
.qsp-tear:first-child { border-left: none; }
.qsp-tear:nth-child(odd) { transform: rotate(0.6deg); }
.qsp-tear-site {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--qsp-ink);
  /* 竖排，仿寻物启事电话撕条 */
  writing-mode: vertical-rl;
  max-height: 76px;
  overflow: hidden;
}
.qsp-tear-brand {
  font-size: 8px;
  letter-spacing: 1px;
  color: var(--qsp-ink-faint);
  writing-mode: vertical-rl;
  max-height: 60px;
  overflow: hidden;
}

.qsp-foot-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.qsp-seal-stamp {
  width: 40px;
  height: 40px;
  border: 2px solid var(--qsp-accent);
  color: var(--qsp-accent);
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
.qsp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qsp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.qsp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.qsp-qr-inner {
  font-size: 8px;
  color: var(--qsp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--qsp-line);
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
  .qsp { padding: 10px; }
  .qsp-sheet { padding: 18px 14px 12px; }
  .qsp-title { font-size: 44px; letter-spacing: 6px; }
  .qsp-item-name { font-size: 24px; }
  .qsp-tear-site { max-height: 62px; }
}
</style>
