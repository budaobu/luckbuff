<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('baziZiwei.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('baziZiwei.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('baziZiwei.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('baziZiwei.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ mingZhuShenZhu }}</p>
          <p class="bzr-meta-line">{{ yinyangJu }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 两盘主轴印证 ============ -->
      <section class="bzr-row bzr-row-top">
        <div class="bzr-card bzr-profile">
          <div class="bzr-profile-line">
            <span class="bzr-ico">☀</span>
            <span class="bzr-profile-label">{{ $t('baziZiwei.report.solarLabel') }}</span>
            <span class="bzr-profile-value">{{ solarText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">☽</span>
            <span class="bzr-profile-label">{{ $t('baziZiwei.report.lunarLabel') }}</span>
            <span class="bzr-profile-value">{{ lunarText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">⚥</span>
            <span class="bzr-profile-label">{{ $t('baziZiwei.report.genderLabel') }}</span>
            <span class="bzr-profile-value">{{ genderText }}</span>
          </div>
          <div class="bzr-profile-line">
            <span class="bzr-ico">♒</span>
            <span class="bzr-profile-label">{{ $t('baziZiwei.report.ageLabel') }}</span>
            <span class="bzr-profile-value">{{ ageText }}</span>
          </div>
        </div>

        <div class="bzr-card bzr-yinzheng">
          <h3 class="bzr-card-title">{{ $t('baziZiwei.report.crossEvidenceTitle') }}</h3>
          <div class="bzr-yinzheng-grid">
            <div class="bzr-mini">
              <h4 class="bzr-mini-head">{{ $t('baziZiwei.report.baziThemeTitle') }}</h4>
              <p class="bzr-mini-body">{{ overview.baziTheme || pendingText }}</p>
            </div>
            <div class="bzr-mini">
              <h4 class="bzr-mini-head">{{ $t('baziZiwei.report.ziweiThemeTitle') }}</h4>
              <p class="bzr-mini-body">{{ overview.ziweiTheme || pendingText }}</p>
            </div>
            <div class="bzr-mini">
              <h4 class="bzr-mini-head bzr-mini-head-star">★ {{ $t('baziZiwei.report.advantagesTitle') }}</h4>
              <template v-if="overview.advantages.length">
                <div v-for="(adv, i) in overview.advantages" :key="i" class="bzr-point">
                  <div class="bzr-point-title"><span class="bzr-point-ico">★</span>{{ adv.title }}</div>
                  <div class="bzr-point-desc">{{ adv.desc }}</div>
                </div>
              </template>
              <p v-else class="bzr-mini-body">{{ pendingText }}</p>
            </div>
            <div class="bzr-mini">
              <h4 class="bzr-mini-head bzr-mini-head-warn">⊘ {{ $t('baziZiwei.report.concernsTitle') }}</h4>
              <template v-if="overview.concerns.length">
                <div v-for="(c, i) in overview.concerns" :key="i" class="bzr-point">
                  <div class="bzr-point-title bzr-point-title-warn"><span class="bzr-point-ico">⊘</span>{{ c.title }}</div>
                  <div class="bzr-point-desc">{{ c.desc }}</div>
                </div>
              </template>
              <p v-else class="bzr-mini-body">{{ pendingText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 命盘核心数据 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('baziZiwei.report.coreDataTitle') }}</h3>
        <div class="bzr-core-grid">
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('baziZiwei.report.gejuLabel') }}<span class="bzr-core-info">ⓘ</span></div>
            <div class="bzr-core-value">{{ baziChart.geju }}</div>
            <div class="bzr-core-sub">{{ $t('baziZiwei.report.confidenceHigh') }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('baziZiwei.report.wangshaiLabel') }}<span class="bzr-core-info">ⓘ</span></div>
            <div class="bzr-core-value">{{ baziChart.riZhuStrength }}</div>
            <div class="bzr-gauge">
              <div class="bzr-gauge-track">
                <span class="bzr-gauge-zone bzr-gauge-zone-weak" />
                <span class="bzr-gauge-zone bzr-gauge-zone-mid" />
                <span class="bzr-gauge-zone bzr-gauge-zone-strong" />
                <span class="bzr-gauge-pointer" :style="{ left: gaugePos + '%' }" />
              </div>
              <div class="bzr-gauge-marks">
                <span>{{ $t('baziZiwei.report.weakLabel') }}</span>
                <span>{{ $t('baziZiwei.report.midLabel') }}</span>
                <span>{{ $t('baziZiwei.report.strongLabel') }}</span>
              </div>
            </div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('baziZiwei.report.tiaohouLabel') }}<span class="bzr-core-info">ⓘ</span></div>
            <div class="bzr-yongshen">
              <span v-for="g in tiaohouList" :key="g" class="bzr-yongshen-char">{{ g }}</span>
            </div>
            <div class="bzr-core-sub">{{ $t('baziZiwei.report.confidenceHigh') }}</div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('baziZiwei.report.yuelingLabel') }}</div>
            <div class="bzr-yueling">
              <span v-for="(w, i) in yuelingList" :key="i" class="bzr-yueling-item">
                <em class="bzr-yueling-char">{{ w.char }}</em><i class="bzr-yueling-state">{{ w.state }}</i>
              </span>
            </div>
          </div>
          <div class="bzr-card bzr-core">
            <div class="bzr-core-label">{{ $t('baziZiwei.report.wuxingLabel') }}</div>
            <div class="bzr-wuxing">
              <div v-for="w in wuxingList" :key="w.name" class="bzr-wuxing-row">
                <span class="bzr-wuxing-dot" :style="{ background: w.color }" />
                <span class="bzr-wuxing-name">{{ w.name }}</span>
                <span class="bzr-wuxing-bar-wrap"><span class="bzr-wuxing-bar" :style="{ width: w.pct + '%', background: w.color }" /></span>
                <span class="bzr-wuxing-pct">{{ w.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 双盘 ============ -->
      <section class="bzr-row bzr-pans">
        <!-- 紫微斗数十二宫盘 -->
        <div class="bzr-card bzr-pan">
          <h3 class="bzr-pan-title">
            {{ $t('baziZiwei.report.zwdsPanTitle') }}
            <span class="bzr-pan-legend">{{ sihuaLegend }}</span>
          </h3>
          <div class="bzr-zwds-grid">
            <template v-for="pos in panPositions" :key="pos.key">
              <div v-if="pos.isCenter" class="bzr-zwds-center">
                <div class="bzr-zwds-center-title">{{ $t('baziZiwei.report.centerTitle') }}</div>
                <div class="bzr-zwds-center-line">{{ yinyangJu }}</div>
                <div class="bzr-zwds-center-line">{{ mingZhuShenZhu }}</div>
                <div class="bzr-zwds-center-pillars">
                  <span>{{ baziChart.year.gan }}<i>{{ baziChart.year.zhi }}</i></span>
                  <span>{{ baziChart.month.gan }}<i>{{ baziChart.month.zhi }}</i></span>
                  <span>{{ baziChart.day.gan }}<i>{{ baziChart.day.zhi }}</i></span>
                  <span>{{ baziChart.hour ? baziChart.hour.gan : '—' }}<i>{{ baziChart.hour ? baziChart.hour.zhi : '—' }}</i></span>
                </div>
              </div>
              <div
                v-else
                class="bzr-gong"
                :class="{ 'bzr-gong-ming': pos.gong?.isMing, 'bzr-gong-daxian': pos.gong?.isCurrentDaXian }"
              >
                <div class="bzr-gong-head">
                  <span class="bzr-gong-zhi">{{ pos.zhi }}</span>
                  <span class="bzr-gong-name">{{ pos.gong?.name }}宫</span>
                  <span v-if="pos.gong?.isMing" class="bzr-gong-tag">{{ $t('baziZiwei.report.mingTag') }}</span>
                  <span v-else-if="pos.gong?.isShen" class="bzr-gong-tag">{{ $t('baziZiwei.report.shenTag') }}</span>
                  <span class="bzr-gong-gan">{{ gongGan(pos.zhi!) }}</span>
                </div>
                <div class="bzr-gong-stars">
                  <span
                    v-for="star in pos.gong?.mainStars"
                    :key="star"
                    class="bzr-star-main"
                  >{{ star }}<em v-for="s in starSihua(pos.gong!, star)" :key="s" class="bzr-sihua" :class="'bzr-sihua-' + s">{{ s }}</em></span>
                  <span v-if="!pos.gong?.mainStars.length" class="bzr-star-none">{{ $t('baziZiwei.report.noMainStar') }}</span>
                </div>
                <div class="bzr-gong-aux">
                  <span v-for="star in pos.gong?.auxStars" :key="star" class="bzr-star-aux">{{ star }}</span>
                </div>
                <div class="bzr-gong-daxian">{{ gongDaXian(pos.zhi!) }}</div>
              </div>
            </template>
          </div>
        </div>

        <!-- 八字四柱盘 -->
        <div class="bzr-card bzr-pan">
          <h3 class="bzr-pan-title">{{ $t('baziZiwei.report.baziPanTitle') }}</h3>
          <div class="bzr-bazi">
            <div class="bzr-bazi-grid">
              <div v-for="p in pillars" :key="p.label" class="bzr-pillar">
                <div class="bzr-pillar-head">{{ p.label }}</div>
                <div class="bzr-pillar-shishen">{{ p.shishen }}</div>
                <div class="bzr-pillar-gan" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="bzr-pillar-zhi" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="bzr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>

            <!-- 大运 -->
            <div class="bzr-dayun">
              <div class="bzr-dayun-title">{{ $t('baziZiwei.report.dayunTitle', { age: baziChart.qiyunAge }) }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="d in baziChart.dayuns"
                  :key="d.index"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': d === baziChart.currentDaYun }"
                >
                  <span class="bzr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="bzr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>

            <!-- 流年 -->
            <div class="bzr-dayun">
              <div class="bzr-dayun-title">{{ $t('baziZiwei.report.liunianTitle') }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="ln in liunianList"
                  :key="ln.year"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': ln.current }"
                >
                  <span class="bzr-dayun-year">{{ ln.year }}</span>
                  <span class="bzr-dayun-gz">{{ ln.ganZhi }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('baziZiwei.report.secMainVerdict') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['主轴印证结论'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('baziZiwei.report.secTimeline') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['阶段印证时间轴'])" />
        </div>
      </section>

      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('baziZiwei.report.secSixDim') }}</h3>
          <div v-if="sixDim" class="bzr-table-wrap">
            <table class="bzr-table">
              <thead>
                <tr>
                  <th class="bzr-table-rowhead"></th>
                  <th v-for="d in dimList" :key="d.key">{{ d.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th class="bzr-table-rowhead">{{ $t('baziZiwei.report.sixdimBaziView') }}</th>
                  <td v-for="d in dimList" :key="d.key">{{ sixDim.bazi[d.key] || '—' }}</td>
                </tr>
                <tr>
                  <th class="bzr-table-rowhead">{{ $t('baziZiwei.report.sixdimZiweiView') }}</th>
                  <td v-for="d in dimList" :key="d.key">{{ sixDim.ziwei[d.key] || '—' }}</td>
                </tr>
                <tr>
                  <th class="bzr-table-rowhead">{{ $t('baziZiwei.report.sixdimMark') }}</th>
                  <td v-for="d in dimList" :key="d.key">
                    <span class="bzr-mark" :class="markClass(sixDim.marks[d.key])">{{ markLabel(sixDim.marks[d.key]) }}</span>
                  </td>
                </tr>
                <tr>
                  <th class="bzr-table-rowhead">{{ $t('baziZiwei.report.sixdimFusion') }}</th>
                  <td v-for="d in dimList" :key="d.key">{{ sixDim.fusion[d.key] || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['六维度交叉对账'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('baziZiwei.report.secConflicts') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['冲突清单'])" />
        </div>
      </section>

      <!-- ============ 综合定论 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">05</span>{{ $t('baziZiwei.report.secFinal') }}</h3>
          <div v-if="final" class="bzr-final">
            <div class="bzr-final-thesis">
              <div class="bzr-final-thesis-label">{{ $t('baziZiwei.report.finalThesisLabel') }}</div>
              <div class="bzr-final-thesis-text">{{ final.thesis }}</div>
              <div v-if="final.thesisNote" class="bzr-final-thesis-note">{{ final.thesisNote }}</div>
            </div>
            <div class="bzr-final-cards">
              <div class="bzr-final-card">
                <h4 class="bzr-final-card-title">{{ $t('baziZiwei.report.finalNodesTitle') }}</h4>
                <div v-for="(n, i) in final.nodes" :key="i" class="bzr-final-item">
                  <span class="bzr-final-dot" />
                  <div>
                    <div class="bzr-final-item-head">{{ n.title }}</div>
                    <div class="bzr-final-item-desc">{{ n.desc }}</div>
                  </div>
                </div>
              </div>
              <div class="bzr-final-card">
                <h4 class="bzr-final-card-title">{{ $t('baziZiwei.report.finalRisksTitle') }}</h4>
                <div v-for="(r, i) in final.risks" :key="i" class="bzr-final-item">
                  <div>
                    <div class="bzr-final-item-head">{{ r.title }}</div>
                    <div class="bzr-final-item-desc">{{ r.desc }}</div>
                  </div>
                </div>
              </div>
              <div class="bzr-final-card">
                <h4 class="bzr-final-card-title">{{ $t('baziZiwei.report.finalStrategiesTitle') }}</h4>
                <div v-for="(s, i) in final.strategies" :key="i" class="bzr-final-item">
                  <span class="bzr-final-tri" />
                  <div>
                    <div class="bzr-final-item-head">{{ s.title }}</div>
                    <div class="bzr-final-item-desc">{{ s.desc }}</div>
                  </div>
                </div>
              </div>
              <div class="bzr-final-card">
                <h4 class="bzr-final-card-title">{{ $t('baziZiwei.report.finalActionsTitle') }}</h4>
                <div v-for="(a, i) in final.actions" :key="i" class="bzr-final-item">
                  <span class="bzr-final-num">{{ i + 1 }}</span>
                  <div class="bzr-final-item-desc bzr-final-action-text">{{ a }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['综合定论'])" />
        </div>
      </section>

      <!-- ============ 置信度 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">06</span>{{ $t('baziZiwei.report.secConfidence') }}</h3>
          <div v-if="confidence" class="bzr-conf">
            <div class="bzr-conf-cards">
              <div v-for="c in confidence.cards" :key="c.label" class="bzr-conf-card">
                <div class="bzr-conf-label">{{ c.label }}</div>
                <div class="bzr-conf-level">{{ c.level }}</div>
                <div class="bzr-conf-score">({{ c.score }})</div>
              </div>
              <div v-if="confidence.note" class="bzr-conf-note">
                <span class="bzr-conf-note-label">{{ $t('baziZiwei.report.confNoteLabel') }}</span>{{ confidence.note }}
              </div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['置信度自评'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('baziZiwei.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('baziZiwei.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('baziZiwei.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('baziZiwei.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { BaziChart } from '~/types/bazi'
import type { ZwdsChart, ZwdsGong, ZwdsDaXian } from '~/types/zwds'
import type { TianGan, DiZhi } from '~/types/user'

interface Props {
  baziChart: BaziChart
  zwdsChart: ZwdsChart
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
  const age = props.zwdsChart.currentAge || (new Date().getFullYear() - birthYear.value)
  return t('baziZiwei.report.ageValue', { age, year: new Date().getFullYear() })
})

const genderText = computed(() =>
  props.gender === 'male' ? t('baziZiwei.report.genderMale') : t('baziZiwei.report.genderFemale'))

const solarText = computed(() => {
  const h = props.birthHour ? t('baziZiwei.report.hourSuffix', { hour: props.birthHour }) : ''
  return `${props.birthDate}${h}`
})

const lunarText = computed(() =>
  t('baziZiwei.report.lunarValue', {
    year: birthYear.value,
    month: props.zwdsChart.lunarMonth,
    day: props.zwdsChart.lunarDay,
  }))

/** 命宫主星 → 命主星 */
const MING_ZHU_MAP: Record<string, string> = {
  子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲', 辰: '廉贞', 巳: '武曲',
  午: '破军', 未: '武曲', 申: '廉贞', 酉: '文曲', 戌: '禄存', 亥: '巨门',
}

/** 生年支 → 身主星 */
const SHEN_ZHU_MAP: Record<string, string> = {
  子: '火星', 丑: '天相', 寅: '天梁', 卯: '天同', 辰: '文昌', 巳: '天机',
  午: '火星', 未: '天相', 申: '天梁', 酉: '天同', 戌: '文昌', 亥: '天机',
}

const mingZhuShenZhu = computed(() => t('baziZiwei.report.mingShenZhu', {
  ming: MING_ZHU_MAP[props.zwdsChart.mingGong.zhi] ?? '—',
  shen: SHEN_ZHU_MAP[props.zwdsChart.yearZhi] ?? '—',
}))

const yinyangJu = computed(() => t('baziZiwei.report.yinyangJuValue', {
  yy: genderYinyang.value,
  ju: props.zwdsChart.wuxingJu,
}))

const YANG_GAN: TianGan[] = ['甲', '丙', '戊', '庚', '壬']
const genderYinyang = computed(() => {
  const yang = YANG_GAN.includes(props.zwdsChart.yearGan)
  const key = props.gender === 'male'
    ? (yang ? 'yyYangMale' : 'yyYinMale')
    : (yang ? 'yyYangFemale' : 'yyYinFemale')
  return t(`baziZiwei.report.${key}`)
})

/** 调候用神：喜用字符串拆分 */
const tiaohouList = computed(() => {
  const raw = props.baziChart.xiyong || ''
  return raw.split(/[、，,\s]+/).filter(Boolean).slice(0, 4)
})

/** 月令旺相：从月支藏干推导（死/囚/休/相/旺 依季节五行） */
const ZHI_WUXING: Record<string, string> = {
  寅: '木', 卯: '木', 巳: '火', 午: '火', 申: '金', 酉: '金',
  亥: '水', 子: '水', 辰: '土', 戌: '土', 丑: '土', 未: '土',
}
const WX_SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const WX_KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const yuelingList = computed(() => {
  const season = ZHI_WUXING[props.baziChart.month.zhi] ?? '土'
  const states: Record<string, string> = {}
  for (const wx of ['木', '火', '土', '金', '水']) {
    if (wx === season) states[wx] = '旺'
    else if (WX_SHENG[season] === wx) states[wx] = '相'
    else if (WX_SHENG[wx] === season) states[wx] = '休'
    else if (WX_KE[wx] === season) states[wx] = '囚'
    else states[wx] = '死'
  }
  return ['水', '木', '金', '土', '火'].map(wx => ({ char: wx, state: states[wx]! }))
})

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
const wuxingList = computed(() =>
  (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    pct: Math.round(props.baziChart.wuxingScore[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

/** 四柱 */
const pillars = computed(() => {
  const c = props.baziChart
  const mk = (label: string, p: typeof c.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('baziZiwei.report.rizhuTag') : (p?.shishen ?? '—'),
    canggan: p?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('baziZiwei.report.yearPillar'), c.year),
    mk(t('baziZiwei.report.monthPillar'), c.month),
    mk(t('baziZiwei.report.dayPillar'), c.day, true),
    mk(t('baziZiwei.report.hourPillar'), c.hour),
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

/** 紫微盘位置 */
const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
const panLayout = [
  { key: '巳', zhi: '巳' as DiZhi }, { key: '午', zhi: '午' as DiZhi },
  { key: '未', zhi: '未' as DiZhi }, { key: '申', zhi: '申' as DiZhi },
  { key: '辰', zhi: '辰' as DiZhi }, { key: 'center', isCenter: true },
  { key: '酉', zhi: '酉' as DiZhi }, { key: '卯', zhi: '卯' as DiZhi },
  { key: '戌', zhi: '戌' as DiZhi }, { key: '寅', zhi: '寅' as DiZhi },
  { key: '丑', zhi: '丑' as DiZhi }, { key: '子', zhi: '子' as DiZhi },
  { key: '亥', zhi: '亥' as DiZhi },
]
const panPositions = computed(() => panLayout.map(pos => {
  if ('isCenter' in pos && pos.isCenter) return { key: pos.key, isCenter: true as const }
  const gong = props.zwdsChart.gongs.find(g => g.zhi === pos.zhi)
  return { key: pos.key, zhi: pos.zhi as DiZhi, gong: gong || null }
}))

/** 宫干：五虎遁，由年干起寅宫 */
const YIN_GAN_BY_YEAR_GAN: Record<string, TianGan> = {
  甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲',
}
function gongGan(zhi: DiZhi): TianGan {
  const yinGan = YIN_GAN_BY_YEAR_GAN[props.zwdsChart.yearGan] ?? '丙'
  const startIdx = GAN_LIST.indexOf(yinGan)
  const offset = ZHI_ORDER.indexOf(zhi) // 寅=0
  return GAN_LIST[(startIdx + offset) % 10]!
}

function starSihua(gong: ZwdsGong, star: string): string[] {
  return gong.siHua.filter(s => s.star === star).map(s => s.type)
}

function gongDaXian(zhi: DiZhi): string {
  const dx: ZwdsDaXian | undefined = props.zwdsChart.daXians.find(d => d.gongZhi === zhi)
  return dx ? `${t('baziZiwei.report.daxianLabel')} ${dx.ageRange[0]}-${dx.ageRange[1]}` : ''
}

const sihuaLegend = computed(() => {
  const parts = props.zwdsChart.gongs
    .flatMap(g => g.siHua)
    .map(s => `${s.star}${s.type}`)
  return parts.length ? `${t('baziZiwei.report.sihuaPrefix')}${parts.join(' / ')}` : ''
})

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

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

const pendingText = computed(() => t('baziZiwei.report.pending'))

interface ThemePoint { title: string; desc: string }

interface OverviewParsed {
  baziTheme: string
  advantages: ThemePoint[]
  ziweiTheme: string
  concerns: ThemePoint[]
}

function parsePoints(text: string): ThemePoint[] {
  return text
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .map(l => {
      const m = l.match(/^(.{1,12}?)[：:](.+)$/)
      return m ? { title: m[1]!.trim(), desc: m[2]!.trim() } : { title: l, desc: '' }
    })
    .slice(0, 3)
}

const overview = computed<OverviewParsed>(() => {
  const content = aiSections.value['两盘主轴速览'] ?? ''
  const out: OverviewParsed = { baziTheme: '', advantages: [], ziweiTheme: '', concerns: [] }
  if (!content) return out

  const blocks = splitBlocks(content)
  for (const [head, body] of Object.entries(blocks)) {
    if (/八字主轴/.test(head)) out.baziTheme = body.replace(/^[-*•]\s*/, '').split('\n')[0]!.trim()
    else if (/三大优势|优势/.test(head)) out.advantages = parsePoints(body)
    else if (/紫微主轴|紫薇主轴/.test(head)) out.ziweiTheme = body.replace(/^[-*•]\s*/, '').split('\n')[0]!.trim()
    else if (/三大隐忧|隐忧/.test(head)) out.concerns = parsePoints(body)
  }

  // 兜底：旧格式（无小标题，两段文本）
  if (!out.baziTheme && !out.ziweiTheme && content) {
    const paras = content.split(/\n{2,}|\n(?=[紫八])/).map(s => s.trim()).filter(Boolean)
    out.baziTheme = paras[0] ?? ''
    out.ziweiTheme = paras[1] ?? paras[0] ?? ''
  }
  return out
})

/** 标题/副标：从「主轴印证结论」首句提炼，截取得当 */
const verdict = computed(() => {
  const c = aiSections.value['主轴印证结论'] ?? ''
  if (/方向矛盾/.test(c)) return t('baziZiwei.report.verdictConflict')
  if (/互补侧重/.test(c)) return t('baziZiwei.report.verdictComplement')
  return t('baziZiwei.report.verdictSame')
})

const WX_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const titleText = computed(() => {
  const ming = props.zwdsChart.mingGong
  const mainStar = ming.mainStars[0]
  const dayWx = WX_GAN[props.baziChart.riZhu] ?? ''
  return mainStar
    ? t('baziZiwei.report.titleWithStar', { star: mainStar, wx: dayWx, geju: props.baziChart.geju })
    : t('baziZiwei.report.titleNoStar', { wx: dayWx, geju: props.baziChart.geju })
})

const subtitleText = computed(() => {
  const c = aiSections.value['主轴印证结论'] ?? ''
  // 剥离开头的判定词（同向印证/互补侧重/方向矛盾），再取首个完整句
  const plain = c
    .replace(/[#*🟢🟡🔴]/g, '')
    .replace(/^\s*(同向印证|互补侧重|方向矛盾)[，,、\s]*/, '')
    .replace(/\n/g, '，')
    .trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  // 首句为空或仍是裸判定词时用兜底
  const isBareVerdict = /^(同向印证|互补侧重|方向矛盾)?$/.test(first)
  return first && !isBareVerdict ? first.slice(0, 48) : t('baziZiwei.report.subtitleFallback', {
    geju: props.baziChart.geju, strength: props.baziChart.riZhuStrength,
  })
})

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="bzr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/* ---------- 03 六维交叉对账解析 ---------- */

const DIM_KEYS = ['事业', '财运', '婚恋', '子女', '六亲', '健康'] as const

type MarkLevel = 'same' | 'partial' | 'conflict'

interface SixDimTable {
  bazi: Record<string, string>
  ziwei: Record<string, string>
  marks: Record<string, MarkLevel>
  fusion: Record<string, string>
}

function parseDimList(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const m = line.replace(/^[-*•]\s*/, '').match(/^(.{1,6}?)[：:]\s*(.+)$/)
    if (!m) continue
    const dim = DIM_KEYS.find(d => m[1]!.includes(d))
    if (dim) out[dim] = m[2]!.trim()
  }
  return out
}

function parseMarks(text: string): Record<string, MarkLevel> {
  const out: Record<string, MarkLevel> = {}
  for (const line of text.split('\n')) {
    const m = line.replace(/^[-*•]\s*/, '').match(/^(.{1,6}?)[：:]\s*(.+)$/)
    if (!m) continue
    const dim = DIM_KEYS.find(d => m[1]!.includes(d))
    if (!dim) continue
    const v = m[2]!
    out[dim] = /矛盾/.test(v) ? 'conflict' : /部分冲突|部分冲|互补/.test(v) ? 'partial' : 'same'
  }
  return out
}

function splitBlocks(content: string): Record<string, string> {
  // 按行扫描：整行为 **标题** 的视作块标题，其余累加到当前块
  const out: Record<string, string> = {}
  let current: string | null = null
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*\*\*([^*]+)\*\*\s*$/)
    if (m) {
      current = m[1]!.trim()
      if (!(current in out)) out[current] = ''
    } else if (current !== null) {
      out[current] += line + '\n'
    }
  }
  // 去掉每块首尾空行
  for (const k of Object.keys(out)) out[k] = out[k]!.trim()
  return out
}

const sixDim = computed<SixDimTable | null>(() => {
  const content = aiSections.value['六维度交叉对账'] ?? ''
  if (!content) return null
  const blocks = splitBlocks(content)
  const pick = (re: RegExp) => Object.entries(blocks).find(([k]) => re.test(k))?.[1] ?? ''
  const bazi = parseDimList(pick(/八字视角|八字观点/))
  const ziwei = parseDimList(pick(/紫微视角|紫微观点|紫薇视角|紫薇观点/))
  const marks = parseMarks(pick(/印证标记|印证标志|标记/))
  const fusion = parseDimList(pick(/融合结论|融合/))
  if (!Object.keys(bazi).length && !Object.keys(ziwei).length) return null
  return { bazi, ziwei, marks, fusion }
})

const dimList = computed(() => DIM_KEYS.map(d => ({ key: d, label: t(`baziZiwei.report.dim${d}`) })))

function markClass(level: MarkLevel | undefined): string {
  if (level === 'conflict') return 'bzr-mark-conflict'
  if (level === 'partial') return 'bzr-mark-partial'
  return 'bzr-mark-same'
}
function markLabel(level: MarkLevel | undefined): string {
  if (level === 'conflict') return t('baziZiwei.report.markConflict')
  if (level === 'partial') return t('baziZiwei.report.markPartial')
  return t('baziZiwei.report.markSame')
}

/* ---------- 05 综合定论解析 ---------- */

interface FinalItem { title: string; desc: string }

interface FinalParsed {
  thesis: string
  thesisNote: string
  nodes: FinalItem[]
  risks: FinalItem[]
  strategies: FinalItem[]
  actions: string[]
}

function parseColonItems(text: string): FinalItem[] {
  return text
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .map(l => {
      const m = l.match(/^(.{1,20}?)[：:](.+)$/)
      return m ? { title: m[1]!.trim(), desc: m[2]!.trim() } : { title: l, desc: '' }
    })
}

const final = computed<FinalParsed | null>(() => {
  const content = aiSections.value['综合定论'] ?? ''
  if (!content) return null
  const blocks = splitBlocks(content)
  const pick = (re: RegExp) => Object.entries(blocks).find(([k]) => re.test(k))?.[1] ?? ''
  const thesisRaw = pick(/终极主轴|人生主轴|主轴/)
  const nodes = parseColonItems(pick(/关键节点/)).slice(0, 5)
  const risks = parseColonItems(pick(/高风险窗口|风险窗口/)).slice(0, 3)
  const strategies = parseColonItems(pick(/优势放大策略|优势策略|放大策略/)).slice(0, 2)
  const actionsRaw = pick(/行动建议|建议清单|针对性建议|建议/)
  const actions = actionsRaw
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5)
  if (!thesisRaw && !nodes.length && !risks.length && !strategies.length && !actions.length) return null
  const thesisLines = thesisRaw.split('\n').map(s => s.replace(/\*\*/g, '').trim()).filter(Boolean)
  return {
    thesis: thesisLines[0] ?? '',
    thesisNote: thesisLines.slice(1).join(' '),
    nodes,
    risks,
    strategies,
    actions,
  }
})

/* ---------- 06 置信度解析 ---------- */

interface ConfidenceCard { label: string; level: string; score: string }

const CONF_KEYS: { re: RegExp; i18n: string }[] = [
  { re: /八字模型/, i18n: 'confBazi' },
  { re: /紫微模型|紫薇模型/, i18n: 'confZiwei' },
  { re: /两盘印证一致性|两盘一致性|印证一致性/, i18n: 'confConsistency' },
  { re: /关键结论稳定性|结论稳定性/, i18n: 'confStability' },
]

const confidence = computed<{ cards: ConfidenceCard[]; note: string } | null>(() => {
  const content = aiSections.value['置信度自评'] ?? ''
  if (!content) return null
  const lines = content.split('\n').map(s => s.trim()).filter(Boolean)
  const cards: ConfidenceCard[] = []
  const restLines: string[] = []
  for (const line of lines) {
    const stripped = line.replace(/^[-*•]\s*/, '')
    const conf = CONF_KEYS.find(c => c.re.test(stripped))
    const m = stripped.match(/(高|中高|中|低)\s*[（(]?\s*(0?\.\d+|\d+(\.\d+)?%?)\s*[)）]?/)
    if (conf && m) {
      cards.push({ label: t(`baziZiwei.report.${conf.i18n}`), level: m[1]!, score: m[2]! })
    } else {
      restLines.push(line)
    }
  }
  if (!cards.length) return null
  const note = restLines.join(' ').replace(/^[-*•]\s*/, '').slice(0, 120)
  return { cards, note }
})

const gaugePos = computed(() => {
  const map: Record<string, number> = { 从弱: 8, 身弱: 32, 身旺: 68, 从强: 92 }
  return map[props.baziChart.riZhuStrength] ?? 50
})
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
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
  letter-spacing: 4px;
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
.bzr-row-top { grid-template-columns: 1fr 2.4fr; }
.bzr-pans { grid-template-columns: 1fr 1fr; }
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

/* ---------- 命主信息卡 ---------- */
.bzr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bzr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bzr-ico { color: var(--bzr-accent-soft); font-size: 12px; }
.bzr-profile-label { color: var(--bzr-ink-faint); min-width: 30px; }
.bzr-profile-value { color: var(--bzr-ink); letter-spacing: 0.5px; }

/* ---------- 两盘主轴印证 ---------- */
.bzr-yinzheng-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bzr-mini { border: 1px dashed var(--bzr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bzr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--bzr-accent-soft); letter-spacing: 1px; }
.bzr-mini-head-star { color: var(--bzr-star); }
.bzr-mini-head-warn { color: var(--bzr-accent); }
.bzr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--bzr-ink-soft); }
.bzr-point { margin-bottom: 7px; }
.bzr-point:last-child { margin-bottom: 0; }
.bzr-point-title { font-size: 12px; font-weight: 700; color: var(--bzr-ink); display: flex; gap: 5px; align-items: baseline; }
.bzr-point-title-warn { color: var(--bzr-accent); }
.bzr-point-ico { font-size: 10px; color: var(--bzr-star); }
.bzr-point-desc { font-size: 11px; color: var(--bzr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 核心数据五卡 ---------- */
.bzr-core-grid { display: grid; grid-template-columns: 1.1fr 1.3fr 0.9fr 1.2fr 1.4fr; gap: 10px; }
.bzr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; }
.bzr-core-label { font-size: 11px; color: var(--bzr-ink-faint); letter-spacing: 1px; display: flex; justify-content: center; gap: 4px; }
.bzr-core-info { font-size: 10px; opacity: 0.6; }
.bzr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.bzr-core-sub { font-size: 10px; color: var(--bzr-ink-faint); }

.bzr-gauge { margin-top: 4px; }
.bzr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--bzr-line); overflow: hidden; }
.bzr-gauge-zone { height: 100%; }
.bzr-gauge-zone-weak { flex: 35; background: linear-gradient(90deg, #b8cdc0, #d9e4dc); }
.bzr-gauge-zone-mid { flex: 30; background: #efe9d8; }
.bzr-gauge-zone-strong { flex: 35; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.bzr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--bzr-ink); transform: translateX(-1px);
}
.bzr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--bzr-ink-faint); margin-top: 3px; }

.bzr-yongshen { display: flex; justify-content: center; gap: 8px; }
.bzr-yongshen-char {
  width: 30px; height: 30px;
  border: 1.5px solid var(--bzr-ink);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}

.bzr-yueling { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; align-items: baseline; }
.bzr-yueling-item { display: inline-flex; align-items: baseline; gap: 2px; }
.bzr-yueling-char { font-style: normal; font-size: 15px; font-weight: 700; }
.bzr-yueling-state { font-style: normal; font-size: 11px; color: var(--bzr-ink-faint); }

.bzr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.bzr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bzr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.bzr-wuxing-name { width: 12px; color: var(--bzr-ink-soft); }
.bzr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--bzr-line-soft); }
.bzr-wuxing-bar { display: block; height: 100%; }
.bzr-wuxing-pct { width: 28px; text-align: right; color: var(--bzr-ink-faint); }

/* ---------- 双盘 ---------- */
.bzr-pan { padding: 12px; }
.bzr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bzr-pan-legend { display: block; font-size: 9px; color: var(--bzr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.bzr-zwds-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, minmax(86px, auto));
  gap: 2px;
}
.bzr-zwds-center {
  grid-column: 2 / span 2; grid-row: 2 / span 2;
  border: 1px solid var(--bzr-line);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; padding: 8px; text-align: center;
  background: var(--bzr-sheet);
}
.bzr-zwds-center-title { font-size: 12px; font-weight: 700; letter-spacing: 2px; }
.bzr-zwds-center-line { font-size: 10px; color: var(--bzr-ink-faint); }
.bzr-zwds-center-pillars { display: flex; gap: 6px; margin-top: 4px; }
.bzr-zwds-center-pillars span {
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid var(--bzr-line); padding: 2px 5px;
  font-size: 12px; font-weight: 700; line-height: 1.3;
}
.bzr-zwds-center-pillars i { font-style: normal; font-size: 10px; color: var(--bzr-ink-faint); font-weight: 400; }

.bzr-gong {
  border: 1px solid var(--bzr-line-soft);
  padding: 4px 5px;
  display: flex; flex-direction: column; gap: 2px;
  background: var(--bzr-card);
  overflow: hidden;
}
.bzr-gong-ming { border: 1.5px solid var(--bzr-accent); background: rgba(140, 47, 38, 0.04); }
.bzr-gong-daxian:not(.bzr-gong-ming) { background: rgba(74, 124, 89, 0.05); }
.bzr-gong-head { display: flex; align-items: baseline; gap: 4px; font-size: 9px; color: var(--bzr-ink-faint); }
.bzr-gong-zhi { color: var(--bzr-ink-faint); }
.bzr-gong-name { font-weight: 700; color: var(--bzr-ink-soft); font-size: 10px; }
.bzr-gong-ming .bzr-gong-name { color: var(--bzr-accent); }
.bzr-gong-tag { font-size: 8px; border: 1px solid var(--bzr-accent); color: var(--bzr-accent); padding: 0 2px; line-height: 1.4; }
.bzr-gong-gan { margin-left: auto; }
.bzr-gong-stars { display: flex; flex-wrap: wrap; gap: 2px 4px; }
.bzr-star-main { font-size: 12px; font-weight: 700; color: var(--bzr-ink); }
.bzr-star-none { font-size: 10px; color: var(--bzr-ink-faint); font-style: italic; }
.bzr-sihua {
  font-style: normal; font-size: 8px; margin-left: 1px;
  border: 1px solid currentColor; padding: 0 1px; line-height: 1.2;
  vertical-align: super;
}
.bzr-sihua-禄 { color: #8c6d1f; }
.bzr-sihua-权 { color: #a8512e; }
.bzr-sihua-科 { color: #4a7c59; }
.bzr-sihua-忌 { color: #8c2f26; }
.bzr-gong-aux { display: flex; flex-wrap: wrap; gap: 2px 4px; }
.bzr-star-aux { font-size: 9px; color: var(--bzr-ink-faint); }
.bzr-gong-daxian { margin-top: auto; font-size: 8px; color: var(--bzr-ink-faint); border-top: 1px dashed var(--bzr-line-soft); padding-top: 2px; }

/* ---------- 八字盘 ---------- */
.bzr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.bzr-pillar { border: 1px solid var(--bzr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.bzr-pillar-head { font-size: 9px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-pillar-shishen { font-size: 10px; color: var(--bzr-accent-soft); min-height: 14px; }
.bzr-pillar-gan { font-size: 26px; font-weight: 700; line-height: 1.2; }
.bzr-pillar-zhi { font-size: 26px; font-weight: 700; line-height: 1.2; color: var(--bzr-ink-soft); }
.bzr-pillar-rimu { color: var(--bzr-accent); }
.bzr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--bzr-ink-faint); line-height: 1.5; min-height: 42px; }
.bzr-pillar-canggan i { font-style: normal; opacity: 0.7; }

.bzr-dayun { margin-top: 10px; }
.bzr-dayun-title { font-size: 10px; color: var(--bzr-ink-faint); margin-bottom: 4px; letter-spacing: 1px; }
.bzr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.bzr-dayun-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--bzr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.bzr-dayun-current { border-color: var(--bzr-accent); background: rgba(140, 47, 38, 0.05); }
.bzr-dayun-gz { font-size: 12px; font-weight: 700; }
.bzr-dayun-age { font-size: 8px; color: var(--bzr-ink-faint); }
.bzr-dayun-year { font-size: 9px; color: var(--bzr-ink-faint); }

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
@media (max-width: 720px) {
  .bzr-md :deep(table) { min-width: 480px; }
  .bzr-md :deep(th), .bzr-md :deep(td) { font-size: 10px; padding: 3px 5px; }
}
.bzr-md :deep(th), .bzr-md :deep(td) { border: 1px solid var(--bzr-line); padding: 4px 6px; text-align: left; }
.bzr-md :deep(th) { background: var(--bzr-line-soft); font-weight: 700; color: var(--bzr-ink); }
.bzr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bzr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bzr-md :deep(.bzr-pending), .bzr-pending { color: var(--bzr-ink-faint); font-style: italic; }

/* ---------- 03 六维交叉对账表格 ---------- */
.bzr-table-wrap { overflow-x: auto; }
.bzr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.bzr-table th, .bzr-table td {
  border: 1px solid var(--bzr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.bzr-table thead th {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  text-align: center;
  letter-spacing: 1px;
}
.bzr-table-rowhead {
  background: var(--bzr-line-soft);
  font-weight: 700;
  color: var(--bzr-ink);
  white-space: nowrap;
  font-size: 11px;
}
.bzr-table td { color: var(--bzr-ink-soft); }
.bzr-mark {
  display: inline-block;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.bzr-mark-same { background: rgba(74, 124, 89, 0.14); color: var(--bzr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bzr-mark-partial { background: rgba(168, 81, 46, 0.12); color: var(--bzr-accent-soft); border: 1px solid rgba(168, 81, 46, 0.35); }
.bzr-mark-conflict { background: rgba(140, 47, 38, 0.12); color: var(--bzr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 05 综合定论 ---------- */
.bzr-final { display: grid; grid-template-columns: 200px 1fr; gap: 14px; }
.bzr-final-thesis {
  border: 1.5px solid var(--bzr-accent);
  background: rgba(140, 47, 38, 0.04);
  padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  justify-content: center;
}
.bzr-final-thesis-label { font-size: 10px; color: var(--bzr-ink-faint); letter-spacing: 2px; }
.bzr-final-thesis-text { font-size: 15px; font-weight: 700; color: var(--bzr-accent); line-height: 1.7; letter-spacing: 1px; }
.bzr-final-thesis-note { font-size: 11px; color: var(--bzr-ink-soft); line-height: 1.6; }
.bzr-final-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.bzr-final-card { border: 1px solid var(--bzr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.bzr-final-card-title {
  margin: 0 0 8px;
  font-size: 11.5px; font-weight: 700;
  color: var(--bzr-ink); letter-spacing: 1px;
  border-bottom: 1px dashed var(--bzr-line);
  padding-bottom: 6px;
}
.bzr-final-item { display: flex; gap: 6px; margin-bottom: 8px; align-items: flex-start; }
.bzr-final-item:last-child { margin-bottom: 0; }
.bzr-final-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--bzr-accent);
  margin-top: 4px; flex-shrink: 0;
}
.bzr-final-tri {
  width: 0; height: 0; flex-shrink: 0; margin-top: 4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 7px solid var(--bzr-green);
}
.bzr-final-item-head { font-size: 11px; font-weight: 700; color: var(--bzr-ink); }
.bzr-final-item-desc { font-size: 10.5px; color: var(--bzr-ink-faint); line-height: 1.55; margin-top: 1px; }
.bzr-final-num {
  width: 15px; height: 15px; border-radius: 50%;
  background: var(--bzr-ink); color: #f5efe0;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.bzr-final-action-text { margin-top: 1px; color: var(--bzr-ink-soft); }

/* ---------- 06 置信度 ---------- */
.bzr-conf-cards { display: grid; grid-template-columns: repeat(4, 1fr) 1.6fr; gap: 10px; align-items: stretch; }
.bzr-conf-card {
  border: 1px solid var(--bzr-line);
  background: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 12px 6px;
  display: flex; flex-direction: column; gap: 4px; justify-content: center;
}
.bzr-conf-label { font-size: 10.5px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-conf-level { font-size: 20px; font-weight: 700; color: var(--bzr-ink); letter-spacing: 2px; }
.bzr-conf-score { font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-conf-note {
  border: 1px dashed var(--bzr-line);
  padding: 10px 12px;
  font-size: 10.5px; color: var(--bzr-ink-faint); line-height: 1.65;
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.bzr-conf-note-label { font-weight: 700; color: var(--bzr-ink-soft); }

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
  .bzr-row-top { grid-template-columns: 1fr; }
  .bzr-pans { grid-template-columns: 1fr; }
  .bzr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .bzr-final { grid-template-columns: 1fr; }
  .bzr-final-cards { grid-template-columns: repeat(2, 1fr); }
  .bzr-conf-cards { grid-template-columns: repeat(2, 1fr); }
  /* 说明卡单独成行时填满整行 */
  .bzr-conf-note { grid-column: 1 / -1; }
}

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.bzr-pan, .bzr-ai, .bzr-bazi, .bzr-zwds-grid, .bzr-bazi-grid, .bzr-dayun, .bzr-final, .bzr-conf { min-width: 0; }

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-yinzheng-grid { grid-template-columns: 1fr; }
  .bzr-title { font-size: 22px; letter-spacing: 2px; }
  .bzr-core-grid { grid-template-columns: 1fr 1fr; }
  .bzr-final-cards { grid-template-columns: 1fr; }
  .bzr-conf-cards { grid-template-columns: 1fr 1fr; }
  /* 说明卡单独成行时填满整行 */
  .bzr-conf-note { grid-column: 1 / -1; }

  /* 紫微十二宫盘：缩小宫位内容，保住 4x4 结构 */
  .bzr-pan { padding: 8px; }
  .bzr-zwds-grid { grid-template-rows: repeat(4, minmax(64px, auto)); }
  .bzr-gong { padding: 3px 3px; gap: 1px; }
  .bzr-gong-name { font-size: 9px; }
  .bzr-star-main { font-size: 10px; }
  .bzr-star-aux { font-size: 8px; }
  .bzr-gong-daxian { font-size: 7px; }
  .bzr-gong-head { font-size: 8px; }
  .bzr-zwds-center { padding: 4px; gap: 2px; }
  .bzr-zwds-center-title { font-size: 10px; letter-spacing: 1px; }
  .bzr-zwds-center-line { font-size: 8px; }
  .bzr-zwds-center-pillars { gap: 3px; }
  .bzr-zwds-center-pillars span { font-size: 10px; padding: 1px 3px; }

  /* 八字四柱盘：缩小干支大字 */
  .bzr-pillar-gan, .bzr-pillar-zhi { font-size: 19px; }
  .bzr-pillar-shishen { font-size: 9px; }
  .bzr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .bzr-pillar-head { font-size: 8px; }

  /* 大运/流年：允许横向滚动，不被压缩 */
  .bzr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bzr-dayun-item { flex: 0 0 auto; min-width: 48px; }

  /* 六维对账表：表格给最小宽度，容器滚动 */
  .bzr-table { min-width: 560px; }
  .bzr-table-rowhead { white-space: normal; }
}
</style>
