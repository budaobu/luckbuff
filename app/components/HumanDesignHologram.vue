<template>
  <div ref="rootRef" class="cosmos">
    <canvas ref="stageRef" class="stage" @pointermove="handlePointerMove" @pointerleave="handlePointerLeave" @pointerdown="handlePointerDown" @pointerup="handlePointerUp" />
    <div class="vignette" />

    <div id="hud" class="hud">
      <h1>人类图 · 基因宇宙</h1>
      <div class="sub">{{ birthLine }}</div>
    </div>

    <div class="actions">
      <NuxtLink :to="localePath('/chart')" class="project-action">
        <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
        <span>返回</span>
      </NuxtLink>
      <button type="button" class="open-modal" @click="openModal('overview')">
        <span class="icon">✦</span>
        <span>排盘详情</span>
      </button>
      <AppShareButton
        tool="human-design"
        name="人类图 · 基因宇宙"
        summary="3D 全息人类图排盘"
        filename="human-design-cosmos.png"
        :share-target="rootRef ?? undefined"
        :share-image-factory="captureFrame"
      />
      <button type="button" class="project-action" @click="emit('retry')">
        <UIcon name="i-heroicons-arrow-path" class="h-3.5 w-3.5" />
        <span>重新排盘</span>
      </button>
    </div>

    <div id="controls" class="controls" aria-label="3D 视图">
      <button type="button" :class="{ on: viewMode === 'bodygraph' }" @click="setViewMode('bodygraph')">九中心</button>
      <button type="button" :class="{ on: viewMode === 'gates' }" @click="setViewMode('gates')">64闸门轮</button>
      <button type="button" :class="{ on: viewMode === 'genekeys' }" @click="setViewMode('genekeys')">基因球体</button>
      <button type="button" @click="resetView">重置视角</button>
    </div>

    <div
      id="elementModal"
      ref="elementPopoverRef"
      class="element-side-drawer"
      :class="{ show: elementOpen }"
      role="dialog"
      aria-modal="false"
      aria-label="3D 元素详情"
    >
      <div class="element-side-drawer-inner">
        <div class="modal-header">
          <div class="modal-title">✦ {{ selectedElement ? `${elementLabels[selectedElement.kind]}详情` : '元素详情' }}</div>
          <button class="modal-close" type="button" aria-label="关闭元素详情" @click="closeElementModal">×</button>
        </div>
        <div class="element-side-drawer-body">
            <section v-if="elementOpen && selectedElement?.kind === 'center'" class="tab-panel active">
              <div class="dp-title-row">
                <div class="center-dot" :style="centerDotStyle(selectedElement.key)" />
                <div>
                  <div class="dp-planet-name" :style="{ color: centerHex(selectedElement.key) }">{{ COSMOS_CENTERS[selectedElement.key]?.cn }}</div>
                  <div class="dp-planet-en">{{ selectedElement.key }} · {{ COSMOS_CENTERS[selectedElement.key]?.theme }}</div>
                </div>
              </div>
              <div class="section-heading">状态</div>
              <div class="row"><span class="k">中心状态</span><span class="v">{{ centerStatusCn(selectedElement.key) }}</span></div>
              <div class="row"><span class="k">拥有闸门</span><span class="v">{{ centerGatesText(selectedElement.key) }}</span></div>
              <div class="row"><span class="k">完整通道</span><span class="v">{{ centerChannels(selectedElement.key).length }} 条</span></div>
              <div class="row"><span class="k">悬挂闸门</span><span class="v">{{ centerHanging(selectedElement.key).length }} 个</span></div>
              <div class="section-heading">闸门激活情况</div>
              <div v-for="row in centerGateRows(selectedElement.key)" :key="row.gate" class="row" :style="{ opacity: row.active ? 1 : 0.4 }">
                <span class="k">闸门 {{ row.gate }}</span><span class="v">{{ row.text }}</span>
              </div>
              <div class="section-heading">参与的完整通道</div>
              <template v-if="centerChannels(selectedElement.key).length">
                <div v-for="channel in centerChannels(selectedElement.key)" :key="`${channel.a}-${channel.b}`" class="row">
                  <span class="k">{{ channel.a }}–{{ channel.b }} {{ channel.name }}</span>
                  <span class="v">连接 {{ centerCn(otherCenter(channel, selectedElement.key)) }}<br><span class="dim">{{ channel.theme }}</span></span>
                </div>
              </template>
              <div v-else class="empty-hint">未参与任何完整通道</div>
              <div class="section-heading">悬挂闸门详情</div>
              <template v-if="centerHanging(selectedElement.key).length">
                <div v-for="hanging in centerHanging(selectedElement.key)" :key="`hanging-${hanging.gate}`" class="row">
                  <span class="k">闸门 {{ hanging.gate }}</span>
                  <span class="v">悬挂中，缺少伙伴 {{ hanging.partners.join(' / ') }}</span>
                </div>
              </template>
              <div v-else class="empty-hint">无悬挂闸门</div>
            </section>

            <section v-if="elementOpen && selectedElement?.kind === 'gate'" class="tab-panel active">
              <div class="dp-title-row">
                <span class="dp-planet-name" style="color:var(--gold)">闸门 {{ selectedElement.gate }}</span>
                <span class="tag" :style="gateCenterTagStyle(selectedElement.gate)">{{ centerCn(gateCenter(selectedElement.gate)) }}</span>
                <span :class="gateStatusClass(selectedElement.gate)">{{ gateStatusCn(selectedElement.gate) }}</span>
              </div>
              <div class="section-heading">所属中心</div>
              <div class="row"><span class="k">中心</span><span class="v">{{ centerCn(gateCenter(selectedElement.gate)) }} · {{ COSMOS_CENTERS[gateCenter(selectedElement.gate)]?.theme }}</span></div>
              <div class="section-heading">激活详情</div>
              <template v-if="gateActivations(selectedElement.gate, 'personality').length">
                <div v-for="activation in gateActivations(selectedElement.gate, 'personality')" :key="`p-${activation.body}`" class="row">
                  <span class="k">人格侧 · {{ bodyCn(activation.body) }}</span>
                  <span class="v">{{ activation.line }}爻 · 色{{ activation.color }} 调{{ activation.tone }} 基{{ activation.base }}</span>
                </div>
              </template>
              <div v-else class="empty-hint">人格侧未激活</div>
              <template v-if="gateActivations(selectedElement.gate, 'design').length">
                <div v-for="activation in gateActivations(selectedElement.gate, 'design')" :key="`d-${activation.body}`" class="row">
                  <span class="k">设计侧 · {{ bodyCn(activation.body) }}</span>
                  <span class="v">{{ activation.line }}爻 · 色{{ activation.color }} 调{{ activation.tone }} 基{{ activation.base }}</span>
                </div>
              </template>
              <div v-else class="empty-hint">设计侧未激活</div>
              <div class="section-heading">关联通道</div>
              <template v-if="gateChannels(selectedElement.gate).length">
                <div v-for="channel in gateChannels(selectedElement.gate)" :key="`gc-${channel.a}-${channel.b}`" class="row" :style="{ opacity: isChannelComplete(channel) ? 1 : 0.5 }">
                  <span class="k">{{ channel.a }}–{{ channel.b }} {{ channel.name }}</span>
                  <span class="v">伙伴闸门 {{ channel.a === selectedElement.gate ? channel.b : channel.a }} <span v-if="isChannelComplete(channel)" class="tag gold">完整</span></span>
                </div>
              </template>
              <div v-else class="empty-hint">没有关联通道</div>
            </section>

            <section v-if="elementOpen && selectedElement?.kind === 'genekey'" class="tab-panel active">
              <div class="dp-title-row">
                <span class="dp-planet-name" :style="{ color: geneColorCss(selectedElement.index) }">{{ selectedGeneKey.name }}</span>
                <span class="dp-planet-en">基因钥匙 {{ selectedGeneKey.key }}</span>
                <span class="tag" :style="{ background: `${geneColorCss(selectedElement.index)}22`, color: geneColorCss(selectedElement.index) }">{{ selectedGeneKey.stage }}</span>
              </div>
              <div class="section-heading">频率</div>
              <div class="row"><span class="k">阴影 → 天赋 → 悉地</span><span class="v">通过内观觉察阴影，逐步转化至天赋，最终抵达悉地</span></div>
              <div class="row"><span class="k">编程伙伴</span><span class="v">基因钥匙 {{ selectedGeneKey.partner }}（对宫互补）</span></div>
              <div class="row"><span class="k">对应闸门</span><span class="v">闸门 {{ selectedGeneKey.key }} · {{ centerCn(gateCenter(selectedGeneKey.key)) }}</span></div>
              <div class="section-heading">对应闸门 {{ selectedGeneKey.key }} 的激活</div>
              <template v-if="gateActivations(selectedGeneKey.key, 'personality').length || gateActivations(selectedGeneKey.key, 'design').length">
                <div v-for="activation in [...gateActivations(selectedGeneKey.key, 'personality'), ...gateActivations(selectedGeneKey.key, 'design')]" :key="`${activation.stream}-${activation.body}`" class="row">
                  <span class="k">{{ activation.stream === 'personality' ? '人格侧' : '设计侧' }} · {{ bodyCn(activation.body) }}</span>
                  <span class="v">{{ activation.line }}爻 · 色{{ activation.color }} 调{{ activation.tone }} 基{{ activation.base }}</span>
                </div>
              </template>
              <div v-else class="empty-hint">该闸门未在出生活化盘中激活（此基因钥匙来自序列派生，可能不在本命激活集合中）</div>
            </section>
        </div>
      </div>
    </div>

    <div id="astroModal" class="detail-drawer" :class="{ show: modalOpen }" :aria-hidden="!modalOpen">
      <div class="drawer-backdrop" @click="closeModal" />
      <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="人类图详情">
        <div class="modal-header">
          <div class="modal-title">✦ 人类图详情 · {{ tabLabels[activeTab] }}</div>
          <button class="modal-close" type="button" aria-label="关闭" @click="closeModal">×</button>
        </div>

        <div class="drawer-layout">
        <nav class="drawer-nav">
            <button type="button" :class="{ active: activeTab === 'overview' }" @click="switchTab('overview')">总览</button>
            <button type="button" :class="{ active: activeTab === 'bodygraph' }" @click="switchTab('bodygraph')">九中心人体图</button>
            <button type="button" :class="{ active: activeTab === 'channels' }" @click="switchTab('channels')">36 通道与中心</button>
            <button type="button" :class="{ active: activeTab === 'activations' }" @click="switchTab('activations')">26 激活点</button>
            <button type="button" :class="{ active: activeTab === 'genekeys' }" @click="switchTab('genekeys')">基因钥匙</button>
            <button type="button" :class="{ active: activeTab === 'astrology' }" @click="switchTab('astrology')">占星参照</button>
            <button type="button" :class="{ active: activeTab === 'method' }" @click="switchTab('method')">计算依据</button>
        </nav>

        <div ref="panelsRef" class="drawer-panels">

            <section v-if="activeTab === 'overview'" class="tab-panel active">
              <div class="section-heading">人类图类型</div>
              <div class="type-name">{{ typeInfo.cn }}</div>
              <div class="type-en">{{ typeInfo.typeKey }}</div>
              <div class="row"><span class="k">策略</span><span class="v">{{ typeInfo.strategy }}</span></div>
              <div class="row"><span class="k">内在权威</span><span class="v">{{ authorityCn(result.summary.authority) }}</span></div>
              <div class="row"><span class="k">人生角色</span><span class="v">{{ result.summary.profile }} <span class="tag gold">{{ profileInfo }}</span></span></div>
              <div class="row"><span class="k">定义</span><span class="v">{{ definitionText }}</span></div>
              <div class="row"><span class="k">轮回交叉</span><span class="v">{{ cosmos.crossGates.join(' · ') }}</span></div>
              <div class="section-heading">中心状态（由完整通道决定）</div>
              <div class="row"><span class="k">已定义</span><span class="v">{{ centersByStatus('defined') || '无' }}</span></div>
              <div class="row"><span class="k">未定义（有悬挂闸门）</span><span class="v">{{ centersByStatus('undefined') || '无' }}</span></div>
              <div class="row"><span class="k">完全开放</span><span class="v">{{ centersByStatus('open') || '无' }}</span></div>
              <div class="section-heading">通道与闸门</div>
              <div class="row"><span class="k">完整通道</span><span class="v">{{ cosmos.definedChannels.length }} 条</span></div>
              <div class="row"><span class="k">激活闸门</span><span class="v">{{ cosmos.activatedGates.size }} 个</span></div>
              <div class="row"><span class="k">悬挂闸门</span><span class="v">{{ cosmos.hangingGates.length }} 个（只激活一端，不定义中心）</span></div>
              <div class="section-heading">关键词</div>
              <div class="keywords">
                <span class="tag gold">{{ typeInfo.signature }}（签名）</span>
                <span class="tag rose">{{ typeInfo.notSelf }}（非自己）</span>
                <span class="tag violet">{{ authorityCn(result.summary.authority) }}</span>
                <span class="tag">{{ profileInfo }}</span>
              </div>
            </section>

            <section v-if="activeTab === 'bodygraph'" class="tab-panel active">
              <div class="section-heading">九大能量中心状态</div>
              <div v-for="center in Object.values(COSMOS_CENTERS)" :key="center.key" class="row">
                <span class="k"><span class="center-chip" :class="centerChipClass(center.key)">{{ center.cn }}</span></span>
                <span class="v small">
                  {{ center.theme }} · 闸门 {{ center.gates.join(', ') }}<br>
                  <span class="dim">{{ centerStatusLong(center.key) }}</span>
                </span>
              </div>
              <div class="empty-hint left">提示：在 3D 星盘上点击任意中心方块，即可查看该中心的专属详情。</div>
            </section>

            <section v-if="activeTab === 'channels'" class="tab-panel active">
              <div class="section-heading">36 条通道 · 两端闸门与连接中心</div>
              <div class="empty-hint left compact">每条通道连接两个特定中心。只有两端闸门都被激活，通道才完整，两端中心才会同时被定义。</div>
              <div v-for="channel in COSMOS_CHANNEL_LIST" :key="`${channel.a}-${channel.b}`" class="row" :style="{ opacity: isChannelComplete(channel) ? 1 : 0.4 }">
                <span class="k" :style="{ color: isChannelComplete(channel) ? 'var(--gold)' : 'var(--dim)' }">
                  {{ channel.a }}–{{ channel.b }} {{ channel.name }}
                  <span v-if="isChannelComplete(channel)" class="tag gold">完整</span>
                </span>
                <span class="v small">{{ centerCn(channel.centers[0]) }} ↔ {{ centerCn(channel.centers[1]) }}<br><span class="dim">{{ channel.theme }}</span></span>
              </div>
            </section>

            <section v-if="activeTab === 'activations'" class="tab-panel active">
              <div class="section-heading">26 个激活点</div>
              <div class="empty-hint left compact">黑色为人格侧，红色为设计侧。每个激活点包含闸门、爻、颜色、调、基，以及该闸门所属中心。</div>
              <div v-for="side in activationSides" :key="side.key" class="activation-side">
                <h4 :class="side.key">● {{ side.label }}</h4>
                <div v-for="activation in side.items" :key="activation.body" class="row">
                  <span class="k">{{ bodyCn(activation.body) }}</span>
                  <span class="v small">
                    {{ lonToSign(activation.longitude).cn }} {{ lonToSign(activation.longitude).deg.toFixed(2) }}° · {{ centerCn(gateCenter(activation.gate)) }}
                    <span class="tag gold">{{ activation.gate }}.{{ activation.line }}</span>
                    <span class="tag">色{{ activation.color }} 调{{ activation.tone }} 基{{ activation.base }}</span>
                  </span>
                </div>
              </div>
            </section>

            <section v-if="activeTab === 'genekeys'" class="tab-panel active">
              <div class="section-heading">13 个全息基因球体</div>
              <div class="empty-hint left compact">基因钥匙是易经 64 卦与人类图闸门的深层扩展。点击 3D 场景中的任意球体，可查看该基因钥匙详情。</div>
              <template v-for="stage in ['激活序列', '金星序列', '珍珠序列']" :key="stage">
                <div class="section-heading small-heading">{{ stage }}</div>
                <div v-for="geneKey in geneKeysByStage(stage)" :key="`${stage}-${geneKey.name}`" class="gene-sphere">
                  <div class="gs-num" :style="{ color: geneStageColor(stage) }">{{ geneKey.key }}</div>
                  <div class="gs-body">
                    <div class="gs-name">{{ geneKey.name }} · 基因钥匙 {{ geneKey.key }}</div>
                    <div class="gs-freq">阴影 → 天赋 → 悉地 · 编程伙伴 <b>{{ geneKey.partner }}</b></div>
                  </div>
                </div>
              </template>
            </section>

            <section v-if="activeTab === 'astrology'" class="tab-panel active">
              <template v-if="result.astrology">
                <div class="section-heading">四轴</div>
                <div v-for="angle in result.astrology.angles" :key="angle.key" class="row">
                  <span class="k">{{ COSMOS_ANGLE_CN[angle.key] || angle.key }}</span>
                  <span class="v">{{ signCn(angle.sign) }} {{ angle.degInSign.toFixed(2) }}°</span>
                </div>
                <div class="section-heading">出生地解析</div>
                <div class="row"><span class="k">地点</span><span class="v">{{ result.astrology.location.name }}</span></div>
                <div class="row"><span class="k">坐标</span><span class="v">{{ result.astrology.location.lat.toFixed(4) }}°, {{ result.astrology.location.lng.toFixed(4) }}°</span></div>
                <div class="row"><span class="k">时区</span><span class="v">{{ result.input.timezone }}</span></div>
                <div class="row"><span class="k">出生时刻</span><span class="v">{{ result.input.birthDate }} {{ result.input.birthTime }}</span></div>
                <div class="section-heading">十二宫（{{ houseSystemCn }}）</div>
                <div v-for="house in result.astrology.houses" :key="house.house" class="row">
                  <span class="k">第 {{ house.house }} 宫 · {{ signCn(house.sign) }}</span>
                  <span class="v small">{{ house.degInSign.toFixed(1) }}° {{ planetsInHouse(house.house).length ? '· ' + planetsInHouse(house.house).join('、') : '' }}</span>
                </div>
              </template>
              <div v-else class="empty-hint">未提供可解析出生坐标，仅能生成人类图核心结构。</div>
            </section>

            <section v-if="activeTab === 'method'" class="tab-panel active">
              <div class="section-heading">计算引擎</div>
              <div class="row"><span class="k">天文星历</span><span class="v">{{ result.methodology.ephemeris }}</span></div>
              <div class="row"><span class="k">黄道</span><span class="v">回归黄道（Tropical）</span></div>
              <div class="row"><span class="k">宫位制</span><span class="v">{{ houseSystemCn }}</span></div>
              <div class="row"><span class="k">节点</span><span class="v">astronomy-engine 真实交点</span></div>
              <div class="row"><span class="k">设计侧</span><span class="v">{{ result.methodology.designMoment }}</span></div>
              <div class="section-heading">闸门映射</div>
              <div class="row"><span class="k">闸门轮起点</span><span class="v">41 号闸门 @ 302°</span></div>
              <div class="row"><span class="k">每闸宽度</span><span class="v">5.625°</span></div>
              <div class="row"><span class="k">每爻宽度</span><span class="v">0.9375°</span></div>
              <div class="section-heading">中心定义规则</div>
              <div class="empty-hint left">一个中心被定义，当且仅当它至少参与一条完整通道（两端闸门均被激活，无论来自人格侧还是设计侧）。有激活闸门但没有完整通道的中心是“未定义”；没有任何激活闸门的中心是“完全开放”。悬挂闸门只带来闸门特质，不定义中心。</div>
              <div class="section-heading">关键时间点</div>
              <div class="row"><span class="k">人格侧</span><span class="v">{{ result.input.birthDate }}</span></div>
              <div class="row"><span class="k">设计侧</span><span class="v">{{ result.input.designUtc.slice(0, 10) }}</span></div>
              <div class="section-heading">隐私边界</div>
              <div class="empty-hint left">排盘按请求即时计算，出生日期、时间、地点与坐标不会写入数据库或服务器档案。</div>
              <div class="section-heading">免责声明</div>
              <div class="empty-hint left">人类图是一种象征性的决策模型，不是医疗、法律、财务或心理诊断工具。</div>
            </section>
        </div>
        </div>
      </aside>
    </div>

    <Transition name="loading-fade">
      <div v-if="loading" id="loading" class="loading">
        <div class="ring" />
        <p>正在计算人类图……</p>
      </div>
    </Transition>
    <div id="tooltip" ref="tooltipRef" class="tooltip" v-html="tooltipHtml" />
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type { HumanDesignActivation, HumanDesignChartResult } from '~~/server/utils/tools/human-design'
import {
  COSMOS_ANGLE_CN,
  COSMOS_BODIES,
  COSMOS_CENTERS,
  COSMOS_CHANNEL_LIST,
  COSMOS_DEFINITION_INFO,
  COSMOS_GATE_41_START,
  COSMOS_GATE_ARC,
  COSMOS_GATE_ORDER,
  COSMOS_PROFILE_INFO,
  COSMOS_SIGN_CN,
  COSMOS_TYPE_INFO,
  buildCosmosData,
  lonToSign,
  norm360,
} from '~~/app/utils/human-design-cosmos'

