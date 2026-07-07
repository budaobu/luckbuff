import { toLunar } from 'lunar'

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// ===== 年重表：按干支索引 (天干idx * 12 + 地支idx) =====
// 但实际按 60 甲子顺序，这里用 "天干+地支" 字符串作为键
const YEAR_WEIGHT: Record<string, number> = {
  // 鼠年
  '甲子': 12, '丙子': 16, '戊子': 15, '庚子': 7, '壬子': 5,
  // 牛年
  '乙丑': 9, '丁丑': 8, '己丑': 7, '辛丑': 7, '癸丑': 7,
  // 虎年
  '丙寅': 6, '戊寅': 8, '庚寅': 9, '壬寅': 9, '甲寅': 12,
  // 兔年
  '丁卯': 7, '己卯': 19, '辛卯': 12, '癸卯': 12, '乙卯': 8,
  // 龙年
  '戊辰': 12, '庚辰': 12, '壬辰': 10, '甲辰': 8, '丙辰': 8,
  // 蛇年
  '己巳': 5, '辛巳': 6, '癸巳': 7, '乙巳': 7, '丁巳': 6,
  // 马年
  '庚午': 9, '壬午': 8, '甲午': 15, '丙午': 9, '戊午': 19,
  // 羊年
  '辛未': 8, '癸未': 7, '乙未': 6, '丁未': 5, '己未': 6,
  // 猴年
  '壬申': 7, '甲申': 5, '丙申': 5, '戊申': 14, '庚申': 8,
  // 鸡年
  '癸酉': 8, '乙酉': 15, '丁酉': 14, '己酉': 5, '辛酉': 16,
  // 狗年
  '甲戌': 15, '丙戌': 6, '戊戌': 14, '庚戌': 9, '壬戌': 10,
  // 猪年
  '乙亥': 9, '丁亥': 16, '己亥': 9, '辛亥': 17, '癸亥': 6,
}

// ===== 月重表：农历月份 1-12 =====
const MONTH_WEIGHT = [0, 6, 7, 18, 9, 5, 16, 9, 15, 18, 8, 9, 5]

// ===== 日重表：农历日期 1-30 =====
const DAY_WEIGHT = [0,
  5, 10, 8, 15, 16, 15, 8, 16, 8, 16,
  9, 17, 8, 17, 10, 8, 9, 18, 5, 15,
  10, 9, 8, 9, 15, 18, 7, 8, 16, 6,
]

// ===== 时辰重表：地支 0-11 =====
const HOUR_WEIGHT = [16, 6, 7, 10, 9, 16, 10, 8, 8, 9, 6, 6]

// ===== 称骨歌 =====
interface FortuneEntry {
  male: string
  female: string
}

