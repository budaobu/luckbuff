# PRD：世界杯六爻预测模块（FIFA 2026 Edition）

> 协议依赖：`liuyao-three-coin-physical-core-SKILL-contract-v2`
> 赛事数据来源：FIFA 2025-12-05 正式抽签 + 2026-03-31 附加赛最终结果
> 小组赛开赛日期：2026-06-11，决赛：2026-07-19，MetLife Stadium
> 赛事数据自动同步：GitHub Actions cron，有效期 2026-06-11 至 2026-07-21，到期自动停止

---

## 1. 产品定位

基于 `liuyao-three-coin-physical-core-SKILL-contract-v2` 物理层协议，结合 2026 世界杯 48 队赛事数据，提供从真实硬币投掷 → 底层引擎排盘 → 赛事胜负解读的完整闭环工具。

核心约束：输入物理层严格执行 **Bottom-Up**（初爻→上爻），展示视图层严格执行 **Top-Down**（上爻→初爻），两层彻底拆分，不得混用。

---

## 2. 核心业务流程

```
赛事选择器（主队=世，客队=应）
  → 摇卦工作台（6次投掷，Bottom-Up 记录 line_values[0..5]）
  → 时空校准（真太阳时 + 子时边界拦截）
  → POST /v1/predict
  → status 强制三路分流
  → Top-Down 卦象渲染 + 胜负解读
```

---

## 3. 功能模块详细说明

### 3.1 赛事选择器（Tournament Picker）

数据源为静态 `teams.json`，二级联动菜单（组别 → 队伍）。用户第一个选定的队伍 ID 绑定 `subject_home`（世爻），第二个绑定 `subject_away`（应爻），UI 需用"世"/"应"浮标明确标示当前绑定状态。

**2026 赛制说明**：48 队 12 小组，每组前 2 名出线 + 全场最佳第三名共 8 支，合计 32 队进入 Round of 32（本届新增阶段）。选择器按赛程阶段切换数据源：小组赛读 `teams.json`（静态），Round of 32 起读 `bracket.json`（动态，自动更新，见 3.6 节）。已结束场次（`winner` 字段非 `null`）在选择器中置灰，不可起卦。

**赛程关键节点**（供 UI 日历组件及 cron 调度参考）：

| 阶段 | 日期 |
|---|---|
| 小组赛 | 2026-06-11 至 2026-06-27 |
| Round of 32 | 2026-06-28 至 2026-07-02 |
| 16强 | 2026-07-03 至 2026-07-06 |
| 8强 | 2026-07-07 至 2026-07-08 |
| 半决赛 | 2026-07-11 至 2026-07-12 |
| 三四名 | 2026-07-18 |
| 决赛 | 2026-07-19 |
| cron 终止 | 2026-07-21（含决赛后数据落盘缓冲） |

### 3.2 摇卦工作台（Divination Workbench）

遵循 SKILL 物理层协议。每次点击"投掷"按钮，系统随机模拟 3 枚硬币（阳/背=3，阴/符=2），三值相加得爻值（6/7/8/9），写入 `line_values` 数组：

```
line_values[0] = 初爻（第1次投掷）
line_values[5] = 上爻（第6次投掷）
```

UI 展示顺序按物理生成顺序自下而上堆叠，视觉上呈现"自下而上生长"效果，与传统起卦体验吻合。

**交互约束**：
- 满 6 次后输入锁定，但**不触发自动提交**，用户需主动点击"起卦"确认，防止误触。
- 动爻（值为 6 或 9）需在工作台实时标记区分，静爻不标记。
- 支持手动修改单次爻值（接受 6/7/8/9 整数），前端仅做范围约束，"能量守恒"校验（每次投掷三枚硬币总和必须 =3）由后端引擎执行。

### 3.3 时空因子模块（Space-Time Core）

系统自动抓取起卦时刻的本地时间，同步请求地理位置权限，转换为 `cast_datetime`（ISO 8601）和 `location` 嵌套对象向后端传递。

**子时边界拦截**（依据 SKILL 合约，时间窗口为 **22:30–01:30**，非此前草案的 23:00–01:00）：

当识别到起卦时间处于 22:30–01:30 区间，且未成功获取精确经纬度时，界面**强制弹出**确认弹窗：

> **时空确证拦截**：当前处于子时交接边界，日干支存在切换风险，请确认起卦地点坐标或输入所在城市，以完成真太阳时绝对校准。

用户未完成确认前，禁止提交排盘请求。真太阳时校准由后端引擎执行（经度修正 + 均时差近似）。

### 3.4 后端引擎接口（FastAPI Adapter）

