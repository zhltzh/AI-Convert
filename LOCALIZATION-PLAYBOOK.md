# Aixuno 本地化 Playbook（v1 · 2026-11）

本文件是多语言版本**深度本地化**的执行标准。核心原则：**不是翻译，是"这个地区的人做的产品"**。
其他语言开新会话时，直接从"三、各语言要点"找到对应条目，按"一、通用 Checklist"执行。

---

## 一、通用 Checklist（每个语言版本必须走完）

### 1. 内容资产盘点
- [ ] 列出该语言目录下实际存在的页面（`ls`，不要相信记忆）
- [ ] 对照 zh 版页面清单，标出：已有但质量存疑 / 完全缺失
- [ ] 找出"工作区 tab 数 ≠ 工具页数"之类的结构不一致（如 ja：5 模式 / 4 工具页）

### 2. 隐性中文/英文残留扫描（最高优先级）
- [ ] `grep` 检查 JSON-LD（`featureList`、`description`）——富媒体搜索摘要直接展示给该国用户，中文残留=一眼假
- [ ] `grep` 检查 meta description / og:description / twitter:description
- [ ] `grep` 检查 JS i18n 文件（`home-locales.js`）中该语言段落
- [ ] `grep` 检查 source 标记（`lang=`、`hreflang`、`og:locale`）

### 3. 模型与产品列举本地化
默认策略：`ChatGPT / Claude / Gemini / Copilot / Perplexity`（+ 可选 Grok）。
- [ ] 检查是否残留源市场产品（DeepSeek、豆包、Kimi、腾讯元宝、文心一言——除非目标市场确实流行）
- [ ] 检查是否残留中国特有软件（WPS——日本/欧美用户不认识；改为"Excel などの表計算ソフト"）
- [ ] 中国版独有功能（公众号排版）不应出现在其他语言的承诺性文案里

### 4. 语言风格重写（非翻译）
- [ ] 以"日本/德国/西班牙的工具站如何说话"为标准重写关键区块：
  - 首页 converter lead（第一句信任钩子）
  - 隐私区块标题（卖点句：ja 用「データは、このブラウザから出ません」）
  - FAQ 问句要像真实用户会搜的问法
- [ ] 空格排版规范（ja：拉丁字母与假名之间留半角空格；de：复合词不大写空格）
- [ ] 数量词、敬语体系（ja 必须 です・ます 体 + 敬语连接词）

### 5. SEO/结构化数据
- [ ] JSON-LD `SoftwareApplication`：name/description/featureList 全部目标语言；`priceCurrency` 按地区（ja: JPY, de: EUR）
- [ ] 补 `FAQPage` JSON-LD（与页面 FAQ 内容一一对应）
- [ ] 补 `BreadcrumbList` JSON-LD
- [ ] `og:locale`（ja_JP / de_DE / es_ES / fr_FR）、`hreflang` 对（目标语言 + en + x-default）
- [ ] sitemap.xml 中该语言条目逐页核对（历史上曾整语言缺失）

### 6. 视觉主题
- [ ] 该语言是否有专属主题 class（`home--xx`）？没有则评估是否需要（本 playbook 默认：每个大语言一个主题基调）
- [ ] `theme-color` meta 与主题 soft 色同步
- [ ] 硬编码颜色审计：grep `#ea580c|#fff7ed|#ffedd5|rgba(54, 18, 7`（棕橙系残留）

### 7. 功能验证（不许只看页面）
- [ ] 本地起静态服务，逐页截图
- [ ] 控制台零错误（忽略 hm.baidu.com CSP——已知全局 Bug）
- [ ] 站内链接爬一遍：无死链、无跨语言误跳（特别是 footer/语言切换器）
- [ ] 工作区实际操作一次：输入→预览→导出，按钮文案与状态提示均为目标语言

---

## 二、日语术语表（本会话产出，后续维护遵循此表）

