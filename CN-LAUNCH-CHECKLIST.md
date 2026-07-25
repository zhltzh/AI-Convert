# 中文站上线清单

## 发布前

- [ ] 使用 `test-fixtures` 中的 DOCX、PDF、CSV 在浏览器真实上传并确认复制/下载结果。
- [ ] 检查空文件、超 20MB、旧 `.doc`、扫描 PDF、损坏文件的中文提示。
- [ ] 验证移动端的四卡片切换、上传、复制与下载。
- [ ] 检查所有中文页只有一个 H1，且 Title、Description 与页面功能一致。
- [ ] 验证 JSON-LD、sitemap、robots.txt、llms.txt。

## 域名与收录

- [ ] 购买并绑定正式 `.com` 域名后，将 sitemap、canonical、hreflang 中的 GitHub Pages 地址更新为正式域名。
- [ ] 在 Google Search Console 验证域名并提交 sitemap。
- [ ] 在百度搜索资源平台验证站点并提交 sitemap。
- [ ] 保留中文 `/` 与英文 `/en/` 的独立页面，不使用 IP 强制跳转。

## 隐私与统计

- [ ] 部署后再填写 GA4、Microsoft Clarity、百度统计的站点 ID。
- [ ] 仅发送匿名事件：工具选择、文件类型、成功/失败、复制/下载；不发送文件名、文件内容或编辑器文本。
- [ ] 对编辑区与预览区启用会话回放遮罩，并更新隐私页说明。
