import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

interface PartnerInput {
  gender: 'male' | 'female'
  animal: string
  year: number
}

interface CalcInput {
  male: PartnerInput
  female: PartnerInput
  locale?: string
}

interface PartnerResult {
  gender: 'male' | 'female'
  animal: string
  year: number
  age: number
  ganZhi: string
  naYin: string
  shengXiaoMing: string
  mingGua: string
  lifeGroup: 'east' | 'west'
  lifeGroupLabel: string
}

interface RelationVerdict {
  key: string
  label: string
  detail?: string
}

interface CalcResult {
  male: PartnerResult
  female: PartnerResult
  pairLabel: string
  zodiacVerdict: RelationVerdict
  nayinVerdict: RelationVerdict
  mingguaVerdict: RelationVerdict
  locale: string
}

const PROJECT_ROOT = resolve(process.cwd())
const VENDOR_PATH = join(PROJECT_ROOT, '.cache', 'liuyao-engine', 'lunar_python_vendor.zip')
const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')

function pythonInterpreter(): string {
  if (process.env.LIUYAO_PYTHON) return process.env.LIUYAO_PYTHON
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON
  return 'python3'
}

function buildPythonScript(): string {
  return `
import sys
import json
from datetime import datetime

sys.path.insert(0, '${VENDOR_PATH.replace(/\\/g, '\\\\')}')
from lunar_python import Solar

def calc_year(year):
    solar = Solar.fromYmd(int(year), 6, 15)
    lunar = solar.getLunar()
    return {
        'ganZhi': lunar.getYearInGanZhi(),
        'naYin': lunar.getYearNaYin(),
        'animal': lunar.getYearShengXiao(),
    }

if __name__ == '__main__':
    print(json.dumps(calc_year(sys.argv[1]), ensure_ascii=False))
`
}

async function queryLunarYear(year: number): Promise<{
  ganZhi: string
  naYin: string
  animal: string
}> {
  const script = buildPythonScript()
  return new Promise((resolve, reject) => {
    const child = spawn(pythonInterpreter(), ['-c', script, String(year)], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONPATH: VENDOR_PATH },
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString('utf-8')
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8')
    })

    child.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(createError({
          statusCode: 500,
          statusMessage: `Python engine error: ${stderr || stdout}`.slice(0, 200),
        }))
        return
      }

      try {
        const result = JSON.parse(stdout.trim())
        resolve(result)
      }
      catch {
        reject(createError({
          statusCode: 500,
          statusMessage: `Failed to parse result: ${stdout.slice(0, 200)}`,
        }))
      }
    })

    child.on('error', (err: Error) => {
      reject(createError({
        statusCode: 500,
        statusMessage: `Failed to spawn Python: ${err.message}`,
      }))
    })
  })
}

// 六十甲子纳音生肖命（三命通会本命名称）
const SHENG_XIAO_MING: Record<string, string> = {
  '甲子': '屋上之鼠', '乙丑': '海内之牛',
  '丙寅': '山林之虎', '丁卯': '望月之兔',
  '戊辰': '清温之龙', '己巳': '福气之蛇',
  '庚午': '堂里之马', '辛未': '得禄之羊',
  '壬申': '清秀之猴', '癸酉': '楼宿之鸡',
  '甲戌': '守身之狗', '乙亥': '过往之猪',
  '丙子': '田内之鼠', '丁丑': '湖内之牛',
  '戊寅': '过山之虎', '己卯': '山林之兔',
  '庚辰': '恕性之龙', '辛巳': '冬藏之蛇',
  '壬午': '军中之马', '癸未': '群内之羊',
  '甲申': '过树之猴', '乙酉': '唱午之鸡',
  '丙戌': '自眠之狗', '丁亥': '过山之猪',
  '戊子': '仓内之鼠', '己丑': '栏内之牛',
  '庚寅': '出山之虎', '辛卯': '蟾窟之兔',
  '壬辰': '行雨之龙', '癸巳': '草中之蛇',
  '甲午': '云中之马', '乙未': '敬重之羊',
  '丙申': '山上之猴', '丁酉': '独立之鸡',
  '戊戌': '进山之狗', '己亥': '道院之猪',
  '庚子': '梁上之鼠', '辛丑': '路途之牛',
  '壬寅': '过林之虎', '癸卯': '山林之兔',
  '甲辰': '伏潭之龙', '乙巳': '出穴之蛇',
  '丙午': '行路之马', '丁未': '失群之羊',
  '戊申': '独立之猴', '己酉': '报晓之鸡',
  '庚戌': '寺观之狗', '辛亥': '圈里之猪',
  '壬子': '山上之鼠', '癸丑': '栏外之牛',
  '甲寅': '立定之虎', '乙卯': '得道之兔',
  '丙辰': '天上之龙', '丁巳': '塘内之蛇',
  '戊午': '厩内之马', '己未': '草野之羊',
  '庚申': '食果之猴', '辛酉': '笼藏之鸡',
  '壬戌': '顾家之狗', '癸亥': '林下之猪',
}

