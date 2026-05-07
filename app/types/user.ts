export interface UserProfile {
  id: string
  label: string
  name?: string
  formerName?: string
  formerNameChangedYear?: number
  gender: 'male' | 'female'
  birthDate?: string
  birthHour?: DiZhi
  birthProvince?: string
  lunarBirthDate?: string
  isDefault?: boolean
}

export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'

export const SHICHEN_OPTIONS = [
  { dizhi: '子' as DiZhi, label: '子时', range: '23:00~01:00' },
  { dizhi: '丑' as DiZhi, label: '丑时', range: '01:00~03:00' },
  { dizhi: '寅' as DiZhi, label: '寅时', range: '03:00~05:00' },
  { dizhi: '卯' as DiZhi, label: '卯时', range: '05:00~07:00' },
  { dizhi: '辰' as DiZhi, label: '辰时', range: '07:00~09:00' },
  { dizhi: '巳' as DiZhi, label: '巳时', range: '09:00~11:00' },
  { dizhi: '午' as DiZhi, label: '午时', range: '11:00~13:00' },
  { dizhi: '未' as DiZhi, label: '未时', range: '13:00~15:00' },
  { dizhi: '申' as DiZhi, label: '申时', range: '15:00~17:00' },
  { dizhi: '酉' as DiZhi, label: '酉时', range: '17:00~19:00' },
  { dizhi: '戌' as DiZhi, label: '戌时', range: '19:00~21:00' },
  { dizhi: '亥' as DiZhi, label: '亥时', range: '21:00~23:00' },
] as const
