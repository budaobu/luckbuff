import type { VedicChart, VedicFormData } from '~/types/vedic'

export type VedicStep = 'form' | 'loading' | 'result'

export function useVedicAnalysis() {
  const step = ref<VedicStep>('form')
  const chartData = ref<VedicChart | null>(null)
  const analysisText = ref('')
  const errorMsg = ref('')
  const streaming = ref(false)
  const { locale } = useI18n()

  const formData = ref<VedicFormData>({
    birthDate: '',
    birthTime: '',
    city: '',
    gender: '',
    dimensions: ['core', 'career', 'love', 'annual'],
    timeUncertain: false,
  })

  let abortController: AbortController | null = null

  async function startAnalysis() {
    step.value = 'loading'
    analysisText.value = ''
    chartData.value = null
    errorMsg.value = ''
    streaming.value = true

    abortController?.abort()
    abortController = new AbortController()
    const currentLocale = locale.value || 'zh-CN'

    try {
      const response = await fetch('/api/vedic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData.value, locale: currentLocale }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.statusMessage || errBody.message || `请求失败 (${response.status})`)
      }

      if (!response.body) {
        throw new Error('服务器未返回流式响应')
      }

      const reader = response.body.getReader()
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
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') continue

          try {
            const evt = JSON.parse(payload)
            if (evt.type === 'chart') {
              chartData.value = evt.chart as VedicChart
              if (step.value !== 'result') step.value = 'result'
            } else if (evt.type === 'text') {
              analysisText.value += String(evt.text ?? '')
            } else if (evt.type === 'error') {
              errorMsg.value = String(evt.message ?? '未知错误')
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        errorMsg.value = err?.message ?? '未知错误'
        if (!chartData.value) step.value = 'form'
      }
    } finally {
      streaming.value = false
      abortController = null
    }
  }

  function reset() {
    abortController?.abort()
    abortController = null
    step.value = 'form'
    analysisText.value = ''
    chartData.value = null
    errorMsg.value = ''
    streaming.value = false
  }

  return {
    step,
    formData,
    chartData,
    analysisText,
    errorMsg,
    streaming,
    startAnalysis,
    reset,
  }
}
