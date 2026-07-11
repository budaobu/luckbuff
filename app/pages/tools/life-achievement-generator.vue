<template>
  <div class="relative">
    <!-- 氛围背景光晕：固定视口层，独立裁剪，避免给内容祖先加 overflow-hidden 导致 position:sticky 失效 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-0">
      <div class="absolute top-[8%] left-[12%] w-[460px] h-[460px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[16%] right-[8%] w-[380px] h-[380px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-12">
      <div class="text-center mb-10">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Fun Personality Test · Achievement</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('achievementGenerator.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-xl mx-auto">
          {{ $t('achievementGenerator.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-6 items-start">
        <!-- Left: controls -->
        <div class="space-y-5">
          <!-- Upload -->
          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.uploadTitle') }}</h2>
            <p class="text-xs text-[var(--text-faint)] mb-3">{{ $t('achievementGenerator.uploadHint') }}</p>
            <button
              type="button"
              class="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-[var(--border-medium)] hover:border-[var(--accent-border-hover)] bg-[var(--surface-elevated)] cursor-pointer transition-colors"
              @click="openFilePicker"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 text-[var(--accent)]" />
              <span class="text-sm text-[var(--text-muted)]">{{ hasImage ? $t('achievementGenerator.changeImage') : $t('achievementGenerator.uploadButton') }}</span>
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" @change="onFileChange" >
          </section>

          <!-- Achievement -->
          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.achievementTitle') }}</h2>
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="cat in CATEGORIES"
                :key="cat.id"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors"
                :class="activeCategory === cat.id
                  ? 'bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-border-hover)]'"
                @click="activeCategory = cat.id"
              >
                <UIcon :name="cat.icon" class="w-3.5 h-3.5" />
                {{ $t(cat.nameKey) }}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <button
                v-for="key in activeCategoryItems"
                :key="key"
                class="text-left px-3 py-2.5 rounded-xl border text-sm transition-colors"
                :class="selectedKey === key && !customMode
                  ? 'bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--text-primary)]'
                  : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-border-hover)]'"
                @click="selectPreset(key)"
              >
                <span class="mr-1.5">🏆</span>{{ $t(itemKey(activeCategory, key)) }}
              </button>
            </div>
            <div>
              <label class="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1.5">
                <input v-model="customMode" type="checkbox" class="accent-[var(--accent)]" >
                {{ $t('achievementGenerator.customLabel') }}
              </label>
              <input
                v-model="customText"
                :placeholder="$t('achievementGenerator.customPlaceholder')"
                maxlength="40"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
                @focus="customMode = true"
              >
            </div>
          </section>

          <!-- Filter -->
          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.filterTitle') }}</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="f in FILTERS"
                :key="f.id"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-colors"
                :class="activeFilter === f.id
                  ? 'bg-[var(--accent-bg)] border-[var(--accent)] text-[var(--text-primary)]'
                  : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-border-hover)]'"
                @click="activeFilter = f.id"
              >
                <UIcon :name="f.icon" class="w-4 h-4 flex-shrink-0 text-[var(--accent)]" />
                <span class="text-xs font-medium">{{ $t(f.nameKey) }}</span>
              </button>
            </div>
            <p class="text-xs text-[var(--text-faint)] mt-3">{{ $t(activeFilterDesc) }}</p>
          </section>

          <!-- Params -->
          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.paramTitle') }}</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>{{ $t('achievementGenerator.paramDensity') }}</span><span class="font-mono">{{ params.density }}</span>
                </div>
                <input v-model.number="params.density" type="range" min="12" max="160" class="w-full accent-[var(--accent)]" >
              </div>
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>{{ $t('achievementGenerator.paramCharSize') }}</span><span class="font-mono">{{ params.charSize }}</span>
                </div>
                <input v-model.number="params.charSize" type="range" min="4" max="28" class="w-full accent-[var(--accent)]" >
              </div>
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>{{ $t('achievementGenerator.paramOpacity') }}</span><span class="font-mono">{{ params.opacity.toFixed(2) }}</span>
                </div>
                <input v-model.number="params.opacity" type="range" min="0" max="1" step="0.01" class="w-full accent-[var(--accent)]" >
              </div>
              <div>
                <div class="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>{{ $t('achievementGenerator.paramOriginal') }}</span><span class="font-mono">{{ params.original.toFixed(2) }}</span>
                </div>
                <input v-model.number="params.original" type="range" min="0" max="1" step="0.01" class="w-full accent-[var(--accent)]" >
              </div>
            </div>
          </section>
        </div>

        <!-- Right: preview + export (sticky on desktop, does not scroll with the page) -->
        <div class="lg:sticky lg:top-6 lg:self-start space-y-5">
          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.previewTitle') }}</h2>
            <div class="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[#0a0c10] aspect-[3/4] flex items-center justify-center">
              <canvas ref="previewCanvas" class="w-full h-full object-contain" />
              <p v-if="!hasImage" class="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-faint)] px-6 text-center">
                {{ $t('achievementGenerator.previewEmpty') }}
              </p>
            </div>
          </section>

          <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('achievementGenerator.exportTitle') }}</h2>
            <div class="grid grid-cols-1 gap-2">
              <UButton color="neutral" variant="soft" block :disabled="!hasImage || exporting" @click="doExport('filter')">
                <UIcon name="i-heroicons-photo" class="w-4 h-4 mr-1" />{{ $t('achievementGenerator.exportFilter') }}
              </UButton>
              <UButton color="neutral" variant="soft" block :disabled="!hasImage || exporting || !currentTitle" @click="doExport('achievement')">
                <UIcon name="i-heroicons-trophy" class="w-4 h-4 mr-1" />{{ $t('achievementGenerator.exportAchievement') }}
              </UButton>
              <UButton color="warning" block :disabled="!hasImage || exporting || !currentTitle" @click="doExport('both')">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />{{ $t('achievementGenerator.exportBoth') }}
              </UButton>
            </div>
            <p v-if="exporting" class="text-xs text-[var(--accent)] text-center mt-3">{{ $t('achievementGenerator.exporting') }}</p>
          </section>
        </div>
      </div>

      <p class="text-center text-[11px] text-[var(--text-faint)] mt-10 max-w-2xl mx-auto">
        {{ $t('achievementGenerator.footerDisclaimer') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExportMode, FilterId, FilterParams } from '~/data/achievement-generator'
import { CATEGORIES, DEFAULT_PARAMS, FILTERS } from '~/data/achievement-generator'
import { loadImageFromFile, renderFilter } from '~/utils/achievement-filters'
import { composeExport, downloadCanvas } from '~/utils/achievement-card'

const { t } = useI18n()
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/life-achievement-generator'

useSeoMeta({
  title: () => `${t('seo.lifeAchievementGeneratorTitle')} - ${siteName}`,
  description: t('seo.lifeAchievementGeneratorDesc'),
  keywords: t('seo.lifeAchievementGeneratorKeywords'),
  ogTitle: () => `${t('seo.lifeAchievementGeneratorOgTitle')} - ${siteName}`,
  ogDescription: t('seo.lifeAchievementGeneratorOgDesc'),
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
        '@type': 'WebApplication',
        name: `${t('seo.lifeAchievementGeneratorTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.lifeAchievementGeneratorDesc'),
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
        inLanguage: 'zh-CN',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))

const fileInput = ref<HTMLInputElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)

const img = ref<HTMLImageElement | null>(null)
const imgUrl = ref<string | null>(null)
const hasImage = computed(() => !!img.value)

const activeCategory = ref(CATEGORIES[0]!.id)
const selectedKey = ref('0')
const customMode = ref(false)
const customText = ref('')
const activeFilter = ref<FilterId>('ascii')
const params = reactive<FilterParams>({ ...DEFAULT_PARAMS })
const exporting = ref(false)

const activeCategoryItems = computed(() => CATEGORIES.find(c => c.id === activeCategory.value)?.itemKeys ?? [])
const activeFilterDesc = computed(() => FILTERS.find(f => f.id === activeFilter.value)?.descKey ?? '')

function itemKey(catId: string, key: string) {
  return `achievementGenerator.items.${catId}.${key}`
}

function selectPreset(key: string) {
  selectedKey.value = key
  customMode.value = false
}

const currentTitle = computed(() => {
  if (customMode.value) return customText.value.trim()
  return t(itemKey(activeCategory.value, selectedKey.value))
})

const currentCategoryName = computed(() => {
  if (customMode.value) return t('achievementGenerator.customCategory')
  return t(CATEGORIES.find(c => c.id === activeCategory.value)?.nameKey ?? '')
})

const achievementPayload = computed(() => ({
  category: currentCategoryName.value,
  title: currentTitle.value,
  body: t('achievementGenerator.subtitle'),
  icon: '🏆',
  custom: customMode.value,
}))

// --- rendering pipeline -------------------------------------------------

const OUTPUT_W = 1080
const OUTPUT_H = 1440
let baseCanvas: HTMLCanvasElement | null = null // original at output size
let filteredCanvas: HTMLCanvasElement | null = null // filtered at output size

function ensureCanvases() {
  if (!baseCanvas) {
    baseCanvas = document.createElement('canvas')
    baseCanvas.width = OUTPUT_W
    baseCanvas.height = OUTPUT_H
  }
  if (!filteredCanvas) {
    filteredCanvas = document.createElement('canvas')
    filteredCanvas.width = OUTPUT_W
    filteredCanvas.height = OUTPUT_H
  }
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, w: number, h: number) {
  const iw = image.width
  const ih = image.height
  const scale = Math.max(w / iw, h / ih)
  const sw = iw * scale
  const sh = ih * scale
  ctx.drawImage(image, (w - sw) / 2, (h - sh) / 2, sw, sh)
}

let rafId = 0
function scheduleRender() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(render)
}

function render() {
  const image = img.value
  const canvas = previewCanvas.value
  if (!image || !canvas) return
  ensureCanvases()
  // base (cover-fit into vertical canvas)
  const bctx = baseCanvas!.getContext('2d', { willReadFrequently: true })!
  bctx.clearRect(0, 0, OUTPUT_W, OUTPUT_H)
  drawCover(bctx, image, OUTPUT_W, OUTPUT_H)
  // filtered
  const fctx = filteredCanvas!.getContext('2d', { willReadFrequently: true })!
  renderFilter(fctx, image, activeFilter.value, { ...params })
  // preview = both (filtered + card) for live feel; show card only if there is a title
  const previewCtx = canvas.getContext('2d')!
  canvas.width = OUTPUT_W
  canvas.height = OUTPUT_H
  const preview = composeExport(filteredCanvas!, baseCanvas!, currentTitle.value ? 'both' : 'filter', achievementPayload.value, `${siteName} · ${t('achievementGenerator.title')}`)
  previewCtx.clearRect(0, 0, OUTPUT_W, OUTPUT_H)
  previewCtx.drawImage(preview, 0, 0)
}

watch([activeFilter, () => params.density, () => params.charSize, () => params.opacity, () => params.original, currentTitle, customMode], scheduleRender)

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
  try {
    const { img: loaded, url } = await loadImageFromFile(file)
    img.value = loaded
    imgUrl.value = url
    await nextTick()
    render()
  } catch {
    // ignore bad file
  }
}

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
})

async function doExport(mode: ExportMode) {
  if (!img.value || exporting.value) return
  exporting.value = true
  try {
    // ensure latest render is up to date
    render()
    await nextTick()
    const out = composeExport(
      filteredCanvas!,
      baseCanvas!,
      mode,
      achievementPayload.value,
      `${siteName} · ${t('achievementGenerator.title')}`,
    )
    const slug = currentTitle.value.replace(/[\s/\\?%*:|"<>]/g, '').slice(0, 18) || 'card'
    downloadCanvas(out, `achievement-${mode}-${slug}.png`)
  } finally {
    setTimeout(() => (exporting.value = false), 600)
  }
}
</script>
