/**
 * 从 AI 流式输出中提取 JSON 对象
 * 处理各种模型不按指令输出时的 fallback
 */
export function extractJsonFromText(text: string): Record<string, any> | null {
  if (!text || typeof text !== 'string') return null

  const trimmed = text.trim()

  // 策略1：直接就是纯 JSON
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') return parsed
  } catch { /* ignore */ }

  // 策略2：被 markdown 代码块包裹
  try {
    const codeMatch = trimmed.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (codeMatch) {
      const parsed = JSON.parse(codeMatch[1]!.trim())
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch { /* ignore */ }

  // 策略3：找最外层的一对花括号（应对文本+JSON 混合输出）
  try {
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1)
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch { /* ignore */ }

  // 策略4：修复常见 JSON 错误后重试
  try {
    const cleaned = trimmed
      .replace(/[\u201C\u201D]/g, '"')   // 中文双引号 → 英文
      .replace(/[\u2018\u2019]/g, "'")   // 中文单引号 → 英文
      .replace(/,\s*([}\]])/g, '$1')     // 去除尾随逗号

    // 再试一次代码块提取
    const codeMatch = cleaned.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (codeMatch) {
      const parsed = JSON.parse(codeMatch[1]!.trim())
      if (parsed && typeof parsed === 'object') return parsed
    }

    // 再试一次花括号提取
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1)
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch { /* ignore */ }

  return null
}
