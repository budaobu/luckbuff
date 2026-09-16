import type { GuaInfo } from '~/types/zhouyi'
import { findGuaByYao, getGuaById, getYaoArray, LIUSHISI_GUA } from '~/utils/zhouyi/constants'

export type HexagramLineValue = 6 | 7 | 8 | 9

export interface DailyHexagramCast {
  gua: GuaInfo
  lineValues: HexagramLineValue[]
  movingLines: number[]
  changedGua: GuaInfo | undefined
}

export interface DailyHexagramReading {
  id: number
  reading: string
}

const TRIGRAM_META: Record<number, { name: string, nature: string, wuxing: string }> = {
  1: { name: '乾', nature: '天', wuxing: '金行' },
  2: { name: '兑', nature: '泽', wuxing: '金行' },
  3: { name: '离', nature: '火', wuxing: '火行' },
  4: { name: '震', nature: '雷', wuxing: '木行' },
  5: { name: '巽', nature: '风', wuxing: '木行' },
  6: { name: '坎', nature: '水', wuxing: '水行' },
  7: { name: '艮', nature: '山', wuxing: '土行' },
  8: { name: '坤', nature: '地', wuxing: '土行' },
}

const DAILY_HEXAGRAM_READINGS: DailyHexagramReading[] = [
  { id: 1, reading: '别把自己烧成火把。能扛事，也要学会靠墙歇口气。' },
  { id: 2, reading: '地不抢戏，却养得出庄稼。少表态，多做眼前实事。' },
  { id: 3, reading: '开局像穿湿鞋爬山。慢不是怂，是别摔。' },
  { id: 4, reading: '不懂就问。脸面留到饭后，路认清更要紧。' },
  { id: 5, reading: '锅还没热，别急着掀盖。等一等，汤才像汤。' },
  { id: 6, reading: '赢了嘴，可能输掉一天心情。能散就散，别缠。' },
  { id: 7, reading: '做事要有队形。散漫不是自由，是自找乱。' },
  { id: 8, reading: '找靠谱的人站近点。热闹不一定等于援军。' },
  { id: 9, reading: '口袋里有点粮，先别显摆。风还没停。' },
  { id: 10, reading: '踩虎尾未必，踩坑挺容易。看清路再迈步。' },
  { id: 11, reading: '顺的时候别飘。山里路好走，也照样拐弯。' },
  { id: 12, reading: '门暂时卡住。别硬撞，先把门槛扫干净。' },
  { id: 13, reading: '想同路，就少猜忌。篝火够大，人自然来。' },
  { id: 14, reading: '收获多就分一点。仓库太满，容易招虫。' },
  { id: 15, reading: '低头不是输，是给自己留出上山的空间。' },
  { id: 16, reading: '高兴可以，别躺在鼓点上不起来。' },
  { id: 17, reading: '跟人走之前先看路。好向导不会催你跳沟。' },
  { id: 18, reading: '旧事放久了会发酵。今天清一清，别怕费手劲。' },
  { id: 19, reading: '事情靠近了，别只围观。拿小步试水深。' },
  { id: 20, reading: '看风景也是干活。看清风向，再决定抬脚。' },
  { id: 21, reading: '硬骨头得咬慢点。急了，牙先抗议。' },
  { id: 22, reading: '妆可以画，饭要真煮。别把包装当内容。' },
  { id: 23, reading: '旧叶子在掉。接住有用的，放走烂的。' },
  { id: 24, reading: '走回头路不丢人，只要这次认得坑。' },
  { id: 25, reading: '别自己吓自己，也别乱捡因果。守规矩就好。' },
  { id: 26, reading: '力气攒够了，就做点正事。别继续藏在仓里。' },
  { id: 27, reading: '吃饭、读书、说话都入口。挑一挑，别乱吞。' },
  { id: 28, reading: '梁有点弯，先卸货，再谈远方。' },
  { id: 29, reading: '坑连着坑。绕行不丢人，掉下去才耽误。' },
  { id: 30, reading: '火要依附柴。光有热情，烧不了三天。' },
  { id: 31, reading: '心动是真信号。先看看，对方是否也在拨号。' },
  { id: 32, reading: '细水长流有点无聊，可井就是这样养人的。' },
  { id: 33, reading: '退一步不是认输，是给森林留条小路。' },
  { id: 34, reading: '力气大，别拿来撞门。先试试钥匙。' },
  { id: 35, reading: '天亮了可以走，但别把晨雾当成终点。' },
  { id: 36, reading: '灯暗下来，先护住火种，不必急着照人。' },
  { id: 37, reading: '屋里少讲道理，多添一碗热汤。' },
  { id: 38, reading: '想法不同不一定是敌意。先把筷子分开。' },
  { id: 39, reading: '路瘸了，你也别急。换条坡，常比硬冲快。' },
  { id: 40, reading: '结扣松了就慢慢抽。剪刀不是万能钥匙。' },
  { id: 41, reading: '少一点负担，反而轻快。丢东西未必是坏事。' },
  { id: 42, reading: '风来时张帆。船，还是得自己掌。' },
  { id: 43, reading: '该断就断。拖成拉锯，只会磨手。' },
  { id: 44, reading: '偶遇别急着定终身，先闻闻风里有什么。' },
  { id: 45, reading: '人聚齐是好事。记得谁管柴，谁管水。' },
  { id: 46, reading: '上台阶要一步步来。跳级常会踩空。' },
  { id: 47, reading: '眼下窄，先别喊。省点力气找出口。' },
  { id: 48, reading: '井水不因没人看就变浑。守好你的干净。' },
  { id: 49, reading: '旧衣不合身就改，但别在风里赤膊动手。' },
  { id: 50, reading: '把火调稳，汤才能养人。急火只冒烟。' },
  { id: 51, reading: '雷响时先站稳。不是所有动静都冲你来。' },
  { id: 52, reading: '今天适合停。山不动，反而看得远。' },
  { id: 53, reading: '感情和树一样。天天拔，不会长高。' },
  { id: 54, reading: '别把凑合当缘分。慢半拍，泥路看得更清。' },
  { id: 55, reading: '正午虽亮，记得留阴凉。盛宴别一口吃完。' },
  { id: 56, reading: '出门在外少讲排场。能睡稳，就是好店。' },
  { id: 57, reading: '风不喊叫也能进门。柔一点，事更好办。' },
  { id: 58, reading: '话说得悦耳，不如落得实在。' },
  { id: 59, reading: '散开的别硬拉回来。先修桥，人心自己会聚。' },
  { id: 60, reading: '省着用不是抠，是别让好日子漏底。' },
  { id: 61, reading: '真诚像粗陶碗。朴素，但装得住热汤。' },
  { id: 62, reading: '小鸟低飞就好，别硬装大鹏。' },
  { id: 63, reading: '汤快好了更要看火。翻锅常在最后一步。' },
  { id: 64, reading: '没过河就别急着庆祝。尾巴湿了，还能走。' },
]