| 中文 | 日本語 | 备注 |
|---|---|---|
| 转换 | 変換 | 名词；按钮动作场景用「書き出す」 |
| 导出/下载 | ダウンロード／書き出し | 文件=ダウンロード，格式结果=書き出し |
| 上传 | アップロード | 但卖点句强调"しない"：「アップロード不要」 |
| 本地处理 | ブラウザ内で完結 | 惯用句式，不是「ローカル処理」直译 |
| 文件不上传服务器 | サーバーへ送信されません | 被动句+ません，日式安全表述 |
| 无需注册 | 登録不要 | 与「ログイン不要」成对使用 |
| 实时预览 | ライブプレビュー | 「リアルタイム」也行，站内统一用ライブ |
| 复制预览 | プレビューをコピー | — |
| 表格 | 表（ひょう） | "テーブル"仅用于 HTML 语境 |
| 引用 | 引用 | — |
| 加粗/斜体 | 太字／斜体 | — |
| 代码块 | コードブロック | — |
| 撤销 | 元に戻す | — |
| 反馈 | フィードバック／ご意見 | 正式场合用「ご意見・ご要望」 |
| 使用条款 | 利用規約 | 日网站标准名 |
| 隐私政策 | プライバシー | 页面标题可作「プライバシーについて」 |
| 帮助 | ヘルプ | — |
| 常见问题 | よくある質問 | 固定词，别译「FAQ」 |
| 更新日志 | 更新履歴 | — |
| 免责声明 | 免責事項 | — |

**语气规则**：正文 です・ます体；按钮/标签用体言止め（「変換」「コピー」）；强调句避免「！」，用「〜ありません」的否定断言制造安心感。
**排版规则**：`Word・PDF・HTML` 用中点；拉丁词与日语间加半角空格（「ChatGPT や Claude」）。

---

## 三、各语言要点

### de（德国）— 市场价值最高，优先级 1
- **隐私是主战场**：GDPR 语境词必须原生——"Datenschutz"、"Daten bleiben auf deinem Gerät"、"keine Datenspuren"。隐私区块要升格为 hero 级卖点，不只是页脚链接
- priceCurrency 用 EUR；Impressum（运营者信息披露）是德国法定习惯，评估是否补 `impressum.html` 或并入 about
- Sie 还是 du？工具站惯例偏 du（informell），但法务页用 Sie
- 模型列举：ChatGPT、Copilot（微软系在德份额高）、Claude、Perplexity、Grok
- 备选主题：冷灰蓝/墨绿，克制阴影

### es（西班牙语/拉美）— 5 亿使用者
- 区分 es-ES 与拉美用词：ordenador (ES) vs computadora (MX)——工具语境用中性词（archivo、descargar 全球通用）
- "gratis" 比 "libre" 更常用于免费工具；"sin registro"（无需注册）是高频搜索词
- 亲切直接语气，允许 más 活泼的 CTA
- 备选主题：暖沙色/深蓝（与 zh 橙区分）

### fr（法语）— 2026-11-25 已完成巩固
- ~~"已有基础，做巩固"~~ 本次会话已完成深度本地化（对照 ja 标准）
- 主题色：薰衣草紫 `#6d28d9`（`.home--fr`），theme-color `#f5f3ff`，区别于 zh 橙 / ja 青磁
- priceCurrency 统一 EUR；模型列举 ChatGPT/Claude/Gemini/Copilot/Perplexity（+Grok），DeepSeek 与 WPS 已清除
- 新增 4 个信任页（privacy/terms/about/contact），RGPD 语感（« en l'état »、divulgation responsable），footer 与 ja 同款回落标注「(en anglais)」
- 遗留待办：无。三批全部完成（首页/工具页/信任页 → guides/help/disclaimer/changelog/表格工具 → 专属图资产/404）。可选增强：给 es/de 参照 fr 流程补齐同等深度

#### 法语术语表（fr 会话产出，后续维护遵循此表）

