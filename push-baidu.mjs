import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 百度推送配置
const BAIDU_TOKEN = 'cnA34bioMIc1GL0v';
const BAIDU_SITE = 'https://aixuno.com';
const PUSH_API = `http://data.zz.baidu.com/urls?site=${BAIDU_SITE}&token=${BAIDU_TOKEN}`;

// 记录文件路径
const PUSHED_FILE = join(__dirname, '.pushed-urls.json');

// 读取 sitemap
const sitemapPath = join(__dirname, 'sitemap-zh.xml');
const sitemapContent = readFileSync(sitemapPath, 'utf8');

// 提取所有 URL
const urlRegex = /<loc>([^<]+)<\/loc>/g;
const urls = [];
let match;
while ((match = urlRegex.exec(sitemapContent)) !== null) {
  urls.push(match[1]);
}

console.log(`从 sitemap-zh.xml 提取到 ${urls.length} 个 URL`);

// 读取已推送记录
let pushedUrls = [];
if (existsSync(PUSHED_FILE)) {
  try {
    pushedUrls = JSON.parse(readFileSync(PUSHED_FILE, 'utf8'));
  } catch (e) {
    pushedUrls = [];
  }
}

// 过滤出未推送的 URL
const newUrls = urls.filter(url => !pushedUrls.includes(url));
console.log(`待推送新 URL: ${newUrls.length} 个`);

if (newUrls.length === 0) {
  console.log('没有新 URL 需要推送');
  process.exit(0);
}

// 推送 URL
async function pushUrls() {
  try {
    const response = await fetch(PUSH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: newUrls.join('\n'),
    });

    const result = await response.json();
    console.log('推送结果:', result);

    if (result.success) {
      console.log(`成功推送 ${result.success} 个 URL`);
      
      // 更新已推送记录
      pushedUrls = [...new Set([...pushedUrls, ...newUrls])];
      writeFileSync(PUSHED_FILE, JSON.stringify(pushedUrls, null, 2), 'utf8');
      console.log('已更新推送记录');
    } else {
      console.error('推送失败:', result);
    }
  } catch (error) {
    console.error('推送出错:', error.message);
  }
}

pushUrls();
