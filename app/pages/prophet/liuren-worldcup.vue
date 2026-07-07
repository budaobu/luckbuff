<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ t('liurenWorldcup.badge') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ t('liurenWorldcup.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ t('liurenWorldcup.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ t('liurenWorldcup.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 比赛选择 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ t('liurenWorldcup.form.selectMatch') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <USelectMenu
                v-model="selectedMatchUid"
                :items="matchItems"
                :placeholder="t('liurenWorldcup.form.matchPlaceholder')"
                searchable
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <!-- 已选比赛信息 -->
            <div v-if="selectedMatch" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <span class="text-base font-bold text-[var(--text-primary)]">{{ translateTeamName(selectedMatch.homeTeam) }}</span>
                  <span class="text-xs text-[var(--text-faint)]">VS</span>
                  <span class="text-base font-bold text-[var(--text-primary)]">{{ translateTeamName(selectedMatch.awayTeam) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                <span>{{ formatMatchTime(selectedMatch.startTime) }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                <span>{{ selectedMatch.venue || t('common.unknown') }}</span>
              </div>
            </div>

            <!-- 出生年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ t('liurenWorldcup.form.birthYear') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="birthYearInput"
                type="number"
                :placeholder="t('liurenWorldcup.form.birthYearPlaceholder')"
                class="w-full"
                :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]' }"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ t('liurenWorldcup.form.birthYearHint') }}
              </p>
            </div>

            <!-- 起卦时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="t('liurenWorldcup.form.divinationTime')"
              :hint="t('liurenWorldcup.form.timeHint')"
            />

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!selectedMatch || !birthYear"
              :loading="submitting"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ t('liurenWorldcup.form.submit') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <HexagramSpin size="full" :label="t('liurenWorldcup.animating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <!-- 截图目标：预测结果海报 -->
        <div ref="shareTargetRef" class="space-y-5">
          <!-- 海报标题 -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-[var(--accent)]" />
              <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase">{{ t('liurenWorldcup.result.badge') }}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ t('liurenWorldcup.result.title') }}
            </h1>
          </div>

          <!-- 比赛信息卡 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="text-center flex-1">
                <div class="text-lg font-bold text-[var(--text-primary)]">{{ translateTeamName(result.match.homeTeam) }}</div>
                <div class="text-[10px] text-[var(--accent)] mt-1">{{ t('liurenWorldcup.result.homeTeam') }}</div>
              </div>
              <div class="text-xl font-bold text-[var(--text-faint)]">VS</div>
              <div class="text-center flex-1">
                <div class="text-lg font-bold text-[var(--text-primary)]">{{ translateTeamName(result.match.awayTeam) }}</div>
                <div class="text-[10px] text-[var(--accent)] mt-1">{{ t('liurenWorldcup.result.awayTeam') }}</div>
              </div>
            </div>
            <div class="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                {{ formatMatchTime(result.match.matchTime) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                {{ result.match.venue || t('common.unknown') }}
              </span>
            </div>
          </div>

          <!-- 课图基础信息卡片 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('liurenWorldcup.result.chartTitle') }}</h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.yearPillar') }}</div>
                <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ result.calendar.ganzhi.year }}</div>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.monthPillar') }}</div>
                <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ result.calendar.ganzhi.month }}</div>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.dayPillar') }}</div>
                <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ result.calendar.ganzhi.day }}</div>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.hourPillar') }}</div>
                <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ result.calendar.ganzhi.hour }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.yuejiang') }}</div>
                <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ result.calendar.yuejiang }}</div>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-3 text-center">
                <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ t('liurenWorldcup.result.shichen') }}</div>
                <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ result.calendar.shichen }}</div>
              </div>
            </div>
            <div class="mt-3 text-center">
              <span class="text-[11px] text-[var(--text-faint)]">{{ t('liurenWorldcup.result.birthYear') }}：{{ result.calendar.birthYearBranch }}</span>
            </div>
          </div>

          <!-- ===== AI 预测结果 ===== -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('liurenWorldcup.result.predictionTitle') }}</h3>
            </div>

            <!-- 等待首个 token -->
            <div v-if="!interpretStarted && !interpretError" class="flex flex-col items-center py-8">
              <TianganDizhi size="compact" :label="t('liurenWorldcup.result.aiAnalyzing')" />
            </div>

            <!-- 错误状态 -->
            <div v-else-if="interpretError" class="text-center py-6">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p class="text-sm text-red-400">{{ interpretError }}</p>
              <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="startInterpretStream">
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ t('common.retry') }}
              </UButton>
            </div>

            <!-- 流式内容 -->
            <div v-else class="space-y-4">
              <!-- 解析后的概率条 -->
              <div v-if="parsedProbabilities" class="space-y-3 mb-5">
                <div class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ t('liurenWorldcup.result.winProbability') }}</div>
                <div
                  v-for="p in parsedProbabilities"
                  :key="p.label"
                  class="space-y-1"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[var(--text-body)]">{{ p.label }}</span>
                    <span class="font-bold text-[var(--accent)]">{{ p.value.toFixed(1) }}%</span>
                  </div>
                  <div class="h-2 rounded-full bg-[var(--border-light)] overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700 ease-out"
                      :class="p.barColor"
                      :style="{ width: `${Math.min(p.value, 100)}%` }"
                    />
                  </div>
                </div>
              </div>

              <!-- Markdown 内容 -->
              <div
                class="text-sm text-[var(--text-body)] leading-relaxed ai-content max-w-none"
                v-html="renderedContent"
              />

              <!-- 光标 -->
              <div v-if="interpretStreaming" class="flex items-center gap-1">
                <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- 结果页免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mt-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ t('liurenWorldcup.disclaimer') }}
          </p>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ t('liurenWorldcup.actions.shareResult') }}
          </UButton>
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ t('liurenWorldcup.actions.predictAgain') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="goBack">
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ t('common.back') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shareDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="shareDialogOpen = false">
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ t('common.share') }}</h3>
              </div>
              <UButton color="neutral" variant="ghost" class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { shareDialogOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ t('common.copy') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ t('liurenWorldcup.shareDialog.posterLabel') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ t('liurenWorldcup.shareDialog.downloadPoster') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { WorldCupFixture, WorldCupFixturesData } from '~/types/qimen-worldcup'
import type { LiurenChartData } from '~/types/liuren-worldcup'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

// ============ 赛程数据 ============
const { data: fixturesData, status: fixturesStatus } = await useAsyncData('liuren-worldcup-fixtures', () =>
  $fetch<WorldCupFixturesData>('/api/prophet/worldcup-fixtures', { query: { lang: locale.value } })
)

const fixturesLoading = computed(() => fixturesStatus.value === 'pending')
const fixtures = computed(() => fixturesData.value?.events || [])

// 中文队名 → 国家代码（用于 i18n 翻译）
const teamNameToCode: Record<string, string> = {
  '墨西哥': 'MEX', '南非': 'RSA', '韩国': 'KOR', '捷克': 'CZE', '加拿大': 'CAN',
  '波黑': 'BIH', '卡塔尔': 'QAT', '瑞士': 'SUI', '巴西': 'BRA', '摩洛哥': 'MAR',
  '海地': 'HAI', '苏格兰': 'SCO', '美国': 'USA', '巴拉圭': 'PAR', '澳大利亚': 'AUS',
  '土耳其': 'TUR', '德国': 'GER', '库拉索': 'CUW', '科特迪瓦': 'CIV', '厄瓜多尔': 'ECU',
  '荷兰': 'NED', '日本': 'JPN', '瑞典': 'SWE', '突尼斯': 'TUN', '比利时': 'BEL',
  '埃及': 'EGY', '伊朗': 'IRN', '新西兰': 'NZL', '西班牙': 'ESP', '佛得角': 'CPV',
  '沙特阿拉伯': 'KSA', '乌拉圭': 'URU', '法国': 'FRA', '塞内加尔': 'SEN', '挪威': 'NOR',
  '伊拉克': 'IRQ', '阿根廷': 'ARG', '阿尔及利亚': 'ALG', '奥地利': 'AUT', '约旦': 'JOR',
  '葡萄牙': 'POR', '刚果（金）': 'COD', '乌兹别克斯坦': 'UZB', '哥伦比亚': 'COL',
  '英格兰': 'ENG', '克罗地亚': 'CRO', '加纳': 'GHA', '巴拿马': 'PAN',
  // English names (when fixtures API returns English ICS)
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO', 'USA': 'USA',
  'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR', 'Germany': 'GER',
  'Curaçao': 'CUW', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU', 'Netherlands': 'NED',
  'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY',
  'Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP', 'Cape Verde': 'CPV',
  'Saudi Arabia': 'KSA', 'Uruguay': 'URU', 'France': 'FRA', 'Senegal': 'SEN',
  'Norway': 'NOR', 'Iraq': 'IRQ', 'Argentina': 'ARG', 'Algeria': 'ALG',
  'Austria': 'AUT', 'Jordan': 'JOR', 'Portugal': 'POR', 'DR Congo': 'COD',
  'Uzbekistan': 'UZB', 'Colombia': 'COL', 'England': 'ENG', 'Croatia': 'CRO',
  'Ghana': 'GHA', 'Panama': 'PAN',
}

// 将赛程数据中的中文队名翻译为当前语言
function translateTeamName(name: string): string {
  const code = teamNameToCode[name]
  if (code) return t(`teams.${code}`)

  // 占位符模式匹配
  const m16 = name.match(/^16强赛(\d+)胜者$/)
  if (m16) return t('qimenWorldcup.placeholders.roundOf16', { n: m16[1] })

  const m32 = name.match(/^32强赛胜者$/)
  if (m32) return t('qimenWorldcup.placeholders.roundOf32Winner')

  const group = name.match(/^([A-L])组第(\d+)$/)
  if (group) return t('qimenWorldcup.placeholders.groupRank', { group: group[1], rank: group[2] })

  const qf = name.match(/^四分之一决赛(\d+)胜者$/)
  if (qf) return t('qimenWorldcup.placeholders.quarterFinal', { n: qf[1] })

  const sf = name.match(/^半决赛(\d+)胜者$/)
  if (sf) return t('qimenWorldcup.placeholders.semiFinalWinner', { n: sf[1] })

  const sfl = name.match(/^半决赛(\d+)负者$/)
  if (sfl) return t('qimenWorldcup.placeholders.semiFinalLoser', { n: sfl[1] })

  if (name === '小组第三') return t('qimenWorldcup.placeholders.thirdPlace')

  const mw = name.match(/^第(\d+)场胜者$/)
  if (mw) return t('qimenWorldcup.placeholders.matchWinner', { n: mw[1] })

  const ml = name.match(/^第(\d+)场败者$/)
  if (ml) return t('qimenWorldcup.placeholders.matchLoser', { n: ml[1] })

  return name
}

const matchItems = computed(() => {
  return fixtures.value.map(f => ({
    label: `${translateTeamName(f.homeTeam)} vs ${translateTeamName(f.awayTeam)} — ${formatMatchTimeShort(f.startTime)}`,
    value: f.uid,
  }))
})

// ============ 表单状态 ============
const selectedMatchUid = ref<{ label: string; value: string } | undefined>(undefined)
const selectedMatch = ref<WorldCupFixture | null>(null)
const birthYearInput = ref<string>('')
const birthYear = computed<number | null>(() => {
  const n = parseInt(birthYearInput.value, 10)
  return isNaN(n) ? null : n
})
const timeCardRef = ref<{ timezone: Ref<string> } | null>(null)

// 监听 selectedMatchUid 变化，自动更新 selectedMatch
watch(selectedMatchUid, (uid) => {
  if (!uid) {
    selectedMatch.value = null
    return
  }
  const match = fixtures.value.find(f => f.uid === uid.value)
  selectedMatch.value = match || null
})

function formatMatchTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleString(fmtLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: false,
  })
}