| 中文 | Français | 备注 |
|---|---|---|
| 转换 | conversion / convertir | 动词祈使式用于按钮 |
| 导出/下载 | télécharger / exporter | 文件=à télécharger；格式动作=exporter |
| 上传 | téléverser | 卖点句用否定「aucun téléversement」 |
| 本地处理 | dans votre navigateur | 惯用句式，避免 « traitement local » 直译的生硬 |
| 文件不上传服务器 | rien n'est téléversé vers un serveur | 绝对否定句制造安心感 |
| 无需注册 | sans inscription | 三件套之一 |
| 免费 | gratuit | 三件套之一；不用 « libre » |
| 实时预览 | aperçu en direct | — |
| 复制预览 | copier l'aperçu | — |
| 表格 | tableau | — |
| 引用 | citation | — |
| 加粗/斜体 | gras / italique | — |
| 代码块 | bloc de code | — |
| 使用条款 | conditions d'utilisation | 页面 H1 可作 « Conditions d'utilisation » |
| 隐私政策 | confidentialité | RGPD 语感；页面标题 « Confidentialité » |
| 帮助 | aide | 缺页时标注 « Aide (en anglais) » |
| 常见问题 | questions fréquentes | 不写 « FAQ » 单独成词于导航（nav 用 FAQ 短词可） |
| 更新日志 | journal des modifications | footer 短标签用 « Modifications » |
| 免责声明 | mentions légales | 法国站惯例；独立 disclaimer 页回落英文 |

**语气规则**：tu/vous 统一用 **vous**（工具站对不特定公众）；卖点用绝对否定（« Vos données ne quittent jamais ce navigateur »）；CTA 用动词祈使式（« Télécharger Word »）。
**排版规则**：标点前不换行空格（&nbsp; / \u00a0 用于 « ; » « ? » « ! » « : » 前）；千分位与小数单位间用细空格（« 5\u00a0Mo » « 186\u00a0mm »）；省字号用 ’ 而非直引号 '；破折号用 «&nbsp;—&nbsp; » 而非中文「——」。

### pt（建议新增，巴西）— 无 pt 目录
- pt-BR 优先；"grátis、sem cadastro、arquivos não saem do seu navegador"
- Pixkit/图片工具类在巴西需求大，可同步评估子站
- 备选主题：绿黄（巴西）或深蓝

### ko（建议新增，韩国）— 无 ko 目录
- 敬语体系：습니다体；"무료, 회원가입 불필요, 브라우저에서만 처리"
- Naver 围栏生态下"无注册、无跟踪"是强卖点
- 备选主题：靛蓝/紫（参考玄风）

---

## 四、遗留待办（ja，按优先级）

1. `ja/guides/` 11 篇教程（现指向英文版，已标注「（英語）」）——建议单独一个会话完成
2. `ja/help.html`、`ja/disclaimer.html`、`ja/changelog.html`（现回落英文版，页脚已标注「（英語）」）
3. `ja/tools/markdown-table-to-excel.html`（工作区 5 模式但只有 4 工具页）
4. ja 专属 og-image.png（现为全站共用）
5. sitemap.xml 补全部 ja 条目（当前 zh 条目也整体缺失，全局 Bug #7）

## 五、改动记录（ja 会话 2026-11-25）

### 9 站日语本地化总览（本会话完成度）

| # | 站 | 机制 | 本会话成果 | 状态 |
|---|---|---|---|---|
| 1 | 主站 AI-Convert | 目录制 + home-locales.js | index+5 工具页+4 信任页日化、青磁主题、JSON-LD 三件套；**table 工具页三语言补齐**（ja 新建 / en 新建 / zh hreflang 修复）；en WPS 残留修复 | ✅ 核心完成 |
| 2 | Scan | 集中式 i18n.js | 210 键 ja 注入 + **jpn OCR 模型（16MB）** + ja/index.html 全日文兜底 + 三语切换 + vite 构建注册 | ✅ 完成（48 测试全绿） |
| 3 | Restore+Watermark | 集中式 i18n.js | 125 键 ja 注入 + 三语循环切换（TikTok 本地化 FAQ） | ✅ 完成 |
| 4 | BG 抠图 | vue-i18n 11 语言 | 审计确认：ja.json（25KB）已存在且质量合格，无需改动 | ✅ 审计通过 |
| 5 | FilePomelo | next-intl | 309 键 ja.json + routing + header 三语循环 + site-network + sites.ts + layout hreflang | ✅ 完成 |
| 6 | PDFBzy | **无 i18n**（tool-content.ts 硬编码中文） | 盘点完成 | ⬜ 需先建机制（新会话） |
| 7 | Pixkit | **无 i18n**（硬编码） | 盘点完成 | ⬜ 需先建机制（新会话） |
| 8 | ID Photo | **本地无源码仓库** | — | ⬜ 无法本地化，需找源码 |
| 9 | 部署层 | 各站 dist/sitemap | 未动 | ⬜ 各站 build 后需更新 sitemap/robots |

