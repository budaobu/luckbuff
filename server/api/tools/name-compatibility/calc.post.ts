import {
  analyzeNameCompatibility,
  type NameCompatibilityInput,
} from '~~/server/utils/name-compatibility/engine'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<NameCompatibilityInput>>(event)
  return analyzeNameCompatibility(body as NameCompatibilityInput)
})
