<template>
  <div class="lnp">
    <div class="lnp-sheet">
      <!-- 顶部：品牌横条 -->
      <div class="lnp-topbar">
        <span class="lnp-brand">{{ $t('liunian.poster.brand') }}</span>
        <span class="lnp-serial">{{ $t('liunian.poster.serial') }}</span>
      </div>

      <!-- 头部：流年 -->
      <header class="lnp-head">
        <p class="lnp-kicker">{{ $t('liunian.poster.kicker') }}</p>
        <div class="lnp-year-wrap">
          <span class="lnp-year-num">{{ targetYear }}</span>
          <div class="lnp-year-side">
            <span class="lnp-ganzhi">{{ yearGanZhi.gan }}{{ yearGanZhi.zhi }}{{ $t('liunian.poster.yearUnit') }}</span>
            <span class="lnp-shengxiao">{{ shengxiaoEmoji }}{{ yearGanZhi.shengxiao }}{{ $t('liunian.poster.zodiacUnit') }}</span>
          </div>
        </div>
        <div class="lnp-head-tags">
          <span class="lnp-tag">{{ $t('liunian.poster.tagDayMaster', { gan: dayMaster.gan, wuxing: dayMaster.wuxing }) }}</span>
          <span class="lnp-tag">{{ $t('liunian.poster.tagShiShen', { name: shiShen }) }}</span>
          <span v-if="taiSui" class="lnp-tag lnp-tag-warn">
            {{ $t(`liunian.poster.taiSui.${taiSui.relation}`) }}
          </span>
        </div>

        <!-- AI 总览融入头部副标语 -->
        <p class="lnp-overview" :class="{ 'lnp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || gradeOverview }}
        </p>
      </header>

      <!-- 流年指数 -->
      <section class="lnp-score">
        <div class="lnp-score-main">
          <span class="lnp-score-label">{{ $t('liunian.poster.scoreLabel') }}</span>
          <span class="lnp-score-num">{{ score }}</span>
        </div>
        <span class="lnp-grade-seal" :class="gradeSealClass">{{ gradeLabel }}</span>
      </section>

      <!-- 四维运势 -->
      <section class="lnp-dims">
        <div v-for="dim in dimItems" :key="dim.key" class="lnp-dim">
          <span class="lnp-dim-name">{{ dim.name }}</span>
          <span class="lnp-dim-text" :class="{ 'lnp-dim-text-pending': dim.pending }">{{ dim.text }}</span>
        </div>
      </section>

      <!-- 宜忌 -->
      <section v-if="aiParsed.yi.length || aiParsed.ji.length" class="lnp-yiji">
        <div class="lnp-yiji-col">
          <span class="lnp-yiji-flag lnp-yiji-flag-yi">{{ $t('liunian.poster.yiLabel') }}</span>
          <ul class="lnp-yiji-list">
            <li v-for="(item, i) in aiParsed.yi" :key="`yi-${i}`">{{ item }}</li>
          </ul>
        </div>
        <div class="lnp-yiji-col">
          <span class="lnp-yiji-flag lnp-yiji-flag-ji">{{ $t('liunian.poster.jiLabel') }}</span>
          <ul class="lnp-yiji-list">
            <li v-for="(item, i) in aiParsed.ji" :key="`ji-${i}`">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 开运 -->
      <section v-if="kaiyunText" class="lnp-kaiyun">
        <span class="lnp-kaiyun-label">{{ $t('liunian.poster.kaiyunLabel') }}</span>
        <span class="lnp-kaiyun-text">{{ kaiyunText }}</span>
      </section>

      <!-- 底部：落款 -->
      <footer class="lnp-foot">
        <div class="lnp-foot-brand">
          <div class="lnp-seal-stamp">{{ $t('liunian.poster.seal') }}</div>
          <div class="lnp-foot-meta">
            <span class="lnp-foot-site">{{ siteDomain }}</span>
            <span class="lnp-foot-note">{{ $t('liunian.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="lnp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="lnp-qr-img" v-html="qrSvg" />
          <span v-else class="lnp-qr-inner">{{ $t('liunian.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  targetYear: number
  yearGanZhi: { gan: string, zhi: string, shengxiao: string }
  dayMaster: { gan: string, wuxing: string }
  shiShen: string
  taiSui: { relation: string } | null
  score: number
  grade: 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'
  lucky: { direction: string, wuxing: string, color: string }
  /** AI 行协议文案（OV:/SY:/CY:/GQ:/JK:/YI:/JI:/KY:），流式追加，海报实时融合 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t } = useI18n()

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/liunian`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- 头部派生 ---------- */

const shengxiaoEmoji = computed(() => {
  const map: Record<string, string> = {
    鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
    马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
  }
  return map[props.yearGanZhi.shengxiao] || ''
})

const gradeLabel = computed(() => t(`liunian.poster.grade.${props.grade}`))

const gradeSealClass = computed(() => {
  if (props.grade === 'daji' || props.grade === 'ji') return 'lnp-grade-ji'
  if (props.grade === 'xiong' || props.grade === 'daxiong') return 'lnp-grade-xiong'
  return 'lnp-grade-ping'
})

/** AI 未给总览时，按评定等级回退到确定性文案 */
const gradeOverview = computed(() => t(`liunian.poster.gradeOverview.${props.grade}`))

/* ---------- AI 行协议解析 ---------- */

interface AiParsed {
  overview: string
  dims: { career: string, wealth: string, love: string, health: string }
  yi: string[]
  ji: string[]
  kaiyun: string
}

const LINE_PREFIX: Record<string, keyof AiParsed['dims']> = {
  SY: 'career',
  CY: 'wealth',
  GQ: 'love',
  JK: 'health',
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = {
    overview: '',
    dims: { career: '', wealth: '', love: '', health: '' },
    yi: [],
    ji: [],
    kaiyun: '',
  }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/^[：:\s]+/, '').replace(/[。.\s]+$/, '').trim()
  const cleanYiJi = (s: string) => clean(s).replace(/^[宜忌]\s*[：:,，、]?/, '')

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const match = line.match(/^([A-Z]{2})\s*[：:]\s*(.*)$/)
    if (!match) continue
    const prefix = match[1]!
    const body = clean(match[2] ?? '')
    if (!body) continue

    if (prefix === 'OV') {
      if (!out.overview) out.overview = truncate(body, 60)
      continue
    }
    if (prefix === 'KY') {
      if (!out.kaiyun) out.kaiyun = truncate(body, 32)
      continue
    }
    if (prefix === 'YI') {
      if (out.yi.length < 3) out.yi.push(truncate(cleanYiJi(match[2] ?? ''), 16))
      continue
    }
    if (prefix === 'JI') {
      if (out.ji.length < 3) out.ji.push(truncate(cleanYiJi(match[2] ?? ''), 16))
      continue
    }
    const dimKey = LINE_PREFIX[prefix]
    if (dimKey && !out.dims[dimKey]) out.dims[dimKey] = truncate(body, 18)
  }

  return out
})

/* ---------- 四维运势：AI 优先，未覆盖用确定性兜底句 ---------- */

const dimItems = computed(() => {
  const defs: Array<{ key: keyof AiParsed['dims'], nameKey: string }> = [
    { key: 'career', nameKey: 'liunian.poster.dimCareer' },
    { key: 'wealth', nameKey: 'liunian.poster.dimWealth' },
    { key: 'love', nameKey: 'liunian.poster.dimLove' },
    { key: 'health', nameKey: 'liunian.poster.dimHealth' },
  ]
  return defs.map(d => ({
    key: d.key,
    name: t(d.nameKey),
    text: aiParsed.value.dims[d.key] || t(`liunian.poster.dimFallback.${d.key}`),
    pending: !aiParsed.value.dims[d.key],
  }))
})

/** 开运行：AI 优先，否则用 lucky 数据拼确定性文案 */
const kaiyunText = computed(() => {
  if (aiParsed.value.kaiyun) return aiParsed.value.kaiyun
  return t('liunian.poster.kaiyunFallback', {
    direction: props.lucky.direction,
    color: props.lucky.color,
  })
})
</script>

<style scoped>
/* ========== 纸质流年海报（与 JishiCalendarPoster 同源纸质配色，竖版） ========== */
.lnp {
  --lnp-bg: #efe9db;
  --lnp-sheet: #faf5e9;
  --lnp-ink: #2e2a24;
  --lnp-ink-soft: #55503f;
  --lnp-ink-faint: #8a8272;
  --lnp-line: #d8d0bd;
  --lnp-line-soft: #e6dfcd;
  --lnp-accent: #8c2f26;
  --lnp-accent-deep: #6e231c;
  --lnp-green: #4a7c59;
  --lnp-green-deep: #3a6449;
  --lnp-gold: #a8512e;
  background: var(--lnp-bg);
  padding: 14px;
  color: var(--lnp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.lnp-sheet {
  background: var(--lnp-sheet);
  border: 1px solid var(--lnp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
.lnp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--lnp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.lnp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--lnp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--lnp-ink-faint);
}
.lnp-brand { font-weight: 700; color: var(--lnp-ink-soft); }

/* ---------- 头部流年 ---------- */
.lnp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--lnp-ink);
}
.lnp-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--lnp-accent);
  font-weight: 700;
}
.lnp-year-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}
.lnp-year-num {
  font-size: 72px;
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: 2px;
  color: var(--lnp-ink);
  font-variant-numeric: tabular-nums;
}
.lnp-year-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-left: 1px solid var(--lnp-line);
  padding-left: 16px;
}
.lnp-ganzhi { font-size: 22px; font-weight: 700; color: var(--lnp-ink); letter-spacing: 2px; }
.lnp-shengxiao { font-size: 13px; color: var(--lnp-ink-soft); letter-spacing: 2px; }
.lnp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.lnp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--lnp-ink-soft);
  border: 1px solid var(--lnp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  /* 导出图会用内联的 Noto Serif SC，字宽比页面回退字体大，不换行防止折行 */
  white-space: nowrap;
}
.lnp-tag-warn {
  color: var(--lnp-accent);
  border-color: var(--lnp-accent);
}

