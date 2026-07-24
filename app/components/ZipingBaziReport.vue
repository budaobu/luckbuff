<template>
  <div class="zpr">
    <div class="zpr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zpr-head">
        <div class="zpr-head-top">
          <div class="zpr-brand">
            <div class="zpr-seal">{{ $t('zipingBazi.report.seal') }}</div>
            <span class="zpr-brand-name">{{ $t('zipingBazi.report.brandName') }}</span>
          </div>
          <div class="zpr-head-right">
            <span class="zpr-time">{{ $t('zipingBazi.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zpr-qiyun">{{ $t('zipingBazi.report.qiyunTag', { age: chart.qiyunAge }) }}</span>
          </div>
        </div>

        <h1 class="zpr-title">{{ titleText }}</h1>
        <p class="zpr-subtitle">{{ subtitleText }}</p>

        <div class="zpr-head-bottom">
          <p class="zpr-meta-line">{{ metaLine }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 ============ -->
      <section class="zpr-row">
        <div class="zpr-card zpr-profile">
          <div class="zpr-profile-line">
            <span class="zpr-ico">☀</span>
            <span class="zpr-profile-label">{{ $t('zipingBazi.report.solarLabel') }}</span>
            <span class="zpr-profile-value">{{ solarText }}</span>
          </div>
          <div class="zpr-profile-line">
            <span class="zpr-ico">⚥</span>
            <span class="zpr-profile-label">{{ $t('zipingBazi.report.genderLabel') }}</span>
            <span class="zpr-profile-value">{{ genderText }}</span>
          </div>
          <div class="zpr-profile-line">
            <span class="zpr-ico">♒</span>
            <span class="zpr-profile-label">{{ $t('zipingBazi.report.ageLabel') }}</span>
            <span class="zpr-profile-value">{{ ageText }}</span>
          </div>
        </div>

        <!-- ============ 命盘速览 ============ -->
        <div class="zpr-card">
          <h3 class="zpr-card-title">{{ $t('zipingBazi.report.overviewTitle') }}</h3>
          <div class="zpr-core-grid">
            <div class="zpr-core">
              <div class="zpr-core-label">{{ $t('zipingBazi.report.rizhuLabel') }}</div>
              <div class="zpr-core-value">{{ chart.riZhu }}</div>
              <div class="zpr-core-sub">{{ $t('zipingBazi.report.rizhuWuxing', { wx: riZhuWuxing }) }}</div>
            </div>
            <div class="zpr-core">
              <div class="zpr-core-label">{{ $t('zipingBazi.report.gejuLabel') }}</div>
              <div class="zpr-core-value zpr-core-value-sm">{{ chart.geju }}</div>
            </div>
            <div class="zpr-core">
              <div class="zpr-core-label">{{ $t('zipingBazi.report.wangshaiLabel') }}</div>
              <div class="zpr-gauge">
                <div class="zpr-gauge-track">
                  <span class="zpr-gauge-zone zpr-gauge-zone-weak" />
                  <span class="zpr-gauge-zone zpr-gauge-zone-mid" />
                  <span class="zpr-gauge-zone zpr-gauge-zone-strong" />
                  <span class="zpr-gauge-pointer" :style="{ left: gaugePos + '%' }" />
                </div>
                <div class="zpr-gauge-marks">
                  <span>{{ $t('zipingBazi.report.weakLabel') }}</span>
                  <span>{{ $t('zipingBazi.report.midLabel') }}</span>
                  <span>{{ $t('zipingBazi.report.strongLabel') }}</span>
                </div>
                <div class="zpr-gauge-verdict">{{ chart.riZhuStrength }}</div>
              </div>
            </div>
            <div class="zpr-core">
              <div class="zpr-core-label">{{ $t('zipingBazi.report.xiyongLabel') }}</div>
              <div class="zpr-yongshen">
                <span v-for="g in tiaohouList" :key="g" class="zpr-yongshen-char">{{ g }}</span>
              </div>
              <div class="zpr-core-sub">{{ $t('zipingBazi.report.jishenLabel') }}：{{ chart.jishen || '—' }}</div>
            </div>
            <div class="zpr-core zpr-core-wuxing">
              <div class="zpr-core-label">{{ $t('zipingBazi.report.wuxingLabel') }}</div>
              <div class="zpr-wuxing">
                <div v-for="w in wuxingList" :key="w.name" class="zpr-wuxing-row">
                  <span class="zpr-wuxing-dot" :style="{ background: w.color }" />
                  <span class="zpr-wuxing-name">{{ w.name }}</span>
                  <span class="zpr-wuxing-bar-wrap"><span class="zpr-wuxing-bar" :style="{ width: w.pct + '%', background: w.color }" /></span>
                  <span class="zpr-wuxing-pct">{{ w.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 八字四柱盘 ============ -->
      <section class="zpr-section">
        <div class="zpr-card zpr-pan">
          <h3 class="zpr-pan-title">{{ $t('zipingBazi.report.panTitle') }}</h3>
          <div class="zpr-bazi">
            <div class="zpr-bazi-grid">
              <div v-for="p in pillars" :key="p.label" class="zpr-pillar">
                <div class="zpr-pillar-head">{{ p.label }}</div>
                <div class="zpr-pillar-shishen">{{ p.shishen }}</div>
                <div class="zpr-pillar-gan" :class="{ 'zpr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="zpr-pillar-zhi" :class="{ 'zpr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="zpr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>

            <!-- 大运 -->
            <div class="zpr-dayun">
              <div class="zpr-dayun-title">{{ $t('zipingBazi.report.dayunTitle', { age: chart.qiyunAge }) }}</div>
              <div class="zpr-dayun-row">
                <div
                  v-for="d in chart.dayuns"
                  :key="d.index"
                  class="zpr-dayun-item"
                  :class="{ 'zpr-dayun-current': chart.currentDaYun?.index === d.index }"
                >
                  <span class="zpr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="zpr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>

            <!-- 流年 -->
            <div class="zpr-dayun">
              <div class="zpr-dayun-title">{{ $t('zipingBazi.report.liunianTitle') }}</div>
              <div class="zpr-dayun-row">
                <div
                  v-for="ln in liunianList"
                  :key="ln.year"
                  class="zpr-dayun-item"
                  :class="{ 'zpr-dayun-current': ln.current }"
                >
                  <span class="zpr-dayun-year">{{ ln.year }}</span>
                  <span class="zpr-dayun-gz">{{ ln.ganZhi }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节（命理要点 / 白话注释 逐条注解） ============ -->
      <!-- 01 性格天赋 + 02 事业方向 -->
      <section class="zpr-row zpr-ai-row">
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">01</span>{{ $t('zipingBazi.report.secPersonality') }}</h3>
          <div class="zpr-ai-body zpr-md" v-html="renderSection(sectionContentMap['性格天赋'])" />
        </div>
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">02</span>{{ $t('zipingBazi.report.secCareer') }}</h3>
          <div v-if="careerScores" class="zpr-score-bars">
            <div v-for="s in careerScores" :key="s.label" class="zpr-score-row">
              <span class="zpr-score-label">{{ s.label }}</span>
              <span class="zpr-score-track"><span class="zpr-score-fill" :style="{ width: s.value * 10 + '%' }" /></span>
              <span class="zpr-score-num">{{ s.value }}</span>
            </div>
          </div>
          <div class="zpr-ai-body zpr-md" v-html="renderSection(careerBody)" />
        </div>
      </section>

      <!-- 03 财富财运 + 04 婚姻感情 -->
      <section class="zpr-row zpr-ai-row">
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">03</span>{{ $t('zipingBazi.report.secWealth') }}</h3>
          <div v-if="wealthScores" class="zpr-score-bars">
            <div v-for="s in wealthScores" :key="s.label" class="zpr-score-row">
              <span class="zpr-score-label">{{ s.label }}</span>
              <span class="zpr-score-track"><span class="zpr-score-fill zpr-score-fill-gold" :style="{ width: s.value * 10 + '%' }" /></span>
              <span class="zpr-score-num">{{ s.value }}</span>
            </div>
          </div>
          <div class="zpr-ai-body zpr-md" v-html="renderSection(wealthBody)" />
        </div>
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">04</span>{{ $t('zipingBazi.report.secMarriage') }}</h3>
          <div v-if="marriageTags.length" class="zpr-tags">
            <span v-for="tag in marriageTags" :key="tag" class="zpr-tag">{{ tag }}</span>
          </div>
          <div class="zpr-ai-body zpr-md" v-html="renderSection(marriageBody)" />
        </div>
      </section>

      <!-- 05 健康提示 + 06 六亲与子女 -->
      <section class="zpr-row zpr-ai-row">
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">05</span>{{ $t('zipingBazi.report.secHealth') }}</h3>
          <div v-if="healthTable.length" class="zpr-health-wrap">
            <table class="zpr-health-table">
              <thead>
                <tr>
                  <th>{{ $t('zipingBazi.report.healthColWuxing') }}</th>
                  <th>{{ $t('zipingBazi.report.healthColState') }}</th>
                  <th>{{ $t('zipingBazi.report.healthColOrgan') }}</th>
                  <th>{{ $t('zipingBazi.report.healthColHint') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in healthTable" :key="row.wuxing">
                  <td><span class="zpr-wuxing-dot" :style="{ background: WX_COLORS[row.wuxing] }" />{{ row.wuxing }}</td>
                  <td><span class="zpr-health-badge" :class="healthBadgeClass(row.state)">{{ row.state }}</span></td>
                  <td>{{ row.organ }}</td>
                  <td>{{ row.hint }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="zpr-ai-body zpr-md" v-html="renderSection(healthBody)" />
        </div>
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">06</span>{{ $t('zipingBazi.report.secKinship') }}</h3>
          <div v-if="kinshipCards.length" class="zpr-kinship">
            <div v-for="kc in kinshipCards" :key="kc.i18nKey" class="zpr-kinship-card">
              <div class="zpr-kinship-head">
                <span class="zpr-kinship-ico">{{ kc.icon }}</span>
                <span class="zpr-kinship-name">{{ $t(`zipingBazi.report.${kc.i18nKey}`) }}</span>
              </div>
              <div class="zpr-kinship-body zpr-md" v-html="renderInline(kc.content)" />
            </div>
          </div>
          <div v-else class="zpr-ai-body zpr-md" v-html="renderSection(sectionContentMap['六亲与子女'])" />
        </div>
      </section>

      <!-- 07 大运与流年（时间轴 + 流年卡） -->
      <section class="zpr-section">
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">07</span>{{ $t('zipingBazi.report.secDayun') }}</h3>

          <!-- 大运时间轴（静态数据，始终渲染） -->
          <div class="zpr-timeline">
            <div
              v-for="dy in chart.dayuns"
              :key="dy.index"
              class="zpr-timeline-node"
              :class="{ 'zpr-timeline-current': chart.currentDaYun?.index === dy.index }"
            >
              <span class="zpr-timeline-age">{{ dy.ageRange[0] }}-{{ dy.ageRange[1] }}</span>
              <span class="zpr-timeline-gz">{{ dy.gan }}{{ dy.zhi }}</span>
              <span v-if="chart.currentDaYun?.index === dy.index" class="zpr-timeline-tag">{{ $t('zipingBazi.report.currentDaYunTag') }}</span>
            </div>
          </div>

          <!-- 流年卡（AI 解析，解析失败退回全文 markdown） -->
          <div v-if="dayunCards.length || liunianCards.length" class="zpr-fortune">
            <div v-if="dayunCards.length" class="zpr-fortune-group">
              <h4 class="zpr-fortune-group-title">{{ $t('zipingBazi.report.dayunReadingTitle') }}</h4>
              <div class="zpr-fortune-grid">
                <div v-for="c in dayunCards" :key="c.title" class="zpr-fortune-card" :class="{ 'zpr-fortune-current': isCurrentDaYunCard(c.title) }">
                  <div class="zpr-fortune-head">{{ c.title }}</div>
                  <div class="zpr-fortune-body zpr-md" v-html="renderInline(c.content)" />
                </div>
              </div>
            </div>
            <div v-if="liunianCards.length" class="zpr-fortune-group">
              <h4 class="zpr-fortune-group-title">{{ $t('zipingBazi.report.liunianReadingTitle') }}</h4>
              <div class="zpr-fortune-grid">
                <div v-for="c in liunianCards" :key="c.title" class="zpr-fortune-card" :class="{ 'zpr-fortune-current': isCurrentYearCard(c.title) }">
                  <div class="zpr-fortune-head">{{ c.title }}</div>
                  <div class="zpr-fortune-body zpr-md" v-html="renderInline(c.content)" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="zpr-ai-body zpr-md" v-html="renderSection(sectionContentMap['大运与流年'])" />
        </div>
      </section>

      <!-- 08 综合建议（终极定论版式） -->
      <section class="zpr-section">
        <div class="zpr-card zpr-ai">
          <h3 class="zpr-ai-title"><span class="zpr-ai-no">08</span>{{ $t('zipingBazi.report.secAdvice') }}</h3>
          <div v-if="finalVerdict" class="zpr-final">
            <div class="zpr-final-thesis">
              <div class="zpr-final-thesis-label">{{ $t('zipingBazi.report.finalThesisLabel') }}</div>
              <div class="zpr-final-thesis-text">{{ finalVerdict.thesis }}</div>
            </div>
            <div class="zpr-final-right">
              <div v-if="finalVerdict.summary" class="zpr-final-summary zpr-md" v-html="renderInline(finalVerdict.summary)" />
              <div v-if="finalVerdict.actions.length" class="zpr-final-actions">
                <h4 class="zpr-final-actions-title">{{ $t('zipingBazi.report.finalActionsTitle') }}</h4>
                <div v-for="(a, i) in finalVerdict.actions" :key="i" class="zpr-final-item">
                  <span class="zpr-final-num">{{ i + 1 }}</span>
                  <div class="zpr-final-action-text">{{ a }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="zpr-ai-body zpr-md" v-html="renderSection(sectionContentMap['综合建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zpr-streaming">
        <span class="zpr-streaming-dot" />
        {{ $t('zipingBazi.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zpr-error">
        <p>{{ error }}</p>
        <button type="button" class="zpr-retry" @click="$emit('retry')">{{ $t('zipingBazi.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zpr-foot">
        <span class="zpr-foot-note">ⓘ {{ $t('zipingBazi.report.footerNote') }}</span>
        <span class="zpr-seal zpr-seal-foot">{{ $t('zipingBazi.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ZipingBaziChart } from '~/types/ziping-bazi'
import type { TianGan, DiZhi } from '~/types/user'

interface Props {
  chart: ZipingBaziChart
  aiContent: string
  streaming: boolean
  error: string | null
  birthDate: string
  birthHour?: DiZhi
  gender: 'male' | 'female'
  name?: string
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

const birthYear = computed(() => Number(props.birthDate.split('-')[0] || 0))

const ageText = computed(() => {
  const age = props.chart.currentAge || (new Date().getFullYear() - birthYear.value)
  return t('zipingBazi.report.ageValue', { age, year: new Date().getFullYear() })
})

const genderText = computed(() =>
  props.gender === 'male' ? t('zipingBazi.report.genderMale') : t('zipingBazi.report.genderFemale'))

const solarText = computed(() => {
  const h = props.birthHour ? t('zipingBazi.report.hourSuffix', { hour: props.birthHour }) : ''
  return `${props.birthDate}${h}`
})

const WX_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}
const riZhuWuxing = computed(() => WX_GAN[props.chart.riZhu] ?? '')

const titleText = computed(() => t('zipingBazi.report.title', { geju: props.chart.geju }))

/** 副标：取「性格天赋」章首条命理要点，流式完成前用兜底 */
const subtitleText = computed(() => {
  const c = sectionContentMap.value['性格天赋'] ?? ''
  const m = c.match(/【命理要点】\s*([^\n【]+)/)
  const first = m?.[1]?.replace(/[*#]/g, '').trim() ?? ''
  return first
    ? first.slice(0, 48)
    : t('zipingBazi.report.subtitleFallback', { riZhu: props.chart.riZhu, strength: props.chart.riZhuStrength })
})

const metaLine = computed(() => t('zipingBazi.report.metaLine', {
  riZhu: props.chart.riZhu,
  wx: riZhuWuxing.value,
  strength: props.chart.riZhuStrength,
  xiyong: props.chart.xiyong || '—',
  jishen: props.chart.jishen || '—',
}))

/** 喜用拆分 */
const tiaohouList = computed(() => {
  const raw = props.chart.xiyong || ''
  return raw.split(/[、，,\s]+/).filter(Boolean).slice(0, 4)
})

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
const wuxingList = computed(() =>
  (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    pct: Math.round(props.chart.wuxingScore[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

/** 四柱 */
const pillars = computed(() => {
  const c = props.chart
  const mk = (label: string, p: typeof c.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('zipingBazi.report.rizhuTag') : (p?.shishen ?? '—'),
    canggan: p?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('zipingBazi.yearPillar'), c.year),
    mk(t('zipingBazi.monthPillar'), c.month),
    mk(t('zipingBazi.dayPillar'), c.day, true),
    mk(t('zipingBazi.hourPillar'), c.hour),
  ]
})

/** 流年（当前年前后各五年） */
const GAN_LIST: TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI_LIST: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const liunianList = computed(() => {
  const now = new Date().getFullYear()
  const out: { year: number; ganZhi: string; current: boolean }[] = []
  for (let y = now - 5; y <= now + 4; y++) {
    // 1984 = 甲子
    const idx = ((y - 1984) % 60 + 60) % 60
    out.push({ year: y, ganZhi: `${GAN_LIST[idx % 10]}${ZHI_LIST[idx % 12]}`, current: y === now })
  }
  return out
})

const gaugePos = computed(() => {
  const map: Record<string, number> = { 从弱: 8, 身弱: 32, 身旺: 68, 从强: 92 }
  return map[props.chart.riZhuStrength] ?? 50
})

/* ---------- AI 内容解析 ---------- */

const sectionContent = computed<Record<string, string>>(() => {
  const text = props.aiContent || ''
  const map: Record<string, string> = {}
  if (!text) return map
  // AI 偶尔会在段首输出 --- 分隔线，先剥掉每段开头的分隔线再匹配 ##
  const raws = text.split(/\n(?=##\s)/)
  for (let raw of raws) {
    let trimmed = raw.trim()
    // 剥离段首的 --- / *** / ___ 分隔线
    trimmed = trimmed.replace(/^(?:[-*_]{3,}\s*\n+)+/, '')
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').replace(/\*\*/g, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) map[title] = content
  }
  return map
})

/** 标题宽松匹配：去掉编号/空格后包含章名即命中 */
function findSection(key: string): string | undefined {
  const map = sectionContent.value
  for (const [title, content] of Object.entries(map)) {
    // 只剥离"编号 + 分隔符"（如 01. / 六、），避免误删章名里的字（如「六亲」的六）
    const normalized = title.replace(/^(?:\d{1,2}|[一二三四五六七八九十]{1,2})[.、)）:：]\s*/u, '').replace(/\s+/g, '')
    if (normalized.includes(key)) return content
  }
  return undefined
}

const sectionContentMap = computed<Record<string, string | undefined>>(() => ({
  性格天赋: findSection('性格天赋'),
  事业方向: findSection('事业方向'),
  财富财运: findSection('财富财运'),
  婚姻感情: findSection('婚姻感情'),
  健康提示: findSection('健康提示'),
  六亲与子女: findSection('六亲与子女'),
  大运与流年: findSection('大运与流年'),
  综合建议: findSection('综合建议'),
}))

const pendingText = computed(() => t('zipingBazi.report.pending'))

/* ---------- 通用：按 **小标题** 切块（与 BaziZiweiReport 同款） ---------- */

function splitBlocks(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  let current: string | null = null
  const prelude: string[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*\*\*([^*]+)\*\*\s*$/)
    if (m) {
      current = m[1]!.trim()
      if (!(current in out)) out[current] = ''
    } else if (current !== null) {
      out[current] += line + '\n'
    } else {
      prelude.push(line)
    }
  }
  for (const k of Object.keys(out)) out[k] = out[k]!.trim()
  if (prelude.join('').trim()) out.__prelude = prelude.join('\n').trim()
  return out
}

function pickBlock(blocks: Record<string, string>, re: RegExp): string {
  return Object.entries(blocks).find(([k]) => re.test(k))?.[1] ?? ''
}

/* ---------- 02 事业方向：适配度评分条 ---------- */

interface ScoreItem { label: string; value: number }

function parseScores(text: string, labels: string[]): ScoreItem[] | null {
  const out: ScoreItem[] = []
  for (const line of text.split('\n')) {
    const m = line.replace(/^[-*•]\s*/, '').match(/^(.{1,12}?)[：:]\s*(\d{1,2})/)
    if (!m) continue
    const label = labels.find(l => m[1]!.includes(l))
    if (!label) continue
    const value = Math.min(10, Math.max(0, Number(m[2])))
    out.push({ label: m[1]!.trim(), value })
  }
  return out.length >= 2 ? out : null
}

const CAREER_LABELS = ['稳定职级', '专业技术', '自主创业']

/** 去掉结构化块（如 **适配度评分** 的列表/表格），其余原文交给 marked 渲染 */
function stripStructuredBlock(content: string, headRe: RegExp): string {
  const lines = content.split('\n')
  const hi = lines.findIndex(l => headRe.test(l))
  if (hi === -1) return content
  let end = hi + 1
  while (end < lines.length) {
    const t = lines[end]!.trim()
    // 空行、列表项、表格行都属于结构块；遇到正文段落即停
    if (!t || t.startsWith('-') || t.startsWith('|')) { end++; continue }
    break
  }
  return [...lines.slice(0, hi), ...lines.slice(end)].join('\n').trim()
}

const careerBlocks = computed(() => {
  const c = sectionContentMap.value['事业方向']
  return c ? splitBlocks(c) : null
})
const careerScores = computed<ScoreItem[] | null>(() => {
  if (!careerBlocks.value) return null
  return parseScores(pickBlock(careerBlocks.value, /适配度评分|适配度|评分/), CAREER_LABELS)
})
/** 事业正文：去掉评分块后剩下的逐条注解 */
const careerBody = computed<string | undefined>(() => {
  const c = sectionContentMap.value['事业方向']
  if (!c) return c
  const rest = stripStructuredBlock(c, /^\s*\*\*[^*]*(适配度评分|适配度|评分)[^*]*\*\*\s*$/)
  return rest || undefined
})

/* ---------- 03 财富财运：财库画像条形图 ---------- */

const WEALTH_LABELS = ['进财能力', '守财能力', '偏财机遇', '稳健指数']

const wealthBlocks = computed(() => {
  const c = sectionContentMap.value['财富财运']
  return c ? splitBlocks(c) : null
})
const wealthScores = computed<ScoreItem[] | null>(() => {
  if (!wealthBlocks.value) return null
  return parseScores(pickBlock(wealthBlocks.value, /财库画像|财库|画像/), WEALTH_LABELS)
})
const wealthBody = computed<string | undefined>(() => {
  const c = sectionContentMap.value['财富财运']
  if (!c) return c
  const rest = stripStructuredBlock(c, /^\s*\*\*[^*]*(财库画像|财库|画像)[^*]*\*\*\s*$/)
  return rest || undefined
})

/* ---------- 04 婚姻感情：关键词标签云 ---------- */

const TAG_BLACKLIST = /^(?:【|命理要点|白话注释|参考建议|感情关键词|关键词)/

const marriageTags = computed<string[]>(() => {
  const c = sectionContentMap.value['婚姻感情']
  if (!c) return []
  const blocks = splitBlocks(c)
  let raw = ''
  const keyLine = Object.keys(blocks).find(k => /感情关键词|关键词/.test(k))
  if (keyLine) {
    raw = blocks[keyLine]!.split('\n')[0] ?? ''
  } else {
    raw = c.split('\n').find(l => /、|，|,/.test(l) && l.length < 40 && !l.includes('【')) ?? ''
  }
  return raw.split(/[、，,\s]+/).map(s => s.replace(/[*_#【】]/g, '').trim())
    .filter(s => s && s.length <= 8 && !TAG_BLACKLIST.test(s)).slice(0, 5)
})
const marriageBody = computed<string | undefined>(() => {
  const c = sectionContentMap.value['婚姻感情']
  if (!c) return c
  // 去掉「感情关键词」块头与其后的关键词行，其余原样交给 marked 渲染
  const lines = c.split('\n')
  const ki = lines.findIndex(l => /^\s*\*\*[^*]*(感情关键词|关键词)[^*]*\*\*\s*$/.test(l))
  if (ki === -1) return c
  let end = ki + 1
  while (end < lines.length && lines[end]!.trim() && !lines[end]!.includes('【')) end++
  const rest = [...lines.slice(0, ki), ...lines.slice(end)].join('\n').trim()
  return rest || undefined
})

/* ---------- 05 健康提示：五行对照表 ---------- */

interface HealthRow { wuxing: string; state: string; organ: string; hint: string }

const healthBlocks = computed(() => {
  const c = sectionContentMap.value['健康提示']
  return c ? splitBlocks(c) : null
})
const healthTable = computed<HealthRow[]>(() => {
  if (!healthBlocks.value) return []
  const raw = pickBlock(healthBlocks.value, /五行健康对照|健康对照|对照/)
  const rows: HealthRow[] = []
  for (const line of raw.split('\n')) {
    const cells = line.split('|').map(s => s.trim()).filter(Boolean)
    if (cells.length < 4) continue
    if (!/^[木火土金水]$/.test(cells[0]!)) continue
    rows.push({ wuxing: cells[0]!, state: cells[1]!, organ: cells[2]!, hint: cells[3]! })
  }
  return rows
})
function healthBadgeClass(state: string): string {
  if (/旺|强|过/.test(state)) return 'zpr-health-strong'
  if (/弱|缺|枯/.test(state)) return 'zpr-health-weak'
  return 'zpr-health-mid'
}
const healthBody = computed<string | undefined>(() => {
  const c = sectionContentMap.value['健康提示']
  if (!c) return c
  const rest = stripStructuredBlock(c, /^\s*\*\*[^*]*(五行健康对照|健康对照|对照)[^*]*\*\*\s*$/)
  return rest || undefined
})

/* ---------- 06 六亲与子女：三迷你卡 ---------- */

interface KinshipCard { i18nKey: string; icon: string; content: string }

const kinshipCards = computed<KinshipCard[]>(() => {
  const c = sectionContentMap.value['六亲与子女']
  if (!c) return []
  const blocks = splitBlocks(c)
  const defs = [
    { re: /长辈/, i18nKey: 'kinElder', icon: '☰' },
    { re: /同辈|兄弟|朋友/, i18nKey: 'kinPeer', icon: '☷' },
    { re: /子女|晚辈|后辈/, i18nKey: 'kinChild', icon: '☳' },
  ]
  const out: KinshipCard[] = []
  for (const d of defs) {
    const content = pickBlock(blocks, d.re)
    if (content) out.push({ i18nKey: d.i18nKey, icon: d.icon, content })
  }
  return out.length >= 2 ? out : []
})

/* ---------- 07 大运与流年：时间轴 + 卡片 ---------- */

interface FortuneCard { title: string; content: string }

const dayunBlocks = computed(() => {
  const c = sectionContentMap.value['大运与流年']
  return c ? splitBlocks(c) : null
})
const dayunCards = computed<FortuneCard[]>(() => {
  if (!dayunBlocks.value) return []
  return Object.entries(dayunBlocks.value)
    .filter(([k]) => k !== '__prelude' && /大运|运（/.test(k))
    .map(([title, content]) => ({ title, content }))
})
const liunianCards = computed<FortuneCard[]>(() => {
  if (!dayunBlocks.value) return []
  return Object.entries(dayunBlocks.value)
    .filter(([k]) => k !== '__prelude' && /年（\d{4}|年\(\d{4}|\d{4}\s*年/.test(k))
    .map(([title, content]) => ({ title, content }))
})
function isCurrentDaYunCard(title: string): boolean {
  const cur = props.chart.currentDaYun
  return !!cur && title.includes(cur.gan) && title.includes(cur.zhi)
}
function isCurrentYearCard(title: string): boolean {
  return title.includes(String(new Date().getFullYear()))
}

/* ---------- 08 综合建议：终极定论版式 ---------- */

interface FinalVerdict { thesis: string; summary: string; actions: string[] }

const finalVerdict = computed<FinalVerdict | null>(() => {
  const c = sectionContentMap.value['综合建议']
  if (!c) return null
  const blocks = splitBlocks(c)
  const thesisRaw = pickBlock(blocks, /终极定论|定论|主轴/)
  const summary = pickBlock(blocks, /白话总结|总结/)
  const actionsRaw = pickBlock(blocks, /行动清单|行动建议|建议清单/)
  const actions = actionsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 4)
  const thesis = thesisRaw.replace(/【命理要点】/g, '').replace(/\*\*/g, '').trim().split('\n')[0] ?? ''
  if (!thesis && !summary && !actions.length) return null
  return { thesis, summary: summary.replace(/【白话注释】/g, '').trim(), actions }
})

/* ---------- 渲染 ---------- */

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zpr-pending">${pendingText.value}</p>`
  }
  /** 行内粗体标注（**【命理要点】** 之类）转 chip 样式 */
  const chipified = content.replace(
    /\*\*(【(?:命理要点|白话注释|参考建议)】)\*\*\s*[：:]?/g,
    '<strong class="zpr-chip">$1</strong>',
  )
  return marked.parse(chipified, { async: false }) as string
}

/** 内联渲染（迷你卡/定论等小块，直接 marked） */
function renderInline(content: string): string {
  if (!content) return `<p class="zpr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（与 BaziZiweiReport 同源） ========== */
.zpr {
  --zpr-bg: #f2ede3;
  --zpr-sheet: #faf6ec;
  --zpr-card: #fffdf6;
  --zpr-ink: #2e2a24;
  --zpr-ink-soft: #55503f;
  --zpr-ink-faint: #8a8272;
  --zpr-line: #d8d0bd;
  --zpr-line-soft: #e6dfcd;
  --zpr-accent: #8c2f26;
  --zpr-accent-soft: #a8512e;
  --zpr-green: #4a7c59;
  border-radius: 12px;
  background: var(--zpr-bg);
  padding: 18px;
  color: var(--zpr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zpr-sheet {
  background: var(--zpr-sheet);
  border: 1px solid var(--zpr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zpr-head { border-bottom: 2px solid var(--zpr-ink); padding-bottom: 16px; }
.zpr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zpr-brand { display: flex; align-items: center; gap: 8px; }
.zpr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zpr-accent);
  color: var(--zpr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zpr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zpr-ink-soft); }
.zpr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zpr-ink-faint); }
.zpr-qiyun { letter-spacing: 1px; }

.zpr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.zpr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zpr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zpr-head-bottom { text-align: center; }
.zpr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zpr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zpr-row { display: grid; gap: 14px; margin-top: 16px; grid-template-columns: 1fr 2.6fr; }
.zpr-ai-row { grid-template-columns: 1fr 1fr; }
.zpr-section { margin-top: 16px; }

.zpr-card {
  background: var(--zpr-card);
  border: 1px solid var(--zpr-line);
  padding: 14px 16px;
}
.zpr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--zpr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}

/* ---------- 命主信息卡 ---------- */
.zpr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.zpr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.zpr-ico { color: var(--zpr-accent-soft); font-size: 12px; }
.zpr-profile-label { color: var(--zpr-ink-faint); min-width: 30px; }
.zpr-profile-value { color: var(--zpr-ink); letter-spacing: 0.5px; }

/* ---------- 命盘速览 ---------- */
.zpr-core-grid { display: grid; grid-template-columns: 0.7fr 0.9fr 1.3fr 1.1fr 1.4fr; gap: 10px; }
.zpr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 10px 8px; justify-content: center; }
.zpr-core-label { font-size: 11px; color: var(--zpr-ink-faint); letter-spacing: 1px; }
.zpr-core-value { font-size: 24px; font-weight: 700; letter-spacing: 2px; }
.zpr-core-value-sm { font-size: 17px; line-height: 1.4; }
.zpr-core-sub { font-size: 10px; color: var(--zpr-ink-faint); }
.zpr-core-wuxing { text-align: left; }

.zpr-gauge { margin-top: 4px; }
.zpr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--zpr-line); overflow: hidden; }
.zpr-gauge-zone { height: 100%; }
.zpr-gauge-zone-weak { flex: 35; background: linear-gradient(90deg, #b8cdc0, #d9e4dc); }
.zpr-gauge-zone-mid { flex: 30; background: #efe9d8; }
.zpr-gauge-zone-strong { flex: 35; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.zpr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--zpr-ink); transform: translateX(-1px);
}
.zpr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--zpr-ink-faint); margin-top: 3px; }
.zpr-gauge-verdict { font-size: 12px; font-weight: 700; margin-top: 4px; letter-spacing: 2px; }

.zpr-yongshen { display: flex; justify-content: center; gap: 8px; }
.zpr-yongshen-char {
  width: 30px; height: 30px;
  border: 1.5px solid var(--zpr-ink);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}

.zpr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.zpr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zpr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.zpr-wuxing-name { width: 12px; color: var(--zpr-ink-soft); }
.zpr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--zpr-line-soft); }
.zpr-wuxing-bar { display: block; height: 100%; }
.zpr-wuxing-pct { width: 28px; text-align: right; color: var(--zpr-ink-faint); }

/* ---------- 八字盘 ---------- */
.zpr-pan { padding: 12px; }
.zpr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zpr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.zpr-pillar { border: 1px solid var(--zpr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.zpr-pillar-head { font-size: 9px; color: var(--zpr-ink-faint); letter-spacing: 1px; }
.zpr-pillar-shishen { font-size: 10px; color: var(--zpr-accent-soft); min-height: 14px; }
.zpr-pillar-gan { font-size: 26px; font-weight: 700; line-height: 1.2; }
.zpr-pillar-zhi { font-size: 26px; font-weight: 700; line-height: 1.2; color: var(--zpr-ink-soft); }
.zpr-pillar-rimu { color: var(--zpr-accent); }
.zpr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--zpr-ink-faint); line-height: 1.5; min-height: 42px; }
.zpr-pillar-canggan i { font-style: normal; opacity: 0.7; }

.zpr-dayun { margin-top: 10px; }
.zpr-dayun-title { font-size: 10px; color: var(--zpr-ink-faint); margin-bottom: 4px; letter-spacing: 1px; }
.zpr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.zpr-dayun-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--zpr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.zpr-dayun-current { border-color: var(--zpr-accent); background: rgba(140, 47, 38, 0.05); }
.zpr-dayun-gz { font-size: 12px; font-weight: 700; }
.zpr-dayun-age { font-size: 8px; color: var(--zpr-ink-faint); }
.zpr-dayun-year { font-size: 9px; color: var(--zpr-ink-faint); }

/* ---------- AI 章节 ---------- */
.zpr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zpr-line-soft);
  padding-bottom: 8px;
}
.zpr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zpr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zpr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zpr-ink-soft); }

.zpr-md :deep(p) { margin: 0 0 0.7em; }
.zpr-md :deep(p:last-child) { margin-bottom: 0; }
.zpr-md :deep(strong) { color: var(--zpr-ink); font-weight: 700; }
/* 【命理要点】/【白话注释】/【参考建议】行内标注 chip */
.zpr-md :deep(.zpr-chip) {
  display: inline-block;
  font-size: 0.78em;
  font-weight: 600;
  color: var(--zpr-accent);
  border: 1px solid color-mix(in srgb, var(--zpr-accent) 35%, transparent);
  border-radius: 3px;
  padding: 0 0.35em;
  margin: 0 0.35em 0 0;
  line-height: 1.6;
  vertical-align: baseline;
  background: color-mix(in srgb, var(--zpr-accent) 5%, transparent);
}
.zpr-md :deep(ul), .zpr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zpr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zpr-md :deep(h3), .zpr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zpr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zpr-md { overflow-x: auto; }
.zpr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--zpr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.zpr-md :deep(.zpr-pending), .zpr-pending { color: var(--zpr-ink-faint); font-style: italic; }

/* 【命理要点/白话注释/参考建议】逐条注解的标签样式 */
.zpr-md :deep(p:has(strong:first-child)) { margin-bottom: 0.35em; }
.zpr-md :deep(p strong:first-child) {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 1px;
  padding: 1px 6px;
  margin-right: 4px;
  border: 1px solid var(--zpr-accent-soft);
  color: var(--zpr-accent-soft);
  border-radius: 2px;
  font-weight: 700;
}

/* ---------- 02/03 评分条 ---------- */
.zpr-score-bars {
  display: flex; flex-direction: column; gap: 7px;
  border: 1px dashed var(--zpr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 12px;
  margin-bottom: 12px;
}
.zpr-score-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.zpr-score-label { width: 60px; color: var(--zpr-ink-soft); flex-shrink: 0; letter-spacing: 1px; }
.zpr-score-track { flex: 1; height: 7px; background: var(--zpr-line-soft); position: relative; }
.zpr-score-fill {
  display: block; height: 100%;
  background: linear-gradient(90deg, var(--zpr-accent-soft), var(--zpr-accent));
}
.zpr-score-fill-gold { background: linear-gradient(90deg, #b8933d, #8c6d1f); }
.zpr-score-num { width: 20px; text-align: right; font-weight: 700; color: var(--zpr-ink); font-size: 12px; }

/* ---------- 04 标签云 ---------- */
.zpr-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.zpr-tag {
  font-size: 11px; letter-spacing: 1px;
  border: 1px solid var(--zpr-accent-soft);
  color: var(--zpr-accent-soft);
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(168, 81, 46, 0.05);
}

/* ---------- 05 健康表 ---------- */
.zpr-health-wrap { overflow-x: auto; margin-bottom: 12px; }
.zpr-health-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.zpr-health-table th, .zpr-health-table td {
  border: 1px solid var(--zpr-line);
  padding: 5px 7px;
  text-align: left;
  line-height: 1.5;
}
.zpr-health-table thead th {
  background: var(--zpr-line-soft);
  font-weight: 700; color: var(--zpr-ink);
  letter-spacing: 1px; text-align: center;
}
.zpr-health-table td { color: var(--zpr-ink-soft); }
.zpr-health-table td:first-child { font-weight: 700; color: var(--zpr-ink); white-space: nowrap; }
.zpr-health-badge {
  display: inline-block; font-size: 10px; padding: 0 6px;
  border-radius: 2px; letter-spacing: 1px; white-space: nowrap;
}
.zpr-health-strong { background: rgba(140, 47, 38, 0.1); color: var(--zpr-accent); border: 1px solid rgba(140, 47, 38, 0.3); }
.zpr-health-weak { background: rgba(74, 124, 89, 0.12); color: var(--zpr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.zpr-health-mid { background: rgba(138, 130, 114, 0.12); color: var(--zpr-ink-faint); border: 1px solid rgba(138, 130, 114, 0.3); }

/* ---------- 06 六亲迷你卡 ---------- */
.zpr-kinship { display: flex; flex-direction: column; gap: 8px; }
.zpr-kinship-card {
  border: 1px dashed var(--zpr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 12px;
}
.zpr-kinship-head { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.zpr-kinship-ico { color: var(--zpr-accent-soft); font-size: 13px; }
.zpr-kinship-name { font-size: 12px; font-weight: 700; color: var(--zpr-ink); letter-spacing: 1px; }
.zpr-kinship-body { font-size: 11.5px; line-height: 1.7; color: var(--zpr-ink-soft); }

/* ---------- 07 大运时间轴 ---------- */
.zpr-timeline {
  display: flex; gap: 3px; overflow-x: auto;
  border: 1px solid var(--zpr-line-soft);
  padding: 8px 6px; margin-bottom: 14px;
  background: var(--zpr-sheet);
}
.zpr-timeline-node {
  flex: 0 0 auto; min-width: 58px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 6px 4px;
  border: 1px solid transparent;
}
.zpr-timeline-current { border-color: var(--zpr-accent); background: rgba(140, 47, 38, 0.05); }
.zpr-timeline-age { font-size: 9px; color: var(--zpr-ink-faint); }
.zpr-timeline-gz { font-size: 14px; font-weight: 700; color: var(--zpr-ink); letter-spacing: 1px; }
.zpr-timeline-current .zpr-timeline-gz { color: var(--zpr-accent); }
.zpr-timeline-tag { font-size: 8px; color: var(--zpr-accent); letter-spacing: 1px; }

/* ---------- 07 大运/流年卡 ---------- */
.zpr-fortune { display: flex; flex-direction: column; gap: 12px; }
.zpr-fortune-group-title {
  margin: 0 0 7px; font-size: 11px; font-weight: 700;
  color: var(--zpr-ink-faint); letter-spacing: 2px;
}
.zpr-fortune-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.zpr-fortune-card {
  border: 1px solid var(--zpr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 12px;
}
.zpr-fortune-current { border-color: var(--zpr-accent); background: rgba(140, 47, 38, 0.04); }
.zpr-fortune-head {
  font-size: 12px; font-weight: 700; color: var(--zpr-accent-soft);
  letter-spacing: 1px; margin-bottom: 6px;
  border-bottom: 1px dashed var(--zpr-line); padding-bottom: 5px;
}
.zpr-fortune-body { font-size: 11.5px; line-height: 1.7; color: var(--zpr-ink-soft); }

/* ---------- 08 终极定论 ---------- */
.zpr-final { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
.zpr-final-thesis {
  border: 1.5px solid var(--zpr-accent);
  background: rgba(140, 47, 38, 0.04);
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  justify-content: center;
}
.zpr-final-thesis-label { font-size: 10px; color: var(--zpr-ink-faint); letter-spacing: 2px; }
.zpr-final-thesis-text { font-size: 14px; font-weight: 700; color: var(--zpr-accent); line-height: 1.7; letter-spacing: 1px; }
.zpr-final-right { display: flex; flex-direction: column; gap: 10px; }
.zpr-final-summary { font-size: 12px; line-height: 1.8; color: var(--zpr-ink-soft); }
.zpr-final-actions { border-top: 1px dashed var(--zpr-line); padding-top: 10px; }
.zpr-final-actions-title { margin: 0 0 8px; font-size: 11.5px; font-weight: 700; color: var(--zpr-ink); letter-spacing: 1px; }
.zpr-final-item { display: flex; gap: 7px; margin-bottom: 7px; align-items: flex-start; }
.zpr-final-item:last-child { margin-bottom: 0; }
.zpr-final-num {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--zpr-ink); color: #f5efe0;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.zpr-final-action-text { font-size: 11.5px; color: var(--zpr-ink-soft); line-height: 1.6; }

.zpr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zpr-ink-faint); letter-spacing: 1px;
}
.zpr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zpr-accent);
  animation: zpr-pulse 1s ease-in-out infinite;
}
@keyframes zpr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zpr-error { margin-top: 14px; text-align: center; color: var(--zpr-accent); font-size: 12px; }
.zpr-retry {
  margin-top: 8px;
  border: 1px solid var(--zpr-accent);
  background: transparent;
  color: var(--zpr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zpr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zpr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zpr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zpr-foot-note { font-size: 10px; color: var(--zpr-ink-faint); }
.zpr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zpr-row { grid-template-columns: 1fr; }
  .zpr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .zpr-final { grid-template-columns: 1fr; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.zpr-pan, .zpr-ai, .zpr-bazi, .zpr-bazi-grid, .zpr-dayun { min-width: 0; }

@media (max-width: 720px) {
  .zpr { padding: 8px; }
  .zpr-sheet { padding: 16px 12px; }
  .zpr-ai-row { grid-template-columns: 1fr; }
  .zpr-title { font-size: 22px; letter-spacing: 2px; }
  .zpr-core-grid { grid-template-columns: 1fr 1fr; }
  .zpr-fortune-grid { grid-template-columns: 1fr; }

  .zpr-pan { padding: 8px; }
  .zpr-pillar-gan, .zpr-pillar-zhi { font-size: 19px; }
  .zpr-pillar-shishen { font-size: 9px; }
  .zpr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .zpr-pillar-head { font-size: 8px; }

  /* 大运/流年：允许横向滚动，不被压缩 */
  .zpr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .zpr-dayun-item { flex: 0 0 auto; min-width: 48px; }
  .zpr-timeline { -webkit-overflow-scrolling: touch; }
  .zpr-timeline-node { min-width: 52px; }
}
</style>
