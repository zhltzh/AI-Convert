# Aixuno SEO / GEO 90 天执行计划

更新日期：2026-09-17  
范围：`aixuno.com` 主站；工具子站通过统一品牌、互链和选题协同纳入生态，但各子站代码在各自项目中实施。

## 1. 目标与边界

### 业务目标

- 让有明确转换需求的用户通过搜索进入对应工具页，并在 60 秒内完成一次转换。
- 建立 Aixuno 与“AI 内容转换、Markdown、Word、PDF、表格、图片工具”的清晰实体关联。
- 让搜索引擎和答案引擎可以准确抓取、理解、引用并链接到具体页面。

### 北极星指标

每周来自自然搜索并成功完成一次导出、下载或复制的独立用户数。

### 原则

- 工具真实可用后才建设对应落地页。
- 每个页面只服务一个主要意图，不批量生成仅替换关键词的页面。
- 内容以可验证步骤、示例、限制和 FAQ 为主，不承诺排名或 AI 引用。
- 不采集用户输入、文件名或文件内容。

## 2. 页面与关键词地图

| 页面层级 | 主要意图 | 中文主题 | 英文主题 | 转化动作 |
| --- | --- | --- | --- | --- |
| 首页 | 了解产品和选择任务 | AI 内容转换工具、Markdown 转换器 | AI content converter, Markdown converter | 选择工具 |
| 工具页 | 立即完成任务 | Markdown 转 Word/PDF/Excel、Excel 转 Markdown | Markdown to Word/PDF/HTML, Excel to Markdown | 下载或复制 |
| 平台场景页 | 解决特定来源问题 | DeepSeek/ChatGPT/Kimi 内容导出 | ChatGPT/Claude/Gemini export | 打开对应工具 |
| 教程页 | 学会操作和排错 | MD 文件、表格、格式丢失、乱码 | formatting, tables, file conversion | 完成步骤 |
| 对比/决策页 | 选择输出格式 | Word、PDF、Markdown 怎么选 | Word vs PDF vs Markdown | 选择工具 |
| 信任页 | 验证产品可信度 | 本地处理、隐私、兼容范围 | local processing, privacy, limitations | 使用工具 |

每篇新内容必须绑定一个现有工具、一个主查询意图和一个明确下一步。

## 3. 技术 SEO

### P0：抓取与索引（第 1–2 周）

- 保持根域英文、`/zh/`、`/es/`、`/de/`、`/ja/`、`/fr/` 的固定语言 URL。
- 每个可索引页面必须有唯一 title、description、H1、自指 canonical。
- 对真正互译的页面配置双向 hreflang；没有对应翻译时不虚构 alternate。
- `robots.txt` 允许主流搜索爬虫和 `OAI-SearchBot`，并声明 sitemap。
- sitemap 只包含规范、可访问、希望被索引的 URL；仅在正文、结构化数据或重要链接变化时更新 `lastmod`。
- 旧 `/en/` 和旧中文路径保留迁移提示与 canonical；托管能力允许时改为服务端 301。
- 新增或更新 URL 后提交 IndexNow；Google 通过 Search Console sitemap 与 URL Inspection 管理。

### P1：结构与理解（第 2–4 周）

- 首页：`WebSite`、`Organization`、`SoftwareApplication`。
- 工具页：与可见内容一致的 `SoftwareApplication`；有真实步骤时增加 `HowTo`。
- 教程页：`Article` 或 `HowTo`、作者/审核者、发布日期、更新时间。
- 列表页和工具页增加 `BreadcrumbList`，并确保可见面包屑一致。
- 建立“首页 → 工具 → 教程 → 相关工具”的双向内部链接，不制造孤立页。
- 所有结构化数据在发布前完成 JSON 解析和字段一致性检查。

### P2：体验与性能（持续）

- 每月用移动端和桌面端检查 LCP、INP、CLS。
- 首屏不加载非必要大型依赖；转换库继续按需加载。
- 保持静态 HTML 中可见的标题、说明和链接，不把核心 SEO 内容只放在 JavaScript 后。
- 修复断链、404、错误 canonical、重复 title 和不可访问资源。
- 分批改写过短或信息不足的 meta description，优先处理有展现的工具页和教程页；按语言表达完整性验收，不机械追求英文字符数。

### P3：权威度与真实外链（持续）

- 通过可用工具、原创教程、GitHub 项目文档、正规产品目录和相关社区回答获得自然引用。
- 记录新增引用域、引用页面、目标页面与带来的有效访问，不只统计链接数量。
- Aixuno 工具站之间只做与用户下一步相关的互链，生态互链不冒充第三方认可。
- 不购买链接、不参加批量友链网络、不制作与产品无关的客座内容。

## 4. 内容建设

### 中文内容集群（优先）

1. Markdown 转 Word：DeepSeek、ChatGPT、Kimi、豆包内容导出及格式保留。
2. Markdown 表格转 Excel：多表格、中文乱码、前导零、竖线与换行处理。
3. Markdown 转 PDF：打印、分页、代码块、中文字体与分享场景。
4. Office 转 Markdown：DOCX、Excel/CSV、文本 PDF、扫描 PDF 限制。
5. 决策内容：Word / PDF / Markdown / HTML 的选择方法。

