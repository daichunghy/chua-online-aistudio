import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { sanitizeVisitorPayload } from './src/logic/modules/visitor-presence.mjs';
import { getLocalDateKey } from './src/logic/modules/daily-dharma.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

const TTS_CACHE = new Map();
const TTS_CACHE_MAX = 180;

// Real-time server-authoritative visitor presence state
const ACTIVE_VISITORS = new Map();
const VISITOR_TTL_MS = 65000;
let visitorDayKey = getLocalDateKey();
let seenTodayVisitorIds = new Set();

function ensureVisitorDay() {
  const today = getLocalDateKey();
  if (today !== visitorDayKey) {
    visitorDayKey = today;
    seenTodayVisitorIds = new Set(ACTIVE_VISITORS.keys());
  }
}

function getVisitorSnapshot() {
  ensureVisitorDay();
  const visitors = [];
  for (const v of ACTIVE_VISITORS.values()) {
    visitors.push({
      clientId: v.clientId,
      nationalityId: v.nationalityId,
      characterModelKey: v.characterModelKey,
      zone: v.zone
    });
  }
  const onlineCount = visitors.length;
  const todayVisits = Math.max(onlineCount, seenTodayVisitorIds.size);
  return {
    ok: true,
    onlineCount,
    todayVisits,
    visitors: visitors.slice(0, 40)
  };
}

function broadcastVisitorSnapshot() {
  const payload = `event: presence\ndata: ${JSON.stringify(getVisitorSnapshot())}\n\n`;
  for (const [id, entry] of ACTIVE_VISITORS.entries()) {
    if (!entry.res || entry.res.writableEnded) continue;
    try {
      entry.res.write(payload);
    } catch {
      ACTIVE_VISITORS.delete(id);
    }
  }
}

