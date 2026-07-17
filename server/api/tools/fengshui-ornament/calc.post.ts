import type {
  FengshuiOrnamentCalcInput,
  IrregularSpot,
  OrnamentUser,
  RoomTypeKey,
} from '~~/server/utils/fengshui-ornament/calc'
import { calcFengshuiOrnament, EIGHT_DIRECTIONS } from '~~/server/utils/fengshui-ornament/calc'
import type { Direction, Gender } from '~/utils/bazhai'

interface IrregularInput {
  spot: IrregularSpot
  type: 'missing' | 'protruding'
}

const VALID_ROOM_TYPES: RoomTypeKey[] = ['bedroom', 'study', 'office', 'hall', 'shop']
const VALID_SPOTS: IrregularSpot[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const VALID_GENDERS: Gender[] = ['male', 'female']

function isValidBirthDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

export default defineEventHandler(async (event) => {
  const body = await readBody<FengshuiOrnamentCalcInput>(event)

  if (body == null) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const { roomType, direction, year, lengthM, widthM, doorDirection, irregular, users } = body

  if (!VALID_ROOM_TYPES.includes(roomType)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid roomType' })
  }
  if (typeof direction !== 'number' || Number.isNaN(direction)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid direction' })
  }
  const normalizedDir = ((direction % 360) + 360) % 360
  if (typeof year !== 'number' || year < 1900 || year > 2100) {
    throw createError({ statusCode: 400, statusMessage: 'Year must be between 1900 and 2100' })
  }
  if (typeof lengthM !== 'number' || typeof widthM !== 'number'
      || lengthM <= 0 || widthM <= 0 || lengthM > 100 || widthM > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Length/width must be positive meters (≤ 100)' })
  }
  if (!EIGHT_DIRECTIONS.includes(doorDirection as Direction)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid doorDirection' })
  }
  if (!Array.isArray(users) || users.length < 1 || users.length > 6) {
    throw createError({ statusCode: 400, statusMessage: 'Users must contain 1-6 people' })
  }

  const cleanedUsers: OrnamentUser[] = users.map((u, idx) => {
    if (typeof u?.birthYear !== 'number' || typeof u?.birthMonth !== 'number' || typeof u?.birthDay !== 'number'
        || u.birthYear < 1900 || u.birthYear > 2100 || u.birthMonth < 1 || u.birthMonth > 12
        || u.birthDay < 1 || u.birthDay > 31 || !isValidBirthDate(u.birthYear, u.birthMonth, u.birthDay)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid birth date for user #${idx + 1}` })
    }
    if (!VALID_GENDERS.includes(u.gender)) {
      throw createError({ statusCode: 400, statusMessage: `Missing or invalid gender for user #${idx + 1}` })
    }
    const birthHour = u.birthHour == null ? null : Math.floor(u.birthHour)
    if (birthHour !== null && (birthHour < 0 || birthHour > 23)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid birth hour for user #${idx + 1}` })
    }
    return {
      nickname: typeof u.nickname === 'string' && u.nickname.trim() ? u.nickname.trim().slice(0, 20) : `${idx + 1}`,
      birthYear: Math.floor(u.birthYear),
      birthMonth: Math.floor(u.birthMonth),
      birthDay: Math.floor(u.birthDay),
      birthHour,
      gender: u.gender,
    }
  })

  const cleanedIrregular = (irregular ?? [])
    .filter((item: IrregularInput | undefined): item is IrregularInput =>
      Boolean(item) && VALID_SPOTS.includes(item!.spot) && (item!.type === 'missing' || item!.type === 'protruding'))
    .map((item: IrregularInput) => ({ spot: item.spot, type: item.type }))

  const result = calcFengshuiOrnament({
    roomType,
    direction: normalizedDir,
    year: Math.floor(year),
    lengthM,
    widthM,
    doorDirection: doorDirection as Direction,
    irregular: cleanedIrregular,
    users: cleanedUsers,
    locale: body.locale || 'zh-CN',
  })

  return result
})
