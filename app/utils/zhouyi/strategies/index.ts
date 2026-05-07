export interface GuaInput {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHourIndex: number
  query: string
  currentHour?: number
  currentMinute?: number
}

export interface GuaResult {
  benGuaId: number
  bianGuaId: number
  dongYao: number
  methodName: string
  calcDetail: string
}

export interface GuaStrategy {
  name: string
  calc(input: GuaInput): GuaResult
}
