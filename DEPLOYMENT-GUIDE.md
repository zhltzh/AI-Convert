# 中文站部署与域名切换

## 推荐部署方式

使用 Cloudflare Pages、Netlify 或 Vercel 部署本仓库的静态文件。项目不需要 Node 后端、数据库或登录系统；文件转换在用户浏览器中完成。

## 发布顺序

1. 将当前 `main` 分支推送到 GitHub。
2. 在静态托管平台连接 GitHub 仓库，发布目录选择仓库根目录，不填写构建命令。
3. 获得预览地址后，按 `CN-LAUNCH-CHECKLIST.md` 使用真实 DOCX、PDF、CSV 完成验收。
4. 购买并绑定正式 `.com` 域名，启用 HTTPS。
5. 将 `sitemap.xml`、`robots.txt`、页面中的 canonical 与 hreflang 地址改为正式域名。
6. 提交 Google Search Console 与百度搜索资源平台。
7. 最后填写免费的 GA4、Microsoft Clarity、百度统计站点 ID。

## 埋点边界

只记录匿名操作：工具选择、文件类型、成功或失败、复制或下载。绝不记录文件名、文件内容、Markdown 文本或导出文件。

## 部署后检查

- 首页与四个工具页返回 200。
- `robots.txt` 和 `sitemap.xml` 可访问。
- HTTPS、`_headers` 安全头、移动端页面正常。
- CDN 依赖无法加载时，有清楚的中文提示。
- 编辑区与预览区在会话回放工具中遮罩。
