import type { BaziChart } from '~/types/bazi'
import type { ZwdsChart } from '~/types/zwds'
import type { UserProfile } from '~/types/user'

const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

function getZodiacForYear(year: number): string {
  const zhi = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未']
  return zhi[year % 12] ?? ''
}

export function buildBaziZiweiSystemPrompt(locale: string): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!

  return `你是一位同时精通子平派八字与紫微斗数的资深国学术数分析师。你的任务不是重新独立排盘，而是把八字与紫微两套体系的结论放在一起做**综合印证**。
${langHook.system}

核心原则：
- 定位「概率性人生参考工具」，不做命运预言
- 不使用绝对化表达（不用"一定""必然""肯定会"）
- 不制造负面情绪，"大凶""破败""克妻"等词汇转化为中性描述
- 将传统命理语言翻译为现代人可理解的生活场景语言
- 提示风险时同步给出应对方向
- 冲突要明说，禁止"两盘殊途同归"等含糊话术
- 不引入命盘外变量（风水、姓名、阳宅等）

输出格式要求：
- 使用 Markdown 格式
- 用 ## 标题分段，必须按以下顺序包含所有章节
- 每个章节下用正文叙述，可用 **加粗** 突出重点，可用 - 列表分点
- 不要输出任何 JSON、代码块或其他格式

必须包含的章节（顺序固定）：
## 两盘主轴速览
必须严格使用以下四个加粗小标题分四段，顺序不可变：
**八字主轴**
一句话概括八字体系的核心结论（格局、旺衰、喜用、主调）。
**三大优势**
用 - 列表给出恰好 3 条优势，每条一行：「- 短语标题：一句具体说明」。
**紫微主轴**
一句话概括紫微体系的核心结论（命宫主星、身宫、关键四化、主调）。
**三大隐忧**
用 - 列表给出恰好 3 条隐忧，每条一行：「- 短语标题：一句具体说明」。

## 主轴印证结论
判断两条主轴是 🟢 同向印证 / 🟡 互补侧重 / 🔴 方向矛盾，并给出分析。

## 阶段印证时间轴
把八字大运与紫微大限按年龄段对照，标注关键上升期、调整期、压力期，并列出关键转折年。

## 六维度交叉对账
必须严格按以下四个加粗小标题分四段，顺序不可变，每段固定 6 行，维度顺序固定为：事业、财运、婚恋、子女、六亲、健康：
**八字视角**
- 事业：（一句八字依据）
- 财运：（一句八字依据）
- 婚恋：（一句八字依据）
- 子女：（一句八字依据）
- 六亲：（一句八字依据）
- 健康：（一句八字依据）
**紫微视角**
- 事业：（一句紫微依据）
- 财运：（一句紫微依据）
- 婚恋：（一句紫微依据）
- 子女：（一句紫微依据）
- 六亲：（一句紫微依据）
- 健康：（一句紫微依据）
**印证标记**
- 事业：同向
- 财运：同向
- 婚恋：部分冲突
- 子女：同向
- 六亲：同向
- 健康：同向
（每行只能是「同向」「部分冲突」「矛盾」三者之一）
**融合结论**
- 事业：（一句融合结论）
- 财运：（一句融合结论）
- 婚恋：（一句融合结论）
- 子女：（一句融合结论）
- 六亲：（一句融合结论）
- 健康：（一句融合结论）

## 冲突清单
若两盘存在矛盾信号，列出冲突点、八字视角、紫微视角、影响程度（低/中/高）与建议。无明显冲突则写"无明显冲突"。

## 综合定论
必须严格按以下五个加粗小标题分五段，顺序不可变：
**终极主轴**
一句加粗的人生主轴判词（15-30 字），后接一句支撑说明。
**5个关键节点**
用 - 列表给出恰好 5 条，每条一行：「- 虚岁年龄（公历年份）：事件描述」。
**3个高风险窗口**
用 - 列表给出恰好 3 条，每条一行：「- 年份区间（虚岁区间）：风险描述与应对」。
**2条优势放大策略**
用 - 列表给出恰好 2 条，每条一行：「- 策略标题：一句具体做法」。
**行动建议清单**
用 - 列表给出 3–5 条，每条一行：「- 建议内容」。

## 置信度自评
必须严格使用以下四行列表（顺序不可变），数值为 0–1 两位小数，等级只能为高/中高/中/低：
- 八字模型置信度：中（0.64）
- 紫微模型置信度：中高（0.70）
- 两盘印证一致性：中高（0.72）
- 关键结论稳定性：中（0.66）
（以上为示例格式，等级与数值按实际评估给出）
四行之后另起一段，用一句话总体说明评估依据。

## 免责声明
末尾必须附带：本分析基于传统八字与紫微斗数理论框架的交叉印证，仅供文化研究与娱乐参考，不构成任何决策依据。命运由个人选择与客观环境共同塑造。`
}

