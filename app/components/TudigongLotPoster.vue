<template>
  <div class="tdlp">
    <div class="tdlp-sheet">
      <div class="tdlp-topbar">
        <span>{{ $t('tudigongPoster.kicker') }}</span>
        <span>{{ $t('tudigongPoster.serial') }}</span>
      </div>

      <header class="tdlp-head">
        <div class="min-w-0">
          <p class="tdlp-number">{{ $t('tudigongPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="tdlp-title">{{ result.fortune.level }}</h2>
          <p class="tdlp-level">{{ result.fortune.title }}</p>
        </div>
        <span class="tdlp-seal" aria-hidden="true">土</span>
      </header>

      <section class="tdlp-question">
        <span>{{ $t('tudigongPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('tudigongPoster.noQuestion') }}</p>
      </section>

      <section class="tdlp-poem">
        <span>{{ $t('tudigongPoster.poemFlag') }}</span>
        <div class="tdlp-poem-lines" aria-hidden="true">
          <span v-for="(line, index) in poemLines" :key="index">{{ line }}</span>
        </div>
      </section>

      <section class="tdlp-meaning">
        <span>{{ $t('tudigongPoster.meaningLabel') }}</span>
        <p>{{ result.fortune.sacredMeaning || $t('tudigongPoster.meaningPending') }}</p>
      </section>

      <section class="tdlp-guidance">
        <span>{{ $t('tudigongPoster.guidanceLabel') }}</span>
        <p :class="{ 'tdlp-pending': !guidance }">
          {{ guidance || $t('tudigongPoster.guidancePending') }}
        </p>
      </section>

      <footer>
        <div>
          <p>{{ signDate }}</p>
          <p class="tdlp-domain">{{ siteDomain }}</p>
        </div>
        <span class="tdlp-qr" v-html="qrSvg" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TudigongFortune {
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
    fortune: TudigongFortune
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
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/tudigong-lot`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2d2a27', light: '#00000000' },
  })
})
</script>

<style scoped>
.tdlp {
  --tdlp-ink: #2d2a27;
  --tdlp-paper: #f4f1ea;
  --tdlp-line: #d6d0c4;
  --tdlp-cinnabar: #845f3a;
  width: 100%;
  padding: 14px;
  color: var(--tdlp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background: #e7e2d8;
}

.tdlp-sheet {
  border: 1px solid var(--tdlp-line);
  background: var(--tdlp-paper);
  padding: 20px;
}

.tdlp-topbar,
.tdlp-question,
.tdlp-meaning,
.tdlp-guidance,
.tdlp-sheet footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tdlp-topbar {
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--tdlp-line);
  font-size: 12px;
}

.tdlp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
}

.tdlp-number,
.tdlp-question span,
.tdlp-meaning span,
.tdlp-guidance span,
.tdlp-poem span {
  font-size: 12px;
  opacity: 0.72;
}

.tdlp-title {
  margin-top: 3px;
  font-size: clamp(26px, 6vw, 40px);
  font-weight: 700;
  line-height: 1.2;
}

.tdlp-level {
  margin-top: 5px;
  font-size: 14px;
  color: var(--tdlp-cinnabar);
}

.tdlp-seal {
  display: grid;
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid var(--tdlp-cinnabar);
  border-radius: 6px;
  color: var(--tdlp-cinnabar);
  font-size: 28px;
  font-weight: 800;
}

.tdlp-question,
.tdlp-meaning,
.tdlp-guidance {
  padding: 14px 0;
  border-top: 1px solid var(--tdlp-line);
}

.tdlp-question p,
.tdlp-meaning p,
.tdlp-guidance p {
  max-width: 72%;
  text-align: right;
  font-size: 13px;
  line-height: 1.6;
}

.tdlp-poem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  min-height: 200px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--tdlp-line);
}

.tdlp-poem-lines {
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

.tdlp-guidance p.tdlp-pending {
  opacity: 0.55;
}

.tdlp-sheet footer {
  padding-top: 14px;
  border-top: 1px solid var(--tdlp-line);
  font-size: 12px;
}

.tdlp-domain {
  opacity: 0.72;
}

.tdlp-qr {
  display: block;
  width: 54px;
  height: 54px;
}

.tdlp-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

@media (max-width: 420px) {
  .tdlp-head {
    gap: 16px;
  }

  .tdlp-seal,
  .tdlp-qr {
    width: 44px;
    height: 44px;
  }

  .tdlp-seal {
    font-size: 22px;
    border-width: 2px;
  }

  .tdlp-poem-lines {
    height: 160px;
    font-size: clamp(18px, 5vw, 24px);
  }
}
</style>
