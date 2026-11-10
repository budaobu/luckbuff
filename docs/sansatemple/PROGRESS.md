# 在线寺庙交付进度

## P0 勘察

### 本阶段目标

确认项目规则、Three.js 工具约定、工具注册、i18n、SEO、sitemap、画质降级、Playwright 与 Nitro WebSocket 能力，再进入场景实现。

### 结论

- 项目是 Nuxt 4 + Nitro 2.13，Three.js 已存在且现有 3D 工具要求运行时动态导入、客户端渲染和资源释放。
- 工具入口集中在 `app/composables/useToolCategories.ts`，sitemap 由 `nuxt.config.ts` 自动扫描页面并支持静态 URL。
- i18n 有五份语言文件，只允许新增 namespace 或 key。
- Nitro 通过 `experimental.websocket` 提供 crossws WebSocket；使用内置 `defineWebSocketHandler`，不引入独立 ws 进程。
- 环境有 Blender 5.2.2。为控制首包和先验证交互，P1 使用原创程序化几何与 Web Audio 合成；后续若替换模型，会继续用无头 Blender 脚本生成并登记。
- 仓库当前已有与任务无关的未提交改动，后续提交只纳入在线寺庙相关文件。

## P1 场景与资产（完成）

### 本阶段目标

建立原创程序化「石径灯笼 → 法堂」场景、静态海报兜底、资产登记和频道服务端状态。

## P2 化身与操控（完成）

### 本阶段目标

实现小沙泥化身、键盘/点击/触控移动、环视缩放、三档画质与渲染指标。

## P3 互动（完成）

### 本阶段目标

实现合十、拜佛坐垫互斥、念珠 108、木鱼、烧香和打坐。

## P4 声音与早晚课（完成）

### 本阶段目标

实现四路声音设置、后台暂停、持久化、程序化占位诵经与 05:00/18:00 共修对齐。

## P5 多人同堂（完成）

### 本阶段目标

实现位置/朝向/动作同步、坐垫和香广播、附近合十提示、重连与离开。

## P6 集成与收尾（完成）

### 本阶段目标

完成工具注册、i18n、SEO、部署说明、桌面/手机流程、多人脚本、三档画质证据和 F-01 至 F-21 验收。

## 功能验收

| 编号 | 状态 | 证据 |
|---|---|---|
| F-01 | 已完成 | `e2e/sansatemple.spec.ts` 入口/加载；`evidence/desktop-path.png`；页面含 noscript；`TempleScene.vue` 提供 WebGL 检查与静态海报。 |
| F-02 | 已完成 | `e2e/sansatemple.spec.ts` 频道进入；`server/api/sansatemple/channels.get.ts`；`server/utils/sansatemple/state.ts` 用私有 env 控制容量并广播满员。 |
| F-03 | 已完成 | `TempleScene.vue` 生成原创小沙弥、Canvas 名牌；`evidence/desktop-path.png`。 |
| F-04 | 已完成 | `TempleScene.vue` 键盘、点击地面、拖拽、滚轮/双指；`e2e/sansatemple.spec.ts` 桌面/手机移动。 |
| F-07 | 已完成 | `e2e/sansatemple.spec.ts`「two browser contexts」断言附近合十提示与无聊天入口；`evidence/multiplayer-hall.png`。 |
| F-08 | 已完成 | `e2e/sansatemple.spec.ts` 拜佛流程；同一用例的两个脚本机器人返回不同坐垫；`SansatempleExperience.vue` 支持取消/起身。 |
| F-09 | 已完成 | `e2e/sansatemple.spec.ts` 键盘拨 108 颗到 `108/108`；`evidence/desktop-beads-108.png`、`evidence/mobile-beads.png`。 |
| F-10 | 已完成 | `e2e/sansatemple.spec.ts` 法堂内点击木鱼；`useSansatempleAudio.ts` 合成并限制音频脉冲长度。 |
| F-11 | 已完成 | `e2e/sansatemple.spec.ts` 香案烧香显示 `1/3`；`server/utils/sansatemple/state.ts` 每人 3 支、180 秒过期并广播。 |
| F-12 | 已完成 | `e2e/sansatemple.spec.ts` 5 分钟打坐入口/遮罩/点击恢复；`SansatempleExperience.vue` 计时与磬声。 |
| F-13 | 已完成 | `e2e/sansatemple.spec.ts` 四路音量设置；`useSansatempleAudio.ts` 后台暂停、localStorage 持久化、手势初始化、程序化诵经占位。 |
| F-14 | 已完成 | `e2e/sansatemple.spec.ts` 下一场时间；`server/utils/sansatemple/state.ts` 以 Asia/Shanghai 05:00/18:00 时间戳下发。 |
| F-15 | 已完成 | `e2e/sansatemple.spec.ts` 双浏览器同堂、坐垫互斥、合十提示、无聊天；`server/routes/sansatemple/ws.ts` 限流、内存态、广播与清理。 |
| F-16 | 已完成 | 桌面/手机/多人用例从设置中离开；`useSansatempleConnection.ts` 断开、释放坐垫并清空状态。 |
| F-17 | 已完成 | `evidence/quality-metrics.json` 记录三档 renderer.info；`evidence/quality-high.png` 等三档截图。 |
| F-18 | 已完成 | `nuxt.config.ts` viewport-fit、`app/pages/tools/sansatemple.vue` theme-color/Apple meta；手机 Playwright 项目通过。 |
| F-19 | 已完成 | `app/composables/useToolCategories.ts` 注册；生产 sitemap 验证含 `https://www.ososn.com/tools/sansatemple`；页面使用 useSeoMeta、JSON-LD 和 runtimeConfig.siteName。 |
| F-20 | 已完成 | `SansatempleExperience.vue` 页脚含非真实仪式说明与 sansatemple.com 灵感致谢。 |
| F-21 | 已完成 | 全部交互有可聚焦按钮；念珠方向键；`TempleScene.vue` 支持 `prefers-reduced-motion`；提示均为文字。 |

## 偏离记录

- SPEC 建议在 Blender 可用时生成 GLB。环境确有 Blender 5.2.2，但 P1 为控制首包和先验证完整交互，采用项目原创的 Three.js 程序化几何与顶点组合；所有资产登记在 `ASSETS.md`。后续替换精修模型时应继续走无头 Blender 生成流程。
- 三档当前都测量为 44 draw calls / 3,244 triangles / 4 textures，因为低模差异主要来自像素比、阴影与远处细节可见性；本机正对入口视角时未触发山区/树木剔除变化。结果仍低于最低档预算，已保留实测 JSON。

## 验证记录

- `pnpm typecheck` 通过。
- `pnpm lint` 通过。
- `pnpm build` 通过，产物包含 `.output/server/chunks/routes/sansatemple/ws.mjs`。
- `pnpm exec playwright test --config e2e/sansatemple.playwright.config.ts` 通过：4 passed, 4 skipped（skipped 是按桌面/手机项目过滤的同一用例）。
- 生产构建本地预览验证：`/tools/sansatemple` HTTP 200；JSON-LD 与 viewport-fit 存在；`/api/sansatemple/channels` 正常；WebSocket join 返回 welcome；`/sitemap-zh-CN.xml` 包含工具 URL。

## 手动事项

1. 替换诵经占位音源为明确授权资产，并更新 `ASSETS.md` 的来源、作者、许可证和链接。
2. 按 `DEPLOY-NOTES.md` 手动配置 Nginx WebSocket Upgrade；不要通过本任务直接修改生产 Nginx。
3. 在真实 Android/iOS 设备验证帧率、发热、触感反馈和后台标签页行为。
