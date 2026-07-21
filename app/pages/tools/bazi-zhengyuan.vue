<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Zhengyuan</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziZhengyuan.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziZhengyuan.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('baziZhengyuan.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <div class="bazi-form-wrapper">
              <BaziForm
                ref="baziFormRef"
                :initial-values="lastFormValues"
                @submit="handleSubmit"
                @save-profile="handleSaveProfile"
              />
            </div>
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!baziFormRef?.form?.gender || !baziFormRef?.form?.birthDate"
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="baziFormRef?.form && handleSubmit({ ...baziFormRef.form })"
            >
              <template #leading>
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </template>
              {{ $t('baziZhengyuan.submit') }}
            </UButton>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziZhengyuan.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziZhengyuan.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziZhengyuan.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziZhengyuan.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziZhengyuan.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziZhengyuan.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziZhengyuan.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziZhengyuan.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-heart" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('baziZhengyuan.calculating') }}</p>
        </div>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && calcResult">
        <div>
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ calcResult.profile.name ? $t('baziZhengyuan.resultTitleWithName', { name: calcResult.profile.name }) : $t('baziZhengyuan.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('baziZhengyuan.resultSubtitle', { riZhu: calcResult.riZhu, strength: calcResult.riZhuStrength }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 四柱简表 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziZhengyuan.pillarsTitle') }}
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-[10px] text-[var(--text-faint)] border-b border-[var(--border-light)]">
                    <th class="text-left py-2 pr-2 font-medium">{{ $t('baziZhengyuan.pillar') }}</th>
                    <th class="text-left py-2 px-2 font-medium">{{ $t('baziZhengyuan.ganZhi') }}</th>
                    <th class="text-left py-2 pl-2 font-medium">{{ $t('baziZhengyuan.shiShen') }}</th>
                  </tr>
                </thead>
                <tbody class="text-[var(--text-body)]">
                  <tr
                    v-for="p in pillarRows"
                    :key="p.label"
                    class="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <td class="py-2 pr-2 text-[var(--text-muted)]">{{ p.label }}</td>
                    <td class="py-2 px-2">{{ p.gan }}{{ p.zhi }}</td>
                    <td class="py-2 pl-2 text-[var(--accent-muted)]">{{ p.shishen }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 命局标签 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziZhengyuan.chartInfoTitle') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)]">
                {{ $t('baziZhengyuan.riZhuLabel') }}{{ calcResult.riZhu }}
              </span>
              <span class="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)]">
                {{ $t('baziZhengyuan.strengthLabel') }}{{ calcResult.riZhuStrength }}
              </span>
              <span class="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)]">
                {{ $t('baziZhengyuan.gejuLabel') }}{{ calcResult.geju }}
              </span>
              <span class="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-muted)]">
                {{ $t('baziZhengyuan.xiyongLabel') }}{{ calcResult.xiyong }}
              </span>
            </div>
          </div>

          <!-- 婚姻命盘 -->
          <div v-if="calcResult.marriage" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziZhengyuan.marriageCardTitle') }}
            </h3>

            <div class="space-y-2.5 mb-4">
              <div class="flex items-start gap-2 text-sm">
                <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-faint)] mt-0.5">{{ $t('baziZhengyuan.spousePalaceLabel') }}</span>
                <p class="text-[var(--text-body)] leading-relaxed">
                  {{ calcResult.marriage.spousePalace.zhi }}（{{ calcResult.marriage.spousePalace.wuxing }}）· {{ $t('baziZhengyuan.sitsOn', { shishen: calcResult.marriage.spousePalace.shiShen }) }}<template v-if="calcResult.marriage.spousePalace.heWith.length"> · {{ $t('baziZhengyuan.heWith', { pillars: calcResult.marriage.spousePalace.heWith.join('、') }) }}</template><template v-if="calcResult.marriage.spousePalace.chongBy.length"> · {{ $t('baziZhengyuan.chongBy', { pillars: calcResult.marriage.spousePalace.chongBy.join('、') }) }}</template>
                </p>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-faint)] mt-0.5">{{ $t('baziZhengyuan.spouseStarLabel') }}</span>
                <p class="text-[var(--text-body)] leading-relaxed">
                  {{ calcResult.marriage.spouseStar.kind }}（{{ calcResult.marriage.spouseStar.wuxing }}）· {{ $t(`baziZhengyuan.starStrength.${calcResult.marriage.spouseStar.strength}`) }} · {{ calcResult.marriage.spouseStar.isFavorable ? $t('baziZhengyuan.starFavorable') : $t('baziZhengyuan.starNotFavorable') }}
                </p>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-faint)] mt-0.5">{{ $t('baziZhengyuan.peachLabel') }}</span>
                <p class="text-[var(--text-body)] leading-relaxed">
                  {{ calcResult.marriage.peachBlossom.star }}<template v-if="calcResult.marriage.peachBlossom.positions.length"> · {{ $t('baziZhengyuan.peachIn', { pillars: calcResult.marriage.peachBlossom.positions.join('、') }) }}</template><template v-else> · {{ $t('baziZhengyuan.peachAbsent') }}</template><template v-if="calcResult.marriage.peachBlossom.innerWall"> · {{ $t('baziZhengyuan.peachInner') }}</template><template v-if="calcResult.marriage.peachBlossom.outerWall"> · {{ $t('baziZhengyuan.peachOuter') }}</template>
                </p>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-faint)] mt-0.5">{{ $t('baziZhengyuan.hongLuanLabel') }}</span>
                <p class="text-[var(--text-body)] leading-relaxed">
                  {{ calcResult.marriage.hongLuan.star }}<template v-if="calcResult.marriage.hongLuan.palace">（{{ $t('baziZhengyuan.starInPalace', { palace: calcResult.marriage.hongLuan.palace }) }}）</template> · {{ $t('baziZhengyuan.tianXiLabel') }} {{ calcResult.marriage.tianXi.star }}<template v-if="calcResult.marriage.tianXi.palace">（{{ $t('baziZhengyuan.starInPalace', { palace: calcResult.marriage.tianXi.palace }) }}）</template>
                </p>
              </div>
              <div class="flex items-start gap-2 text-sm">
                <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-faint)] mt-0.5">{{ $t('baziZhengyuan.timingLabel') }}</span>
                <p class="text-[var(--text-body)] leading-relaxed">
                  {{ $t(`baziZhengyuan.timing.${calcResult.marriage.marriageTiming.tendency}`) }} · {{ $t(`baziZhengyuan.pattern.${calcResult.marriage.relationshipDynamics.pattern}`) }} · {{ $t('baziZhengyuan.directionLabel') }}{{ calcResult.marriage.spouseDetails.direction }}
                </p>
              </div>
            </div>

            <!-- 应期年份 -->
            <div>
              <p class="text-xs text-[var(--text-faint)] mb-2">{{ $t('baziZhengyuan.timingYearsTitle') }}</p>
              <div class="flex items-end gap-1 overflow-x-auto pb-1">
                <button
                  v-for="y in calcResult.marriage.timingYears"
                  :key="y.year"
                  type="button"
                  class="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                  :aria-pressed="selectedYear?.year === y.year"
                  @click="selectedYear = selectedYear?.year === y.year ? null : y"
                >
                  <div
                    class="w-6 rounded-t-md transition-all duration-300"
                    :class="selectedYear?.year === y.year
                      ? 'bg-[var(--accent)] ring-1 ring-[var(--accent)]'
                      : y.score >= 4 ? 'bg-[var(--accent)]' : y.score >= 3 ? 'bg-[var(--accent)]/60' : y.score >= 2 ? 'bg-[var(--accent)]/30' : 'bg-[var(--border-light)]'"
                    :style="{ height: `${8 + y.score * 10}px` }"
                  />
                  <span
                    class="text-[9px]"
                    :class="selectedYear?.year === y.year ? 'text-[var(--accent-muted)] font-semibold' : 'text-[var(--text-faint)]'"
                  >{{ String(y.year).slice(2) }}</span>
                </button>
              </div>
              <div v-if="selectedYear" class="mt-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] p-3">
                <p class="text-xs font-semibold text-[var(--text-primary)]">
                  {{ selectedYear.year }}（{{ selectedYear.ganZhi }}）· {{ $t('baziZhengyuan.ageSuffix', { age: selectedYear.age }) }}
                </p>
                <p v-if="selectedYear.reasons.length" class="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                  {{ selectedYear.reasons.join('、') }}
                </p>
                <p v-else class="text-[11px] text-[var(--text-faint)] mt-1">{{ $t('baziZhengyuan.noSignal') }}</p>
              </div>
              <p v-else class="text-[10px] text-[var(--text-faint)] mt-2">{{ $t('baziZhengyuan.timingYearsHint') }}</p>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-heart" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('baziZhengyuan.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('baziZhengyuan.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {{ section.title.replace(/^##\s*/, '') }}
                </h4>
                <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                <span
                  v-if="aiStreaming && index === aiSections.length - 1"
                  class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                />
              </div>
            </div>
          </div>

          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('baziZhengyuan.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              class="group/btn"
              @click="startAiStream"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('baziZhengyuan.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('baziZhengyuan.copyResult') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('baziZhengyuan.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('baziZhengyuan.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { DiZhi } from '~/types/user'
import type { BaziZhengyuanCalcResult, ZhengyuanTimingYear } from '~/types/bazi-zhengyuan'
import { getShiShenFull } from '~/utils/bazi/shishen'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const { t, locale } = useI18n()
const toast = useToast()
const config = useRuntimeConfig()
const siteName = config.public.siteName as string
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const calcResult = ref<BaziZhengyuanCalcResult | null>(null)
const selectedYear = ref<ZhengyuanTimingYear | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const baziFormRef = ref<any>(null)

const store = useProfilesStore()

const pillarRows = computed(() => {
  if (!calcResult.value) return []
  const chart = calcResult.value.chart
  const labels = {
    year: t('baziZhengyuan.yearPillar'),
    month: t('baziZhengyuan.monthPillar'),
    day: t('baziZhengyuan.dayPillar'),
    hour: t('baziZhengyuan.hourPillar'),
  }
  const rows = [
    { label: labels.year, ...chart.year, shishen: getShiShenFull(calcResult.value.riZhu, chart.year.gan) },
    { label: labels.month, ...chart.month, shishen: getShiShenFull(calcResult.value.riZhu, chart.month.gan) },
    { label: labels.day, ...chart.day, shishen: getShiShenFull(calcResult.value.riZhu, chart.day.gan) },
  ]
  if (chart.hour) {
    rows.push({ label: labels.hour, ...chart.hour, shishen: getShiShenFull(calcResult.value.riZhu, chart.hour.gan) })
  }
  return rows
})

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  selectedYear.value = null
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<BaziZhengyuanCalcResult>('/api/tools/bazi-zhengyuan/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
        name: values.name || '',
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('baziZhengyuan.calcFail'),
      description: err.data?.message || err.message || t('baziZhengyuan.checkInput'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
    birthProvince: values.birthProvince || undefined,
  })
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bazi-zhengyuan/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
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
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('baziZhengyuan.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('baziZhengyuan.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('baziZhengyuan.resultTitle')}

${calcResult.value.profile.name ? t('baziZhengyuan.nameLabel') + '：' + calcResult.value.profile.name + '\n' : ''}${t('baziZhengyuan.birthDateLabel')}：${calcResult.value.profile.birthDate}

【${t('baziZhengyuan.pillarsTitle')}】
${pillarRows.value.map(p => `${p.label}：${p.gan}${p.zhi}（${p.shishen}）`).join('\n')}

${aiContent.value ? '【' + t('baziZhengyuan.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('baziZhengyuan.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

useSeoMeta({
  title: () => `${t('seo.baziZhengyuanTitle')} - ${siteName}`,
  description: t('seo.baziZhengyuanDesc'),
  keywords: t('seo.baziZhengyuanKeywords'),
  ogTitle: () => `${t('seo.baziZhengyuanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziZhengyuanOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/bazi-zhengyuan`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziZhengyuanTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/bazi-zhengyuan`,
        description: t('seo.baziZhengyuanDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziZhengyuan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/bazi-zhengyuan`,
          description: t('seo.baziZhengyuanOgDesc'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))
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
.bazi-form-wrapper :deep(.space-y-5 > button:last-of-type) {
  display: none;
}
</style>
