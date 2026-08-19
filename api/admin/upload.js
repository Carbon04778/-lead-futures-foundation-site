// api/admin/upload.js
// Uploads an event image into the Supabase Storage bucket "event-images"
// and returns its public URL.
//
// The browser sends the file base64-encoded as JSON rather than as
// multipart form data, because Vercel's Node runtime gives us a parsed
// JSON body for free but no multipart parser — pulling in a dependency
// just for this would be the wrong trade.
//
//   POST /api/admin/upload
//   { filename: "golf.jpg", contentType: "image/jpeg", data: "<base64>" }

import { SUPABASE_URL, SUPABASE_KEY, requireAdmin, deny, readBody } from '../_supabase.js';

const BUCKET = 'event-images';
const MAX_BYTES = 5 * 1024 * 1024;   // 5 MB

// An allowlist, not a blocklist. Only these can be stored, so an .html or
// .svg file (both of which can carry scripts) can never be served from
// the bucket's public URL.
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
};

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return deny(res, 401, 'Please sign in again');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return deny(res, 405, 'Method not allowed');
  }

  const { filename, contentType, data } = readBody(req);

  if (!data) return deny(res, 400, 'No file data received');

  const ext = ALLOWED[contentType];
  if (!ext) return deny(res, 400, 'Please use a JPG, PNG, WebP, GIF or AVIF image');

  let bytes;
  try {
    bytes = Buffer.from(String(data), 'base64');
  } catch {
    return deny(res, 400, 'The file could not be read');
  }

  if (bytes.length === 0)          return deny(res, 400, 'The file is empty');
  if (bytes.length > MAX_BYTES)    return deny(res, 400, 'Images must be under 5 MB');

  // A random prefix keeps uploads from colliding and stops anyone from
  // guessing the URL of an image before it is published.
  const safe = String(filename || 'image')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'image';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}.${ext}`;

  try {
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'false',
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: bytes
    });

    if (!up.ok) {
      const detail = await up.text();
      console.error('[upload] storage rejected:', up.status, detail);
      if (up.status === 404) {
        return deny(res, 502, 'The "event-images" bucket does not exist. Create it in Supabase → Storage.');
      }
      return deny(res, 502, 'The image could not be uploaded');
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    console.log('[upload] stored:', path);
    return res.status(200).json({ ok: true, url: publicUrl, path });
  } catch (err) {
    console.error('[upload] threw:', err && err.message);
    return deny(res, 502, 'The image could not be uploaded');
  }
}

// Vercel's default body limit is 1 MB, which would reject most photos
// before this function ever ran. Base64 also inflates a file by ~33%,
// so a 5 MB image arrives as roughly 6.7 MB of JSON.
export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }
};