const props = defineProps<{ result: HumanDesignChartResult }>()
const emit = defineEmits<{ retry: [] }>()
const localePath = useLocalePath()

const rootRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLCanvasElement | null>(null)
const panelsRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const elementPopoverRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const modalOpen = ref(false)
const elementOpen = ref(false)
const activeTab = ref<'overview' | 'bodygraph' | 'channels' | 'activations' | 'genekeys' | 'astrology' | 'method'>('overview')
const viewMode = ref<'bodygraph' | 'gates' | 'genekeys'>('bodygraph')
const tooltipHtml = ref('')

type SelectedElement =
  | { kind: 'center', key: string }
  | { kind: 'gate', gate: number }
  | { kind: 'genekey', index: number }

const selectedElement = ref<SelectedElement | null>(null)
const tabLabels = {
  overview: '总览',
  bodygraph: '九中心人体图',
  channels: '36 通道与中心',
  activations: '26 激活点',
  genekeys: '基因钥匙',
  astrology: '占星参照',
  method: '计算依据',
} as const
const elementLabels = { center: '中心', gate: '闸门', genekey: '基因钥匙' } as const

const cosmos = computed(() => buildCosmosData(props.result))
const typeInfo = computed(() => COSMOS_TYPE_INFO[props.result.summary.type])
const profileInfo = computed(() => COSMOS_PROFILE_INFO[props.result.summary.profile] ?? '')
const definitionText = computed(() => COSMOS_DEFINITION_INFO[props.result.summary.definition])
const houseSystemCn = computed(() => {
  const system = props.result.astrology?.houseSystem ?? props.result.methodology.astrologyHouseSystem
  if (system === 'equal') return '等宫制（Equal House）'
  if (system === 'whole') return '整宫制（Whole Sign）'
  return 'Placidus 宫位制'
})
const birthLine = computed(() =>
  `${props.result.input.locationName} · ${props.result.input.birthDate} ${props.result.input.birthTime} · ${typeInfo.value.cn}`)

