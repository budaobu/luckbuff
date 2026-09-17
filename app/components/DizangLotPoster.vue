<template>
  <div class="dzlp">
    <div class="dzlp-sheet">
      <div class="dzlp-topbar">
        <span>{{ $t('dizangPoster.kicker') }}</span>
        <span>{{ $t('dizangPoster.serial') }}</span>
      </div>

      <header class="dzlp-head">
        <div class="min-w-0">
          <p class="dzlp-number">{{ $t('dizangPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="dzlp-title">{{ result.fortune.title }}</h2>
          <p class="dzlp-level">{{ result.fortune.level }}</p>
        </div>
        <span class="dzlp-seal" aria-hidden="true">愿</span>
      </header>

      <section class="dzlp-question">
        <span>{{ $t('dizangPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('dizangPoster.noQuestion') }}</p>
      </section>

      <section class="dzlp-poem">
        <span>{{ $t('dizangPoster.poemFlag') }}</span>
        <div class="dzlp-poem-lines" aria-hidden="true">
          <span v-for="(line, index) in poemLines" :key="index">{{ line }}</span>
        </div>
      </section>

      <section class="dzlp-meaning">
        <span>{{ $t('dizangPoster.meaningLabel') }}</span>
        <p>{{ result.fortune.sacredMeaning || $t('dizangPoster.meaningPending') }}</p>
      </section>

      <section class="dzlp-guidance">
        <span>{{ $t('dizangPoster.guidanceLabel') }}</span>
        <p :class="{ 'dzlp-pending': !guidance }">
          {{ guidance || $t('dizangPoster.guidancePending') }}
        </p>
      </section>

      <footer>
        <div>
          <p>{{ signDate }}</p>
          <p class="dzlp-domain">{{ siteDomain }}</p>
        </div>
        <span class="dzlp-qr" v-html="qrSvg" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DizangFortune {
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
    fortune: DizangFortune
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
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/dizang-lot`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#2d2a27', light: '#00000000' },
  })
})
</script>

<style scoped>
.dzlp {
  --dzlp-ink: #2d2a27;
  --dzlp-paper: #f4f1ea;
  --dzlp-line: #d6d0c4;
  --dzlp-cinnabar: #845f3a;
  width: 100%;
  padding: 14px;
  color: var(--dzlp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background: #e7e2d8;
}

.dzlp-sheet {
  border: 1px solid var(--dzlp-line);
  background: var(--dzlp-paper);
  padding: 20px;
}

.dzlp-topbar,
.dzlp-question,
.dzlp-meaning,
.dzlp-guidance,
.dzlp-sheet footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dzlp-topbar {
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--dzlp-line);
  font-size: 12px;
}

.dzlp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
}

.dzlp-number,
.dzlp-question span,
.dzlp-meaning span,
.dzlp-guidance span,
.dzlp-poem span {
  font-size: 12px;
  opacity: 0.72;
}

.dzlp-title {
  margin-top: 3px;
  font-size: clamp(26px, 6vw, 40px);
  font-weight: 700;
  line-height: 1.2;
}

.dzlp-level {
  margin-top: 5px;
  font-size: 14px;
  color: var(--dzlp-cinnabar);
}

.dzlp-seal {
  display: grid;
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid var(--dzlp-cinnabar);
  border-radius: 6px;
  color: var(--dzlp-cinnabar);
  font-size: 28px;
  font-weight: 800;
}

.dzlp-question,
.dzlp-meaning,
.dzlp-guidance {
  padding: 14px 0;
  border-top: 1px solid var(--dzlp-line);
}

.dzlp-question p,
.dzlp-meaning p,
.dzlp-guidance p {
  max-width: 72%;
  text-align: right;
  font-size: 13px;
  line-height: 1.6;
}

.dzlp-poem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  min-height: 200px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--dzlp-line);
}

.dzlp-poem-lines {
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

.dzlp-guidance p.dzlp-pending {
  opacity: 0.55;
}

.dzlp-sheet footer {
  padding-top: 14px;
  border-top: 1px solid var(--dzlp-line);
  font-size: 12px;
}

.dzlp-domain {
  opacity: 0.72;
}

.dzlp-qr {
  display: block;
  width: 54px;
  height: 54px;
}

.dzlp-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

@media (max-width: 420px) {
  .dzlp-head {
    gap: 16px;
  }

  .dzlp-seal,
  .dzlp-qr {
    width: 44px;
    height: 44px;
  }

  .dzlp-seal {
    font-size: 22px;
    border-width: 2px;
  }

  .dzlp-poem-lines {
    height: 160px;
    font-size: clamp(18px, 5vw, 24px);
  }
}
</style>
