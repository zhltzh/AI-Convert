# 本机预览与验收

直接打开 `index.html` 可以查看页面。需要验收文件上传、CDN 依赖与下载流程时，在项目目录运行：

```powershell
node scripts/local-preview.mjs
```

然后访问 `http://127.0.0.1:4173`；按 `Ctrl + C` 可停止服务。

此脚本只读取当前项目目录中的静态文件，不会上传任何文件，也不会启动后端服务。
