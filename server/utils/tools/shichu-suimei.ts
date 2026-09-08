import {
  calculateBaziChartResult,
  type BaziChartGender,
  type BaziChartInput,
  type BaziChartLocation,
  type BaziChartResult,
} from './bazi-chart'

export type ShichuSuimeiGender = BaziChartGender
export type ShichuSuimeiLocation = BaziChartLocation
export type ShichuSuimeiInput = BaziChartInput
export type ShichuSuimeiDisplayLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

export interface ShichuSuimeiDisplayMeta {
  system: string
  region: 'jp'
  pillars: string[]
  concepts: string[]
  engineStrategy: string
  sources: string[]
}

export interface ShichuSuimeiResult extends BaziChartResult {
  display: ShichuSuimeiDisplayMeta
}

const TEN_GOD_JA: Record<string, string> = {
  比肩: '比肩',
  劫财: '劫財',
  食神: '食神',
  伤官: '傷官',
  偏财: '偏財',
  正财: '正財',
  七杀: '偏官',
  正官: '正官',
  正印: '印綬',
  偏印: '偏印',
}

const NAYIN_JA: Record<string, string> = {
  海中金: '海中金',
  炉中火: '炉中火',
  大林木: '大林木',
  路旁土: '路傍土',
  剑锋金: '剣鋒金',
  山头火: '山頭火',
  涧下水: '澗下水',
  城头土: '城頭土',
  白蜡金: '白蝋金',
  杨柳木: '楊柳木',
  泉中水: '泉中水',
  屋上土: '屋上土',
  霹雳火: '霹靂火',
  松柏木: '松柏木',
  长流水: '長流水',
  金箔金: '金箔金',
  覆灯火: '覆燈火',
  天河水: '天河水',
  大驿土: '大駅土',
  钗钏金: '釵釧金',
  桑柘木: '桑柘木',
  大溪水: '大渓水',
  沙中土: '沙中土',
  天上火: '天上火',
  石榴木: '石榴木',
  大海水: '大海水',
}

const DI_SHI_JA: Record<string, string> = {
  长生: '長生',
  沐浴: '沐浴',
  冠带: '冠帯',
  临官: '建禄',
  帝旺: '帝旺',
  衰: '衰',
  病: '病',
  死: '死',
  墓: '墓',
  绝: '絶',
  胎: '胎',
  养: '養',
}

const SHEN_SHA_JA: Record<string, string> = {
  天乙贵人: '天乙貴人',
  太极贵人: '太極貴人',
  文昌: '文昌',
  福星贵人: '福星貴人',
  国印贵人: '国印貴人',
  金舆: '金輿',
  禄神: '禄神',
  天厨贵人: '天厨貴人',
  学堂: '学堂',
  天官贵人: '天官貴人',
  将星: '将星',
  金匮: '金匱',
  龙德贵人: '龍德貴人',
  天喜: '天喜',
  天德贵人: '天德貴人',
  月德贵人: '月德貴人',
  天医: '天医',
  六秀: '六秀',
  十灵: '十霊',
  日德: '日德',
  日贵: '日貴',
  进神贵: '進神貴',
  词馆: '詞館',
  天赦贵: '天赦貴',
  羊刃: '羊刃',
  飞刃: '飛刃',
  劫煞: '劫煞',
  亡神: '亡神',
  灾煞: '災煞',
  血刃: '血刃',
  大耗: '大耗',
  五鬼: '五鬼',
  白虎: '白虎',
  天狗: '天狗',
  丧门: '喪門',
  病符: '病符',
  阴差: '陰差',
  阳错: '陽錯',
  红艳: '紅艶',
  流霞: '流霞',
  驿马: '駅馬',
  桃花: '桃花',
  华盖: '華蓋',
  孤辰: '孤辰',
  寡宿: '寡宿',
  红鸾: '紅鸞',
  魁罡: '魁罡',
}

