import { getStrokeCount, hasUnknownStrokes } from './strokes'
import { getFortune81, type Fortune81Entry } from './fortune81'

export interface WugeGrid {
  name: string
  value: number
  fortune: Fortune81Entry
}

export interface WugeResult {
  input: string
  surname: string
  givenName: string
  grids: {
    tiange: WugeGrid
    renge: WugeGrid
    dige: WugeGrid
    waige: WugeGrid
    zongge: WugeGrid
  }
  chars: { char: string; strokes: number }[]
}

/**
 * 计算五格剖象法五格
 *
 * 公式（基于康熙字典笔画 / 繁体标准）：
 * - 天格：单姓 = 姓笔画 + 1；复姓 = 姓各字笔画之和
 * - 人格：姓末字笔画 + 名首字笔画
 * - 地格：单名 = 名笔画 + 1；多名 = 名字笔画之和
 * - 外格：总格 - 人格 + 1
 * - 总格：姓名全部笔画之和
 */
export function calcWuge(name: string): { result?: WugeResult; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) {
    return { error: '姓名不能为空' }
  }

  // 仅支持纯中文姓名（2~4 字）
  const isChinese = /^[一-龥]+$/.test(trimmed)
  if (!isChinese) {
    return { error: '请输入纯中文姓名（2~4 个汉字）' }
  }
  if (trimmed.length < 2 || trimmed.length > 4) {
    return { error: '姓名长度需在 2~4 个汉字之间' }
  }

  const { unknown, known } = hasUnknownStrokes(trimmed)
  if (unknown.length > 0) {
    return { error: `以下字符暂无笔画数据，请尝试使用其他字或反馈补录：${unknown.join('、')}` }
  }

  // 拆分姓与名（简单规则：单姓取首字，复姓取前两字）
  // 复姓白名单（常见复姓）
  const compoundSurnames = new Set([
    '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '诸葛', '尉迟',
    '羊舌', '公孙', '慕容', '司徒', '司空', '令狐', '钟离', '宇文', '长孙', '鲜于',
    '闾丘', '亓官', '司寇', '子车', '颛孙', '宰父', '谷梁', '拓跋', '夹谷', '轩辕',
    '百里', '东郭', '南门', '呼延', '归海', '羊舌', '微生', '岳帅', '缑亢', '亢桑',
  ])

  let surname: string
  let givenName: string
  if (trimmed.length >= 2 && compoundSurnames.has(trimmed.slice(0, 2))) {
    surname = trimmed.slice(0, 2)
    givenName = trimmed.slice(2)
  } else {
    surname = trimmed.slice(0, 1)
    givenName = trimmed.slice(1)
  }

  if (givenName.length === 0) {
    return { error: '姓名需包含姓氏和名字' }
  }

  const surnameStrokes = [...surname].map(c => getStrokeCount(c)!).reduce((a, b) => a + b, 0)
  const givenStrokes = [...givenName].map(c => getStrokeCount(c)!).reduce((a, b) => a + b, 0)
  const totalStrokes = surnameStrokes + givenStrokes

  // 单字笔画数组
  const chars = [...trimmed].map(c => ({ char: c, strokes: getStrokeCount(c)! }))

  // 天格
  const tiangeValue = surname.length === 1 ? chars[0]!.strokes + 1 : surnameStrokes

  // 人格 = 姓末字 + 名首字
  const surnameLastChar = chars[surname.length - 1]!.strokes
  const givenFirstChar = chars[surname.length]!.strokes
  const rengeValue = surnameLastChar + givenFirstChar

  // 地格 = 名字笔画之和（单名 +1）
  const digeValue = givenName.length === 1 ? givenStrokes + 1 : givenStrokes

  // 总格
  const zonggeValue = totalStrokes

  // 外格 = 总格 - 人格 + 1
  const waigeValue = zonggeValue - rengeValue + 1

  const buildGrid = (name: string, value: number): WugeGrid => ({
    name,
    value,
    fortune: getFortune81(value),
  })

  return {
    result: {
      input: trimmed,
      surname,
      givenName,
      chars,
      grids: {
        tiange: buildGrid('天格', tiangeValue),
        renge: buildGrid('人格', rengeValue),
        dige: buildGrid('地格', digeValue),
        waige: buildGrid('外格', waigeValue),
        zongge: buildGrid('总格', zonggeValue),
      },
    },
  }
}
