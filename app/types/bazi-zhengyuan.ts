import type { BaziChart } from './bazi'
import type { DiZhi } from './user'

export interface BaziZhengyuanCalcResult {
  profile: {
    name?: string
    birthDate: string
    birthHour?: string
    gender: 'male' | 'female'
  }
  chart: BaziChart
  riZhu: string
  riZhuStrength: string
  geju: string
  xiyong: string
  jishen: string
}
