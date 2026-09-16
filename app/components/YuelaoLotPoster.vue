<template>
  <div class="ylp">
    <div class="ylp-sheet">
      <div class="ylp-topbar">
        <span>{{ $t('yuelaoPoster.kicker') }}</span>
        <span>{{ $t('yuelaoPoster.serial') }}</span>
      </div>

      <header class="ylp-head">
        <div>
          <p class="ylp-number">{{ $t('yuelaoPoster.numberLine', { number: result.fortune.id }) }}</p>
          <h2 class="ylp-title">{{ result.fortune.rank }}</h2>
        </div>
        <span class="ylp-seal" aria-hidden="true">缘</span>
      </header>

      <section class="ylp-question">
        <span>{{ $t('yuelaoPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('yuelaoPoster.noQuestion') }}</p>
      </section>

      <section class="ylp-poem">
        <span>{{ $t('yuelaoPoster.poemFlag') }}</span>
        <div class="ylp-poem-lines" aria-hidden="true">
          <span v-for="(line, index) in poemLines" :key="index">{{ line }}</span>
        </div>
      </section>

      <section class="ylp-source">
        <span>{{ $t('yuelaoPoster.sourceLabel') }}</span>
        <p>{{ result.fortune.source || $t('yuelaoPoster.sourcePending') }}</p>
      </section>

      <section class="ylp-guidance">
        <span>{{ $t('yuelaoPoster.guidanceLabel') }}</span>
        <p :class="{ 'ylp-pending': !guidance }">
          {{ guidance || $t('yuelaoPoster.guidancePending') }}
        </p>
      </section>

      <footer>
        <div>
          <p>{{ signDate }}</p>
          <p class="ylp-domain">{{ siteDomain }}</p>
        </div>
        <span class="ylp-qr" v-html="qrSvg" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface YuelaoFortune {
  id: number
  rank: string
  rankCode: string
  poem: string
  source: string
}

interface Props {
  result: {
    lotType: { id: string; name: string; count: number }
    fortune: YuelaoFortune
    question?: string
  }
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { locale } = useI18n()
const siteDomain = 'www.ososn.com'

const poemLines = computed(() => props.result.fortune.poem.split('\n').map(line => line.trim()).filter(Boolean))

const guidance = computed(() => {
  const text = props.aiContent || ''
  const match = text.match(/##\s*问事指引\s*\n([\s\S]*?)(?=\n##\s|$)/)
    || text.match(/##\s*Guidance\s*\n([\s\S]*?)(?=\n##\s|$)/i)
  if (!match?.[1]) return ''
  const body = match[1].replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentenceEnd = body.search(/[。！？.!?]/)
  return sentenceEnd >= 0 ? body.slice(0, sentenceEnd + 1) : body
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
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/yuelao-lot`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#3a2e1f', light: '#00000000' },
  })
})
</script>

<style scoped>
.ylp {
  --ylp-ink: #3a2e1f;
  --ylp-paper: #f6efdb;
  --ylp-line: #d3c6a6;
  --ylp-cinnabar: #b23a2c;
  width: 100%;
  padding: 14px;
  color: var(--ylp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background:
    repeating-linear-gradient(0deg, rgba(150, 125, 75, 0.05) 0 2px, transparent 2px 5px),
    #e7dcc0;
}

.ylp-sheet {
  border: 1px solid var(--ylp-line);
  background: var(--ylp-paper);
  padding: 20px;
}

.ylp-topbar,
.ylp-question,
.ylp-source,
.ylp-guidance,
.ylp-sheet footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ylp-topbar {
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ylp-line);
  font-size: 12px;
}

.ylp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
}

.ylp-number,
.ylp-question span,
.ylp-source span,
.ylp-guidance span,
.ylp-poem span {
  font-size: 12px;
  opacity: 0.72;
}

.ylp-title {
  margin-top: 3px;
  font-size: clamp(28px, 7vw, 44px);
  font-weight: 700;
}

.ylp-seal {
  display: grid;
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid var(--ylp-cinnabar);
  border-radius: 6px;
  color: var(--ylp-cinnabar);
  font-size: 28px;
  font-weight: 800;
}

.ylp-question {
  margin-top: 18px;
  padding: 12px 0;
  border-top: 1px solid var(--ylp-line);
  border-bottom: 1px solid var(--ylp-line);
}

.ylp-question p,
.ylp-source p,
.ylp-guidance p {
  max-width: 70%;
  text-align: right;
  font-size: 13px;
}

.ylp-poem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  min-height: 210px;
  align-items: center;
  padding: 22px 0;
  border-bottom: 1px solid var(--ylp-line);
}

.ylp-poem-lines {
  display: flex;
  flex-flow: column wrap;
  height: 190px;
  justify-content: flex-start;
  align-content: flex-end;
  gap: 12px;
  writing-mode: vertical-rl;
  font-size: clamp(21px, 5vw, 31px);
  font-weight: 600;
  line-height: 1.5;
}

.ylp-source,
.ylp-guidance {
  padding: 15px 0;
  border-bottom: 1px solid var(--ylp-line);
  align-items: flex-start;
}

.ylp-guidance {
  border-bottom: 0;
}

.ylp-pending {
  opacity: 0.55;
}

.ylp-sheet footer {
  align-items: flex-end;
  font-size: 12px;
}

.ylp-domain {
  font-weight: 600;
}

.ylp-qr {
  width: 62px;
  color: var(--ylp-ink);
}

.ylp-qr :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 520px) {
  .ylp-question,
  .ylp-source,
  .ylp-guidance {
    align-items: center;
    flex-direction: column;
  }

  .ylp-question p,
  .ylp-source p,
  .ylp-guidance p {
    max-width: 100%;
    text-align: left;
  }

  .ylp-poem {
    grid-template-columns: 1fr;
  }

  .ylp-poem-lines {
    align-content: center;
    height: 220px;
    font-size: 22px;
  }
}
</style>
