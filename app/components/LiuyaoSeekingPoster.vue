<template>
  <div class="lsp">
    <div class="lsp-sheet">
      <!-- ============ 顶部：大字标题（仿电线杆寻物启事） ============ -->
      <header class="lsp-head">
        <p class="lsp-kicker">{{ $t('liuyaoSeeking.poster.kicker') }}</p>
        <h2 class="lsp-title">{{ $t('liuyaoSeeking.poster.title') }}</h2>
        <p class="lsp-serial">{{ $t('liuyaoSeeking.poster.serial') }}</p>

        <!-- AI 点题：能否寻回 + 大致方位，融入标题下方副标语 -->
        <p class="lsp-overview" :class="{ 'lsp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || $t('liuyaoSeeking.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 失物名称：用户输入回填，寻物启事的「主标的物」 ============ -->
      <section class="lsp-item">
        <span class="lsp-item-flag">{{ $t('liuyaoSeeking.poster.itemFlag') }}</span>
        <span class="lsp-item-name">{{ lostItemName }}</span>
        <div class="lsp-item-meta">
          <span v-if="lostTime" class="lsp-item-meta-row">
            <em>{{ $t('liuyaoSeeking.poster.lostTimeLabel') }}</em>{{ lostTime }}
          </span>
          <span v-if="lastSeenPlace" class="lsp-item-meta-row">
            <em>{{ $t('liuyaoSeeking.poster.lastPlaceLabel') }}</em>{{ lastSeenPlace }}
          </span>
        </div>
      </section>

      <!-- ============ 卦象：本卦墨线六爻 + 卦名落款（先掷钱排盘，卦象居断卦之前） ============ -->
      <section v-if="lines.length === 6" class="lsp-hex">
        <span class="lsp-hex-flag">{{ $t('liuyaoSeeking.poster.hexTitle') }}</span>
        <div class="lsp-hex-body">
          <!-- 本卦六爻墨线（自上而下绘制，动爻点墨点、标世应） -->
          <div class="lsp-hex-lines">
            <div
              v-for="(line, i) in lines"
              :key="i"
              class="lsp-hex-line-row"
            >
              <span class="lsp-hex-glyph" :class="{ 'lsp-hex-glyph-yin': isYinLine(line.value) }">
                <span class="lsp-hex-seg" />
                <span v-if="isYinLine(line.value)" class="lsp-hex-seg" />
              </span>
              <span v-if="isMovingLine(line)" class="lsp-hex-moving" aria-hidden="true" />
              <span v-if="roleOf(i)" class="lsp-hex-role">{{ roleOf(i) }}</span>
            </div>
          </div>
          <!-- 卦名落款 -->
          <div class="lsp-hex-names">
            <p class="lsp-hex-ben">{{ benGua }}</p>
            <p v-if="bianGua && bianGua !== benGua" class="lsp-hex-bian">
              {{ $t('liuyaoSeeking.poster.zhi') }} <em>{{ bianGua }}</em>
            </p>
            <p v-if="huGua" class="lsp-hex-hu">{{ $t('liuyaoSeeking.poster.huJian') }} {{ huGua }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 推算字段栏：方位 / 时辰 / 概率现状 ============ -->
      <section class="lsp-fields">
        <div class="lsp-field">
          <span class="lsp-field-label">{{ $t('liuyaoSeeking.poster.dirLabel') }}</span>
          <p class="lsp-field-value" :class="{ 'lsp-field-pending': !aiParsed.dir }">
            {{ aiParsed.dir || $t('liuyaoSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="lsp-field">
          <span class="lsp-field-label">{{ $t('liuyaoSeeking.poster.timeLabel') }}</span>
          <p class="lsp-field-value" :class="{ 'lsp-field-pending': !aiParsed.time }">
            {{ aiParsed.time || $t('liuyaoSeeking.poster.fieldPending') }}
          </p>
        </div>
        <div class="lsp-field">
          <span class="lsp-field-label">{{ $t('liuyaoSeeking.poster.probLabel') }}</span>
          <p class="lsp-field-value" :class="{ 'lsp-field-pending': !aiParsed.prob }">
            {{ aiParsed.prob || $t('liuyaoSeeking.poster.fieldPending') }}
          </p>
        </div>
      </section>

      <!-- ============ AI 寻找建议：结构化小格子卡片 ============ -->
      <section v-if="aiParsed.tips.length" class="lsp-tips">
        <span class="lsp-tips-flag">{{ $t('liuyaoSeeking.poster.tipsTitle') }}</span>
        <ul class="lsp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="lsp-tips-cell">
            <span class="lsp-tips-dot" aria-hidden="true" />
            <span class="lsp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 六爻卦师收口提示 ============ -->
      <p class="lsp-note">
        <span class="lsp-note-label">{{ $t('liuyaoSeeking.poster.noteLabel') }}</span>
        <span :class="{ 'lsp-field-pending': !aiParsed.note }">
          {{ aiParsed.note || $t('liuyaoSeeking.poster.notePending') }}
        </span>
      </p>

      <!-- ============ 卦象落款：本卦变卦小字 ============ -->
      <div class="lsp-panline">
        {{ $t('liuyaoSeeking.poster.panLine', { ben: benGua, bian: bianGua, hu: huGua, shi: shiYao, ying: yingYao }) }}
      </div>

      <!-- ============ 底部：归档编号 + 盖印日期章（档案感，无交互、无二维码） ============ -->
      <footer class="lsp-foot">
        <div class="lsp-archive">
          <div class="lsp-archive-text">
            <p class="lsp-archive-no">
              <em>{{ $t('liuyaoSeeking.poster.archiveLabel') }}</em>
              {{ $t('liuyaoSeeking.poster.archiveNo', { no: archiveNo }) }}
            </p>
            <p class="lsp-archive-date">
              <em>{{ $t('liuyaoSeeking.poster.archiveDateLabel') }}</em>
              {{ archiveDate }}
            </p>
          </div>
          <div class="lsp-archive-seal" aria-hidden="true">
            <span class="lsp-archive-seal-text">{{ archiveSealText }}</span>
            <span class="lsp-archive-seal-date">{{ archiveDate }}</span>
          </div>
        </div>
        <!-- 引流二维码与档案块分离，独立成行 -->
        <div class="lsp-foot-row">
          <div class="lsp-seal-stamp">{{ $t('liuyaoSeeking.poster.seal') }}</div>
          <div class="lsp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" class="lsp-qr-img" v-html="qrSvg" />
            <span v-else class="lsp-qr-inner">{{ $t('liuyaoSeeking.poster.qrHint') }}</span>
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
  /** 本卦 */
  benGua: string
  /** 变卦 */
  bianGua: string
  /** 互卦 */
  huGua?: string
  /** 世爻位 */
  shiYao?: number | string
  /** 应爻位 */
  yingYao?: number | string
  /** 六爻（自上而下），含爻值；动爻由 value 判定（6 老阴 / 9 老阳），isMoving 可缺省 */
  lines?: Array<{ value: number; isMoving?: boolean; label?: string }>
  /** AI 解读全文（OV:/DIR:/TIME:/PROB:/TIP:/NOTE: 行协议）。流式追加，海报实时融入。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  lostTime: '',
  lastSeenPlace: '',
  huGua: '',
  shiYao: '',
  yingYao: '',
  lines: () => [],
  aiContent: '',
})

const { t } = useI18n()

/* ---------- 卦象：墨线六爻 ---------- */

/** 阴爻（6 老阴 / 8 少阴）画断线，阳爻（7 少阳 / 9 老阳）画整线 */
const isYinLine = (value: number) => value === 6 || value === 8

/** 动爻：老阴 6 / 老阳 9 为动；后端不保证返回 isMoving，优先从 value 判定 */
const isMovingLine = (line: { value: number; isMoving?: boolean }) =>
  line.value === 6 || line.value === 9 || line.isMoving === true

/**
 * 把世/应爻位解析成 1~6（自初爻数起）。
 * 后端可能给数字，也可能给「初爻」「二爻」…「上爻」这种 label，两种都接住。
 */
const YAO_LABEL_TO_POS: Record<string, number> = {
  初爻: 1, 二爻: 2, 三爻: 3, 四爻: 4, 五爻: 5, 上爻: 6,
}
const yaoPosOf = (v: number | string | undefined): number => {
  if (typeof v === 'number' && v >= 1 && v <= 6) return v
  const s = String(v ?? '').trim()
  if (!s) return 0
  if (s in YAO_LABEL_TO_POS) return YAO_LABEL_TO_POS[s]!
  const n = Number(s)
  return n >= 1 && n <= 6 ? n : 0
}

/**
 * 某一行（自上而下 index）对应的世/应标记。
 * lines 数组 index 0 = 上爻（第 6 爻），index 5 = 初爻（第 1 爻）；
 * 世应爻位是 1~6 自初爻数起，故数组 index = 6 - 爻位。
 */
const roleOf = (topDownIndex: number): string => {
  const pos = 6 - topDownIndex // 该行实际爻位（1=初 … 6=上）
  if (yaoPosOf(props.shiYao) === pos) return t('liuyaoSeeking.poster.shiRole')
  if (yaoPosOf(props.yingYao) === pos) return t('liuyaoSeeking.poster.yingRole')
  return ''
}

/* ---------- 归档编号 + 盖印日期：档案感落款 ---------- */

/**
 * 立档日期：取起卦日（今天）。编号尾号由卦象字段做简单 hash，
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
  const seed = `${props.benGua}|${props.bianGua}|${props.huGua}|${props.shiYao}|${props.yingYao}|${props.lostItemName}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `${ymd}-${String(h % 10000).padStart(4, '0')}`
})

/** 盖印文字（可含 \n 分行），配合做旧印章 */
const archiveSealText = computed(() =>
  t('liuyaoSeeking.poster.archiveSeal').replace(/\\n/g, '\n'),
)

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/liuyao-seeking`
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
/* ========== 纸刊寻物启事海报（与 JishiCalendarPoster/WuxingChuanyiPoster/QimenSeekingPoster 同源纸质配色） ========== */
.lsp {
  --lsp-bg: #e9e2d0;
  --lsp-sheet: #f7f1e0;
  --lsp-ink: #2e2a24;
  --lsp-ink-soft: #55503f;
  --lsp-ink-faint: #8a8272;
  --lsp-line: #d8d0bd;
  --lsp-line-soft: #e6dfcd;
  --lsp-accent: #8c2f26;
  --lsp-accent-deep: #6e231c;
  --lsp-green: #4a7c59;
  --lsp-green-deep: #3a6449;
  background: var(--lsp-bg);
  /* 仿旧纸张纹理：细密横条纹 + 局部色斑 */
  background-image:
    repeating-linear-gradient(0deg, rgba(120, 100, 60, 0.04) 0 2px, transparent 2px 5px),
    radial-gradient(circle at 18% 12%, rgba(140, 47, 38, 0.05), transparent 40%),
    radial-gradient(circle at 85% 78%, rgba(74, 124, 89, 0.05), transparent 45%);
  padding: 16px;
  color: var(--lsp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.lsp-sheet {
  background: var(--lsp-sheet);
  border: 1px solid var(--lsp-line);
  box-shadow: 0 3px 18px rgba(60, 48, 30, 0.16);
  padding: 22px 20px 16px;
  position: relative;
}
/* 撕边效果：上下缘用锯齿状 radial 撕口 */
.lsp-sheet::before,
.lsp-sheet::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 7px;
  background-image: radial-gradient(circle at 7px 7px, var(--lsp-bg) 6px, transparent 6.5px);
  background-size: 14px 7px;
  background-repeat: repeat-x;
}
.lsp-sheet::before { top: -6px; transform: scaleY(-1); }
.lsp-sheet::after { bottom: -6px; }

/* ---------- 顶部：大字标题 ---------- */
.lsp-head {
  text-align: center;
  padding: 4px 0 14px;
  border-bottom: 3px double var(--lsp-ink);
}
.lsp-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--lsp-ink-faint);
}
.lsp-title {
  margin: 4px 0 2px;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1;
  color: var(--lsp-accent);
  /* 粗楷体/毛笔字年代感：多重描边阴影 */
  text-shadow:
    2px 2px 0 rgba(140, 47, 38, 0.18),
    0 0 1px var(--lsp-accent-deep);
}
.lsp-serial {
  margin: 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--lsp-ink-faint);
}
.lsp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--lsp-ink-soft);
}
.lsp-overview-pending { color: var(--lsp-ink-faint); font-style: italic; }

/* ---------- 失物名称（主标的物） ---------- */
.lsp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 12px;
  border-bottom: 1px solid var(--lsp-line);
  text-align: center;
}
.lsp-item-flag {
  font-size: 10px;
  letter-spacing: 3px;
  color: #f5efe0;
  background: var(--lsp-ink);
  padding: 2px 10px;
  border-radius: 3px;
}
.lsp-item-name {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lsp-ink);
  line-height: 1.2;
  word-break: break-word;
}
.lsp-item-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 18px;
}
.lsp-item-meta-row {
  font-size: 12px;
  color: var(--lsp-ink-soft);
  letter-spacing: 0.5px;
}
.lsp-item-meta-row em {
  font-style: normal;
  color: var(--lsp-ink-faint);
  margin-right: 4px;
}

/* ---------- 推算字段栏 ---------- */
.lsp-fields { padding: 6px 0 2px; }
.lsp-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--lsp-line);
}
.lsp-field:last-child { border-bottom: none; }
.lsp-field-label {
  flex-shrink: 0;
  width: 58px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--lsp-accent);
  border: 1.5px solid var(--lsp-accent);
  border-radius: 4px;
  text-align: center;
  padding: 3px 0;
  margin-top: 1px;
  line-height: 1.2;
}
.lsp-field-value {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.3px;
  color: var(--lsp-ink);
}
.lsp-field-pending { color: var(--lsp-ink-faint); font-style: italic; font-size: 12.5px; }

/* ---------- AI 寻找建议：结构化小格子卡片 ---------- */
.lsp-tips {
  margin: 10px 0 0;
  border-top: 1px solid var(--lsp-line);
  border-bottom: 1px solid var(--lsp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.lsp-tips-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--lsp-green);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.lsp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.lsp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--lsp-line-soft);
  border-left: 2px solid var(--lsp-green);
  border-radius: 4px;
  padding: 6px 8px;
  min-width: 0;
}
.lsp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lsp-green);
  margin-top: 6px;
}
.lsp-tips-item {
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--lsp-ink-soft);
  word-break: break-word;
}

/* ---------- 六爻卦师收口提示 ---------- */
.lsp-note {
  margin: 12px 2px 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--lsp-ink-soft);
  letter-spacing: 0.3px;
}
.lsp-note-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--lsp-accent);
  border: 1px solid var(--lsp-accent);
  border-radius: 3px;
  padding: 1px 5px;
  margin-right: 6px;
  vertical-align: 1px;
}

/* ---------- 卦象：墨线六爻 + 卦名落款 ---------- */
.lsp-hex {
  margin: 12px 0 0;
  border-top: 1px solid var(--lsp-line);
  padding: 11px 4px 4px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.lsp-hex-flag {
  flex-shrink: 0;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--lsp-ink);
  color: #f5efe0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.lsp-hex-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
/* 六爻墨线：自上而下，墨色横杠，阴爻断、阳爻连 */
.lsp-hex-lines {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.lsp-hex-line-row {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 8px;
}
.lsp-hex-glyph {
  display: flex;
  gap: 5px;
  width: 56px;
}
.lsp-hex-seg {
  flex: 1;
  height: 5px;
  background: var(--lsp-ink);
  border-radius: 1px;
  /* 毛笔飞白：边缘略虚 */
  box-shadow: 0 0 1px rgba(46, 42, 36, 0.4);
}
.lsp-hex-moving {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lsp-accent);
  flex-shrink: 0;
}
.lsp-hex-role {
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--lsp-accent);
  flex-shrink: 0;
}
/* 卦名落款 */
.lsp-hex-names {
  min-width: 0;
  line-height: 1.3;
}
.lsp-hex-ben {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lsp-ink);
}
.lsp-hex-bian {
  margin: 2px 0 0;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--lsp-ink-soft);
}
.lsp-hex-bian em {
  font-style: normal;
  font-weight: 700;
  color: var(--lsp-accent);
}
.lsp-hex-hu {
  margin: 2px 0 0;
  font-size: 10.5px;
  letter-spacing: 0.5px;
  color: var(--lsp-ink-faint);
}

/* ---------- 卦象落款小字 ---------- */
.lsp-panline {
  margin-top: 12px;
  text-align: center;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--lsp-ink-faint);
}

/* ---------- 底部：归档编号 + 盖印日期章（档案感） ---------- */
.lsp-foot {
  margin-top: 14px;
  border-top: 2px solid var(--lsp-ink);
  padding-top: 12px;
}
.lsp-archive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 4px 2px;
}
.lsp-archive-text { min-width: 0; }
.lsp-archive-no,
.lsp-archive-date {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--lsp-ink);
  line-height: 1.7;
}
.lsp-archive-no { font-weight: 700; font-size: 14px; }
.lsp-archive-no em,
.lsp-archive-date em {
  font-style: normal;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--lsp-ink-faint);
  margin-right: 8px;
}
/* 仿盖印日期章：半透明朱红、做旧、边缘不齐、微歪斜 */
.lsp-archive-seal {
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
.lsp-archive-seal-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.3;
  white-space: pre-line;
}
.lsp-archive-seal-date {
  font-size: 9px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.lsp-foot-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.lsp-seal-stamp {
  width: 40px;
  height: 40px;
  border: 2px solid var(--lsp-accent);
  color: var(--lsp-accent);
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
.lsp-qr {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lsp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.lsp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.lsp-qr-inner {
  font-size: 8px;
  color: var(--lsp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--lsp-line);
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
  .lsp { padding: 10px; }
  .lsp-sheet { padding: 18px 14px 12px; }
  .lsp-title { font-size: 44px; letter-spacing: 6px; }
  .lsp-item-name { font-size: 24px; }
  .lsp-archive-seal { width: 78px; height: 78px; }
  .lsp-archive-seal-text { font-size: 11px; }
}
</style>