function authorityCn(authority: typeof props.result.summary.authority) {
  const labels = {
    emotional: '情绪权威',
    sacral: '荐骨权威',
    splenic: '直觉权威',
    ego: '意志力权威',
    'self-projected': '自我投射权威',
    mental: '环境权威',
    lunar: '月亮周期权威',
  } as const
  return labels[authority]
}

const activationSides = computed(() => [
  {
    key: 'black',
    label: '人格侧 · Personality',
    items: COSMOS_BODIES
      .map(body => props.result.activations.find(item => item.stream === 'personality' && item.body === body.key))
      .filter((item): item is HumanDesignActivation => !!item),
  },
  {
    key: 'red',
    label: '设计侧 · Design',
    items: COSMOS_BODIES
      .map(body => props.result.activations.find(item => item.stream === 'design' && item.body === body.key))
      .filter((item): item is HumanDesignActivation => !!item),
  },
])

function signCn(sign: string) {
  return COSMOS_SIGN_CN[sign] ?? sign
}
function bodyCn(key: string) {
  return COSMOS_BODIES.find(body => body.key === key)?.cn ?? key
}
function centerCn(key: string) {
  return COSMOS_CENTERS[key]?.cn ?? key
}
function gateCenter(gate: number) {
  return Object.values(COSMOS_CENTERS).find(center => center.gates.includes(gate))?.key ?? ''
}
function isChannelComplete(channel: typeof COSMOS_CHANNEL_LIST[number]) {
  return cosmos.value.definedChannels.some(item => item.a === channel.a && item.b === channel.b)
}
function gateActivations(gate: number, stream: 'personality' | 'design') {
  return props.result.activations.filter(item => item.gate === gate && item.stream === stream)
}
function gateChannels(gate: number) {
  return COSMOS_CHANNEL_LIST.filter(channel => channel.a === gate || channel.b === gate)
}
function otherCenter(channel: typeof COSMOS_CHANNEL_LIST[number], center: string) {
  return channel.centers.find(item => item !== center) ?? ''
}
function centerChannels(center: string) {
  return cosmos.value.definedChannels.filter(channel => channel.centers.includes(center))
}
function centerHanging(center: string) {
  return cosmos.value.hangingGates.filter(item => item.center === center)
}
function centerStatusCn(key: string) {
  const status = cosmos.value.centerStatus[key]
  return status === 'defined' ? '已定义' : status === 'undefined' ? '未定义（有激活闸门）' : '完全开放'
}
function centerStatusLong(key: string) {
  const status = cosmos.value.centerStatus[key]
  return status === 'defined' ? '已定义' : status === 'undefined' ? '未定义（有激活闸门，但无完整通道）' : '完全开放'
}
function centerChipClass(key: string) {
  const status = cosmos.value.centerStatus[key]
  return status === 'defined' ? 'def' : status === 'undefined' ? 'undef' : 'open'
}
function centersByStatus(status: 'defined' | 'undefined' | 'open') {
  return Object.values(COSMOS_CENTERS)
    .filter(center => cosmos.value.centerStatus[center.key] === status)
    .map(center => center.cn)
    .join('、')
}
function centerGatesText(key: string) {
  const gates = COSMOS_CENTERS[key]?.gates ?? []
  return `${gates.length} 个（${gates.join(', ')}）`
}
function centerDotStyle(key: string) {
  return { background: centerHex(key), boxShadow: `0 0 16px ${centerHex(key)}` }
}
function centerHex(key: string) {
  return `#${new THREE.Color(COSMOS_CENTERS[key]?.color ?? 0x445566).getHexString()}`
}
function centerGateRows(center: string) {
  return (COSMOS_CENTERS[center]?.gates ?? []).map((gate) => {
    const personality = gateActivations(gate, 'personality')
    const design = gateActivations(gate, 'design')
    const parts: string[] = []
    if (personality.length) parts.push(`人格侧（${personality.map(item => `${bodyCn(item.body)} ${item.line}爻`).join('、')}）`)
    if (design.length) parts.push(`设计侧（${design.map(item => `${bodyCn(item.body)} ${item.line}爻`).join('、')}）`)
    return { gate, active: !!(personality.length || design.length), text: parts.join(' / ') || '未激活' }
  })
}
function gateCenterTagStyle(gate: number) {
  const color = centerHex(gateCenter(gate))
  return { background: `${color}30`, color }
}
function gateStatusCn(gate: number) {
  const active = props.result.activations.some(item => item.gate === gate)
  if (!active) return '未激活'
  return cosmos.value.hangingGates.some(item => item.gate === gate) ? '悬挂激活' : '完整激活'
}
function gateStatusClass(gate: number) {
  const active = props.result.activations.some(item => item.gate === gate)
  if (!active) return 'tag'
  return cosmos.value.hangingGates.some(item => item.gate === gate) ? 'tag green' : 'tag gold'
}
const selectedGeneKey = computed(() => {
  const index = selectedElement.value?.kind === 'genekey' ? selectedElement.value.index : 0
  return cosmos.value.geneKeys[index] ?? cosmos.value.geneKeys[0]!
})
function geneStageColor(stage: string) {
  return stage === '激活序列' ? 'var(--gold)' : stage === '金星序列' ? 'var(--rose)' : 'var(--green)'
}
function geneColorCss(index: number) {
  return geneStageColor(cosmos.value.geneKeys[index]?.stage ?? '')
}
function geneKeysByStage(stage: string) {
  return cosmos.value.geneKeys.filter(item => item.stage === stage)
}
function planetsInHouse(house: number) {
  const houses = props.result.astrology?.houses ?? []
  const current = houses.find(item => item.house === house)
  const next = houses.find(item => item.house === house % 12 + 1)
  if (!current || !next) return []
  return props.result.activations
    .filter((activation) => {
      if (activation.stream !== 'personality' || ['earth', 'north_node', 'south_node'].includes(activation.body)) return false
      const longitude = norm360(activation.longitude)
      const start = norm360(current.longitude)
      const end = norm360(next.longitude)
      return start <= end ? longitude >= start && longitude < end : longitude >= start || longitude < end
    })
    .map(activation => bodyCn(activation.body))
}

