# 前台网站问题整改计划

日期：2026-07-30  
项目：`sztu-fa-web`  
范围：问题 1、2、3、5、6

## 一、整改目标

本轮整改主要解决以下问题：

1. 接口异常被错误展示为“暂无数据”或 `0`。
2. 资讯接口异常后静默展示 Mock 数据。
3. Preview 部署在未配置 API 环境变量时请求错误地址。
4. 首页存在“参与丰富多彩 of 足球活动”的文案错误。
5. 自动化测试未覆盖首页组件、异常状态、导航、弹窗和移动端交互。

整改完成后，用户应能明确区分“加载中”“暂无数据”和“加载失败”；不同部署环境应访问正确的 API；生产页面不再用 Mock 数据掩盖故障；关键用户流程应有自动化测试保护。

## 二、实施顺序

建议按以下顺序实施：

1. 统一请求与页面状态模型。
2. 修复球队、赛事和首页统计的错误展示。
3. 移除资讯静默 Mock 降级。
4. 固化 Production、Preview 和本地开发的 API 配置。
5. 修正文案。
6. 补充组件测试和端到端测试。
7. 执行完整回归并验证 Preview 部署。

## 三、问题 1：接口异常被展示为暂无数据或零值

### 现状

- 球队请求失败时，页面同时显示错误信息和“暂无球队数据”。
- 比赛请求失败时，页面可能继续显示“暂无比赛数据”。
- 首页统计初始值为 `0 场`、`0 名`，接口失败后仍保留零值，容易被理解为真实统计。
- 部分 API 方法将非成功响应转换为空数组或零值结果，使上层无法判断“接口失败”和“真实空数据”。

### 改动方案

1. 为数据区域统一定义四种互斥状态：
   - `loading`
   - `success`
   - `empty`
   - `error`
2. 页面渲染优先级统一为：
   - 加载中：只显示加载状态。
   - 加载失败：只显示错误状态和重试入口。
   - 请求成功且列表为空：显示暂无数据。
   - 请求成功且有数据：显示正常内容。
3. 球队区域在 `error` 存在时不再渲染 `EmptyState`。
4. 比赛、积分榜、射手榜、助攻榜分别保留独立错误状态，避免一个接口失败导致整个赛事区域被误判为空。
5. 首页统计值在请求完成前显示 `--` 或骨架屏；请求失败时显示“暂时无法获取”，不显示 `0`。
6. API 层遇到网络错误或非预期 HTTP 状态时抛出明确异常，不再返回伪造的空列表或零值统计。
7. 保留可理解的用户提示，详细异常只记录到开发日志或监控平台。

### 主要涉及文件

- `src/api/matches.ts`
- `src/api/teams.ts`
- `src/api/players.ts`
- `src/api/seasons.ts`
- `src/components/About/About.tsx`
- `src/components/Teams/Teams.tsx`
- `src/components/Teams/hooks/useTeamDirectory.ts`
- `src/components/Matches/hooks/useMatchDirectory.ts`
- `src/components/Matches/hooks/useSeasonCompetition.ts`
- `src/components/Matches/components/MatchList.tsx`
- `src/components/Matches/components/LeagueStandings.tsx`

### 验收标准

- 接口返回 500、超时或断网时，不出现“暂无数据”或虚假的 `0`。
- 接口成功返回空数组时，只显示“暂无数据”，不显示错误信息。
- 每个错误状态都提供可用的“重新加载”入口。
- 重试成功后，错误提示消失并展示最新数据。
- 多个赛事接口中只有一个失败时，其余成功区域仍可正常展示。

## 四、问题 2：资讯接口异常后静默展示 Mock 数据

### 现状

资讯接口请求失败时，代码清空真实资讯列表，但随后通过 `displayList` 自动使用 `mockActivities`，且没有设置页面错误状态。用户会把 Mock 内容误认为线上真实资讯。

### 改动方案

