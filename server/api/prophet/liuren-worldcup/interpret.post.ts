import type {
  LiurenWorldcupRequest,
  LiurenChartData,
} from "~/types/liuren-worldcup";

function buildSystemPrompt(locale: string): string {
  const langNote = locale.startsWith("en")
    ? "Please output in natural English."
    : locale === "zh-TW"
      ? "請用繁體中文輸出。"
      : "请用简体中文输出。";

  return `你是一位精通大六壬的足球比赛预测大师。

## 核心原则
- 根据提供的比赛时间、占时、年命等信息起大六壬课
- 用大六壬四课三传体系断足球比赛胜负
- 输出必须包含概率预测和明确的结论
- 禁止恐吓用语，保持客观理性
- ${langNote}

## 大六壬足球比赛用神映射
- 日干 = 主队（求测方所倾向的一方，通常为主队）
- 日支 = 比赛场地 / 客观环境
- 时支 = 客队（对方）
- 日辰上神 = 主队状态
- 时辰上神 = 客队状态
- 初传 = 比赛开局态势
- 中传 = 比赛中盘走势
- 末传 = 比赛最终结果
- 青龙 = 进攻能力 / 进球机会
- 白虎 = 身体对抗 / 防守强度
- 朱雀 = 争议判罚 / 舆论因素
- 玄武 = 暗中变数 / 意外因素
- 贵人 = 关键球员 / 教练决策
- 腾蛇 = 比赛波动 / 心态变化

## 胜负判断规则
1. 比较日干（主队）与时报（客队）的旺衰状态
2. 看日辰上神与时辰上神的生克关系
3. 分析三传对日辰和时辰的影响
4. 结合天将（青龙、白虎等）的吉凶属性
5. 考虑年命（占者出生年支）与日辰的关系

## 输出格式要求

你必须严格按照以下格式输出：

---

### 比赛信息
[主队] vs [客队]
比赛时间：[时间]
占者年命：[年支]

### 大六壬课图
月将[月将]加[占时]时

四课：
第一课（干上神）：[天干]上[神]
第二课（干阴）：[天干]阴[神]
第三课（支上神）：[地支]上[神]
第四课（支阴）：[地支]阴[神]

三传：
初传：[初传干支] [天将]
中传：[中传干支] [天将]
末传：[末传干支] [天将]

### 盘面分析
[基于四课三传的简短分析，200字以内]

### 胜负概率
[主队] 胜：[x]%
平局：[y]%
[客队] 胜：[z]%

### 比分预测
最可能比分：[a]-[b]
备选比分：[c]-[d]、[e]-[f]

### 结论
[一句话总结预测结果]

---

## 概率要求
- 三方概率之和必须等于 100%
- 概率可以有小数点后一位
- 基于四课三传、用神旺衰、天将吉凶综合判断
- 不要给出过于保守的均等概率，要有倾向性

## 比分预测要求
- 基于双方进攻能力（生门、景门）与防守稳固度（死门）给出最可能比分
- 足球比赛常见比分范围 0-0 到 4-3
- 给出 1 个最可能比分 + 2 个备选比分

## 格式约束
- 严格按上述分段结构输出
- "胜负概率"段落的三行必须各占一行，保持固定格式：
  - 第一行："主队名 胜：xx.x%"（例如：巴西 胜：65.3%）
  - 第二行："平局：xx.x%"
  - 第三行："客队名 胜：xx.x%"（例如：摩洛哥 胜：5.3%）
- 三个概率数字之和必须严格等于 100%
- 结论段落用一句话总结
`;
}

function buildUserPrompt(
  match: LiurenWorldcupRequest,
  chart: LiurenChartData,
  locale: string,
): string {
  const isEn = locale.startsWith("en");
  const noneText = isEn ? "Unknown" : "未知";

  return `请为以下世界杯比赛进行大六壬预测：

## 比赛信息
- 主队：${match.homeTeam || noneText}
- 客队：${match.awayTeam || noneText}
- 比赛时间：${match.matchTime || noneText}
- 比赛地点：${match.venue || noneText}
- 占者出生年份：${match.birthYear || noneText}
- 占者年命（年支）：${chart.calendar.birthYearBranch || noneText}

## 基础时间数据
- 阳历：${chart.calendar.solar}
- 农历：${chart.calendar.lunar}
- 年柱：${chart.calendar.ganzhi.year}
- 月柱：${chart.calendar.ganzhi.month}
- 日柱：${chart.calendar.ganzhi.day}
- 时柱：${chart.calendar.ganzhi.hour}
- 月将：${chart.calendar.yuejiang}
- 占时：${chart.calendar.shichen}

请严格按照系统提示中规定的格式输出预测结果，必须包含"大六壬课图"和"胜负概率"段落。`;
}

export default defineEventHandler(async (event) => {
  const {
    match,
    chart,
    locale = "zh-CN",
  } = await readBody<{
    match: LiurenWorldcupRequest;
    chart: LiurenChartData;
    locale?: string;
  }>(event);

  if (!match || !chart) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing match or chart",
    });
  }

  const config = useRuntimeConfig();
  const isOpenAi =
    config.aiProvider === "openai" ||
    config.aiProvider === "newapi" ||
    config.aiProvider === "gptniux";
  let maxTokens = Number(config.aiMaxTokens) || 8192;
  if (maxTokens > 327680) maxTokens = 8192;

  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt = buildUserPrompt(match, chart, locale);

  const upstreamBody = isOpenAi
    ? {
        model: config.aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        max_tokens: maxTokens,
      }
    : {
        model: config.aiModel,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: true,
        options: { num_predict: maxTokens },
      };

  setResponseHeaders(event, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  event._handled = true;
  event.node.res.statusCode = 200;
  const res = event.node.res;
  res.socket?.setNoDelay?.(true);

  const emit = (payload: Record<string, unknown>) => {
    const chunk = `data: ${JSON.stringify(payload)}\n\n`;
    const ok = res.write(chunk);
    if (!ok) res.socket?.setNoDelay?.(true);
    if ("flush" in res && typeof (res as any).flush === "function") {
      (res as any).flush();
    }
  };

  // 先发送 chart 数据
  emit({ type: "chart", chart });

  let upstream: Response;
  try {
    upstream = await fetch(config.aiBaseUrl as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (e: any) {
    emit({ type: "error", message: `AI 服务连接失败：${e?.message ?? e}` });
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    emit({
      type: "error",
      message: `AI 服务错误 (${upstream.status})${text ? ": " + text.slice(0, 300) : ""}`,
    });
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        if (payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          const token = isOpenAi
            ? parsed.choices?.[0]?.delta?.content
            : (parsed.response ?? parsed.choices?.[0]?.delta?.content);
          if (token) emit({ type: "text", text: token });
        } catch {
          // non-JSON chunk: ignore
        }
      }
    }
  } catch (e: any) {
    emit({ type: "error", message: `读取 AI 流时出错：${e?.message ?? e}` });
  } finally {
    res.write("data: [DONE]\n\n");
    res.end();
  }
});
