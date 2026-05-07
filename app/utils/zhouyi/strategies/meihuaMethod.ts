import type { GuaStrategy, GuaInput, GuaResult } from './index'
import { LIUSHISI_GUA, getYaoArray, findGuaByYao } from '../constants'

export const meihuaMethod: GuaStrategy = {
  name: '梅花易数',

  calc({ birthYear, birthMonth, birthDay, birthHourIndex }: GuaInput): GuaResult {
    // 年数：取年份各位数字之和
    const yearSum = String(birthYear).split('').reduce((a, b) => a + Number(b), 0)

    // 上卦：(年数 + 月 + 日) % 8，余0取8
    const upperNum = ((yearSum + birthMonth + birthDay) % 8) || 8

    // 下卦：(年数 + 月 + 日 + 时辰序数) % 8，余0取8
    // 时辰序数：子=1, 丑=2, ..., 亥=12
    const hourSeq = birthHourIndex + 1
    const lowerNum = ((yearSum + birthMonth + birthDay + hourSeq) % 8) || 8

    // 动爻：(年数 + 月 + 日 + 时辰序数) % 6，余0取6
    const dongYao = ((yearSum + birthMonth + birthDay + hourSeq) % 6) || 6

    // 查卦
    const benGua = LIUSHISI_GUA.find(g => g.shangGua === upperNum && g.xiaGua === lowerNum)
    if (!benGua) {
      throw new Error('无法找到对应卦象')
    }

    // 变卦
    const benYao = getYaoArray(benGua)
    const bianYao = [...benYao]
    bianYao[dongYao - 1] = bianYao[dongYao - 1] === 1 ? 0 : 1
    const bianGua = findGuaByYao(bianYao)
    if (!bianGua) {
      throw new Error('无法找到变卦')
    }

    const BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
    const calcDetail = `年数(${yearSum})+月(${birthMonth})+日(${birthDay})=${yearSum + birthMonth + birthDay}，` +
      `上卦序=${upperNum}（${BAGUA_NAMES[upperNum - 1]}），` +
      `加时辰(${hourSeq})，下卦序=${lowerNum}（${BAGUA_NAMES[lowerNum - 1]}），` +
      `动爻第${dongYao}爻`

    return {
      benGuaId: benGua.id,
      bianGuaId: bianGua.id,
      dongYao,
      methodName: '梅花易数（生辰起卦变体）',
      calcDetail,
    }
  },
}
