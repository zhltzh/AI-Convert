# AI Convert 产品需求文档（PRD）

**版本：** 1.0  
**项目：** AI Convert  
**状态：** MVP 设计完成

## 1. 项目概览

AI Convert 是面向 AI 内容生产场景的免费在线转换工具平台。它帮助用户把 DeepSeek、ChatGPT、Claude、Gemini、豆包、通义千问、Kimi 等平台生成的内容，转换为 Word、PDF、HTML 等可用文档；也逐步支持把 Word、PDF、Excel 等资料整理为 Markdown，用于知识管理与 AI 知识库建设。

AI Convert 不只是格式转换站。它的长期方向是连接 AI 生成、内容整理、格式转换、发布分享和知识管理的内容生产基础设施。

## 2. 目标与原则

### MVP 目标

快速上线一个免费、无需登录、打开即用、在浏览器本地处理的 AI 内容转换工具网站。

### 产品原则

1. 用户打开首页后，应在 5 秒内理解网站用途。
2. 第一阶段不设计账号系统。
3. 文件和文本在浏览器本地处理，不上传到服务器。
4. SEO 优先：每项工具拥有独立、可收录的页面。
5. 视觉应简洁、专业、可靠、克制，避免花哨装饰。

## 3. 用户与场景

| 用户 | 典型输入 | 需求 |
| --- | --- | --- |
| AI 办公用户 | 工作总结、方案、调研报告、产品文档 | 将 AI 输出快速整理为 Word |
| 内容创作者 | 公众号、博客、小红书内容 | 排版并发布 AI 生成内容 |
| 知识管理用户 | Excel、PDF、Word 资料 | 转为 Markdown，导入 Obsidian、Notion 或 AI 知识库 |

## 4. 功能规划

### MVP 核心工具

| 工具 | URL | 价值与优先级 |
| --- | --- | --- |
| Markdown 转 Word | `/tools/markdown-to-word` | 最高优先级；承接 DeepSeek、ChatGPT 等内容导出需求 |
| Markdown 转 PDF | `/tools/markdown-to-pdf` | 将 Markdown 内容导出为高质量 PDF |
| Excel 转 Markdown | `/tools/excel-to-markdown` | 将 xlsx、xls、csv 表格转成 Markdown 表格 |

### 后续工具

- Markdown 转 HTML：`/tools/markdown-to-html`
- Word 转 Markdown：`/tools/word-to-markdown`
- PDF 转 Markdown：`/tools/pdf-to-markdown`
- 微信公众号排版：`/tools/wechat-format`，作为独立内容发布工作流，最后开发。

## 5. 信息架构

```text
/
├── /tools/
├── /guides/
├── /faq/
└── /about/
```

首页提供核心工具入口；工具页承接明确搜索需求；指南页覆盖 DeepSeek、ChatGPT、Claude 等平台场景与使用教程。

## 6. 首页 PRD

### Header

- 高度：72px
- 内容：`AI Convert` Logo、工具、教程、FAQ 导航

### Hero

- 首屏高度：600–700px
- H1：**把 AI 生成内容，变成专业文档**
- 副标题：将 DeepSeek、ChatGPT 等 AI 内容快速转换为 Word、PDF，并整理为 Markdown 知识库。
- 主按钮：开始转换
- 次按钮：查看工具

### 内容区块

1. 支持平台：DeepSeek、ChatGPT、Claude、Gemini、豆包、通义千问、Kimi。
2. 热门工具：三列卡片，分别展示 Markdown 转 Word、Markdown 转 PDF、Excel 转 Markdown。
3. 产品优势：无需登录、本地处理、针对 AI 输出优化、基础转换免费。
4. 使用流程：复制 AI 内容 → 选择转换格式 → 下载文件。
5. FAQ：说明产品定义、支持的平台与本地处理的隐私承诺。

## 7. 工具页通用规范

所有工具页均采用以下结构：

```text
Hero → 转换工作区 → 功能介绍 → 使用教程 → 应用场景 → FAQ
```

工具页不得只有转换框；每页至少有 1 个唯一 H1 和 5 个 FAQ。

### Markdown 转 Word

- H1：Markdown 转 Word 在线工具
- 左侧：Markdown 输入、粘贴与编辑区域
- 右侧：实时渲染预览
- 操作：生成并下载 `.docx`
- 支持：标题、表格、列表、引用、代码块

### Markdown 转 PDF

- Markdown → HTML → PDF
- 支持实时预览、PDF 下载、打印优化。
- 后续可提供简约、商务、学术模板。

### Excel 转 Markdown

- 支持 `.xlsx`、`.xls`、`.csv`
- 流程：Excel → SheetJS → 二维数组 → Markdown Table
- 提供复制 Markdown 与下载 `.md` 操作。

## 8. 设计系统

设计风格参考 Apple 官网、Linear、Vercel：极简、高级、专业、留白、克制。

### 色彩

| 用途 | 值 |
| --- | --- |
| 主色、标题、主按钮、Logo | `#111111` |
| 页面背景 | `#FFFFFF` |
| 浅灰背景/分区 | `#F5F5F7` |
| 边框 | `#E5E5E5` |
| 次级文字 | `#666666` |

### 字体与组件