function readJsonBody(req, maxBytes = 4096) {
  return new Promise((resolve) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total <= maxBytes) chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const visitorSweepTimer = setInterval(() => {
  const now = Date.now();
  let removed = false;
  for (const [id, entry] of ACTIVE_VISITORS.entries()) {
    if (now - entry.lastSeen > VISITOR_TTL_MS) {
      try {
        if (entry.res && !entry.res.writableEnded) entry.res.end();
      } catch {}
      ACTIVE_VISITORS.delete(id);
      removed = true;
      continue;
    }
    if (entry.res && !entry.res.writableEnded) {
      try {
        entry.res.write(': ping\n\n');
        entry.lastSeen = now;
      } catch {
        ACTIVE_VISITORS.delete(id);
        removed = true;
      }
    }
  }
  if (removed) broadcastVisitorSnapshot();
}, 25000);
visitorSweepTimer.unref?.();

function splitTtsChunks(text, maxLen = 175) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const limited = clean.slice(0, 480);
  const chunks = [];
  let remaining = limited;
  while (remaining.length > maxLen) {
    let splitAt = -1;
    for (const sep of ['. ', ', ', '; ', ' ']) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx > 40) {
        splitAt = idx + (sep === ' ' ? 0 : 1);
        break;
      }
    }
    if (splitAt <= 0) splitAt = maxLen;
    const part = remaining.slice(0, splitAt).trim();
    if (part) chunks.push(part);
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function fetchGoogleTtsChunk(text, lang = 'vi') {
  return new Promise((resolve, reject) => {
    const safeLang = /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lang) ? lang : 'vi';
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(safeLang)}&client=tw-ob`;
    const req = https.get(
      targetUrl,
      {
        timeout: 5500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://translate.google.com/'
        }
      },
      (resp) => {
        if (resp.statusCode !== 200) {
          resp.resume();
          reject(new Error(`TTS upstream HTTP ${resp.statusCode}`));
          return;
        }
        const parts = [];
        resp.on('data', (chunk) => parts.push(chunk));
        resp.on('end', () => resolve(Buffer.concat(parts)));
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error('TTS upstream timeout'));
    });
    req.on('error', reject);
  });
}

async function handleTtsRequest(req, res, urlObj) {
  const text = (urlObj.searchParams.get('text') || '').trim();
  const lang = (urlObj.searchParams.get('tl') || 'vi').trim();
  if (!text) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Missing text parameter' }));
    return;
  }

  const cacheKey = `${lang}:${text.slice(0, 480)}`;
  let audioBuf = TTS_CACHE.get(cacheKey);

  if (!audioBuf) {
    try {
      const chunks = splitTtsChunks(text, 175);
      const buffers = [];
      for (const chunk of chunks) {
        const buf = await fetchGoogleTtsChunk(chunk, lang);
        if (buf && buf.length > 0) buffers.push(buf);
      }
      audioBuf = Buffer.concat(buffers);
      if (audioBuf.length > 0) {
        if (TTS_CACHE.size >= TTS_CACHE_MAX) {
          const oldestKey = TTS_CACHE.keys().next().value;
          if (oldestKey) TTS_CACHE.delete(oldestKey);
        }
        TTS_CACHE.set(cacheKey, audioBuf);
      }
    } catch {
      res.writeHead(503, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'TTS unavailable' }));
      return;
    }
  }

  if (!audioBuf || audioBuf.length === 0) {
    res.writeHead(503, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Empty TTS response' }));
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuf.length,
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(audioBuf);
}

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

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || '/', `http://localhost:${PORT}`);
    if (parsedUrl.pathname === '/api/tts') {
      await handleTtsRequest(req, res, parsedUrl);
      return;
    }

    if (parsedUrl.pathname === '/api/visitors/stream' && req.method === 'GET') {
      const clean = sanitizeVisitorPayload({
        clientId: parsedUrl.searchParams.get('clientId'),
        nationalityId: parsedUrl.searchParams.get('nationalityId'),
        characterModelKey: parsedUrl.searchParams.get('charKey'),
        zone: parsedUrl.searchParams.get('zone')
      });
      ensureVisitorDay();
      seenTodayVisitorIds.add(clean.clientId);

      const prev = ACTIVE_VISITORS.get(clean.clientId);
      if (prev?.res && prev.res !== res && !prev.res.writableEnded) {
        try {
          prev.res.end();
        } catch {}
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.flushHeaders?.();

      ACTIVE_VISITORS.set(clean.clientId, {
        ...clean,
        res,
        lastSeen: Date.now(),
        joinedAt: prev?.joinedAt || Date.now()
      });

      broadcastVisitorSnapshot();

      req.on('close', () => {
        const current = ACTIVE_VISITORS.get(clean.clientId);
        if (current && current.res === res) {
          ACTIVE_VISITORS.delete(clean.clientId);
          broadcastVisitorSnapshot();
        }
      });
      return;
    }

    if (parsedUrl.pathname === '/api/visitors' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(getVisitorSnapshot()));
      return;
    }

    if (parsedUrl.pathname === '/api/visitors/presence' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const clean = sanitizeVisitorPayload(body);
      ensureVisitorDay();
      seenTodayVisitorIds.add(clean.clientId);
      const prev = ACTIVE_VISITORS.get(clean.clientId);
      const changed =
        !prev ||
        prev.nationalityId !== clean.nationalityId ||
        prev.characterModelKey !== clean.characterModelKey ||
        prev.zone !== clean.zone;
      ACTIVE_VISITORS.set(clean.clientId, {
        ...clean,
        res: prev?.res || null,
        lastSeen: Date.now(),
        joinedAt: prev?.joinedAt || Date.now()
      });
      if (changed) {
        broadcastVisitorSnapshot();
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(getVisitorSnapshot()));
      return;
    }

    if (parsedUrl.pathname === '/api/visitors/leave' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const clientId = String(body?.clientId || parsedUrl.searchParams.get('clientId') || '').trim();
      if (clientId && ACTIVE_VISITORS.has(clientId)) {
        const prev = ACTIVE_VISITORS.get(clientId);
        if (prev?.res && !prev.res.writableEnded) {
          try {
            prev.res.end();
          } catch {}
        }
        ACTIVE_VISITORS.delete(clientId);
        broadcastVisitorSnapshot();
      }
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
      res.end();
      return;
    }

    const rawUrl = parsedUrl.pathname || '/';
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
