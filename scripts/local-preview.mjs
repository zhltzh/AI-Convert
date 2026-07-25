/**
 * Minimal local static server for previewing AI Convert before deployment.
 * Usage: node scripts/local-preview.mjs [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const runtimeProcess = globalThis.process;
const port = Number(runtimeProcess?.argv?.[2]) || 4173;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function safePath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const absolute = resolve(root, requested);
  return absolute === root || absolute.startsWith(`${root}${sep}`) ? absolute : null;
}

export function createPreviewServer() {
  return createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const path = safePath(request.url || '/');
  if (!path) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    const contents = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
  });
}

if (runtimeProcess?.argv?.[1] && resolve(runtimeProcess.argv[1]) === fileURLToPath(import.meta.url)) {
  createPreviewServer().listen(port, '127.0.0.1', () => {
    console.log(`AI Convert local preview: http://127.0.0.1:${port}`);
  });
}