- 字体：英文 Inter；中文 PingFang SC、Microsoft YaHei；等宽 SF Mono、Consolas。
- 间距基本单位：8px；使用 8、16、24、32、48、64、96px。
- 圆角：按钮 12px，卡片 24px，输入区 20px。
- 阴影：轻阴影 `0 10px 30px rgba(0,0,0,0.05)`。
- 禁止复杂渐变、赛博朋克、机器人形象、过多动画及花哨背景。

## 9. 技术架构

### 技术边界

- 使用 HTML5、CSS3、原生 JavaScript。
- 静态部署至 Cloudflare Pages、Vercel 或 Netlify。
- 不使用 React、Vue、Next.js、Node 后端、数据库、登录系统。
- 所有数据和文件在浏览器端本地处理。

### 浏览器端依赖

| 场景 | 依赖 |
| --- | --- |
| Markdown 解析 | marked.js |
| Word 导出 | html-docx-js |
| PDF 导出 | html2pdf.js |
| Excel 解析 | SheetJS |

### 核心数据流

```text
Markdown → marked.js → HTML → html-docx-js → DOCX
Markdown → HTML → html2pdf.js → PDF
Excel → SheetJS → 二维数组 → Markdown Table
```

## 10. 预计文件结构

```text
AI-Convert/
├── README.md
├── AI-Convert-PRD.md
├── index.html
├── tools/
│   ├── markdown-to-word.html
│   ├── markdown-to-pdf.html
│   └── excel-to-markdown.html
├── css/
│   ├── design-system.css
│   ├── common.css
│   └── themes.css
├── js/
│   ├── app.js
│   ├── components/
│   │   ├── header.js
│   │   ├── footer.js
│   │   └── tool-card.js
│   ├── core/
│   │   ├── markdown-engine.js
│   │   └── download.js
│   ├── exporters/
│   │   ├── word-export.js
│   │   └── pdf-export.js
│   └── converters/
│       └── excel-to-md.js
└── assets/
```

新增组件应独立、可复用。预期还会用到 `UploadBox`、`MarkdownEditor` 和 `PreviewPanel`。

## 11. SEO 规范

### 策略

采用“工具页 + AI 场景页 + 教程页”三层内容结构。

- 工具页：`/tools/markdown-to-word`、`/tools/markdown-to-pdf`、`/tools/excel-to-markdown`
- 场景页：`/guides/deepseek-to-word`、`/guides/chatgpt-to-word`、`/guides/claude-to-word`
- 教程页：`/guides/how-to-export-ai-answer`

### 页面规则

- 每页有唯一 H1。
- Title 结构：核心关键词 + 用户场景 + 品牌。
- Description 写清用户价值，禁止关键词堆砌。
- 工具页必须包含工具区、功能介绍、教程、应用场景与 FAQ。
- 上线前提供 `sitemap` 与 `robots`。

示例 Title：`Markdown转Word在线工具 | DeepSeek ChatGPT内容导出Word | AI Convert`。

## 12. GEO 与结构化数据

首页必须明确说明：AI Convert 是 AI 内容转换工具，支持将 DeepSeek、ChatGPT 等 AI 输出转为 Word、PDF，并将资料转为 Markdown，用于知识管理和 AI 知识库建设。

内容优先采用清晰标题、列表、步骤、FAQ 与定义，避免长篇营销文案；内容中应明确关联 AI Convert、AI 工具、DeepSeek、ChatGPT、Markdown、Word、PDF 和知识库。

工具页规划支持：

- `SoftwareApplication`
- `FAQPage`
- `HowTo`

未来新增 `/llms.txt`，明确产品定义、主要功能与用途。

## 13. 开发规则

1. 工程实现严格遵守本 PRD，不重新定义产品逻辑。
2. 每项任务开始前，输出当前理解、修改文件、实现方案和验收标准；得到确认后再编码。
3. 代码应模块化、可维护、可扩展、注释清晰。
4. 禁止单文件超过 1000 行、随意引入框架、删除既有功能或改变产品逻辑。
5. 每次完成后，说明完成内容、修改/新增文件、测试结果、已知问题与下一步建议。

## 14. Roadmap

| 阶段 | 任务 | 验收 |
| --- | --- | --- |
| Phase 0 | 初始化目录、README、PRD、CSS 设计系统 | 基础页面可运行，字体、颜色、响应式正确 |
| Phase 1 | Header、Hero、工具卡片、FAQ、SEO 基础 | 首页可完整展示，用户 5 秒理解用途 |
| Phase 2 | Markdown → HTML 引擎，支持标题、列表、表格、引用、代码块 | 示例 Markdown 正确输出 HTML |
| Phase 3 | Markdown → Word 页面与 DOCX 下载 | 可将 AI Markdown 输出为 `.docx` |
| Phase 4 | Markdown → PDF 页面与导出 | 可下载 PDF |
| Phase 5 | Excel → Markdown 页面与导出 | 可处理 xlsx、xls、csv |
| Phase 6 | SEO 内容建设 | 上线教程、专题与案例 |
| Phase 7 | 微信公众号排版 | 独立内容发布模块 |

## 15. 上线检查清单

- 产品：首页信息清晰，工具可用，文件转换成功。
- SEO：Title、Description、唯一 H1、sitemap、robots 正确。
- GEO：产品定义、明确功能描述、FAQ、llms.txt 准备完成。
- 技术：移动端适配，无控制台错误，CDN 正常，本地处理有效。

---

**AI Convert PRD V1.0**
