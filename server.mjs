import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const COMPRESSIBLE_EXTS = new Set([
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.svg',
  '.txt',
  '.md'
]);

const IMMUTABLE_MEDIA_EXTS = new Set([
  '.glb',
  '.gltf',
  '.mp3',
  '.wav',
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico'
]);

const server = http.createServer((req, res) => {
  try {
    const rawUrl = (req.url || '/').split('?')[0];
    let decodedPath = decodeURIComponent(rawUrl);
    if (decodedPath === '/' || decodedPath === '') {
      decodedPath = '/index.html';
    }

    // Prevent path traversal outside __dirname
    let filePath = path.resolve(__dirname, '.' + path.posix.normalize('/' + decodedPath));
    if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    // Also support requests prefixed with /public/ if the file is at /public/... or root
    if (!fs.existsSync(filePath) && decodedPath.startsWith('/assets/')) {
      filePath = path.resolve(__dirname, 'public', '.' + path.posix.normalize('/' + decodedPath));
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const cacheControl = IMMUTABLE_MEDIA_EXTS.has(ext) ? 'public, max-age=86400' : 'no-cache';

    const commonHeaders = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    };

    const rangeHeader = req.headers.range;
    if (rangeHeader && /^bytes=\d*-\d*$/i.test(rangeHeader.trim()) && stat.size > 0) {
      const [startStr, endStr] = rangeHeader.trim().replace(/^bytes=/i, '').split('-');
      let start = startStr ? Number.parseInt(startStr, 10) : 0;
      let end = endStr ? Number.parseInt(endStr, 10) : stat.size - 1;
      if (!startStr && endStr) {
        start = Math.max(0, stat.size - end);
        end = stat.size - 1;
      }
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= stat.size) {
        res.writeHead(416, {
          ...commonHeaders,
          'Content-Range': `bytes */${stat.size}`
        });
        res.end();
        return;
      }
      end = Math.min(end, stat.size - 1);
      const chunkLength = end - start + 1;
      res.writeHead(206, {
        ...commonHeaders,
        'Content-Length': chunkLength,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const rangeStream = fs.createReadStream(filePath, { start, end });
      rangeStream.on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      res.on('close', () => {
        if (!rangeStream.destroyed) rangeStream.destroy();
      });
      rangeStream.pipe(res);
      return;
    }

    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    const useGzip =
      req.method === 'GET' &&
      COMPRESSIBLE_EXTS.has(ext) &&
      stat.size >= 1024 &&
      /\bgzip\b/i.test(acceptEncoding);

    if (useGzip) {
      res.writeHead(200, {
        ...commonHeaders,
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding'
      });
      const stream = fs.createReadStream(filePath);
      const gzip = zlib.createGzip({ level: 6 });
      stream.on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      gzip.on('error', () => {
        res.end();
      });
      res.on('close', () => {
        if (!stream.destroyed) stream.destroy();
      });
      stream.pipe(gzip).pipe(res);
      return;
    }

    res.writeHead(200, {
      ...commonHeaders,
      'Content-Length': stat.size
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end();
    });
    res.on('close', () => {
      if (!stream.destroyed) stream.destroy();
    });
    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  }
});

process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err?.message || err);
});
process.on('unhandledRejection', (err) => {
  console.error('[server] unhandledRejection:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chua Online server listening on http://localhost:${PORT}`);
});
