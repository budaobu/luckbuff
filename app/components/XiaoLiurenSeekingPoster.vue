<template>
  <div class="xsp">
    <div class="xsp-sheet">
      <!-- ============ 顶部：大字标题（仿电线杆寻物启事） ============ -->
      <header class="xsp-head">
        <p class="xsp-kicker">{{ $t('xiaoLiurenSeeking.poster.kicker') }}</p>
        <h2 class="xsp-title">{{ $t('xiaoLiurenSeeking.poster.title') }}</h2>
        <p class="xsp-serial">{{ $t('xiaoLiurenSeeking.poster.serial') }}</p>

        <!-- AI 点题：能否寻回 + 大致方位，融入标题下方副标语 -->
        <p class="xsp-overview" :class="{ 'xsp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('xiaoLiurenSeeking.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 失物名称：用户输入回填，寻物启事的「主标的物」 ============ -->
      <section class="xsp-item">
        <span class="xsp-item-flag">{{ $t('xiaoLiurenSeeking.poster.itemFlag') }}</span>
        <span class="xsp-item-name">{{ lostItemName }}</span>
        <div class="xsp-item-meta">
          <span v-if="lostTime" class="xsp-item-meta-row">
            <em>{{ $t('xiaoLiurenSeeking.poster.lostTimeLabel') }}</em>{{ lostTime }}
          </span>
          <span v-if="lastSeenPlace" class="xsp-item-meta-row">
            <em>{{ $t('xiaoLiurenSeeking.poster.lastPlaceLabel') }}</em>{{ lastSeenPlace }}
          </span>
        </div>
      </section>

      <!-- ============ 掐指落宫：三步推宫 → 最终落宫（小六壬卦象区） ============ -->
      <section class="xsp-pan">
        <span class="xsp-pan-flag">{{ $t('xiaoLiurenSeeking.poster.panTitle') }}</span>
        <div class="xsp-pan-body">
          <!-- 三步掐指过程：大安起 → 留连 → 速喜…落宫 -->
          <div class="xsp-pan-steps">
            <template v-for="(step, i) in steps" :key="i">
              <span class="xsp-pan-step" :class="{ 'xsp-pan-step-final': i === steps.length - 1 }">
                {{ stepPalaceName(step) }}
              </span>
              <span v-if="i < steps.length - 1" class="xsp-pan-arrow" aria-hidden="true">→</span>
            </template>
          </div>
          <!-- 最终落宫落款 -->
          <div class="xsp-pan-final">
            <p class="xsp-pan-name">{{ finalPosition.name }}</p>
            <p class="xsp-pan-finger">{{ finalPosition.finger }}</p>
            <p class="xsp-pan-meaning">{{ finalPosition.meaning }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 推算字段栏：方位 / 时辰 / 概率现状 ============ -->
      <section class="xsp-fields">
        <div class="xsp-field">
          <span class="xsp-field-label">{{ $t('xiaoLiurenSeeking.poster.dirLabel') }}</span>
          <p class="xsp-field-value" :class="{ 'xsp-field-pending': !aiParsed.dir }">
            {{ aiParsed.dir || $t('xiaoLiurenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="xsp-field">
          <span class="xsp-field-label">{{ $t('xiaoLiurenSeeking.poster.timeLabel') }}</span>
          <p class="xsp-field-value" :class="{ 'xsp-field-pending': !aiParsed.time }">
            {{ aiParsed.time || $t('xiaoLiurenSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="xsp-field">
          <span class="xsp-field-label">{{ $t('xiaoLiurenSeeking.poster.probLabel') }}</span>
          <p class="xsp-field-value" :class="{ 'xsp-field-pending': !aiParsed.prob }">
            {{ aiParsed.prob || $t('xiaoLiurenSeeking.poster.fieldPending') }}
          </p>
        </div>
      </section>

      <!-- ============ AI 寻找建议：结构化小格子卡片 ============ -->
      <section v-if="aiParsed.tips.length" class="xsp-tips">
        <span class="xsp-tips-flag">{{ $t('xiaoLiurenSeeking.poster.tipsTitle') }}</span>
        <ul class="xsp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="xsp-tips-cell">
            <span class="xsp-tips-dot" aria-hidden="true" />
            <span class="xsp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 小六壬卦师收口提示（收着用，不写成段子） ============ -->
      <p class="xsp-note">
        <span class="xsp-note-label">{{ $t('xiaoLiurenSeeking.poster.noteLabel') }}</span>
        <span :class="{ 'xsp-field-pending': !aiParsed.note }">
          {{ aiParsed.note || $t('xiaoLiurenSeeking.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 盘面落款：农历时辰小字 ============ -->
      <div v-if="panLineText" class="xsp-panline">
        {{ panLineText }}
      </div>

      <!-- ============ 底部：归档编号 + 盖印日期章（档案感，无交互） ============ -->
      <footer class="xsp-foot">
        <div class="xsp-archive">
          <div class="xsp-archive-text">
            <p class="xsp-archive-no">
              <em>{{ $t('xiaoLiurenSeeking.poster.archiveLabel') }}</em>
              {{ $t('xiaoLiurenSeeking.poster.archiveNo', { no: archiveNo }) }}
            </p>
            <p class="xsp-archive-date">
              <em>{{ $t('xiaoLiurenSeeking.poster.archiveDateLabel') }}</em>
              {{ archiveDate }}
            </p>
          </div>
          <div class="xsp-archive-seal" aria-hidden="true">
            <span class="xsp-archive-seal-text">{{ archiveSealText }}</span>
            <span class="xsp-archive-seal-date">{{ archiveDate }}</span>
          </div>
        </div>
        <!-- 引流二维码与档案块分离，独立成行：整张海报唯一行动点 -->
        <div class="xsp-foot-row">
          <div class="xsp-seal-stamp">{{ $t('xiaoLiurenSeeking.poster.seal') }}</div>
          <div class="xsp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="xsp-qr-img" v-html="qrSvg" />
            <span v-else class="xsp-qr-inner">{{ $t('xiaoLiurenSeeking.poster.qrHint') }}</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XiaoLiurenPosition, XiaoLiurenStep } from '~/types/xiao-liuren'

interface Props {
  /** 失物名称/特征（用户输入回填） */
  lostItemName: string
  /** 丢失/最后见到时间 */
  lostTime?: string
  /** 最后见到地点 */
  lastSeenPlace?: string
  /** 三步掐指推宫过程 */
  steps?: XiaoLiurenStep[]
  /** 最终落宫 */
  finalPosition: XiaoLiurenPosition
  /** 农历日期（时间起卦） */
  lunarDate?: string
  /** 时辰地支 */
  hourBranch?: string
  /** AI 解读全文（OV:/DIR:/TIME:/PROB:/TIP:/NOTE: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  lostTime: '',
  lastSeenPlace: '',
  steps: () => [],
  lunarDate: '',
  hourBranch: '',
  aiContent: '',
})
const { t } = useI18n()

/* ---------- 掐指落宫 ---------- */

const PALACE_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']

/** 由 step.positionIndex 反推宫名（与页面 stepValueLabel 同一套取模逻辑） */
const stepPalaceName = (step: XiaoLiurenStep) =>
  PALACE_NAMES[((step.positionIndex % 6) + 6) % 6]

/** 盘面落款：农历 + 时辰，时间起卦才有，否则留空不渲染 */
const panLineText = computed(() => {
  if (!props.lunarDate) return ''
  return t('xiaoLiurenSeeking.poster.panLine', {
    lunar: props.lunarDate,
    hour: props.hourBranch,
  })
})

/* ---------- 归档编号 + 盖印日期：档案感落款 ---------- */

/**
 * 立档日期取今日。编号尾号由落宫字段做简单 hash，
 * 保证同一盘同一号、看起来煞有介事。
 */
const pad = (n: number) => String(n).padStart(2, '0')

const archiveDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${pad(d.getMonth() + 1)} 月 ${pad(d.getDate())} 日`
})

const archiveNo = computed(() => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const seed = `${props.finalPosition.name}|${props.finalPosition.index}|${props.lunarDate}|${props.lostItemName}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `${ymd}-${String(h % 10000).padStart(4, '0')}`
})

/** 盖印文字（可含 \n 分行），配合做旧印章 */
const archiveSealText = computed(() =>
  t('xiaoLiurenSeeking.poster.archiveSeal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：当前工具页 URL（整张海报唯一行动点） ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/xiao-liuren-seeking`
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
/* ========== 纸刊寻物启事海报（与 LiurenSeekingPoster/LiuyaoSeekingPoster/QimenSeekingPoster 同源纸质配色） ========== */
.xsp {
  --xsp-bg: #e9e2d0;
  --xsp-sheet: #f7f1e0;
  --xsp-ink: #2e2a24;
  --xsp-ink-soft: #55503f;
  --xsp-ink-faint: #8a8272;
  --xsp-line: #d8d0bd;
  --xsp-line-soft: #e6dfcd;
  --xsp-accent: #8c2f26;
  --xsp-accent-deep: #6e231c;
  --xsp-green: #4a7c59;
  --xsp-green-deep: #3a6449;
  background: var(--xsp-bg);
  /* 仿旧纸张纹理：细密横条纹 + 局部色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(120, 100, 60, 0.04) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 18% 12%, rgba(140, 47, 38, 0.05), transparent 40%),
    radial-gradient(circle at 85% 78%, rgba(74, 124, 89, 0.05), transparent 45%);
  padding: 16px;
  color: var(--xsp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.xsp-sheet {
  background: var(--xsp-sheet);
  border: 1px solid var(--xsp-line);
  box-shadow: 0 3px 18px rgba(60, 48, 30, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 撕边效果：上下缘用锯齿状 radial 撕口 */
.xsp-sheet::before,
.xsp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--xsp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.xsp-sheet::before { top: -6px; transform: scaleY(-1); }
.xsp-sheet::after { bottom: -6px; }

/* ---------- 顶部：大字标题 ---------- */
.xsp-head {
  text-align: center;
  padding: 4px 0 14px;
  border-bottom: 3px double var(--xsp-ink);
}
.xsp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--xsp-ink-faint);
}
.xsp-title {
  margin: 4px 0 2px;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1;
  color: var(--xsp-accent);
  /* 粗楷体/毛笔字年代感：多重描边阴影 */
  text-shadow:
    2px 2px 0 rgba(140, 47, 38, 0.18),
    0 0 1px var(--xsp-accent-deep);
}
.xsp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--xsp-ink-faint);
}
.xsp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--xsp-ink-soft);
}
.xsp-overview-pending { color: var(--xsp-ink-faint); font-style: italic; }

/* ---------- 失物名称（主标的物） ---------- */
.xsp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 12px;
  border-bottom: 1px solid var(--xsp-line);
  text-align: center;
}
.xsp-item-flag {
  font-size: 10px;
  letter-spacing: 3px;
  color: #f5efe0;
  background: var(--xsp-ink);
  padding: 2px 10px;
  border-radius: 3px;
}
.xsp-item-name {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--xsp-ink);
  line-height: 1.2;
  word-break: break-word;
}
.xsp-item-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 18px;
}
.xsp-item-meta-row {
  font-size: 12px;
  color: var(--xsp-ink-soft);
  letter-spacing: 0.5px;
}
.xsp-item-meta-row em {
  font-style: normal;
  color: var(--xsp-ink-faint);
  margin-right: 4px;
}

/* ---------- 掐指落宫：三步推宫 → 最终落宫 ---------- */
.xsp-pan {
  margin: 12px 0 0;
  border-top: 1px solid var(--xsp-line);
  padding: 11px 4px 4px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.xsp-pan-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--xsp-ink);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.xsp-pan-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
/* 三步掐指：宫名以墨点串联，末宫加重 */
.xsp-pan-steps {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.xsp-pan-step {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--xsp-ink-soft);
  padding: 3px 8px;
  border: 1px solid var(--xsp-line);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.5);
}
.xsp-pan-step-final {
  color: var(--xsp-accent);
  border-color: var(--xsp-accent);
  font-weight: 700;
  background: rgba(140, 47, 38, 0.06);
}
.xsp-pan-arrow {
  font-size: 12px;
  color: var(--xsp-ink-faint);
}
/* 最终落宫落款 */
.xsp-pan-final {
  min-width: 0;
  line-height: 1.3;
}
.xsp-pan-name {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--xsp-accent);
}
.xsp-pan-finger {
  margin: 2px 0 0;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--xsp-ink-faint);
}
.xsp-pan-meaning {
  margin: 3px 0 0;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--xsp-ink-soft);
}

