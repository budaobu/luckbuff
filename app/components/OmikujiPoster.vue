<template>
  <div class="omp" :class="{ 'omp-latin': !isCjk }">
    <article class="omp-sheet">
      <header class="omp-topbar">
        <span>{{ $t('omikujiPoster.kicker') }}</span>
        <span>{{ $t('omikujiPoster.serial', { count: result.lotType.count }) }}</span>
      </header>

      <section class="omp-head">
        <div class="omp-title-block">
          <p class="omp-number">{{ $t('omikujiPoster.numberLine', { number: result.fortune.number }) }}</p>
          <h2 class="omp-title">{{ result.fortune.title }}</h2>
        </div>
        <div class="omp-seal" aria-hidden="true">
          <span>{{ result.fortune.rank }}</span>
        </div>
      </section>

      <section class="omp-question">
        <span class="omp-flag">{{ $t('omikujiPoster.questionFlag') }}</span>
        <p>{{ result.question || $t('omikujiPoster.noQuestion') }}</p>
      </section>

      <section class="omp-poem">
        <span class="omp-flag">{{ $t('omikujiPoster.poemFlag') }}</span>
        <div class="omp-poem-body">
          <p v-for="(line, index) in poemLines" :key="index">{{ line }}</p>
        </div>
      </section>

      <section class="omp-verdicts">
        <div>
          <span class="omp-flag">{{ $t('omikujiPoster.summaryLabel') }}</span>
          <p>{{ result.fortune.summary }}</p>
        </div>
        <div>
          <span class="omp-flag">{{ $t('omikujiPoster.actionLabel') }}</span>
          <p>{{ result.fortune.action }}</p>
        </div>
        <div>
          <span class="omp-flag">{{ $t('omikujiPoster.guidanceLabel') }}</span>
          <p :class="{ pending: !guidance }">{{ guidance || $t('omikujiPoster.guidancePending') }}</p>
        </div>
      </section>

      <section class="omp-fields">
        <div class="omp-fields-head">
          <span>{{ $t('omikujiPoster.directionLabel') }}</span>
          <strong>{{ result.fortune.luckyDirection }}</strong>
          <span>{{ $t('omikujiPoster.colorLabel') }}</span>
          <strong>{{ result.fortune.symbolColor }}</strong>
        </div>
        <dl class="omp-aspects">
          <div v-for="aspect in result.fortune.aspects" :key="aspect.key">
            <dt>{{ aspect.label }}</dt>
            <dd>{{ aspect.text }}</dd>
          </div>
        </dl>
      </section>

      <footer class="omp-foot">
        <div class="omp-sign">
          <p>{{ signDate }}</p>
          <p class="domain">www.ososn.com</p>
          <p>{{ $t('omikujiPoster.footerNote') }}</p>
        </div>
        <div class="omp-qr" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="qrSvg" v-html="qrSvg" />
          <span v-else>{{ $t('omikujiPoster.qrHint') }}</span>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
interface OmikujiPosterResult {
  lotType: { id: string; name: string; count: number }
  fortune: {
    number: number
    rank: string
    rankCode: string
    title: string
    poem: string
    summary: string
    action: string
    luckyDirection: string
    symbolColor: string
    aspects: Array<{ key: string; label: string; text: string }>
  }
  question: string
}

interface Props {
  result: OmikujiPosterResult
  aiContent?: string
}

const props = withDefaults(defineProps<Props>(), { aiContent: '' })
const { t, locale } = useI18n()
const isCjk = computed(() => ['zh-CN', 'zh-TW', 'ja'].includes(locale.value))

const poemLines = computed(() => props.result.fortune.poem
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean))

