import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'out');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const relativePath = normalize(pathname).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '');
    let filePath = resolve(root, relativePath || 'index.html');
    if (filePath !== root && !filePath.startsWith(root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      if (!extname(filePath)) filePath = join(filePath, 'index.html');
    }
    const contents = await readFile(filePath);
    response.writeHead(200, { 'content-type': mime[extname(filePath)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    response.end(contents);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Serving static out/ at http://127.0.0.1:${port}`));
