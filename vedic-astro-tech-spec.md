# luckbuff · 吠陀占星工具页 · 技术实施规格

> 版本 v0.3 · 基于 PRD v0.1 · 约束：Nuxt 4 / 项目现有 AI 服务 / Python 精算微服务

---

## 目录

1. [项目约束与边界](#1-项目约束与边界)
2. [整体架构](#2-整体架构)
3. [Python 星盘计算微服务](#3-python-星盘计算微服务)
4. [Nuxt Server API 层](#4-nuxt-server-api-层)
5. [页面与组件](#5-页面与组件)
6. [状态管理与数据流](#6-状态管理与数据流)
7. [Prompt 设计](#7-prompt-设计)
8. [关键注意事项](#8-关键注意事项)

---

## 1. 项目约束与边界

### 1.1 确认的技术栈

| 项目 | 选型 |
|------|------|
| 前端框架 | Nuxt 4（`app/` 目录结构） |
| 包管理 | pnpm |
| AI 服务 | 项目现有封装，直接复用 |
| 星盘计算 | Python 微服务（`pyswisseph` + `flatlib`），独立进程运行在 VPS |
| 服务间通信 | Nuxt server API → HTTP → Python FastAPI |
| 路由形式 | 单页面，`step` 状态控制表单 → 加载 → 结果 |

### 1.2 不做的事

- 不引入数据库，出生信息不落库（session 级别）
- 不实现用户系统（M4 阶段再考虑）
- 不新增第三方付费 API（城市时区解析用免费方案）
- 不重复实现 AI 调用封装，复用项目现有服务
- 部署流程沿用项目现有更新部署脚本，不另行处理

---

## 2. 整体架构

```
浏览器
  │  用户填表 → POST /api/vedic/analyze（SSE）
  ▼
Nuxt Server（Node.js）
  ├─ 1. 城市解析     →  Nominatim API（外部）
  ├─ 2. 星盘计算     →  POST http://localhost:8765/chart（Python 微服务）
  ├─ 3. Prompt 拼装  →  prompts.ts
  └─ 4. AI 分析      →  项目现有 AI 服务（流式）
                               │
                         SSE stream
                               │
                          浏览器渲染
```

两个独立进程跑在同一台 VPS：

- **Nuxt**：PM2 管理，端口 `3000`（现有）
- **Python 微服务**：PM2 管理，端口 `8765`，仅监听 `localhost`，不对外暴露

---

## 3. Python 星盘计算微服务

### 3.1 为什么单独起服务

`pyswisseph` 是 Swiss Ephemeris 的官方 Python 绑定，精度是业内天文计算的基准标准（误差 < 1 arcsecond）。它依赖 C 扩展，无法在 Node.js 里直接调用，也不存在功能对等的纯 JS 实现。单独起一个 FastAPI 服务是最干净的隔离方式，不污染 Nuxt 项目依赖，也方便后续独立升级。

### 3.2 目录结构

```
vedic-service/                   # 独立目录，与 luckbuff 项目并列
├── main.py                      # FastAPI 入口
├── ephemeris.py                 # 星盘计算核心
├── requirements.txt
└── ecosystem.vedic.config.cjs   # PM2 配置（或合并到主项目 ecosystem.config.cjs）
```

### 3.3 依赖

```
# requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
pyswisseph==2.10.3.2
python-dateutil==2.9.0
timezonefinder==6.5.2
```

> `timezonefinder` 离线根据经纬度查时区，无需外部 API，包体约 20MB。时区计算放在 Python 侧一并处理，Nuxt 侧只传经纬度。

### 3.4 `ephemeris.py`

```python
import swisseph as swe
from datetime import datetime
from dataclasses import dataclass
from typing import Optional

# Swiss Ephemeris 星历文件路径（首次运行自动下载）
swe.set_ephe_path('/opt/ephe')

SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

# Vimshottari Dasha
DASHA_LORD_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
DASHA_YEARS      = [7,      20,      6,     10,     7,      18,     16,       19,       17]

PLANET_MAP = {
    'Sun':     swe.SUN,
    'Moon':    swe.MOON,
    'Mars':    swe.MARS,
    'Mercury': swe.MERCURY,
    'Jupiter': swe.JUPITER,
    'Venus':   swe.VENUS,
    'Saturn':  swe.SATURN,
    'Rahu':    swe.TRUE_NODE,  # 北交点
}


def get_nakshatra(lon: float) -> tuple[str, int]:
    span = 360 / 27
    idx = int(lon / span) % 27
    pada = int((lon % span) / (span / 4)) + 1
    return NAKSHATRAS[idx], pada


def lon_to_sign(lon: float) -> tuple[int, str, float]:
    sign = int(lon / 30) + 1
    degree = lon % 30
    return sign, SIGN_NAMES[sign - 1], round(degree, 4)


def calculate_chart(
    year: int, month: int, day: int,
    hour: int, minute: int,
    lat: float, lng: float,
    utc_offset: float,
    time_uncertain: bool = False
) -> dict:
    # Julian Day（UT）
    ut_hour = hour - utc_offset + minute / 60
    jd = swe.julday(year, month, day, ut_hour)

    # Lahiri Ayanamsha
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsha = swe.get_ayanamsa(jd)

    # 上升（sidereal，Whole Sign）
    cusps, ascmc = swe.houses_ex(jd, lat, lng, b'W', swe.FLG_SIDEREAL)
    asc_lon = ascmc[0]
    asc_sign, asc_sign_name, asc_degree = lon_to_sign(asc_lon)
    asc_nak, asc_pada = get_nakshatra(asc_lon)
    house_start = asc_sign  # Whole Sign：上升所在星座 = 第 1 宫

    planets = []
    moon_lon = None

    for name, planet_id in PLANET_MAP.items():
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
        result, _ = swe.calc_ut(jd, planet_id, flags)
        lon = result[0]
        speed = result[3]
        is_retro = speed < 0

        sign, sign_name, degree = lon_to_sign(lon)
        nak, pada = get_nakshatra(lon)
        house = ((sign - house_start) % 12) + 1

        if name == 'Moon':
            moon_lon = lon

        planets.append({
            'graha': name,
            'longitude': round(lon, 4),
            'sign': sign,
            'signName': sign_name,
            'degree': degree,
            'house': house,
            'isRetrograde': is_retro,
            'nakshatra': nak,
            'nakshatraPada': pada,
        })

    # Ketu = Rahu + 180°
    rahu = next(p for p in planets if p['graha'] == 'Rahu')
    ketu_lon = (rahu['longitude'] + 180) % 360
    k_sign, k_sign_name, k_degree = lon_to_sign(ketu_lon)
    k_nak, k_pada = get_nakshatra(ketu_lon)
    planets.append({
        'graha': 'Ketu',
        'longitude': round(ketu_lon, 4),
        'sign': k_sign,
        'signName': k_sign_name,
        'degree': k_degree,
        'house': ((k_sign - house_start) % 12) + 1,
        'isRetrograde': True,
        'nakshatra': k_nak,
        'nakshatraPada': k_pada,
    })

    dasha = _calculate_dasha(moon_lon, year, month, day)
    validations = _run_validations(planets, rahu)

    return {
        'ascendant': {
            'longitude': round(asc_lon, 4),
            'sign': asc_sign,
            'signName': asc_sign_name,
            'degree': asc_degree,
            'nakshatra': asc_nak,
            'nakshatraPada': asc_pada,
        },
        'planets': planets,
        'houseStartSign': house_start,
        'dasha': dasha,
        'ayanamsha': round(ayanamsha, 4),
        'julianDay': round(jd, 6),
        'timeUncertain': time_uncertain,
        'validations': validations,
        'birthData': {
            'year': year, 'month': month, 'day': day,
            'hour': hour, 'minute': minute,
            'lat': lat, 'lng': lng, 'utcOffset': utc_offset,
        }
    }


def _calculate_dasha(moon_lon: float, year: int, month: int, day: int) -> list[dict]:
    from dateutil.relativedelta import relativedelta

    span = 360 / 27
    nak_idx = int(moon_lon / span) % 27
    start_idx = nak_idx % 9
    progress = (moon_lon % span) / span
    first_years = DASHA_YEARS[start_idx] * (1 - progress)

    birth = datetime(year, month, day)
    periods = []
    current = birth
    now = datetime.now()

    for i in range(9):
        idx = (start_idx + i) % 9
        yrs = first_years if i == 0 else DASHA_YEARS[idx]
        full_yrs = int(yrs)
        extra_days = round((yrs - full_yrs) * 365.25)
        end = current + relativedelta(years=full_yrs, days=extra_days)

        periods.append({
            'graha': DASHA_LORD_ORDER[idx],
            'startDate': current.strftime('%Y-%m-%d'),
            'endDate': end.strftime('%Y-%m-%d'),
            'years': round(yrs, 2),
            'isCurrent': current <= now < end,
        })
        current = end

    return periods


def _run_validations(planets: list[dict], rahu: dict) -> list[dict]:
    """核心数学校验（精简版）"""
    results = []

    # 校验：Rahu-Ketu 对冲误差应 < 0.5°
    ketu = next(p for p in planets if p['graha'] == 'Ketu')
    diff = abs(rahu['longitude'] - ketu['longitude'])
    diff = min(diff, 360 - diff)
    results.append({
        'rule': 'Rahu-Ketu opposition',
        'pass': abs(diff - 180) < 0.5,
        'detail': f'差值 {diff:.2f}°（应为 180°）'
    })

    # 校验：Rahu 逆行
    results.append({
        'rule': 'Rahu retrograde',
        'pass': rahu['isRetrograde'],
        'detail': 'Rahu 应始终逆行'
    })

    return results
```

### 3.5 `main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from ephemeris import calculate_chart
from timezonefinder import TimezoneFinder
from zoneinfo import ZoneInfo
from datetime import datetime

app = FastAPI(title="Vedic Chart Service", version="1.0.0")
tf = TimezoneFinder()


class ChartRequest(BaseModel):
    year: int
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    time_uncertain: bool = False


@app.post("/chart")
def get_chart(req: ChartRequest):
    tz_name = tf.timezone_at(lat=req.lat, lng=req.lng)
    if not tz_name:
        raise HTTPException(status_code=422, detail="Cannot determine timezone")

    tz = ZoneInfo(tz_name)
    local_dt = datetime(req.year, req.month, req.day, req.hour, req.minute, tzinfo=tz)
    utc_offset = local_dt.utcoffset().total_seconds() / 3600

    try:
        return calculate_chart(
            year=req.year, month=req.month, day=req.day,
            hour=req.hour, minute=req.minute,
            lat=req.lat, lng=req.lng,
            utc_offset=utc_offset,
            time_uncertain=req.time_uncertain,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def warmup():
    """预热：避免第一次请求时星历文件冷读取超时"""
    import swisseph as swe
    swe.calc_ut(swe.julday(2000, 1, 1, 12), swe.SUN, swe.FLG_SIDEREAL)


@app.get("/health")
def health():
    return {"status": "ok"}
```

### 3.6 PM2 管理

追加到现有 `ecosystem.config.cjs`：

```js
// 追加到 apps 数组
{
  name: 'vedic-service',
  script: 'uvicorn',
  args: 'main:app --host 127.0.0.1 --port 8765 --workers 2',
  cwd: '/opt/vedic-service',           // 根据实际路径调整
  interpreter: '/opt/vedic-service/.venv/bin/python',
}
```

首次初始化：

```bash
cd /opt/vedic-service
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
mkdir -p /opt/ephe
# 触发星历文件下载（首次约需 30 秒）
.venv/bin/python -c "import swisseph as swe; swe.set_ephe_path('/opt/ephe'); swe.calc_ut(swe.julday(2000,1,1,12), swe.SUN, swe.FLG_SIDEREAL)"
pm2 start ecosystem.config.cjs --only vedic-service
```

---

## 4. Nuxt Server API 层

### 4.1 文件结构

```
server/
└── api/
    └── vedic/
        ├── analyze.post.ts      # 主入口：接收表单 → 调用 Python 服务 → 流式返回分析
        ├── chart.post.ts        # （调试用）直接透传 Python 服务的星盘计算结果
        └── _utils/
            ├── geo.ts           # 城市名 → 经纬度（Nominatim）
            └── prompts.ts       # 各维度 Prompt 模板
```

### 4.2 `server/api/vedic/_utils/geo.ts`

```typescript
export interface GeoResult {
  lat: number
  lng: number
  cityName: string
}

export async function resolveGeo(cityQuery: string): Promise<GeoResult | null> {
  const results = await $fetch<any[]>(
    'https://nominatim.openstreetmap.org/search',
    {
      params: { q: cityQuery, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'luckbuff/1.0' },  // Nominatim 要求 User-Agent
    }
  )

  if (!results?.[0]) return null

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    cityName: results[0].display_name,
  }
}
```

> 时区计算移到 Python 侧（`timezonefinder`），Nuxt 侧只负责把经纬度传过去。

### 4.3 `server/api/vedic/analyze.post.ts`

```typescript
import { resolveGeo } from './_utils/geo'
import { buildPrompt } from './_utils/prompts'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { birthDate, birthTime, city, gender, dimensions, timeUncertain } = body

  if (!birthDate || !birthTime || !city) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  // 1. 城市解析
  const geo = await resolveGeo(city)
  if (!geo) {
    throw createError({ statusCode: 422, message: `无法解析城市：${city}` })
  }

  // 2. 调用 Python 微服务计算星盘
  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  let chart: any
  try {
    chart = await $fetch(`${VEDIC_SERVICE_URL}/chart`, {
      method: 'POST',
      body: { year, month, day, hour, minute, lat: geo.lat, lng: geo.lng, time_uncertain: timeUncertain ?? false },
      timeout: 10000,
    })
  } catch {
    throw createError({ statusCode: 503, message: '星盘计算服务暂时不可用，请稍后重试' })
  }

  // 3. 校验失败只记日志，不中断请求
  const failed = chart.validations?.filter((v: any) => !v.pass) ?? []
  if (failed.length) console.warn('[vedic] validation warnings:', failed)

  // 4. 构造 Prompt
  const prompt = buildPrompt({
    chart,
    cityName: geo.cityName,
    dimensions: dimensions ?? ['core', 'career', 'love', 'annual'],
    gender: gender ?? '',
    timeUncertain: timeUncertain ?? false,
  })

  // 5. SSE Headers（X-Accel-Buffering 禁止 Nginx 缓冲）
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const writer = getResponseWriter(event)

  // 6. 优先 emit 星盘数据，前端立即渲染 ChartSummary
  await writer.write(`data: ${JSON.stringify({ type: 'chart', chart })}\n\n`)

  // 7. 调用项目现有 AI 服务（流式）
  const { streamChat } = useAIService()  // 替换为项目实际封装
  const stream = await streamChat(prompt, VEDIC_SYSTEM_PROMPT)

  for await (const chunk of stream) {
    await writer.write(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`)
  }

  await writer.write('data: [DONE]\n\n')
  await writer.close()
})

const VEDIC_SYSTEM_PROMPT = `你是一位专业的吠陀占星分析师，精通 Jyotish 传统体系。
分析时严格遵守以下原则：
1. 所有结论必须同时列出支持信号和制约信号（正反双审）
2. 使用「倾向、可能、适合、需要注意」等表达，禁止绝对化断言
3. 出生时间精度不足时，主动降低 D9/D10 等高敏感分盘的结论强度，并标注「时间精度不足，仅供参考」
4. 语言贴近现实生活，不玄学化，不吓人
5. 用中文回答`
```

### 4.4 `server/api/vedic/chart.post.ts`（调试用）

```typescript
import { resolveGeo } from './_utils/geo'

const VEDIC_SERVICE_URL = process.env.VEDIC_SERVICE_URL ?? 'http://127.0.0.1:8765'

export default defineEventHandler(async (event) => {
  const { birthDate, birthTime, city, timeUncertain } = await readBody(event)
  const geo = await resolveGeo(city)
  if (!geo) throw createError({ statusCode: 422, message: 'City not found' })

  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  return $fetch(`${VEDIC_SERVICE_URL}/chart`, {
    method: 'POST',
    body: { year, month, day, hour, minute, lat: geo.lat, lng: geo.lng, time_uncertain: timeUncertain ?? false },
  })
})
```

---

## 5. 页面与组件

### 5.1 完整文件结构

```
app/
├── pages/
│   └── tools/
│       └── vedic-astro.vue
├── components/
│   └── vedic/
│       ├── StepForm.vue          # Step 1：出生信息表单
│       ├── StepLoading.vue       # Step 2：计算中动画
│       ├── StepResult.vue        # Step 3：报告展示
│       ├── ChartSummary.vue      # 星盘数据摘要卡片
│       ├── AnalysisSection.vue   # 单个分析章节（可折叠）
│       └── DimSelector.vue       # 分析维度选择器（卡片式 checkbox）
└── composables/
    └── useVedicAnalysis.ts       # 核心状态 + SSE 流处理
```

### 5.2 `app/pages/tools/vedic-astro.vue`

```vue
<script setup lang="ts">
import { useVedicAnalysis } from '~/composables/useVedicAnalysis'

const { step, formData, chartData, analysisText, startAnalysis, reset } = useVedicAnalysis()

useSeoMeta({
  title: '吠陀占星分析 · luckbuff',
  description: '基于完整出生信息的吠陀占星（Vedic Astrology / Jyotish）深度分析，涵盖性格、事业、感情与年度运势',
  keywords: '吠陀占星,印度占星,Vedic Astrology,Jyotish,星盘分析',
})
</script>

<template>
  <div class="vedic-page">
    <Transition name="step" mode="out-in">
      <VedicStepForm
        v-if="step === 'form'"
        v-model="formData"
        @submit="startAnalysis"
      />
      <VedicStepLoading v-else-if="step === 'loading'" />
      <VedicStepResult
        v-else-if="step === 'result'"
        :chart="chartData"
        :analysis="analysisText"
        @restart="reset"
      />
    </Transition>
  </div>
</template>
```

### 5.3 `app/composables/useVedicAnalysis.ts`

```typescript
export type Step = 'form' | 'loading' | 'result'

export interface VedicFormData {
  birthDate: string
  birthTime: string
  city: string
  gender: 'male' | 'female' | ''
  dimensions: string[]
  timeUncertain: boolean
}

export function useVedicAnalysis() {
  const step = ref<Step>('form')
  const chartData = ref<any>(null)
  const analysisText = ref('')
  const errorMsg = ref('')

  const formData = ref<VedicFormData>({
    birthDate: '',
    birthTime: '',
    city: '',
    gender: '',
    dimensions: ['core', 'career', 'love', 'annual'],
    timeUncertain: false,
  })

  async function startAnalysis() {
    step.value = 'loading'
    analysisText.value = ''
    chartData.value = null
    errorMsg.value = ''

    try {
      const response = await fetch('/api/vedic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message ?? '分析请求失败')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break

          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'chart') {
              chartData.value = evt.chart
              step.value = 'result'   // 收到星盘数据后立即切到结果页
            }
            if (evt.type === 'text') {
              analysisText.value += evt.text
            }
          } catch {}
        }
      }
    } catch (err: any) {
      errorMsg.value = err.message ?? '未知错误'
      step.value = 'form'
    }
  }

  function reset() {
    step.value = 'form'
    analysisText.value = ''
    chartData.value = null
    errorMsg.value = ''
  }

  return { step, formData, chartData, analysisText, errorMsg, startAnalysis, reset }
}
```

### 5.4 `app/components/vedic/StepResult.vue`

```vue
<script setup lang="ts">
import { marked } from 'marked'  // pnpm add marked

const props = defineProps<{ chart: any; analysis: string }>()
const emit = defineEmits(['restart'])

const sections = computed(() => {
  if (!props.analysis) return []
  return props.analysis
    .split(/(?=^## )/m)
    .filter(Boolean)
    .map(part => ({
      title: part.match(/^## (.+)/)?.[1] ?? '分析',
      html: marked.parse(part) as string,
    }))
})

const openSections = ref(new Set([0]))
const toggle = (i: number) => {
  openSections.value.has(i) ? openSections.value.delete(i) : openSections.value.add(i)
}
</script>

<template>
  <div class="result-page">
    <div v-if="chart?.timeUncertain" class="precision-banner">
      ⚠️ 出生时间存在不确定性，D9 / D10 等高精度分盘的结论强度已降级，请谨慎参考
    </div>

    <VedicChartSummary :chart="chart" />

    <div class="sections">
      <VedicAnalysisSection
        v-for="(s, i) in sections"
        :key="i"
        :title="s.title"
        :html="s.html"
        :open="openSections.has(i)"
        @toggle="toggle(i)"
      />
    </div>

    <!-- 流式输出中尚未形成完整章节时的 fallback -->
    <div v-if="!sections.length && analysis" class="streaming-raw">
      {{ analysis }}
    </div>

    <footer class="disclaimer">
      本工具内容仅供学习、娱乐与自我观察，不构成医学、法律、心理咨询或投资建议。
    </footer>

    <button class="restart-btn" @click="emit('restart')">重新分析</button>
  </div>
</template>
```

---

## 6. 状态管理与数据流

```
用户填表（formData）
  │
  ▼ POST /api/vedic/analyze
  │
Nuxt Server
  ├─ resolveGeo(city) ──────────────────► Nominatim API
  │       │ {lat, lng}
  │       ▼
  ├─ $fetch(VEDIC_SERVICE_URL/chart) ──► Python FastAPI（127.0.0.1:8765）
  │       │                                  └─ pyswisseph 精算 + 时区解析
  │       │ ChartData JSON
  │       ▼
  ├─ buildPrompt(chart, dims)
  │       │
  │       ▼
  └─ streamChat(prompt) ───────────────► 项目现有 AI 服务
          │
          │ SSE stream
          ├─ { type: 'chart', chart }    ← 优先发，前端立即渲染摘要
          ├─ { type: 'text', text: '…' } ← 逐 chunk 追加
          └─ [DONE]

前端（useVedicAnalysis）
  ├─ 收到 chart event → chartData.value = chart，step = 'result'
  └─ 收到 text event  → analysisText.value += text（computed sections 自动更新）
```

**Step 切换时序**

```
点击分析  →  step: loading
收到 chart event  →  step: result（ChartSummary 立即出现，AI 文本开始流式追加）
收到 [DONE]       →  流结束，用户自行浏览
错误（任意环节）   →  step: form（toast 提示，表单数据保留）
```

---

## 7. Prompt 设计

### 7.1 `server/api/vedic/_utils/prompts.ts`

```typescript
interface PromptOptions {
  chart: any
  cityName: string
  dimensions: string[]
  gender: string
  timeUncertain: boolean
}

export function buildPrompt(opts: PromptOptions): string {
  const { chart, cityName, dimensions, timeUncertain } = opts

  const precisionNote = timeUncertain
    ? `\n⚠️ 用户标注出生时间不确定，涉及 D9（Navamsha）、D10（Dasamsha）的结论请标注「时间精度不足，仅供参考」，并降低确定性表述。\n`
    : ''

  const dimSections = dimensions.map(d => DIM_PROMPTS[d] ?? '').filter(Boolean).join('\n\n')

  return `${CHART_CONTEXT_PROMPT}

${formatChart(chart, cityName)}
${precisionNote}

请按以下维度进行分析：

${dimSections}

---
输出格式要求：
- 每个维度以 ## 标题开头（如 ## 性格结构）
- 每条核心结论后附：**支持信号**：… | **制约信号**：…
- 使用「倾向、可能、适合、需要注意」等表达，禁止绝对化断言
- 中文输出，语言贴近真实生活，不玄学化`
}

function formatChart(chart: any, cityName: string): string {
  const { ascendant, planets, dasha, birthData, ayanamsha } = chart

  const pList = planets.map((p: any) =>
    `${p.graha}: ${p.signName} ${p.degree.toFixed(1)}° / 第 ${p.house} 宫 / ${p.nakshatra} pada ${p.nakshatraPada}${p.isRetrograde ? ' ℞' : ''}`
  ).join('\n')

  const currentDasha = dasha.find((d: any) => d.isCurrent)
  const dashaList = dasha.slice(0, 6).map((d: any) =>
    `${d.graha} 大运 ${d.startDate} → ${d.endDate}${d.isCurrent ? '（当前）' : ''}`
  ).join('\n')

  const b = birthData
  return `## 星盘数据

出生：${b.year}-${b.month}-${b.day} ${b.hour}:${String(b.minute).padStart(2, '0')}，${cityName}（${b.lat.toFixed(2)}N, ${b.lng.toFixed(2)}E, UTC${b.utcOffset >= 0 ? '+' : ''}${b.utcOffset}）
Ayanamsha（Lahiri）：${ayanamsha}°　宫位制：Whole Sign

上升 / Lagna：${ascendant.signName} ${ascendant.degree.toFixed(1)}°（${ascendant.nakshatra} pada ${ascendant.nakshatraPada}）

行星位置：
${pList}

当前大运：${currentDasha ? `${currentDasha.graha}（${currentDasha.startDate} → ${currentDasha.endDate}）` : '未知'}
大运列表（Vimshottari Dasha）：
${dashaList}`
}

const CHART_CONTEXT_PROMPT = `以下吠陀占星数据使用 Swiss Ephemeris 精算，Lahiri Ayanamsha，Whole Sign 宫位制，符合 Jyotish 主流标准。`

const DIM_PROMPTS: Record<string, string> = {
  core: `## 性格结构

分析重点：
1. 上升星座（Lagna）对外在气质、行事风格的影响
2. 月亮星座对情绪底色、内心安全感的影响
3. 太阳星座对自我认同与核心驱动力的影响
4. 主要行星合相 / 互容关系揭示的核心人生主题
5. 整体性格优势，以及容易重复的行为模式

每条结论附支持信号和制约信号。`,

  career: `## 事业与财富

分析重点：
1. 适合的职业方向与工作环境（第 10 宫、10 宫主星、木星、土星位置）
2. 财富增长模式（第 2 宫、第 11 宫、金星）
3. 最适合的变现方式：打工 / 创业 / 自由职业 / 内容变现 / 咨询等
4. 当前大运对事业节奏的影响
5. 未来 1 年、3 年的主要机会窗口与需要警惕的风险

每条结论附支持信号和制约信号。`,

  love: `## 感情与关系

使用婚姻三阶段模型（第 7 宫关系确立 / 第 9 宫承诺与法律 / 第 11 宫社会公开）：
1. 在亲密关系中的核心需求（第 7 宫、金星）
2. 容易被什么气质 / 类型吸引，以及背后的原因
3. 关系中容易出现的模式与难点
4. 当前大运对感情状态的影响
5. 未来 1 年、3 年的关系动向

语气温和，不制造焦虑，不做绝对化预言。`,

  annual: `## 年度运势（未来 12 个月）

基于当前 Vimshottari Dasha，按时间阶段分析：
- 事业机会与节奏建议
- 财富趋势与注意事项
- 感情动向
- 情绪与身体需要关注的方面
- 每个阶段最适合采取的行动

最后输出「未来 12 个月行动建议清单」（5 条以内，要求可执行、落地）。`,
}
```

---

## 8. 关键注意事项

### P0：M1 开工前必须确认

**SSE 流式响应**：`analyze.post.ts` 的 response header 里加 `X-Accel-Buffering: no`，同时确认现有 Nginx 配置有 `proxy_buffering off` 和足够长的 `proxy_read_timeout`（建议 ≥ 300s）。两处任意一个漏掉，SSE 都会退化成加载完才显示。

**Python 服务健康检查**：`$fetch` 调用 Python 服务做了 10s timeout + try/catch，失败时向用户返回友好提示，不把 Python 原始错误透传前端。上线前用 `curl http://127.0.0.1:8765/health` 确认服务正常。

**Swiss Ephemeris 星历文件**：`pyswisseph` 首次调用会从网络下载 `.se1` 星历文件到 `/opt/ephe`（约 30MB），必须在 `pm2 start` 之前手动触发下载并确认成功，否则生产环境第一次请求会因下载超时而失败。

**环境变量**：`VEDIC_SERVICE_URL=http://127.0.0.1:8765` 加到 PM2 `luckbuff` app 的 `env` 块，不要 hardcode 在代码里。

### P1：M1 后优化

**Nominatim 速率限制**：1 req/s，热门城市结果可以缓存到 Nuxt server 内的 `Map`（TTL 24h），避免重复请求被限流。

**AI 输出格式 fallback**：Prompt 要求以 `## 标题` 分章节，但 AI 偶尔不遵守。`sections` computed 要处理没有任何 `##` 的情况，fallback 整体显示，不能出现空白页。

**Python 服务 `--workers 2`**：两个 worker 够应对并发，每次计算 CPU 占用约 50ms，内存约 30MB/worker。如果并发量大再加。

### P2：M2/M3

**城市自动补全**：`StepForm.vue` 的城市字段加 debounce + Nominatim 搜索建议下拉，减少用户填错城市名导致解析失败的情况。

**Token 成本**：完整 4 维度分析约 800-1200 input + 3000-6000 output token，`buildPrompt` 按用户实际勾选的维度过滤，不选感情就不发感情 Prompt，减少不必要消耗。

**精度降级 UI**：`timeUncertain: true` 时，`precision-banner` 最好具体说明哪些章节受影响，而不是笼统提示。

---

## 附：M1 MVP 最小可跑清单

```
□ /opt/vedic-service 目录创建，venv + requirements.txt 安装完成
□ /opt/ephe 创建，Swiss Ephemeris 星历文件手动触发下载并确认
□ ephemeris.py：本地测试，北京 1990-01-01 12:00 输出正确（上升、月亮位置合理）
□ main.py：POST /chart 跑通，/health 返回 ok
□ PM2 启动 vedic-service，curl http://127.0.0.1:8765/health 确认
□ server/api/vedic/_utils/geo.ts：resolveGeo('北京') 返回正确经纬度
□ server/api/vedic/chart.post.ts：Nuxt → Python 全链路联调
□ server/api/vedic/analyze.post.ts：SSE 流式响应跑通（先用 mock AI 输出测试）
□ app/composables/useVedicAnalysis.ts：SSE 读取 + chart/text event 分发正常
□ app/pages/tools/vedic-astro.vue：三步切换（form → loading → result）
□ app/components/vedic/StepForm.vue：5 个字段 + 表单校验
□ app/components/vedic/StepResult.vue：sections 渲染 + 流式追加 + fallback
□ 确认 Nginx proxy_buffering off + proxy_read_timeout ≥ 300s
□ curl 直测 /api/vedic/analyze，确认 SSE 流式输出正常
```