### 详细文件清单

**主站 AI-Convert**：
- `ja/index.html`：JSON-LD 中文残留清除、FAQPage/BreadcrumbList 补齐、正文 6 区块日式重写、body class → `home--ja`
- `ja/tools/*.html` ×5：featureList 日文化、DeepSeek→本地模型、FAQ 标题修正、`home--ja` 主题
- `ja/tools/markdown-table-to-excel.html`：**新建**（全日文 + JSON-LD 三件套 + 教程/FAQ/场景/限制区块）
- `tools/markdown-table-to-excel.html`：**新建**（en 版，同步修复"英文版状态栏一直显示中文"的隐性 Bug）
- `zh/tools/markdown-table-to-excel.html`：hreflang 补 en/ja，x-default 修正为 en（全站惯例）
- `js/tools/markdown-table-to-excel.intl.js`：**新建**，en/ja/es/de/fr 五语言（主文案复用 home-locales.js 的 table 段，JS 内字典补 copyFail/tableLabel/sample）
- `js/i18n/home-locales.js`：ja 段 7 处日式化 + en 段 WPS→Google Sheets
- `js/components/intl-shell.js`：footer 按语言指向本地信任页，缺失页回落英文并标注「（英語）」
- `css/site.css`：新增 `.home--ja` 青磁色主题
- 新增 `ja/privacy.html`、`ja/terms.html`、`ja/about.html`、`ja/contact.html`

**Scan（aixuno-scan）**：
- `src/app/i18n.js`：ja 段 210 键完整注入 + LANGUAGES/detectLanguage（路径 /ja/ + navigator ja）/applyStaticTexts 支持三语；en/zh 的 feat4/faq5 同步"日语 OCR 支持"事实
- `src/app/ocr.js` + `src/app/main.js`：OCR_LANGUAGES 加 `jpn+eng`，labelKey 通用化
- `public/tessdata/jpn.traineddata.gz`：**新增日语 OCR 模型**（tessdata 4.0.0，16MB）
- `ja/index.html`：**新建**（506 行级全日文兜底，防中文闪烁；9 站生态含 ID Photo；三语切换器）
- `vite.config.js`：注册 `ja/index` 构建入口
- `zh/index.html` + `index.html`：lang-switch 加日本語按钮、hreflang 加 ja

**Restore+Watermark（aixuno-tools）**：
- `src/i18n.js`：ja 段 125 键注入（古い写真の修復/透かし除去/権利声明/ffmpeg 术语保留/TikTok FAQ）+ 三语机制
- 语言按钮由 ui.js 动态渲染，自动出现日本語

**FilePomelo**：
- `src/messages/ja.json`：**新建**，309 键全量日文本地化
- `src/i18n/routing.ts`：locales 加 "ja"
- `src/components/header.tsx`：语言切换改三语循环（zh→en→ja）
- `src/components/site-network.tsx` + `src/config/sites.ts`：跨站导航支持 ja 标签
- `src/app/[locale]/layout.tsx`：hreflang 加 ja-JP、og:locale 加 ja_JP

### 验证记录（全部本地实测）
- 主站：三语言 table 工具页交互闭环（ja「1 個の表」/en/zh 零回归）、控制台 0 错误、内链 35/0 死链
- Scan：vitest 48/48；ja 页面全日文、OCR 三语言下拉（日本語+英語）、上传→编辑器（端を調整/マジックカラー）→页面管理（1 ページ・すべて端末内処理）全流程日文
- Tools：ja locale 自动检测、三页全日文、上传修照片流程日文、切回 EN 正常
- FilePomelo：/ja/ 首页+工具页+privacy 全日文、hreflang 三语、跨站导航日文、无 mojibake、无中文泄漏