export function buildBaziZiweiUserPrompt(
  baziChart: BaziChart,
  zwdsChart: ZwdsChart,
  profile: UserProfile,
  locale: string,
): string {
  const langHook = LANGUAGE_HOOKS[locale] ?? LANGUAGE_HOOKS['zh-CN']!
  const currentYear = new Date().getFullYear()

  // 八字信息格式化
  const baziCurrentDaYunStr = baziChart.currentDaYun
    ? `${baziChart.currentDaYun.gan}${baziChart.currentDaYun.zhi}（${baziChart.currentDaYun.ageRange[0]}-${baziChart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const baziDayunCompact = baziChart.dayuns
    .map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`)
    .join(', ')

  // 紫微信息格式化
  const zwdsCurrentDaXianStr = zwdsChart.currentDaXian
    ? `第${zwdsChart.currentDaXian.index}大限 ${zwdsChart.currentDaXian.gongName}宫（${zwdsChart.currentDaXian.gongZhi}）${zwdsChart.currentDaXian.ageRange[0]}-${zwdsChart.currentDaXian.ageRange[1]}岁`
    : '尚未起运'

  const zwdsGongList = zwdsChart.gongs.map(g =>
    `${g.name}(${g.zhi})[主:${g.mainStars.join('+') || '空宫'}][辅:${g.auxStars.join('+') || '无'}][四化:${g.siHua.map(s => `${s.star}化${s.type}`).join('+') || '无'}]`,
  ).join('\n')

  const zwdsDaXianList = zwdsChart.daXians.map(d =>
    `${d.index}.${d.gongName}(${d.gongZhi})${d.ageRange[0]}-${d.ageRange[1]}岁[${d.mainStars.join('+') || '借对宫'}]`,
  ).join('\n')

  const zwdsSiHuaList = zwdsChart.gongs
    .flatMap(g => g.siHua.map(s => `${s.star}化${s.type}→${g.name}宫`))
    .join('，') || '无'

  return `请为以下八字命盘与紫微斗数命盘生成综合印证分析报告。

=== 命主基本信息 ===
性别：${profile.gender === 'male' ? '男' : '女'}
阳历生日：${profile.birthDate || '未知'}
出生时辰：${profile.birthHour || '未知'}
当前年份：${currentYear}年（${getZodiacForYear(currentYear)}）

=== 八字命盘 ===
四柱：年${baziChart.year.gan}${baziChart.year.zhi} 月${baziChart.month.gan}${baziChart.month.zhi} 日${baziChart.day.gan}${baziChart.day.zhi} 时${baziChart.hour ? baziChart.hour.gan + baziChart.hour.zhi : '未知'}
日主${baziChart.riZhu}（${baziChart.riZhuStrength}）| 格局${baziChart.geju} | 喜用${baziChart.xiyong} | 忌${baziChart.jishen}
五行：木${baziChart.wuxingScore['木']}% 火${baziChart.wuxingScore['火']}% 土${baziChart.wuxingScore['土']}% 金${baziChart.wuxingScore['金']}% 水${baziChart.wuxingScore['水']}%
当前大运：${baziCurrentDaYunStr}
大运：${baziDayunCompact}

=== 紫微斗数命盘 ===
年柱：${zwdsChart.yearGan}${zwdsChart.yearZhi}
命宫：${zwdsChart.mingGong.zhi}（${zwdsChart.mingGong.mainStars.join('、') || '借对宫'}）
身宫：${zwdsChart.shenGong.zhi}（${zwdsChart.shenGong.mainStars.join('、') || '借对宫'}）
五行局：${zwdsChart.wuxingJu}局
当前大限：${zwdsCurrentDaXianStr}

=== 十二宫星曜分布 ===
${zwdsGongList}

=== 四化飞星 ===
${zwdsSiHuaList}

=== 大限排列 ===
${zwdsDaXianList}

请严格按系统提示词要求的章节顺序输出，每个章节 150–400 字，综合定论中的列表可适当精简。${langHook.user}`
}