const SOLAR_TERM_JA: Record<string, string> = {
  立春: '立春',
  雨水: '雨水',
  驚蛰: '啓蟄',
  惊蛰: '啓蟄',
  春分: '春分',
  清明: '清明',
  谷雨: '穀雨',
  立夏: '立夏',
  小满: '小満',
  芒种: '芒種',
  夏至: '夏至',
  小暑: '小暑',
  大暑: '大暑',
  立秋: '立秋',
  处暑: '処暑',
  白露: '白露',
  秋分: '秋分',
  寒露: '寒露',
  霜降: '霜降',
  立冬: '立冬',
  小雪: '小雪',
  大雪: '大雪',
  冬至: '冬至',
  小寒: '小寒',
  大寒: '大寒',
}

const SHENSHA_JA_META: Record<string, string> = {
  天乙貴人: '最大の貴人星。困難な局面で支援を得やすく、問題を切り抜けやすくなります。',
  太極貴人: '思索と研究に適した貴人信号。学術・宗教・哲学の理解が深まりやすくなります。',
  文昌: '学習と試験に有利な文星。知性、文章力、専門職での展開を支えます。',
  福星貴人: '福に厚い星。支援や恵まれた環境を得やすくなります。',
  国印貴人: '公的な役割や組織での信頼に結びつく権威信号です。',
  金輿: '移動や接遇が安定し、身分や環境に見合う支援を受けやすくなります。',
  禄神: '衣食の安定と継続収入を示す禄の信号です。',
  天厨貴人: '食禄に恵まれる信号。生活基盤や享受面の安定を示します。',
  学堂: '学業や研修に有利な学習信号。継続学習との相性が良くなります。',
  天官貴人: '昇進や上層からの評価に結びつく官貴人信号です。',
  将星: '統率と管理の信号。責任ある立場を担いやすくなります。',
  金匱: '蓄財と資産管理の信号。お金を残す力を示します。',
  龍德貴人: '年運で作用すると救済と支援が働きやすい星です。',
  天喜: '結婚・出産・慶事など明るい展開を示す喜びの星です。',
  天德貴人: '保護と救済の信号。信頼性や品格を支えます。',
  月德貴人: '穏やかな保護と回復力を示す月令貴人です。',
  天医: '医療・ケア・回復との相性を示す星です。',
  六秀: '才能と洗練された気質を示す信号です。',
  十霊: '感性と直感が鋭い霊性の信号です。',
  日德: '誠実さと徳性による安定を示します。',
  日貴: '品格と尊敬を得やすい貴気の信号です。',
  進神貴: '前進力が強く、段階的な上昇を支える信号です。',
  詞館: '文章・表現・出版・メディアに有利な文才信号です。',
  天赦貴: '誤りや困難が緩和されやすい救済信号です。',
  羊刃: '果断さが強い反面、衝動と急所に注意が必要な刃の信号です。',
  飛刃: '突発的な事故や損失に注意を促す信号です。',
  劫煞: '損失・競争・妨害が起きやすい局面を示します。',
  亡神: '不安や慎重さが高まり、目に見えない損失に注意が必要な星です。',
  災煞: '事故や想定外の負荷に備えるべき信号です。',
  血刃: '身体的負担や手術・怪我の象意に注意を促します。',
  大耗: '大きな支出や資産の流出に注意を促す星です。',
  五鬼: '口論、誤解、人的な摩擦が起きやすい信号です。',
  白虎: '身体的負荷や波乱の象意であり、慎重な行動を促します。',
  天狗: '中傷や背後の問題に注意を促す信号です。',
  喪門: '喪や起居を伴う変化、周囲の健康への配慮を示します。',
  病符: '健康維持と回復管理に注意を促す信号です。',
  陰差: '感情や関係のずれが生じやすい信号です。',
  陽錯: '婚約や親族関係で齟齬が起きやすい信号です。',
  紅艶: '魅力と異性縁が強まる恋愛信号です。',
  流霞: '享楽や飲食での過ぎた行動に注意を促します。',
  駅馬: '移動・出張・転居が増える変動の星です。',
  桃花: '異性縁や魅力、恋愛機会を示す星です。',
  華蓋: '芸術・宗教・学術に向く独立した気質の信号です。',
  孤辰: '独立心や距離感が強く、関係維持に配慮が要る信号です。',
  寡宿: '孤独感や晩年の独立傾向を示し、関係づくりが重要になります。',
  紅鸞: '恋愛・結婚の良い知らせを示す正縁桃花です。',
  魁罡: '決断力と実行力が強い反面、気性の強さに注意が必要な星です。',
}