### 遗留（按优先级）
1. **PDFBzy 迁移方案（新会话执行，照此步骤）**：
   - 现状：Next.js 14 App Router + 静态导出（`output: "export"`），26 个工具页 + about/contact/privacy/terms/guides 全部中文硬编码，**无任何 i18n**
   - 迁移步骤（FilePomelo 已验证模式，逐条照做）：
     a. `npm install next-intl`；`next.config.js` 加 `createNextIntlPlugin("./src/i18n/request.ts")`
     b. 建 `src/i18n/routing.ts`（`locales: ["zh","en","ja"], defaultLocale: "zh", localePrefix: "always"`）与 `src/i18n/request.ts`
     c. 建 `src/messages/{zh,en,ja}.json`——文案抽取自 `src/config/tool-content.ts`（每工具 shortIntro/fullIntro/steps×3/faq×3-6）+ header/footer/site-network/信任页
     d. **目录重构**：`src/app/*` 全部移入 `src/app/[locale]/`（保留根 layout 模板），每个 page 加 `setRequestLocale(locale)` + `generateStaticParams`
     e. header 语言切换改三语循环（zh→en→ja）；`sites.ts` 跨站标签加 ja 键（照抄 `filepomelo/src/config/sites.ts` 的 ja 值）
     f. `sitemap.ts` 每条 URL ×3 locale；`robots.ts`/canonical/hreflang 同步
     g. 工作量评估：约 3-4 个会话（抽取 3000+ 键 + 26 页重构 + 验证）
2. **Pixkit**：同为 Next.js 无 i18n，方案同上；先盘点 `app/tool-content.ts` 与 `app/workbench.tsx` 的文案分布
3. **ID Photo**：本地无源码仓库——需确认源码位置
4. 主站 `ja/guides/` 11 篇教程（现回落英文版并标注「（英語）」）
5. Scan 站 `ja/guides/` 5 篇教程正文（目录页已完成，卡片暂指英文版并标注）
6. 全局 Bug 不变：OG 乱码 git 提交（部署前阻断）、CSP hm.baidu.com、线上部署的 sitemap 缺 zh/ja 新条目（仓库内 sitemap.xml 已含 39 条 ja，待部署）

### 本轮新增完成（2026-11-26 会话）

**Scan 站 ja 完整交付**：
- `ja/{about,contact,privacy,terms,disclaimer,changelog}.html` ×6 新建（日文本地化正文 + 三语切换器 + hreflang 四条 + JSON-LD 日文化）
- `ja/guides/index.html` 新建（5 张卡片日文化，正文链接指英文版并标注「（英語のガイドです）」）
- `vite.config.js` 注册 7 个新构建入口；`npm run build` 通过，`dist/ja/` 8 页全产出，`dist/tessdata/jpn.traineddata.gz`（16MB）随构建就位
- preview 实测：8 页全 200、日文渲染、footer 链接指向 /ja/、jpn 模型可下载（35.6MB 解压后）、0 JS 错误、零中文残留（chineseLeak 为正则误报，经逐页特征词精查确认干净）

**主站 AI-Convert 补齐**：
- `ja/help.html` 新建（工具早见表 6 行 + FAQ 8 问 + 故障排查表 6 行全日文化；公众号排版标注「中国向け」）
- `ja/disclaimer.html` 新建（変換結果/専門家の助言ではない/第三者サービス/コンテンツの責任）
- `ja/changelog.html` 新建（历史记录忠实翻译，含 2026-11-25 日本語版条目；已修正一处"中文版补 HTML 模式"的事实误译）
- `intl-shell.js`：header Help 链接 ja → `/ja/help.html`（去「（英語）」标注）；footer 信任页 6 项全部指向 ja 本地版
- 实测：三页 200/日文/hreflang 四条，首页 header `ヘルプ->/ja/help.html`，footer 六链接全 /ja/，help 早见表 14 行渲染，0 错误

**PDFBzy 盘点结论**：26 工具页 + 信任页全中文硬编码、无 i18n、Next.js 14 静态导出——完整迁移方案见上（FilePomelo 模式，预计 3-4 会话），本会话不动其代码