const FORTUNE_POEMS: Record<string, FortuneEntry> = {
  '21': {
    male: '短命非业谓大空，平生灾难事重重；凶祸频临陷逆境，终世困苦事不成。',
    female: '生身此命运不通，乌云盖月黑朦胧；莫向故园载花木，可来幽地种青松。',
  },
  '22': {
    male: '此命劳碌一生穷，屡次三番险象逢；难得祖业家可立，临时事机总落空。',
    female: '此命孤冷有凄伶，此命推来路乞人；操心烦脑度平日，一生育苦度光阴。',
  },
  '23': {
    male: '此命推来骨肉轻，求谋做事事难成；妻儿兄弟实难靠，外出他乡做散人。',
    female: '此命推来骨肉轻，求财谋事事难成；弟妹六亲无有靠，繁绱家事难以持。',
  },
  '24': {
    male: '此命推来福禄无，门庭困苦总难荣；六亲骨肉皆无靠，流浪他乡作老翁。',
    female: '此命推来福禄无，家务辛苦难以扶；丈夫儿女皆无靠，流落他乡作游孤。',
  },
  '25': {
    male: '此命推来祖业微，门庭营度似稀奇；六亲骨肉如冰炭，一世勤劳自把持。',
    female: '此命推来八字轻，六庭艰辛多苦凄；娘家六友冷如灰，一生操劳多忧心。',
  },
  '26': {
    male: '平生衣禄苦中求，独自营谋事不休；离祖出门宜早计，晚来衣禄自无休。',
    female: '平生衣禄苦寻求，女命生来带忧愁；辛酸苦辣他尝过，晚年衣钵本无忧。',
  },
  '27': {
    male: '一生作事少商量，难靠祖宗作主张；独马单枪空做去，早年晚岁总无长。',
    female: '竹平做事少间量，难靠夫君做主张；心问口来口问心，自做主张过光阴。',
  },
  '28': {
    male: '一生行事似飘蓬，祖宗产业在梦中；若不过房改名姓，也当移徒二三通。',
    female: '女命生来八字经，得善做事一无情；你把别人当亲生，别人对你假殷情。',
  },
  '29': {
    male: '初年运限未曾亨，纵有功名在后成；须过四旬才可立，移居改姓始为良。',
    female: '花枝要来性情硬，自奔自立不求人；若向求财方可止，有苦有甜度光阴。',
  },
  '30': {
    male: '劳劳碌碌苦中求，东奔西走何日休；若使终身勤与俭，老来稍可免忧愁。',
    female: '此命推来比郎强，婚姻大事碍无防；中年走过坎坷运，末年渐比先前强。',
  },
  '31': {
    male: '忙忙碌碌苦中求，何日云开见日头；难得祖基家可立，中年衣食渐能周。',
    female: '早年行运在忙碌，劳碌奔波苦中求；自奔自愁把家立，后来晚景无忧愁。',
  },
  '32': {
    male: '初年运蹇事难谋，渐有财源如水流；到得中年衣食旺，那时名利一齐收。',
    female: '时逢吉神在运中，纵有凶处不为凶；真变假来假变真，结拜弟妹当亲生。',
  },
  '33': {
    male: '早年作事事难成，百计徒劳枉费心；半世自如流水去，后来运到得黄金。',
    female: '八字命来张张薄，勤俭持家皆可过；年华巴如流水过，末年运至受福禄。',
  },
  '34': {
    male: '此命福气果如何，僧道门中衣禄多；离祖出家方为妙，朝晚拜佛念弥陀。',
    female: '矮巴勾枣难捞枝，好人寻命不投机；谋望献身最费力，婚姻同移总是虚。',
  },
  '35': {
    male: '生平福量不周全，祖业根基觉少传；营事生涯宜守旧，时来衣食胜从前。',
    female: '女子走冰怕冰薄，交易出行犯琢磨；婚姻周郎休此意，官司口舌须要知。',
  },
  '36': {
    male: '此命终身运不通，劳劳作事尽皆空；苦心竭力成家计，到得那时在梦中。',
    female: '忧愁常锁两眉间，女命万绪挂心头；从今以后防口角，任意行而不相天。',
  },
  '37': {
    male: '此命般般事不成、弟兄少力自孤行，虽然祖业须微有，来得明时去不明。',
    female: '此命来时运费多，此作推车受折磨；山路崎岖吊下耳，左插右安安不着。',
  },
  '38': {
    male: '一身骨肉最清高，早入簧门姓氏标；待到年将三十六，蓝衫脱去换红袍。',
    female: '凤鸣岐山闻四方，女命逢之大吉昌；走失夫君音有信，晚年衣禄人财多。',
  },
  '39': {
    male: '不须劳碌过平生，独自成家福不轻；早有福星常照命，任君行去百般成。',
    female: '此命推来运不通，劳碌奔波一场空；好似俊鸟关笼中，中年末限起秋风。',
  },
  '40': {
    male: '平生衣禄是绵长，件件心中自主张；前面风霜多受过，后来必定享安康。',
    female: '目上月令如运关，千心万苦受煎熬；女子苦难受过来，晚年福康比花艳。',
  },
  '41': {
    male: '此命推来事不同，为人能干异凡庸；中年还有逍遥福，不比前时运未通。',
    female: '此命推来一般般，女子为人很非凡；中年逍遥多自在，晚年更比中年强。',
  },
  '42': {
    male: '得宽怀处且宽怀，何用双眉皱不开；若使中年命运济，那时名利一齐来。',
    female: '枯井破废已多年，一朝泉水出来鲜；资生济竭人称美，来运转喜自然时。',
  },
  '43': {
    male: '为人心性最聪明，作事轩昂近贵人；衣禄一生天数定，不须劳碌过平生。',
    female: '推车靠涯道路赶，女命求财也费难；婚姻出行无阴碍，疾病口舌多安宁。',
  },
  '44': {
    male: '万事由天莫苦求，须知福禄命里收；少壮名利难如意，晚景欣然更不忧。',
    female: '夜梦金银醒来空，女子谋事运不能；婚姻难成交易获，夫君走失不见踪。',
  },
  '45': {
    male: '名利推来竟若何，前番辛苦后奔波；命中难养男与女，骨肉扶持也不多。',
    female: '此命终身驳杂多，六亲骨肉不相助；命中男妇都难养，劳碌辛苦还奔波。',
  },
  '46': {
    male: '东西南北尽皆通，出姓移居更觉隆；衣禄无亏天数定，中年晚景一般同。',
    female: '孤舟得水离沙滩，女命出外早远家；是非口舌皆无碍，婚姻合伙更不差。',
  },
  '47': {
    male: '此命推为旺末年，妻荣子贵自怡然；平生原有滔滔福，财源滚滚似水流。',
    female: '时来运转吉气发，多年枯木又开花；枝叶重生多茂盛，凡人见了凡人夸。',
  },
  '48': {
    male: '初年运道未曾亨，若是蹉跎再不兴；兄弟六亲皆无靠，一身事业晚年成。',
    female: '一朵鲜花镜中开，看着极好取不来；劝你休把镜花想，女命推业主可怪。',
  },
  '49': {
    male: '此命推来福不轻，自成自立显门庭；从来富贵人钦敬，使婢差奴过一生。',
    female: '此命推来福不轻，女子随君显门庭；容貌美满热人爱，银钱富足过一生。',
  },
  '50': {
    male: '为利为名终日劳，中年福禄也多遭；老来是有财星照，不比前番目下高。',
    female: '马氏太公不相和，好命逢之尤凝多；恩人无义反成怨，是非平地起风波。',
  },
  '51': {
    male: '一世荣华事事通，不须劳碌自亨通；弟兄叔侄皆如意，家业成时福禄宏。',
    female: '肥羊失群入山岗，饿虎逢之把口张；适口充肠心欢喜，女名八安大吉昌。',
  },
  '52': {
    male: '一世荣华事事能，不须劳思自然宁；宗族欣然心皆好，家业丰亨自称心。',
    female: '顺风行舟扯起棚，上天又助一顺风；不用费力逍遥去，任意而行大亨通。',
  },
  '53': {
    male: '此格推为气量真，兴家发达在其中；一生福禄安排定，却是人间一富翁。',
    female: '此命相貌眉活秀，文武双全功名成；一生衣禄皆无愁，可算世上有福人。',
  },
  '54': {
    male: '此命推来厚且清，诗书满腹看功成；丰衣足食自然稳，正是人间有福人。',
    female: '学问满腹运气强，谋望求财大吉祥；交易出行大得意，是非口舌皆无妨。',
  },
  '55': {
    male: '走马扬鞭争利名，少年作事费筹论；一朝福禄源源至，富贵荣华显六亲。',
    female: '吉祥平安志量高，女命求财任逍遥；交易婚姻大有意，夫君在外有音耗。',
  },
  '56': {
    male: '此格推来礼义通，一身福禄用无穷；甜酸苦辣皆尝过，滚滚财源稳且丰。',
    female: '明珠书士离埃来，女命口角消散开；走失郎君当两归，交易有成水无灾。',
  },
  '57': {
    male: '福禄丰盈万事全，一身荣耀乐天年；名扬威震人争羡，此世逍遥宛似仙。',
    female: '游鱼戏水被网惊，跳过龙门秧化龙；三根杨柳垂金线，万朵桃花显价能。',
  },
  '58': {
    male: '平生福禄自然来，名利兼全福寿偕；金榜题名为贵客，紫袍玉带走金阶。',
    female: '此命推来转悠悠，时运未来莫强求；幸得今日重反点，自有好运在后头。',
  },
  '59': {
    male: '细推此格妙且清，必定才高礼义通；甲第之中应有分，扬鞭走马显威荣。',
    female: '雨雪载途泥泞至，交易不定难出行；疾病还拉慢婚姻，谋望求财事不成。',
  },
  '60': {
    male: '一朝金榜快题名，显祖荣宗大器成；衣禄定然原裕足，田园财帛更丰盈。',
    female: '女命八字喜气和，谋望求财吉庆多；口舌渐消疾病少，夫君走失归老窝。',
  },
  '61': {
    male: '不作朝中金榜客，定为世上大财翁；聪明天赋经书熟，名显高科自是荣。',
    female: '缘木求鱼事多端，虽不得鱼无后害；若是行险弄巧地，事不遂心枉安排。',
  },
  '62': {
    male: '此命生来福不穷，读书必定显亲宗；紫衣金带为卿相，富贵荣华熟与同。',
    female: '指日升高气象新，走失待人有音信；好命遇事遂心好，伺病口舌皆除根。',
  },
  '63': {
    male: '命主为官福禄长，得来富贵实丰常；名题雁塔传金榜，大显门庭天下扬。',
    female: '五官脱运难抬头，女命须当把财求；交易少行有人助，疾病口舌不须愁。',
  },
  '64': {
    male: '此格威权不可当，紫袍金带尘高堂；荣华富贵谁能及？万古留名姓氏扬。',
    female: '俊鸟曾得出笼中，脱离灾难显威风；一朝得意福立至，东南西北任意行。',
  },
  '65': {
    male: '细推此命福非轻，富贵荣华孰与争？定国安邦人极品，威声显赫震寰瀛。',
    female: '此命推来福不轻，慈善为事受人敬；天降文王开基业，富贵荣华八百年。',
  },
  '66': {
    male: '此格人间一福人，堆金积玉满堂春；从来富贵由天定，金榜题名更显亲。',
    female: '时来运转锐气周，贤惠淑女君子求；钏鼓乐之大吉庆，女名逢之吉悠悠。',
  },
  '67': {
    male: '此命生来福自宏，田园家业最高隆；平生衣禄盈丰足，一世荣华万事通。',
    female: '乱丝无头定有头，碰着闲磨且暂推；交易出有无好处，谋事求财心不遂。',
  },
  '68': {
    male: '富贵由天莫苦求，万金家计不须谋；如今不比前翻事，祖业根基千古留。',
    female: '水庭明月不可捞，女命早限命不高；交易出行难获得，末限命运渐渐好。',
  },
  '69': {
    male: '君是人间衣禄星，一生富贵众人钦；总然福禄由天定，安享荣华过一生。',
    female: '太公封祖不非凡，女子求财稳如山；交易合伙大吉庆，疾病口角消除安。',
  },
  '70': {
    male: '此命推来福禄宏，不须愁虑苦劳心；荣华富贵已天定，正笏垂绅拜紫宸。',
    female: '此命推来喜气新，郎君遇着多遂心；女命交了顺当运，富贵衣禄平乐生。',
  },
  '71': {
    male: '此命生成大不同，公侯卿相在其中；一生自有逍遥福，富贵荣华极品隆。',
    female: '此命推来鸿运交，再不需愁来苦劳；一生身有衣禄福，按享荣华在其中。',
  },
  '72': {
    male: '此格世界罕有生，十代积善产此人；天上紫微来照命，统治万民乐太平。',
    female: '此格世罕有，女命不常见；若为巾帼杰，亦当福绵延。',
  },
}