const ANIMAL_TO_DIZHI: Record<string, string> = {
  '鼠': '子', '牛': '丑', '虎': '寅', '兔': '卯',
  '龙': '辰', '蛇': '巳', '马': '午', '羊': '未',
  '猴': '申', '鸡': '酉', '狗': '戌', '猪': '亥',
}

const DIZHI_TO_ANIMAL: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪',
}

// 地支三合
const SAN_HE: string[][] = [
  ['申', '子', '辰'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
  ['亥', '卯', '未'],
]

// 地支六合
const LIU_HE: Array<[string, string]> = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
  ['辰', '酉'], ['巳', '申'], ['午', '未'],
]

// 地支相冲
const LIU_CHONG: Array<[string, string]> = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
]

// 地支相害
const LIU_HAI: Array<[string, string]> = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'],
  ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
]

// 地支相刑（主要三组）
const XING_GROUPS: string[][] = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
]
const XING_PAIRS: Array<[string, string]> = [
  ['子', '卯'], ['卯', '子'],
  ['辰', '辰'], ['午', '午'], ['酉', '酉'], ['亥', '亥'],
]

const NAYIN_WUXING: Record<string, string> = {
  '海中金': '金', '剑锋金': '金', '白蜡金': '金', '砂中金': '金', '金箔金': '金', '钗钏金': '金',
  '炉中火': '火', '山头火': '火', '霹雳火': '火', '山下火': '火', '覆灯火': '火', '天上火': '火',
  '大林木': '木', '杨柳木': '木', '松柏木': '木', '平地木': '木', '桑柘木': '木', '石榴木': '木',
  '长流水': '水', '大溪水': '水', '涧下水': '水', '天河水': '水', '泉中水': '水', '大海水': '水',
  '路旁土': '土', '城头土': '土', '屋上土': '土', '壁上土': '土', '大驿土': '土', '沙中土': '土',
}

// 命卦：1坎2坤3震4巽5（男艮/女坤）6乾7兑8艮9离
const GUA_TABLE: Record<number, { name: string; group: 'east' | 'west' }> = {
  1: { name: '坎卦', group: 'east' },
  2: { name: '坤卦', group: 'west' },
  3: { name: '震卦', group: 'east' },
  4: { name: '巽卦', group: 'east' },
  5: { name: '坤卦', group: 'west' }, // female default; male overrides to 艮
  6: { name: '乾卦', group: 'west' },
  7: { name: '兑卦', group: 'west' },
  8: { name: '艮卦', group: 'west' },
  9: { name: '离卦', group: 'east' },
}

function getShengXiaoMing(ganZhi: string): string {
  return SHENG_XIAO_MING[ganZhi] || ''
}

function computeMingGua(year: number, gender: 'male' | 'female'): { name: string; group: 'east' | 'west'; groupLabel: string } {
  const suffix = year % 100
  let kua: number
  if (gender === 'male') {
    kua = (100 - suffix) % 9
    if (kua === 0) kua = 9
    if (kua === 5) {
      return { name: '艮卦', group: 'west', groupLabel: '西四命' }
    }
  }
  else {
    kua = (suffix - 4) % 9
    if (kua === 0) kua = 9
    if (kua === 5) {
      return { name: '坤卦', group: 'west', groupLabel: '西四命' }
    }
  }
  const gua = GUA_TABLE[kua]!
  return {
    name: gua.name,
    group: gua.group,
    groupLabel: gua.group === 'east' ? '东四命' : '西四命',
  }
}

function getDizhi(animal: string): string {
  return ANIMAL_TO_DIZHI[animal] || ''
}

function hasPair(pairs: Array<[string, string]>, a: string, b: string): boolean {
  for (const [x, y] of pairs) {
    if ((x === a && y === b) || (x === b && y === a)) return true
  }
  return false
}

