# AI Convert

将 AI 生成内容转换为可使用文档与知识库格式的纯前端工具平台。

## 项目定位

AI Convert 面向 DeepSeek、ChatGPT、Claude、Gemini、豆包、通义千问和 Kimi 等 AI 平台的用户，帮助他们将 AI 输出从聊天内容整理为专业文档和知识资产。

首批核心工具：

- Markdown 转 Word
- Markdown 转 PDF
- Excel 转 Markdown

## 产品原则

- 免费、无需登录、打开即用
- 浏览器本地处理文件，不上传服务器
- 每个工具提供独立、可被搜索引擎收录的页面
- 优先保证简单、专业、可信与可维护

## 技术边界

第一阶段采用静态前端：HTML5、CSS3、JavaScript。

不引入 React、Vue、Next.js、Node 后端、数据库或账号系统。计划以静态站点方式部署至 Cloudflare Pages、Vercel 或 Netlify。

后续转换功能可使用以下浏览器端依赖：

- `marked.js`：Markdown 解析
- `html-docx-js`：Word 文档导出
- `html2pdf.js`：PDF 导出
- `SheetJS`：Excel 解析

## 开发路线

| 阶段 | 目标 |
| --- | --- |
| Phase 0 | 项目初始化与设计系统 |
| Phase 1 | 首页：Header、Hero、工具卡片、FAQ、SEO 基础 |
| Phase 2 | Markdown → HTML 核心引擎 |
| Phase 3 | Markdown → Word |
| Phase 4 | Markdown → PDF |
| Phase 5 | Excel → Markdown |
| Phase 6 | SEO 教程、AI 平台专题与案例内容 |
| Phase 7 | 微信公众号排版独立模块 |

详细需求、页面规范、SEO/GEO 规则和开发约束见 [AI-Convert-PRD.md](AI-Convert-PRD.md)。

## 预期目录

```text
AI-Convert/
├── README.md
├── AI-Convert-PRD.md
├── index.html
├── tools/
├── css/
├── js/
└── assets/
```

## 开发约定

每次实施前先确认：当前理解、拟修改文件、实现方案和验收标准。代码应模块化、可维护、可扩展；不随意引入框架或改变既定产品逻辑。

## 在其他电脑继续开发

将本项目上传到 GitHub 后，在另一台电脑克隆仓库并用 Codex 打开项目目录。开始新任务时，请先阅读：

1. `README.md`
2. `AI-Convert-PRD.md`
3. `AGENTS.md`

然后说明当前要继续的 Phase，例如“继续 Phase 5：Excel 转 Markdown”。

## SEO 与部署前配置

站点已包含 `robots.txt`、`sitemap.xml` 与 `llms.txt`。目前站点地图以 GitHub Pages 的预期地址 `https://zhltzh.github.io/AI-Convert/` 为基准；若部署到自己的域名、Cloudflare Pages、Vercel 或 Netlify，请先替换其中的站点地址。