function getGanZhi(year: number): string {
  const ganIdx = (year - 4) % 10
  const zhiIdx = (year - 4) % 12
  return TIAN_GAN[ganIdx]! + DI_ZHI[zhiIdx]!
}

function getFortuneLevel(totalQian: number): string {
  if (totalQian <= 29) return '下下'
  if (totalQian <= 39) return '中下'
  if (totalQian <= 49) return '中上'
  if (totalQian <= 59) return '上等'
  return '极贵'
}

export interface ChengguWeight {
  liang: number
  qian: number
  totalQian: number
}

export interface ChengguBreakdown {
  year: { ganzhi: string; weight: ChengguWeight }
  month: { lunarMonth: number; weight: ChengguWeight }
  day: { lunarDay: number; weight: ChengguWeight }
  hour: { shiChen: string; weight: ChengguWeight }
}

export interface ChengguFortune {
  level: string
  poem: string
  annotation: string
}

export interface ChengguResult {
  totalWeight: ChengguWeight
  breakdown: ChengguBreakdown
  fortune: ChengguFortune
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean }
  solarDate: { year: number; month: number; day: number }
  gender: 'male' | 'female'
}

function toWeightObj(totalQian: number): ChengguWeight {
  return {
    liang: Math.floor(totalQian / 10),
    qian: totalQian % 10,
    totalQian,
  }
}

