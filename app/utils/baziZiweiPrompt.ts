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
分别用一句话概括八字主轴与紫微主轴。

## 主轴印证结论
判断两条主轴是 🟢 同向印证 / 🟡 互补侧重 / 🔴 方向矛盾，并给出分析。

## 阶段印证时间轴
把八字大运与紫微大限按年龄段对照，标注关键上升期、调整期、压力期，并列出关键转折年。

## 六维度交叉对账
按事业、财运、婚恋、子女、六亲、健康六个维度，分别引用八字观点、紫微观点、融合结论，并用 🟢 同向 / ⚠ 部分冲突 / 🔴 矛盾 标注。

## 冲突清单
若两盘存在矛盾信号，列出冲突点、八字视角、紫微视角、影响程度（低/中/高）与建议。无明显冲突则写"无明显冲突"。

## 综合定论
给出一句话人生主轴、5 个关键节点（虚岁+公历+事件）、3 个高风险窗口、2 条优势放大策略、3–5 条针对性建议。

## 置信度自评
分别给出八字模型、紫微模型、两盘一致性、关键结论稳定性的置信度（高/中/低）并简要说明。

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
