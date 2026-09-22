# Life Path Compatibility Research

## Scope

生命灵数配对的核心输入是双方公历出生日期。完整结果需要覆盖：

- 生命灵数计算：月、日、年分别化约，再合成 1-9。
- 主灵数：11、22、33 保留展示；配对矩阵按常见惯例取根数 2、4、6。
- 配对矩阵：1-9 共 45 个无序组合。
- 关系信号：共振、互补、磨合、课题型四类，避免“吉凶”式判断。
- 相处维度：沟通节奏、情感表达、生活方式、成长课题。
- 个人画像：符号类型、核心标签、关系需要与行动建议。

## Source Landscape

- `numerology.com` 的 Life Path compatibility 系列明确给出 1-9 与 Master Number 的计算边界，并提供每个数字的 preferred / least-compatible lists。页面解释文案受版权保护，因此只抽取计算规则和配对关系信号，不复制原文。
- GPL-3.0 的 `gr8monk3ys/numerology` 有完整的 compatibility JSON 与纯 TypeScript 评分模型，适合作为生态参考；因为许可证是 GPL-3.0，没有复制它的代码、评分函数或解释文本。
- MIT 的 `RoxyAPI/numerology-api` 示例库支持 Life Path 与 compatibility，但实际 API 是商业订阅；本项目不需要外部服务，也没有引入它的 SDK。
- npm 通用 numerology 包主要是字母转数字或字符串转数工具，缺少完整中文本地化、四类关系信号和相处维度模型。
- Google autocomplete 检索到的中文需求包括：配对表、配对计算、配对爱情、配对组合、准吗、相差多少最好；英文需求包括 compatibility chart、calculator、by date of birth 和 11 等数字查询。

## Implementation Decision

选择自研纯 TypeScript 规则核心：

- 计算规则以多个公开资料的共同口径为准，不绑定商业 API。
- 配对矩阵由 preferred / least-compatible 信号合并成对称的四类关系信号；冲突和缺口按保守处理归入“稳定磨合”。
- 解释层全部自写，并结合仓库既有的符号模型；不使用 GPL 或商业页面的受保护解释文案。
- AI 解读只在确定的服务端 prompt 中引用已计算字段，避免客户端伪造结果或产生无根据预测。

主数据与关系核心位于 `server/utils/tools/lifepath-peidui-data.ts`；`calc` 返回确定性结构化结果，`interpret` 的目标模式消费该结构，完整报告要求登录。