export function calcChenggu(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  gender: 'male' | 'female',
  hourZhi?: string,
): { result?: ChengguResult; error?: string } {
  try {
    const { lunar } = toLunar({ year: solarYear, month: solarMonth, day: solarDay })

    let lunarMonth = lunar.month
    // 闰月处理：闰月上半月算本月，下半月算下月
    if (lunar.isLeapMonth) {
      if (lunar.day > 15) {
        lunarMonth = lunarMonth === 12 ? 1 : lunarMonth + 1
      }
    }

    const ganzhi = getGanZhi(lunar.year)
    const yearWeight = YEAR_WEIGHT[ganzhi]
    if (yearWeight === undefined) {
      return { error: `未找到干支 ${ganzhi} 对应的年重` }
    }

    const monthWeight = MONTH_WEIGHT[lunarMonth]
    if (monthWeight === undefined) {
      return { error: `未找到农历 ${lunarMonth} 月对应的月重` }
    }

    const dayWeight = DAY_WEIGHT[lunar.day]
    if (dayWeight === undefined) {
      return { error: `未找到农历 ${lunar.day} 日对应的日重` }
    }

    let hourWeight = 0
    let shiChen = '未知'
    if (hourZhi) {
      const zhiIdx = DI_ZHI.indexOf(hourZhi)
      if (zhiIdx >= 0) {
        hourWeight = HOUR_WEIGHT[zhiIdx]!
        shiChen = hourZhi
      }
    }

    const totalQian = yearWeight + monthWeight + dayWeight + hourWeight
    const key = String(totalQian)
    const entry = FORTUNE_POEMS[key]
    if (!entry) {
      return { error: `未找到总重 ${Math.floor(totalQian / 10)}两${totalQian % 10}钱 对应的称骨歌` }
    }

    const isMale = gender === 'male'
    const poem = isMale ? entry.male : entry.female
    const level = getFortuneLevel(totalQian)

    return {
      result: {
        totalWeight: toWeightObj(totalQian),
        breakdown: {
          year: { ganzhi, weight: toWeightObj(yearWeight) },
          month: { lunarMonth, weight: toWeightObj(monthWeight) },
          day: { lunarDay: lunar.day, weight: toWeightObj(dayWeight) },
          hour: { shiChen, weight: toWeightObj(hourWeight) },
        },
        fortune: {
          level,
          poem,
          annotation: '',
        },
        lunarDate: {
          year: lunar.year,
          month: lunar.month,
          day: lunar.day,
          isLeapMonth: lunar.isLeapMonth,
        },
        solarDate: { year: solarYear, month: solarMonth, day: solarDay },
        gender,
      },
    }
  } catch (e: any) {
    return { error: e?.message || '农历转换失败' }
  }
}