1. 正式运行环境中移除自动 Mock 降级。
2. 请求失败时设置明确的 `error` 状态并展示重试按钮。
3. 请求成功但返回空列表时显示“暂无活动资讯”。
4. 如果开发环境仍需要 Mock：
   - 使用显式环境变量，例如 `VITE_ENABLE_NEWS_MOCK=true`。
   - 默认关闭。
   - 页面增加“模拟数据”标识。
   - Production 构建禁止启用该变量。
5. 将加载资讯的方法暴露为可重试操作，避免只能通过刷新整个页面恢复。

### 主要涉及文件

- `src/components/Activities/hooks/useActivities.ts`
- `src/components/Activities/Activities.tsx`
- `src/data/mockNews.ts`
- `.env.example`

### 验收标准

- Production 中资讯接口失败时绝不展示 Mock 资讯。
- 接口失败、成功空列表和成功有数据三种状态展示正确。
- 点击重试后可以重新发起请求。
- 开发 Mock 必须显式开启，并带有清晰的模拟数据标识。

## 五、问题 3：Preview 部署 API 地址不可靠

### 现状

API 地址解析规则为：

- `dev.sztufa.xyz` 使用开发 API。
- `sztufa.xyz` 使用生产 API。
- 其他域名使用同源 `/api/v1`。

因此 Vercel Preview 域名在未配置 `VITE_API_BASE_URL` 时会请求自身的 `/api/v1`。当前 `vercel.json` 又把所有路径重写到 `index.html`，最终可能返回 HTML 而不是 API JSON。

### 改动方案

1. 将 `VITE_API_BASE_URL` 设为部署环境的必填变量：
   - Production：`https://api.sztufa.xyz/api/v1`
   - Preview：`https://api-dev.sztufa.xyz/api/v1`
   - Development：`https://api-dev.sztufa.xyz/api/v1` 或本地代理 `/api/v1`
2. 构建时校验 API 地址：
   - Production 或 Preview 缺少变量时直接构建失败。
   - 禁止 Preview 指向生产 API。
   - 禁止 Production 指向开发 API。
3. 本地开发继续允许通过 Vite 代理访问 `http://127.0.0.1:3001`。
4. 将域名推断仅保留为本地兼容逻辑，线上部署不依赖运行时域名猜测。
5. 在非生产环境页面增加环境标识，例如“开发环境”或“预览环境”。
6. 增加 API 响应内容类型保护：需要 JSON 的请求如果收到 `text/html`，返回“API 地址配置错误”，而不是普通解析异常。
7. 在部署文档中记录 Vercel 三套环境变量的配置要求。

### 主要涉及文件

- `src/api/http.ts`
- `vite.config.ts`
- `vercel.json`
- `.env.example`
- `package.json`
- 新增构建环境校验脚本
- GitHub Actions 或 Vercel 构建配置

### 验收标准

- Production 浏览器请求只发送到 `api.sztufa.xyz`。
- Preview 浏览器请求只发送到 `api-dev.sztufa.xyz`。
- 本地开发默认请求 Vite 代理，不污染远程生产数据。
- Preview 缺少 API 变量时构建失败，并输出明确原因。
- Preview 配置成生产 API 时构建失败。
- API 返回 HTML 时，页面显示可定位的配置错误。

## 六、问题 5：首页文案错误

### 改动方案

将：

```text
了解协会最新活动动态，参与丰富多彩 of 足球活动
```

修改为：

```text
了解协会最新活动动态，参与丰富多彩的足球活动
```

同时全局搜索其他中英文误拼、占位文案和异常空格。

### 主要涉及文件

- `src/components/Activities/Activities.tsx`

### 验收标准

- 首页不再出现“of 足球活动”。
- 页面主要中文文案不存在同类中英文误拼。
- 文案修改在桌面端和移动端均正常换行。

## 七、问题 6：自动化测试覆盖不足

### 测试建设方案

#### 1. 测试基础设施

新增或确认以下依赖：

- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- Playwright，用于关键端到端流程和响应式检查

配置统一的测试初始化文件，并为 `fetch`、路由和浏览器 API 提供稳定 Mock。

#### 2. 组件测试

为以下场景补充测试：

- 球队列表：
  - 加载中
  - 请求失败
  - 请求成功但为空
  - 请求成功且有数据
  - 点击重试后恢复
- 比赛列表：
  - 请求失败时不显示“暂无比赛数据”
  - 状态筛选和排序
  - 赛事详情弹窗打开与关闭
- 首页统计：
  - 加载前显示占位符
  - 请求失败不显示虚假零值
  - 请求成功显示真实统计
- 活动资讯：
  - 失败时不使用 Mock
  - 空列表状态
  - 重试成功
  - 开发 Mock 开关及标识
- Header：
  - 桌面导航
  - 移动菜单打开与关闭
  - 锚点跳转
- 球队弹窗、球员生涯卡片和图片预览：
  - 打开
  - 关闭按钮
  - Escape 关闭
  - 焦点行为

#### 3. API 配置测试

覆盖以下环境矩阵：

| 构建环境 | API 配置 | 预期结果 |
| --- | --- | --- |
| Production | 生产 API | 通过 |
| Production | 开发 API | 构建失败 |
| Preview | 开发 API | 通过 |
| Preview | 生产 API | 构建失败 |
| Preview | 未配置 | 构建失败 |
| Local | 未配置 | 使用本地代理 |

同时测试接口收到 HTML、401、404、500、超时和断网时的错误处理。

#### 4. 端到端测试

至少覆盖：

1. 首页加载与主要区块可见。
2. 桌面导航跳转。
3. 390px 移动端菜单交互。
4. 球队搜索和重置。
5. 比赛筛选和排序。
6. 赛事详情弹窗。
7. API 故障时的错误提示与重试。
8. 页面不存在横向滚动。

#### 5. CI 门禁

CI 依次执行：

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

建议先对本轮新增和修改文件设置覆盖率门槛，再逐步提高全项目覆盖率，避免只追求数字而编写低价值测试。

### 验收标准

- 新增测试覆盖本计划规定的关键状态和交互。
- API 错误被误判为空数据时，测试必须失败。
- Production 或 Preview API 配置错误时，CI 必须失败。
- 桌面端和 390px 移动端端到端测试通过。
- `lint`、单元测试、构建和端到端测试全部成为合并门禁。

## 八、建议拆分任务

### 任务 A：状态模型与错误展示

- 调整 API 错误传播。
- 修复球队、比赛和首页统计状态。
- 增加统一错误组件和重试入口。

### 任务 B：资讯真实数据保护

- 移除 Production 静默 Mock。
- 增加资讯错误状态和重试。
- 增加可选开发 Mock 开关。

### 任务 C：部署环境隔离

- 增加构建环境校验。
- 配置 Vercel Production、Preview 和 Development 变量。
- 增加环境标识和 HTML 响应保护。

### 任务 D：文案清理

- 修复“of 足球活动”。
- 全局检查异常文案。

### 任务 E：测试与 CI

- 搭建组件测试环境。
- 增加关键组件测试。
- 增加 Playwright 端到端测试。
- 将完整检查加入 CI。

## 九、最终回归清单

- [ ] 断开后端时，页面显示错误而不是暂无数据。
- [ ] 首页统计失败时不显示 `0 场`、`0 名`。
- [ ] 资讯接口失败时不展示 Mock 新闻。
- [ ] 所有错误区域均可单独重试。
- [ ] Production 只访问生产 API。
- [ ] Preview 只访问开发 API。
- [ ] 本地环境使用本地代理。
- [ ] 首页文案已修正。
- [ ] 桌面端无明显布局回归。
- [ ] 390px 移动端无横向滚动。
- [ ] 导航、筛选、排序和弹窗操作正常。
- [ ] Lint、单元测试、构建和端到端测试全部通过。