**架构**：依据 SKILL 推荐，SKILL.md 作为系统提示词挂载，ENGINE_B64_GZ 解压逻辑作为独立 FastAPI 微服务运行。AI（LLM）层仅负责读取结构化排盘 JSON 并输出解读文本，不参与算力执行。

**`POST /v1/predict`**

请求体（严格对齐 SKILL 输入契约）：

```json
{
  "line_values": [7, 8, 6, 9, 7, 8],
  "cast_datetime": "2026-06-15T20:30:00",
  "location": {
    "longitude": 116.4074,
    "latitude": 39.9042,
    "timezone": "Asia/Shanghai"
  },
  "subject_home": "BRA",
  "subject_away": "MAR"
}
```

> `line_values` 为 Bottom-Up 顺序，无需传 `label_order`（引擎默认执行 Bottom-Up 协议）。
> 时间字段使用 SKILL 合约认可的 `cast_datetime`，不使用裸 Unix timestamp。
> `location` 为嵌套对象，不拆平为顶层 `lon`/`lat`。

响应体（关键字段，均来自 SKILL 输出规范）：

```json
{
  "status": "ok | fatal_error | system_pause",
  "error_code": "...",
  "label_order_input": "bottom-up",
  "label_order_source": "default-bottom-up",
  "diagram_top_down": "...",
  "lines_top_down": [],
  "transformed_lines_top_down": [],
  "temporal_context": {
    "月建": "...",
    "日辰": "...",
    "时辰": "...",
    "旬空": "...",
    "六神": [],
    "true_solar_calibration": {}
  },
  "temporal_summary": "...",
  "hexagram": {
    "本卦": "...",
    "变卦": "...",
    "互卦": "...",
    "世爻位": 3,
    "应爻位": 6
  },
  "subject_home": "BRA",
  "subject_away": "MAR",
  "analysis_brief": "..."
}
```

> `analysis_brief`：100 字以内的易理胜负简述，由后端 LLM 读取排盘 JSON 生成，不由前端拼接字符串。

### 3.5 Status 强制三路分流（前端必须实现）

前端收到响应后首先读取 `status` 字段，执行三路强制分流，禁止 fallthrough：

| status | 前端行为 |
|---|---|
| `ok` | 进入卦象渲染与胜负分析流程 |
| `system_pause` | 渲染"时空确证拦截"警告卡片，展示 `error_code` 描述（经纬度缺失/子时边界未校准），引导用户补充坐标后重新提交，**不渲染任何卦象** |
| `fatal_error` | 渲染"物理层熔断"错误卡片，展示具体错误（行数≠6 / 能量守恒失败），提示用户检查投掷记录，**不渲染任何卦象** |

### 3.6 赛事数据自动同步（bracket.json Pipeline）

**数据分层**：

`teams.json` 存放全部 48 队基础信息，全程静态不变，放在 `public/teams.json`。`bracket.json` 存放淘汰赛各轮对阵及晋级结果，随赛程动态更新，同样放在 `public/bracket.json` 作为静态资源直接 serve，**无需触发 Nuxt 重新构建**。

**数据源**：ESPN 非官方 API（稳定、免费、无鉴权）：

```
https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/scoreboard?limit=200
```

**GitHub Actions cron 调度**：

cron 表达式按赛程分段锁死日期，2026-07-21 之后不再触发，无需手动关闭：

```yaml
# .github/workflows/update-bracket.yml
name: Update World Cup Bracket

on:
  schedule:
    - cron: '0 6 11-27 6 *'    # 小组赛（UTC 06:00 = 北京时间 14:00）
    - cron: '0 6 28-30 6 *'    # Round of 32
    - cron: '0 6 1-21 7 *'     # 16强至决赛 + 缓冲
  workflow_dispatch:            # 手动兜底

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - run: pip install requests

      - run: python scripts/update_bracket.py

      - id: auto-commit
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update bracket [skip ci]"
          file_pattern: public/bracket.json

      - name: Sync to Aliyun VPS
        if: steps.auto-commit.outputs.changes_detected == 'true'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/your-project
            git pull origin main
```

`changes_detected == 'true'` 确保 bracket.json 无变化时跳过 SSH，不产生无效连接。`VPS_SSH_KEY` 即现有 `id_rsa` 私钥存入 GitHub Secrets。`git pull` 即可完成同步，无需 `pm2 restart`（纯静态文件变更）。

**`scripts/update_bracket.py` 逻辑说明**：

拉取 ESPN scoreboard → 过滤淘汰赛阶段（`round_of_32` / `round_of_16` / `quarterfinals` / `semifinals` / `third_place` / `final`，小组赛数据已在 `teams.json` 不重复写入）→ 提取每场的主客队 ID、名称、场次时间、场地、是否结束、晋级方（`winner`）→ 写入 `public/bracket.json`。

