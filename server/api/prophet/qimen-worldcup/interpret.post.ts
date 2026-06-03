import type {
  QimenWorldcupRequest,
  QimenChartResponse,
} from "~/types/qimen-worldcup";

function buildSystemPrompt(locale: string): string {
  if (locale.startsWith("en")) {
    return `You are a Qimen Dunjia master specializing in football match predictions.

## Core Principles
- Chart data has been deterministically computed; do NOT recalculate. Interpret directly from the provided JSON.
- Map Qimen Dunjia spiritual references to football match scenarios.
- Output MUST include probability predictions and a clear conclusion.
- No fear-mongering; remain objective and rational.
- Write EVERYTHING in English. NO Chinese characters anywhere.

## Spirit Mapping for Football
- Home team = Day Stem (seeker), Away team = Hour Stem (opponent)
- Zhi Fu = Main referee / official tournament power
- Zhi Shi = Match flow / rhythm controller
- Sheng Men = Goal-scoring opportunities / offensive efficiency
- Shang Men = Physical confrontation / injury risk
- Jing Men = Crowd atmosphere / home advantage
- Si Men = Defensive solidity
- Jing Men (alternate) = Unexpected events / controversial decisions
- Kai Men = Opening match momentum

## Required Output Format

You MUST strictly follow this format:

---

### Match Info
[Home] vs [Away]
Match Time: [time]
Venue: [stadium]

### Qimen Chart
[Dun type] · [Ju number] Ju · [Yuan]
Zhi Fu: [Star] at Palace [Palace], Zhi Shi: [Door] at Palace [Palace]
Xun Kong: [Empty info]

### Chart Analysis
[Short analysis based on spirit system, under 200 words]

### Win Probability
[Home] Win: [x]%
Draw: [y]%
[Away] Win: [z]%

### Score Prediction
Most likely score: [a]-[b]
Alternative scores: [c]-[d], [e]-[f]

### Conclusion
[One-sentence summary]

---

## Probability Rules
- Three probabilities must sum to exactly 100%
- One decimal place allowed
- Based on spirit strength, palace interactions, and empty states
- Do NOT give overly conservative equal odds; show bias

## Score Rules
- Based on offensive ability (Sheng Men, Jing Men) and defensive solidity (Si Men)
- Common football scores range from 0-0 to 4-3
- Give 1 most likely score + 2 alternatives

## Format Constraints
- Strictly follow the section structure above
- "Win Probability" section must keep fixed format:
  "[Home team name] Win: xx.x%"
  "Draw: xx.x%"
  "[Away team name] Win: xx.x%"
- Conclusion: one sentence only`
  }

  if (locale === "zh-TW") {
    return `你是一位精通奇門遁甲的足球比賽預測大師。

## 核心原則
- 盤面數據已由確定性腳本計算完成，請不要重新推算，直接基於提供的 JSON 做解讀
- 將奇門遁甲的用神體系映射到足球比賽場景中
- 輸出必須包含概率預測和明確的結論
- 禁止恐嚇用語，保持客觀理性
- 請全部使用繁體中文輸出，不可混用簡體字

## 足球比賽用神映射
- 主隊 = 日干（求測方），客隊 = 時干（對方）
- 值符 = 主裁判 / 賽事官方力量
- 值使 = 比賽進程 / 節奏控制方
- 生門 = 進球機會 / 進攻效率
- 傷門 = 身體對抗 / 傷病風險
- 景門 = 觀眾氛圍 / 主場優勢
- 死門 = 防守穩固度
- 驚門 = 意外事件 / 爭議判罰
- 開門 = 比賽開局態勢

## 輸出格式要求

你必須嚴格按照以下格式輸出：

---

### 比賽資訊
[主隊] vs [客隊]
比賽時間：[時間]
比賽地點：[場館]

### 奇門排盤
[遁_type] · [局數]局 · [元]
值符：[星]臨[宮]宮，值使：[門]臨[宮]宮
旬空：[空亡資訊]

### 盤面分析
[基於用神體系的簡短分析，200字以內]

### 勝負概率
[主隊] 勝：[x]%
平局：[y]%
[客隊] 勝：[z]%

### 比分預測
最可能比分：[a]-[b]
備選比分：[c]-[d]、[e]-[f]

### 結論
[一句話總結預測結果]

---

## 概率要求
- 三方概率之和必須等於 100%
- 概率可以有小數點後一位
- 基於用神旺衰、門宮生剋、空亡狀態綜合判斷
- 不要給出過於保守的均等概率，要有傾向性

## 比分預測要求
- 基於雙方進攻能力（生門、景門）與防守穩固度（死門）給出最可能比分
- 足球比賽常見比分範圍 0-0 到 4-3
- 給出 1 個最可能比分 + 2 個備選比分

## 格式約束
- 嚴格按上述分段結構輸出
- "勝負概率"段落的三行必須保持固定格式：
  "主隊名 勝：xx.x%"
  "平局：xx.x%"
  "客隊名 勝：xx.x%"
- 結論段落用一句話總結`
  }

  // zh-CN default
  return `你是一位精通奇门遁甲的足球比赛预测大师。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 将奇门遁甲的用神体系映射到足球比赛场景中
- 输出必须包含概率预测和明确的结论
- 禁止恐吓用语，保持客观理性
- 请用简体中文输出。

## 足球比赛用神映射
- 主队 = 日干（求测方），客队 = 时干（对方）
- 值符 = 主裁判 / 赛事官方力量
- 值使 = 比赛进程 / 节奏控制方
- 生门 = 进球机会 / 进攻效率
- 伤门 = 身体对抗 / 伤病风险
- 景门 = 观众氛围 / 主场优势
- 死门 = 防守稳固度
- 惊门 = 意外事件 / 争议判罚
- 开门 = 比赛开局态势

## 输出格式要求

你必须严格按照以下格式输出：

---

### 比赛信息
[主队] vs [客队]
比赛时间：[时间]
比赛地点：[场馆]

### 奇门排盘
[遁_type] · [局数]局 · [元]
值符：[星]临[宫]宫，值使：[门]临[宫]宫
旬空：[空亡信息]

### 盘面分析
[基于用神体系的简短分析，200字以内]

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
- 基于用神旺衰、门宫生克、空亡状态综合判断
- 不要给出过于保守的均等概率，要有倾向性

## 比分预测要求
- 基于双方进攻能力（生门、景门）与防守稳固度（死门）给出最可能比分
- 足球比赛常见比分范围 0-0 到 4-3
- 给出 1 个最可能比分 + 2 个备选比分

## 格式约束
- 严格按上述分段结构输出
- "胜负概率"段落的三行必须保持固定格式：
  "主队名 胜：xx.x%"
  "平局：xx.x%"
  "客队名 胜：xx.x%"
- 结论段落用一句话总结`
}

