<template>
  <div class="hzp">
    <div class="hzp-sheet">
      <!-- ============ 顶部：品牌横条 ============ -->
      <div class="hzp-topbar">
        <span class="hzp-brand">{{ $t('huangjiZhiniangua.poster.brand') }}</span>
        <span class="hzp-serial">{{ $t('huangjiZhiniangua.poster.serial') }}</span>
      </div>

      <!-- ============ 头部：年份 ============ -->
      <header class="hzp-head">
        <div class="hzp-year-wrap">
          <span class="hzp-year-num">{{ year }}</span>
          <div class="hzp-year-side">
            <span class="hzp-ganzhi">{{ $t('huangjiZhiniangua.poster.ganzhiYear', { ganzhi }) }}</span>
            <span class="hzp-jinian">{{ $t('huangjiZhiniangua.poster.jinian', { n: jinian }) }}</span>
          </div>
        </div>
        <div class="hzp-head-tags">
          <span class="hzp-tag">{{ $t('huangjiZhiniangua.poster.shiTag', { start: shi.startYear, end: shi.endYear }) }}</span>
          <span class="hzp-tag">{{ $t('huangjiZhiniangua.poster.shiYearTag', { n: shi.yearInShi }) }}</span>
        </div>

        <!-- AI 概述融入头部副标语 -->
        <p class="hzp-overview" :class="{ 'hzp-overview-pending': !aiParsed.ov }">
          {{ aiParsed.ov || $t('huangjiZhiniangua.poster.overviewPending') }}
        </p>
      </header>

      <!-- ============ 卦象 ============ -->
      <section class="hzp-gua">
        <div class="hzp-gua-lines" aria-hidden="true">
          <div
            v-for="(line, i) in linesTopFirst"
            :key="i"
            class="hzp-gua-line"
          >
            <span v-if="line === 1" class="hzp-line-yang" />
            <template v-else>
              <span class="hzp-line-yin" />
              <span class="hzp-line-yin" />
            </template>
          </div>
        </div>
        <div class="hzp-gua-meta">
          <p class="hzp-gua-label">{{ $t('huangjiZhiniangua.poster.guaLabel') }}</p>
          <p class="hzp-gua-name">{{ gua.name }}</p>
          <p class="hzp-gua-meaning">{{ gua.meaning }}</p>
          <p class="hzp-gua-guaci">{{ $t('huangjiZhiniangua.poster.guaciLabel') }} · {{ gua.guaci }}</p>
        </div>
      </section>

      <!-- AI 卦象解读（GUA: 行） -->
      <p v-if="aiParsed.gua" class="hzp-ai-line">{{ aiParsed.gua }}</p>

      <!-- ============ 值爻 ============ -->
      <section class="hzp-yao">
        <div class="hzp-yao-head">
          <span class="hzp-section-title">{{ $t('huangjiZhiniangua.poster.yaoLabel') }}</span>
          <span class="hzp-yao-label">{{ yao.label }}</span>
          <span
            class="hzp-yao-seal"
            :class="yao.dangWei ? 'hzp-seal-dang' : 'hzp-seal-budang'"
          >
            {{ yao.dangWei ? $t('huangjiZhiniangua.poster.dangWei') : $t('huangjiZhiniangua.poster.buDangWei') }}
          </span>
        </div>
        <blockquote class="hzp-yaoci">{{ yao.text }}</blockquote>
        <p v-if="aiParsed.yao" class="hzp-ai-line">{{ aiParsed.yao }}</p>
      </section>

      <!-- ============ 大势走向 ============ -->
      <section class="hzp-dashi">
        <span class="hzp-section-title">{{ $t('huangjiZhiniangua.poster.dashiLabel') }}</span>
        <p class="hzp-dashi-text">{{ dashi }}</p>
        <p v-if="aiParsed.tre" class="hzp-ai-line">{{ aiParsed.tre }}</p>
      </section>

      <!-- ============ AI 锦囊 ============ -->
      <section v-if="aiParsed.tips.length" class="hzp-tips">
        <span class="hzp-tips-flag">{{ $t('huangjiZhiniangua.poster.tipsLabel') }}</span>
        <ul class="hzp-tips-grid">
          <li v-for="(item, i) in aiParsed.tips" :key="i" class="hzp-tips-cell">
            <span class="hzp-tips-dot" aria-hidden="true" />
            <span class="hzp-tips-item">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ 底部：落款 ============ -->
      <footer class="hzp-foot">
        <div class="hzp-foot-brand">
          <div class="hzp-seal-stamp">{{ $t('huangjiZhiniangua.poster.seal') }}</div>
          <div class="hzp-foot-meta">
            <span class="hzp-foot-site">{{ siteDomain }}</span>
            <span class="hzp-foot-note">{{ $t('huangjiZhiniangua.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="hzp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="hzp-qr-img" v-html="qrSvg" />
          <span v-else class="hzp-qr-inner">{{ $t('huangjiZhiniangua.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  year: number
  ganzhi: string
  jinian: number
  gua: { name: string; meaning: string; guaci: string; yaoArray: number[] }
  yao: { label: string; text: string; dangWei: boolean }
  shi: { startYear: number; endYear: number; yearInShi: number }
  dashi: string
  /** AI 解读全文（OV:/GUA:/YAO:/TRE:/TIP: 行协议）。流式追加，海报实时融合。 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/huangji-zhiniangua`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- 卦象六爻：yaoArray 初→上，渲染上→初 ---------- */

const linesTopFirst = computed(() => [...props.gua.yaoArray].reverse())

/* ---------- AI 行协议解析 ---------- */

interface AiParsed {
  ov: string
  gua: string
  yao: string
  tre: string
  tips: string[]
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { ov: '', gua: '', yao: '', tre: '', tips: [] }
  if (!text.trim()) return out

  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
  const clean = (s: string) => s.replace(/\*\*/g, '').replace(/[。.\s]+$/, '').trim()

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    const match = line.match(/^(OV|GUA|YAO|TRE|TIP)\s*[:：]\s*(.*)$/)
    if (!match) continue
    const [, key, body] = match
    const content = clean(body || '')
    if (!content) continue

    if (key === 'OV' && !out.ov) out.ov = truncate(content, 60)
    else if (key === 'GUA' && !out.gua) out.gua = truncate(content, 72)
    else if (key === 'YAO' && !out.yao) out.yao = truncate(content, 72)
    else if (key === 'TRE' && !out.tre) out.tre = truncate(content, 72)
    else if (key === 'TIP' && out.tips.length < 3) out.tips.push(truncate(content, 40))
  }

  return out
})
</script>

<style scoped>
/* ========== 纸质卦帖海报（与 JishiCalendarPoster 同源纸质配色，竖版卦帖版式） ========== */
.hzp {
  --hzp-bg: #efe9db;
  --hzp-sheet: #faf5e9;
  --hzp-ink: #2e2a24;
  --hzp-ink-soft: #55503f;
  --hzp-ink-faint: #8a8272;
  --hzp-line: #d8d0bd;
  --hzp-line-soft: #e6dfcd;
  --hzp-accent: #8c2f26;
  --hzp-accent-deep: #6e231c;
  --hzp-green: #4a7c59;
  --hzp-green-deep: #3a6449;
  background: var(--hzp-bg);
  padding: 14px;
  color: var(--hzp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.hzp-sheet {
  background: var(--hzp-sheet);
  border: 1px solid var(--hzp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
.hzp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--hzp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.hzp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--hzp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--hzp-ink-faint);
}
.hzp-brand { font-weight: 700; color: var(--hzp-ink-soft); }
.hzp-serial { letter-spacing: 1px; }

/* ---------- 头部年份 ---------- */
.hzp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--hzp-ink);
}
.hzp-year-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.hzp-year-num {
  font-size: 76px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: 2px;
  color: var(--hzp-ink);
}
.hzp-year-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-left: 1px solid var(--hzp-line);
  padding-left: 16px;
}
.hzp-ganzhi { font-size: 20px; font-weight: 700; color: var(--hzp-accent); letter-spacing: 2px; }
.hzp-jinian { font-size: 12px; color: var(--hzp-ink-soft); letter-spacing: 1px; }
.hzp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.hzp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--hzp-ink-soft);
  border: 1px solid var(--hzp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}
.hzp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--hzp-ink-soft);
}
.hzp-overview-pending { color: var(--hzp-ink-faint); font-style: italic; }

