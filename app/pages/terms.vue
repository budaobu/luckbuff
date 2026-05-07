<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="mb-10">
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Terms</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          使用条款
        </h1>
        <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
      </div>

      <div class="space-y-8 text-sm text-[#e8e0d0]/80 leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">1. 服务说明</h2>
        <p>LuckBuff 是一个基于中国传统命理学（四柱八字、周易八卦等）的在线推演工具，结合人工智能技术为用户提供命盘解读。本服务仅供文化娱乐和自我认知参考，不构成任何专业建议。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">2. 免责声明</h2>
        <p>本网站提供的所有推演结果（包括但不限于八字排盘、AI 解读、卦象分析）仅供文化娱乐参考，不构成医疗、心理、法律、财务或任何其他专业建议。用户应自行判断并承担使用本服务的一切后果。</p>
        <p class="mt-2">对于因使用或无法使用本服务而导致的任何直接、间接、附带、特殊或后果性损害，本网站不承担任何责任。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">3. 用户数据</h2>
        <p>用户的档案数据仅存储在浏览器本地（localStorage），不会上传到我们的服务器。用户可随时在设置页删除所有数据。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">4. 知识产权</h2>
        <p>本网站的代码、设计、算法实现归 LuckBuff 所有。用户不得擅自复制、修改或用于商业目的。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">5. 条款变更</h2>
        <p>我们保留随时修改本条款的权利。修改后的条款将在本页面公布，继续使用本服务即视为接受修改后的条款。</p>
      </section>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '使用条款 - LuckBuff',
  description: 'LuckBuff 使用条款与免责声明',
})
</script>
