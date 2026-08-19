// api/_supabase.js
// Shared Supabase helpers for every server function on this site.
//
// Files starting with an underscore are NOT treated as routes by Vercel,
// so this is a library the other api/ files import, not an endpoint
// anyone can call.
//
// ENV VARS (Vercel → Settings → Environment Variables)
//   SUPABASE_URL               https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  sb_secret_... (or legacy eyJ... service_role)

// Tolerate the two most common paste mistakes: a trailing slash, and the
// "/rest/v1" suffix Supabase shows in its API settings page.
export const SUPABASE_URL = (process.env.SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '');

export const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Supabase supports two key formats and they authenticate differently.
//   Legacy service_role keys are JWTs starting "eyJ" -> both headers.
//   Current sb_secret_ keys are not JWTs -> apikey header only, because
//   Supabase rejects a Bearer value that doesn't match the apikey header.
export function authHeaders(extra) {
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY
  };
  if (SUPABASE_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  }
  return Object.assign(headers, extra || {});
}

// Thin wrapper over PostgREST. Returns { ok, status, data, error }.
export async function db(path, options = {}) {
  if (!CONFIGURED) {
    console.error('[db] Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then REDEPLOY.');
    return { ok: false, status: 500, error: 'Server not configured' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: options.method || 'GET',
      headers: authHeaders(options.headers),
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      console.error('[db]', options.method || 'GET', path, '->', res.status, text);
      return { ok: false, status: res.status, error: describe(res.status, text), data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    console.error('[db] request threw:', err && err.message);
    return { ok: false, status: 502, error: 'Could not reach the database' };
  }
}

// Turns terse HTTP codes into the thing to actually go and fix.
function describe(status, detail) {
  const text = String(detail || '');
  if (status === 401) return 'Wrong key — the PUBLISHABLE key was used where the SECRET key is needed.';
  if (status === 404) return 'Table not found — run supabase-setup.sql, or check SUPABASE_URL points at the right project.';
  if (status === 403 || text.includes('42501')) return 'Permission denied — row level security blocked this, meaning the secret key is not in use.';
  if (text.includes('23505')) return 'That already exists.';
  if (text.includes('PGRST204')) return 'Column mismatch — the table does not match supabase-setup.sql.';
  return 'Database error.';
}

// ---------------------------------------------------------------------
//  Admin authentication
// ---------------------------------------------------------------------
// Two checks, both required:
//   1. Is this a real, unexpired Supabase session? (asked of Supabase
//      itself, so revoked and expired tokens are properly rejected)
//   2. Is that user on the admin_users allowlist?
//
// Returns the user object, or null. Callers must treat null as a refusal.

export async function requireAdmin(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(String(header));
  if (!match) return null;
  const token = match[1].trim();

  let user;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    user = await res.json();
  } catch (err) {
    console.error('[auth] verify threw:', err && err.message);
    return null;
  }
  if (!user || !user.id) return null;

  const check = await db(`admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!check.ok || !Array.isArray(check.data) || check.data.length === 0) {
    console.warn('[auth] Not on the allowlist:', user.email);
    return null;
  }
  return user;
}

// Small helper so every endpoint refuses the same way.
export function deny(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function readBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body && typeof body === 'object' ? body : {};
}

export function str(value, max = 5000) {
  if (value == null) return null;
  const out = String(value).trim();
  return out === '' ? null : out.slice(0, max);
}