**`bracket.json` Schema**：

```json
{
  "updated_at": "2026-07-03T06:00:00Z",
  "stage": "round_of_16",
  "matches": [
    {
      "id": "r32_1",
      "stage": "round_of_32",
      "home": { "id": "BRA", "name": "巴西" },
      "away": { "id": "FRA", "name": "法国" },
      "scheduled_at": "2026-06-28T19:00:00-04:00",
      "venue": "MetLife Stadium",
      "finished": true,
      "winner": "BRA"
    },
    {
      "id": "r16_1",
      "stage": "round_of_16",
      "home": { "id": "BRA", "name": "巴西" },
      "away": { "id": "ESP", "name": "西班牙" },
      "scheduled_at": "2026-07-03T19:00:00-04:00",
      "venue": "AT&T Stadium",
      "finished": false,
      "winner": null
    }
  ]
}
```

`winner: null` 表示比赛未结束，前端据此判断该场次是否允许起卦：`finished: false` 且 `winner: null` 方可进入摇卦工作台，否则置灰并展示最终晋级方。

---

## 4. 赛事分析逻辑

后端引擎返回结构化 JSON 后，LLM 按以下权重顺序生成 `analysis_brief`：

**世应旺衰** → **动爻生克方向**（是否有动爻生合世爻或克制应爻）→ **官鬼爻归属与向背**（象征进球/晋级目标）→ **结论：胜/平/负倾向**

解读顺序依据 SKILL 输出规范：本卦意象 → 变卦方向 → 世应关系 → 时间参与层（月建/日辰/时辰）→ 最终结论。语言须体现易理逻辑，禁止直接断言比分。

---

## 5. 视觉与交互规范

- **色温**：全局 5500K 柔和色调，背景与卡片避免纯黑（`#000`）或纯白（`#FFF`）。禁用红-紫-蓝系渐变。
- **卦象展示**：必须为 Top-Down 视觉顺序（上爻在上，初爻在下）。动爻需有明确视觉标记（○ 变 ● 或颜色区分）。
- **世应标签**：世/应浮标需与选定队伍名称对应显示（如"世 🇧🇷 巴西"）。
- **区域隔离**：摇卦工作台与卦象渲染区在视觉上严格分区，排盘结果渲染期间工作台输入区整体置灰锁定。
- **风格基调**：极简内容优先，参照 Notion 风格，不使用装饰性图案。

---

## 6. 技术栈

- **前端**：Nuxt v4（`compatibilityVersion: 4`）、TypeScript、Tailwind CSS v4（通过 `@nuxt/ui` 引入，不单独注册）、shadcn-vue
- **后端**：Python 3.12+、FastAPI、lunar-python（Vendor，内嵌于 SKILL.md，SHA256 校验后解压执行）
- **协议**：`liuyao-three-coin-physical-core-SKILL-contract-v2`

---

## 7. 免责声明

页面底部显著位置标注：

> 本功能基于术数模型模拟推演，结果仅供娱乐，严禁用于任何形式的非法体育博彩。

---

## 附：赛事数据层（Data Schema）

系统不依赖数据库，直接读取静态 `teams.json`。

**数据来源**：FIFA 2025-12-05 正式抽签结果 + 2026-03-31 附加赛最终结果（6 支附加赛球队已全部入组）。

**附加赛入组汇总**：

| 路径 | 结果 | 入组 |
|---|---|---|
| UEFA Path A | 波黑 1-1 (4-1 点) 意大利 | B组 |
| UEFA Path B | 瑞典 3-2 波兰 | F组 |
| UEFA Path C | 土耳其 1-0 科索沃 | D组 |
| UEFA Path D | 捷克 2-2 (3-1 点) 丹麦 | A组 |
| 洲际 Path 1 | 刚果民主共和国 1-0 (加时) 牙买加 | K组 |
| 洲际 Path 2 | 伊拉克 2-1 玻利维亚 | I组 |

> 意大利连续第三届缺席世界杯。