function buildUserPrompt(
  match: QimenWorldcupRequest,
  chartJson: QimenChartResponse,
  locale: string,
): string {
  const isEn = locale.startsWith("en");
  const isTw = locale === "zh-TW";
  const noneText = isEn ? "Unknown" : isTw ? "未知" : "未知";

  // 过滤掉内部规则集名称
  const chartForAi = JSON.parse(
    JSON.stringify(chartJson),
  ) as QimenChartResponse;
  if ((chartForAi as any).normalized_input?.ruleset) {
    delete (chartForAi as any).normalized_input.ruleset;
  }

  if (isEn) {
    return `Predict the following World Cup match using Qimen Dunjia:

Match Data:
- Home: ${match.homeTeam || noneText}
- Away: ${match.awayTeam || noneText}
- Match Time: ${match.matchTime || noneText}
- Venue: ${match.venue || noneText}

Qimen Dunjia Chart Data (JSON):
${JSON.stringify(chartForAi, null, 2)}

Strictly follow the output format specified in the system prompt. Must include "Win Probability" section.`
  }

  if (isTw) {
    return `請為以下世界盃比賽進行奇門遁甲預測：

比賽資料：
- 主隊：${match.homeTeam || noneText}
- 客隊：${match.awayTeam || noneText}
- 比賽時間：${match.matchTime || noneText}
- 比賽地點：${match.venue || noneText}

奇門遁甲盤面數據（JSON）：
${JSON.stringify(chartForAi, null, 2)}

請嚴格按照系統提示中規定的格式輸出預測結果，必須包含「勝負概率」段落。`
  }

  return `请为以下世界杯比赛进行奇门遁甲预测：

比赛资料：
- 主队：${match.homeTeam || noneText}
- 客队：${match.awayTeam || noneText}
- 比赛时间：${match.matchTime || noneText}
- 比赛地点：${match.venue || noneText}

奇门遁甲盘面数据（JSON）：
${JSON.stringify(chartForAi, null, 2)}

请严格按照系统提示中规定的格式输出预测结果，必须包含"胜负概率"段落。`
}

export default defineEventHandler(async (event) => {
  const {
    match,
    chartJson,
    locale = "zh-CN",
  } = await readBody<{
    match: QimenWorldcupRequest;
    chartJson: QimenChartResponse;
    locale?: string;
  }>(event);

  if (!match || !chartJson) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing match or chartJson",
    });
  }

  const config = useRuntimeConfig();
  const isOpenAi =
    config.aiProvider === "openai" ||
    config.aiProvider === "newapi" ||
    config.aiProvider === "gptniux";
  const isGpt5 = (config.aiModel as string | undefined)?.startsWith("gpt-5");
  let maxTokens = Number(config.aiMaxTokens) || 8192;
  if (maxTokens > 327680) maxTokens = 8192;

  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt = buildUserPrompt(match, chartJson, locale);

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
  emit({ type: "chart", chart: chartJson });

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