const SHENSHA_COMBINATION_JA: Record<string, { name: string; note: string }> = {
  天乙文昌同宫: {
    name: '天乙・文昌同宮',
    note: '貴人支援と表現力が同じ柱に集まり、学習や対外的な発信に追い風が出やすくなります。',
  },
  文星成组: {
    name: '文星の成組',
    note: '学習・研究・文書・抽象理解の信号が集中しています。',
  },
  天月德同宫: {
    name: '天徳・月徳同宮',
    note: '保護と回復の力が集中し、調整や支援を得やすくなります。',
  },
  将星华盖: {
    name: '将星・華蓋',
    note: '統率力と独立研究の気質が並存し、専門性の高い領域に向きます。',
  },
}

const WEEKDAY_JA: Record<string, string> = {
  一: '月曜日',
  二: '火曜日',
  三: '水曜日',
  四: '木曜日',
  五: '金曜日',
  六: '土曜日',
  日: '日曜日',
  星期一: '月曜日',
  星期二: '火曜日',
  星期三: '水曜日',
  星期四: '木曜日',
  星期五: '金曜日',
  星期六: '土曜日',
  星期日: '日曜日',
}

const THEME_TITLE_JA: Record<string, string> = {
  恋爱吸引信号: '恋愛魅力信号',
  长期关系稳定信号: '長期関係の安定信号',
  财富承载: '財運のキャパシティ',
  事业结构力: '仕事の構造力',
  学习结构力: '学習の構造力',
}

const PILLAR_JA: Record<string, string> = {
  年柱: '年柱',
  月柱: '節柱',
  日柱: '日柱',
  时柱: '時柱',
}

function tenGodJa(value: string) {
  return TEN_GOD_JA[value] ?? value
}

function convertTenGod(value: string) {
  return value
    .replace(/七杀|偏财|正财|伤官|劫财|正印|偏印/g, match => tenGodJa(match))
    .replace(/格$/, '格')
}

function convertTheme(value: string) {
  return value
    .replace(/七杀|劫财|伤官|偏财|正财|正印|偏印/g, match => tenGodJa(match))
    .replace('官杀元素', '官殺元素')
    .replace('官杀占比', '官殺占比')
    .replace('财元素', '財元素')
    .replace('表达魅力', '表現魅力')
    .replace('表达输出', '表現輸出')
    .replace(/贵人/g, '貴人')
    .replace(/将星/g, '将星')
}

function convertRootStatus(value: string) {
  if (value === '无有效根' || value === '無有効根') return '有効根なし'
  if (value === '余气弱根') return '余気弱根'
  if (value === '有效根') return '有効根'
  return value
}

function flowTenGodRoleJa(value: string) {
  const roles: Record<string, string> = {
    比肩: '自己/同輩',
    劫財: '競争/協力',
    食神: '表現/出力',
    傷官: '革新/突破',
    偏財: '機会/流動財',
    正財: '安定/実行財',
    偏官: '圧力/規則',
    正官: '秩序/責任',
    印綬: '学習/庇護',
    偏印: '研究/直感',
  }
  return roles[value] ?? ''
}

function first<T>(value: T | undefined): T {
  if (value === undefined) throw new TypeError('Shichu Suimei transform received incomplete chart data')
  return value
}

