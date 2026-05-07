<template>
  <div>
    <!-- ========== HERO ========== -->
    <section class="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <!-- 氛围背景光晕 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.07] blur-[120px]" />
        <div class="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.05] blur-[100px]" />
        <div class="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-[#c9a227]/[0.04] blur-[80px]" />
      </div>

      <!-- 星点装饰 -->
      <div class="absolute inset-0 pointer-events-none opacity-40">
        <div
          v-for="(star, i) in stars"
          :key="i"
          class="absolute rounded-full bg-[#f5e6c0]"
          :class="star.size"
          :style="{ top: star.top, left: star.left, animationDelay: star.delay }"
        />
      </div>

      <!-- 内容 -->
      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a227]/20 bg-[#c9a227]/5 text-[#c9a227] text-xs tracking-widest uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-[#c9a227] animate-pulse" />
          AI × 五千年命理智慧
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#f5e6c0] leading-[1.15] tracking-tight mb-6">
          五千年前就写好的你<br>
          <span class="text-[#c9a227]">今天 AI 读给你听</span>
        </h1>

        <p class="text-base md:text-lg text-[#e8e0d0]/60 max-w-xl mx-auto mb-10 leading-relaxed">
          四柱八字推演命格大运，梅花易数占卜吉凶得失，紫微斗数排布十二宫位——五千年命理智慧，AI 为你白话解读。
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            size="lg"
            color="warning"
            variant="solid"
            to="/tools"
            class="px-8 py-3 text-base font-medium shadow-lg shadow-[#c9a227]/20 hover:shadow-[#c9a227]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </template>
            立即开始推演
          </UButton>
          <UButton
            size="lg"
            color="neutral"
            variant="ghost"
            to="/settings"
            class="text-[#e8e0d0] hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/[0.06]"
          >
            保存生辰档案
          </UButton>
        </div>
      </div>

    </section>

    <!-- 新用户引导 Banner -->
    <section v-if="showGuideBanner" class="max-w-4xl mx-auto px-6 -mt-12 mb-20 relative z-10">
      <div class="relative rounded-2xl border border-[#c9a227]/20 bg-[#c9a227]/[0.03] backdrop-blur-sm p-5 flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#c9a227]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#c9a227]" />
          </div>
          <div>
            <p class="text-sm text-[#f5e6c0]/90 leading-relaxed">
              建议先 <NuxtLink to="/settings" class="text-[#c9a227] hover:underline font-medium">保存你的生辰信息</NuxtLink>，算命时自动填入。随时可为家人朋友添加多份档案。
            </p>
          </div>
        </div>
        <UButton color="neutral" variant="ghost" size="xs" icon="i-heroicons-x-mark" class="flex-shrink-0 text-[#e8e0d0]/40 hover:text-[#e8e0d0]" @click="dismissGuide" />
      </div>
    </section>

    <!-- ========== 为什么选择 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">Why LuckBuff</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          为什么选择 LuckBuff
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlowCard title="三大命理体系" icon="i-heroicons-cpu-chip">
          八字命理、梅花易数、紫微斗数全覆盖，算法本地运行，排盘过程透明可追溯。
        </GlowCard>
        <GlowCard title="AI 白话解读" icon="i-heroicons-language">
          将古籍中的命理术语转译为现代语言，结合命盘结构给出针对性分析，非泛泛而谈。
        </GlowCard>
        <GlowCard title="流式交互体验" icon="i-heroicons-bolt">
          命盘数据本地实时计算，AI 解读以流式卡片呈现，无需等待，即看即分享。
        </GlowCard>
        <GlowCard title="多人档案管理" icon="i-heroicons-users">
          为自己、家人、朋友保存多份生辰档案，推演时一键切换，数据仅存本地。
        </GlowCard>
      </div>
    </section>

    <!-- 分隔装饰 -->
    <div class="max-w-4xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>

    <!-- ========== 算命工具 ========== -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">Tools</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          算命工具
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 四柱八字 -->
        <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/30 hover:bg-white/[0.04] hover:-translate-y-1">
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">四柱八字</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              输入出生年月日时，自动排定四柱、十神、大运与流年。AI 从格局、用神、刑冲合害等维度给出结构化解读。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              to="/tools/bazi"
              class="group/btn"
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
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-swatch" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">梅花易数</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              一事一占，心诚则灵。支持时间起卦、数字起卦、测字起卦三种方式，AI 解析本卦、互卦、变卦的象义与趋势。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              to="/tools/zhouyi"
              class="group/btn"
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
          <div class="p-7">
            <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mb-5 transition-transform duration-500 group-hover:scale-110">
              <UIcon name="i-heroicons-star" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-[#f5e6c0] mb-2">紫微斗数</h3>
            <p class="text-sm text-[#e8e0d0]/50 leading-relaxed mb-6">
              以出生时辰定命宫，排布十二宫位与十四正曜。AI 解读本命格局、大限走势与流年变化，指明人生方向。
            </p>
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              to="/tools/zwds"
              class="group/btn"
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
    </section>

    <!-- 分隔装饰 -->
    <div class="max-w-4xl mx-auto px-6">
      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>

    <!-- ========== 流年速览 ========== -->
    <section v-if="liuNianText" class="max-w-4xl mx-auto px-6 py-20">
      <div class="relative rounded-2xl border border-[#c9a227]/20 bg-[#c9a227]/[0.03] backdrop-blur-sm p-8 md:p-10 text-center">
        <div class="w-12 h-12 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] mx-auto mb-5">
          <UIcon name="i-heroicons-eye" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-semibold text-[#f5e6c0] mb-3">流年速览</h3>
        <p class="text-base text-[#e8e0d0]/70 mb-6">{{ liuNianText }}</p>
        <UButton color="warning" variant="soft" size="sm" to="/tools/bazi">
          查看详细推演
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </template>
        </UButton>
      </div>
    </section>

    <!-- ========== FAQ ========== -->
    <section class="max-w-3xl mx-auto px-6 py-20">
      <div class="text-center mb-14">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-3 block">FAQ</span>
        <h2 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          常见问题
        </h2>
        <div class="w-12 h-px bg-[#c9a227]/30 mx-auto mt-4" />
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="group rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-[#c9a227]/20 hover:bg-white/[0.04]"
        >
          <button
            class="w-full flex items-center gap-4 px-6 py-5 text-left"
            @click="toggleFaq(index)"
          >
            <div
              class="flex-shrink-0 w-7 h-7 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 flex items-center justify-center text-xs font-medium text-[#c9a227] transition-colors group-hover:border-[#c9a227]/50 group-hover:bg-[#c9a227]/20"
            >
              {{ index + 1 }}
            </div>
            <span class="flex-1 text-sm font-medium text-[#f5e6c0]/80 group-hover:text-[#f5e6c0] transition-colors">
              {{ item.label }}
            </span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 text-[#c9a227]/50 transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-180': openFaqIndex === index }"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="openFaqIndex === index" class="overflow-hidden">
              <div class="px-6 pb-5 pl-[58px]">
                <p class="text-sm text-[#e8e0d0]/60 leading-relaxed">
                  {{ item.content }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProfilesStore } from '~/stores/profiles'

const store = useProfilesStore()
const guideDismissed = ref(false)
const openFaqIndex = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const showGuideBanner = computed(() => {
  return store.list.length === 0 && !guideDismissed.value
})

function dismissGuide() {
  guideDismissed.value = true
  if (process.client) {
    localStorage.setItem('luckbuff-guide-dismissed', 'true')
  }
}

onMounted(() => {
  if (process.client) {
    guideDismissed.value = localStorage.getItem('luckbuff-guide-dismissed') === 'true'
  }
})

const liuNianText = computed(() => {
  const dp = store.defaultProfile
  if (!dp || !dp.birthDate) return ''
  const year = new Date().getFullYear()
  return `${dp.name || dp.label} 的 ${year} 年运势：八字看流年，紫微看大限，选择上方工具开始推演`
})

// 随机星点
const stars = Array.from({ length: 20 }, () => ({
  size: ['w-0.5 h-0.5', 'w-1 h-1', 'w-1.5 h-1.5'][Math.floor(Math.random() * 3)],
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 3}s`,
}))

const faqItems = [
  {
    label: '三种工具有什么区别，我该用哪个？',
    content: '八字命理侧重人生格局与大运走势，适合了解整体命格；梅花易数一事一占，适合针对具体问题（如决策、时机）起卦问卜；紫微斗数以十二宫位解析人生各领域，适合详细审视事业、感情、财运等方向。三种体系可以互补参考。',
  },
  {
    label: '排盘数据准确吗？',
    content: '所有命盘数据均基于确定性算法本地计算：八字采用标准天干地支与节气交节规则，梅花易数遵循《梅花易数》原著起卦法，紫微斗数依据南北派通用安星诀。AI 解读部分因模型差异每次表述可能略有不同，建议将结果作为自我认知参考，而非绝对预言。',
  },
  {
    label: '我的数据安全吗？',
    content: '所有档案数据仅存储在您的浏览器本地（localStorage），不会上传到任何服务器。命盘计算完全在本地完成，AI 解读时仅传递结构化命盘数据（如星曜、卦象），不包含任何个人标识信息。您随时可以在设置页删除所有数据。',
  },
  {
    label: '不知道出生时辰怎么办？',
    content: '八字和紫微斗数需要准确的出生时辰（时柱/命宫定位）。如果不知时辰，可以先用"七字分析"（年月日）查看部分信息，或尝试用梅花易数起卦问事，该工具不依赖生辰。',
  },
  {
    label: '为什么每次 AI 解读的内容不一样？',
    content: 'AI 解读基于相同的命盘结构数据，但大语言模型在表述上会有自然差异，这类似于不同的命理师对同一命盘会有不同角度的解读。核心命盘信息（格局、用神、星曜分布等）是固定的，AI 提供的是多维度解读视角。',
  },
  {
    label: '出生在节气交界日有影响吗？',
    content: '八字月柱以节气为界（非农历初一），如果出生在节气前后一天，系统会自动提示"出生于节气交界日"，建议您根据实际出生时间确认月柱，以确保排盘准确。',
  },
]

useSeoMeta({
  title: 'LuckBuff - 四柱八字 · 梅花易数 · 紫微斗数 | AI 命理解读',
  description: 'LuckBuff 提供四柱八字排盘、梅花易数起卦、紫微斗数命盘三大命理工具。命盘数据本地计算，AI 白话解读，支持多人档案管理。',
})
</script>