const guidance = computed(() => {
  const content = props.aiContent
  if (!content.trim()) return ''
  const match = content.match(/##\s*(?:问事指引|問事指引)\s*\n([\s\S]*?)(?=\n##\s|$)/)
    || content.match(/##\s*(?:Guidance|問いへの導き)\s*\n([\s\S]*?)(?=\n##\s|$)/i)
  if (!match) return ''
  const body = match[1]!.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentenceEnd = body.search(/[。！？.!?]/)
  const sentence = sentenceEnd >= 0 ? body.slice(0, sentenceEnd + 1) : body
  return sentence.length > 80 ? `${sentence.slice(0, 79)}…` : sentence
})

const signDate = computed(() => {
  const date = new Date()
  const localeTag = locale.value === 'zh-TW' ? 'zh-TW' : locale.value === 'en' ? 'en-US' : locale.value === 'ja' ? 'ja-JP' : 'zh-CN'
  return new Intl.DateTimeFormat(localeTag, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
})

const qrSvg = ref('')
onMounted(async () => {
  const url = `${window.location.origin}/tools/omikuji`
  const QRCode = await import('qrcode')
  qrSvg.value = await QRCode.default.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#27364f', light: '#00000000' },
  })
})
</script>

<style scoped>
.omp {
  --omp-paper: #eef2f7;
  --omp-sheet: #fbfcfe;
  --omp-ink: #22314a;
  --omp-muted: #5f6f87;
  --omp-line: #ccd7e5;
  --omp-soft: #e6edf5;
  --omp-blue: #265a8c;
  --omp-red: #a63d38;
  width: 100%;
  color: var(--omp-ink);
  background: var(--omp-paper);
  padding: 14px;
  font-family: 'Noto Serif JP', 'Noto Serif SC', 'Songti SC', 'Hiragino Mincho ProN', serif;
}

.omp-sheet {
  background: var(--omp-sheet);
  border: 1px solid var(--omp-line);
  box-shadow: 0 10px 28px rgb(31 45 69 / 10%);
  padding: 26px 24px 20px;
}

.omp-topbar,
.omp-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--omp-muted);
  font-size: 10px;
  letter-spacing: .16em;
}

.omp-topbar {
  border-bottom: 1px solid var(--omp-line);
  padding-bottom: 8px;
}

.omp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 3px double var(--omp-ink);
  padding: 16px 0 18px;
}

.omp-number {
  margin: 0;
  font-size: 11px;
  color: var(--omp-muted);
  letter-spacing: .24em;
}

.omp-title {
  margin: 5px 0 0;
  font-size: clamp(25px, 7vw, 36px);
  line-height: 1.15;
  font-weight: 900;
}

.omp-seal {
  min-width: 62px;
  min-height: 62px;
  display: grid;
  place-items: center;
  border: 2px solid var(--omp-red);
  border-radius: 6px;
  color: var(--omp-red);
  font-size: 20px;
  font-weight: 900;
  transform: rotate(-3deg);
}

.omp-question {
  margin-top: 16px;
  border: 1px solid var(--omp-soft);
  background: #f4f8fc;
  padding: 11px 13px;
}

.omp-flag {
  display: inline-block;
  min-width: 56px;
  margin-right: 8px;
  color: var(--omp-blue);
  font-size: 11px;
  letter-spacing: .12em;
  white-space: nowrap;
}

.omp-question p,
.omp-verdicts p,
.omp-poem-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.omp-poem {
  margin-top: 14px;
  padding: 14px 0;
  border-top: 1px solid var(--omp-line);
  border-bottom: 1px solid var(--omp-line);
}

.omp-poem-body p + p {
  margin-top: 4px;
}

.omp-verdicts {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.omp-verdicts .pending {
  color: var(--omp-muted);
  opacity: .65;
}

.omp-fields {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--omp-line);
}

.omp-fields-head {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 8px;
  align-items: center;
  color: var(--omp-muted);
  font-size: 11px;
  letter-spacing: .1em;
  padding-bottom: 12px;
}

.omp-fields-head strong {
  color: var(--omp-ink);
  font-size: 13px;
}

.omp-aspects {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}

.omp-aspects dt {
  color: var(--omp-blue);
  font-size: 11px;
  font-weight: 700;
}

.omp-aspects dd {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.45;
}

.omp-foot {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--omp-line);
  gap: 14px;
}

.omp-sign p {
  margin: 2px 0 0;
  letter-spacing: .06em;
}

.omp-sign .domain {
  font-weight: 700;
  color: var(--omp-ink);
}

.omp-qr {
  width: 48px;
  height: 48px;
  color: var(--omp-ink);
  display: grid;
  place-items: center;
  font-size: 7px;
  text-align: center;
}

.omp-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

.omp-latin .omp-aspects,
.omp-latin .omp-fields-head,
.omp-latin .omp-foot {
  grid-template-columns: 1fr;
}

.omp-latin .omp-aspects {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 640px) {
  .omp-sheet {
    padding: 20px 16px 16px;
  }

  .omp-aspects {
    grid-template-columns: 1fr;
  }

  .omp-latin .omp-aspects {
    grid-template-columns: 1fr;
  }
}
</style>
