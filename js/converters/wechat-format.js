const themes = {
  ink: { accent: '#111111', soft: '#f5f5f5' },
  forest: { accent: '#2f6f56', soft: '#edf6f1' },
  ocean: { accent: '#2563a8', soft: '#edf5ff' },
};

export function formatWechatHtml(html, themeName = 'ink') {
  const theme = themes[themeName] ?? themes.ink;
  const documentNode = new DOMParser().parseFromString(html, 'text/html');
  const body = documentNode.body;
  body.style.cssText = 'font-size:16px;line-height:1.85;color:#333;letter-spacing:0.02em;word-break:break-word;';
  body.querySelectorAll('h1').forEach((node) => { node.style.cssText = `margin:32px 0 24px;padding-bottom:12px;border-bottom:2px solid ${theme.accent};font-size:25px;line-height:1.4;color:${theme.accent};`; });
  body.querySelectorAll('h2').forEach((node) => { node.style.cssText = `margin:30px 0 16px;padding-left:12px;border-left:4px solid ${theme.accent};font-size:20px;line-height:1.5;color:${theme.accent};`; });
  body.querySelectorAll('h3').forEach((node) => { node.style.cssText = `margin:24px 0 12px;font-size:18px;line-height:1.5;color:${theme.accent};`; });
  body.querySelectorAll('p').forEach((node) => { node.style.cssText = 'margin:0 0 18px;'; });
  body.querySelectorAll('blockquote').forEach((node) => { node.style.cssText = `margin:22px 0;padding:14px 16px;border-left:4px solid ${theme.accent};background:${theme.soft};color:#555;`; });
  body.querySelectorAll('pre').forEach((node) => { node.style.cssText = 'overflow:auto;margin:20px 0;padding:14px;background:#f7f7f7;border-radius:4px;font-size:13px;line-height:1.65;'; });
  body.querySelectorAll('code').forEach((node) => { node.style.cssText += 'font-family:Consolas,monospace;'; });
  body.querySelectorAll('table').forEach((node) => { node.style.cssText = 'width:100%;margin:20px 0;border-collapse:collapse;font-size:14px;'; });
  body.querySelectorAll('th').forEach((node) => { node.style.cssText = `padding:8px;border:1px solid #ddd;background:${theme.soft};color:${theme.accent};text-align:left;`; });
  body.querySelectorAll('td').forEach((node) => { node.style.cssText = 'padding:8px;border:1px solid #ddd;text-align:left;'; });
  body.querySelectorAll('img').forEach((node) => { node.style.cssText = 'display:block;max-width:100%;height:auto;margin:20px auto;'; });
  body.querySelectorAll('ul,ol').forEach((node) => { node.style.cssText = 'margin:0 0 18px;padding-left:1.5em;'; });
  body.querySelectorAll('li').forEach((node) => { node.style.cssText = 'margin:7px 0;'; });
  return body.innerHTML;
}
