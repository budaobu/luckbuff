import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const REQUIRED_LOCALES = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko']
const sourceFiles = ['app/pages/tools/kyusei-kigaku.vue', 'app/components/KyuseiKigakuReport.vue']

function keyTree(value, prefix = '') {
  return Object.entries(value ?? {}).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return child && typeof child === 'object' ? keyTree(child, path) : [path]
  })
}

const trees = REQUIRED_LOCALES.map((locale) => {
  const file = join('i18n/locales', `${locale}.json`)
  const data = JSON.parse(readFileSync(file, 'utf8'))
  if (!data.kyuseiKigaku) throw new Error(`Missing kyuseiKigaku namespace: ${locale}`)
  return keyTree(data.kyuseiKigaku).sort()
})
const HOUR_KEYS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig']
for (const [locale, tree] of REQUIRED_LOCALES.map((locale, index) => [locale, trees[index]])) {
  const missingHours = HOUR_KEYS.filter(key => !tree.includes(`hours.${key}`))
  if (missingHours.length) throw new Error(`Missing hour keys in ${locale}: ${missingHours.join(',')}`)
}
for (let index = 1; index < trees.length; index += 1) {
  assertSameKeys(trees[0], trees[index], REQUIRED_LOCALES[index])
}

function assertSameKeys(left, right, locale) {
  const missing = left.filter(key => !right.includes(key))
  const extra = right.filter(key => !left.includes(key))
  if (missing.length || extra.length) {
    throw new Error(`Locale key mismatch for ${locale}; missing=${missing.join(',')} extra=${extra.join(',')}`)
  }
}

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  const template = source.match(/<template>([\s\S]*)<\/template>/)?.[1] ?? ''
  const visible = template.replace(/<[^>]+>/g, ' ').replace(/\{\{[\s\S]*?\}\}/g, ' ')
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(visible)) {
    throw new Error(`Hardcoded CJK/Hangul text in ${file}`)
  }
  if (/Nine Star Ki/i.test(visible)) {
    throw new Error(`Hardcoded display language in ${file}: Nine Star Ki`)
  }
}

console.log(`kyusei i18n: ${REQUIRED_LOCALES.length} locales, ${trees[0].length} keys, no hardcoded display text`)
