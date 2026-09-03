<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <div class="mb-8">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">My Reports</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('myReports.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-2">
          {{ $t('myReports.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
      </div>

      <!-- Empty state -->
      <div v-if="!reports.length" class="rounded-2xl border border-dashed border-[var(--border-light)] py-16 text-center">
        <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-[var(--text-placeholder)] mx-auto mb-3" />
        <p class="text-sm text-[var(--text-faint)]">{{ $t('myReports.empty') }}</p>
        <p class="text-[11px] text-[var(--text-placeholder)] mt-1">{{ $t('myReports.emptyHint') }}</p>
      </div>

      <!-- Report list -->
      <div v-else class="space-y-3">
        <div
          v-for="report in reports"
          :key="report.id"
          class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)]">{{ report.tool }}</span>
                <span class="text-[10px] text-[var(--text-placeholder)]">{{ formatDate(report.savedAt) }}</span>
              </div>
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">{{ report.title }}</p>
              <p class="text-xs text-[var(--text-faint)] mt-1 line-clamp-2">{{ report.preview }}</p>
            </div>
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-heroicons-trash"
              @click="remove(report.id)"
            />
          </div>
        </div>

        <div class="pt-3 text-center">
          <UButton variant="outline" size="xs" @click="confirmClear">
            {{ $t('myReports.clearAll') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const { isLoggedIn } = useAuth()
const { reports, load, remove: removeReport, clearAll } = useReports()

onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo('/')
    return
  }
  load()
})

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function remove(id: string) {
  removeReport(id)
}

function confirmClear() {
  if (window.confirm(t('myReports.confirmClear'))) {
    clearAll()
  }
}

useSeoMeta({
  title: t('myReports.title'),
  description: t('myReports.subtitle'),
})
</script>
