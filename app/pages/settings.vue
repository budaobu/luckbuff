<template>
  <div>
    <!-- 表单状态 -->
    <ProfileForm
      v-if="formMode"
      :profile="editingProfile"
      @cancel="closeForm"
      @submit="handleFormSubmit"
    />

    <!-- 列表状态 -->
    <div v-else class="relative overflow-hidden">
      <div class="settings-ambient" aria-hidden="true" />

      <main class="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 md:py-20">
        <header v-reveal class="settings-hero">
          <div>
            <p class="settings-eyebrow">Profiles</p>
            <h1 id="settings-title" class="settings-title font-serif">
              {{ $t('settings.title') }}
            </h1>
            <p class="settings-subtitle">
              {{ $t('settings.subtitle') }}
            </p>
          </div>

          <UButton
            v-if="profiles.length > 0"
            color="warning"
            variant="soft"
            size="md"
            class="settings-cta group/btn"
            @click="openCreate"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </template>
            {{ $t('settings.newProfile') }}
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </template>
          </UButton>
        </header>

        <div class="settings-layout">
          <section aria-labelledby="settings-title" class="settings-main">
            <div v-if="!profilesReady" class="profile-grid" aria-busy="true">
              <div v-for="i in 2" :key="i" class="profile-skeleton">
                <span class="skeleton-line h-11 w-11 animate-pulse rounded-xl" />
                <span class="skeleton-line mt-5 h-5 w-1/2 animate-pulse rounded-full" />
                <span class="skeleton-line mt-3 h-4 w-1/3 animate-pulse rounded-full" />
                <span class="skeleton-line mt-6 h-3 w-full animate-pulse rounded-full" />
                <span class="skeleton-line mt-2 h-3 w-2/3 animate-pulse rounded-full" />
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="profiles.length === 0" class="settings-empty">
              <span class="settings-empty-icon">
                <UIcon name="i-heroicons-user-group" class="h-7 w-7" />
              </span>
              <h2>{{ $t('settings.emptyTitle') }}</h2>
              <p>{{ $t('settings.emptyDesc') }}</p>
              <UButton color="warning" variant="soft" size="md" @click="openCreate">
                <template #leading>
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                </template>
                {{ $t('settings.emptyCta') }}
              </UButton>
            </div>

            <!-- 档案列表 -->
            <div v-else v-reveal.stagger class="profile-grid">
              <ProfileCard
                v-for="profile in profiles"
                :key="profile.id"
                :profile="profile"
                data-reveal-child
                class="profile-item"
                @edit="handleEdit"
                @delete="handleDelete"
                @set-default="handleSetDefault"
              />
            </div>
          </section>

          <aside v-reveal class="settings-side">
            <article v-for="point in guidePoints" :key="point.title" class="settings-guide">
              <span>
                <UIcon :name="point.icon" class="h-5 w-5" />
              </span>
              <h3>{{ point.title }}</h3>
              <p>{{ point.desc }}</p>
            </article>

            <p class="settings-privacy">
              <UIcon name="i-heroicons-shield-check" class="h-4 w-4 shrink-0" />
              <span>{{ $t('settings.privacyNote') }}</span>
            </p>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'
import { useProfilesStore } from '~/stores/profiles'

const { t } = useI18n()
const store = useProfilesStore()
const { profiles } = useProfiles()

const profilesReady = ref(import.meta.client)

const guidePoints = computed(() => [
  {
    icon: 'i-heroicons-bolt',
    title: t('settings.guidePoint1Title'),
    desc: t('settings.guidePoint1Desc'),
  },
  {
    icon: 'i-heroicons-user-group',
    title: t('settings.guidePoint2Title'),
    desc: t('settings.guidePoint2Desc'),
  },
  {
    icon: 'i-heroicons-device-phone-mobile',
    title: t('settings.guidePoint3Title'),
    desc: t('settings.guidePoint3Desc'),
  },
])

const formMode = ref<'create' | 'edit' | null>(null)
const editingProfile = ref<UserProfile | null>(null)

function openCreate() {
  editingProfile.value = null
  formMode.value = 'create'
}

function handleEdit(profile: UserProfile) {
  editingProfile.value = profile
  formMode.value = 'edit'
}

function closeForm() {
  formMode.value = null
  editingProfile.value = null
}

function handleDelete(id: string) {
  if (confirm(t('common.confirm') + '?')) {
    store.remove(id)
  }
}

function handleSetDefault(id: string) {
  store.update(id, { isDefault: true })
}

function handleFormSubmit(data: Omit<UserProfile, 'id'>) {
  if (editingProfile.value) {
    const result = store.update(editingProfile.value.id, data)
    if (!result.ok) {
      alert(result.error)
      return
    }
    return
  }
  const normalizedData = profiles.value.length === 0 ? { ...data, isDefault: true } : data
  const result = store.add(normalizedData)
  if (!result.ok) {
    alert(result.error)
    return
  }
  closeForm()
}

useSeoMeta({
  title: t('settings.seoTitle'),
  description: t('settings.seoDesc'),
  ogTitle: t('settings.seoTitle'),
  ogDescription: t('settings.seoDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/settings',
  twitterCard: 'summary_large_image',
})

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style scoped>
.settings-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(52rem 28rem at 86% 0%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 64%),
    linear-gradient(90deg, color-mix(in srgb, var(--border-light) 30%, transparent) 1px, transparent 1px);
  background-size: auto, 88px 100%;
  mask-image: linear-gradient(180deg, black, transparent 76%);
}

.settings-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 28px;
  max-width: 880px;
  margin-bottom: 34px;
}

.settings-eyebrow {
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.settings-title {
  margin-bottom: 14px;
  color: var(--text-primary);
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 600;
  line-height: 1.1;
  text-wrap: balance;
}

.settings-subtitle {
  max-width: 38em;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
  text-wrap: pretty;
}

.settings-cta {
  border-radius: 999px;
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 14px;
}

.profile-item,
.profile-skeleton {
  min-height: 0;
  content-visibility: auto;
  contain-intrinsic-size: auto 250px;
}

.profile-skeleton {
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: var(--surface-card);
  box-shadow: var(--shadow-panel);
}

.skeleton-line {
  display: block;
  background: var(--surface-card-hover);
}

.settings-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 40px;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  background: var(--surface-card);
  box-shadow: var(--shadow-panel);
}

.settings-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 16px;
  background: var(--accent-bg);
  color: var(--accent);
}

.settings-empty h2 {
  margin-bottom: 9px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
}

.settings-empty p {
  margin-bottom: 24px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  text-wrap: pretty;
}

.settings-side {
  display: grid;
  gap: 12px;
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-elevated) 72%, transparent);
  box-shadow: var(--shadow-panel);
}

.settings-guide {
  padding: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-card);
}

.settings-guide span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-bottom: 13px;
  border: 1px solid var(--accent-border);
  border-radius: 11px;
  background: var(--accent-bg);
  color: var(--accent);
}

.settings-guide h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}

.settings-guide p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.65;
  text-wrap: pretty;
}

.settings-privacy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
  padding: 14px 15px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1023px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .settings-hero {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 22px;
    margin-bottom: 28px;
  }

  .settings-cta {
    justify-self: start;
  }

  .settings-empty {
    padding: 30px 24px;
  }

  .settings-side {
    padding: 18px;
  }
}
</style>
