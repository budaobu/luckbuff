declare module 'qimen-dunjia' {
  export function generateChartByDatetime(datetime: string): unknown
  export function generateChartNow(): unknown
  export function chartToObject(chart: unknown): Record<string, any>
  export function chartToJSON(chart: unknown): string
  export function detectPatterns(chart: Record<string, any>): Record<string, any>[]
}
