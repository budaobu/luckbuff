import { DI_ZHI } from '~/utils/bazi/constants'
import { $fetch } from 'ofetch'
import {
  calculateBaziChartResult,
  type BaziChartGender,
  type BaziChartLocation,
} from '~~/server/utils/tools/bazi-chart'
import {
  buildBaziTopicLens,
  isBaziPaipanTopic,
} from '~~/server/utils/tools/bazi-paipan-topic-lens'
import type { TodayAlmanac } from '~/types/today-almanac'

export interface BaziPaipanBirthInput {
  birthDate: string
  birthHour: string
  gender: BaziChartGender
  location?: BaziChartLocation | null
}

export function validateBaziBirthInput(input: BaziPaipanBirthInput) {
  if (!input?.birthDate || !input.birthHour || (input.gender !== 'male' && input.gender !== 'female')) {
    throw createError({ statusCode: 400, statusMessage: '出生日期、时辰和性别均为必填项' })
  }
  if (input.birthHour !== 'unknown' && !DI_ZHI.includes(input.birthHour as any)) {
    throw createError({ statusCode: 400, statusMessage: '出生时辰无效' })
  }
}

export function resolveBaziLensDate(input?: string): string {
  const serverToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return serverToday

  const value = new Date(`${input}T12:00:00Z`)
  if (Number.isNaN(value.getTime())) return serverToday
  const [year, month, day] = input.split('-').map(Number) as [number, number, number]
  if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) {
    return serverToday
  }

  const [serverYear, serverMonth, serverDay] = serverToday.split('-').map(Number) as [number, number, number]
  const difference = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(serverYear, serverMonth - 1, serverDay)) / 86400000)
  return Math.abs(difference) <= 1 ? input : serverToday
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birth?: BaziPaipanBirthInput
    topic?: string
    date?: string
  }>(event)

  validateBaziBirthInput(body?.birth!)
  if (!isBaziPaipanTopic(body?.topic)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid topic' })
  }

  const date = resolveBaziLensDate(body?.date)
  const chart = await calculateBaziChartResult({
    birthDate: body!.birth!.birthDate,
    birthHour: body!.birth!.birthHour as any,
    gender: body!.birth!.gender,
    location: body!.birth!.location?.name ? body!.birth!.location : null,
  })
  const almanac = await $fetch<TodayAlmanac>('/api/tools/jinri-huangli/calc', {
    method: 'POST',
    body: { date },
  }).catch(() => undefined)

  return buildBaziTopicLens({ chart, topic: body!.topic, date, almanac })
})
