import type { QimenChartRequest, QimenChartResponse } from '~/types/qimen'

export function useQimenPrompt() {
  function buildShareSummary(chart: QimenChartResponse): string {
    const c = chart.chart
    return `${c.dun_type} · ${c.ju_number}局 · ${c.yuan}`
  }

  function buildInterpretSummary(chart: QimenChartResponse): string {
    const c = chart.chart
    const zhifu = c.zhifu
    const zhishi = c.zhishi
    return `值符${zhifu.star}临${zhifu.palace}宫，值使${zhishi.door}临${zhishi.palace}宫，${c.dun_type}${c.ju_number}局`
  }

  return { buildShareSummary, buildInterpretSummary }
}