/* ---------- 推算字段栏 ---------- */
.xsp-fields { padding: 6px 0 2px; }
.xsp-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--xsp-line);
}
.xsp-field:last-child { border-bottom: none; }
.xsp-field-label {
  flex-shrink: 0;
  width: 58px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--xsp-accent);
  border: 1.5px solid var(--xsp-accent);
  border-radius: 4px;
  text-align: center;
  padding: 3px 0;
  margin-top: 1px;
  line-height: 1.2;
}
.xsp-field-value {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--xsp-ink);
}
.xsp-field-pending { color: var(--xsp-ink-faint); font-style: italic; font-size: 12.5px; }

/* ---------- AI 寻找建议：结构化小格子卡片 ---------- */
.xsp-tips {
  margin: 10px 0 0;
  border-top: 1px solid var(--xsp-line);
  border-bottom: 1px solid var(--xsp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.xsp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--xsp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.xsp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.xsp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--xsp-line-soft);
  border-left: 2px solid var(--xsp-green);
  border-radius: 4px;
  padding: 6px 8px;
  min-width: 0;
}
.xsp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--xsp-green);
  margin-top: 6px;
}
.xsp-tips-item {
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--xsp-ink-soft);
  word-break: break-word;
}

/* ---------- 小六壬卦师收口提示 ---------- */
.xsp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--xsp-ink-soft);
  letter-spacing: 0.3px;
}
.xsp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--xsp-accent);
  border: 1px solid var(--xsp-accent);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 盘面落款小字 ---------- */
