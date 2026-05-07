<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">Tools</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[#f5e6c0] tracking-tight">
          算命工具
        </h1>
        <p class="text-sm text-[#e8e0d0]/40 mt-3 max-w-md mx-auto">
          选择适合您的推演方式，AI 为您解读命理密码
        </p>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-5" />
      </div>

      <!-- 工具卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 四柱八字 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-calendar-days" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">四柱八字</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              输入出生年月日时，自动排定四柱、十神、大运与流年。AI 从格局、用神、刑冲合害等维度给出结构化解读。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              to="/tools/bazi"
              class="group/btn w-full justify-center"
            >
              立即推演
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 梅花易数 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-swatch" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">梅花易数</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              一事一占，心诚则灵。支持时间起卦、数字起卦、测字起卦三种方式，AI 解析本卦、互卦、变卦的象义与趋势。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              to="/tools/zhouyi"
              class="group/btn w-full justify-center"
            >
              立即起卦
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <!-- 紫微斗数 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-8">
            <div class="w-14 h-14 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UIcon name="i-heroicons-star" class="w-7 h-7" />
            </div>
            <h3 class="text-xl font-semibold text-[#f5e6c0] mb-3">紫微斗数</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-8">
              以出生时辰定命宫，排布十二宫位与十四正曜。AI 解读本命格局、大限走势与流年变化，指明人生方向。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="md"
              to="/tools/zwds"
              class="group/btn w-full justify-center"
            >
              立即排盘
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </template>
            </UButton>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="mt-16 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-[#e8e0d0]/40">
          <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#c9a227]/60" />
          <span>建议先在 <NuxtLink to="/settings" class="text-[#c9a227] hover:underline">档案管理</NuxtLink> 保存生辰信息，推演时自动填入</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '算命工具 - 四柱八字 · 梅花易数 · 紫微斗数 | LuckBuff',
  description: 'LuckBuff 提供四柱八字排盘、梅花易数起卦、紫微斗数命盘三大命理工具。选择适合您的推演方式，AI 为您白话解读命理密码。',
})
</script>
