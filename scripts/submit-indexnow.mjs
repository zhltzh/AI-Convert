import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const siteUrl = "https://aixuno.com";
const indexNowKey = "2a5be19742cc4fcda58c03d2caa80b7c";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/aixuno\.com\/[^<]*)<\/loc>/g)].map(
  (match) => match[1],
);

if (urlList.length === 0) {
  throw new Error("No Aixuno URLs were found in sitemap.xml.");
}

if (process.argv.includes("--dry-run")) {
  console.log(`IndexNow payload is valid for ${urlList.length} URLs.`);
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "aixuno.com",
    key: indexNowKey,
    keyLocation: `${siteUrl}/${indexNowKey}.txt`,
    urlList,
  }),
});

if (!response.ok) {
  throw new Error(`IndexNow submission failed with HTTP ${response.status}.`);
}

console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
