<template>
  <div class="bslp">
    <div class="bslp-sheet">
      <div class="bslp-topbar">
        <span>{{ $t('baoshengPoster.kicker') }}</span>
        <span>{{ $t('baoshengPoster.serial') }}</span>
      </div>

      <header class="bslp-head">
        <div class="min-w-0">
          <p class="bslp-number">{{ $t('baoshengPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="bslp-title">{{ result.fortune.level }}</h2>
        </div>
        <span class="bslp-seal" aria-hidden="true">保</span>
      </header>

      <section class="bslp-question">
        <span>{{ $t('baoshengPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('baoshengPoster.noQuestion') }}</p>
      </section>

      <section class="bslp-poem">
        <span>{{ $t('baoshengPoster.poemFlag') }}</span>
        <div class="bslp-poem-lines" aria-hidden="true">
          <span v-for="(line, index) in poemLines" :key="index">{{ line }}</span>
        </div>
      </section>

      <section class="bslp-judgments">
        <span>{{ $t('baoshengPoster.judgmentsLabel') }}</span>
        <dl>
          <div v-for="judgment in result.fortune.categoryJudgments || []" :key="judgment.label">
            <dt>{{ judgment.label }}</dt>
            <dd>{{ judgment.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="bslp-guidance">
        <span>{{ $t('baoshengPoster.guidanceLabel') }}</span>
        <p :class="{ 'bslp-pending': !guidance }">{{ guidance || $t('baoshengPoster.guidancePending') }}</p>
      </section>

      <footer>
        <div>
          <p>{{ signDate }}</p>
          <p class="bslp-domain">{{ siteDomain }}</p>
        </div>
        <span class="bslp-qr" v-html="qrSvg" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BaoshengFortune {
  number: number
  title: string
  level: string
  levelCode: string
  poem: string
  explanation: string
  advice: string
  categoryJudgments?: Array<{ label: string; value: string }>
}

interface Props {
  result: {
    lotType: { id: string; name: string; count: number }
    fortune: BaoshengFortune
    question?: string
  }
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { locale } = useI18n()
const siteDomain = 'www.ososn.com'

const poemLines = computed(() => props.result.fortune.poem
  .split(/\n+/)
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
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/baosheng-lot`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#332f2a', light: '#00000000' },
  })
})
</script>

<style scoped>
.bslp {
  --bslp-ink: #332f2a;
  --bslp-paper: #f6f3ec;
  --bslp-line: #d8d1c5;
  --bslp-cinnabar: #8a613a;
  width: 100%;
  padding: 14px;
  color: var(--bslp-ink);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  background: #e9e3d9;
}

.bslp-sheet {
  border: 1px solid var(--bslp-line);
  background: var(--bslp-paper);
  padding: 20px;
}

.bslp-topbar,
.bslp-question,
.bslp-judgments,
.bslp-guidance,
.bslp-sheet footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.bslp-topbar {
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--bslp-line);
  font-size: 12px;
}

.bslp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
}

.bslp-number,
.bslp-question span,
.bslp-judgments span,
.bslp-guidance span,
.bslp-poem span {
  font-size: 12px;
  opacity: 0.72;
}

.bslp-title {
  margin-top: 3px;
  font-size: clamp(26px, 6vw, 40px);
  font-weight: 700;
  line-height: 1.2;
}

.bslp-seal {
  display: grid;
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid var(--bslp-cinnabar);
  border-radius: 6px;
  color: var(--bslp-cinnabar);
  font-size: 28px;
  font-weight: 800;
}

.bslp-question,
.bslp-judgments,
.bslp-guidance {
  padding: 14px 0;
  border-top: 1px solid var(--bslp-line);
}

.bslp-question p,
.bslp-guidance p {
  max-width: 72%;
  text-align: right;
  font-size: 13px;
  line-height: 1.6;
}

.bslp-poem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--bslp-line);
}

.bslp-poem-lines {
  display: flex;
  flex-flow: column wrap;
  height: 170px;
  justify-content: flex-start;
  align-content: flex-end;
  gap: 12px;
  writing-mode: vertical-rl;
  font-size: clamp(20px, 4.5vw, 30px);
  font-weight: 600;
  line-height: 1.5;
}

.bslp-judgments {
  align-items: stretch;
}

.bslp-judgments dl {
  display: grid;
  width: 100%;
  max-width: 72%;
  margin-left: auto;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 12px;
}

.bslp-judgments dt {
  font-size: 11px;
  opacity: 0.66;
}

.bslp-judgments dd {
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.4;
}

.bslp-guidance p.bslp-pending {
  opacity: 0.55;
}

.bslp-sheet footer {
  padding-top: 14px;
  border-top: 1px solid var(--bslp-line);
  font-size: 12px;
}

.bslp-domain {
  opacity: 0.72;
}

.bslp-qr {
  display: block;
  width: 54px;
  height: 54px;
}

@media (max-width: 520px) {
  .bslp-judgments dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bslp-question p,
  .bslp-judgments dl,
  .bslp-guidance p {
    max-width: none;
    width: 100%;
    margin-left: 0;
    text-align: left;
  }

  .bslp-question,
  .bslp-judgments,
  .bslp-guidance,
  .bslp-poem {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
