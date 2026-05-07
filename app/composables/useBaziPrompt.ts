import type { BaziChart } from '~/types/bazi'
import type { UserProfile } from '~/types/user'

export function useBaziPrompt() {
  function build(
    chart: BaziChart,
    profile: UserProfile,
    analysisSummary: string,
  ): { systemPrompt: string; userPrompt: string } {

    const systemPrompt = `你是一个 JSON 生成器。你的唯一任务是把八字分析结果转换成严格有效的 JSON。

绝对规则：
- 只输出 JSON，不要任何解释、前言、后缀、markdown 格式
- 必须包含以下所有字段，不能省略
- 数字用纯数字，不要用引号包裹
- 字符串内容里不要出现双引号，如果必须出现请用中文引号代替
- JSON 必须合法，可以被 JSON.parse 直接解析`

    const currentDaYunStr = chart.currentDaYun
      ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
      : '尚未起运'

    const dayunList = chart.dayuns.map(d => ({
      index: d.index,
      ganZhi: `${d.gan}${d.zhi}`,
      ageRange: `${d.ageRange[0]}-${d.ageRange[1]}`,
    }))

    // 精简大运列表，去掉冗余 JSON 格式
    const dayunCompact = chart.dayuns.map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`).join(', ')

    // analysisSummary 可能很长，截断到 600 字以内
    const truncatedSummary = analysisSummary.length > 600
      ? analysisSummary.slice(0, 600) + '...'
      : analysisSummary

    const userPrompt = `八字命盘：年${chart.year.gan}${chart.year.zhi} 月${chart.month.gan}${chart.month.zhi} 日${chart.day.gan}${chart.day.zhi} 时${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知'}
日主${chart.riZhu}（${chart.riZhuStrength}）| 格局${chart.geju} | 喜用${chart.xiyong} | 忌${chart.jishen}
五行：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
当前大运：${currentDaYunStr}
大运：${dayunCompact}

参考分析：${truncatedSummary}

请输出严格 JSON，不要任何其他文字：
{
  "overview": "30字内人生总论",
  "personality": {"summary":"...","detail":"...","tags":["","","",""]},
  "career": {"summary":"...","detail":"...","tags":["","",""],"wealthTrend":"..."},
  "relationship": {"summary":"...","detail":"...","tags":["","",""],"timing":"..."},
  "health": {"summary":"...","detail":"...","tags":["","",""],"seasons":"..."},
  "dimensionScores": {"感情运":70,"事业运":70,"财运":70,"健康运":70,"学业运":70},
  "dayunScores": [
    {"index":1,"ganZhi":"丁卯","ageRange":"5-14","score":65,"open":58,"close":72,"high":78,"low":52,"fortune":"平","analysis":"简要分析"}
  ],
  "historicalPredictions": [{"age":25,"year":2015,"description":"应有转变"}],
  "comprehensiveAdvice": ["","","",""]
}

要求：
1. dayunScores 必须包含全部 ${dayunList.length} 步大运
2. 每步大运含 score（综合分）和 open/close/high/low（0-100 蜡烛图四值），满足 low≤min(open,close)≤max(open,close)≤high
3. historicalPredictions 3-5 条，comprehensiveAdvice 3～5 条
4. 语气积极温暖`

    return { systemPrompt, userPrompt }
  }

  return { build }
}