function assertTrigram(id: number) {
  const trigram = TRIGRAM_META[id]
  if (!trigram) throw new Error(`无效八卦序号: ${id}`)
  return trigram
}

export function getDailyTrigram(id: number) {
  return assertTrigram(id)
}

export function getDailyHexagramReading(id: number) {
  const item = DAILY_HEXAGRAM_READINGS.find(reading => reading.id === id)
  if (!item) throw new Error(`缺少每日卦解读: ${id}`)
  return item.reading
}

export function getDailyHexagram(date = new Date()): GuaInfo {
  const dayNumber = date.getFullYear() * 372
    + (date.getMonth() + 1) * 31
    + date.getDate()
  const gua = LIUSHISI_GUA[dayNumber % LIUSHISI_GUA.length]
  if (!gua) throw new Error('每日卦数据缺失')
  return gua
}

export function rollHexagramLineValue(): HexagramLineValue {
  const value = Math.floor(Math.random() * 8)
  if (value === 0) return 6
  if (value < 4) return 7
  if (value < 7) return 8
  return 9
}

export function createHexagramCast(lineValues: HexagramLineValue[]): DailyHexagramCast {
  if (lineValues.length !== 6 || lineValues.some(value => ![6, 7, 8, 9].includes(value))) {
    throw new Error('六爻取值无效')
  }

  const gua = findGuaByYao(lineValues.map(value => (value === 7 || value === 9 ? 1 : 0)))
  if (!gua) throw new Error('无法根据爻值定位卦象')

  const movingLines = lineValues
    .map((value, index) => (value === 6 || value === 9 ? index + 1 : 0))
    .filter(line => line > 0)

  const changedYao = lineValues.map((value) => {
    if (value === 6) return 1
    if (value === 9) return 0
    return value === 7 ? 1 : 0
  })
  const changedGua = findGuaByYao(changedYao)

  return { gua, lineValues, movingLines, changedGua }
}

export function createStaticHexagramCast(gua: GuaInfo): DailyHexagramCast {
  return {
    gua,
    lineValues: getYaoArray(gua).map(value => (value ? 7 : 8)),
    movingLines: [],
    changedGua: undefined,
  }
}

export function getHexagramById(id: number) {
  const gua = getGuaById(id)
  if (!gua) throw new Error(`卦象不存在: ${id}`)
  return gua
}