### 英文内容集群

1. Export ChatGPT/Claude/Gemini answers to Word or PDF.
2. Convert Markdown tables to Excel without losing columns.
3. Convert MD files to Word and preserve formatting.
4. Convert Excel, CSV, DOCX, and text PDFs to Markdown.
5. Choose Word vs PDF vs Markdown for AI output.

### 西班牙语、德语、日语、法语

- 先完善核心工具页的独特说明、FAQ 和真实本地化。
- 只有 Search Console 出现稳定展现或当地需求明确后，才新增教程。
- 禁止直接机翻整套英文内容后批量上线。

### 发布节奏

- 每周 1 篇高质量页面更新或新教程；质量不足时改为完善已有页面。
- 每月依据真实查询更新一次选题，不按固定关键词清单盲目生产。
- 每篇内容发布后至少获得 2 个相关站内链接，并加入 sitemap 与 IndexNow。

## 5. GEO（AI 答案引擎优化）

- 每页开头用 1–2 句话直接定义工具、输入、输出、处理位置和限制。
- 使用清晰的 H2、步骤、表格、FAQ、示例与错误处理，方便准确摘取。
- 对浏览器、文件格式和第三方平台能力使用可验证措辞，并标注更新时间。
- 统一使用“Aixuno”品牌名、正式 URL、产品描述和工具命名。
- `llms.txt` 维护产品定义、规范 URL、核心工具、语言版本和生态站点。
- 允许 `OAI-SearchBot`；不把 `llms.txt` 当成排名保证。
- 优先争取真实引用：开源仓库、产品目录、教程引用、用户分享和相关社区回答；不购买批量外链。

## 6. Aixuno 工具生态

| 站点 | 定位 | 主站协同 |
| --- | --- | --- |
| `aixuno.com` | AI 内容与 Markdown 转换 | 品牌与内容中心 |
| `image.aixuno.com` | 图片格式与批量转换 | 图片教程和任务入口 |
| `compress.aixuno.com` | 文件压缩 | 文件交付场景互链 |
| `pdf.aixuno.com` | PDF 工具 | PDF 处理场景互链 |
| `bg.aixuno.com` | AI 抠图 | 图片工作流互链 |

所有站点保持统一导航和视觉识别，但每个站点必须有独立页面价值、canonical、sitemap、robots 和内容主题，避免复制主站文案。

## 7. 衡量与报表

### 每周记录

- Google/Bing：展现、点击、CTR、平均排名、有效查询数。
- 索引：已索引页面、未索引原因、抓取错误、结构化数据错误。
- 站内：工具打开、预览成功、导出开始、导出成功、导出失败。
- 内容：新页面首周展现、入口页面、相关工具点击。
- 权威度：新增有效引用域、自然外链目标页和外链带来的工具使用。
- 摘要质量：Bing/Google 报告中的短描述、重复描述和高展现低点击页面数量。

### 30/60/90 天目标

这些是执行目标，不是排名保证。

- 30 天：所有核心 URL 可抓取；无严重 canonical/hreflang/结构化数据错误；建立查询基线。
- 60 天：核心工具形成双语内容集群；高展现低点击页面完成标题与摘要迭代。
- 90 天：依据转化数据保留、合并或重写内容；形成每周可重复的发布和复盘流程。

## 8. 责任分工

### Codex 可直接完成

- 技术审计、代码修改、结构化数据、内部链接、sitemap、IndexNow。
- 内容选题、页面初稿、本地化、测试、发布和上线检查。
- 每次修改的测试报告、提交记录与已知限制。

### 需要站长账号权限的动作

- Google Search Console、Bing Webmaster Tools、百度搜索资源平台的首次验证和数据授权。
- 查看真实查询和索引报告；获得访问权限后再由 Codex据此优化。

## 9. 固定工作流

1. 从搜索数据、用户问题或工具失败点选择一个真实需求。
2. 确认目标页面，避免与现有页面抢同一意图。
3. 编写或改进内容，同时完成 title、description、H1、canonical、结构化数据和内链。
4. 运行单元测试、静态 SEO 审计、移动端与桌面端浏览器验收。
5. 提交并部署，检查 HTTP 状态、线上正文和结构化数据。
6. 更新 sitemap，提交 IndexNow；必要时在 Search Console 请求抓取。
7. 7、28 天后复盘展现、点击和工具完成率。

## 10. 当前执行队列

1. 自动化校验 canonical、唯一 H1 和 JSON-LD 合法性。
2. 清理早期国际化策略中已失效的 URL 决策。
3. 审核四个核心工具页是否满足“工具、说明、场景、FAQ”完整结构。
4. 为首页和核心工具补齐一致的实体及面包屑结构化数据。
5. 建立中文“Markdown 表格转 Excel”内容集群并强化内链。
6. 检查语言页 hreflang 的完整性与互惠关系。
7. 获取 Search Console/Bing 查询基线后确定下一批选题。
8. 按真实需求逐站审计 image、compress、pdf、bg 的技术 SEO。
9. 分批完善 Bing 标记的短元描述，先修核心工具页，再修有展现的教程与信任页。
10. 建立高质量引用清单，从 GitHub、产品目录、教程引用和真实社区分享获取首批自然外链。
