<script setup lang="ts">
import type { Question, Personality, FbtiView, Answer } from '~/types/fbti'
import {
  getMainQuestions,
  getHiddenQuestion,
  personalities,
  calculatePersonality,
  calculateScores,
  dimensions,
  getPersonalityByCode,
  shuffleQuestions,
} from '~/utils/fbti-data'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const view = ref<FbtiView>('home')
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<Record<string, string>>({})
const hiddenInserted = ref(false)
const loadingText = ref('')
const resultPersonality = ref<Personality | null>(null)
const resultScores = ref<Record<'A' | 'B' | 'C' | 'D', number> | null>(null)
const shareCardRef = ref<HTMLDivElement | null>(null)
const copying = ref(false)
const saving = ref(false)
const encyclopediaSelected = ref<Personality | null>(null)

const loadingLines = [
  '正在统计越位次数…',
  '正在询问幸运硬币…',
  '正在翻阅卷宗和 xG…',
  '正在检查沙发风水…',
  '正在给吉祥物补补水彩…',
]

useSeoMeta({
  title: () => `${t('fbti.seoTitle')} - ososn`,
  description: t('fbti.seoDesc'),
  keywords: t('fbti.seoKeywords'),
  ogTitle: () => `${t('fbti.seoTitle')} - ososn`,
  ogDescription: t('fbti.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/fbti',
  twitterCard: 'summary_large_image',
})

onMounted(() => {
  const type = route.query.type as string | undefined
  if (type && getPersonalityByCode(type)) {
    resultPersonality.value = getPersonalityByCode(type)!
    resultScores.value = resultPersonality.value.scores
    view.value = 'result'
    return
  }
  view.value = 'home'
})

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progress = computed(() => {
  if (!questions.value.length) return 0
  return Math.round(((currentIndex.value) / questions.value.length) * 100)
})
const isLast = computed(() => currentIndex.value === questions.value.length - 1)
const canGoNext = computed(() => {
  const q = currentQuestion.value
  return !!q && !!answers.value[q.id]
})

function start() {
  questions.value = shuffleQuestions(getMainQuestions())
  currentIndex.value = 0
  answers.value = {}
  hiddenInserted.value = false
  view.value = 'quiz'
}

function selectOption(option: Question['options'][number]) {
  const q = currentQuestion.value
  if (!q) return
  answers.value[q.id] = option.id
  if (option.triggerHidden && !hiddenInserted.value) {
    const hidden = getHiddenQuestion()
    questions.value.splice(currentIndex.value + 1, 0, hidden)
    hiddenInserted.value = true
  }
}

function goNext() {
  if (!canGoNext.value) return
  if (isLast.value) {
    loadingText.value = loadingLines[Math.floor(Math.random() * loadingLines.length)] || ''
    view.value = 'loading'
    setTimeout(() => {
      const answerList: Answer[] = Object.entries(answers.value).map(([questionId, optionId]) => ({ questionId, optionId }))
      resultPersonality.value = calculatePersonality(answerList)
      resultScores.value = calculateScores(answerList)
      view.value = 'result'
      router.replace({ query: { ...route.query, type: resultPersonality.value.code } })
    }, 1600)
  } else {
    currentIndex.value++
  }
}

function goPrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function restart() {
  router.replace({ query: { ...route.query, type: undefined } })
  start()
}

function showEncyclopedia(code?: string) {
  if (code) {
    const p = getPersonalityByCode(code)
    if (p) encyclopediaSelected.value = p
  }
  view.value = 'encyclopedia'
}

function buildShareText(p: Personality): string {
  const url = window.location.href
  return `我在 ososn 世界杯球迷人格测试里测出了「${p.name} · ${p.alias}」\n\n${p.quote}\n\n约 ${p.percentage}% 的球迷和我同款。你也来测测？\n👉 ${url}`
}

async function copyResult() {
  if (!resultPersonality.value || copying.value) return
  copying.value = true
  try {
    await navigator.clipboard.writeText(buildShareText(resultPersonality.value))
  } catch {
    // ignore
  }
  setTimeout(() => (copying.value = false), 1200)
}

async function saveCard() {
  if (!shareCardRef.value || saving.value) return
  saving.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(shareCardRef.value, {
      scale: 2,
      backgroundColor: '#FBF9F1',
      useCORS: true,
      logging: false,
    })
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '500 24px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillStyle = 'rgba(19,35,58,0.25)'
      ctx.textAlign = 'right'
      ctx.fillText('ososn · FBTI', canvas.width - 48, canvas.height - 40)
    }
    const link = document.createElement('a')
    link.download = `fbti-${resultPersonality.value!.code}.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    setTimeout(() => (saving.value = false), 800)
  }
}

function scoreLabel(dim: 'A' | 'B' | 'C' | 'D') {
  const d = dimensions.find(x => x.id === dim)!
  const s = resultScores.value![dim]
  return s >= 50 ? d.left : d.right
}

function scoreColor(dim: 'A' | 'B' | 'C' | 'D') {
  const d = dimensions.find(x => x.id === dim)!
  const s = resultScores.value![dim]
  return s >= 50 ? d.leftColor : d.rightColor
}

const thumbnailPersonas = computed(() =>
  ['ABCD', 'AbCD', 'aBCD', 'abCD', 'AbcD', 'abcD', 'aBcD', 'abcd']
    .map(getPersonalityByCode)
    .filter((p): p is Personality => !!p)
)
</script>

<template>
  <div class="fbti-page min-h-screen">
    <!-- Home -->
    <div v-if="view === 'home'" class="fbti-container">
      <div class="text-center pt-10 pb-6">
        <span class="inline-block text-[11px] tracking-[0.25em] uppercase text-[#9B2D20] font-medium mb-4">FBTI · 2026 FIFA World Cup</span>
        <h1 class="fbti-title text-[32px] md:text-[44px] leading-[1.1] mb-4">
          世界杯球迷人格测试
        </h1>
        <p class="text-[#13233A]/70 text-base md:text-lg">
          测测你是哪种球迷
        </p>
      </div>

      <div class="flex justify-center gap-3 flex-wrap mb-8">
        <div
          v-for="p in thumbnailPersonas"
          :key="p.code"
          class="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/60 border border-[#13233A]/8 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <FbtiMascotIcon
            :gradient="p.mascot.gradient"
            :symbol="p.mascot.symbol"
            :size="44"
          />
        </div>
      </div>

      <div class="max-w-sm mx-auto">
        <button class="fbti-btn-primary w-full py-4 rounded-2xl text-lg font-semibold tracking-wide" @click="start">
          开始测试
        </button>
        <p class="text-center text-xs text-[#13233A]/40 mt-4">
          24 道趣味题目 · 约 2 分钟 · 不上传任何数据
        </p>
      </div>

      <!-- 知识卡片 -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-xl border border-[#13233A]/8 bg-white/60 p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[#13233A]/50" />
            <h4 class="text-sm font-semibold text-[#13233A]">{{ $t('fbti.knowledgeCard1Title') }}</h4>
          </div>
          <p class="text-xs text-[#13233A]/55 leading-relaxed">{{ $t('fbti.knowledgeCard1Desc') }}</p>
        </div>
        <div class="rounded-xl border border-[#13233A]/8 bg-white/60 p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[#13233A]/50" />
            <h4 class="text-sm font-semibold text-[#13233A]">{{ $t('fbti.knowledgeCard2Title') }}</h4>
          </div>
          <p class="text-xs text-[#13233A]/55 leading-relaxed">{{ $t('fbti.knowledgeCard2Desc') }}</p>
        </div>
        <div class="rounded-xl border border-[#13233A]/8 bg-white/60 p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[#13233A]/50" />
            <h4 class="text-sm font-semibold text-[#13233A]">{{ $t('fbti.knowledgeCard3Title') }}</h4>
          </div>
          <p class="text-xs text-[#13233A]/55 leading-relaxed">{{ $t('fbti.knowledgeCard3Desc') }}</p>
        </div>
        <div class="rounded-xl border border-[#13233A]/8 bg-white/60 p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#13233A]/50" />
            <h4 class="text-sm font-semibold text-[#13233A]">{{ $t('fbti.knowledgeCard4Title') }}</h4>
          </div>
          <p class="text-xs text-[#13233A]/55 leading-relaxed">{{ $t('fbti.knowledgeCard4Desc') }}</p>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div v-for="dim in dimensions" :key="dim.id" class="rounded-xl bg-white/50 border border-[#13233A]/6 p-3">
          <p class="text-[10px] uppercase tracking-wider text-[#13233A]/45 mb-1">Dimension {{ dim.id }}</p>
          <p class="text-sm font-medium text-[#13233A]">{{ dim.left }}</p>
          <p class="text-[10px] text-[#13233A]/35">↔ {{ dim.right }}</p>
        </div>
      </div>
    </div>

    <!-- Quiz -->
    <div v-else-if="view === 'quiz'" class="fbti-container min-h-screen flex flex-col justify-center">
      <div class="mb-6">
        <div class="flex items-center justify-between text-xs text-[#13233A]/50 mb-2">
          <span>题目 {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-1.5 bg-[#13233A]/8 rounded-full overflow-hidden">
          <div class="h-full bg-[#9B2D20] rounded-full transition-all duration-300" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <transition name="fbti-fade" mode="out-in">
        <div v-if="currentQuestion" :key="currentQuestion.id">
          <p v-if="currentQuestion.isHidden" class="text-[11px] tracking-wider text-[#9B2D20] uppercase mb-3">隐藏支线题</p>
          <h2 class="fbti-title text-[24px] md:text-[32px] leading-[1.25] mb-8">
            {{ currentQuestion.text }}
          </h2>

          <div class="space-y-3">
            <button
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4"
              :class="answers[currentQuestion.id] === option.id
                ? 'bg-white border-[#9B2D20] shadow-md'
                : 'bg-white/60 border-[#13233A]/8 hover:border-[#13233A]/20 hover:bg-white'"
              @click="selectOption(option)"
            >
              <span class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5"
                :class="answers[currentQuestion.id] === option.id ? 'border-[#9B2D20] bg-[#9B2D20]' : 'border-[#13233A]/25'"
              >
                <span v-if="answers[currentQuestion.id] === option.id" class="w-2.5 h-2.5 rounded-full bg-white" />
              </span>
              <span class="text-base md:text-lg text-[#13233A]">{{ option.text }}</span>
            </button>
          </div>
        </div>
      </transition>

      <div class="flex items-center justify-between mt-5 pt-3 border-t border-[#13233A]/8">
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-medium text-[#13233A]/70 hover:bg-white/60 transition-colors disabled:opacity-30"
          :disabled="currentIndex === 0"
          @click="goPrev"
        >
          ← 上一题
        </button>
        <button
          class="fbti-btn-primary px-8 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!canGoNext"
          @click="goNext"
        >
          {{ isLast ? '看结果' : '下一题' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="view === 'loading'" class="fbti-container flex flex-col items-center justify-center min-h-[70vh]">
      <div class="relative w-24 h-24 mb-6">
        <div class="absolute inset-0 rounded-full border-4 border-[#13233A]/8" />
        <div class="absolute inset-0 rounded-full border-4 border-t-[#9B2D20] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <FbtiMascotIcon
          v-if="resultPersonality"
          :gradient="resultPersonality.mascot.gradient"
          :symbol="resultPersonality.mascot.symbol"
          :size="72"
          class="absolute inset-0 m-auto"
        />
      </div>
      <p class="text-lg fbti-title mb-2">正在生成你的球迷画像…</p>
      <p class="text-sm text-[#13233A]/55">{{ loadingText }}</p>
    </div>

    <!-- Result -->
    <div v-else-if="view === 'result' && resultPersonality && resultScores" class="fbti-container pb-20">
      <div class="max-w-md mx-auto">
        <!-- 分享卡渲染区（也用于展示） -->
        <div ref="shareCardRef" class="fbti-share-card rounded-3xl p-6 md:p-8 mb-6">
          <div class="flex flex-col items-center text-center">
            <FbtiMascotIcon
              :gradient="resultPersonality.mascot.gradient"
              :symbol="resultPersonality.mascot.symbol"
              :size="160"
              class="mb-4"
            />
            <p class="text-[11px] tracking-[0.2em] uppercase text-[#9B2D20] font-medium mb-2">
              约 {{ resultPersonality.percentage }}% 的球迷和你一样
            </p>
            <h2 class="fbti-title text-[28px] md:text-[36px] leading-none mb-1">
              {{ resultPersonality.name }}
            </h2>
            <p class="font-mono text-sm fbti-text-faint tracking-widest uppercase">
              {{ resultPersonality.alias }}
            </p>
          </div>

          <p class="mt-6 text-[15px] leading-relaxed fbti-desc text-center">
            {{ resultPersonality.description }}
          </p>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="fbti-card-section">
              <p class="fbti-card-label">优点</p>
              <p class="text-sm fbti-text-body leading-snug">{{ resultPersonality.pros }}</p>
            </div>
            <div class="fbti-card-section">
              <p class="fbti-card-label">小缺点</p>
              <p class="text-sm fbti-text-body leading-snug">{{ resultPersonality.cons }}</p>
            </div>
          </div>

          <div class="mt-5 fbti-card-section">
            <p class="fbti-card-label mb-3">四维度画像</p>
            <div class="space-y-3">
              <div v-for="dim in dimensions" :key="dim.id">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="fbti-text-muted">{{ dim.left }}</span>
                  <span class="font-mono font-medium fbti-text-body">{{ scoreLabel(dim.id) }} {{ resultScores[dim.id] }}</span>
                  <span class="fbti-text-muted">{{ dim.right }}</span>
                </div>
                <div class="h-2 fbti-bar-track rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{
                      width: `${resultScores[dim.id]}%`,
                      backgroundColor: scoreColor(dim.id),
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <blockquote class="mt-5 text-center">
            <p class="text-lg font-serif fbti-text-quote italic">“{{ resultPersonality.quote }}”</p>
          </blockquote>
        </div>

        <!-- 最配 / 最不配 -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            v-for="rel in ['bestMatch', 'worstMatch'] as const"
            :key="rel"
            class="rounded-2xl bg-white/70 border border-[#13233A]/8 p-4 text-left hover:bg-white transition-colors"
            @click="showEncyclopedia(resultPersonality[rel])"
          >
            <p class="text-[10px] uppercase tracking-wider text-[#13233A]/45 mb-2">{{ rel === 'bestMatch' ? '最配人格' : '最不配人格' }}</p>
            <div v-if="getPersonalityByCode(resultPersonality[rel])" class="flex items-center gap-3">
              <FbtiMascotIcon
                :gradient="getPersonalityByCode(resultPersonality[rel])!.mascot.gradient"
                :symbol="getPersonalityByCode(resultPersonality[rel])!.mascot.symbol"
                :size="44"
              />
              <div>
                <p class="text-sm font-semibold text-[#13233A]">{{ getPersonalityByCode(resultPersonality[rel])!.name }}</p>
                <p class="text-[10px] font-mono text-[#13233A]/50">{{ getPersonalityByCode(resultPersonality[rel])!.alias }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- 操作按钮 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="fbti-btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" @click="copyResult">
            <span>{{ copying ? '已复制' : '复制文案' }}</span>
          </button>
          <button class="fbti-btn-gold py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" @click="saveCard">
            <span>{{ saving ? '生成中…' : '保存分享卡' }}</span>
          </button>
        </div>

        <div class="flex items-center justify-center gap-4">
          <button class="text-sm text-[#13233A]/60 hover:text-[#9B2D20] transition-colors" @click="restart">
            再测一次
          </button>
          <span class="text-[#13233A]/20">|</span>
          <button class="text-sm text-[#13233A]/60 hover:text-[#9B2D20] transition-colors" @click="showEncyclopedia()">
            查看图鉴
          </button>
        </div>

        <p class="text-center text-[10px] text-[#13233A]/35 mt-6">仅供娱乐 · ososn FBTI</p>
      </div>
    </div>

    <!-- Encyclopedia -->
    <div v-else-if="view === 'encyclopedia'" class="fbti-container pb-20">
      <div class="flex items-center gap-3 mb-6">
        <button class="p-2 rounded-xl bg-white/60 border border-[#13233A]/8 text-[#13233A]/70 hover:bg-white" @click="view = 'home'">
          ← 返回
        </button>
        <h2 class="fbti-title text-2xl">16 型球迷图鉴</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="p in personalities"
          :key="p.code"
          class="rounded-2xl bg-white/70 border border-[#13233A]/8 p-4 text-center hover:bg-white hover:border-[#9B2D20]/30 transition-all"
          @click="encyclopediaSelected = p"
        >
          <FbtiMascotIcon :gradient="p.mascot.gradient" :symbol="p.mascot.symbol" :size="80" class="mx-auto mb-3" />
          <p class="text-sm font-semibold text-[#13233A]">{{ p.name }}</p>
          <p class="text-[10px] font-mono text-[#13233A]/50 uppercase">{{ p.alias }}</p>
          <p class="text-[10px] text-[#13233A]/40 mt-1">约 {{ p.percentage }}%</p>
        </button>
      </div>

      <!-- Detail Modal -->
      <div
        v-if="encyclopediaSelected"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13233A]/25 backdrop-blur-sm"
        @click.self="encyclopediaSelected = null"
      >
        <div class="fbti-share-card max-w-sm w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative">
          <button class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 text-[#13233A]/60 hover:bg-white flex items-center justify-center" @click="encyclopediaSelected = null">
            ✕
          </button>
          <div class="text-center">
            <FbtiMascotIcon
              :gradient="encyclopediaSelected.mascot.gradient"
              :symbol="encyclopediaSelected.mascot.symbol"
              :size="120"
              class="mx-auto mb-3"
            />
            <h3 class="fbti-title text-2xl">{{ encyclopediaSelected.name }}</h3>
            <p class="font-mono text-xs text-[#13233A]/55 uppercase tracking-widest">{{ encyclopediaSelected.alias }}</p>
            <p class="text-xs text-[#13233A]/45 mt-1">约 {{ encyclopediaSelected.percentage }}% 的球迷</p>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-[#13233A]/85">{{ encyclopediaSelected.description }}</p>
          <div class="mt-4 space-y-2 text-sm">
            <p><span class="text-[#13233A]/50">优点：</span>{{ encyclopediaSelected.pros }}</p>
            <p><span class="text-[#13233A]/50">小缺点：</span>{{ encyclopediaSelected.cons }}</p>
            <p class="font-serif italic text-[#13233A]/80 mt-2">“{{ encyclopediaSelected.quote }}”</p>
          </div>
          <button class="fbti-btn-primary w-full mt-5 py-2.5 rounded-xl text-sm font-medium" @click="encyclopediaSelected = null">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fbti-page {
  background-color: #FBF9F1;
  color: #13233A;
  transition: opacity 0.2s ease;
}
.fbti-page * {
  -webkit-tap-highlight-color: transparent;
}
.fbti-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.25rem;
}
@media (min-width: 768px) {
  .fbti-container {
    padding: 2rem;
  }
}
.fbti-title {
  font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #13233A;
}
.fbti-btn-primary {
  background-color: #9B2D20;
  color: #FBF9F1;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  box-shadow: 0 4px 14px rgba(155, 45, 32, 0.18);
}
.fbti-btn-primary:hover:not(:disabled) {
  background-color: #7f2419;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(155, 45, 32, 0.24);
}
.fbti-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.fbti-btn-gold {
  background-color: #C8A45C;
  color: #FBF9F1;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  box-shadow: 0 4px 14px rgba(200, 164, 92, 0.18);
}
.fbti-btn-gold:hover:not(:disabled) {
  background-color: #b08d4a;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(200, 164, 92, 0.24);
}
.fbti-btn-gold:active:not(:disabled) {
  transform: translateY(0);
}
.fbti-share-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(251,249,241,0.95));
  border: 1px solid rgba(19, 35, 58, 0.08);
  box-shadow: 0 12px 40px rgba(19, 35, 58, 0.06);
}
.fbti-card-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  padding: 1rem;
}
.fbti-card-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(19, 35, 58, 0.45);
  margin-bottom: 0.25rem;
}
.fbti-text-body { color: #13233A; }
.fbti-text-muted { color: rgba(19, 35, 58, 0.6); }
.fbti-text-faint { color: rgba(19, 35, 58, 0.55); }
.fbti-desc { color: rgba(19, 35, 58, 0.85); }
.fbti-text-quote { color: rgba(19, 35, 58, 0.9); }
.fbti-bar-track { background: rgba(19, 35, 58, 0.08); }

.fbti-fade-enter-active,
.fbti-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fbti-fade-enter-from,
.fbti-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Dimension bars: ensure left/right placement works */
.fbti-share-card .h-2 > div {
  min-width: 4px;
}
</style>
