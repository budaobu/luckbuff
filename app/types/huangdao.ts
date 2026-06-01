import type { DiZhi } from './user'

export interface HuangdaoDay {
  date: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  yearNaYin: string
  monthNaYin: string
  naYin: string
  week: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: string
  tianShenType: string
  jieQi?: string
  shengXiao: string
  isAuspicious: boolean
  matchScore: number
  // 农历
  monthInChinese: string
  dayInChinese: string
  // 冲煞
  chongDesc: string
  chongShengXiao: string
  sha: string
  // 九星、旬空
  nineStar: string
  xunKong: string
  // 方位
  positionTaiSuiDesc: string
  positionXiDesc: string
  positionYangGuiDesc: string
  positionYinGuiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  // 禄
  lu: string
}

export interface HuangdaoFormValues {
  profileId?: string
  name: string
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  matter: string
  startDate: string
  endDate: string
}

export interface HuangdaoAiResult {
  overview: string
  topDates: {
    date: string
    ganZhi: string
    rating: number
    reason: string
    timeSlots: { hour: string; shichen: string; advice: string }[]
  }[]
  generalAdvice: string[]
  avoidAdvice: string[]
}

export interface HuangdaoRequest {
  startDate: string
  endDate: string
  matter?: string
}

export interface HuangdaoInterpretRequest {
  days: HuangdaoDay[]
  profile: {
    name?: string
    gender: 'male' | 'female'
    birthDate: string
    birthHour?: DiZhi
  }
  matter: string
  locale?: string
}