function openModal(tab: typeof activeTab.value) {
  modalOpen.value = true
  switchTab(tab)
}
function closeModal() {
  modalOpen.value = false
}
function switchTab(tab: typeof activeTab.value) {
  activeTab.value = tab
  nextTick(() => {
    if (panelsRef.value) panelsRef.value.scrollTop = 0
  })
}

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let composer: EffectComposer | null = null
let resizeObserver: ResizeObserver | null = null
let animationId = 0
let clock: THREE.Clock | null = null
let elapsed = 0
let pulseCenter: string | null = null
let pulseGeneKey: number | null = null
let pulseGate: number | null = null
const mainGroup = new THREE.Group()
const bodygraphGroup = new THREE.Group()
const gateWheelGroup = new THREE.Group()
const geneKeyGroup = new THREE.Group()
const centerMeshes: Record<string, THREE.Mesh> = {}
const gateMeshes: Record<number, THREE.Mesh> = {}
const gateHitMeshes: Record<number, THREE.Mesh> = {}
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let pointerDown: { x: number, y: number, time: number } | null = null

function makeSprite(text: string, color: string, scale = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.font = '600 44px "PingFang SC","Microsoft YaHei",sans-serif'
    context.fillStyle = color
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 128, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }))
  sprite.scale.set(scale * 2.2, scale * 1.1, 1)
  return sprite
}

