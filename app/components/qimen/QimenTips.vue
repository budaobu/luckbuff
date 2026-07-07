<template>
  <div class="mt-8">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
      <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimen.tips.title') }}</h3>
    </div>

    <!-- 移动端：横向滑动 -->
    <div class="flex sm:hidden gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
      <div
        v-for="(tip, idx) in tips"
        :key="idx"
        class="flex-shrink-0 w-[280px] snap-start rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
          <div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端：3 列 Grid -->
    <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="(tip, idx) in tips"
        :key="idx"
        class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]/30"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
          <div>
            <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tips = [
  { icon: '☰', title: '奇门遁甲是什么', content: '中国古代三大秘术之一，起源于军事。"奇"指乙丙丁三奇，"门"指八门，"遁甲"指六甲隐入六仪。' },
  { icon: '⏱', title: '时家与日家', content: '时家以时辰起局，一时辰换一盘，适合即时占卜，本工具使用时家。日家一天一局，多用于择吉。' },
  { icon: '🚪', title: '八门吉凶', content: '吉门：生、开、休；平门：景、杜；凶门：死、惊、伤。占事以吉门落用事宫为顺。' },
  { icon: '⚡', title: '直符与直使', content: '直符是天盘值班星，直使是值班门，两者落宫是当前时局能量最集中的方向，判断占事的核心落点。' },
  { icon: '☯', title: '阴遁与阳遁', content: '冬至到夏至阳遁，九星顺转；夏至到冬至阴遁，逆转。同一时辰阴阳遁不同，盘面完全不同。' },
  { icon: '🕐', title: '起课时间怎么填', content: '填心中起意决定占问的时刻，不是事件发生时间。寻人寻物尤其不要填丢失时间。' },
  { icon: '🎯', title: '奇门擅长的场景', content: '竞争博弈、行动决策、方位择向、择时选吉时。感情命理类不是奇门强项。' },
  { icon: '🧭', title: '九宫方位怎么看', content: '传统盘面南上北下：离宫居上，坎宫居下，震宫居左，兑宫居右。以自身为中心对应方向。' },
]
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