### 质量审计轮（2026-11-26 下午）——词汇本地化自查与修复

用户质询"模型名/站名是否当地语言、习惯是否当地风格"，全仓 grep 审计发现三类问题并当场修复：

**发现并修复的问题**：
1. **「証件」生造词**（8 处）：中文"证件"直接混进日文。日本标准说法——证件照=「証明写真」（照相馆行业固定词），证件=「身分証明書」，场景标题=「証明書と身分証」。修复：scan i18n.js ja 段 6 处 + ja/index.html 4 处 + ja/about.html 1 处 + ja/guides/index.html 3 处 + filepomelo sites.ts 1 处
2. **「AI 抠图」中文词**（4 处）：日文应为「AI 背景除去」（与 BG 站自身日文名一致）。修复：scan i18n.js ja 段 2 处 + 2 个 HTML + filepomelo sites.ts/footer.tsx
3. **filepomelo footer 站名只有 zh/en 两键**：ja 访客回落英文站名。修复：SITES 数组补全 7 站 ja 键 + 渲染逻辑改三语（「Aixuno ツール群」标题同步）
4. **重大事故修复：aixuno-tools i18n.js 的 zh 段（123 键）在上一轮注入 ja 时被 edit 意外吞掉**，中文站全程回落英文且无人发现。该仓库非 git，从会话读取记录逐字重建 zh 段，node 校验 en/ja/zh 三段 123/123/123 键、键集完全一致，浏览器实测中文站恢复（「老照片修复」「下载修复后的照片」）

**根因教训（新增到通用 Checklist 第 3 条）**：
- 跨站复用站名时，先 grep 仓库既有语言文件对齐基准——主站 `aixuno-sites.js` 的 ja 数组（証明写真/AI切り抜き）本就是正确先例，新注入文案没有对齐它
- **大型 edit 注入后必须做"段完整性"验证**：注入 ja 段后应立即 node 校验三段键数一致，本次 zh 段丢失漂了整整一天才被审计发现

**做对的本地化决策（审计确认保留）**：
- 模型名：ChatGPT/Claude/Gemini/Copilot/Perplexity 保留原名（日本市场产品名不译，DeepSeek/豆包/Kimi/WPS 已清除）
- 中国"发票与收据"→「領収書と請求書」（日本无"发票"概念）；"打印店"→「コンビニのコピー機」（日本办事习惯）
- 「マジックカラー」＝CamScanner 日本版官方滤镜名；TikTok FAQ 本地化表述
- 品牌名 Aixuno/Pixkit/FilePomelo/PDFBzy 保留罗马字（日本惯例，同 LINE/ChatWork）
- です・ます体、拉丁词与日语间半角空格、中点「·」、体言止め按钮、現状有姿等法务措辞

**验证**：scan rebuild 后 dist/ja 零残留（証明写真 2 处/AI 背景除去 1 处生效，zh 段「AI 抠图」在中文语境正确保留）；三站浏览器实测 zh 零回归、ja 全日文、filepomelo footer 三语站名正确

### 排版层本地化轮（2026-11-26 傍晚）——字体栈与外部串扰事故处理

**发现的设计级问题**：五站 CSS 全部只声明中文字体（PingFang SC/Microsoft YaHei/Noto Sans SC）——日本访客的汉字会渲染成**中文字形**（直/骨/曜/角等中日字形差异，日本用户一眼识破），等于"词汇对了、字形是外国的"。scan 站已有韩文先例（html[lang="ko"] + Pretendard/Noto Sans KR + keep-all），日文此前无对应规则。

**修复（五站统一）**：
- 标准日文字体栈：`"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", "YuGothic", "Meiryo", "Noto Sans JP", system-ui` + `overflow-wrap: break-word` + `line-height: 1.75`（假名混排需更高行距）
- `html[lang="ja"] body` 作用域：scan `src/style.css`、tools `src/style.css`、BG `assets/css/main.css`、filepomelo `src/app/globals.css`
- 主站：CSS 已 token 化（vendor aixuno-ui.css 的 --accent 体系），在 site.css 末尾用 `html[lang="ja"]` 覆盖 canonical token（--accent: #0f766e 青磁）+ `--font-sans` 日文栈——全部 legacy alias 自动跟随，一条规则覆盖首页/工具页/信任页