/* ---------- 卦象 ---------- */
.hzp-gua {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 16px 6px 6px;
}
.hzp-gua-lines {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 108px;
}
.hzp-gua-line {
  display: flex;
  justify-content: space-between;
  height: 10px;
}
.hzp-line-yang {
  width: 100%;
  background: var(--hzp-ink);
  border-radius: 2px;
}
.hzp-line-yin {
  width: 44%;
  background: var(--hzp-ink);
  border-radius: 2px;
}
.hzp-gua-meta { min-width: 0; text-align: left; }
.hzp-gua-label {
  margin: 0;
  font-size: 10.5px;
  letter-spacing: 3px;
  color: var(--hzp-ink-faint);
}
.hzp-gua-name {
  margin: 2px 0 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--hzp-ink);
  line-height: 1.2;
}
.hzp-gua-meaning {
  margin: 2px 0 0;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--hzp-accent);
  font-weight: 700;
}
.hzp-gua-guaci {
  margin: 6px 0 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--hzp-ink-soft);
}

/* AI 解读行：与兜底文本区分，略加深 */
.hzp-ai-line {
  margin: 8px 6px 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--hzp-ink);
  letter-spacing: 0.3px;
}

/* ---------- 值爻 ---------- */
.hzp-yao {
  margin-top: 14px;
  border-top: 1px solid var(--hzp-line);
  padding: 12px 6px 2px;
}
.hzp-yao-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hzp-section-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--hzp-ink);
}
.hzp-yao-label {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--hzp-accent-deep);
}
.hzp-yao-seal {
  flex-shrink: 0;
  margin-left: auto;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  letter-spacing: 1px;
}
.hzp-seal-dang {
  background: var(--hzp-green);
  border: 2px solid var(--hzp-green-deep);
  color: #f5efe0;
  transform: rotate(-3deg);
}
.hzp-seal-budang {
  background: transparent;
  border: 2px solid var(--hzp-accent);
  color: var(--hzp-accent);
  transform: rotate(2deg);
}
.hzp-yaoci {
  margin: 10px 0 0;
  padding: 10px 14px;
  border-left: 3px solid var(--hzp-accent);
  background: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 1px;
  color: var(--hzp-ink);
}