function buildStarfield() {
  const count = 4000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const radius = 60 + Math.random() * 80
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.cos(phi) * 0.7
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    const color = new THREE.Color().setHSL(0.58 + Math.random() * 0.1, 0.45, 0.5 + Math.random() * 0.4)
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  scene?.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })))
}

function buildBodygraph() {
  const grid = new THREE.GridHelper(20, 20, 0x1a2233, 0x0d1220)
  grid.position.y = -6.8
  bodygraphGroup.add(grid)

  for (const [key, center] of Object.entries(COSMOS_CENTERS)) {
    const status = cosmos.value.centerStatus[key]
    const color = status === 'defined' ? center.color : 0x2a2f3e
    const geometry = new THREE.BoxGeometry(center.layout.w, center.layout.h, 0.6)
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: status === 'defined' ? 0.45 : 0.05,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: status === 'defined' ? 0.92 : status === 'undefined' ? 0.35 : 0.22,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(center.layout.x, center.layout.y, 0)
    mesh.userData = { type: 'center', centerKey: key }
    bodygraphGroup.add(mesh)
    centerMeshes[key] = mesh

    const label = makeSprite(center.cn, status === 'defined' ? '#e8b860' : '#5a6278', 0.9)
    label.position.set(center.layout.x, center.layout.y, 0.5)
    bodygraphGroup.add(label)

    center.gates.forEach((gate, index) => {
      const x = center.layout.x - center.layout.w / 2 + 0.35 + (index % 5) * 0.42
      const y = center.layout.y - center.layout.h / 2 - 0.28 - Math.floor(index / 5) * 0.34
      const active = cosmos.value.activatedGates.has(gate)
      const hanging = cosmos.value.hangingGates.some(item => item.gate === gate)
      const sprite = makeSprite(String(gate), active ? (hanging ? '#5ee7a8' : '#e8b860') : '#3a4155', 0.38)
      sprite.position.set(x, y, 0.45)
      bodygraphGroup.add(sprite)
    })
  }

  for (const channel of cosmos.value.definedChannels) {
    const left = COSMOS_CENTERS[channel.centers[0]]?.layout
    const right = COSMOS_CENTERS[channel.centers[1]]?.layout
    if (!left || !right) continue
    const start = new THREE.Vector3(left.x, left.y, 0)
    const end = new THREE.Vector3(right.x, right.y, 0)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.z += 1 + Math.random() * 0.4
    const points = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(40)
    bodygraphGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0xe8b860, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    ))
  }

  for (const hanging of cosmos.value.hangingGates) {
    const layout = COSMOS_CENTERS[hanging.center]?.layout
    if (!layout) continue
    const start = new THREE.Vector3(layout.x, layout.y, 0)
    const end = start.clone().add(new THREE.Vector3(0, 0, 1.6))
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([start, end]),
      new THREE.LineDashedMaterial({ color: 0x5ee7a8, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.5 }),
    )
    line.computeLineDistances()
    bodygraphGroup.add(line)
  }
}

function buildGateWheel() {
  const radius = 8.5
  const outer: THREE.Vector3[] = []
  const inner: THREE.Vector3[] = []
  for (let index = 0; index <= 128; index += 1) {
    const angle = index / 128 * Math.PI * 2
    outer.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
    inner.push(new THREE.Vector3(Math.cos(angle) * (radius - 1.2), Math.sin(angle) * (radius - 1.2), 0))
  }
  gateWheelGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outer), new THREE.LineBasicMaterial({ color: 0x334455, transparent: true, opacity: 0.5 })))
  gateWheelGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(inner), new THREE.LineBasicMaterial({ color: 0x334455, transparent: true, opacity: 0.3 })))

  for (let index = 0; index < 64; index += 1) {
    const gate = COSMOS_GATE_ORDER[index]!
    const startAngle = (COSMOS_GATE_41_START + index * COSMOS_GATE_ARC) * Math.PI / 180
    const midAngle = startAngle + COSMOS_GATE_ARC / 2 * Math.PI / 180
    const active = cosmos.value.activatedGates.has(gate)
    const color = COSMOS_CENTERS[gateCenter(gate)]?.color ?? 0x445566
    gateWheelGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(startAngle) * (radius - 1.2), Math.sin(startAngle) * (radius - 1.2), 0),
        new THREE.Vector3(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius, 0),
      ]),
      new THREE.LineBasicMaterial({ color: active ? color : 0x2a3345, transparent: true, opacity: active ? 0.9 : 0.35 }),
    ))

    const sprite = makeSprite(String(gate), active ? '#e8b860' : '#4a5268', active ? 0.7 : 0.5)
    sprite.position.set(Math.cos(midAngle) * (radius - 0.55), Math.sin(midAngle) * (radius - 0.55), 0.1)
    gateWheelGroup.add(sprite)

    if (active) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 10),
        new THREE.MeshBasicMaterial({ color }),
      )
      dot.position.set(Math.cos(midAngle) * (radius - 0.15), Math.sin(midAngle) * (radius - 0.15), 0.05)
      dot.userData = { type: 'gate', gate }
      gateWheelGroup.add(dot)
      gateMeshes[gate] = dot
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 10),
        new THREE.MeshBasicMaterial({ visible: false }),
      )
      hitMesh.position.copy(dot.position)
      hitMesh.userData = { type: 'gate', gate }
      gateWheelGroup.add(hitMesh)
      gateHitMeshes[gate] = hitMesh
    }
  }
  gateWheelGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe8b860 })))
}

