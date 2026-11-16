import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const basePath = '/podium/';
let port = 4173;
let host = 'localhost';

for (let i = 2; i < process.argv.length; i += 1) {
  const argument = process.argv[i];
  if (argument === '--port') port = Number(process.argv[++i]);
  else if (argument === '--host') host = process.argv[++i];
  else throw new Error(`Unknown argument: ${argument}`);
}

if (!Number.isInteger(port) || port < 1 || port > 65535 || !host) {
  throw new Error('Usage: node scripts/preview.mjs [--port 4173] [--host localhost]');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};

const server = createServer(async (request, response) => {
  const reply = (status, message) => {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : message);
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    reply(405, 'Method not allowed');
    return;
  }

  try {
    const [rawPath, query] = (request.url ?? '/').split(/\?(.*)/s);
    const pathname = decodeURIComponent(rawPath);
    // Check before URL normalization so encoded parent segments cannot escape the mount.
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) {
      reply(400, 'Invalid path');
      return;
    }
    if (pathname === '/' || pathname === '/podium') {
      response.writeHead(302, { Location: basePath + (query === undefined ? '' : `?${query}`) });
      response.end();
      return;
    }
    if (!pathname.startsWith(basePath)) {
      reply(404, 'Not found');
      return;
    }

    let file = resolve(root, pathname.slice(basePath.length));
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) {
      reply(400, 'Invalid path');
      return;
    }
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(302, { Location: rawPath + '/' + (query === undefined ? '' : `?${query}`) });
        response.end();
        return;
      }
      file = resolve(file, 'index.html');
      info = await stat(file);
    }
    if (!info.isFile()) {
      reply(404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(file)] ?? 'application/octet-stream',
      'Content-Length': info.size,
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch (error) {
    if (error instanceof URIError) reply(400, 'Invalid path');
    else if (error.code === 'ENOENT' || error.code === 'ENOTDIR') reply(404, 'Not found');
    else {
      console.error(error);
      reply(500, 'Server error');
    }
  }
});

server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Preview: http://${host}:${port}${basePath}`));
