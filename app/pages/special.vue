<template>
  <div class="relative overflow-hidden">
    <div class="tools-ambient" aria-hidden="true" />

    <div class="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-16">
      <header v-reveal class="tools-hero">
        <p class="tools-eyebrow">
          {{ $t('toolDirectories.specialTitle') }}
        </p>
        <h1 class="tools-title font-serif">
          {{ $t('toolDirectories.specialTitle') }}
        </h1>
        <p class="tools-subtitle">
          {{ $t('toolDirectories.specialSubtitle') }}
        </p>

        <div class="tools-meta">
          <span>{{ categories.length }}</span>
          <span class="tools-meta-label">{{ $t('toolDirectories.topicCount') }}</span>
          <i aria-hidden="true" />
          <span>{{ totalCount }}</span>
          <span class="tools-meta-label">{{ $t('toolDirectories.toolCount') }}</span>
        </div>

        <div class="tools-guide">
          <UIcon name="i-heroicons-light-bulb" class="h-4 w-4 shrink-0 text-[var(--accent)]" />
          <i18n-t keypath="tools.guide" tag="span">
            <template #profileLink>
              <NuxtLink :to="localePath('/settings')" class="tools-guide-link">
                {{ $t('tools.profileLink') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </header>

      <nav v-reveal class="tools-nav" aria-label="Categories">
        <NuxtLink
          v-for="category in categories"
          :key="`nav-${category.id}`"
          :to="`#${category.id}`"
          class="tools-chip"
          external
        >
          <UIcon :name="category.icon || 'i-heroicons-rectangle-group'" class="h-3.5 w-3.5" />
          <span>{{ $t(category.titleKey) }}</span>
        </NuxtLink>
      </nav>

      <div class="space-y-14 md:space-y-16">
        <section
          v-for="(category, categoryIndex) in categories"
          :id="category.id"
          :key="category.id"
          class="scroll-mt-24"
        >
          <div v-reveal class="category-head">
            <div class="category-index font-mono">
              {{ String(categoryIndex + 1).padStart(2, '0') }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="category-title">
                {{ $t(category.titleKey) }}
              </h3>
              <p class="category-subtitle">
                {{ $t(category.subtitleKey) }}
              </p>
            </div>
            <NuxtLink
              :to="localePath(category.sectionPath)"
              class="category-link group"
            >
              {{ $t('tools.more', { category: $t(category.titleKey) }) }}
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>

          <div v-reveal.stagger class="topic-grid">
            <NuxtLink
              v-for="tool in category.tools.slice(0, 4)"
              :key="tool.path"
              :to="localePath(tool.path)"
              data-reveal-child
              class="topic-card arc-card group"
              :class="{ 'topic-card-recommended': tool.recommended }"
            >
              <span v-if="tool.recommended" class="topic-badge">
                {{ $t('seeking.recommended') }}
              </span>
              <span class="topic-card-body">
                <span class="topic-icon">
                  <UIcon :name="tool.icon" class="h-5 w-5" />
                </span>
                <span class="topic-title">{{ $t(tool.titleKey) }}</span>
                <span class="topic-desc">{{ $t(tool.descKey) }}</span>
                <span class="topic-cta">
                  {{ $t(tool.ctaKey) }}
                  <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const categories = useSpecialToolCategories()
const totalCount = computed(() => categories.value.reduce((sum, category) => sum + category.tools.length, 0))

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.specialTitle')} - ${siteName}`,
  description: t('seo.specialDesc'),
  keywords: t('seo.specialKeywords'),
  ogTitle: () => `${t('seo.specialOgTitle')} - ${siteName}`,
  ogDescription: t('seo.specialOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/special',
  twitterCard: 'summary_large_image',
})

useHead(() => {
  const allTools = getAllToolsFlat()
  const itemListElement = allTools.map((tool, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: t(tool.titleKey),
    url: `https://www.ososn.com${tool.path}`,
  }))

  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${t('seo.specialTitle')} - ${siteName}`,
          url: 'https://www.ososn.com/special',
          description: t('seo.specialDesc'),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement,
          },
        }),
      },
    ],
  }
})
</script>

<style scoped>
.tools-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(58rem 32rem at 12% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 62%),
    linear-gradient(90deg, color-mix(in srgb, var(--border-light) 42%, transparent) 1px, transparent 1px);
  background-size: auto, 72px 100%;
  mask-image: linear-gradient(180deg, black, transparent 78%);
}

.tools-hero {
  max-width: 780px;
}

.tools-eyebrow {
  margin-bottom: 14px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tools-title {
  margin-bottom: 16px;
  color: var(--text-primary);
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  font-weight: 600;
  line-height: 1.12;
}

.tools-subtitle {
  max-width: 42em;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.tools-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.tools-meta > span:first-of-type,
.tools-meta > span:nth-of-type(2) {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.tools-meta i {
  width: 1px;
  height: 18px;
  background: var(--border-strong);
}

.tools-guide {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 680px;
  margin-top: 24px;
  padding: 14px 16px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.tools-guide-link {
  color: var(--accent);
  font-weight: 500;
}

.tools-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 34px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.tools-group-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  margin-left: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tools-group-chip:first-child {
  margin-left: 0;
}

.tools-group-head {
  max-width: 780px;
}

.tools-group-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
}

.tools-group-head p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.tools-group-head + section .category-head,
.tools-group-head + section {
  margin-top: 14px;
}

.tools-nav::-webkit-scrollbar {
  display: none;
}

.tools-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
  transition: background-color 160ms var(--ease-out-expo), border-color 160ms var(--ease-out-expo), color 160ms var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .tools-chip:hover {
    border-color: var(--accent-border);
    background: var(--accent-bg);
    color: var(--text-primary);
  }
}

.category-head {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 22px;
}

.category-index {
  padding-top: 4px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.category-title {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
}

.category-subtitle {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.category-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 13px;
  transition: color 160ms var(--ease-out-expo);
}

.category-link:hover {
  color: var(--accent);
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
  top: 14px;
  right: 14px;
  padding: 4px 9px;
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
  padding: 22px;
}

.topic-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
}

.topic-title {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.topic-desc {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.topic-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

@media (min-width: 640px) {
  .topic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .topic-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .category-link {
    margin-top: 9px;
  }
}

@media (max-width: 767px) {
  .tools-hero {
    padding-top: 6px;
  }

  .category-head {
    flex-direction: column;
    gap: 8px;
  }

  .category-link {
    margin-top: 0;
  }
}
</style>
