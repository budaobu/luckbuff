<template>
  <div class="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm">
    <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
    <div class="relative z-10 p-6">
      <!-- 标题 -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
          <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">大运运势图</h3>
          <p class="text-[11px] text-[#e8e0d0]/40 mt-0.5">每步大运运势走势（开盘·最高·最低·收盘）</p>
        </div>
      </div>

      <!-- 图例 -->
      <div class="flex items-center gap-5 mb-4 text-[11px] text-[#e8e0d0]/40">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-3.5 rounded-sm bg-[#c9a227]" />
          <span>上升运</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-3.5 rounded-sm bg-[#e8e0d0]/50 border border-[#e8e0d0]/30" />
          <span>下降运</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-3.5 rounded-sm border-2 border-[#c9a227]" />
          <span>当前大运</span>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="flex">
        <!-- Y 轴刻度 -->
        <div class="w-10 relative shrink-0" :style="{ height: `${CHART_H}px` }">
          <span
            v-for="(tick, i) in chartData.yTicks"
            :key="i"
            class="absolute right-1.5 text-[10px] text-[#e8e0d0]/30 leading-none"
            :style="{ top: `${tick.pos}%`, transform: 'translateY(-50%)' }"
          >
            {{ tick.value }}
          </span>
        </div>

        <!-- 蜡烛图表 -->
        <div class="flex-1 relative" :style="{ height: `${CHART_H}px` }">
          <!-- 水平网格线 -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="(tick, i) in chartData.yTicks"
              :key="`grid-${i}`"
              class="absolute left-0 right-0 border-t border-white/[0.04]"
              :style="{ top: `${tick.pos}%` }"
            />
          </div>

          <!-- 蜡烛排列 -->
          <div class="absolute inset-0 flex items-end justify-around px-1">
            <div
              v-for="(d, idx) in chartData.items"
              :key="idx"
              class="flex flex-col items-center group/dy relative flex-1 min-w-0"
            >
              <!-- Tooltip -->
              <div
                class="absolute -top-2 left-1/2 -translate-x-1/2 z-[100] w-52 opacity-0 invisible group-hover/dy:opacity-100 group-hover/dy:visible transition-all duration-200 pointer-events-none"
              >
                <div class="rounded-xl border border-white/[0.08] bg-[#1a1612]/95 backdrop-blur-md shadow-2xl px-3.5 py-3 mb-2">
                  <div class="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1a1612] border-b border-r border-white/[0.08] rotate-45" />
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-bold" :class="d.isCurrent ? 'text-[#c9a227]' : 'text-[#f5e6c0]'">
                      {{ d.gan }}{{ d.zhi }}大运
                    </span>
                    <span
                      v-if="d.isCurrent"
                      class="text-[9px] px-1.5 py-0.5 rounded bg-[#c9a227]/15 text-[#c9a227] border border-[#c9a227]/20"
                    >
                      当前
                    </span>
                  </div>
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-[#e8e0d0]/40">年龄段</span>
                      <span class="text-[#e8e0d0]/80">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}岁</span>
                    </div>
                    <div class="grid grid-cols-4 gap-1 pt-1 border-t border-white/[0.06]">
                      <div class="text-center">
                        <p class="text-[9px] text-[#e8e0d0]/30">开盘</p>
                        <p class="text-[11px] font-bold text-[#e8e0d0]/70">{{ d.open }}</p>
                      </div>
                      <div class="text-center">
                        <p class="text-[9px] text-[#e8e0d0]/30">最高</p>
                        <p class="text-[11px] font-bold text-[#c9a227]">{{ d.high }}</p>
                      </div>
                      <div class="text-center">
                        <p class="text-[9px] text-[#e8e0d0]/30">最低</p>
                        <p class="text-[11px] font-bold text-red-400/80">{{ d.low }}</p>
                      </div>
                      <div class="text-center">
                        <p class="text-[9px] text-[#e8e0d0]/30">收盘</p>
                        <p class="text-[11px] font-bold" :class="d.close >= d.open ? 'text-[#c9a227]' : 'text-[#e8e0d0]/70'">{{ d.close }}</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-[#e8e0d0]/40">运势等级</span>
                      <span class="text-[#e8e0d0]/80">{{ d.fortune || '未评' }}</span>
                    </div>
                    <div v-if="d.analysis" class="pt-1.5 border-t border-white/[0.06]">
                      <p class="text-[11px] text-[#e8e0d0]/60 leading-relaxed">{{ d.analysis }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 蜡烛容器：高度 = CHART_H，正好填满图表区 -->
              <div class="relative" :style="{ width: `${CANDLE_W}px`, height: `${CHART_H}px` }">
                <!-- 上影线：从 max(open,close) 到 high -->
                <div
                  class="absolute left-1/2 -translate-x-1/2"
                  :style="{
                    bottom: `${d.upperShadowBottom}px`,
                    height: `${d.upperShadowH}px`,
                    width: `${SHADOW_W}px`,
                    background: d.isCurrent ? '#c9a22790' : (d.isRising ? '#e8e0d070' : '#ef444470'),
                  }"
                />

                <!-- 下影线：从 low 到 min(open,close) -->
                <div
                  class="absolute left-1/2 -translate-x-1/2"
                  :style="{
                    bottom: `${d.lowerShadowBottom}px`,
                    height: `${d.lowerShadowH}px`,
                    width: `${SHADOW_W}px`,
                    background: d.isCurrent ? '#c9a22790' : (d.isRising ? '#e8e0d070' : '#ef444470'),
                  }"
                />

                <!-- 实体：从 min(open,close) 到 max(open,close) -->
                <div
                  class="absolute left-1/2 -translate-x-1/2 rounded-[1px] transition-all duration-500"
                  :style="{
                    bottom: `${d.bodyBottom}px`,
                    height: `${d.bodyH}px`,
                    width: `${BODY_W}px`,
                    background: d.isCurrent
                      ? (d.isRising ? '#c9a227' : '#c9a22780')
                      : (d.isRising ? '#e8e0d080' : '#ef444460'),
                    border: d.isCurrent ? '1.5px solid #c9a227' : 'none',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部标签区（与图表区分层，不再挤占图表空间） -->
      <div class="flex mt-2">
        <div class="w-10 shrink-0" />
        <div class="flex-1 flex justify-around px-1">
          <div
            v-for="(d, idx) in chartData.items"
            :key="`label-${idx}`"
            class="flex flex-col items-center flex-1 min-w-0"
          >
            <!-- 涨跌幅 -->
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded mb-1"
              :class="d.isRising
                ? (d.isCurrent ? 'bg-[#c9a227]/15 text-[#c9a227]' : 'bg-[#e8e0d0]/8 text-[#e8e0d0]/50')
                : 'bg-red-500/10 text-red-400/70'"
            >
              {{ d.change >= 0 ? '+' : '' }}{{ d.change }}
            </span>
            <!-- 干支 + 年龄段 -->
            <p class="text-[11px] font-bold" :class="d.isCurrent ? 'text-[#c9a227]' : 'text-[#e8e0d0]/60'">
              {{ d.gan }}{{ d.zhi }}
            </p>
            <p class="text-[9px] text-[#e8e0d0]/30 mt-0.5">
              {{ d.ageRange[0] }}-{{ d.ageRange[1] }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/10 to-transparent" />
  </div>
</template>

<script setup lang="ts">
import type { DaYun } from '~/types/bazi'

interface Props {
  dayuns: DaYun[]
  currentAge: number
  dayunScores?: Array<{
    index: number
    ganZhi: string
    score: number
    open?: number
    close?: number
    high?: number
    low?: number
    fortune: string
    analysis: string
  }>
}

const props = defineProps<Props>()

const CHART_H = 200
const CANDLE_W = 28
const BODY_W = 16
const SHADOW_W = 2.5

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

/** 基于 index + score 生成确定性的 OHLC fallback */
function generateOHLC(index: number, score: number) {
  const hash = (n: number) => {
    const x = Math.sin(n * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }

  const open = clamp(score + (hash(index * 7 + 1) * 16 - 8))
  const close = clamp(score + (hash(index * 13 + 3) * 16 - 8))
  const high = clamp(Math.max(open, close) + hash(index * 17 + 5) * 12 + 4)
  const low = clamp(Math.min(open, close) - hash(index * 19 + 7) * 12 - 4)

  return { open, close, high, low }
}

/** 统一计算所有数据 */
const chartData = computed(() => {
  // 1. 解析所有原始数据
  const rawItems = props.dayuns.map((d) => {
    const ds = props.dayunScores?.find(s => s.index === d.index)
    const score = ds?.score ?? d.score ?? 50

    let open = ds?.open
    let close = ds?.close
    let high = ds?.high
    let low = ds?.low

    if (open == null || close == null || high == null || low == null) {
      const fallback = generateOHLC(d.index, score)
      open = fallback.open
      close = fallback.close
      high = fallback.high
      low = fallback.low
    }

    // 校验边界
    const minOC = Math.min(open, close)
    const maxOC = Math.max(open, close)
    low = Math.min(low, minOC)
    high = Math.max(high, maxOC)

    return {
      ...d,
      score,
      open,
      close,
      high,
      low,
      analysis: ds?.analysis ?? '',
      fortune: ds?.fortune ?? '',
      isCurrent: d.ageRange[0] <= props.currentAge && d.ageRange[1] >= props.currentAge,
      isRising: close >= open,
      change: Math.round(close - open),
    }
  })

  // 2. 计算全局 Y 轴范围
  const globalLow = Math.min(...rawItems.map(d => d.low))
  const globalHigh = Math.max(...rawItems.map(d => d.high))
  const padding = Math.max(5, (globalHigh - globalLow) * 0.12)
  const yMin = Math.max(0, Math.floor(globalLow - padding))
  const yMax = Math.min(100, Math.ceil(globalHigh + padding))
  const yRange = yMax - yMin

  // 3. Y 轴刻度（5 条等距线）
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    pos: p * 100,
    value: Math.round(yMax - yRange * p),
  }))

  // 4. 计算像素坐标（0 = 底部 = yMin，CHART_H = 顶部 = yMax）
  const toPx = (v: number): number => {
    if (yRange <= 0) return CHART_H / 2
    return ((v - yMin) / yRange) * CHART_H
  }

  const items = rawItems.map((d) => {
    const openY = toPx(d.open)
    const closeY = toPx(d.close)
    const highY = toPx(d.high)
    const lowY = toPx(d.low)

    const bodyBottom = Math.min(openY, closeY)
    const bodyTop = Math.max(openY, closeY)
    const bodyH = Math.max(4, bodyTop - bodyBottom)

    return {
      ...d,
      upperShadowBottom: bodyTop,
      upperShadowH: Math.max(1, highY - bodyTop),
      lowerShadowBottom: lowY,
      lowerShadowH: Math.max(1, bodyBottom - lowY),
      bodyBottom,
      bodyH,
    }
  })

  return { yMin, yMax, yTicks, items }
})
</script>