function buildGeneKeys() {
  const radius = 7
  const count = cosmos.value.geneKeys.length
  cosmos.value.geneKeys.forEach((geneKey, index) => {
    const angle = index / count * Math.PI * 2 - Math.PI / 2
    const y = Math.sin(angle) * radius * 0.72
    const x = Math.cos(angle) * radius * 0.9
    const z = Math.cos(angle * 2) * 1.5
    const color = geneKey.stage === '激活序列' ? 0xe8b860 : geneKey.stage === '金星序列' ? 0xff6b9d : 0x5ee7a8
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 20),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.4 }),
    )
    sphere.position.set(x, y, z)
    sphere.userData = { type: 'genekey', index }
    geneKeyGroup.add(sphere)

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    halo.position.copy(sphere.position)
    geneKeyGroup.add(halo)

    const label = makeSprite(`${geneKey.name} ${geneKey.key}`, '#d8d4c8', 0.5)
    label.position.set(x, y - 0.75, z)
    geneKeyGroup.add(label)

    if (index > 0) {
      const previousAngle = (index - 1) / count * Math.PI * 2 - Math.PI / 2
      geneKeyGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(previousAngle) * radius * 0.9, Math.sin(previousAngle) * radius * 0.72, Math.cos(previousAngle * 2) * 1.5),
          new THREE.Vector3(x, y, z),
        ]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 }),
      ))
    }
  })
  geneKeyGroup.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.6, 1),
    new THREE.MeshStandardMaterial({ color: 0xe8b860, emissive: 0xe8b860, emissiveIntensity: 0.7, roughness: 0.2, metalness: 0.6 }),
  ))
}

function setViewMode(mode: typeof viewMode.value) {
  viewMode.value = mode
  bodygraphGroup.visible = mode === 'bodygraph'
  gateWheelGroup.visible = mode === 'gates'
  geneKeyGroup.visible = mode === 'genekeys'
}

function resetView() {
  if (!camera || !controls) return
  controls.autoRotate = true
  controls.target.set(0, 0.5, 0)
  camera.position.set(0, 2, 24)
}

function normalizedPointer(event: PointerEvent) {
  const rect = stageRef.value?.getBoundingClientRect()
  if (!rect) return
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
}

function intersectCenter() {
  if (!bodygraphGroup.visible) return undefined
  return raycaster.intersectObjects(Object.values(centerMeshes), false)[0]
}
function intersectGeneKey() {
  if (!geneKeyGroup.visible) return undefined
  return raycaster.intersectObjects(geneKeyGroup.children.filter(item => item.userData.type === 'genekey'), false)[0]
}
function intersectGate() {
  if (!gateWheelGroup.visible) return undefined
  return raycaster.intersectObjects(Object.values(gateHitMeshes), false)[0]
}

function handlePointerMove(event: PointerEvent) {
  const canvas = stageRef.value
  if (!canvas || !camera) return
  if (modalOpen.value || elementOpen.value) {
    hideTooltip()
    return
  }
  normalizedPointer(event)
  raycaster.setFromCamera(pointer, camera)
  const centerHit = intersectCenter()
  if (centerHit) {
    const key = centerHit.object.userData.centerKey
    const center = COSMOS_CENTERS[key]
    if (!center) return
    tooltipHtml.value = `<b style="color:${centerHex(key)}">${center.cn}</b>　${center.theme}　${centerStatusCn(key)}　<span class="tooltip-action">点击查看详情</span>`
    canvas.style.cursor = 'pointer'
    positionTooltip(event)
    return
  }
  const geneHit = intersectGeneKey()
  if (geneHit) {
    const geneKey = cosmos.value.geneKeys[geneHit.object.userData.index]
    if (!geneKey) return
    tooltipHtml.value = `<b style="color:#e8b860">${geneKey.name}</b>　基因钥匙 ${geneKey.key}　伙伴 ${geneKey.partner}　<span class="tooltip-action">点击查看详情</span>`
    canvas.style.cursor = 'pointer'
    positionTooltip(event)
    return
  }
  if (viewMode.value === 'gates') {
    const gateHit = intersectGate()
    if (gateHit) {
      const gate = gateHit.object.userData.gate
      tooltipHtml.value = `闸门 <b style="color:#e8b860">${gate}</b>　${centerCn(gateCenter(gate))}　<span class="tooltip-action">点击查看详情</span>`
      canvas.style.cursor = 'pointer'
      positionTooltip(event)
      return
    }
  }
  hideTooltip()
  canvas.style.cursor = 'grab'
}

function positionTooltip(event: PointerEvent) {
  const tooltip = tooltipRef.value
  if (!tooltip) return
  tooltip.style.display = 'block'
  tooltip.style.left = `${event.clientX + 14}px`
  tooltip.style.top = `${event.clientY - 10}px`
}

function handlePointerLeave() {
  hideTooltip()
}

function hideTooltip() {
  tooltipHtml.value = ''
  if (tooltipRef.value) tooltipRef.value.style.display = 'none'
}

function handlePointerDown(event: PointerEvent) {
  pointerDown = { x: event.clientX, y: event.clientY, time: Date.now() }
}

function handlePointerUp(event: PointerEvent) {
  if (!pointerDown || !camera) return
  const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
  pointerDown = null
  if (moved > 8) return
  normalizedPointer(event)
  raycaster.setFromCamera(pointer, camera)
  const centerHit = intersectCenter()
  if (centerHit) {
    showElementDetail({ kind: 'center', key: centerHit.object.userData.centerKey })
    return
  }
  const geneHit = intersectGeneKey()
  if (geneHit) {
    showElementDetail({ kind: 'genekey', index: geneHit.object.userData.index })
    return
  }
  if (viewMode.value === 'gates') {
    const gateHit = intersectGate()
    if (gateHit) showElementDetail({ kind: 'gate', gate: gateHit.object.userData.gate })
  }
}

function showElementDetail(element: SelectedElement) {
  selectedElement.value = element
  pulseCenter = element.kind === 'center' ? element.key : null
  pulseGate = element.kind === 'gate' ? element.gate : null
  pulseGeneKey = element.kind === 'genekey' ? element.index : null
  elementOpen.value = true
  hideTooltip()
}

function handleGlobalPointerDown(event: PointerEvent) {
  if (!elementOpen.value) return
  if (!elementPopoverRef.value?.contains(event.target as Node)) closeElementModal()
}

function closeElementModal() {
  elementOpen.value = false
}