.lnp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--lnp-ink-soft);
}
.lnp-overview-pending { color: var(--lnp-ink-faint); font-style: italic; }

/* ---------- 流年指数 ---------- */
.lnp-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 6px;
  border-bottom: 1px solid var(--lnp-line);
}
.lnp-score-main { display: flex; align-items: baseline; gap: 10px; }
.lnp-score-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--lnp-ink-soft);
  font-weight: 700;
}
.lnp-score-num {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: var(--lnp-gold);
  font-variant-numeric: tabular-nums;
}
.lnp-grade-seal {
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
.lnp-grade-ji {
  background: var(--lnp-green);
  border: 2px solid var(--lnp-green-deep);
  color: #f5efe0;
  box-shadow: 0 1px 3px rgba(60, 48, 30, 0.2);
}
.lnp-grade-xiong {
  background: transparent;
  border: 2.5px solid var(--lnp-accent);
  color: var(--lnp-accent);
}
.lnp-grade-ping {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid var(--lnp-line);
  color: var(--lnp-ink-soft);
}

/* ---------- 四维运势 ---------- */
.lnp-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 2px 0;
}
.lnp-dim {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--lnp-line-soft);
  border-left: 2px solid var(--lnp-gold);
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.lnp-dim-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--lnp-ink);
}
.lnp-dim-text {
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--lnp-ink-soft);
  word-break: break-word;
}
.lnp-dim-text-pending { color: var(--lnp-ink-faint); font-style: italic; }

