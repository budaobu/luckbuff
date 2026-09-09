import { calculateTiebanPaipan } from '~~/server/utils/tools/tieban-paipan'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    birthDate?: string
    birthTime?: string
    gender?: 'male' | 'female'
    location?: string
    longitude?: number
    latitude?: number
    timezone?: string
  }>(event)

  return calculateTiebanPaipan({
    birthDate: body?.birthDate || '',
    birthTime: body?.birthTime || '',
    gender: body?.gender || 'male',
    location: body?.location,
    longitude: body?.longitude,
    latitude: body?.latitude,
    timezone: body?.timezone,
  })
})
