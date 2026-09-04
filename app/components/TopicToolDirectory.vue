<template>
  <div class="relative overflow-hidden">
    <div class="topic-ambient" aria-hidden="true" />

    <div class="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-16">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/special')" class="topic-back group">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {{ $t('toolDirectories.specialTitle') }}
        </NuxtLink>
      </nav>

      <header v-reveal class="topic-hero">
        <p class="topic-eyebrow">{{ eyebrow }}</p>
        <h1 class="topic-title font-serif">{{ $t(titleKey) }}</h1>
        <p class="topic-subtitle">{{ $t(`${textNamespace}.subtitle`) }}</p>
        <p v-if="showIntro" class="topic-intro">{{ $t(`${textNamespace}.intro`) }}</p>

        <div class="topic-meta">
          <span>{{ category.tools.length }}</span>
          <span class="topic-meta-label">{{ $t('tools.title') }}</span>
          <template v-if="showSupport">
            <i aria-hidden="true" />
            <span>{{ guideItems.length }}</span>
            <span class="topic-meta-label">{{ $t(`${textNamespace}.guideTitle`) }}</span>
          </template>
        </div>
      </header>

      <div v-reveal.stagger class="topic-grid">
        <NuxtLink
          v-for="tool in category.tools"
          :key="tool.path"
          :to="localePath(tool.path)"
          data-reveal-child
          class="topic-card arc-card group"
          :class="{ 'topic-card-recommended': tool.recommended }"
        >
          <span v-if="tool.recommended" class="topic-badge">{{ recommendedLabel }}</span>
          <span class="topic-card-body">
            <span class="topic-icon">
              <UIcon :name="tool.icon" class="h-5 w-5" />
            </span>
            <span class="topic-name">{{ $t(tool.titleKey) }}</span>
            <span class="topic-desc">{{ $t(tool.descKey) }}</span>
            <span class="topic-cta">
              {{ $t(tool.ctaKey) }}
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </span>
        </NuxtLink>
      </div>

      <section v-if="showSupport" v-reveal class="topic-section">
        <div class="topic-section-head">
          <h2>{{ $t(`${textNamespace}.guideTitle`) }}</h2>
          <i aria-hidden="true" />
        </div>
        <div class="topic-support-grid">
          <article v-for="item in guideItems" :key="item.title" class="topic-support-card">
            <span class="topic-support-icon">
              <UIcon name="i-heroicons-check-badge" class="h-5 w-5" />
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section v-if="showSupport" v-reveal class="topic-section">
        <div class="topic-section-head">
          <h2>{{ $t(`${textNamespace}.faqTitle`) }}</h2>
          <i aria-hidden="true" />
        </div>
        <div class="topic-faq-list">
          <article v-for="item in faqItems" :key="item.title" class="topic-faq-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolCategory } from '~/composables/useToolCategories'

const props = defineProps<{
  category: ToolCategory
  titleKey: string
  eyebrow: string
  textNamespace: string
  recommendedLabel: string
  guideCount: number
  faqCount: number
  showIntro?: boolean
  showSupport?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const guideItems = computed(() => Array.from({ length: props.guideCount }, (_, index) => ({
  title: t(`${props.textNamespace}.guide${index + 1}Title`),
  desc: t(`${props.textNamespace}.guide${index + 1}Desc`),
})))

const faqItems = computed(() => Array.from({ length: props.faqCount }, (_, index) => ({
  title: t(`${props.textNamespace}.faq${index + 1}Q`),
  desc: t(`${props.textNamespace}.faq${index + 1}A`),
})))

const showIntro = computed(() => props.showIntro ?? true)
const showSupport = computed(() => props.showSupport ?? true)
</script>

<style scoped>
.topic-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(52rem 28rem at 8% 0%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 64%),
    linear-gradient(90deg, color-mix(in srgb, var(--border-light) 34%, transparent) 1px, transparent 1px);
  background-size: auto, 84px 100%;
  mask-image: linear-gradient(180deg, black, transparent 76%);
}

.topic-breadcrumb {
  margin-bottom: 28px;
}

.topic-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  transition: color 160ms var(--ease-out-expo);
}

.topic-back:hover {
  color: var(--accent);
}

.topic-hero {
  max-width: 820px;
  margin-bottom: 42px;
}

.topic-eyebrow {
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.topic-title {
  margin-bottom: 16px;
  color: var(--text-primary);
  font-size: clamp(2.2rem, 4.2vw, 3.5rem);
  font-weight: 600;
  line-height: 1.1;
}

.topic-subtitle {
  margin-bottom: 14px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.6;
}

.topic-intro {
  max-width: 46em;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.75;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.topic-meta > span:first-of-type,
.topic-meta > span:nth-of-type(2) {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.topic-meta i {
  width: 1px;
  height: 18px;
  background: var(--border-strong);
}

.topic-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.topic-card {
  position: relative;
  display: flex;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
}

.topic-card-recommended {
  border-color: var(--accent-border);
}

.topic-badge {
  position: absolute;
  z-index: 11;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
}

.topic-card-body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding: 26px;
}

.topic-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 22px;
  border: 1px solid var(--accent-border);
  border-radius: 13px;
  background: var(--accent-bg);
  color: var(--accent);
}

.topic-name {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.45;
}

.topic-desc {
  flex: 1;
  overflow: hidden;
  margin-bottom: 24px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.topic-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.topic-section {
  margin-top: 56px;
}

.topic-section-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}

.topic-section-head h2 {
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 600;
}

.topic-section-head i {
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.topic-support-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.topic-support-card,
.topic-faq-card {
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  background: var(--surface-card);
  box-shadow: var(--shadow-panel);
}

.topic-support-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-bottom: 16px;
  border: 1px solid var(--accent-border);
  border-radius: 11px;
  background: var(--accent-bg);
  color: var(--accent);
}

.topic-support-card h3,
.topic-faq-card h3 {
  margin-bottom: 9px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.topic-support-card p,
.topic-faq-card p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.topic-faq-list {
  display: grid;
  gap: 10px;
}

@media (min-width: 640px) {
  .topic-grid,
  .topic-support-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .topic-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .topic-support-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
