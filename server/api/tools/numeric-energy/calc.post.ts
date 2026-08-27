import {
  NUMERIC_ENERGY_SCENARIOS,
  analyzeNumericEnergy,
  type NumericEnergyScenario,
} from '~~/server/utils/tools/numeric-energy'

interface NumericEnergyCalcInput {
  scenario?: NumericEnergyScenario
  input?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NumericEnergyCalcInput>(event)
  if (!body?.scenario || !NUMERIC_ENERGY_SCENARIOS.includes(body.scenario)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid scenario' })
  }
  return analyzeNumericEnergy(body.scenario, body.input)
})
