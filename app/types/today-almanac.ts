export interface TodayAlmanacHour {
  ganZhi: string
  zhi: string
  startTime: string
  endTime: string
  tianShen: string
  luck: '吉' | '凶' | '平'
  type: '黄道' | '黑道'
  chongDesc: string
  chongShengXiao: string
  sha: string
  yi: string[]
  ji: string[]
}

export interface TodayAlmanacColorSet {
  wuxing: string
  colors: string[]
  reason: string
}

export interface TodayAlmanac {
  date: string
  isToday: boolean
  timezone: 'Asia/Shanghai'
  weekday: number
  lunar: {
    yearInChinese: string
    monthInChinese: string
    dayInChinese: string
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    yearNaYin: string
    monthNaYin: string
    dayNaYin: string
    shengXiao: string
  }
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: '吉' | '凶' | '平'
  tianShenType: '黄道' | '黑道'
  jianChu: string
  pengZuGan: string
  pengZuZhi: string
  chongDesc: string
  chongShengXiao: string
  sha: string
  xunKong: string
  nineStar: string
  positions: {
    taiSui: string
    taiSuiDay: string
    tai: string
    xi: string
    yangGui: string
    yinGui: string
    cai: string
    fu: string
  }
  xiu: {
    name: string
    luck: string
    song: string
    zheng: string
    animal: string
    gong: string
    shou: string
  }
  season: {
    jieQi: string
    nextJieQi: { name: string; date: string }
    hou: string
    wuHou: string
    yueXiang: string
  }
  festivals: string[]
  hours: TodayAlmanacHour[]
  colors: {
    dayWuxing: string
    daJi: TodayAlmanacColorSet
    ciJi: TodayAlmanacColorSet
    buYi: TodayAlmanacColorSet
  }
}

export interface TodayAlmanacResponse {
  today: TodayAlmanac
}
