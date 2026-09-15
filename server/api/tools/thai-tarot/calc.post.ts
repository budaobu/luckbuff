import type { ThaiTarotSpreadKey } from '~~/server/utils/tools/thai-tarot'
import { drawThaiTarot } from '~~/server/utils/tools/thai-tarot'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    question?: string
    spread?: ThaiTarotSpreadKey
    includeReversed?: boolean
    seed?: number
  }>(event)

  return drawThaiTarot({
    question: body?.question ?? '',
    spread: body?.spread ?? 'situation-challenge-advice',
    includeReversed: body?.includeReversed ?? true,
    seed: body?.seed,
  })
})
