import type { MeihuaResult, QiguaInput } from '~/types/zhouyi'
import { calcMeihuaByTime, calcMeihuaByNumbers, calcMeihuaByCharacter } from '~/utils/zhouyi/meihua'

export function useZhouyiCalc() {
  function calc(input: QiguaInput): MeihuaResult {
    switch (input.method) {
      case 'time':
        return calcMeihuaByTime(input.year, input.month, input.day, input.hour)
      case 'numbers':
        return calcMeihuaByNumbers(input.num1, input.num2, input.num3)
      case 'character':
        return calcMeihuaByCharacter(input.char)
      default:
        throw new Error('未知的起卦方式')
    }
  }

  return { calc }
}
