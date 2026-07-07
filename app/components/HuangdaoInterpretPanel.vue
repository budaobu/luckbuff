<template>
  <div :class="embedded ? '' : 'rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5'">
    <!-- 标题区 -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)]">
        {{ $t('huangdao.aiInterpretTitle') }}
      </h3>
      <div v-if="streaming" class="flex items-center gap-1.5 ml-auto">
        <span class="text-xs text-[var(--accent-muted)]">{{ $t('huangdao.aiLoading') }}</span>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
        </span>
      </div>
    </div>

    <!-- 等待首个 token -->
    <div v-if="!started && !error" class="flex flex-col items-center py-8">
      <div class="relative mb-3">
        <div class="w-10 h-10 rounded-full border-2 border-[var(--accent-border)] border-t-[var(--accent)] animate-spin" />
        <div class="absolute inset-0 flex items-center justify-center">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)]" />
        </div>
      </div>
      <p class="text-sm text-[var(--text-muted)]">{{ $t('huangdao.aiLoading') }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-6">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p class="text-sm text-red-400">{{ error }}</p>
      <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ $t('common.retry') }}
      </UButton>
    </div>

    <!-- 流式内容 -->
    <div v-else class="space-y-4">
      <!-- 按 AI 原文段落顺序渲染：择日总论 → 吉日推荐 → 其他 -->
      <template v-for="(section, idx) in parsedSections" :key="idx">
        <!-- 最佳吉日推荐：数据化可视化卡片 -->
        <template v-if="isTopDatesSection(section.title)">
          <div v-if="topDates.length" class="space-y-4">
            <div
              v-for="(day, dIdx) in topDates"
              :key="day.date"
              class="rounded-2xl border overflow-hidden transition-all duration-300"
              :class="dIdx === 0
                ? 'huangdao-first-day-card border-amber-400/30 shadow-lg shadow-amber-400/5'
                : dIdx === 1
                  ? 'border-[var(--accent-border)]'
                  : 'border-[var(--border-subtle)]'"
            >
              <!-- ===== 卡片头部：排名 + 日期 + 匹配度 ===== -->
              <div
                class="relative px-5 py-4"
                :class="dIdx === 0
                  ? 'bg-amber-400/5'
                  : dIdx === 1
                    ? 'bg-[var(--accent-bg)]'
                    : 'bg-[var(--surface-dropdown)]'"
              >
                <!-- 排名标签 -->
                <div class="absolute top-3 right-3">
                  <span
                    class="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border"
                    :class="dIdx === 0
                      ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                      : dIdx === 1
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-border)]'
                        : 'bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border-light)]'"
                  >
                    {{ dIdx === 0 ? $t('huangdao.rankFirst') : dIdx === 1 ? $t('huangdao.rankSecond') : $t('huangdao.rankThird') }}
                  </span>
                </div>

                <!-- 日期主信息 -->
                <div class="flex items-end gap-4">
                  <!-- 公历日期 -->
                  <div>
                    <div class="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight">
                      {{ formatFullDate(day.date) }}
                    </div>
                    <div class="flex items-center gap-2 mt-1.5">
                      <span class="text-xs text-[var(--text-muted)]">{{ $t('common.week') }}{{ day.week }}</span>
                      <span class="text-[var(--border-subtle)]">|</span>
                      <span class="text-xs text-[var(--accent-muted)]">{{ $t('huangdao.lunar') }}{{ day.monthInChinese }}月{{ day.dayInChinese }}</span>
                    </div>
                  </div>

                  <!-- 匹配度 + 星级 -->
                  <div class="ml-auto text-right">
                    <div class="flex items-center justify-end gap-1 mb-1">
                      <span
                        v-for="n in 5"
                        :key="n"
                        class="text-sm"
                        :class="n <= starRating(day.matchScore) ? 'text-amber-400' : 'text-[var(--border-subtle)]'"
                      >
                        ★
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-1.5 rounded-full bg-[var(--surface-card)] overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-700"
                          :class="scoreColorClass(day.matchScore)"
                          :style="{ width: `${day.matchScore}%` }"
                        />
                      </div>
                      <span class="text-xs font-semibold" :class="scoreTextColor(day.matchScore)">
                        {{ day.matchScore }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ===== 干支三柱区域 ===== -->
              <div class="px-5 py-3 border-b border-[var(--border-subtle)]">
                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="(col, cIdx) in ganZhiColumns(day)"
                    :key="cIdx"
                    class="text-center rounded-lg py-2"
                    :class="cIdx === 2 ? 'bg-[var(--accent)]/5 border border-[var(--accent-border)]' : 'bg-[var(--surface-card)] border border-[var(--border-light)]'"
                  >
                    <div class="text-[10px] text-[var(--text-faint)] mb-0.5">{{ col.label }}</div>
                    <div class="text-sm font-bold" :class="cIdx === 2 ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'">
                      {{ col.ganZhi }}
                    </div>
                    <div class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ col.naYin }}</div>
                  </div>
                </div>
              </div>

              <!-- ===== 核心指标网格 ===== -->
              <div class="px-5 py-3 border-b border-[var(--border-subtle)]">
                <div class="grid grid-cols-2 gap-2">
                  <!-- 冲煞 -->
                  <div class="rounded-lg border border-red-400/15 bg-red-400/5 p-2.5">
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-bolt" class="w-3 h-3 text-red-400" />
                      <span class="text-[10px] font-semibold text-red-400">{{ $t('huangdao.chongSha') }}</span>
                    </div>
                    <div class="text-xs text-[var(--text-body)]">
                      <span v-if="day.chongDesc" class="font-medium">{{ day.chongDesc }}</span>
                      <span v-if="day.sha" class="text-[var(--text-muted)]"> · {{ $t('huangdao.sha') }}{{ day.sha }}</span>
                    </div>
                  </div>

                  <!-- 值日天神 -->
                  <div
                    class="rounded-lg border p-2.5"
                    :class="day.tianShenLuck === '吉'
                      ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
                      : 'border-red-400/15 bg-red-400/5'"
                  >
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-sun" class="w-3 h-3" :class="day.tianShenLuck === '吉' ? 'text-[var(--accent)]' : 'text-red-400'" />
                      <span class="text-[10px] font-semibold" :class="day.tianShenLuck === '吉' ? 'text-[var(--accent)]' : 'text-red-400'">{{ $t('huangdao.tianShen') }}</span>
                    </div>
                    <div class="text-xs">
                      <span class="font-bold" :class="day.tianShenLuck === '吉' ? 'text-[var(--accent)]' : 'text-red-400'">{{ day.tianShen }}</span>
                      <span class="text-[10px] text-[var(--text-muted)] ml-1">({{ day.tianShenType }})</span>
                    </div>
                  </div>

                  <!-- 吉神 -->
                  <div class="rounded-lg border border-emerald-400/15 bg-emerald-400/5 p-2.5">
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-sparkles" class="w-3 h-3 text-emerald-400" />
                      <span class="text-[10px] font-semibold text-emerald-400">{{ $t('huangdao.jiShen') }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="js in day.jiShen.slice(0, 4)"
                        :key="js"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400"
                      >
                        {{ js }}
                      </span>
                      <span v-if="day.jiShen.length > 4" class="text-[10px] text-[var(--text-faint)]">+{{ day.jiShen.length - 4 }}</span>
                    </div>
                  </div>

                  <!-- 凶煞 -->
                  <div class="rounded-lg border border-orange-400/15 bg-orange-400/5 p-2.5">
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3 text-orange-400" />
                      <span class="text-[10px] font-semibold text-orange-400">{{ $t('huangdao.xiongSha') }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="xs in day.xiongSha.slice(0, 4)"
                        :key="xs"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-400"
                      >
                        {{ xs }}
                      </span>
                      <span v-if="day.xiongSha.length > 4" class="text-[10px] text-[var(--text-faint)]">+{{ day.xiongSha.length - 4 }}</span>
                    </div>
                  </div>

                  <!-- 九星 -->
                  <div class="rounded-lg border border-sky-400/15 bg-sky-400/5 p-2.5">
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-star" class="w-3 h-3 text-sky-400" />
                      <span class="text-[10px] font-semibold text-sky-400">{{ $t('huangdao.nineStar') }}</span>
                    </div>
                    <div class="text-xs text-[var(--text-body)] font-medium">{{ day.nineStar || '-' }}</div>
                  </div>

                  <!-- 旬空 -->
                  <div class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-2.5">
                    <div class="flex items-center gap-1.5 mb-1">
                      <UIcon name="i-heroicons-circle-stack" class="w-3 h-3 text-[var(--text-muted)]" />
                      <span class="text-[10px] font-semibold text-[var(--text-muted)]">{{ $t('huangdao.xunKong') }}</span>
                    </div>
                    <div class="text-xs text-[var(--text-body)] font-medium">{{ day.xunKong || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- ===== 宜忌区域 ===== -->
              <div class="px-5 py-3 border-b border-[var(--border-subtle)]">
                <!-- 宜 -->
                <div class="mb-2.5">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <span class="w-4 h-4 rounded-full bg-emerald-400/15 flex items-center justify-center text-[10px] font-bold text-emerald-400">宜</span>
                    <span class="text-[10px] font-semibold text-emerald-400">{{ $t('huangdao.yi') }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="y in day.yi"
                      :key="y"
                      class="text-[11px] px-2 py-0.5 rounded-md bg-emerald-400/8 text-emerald-400 border border-emerald-400/15"
                    >
                      {{ y }}
                    </span>
                    <span v-if="!day.yi.length" class="text-xs text-[var(--text-faint)]">{{ $t('huangdao.none') }}</span>
                  </div>
                </div>
                <!-- 忌 -->
                <div>
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <span class="w-4 h-4 rounded-full bg-red-400/15 flex items-center justify-center text-[10px] font-bold text-red-400">忌</span>
                    <span class="text-[10px] font-semibold text-red-400">{{ $t('huangdao.ji') }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="j in day.ji"
                      :key="j"
                      class="text-[11px] px-2 py-0.5 rounded-md bg-red-400/8 text-red-400 border border-red-400/15"
                    >
                      {{ j }}
                    </span>
                    <span v-if="!day.ji.length" class="text-xs text-[var(--text-faint)]">{{ $t('huangdao.none') }}</span>
                  </div>
                </div>
              </div>

              <!-- ===== 方位区域 ===== -->
              <div class="px-5 py-3 border-b border-[var(--border-subtle)]">
                <div class="flex items-center gap-1.5 mb-2">
                  <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-[var(--accent-muted)]" />
                  <span class="text-[10px] font-semibold text-[var(--accent-muted)]">{{ $t('huangdao.directions') }}</span>
                </div>
                <div class="flex flex-wrap gap-x-3 gap-y-1.5">
                  <DirectionTag v-if="day.positionCaiDesc" icon="i-heroicons-currency-yen" :label="$t('huangdao.cai')" :value="day.positionCaiDesc" color="amber" />
                  <DirectionTag v-if="day.positionXiDesc" icon="i-heroicons-heart" :label="$t('huangdao.xi')" :value="day.positionXiDesc" color="rose" />
                  <DirectionTag v-if="day.positionFuDesc" icon="i-heroicons-gift" :label="$t('huangdao.fu')" :value="day.positionFuDesc" color="emerald" />
                  <DirectionTag v-if="day.positionYangGuiDesc" icon="i-heroicons-user" :label="$t('huangdao.yangGui')" :value="day.positionYangGuiDesc" color="sky" />
                  <DirectionTag v-if="day.positionYinGuiDesc" icon="i-heroicons-user-circle" :label="$t('huangdao.yinGui')" :value="day.positionYinGuiDesc" color="violet" />
                  <DirectionTag v-if="day.positionTaiSuiDesc" icon="i-heroicons-shield-exclamation" :label="$t('huangdao.taiSui')" :value="day.positionTaiSuiDesc" color="orange" />
                </div>
              </div>

              <!-- ===== 吉时区域 ===== -->
              <div v-if="getAiDetail(day.date)?.hours" class="px-5 py-3 border-b border-[var(--border-subtle)]">
                <div class="flex items-center gap-1.5 mb-2">
                  <UIcon name="i-heroicons-clock" class="w-3 h-3 text-sky-400" />
                  <span class="text-[10px] font-semibold text-sky-400">{{ $t('huangdao.luckyHours') }}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="h in parseHours(getAiDetail(day.date)?.hours || '')"
                    :key="h"
                    class="text-xs px-2.5 py-1 rounded-full bg-sky-400/8 text-sky-400 border border-sky-400/15"
                  >
                    {{ h }}
                  </span>
                </div>
              </div>

              <!-- ===== AI 推荐理由 ===== -->
              <div v-if="getAiDetail(day.date)?.reason" class="px-5 py-3">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <UIcon name="i-heroicons-light-bulb" class="w-3 h-3 text-[var(--accent-muted)]" />
                  <span class="text-[10px] font-semibold text-[var(--accent-muted)]">{{ $t('huangdao.reason') }}</span>
                </div>
                <p class="text-xs text-[var(--text-body)] leading-relaxed">{{ getAiDetail(day.date)?.reason }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- 其他段落：正常 Markdown -->
        <template v-else>
          <div
            class="rounded-xl border p-4"
            :class="sectionBorderClass(section.title)"
          >
            <div class="flex items-center gap-2 mb-2">
              <UIcon
                :name="sectionIcon(section.title)"
                class="w-3.5 h-3.5"
                :class="sectionIconColor(section.title)"
              />
              <h4 class="text-xs font-semibold tracking-wide" :class="sectionTitleColor(section.title)">
                {{ section.title }}
              </h4>
            </div>
            <div
              class="text-sm text-[var(--text-body)] leading-relaxed ai-section-content max-w-none"
              v-html="renderMarkdown(section.content)"
            />
          </div>
        </template>
      </template>

      <!-- 流式输出中的纯文本（尚未解析为段落的临时展示） -->
      <div
        v-if="streaming && content && !parsedSections.length"
        class="rounded-xl border border-[var(--border-light)] p-4"
      >
        <p class="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">{{ content }}</p>
      </div>

      <!-- 光标 -->
      <div v-if="streaming" class="flex items-center gap-1">
        <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
      </div>

      <!-- 免责声明 -->
      <div v-if="!streaming && content" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 mt-2">
        <p class="text-[11px] text-[var(--text-placeholder)] text-center leading-relaxed">
          {{ $t('huangdao.aiDisclaimer') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { HuangdaoDay } from '~/types/huangdao'

const { t } = useI18n()

const props = defineProps<{
  content: string
  streaming: boolean
  started: boolean
  error: string | null
  days?: HuangdaoDay[]
  embedded?: boolean
}>()

defineEmits<{
  retry: []
}>()

// 按 "## 标题" 分段
const parsedSections = computed(() => {
  if (!props.content) return []
  const raw = props.content.replace(/<!--[\s\S]*?-->/g, '').trim()
  if (!raw) return []
  const parts = raw.split(/\n(?=##\s)/)
  return parts.map((part) => {
    const lines = part.split('\n')
    const titleMatch = lines[0]?.match(/^##\s*(.+)$/)
    const title = titleMatch?.[1]?.trim() ?? ''
    const content = lines.slice(titleMatch ? 1 : 0).join('\n').trim()
    return { title, content }
  }).filter(s => s.title || s.content)
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  try {
    return marked.parse(text, { async: false }) as string
  } catch {
    return text
  }
}

function isTopDatesSection(title: string) {
  return title.includes('最佳吉日') || title.includes('Top Date') || title.includes('吉日推荐') || title.includes('Date Recommendations')
}

// 格式化完整日期：6月12日
function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 星级评分
function starRating(score: number) {
  if (score >= 95) return 5
  if (score >= 85) return 4
  if (score >= 75) return 3
  if (score >= 65) return 2
  if (score >= 50) return 1
  return 0
}

function scoreColorClass(score: number) {
  if (score >= 90) return 'bg-[var(--accent)]'
  if (score >= 75) return 'bg-amber-400'
  if (score >= 60) return 'bg-sky-400'
  return 'bg-[var(--text-muted)]'
}

function scoreTextColor(score: number) {
  if (score >= 90) return 'text-[var(--accent)]'
  if (score >= 75) return 'text-amber-400'
  if (score >= 60) return 'text-sky-400'
  return 'text-[var(--text-muted)]'
}

// 干支三柱数据
function ganZhiColumns(day: HuangdaoDay) {
  return [
    { label: t('huangdao.yearPillar'), ganZhi: day.yearGanZhi, naYin: day.yearNaYin },
    { label: t('huangdao.monthPillar'), ganZhi: day.monthGanZhi, naYin: day.monthNaYin },
    { label: t('huangdao.dayPillar'), ganZhi: day.dayGanZhi, naYin: day.naYin },
  ]
}

// 解析推荐时辰文本为数组
function parseHours(hoursText: string) {
  if (!hoursText) return []
  // 匹配 "07:00-08:59（辰时）" 或 "辰时（07:00-08:59）" 格式
  const results: string[] = []
  const lines = hoursText.split(/[，,、\n]/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) results.push(trimmed)
  }
  return results.length ? results : [hoursText]
}

// 从 AI 文本的「最佳吉日推荐」段落中解析结构化数据
const parsedAiDateDetails = computed(() => {
  const topSection = parsedSections.value.find(s => isTopDatesSection(s.title))
  if (!topSection?.content) return new Map<string, { rank: string; reason: string; hours: string }>()

  const map = new Map<string, { rank: string; reason: string; hours: string }>()
  const content = topSection.content

  const entryPattern = /(首推|次推|次选|备选)[：:\s]+(\d{4}[年\-]\d{1,2}[月\-]\d{1,2}[日]?)[（(]([^)）]+)[）)][，,\s]*([\s\S]*?)(?=(?:首推|次推|次选|备选)\s*[：:\s]+\d{4}|$)/g

  let m: RegExpExecArray | null
  while ((m = entryPattern.exec(content)) !== null) {
    const rank = m[1] ?? ''
    const dateStr = m[2] ?? ''
    const text = m[4]?.trim() ?? ''

    const reasonMatch = text.match(/^(.+?)(?:推荐(?:时辰|吉时)\s*[：:](.+))?$/s)
    const reason = reasonMatch?.[1]?.trim() || ''
    const hours = reasonMatch?.[2]?.trim() || ''

    const normalizedDate = normalizeDate(dateStr)
    map.set(normalizedDate, { rank, reason, hours })
  }

  return map
})

function normalizeDate(dateStr: string): string {
  if (dateStr.includes('-')) return dateStr
  return dateStr
    .replace(/[年月]/g, '-')
    .replace('日', '')
    .split('-')
    .map(p => p.padStart(2, '0'))
    .join('-')
}

function getAiDetail(dateStr: string) {
  return parsedAiDateDetails.value.get(dateStr)
}

// 最佳吉日卡片数据：优先按 AI 推荐顺序，未匹配的按 matchScore 补全
const topDates = computed(() => {
  if (!props.days?.length) return []

  const aiOrder = Array.from(parsedAiDateDetails.value.keys())
  const ordered: HuangdaoDay[] = []

  for (const dateKey of aiOrder) {
    const day = props.days.find(d => d.date === dateKey)
    if (day) ordered.push(day)
  }

  const remaining = props.days
    .filter(d => !aiOrder.includes(d.date))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, Math.max(0, 3 - ordered.length))

  return [...ordered, ...remaining]
})

// 段落样式映射
const SECTION_STYLES: Record<string, { icon: string; iconColor: string; titleColor: string; border: string }> = {
  '择日总论': { icon: 'i-heroicons-sparkles', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)] bg-[var(--accent-bg)]' },
  'AI 择日总论': { icon: 'i-heroicons-sparkles', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)] bg-[var(--accent-bg)]' },
  '最佳吉日推荐': { icon: 'i-heroicons-star', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  '吉日推荐': { icon: 'i-heroicons-star', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  '择日建议': { icon: 'i-heroicons-light-bulb', iconColor: 'text-emerald-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-emerald-400/10' },
  '忌讳提醒': { icon: 'i-heroicons-exclamation-triangle', iconColor: 'text-red-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-red-400/10' },
  '注意事项': { icon: 'i-heroicons-exclamation-circle', iconColor: 'text-orange-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-orange-400/10' },
  '时辰建议': { icon: 'i-heroicons-clock', iconColor: 'text-sky-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-sky-400/10' },
  '总结': { icon: 'i-heroicons-flag', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
  'Auspicious Day Overview': { icon: 'i-heroicons-sparkles', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)] bg-[var(--accent-bg)]' },
  'Top Date Recommendations': { icon: 'i-heroicons-star', iconColor: 'text-amber-400/80', titleColor: 'text-[var(--text-primary)]', border: 'border-amber-400/10' },
  'Date Selection Advice': { icon: 'i-heroicons-light-bulb', iconColor: 'text-emerald-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-emerald-400/10' },
  'Things to Avoid': { icon: 'i-heroicons-exclamation-triangle', iconColor: 'text-red-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-red-400/10' },
  'Hourly Advice': { icon: 'i-heroicons-clock', iconColor: 'text-sky-400/70', titleColor: 'text-[var(--text-primary)]', border: 'border-sky-400/10' },
  'Conclusion': { icon: 'i-heroicons-flag', iconColor: 'text-[var(--accent)]', titleColor: 'text-[var(--accent)]', border: 'border-[var(--accent-faint)]' },
}

const DEFAULT_STYLE = { icon: 'i-heroicons-document-text', iconColor: 'text-[var(--text-faint)]', titleColor: 'text-[var(--text-muted)]', border: 'border-[var(--border-light)]' }

function getStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key) || key.includes(title)) return style
  }
  return DEFAULT_STYLE
}

function sectionIcon(title: string) { return getStyle(title).icon }
function sectionIconColor(title: string) { return getStyle(title).iconColor }
function sectionTitleColor(title: string) { return getStyle(title).titleColor }
function sectionBorderClass(title: string) { return getStyle(title).border }
</script>

<style scoped>
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.ai-section-content :deep(ol) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  counter-reset: item;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ol li) {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ol li::before) {
  counter-increment: item;
  content: counter(item);
  position: absolute;
  left: 0;
  top: 0.1rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #1a1612;
  background: var(--accent);
  border-radius: 3px;
  opacity: 0.8;
}
.ai-section-content :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.6rem 0.8rem;
  background: var(--accent-bg);
  border-left: 2px solid var(--accent-border);
  border-radius: 0 6px 6px 0;
  font-style: italic;
}
.ai-section-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-section-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-section-content :deep(code) {
  background: var(--surface-card-hover);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
  color: var(--accent);
}
.ai-section-content :deep(pre) {
  background: var(--surface-card);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.ai-section-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-body);
}
</style>