/* ---------- 大势走向 ---------- */
.hzp-dashi {
  margin-top: 14px;
  border-top: 1px solid var(--hzp-line);
  padding: 12px 6px 2px;
}
.hzp-dashi-text {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.8;
  letter-spacing: 0.5px;
  color: var(--hzp-ink-soft);
}

/* ---------- AI 锦囊 ---------- */
.hzp-tips {
  margin: 14px 0 0;
  border-top: 1px solid var(--hzp-line);
  border-bottom: 1px solid var(--hzp-line);
  padding: 10px 4px 11px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.hzp-tips-flag {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--hzp-green);
  color: #f5efe0;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.hzp-tips-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.hzp-tips-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--hzp-line-soft);
  border-left: 2px solid var(--hzp-green);
  border-radius: 4px;
  padding: 5px 8px;
  min-width: 0;
}
.hzp-tips-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--hzp-green);
  margin-top: 6px;
}
.hzp-tips-item {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--hzp-ink-soft);
  word-break: break-word;
}

/* ---------- 底部落款 ---------- */
.hzp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--hzp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.hzp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.hzp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--hzp-accent);
  color: var(--hzp-accent);
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
.hzp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.hzp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--hzp-ink); }
.hzp-foot-note { font-size: 9.5px; color: var(--hzp-ink-faint); letter-spacing: 0.5px; }
.hzp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hzp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.hzp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.hzp-qr-inner {
  font-size: 8px;
  color: var(--hzp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--hzp-line);
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
</style>
