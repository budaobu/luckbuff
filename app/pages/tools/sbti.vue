<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12 min-h-[80vh]">
      <!-- Home -->
      <div v-if="view === 'home'" class="space-y-8">
        <div class="text-center">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">SBTI · 沙雕人格测试</span>
          <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif mb-3">
            {{ $t('sbti.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] max-w-lg mx-auto">
            {{ $t('sbti.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
        </div>

        <div class="flex flex-wrap justify-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-xs text-[var(--accent)]">
            <UIcon name="i-heroicons-puzzle-piece" class="w-3.5 h-3.5" />
            {{ $t('sbti.knowledgeCard1Title') }}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
            27 {{ $t('sbti.knowledgeCard2Title') }}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
            {{ $t('sbti.knowledgeCard4Title') }}
          </span>
        </div>

        <div class="max-w-sm mx-auto">
          <UButton
            color="warning"
            size="lg"
            block
            class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
            @click="start"
          >
            {{ $t('sbti.startBtn') }}
          </UButton>
          <p class="text-center text-xs text-[var(--text-faint)] mt-3">
            {{ $t('sbti.questionCount') }}
          </p>
        </div>

        <!-- 知识卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-puzzle-piece" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sbti.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sbti.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sbti.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sbti.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sbti.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sbti.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sbti.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sbti.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- Quiz -->
      <div v-else-if="view === 'quiz'" class="max-w-2xl mx-auto">
        <div class="mb-6">
          <div class="flex items-center justify-between text-xs text-[var(--text-faint)] mb-2">
            <span>{{ $t('sbti.questionProgress', { current: currentIndex + 1, total: questions.length }) }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
            <div class="h-full bg-[var(--accent)] rounded-full transition-all duration-300" :style="{ width: `${progress}%` }" />
          </div>
        </div>

        <transition name="sbti-fade" mode="out-in">
          <div v-if="currentQuestion" :key="currentQuestion.id">
            <p v-if="currentQuestion.isHidden" class="text-[11px] tracking-wider text-[var(--accent)] uppercase mb-3">{{ $t('sbti.hiddenQuestion') }}</p>
            <h2 class="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-relaxed mb-8 font-serif">
              {{ currentQuestion.text }}
            </h2>

            <div class="space-y-3">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4"
                :class="answers[currentQuestion.id] === option.id
                  ? 'bg-[var(--accent-bg)] border-[var(--accent)] shadow-md'
                  : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)]'"
                @click="selectOption(option)"
              >
                <span class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5"
                  :class="answers[currentQuestion.id] === option.id ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-medium)]'"
                >
                  <span v-if="answers[currentQuestion.id] === option.id" class="w-2.5 h-2.5 rounded-full bg-[var(--surface-bg)]" />
                </span>
                <span class="text-base text-[var(--text-body)]">{{ option.text }}</span>
              </button>
            </div>
          </div>
        </transition>

        <div class="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="currentIndex === 0"
            @click="goPrev"
          >
            ← {{ $t('sbti.prev') }}
          </UButton>
          <UButton
            color="warning"
            :disabled="!canGoNext"
            @click="goNext"
          >
            {{ isLast ? $t('sbti.viewResult') : $t('sbti.next') }}
            <template v-if="!isLast" #trailing>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </template>
          </UButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="view === 'loading'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative w-24 h-24 mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-[var(--border-light)]" />
          <div class="absolute inset-0 rounded-full border-4 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span class="absolute inset-0 flex items-center justify-center text-3xl">🌀</span>
        </div>
        <p class="text-lg font-semibold text-[var(--text-primary)] mb-2">{{ $t('sbti.loading') }}</p>
        <p class="text-sm text-[var(--text-faint)]">{{ loadingText }}</p>
      </div>

      <!-- Result -->
      <div v-else-if="view === 'result' && result" class="max-w-2xl mx-auto pb-12">
        <div
          ref="shareCardRef"
          class="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
          :style="{ background: `linear-gradient(180deg, ${result.gradient[0]}22, ${result.gradient[1]}15), var(--surface-card)` }"
        >
          <div class="relative z-10">
            <div class="flex flex-col items-center text-center mb-6">
              <div class="text-7xl md:text-8xl mb-4">{{ result.icon }}</div>
              <span
                class="text-[11px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full mb-3 border"
                :class="rarityBadgeClass(result.rarity)"
              >
                {{ $t(`sbti.rarity${result.rarity}`) }} · {{ result.percent }}%
              </span>
              <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] font-serif mb-1">
                {{ result.name }}
              </h2>
              <p class="font-mono text-sm text-[var(--text-muted)] tracking-widest uppercase">
                {{ result.alias }}
              </p>
              <p class="text-sm text-[var(--accent)] mt-2">
                {{ $t('sbti.resultMatch', { similarity: result.similarity }) }}
              </p>
            </div>

            <blockquote class="text-center mb-5">
              <p class="text-lg font-serif italic text-[var(--text-primary)]">“{{ result.quote }}”</p>
            </blockquote>

            <p class="text-sm text-[var(--text-body)] leading-relaxed text-center mb-5">
              {{ result.description }}
            </p>

            <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-4 mb-5">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">{{ $t('sbti.resultTraits') }}</p>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ result.traits }}</p>
            </div>

            <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">{{ $t('sbti.dimensionsTitle') }}</p>
                <p class="text-[10px] font-mono text-[var(--text-muted)]">{{ formattedGradeCode }}</p>
              </div>
              <div class="space-y-3">
                <div v-for="dim in sbtiDimensions" :key="dim.id">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="text-[var(--text-muted)]">{{ dim.name }}</span>
                    <span class="font-mono font-medium text-[var(--text-primary)]">{{ dimensionGrade(dim.id) }}</span>
                  </div>
                  <div class="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700 bg-[var(--accent)]"
                      :style="{ width: `${dimensionPercent(dim.id)}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center mb-4">
          <AppShareButton
            v-if="result"
            tool="sbti"
            :name="t('sbti.shareName')"
            :summary="shareSummary"
            :share-target="shareCardRef ?? undefined"
            :filename="`sbti-${result.code}.png`"
          />
        </div>

        <div class="flex items-center justify-center gap-4">
          <button class="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" @click="restart">
            {{ $t('sbti.retest') }}
          </button>
          <span class="text-[var(--border-medium)]">|</span>
          <button class="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" @click="showEncyclopedia()">
            {{ $t('sbti.encyclopedia') }}
          </button>
        </div>

        <p class="text-center text-[11px] text-[var(--text-faint)] mt-6">{{ $t('sbti.footerDisclaimer') }}</p>
      </div>

      <!-- Encyclopedia -->
      <div v-else-if="view === 'encyclopedia'" class="pb-12">
        <div class="flex items-center gap-3 mb-6">
          <UButton
            variant="ghost"
            color="neutral"
            @click="goHome"
          >
            ← {{ $t('sbti.back') }}
          </UButton>
          <h2 class="text-xl md:text-2xl font-bold text-[var(--text-primary)] font-serif">{{ $t('sbti.encyclopediaTitle') }}</h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="p in allPersonalities"
            :key="p.code"
            class="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-4 text-center hover:bg-[var(--surface-card-hover)] hover:border-[var(--accent-border-hover)] transition-all"
            @click="selectEncyclopedia(p)"
          >
            <div class="text-5xl mb-3">{{ p.icon }}</div>
            <p class="text-sm font-semibold text-[var(--text-primary)]">{{ p.name }}</p>
            <p class="text-[10px] font-mono text-[var(--text-muted)] uppercase">{{ p.alias }}</p>
            <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ $t(`sbti.rarity${p.rarity}`) }} · {{ p.percent }}%</p>
          </button>
        </div>

        <!-- Detail Modal -->
        <div
          v-if="encyclopediaSelected"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-bg)] backdrop-blur-sm"
          @click.self="closeEncyclopediaModal"
        >
          <div
            class="max-w-sm w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative border border-[var(--border-subtle)]"
            :style="{ background: `linear-gradient(180deg, ${encyclopediaSelected.gradient[0]}22, ${encyclopediaSelected.gradient[1]}15), var(--surface-elevated)` }"
          >
            <button
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface-card)] text-[var(--text-muted)] hover:bg-[var(--surface-card-hover)] flex items-center justify-center transition-colors"
              @click="closeEncyclopediaModal"
            >
              ✕
            </button>
            <div class="text-center">
              <div class="text-7xl mb-3">{{ encyclopediaSelected.icon }}</div>
              <h3 class="text-2xl font-bold text-[var(--text-primary)] font-serif">{{ encyclopediaSelected.name }}</h3>
              <p class="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest">{{ encyclopediaSelected.alias }}</p>
              <p class="text-xs text-[var(--text-faint)] mt-1">{{ $t(`sbti.rarity${encyclopediaSelected.rarity}`) }} · {{ encyclopediaSelected.percent }}%</p>
            </div>
            <blockquote class="text-center my-4">
              <p class="text-sm font-serif italic text-[var(--text-primary)]">“{{ encyclopediaSelected.quote }}”</p>
            </blockquote>
            <p class="text-sm text-[var(--text-body)] leading-relaxed mb-4">{{ encyclopediaSelected.description }}</p>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/60 p-3 mb-4">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-1">{{ $t('sbti.resultTraits') }}</p>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ encyclopediaSelected.traits }}</p>
            </div>
            <UButton color="warning" block @click="closeEncyclopediaModal">
              {{ $t('sbti.close') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SbtiAnswer, SbtiOption, SbtiPersonality, SbtiResult, SbtiView } from '~/types/sbti'
import {
  calculateSbtiDimensionScores,
  calculateSbtiPersonality,
  sbtiDimensions,
  formatSbtiGradeCode,
  getAllSbtiPersonalities,
  getDrunkQuestion,
  getGateQuestion,
  getSbtiMainQuestions,
  getSbtiPersonalityByCode,
} from '~/utils/sbti-data'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/sbti'

const view = ref<SbtiView>('home')
const questions = ref<ReturnType<typeof getSbtiMainQuestions>>([])
const currentIndex = ref(0)
const answers = ref<Record<string, string>>({})
const drunkInserted = ref(false)
const loadingText = ref('')
const result = ref<SbtiResult | null>(null)
const encyclopediaSelected = ref<SbtiPersonality | null>(null)
const shareCardRef = ref<HTMLDivElement | null>(null)

const loadingLines = [
  t('sbti.loadingLine1'),
  t('sbti.loadingLine2'),
  t('sbti.loadingLine3'),
]

useSeoMeta({
  title: () => `${t('seo.sbtiTitle')} - ${siteName}`,
  description: t('seo.sbtiDesc'),
  keywords: t('seo.sbtiKeywords'),
  ogTitle: () => `${t('seo.sbtiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.sbtiOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.sbtiTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.sbtiDesc'),
        mainEntity: {
          '@type': 'Quiz',
          name: t('sbti.title'),
          description: t('sbti.subtitle'),
          about: 'SBTI personality test',
          educationalLevel: '娱乐向人格测试',
          inLanguage: 'zh-CN',
        },
      }),
    },
  ],
}))

onMounted(() => {
  const type = route.query.type as string | undefined
  if (type) {
    const p = getSbtiPersonalityByCode(type)
    if (p) {
      result.value = {
        ...p,
        similarity: p.code === 'DRUNK' ? 100 : p.code === 'HHHH' ? 0 : 100,
        gradeCode: p.pattern || p.code,
      }
      view.value = 'result'
      return
    }
  }
  view.value = 'home'
})

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const progress = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((currentIndex.value / (questions.value.length - 1)) * 100)
})
const isLast = computed(() => currentIndex.value === questions.value.length - 1)
const canGoNext = computed(() => {
  const q = currentQuestion.value
  return !!q && !!answers.value[q.id]
})

const allPersonalities = computed(() => getAllSbtiPersonalities())

const formattedGradeCode = computed(() => {
  if (!result.value) return ''
  return formatSbtiGradeCode(result.value.gradeCode)
})

const dimensionScores = computed(() => {
  if (!result.value) return null
  if (result.value.gradeCode === 'DRUNK' || result.value.code === 'HHHH') return null
  const list: SbtiAnswer[] = Object.entries(answers.value).map(([questionId, optionId]) => ({ questionId, optionId }))
  return calculateSbtiDimensionScores(list)
})

const shareSummary = computed(() => {
  if (!result.value) return ''
  const { name, alias, similarity } = result.value
  return `${name} · ${alias}（匹配度 ${similarity}%）`
})

function dimensionGrade(dim: string) {
  const scores = dimensionScores.value
  if (!scores) return '-'
  const total = scores[dim as keyof typeof scores] as number
  if (total <= 3) return 'L'
  if (total === 4) return 'M'
  return 'H'
}

function dimensionPercent(dim: string) {
  const scores = dimensionScores.value
  if (!scores) return 0
  const total = scores[dim as keyof typeof scores] as number
  if (total <= 2) return 0
  if (total === 3) return 25
  if (total === 4) return 50
  if (total === 5) return 75
  return 100
}

function rarityBadgeClass(rarity: string) {
  switch (rarity) {
    case 'SSR': return 'bg-red-500/10 border-red-500/30 text-red-400'
    case 'SR': return 'bg-purple-500/10 border-purple-500/30 text-purple-400'
    case 'R': return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    default: return 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'
  }
}

function start() {
  questions.value = [...getSbtiMainQuestions()]
  questions.value.splice(15, 0, getGateQuestion())
  currentIndex.value = 0
  answers.value = {}
  drunkInserted.value = false
  result.value = null
  view.value = 'quiz'
}

function selectOption(option: SbtiOption) {
  const q = currentQuestion.value
  if (!q) return
  answers.value[q.id] = option.id
  if (q.id === 'gate') {
    if (option.triggerHidden && !drunkInserted.value) {
      questions.value.splice(currentIndex.value + 1, 0, getDrunkQuestion())
      drunkInserted.value = true
    }
    else if (!option.triggerHidden && drunkInserted.value) {
      questions.value = questions.value.filter(x => x.id !== 'drunk')
      delete answers.value.drunk
      drunkInserted.value = false
    }
  }
}

function goNext() {
  if (!canGoNext.value) return
  if (isLast.value) {
    finish()
  }
  else {
    currentIndex.value++
  }
}

function goPrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function finish() {
  loadingText.value = loadingLines[Math.floor(Math.random() * loadingLines.length)] || ''
  view.value = 'loading'
  setTimeout(() => {
    const answerList: SbtiAnswer[] = Object.entries(answers.value).map(([questionId, optionId]) => ({ questionId, optionId }))
    result.value = calculateSbtiPersonality(answerList)
    router.replace({ query: { ...route.query, type: result.value.code } })
    view.value = 'result'
  }, 1600)
}

function restart() {
  router.replace({ query: { ...route.query, type: undefined } })
  start()
}

function showEncyclopedia(code?: string) {
  if (code) {
    const p = getSbtiPersonalityByCode(code)
    if (p) encyclopediaSelected.value = p
  }
  view.value = 'encyclopedia'
}

function goHome() {
  view.value = 'home'
}

function closeEncyclopediaModal() {
  encyclopediaSelected.value = null
}

function selectEncyclopedia(p: SbtiPersonality) {
  encyclopediaSelected.value = p
}
</script>

<style scoped>
.sbti-fade-enter-active,
.sbti-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sbti-fade-enter-from,
.sbti-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