.xsp-panline {
  margin-top: 12px;
  text-align: center;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--xsp-ink-faint);
}

/* ---------- 底部：归档编号 + 盖印日期章（档案感） ---------- */
.xsp-foot {
  margin-top: 14px;
  border-top: 2px solid var(--xsp-ink);
  padding-top: 12px;
}
.xsp-archive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 4px 2px;
}
.xsp-archive-text { min-width: 0; }
.xsp-archive-no,
.xsp-archive-date {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--xsp-ink);
  line-height: 1.7;
}
.xsp-archive-no { font-weight: 700; font-size: 14px; }
.xsp-archive-no em,
.xsp-archive-date em {
  font-style: normal;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--xsp-ink-faint);
  margin-right: 8px;
}
/* 仿盖印日期章：半透明朱红、做旧、边缘不齐、微歪斜 */
.xsp-archive-seal {
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
.xsp-archive-seal-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.3;
  white-space: pre-line;
}
.xsp-archive-seal-date {
  font-size: 9px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.xsp-foot-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.xsp-seal-stamp {
  width: 40px;
  height: 40px;
  border: 2px solid var(--xsp-accent);
  color: var(--xsp-accent);
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
.xsp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.xsp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.xsp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.xsp-qr-inner {
  font-size: 8px;
  color: var(--xsp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--xsp-line);
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
  .xsp { padding: 10px; }
  .xsp-sheet { padding: 18px 14px 12px; }
  .xsp-title { font-size: 44px; letter-spacing: 6px; }
  .xsp-item-name { font-size: 24px; }
  .xsp-pan-name { font-size: 20px; }
  .xsp-archive-seal { width: 78px; height: 78px; }
  .xsp-archive-seal-text { font-size: 11px; }
}
</style>