function chineseLunarDayToNumber(value: string) {
  const units: Record<string, number> = {
    初一: 1, 初二: 2, 初三: 3, 初四: 4, 初五: 5, 初六: 6, 初七: 7,
    初八: 8, 初九: 9, 初十: 10, 十一: 11, 十二: 12, 十三: 13, 十四: 14,
    十五: 15, 十六: 16, 十七: 17, 十八: 18, 十九: 19, 二十: 20,
    廿一: 21, 廿二: 22, 廿三: 23, 廿四: 24, 廿五: 25, 廿六: 26,
    廿七: 27, 廿八: 28, 廿九: 29, 三十: 30,
  }
  return units[value] ?? (Number(value.replace(/[^\d]/g, '')) || 0)
}

function chineseLunarMonthToNumber(value: string) {
  const months: Record<string, number> = {
    正: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6,
    七: 7, 八: 8, 九: 9, 十: 10, 冬: 11, 腊: 12,
  }
  return months[value] ?? (Number(value.replace(/[^\d]/g, '')) || 0)
}

export async function calculateShichuSuimeiResult(
  input: BaziChartInput,
  displayLocale: ShichuSuimeiDisplayLocale = 'zh-CN',
): Promise<ShichuSuimeiResult> {
  const source = await calculateBaziChartResult(input)
  const result = JSON.parse(JSON.stringify(source)) as ShichuSuimeiResult
  const ja = displayLocale === 'ja'

  function localized(zhText: string, jaText: string) {
    return ja ? jaText : zhText
  }

  for (const pillar of result.pillars) {
    pillar.label = PILLAR_JA[pillar.label] ?? pillar.label
    pillar.tag = pillar.tag?.replace('月令核心', '節柱核心').replace('日主核心', '日主核心') ?? null
    pillar.shishenGan = tenGodJa(pillar.shishenGan)
    pillar.diShi = DI_SHI_JA[pillar.diShi] ?? pillar.diShi
    pillar.selfSitting = DI_SHI_JA[pillar.selfSitting] ?? pillar.selfSitting
    pillar.nayin = NAYIN_JA[pillar.nayin] ?? pillar.nayin
    for (const hidden of pillar.hiddenStems) {
      hidden.type = hidden.type
        .replace('本气', '本気')
        .replace('中气', '中気')
        .replace('余气', '余気') as typeof hidden.type
      hidden.shishen = tenGodJa(hidden.shishen)
    }
    for (const shensha of pillar.shensha) {
      shensha.name = SHEN_SHA_JA[shensha.name] ?? shensha.name
    }
  }

  if (ja) {
    for (const pillar of result.pillars) {
      for (const shensha of pillar.shensha) {
        shensha.description = SHENSHA_JA_META[shensha.name] ?? '伝統的な神殺の構造信号です。'
      }
    }
  }

  if (ja) {
    const lunarMatch = /^(.+?月)(.+)$/.exec(result.birth.lunarText)
    const lunarMonth = lunarMatch ? chineseLunarMonthToNumber(lunarMatch[1]!.replace(/月$/, '')) : 0
    const lunarDay = lunarMatch ? chineseLunarDayToNumber(lunarMatch[2]!) : 0
    if (lunarMonth && lunarDay) {
      result.birth.lunarText = `旧暦${lunarMonth}月${lunarDay}日`
      result.birth.lunarDetail = `${result.birth.lunarGanzhi}年 ${result.birth.lunarText} ${result.birth.effectiveHour}時`
    }
  }

  result.birth.zodiac = `${first(result.pillars[0]).zhi}年`
  if (ja) {
    result.birth.genderText = result.birth.genderText === '男' ? '男性' : '女性'
  }
  result.birth.season = result.birth.season.replace('春', '春').replace('夏', '夏').replace('秋', '秋').replace('冬', '冬')
  result.birth.weekday = WEEKDAY_JA[result.birth.weekday] ?? result.birth.weekday
  result.birth.lunarDetail = result.birth.lunarDetail.replace('闰', '閏').replace('时', '時')
  result.birth.solarTerm.current = result.birth.solarTerm.current
    ? SOLAR_TERM_JA[result.birth.solarTerm.current] ?? result.birth.solarTerm.current
    : null
  result.birth.solarTerm.previous.name = SOLAR_TERM_JA[result.birth.solarTerm.previous.name] ?? result.birth.solarTerm.previous.name
  result.birth.solarTerm.next.name = SOLAR_TERM_JA[result.birth.solarTerm.next.name] ?? result.birth.solarTerm.next.name
  result.birth.solarTerm.siLing.ganzhi = tenGodJa(result.birth.solarTerm.siLing.ganzhi)
  result.birth.solarTerm.siLing.term = SOLAR_TERM_JA[result.birth.solarTerm.siLing.term] ?? result.birth.solarTerm.siLing.term
  if (ja && !SOLAR_TERM_JA[result.birth.solarTerm.siLing.term]) {
    result.birth.solarTerm.siLing.term = result.birth.solarTerm.siLing.term
      .replace('惊蛰', '啓蟄')
      .replace('驚蛰', '啓蟄')
      .replace('谷雨', '穀雨')
      .replace('小满', '小満')
      .replace('芒种', '芒種')
      .replace('处暑', '処暑')
  }
  result.birth.locationName = localized(result.birth.locationName, result.birth.locationName === '未填写' ? '未入力' : result.birth.locationName)
  result.birth.solarTimeStatusText = localized(
    result.birth.solarTimeStatusText,
    result.birth.solarTimeStatus === 'boundary'
      ? '真太陽時が日柱の境界を跨いだため、換日後の日柱を採用しました。'
      : result.birth.solarTimeStatus === 'corrected'
        ? '出生地の座標から真太陽時を補正しました。時辰は境界を跨いでいません。'
        : result.birth.solarTimeStatus === 'failed'
          ? '出生地の座標を解決できず、選択した時辰の中間時刻で排盤しました。'
          : '出生地が未入力のため、選択した時辰の中間時刻で排盤し、真太陽時補正は行っていません。',
  )

  for (const extra of [result.extras.taiYuan, result.extras.mingGong, result.extras.shenGong]) {
    extra.label = extra.label.replace('命宫', '命宮').replace('身宫', '身宮')
    extra.nayin = NAYIN_JA[extra.nayin] ?? extra.nayin
    extra.shishen = tenGodJa(extra.shishen)
    for (const shensha of extra.shensha) {
      shensha.name = SHEN_SHA_JA[shensha.name] ?? shensha.name
    }
  }

  if (ja) {
    for (const extra of [result.extras.taiYuan, result.extras.mingGong, result.extras.shenGong]) {
      for (const shensha of extra.shensha) {
        shensha.description = SHENSHA_JA_META[shensha.name] ?? '伝統的な神殺の構造信号です。'
      }
    }
  }

  result.energy.strength = result.energy.strength.replace('身强', '身強')
  result.energy.strengthLabel = result.energy.strengthLabel.replace('身强', '身強')
  result.energy.rootStatus = result.energy.rootStatus
    .replace('无有效根', '無有効根')
    .replace('有效根', '有効根')
    .replace('余气弱根', '余気弱根')
    .replace('无有效根', '無有効根')
  if (ja) result.energy.rootStatus = convertRootStatus(result.energy.rootStatus)
  result.energy.monthCommand = result.energy.monthCommand
    .replace('生扶', '生扶')
    .replace('受控', '受控')
    .replace('泄令', '洩令')
  result.energy.monthCommandDetail = result.energy.monthCommandDetail.replace('泄', '洩')
  result.energy.adjustment = result.energy.adjustment.replace('泄', '洩')
  if (ja) {
    result.energy.strengthLabel = result.energy.strength === '身強' ? '支持比は十分' : '支持比はやや弱い'
    result.energy.monthCommand = result.energy.monthCommand
      .replace('得令 · 生扶', '得令・生扶')
      .replace('失令 · 受控', '失令・制御')
    result.energy.monthCommandDetail = `${result.birth.solarTerm.siLing.term}後 ${result.birth.solarTerm.siLing.daysAfterTerm}日、司令 ${result.birth.solarTerm.siLing.ganzhi}`
    result.energy.adjustment = result.energy.strength === '身強'
      ? '洩・耗・制を優先し、過旺な日主の負担を下げます。'
      : '印と比による支えを優先し、支えが整ってから財や官を展開します。'
  }
  for (const item of result.energy.tenGods) {
    item.name = tenGodJa(item.name)
    item.role = item.role.replace('劫财', '劫財').replace('伤官', '傷官').replace('偏财', '偏財')
      .replace('正财', '正財').replace('七杀', '偏官').replace('正印', '印綬')
  }
  if (ja) {
    const roles: Record<string, string> = {
      '自我/同辈': '自己/同輩',
      '竞争/协作': '競争/協力',
      '表达/输出': '表現/出力',
      '创新/突破': '革新/突破',
      '机会/流动财': '機会/流動財',
      '稳定/执行财': '安定/実行財',
      '压力/规则': '圧力/規則',
      '秩序/责任': '秩序/責任',
      '学习/庇护': '学習/庇護',
      '研究/直觉': '研究/直感',
    }
    for (const item of result.energy.tenGods) {
      item.role = roles[item.role] ?? item.role
    }
  }
  for (const item of result.energy.wuxing) {
    item.role = item.role.replace('官杀', '官殺').replace('食伤', '食傷').replace('财星', '財星')
    item.stateLabel = item.stateLabel
    item.direction = item.direction.replace('东方', '東方').replace('南方', '南方')
      .replace('西方', '西方').replace('北方', '北方')
    item.organs = item.organs.replace('、', '・')
    item.evidence = item.evidence
  }
  if (ja) {
    for (const item of result.energy.wuxing) {
      item.role = item.role.replace('官殺', '官殺').replace('食傷', '食傷').replace('財星', '財星')
      item.direction = item.direction
        .replace('东方', '東方')
        .replace('南方', '南方')
        .replace('西方', '西方')
        .replace('北方', '北方')
      item.organs = item.organs
        .replace('肝・胆', '肝・胆')
        .replace('心・小肠', '心・小腸')
        .replace('脾・胃', '脾・胃')
        .replace('肺・大肠', '肺・大腸')
        .replace('肾・膀胱', '腎・膀胱')
      item.evidence = `天干/地支 ${item.visibleCount}か所、蔵干信号 ${item.hiddenCount}か所`
    }
  }
  result.structure.dayStrength = result.energy.strength
  result.structure.rootStatus = result.energy.rootStatus
  result.structure.forceDistribution = result.structure.forceDistribution

  result.pattern.name = `${tenGodJa(result.pattern.name.replace(/格$/, ''))}格`
  result.pattern.status = convertTenGod(result.pattern.status)
  result.pattern.rootStatus = convertRootStatus(result.pattern.rootStatus)
  result.pattern.monthMainQi = result.pattern.monthMainQi
    .split('·')
    .map(part => tenGodJa(part))
    .join('·')
  result.pattern.transparency = result.pattern.transparency.replace('透出', '透出').replace('未透干', '未透干')
  result.pattern.evidence = result.pattern.evidence
    .map(convertTenGod)
    .map(item => item.replace('透明检查', '透明チェック').replace(/无有效根|有效根|余气弱根/g, convertRootStatus))
  if (ja) {
    result.pattern.transparency = result.pattern.transparency.replace('未透干', '未透干')
    result.pattern.evidence = result.pattern.evidence.map(item => item
      .replace('月令主气', '節柱本気')
      .replace('司令依据', '司令の根拠')
      .replace(/后\s*(\d+)\s*天，取/, '後 $1日、取')
      .replace(/后\s*(\d+)\s*日，取/, '後 $1日、取')
      .replace(/透出 (\d+) 处/, '$1か所透出')
      .replace('支持比：', '支持比：')
      .replace('根气：', '根気：'))
  }
  result.structure.pattern = result.pattern.status
  result.structure.patternEvidence = result.structure.patternEvidence
    .replace('取格线索', '取格手掛かり')
    .replace(/七杀|劫财|伤官|偏财|正财|正印|偏印/g, match => tenGodJa(match))
  result.structure.evidence = result.pattern.evidence

  for (const relation of result.relations) {
    relation.type = relation.type.replace('冲', '沖')
    relation.impact = relation.impact.replace('冲击', '沖撃')
    relation.positions = relation.positions.map(position => PILLAR_JA[position] ?? position)
  }
  if (ja) {
    const impacts: Record<string, string> = {
      '主变动、沖撃、位置被推动': '変動や沖撃が起きやすく、立場や環境が押し動かされます。',
      '主牵绊、合作、能量合化': '結びつきや協力が生まれ、エネルギーが合化しやすくなります。',
      '主协同、成局、力量汇聚': '協同して局を作り、力が一方向に集中しやすくなります。',
      '主方向性集团力量': '方向性を持った集団力が形成されやすくなります。',
      '主内耗、规则压力、隐性摩擦': '内面の消耗や規則からの圧力、見えない摩擦が生じやすくなります。',
      '主松动、破局、原有连接变弱': '構造が緩み、従来の結びつきが弱まりやすくなります。',
      '主暗耗、不顺、细节牵制': '目に見えない消耗や不調、細部の制約が生じやすくなります。',
      '主资源、立场或表达被合绊': '資源・立場・表現が合によって束縛されやすくなります。',
      '主外部规则与自我行动直接碰撞': '外部の規則と自己行動が直接ぶつかりやすくなります。',
      '主局部联动、趋势待引动': '部分的な連動が生まれ、引き金を待つ傾向になります。',
      '主隐性资源与暗中联系': '見えない資源や暗中のつながりを示します。',
    }
    const intensityJa: Record<string, string> = {
      轻微: '軽微',
      中等: '中程度',
      强烈: '強い',
    }
    for (const relation of result.relations) {
      relation.type = relation.type
        .replace('天干相冲', '天干相沖')
        .replace('相冲', '相沖')
        .replace('藏干', '蔵干')
      relation.impact = impacts[relation.impact] ?? relation.impact
      relation.intensity = (intensityJa[relation.intensity] ?? relation.intensity) as typeof relation.intensity
      relation.status = '有効'
    }
  }

  for (const item of result.shensha) {
    item.name = SHEN_SHA_JA[item.name] ?? item.name
    item.positions = item.positions.map(position => PILLAR_JA[position] ?? position)
  }
  if (ja) {
    for (const item of result.shensha) {
      item.description = SHENSHA_JA_META[item.name] ?? '伝統的な神殺の構造信号です。'
    }
  }
  for (const item of result.shenshaCombinations) {
    item.positions = item.positions.map(position => PILLAR_JA[position] ?? position)
  }
  if (ja) {
    for (const item of result.shenshaCombinations) {
      const meta = SHENSHA_COMBINATION_JA[item.name]
      if (meta) {
        item.name = meta.name
        item.note = meta.note
      }
    }
  }

  result.dayunMeta.direction = result.dayunMeta.direction.replace('顺行', '順行')
  result.dayunMeta.startText = result.dayunMeta.startText
    .replace(/(\d+)年(\d+)个月(\d+)天/, '$1年$2か月$3日')
  for (const dayun of result.dayuns) {
    dayun.ganzhi = dayun.ganzhi
    dayun.shishenGan = tenGodJa(dayun.shishenGan)
    dayun.shishenZhi = tenGodJa(dayun.shishenZhi)
    for (const shensha of dayun.shensha) {
      shensha.name = SHEN_SHA_JA[shensha.name] ?? shensha.name
      if (ja) shensha.description = SHENSHA_JA_META[shensha.name] ?? '伝統的な神殺の構造信号です。'
    }
    for (const year of dayun.liunian) {
      year.shishenGan = tenGodJa(year.shishenGan)
      year.shishenZhi = tenGodJa(year.shishenZhi)
      year.intensity = year.intensity
        .replace('平稳', '安定')
        .replace('中等波动', '中程度変動')
        .replace('高波动', '高変動') as typeof year.intensity
      year.summary = convertTenGod(year.summary)
      year.energyShifts = year.energyShifts.map(convertTenGod)
      if (ja) {
        year.summary = year.summary
          .replace('结构引动较少，按原有节奏推进。', '構造の引動は少なく、これまでのリズムを維持する時期です。')
          .replace('合绊或局部联动增强，安排前先确认资源与边界。', '合や部分的な連動が強まるため、実行前に資源と境界を確認してください。')
          .replace('冲刑或多方引动增强，重大决定先拆分验证。', '沖・刑や多方向の引動が強まるため、重大な決定は分割して検証してください。')
        year.energyShifts = [
          `${year.shishenGan}顕現 · ${flowTenGodRoleJa(year.shishenGan)}`,
          ...year.energyShifts.slice(1).map(item => item
            .replace('流年支', '年運地支の')
            .replace('气势被引动', '気が引動')),
        ]
      }
      for (const signal of year.signals) {
        signal.type = signal.type.replace('冲', '沖')
        signal.impact = signal.impact.replace('冲击', '沖撃')
        signal.positions = signal.positions.map(position => PILLAR_JA[position] ?? position)
      }
      for (const shensha of year.shensha) {
        shensha.name = SHEN_SHA_JA[shensha.name] ?? shensha.name
        if (ja) shensha.description = SHENSHA_JA_META[shensha.name] ?? '伝統的な神殺の構造信号です。'
      }
    }
  }

  for (const theme of result.natalThemes) {
    theme.title = THEME_TITLE_JA[theme.title] ?? theme.title
    theme.status = theme.status
      .replace('需补强', '要補強')
      .replace('需取舍', '要取捨')
      .replace('有优势', '優位') as typeof theme.status
    theme.evidenceLevel = theme.evidenceLevel.replace('稳定', '安定') as typeof theme.evidenceLevel
    theme.tags = theme.tags.map(convertTheme)
  }
  if (ja) {
    const themeTagJa: Record<string, string> = {
      桃花: '桃花',
      表达魅力: '表現魅力',
      关系星显度: '関係星の顕在度',
      配偶星忌神: '配偶星が忌神',
      配偶星清晰度: '配偶星の明確さ',
      财元素忌神: '財元素が忌神',
      财星占比: '財星の割合',
      食伤生财: '食傷生財',
      财元素强度: '財元素の強度',
      官杀占比: '官殺の割合',
      官杀元素忌神: '官殺元素が忌神',
      印星承接: '印星の受容',
      印元素忌神: '印元素が忌神',
      印星占比: '印星の割合',
      印元素强度: '印元素の強度',
      表达输出: '表現出力',
      文昌贵人: '文昌貴人',
    }
    for (const theme of result.natalThemes) {
      theme.tags = theme.tags.map(tag => themeTagJa[tag] ?? convertTheme(tag))
      theme.title = theme.title.replace('長期関係の安定信号', '長期関係の安定信号')
    }
  }

  result.methodology.school = '日本四柱推命（子平構造：節柱を基準に扶抑・格局・調候を併用）'
  result.methodology.calendar = '太陽暦（公暦）'
  result.methodology.trueSolarTime = result.methodology.trueSolarTime
    .replace('已启用', '有効')
    .replace('未启用', '無効')
  result.methodology.dayBoundary = '23:00 換日'
  result.methodology.monthRule = '二十四節気の節入時刻で判定し、旧暦月によらない'
  result.methodology.scorePolicy = '強弱・用神・信号は決定論的ヒューリスティックであり、特定事象の予測ではない'

  result.display = {
    system: '四柱推命（日本）',
    region: 'jp',
    pillars: ['年柱', '節柱', '日柱', '時柱'],
    concepts: ['通変星', '蔵干', '十二運', '空亡', '大運', '年運'],
    engineStrategy: 'OpenFate 的节气/真太阳时结果与 Soul Atelier 的命盘结构先交叉校验，再做四柱推命术语映射。',
    sources: [
      '@openfate/bazi-engine 1.1.2',
      '@soul-atelier/bazi 0.9.0',
    ],
  }

  return result
}
