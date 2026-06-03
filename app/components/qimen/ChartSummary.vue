<template>
  <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-4">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-body)]">
      <span class="font-semibold text-[var(--text-primary)]">
        {{ dunTypeText }}
      </span>
      <span class="text-[var(--text-faint)]">|</span>
      <span>{{ xunshouText }}</span>
      <span class="text-[var(--text-faint)]">|</span>
      <span>{{ kongwangText }}</span>
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-body)] mt-1">
      <span>{{ zhifuText }}</span>
      <span class="text-[var(--text-faint)]">|</span>
      <span>{{ zhishiText }}</span>
      <span class="text-[var(--text-faint)]">|</span>
      <span>{{ jieqiText }}</span>
      <span v-if="(chart.calendar?.jieqi as any)?.is_boundary" class="text-[var(--accent)] text-xs">
        ⚠ {{ $t('qimen.summary.boundaryWarning', { flag: '✓' }) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QimenChartResponse } from '~/types/qimen'

const props = defineProps<{
  chart: QimenChartResponse
}>()

const { t } = useI18n()

const c = computed(() => props.chart.chart)

const dunTypeText = computed(() => {
  const mappedType = t(`qimen.dunTypeMap.${c.value.dun_type}`)
  return t('qimen.summary.dunType', {
    type: mappedType || c.value.dun_type,
    ju: c.value.ju_number,
    yuan: c.value.yuan,
  })
})

const xunshouText = computed(() => {
  return t('qimen.summary.xunshou', {
    xunshou: c.value.xunshou,
    yi: c.value.hidden_yi,
  })
})

const kongwangText = computed(() => {
  return t('qimen.summary.kongwang', {
    kongwang: c.value.kongwang.join('、') || '无',
  })
})

const zhifuText = computed(() => {
  const zf = c.value.zhifu
  return t('qimen.summary.zhifu', {
    star: zf.star,
    palace: zf.palace,
    direction: t(`qimen.palaceDirections.${zf.palace}`),
  })
})

const zhishiText = computed(() => {
  const zs = c.value.zhishi
  return t('qimen.summary.zhishi', {
    door: zs.door,
    palace: zs.palace,
    direction: t(`qimen.palaceDirections.${zs.palace}`),
  })
})

const jieqiText = computed(() => {
  const jieqiObj = props.chart.calendar?.jieqi as any
  const jieqiName = typeof jieqiObj === 'string' ? jieqiObj : jieqiObj?.active_jie || '—'
  return t('qimen.summary.jieqi', { jieqi: jieqiName })
})
</script>
