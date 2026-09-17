<template>
  <div class="wlp">
    <div class="wlp-sheet">
      <div class="wlp-topbar">
        <span>{{ $t('wenshuPoster.kicker') }}</span>
        <span>{{ $t('wenshuPoster.serial') }}</span>
      </div>

      <header class="wlp-head">
        <div class="min-w-0">
          <p class="wlp-number">{{ $t('wenshuPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="wlp-title">{{ result.fortune.title }}</h2>
          <p class="wlp-level">{{ result.fortune.level }}</p>
        </div>
        <span class="wlp-seal" aria-hidden="true">智</span>
      </header>

      <section class="wlp-question">
        <span>{{ $t('wenshuPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('wenshuPoster.noQuestion') }}</p>
      </section>

      <section class="wlp-poem">
        <span>{{ $t('wenshuPoster.poemFlag') }}</span>
        <div class="wlp-poem-lines" aria-hidden="true">
          <span v-for="(line, index) in poemLines" :key="index">{{ line }}</span>
        </div>
      </section>

      <section class="wlp-meaning">
        <span>{{ $t('wenshuPoster.meaningLabel') }}</span>
        <p>{{ result.fortune.sacredMeaning || $t('wenshuPoster.meaningPending') }}</p>
      </section>

      <section class="wlp-guidance">
        <span>{{ $t('wenshuPoster.guidanceLabel') }}</span>
        <p :class="{ 'wlp-pending': !guidance }">
          {{ guidance || $t('wenshuPoster.guidancePending') }}
        </p>
      </section>

      <footer>
        <div>
          <p>{{ signDate }}</p>
          <p class="wlp-domain">{{ siteDomain }}</p>
        </div>
        <span class="wlp-qr" v-html="qrSvg" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WenshuFortune {
  number: number
  title: string
  level: string
  levelCode: string
  poem: string
  explanation: string
  advice: string
  sacredMeaning?: string
}

interface Props {
  result: {
    lotType: { id: string; name: string; count: number }
    fortune: WenshuFortune
    question?: string
  }
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { locale } = useI18n()
const siteDomain = 'www.ososn.com'

const poemLines = computed(() => props.result.fortune.poem
  .split(/[，,。；;、]/)
  .map(line => line.trim())
  .filter(Boolean))

const guidance = computed(() => {
  const text = props.aiContent || ''
  const match = text.match(/##\s*问事指引\s*\n([\s\S]*?)(?=\n##\s|$)/)
    || text.match(/##\s*Guidance\s*\n([\s\S]*?)(?=\n##\s|$)/i)
  if (match?.[1]) {
    const body = match[1].replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
    const sentenceEnd = body.search(/[。！？.!?]/)
    return sentenceEnd >= 0 ? body.slice(0, sentenceEnd + 1) : body
  }
  const fallback = text.replace(/#+\s*/g, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  if (!fallback) return ''
  const sentenceEnd = fallback.search(/[。！？.!?]/)
  return sentenceEnd >= 0 ? fallback.slice(0, sentenceEnd + 1) : fallback
})

const signDate = computed(() => {
  const date = new Date()
  if (locale.value === 'en') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  if (locale.value === 'ja') {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

const qrSvg = ref('')

onMounted(async () => {
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/wenshu-lot`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2d2a27', light: '#00000000' },
  })
})
</script>

<style scoped>
.wlp {
  --wlp-ink: #2d2a27;
  --wlp-paper: #f5f2ec;
  --wlp-line: #d8d1c3;
  --wlp-cinnabar: #9f4436;
  width: 100%;
  padding: 14px;
  color: var(--wlp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background: #e9e3d6;
}

.wlp-sheet {
  border: 1px solid var(--wlp-line);
  background: var(--wlp-paper);
  padding: 20px;
}

.wlp-topbar,
.wlp-question,
.wlp-meaning,
.wlp-guidance,
.wlp-sheet footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.wlp-topbar {
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--wlp-line);
  font-size: 12px;
}

.wlp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
}

.wlp-number,
.wlp-question span,
.wlp-meaning span,
.wlp-guidance span,
.wlp-poem span {
  font-size: 12px;
  opacity: 0.72;
}

.wlp-title {
  margin-top: 3px;
  font-size: clamp(26px, 6vw, 40px);
  font-weight: 700;
  line-height: 1.2;
}

.wlp-level {
  margin-top: 5px;
  font-size: 14px;
  color: var(--wlp-cinnabar);
}

.wlp-seal {
  display: grid;
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid var(--wlp-cinnabar);
  border-radius: 6px;
  color: var(--wlp-cinnabar);
  font-size: 28px;
  font-weight: 800;
}

.wlp-question,
.wlp-meaning,
.wlp-guidance {
  padding: 14px 0;
  border-top: 1px solid var(--wlp-line);
}

.wlp-question p,
.wlp-meaning p,
.wlp-guidance p {
  max-width: 72%;
  text-align: right;
  font-size: 13px;
  line-height: 1.6;
}

.wlp-poem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  min-height: 200px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--wlp-line);
}

.wlp-poem-lines {
  display: flex;
  flex-flow: column wrap;
  height: 180px;
  justify-content: flex-start;
  align-content: flex-end;
  gap: 12px;
  writing-mode: vertical-rl;
  font-size: clamp(20px, 4.5vw, 30px);
  font-weight: 600;
  line-height: 1.5;
}

.wlp-guidance {
  border-bottom: 0;
}

.wlp-pending {
  opacity: 0.55;
}

.wlp-sheet footer {
  align-items: flex-end;
  font-size: 12px;
}

.wlp-domain {
  font-weight: 600;
}

.wlp-qr {
  width: 62px;
  color: var(--wlp-ink);
}

.wlp-qr :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 520px) {
  .wlp-question,
  .wlp-meaning,
  .wlp-guidance {
    align-items: center;
    flex-direction: column;
  }

  .wlp-question p,
  .wlp-meaning p,
  .wlp-guidance p {
    max-width: 100%;
    text-align: left;
  }

  .wlp-poem {
    grid-template-columns: 1fr;
  }

  .wlp-poem-lines {
    align-content: center;
    height: 210px;
    font-size: 22px;
  }
}
</style>