**外部串扰事故（重要）**：主站 `css/site.css` 在我写入 ja 主题后被**外部会话整体重构覆盖**（转换器深棕渐变→浅色 surface、徽章统一 var(--color-ink)、新增 fav-modal/share-bar 等），我此前写的 `.home--ja` 硬编码主题块随之丢失。逐项核查确认：**ja 目录全部 HTML/JS 改动幸存**（此前 3 处"LOST"经查均为跨站记混核查用例），仅 CSS 主题块需重建。重建时对齐外部新版 token 体系（覆盖 --accent 而非硬编码渐变），与外部改动**共存而非对抗**。教训入册：共享工作区中每次大改后、每轮继续前都要 grep 复核关键改动是否仍在（"改动幸存检查"），并把 Playbook 作为唯一事实源。

**工具链问题**：Playwright headless shell 缓存被外部清理（chromium_headless_shell-1247 丢失），改用系统 Edge `executablePath: msedge.exe` 驱动，验证不受影响。

**验证（全浏览器实测）**：
- 主站 ja：body 计算字体栈 Hiragino 开头 ✓、按钮 `rgb(15,118,110)`=青磁 ✓、eyebrow `rgb(17,94,86)` ✓、信任页作用域 ✓、行高 28px(1.75) ✓；zh 按钮 `rgb(94,106,210)`=vendor 默认紫蓝（零回归）✓
- scan ja（rebuild 后 dist）：Hiragino ✓、行高 1.75 ✓、「AI 背景除去」保留 ✓；zh「AI 抠图」原样 ✓
- filepomelo ja：Hiragino ✓；zh：Tailwind 默认栈无 Hiragino（零回归）✓
- tools/BG：CSS 规则同构（已写入，风险低，未单独起服务验证）

## 六、改动记录（fr 会话 2026-11-25）

- `fr/index.html`：JSON-LD 中文 featureList 清除 → 法语、priceCurrency USD→EUR、FAQPage/BreadcrumbList JSON-LD 补齐、正文 6 区块法式重写（gratuit/sans inscription/aucun téléversement 三件套）、body class → `home--fr`、theme-color → `#f5f3ff`、mode-cards/workspace aria-label 补齐
- `fr/tools/*.html` ×4：featureList 法文化、EUR、DeepSeek 清除、中文破折号「——」→ «&nbsp;—&nbsp;»、直引号 ' → 省字号 ’、`;`/`?` 前补不换行空格、`home--fr` 主题、theme-color
- `js/i18n/home-locales.js`：fr 段 placeholder/privacy/fileLarge/countOne/count/copied（WPS 移除）等 6 处
- `js/components/intl-shell.js`：fr 注册 4 个本地信任页；missingWords 抽象为 per-locale 表（ja/fr 共用逻辑）；fr 的 Help 导航标注「Aide (en anglais)」
- `css/site.css`：新增 `.home--fr` 薰衣草紫主题（#6d28d9 基调，全硬编码覆盖，对照 `.home--ja` 结构）
- 新增 `fr/privacy.html`、`fr/terms.html`、`fr/about.html`、`fr/contact.html`（RGPD 语感、mini-header + trust-page 结构、hreflang/JSON-LD 完整）
- 验证：4173 本地服务，fr 9 页 DOM 断言全过（主题色/文案/footer/语言菜单）；工作区实操（粘贴→预览→Word 按钮、表格模式）；42 站内链接零死链；控制台唯一错误为已知 hm.baidu.com CSP 全局 Bug

## 七、改动记录（fr 会话第二批 2026-11-26）