/* ---------- 宜忌 ---------- */
.lnp-yiji {
  margin-top: 12px;
  border-top: 1px solid var(--lnp-line);
  border-bottom: 1px solid var(--lnp-line);
  padding: 10px 2px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.lnp-yiji-col { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.lnp-yiji-flag {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.lnp-yiji-flag-yi { background: var(--lnp-green); color: #f5efe0; }
.lnp-yiji-flag-ji {
  background: transparent;
  border: 2px solid var(--lnp-accent);
  color: var(--lnp-accent);
}
.lnp-yiji-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lnp-yiji-list li {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--lnp-ink-soft);
  word-break: break-word;
}

/* ---------- 开运 ---------- */
.lnp-kaiyun {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}
.lnp-kaiyun-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #f5efe0;
  background: var(--lnp-accent);
  border-radius: 4px;
  padding: 4px 8px;
}
.lnp-kaiyun-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--lnp-ink);
  letter-spacing: 0.5px;
}

/* ---------- 底部落款 ---------- */
.lnp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--lnp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.lnp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.lnp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--lnp-accent);
  color: var(--lnp-accent);
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
.lnp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.lnp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--lnp-ink); }
.lnp-foot-note { font-size: 9.5px; color: var(--lnp-ink-faint); letter-spacing: 0.5px; }
.lnp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lnp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.lnp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.lnp-qr-inner {
  font-size: 8px;
  color: var(--lnp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--lnp-line);
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
  .lnp { padding: 8px; }
  .lnp-sheet { padding: 16px 12px 12px; }
  .lnp-year-num { font-size: 58px; }
  .lnp-score-num { font-size: 36px; }
  .lnp-grade-seal { width: 46px; height: 46px; font-size: 15px; }
}
</style>