function sameGroup(groups: string[][], a: string, b: string): boolean {
  for (const group of groups) {
    if (group.includes(a) && group.includes(b) && a !== b) return true
  }
  return false
}

function computeZodiacRelation(a: string, b: string): RelationVerdict {
  const dzA = getDizhi(a)
  const dzB = getDizhi(b)
  if (!dzA || !dzB) return { key: 'unknown', label: '未知' }
  if (dzA === dzB) return { key: 'same', label: '生肖相同' }
  if (sameGroup(SAN_HE, dzA, dzB)) return { key: 'sanhe', label: '生肖三合' }
  if (hasPair(LIU_HE, dzA, dzB)) return { key: 'liuhe', label: '生肖六合' }
  if (hasPair(LIU_CHONG, dzA, dzB)) return { key: 'xiangchong', label: '生肖相冲' }
  if (hasPair(LIU_HAI, dzA, dzB)) return { key: 'xianghai', label: '生肖相害' }
  if (sameGroup(XING_GROUPS, dzA, dzB) || hasPair(XING_PAIRS, dzA, dzB)) return { key: 'xiangxing', label: '生肖相刑' }
  return { key: 'none', label: '生肖无冲合' }
}

function computeNayinRelation(maleNaYin: string, femaleNaYin: string): RelationVerdict {
  const wxA = NAYIN_WUXING[maleNaYin]
  const wxB = NAYIN_WUXING[femaleNaYin]
  if (!wxA || !wxB) return { key: 'unknown', label: '纳音未知' }
  if (wxA === wxB) return { key: 'bihe', label: '纳音比和' }
  const ke: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
  const sheng: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
  if (ke[wxA] === wxB) return { key: 'maleKefemale', label: '男克女' }
  if (ke[wxB] === wxA) return { key: 'femaleKemale', label: '女克男' }
  if (sheng[wxA] === wxB) return { key: 'maleShengfemale', label: '男生女' }
  if (sheng[wxB] === wxA) return { key: 'femaleShengmale', label: '女生男' }
  return { key: 'none', label: '纳音无特殊关系' }
}

function computeMingguaRelation(maleGroup: 'east' | 'west', femaleGroup: 'east' | 'west'): RelationVerdict {
  if (maleGroup === femaleGroup) {
    return { key: 'sameGroup', label: '命卦相合', detail: `${maleGroup === 'east' ? '东四命' : '西四命'}相配` }
  }
  return { key: 'diffGroup', label: '命卦不合', detail: '东四命与西四命' }
}

async function buildPartner(input: PartnerInput): Promise<PartnerResult> {
  const lunarYear = await queryLunarYear(input.year)
  const currentYear = new Date().getFullYear()
  const age = currentYear - input.year + 1
  const gua = computeMingGua(input.year, input.gender)
  return {
    gender: input.gender,
    animal: lunarYear.animal,
    year: input.year,
    age,
    ganZhi: lunarYear.ganZhi,
    naYin: lunarYear.naYin,
    shengXiaoMing: getShengXiaoMing(lunarYear.ganZhi),
    mingGua: gua.name,
    lifeGroup: gua.group,
    lifeGroupLabel: gua.groupLabel,
  }
}

function pairLabel(male: PartnerResult, female: PartnerResult): string {
  return `${male.year}${male.animal}男${female.year}${female.animal}女`
}

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.male || !body?.female) {
    throw createError({ statusCode: 400, statusMessage: 'Missing partner info' })
  }
  if (!['male', 'female'].includes(body.male.gender) || !['male', 'female'].includes(body.female.gender)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid gender' })
  }
  if (!body.male.year || !body.female.year) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birth year' })
  }

  const locale = body.locale || 'zh-CN'

  const [maleResult, femaleResult] = await Promise.all([
    buildPartner(body.male),
    buildPartner(body.female),
  ])

  const zodiacVerdict = computeZodiacRelation(maleResult.animal, femaleResult.animal)
  const nayinVerdict = computeNayinRelation(maleResult.naYin, femaleResult.naYin)
  const mingguaVerdict = computeMingguaRelation(maleResult.lifeGroup, femaleResult.lifeGroup)

  return {
    male: maleResult,
    female: femaleResult,
    pairLabel: pairLabel(maleResult, femaleResult),
    zodiacVerdict,
    nayinVerdict,
    mingguaVerdict,
    locale,
  }
})
