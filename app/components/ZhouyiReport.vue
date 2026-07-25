<template>
  <div class="zyr">
    <div class="zyr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zyr-head">
        <div class="zyr-head-top">
          <div class="zyr-brand">
            <div class="zyr-seal">{{ $t('zhouyi.report.seal') }}</div>
            <span class="zyr-brand-name">{{ $t('zhouyi.report.brandName') }}</span>
          </div>
          <div class="zyr-head-right">
            <span class="zyr-time">{{ $t('zhouyi.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zyr-verdict">✓ {{ verdictText }}</span>
          </div>
        </div>

        <h1 class="zyr-title">{{ benGua?.name }}{{ $t('zhouyi.report.titleArrow') }}{{ bianGua?.name }}</h1>
        <p class="zyr-subtitle">{{ subtitleText }}</p>

        <div class="zyr-head-bottom">
          <p class="zyr-meta-line">{{ $t('zhouyi.report.castingMethod') }}{{ result.methodName }}</p>
          <p v-if="result.lunarDate" class="zyr-meta-line">
            {{ $t('zhouyi.report.lunarDate') }}{{ result.lunarDate.year }}年{{ result.lunarDate.isLeap ? $t('zhouyi.leapMonth') : '' }}{{ result.lunarDate.month }}月{{ result.lunarDate.day }}日 · {{ result.lunarDate.dizhi }}年
          </p>
        </div>
      </header>

      <!-- ============ 所问之事 + 核心判断 ============ -->
      <section class="zyr-row zyr-row-top">
        <div class="zyr-card zyr-query">
          <div class="zyr-query-line">
            <span class="zyr-ico">❖</span>
            <span class="zyr-query-label">{{ $t('zhouyi.report.queryLabel') }}</span>
            <span class="zyr-query-value">{{ query }}</span>
          </div>
          <div class="zyr-query-line">
            <span class="zyr-ico">✦</span>
            <span class="zyr-query-label">{{ $t('zhouyi.report.dongYaoLabel') }}</span>
            <span class="zyr-query-value">{{ $t('zhouyi.dongYaoLabel') }}{{ result.dongYao }}{{ $t('zhouyi.yaoLabel') }}</span>
          </div>
          <div class="zyr-query-line">
            <span class="zyr-ico">☯</span>
            <span class="zyr-query-label">{{ $t('zhouyi.report.seasonLabel') }}</span>
            <span class="zyr-query-value">{{ result.seasonWuxing }}</span>
          </div>
        </div>

        <div class="zyr-card zyr-verdict-card">
          <div class="zyr-verdict-left">
            <div class="zyr-verdict-badge" :class="shengkeBadgeCardClass">{{ result.shengkeResult }}</div>
            <div class="zyr-verdict-relation">{{ result.shengkeRelation }}</div>
            <div v-if="result.jiRate != null" class="zyr-jirate">
              <span class="zyr-jirate-label">{{ $t('zhouyi.report.jiRateLabel') }}</span>
              <span class="zyr-jirate-track"><span class="zyr-jirate-bar" :style="{ width: jiRateClamped + '%' }" /></span>
              <span class="zyr-jirate-pct">{{ jiRateClamped }}%</span>
            </div>
          </div>
          <div class="zyr-verdict-right">
            <h4 class="zyr-mini-head">★ {{ $t('zhouyi.report.yaoCiTitle') }}</h4>
            <p class="zyr-yaoci">{{ yaoCi || pendingText }}</p>
            <p v-if="benGua?.guaci" class="zyr-guaci">{{ $t('zhouyi.report.guaCiLabel') }}{{ benGua.guaci }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 三卦流转 ============ -->
      <section class="zyr-section">
        <h3 class="zyr-section-title">{{ $t('zhouyi.report.triGuaTitle') }}</h3>
        <div class="zyr-gua-grid">
          <div class="zyr-gua">
            <div class="zyr-gua-head">
              <span class="zyr-gua-tag">{{ $t('zhouyi.benGuaLabel') }}</span>
              <span class="zyr-gua-time">{{ $t('zhouyi.report.timeNow') }}</span>
            </div>
            <div class="zyr-yao-stack">
              <div
                v-for="(yao, i) in benYaoDisplay"
                :key="i"
                class="zyr-yao"
                :class="{ 'zyr-yao-dong': result.dongYao === 6 - i }"
              >
                <template v-if="yao === 1"><span class="zyr-yao-solid" /></template>
                <template v-else><span class="zyr-yao-half" /><span class="zyr-yao-half" /></template>
              </div>
            </div>
            <div class="zyr-gua-name">{{ benGua?.name }}</div>
            <div class="zyr-gua-meaning">{{ benGua?.meaning }}</div>
            <div class="zyr-gua-foot">
              <span class="zyr-gua-trigram">{{ trigramText(result.shangGuaId) }} / {{ trigramText(result.xiaGuaId) }}</span>
              <span class="zyr-gua-dong">{{ $t('zhouyi.dongYaoLabel') }}{{ result.dongYao }}{{ $t('zhouyi.yaoLabel') }}</span>
            </div>
          </div>
          <div class="zyr-gua">
            <div class="zyr-gua-head">
              <span class="zyr-gua-tag">{{ $t('zhouyi.huGuaLabel') }}</span>
              <span class="zyr-gua-time">{{ result.timeLevels.huGua }}</span>
            </div>
            <div class="zyr-yao-stack">
              <div v-for="(yao, i) in huYaoDisplay" :key="i" class="zyr-yao">
                <template v-if="yao === 1"><span class="zyr-yao-solid" /></template>
                <template v-else><span class="zyr-yao-half" /><span class="zyr-yao-half" /></template>
              </div>
            </div>
            <div class="zyr-gua-name">{{ huGua?.name }}</div>
            <div class="zyr-gua-meaning">{{ huGua?.meaning }}</div>
            <div class="zyr-gua-foot">
              <span class="zyr-gua-trigram">{{ trigramTextOfGua(huGua) }}</span>
            </div>
          </div>
          <div class="zyr-gua">
            <div class="zyr-gua-head">
              <span class="zyr-gua-tag">{{ $t('zhouyi.bianGuaLabel') }}</span>
              <span class="zyr-gua-time">{{ result.timeLevels.bianGua }}</span>
            </div>
            <div class="zyr-yao-stack">
              <div v-for="(yao, i) in bianYaoDisplay" :key="i" class="zyr-yao">
                <template v-if="yao === 1"><span class="zyr-yao-solid" /></template>
                <template v-else><span class="zyr-yao-half" /><span class="zyr-yao-half" /></template>
              </div>
            </div>
            <div class="zyr-gua-name">{{ bianGua?.name }}</div>
            <div class="zyr-gua-meaning">{{ bianGua?.meaning }}</div>
            <div class="zyr-gua-foot">
              <span class="zyr-gua-trigram">{{ trigramTextOfGua(bianGua) }}</span>
            </div>
          </div>
        </div>
        <p v-if="result.changePath" class="zyr-changepath">{{ $t('zhouyi.bianGuaPath') }}{{ result.changePath }}</p>
      </section>

      <!-- ============ 体用旺衰 ============ -->
      <section class="zyr-section">
        <h3 class="zyr-section-title">{{ $t('zhouyi.report.tiyongTitle') }}</h3>
        <div class="zyr-core-grid">
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('zhouyi.tiGuaLabel') }}</div>
            <div class="zyr-core-value">{{ getGuaById(result.tiGuaId)?.name }}</div>
            <div class="zyr-core-sub">
              <span class="zyr-wuxing-chip" :class="'zyr-wx-' + result.tiWuxing">{{ result.tiWuxing }}</span>
              <span class="zyr-ws" :class="'zyr-ws-' + result.tiWangshuai">{{ result.tiWangshuai }}</span>
            </div>
          </div>
          <div class="zyr-card zyr-core">
            <div class="zyr-core-label">{{ $t('zhouyi.yongGuaLabel') }}</div>
            <div class="zyr-core-value">{{ getGuaById(result.yongGuaId)?.name }}</div>
            <div class="zyr-core-sub">
              <span class="zyr-wuxing-chip" :class="'zyr-wx-' + result.yongWuxing">{{ result.yongWuxing }}</span>
              <span class="zyr-ws" :class="'zyr-ws-' + result.yongWangshuai">{{ result.yongWangshuai }}</span>
            </div>
          </div>
          <div class="zyr-card zyr-core zyr-core-risk">
            <div class="zyr-core-label">{{ $t('zhouyi.report.riskLabel') }}</div>
            <template v-if="result.positionRisk">
              <div class="zyr-core-value zyr-core-risk-value">{{ result.positionRisk.riskLevel }}</div>
              <div class="zyr-core-sub">{{ $t('zhouyi.coefficient') }}：{{ result.positionRisk.coefficient.toFixed(3) }}</div>
            </template>
            <div v-else class="zyr-core-value zyr-core-risk-none">—</div>
          </div>
          <div class="zyr-card zyr-core zyr-core-wuxing">
            <div class="zyr-core-label">{{ $t('zhouyi.report.wuxingTitle') }}</div>
            <div class="zyr-wuxing">
              <div class="zyr-wuxing-row">
                <span class="zyr-wuxing-dot" :style="{ background: wxColor(result.tiWuxing) }" />
                <span class="zyr-wuxing-name">{{ $t('zhouyi.report.wuxingTi') }}{{ result.tiWuxing }}</span>
                <span class="zyr-wuxing-bar-wrap"><span class="zyr-wuxing-bar" :style="{ width: tiWuxingPct + '%', background: wxColor(result.tiWuxing) }" /></span>
                <span class="zyr-wuxing-pct">{{ result.tiWangshuai }}</span>
              </div>
              <div class="zyr-wuxing-row">
                <span class="zyr-wuxing-dot" :style="{ background: wxColor(result.yongWuxing) }" />
                <span class="zyr-wuxing-name">{{ $t('zhouyi.report.wuxingYong') }}{{ result.yongWuxing }}</span>
                <span class="zyr-wuxing-bar-wrap"><span class="zyr-wuxing-bar" :style="{ width: yongWuxingPct + '%', background: wxColor(result.yongWuxing) }" /></span>
                <span class="zyr-wuxing-pct">{{ result.yongWangshuai }}</span>
              </div>
            </div>
            <div class="zyr-core-sub">{{ $t('zhouyi.seasonWuxing') }}：{{ result.seasonWuxing }}</div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-03 ============ -->
      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">01</span>{{ $t('zhouyi.report.secOverview') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(pickSection(sectionKeys.overview))" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">02</span>{{ $t('zhouyi.report.secMovingLine') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(pickSection(sectionKeys.movingLine))" />
        </div>
      </section>

      <section class="zyr-row zyr-ai-row">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">03</span>{{ $t('zhouyi.report.secTiyong') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(pickSection(sectionKeys.tiyong))" />
        </div>
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">04</span>{{ $t('zhouyi.report.secTrend') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(trendContent)" />
        </div>
      </section>

      <!-- ============ 综合定论 ============ -->
      <section class="zyr-section">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">05</span>{{ $t('zhouyi.report.secFinal') }}</h3>
          <div class="zyr-final">
            <div class="zyr-final-thesis">
              <div class="zyr-final-thesis-label">{{ $t('zhouyi.report.finalThesisLabel') }}</div>
              <div class="zyr-final-thesis-text">{{ thesisText }}</div>
              <div class="zyr-final-thesis-note">{{ result.shengkeRelation }} · {{ result.shengkeResult }}<template v-if="result.jiRate != null"> · {{ $t('zhouyi.report.jiRateLabel') }} {{ jiRateClamped }}%</template></div>
            </div>
            <div class="zyr-final-cards">
              <div class="zyr-final-card">
                <h4 class="zyr-final-card-title">{{ $t('zhouyi.report.secYingqi') }}</h4>
                <div class="zyr-ai-body zyr-md zyr-final-md" v-html="renderSection(pickSection(sectionKeys.yingqi))" />
              </div>
              <div class="zyr-final-card">
                <h4 class="zyr-final-card-title">{{ $t('zhouyi.report.secStrategy') }}</h4>
                <template v-if="result.strategyType">
                  <div class="zyr-strategy-badges">
                    <span class="zyr-strategy-badge">{{ $t('zhouyi.strategyType') }}：{{ result.strategyType }}</span>
                    <span class="zyr-strategy-badge">{{ $t('zhouyi.strategyAction') }}：{{ result.strategyAction }}</span>
                  </div>
                  <p class="zyr-strategy-next"><strong>{{ $t('zhouyi.nextStep') }}</strong>{{ result.strategyNextStep }}</p>
                </template>
                <div class="zyr-ai-body zyr-md zyr-final-md" v-html="renderSection(pickSection(sectionKeys.strategy))" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 温馨提示 ============ -->
      <section class="zyr-section">
        <div class="zyr-card zyr-ai">
          <h3 class="zyr-ai-title"><span class="zyr-ai-no">06</span>{{ $t('zhouyi.report.secReminder') }}</h3>
          <div class="zyr-ai-body zyr-md" v-html="renderSection(pickSection(sectionKeys.reminder))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zyr-streaming">
        <span class="zyr-streaming-dot" />
        {{ $t('zhouyi.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zyr-error">
        <p>{{ error }}</p>
        <button type="button" class="zyr-retry" @click="$emit('retry')">{{ $t('zhouyi.report.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zyr-foot">
        <span class="zyr-foot-note">ⓘ {{ $t('zhouyi.report.footerNote') }}</span>
        <span class="zyr-seal zyr-seal-foot">{{ $t('zhouyi.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { MeihuaResult, GuaInfo } from '~/types/zhouyi'
import { getGuaById, getYaoArray, BAGUA_NAMES, BAGUA_SYMBOLS } from '~/utils/zhouyi/constants'
import { YAOCI } from '~/utils/zhouyi/yaoci'

interface Props {
  result: MeihuaResult
  query: string
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const benGua = computed(() => getGuaById(props.result.benGuaId))
const bianGua = computed(() => getGuaById(props.result.bianGuaId))
const huGua = computed(() => getGuaById(props.result.huGuaId))
const yaoCi = computed(() => YAOCI[props.result.benGuaId]?.[props.result.dongYao] || '')

/** 爻线自上而下显示（上爻 → 初爻） */
const benYaoDisplay = computed(() => benGua.value ? [...getYaoArray(benGua.value)].reverse() : [])
const huYaoDisplay = computed(() => huGua.value ? [...getYaoArray(huGua.value)].reverse() : [])
const bianYaoDisplay = computed(() => bianGua.value ? [...getYaoArray(bianGua.value)].reverse() : [])

function trigramText(id: number): string {
  return `${BAGUA_SYMBOLS[id - 1]} ${BAGUA_NAMES[id - 1]}`
}
function trigramTextOfGua(gua: GuaInfo | undefined): string {
  return gua ? `${trigramText(gua.shangGua)} / ${trigramText(gua.xiaGua)}` : ''
}

const jiRateClamped = computed(() => Math.max(0, Math.min(100, Math.round(props.result.jiRate ?? 0))))

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
function wxColor(wx: string): string {
  return WX_COLORS[wx] ?? '#8a8272'
}

const WS_PCT: Record<string, number> = { 旺: 95, 相: 72, 休: 45, 囚: 22, 死: 8 }
const tiWuxingPct = computed(() => WS_PCT[props.result.tiWangshuai] ?? 50)
const yongWuxingPct = computed(() => WS_PCT[props.result.yongWangshuai] ?? 50)

const verdictText = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return t('zhouyi.report.verdictGreat')
    case '吉': return t('zhouyi.report.verdictGood')
    case '凶': return t('zhouyi.report.verdictBad')
    case '泄耗': return t('zhouyi.report.verdictDrain')
    default: return t('zhouyi.report.verdictNeutral')
  }
})

const shengkeBadgeCardClass = computed(() => {
  switch (props.result.shengkeResult) {
    case '大吉': return 'zyr-verdict-great'
    case '吉': return 'zyr-verdict-good'
    case '凶': return 'zyr-verdict-bad'
    case '泄耗': return 'zyr-verdict-drain'
    default: return ''
  }
})

/* ---------- AI 内容解析 ---------- */

const pendingText = computed(() => t('zhouyi.report.pending'))

const aiSections = computed<Record<string, string>>(() => {
  const text = props.aiContent || ''
  const map: Record<string, string> = {}
  if (!text) return map
  const raws = text.split(/\n(?=##\s)/)
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) map[title] = content
  }
  return map
})

/** AI 章节标题随语言变化，统一从 locale 取当前语言的标题 */
const sectionKeys = computed(() => ({
  overview: t('zhouyiPan.sectionOverview'),
  movingLine: t('zhouyiPan.sectionMovingLine'),
  tiyong: t('zhouyiPan.sectionTiyong'),
  hugua: t('zhouyiPan.sectionHugua'),
  biangua: t('zhouyiPan.sectionBiangua'),
  yingqi: t('zhouyiPan.sectionYingqi'),
  strategy: t('zhouyiPan.sectionStrategy'),
  reminder: t('zhouyiPan.sectionReminder'),
}))

/** AI 实际输出常为「总览 / Overview」双语标题，按前缀匹配取章节内容 */
function pickSection(title: string): string | undefined {
  const sections = aiSections.value
  if (sections[title]) return sections[title]
  const key = Object.keys(sections).find(k => k.startsWith(title))
  return key ? sections[key] : undefined
}

/** 04 走势：互卦 + 变卦两章合并展示 */
const trendContent = computed(() => {
  const hu = pickSection(sectionKeys.value.hugua) ?? ''
  const bian = pickSection(sectionKeys.value.biangua) ?? ''
  if (hu && bian) return `${hu}\n\n${bian}`
  return hu || bian || undefined
})

const thesisText = computed(() => {
  const c = pickSection(sectionKeys.value.overview) ?? ''
  const first = c.replace(/[#*]/g, '').replace(/\n/g, ' ').split(/[。！!？?]/)[0]?.trim() ?? ''
  return first.slice(0, 60) || t('zhouyi.report.thesisFallback')
})

const subtitleText = computed(() => {
  const risk = props.result.positionRisk?.riskLevel
  return t('zhouyi.report.subtitleValue', {
    ti: props.result.tiWuxing,
    tiWs: props.result.tiWangshuai,
    yong: props.result.yongWuxing,
    yongWs: props.result.yongWangshuai,
    relation: props.result.shengkeRelation,
    risk: risk ?? '—',
  })
})

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zyr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 BaziZiweiReport 同系） ========== */
.zyr {
  --zyr-bg: #f2ede3;
  --zyr-sheet: #faf6ec;
  --zyr-card: #fffdf6;
  --zyr-ink: #2e2a24;
  --zyr-ink-soft: #55503f;
  --zyr-ink-faint: #8a8272;
  --zyr-line: #d8d0bd;
  --zyr-line-soft: #e6dfcd;
  --zyr-accent: #8c2f26;
  --zyr-accent-soft: #a8512e;
  --zyr-star: #8c6d1f;
  --zyr-green: #4a7c59;
  border-radius: 12px;
  background: var(--zyr-bg);
  padding: 18px;
  color: var(--zyr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zyr-sheet {
  background: var(--zyr-sheet);
  border: 1px solid var(--zyr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zyr-head { border-bottom: 2px solid var(--zyr-ink); padding-bottom: 16px; }
.zyr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zyr-brand { display: flex; align-items: center; gap: 8px; }
.zyr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zyr-accent);
  color: var(--zyr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zyr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zyr-ink-soft); }
.zyr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zyr-ink-faint); }
.zyr-verdict { color: var(--zyr-green); font-weight: 600; }

.zyr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.zyr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zyr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zyr-head-bottom { text-align: center; }
.zyr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zyr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zyr-row { display: grid; gap: 14px; margin-top: 16px; }
.zyr-row-top { grid-template-columns: 1fr 2.4fr; }
.zyr-ai-row { grid-template-columns: 1fr 1fr; }
.zyr-section { margin-top: 16px; }

.zyr-card {
  background: var(--zyr-card);
  border: 1px solid var(--zyr-line);
  padding: 14px 16px;
}
.zyr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 所问之事卡 ---------- */
.zyr-query { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.zyr-query-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.zyr-ico { color: var(--zyr-accent-soft); font-size: 12px; }
.zyr-query-label { color: var(--zyr-ink-faint); min-width: 30px; }
.zyr-query-value { color: var(--zyr-ink); letter-spacing: 0.5px; line-height: 1.6; }

/* ---------- 核心判断卡 ---------- */
.zyr-verdict-card { display: grid; grid-template-columns: 150px 1fr; gap: 14px; align-items: stretch; }
.zyr-verdict-left {
  border: 1.5px solid var(--zyr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 12px 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  text-align: center;
}
.zyr-verdict-badge { font-size: 26px; font-weight: 700; letter-spacing: 4px; color: var(--zyr-ink); }
.zyr-verdict-great { color: var(--zyr-green); }
.zyr-verdict-good { color: var(--zyr-star); }
.zyr-verdict-bad { color: var(--zyr-accent); }
.zyr-verdict-drain { color: var(--zyr-accent-soft); }
.zyr-verdict-relation { font-size: 12px; color: var(--zyr-ink-soft); letter-spacing: 1px; }
.zyr-jirate { display: flex; align-items: center; gap: 5px; width: 100%; }
.zyr-jirate-label { font-size: 9px; color: var(--zyr-ink-faint); white-space: nowrap; }
.zyr-jirate-track { flex: 1; height: 6px; background: var(--zyr-line-soft); overflow: hidden; }
.zyr-jirate-bar { display: block; height: 100%; background: var(--zyr-green); }
.zyr-jirate-pct { font-size: 10px; color: var(--zyr-ink-soft); }
.zyr-verdict-right { border-left: 1px dashed var(--zyr-line); padding-left: 14px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.zyr-mini-head { margin: 0; font-size: 12px; font-weight: 700; color: var(--zyr-star); letter-spacing: 1px; }
.zyr-yaoci { margin: 0; font-size: 14px; line-height: 1.8; color: var(--zyr-ink); font-weight: 600; letter-spacing: 0.5px; }
.zyr-guaci { margin: 0; font-size: 11px; line-height: 1.7; color: var(--zyr-ink-faint); }

/* ---------- 三卦流转 ---------- */
.zyr-gua-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.zyr-gua {
  background: var(--zyr-card);
  border: 1px solid var(--zyr-line);
  padding: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
}
.zyr-gua-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; justify-content: center; }
.zyr-gua-tag { font-size: 10px; font-weight: 700; color: var(--zyr-accent-soft); letter-spacing: 1px; }
.zyr-gua-time { font-size: 9px; color: var(--zyr-ink-faint); }
.zyr-yao-stack { display: flex; flex-direction: column; gap: 5px; padding: 6px 0; }
.zyr-yao { display: flex; gap: 14px; width: 96px; height: 7px; }
.zyr-yao-solid { width: 100%; background: var(--zyr-ink); }
.zyr-yao-half { flex: 1; background: var(--zyr-ink); }
.zyr-yao-dong .zyr-yao-solid, .zyr-yao-dong .zyr-yao-half { background: var(--zyr-accent); box-shadow: 0 0 0 1px rgba(140, 47, 38, 0.25); }
.zyr-gua-name { font-size: 17px; font-weight: 700; letter-spacing: 1px; }
.zyr-gua-meaning { font-size: 11px; color: var(--zyr-ink-soft); }
.zyr-gua-foot { margin-top: auto; display: flex; flex-direction: column; gap: 2px; font-size: 9px; color: var(--zyr-ink-faint); }
.zyr-gua-trigram { letter-spacing: 0.5px; }
.zyr-gua-dong { color: var(--zyr-accent-soft); }
.zyr-changepath { margin: 8px 2px 0; font-size: 10.5px; color: var(--zyr-ink-faint); }

/* ---------- 体用旺衰四卡 ---------- */
.zyr-core-grid { display: grid; grid-template-columns: 1fr 1fr 0.9fr 1.5fr; gap: 10px; }
.zyr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; }
.zyr-core-label { font-size: 11px; color: var(--zyr-ink-faint); letter-spacing: 1px; }
.zyr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.zyr-core-sub { font-size: 10px; color: var(--zyr-ink-faint); display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
.zyr-core-risk-value { font-size: 18px; letter-spacing: 1px; color: var(--zyr-accent-soft); }
.zyr-core-risk-none { color: var(--zyr-ink-faint); }

.zyr-wuxing-chip {
  font-size: 10px; font-weight: 700;
  border: 1px solid currentColor;
  padding: 0 5px; line-height: 1.6;
  border-radius: 2px;
}
.zyr-wx-木 { color: #4a7c59; }
.zyr-wx-火 { color: #a8512e; }
.zyr-wx-土 { color: #8a6d3b; }
.zyr-wx-金 { color: #7d7d68; }
.zyr-wx-水 { color: #4a6a8a; }
.zyr-ws { font-size: 10px; padding: 0 6px; border-radius: 2px; border: 1px solid transparent; }
.zyr-ws-旺, .zyr-ws-相 { background: rgba(74, 124, 89, 0.14); color: var(--zyr-green); border-color: rgba(74, 124, 89, 0.35); }
.zyr-ws-休 { background: rgba(140, 109, 31, 0.12); color: var(--zyr-star); border-color: rgba(140, 109, 31, 0.35); }
.zyr-ws-囚, .zyr-ws-死 { background: rgba(140, 47, 38, 0.12); color: var(--zyr-accent); border-color: rgba(140, 47, 38, 0.35); }

.zyr-core-wuxing { text-align: left; justify-content: center; }
.zyr-wuxing { display: flex; flex-direction: column; gap: 5px; }
.zyr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zyr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.zyr-wuxing-name { width: 44px; color: var(--zyr-ink-soft); white-space: nowrap; }
.zyr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--zyr-line-soft); }
.zyr-wuxing-bar { display: block; height: 100%; }
.zyr-wuxing-pct { width: 20px; text-align: right; color: var(--zyr-ink-faint); }

/* ---------- AI 章节 ---------- */
.zyr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zyr-line-soft);
  padding-bottom: 8px;
}
.zyr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zyr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zyr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zyr-ink-soft); }

.zyr-md :deep(p) { margin: 0 0 0.7em; }
.zyr-md :deep(p:last-child) { margin-bottom: 0; }
.zyr-md :deep(strong) { color: var(--zyr-ink); font-weight: 700; }
.zyr-md :deep(ul), .zyr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zyr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zyr-md :deep(h3), .zyr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zyr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zyr-md { overflow-x: auto; }
.zyr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.zyr-md :deep(th), .zyr-md :deep(td) { border: 1px solid var(--zyr-line); padding: 4px 6px; text-align: left; }
.zyr-md :deep(th) { background: var(--zyr-line-soft); font-weight: 700; color: var(--zyr-ink); }
.zyr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--zyr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.zyr-md :deep(.zyr-pending), .zyr-pending { color: var(--zyr-ink-faint); font-style: italic; }

/* ---------- 05 综合定论 ---------- */
.zyr-final { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
.zyr-final-thesis {
  border: 1.5px solid var(--zyr-accent);
  background: rgba(140, 47, 38, 0.04);
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  justify-content: center;
}
.zyr-final-thesis-label { font-size: 10px; color: var(--zyr-ink-faint); letter-spacing: 2px; }
.zyr-final-thesis-text { font-size: 15px; font-weight: 700; color: var(--zyr-accent); line-height: 1.7; letter-spacing: 1px; }
.zyr-final-thesis-note { font-size: 11px; color: var(--zyr-ink-soft); line-height: 1.6; }
.zyr-final-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.zyr-final-card { border: 1px solid var(--zyr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.zyr-final-card-title {
  margin: 0 0 8px;
  font-size: 11.5px; font-weight: 700;
  color: var(--zyr-ink); letter-spacing: 1px;
  border-bottom: 1px dashed var(--zyr-line);
  padding-bottom: 6px;
}
.zyr-final-md { font-size: 11.5px; }
.zyr-strategy-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.zyr-strategy-badge {
  font-size: 10px;
  border: 1px solid var(--zyr-accent-soft);
  color: var(--zyr-accent-soft);
  padding: 1px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
}
.zyr-strategy-next { margin: 0 0 8px; font-size: 11.5px; color: var(--zyr-ink-soft); line-height: 1.65; }
.zyr-strategy-next strong { color: var(--zyr-ink); }

/* ---------- 流式/错误 ---------- */
.zyr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zyr-ink-faint); letter-spacing: 1px;
}
.zyr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zyr-accent);
  animation: zyr-pulse 1s ease-in-out infinite;
}
@keyframes zyr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zyr-error { margin-top: 14px; text-align: center; color: var(--zyr-accent); font-size: 12px; }
.zyr-retry {
  margin-top: 8px;
  border: 1px solid var(--zyr-accent);
  background: transparent;
  color: var(--zyr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zyr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zyr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zyr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zyr-foot-note { font-size: 10px; color: var(--zyr-ink-faint); }
.zyr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zyr-row-top { grid-template-columns: 1fr; }
  .zyr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .zyr-final { grid-template-columns: 1fr; }
}

.zyr-ai, .zyr-final, .zyr-gua-grid, .zyr-core-grid { min-width: 0; }

@media (max-width: 720px) {
  .zyr { padding: 8px; }
  .zyr-sheet { padding: 16px 12px; }
  .zyr-ai-row { grid-template-columns: 1fr; }
  .zyr-title { font-size: 22px; letter-spacing: 2px; }
  .zyr-gua-grid { grid-template-columns: 1fr; }
  .zyr-core-grid { grid-template-columns: 1fr 1fr; }
  .zyr-core-wuxing { grid-column: 1 / -1; }
  .zyr-verdict-card { grid-template-columns: 1fr; }
  .zyr-verdict-right { border-left: none; border-top: 1px dashed var(--zyr-line); padding-left: 0; padding-top: 10px; }
  .zyr-final-cards { grid-template-columns: 1fr; }
}
</style>
