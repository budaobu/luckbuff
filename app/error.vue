<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center px-6">
    <!-- 氛围背景 -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[20%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#c9a227]/[0.04] blur-[120px]" />
    </div>

    <div class="relative z-10 text-center">
      <!-- 错误码 -->
      <div class="mb-6">
        <span class="text-8xl font-bold text-[#c9a227]/20 tracking-tighter">{{ error.statusCode || 404 }}</span>
      </div>

      <!-- 图标 -->
      <div class="w-16 h-16 rounded-2xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-heroicons-question-mark-circle" class="w-8 h-8 text-[#c9a227]" />
      </div>

      <!-- 标题 -->
      <h1 class="text-2xl font-bold text-[#f5e6c0] mb-3">
        {{ error.statusCode === 404 ? $t('error.notFound') : $t('error.generic') }}
      </h1>

      <!-- 描述 -->
      <p class="text-sm text-[#e8e0d0]/50 max-w-sm mx-auto mb-8 leading-relaxed">
        {{ error.statusCode === 404
          ? $t('error.notFoundDesc')
          : $t('error.genericDesc')
        }}
      </p>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-center">
        <UButton
          color="warning"
          variant="soft"
          @click="handleError"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </template>
          {{ error.statusCode === 404 ? $t('error.backHome') : $t('error.refresh') }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          class="text-[#e8e0d0]/50 hover:text-[#e8e0d0]/80 hover:bg-white/5"
          @click="navigateTo('/tools')"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          </template>
          {{ $t('error.goTools') }}
        </UButton>
      </div>
    </div>

    <!-- 底部提示 -->
    <p class="relative z-10 mt-16 text-xs text-[#e8e0d0]/20">
      {{ $t('footer.copyright') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const { t } = useI18n()

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => {
  if (props.error.statusCode === 404) {
    clearError({ redirect: '/' })
  } else {
    clearError()
    reloadNuxtApp()
  }
}

useSeoMeta({
  title: props.error.statusCode === 404 ? t('error.seoNotFound') : t('error.seoGeneric'),
})
</script>
