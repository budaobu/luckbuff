<template>
  <div class="jgp">
    <div class="jgp-sheet">
      <!-- 顶部：品牌横条 -->
      <div class="jgp-topbar">
        <span class="jgp-brand">{{ $t('jinsuoyuguan.poster.brand') }}</span>
        <span class="jgp-serial">{{ $t('jinsuoyuguan.poster.serial') }}</span>
      </div>

      <!-- 头部：坐向 -->
      <header class="jgp-head">
        <p class="jgp-kicker">{{ $t('jinsuoyuguan.poster.kicker') }}</p>
        <div class="jgp-facing-wrap">
          <span class="jgp-facing">
            <span class="jgp-facing-part">{{ sittingLabel }}</span><span class="jgp-facing-part">{{ facingLabel }}</span>
          </span>
          <span class="jgp-degree">{{ direction }}{{ $t('jinsuoyuguan.poster.degreeUnit') }}</span>
        </div>
        <div class="jgp-head-tags">
          <span class="jgp-tag">{{ usageLabel }}</span>
          <span class="jgp-tag">{{ $t(`jinsuoyuguan.poster.grade.${grade}`) }}</span>
        </div>

        <!-- AI 总览融入头部副标语 -->
        <p class="jgp-overview" :class="{ 'jgp-overview-pending': !aiParsed.overview }">
          {{ aiParsed.overview || gradeOverview }}
        </p>
      </header>

      <!-- 宅运指数 -->
      <section class="jgp-score">
        <div class="jgp-score-main">
          <span class="jgp-score-label">{{ $t('jinsuoyuguan.poster.scoreLabel') }}</span>
          <span class="jgp-score-num">{{ score }}</span>
        </div>
        <span class="jgp-grade-seal" :class="gradeSealClass">{{ gradeLabel }}</span>
      </section>

      <!-- 九宫砂水盘 -->
      <section class="jgp-grid">
        <div
          v-for="cell in gridCells"
          :key="cell.key"
          class="jgp-cell"
          :class="[`jgp-cell-${cell.status}`, { 'jgp-cell-center': cell.key === 'zhong' }]"
        >
          <template v-if="cell.key === 'zhong'">
            <span class="jgp-cell-trigram">{{ $t('jinsuoyuguan.poster.centerTrigram') }}</span>
            <span class="jgp-cell-dir">{{ $t('jinsuoyuguan.poster.centerLabel') }}</span>
          </template>
          <template v-else>
            <span class="jgp-cell-head">
              <span class="jgp-cell-trigram">{{ cell.trigram }}</span>
              <span class="jgp-cell-status">{{ cell.statusLabel }}</span>
            </span>
            <span class="jgp-cell-dir">{{ cell.dir }} · {{ cell.theme }}</span>
          </template>
        </div>
      </section>

      <!-- 最佳/最需注意方位 -->
      <section class="jgp-focus">
        <div class="jgp-focus-row">
          <span class="jgp-focus-flag jgp-focus-flag-best">{{ $t('jinsuoyuguan.poster.bestLabel') }}</span>
          <span class="jgp-focus-text" :class="{ 'jgp-focus-text-pending': !aiParsed.best }">{{ bestText }}</span>
        </div>
        <div class="jgp-focus-row">
          <span class="jgp-focus-flag jgp-focus-flag-worst">{{ $t('jinsuoyuguan.poster.worstLabel') }}</span>
          <span class="jgp-focus-text" :class="{ 'jgp-focus-text-pending': !aiParsed.worst }">{{ worstText }}</span>
        </div>
      </section>

      <!-- 改善建议：确定性反局修复，不依赖 AI -->
      <section class="jgp-improve">
        <div class="jgp-improve-head">
          <span class="jgp-improve-flag">{{ $t('jinsuoyuguan.poster.improveLabel') }}</span>
        </div>
        <ul v-if="improveItems.length" class="jgp-improve-list">
          <li v-for="(item, i) in improveItems" :key="`fix-${i}`">{{ item }}</li>
        </ul>
        <p v-else class="jgp-improve-none">{{ $t('jinsuoyuguan.poster.fixNone') }}</p>
      </section>

      <!-- 宜忌 -->
      <section v-if="aiParsed.yi.length || aiParsed.ji.length" class="jgp-yiji">
        <div class="jgp-yiji-col">
          <span class="jgp-yiji-flag jgp-yiji-flag-yi">{{ $t('jinsuoyuguan.poster.yiLabel') }}</span>
          <ul class="jgp-yiji-list">
            <li v-for="(item, i) in aiParsed.yi" :key="`yi-${i}`">{{ item }}</li>
          </ul>
        </div>
        <div class="jgp-yiji-col">
          <span class="jgp-yiji-flag jgp-yiji-flag-ji">{{ $t('jinsuoyuguan.poster.jiLabel') }}</span>
          <ul class="jgp-yiji-list">
            <li v-for="(item, i) in aiParsed.ji" :key="`ji-${i}`">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 开运 -->
      <section v-if="kaiyunText" class="jgp-kaiyun">
        <span class="jgp-kaiyun-label">{{ $t('jinsuoyuguan.poster.kaiyunLabel') }}</span>
        <span class="jgp-kaiyun-text">{{ kaiyunText }}</span>
      </section>

      <!-- 底部：落款 -->
      <footer class="jgp-foot">
        <div class="jgp-foot-brand">
          <div class="jgp-seal-stamp">{{ $t('jinsuoyuguan.poster.seal') }}</div>
          <div class="jgp-foot-meta">
            <span class="jgp-foot-site">{{ siteDomain }}</span>
            <span class="jgp-foot-note">{{ $t('jinsuoyuguan.poster.footerNote') }}</span>
          </div>
        </div>
        <div class="jgp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" class="jgp-qr-img" v-html="qrSvg" />
          <span v-else class="jgp-qr-inner">{{ $t('jinsuoyuguan.poster.qrHint') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PalaceResult {
  key: string
  wants: 'sha' | 'shui'
  theme: string
  elements: string[]
  score: number
  status: 'ji' | 'xiong' | 'ping'
  fixKeys: string[]
}

interface Props {
  direction: number
  facing: string
  sitting: string
  usage?: string
  palaces: PalaceResult[]
  score: number
  grade: 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'
  best: string | null
  worst: string | null
  /** AI 行协议文案（OV:/JX:/ZX:/YI:/JI:/KY:），流式追加，海报实时融合 */
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '', usage: undefined })
const { t } = useI18n()

const siteDomain = 'www.ososn.com'

/* ---------- 底部二维码：当前工具页 URL ---------- */

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/jinsuoyuguan-fengshui`
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2e2a24', light: '#00000000' },
  })
})

/* ---------- 头部派生 ---------- */

const trigramLabel = (key: string) => t(`jinsuoyuguan.palaceNames.${key}`)
const dirLabel = (key: string) => t(`jinsuoyuguan.palaceDirs.${key}`)

const sittingLabel = computed(() => t('jinsuoyuguan.poster.sittingPrefix') + trigramLabel(props.sitting))
const facingLabel = computed(() => t('jinsuoyuguan.poster.facingPrefix') + trigramLabel(props.facing))

const usageLabel = computed(() => props.usage
  ? t(`jinsuoyuguan.usageOptions.${props.usage}`)
  : t('jinsuoyuguan.usageOptions.residential'))

const gradeLabel = computed(() => t(`jinsuoyuguan.poster.grade.${props.grade}`))

const gradeSealClass = computed(() => {
  if (props.grade === 'daji' || props.grade === 'ji') return 'jgp-grade-ji'
  if (props.grade === 'xiong' || props.grade === 'daxiong') return 'jgp-grade-xiong'
  return 'jgp-grade-ping'
})

/** AI 未给总览时，按评定等级回退到确定性文案 */
const gradeOverview = computed(() => t(`jinsuoyuguan.poster.gradeOverview.${props.grade}`))

/* ---------- 九宫格：上南下北 巽离坤 / 震中兑 / 艮坎乾 ---------- */

const gridCells = computed(() => {
  const order = ['xun', 'li', 'kun', 'zhen', 'zhong', 'dui', 'gen', 'kan', 'qian']
  return order.map((key) => {
    if (key === 'zhong') return { key: 'zhong', status: 'ping' as const }
    const palace = props.palaces.find(p => p.key === key)!
    return {
      key,
      trigram: trigramLabel(key),
      dir: dirLabel(key),
      theme: t(`jinsuoyuguan.palaceThemes.${palace.theme}`),
      status: palace.status,
      statusLabel: t(`jinsuoyuguan.status.${palace.status}`),
    }
  })
})

/* ---------- AI 行协议解析 ---------- */

interface AiParsed {
  overview: string
  best: string
  worst: string
  yi: string[]
  ji: string[]
  kaiyun: string
}

const aiParsed = computed<AiParsed>(() => {
  const text = props.aiContent || ''
  const out: AiParsed = { overview: '', best: '', worst: '', yi: [], ji: [], kaiyun: '' }
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
      if (!out.overview) out.overview = truncate(body, 64)
    }
    else if (prefix === 'JX') {
      if (!out.best) out.best = truncate(body, 30)
    }
    else if (prefix === 'ZX') {
      if (!out.worst) out.worst = truncate(body, 30)
    }
    else if (prefix === 'KY') {
      if (!out.kaiyun) out.kaiyun = truncate(body, 36)
    }
    else if (prefix === 'YI') {
      if (out.yi.length < 3) out.yi.push(truncate(cleanYiJi(match[2] ?? ''), 18))
    }
    else if (prefix === 'JI') {
      if (out.ji.length < 3) out.ji.push(truncate(cleanYiJi(match[2] ?? ''), 18))
    }
  }

  return out
})

/* ---------- 最佳/最需注意：AI 优先，未覆盖用确定性兜底句 ---------- */

const bestText = computed(() => {
  if (aiParsed.value.best) return aiParsed.value.best
  if (!props.best) return t('jinsuoyuguan.poster.bestNone')
  const palace = props.palaces.find(p => p.key === props.best)!
  return t('jinsuoyuguan.poster.bestFallback', {
    dir: dirLabel(palace.key),
    theme: t(`jinsuoyuguan.palaceThemes.${palace.theme}`),
  })
})

const worstText = computed(() => {
  if (aiParsed.value.worst) return aiParsed.value.worst
  if (!props.worst) return t('jinsuoyuguan.poster.worstNone')
  const palace = props.palaces.find(p => p.key === props.worst)!
  return t('jinsuoyuguan.poster.worstFallback', {
    dir: dirLabel(palace.key),
    theme: t(`jinsuoyuguan.palaceThemes.${palace.theme}`),
  })
})

/** 开运行：AI 优先，否则回退到确定性文案 */
const kaiyunText = computed(() => {
  if (aiParsed.value.kaiyun) return aiParsed.value.kaiyun
  return t('jinsuoyuguan.poster.kaiyunFallback')
})

/* ---------- 改善建议：凶宫反局的确定性修复，最凶的最多 3 条 ---------- */

const improveItems = computed(() => {
  return props.palaces
    .filter(p => p.fixKeys?.length)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .flatMap(p => p.fixKeys.map(fixKey => t(`jinsuoyuguan.poster.fix.${fixKey}`, {
      dir: dirLabel(p.key),
      theme: t(`jinsuoyuguan.palaceThemes.${p.theme}`),
    })))
    .slice(0, 3)
})
</script>

<style scoped>
/* ========== 纸质金锁玉关海报（与 LiunianPoster 同源纸质配色，竖版） ========== */
.jgp {
  --jgp-bg: #efe9db;
  --jgp-sheet: #faf5e9;
  --jgp-ink: #2e2a24;
  --jgp-ink-soft: #55503f;
  --jgp-ink-faint: #8a8272;
  --jgp-line: #d8d0bd;
  --jgp-line-soft: #e6dfcd;
  --jgp-accent: #8c2f26;
  --jgp-accent-deep: #6e231c;
  --jgp-green: #4a7c59;
  --jgp-green-deep: #3a6449;
  --jgp-gold: #a8512e;
  background: var(--jgp-bg);
  padding: 14px;
  color: var(--jgp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  width: 100%;
}

.jgp-sheet {
  background: var(--jgp-sheet);
  border: 1px solid var(--jgp-line);
  box-shadow: 0 2px 16px rgba(60, 48, 30, 0.12);
  padding: 20px 18px 16px;
  position: relative;
}
.jgp-sheet::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: var(--jgp-line);
}

/* ---------- 顶部品牌横条 ---------- */
.jgp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--jgp-line);
  padding: 6px 2px 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--jgp-ink-faint);
}
.jgp-brand { font-weight: 700; color: var(--jgp-ink-soft); }

/* ---------- 头部坐向 ---------- */
.jgp-head {
  text-align: center;
  padding: 16px 0 14px;
  border-bottom: 2px solid var(--jgp-ink);
}
.jgp-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--jgp-accent);
  font-weight: 700;
}
.jgp-facing-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 10px;
}
.jgp-facing {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 4px;
  color: var(--jgp-ink);
}
.jgp-facing-part { white-space: nowrap; }
.jgp-degree {
  font-size: 16px;
  color: var(--jgp-ink-soft);
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}
.jgp-head-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.jgp-tag {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--jgp-ink-soft);
  border: 1px solid var(--jgp-line);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.jgp-overview {
  margin: 12px auto 0;
  max-width: 30em;
  font-size: 12.5px;
  line-height: 1.7;
  letter-spacing: 0.5px;
  color: var(--jgp-ink-soft);
}
.jgp-overview-pending { color: var(--jgp-ink-faint); font-style: italic; }

/* ---------- 宅运指数 ---------- */
.jgp-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 6px;
  border-bottom: 1px solid var(--jgp-line);
}
.jgp-score-main { display: flex; align-items: baseline; gap: 10px; }
.jgp-score-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--jgp-ink-soft);
  font-weight: 700;
}
.jgp-score-num {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: var(--jgp-gold);
  font-variant-numeric: tabular-nums;
}
.jgp-grade-seal {
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
.jgp-grade-ji {
  background: var(--jgp-green);
  border: 2px solid var(--jgp-green-deep);
  color: #f5efe0;
  box-shadow: 0 1px 3px rgba(60, 48, 30, 0.2);
}
.jgp-grade-xiong {
  background: transparent;
  border: 2.5px solid var(--jgp-accent);
  color: var(--jgp-accent);
}
.jgp-grade-ping {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid var(--jgp-line);
  color: var(--jgp-ink-soft);
}

/* ---------- 九宫砂水盘 ---------- */
.jgp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 12px 2px 0;
}
.jgp-cell {
  border: 1px solid var(--jgp-line-soft);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.55);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.jgp-cell-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.jgp-cell-trigram {
  font-size: 15px;
  font-weight: 700;
  color: var(--jgp-ink);
  letter-spacing: 1px;
}
.jgp-cell-status {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 1px 6px;
  border-radius: 999px;
}
.jgp-cell-ji { border-left: 2px solid var(--jgp-green); }
.jgp-cell-ji .jgp-cell-status { background: var(--jgp-green); color: #f5efe0; }
.jgp-cell-xiong { border-left: 2px solid var(--jgp-accent); }
.jgp-cell-xiong .jgp-cell-status {
  background: transparent;
  border: 1.5px solid var(--jgp-accent);
  color: var(--jgp-accent);
}
.jgp-cell-ping { border-left: 2px solid var(--jgp-line); }
.jgp-cell-ping .jgp-cell-status { background: var(--jgp-line-soft); color: var(--jgp-ink-soft); }
.jgp-cell-dir {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--jgp-ink-soft);
  white-space: nowrap;
}
.jgp-cell-center {
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border-style: dashed;
  text-align: center;
}

/* ---------- 最佳/最需注意 ---------- */
.jgp-focus {
  margin-top: 12px;
  border-top: 1px solid var(--jgp-line);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.jgp-focus-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.jgp-focus-flag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  border-radius: 4px;
  padding: 3px 8px;
}
.jgp-focus-flag-best { background: var(--jgp-green); color: #f5efe0; }
.jgp-focus-flag-worst {
  background: transparent;
  border: 1.5px solid var(--jgp-accent);
  color: var(--jgp-accent);
}
.jgp-focus-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--jgp-ink);
  letter-spacing: 0.5px;
  word-break: break-word;
}
.jgp-focus-text-pending { color: var(--jgp-ink-faint); font-style: italic; }

/* ---------- 改善建议 ---------- */
.jgp-improve {
  margin-top: 12px;
  border-top: 1px solid var(--jgp-line);
  padding-top: 10px;
}
.jgp-improve-head { display: flex; margin-bottom: 6px; }
.jgp-improve-flag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  border-radius: 4px;
  padding: 3px 8px;
  background: var(--jgp-gold);
  color: #f5efe0;
}
.jgp-improve-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.jgp-improve-list li {
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0.2px;
  color: var(--jgp-ink);
  word-break: break-word;
  padding-left: 10px;
  position: relative;
}
.jgp-improve-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: var(--jgp-gold);
}
.jgp-improve-none {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--jgp-ink-soft);
  letter-spacing: 0.5px;
}

/* ---------- 宜忌 ---------- */
.jgp-yiji {
  margin-top: 12px;
  border-top: 1px solid var(--jgp-line);
  border-bottom: 1px solid var(--jgp-line);
  padding: 10px 2px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.jgp-yiji-col { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.jgp-yiji-flag {
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
.jgp-yiji-flag-yi { background: var(--jgp-green); color: #f5efe0; }
.jgp-yiji-flag-ji {
  background: transparent;
  border: 2px solid var(--jgp-accent);
  color: var(--jgp-accent);
}
.jgp-yiji-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.jgp-yiji-list li {
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.2px;
  color: var(--jgp-ink-soft);
  word-break: break-word;
}

/* ---------- 开运 ---------- */
.jgp-kaiyun {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}
.jgp-kaiyun-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #f5efe0;
  background: var(--jgp-accent);
  border-radius: 4px;
  padding: 4px 8px;
}
.jgp-kaiyun-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--jgp-ink);
  letter-spacing: 0.5px;
}

/* ---------- 底部落款 ---------- */
.jgp-foot {
  margin-top: 16px;
  border-top: 1px solid var(--jgp-line);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.jgp-foot-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.jgp-seal-stamp {
  width: 38px;
  height: 38px;
  border: 2px solid var(--jgp-accent);
  color: var(--jgp-accent);
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
.jgp-foot-meta { display: flex; flex-direction: column; gap: 2px; }
.jgp-foot-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--jgp-ink); }
.jgp-foot-note { font-size: 9.5px; color: var(--jgp-ink-faint); letter-spacing: 0.5px; }
.jgp-qr {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.jgp-qr-img { display: block; width: 100%; height: 100%; line-height: 0; }
.jgp-qr-img :deep(svg) { width: 100%; height: 100%; display: block; }
.jgp-qr-inner {
  font-size: 8px;
  color: var(--jgp-ink-faint);
  text-align: center;
  letter-spacing: 0.5px;
  line-height: 1.3;
  border: 1px dashed var(--jgp-line);
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
  .jgp { padding: 8px; }
  .jgp-sheet { padding: 16px 12px 12px; }
  .jgp-facing { font-size: 34px; }
  .jgp-score-num { font-size: 36px; }
  .jgp-grade-seal { width: 46px; height: 46px; font-size: 15px; }
  .jgp-seal-stamp { width: 34px; height: 34px; font-size: 9px; }
  .jgp-foot-site { font-size: 10.5px; letter-spacing: 0.5px; }
  .jgp-qr { width: 48px; height: 48px; }
}
</style>