function animate() {
  animationId = requestAnimationFrame(animate)
  const delta = clock?.getDelta() ?? 0.016
  elapsed += 0.006
  Object.entries(centerMeshes).forEach(([key, mesh], index) => {
    const material = mesh.material as THREE.MeshStandardMaterial
    const defined = cosmos.value.centerStatus[key] === 'defined'
    let intensity = (defined ? 0.45 : 0.05) + Math.sin(elapsed * 1.5 + index * 0.8) * 0.08
    if (key === pulseCenter) {
      intensity = 0.95 + Math.sin(elapsed * 4) * 0.4
      mesh.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.06)
    }
    else {
      mesh.scale.setScalar(1)
    }
    material.emissiveIntensity = intensity
    mesh.position.z = Math.sin(elapsed * 1.2 + index) * 0.05
  })

  geneKeyGroup.children.forEach((object, index) => {
    if (object.userData.type !== 'genekey') return
    const pulse = object.userData.index === pulseGeneKey
    object.position.y += Math.sin(elapsed * 1.8 + index) * 0.002
    object.rotation.y += delta * 0.5
    const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial
    material.emissiveIntensity = pulse ? 1 + Math.sin(elapsed * 4) * 0.4 : 0.6
    object.scale.setScalar(pulse ? 1 + Math.sin(elapsed * 3.5) * 0.12 : 1)
  })

  if (viewMode.value === 'gates') {
    Object.entries(gateMeshes).forEach(([gate, dot]) => {
      const pulse = Number(gate) === pulseGate
      dot.scale.setScalar(pulse ? 1.4 + Math.sin(elapsed * 5) * 0.3 : 1)
    })
  }
  gateWheelGroup.rotation.z += delta * 0.05
  controls?.update()
  composer?.render()
}

function resizeRenderer() {
  const root = rootRef.value
  if (!root || !camera || !renderer || !composer) return
  const width = root.clientWidth
  const height = root.clientHeight
  camera.aspect = Math.max(width, 1) / Math.max(height, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
}

function buildScene() {
  const root = rootRef.value
  const canvas = stageRef.value
  if (!root || !canvas) return
  disposeScene()
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x04050c)
  scene.fog = new THREE.FogExp2(0x04050c, 0.015)
  camera = new THREE.PerspectiveCamera(42, Math.max(root.clientWidth, 1) / Math.max(root.clientHeight, 1), 0.1, 300)
  camera.position.set(0, 2, 24)
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(root.clientWidth, root.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.4
  controls.minDistance = 9
  controls.maxDistance = 45
  controls.target.set(0, 0.5, 0)
  scene.add(new THREE.AmbientLight(0x223344, 1))
  const keyLight = new THREE.PointLight(0xe8b860, 120, 70)
  keyLight.position.set(8, 14, 12)
  scene.add(keyLight)
  const rimLight = new THREE.PointLight(0x4fd8ff, 80, 60)
  rimLight.position.set(-14, 4, -10)
  scene.add(rimLight)
  buildStarfield()
  mainGroup.add(bodygraphGroup, gateWheelGroup, geneKeyGroup)
  scene.add(mainGroup)
  buildBodygraph()
  buildGateWheel()
  buildGeneKeys()
  setViewMode('bodygraph')
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(root.clientWidth, root.clientHeight), 0.7, 0.5, 0.85))
  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(root)
  resizeRenderer()
  animate()
}

function disposeScene() {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  resizeObserver = null
  controls?.dispose()
  composer?.dispose()
  scene?.traverse((object) => {
    const mesh = object as THREE.Mesh & { material?: THREE.Material | THREE.Material[] }
    mesh.geometry?.dispose()
    if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose())
    else mesh.material?.dispose()
    const material = mesh.material as THREE.SpriteMaterial | undefined
    if (material && !Array.isArray(material) && 'map' in material) material.map?.dispose()
  })
  renderer?.dispose()
  scene = null
  camera = null
  renderer = null
  controls = null
  composer = null
  Object.keys(centerMeshes).forEach((key) => { delete centerMeshes[key] })
  Object.keys(gateMeshes).forEach((key) => { delete gateMeshes[Number(key)] })
  Object.keys(gateHitMeshes).forEach((key) => { delete gateHitMeshes[Number(key)] })
  mainGroup.clear()
  bodygraphGroup.clear()
  gateWheelGroup.clear()
  geneKeyGroup.clear()
}

async function captureFrame() {
  if (!composer) return null
  composer.render()
  return stageRef.value?.toDataURL('image/png')
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (['INPUT', 'TEXTAREA'].includes(target?.tagName ?? '')) return
  if (event.key === 'Escape') {
    if (elementOpen.value) closeElementModal()
    else if (modalOpen.value) closeModal()
    return
  }
  if (event.key.toLowerCase() === 'd') {
    if (modalOpen.value) closeModal()
    else openModal('overview')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('pointerdown', handleGlobalPointerDown)
  try {
    buildScene()
    window.setTimeout(() => {
      loading.value = false
    }, 500)
  }
  catch {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('pointerdown', handleGlobalPointerDown)
  disposeScene()
})

watch(() => props.result, () => {
  selectedElement.value = null
  elementOpen.value = false
  closeModal()
  nextTick(buildScene)
})
</script>

<style scoped>
.cosmos {
  --bg: #04050c;
  --gold: #e8b860;
  --cyan: #4fd8ff;
  --violet: #a78bfa;
  --rose: #ff6b9d;
  --green: #5ee7a8;
  --panel: rgba(6, 9, 18, .94);
  --border: rgba(232, 184, 96, .22);
  --text: #e8e6df;
  --dim: #7c839c;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 540px;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif;
}

.stage {
  display: block;
  width: 100%;
  height: 100%;
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(4, 5, 12, .8) 100%);
}

.hud {
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hud h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .2em;
  color: var(--gold);
}

.hud .sub {
  font-size: 11px;
  color: var(--dim);
  letter-spacing: .06em;
}

.actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions > * {
  margin: 0 !important;
}

.open-modal,
.project-action {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--gold);
  font-family: inherit;
  font-size: 12px;
  padding: 8px 15px;
  border-radius: 999px;
  cursor: pointer;
  backdrop-filter: blur(18px);
  letter-spacing: .06em;
  text-decoration: none;
  transition: all .25s;
}

.open-modal:hover,
.project-action:hover {
  border-color: var(--gold);
  color: var(--text);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(232, 184, 96, .25);
}

.project-action {
  color: #d4d8e4;
}

.controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 12px;
  backdrop-filter: blur(18px);
  flex-wrap: wrap;
  justify-content: center;
}

.controls button {
  background: none;
  border: 1px solid rgba(255, 255, 255, .08);
  color: var(--dim);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: .2s;
  letter-spacing: .04em;
  font-family: inherit;
}

.controls button:hover {
  color: var(--text);
  border-color: var(--gold);
}

.controls button.on {
  color: var(--bg);
  background: var(--gold);
  border-color: var(--gold);
  font-weight: 600;
}

.detail-drawer {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  visibility: hidden;
}

.detail-drawer.show {
  pointer-events: auto;
  visibility: visible;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 5, 12, .58);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity .24s ease;
}

.detail-drawer.show .drawer-backdrop {
  opacity: 1;
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(520px, 96vw);
  height: 100%;
  background: rgba(6, 9, 18, .97);
  border-left: 1px solid var(--border);
  box-shadow: -20px 0 60px rgba(0, 0, 0, .58);
  transform: translateX(100%);
  transition: transform .28s cubic-bezier(.22, .61, .36, 1);
}