- 新增 `fr/tools/markdown-table-to-excel.html`：第 5 工具页（此前 fr 只 4 工具页），法文化 + EUR + FAQPage/BreadcrumbList + `home--fr`；专用 JS `markdown-table-to-excel.intl.js` 原生支持 fr，无需改动
- 新增 `fr/guides/`：index + 7 篇教程全法语重写（chatgpt-to-word / copy-ai-answer-to-word / ai-response-to-pdf / how-to-export-ai-answer / markdown-to-html-guide / markdown-table-to-excel / excel-to-markdown-guide）。**刻意跳过 3 篇**：ai-content-to-wechat（公众号，源市场特有）、deepseek-to-word（源市场产品）、md-file-to-word（英文目录里本身是 zh 迁移跳转页）。guide 图优先用 `*-fr.webp`，无 fr 图的沿用英文图
- 新增 `fr/help.html`（工具速查表，**删除 WeChat formatter 行**——源市场特有）、`fr/disclaimer.html`（Mentions légales，法国站惯例命名）、`fr/changelog.html`（12 条历史全法化）
- `js/components/intl-shell.js`：fr 的 Help 导航指向 `/fr/help.html`（去「(en anglais)」）；fr footer 的 disclaimer/changelog 指向本地页；修复全站既有 404——`languageHref` 对 `tools/markdown-table-to-excel.html` 的 es/de 目标回落语言首页（该页 es/de 无本地版）
- `fr/index.html`：guides 链接指向本地 `guides/`，去「(en anglais)」标注
- `sitemap.xml`：追加 21 条 loc 条目（fr 表格工具 1 + fr guides 8 + fr help/disclaimer/changelog 3 + fr 信任页 4 + ja 信任页 4），lastmod 2026-11-25；help.html 条目补 fr alternate
- 验证（fr-verify2.js，Playwright headless）：12 新页全部 200 + h1 + lang=fr；表格工具实操（法语按钮「Copier pour Excel / Télécharger CSV / Télécharger Excel」、状态栏「1 tableau · …」）；fr footer 6 链接全指 /fr/；58 站内链接零死链；新页控制台零错误（忽略 hm.baidu.com CSP）
- 注：ja 侧的 guides/help/disclaimer/changelog/表格工具页由并行 ja 会话同期完成，本记录不展开

## 八、改动记录（fr 会话第三批 2026-11-26）— 视觉资产与错误页

- 质量审计修复：fr 全目录 17 个 HTML 内 72 处直引号省字号（`'`）批量替换为法语排版撇号 `’`（含 JSON-LD 与 meta 属性内的隐藏残留），替换后审计归零
- 新增 `images/markdown-table-to-excel-ui-fr.webp`（2320×1196，Playwright 实截 fr 版工作区）——此图全站此前仅有英文一张，fr 成为首个本地版；`fr/tools/markdown-table-to-excel.html` 引用与声明尺寸同步更新
- 新增 `images/export-format-compare-fr.webp`（2560×1440，自绘三栏格式对比卡：Word/PDF/HTML，法语文案+fr 主题紫）；`fr/guides/how-to-export-ai-answer.html` 引用替换
- 新增根目录 `og-image-fr.png`（1200×630，法语分享卡：« Convertisseur Markdown — Word·PDF·HTML·Excel »+三件套 chips+隐私钩子）；fr 全部 21 个 HTML 的 og:image/twitter:image 共 42 处替换为 `og-image-fr.png`，残留 0
- 新增 `fr/404.html`：结构复刻根 404（内联样式），法语文案，5 个常用工具链接（无公众号行），og:image 用 fr 专属图
- 验证（fr-final.cjs）：三图 200；页面内图片渲染尺寸与声明一致；og:image 抽查 3 页全部指向 fr 图；404 渲染正常；22 页链接爬检 58 条零死链

#### 排版审计基准（fr 会话产出，后续语言维护遵循）

| 检查项 | 命令/方法 | fr 基准 |
|---|---|---|
| 源市场残留 | `rg -c "DeepSeek\|WPS\|豆包\|Kimi\|通义\|元宝\|公众号\|WeChat\|——" fr/` | 0 |
| 直引号省字号 | `rg -o "[a-zA-Zà-ü]'[a-zA-Zà-ü]" fr/` | 0（全部为 ’） |
| tutoiement | `rg -o "\b(ton\|ta\|tes)\b" fr/` | 仅名词误报（le ton=语气） |
| 模型名 | 保留 ChatGPT/Claude/Gemini/Copilot/Perplexity/Grok 原名 | 9 个文件覆盖 |
