import { ZECHENG_CITIES, ZECHENG_WORLD_CITIES } from '~~/server/utils/tools/zecheng-cities'

export default defineEventHandler(() => ({
  origins: ZECHENG_CITIES.map(({ name, fullName, province, lng, lat }) => ({
    name, fullName, province, lng, lat,
  })),
  targets: [...ZECHENG_CITIES, ...ZECHENG_WORLD_CITIES].map(({ name, fullName, province, lng, lat }) => ({
    name, fullName, province, lng, lat,
  })),
}))