.detail-drawer.show .drawer-panel {
  transform: translateX(0);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--border);
  background: rgba(232, 184, 96, .03);
  flex-shrink: 0;
}

.modal-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .16em;
  color: var(--gold);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  background: none;
  border: 1px solid rgba(255, 255, 255, .08);
  color: var(--dim);
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  line-height: 1;
  transition: .2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--text);
  border-color: var(--gold);
  background: rgba(232, 184, 96, .1);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 118px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 12px 10px;
  border-right: 1px solid var(--border);
  background: rgba(232, 184, 96, .03);
  scrollbar-width: thin;
}

.drawer-nav button {
  width: 100%;
  min-height: 40px;
  background: none;
  border: 1px solid rgba(255, 255, 255, .07);
  color: var(--dim);
  font-family: inherit;
  font-size: 11px;
  padding: 9px 10px;
  border-radius: 8px;
  text-align: left;
  line-height: 1.25;
  cursor: pointer;
  transition: .2s;
  letter-spacing: .02em;
}

.drawer-nav button:hover {
  background: rgba(232, 184, 96, .08);
  color: var(--text);
}

.drawer-nav button.active {
  background: rgba(232, 184, 96, .16);
  border-color: rgba(232, 184, 96, .38);
  color: var(--gold);
  font-weight: 600;
}

.drawer-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.drawer-panels {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px 26px;
  min-width: 0;
}

.element-side-drawer {
  position: absolute;
  top: 76px;
  left: 20px;
  z-index: 130;
  display: none;
  width: min(340px, calc(100vw - 40px));
  max-height: calc(100% - 100px);
}

.element-side-drawer.show {
  display: flex;
}

.element-side-drawer-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: inherit;
  overflow: hidden;
  background: rgba(6, 9, 18, .97);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 18px 46px rgba(0, 0, 0, .58), 0 0 0 1px rgba(232, 184, 96, .07);
  backdrop-filter: blur(14px);
  animation: sideDrawerIn .22s cubic-bezier(.22, .61, .36, 1);
}

@keyframes sideDrawerIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: none; }
}

.element-side-drawer .modal-header {
  padding: 12px 14px;
}

.element-side-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 14px 14px;
  min-height: 0;
}

.element-side-drawer .section-heading {
  margin: 14px 0 7px;
}

.element-side-drawer .row {
  font-size: 12px;
  padding: 6px 0;
}

.tab-panel {
  animation: tabIn .25s ease;
}

@keyframes tabIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, .04);
  gap: 10px;
  align-items: baseline;
}

.row:last-child {
  border-bottom: none;
}

.row .k {
  color: var(--dim);
  flex-shrink: 0;
}

.row .v {
  color: var(--text);
  text-align: right;
  flex: 1;
  max-width: 72%;
}

.row .v.small {
  font-size: 11px;
}

.dim {
  color: var(--dim);
}

.tag {
  display: inline-block;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(79, 216, 255, .12);
  color: var(--cyan);
  margin-left: 4px;
  font-weight: 500;
}

.tag.gold {
  background: rgba(232, 184, 96, .15);
  color: var(--gold);
}

.tag.violet {
  background: rgba(167, 139, 250, .15);
  color: var(--violet);
}

.tag.rose {
  background: rgba(255, 107, 157, .15);
  color: var(--rose);
}

.tag.green {
  background: rgba(94, 231, 168, .15);
  color: var(--green);
}

.section-heading {
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
  margin: 20px 0 10px;
  letter-spacing: .08em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-heading:first-child {
  margin-top: 0;
}

.section-heading::before {
  content: '';
  width: 3px;
  height: 14px;
  background: var(--gold);
  border-radius: 2px;
}

.section-heading.small-heading {
  font-size: 12px;
}

.empty-hint {
  color: var(--dim);
  font-size: 12px;
  padding: 16px;
  text-align: center;
  line-height: 1.7;
}

.empty-hint.left {
  text-align: left;
}

.empty-hint.compact {
  padding: 0 0 12px;
}

.type-name {
  font-size: 28px;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 4px;
}

.type-en {
  font-size: 12px;
  color: var(--dim);
  margin-bottom: 16px;
  letter-spacing: .06em;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.center-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  margin: 3px;
  border: 1px solid rgba(255, 255, 255, .08);
}

.center-chip.def {
  background: rgba(232, 184, 96, .12);
  border-color: rgba(232, 184, 96, .35);
  color: var(--gold);
}

.center-chip.undef {
  background: rgba(255, 255, 255, .02);
  color: var(--dim);
}

.center-chip.open {
  background: rgba(255, 255, 255, .01);
  color: #4a5268;
}

.activation-side {
  margin-bottom: 16px;
}

.activation-side h4 {
  font-size: 11px;
  letter-spacing: .14em;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.activation-side h4.black {
  color: #c9d6ff;
}

.activation-side h4.red {
  color: #ff8fa3;
}

.gene-sphere {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, .02);
  border: 1px solid rgba(255, 255, 255, .04);
}

.gene-sphere .gs-num {
  font-size: 16px;
  font-weight: 700;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.gene-sphere .gs-body {
  flex: 1;
}

.gene-sphere .gs-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.gene-sphere .gs-freq {
  font-size: 10px;
  color: var(--dim);
}

.gene-sphere .gs-freq b {
  font-weight: 500;
}

.dp-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(232, 184, 96, .2);
}

.dp-planet-name {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: .04em;
}

.dp-planet-en {
  font-size: 12px;
  color: var(--dim);
  letter-spacing: .04em;
}

.center-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.loading {
  position: absolute;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  gap: 18px;
  transition: opacity .5s;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity .5s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading .ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(232, 184, 96, .15);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  font-size: 12px;
  letter-spacing: .2em;
  color: var(--dim);
}

.tooltip {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  background: rgba(6, 9, 18, .96);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  color: var(--text);
  display: none;
  backdrop-filter: blur(12px);
  white-space: nowrap;
}

.tooltip-action {
  color: #8a8fa8;
  font-size: 10px;
}

@media (max-width: 900px) {
  .drawer-panel {
    width: min(480px, 100vw);
  }

  .drawer-panels {
    padding: 16px 14px calc(88px + env(safe-area-inset-bottom));
  }

  .drawer-nav {
    width: 88px;
    padding: 10px 8px;
  }

  .drawer-nav button {
    min-height: 44px;
    font-size: 10.5px;
    padding: 9px 8px;
  }

  .element-side-drawer {
    top: auto;
    right: 10px;
    bottom: calc(78px + env(safe-area-inset-bottom));
    left: 10px;
    width: auto;
    max-height: min(56vh, 480px);
  }

  .element-side-drawer-inner {
    animation: bottomDrawerIn .22s cubic-bezier(.22, .61, .36, 1);
  }

  @keyframes bottomDrawerIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }

  .hud {
    top: 12px;
    left: 12px;
  }

  .actions {
    top: 12px;
    right: 12px;
    max-width: calc(100% - 24px);
    flex-wrap: wrap;
    justify-content: flex-end;
    row-gap: 6px;
  }

  .open-modal,
  .project-action {
    min-height: 34px;
    padding: 7px 10px;
    font-size: 11px;
  }

  .modal-header {
    padding: 12px 14px;
  }

  .modal-close {
    width: 36px;
    height: 36px;
  }
}
</style>
