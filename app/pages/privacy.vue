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
        <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Privacy</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
          隐私说明
        </h1>
        <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
      </div>

      <div class="space-y-8 text-sm text-[#e8e0d0]/80 leading-relaxed">
      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">数据存储</h2>
        <p>LuckBuff 采用纯客户端架构，您的所有个人数据（包括生辰信息、档案名称等）仅存储在您的浏览器本地存储（localStorage）中。我们不会将这些数据上传到任何服务器，也无法访问您设备上的这些数据。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">AI 服务</h2>
        <p>当您使用 AI 解读功能时，您的命盘信息（干支、十神、大运等）会通过我们的服务器代理转发至 AI 服务提供商。我们不会在服务器上持久化存储这些信息，仅作为实时请求的转发中介。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">Cookies 与追踪</h2>
        <p>我们不使用任何第三方追踪 Cookie。如您配置了百度统计等分析工具，相关数据收集遵循对应服务商的隐私政策。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">数据删除</h2>
        <p>您可以随时在"我的档案"页面删除单条档案，或清除浏览器本地存储以删除所有数据。我们无法代您删除存储在您本地设备上的数据。</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-[#c9a227] mb-2">联系我们</h2>
        <p>如您对隐私政策有任何疑问，请通过网站提供的联系方式与我们取得联系。</p>
      </section>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '隐私说明 - LuckBuff',
  description: 'LuckBuff 隐私政策与用户数据保护说明',
})
</script>