```json
{
  "tournament": "2026年国际足联世界杯",
  "format": {
    "teams": 48,
    "groups": 12,
    "matches": 104,
    "advance_per_group": "前2名 + 全场最佳第三名共8队",
    "knockout_entry": "Round of 32（本届新增）"
  },
  "groups": {
    "A组": [
      { "id": "MEX", "name": "墨西哥", "host": true },
      { "id": "RSA", "name": "南非" },
      { "id": "KOR", "name": "韩国" },
      { "id": "CZE", "name": "捷克", "qualified_via": "UEFA附加赛Path D" }
    ],
    "B组": [
      { "id": "CAN", "name": "加拿大", "host": true },
      { "id": "BIH", "name": "波斯尼亚和黑塞哥维那", "qualified_via": "UEFA附加赛Path A" },
      { "id": "QAT", "name": "卡塔尔" },
      { "id": "SUI", "name": "瑞士" }
    ],
    "C组": [
      { "id": "BRA", "name": "巴西" },
      { "id": "MAR", "name": "摩洛哥" },
      { "id": "HAI", "name": "海地" },
      { "id": "SCO", "name": "苏格兰" }
    ],
    "D组": [
      { "id": "USA", "name": "美国", "host": true },
      { "id": "PAR", "name": "巴拉圭" },
      { "id": "AUS", "name": "澳大利亚" },
      { "id": "TUR", "name": "土耳其", "qualified_via": "UEFA附加赛Path C" }
    ],
    "E组": [
      { "id": "GER", "name": "德国" },
      { "id": "CUW", "name": "库拉索" },
      { "id": "CIV", "name": "科特迪瓦" },
      { "id": "ECU", "name": "厄瓜多尔" }
    ],
    "F组": [
      { "id": "NED", "name": "荷兰" },
      { "id": "JPN", "name": "日本" },
      { "id": "SWE", "name": "瑞典", "qualified_via": "UEFA附加赛Path B" },
      { "id": "TUN", "name": "突尼斯" }
    ],
    "G组": [
      { "id": "BEL", "name": "比利时" },
      { "id": "EGY", "name": "埃及" },
      { "id": "IRN", "name": "伊朗" },
      { "id": "NZL", "name": "新西兰" }
    ],
    "H组": [
      { "id": "ESP", "name": "西班牙" },
      { "id": "CPV", "name": "佛得角" },
      { "id": "KSA", "name": "沙特阿拉伯" },
      { "id": "URU", "name": "乌拉圭" }
    ],
    "I组": [
      { "id": "FRA", "name": "法国" },
      { "id": "SEN", "name": "塞内加尔" },
      { "id": "NOR", "name": "挪威" },
      { "id": "IRQ", "name": "伊拉克", "qualified_via": "洲际附加赛Path 2" }
    ],
    "J组": [
      { "id": "ARG", "name": "阿根廷" },
      { "id": "ALG", "name": "阿尔及利亚" },
      { "id": "AUT", "name": "奥地利" },
      { "id": "JOR", "name": "约旦" }
    ],
    "K组": [
      { "id": "POR", "name": "葡萄牙" },
      { "id": "COD", "name": "刚果民主共和国", "qualified_via": "洲际附加赛Path 1" },
      { "id": "UZB", "name": "乌兹别克斯坦" },
      { "id": "COL", "name": "哥伦比亚" }
    ],
    "L组": [
      { "id": "ENG", "name": "英格兰" },
      { "id": "CRO", "name": "克罗地亚" },
      { "id": "GHA", "name": "加纳" },
      { "id": "PAN", "name": "巴拿马" }
    ]
  }
}
```

---

## 附：PRD v1 → v2 → v3 变更记录

| 项目 | v1 | v2 | v3 |
|---|---|---|---|
| 子时边界时间 | 23:00–01:00 | **22:30–01:30** | 不变 |
| API Input 爻数据字段 | `tosses: Int[]` | **`line_values: Int[]`** | 不变 |
| API Input 时间字段 | `timestamp: Long` | **`cast_datetime: string`** | 不变 |
| API Input 坐标字段 | 顶层 `lon`, `lat` | **`location` 嵌套对象** | 不变 |
| status 分流 | 未定义 | **三路强制分流** | 不变 |
| analysis_brief 生成方 | 未明确 | **后端 LLM 生成** | 不变 |
| teams.json 队伍结构 | 纯字符串数组 | **含 `id` + 附加赛标注** | 不变 |
| 2026 赛制说明 | 未涵盖 | **Round of 32 及晋级规则** | 不变 |
| 淘汰赛数据维护方式 | 未涵盖 | 人工维护或接入 API（模糊） | **bracket.json + ESPN API + GitHub Actions cron 自动同步** |
| VPS 同步机制 | 未涵盖 | 未涵盖 | **commit 后 SSH git pull，无需重建** |
| cron 生命周期 | 未涵盖 | 未涵盖 | **日期锁死至 2026-07-21，到期自动停止** |
| 选择器数据源切换 | 未涵盖 | 未涵盖 | **小组赛读 teams.json，淘汰赛读 bracket.json** |
| 已结束场次处理 | 未涵盖 | 未涵盖 | **winner 非 null → 置灰，不可起卦** |