function formatMatchTimeShort(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleString(fmtLocale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ============ 提交与结果 ============
const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<LiurenChartData | null>(null)
const submitting = ref(false)

// AI 解读状态
const interpretContent = ref('')
const interpretStreaming = ref(false)
const interpretStarted = ref(false)
const interpretError = ref<string | null>(null)

async function handleSubmit() {
  if (!selectedMatch.value || !birthYear.value) return
  submitting.value = true
  phase.value = 'animating'
  result.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null

  try {
    const res = await $fetch<LiurenChartData>('/api/prophet/liuren-worldcup/chart', {
      method: 'POST',
      body: {
        homeTeam: selectedMatch.value.homeTeam,
        awayTeam: selectedMatch.value.awayTeam,
        matchTime: selectedMatch.value.startTime,
        venue: selectedMatch.value.venue,
        timezone: (timeCardRef.value?.timezone as unknown as Ref<string>).value || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
        birthYear: birthYear.value,
      },
    })
    result.value = res
    phase.value = 'result'
    // 延迟启动 AI 解读
    setTimeout(() => startInterpretStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('liurenWorldcup.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('liurenWorldcup.error.unknown'),
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}

async function startInterpretStream() {
  if (!result.value) return
  interpretContent.value = ''
  interpretStreaming.value = true
  interpretStarted.value = false
  interpretError.value = null

  try {
    const response = await fetch('/api/prophet/liuren-worldcup/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match: {
          homeTeam: result.value.match.homeTeam,
          awayTeam: result.value.match.awayTeam,
          matchTime: result.value.match.matchTime,
          venue: result.value.match.venue,
          timezone: (timeCardRef.value?.timezone as unknown as Ref<string>).value || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
          birthYear: birthYear.value,
        },
        chart: result.value,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            if (!interpretStarted.value) interpretStarted.value = true
            interpretContent.value += data.text
          } else if (data.type === 'error') {
            interpretError.value = data.message || t('liurenWorldcup.error.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    interpretError.value = e?.message || t('liurenWorldcup.error.aiUnavailable')
  } finally {
    interpretStreaming.value = false
  }
}

// ============ 内容渲染与概率解析 ============
const renderedContent = computed(() => {
  if (!interpretContent.value) return ''
  try {
    return marked.parse(interpretContent.value, { async: false }) as string
  } catch {
    return interpretContent.value
  }
})

interface ProbItem {
  label: string
  value: number
  barColor: string
}

const parsedProbabilities = computed<ProbItem[] | null>(() => {
  const text = interpretContent.value
  if (!text) return null

  const rawHome = result.value?.match.homeTeam || '主队'
  const rawAway = result.value?.match.awayTeam || '客队'
  const home = translateTeamName(rawHome)
  const away = translateTeamName(rawAway)

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 多语言概率匹配
  function extractProb(name: string): number | null {
    const m1 = text.match(new RegExp(`${esc(name)}\\s*胜[:：]\\s*(\\d+(?:\\.\\d+)?)\\s*%`))
    if (m1) return parseFloat(m1[1]!)
    const m2 = text.match(new RegExp(`${esc(name)}\\s*勝[:：]\\s*(\\d+(?:\\.\\d+)?)\\s*%`))
    if (m2) return parseFloat(m2[1]!)
    const m3 = text.match(new RegExp(`${esc(name)}\\s+Win[:：]\\s*(\\d+(?:\\.\\d+)?)\\s*%`, 'i'))
    if (m3) return parseFloat(m3[1]!)
    return null
  }

  function extractDraw(): number | null {
    const m1 = text.match(/平局[:：]\s*(\d+(?:\.\d+)?)\s*%/)
    if (m1) return parseFloat(m1[1]!)
    const m2 = text.match(/Draw[:：]\s*(\d+(?:\.\d+)?)\s*%/i)
    if (m2) return parseFloat(m2[1]!)
    const m3 = text.match(/和局[:：]\s*(\d+(?:\.\d+)?)\s*%/)
    if (m3) return parseFloat(m3[1]!)
    return null
  }

  let homeVal = extractProb(rawHome) ?? extractProb(home) ?? 0
  let awayVal = extractProb(rawAway) ?? extractProb(away) ?? 0
  let drawVal = extractDraw() ?? 0

  // Fallback: 如果格式匹配失败，尝试在"胜负概率"段落中按顺序提取所有百分数
  if (homeVal === 0 && awayVal === 0 && drawVal === 0) {
    // 定位胜负概率段落
    const probSectionMatch = text.match(/#{2,3}\s*(?:胜负概率|Win Probability|勝負概率)[\s\S]*?(?=\n#{2,3}|$)/)
    if (probSectionMatch) {
      const section = probSectionMatch[0]
      // 提取所有 xx.x% 或 xx%
      const allPercents = Array.from(section.matchAll(/(\d+(?:\.\d+)?)\s*%/g)).map(m => parseFloat(m[1]!))
      if (allPercents.length >= 3) {
        homeVal = allPercents[0]!
        drawVal = allPercents[1]!
        awayVal = allPercents[2]!
      }
    }
  }

  if (homeVal === 0 && awayVal === 0 && drawVal === 0) return null

  let h = homeVal, d = drawVal, a = awayVal
  const sum = h + d + a
  if (sum !== 100) {
    h = (h / sum) * 100
    d = (d / sum) * 100
    a = (a / sum) * 100
  }

  return [
    { label: t('liurenWorldcup.result.homeWin', { team: home }), value: h, barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
    { label: t('liurenWorldcup.result.draw'), value: d, barColor: 'bg-gradient-to-r from-amber-500 to-amber-400' },
    { label: t('liurenWorldcup.result.awayWin', { team: away }), value: a, barColor: 'bg-gradient-to-r from-blue-500 to-blue-400' },
  ]
})

// ============ 分享 ============
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()

  try {
    const summary = `${translateTeamName(result.value.match.homeTeam)} vs ${translateTeamName(result.value.match.awayTeam)} · ${result.value.calendar.ganzhi.day}日${result.value.calendar.ganzhi.hour}时`
    const res = await share({
      tool: 'liuren',
      name: `${translateTeamName(result.value.match.homeTeam)} vs ${translateTeamName(result.value.match.awayTeam)}`,
      summary,
      shareTarget: shareTargetRef.value,
      filename: `liuren-worldcup-${new Date().toISOString().slice(0, 10)}.png`,
      t: (key: string, ...args: unknown[]) => {
        const map: Record<string, string> = {
          'share.hookLiuren': t('liurenWorldcup.share.hookLiuren', { summary }),
          'share.hookLiurenDefault': t('liurenWorldcup.share.hookLiurenDefault'),
          'share.suffix': t('liurenWorldcup.share.suffix'),
          'share.failTitle': t('share.shareFail'),
          'share.failDesc': t('share.pleaseRetry'),
          'share.copySuccess': t('share.copySuccess'),
          'share.copyFail': t('share.copyFail'),
          'share.screenshotError': t('share.screenshotFailed'),
        }
        return map[key] || key
      },
    })
    shareData.value = res
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('share.copySuccess'), color: 'success' })
  } catch {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

function resetForm() {
  phase.value = 'form'
  result.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null
  selectedMatchUid.value = undefined
  selectedMatch.value = null
  birthYearInput.value = ''
}

function goBack() {
  navigateTo(localePath('/prophet'))
}

// ============ UI Config ============
const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[300px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

// ============ SEO ============
const siteName = 'ososn'

useSeoMeta({
  title: () => t('liurenWorldcup.seo.title'),
  description: () => t('liurenWorldcup.seo.description'),
  keywords: () => t('liurenWorldcup.seo.keywords'),
  ogTitle: () => t('liurenWorldcup.seo.ogTitle'),
  ogDescription: () => t('liurenWorldcup.seo.ogDescription'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/prophet/liuren-worldcup',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: t('liurenWorldcup.seo.title'),
        url: 'https://www.ososn.com/prophet/liuren-worldcup',
        description: t('liurenWorldcup.seo.description'),
      }),
    },
  ],
}))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ai-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
