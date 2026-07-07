<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center gap-3 mb-6">
        <div>
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-1 block">{{ $t('ceziBattle.badge') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('ceziBattle.title') }}
          </h1>
        </div>
        <UButton color="warning" variant="soft" size="sm" class="ml-auto" @click="openHall">
          <template #leading>
            <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
          </template>
          {{ $t('ceziBattle.hallTitle') }}
        </UButton>
      </div>

      <div v-if="phase === 'form'" class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <UButton :color="mode === 'name' ? 'warning' : 'neutral'" variant="soft" size="sm" @click="setMode('name')">
            {{ $t('ceziBattle.modeName') }}
          </UButton>
          <UButton :color="mode === 'single' ? 'warning' : 'neutral'" variant="soft" size="sm" @click="setMode('single')">
            {{ $t('ceziBattle.modeSingle') }}
          </UButton>
        </div>
        <p class="text-xs text-[var(--text-faint)]">{{ modeHint }}</p>
        <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[#1c1a17]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.player1') }}</h3>
            </div>
            <input
              v-model="name1"
              type="text"
              class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-center text-2xl tracking-[0.3em] font-serif text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
              :maxlength="mode === 'name' ? 4 : 1"
              @input="refreshPreview(1)"
            >
            <div class="flex flex-wrap gap-2 mt-4 justify-center">
              <div v-for="i in previewSlots" :key="`p1-${i}`" class="text-center">
                <canvas :ref="el => setPreviewRef(el, 1, i - 1)" width="84" height="84" class="bg-[var(--surface-input)] border border-[var(--border-light)] rounded-lg" />
                <div class="text-[10px] text-[var(--text-faint)] mt-1 leading-tight" v-html="previewCap(1, i - 1)" />
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[#b5302a]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.player2') }}</h3>
            </div>
            <input
              v-model="name2"
              type="text"
              class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-center text-2xl tracking-[0.3em] font-serif text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
              :maxlength="mode === 'name' ? 4 : 1"
              @input="refreshPreview(2)"
            >
            <div class="flex flex-wrap gap-2 mt-4 justify-center">
              <div v-for="i in previewSlots" :key="`p2-${i}`" class="text-center">
                <canvas :ref="el => setPreviewRef(el, 2, i - 1)" width="84" height="84" class="bg-[var(--surface-input)] border border-[var(--border-light)] rounded-lg" />
                <div class="text-[10px] text-[var(--text-faint)] mt-1 leading-tight" v-html="previewCap(2, i - 1)" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <UButton color="warning" size="lg" :disabled="!canStart" class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300" @click="startMatch">
            <template #leading>
              <UIcon name="i-heroicons-play" class="w-5 h-5" />
            </template>
            {{ $t('ceziBattle.startBtn') }}
          </UButton>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziBattle.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziBattle.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziBattle.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziBattle.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <div v-if="phase === 'battle' && match" class="space-y-4">
        <div class="flex items-center justify-center gap-3 md:gap-5 text-[var(--text-primary)] font-serif flex-wrap">
          <span class="text-lg md:text-xl" :class="sideTextClass(1)">{{ match.names[0] || $t('ceziBattle.defaultPlayer1') }}</span>
          <div class="flex items-center gap-1.5">
            <span v-for="i in match.rounds" :key="`pip-${i}`" class="inline-block w-2.5 h-2.5 rounded-full border border-[var(--text-faint)]" :class="pipClass(i - 1)" />
          </div>
          <span class="text-xs text-[var(--text-faint)]">{{ $t('ceziBattle.roundLabel', { current: Math.min(roundIndex + 1, totalRounds), total: totalRounds }) }}</span>
          <span class="text-lg md:text-xl" :class="sideTextClass(2)">{{ match.names[1] || $t('ceziBattle.defaultPlayer2') }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-4 items-start">
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4 text-center">
            <div class="text-base font-serif tracking-widest mb-2" :class="sideTextClass(1)">{{ match.names[0] || $t('ceziBattle.defaultPlayer1') }}</div>
            <div class="space-y-1.5 mb-3">
              <div v-for="(ch, i) in match.chars[0]" :key="`a-${i}`" class="flex items-center gap-2 px-2 py-1 rounded-md border text-sm transition-all" :class="teamRowClass(1, i)">
                <span class="text-xl font-serif w-6 text-center" :class="sideTextClass(1)">{{ ch }}</span>
                <span class="text-xs ml-auto">{{ teamRowResult(1, i) }}</span>
              </div>
            </div>
            <canvas ref="sd1" width="172" height="128" class="block mx-auto mb-2 bg-[var(--surface-input)] border border-[var(--border-light)] rounded-lg" />
            <div class="text-xs text-[var(--text-faint)]">
              {{ $t('ceziBattle.integrity', { char: currentCharA, value: integrityA }) }}
            </div>
          </div>

          <div class="flex flex-col items-center">
            <div class="relative w-full max-w-[520px] aspect-square">
              <canvas ref="arena" width="520" height="520" class="w-full h-full rounded-full bg-[radial-gradient(circle_at_50%_46%,#ffffff_0%,#fdfaf3_60%,#f0e7d6_100%)] shadow-[inset_0_6px_22px_rgba(120,90,55,.10),0_0_0_6px_#fcf9f2,0_0_0_7px_rgba(181,48,42,.32)]" />
              <div v-if="overlayVisible" class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[rgba(252,249,242,.82)] text-center p-4" v-html="overlayHTML" />
            </div>
            <div class="min-h-[1.75rem] mt-3 text-center text-xl font-serif tracking-widest font-bold text-[var(--text-primary)]">
              {{ verdict }}
            </div>
            <div class="flex gap-2 mt-3 flex-wrap justify-center">
              <UButton color="warning" size="sm" @click="rematch">
                <template #leading><UIcon name="i-heroicons-arrow-path" class="w-4 h-4" /></template>
                {{ $t('ceziBattle.rematchBtn') }}
              </UButton>
              <UButton color="neutral" variant="soft" size="sm" @click="backToSetup">
                <template #leading><UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /></template>
                {{ $t('ceziBattle.backBtn') }}
              </UButton>
            </div>
            <div ref="logEl" class="w-full max-w-[520px] mt-3 h-[74px] overflow-y-auto rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] p-2 text-xs text-[var(--text-body)] leading-relaxed space-y-0.5">
              <div v-for="(log, i) in logs" :key="`log-${i}`">• {{ log }}</div>
            </div>
          </div>

          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4 text-center">
            <div class="text-base font-serif tracking-widest mb-2" :class="sideTextClass(2)">{{ match.names[1] || $t('ceziBattle.defaultPlayer2') }}</div>
            <div class="space-y-1.5 mb-3">
              <div v-for="(ch, i) in match.chars[1]" :key="`b-${i}`" class="flex items-center gap-2 px-2 py-1 rounded-md border text-sm transition-all" :class="teamRowClass(2, i)">
                <span class="text-xl font-serif w-6 text-center" :class="sideTextClass(2)">{{ ch }}</span>
                <span class="text-xs ml-auto">{{ teamRowResult(2, i) }}</span>
              </div>
            </div>
            <canvas ref="sd2" width="172" height="128" class="block mx-auto mb-2 bg-[var(--surface-input)] border border-[var(--border-light)] rounded-lg" />
            <div class="text-xs text-[var(--text-faint)]">
              {{ $t('ceziBattle.integrity', { char: currentCharB, value: integrityB }) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="phase === 'result' && match" ref="resultRef" class="max-w-2xl mx-auto space-y-6">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-8 text-center">
          <h2 class="text-3xl font-serif font-bold mb-2" :style="{ color: finalWinnerColor }">{{ finalWinnerText }}</h2>
          <p v-if="mode === 'name'" class="text-sm text-[var(--text-body)]">
            {{ $t('ceziBattle.resultFinalScore', { nameA: match.names[0], scoreA, scoreB, nameB: match.names[1] }) }}
          </p>
          <div class="flex justify-center gap-3 mt-6">
            <UButton color="warning" @click="rematch">{{ $t('ceziBattle.rematchBtn') }}</UButton>
            <AppShareButton
              tool="cezi-battle"
              :summary="`${match.names[0]} vs ${match.names[1]} · ${finalWinnerText}`"
              :share-target="resultRef"
              :filename="`cezi-battle-${match.names.join('-')}-${new Date().toISOString().slice(0, 10)}.png`"
            />
            <UButton color="neutral" variant="soft" @click="backToSetup">{{ $t('ceziBattle.backBtn') }}</UButton>
          </div>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-[var(--text-primary)]">{{ $t('ceziBattle.aiTitle') }}</h3>
            <div v-if="aiStreaming" class="ml-auto flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('ceziBattle.aiInterpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>
          <div v-if="aiCommentary" class="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">{{ aiCommentary }}</div>
          <div v-else-if="aiStreaming" class="text-xs text-[var(--text-muted)] text-center py-6">{{ $t('ceziBattle.aiGenerating') }}</div>
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{{ aiError }}</div>
        </div>
      </div>
    </div>

    <UModal v-model:open="hallModalOpen">
      <template #content>
        <div class="bg-[var(--surface-card)] p-5 max-h-[80vh] overflow-y-auto">
          <div v-if="hallDetail === null">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-serif font-bold text-[var(--text-primary)]">{{ $t('ceziBattle.hallTitle') }}</h2>
              <UButton color="neutral" variant="ghost" size="xs" @click="() => { hallModalOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </UButton>
            </div>
            <p class="text-xs text-[var(--text-faint)] mb-4">{{ $t('ceziBattle.hallHint') }}</p>
            <div v-if="hallEntries.length === 0" class="text-center text-sm text-[var(--text-faint)] py-8">{{ $t('ceziBattle.hallEmpty') }}</div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div v-for="e in hallEntries" :key="e.text" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center cursor-pointer hover:border-[var(--accent)] transition-colors" @click="showHallDetail(e.text)">
                <div class="text-4xl font-serif mb-1">{{ e.text }}</div>
                <div class="text-[10px] text-[var(--text-faint)] leading-tight">
                  {{ $t('ceziBattle.previewAttack') }}{{ e.stats.attack }}・{{ $t('ceziBattle.previewDefense') }}{{ e.stats.defense }}・{{ $t('ceziBattle.previewBalance') }}{{ e.stats.balance }}<br>
                  {{ e.plays }}{{ $t('ceziBattle.hallPlaysSuffix') }} <span class="text-green-500">{{ e.wins }}{{ $t('ceziBattle.teamWin') }}</span> <span class="text-red-500">{{ e.losses }}{{ $t('ceziBattle.teamLose') }}</span>
                </div>
              </div>
            </div>
            <UButton v-if="hallEntries.length" color="neutral" variant="soft" size="sm" class="mt-4" @click="clearHall">{{ $t('ceziBattle.hallClear') }}</UButton>
          </div>
          <div v-else>
            <UButton color="neutral" variant="ghost" size="sm" class="mb-3" @click="hallDetail = null">
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
              {{ $t('ceziBattle.hallBack') }}
            </UButton>
            <div class="flex gap-4 items-center flex-wrap rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 mb-3">
              <div class="text-6xl font-serif text-[#1c1a17] min-w-[88px] text-center">{{ hallDetail.text }}</div>
              <div class="flex-1 min-w-[220px] space-y-1">
                <div v-for="s in statDefs" :key="s.key" class="grid grid-cols-[54px_1fr_34px] items-center gap-2 text-xs">
                  <span class="text-[var(--text-faint)]">{{ s.label }}</span>
                  <div class="h-1.5 bg-[var(--surface-input)] rounded-full overflow-hidden border border-[var(--border-light)]">
                    <div class="h-full" :style="{ width: `${hallDetail.stats[s.key]}%`, background: s.color }" />
                  </div>
                  <span class="text-right tabular-nums">{{ hallDetail.stats[s.key] }}</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-[var(--text-faint)]">
              {{ $t('ceziBattle.hallDetail', { frag: hallDetail.fragCount, plays: hallDetail.plays, rate: winRate(hallDetail), wins: hallDetail.wins, losses: hallDetail.losses }) }}
            </p>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

import type { ComponentPublicInstance } from 'vue'

const { locale, t } = useI18n()

interface TopStats {
  weight: number
  balance: number
  attack: number
  defense: number
  durability: number
  fragCount: number
  atkMul: number
  restMul: number
  bondStrength: number
  spin0: number
}

interface TopNode {
  tr: number
  tc: number
  mass: number
  lx: number
  ly: number
  comp: number
  thick: number
}

interface TopJoint {
  a: number
  b: number
  kind: 'stroke' | 'support'
  broken: boolean
}

interface TopData {
  text: string
  color: string
  master: HTMLCanvasElement
  nodes: TopNode[]
  joints: TopJoint[]
  adj: Record<number, number[]>
  tileDisp: number
  sc: number
  comp: number
  centerNode: number
  depth: number[]
  neckOf: number[]
  mcx: number
  mcy: number
  origMass: number
  stats: TopStats
}

interface BodyCircle {
  rx: number
  ry: number
  r: number
  node: number
}

interface Body {
  top: TopData
  nodeIdxs: number[]
  axleLX: number
  axleLY: number
  offX: number
  offY: number
  imb: number
  m: number
  invM: number
  I: number
  invI: number
  central: boolean
  circles: BodyCircle[]
  boundR: number
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  av: number
  canvas: HTMLCanvasElement | null
  cvcx: number
  cvcy: number
  sideCanvas: HTMLCanvasElement | null
  tilt?: number
  wobblePhase?: number
}

interface FXRing {
  t: 'r'
  x: number
  y: number
  life: number
  decay: number
  c: string
  r0: number
  r1: number
}

interface FXDot {
  t: 'd'
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  c: string
  r: number
}

type FX = FXRing | FXDot

interface GameState {
  topA: TopData
  topB: TopData
  bodiesA: Body[]
  bodiesB: Body[]
  fx: FX[]
  shake: number
  over: boolean
  ended: boolean
  winnerSide: 'A' | 'B' | null
  lastA: number
  lastB: number
  raf: number
  critsA: number
  critsB: number
  fracturesA: number
  fracturesB: number
}

interface MatchState {
  mode: 'name' | 'single'
  names: string[]
  chars: string[][]
  rounds: number
  round: number
  score: number[]
  results: ('A' | 'B' | null)[]
  needWins: number
}

interface HallStats {
  weight: number
  balance: number
  attack: number
  defense: number
  durability: number
}

interface HallEntry {
  text: string
  stats: HallStats
  fragCount: number
  plays: number
  wins: number
  losses: number
  first: number
}

interface BattleSummary {
  mode: 'name' | 'single'
  winnerSide: 'A' | 'B'
  nameA: string
  nameB: string
  charsA: string[]
  charsB: string[]
  scoreA: number
  scoreB: number
  roundResults: ('A' | 'B' | null)[]
  finalIntegrityA: number
  finalIntegrityB: number
  critsA: number
  critsB: number
  fracturesA: number
  fracturesB: number
}

const phase = ref<'form' | 'battle' | 'result'>('form')
const mode = ref<'name' | 'single'>('name')
const name1 = ref('')
const name2 = ref('')
const previews = ref<{ 1: (TopData | null)[], 2: (TopData | null)[] }>({ 1: [], 2: [] })
const game = ref<GameState | null>(null)
const logs = ref<string[]>([])
const integrityA = ref(100)
const integrityB = ref(100)
const currentCharA = ref('—')
const currentCharB = ref('—')
const scoreA = ref(0)
const scoreB = ref(0)
const roundIndex = ref(0)
const totalRounds = ref(0)
const overlayVisible = ref(false)
const overlayHTML = ref('')
const verdict = ref('')
const hallModalOpen = ref(false)
const hallEntries = ref<HallEntry[]>([])
const hallDetail = ref<HallEntry | null>(null)
const aiCommentary = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

const match = ref<MatchState | null>(null)
const resultRef = ref<HTMLDivElement>()
let matchState: MatchState | null = null
let activeGame: GameState | null = null
let rafId = 0

const arena = ref<HTMLCanvasElement | null>(null)
const sd1 = ref<HTMLCanvasElement | null>(null)
const sd2 = ref<HTMLCanvasElement | null>(null)
const logEl = ref<HTMLDivElement | null>(null)
const previewCanvases: Record<number, HTMLCanvasElement[]> = { 1: [], 2: [] }

const statDefs = [
  { key: 'weight', label: t('ceziBattle.statWeight'), color: '#6b6256' },
  { key: 'balance', label: t('ceziBattle.statBalance'), color: '#3f7d4f' },
  { key: 'attack', label: t('ceziBattle.statAttack'), color: '#b5302a' },
  { key: 'defense', label: t('ceziBattle.statDefense'), color: '#2f6f8f' },
] as const

const modeHint = computed(() => {
  return mode.value === 'name'
    ? t('ceziBattle.modeHintName')
    : t('ceziBattle.modeHintSingle')
})

const previewSlots = computed(() => mode.value === 'name' ? 4 : 1)

const canStart = computed(() => {
  const need = mode.value === 'name' ? 2 : 1
  const max = mode.value === 'name' ? 4 : 1
  const c1 = [...name1.value.trim()].slice(0, max)
  const c2 = [...name2.value.trim()].slice(0, max)
  return c1.length >= need && c2.length >= need && c1.length <= max && c2.length <= max
})

const finalWinnerText = computed(() => {
  if (!match.value) return ''
  if (match.value.mode === 'single') {
    const w = match.value.results[0] === 'A' ? 0 : 1
    return t('ceziBattle.resultWinnerSingle', { char: match.value.chars[w][0] })
  }
  const w = scoreA.value > scoreB.value ? 0 : 1
  return t('ceziBattle.resultWinnerName', { name: match.value.names[w] })
})

const finalWinnerColor = computed(() => {
  if (!match.value) return INK
  if (match.value.mode === 'single') {
    return match.value.results[0] === 'A' ? INK : CINNABAR
  }
  return scoreA.value > scoreB.value ? INK : CINNABAR
})

function setPreviewRef(el: Element | ComponentPublicInstance | null, side: 1 | 2, idx: number) {
  if (el instanceof HTMLCanvasElement) previewCanvases[side][idx] = el
}

function previewCap(side: 1 | 2, idx: number) {
  const top = previews.value[side][idx]
  if (!top) return ' '
  const s = top.stats
  return `${top.text}<br>${t('ceziBattle.previewWeight')}${s.weight} ${t('ceziBattle.previewBalance')}${s.balance}<br>${t('ceziBattle.previewAttack')}${s.attack} ${t('ceziBattle.previewDefense')}${s.defense}`
}

function sideTextClass(side: 1 | 2) {
  return side === 1 ? 'text-[#1c1a17]' : 'text-[#b5302a]'
}

function pipClass(idx: number) {
  if (!match.value) return ''
  const w = match.value.results[idx]
  return w === 'A' ? 'bg-[#1c1a17] border-[#1c1a17]' : w === 'B' ? 'bg-[#b5302a] border-[#b5302a]' : ''
}

function teamRowClass(side: 1 | 2, idx: number) {
  if (!match.value) return 'border-[var(--border-light)] opacity-60'
  const w = match.value.results[idx]
  if (w === 'A' || w === 'B') {
    const won = (side === 1 && w === 'A') || (side === 2 && w === 'B')
    return won ? 'border-[var(--accent)] opacity-100' : 'border-[var(--border-light)] opacity-100'
  }
  if (idx === match.value.round) return 'border-[var(--accent)] opacity-100 shadow-[inset_0_0_0_1px_var(--accent)]'
  return 'border-[var(--border-light)] opacity-60'
}

function teamRowResult(side: 1 | 2, idx: number) {
  if (!match.value) return t('ceziBattle.teamPending')
  const w = match.value.results[idx]
  if (w === 'A' || w === 'B') {
    const won = (side === 1 && w === 'A') || (side === 2 && w === 'B')
    return won ? t('ceziBattle.teamWin') : t('ceziBattle.teamLose')
  }
  if (idx === match.value.round) return t('ceziBattle.teamFighting')
  return t('ceziBattle.teamPending')
}

function winRate(e: HallEntry) {
  return e.plays ? Math.round(e.wins / e.plays * 100) : 0
}

const MASTER = 300
const GLYPH_FONT = 210
const TILE = 15
const TOP_TARGET = 72
const ARENA_R = 250
const ARENA_CX = 260
const ARENA_CY = 260
const ARENA_INNER = ARENA_R - 4
const BOWL = 0.00018
const INWARD = 0.005
const SUBSTEPS = 2
const KAI = '"BiauKai","DFKai-SB","TW-Kai","KaiTi TC","Kaiti TC","STKaiti","Kaiti SC","Noto Serif TC",serif'
const INK = '#1c1a17'
const CINNABAR = '#b5302a'
const LINDAMP = 0.995
const SPINFRIC = 0.99996
const REST = 0.62
const MU = 0.18
const AV_MAX = 0.72
const V_MAX = 15
const AV_DEAD = 0.05
const VN_HARD = 1.5
const TOUGH = 4.9
const THK0 = 0.3
const THKK = 1.4
const K_WOBBLE = 0.46
const K_IMBDRAIN = 0.016
const IBOOST = 3.4
const GYRO_CURVE = 0.05
const PRECESS = 0.00035
const SETTLE_SPIN = 0.12
const DEBRIS_DAMP = 0.88
const CRIT_CHANCE = 0.18
const CRIT_MULT = 2.3
const VIEW_KY = 0.78
const VIEW_KZ = 0.92
const THICK = 9
const MAXLEAN = 1.45
let SHX = 0
let SHY = 0

const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function hexA(hex: string, a: number) {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)},${a})`
}

function darken(hex: string, f = 0.42) {
  const h = hex.replace('#', '')
  return `rgb(${Math.round(parseInt(h.substring(0, 2), 16) * f)},${Math.round(parseInt(h.substring(2, 4), 16) * f)},${Math.round(parseInt(h.substring(4, 6), 16) * f)})`
}

function sideColor(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const lum = 0.3 * r + 0.59 * g + 0.11 * b
  if (lum < 70) return 'rgb(120,112,100)'
  return `rgb(${Math.round(r * 0.48)},${Math.round(g * 0.48)},${Math.round(b * 0.48)})`
}

function projPt(x: number, y: number, z = 0) {
  return [x + SHX, ARENA_CY + (y - ARENA_CY) * VIEW_KY - z * VIEW_KZ + SHY] as const
}

function rasterMaster(text: string, color: string) {
  const cv = document.createElement('canvas')
  cv.width = MASTER
  cv.height = MASTER
  const x = cv.getContext('2d')!
  x.fillStyle = color
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  const fs = GLYPH_FONT
  x.font = fs + 'px ' + KAI
  x.fillText(text, MASTER / 2, MASTER / 2 + fs * 0.04)
  return cv
}

function buildTop(text: string, color: string): TopData | null {
  const master = rasterMaster(text, color)
  const data = master.getContext('2d')!.getImageData(0, 0, MASTER, MASTER).data
  const cols = Math.floor(MASTER / TILE)
  const rows = Math.floor(MASTER / TILE)
  const fill: number[][] = []
  let samples = 0
  for (let r = 0; r < rows; r++) {
    fill[r] = []
    for (let c = 0; c < cols; c++) {
      let n = 0, t = 0
      for (let yy = 2; yy < TILE; yy += 3) {
        for (let xx = 2; xx < TILE; xx += 3) {
          t++
          const px = c * TILE + xx, py = r * TILE + yy
          if (data[(py * MASTER + px) * 4 + 3] > 60) n++
        }
      }
      samples = t
      fill[r][c] = n
    }
  }
  const thresh = samples * 0.18
  const solid: boolean[][] = []
  for (let r = 0; r < rows; r++) {
    solid[r] = []
    for (let c = 0; c < cols; c++) solid[r][c] = fill[r][c] > thresh
  }
  const dist: number[][] = []
  const q: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    dist[r] = []
    for (let c = 0; c < cols; c++) {
      if (!solid[r][c]) { dist[r][c] = 0; q.push([r, c]) }
      else if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) { dist[r][c] = 1; q.push([r, c]) }
      else dist[r][c] = Infinity
    }
  }
  let qi = 0
  while (qi < q.length) {
    const [r, c] = q[qi++]
    const d = dist[r][c]
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (solid[nr][nc] && dist[nr][nc] > d + 1) { dist[nr][nc] = d + 1; q.push([nr, nc]) }
    }
  }
  const nodes: TopNode[] = []
  const nodeAt: Record<string, number> = {}
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (solid[r][c]) {
        nodeAt[r + '_' + c] = nodes.length
        nodes.push({ tr: r, tc: c, mass: fill[r][c], lx: 0, ly: 0, comp: -1, thick: Math.min(6, dist[r][c] || 1) })
      }
    }
  }
  if (!nodes.length) return null
  let comp = 0
  for (const seed of nodes) {
    if (seed.comp !== -1) continue
    const st: TopNode[] = [seed]
    seed.comp = comp
    while (st.length) {
      const nd = st.pop()!
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue
          const j = nodeAt[(nd.tr + dr) + '_' + (nd.tc + dc)]
          if (j != null && nodes[j].comp === -1) { nodes[j].comp = comp; st.push(nodes[j]) }
        }
      }
    }
    comp++
  }
  let M = 0, cx = 0, cy = 0, mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
  for (const n of nodes) {
    const mx = n.tc * TILE + TILE / 2, my = n.tr * TILE + TILE / 2
    M += n.mass; cx += mx * n.mass; cy += my * n.mass
    mnx = Math.min(mnx, mx); mxx = Math.max(mxx, mx)
    mny = Math.min(mny, my); mxy = Math.max(mxy, my)
  }
  cx /= M; cy /= M
  const sc = TOP_TARGET / Math.max(mxx - mnx, mxy - mny, 1)
  for (const n of nodes) {
    n.lx = ((n.tc * TILE + TILE / 2) - cx) * sc
    n.ly = ((n.tr * TILE + TILE / 2) - cy) * sc
  }
  const tileDisp = TILE * sc
  const joints: TopJoint[] = []
  const jk = new Set<string>()
  const addJ = (i: number, j: number, k: 'stroke' | 'support') => {
    const a = Math.min(i, j), b = Math.max(i, j)
    const key = a + '_' + b
    if (jk.has(key)) return
    jk.add(key)
    joints.push({ a, b, kind: k, broken: false })
  }
  for (const n of nodes) {
    const i = nodeAt[n.tr + '_' + n.tc]
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const j = nodeAt[(n.tr + dr) + '_' + (n.tc + dc)]
      if (j != null) addJ(i, j, 'stroke')
    }
  }
  if (comp > 1) {
    const byC: Record<number, number[]> = {}
    for (let k = 0; k < comp; k++) byC[k] = []
    nodes.forEach((n, i) => byC[n.comp].push(i))
    const conn = new Set<number>([0])
    const rem = new Set<number>()
    for (let k = 1; k < comp; k++) rem.add(k)
    while (rem.size) {
      let best: [number, number] | null = null, bd = 1e18, bk: number | null = null
      for (const f of rem) {
        for (const g of conn) {
          const A = byC[f], B = byC[g]
          for (let ai = 0; ai < A.length; ai++) {
            for (let bi = 0; bi < B.length; bi++) {
              const dx = nodes[A[ai]].lx - nodes[B[bi]].lx, dy = nodes[A[ai]].ly - nodes[B[bi]].ly, d = dx * dx + dy * dy
              if (d < bd) { bd = d; best = [A[ai], B[bi]]; bk = f }
            }
          }
        }
      }
      if (!best) break
      addJ(best[0], best[1], 'support')
      if (bk != null) { conn.add(bk); rem.delete(bk) }
    }
  }
  const adj: Record<number, number[]> = {}
  for (let i = 0; i < nodes.length; i++) adj[i] = []
  for (const j of joints) if (j.kind === 'stroke') { adj[j.a].push(j.b); adj[j.b].push(j.a) }
  let bmnx = 1e9, bmxx = -1e9, bmny = 1e9, bmxy = -1e9
  for (const n of nodes) {
    bmnx = Math.min(bmnx, n.lx); bmxx = Math.max(bmxx, n.lx)
    bmny = Math.min(bmny, n.ly); bmxy = Math.max(bmxy, n.ly)
  }
  const gcx = (bmnx + bmxx) / 2, gcy = (bmny + bmxy) / 2
  let centerNode = 0, cb = 1e18
  for (let i = 0; i < nodes.length; i++) {
    const d = (nodes[i].lx - gcx) ** 2 + (nodes[i].ly - gcy) ** 2
    if (d < cb) { cb = d; centerNode = i }
  }
  const depth = new Array(nodes.length).fill(-1)
  const neckOf = new Array(nodes.length).fill(centerNode)
  const parent = new Array(nodes.length).fill(-1)
  depth[centerNode] = 0
  const bq = [centerNode]
  let bh2 = 0
  while (bh2 < bq.length) {
    const u = bq[bh2++]
    for (const v of adj[u]) if (depth[v] === -1) { depth[v] = depth[u] + 1; parent[v] = u; bq.push(v) }
  }
  const NECK_HOPS = 5
  for (let i = 0; i < nodes.length; i++) {
    if (depth[i] < 0) { neckOf[i] = i; continue }
    let best = i, bt = nodes[i].thick, u = i
    for (let h = 0; h < NECK_HOPS && parent[u] >= 0; h++) {
      u = parent[u]
      if (nodes[u].thick < bt) { bt = nodes[u].thick; best = u }
    }
    neckOf[i] = best
  }
  const stats = computeStats(nodes, joints, comp)
  return { text, color, master, nodes, joints, adj, tileDisp, sc, comp, centerNode, depth, neckOf, mcx: cx, mcy: cy, origMass: M, stats }
}

function computeStats(nodes: TopNode[], joints: TopJoint[], comp: number): TopStats {
  const N = nodes.length
  let M = 0
  for (const n of nodes) M += n.mass
  const weight = Math.round(clamp(M * 0.052, 5, 100))
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9, gx = 0, gy = 0
  for (const n of nodes) {
    mnx = Math.min(mnx, n.lx); mxx = Math.max(mxx, n.lx)
    mny = Math.min(mny, n.ly); mxy = Math.max(mxy, n.ly)
    gx += n.lx * n.mass; gy += n.ly * n.mass
  }
  gx /= M; gy /= M
  const bw = Math.max(1, mxx - mnx), bh = Math.max(1, mxy - mny)
  const offset = Math.hypot(gx, gy) / Math.max(bw, bh)
  const q = [0, 0, 0, 0]
  for (const n of nodes) q[(n.lx >= gx ? 1 : 0) + (n.ly >= gy ? 2 : 0)] += n.mass
  let qvar = 0
  q.forEach(v => qvar += Math.abs(v - M / 4))
  qvar /= M
  const balance = Math.round(clamp(1 - (offset * 1.8 + qvar * 1.0), 0, 1) * 100)
  const occ = new Set<string>()
  for (const n of nodes) occ.add(n.tr + '_' + n.tc)
  let boundary = 0, spiky = 0, flat = 0
  for (const n of nodes) {
    let exp = 0
    if (!occ.has((n.tr - 1) + '_' + n.tc)) exp++
    if (!occ.has((n.tr + 1) + '_' + n.tc)) exp++
    if (!occ.has(n.tr + '_' + (n.tc - 1))) exp++
    if (!occ.has(n.tr + '_' + (n.tc + 1))) exp++
    if (exp > 0) { boundary++; if (exp >= 2) spiky++; else flat++ }
  }
  const jag = boundary ? spiky / boundary : 0, smo = boundary ? flat / boundary : 0
  const attack = Math.round(clamp(jag * 1.2, 0, 1) * 100)
  const defense = Math.round(clamp(smo * 1.05, 0, 1) * 100)
  const connectivity = joints.filter(j => j.kind === 'stroke').length / N
  const durability = Math.round(clamp(connectivity * 0.42 - (comp - 1) * 0.07 + 0.3, 0, 1) * 100)
  return {
    weight, balance, attack, defense, durability, fragCount: comp,
    atkMul: lerp(0.7, 1.7, attack / 100),
    restMul: lerp(0.8, 1.25, defense / 100),
    bondStrength: lerp(0.9, 1.6, durability / 100),
    spin0: lerp(0.3, 0.42, (weight * 0.4 + balance * 0.6) / 100)
  }
}

function makeBody(top: TopData, nodeIdxs: number[], angle: number, isCentral: boolean): Body {
  let m = 0, cmx = 0, cmy = 0, mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
  for (const i of nodeIdxs) {
    const n = top.nodes[i]
    m += n.mass; cmx += n.lx * n.mass; cmy += n.ly * n.mass
    mnx = Math.min(mnx, n.lx); mxx = Math.max(mxx, n.lx)
    mny = Math.min(mny, n.ly); mxy = Math.max(mxy, n.ly)
  }
  cmx /= m; cmy /= m
  const axleX = (mnx + mxx) / 2, axleY = (mny + mxy) / 2
  const offX = cmx - axleX, offY = cmy - axleY, imb = Math.hypot(offX, offY)
  let Icom = 0
  for (const i of nodeIdxs) {
    const n = top.nodes[i]
    const rx = n.lx - cmx, ry = n.ly - cmy
    Icom += n.mass * (rx * rx + ry * ry)
  }
  const I = Math.max(1, (Icom + m * imb * imb) * IBOOST)
  const circles: BodyCircle[] = []
  let boundR = 0
  for (const i of nodeIdxs) {
    const n = top.nodes[i]
    const rx = n.lx - axleX, ry = n.ly - axleY, cr = top.tileDisp * 0.6
    circles.push({ rx, ry, r: cr, node: i })
    boundR = Math.max(boundR, Math.hypot(rx, ry) + cr)
  }
  const b: Body = {
    top, nodeIdxs, axleLX: axleX, axleLY: axleY, offX, offY, imb, m, invM: 1 / m, I, invI: 1 / I,
    central: !!isCentral, circles, boundR, x: 0, y: 0, vx: 0, vy: 0, angle: angle || 0, av: 0,
    canvas: null, cvcx: 0, cvcy: 0, sideCanvas: null
  }
  buildBodyCanvas(b)
  return b
}

function buildBodyCanvas(b: Body) {
  const top = b.top, half = top.tileDisp / 2
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
  for (const i of b.nodeIdxs) {
    const n = top.nodes[i]
    const rx = n.lx - b.axleLX, ry = n.ly - b.axleLY
    mnx = Math.min(mnx, rx - half); mxx = Math.max(mxx, rx + half)
    mny = Math.min(mny, ry - half); mxy = Math.max(mxy, ry + half)
  }
  const pad = 2, w = Math.max(1, Math.ceil(mxx - mnx) + pad * 2), h = Math.max(1, Math.ceil(mxy - mny) + pad * 2)
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  b.cvcx = -mnx + pad; b.cvcy = -mny + pad
  const g = cv.getContext('2d')!
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.save()
  g.translate(b.cvcx - b.axleLX, b.cvcy - b.axleLY)
  paintGlyph(g, top, b.nodeIdxs)
  g.restore()
  b.canvas = cv
  const scv = document.createElement('canvas')
  scv.width = cv.width; scv.height = cv.height
  const sg = scv.getContext('2d')!
  sg.drawImage(cv, 0, 0)
  sg.globalCompositeOperation = 'source-in'
  sg.fillStyle = sideColor(top.color)
  sg.fillRect(0, 0, cv.width, cv.height)
  b.sideCanvas = scv
}

function paintGlyph(ctx: CanvasRenderingContext2D, top: TopData, nodeIdxs: number[]) {
  if (!top.master) return
  ctx.save()
  ctx.scale(top.sc, top.sc)
  ctx.translate(-top.mcx, -top.mcy)
  ctx.beginPath()
  for (const i of nodeIdxs) {
    const n = top.nodes[i]
    ctx.rect(n.tc * TILE - 0.5, n.tr * TILE - 0.5, TILE + 1, TILE + 1)
  }
  ctx.clip()
  try { ctx.drawImage(top.master, 0, 0) } catch (e) { }
  ctx.restore()
}

function worldCircles(b: Body) {
  const cos = Math.cos(b.angle), sin = Math.sin(b.angle)
  const out: { x: number, y: number, r: number, node: number }[] = []
  for (const c of b.circles) out.push({ x: b.x + cos * c.rx - sin * c.ry, y: b.y + sin * c.rx + cos * c.ry, r: c.r, node: c.node })
  return out
}

function stepBody(b: Body) {
  const rx0 = b.x - ARENA_CX, ry0 = b.y - ARENA_CY, spd = Math.abs(b.av)
  if (b.central) {
    b.vx += -rx0 * BOWL
    b.vy += -ry0 * BOWL
    const dist = Math.hypot(rx0, ry0)
    if (dist > 2) { const inv = INWARD / dist; b.vx += -rx0 * inv; b.vy += -ry0 * inv }
  }
  if (b.central && b.imb > 0.3) {
    const cos = Math.cos(b.angle), sin = Math.sin(b.angle)
    const owx = cos * b.offX - sin * b.offY, owy = sin * b.offX + cos * b.offY
    b.vx += b.av * b.av * owx * K_WOBBLE
    b.vy += b.av * b.av * owy * K_WOBBLE
  }
  if (spd > 0.012) {
    const a = GYRO_CURVE * b.av, ca = Math.cos(a), sa = Math.sin(a)
    const nvx = ca * b.vx - sa * b.vy, nvy = sa * b.vx + ca * b.vy
    b.vx = nvx; b.vy = nvy
  }
  let damp: number
  if (!b.central) damp = DEBRIS_DAMP
  else if (spd < SETTLE_SPIN) damp = lerp(0.9, LINDAMP, spd / SETTLE_SPIN)
  else damp = LINDAMP
  b.vx *= damp; b.vy *= damp
  b.vx = clamp(b.vx, -V_MAX, V_MAX); b.vy = clamp(b.vy, -V_MAX, V_MAX)
  b.x += b.vx; b.y += b.vy; b.angle += b.av
  b.av *= SPINFRIC
  if (b.central && b.imb > 0.3) b.av *= (1 - K_IMBDRAIN * clamp(b.imb / TOP_TARGET, 0, 0.5))
  if (b.central && spd < SETTLE_SPIN) b.av *= 0.99
  b.av = clamp(b.av, -AV_MAX, AV_MAX)
  b.tilt = 0
  const dx = b.x - ARENA_CX, dy = b.y - ARENA_CY, dist = Math.hypot(dx, dy) || 1e-6, lim = ARENA_INNER - b.boundR * 0.55
  if (dist > lim) {
    const nx = dx / dist, ny = dy / dist
    b.x = ARENA_CX + nx * lim; b.y = ARENA_CY + ny * lim
    const vn = b.vx * nx + b.vy * ny
    if (vn > 0) { b.vx -= 1.7 * vn * nx; b.vy -= 1.7 * vn * ny }
  }
}

function collidePair(A: Body, B: Body, fx: FX[], stressA: Record<number, number>, stressB: Record<number, number>) {
  const dx = B.x - A.x, dy = B.y - A.y, rr = A.boundR + B.boundR
  if (dx * dx + dy * dy > rr * rr) return 0
  const dl = Math.hypot(dx, dy) || 1, ux0 = dx / dl, uy0 = dy / dl
  const power = (body: Body, sx: number, sy: number) => {
    if (body.imb < 0.3) return { p: 1, crit: false }
    const cos = Math.cos(body.angle), sin = Math.sin(body.angle)
    let ox = cos * body.offX - sin * body.offY, oy = sin * body.offX + cos * body.offY
    const ol = Math.hypot(ox, oy) || 1
    ox /= ol; oy /= ol
    const lead = Math.max(0, ox * sx + oy * sy), imbN = clamp(body.imb / TOP_TARGET, 0, 0.6)
    let p = 1 + lead * imbN * 2.0, crit = false
    if (lead > 0.45 && imbN > 0.12 && Math.random() < CRIT_CHANCE) { p *= CRIT_MULT; crit = true }
    return { p, crit }
  }
  const pa = power(A, ux0, uy0), pb = power(B, -ux0, -uy0)
  if (pa.crit && game) activeGame.critsA++
  if (pb.crit && game) activeGame.critsB++
  const ca = worldCircles(A), cb = worldCircles(B)
  const gs = A.top.tileDisp * 1.4, grid: Record<string, number[]> = {}
  const key = (gx: number, gy: number) => gx + '#' + gy
  for (let i = 0; i < cb.length; i++) {
    const p = cb[i]
    const gx = Math.floor(p.x / gs), gy = Math.floor(p.y / gs)
    ;(grid[key(gx, gy)] || (grid[key(gx, gy)] = [])).push(i)
  }
  let totalJ = 0, hx = 0, hy = 0, hits = 0
  for (const a of ca) {
    const gx = Math.floor(a.x / gs), gy = Math.floor(a.y / gs)
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cell = grid[key(gx + ox, gy + oy)]
        if (!cell) continue
        for (const bi of cell) {
          const b = cb[bi]
          let nx = b.x - a.x, ny = b.y - a.y, d = Math.hypot(nx, ny), minD = a.r + b.r
          if (d >= minD || d < 1e-6) continue
          const ux = nx / d, uy = ny / d, pen = minD - d, totInv = A.invM + B.invM, corr = pen * 0.6
          A.x -= ux * corr * (A.invM / totInv); A.y -= uy * corr * (A.invM / totInv)
          B.x += ux * corr * (B.invM / totInv); B.y += uy * corr * (B.invM / totInv)
          const rAx = a.x - A.x, rAy = a.y - A.y, rBx = b.x - B.x, rBy = b.y - B.y
          const vAx = A.vx - A.av * rAy, vAy = A.vy + A.av * rAx
          const vBx = B.vx - B.av * rBy, vBy = B.vy + B.av * rBx
          const rvx = vBx - vAx, rvy = vBy - vAy, vn = rvx * ux + rvy * uy
          if (vn < 0) {
            const rAcn = rAx * uy - rAy * ux, rBcn = rBx * uy - rBy * ux
            const invSum = A.invM + B.invM + rAcn * rAcn * A.invI + rBcn * rBcn * B.invI
            const e = REST * 0.5 * (A.top.stats.restMul + B.top.stats.restMul)
            let jn = -(1 + e) * vn / invSum; jn *= 0.65
            A.vx -= jn * A.invM * ux; A.vy -= jn * A.invM * uy; A.av -= rAcn * jn * A.invI
            B.vx += jn * B.invM * ux; B.vy += jn * B.invM * uy; B.av += rBcn * jn * B.invI
            const tx = -uy, ty = ux
            const vt = rvx * tx + rvy * ty, rAct = rAx * ty - rAy * tx, rBct = rBx * ty - rBy * tx
            const invSumT = A.invM + B.invM + rAct * rAct * A.invI + rBct * rBct * B.invI
            let jt = -vt / invSumT; jt *= 0.5
            const lim = MU * Math.abs(jn * 2)
            jt = clamp(jt, -lim, lim)
            A.vx -= jt * A.invM * tx; A.vy -= jt * A.invM * ty; A.av -= rAct * jt * A.invI
            B.vx += jt * B.invM * tx; B.vy += jt * B.invM * ty; B.av += rBct * jt * B.invI
            const approach = -vn
            if (approach > VN_HARD) {
              const dA = approach * B.top.stats.atkMul * pb.p, dB = approach * A.top.stats.atkMul * pa.p
              if (dA > (stressA[a.node] || 0)) stressA[a.node] = dA
              if (dB > (stressB[b.node] || 0)) stressB[b.node] = dB
            }
            totalJ += Math.abs(jn) + Math.abs(jt)
            hx += (a.x + b.x) / 2; hy += (a.y + b.y) / 2; hits++
          }
        }
      }
    }
  }
  if (hits > 0) {
    hx /= hits; hy /= hits
    const crit = pa.crit || pb.crit
    if (crit) {
      const atk = pa.crit ? A : B, def = pa.crit ? B : A, sgn = pa.crit ? 1 : -1
      def.vx += ux0 * sgn * 3.2; def.vy += uy0 * sgn * 3.2; atk.av *= 0.93
      addImpact(fx, hx, hy, 8, '#b5302a', true)
      if (game) { activeGame.shake = Math.max(activeGame.shake, 9); logMsg(t('ceziBattle.logCrit', { char: atk.top.text })) }
    } else if (totalJ > 1.0) {
      addImpact(fx, hx, hy, totalJ, A.top.color, false)
      if (game) activeGame.shake = Math.max(activeGame.shake, Math.min(4, 1 + totalJ * 0.3))
    }
  }
  return totalJ
}

function applyFracture(top: TopData, bodies: Body[], stress: Record<number, number>, fx: FX[]) {
  const neckStress: Record<number, number> = {}
  for (const k in stress) {
    const i = +k, s = stress[k]
    if (s <= 0) continue
    const nk = (top.neckOf && top.neckOf[i] != null) ? top.neckOf[i] : i
    if (s > (neckStress[nk] || 0)) neckStress[nk] = s
  }
  const result: Body[] = []
  for (const b of bodies) {
    const nodeSet = new Set(b.nodeIdxs)
    let broke = false
    const bs = top.stats.bondStrength
    for (const k in neckStress) {
      const nk = +k
      if (!nodeSet.has(nk)) continue
      const strength = TOUGH * bs * (THK0 + top.nodes[nk].thick * THKK)
      if (neckStress[k] <= strength) continue
      const nThick = top.nodes[nk].thick, dnk0 = top.depth[nk]
      const seen = new Set<number>([nk]), stk = [nk]
      while (stk.length) {
        const u = stk.pop()!, du = top.depth[u]
        for (const j of top.joints) {
          if (j.broken || j.kind !== 'stroke' || !nodeSet.has(j.a) || !nodeSet.has(j.b)) continue
          const other = j.a === u ? j.b : (j.b === u ? j.a : -1)
          if (other < 0) continue
          if (top.depth[other] >= 0 && top.depth[other] < du) { j.broken = true; broke = true }
        }
        for (const v of top.adj[u]) {
          if (seen.has(v) || !nodeSet.has(v)) continue
          if (top.depth[v] >= 0 && top.nodes[v].thick <= nThick + 1 && Math.abs(top.depth[v] - dnk0) <= 1) { seen.add(v); stk.push(v) }
        }
      }
    }
    for (const j of top.joints) {
      if (j.broken || j.kind !== 'support' || !nodeSet.has(j.a) || !nodeSet.has(j.b)) continue
      const s = Math.max(stress[j.a] || 0, stress[j.b] || 0)
      if (s > TOUGH * bs * 0.5) { j.broken = true; broke = true }
    }
    if (!broke) { result.push(b); continue }
    const idxArr = b.nodeIdxs, pos: Record<number, number> = {}
    idxArr.forEach((v, k) => pos[v] = k)
    const parent = idxArr.map((_, k) => k)
    const find = (x: number) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
    const uni = (a: number, c: number) => { a = find(a); c = find(c); if (a !== c) parent[a] = c }
    for (const j of top.joints) if (!j.broken && nodeSet.has(j.a) && nodeSet.has(j.b)) uni(pos[j.a], pos[j.b])
    const groups: Record<number, number[]> = {}
    for (let k = 0; k < idxArr.length; k++) { const r = find(k); (groups[r] || (groups[r] = [])).push(idxArr[k]) }
    const gkeys = Object.keys(groups)
    if (gkeys.length <= 1) { result.push(b); continue }
    for (const gk of gkeys) {
      const gn = groups[+gk], isC = gn.indexOf(top.centerNode) >= 0, nb = makeBody(top, gn, b.angle, isC)
      const cos = Math.cos(b.angle), sin = Math.sin(b.angle), dlx = nb.axleLX - b.axleLX, dly = nb.axleLY - b.axleLY
      nb.x = b.x + (cos * dlx - sin * dly); nb.y = b.y + (sin * dlx + cos * dly); nb.angle = b.angle
      const rx = nb.x - b.x, ry = nb.y - b.y
      nb.vx = b.vx - b.av * ry; nb.vy = b.vy + b.av * rx
      if (isC) { nb.av = b.av }
      else {
        nb.av = (Math.random() - 0.5) * 0.05
        const dd = Math.hypot(rx, ry) || 1
        nb.vx += rx / dd * 2.0; nb.vy += ry / dd * 2.0
        if (fx) addImpact(fx, nb.x, nb.y, 4, top.color, false)
      }
      result.push(nb)
    }
  }
  return result
}

function addImpact(fx: FX[], x: number, y: number, power: number, color: string, crit: boolean) {
  if (!fx) return
  fx.push({ t: 'r', x, y, life: 1, decay: crit ? 0.045 : 0.08, c: crit ? '#b5302a' : color, r0: crit ? 12 : 5, r1: crit ? 54 : 24 })
  const n = crit ? 16 : Math.min(11, 3 + (power | 0))
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, sp = rnd(crit ? 2.4 : 1, crit ? 7 : 3.6)
    fx.push({ t: 'd', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: rnd(0.03, 0.07), c: Math.random() < 0.5 ? color : '#1c1a17', r: rnd(1.2, crit ? 3.6 : 2.4) })
  }
  if (crit) fx.push({ t: 'r', x, y, life: 1, decay: 0.035, c: '#b5302a', r0: 4, r1: 78 })
}

function drawBody3D(ctx: CanvasRenderingContext2D, b: Body) {
  if (!b.canvas) return
  const a = b.angle, beta = (b.tilt || 0) * MAXLEAN, psi = b.wobblePhase || 0
  const ux = Math.sin(beta) * Math.cos(psi), uy = Math.sin(beta) * Math.sin(psi), uz = Math.cos(beta)
  let hx = Math.cos(a), hy = Math.sin(a)
  const hd = hx * ux + hy * uy
  let e1x = hx - hd * ux, e1y = hy - hd * uy, e1z = -hd * uz
  const el = Math.hypot(e1x, e1y, e1z) || 1
  e1x /= el; e1y /= el; e1z /= el
  const e2x = uy * e1z - uz * e1y, e2y = uz * e1x - ux * e1z, e2z = ux * e1y - uy * e1x
  const s1x = e1x, s1y = e1y * VIEW_KY - e1z * VIEW_KZ
  const s2x = e2x, s2y = e2y * VIEW_KY - e2z * VIEW_KZ
  const uSx = ux * THICK, uSy = (uy * VIEW_KY - uz * VIEW_KZ) * THICK
  const base = projPt(b.x, b.y, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.save()
  ctx.translate(base[0], base[1] + 3)
  ctx.scale(1, VIEW_KY * 0.55)
  ctx.fillStyle = 'rgba(90,68,42,0.13)'
  ctx.beginPath(); ctx.arc(0, 0, b.boundR * 0.95, 0, 7); ctx.fill()
  ctx.restore()
  const layers = Math.max(4, Math.round(THICK * 0.8))
  for (let k = 0; k <= layers; k++) {
    const t = k / layers
    ctx.setTransform(s1x, s1y, s2x, s2y, base[0] + uSx * t, base[1] + uSy * t)
    ctx.drawImage(b.sideCanvas!, -b.cvcx, -b.cvcy)
  }
  ctx.setTransform(s1x, s1y, s2x, s2y, base[0] + uSx, base[1] + uSy)
  ctx.drawImage(b.canvas, -b.cvcx, -b.cvcy)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawBowl(ctx: CanvasRenderingContext2D) {
  ctx.save(); ctx.translate(ARENA_CX + SHX, ARENA_CY + SHY); ctx.scale(1, VIEW_KY)
  ctx.strokeStyle = 'rgba(181,48,42,.09)'; ctx.lineWidth = 1
  for (let rr = 66; rr < ARENA_R; rr += 66) { ctx.beginPath(); ctx.arc(0, 0, rr, 0, 7); ctx.stroke() }
  ctx.setLineDash([5, 7]); ctx.beginPath()
  ctx.moveTo(0, -ARENA_R); ctx.lineTo(0, ARENA_R); ctx.moveTo(-ARENA_R, 0); ctx.lineTo(ARENA_R, 0)
  const d = ARENA_R * 0.707; ctx.moveTo(-d, -d); ctx.lineTo(d, d); ctx.moveTo(d, -d); ctx.lineTo(-d, d)
  ctx.stroke(); ctx.setLineDash([])
  ctx.strokeStyle = 'rgba(181,48,42,.28)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, ARENA_R, 0, 7); ctx.stroke()
  ctx.restore()
}

function drawTianGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save(); ctx.strokeStyle = 'rgba(181,48,42,.4)'; ctx.lineWidth = 1.3; ctx.strokeRect(3, 3, W - 6, H - 6)
  ctx.strokeStyle = 'rgba(181,48,42,.18)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath()
  ctx.moveTo(W / 2, 3); ctx.lineTo(W / 2, H - 3); ctx.moveTo(3, H / 2); ctx.lineTo(W - 3, H / 2)
  ctx.stroke(); ctx.setLineDash([]); ctx.restore()
}

function drawPreview(canvas: HTMLCanvasElement, top: TopData | null) {
  const ctx = canvas.getContext('2d')!, W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H); drawTianGrid(ctx, W, H)
  if (!top) return
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
  for (const n of top.nodes) {
    mnx = Math.min(mnx, n.lx); mxx = Math.max(mxx, n.lx)
    mny = Math.min(mny, n.ly); mxy = Math.max(mxy, n.ly)
  }
  const gw = Math.max(1, mxx - mnx + top.tileDisp), gh = Math.max(1, mxy - mny + top.tileDisp)
  const s = Math.min((W * 0.76) / gw, (H * 0.76) / gh)
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-(mnx + mxx) / 2, -(mny + mxy) / 2)
  paintGlyph(ctx, top, top.nodes.map((_, i) => i))
  for (const j of top.joints) {
    if (j.kind !== 'support') continue
    const A = top.nodes[j.a], B = top.nodes[j.b]
    ctx.lineWidth = 1.4 / s; ctx.strokeStyle = 'rgba(181,48,42,.55)'; ctx.setLineDash([3 / s, 3 / s])
    ctx.beginPath(); ctx.moveTo(A.lx, A.ly); ctx.lineTo(B.lx, B.ly); ctx.stroke(); ctx.setLineDash([])
  }
  ctx.restore()
}

function drawStatusDiagram(canvas: HTMLCanvasElement, top: TopData | null, nodeBody: Record<number, Body>, main: Body) {
  const ctx = canvas.getContext('2d')!, W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H); drawTianGrid(ctx, W, H)
  if (!top) return
  const half = top.tileDisp / 2
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
  for (const n of top.nodes) {
    mnx = Math.min(mnx, n.lx); mxx = Math.max(mxx, n.lx)
    mny = Math.min(mny, n.ly); mxy = Math.max(mxy, n.ly)
  }
  const gw = Math.max(1, mxx - mnx + top.tileDisp), gh = Math.max(1, mxy - mny + top.tileDisp)
  const s = Math.min((W * 0.76) / gw, (H * 0.76) / gh)
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-(mnx + mxx) / 2, -(mny + mxy) / 2)
  const att: number[] = []
  for (let i = 0; i < top.nodes.length; i++) {
    const n = top.nodes[i]
    const a = nodeBody ? (nodeBody[i] === main) : true
    if (a) att.push(i)
    else {
      ctx.fillStyle = 'rgba(150,140,124,.4)'; ctx.fillRect(n.lx - half, n.ly - half, top.tileDisp, top.tileDisp)
      ctx.strokeStyle = 'rgba(181,48,42,.5)'; ctx.lineWidth = 1 / s; ctx.strokeRect(n.lx - half, n.ly - half, top.tileDisp, top.tileDisp)
    }
  }
  paintGlyph(ctx, top, att)
  ctx.restore()
}

function centralBody(list: Body[], cn: number) {
  for (const b of list) if (b.nodeIdxs.indexOf(cn) >= 0) return b
  let x = list[0]
  for (const b of list) if (b.m > x.m) x = b
  return x
}

function nodeBodyMap(top: TopData, bodies: Body[]) {
  const m: Record<number, Body> = {}
  for (const b of bodies) for (const i of b.nodeIdxs) m[i] = b
  return m
}

function logMsg(s: string) {
  logs.value.push(s)
  nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
}

function startMatch() {
  if (!canStart.value) return
  const n1 = name1.value.trim(), n2 = name2.value.trim()
  const max = mode.value === 'name' ? 4 : 1
  const c1 = [...n1].slice(0, max)
  const c2 = [...n2].slice(0, max)
  const rounds = Math.max(c1.length, c2.length)
  matchState = {
    mode: mode.value,
    names: [n1, n2],
    chars: [c1, c2],
    rounds,
    round: 0,
    score: [0, 0],
    results: new Array(rounds).fill(null),
    needWins: Math.ceil(rounds / 2)
  }
  match.value = matchState
  scoreA.value = 0; scoreB.value = 0; roundIndex.value = 0; totalRounds.value = rounds
  phase.value = 'battle'
  c1.forEach(c => recordEntry(buildTop(c, INK)))
  c2.forEach(c => recordEntry(buildTop(c, CINNABAR)))
  startRound()
}

function startRound() {
  if (!matchState) return
  const i = matchState.round
  const hasA = i < matchState.chars[0].length
  const hasB = i < matchState.chars[1].length
  if (!hasA || !hasB) {
    const win = !hasA ? 'B' : 'A'
    matchState.results[i] = win
    matchState.score[win === 'A' ? 0 : 1]++
    matchState.round++
    scoreA.value = matchState.score[0]; scoreB.value = matchState.score[1]
    roundIndex.value = matchState.round
    renderTeams()
    if (matchState.round >= matchState.rounds) showFinal()
    else startRound()
    return
  }
  const topA = buildTop(matchState.chars[0][i], INK)!
  const topB = buildTop(matchState.chars[1][i], CINNABAR)!
  const R0 = 96
  const A = makeBody(topA, topA.nodes.map((_, k) => k), 0, true)
  const B = makeBody(topB, topB.nodes.map((_, k) => k), 0, true)
  A.x = ARENA_CX - R0; A.y = ARENA_CY + rnd(-12, 12)
  B.x = ARENA_CX + R0; B.y = ARENA_CY + rnd(-12, 12)
  A.vy = 1.5; B.vy = 1.5
  A.av = topA.stats.spin0 * 1.5 * (Math.random() < 0.5 ? 1 : -1)
  B.av = topB.stats.spin0 * 1.5 * (Math.random() < 0.5 ? 1 : -1)
  activeGame = {
    topA, topB, bodiesA: [A], bodiesB: [B], fx: [], shake: 0,
    over: false, ended: false, winnerSide: null,
    lastA: topA.origMass, lastB: topB.origMass,
    raf: 0, critsA: 0, critsB: 0, fracturesA: 0, fracturesB: 0
  }
  game.value = activeGame
  currentCharA.value = topA.text; currentCharB.value = topB.text
  integrityA.value = 100; integrityB.value = 100
  verdict.value = ''; overlayVisible.value = false; overlayHTML.value = ''
  logs.value = []
  updateScorebar(); renderTeams()
  logMsg(t('ceziBattle.logRound', { n: matchState.round + 1, a: topA.text, b: topB.text }))
  loop()
}

function renderTeams() {
  if (!matchState) return
  for (const side of [1, 2]) {
    const chars = matchState.chars[side - 1]
    for (let i = 0; i < chars.length; i++) {
      // reactive team rows rendered by template; nothing extra needed
    }
  }
}

function updateScorebar() {
  if (!matchState) return
  scoreA.value = matchState.score[0]; scoreB.value = matchState.score[1]
  roundIndex.value = matchState.round
}

function loop() {
  if (!activeGame) return
  const { topA, topB } = activeGame
  for (let s = 0; s < SUBSTEPS; s++) {
    for (const b of activeGame.bodiesA) stepBody(b)
    for (const b of activeGame.bodiesB) stepBody(b)
    const sA: Record<number, number> = {}, sB: Record<number, number> = {}
    for (const a of activeGame.bodiesA) for (const b of activeGame.bodiesB) collidePair(a, b, activeGame.fx, sA, sB)
    const beforeA = activeGame.bodiesA.length, beforeB = activeGame.bodiesB.length
    activeGame.bodiesA = applyFracture(topA, activeGame.bodiesA, sA, activeGame.fx)
    activeGame.bodiesB = applyFracture(topB, activeGame.bodiesB, sB, activeGame.fx)
    activeGame.fracturesA += Math.max(0, activeGame.bodiesA.length - beforeA)
    activeGame.fracturesB += Math.max(0, activeGame.bodiesB.length - beforeB)
  }
  const cA = centralBody(activeGame.bodiesA, topA.centerNode), cB = centralBody(activeGame.bodiesB, topB.centerNode)
  if (cA.m < activeGame.lastA - 0.5) logMsg(t('ceziBattle.logFracture', { char: topA.text }))
  if (cB.m < activeGame.lastB - 0.5) logMsg(t('ceziBattle.logFracture', { char: topB.text }))
  activeGame.lastA = cA.m; activeGame.lastB = cB.m
  if (!activeGame.over) judge(cA, cB)
  render(); updateSidePanels(cA, cB)
  if (activeGame.over && !activeGame.ended) { activeGame.ended = true; setTimeout(endRound, 1300) }
  rafId = requestAnimationFrame(loop)
  activeGame.raf = rafId
}

function judge(cA: Body, cB: Body) {
  if (!activeGame) return
  const { topA, topB } = activeGame
  const aLost = cA.m < topA.origMass * 0.5, bLost = cB.m < topB.origMass * 0.5
  const aStop = Math.abs(cA.av) < AV_DEAD, bStop = Math.abs(cB.av) < AV_DEAD
  const aDead = aLost || aStop, bDead = bLost || bStop
  if (!(aDead || bDead)) return
  activeGame.over = true
  let win: 'A' | 'B'
  if (aDead && bDead) {
    if (aLost && !bLost) win = 'B'
    else if (bLost && !aLost) win = 'A'
    else {
      const ra = cA.m / topA.origMass, rb = cB.m / topB.origMass
      win = (ra !== rb) ? (ra > rb ? 'A' : 'B') : (Math.abs(cA.av) >= Math.abs(cB.av) ? 'A' : 'B')
    }
  } else win = aDead ? 'B' : 'A'
  activeGame.winnerSide = win
  const wtext = win === 'A' ? topA.text : topB.text
  const lose = win === 'A' ? { l: bLost, t: topB.text } : { l: aLost, t: topA.text }
  const reason = lose.l ? t('ceziBattle.reasonFracture') : t('ceziBattle.reasonStop')
  verdict.value = t('ceziBattle.overlayRoundWinner', { char: wtext })
  logMsg(t('ceziBattle.logVerdict', { loser: lose.t, reason, winner: wtext }))
  recordResult(wtext, true); recordResult(lose.t, false)
}

function endRound() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  if (!activeGame || !matchState) return
  const w = activeGame.winnerSide
  if (w) {
    matchState.score[w === 'A' ? 0 : 1]++
    matchState.results[matchState.round] = w
  }
  updateScorebar(); renderTeams()
  if (matchState.round >= matchState.rounds - 1) showFinal()
  else showRoundResult(w)
}

function showRoundResult(w: 'A' | 'B' | null) {
  if (!activeGame || !matchState || !w) return
  const wt = w === 'A' ? activeGame.topA.text : activeGame.topB.text
  const col = w === 'A' ? INK : CINNABAR
  overlayHTML.value = `<div class="text-3xl font-serif font-bold mb-2" style="color:${col}">${t('ceziBattle.overlayRoundWinner', { char: wt })}</div>
    <div class="text-sm text-[var(--text-body)] mb-4">${t('ceziBattle.overlayScore', { nameA: matchState.names[0], scoreA: matchState.score[0], scoreB: matchState.score[1], nameB: matchState.names[1] })}</div>
    <button class="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm" onclick="document.dispatchEvent(new CustomEvent('cezi-next-round'))">${t('ceziBattle.nextRoundBtn')}</button>`
  overlayVisible.value = true
}

function nextRound() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  if (!matchState) return
  matchState.round++
  roundIndex.value = matchState.round
  startRound()
}

function showFinal() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  if (!activeGame || !matchState) return
  phase.value = 'result'
  let msg = '', col = INK
  if (matchState.mode === 'single') {
    const w = matchState.results[0] === 'A' ? 0 : 1
    col = w === 0 ? INK : CINNABAR
    msg = t('ceziBattle.resultWinnerSingle', { char: matchState.chars[w][0] })
  } else {
    const w = matchState.score[0] > matchState.score[1] ? 0 : 1
    col = w === 0 ? INK : CINNABAR
    msg = t('ceziBattle.resultWinnerName', { name: matchState.names[w] })
  }
  const scoreText = matchState.mode === 'name'
    ? t('ceziBattle.resultFinalScore', { nameA: matchState.names[0], scoreA: matchState.score[0], scoreB: matchState.score[1], nameB: matchState.names[1] })
    : ''
  overlayHTML.value = `<div class="text-3xl font-serif font-bold mb-2" style="color:${col}">${msg}</div>
    <div class="text-sm text-[var(--text-body)] mb-4">${scoreText}</div>
    <button class="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm" onclick="document.dispatchEvent(new CustomEvent('cezi-rematch'))">${t('ceziBattle.overlayRematch')}</button>`
  overlayVisible.value = true
  fetchAiCommentary()
}

function render() {
  const cv = arena.value
  if (!cv || !activeGame) return
  const ctx = cv.getContext('2d')!
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 520, 520)
  SHX = 0; SHY = 0
  if (activeGame.shake > 0.3) { SHX = (Math.random() - 0.5) * activeGame.shake; SHY = (Math.random() - 0.5) * activeGame.shake; activeGame.shake *= 0.86 } else activeGame.shake = 0
  drawBowl(ctx)
  const all = activeGame.bodiesA.concat(activeGame.bodiesB).sort((p, q) => p.y - q.y)
  for (const b of all) drawBody3D(ctx, b)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  for (let i = activeGame.fx.length - 1; i >= 0; i--) {
    const e = activeGame.fx[i]
    e.life -= e.decay
    if (e.life <= 0) { activeGame.fx.splice(i, 1); continue }
    if (e.t === 'r') {
      const rr = lerp(e.r0, e.r1, 1 - e.life), p = projPt(e.x, e.y, 0)
      ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, VIEW_KY)
      ctx.strokeStyle = hexA(e.c, e.life * 0.7); ctx.lineWidth = 2 * e.life + 0.4
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, 7); ctx.stroke(); ctx.restore()
    } else {
      e.x += e.vx; e.y += e.vy; e.vx *= 0.93; e.vy *= 0.93
      const p = projPt(e.x, e.y, 0)
      ctx.fillStyle = hexA(e.c, e.life)
      ctx.beginPath(); ctx.arc(p[0], p[1], e.r * e.life + 0.4, 0, 7); ctx.fill()
    }
  }
}

function updateSidePanels(cA: Body, cB: Body) {
  if (!activeGame) return
  const { topA, topB } = activeGame
  if (sd1.value) drawStatusDiagram(sd1.value, topA, nodeBodyMap(topA, activeGame.bodiesA), cA)
  if (sd2.value) drawStatusDiagram(sd2.value, topB, nodeBodyMap(topB, activeGame.bodiesB), cB)
  integrityA.value = Math.round(cA.m / topA.origMass * 100)
  integrityB.value = Math.round(cB.m / topB.origMass * 100)
}

function rematch() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  if (!matchState) return
  matchState.round = 0; matchState.score = [0, 0]; matchState.results = new Array(matchState.rounds).fill(null)
  scoreA.value = 0; scoreB.value = 0; roundIndex.value = 0
  aiCommentary.value = ''; aiStreaming.value = false; aiError.value = null
  phase.value = 'battle'
  startRound()
}

function backToSetup() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  activeGame = null; game.value = null
  matchState = null; match.value = null
  phase.value = 'form'
  verdict.value = ''; overlayVisible.value = false; overlayHTML.value = ''
  logs.value = []
  aiCommentary.value = ''; aiStreaming.value = false; aiError.value = null
  refreshPreview(1); refreshPreview(2)
}

function loadHall(): Record<string, HallEntry> {
  if (!process.client) return {}
  try {
    const raw = localStorage.getItem('cezi-battle-hall')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveHall(h: Record<string, HallEntry>) {
  if (!process.client) return
  try { localStorage.setItem('cezi-battle-hall', JSON.stringify(h)) } catch { }
}

function recordEntry(top: TopData | null) {
  if (!top) return
  const h = loadHall(), k = top.text
  if (!h[k]) {
    h[k] = {
      text: top.text,
      stats: { weight: top.stats.weight, balance: top.stats.balance, attack: top.stats.attack, defense: top.stats.defense, durability: top.stats.durability },
      fragCount: top.comp, plays: 0, wins: 0, losses: 0, first: Date.now()
    }
  }
  saveHall(h)
}

function recordResult(t: string, win: boolean) {
  const h = loadHall()
  if (!h[t]) return
  h[t].plays = (h[t].plays || 0) + 1
  if (win) h[t].wins = (h[t].wins || 0) + 1
  else h[t].losses = (h[t].losses || 0) + 1
  saveHall(h)
}

function openHall() {
  hallDetail.value = null
  const h = loadHall()
  hallEntries.value = Object.keys(h).sort((a, b) => (h[b].plays || 0) - (h[a].plays || 0) || h[b].first - h[a].first).map(k => h[k])
  hallModalOpen.value = true
}

function showHallDetail(key: string) {
  const h = loadHall()
  if (h[key]) hallDetail.value = h[key]
}

function clearHall() {
  if (!process.client) return
  if (confirm(t('ceziBattle.confirmClearHall'))) {
    localStorage.removeItem('cezi-battle-hall')
    hallEntries.value = []
  }
}

function setMode(m: 'name' | 'single') {
  mode.value = m
  const max = m === 'name' ? 4 : 1
  const c1 = [...name1.value].slice(0, max).join('')
  const c2 = [...name2.value].slice(0, max).join('')
  if (c1 !== name1.value) name1.value = c1
  if (c2 !== name2.value) name2.value = c2
  refreshPreview(1); refreshPreview(2)
}

function refreshPreview(which: 1 | 2) {
  const txt = (which === 1 ? name1.value : name2.value).trim()
  const color = which === 1 ? INK : CINNABAR
  const max = mode.value === 'name' ? 4 : 1
  const chars = [...txt].slice(0, max)
  const arr: (TopData | null)[] = []
  for (const ch of chars) {
    const top = buildTop(ch, color)
    arr.push(top)
  }
  previews.value[which] = arr
  nextTick(() => {
    for (let i = 0; i < arr.length; i++) {
      const cv = previewCanvases[which][i]
      if (cv) drawPreview(cv, arr[i])
    }
  })
}

async function fetchAiCommentary() {
  if (!matchState || !activeGame) return
  const winnerSide = matchState.mode === 'single'
    ? (matchState.results[0] === 'A' ? 'A' : 'B')
    : (matchState.score[0] > matchState.score[1] ? 'A' : 'B')
  const cA = centralBody(activeGame.bodiesA, activeGame.topA.centerNode)
  const cB = centralBody(activeGame.bodiesB, activeGame.topB.centerNode)
  const summary: BattleSummary = {
    mode: matchState.mode,
    winnerSide,
    nameA: matchState.names[0],
    nameB: matchState.names[1],
    charsA: matchState.chars[0],
    charsB: matchState.chars[1],
    scoreA: matchState.score[0],
    scoreB: matchState.score[1],
    roundResults: matchState.results,
    finalIntegrityA: Math.round((cA?.m || 0) / activeGame.topA.origMass * 100),
    finalIntegrityB: Math.round((cB?.m || 0) / activeGame.topB.origMass * 100),
    critsA: activeGame.critsA,
    critsB: activeGame.critsB,
    fracturesA: activeGame.fracturesA,
    fracturesB: activeGame.fracturesB
  }
  aiCommentary.value = ''; aiStreaming.value = true; aiError.value = null
  try {
    const response = await fetch('/api/tools/cezi-battle/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: summary, locale: locale.value })
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) aiCommentary.value += data.text
          else if (data.type === 'error') aiError.value = data.message || t('ceziBattle.aiError')
        } catch { }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('ceziBattle.aiError')
  } finally {
    aiStreaming.value = false
  }
}

onMounted(() => {
  if (process.client) {
    refreshPreview(1); refreshPreview(2)
    document.addEventListener('cezi-next-round', nextRound)
    document.addEventListener('cezi-rematch', rematch)
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (process.client) {
    document.removeEventListener('cezi-next-round', nextRound)
    document.removeEventListener('cezi-rematch', rematch)
  }
})

useSeoMeta({
  title: () => `${t('seo.ceziBattleTitle')} - ososn`,
  description: t('seo.ceziBattleDesc'),
  keywords: t('seo.ceziBattleKeywords'),
  ogTitle: () => `${t('seo.ceziBattleOgTitle')} - ososn`,
  ogDescription: t('seo.ceziBattleOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/cezi-battle',
  twitterCard: 'summary_large_image'
})
</script>

<style scoped>
:deep(.cezi-overlay button) {
  font-family: inherit;
}
</style>
