<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('shengxiaoPeidui.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('shengxiaoPeidui.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('shengxiaoPeidui.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('shengxiaoPeidui.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ verdictLabel }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ metaLineA }}</p>
          <p class="bzr-meta-line">{{ metaLineB }}</p>
        </div>
      </header>

      <!-- ============ 配对总览横幅 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-overview">
          <div class="bzr-overview-label">{{ $t('shengxiaoPeidui.report.overviewLabel') }}</div>
          <div class="bzr-overview-pair">
            <span class="bzr-overview-emoji">{{ shengxiaoEmoji(male.animal) }}</span>
            <span class="bzr-overview-vs">{{ $t('shengxiaoPeidui.report.vs') }}</span>
            <span class="bzr-overview-emoji">{{ shengxiaoEmoji(female.animal) }}</span>
          </div>
          <div class="bzr-overview-text">{{ headline }}</div>
        </div>
      </section>

      <!-- ============ 两人信息 + 匹配指数 ============ -->
      <section class="bzr-row bzr-row-top">
        <!-- 男方 -->
        <div class="bzr-card bzr-profile">
          <h3 class="bzr-card-title">{{ $t('shengxiaoPeidui.maleTitle') }}</h3>
          <div class="bzr-profile-line">
            <span class="bzr-ico">🐾</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.animalLabel') }}</span>
            <span class="bzr-profile-value">{{ male.year }}年属{{ male.animal }} · {{ male.age }}{{ $t('shengxiaoPeidui.report.ageSuffix') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☯</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.report.ganZhiLabel') }}</span>
            <span class="bzr-profile-value">{{ male.ganZhi }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">❖</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.nayinLabel') }}</span>
            <span class="bzr-profile-value">{{ male.naYin }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">✦</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.mingguaLabel') }}</span>
            <span class="bzr-profile-value">{{ male.mingGua }}（{{ male.lifeGroupLabel }}）</span>
          </div>
        </div>

        <!-- 女方 -->
        <div class="bzr-card bzr-profile">
          <h3 class="bzr-card-title">{{ $t('shengxiaoPeidui.femaleTitle') }}</h3>
          <div class="bzr-profile-line">
            <span class="bzr-ico">🐾</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.animalLabel') }}</span>
            <span class="bzr-profile-value">{{ female.year }}年属{{ female.animal }} · {{ female.age }}{{ $t('shengxiaoPeidui.report.ageSuffix') }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☯</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.report.ganZhiLabel') }}</span>
            <span class="bzr-profile-value">{{ female.ganZhi }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">❖</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.nayinLabel') }}</span>
            <span class="bzr-profile-value">{{ female.naYin }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">✦</span>
            <span class="bzr-profile-label">{{ $t('shengxiaoPeidui.mingguaLabel') }}</span>
            <span class="bzr-profile-value">{{ female.mingGua }}（{{ female.lifeGroupLabel }}）</span>
          </div>
        </div>

        <!-- 综合匹配指数仪表盘 -->
        <div class="bzr-card bzr-match-score-card">
          <div class="bzr-match-score-label">{{ $t('shengxiaoPeidui.report.matchScoreLabel') }}</div>
          <div class="bzr-match-dial">
            <svg viewBox="0 0 120 70" class="bzr-match-svg">
              <path d="M 10 62 A 50 50 0 0 1 110 62" fill="none" stroke="var(--bzr-line-soft)" stroke-width="9" stroke-linecap="round" />
              <path
                d="M 10 62 A 50 50 0 0 1 110 62"
                fill="none"
                :stroke="matchColor"
                stroke-width="9"
                stroke-linecap="round"
                :stroke-dasharray="dashArray"
                stroke-dashoffset="0"
              />
            </svg>
            <div class="bzr-match-score-num" :style="{ color: matchColor }">{{ matchScore }}</div>
          </div>
          <div class="bzr-match-score-level" :style="{ color: matchColor }">{{ matchLevel }}</div>
        </div>
      </section>

      <!-- ============ 三维合配 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('shengxiaoPeidui.report.dimsTitle') }}</h3>
        <div class="bzr-card bzr-match-dims-card">
          <div v-for="d in matchDims" :key="d.key" class="bzr-match-dim">
            <span class="bzr-match-dim-name">{{ d.label }}</span>
            <span class="bzr-match-dim-track">
              <span class="bzr-match-dim-bar" :style="{ width: d.score + '%', background: d.color }" />
            </span>
            <span class="bzr-match-dim-score" :style="{ color: d.color }">{{ d.score }}</span>
            <span class="bzr-match-dim-tag" :class="verdictClass(d.verdictKey)">{{ d.verdictLabel }}</span>
          </div>
        </div>
      </section>

      <!-- ============ 生肖冲合参照表 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('shengxiaoPeidui.report.tableTitle') }}</h3>
        <div class="bzr-card bzr-gong-table-card">
          <table class="bzr-gong-table">
            <thead>
              <tr>
                <th>{{ $t('shengxiaoPeidui.report.colDim') }}</th>
                <th>{{ $t('shengxiaoPeidui.maleTitle') }}</th>
                <th>{{ $t('shengxiaoPeidui.femaleTitle') }}</th>
                <th>{{ $t('shengxiaoPeidui.report.colRelation') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bzr-gong-name">{{ $t('shengxiaoPeidui.animalLabel') }}</td>
                <td>{{ male.animal }}（{{ male.ganZhi }}）</td>
                <td>{{ female.animal }}（{{ female.ganZhi }}）</td>
                <td><span class="bzr-cell-tag" :class="verdictClass(zodiacVerdict.key)">{{ zodiacVerdict.label }}</span></td>
              </tr>
              <tr>
                <td class="bzr-gong-name">{{ $t('shengxiaoPeidui.nayinLabel') }}</td>
                <td>{{ male.naYin }}</td>
                <td>{{ female.naYin }}</td>
                <td><span class="bzr-cell-tag" :class="verdictClass(nayinVerdict.key)">{{ nayinVerdict.label }}</span></td>
              </tr>
              <tr>
                <td class="bzr-gong-name">{{ $t('shengxiaoPeidui.mingguaLabel') }}</td>
                <td>{{ male.mingGua }}（{{ male.lifeGroupLabel }}）</td>
                <td>{{ female.mingGua }}（{{ female.lifeGroupLabel }}）</td>
                <td><span class="bzr-cell-tag" :class="verdictClass(mingguaVerdict.key)">{{ mingguaVerdict.label }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('shengxiaoPeidui.report.secOverview') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('配对总览'))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('shengxiaoPeidui.report.secNayin') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('纳音婚配'))" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('shengxiaoPeidui.report.secMinggua') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('命卦婚配'))" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('shengxiaoPeidui.report.secZodiac') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(findSection('生肖婚配'))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('shengxiaoPeidui.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('shengxiaoPeidui.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('shengxiaoPeidui.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('shengxiaoPeidui.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface PartnerResult {
  gender: 'male' | 'female'
  animal: string
  year: number
  age: number
  ganZhi: string
  naYin: string
  shengXiaoMing: string
  mingGua: string
  lifeGroup: 'east' | 'west'
  lifeGroupLabel: string
}

interface RelationVerdict {
  key: string
  label: string
  detail?: string
}

interface Props {
  male: PartnerResult
  female: PartnerResult
  pairLabel: string
  zodiacVerdict: RelationVerdict
  nayinVerdict: RelationVerdict
  mingguaVerdict: RelationVerdict
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 静态派生 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const titleText = computed(() => t('shengxiaoPeidui.report.title', { label: props.pairLabel }))

const subtitleText = computed(() => t('shengxiaoPeidui.report.subtitle'))

const metaLineA = computed(() => t('shengxiaoPeidui.report.metaLine', {
  label: t('shengxiaoPeidui.maleTitle'),
  year: props.male.year,
  animal: props.male.animal,
  nayin: props.male.naYin,
}))
const metaLineB = computed(() => t('shengxiaoPeidui.report.metaLine', {
  label: t('shengxiaoPeidui.femaleTitle'),
  year: props.female.year,
  animal: props.female.animal,
  nayin: props.female.naYin,
}))

const headline = computed(() => {
  const map: Record<string, string> = {
    sanhe: t('shengxiaoPeidui.headlineSanhe'),
    liuhe: t('shengxiaoPeidui.headlineLiuhe'),
    xiangchong: t('shengxiaoPeidui.headlineXiangchong'),
    xianghai: t('shengxiaoPeidui.headlineXianghai'),
    xiangxing: t('shengxiaoPeidui.headlineXiangxing'),
    same: t('shengxiaoPeidui.headlineSame'),
    none: t('shengxiaoPeidui.headlineNone'),
    unknown: t('shengxiaoPeidui.headlineNone'),
  }
  return map[props.zodiacVerdict.key] || props.zodiacVerdict.label
})

const shengxiaoEmoji = (animal: string) => {
  const map: Record<string, string> = {
    鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
    马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
  }
  return map[animal] || '🐾'
}

/* ---------- 三维合配评分（由 deterministic 判定 key 打分） ---------- */

const DIM_SCORE: Record<string, number> = {
  // 生肖
  liuhe: 96, sanhe: 92, same: 78, none: 62, unknown: 60,
  xiangxing: 45, xianghai: 42, xiangchong: 36,
  // 纳音
  maleShengfemale: 90, femaleShengmale: 90, bihe: 82,
  maleKefemale: 44, femaleKemale: 44,
  // 命卦
  sameGroup: 88, diffGroup: 48,
}

function dimScore(key: string, base: number): number {
  return DIM_SCORE[key] ?? base
}

const MATCH_DIMS = [
  { key: 'zodiac', color: '#8c2f26' },
  { key: 'nayin', color: '#a8512e' },
  { key: 'minggua', color: '#4a6a8a' },
] as const

const verdictOf = (key: string) =>
  key === 'zodiac' ? props.zodiacVerdict : key === 'nayin' ? props.nayinVerdict : props.mingguaVerdict

const matchDims = computed(() =>
  MATCH_DIMS.map(d => {
    const v = verdictOf(d.key)
    return {
      key: d.key,
      label: t(`shengxiaoPeidui.report.dim_${d.key}`),
      score: dimScore(v.key, 60),
      color: d.color,
      verdictKey: v.key,
      verdictLabel: v.label,
    }
  }))

const matchScore = computed(() => {
  const dims = matchDims.value
  if (!dims.length) return 60
  return Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length)
})

const matchColor = computed(() => {
  const s = matchScore.value
  if (s >= 80) return '#4a7c59'
  if (s >= 65) return '#8c6d1f'
  if (s >= 50) return '#a8512e'
  return '#8c2f26'
})

const matchLevel = computed(() => {
  const s = matchScore.value
  if (s >= 80) return t('shengxiaoPeidui.report.matchExcellent')
  if (s >= 65) return t('shengxiaoPeidui.report.matchGood')
  if (s >= 50) return t('shengxiaoPeidui.report.matchFair')
  return t('shengxiaoPeidui.report.matchWork')
})

const verdictLabel = computed(() => {
  const s = matchScore.value
  if (s >= 80) return t('shengxiaoPeidui.report.verdictMatch')
  if (s >= 50) return t('shengxiaoPeidui.report.verdictBalanced')
  return t('shengxiaoPeidui.report.verdictFriction')
})

/** 半圆弧长：半径 50 的半圆 ≈ 157；按百分比填充 */
const dashArray = computed(() => {
  const full = 157
  const filled = (matchScore.value / 100) * full
  return `${filled} ${full}`
})

/* ---------- 判定标签配色 ---------- */

const FAVORABLE_KEYS = ['sanhe', 'liuhe', 'same', 'bihe', 'maleShengfemale', 'femaleShengmale', 'sameGroup']
function verdictClass(key: string): string {
  if (FAVORABLE_KEYS.includes(key)) return 'bzr-tag-good'
  if (['xiangchong', 'xianghai', 'xiangxing', 'maleKefemale', 'femaleKemale', 'diffGroup'].includes(key)) return 'bzr-tag-bad'
  return 'bzr-tag-neutral'
}

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

const aiSections = computed<AiSection[]>(() => {
  const text = props.aiContent || ''
  if (!text) return []
  // 支持两种分段：以单独一行 --- 分隔（本工具 prompt），或 markdown ## 标题
  const byDash = text.split(/\n\s*---\s*\n/).map(s => s.trim()).filter(Boolean)
  const raws = byDash.length > 1 ? byDash : text.split(/\n(?=##\s)/)
  const out: AiSection[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title || content) out.push({ title, content })
  }
  return out
})

function findSection(keyword: string): string | undefined {
  const hit = aiSections.value.find(s => s.title.includes(keyword))
  return hit?.content
}

const pendingText = computed(() => t('shengxiaoPeidui.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) return `<p class="bzr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 ZiweiHunpanReport 同源） ========== */
.bzr {
  --bzr-bg: #f2ede3;
  --bzr-sheet: #faf6ec;
  --bzr-card: #fffdf6;
  --bzr-ink: #2e2a24;
  --bzr-ink-soft: #55503f;
  --bzr-ink-faint: #8a8272;
  --bzr-line: #d8d0bd;
  --bzr-line-soft: #e6dfcd;
  --bzr-accent: #8c2f26;
  --bzr-accent-soft: #a8512e;
  --bzr-star: #8c6d1f;
  --bzr-green: #4a7c59;
  --bzr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--bzr-bg);
  padding: 18px;
  color: var(--bzr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bzr-sheet {
  background: var(--bzr-sheet);
  border: 1px solid var(--bzr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bzr-head { border-bottom: 2px solid var(--bzr-ink); padding-bottom: 16px; }
.bzr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bzr-brand { display: flex; align-items: center; gap: 8px; }
.bzr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bzr-accent);
  color: var(--bzr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.bzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bzr-ink-soft); }
.bzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-verdict { color: var(--bzr-green); font-weight: 600; }
.bzr-rating { letter-spacing: 1px; }

.bzr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.bzr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--bzr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.bzr-head-bottom { text-align: center; }
.bzr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bzr-row { display: grid; gap: 14px; margin-top: 16px; }
.bzr-row-top { grid-template-columns: 1fr 1fr 0.9fr; }
.bzr-ai-row { grid-template-columns: 1fr 1fr; }
.bzr-section { margin-top: 16px; }

.bzr-card {
  background: var(--bzr-card);
  border: 1px solid var(--bzr-line);
  padding: 14px 16px;
}
.bzr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.bzr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 总览横幅 ---------- */
.bzr-overview {
  border: 1.5px solid var(--bzr-accent);
  background: rgba(140, 47, 38, 0.04);
  text-align: center;
  padding: 18px 20px;
}
.bzr-overview-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 3px; margin-bottom: 8px; }
.bzr-overview-pair { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 8px; }
.bzr-overview-emoji { font-size: 34px; line-height: 1; }
.bzr-overview-vs { font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 2px; }
.bzr-overview-text { font-size: 16px; font-weight: 700; color: var(--bzr-accent); line-height: 1.8; letter-spacing: 1px; }

/* ---------- 两人信息卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 34px; flex-shrink: 0; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 匹配指数仪表盘 ---------- */
.bzr-match-score-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 14px 10px;
}
.bzr-match-score-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 2px; }
.bzr-match-dial { position: relative; width: 130px; }
.bzr-match-svg { width: 100%; display: block; }
.bzr-match-score-num {
  position: absolute; left: 0; right: 0; bottom: 2px;
  font-size: 30px; font-weight: 700; letter-spacing: 1px; text-align: center;
}
.bzr-match-score-level { font-size: 13px; font-weight: 700; letter-spacing: 2px; }

/* ---------- 三维合配条形 ---------- */
.bzr-match-dims-card { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-match-dim { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bzr-match-dim-name { font-size: 11px; color: var(--bzr-ink-soft); width: 56px; flex-shrink: 0; letter-spacing: 1px; }
.bzr-match-dim-track { flex: 1; min-width: 80px; height: 8px; background: var(--bzr-line-soft); overflow: hidden; }
.bzr-match-dim-bar { display: block; height: 100%; transition: width 0.8s ease; }
.bzr-match-dim-score { font-size: 12px; font-weight: 700; width: 24px; text-align: right; flex-shrink: 0; }
.bzr-match-dim-tag { font-size: 10px; padding: 1px 7px; border-radius: 999px; border: 1px solid; letter-spacing: 0.5px; flex-shrink: 0; }

/* ---------- 判定标签配色 ---------- */
.bzr-tag-good { border-color: rgba(74, 124, 89, 0.4); background: rgba(74, 124, 89, 0.1); color: var(--bzr-green); }
.bzr-tag-bad { border-color: rgba(168, 81, 46, 0.4); background: rgba(168, 81, 46, 0.1); color: var(--bzr-accent-soft); }
.bzr-tag-neutral { border-color: var(--bzr-line); background: var(--bzr-line-soft); color: var(--bzr-ink-faint); }

/* ---------- 参照表 ---------- */
.bzr-gong-table-card { padding: 8px; overflow-x: auto; }
.bzr-gong-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.bzr-gong-table th, .bzr-gong-table td {
  border: 1px solid var(--bzr-line);
  padding: 8px 10px;
  text-align: left;
}
.bzr-gong-table th {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  letter-spacing: 1px;
  text-align: center;
}
.bzr-gong-table td { color: var(--bzr-ink-soft); letter-spacing: 0.5px; }
.bzr-gong-name { font-weight: 700; color: var(--bzr-ink) !important; text-align: center; white-space: nowrap; }
.bzr-cell-tag { font-size: 11px; padding: 2px 9px; border-radius: 999px; border: 1px solid; letter-spacing: 0.5px; white-space: nowrap; }

/* ---------- AI 章节 ---------- */
.bzr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
}
.bzr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--bzr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.bzr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bzr-ink-soft); }

.bzr-md :deep(p) { margin: 0 0 0.7em; }
.bzr-md :deep(p:last-child) { margin-bottom: 0; }
.bzr-md :deep(strong) { color: var(--bzr-ink); font-weight: 700; }
.bzr-md :deep(ul), .bzr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bzr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bzr-md :deep(h3), .bzr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--bzr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.bzr-md { overflow-x: auto; }
.bzr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.bzr-md :deep(th), .bzr-md :deep(td) { border: 1px solid var(--bzr-line); padding: 4px 6px; text-align: left; }
.bzr-md :deep(th) { background: var(--bzr-line-soft); font-weight: 700; color: var(--bzr-ink); }
.bzr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bzr-md :deep(.bzr-pending), .bzr-pending { color: var(--bzr-ink-faint); font-style: italic; }

.bzr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px;
}
.bzr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--bzr-accent);
  animation: bzr-pulse 1s ease-in-out infinite;
}
@keyframes bzr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bzr-error { margin-top: 14px; text-align: center; color: var(--bzr-accent); font-size: 12px; }
.bzr-retry {
  margin-top: 8px;
  border: 1px solid var(--bzr-accent);
  background: transparent;
  color: var(--bzr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bzr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.bzr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--bzr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bzr-foot-note { font-size: 10px; color: var(--bzr-ink-faint); }
.bzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .bzr-row-top { grid-template-columns: 1fr 1fr; }
  .bzr-match-score-card { grid-column: 1 / -1; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.bzr-match-score-card, .bzr-gong-table-card { min-width: 0; }

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-title { font-size: 22px; letter-spacing: 2px; }
}
</style>
