// api/admin/events.js
// Event management for the admin panel. Every request requires a valid
// session AND membership of the admin_users allowlist — see requireAdmin.
//
//   GET    /api/admin/events        list everything, drafts included
//   POST   /api/admin/events        create
//   PATCH  /api/admin/events        update  (body.id)
//   DELETE /api/admin/events?id=... delete

import { db, requireAdmin, deny, readBody, str } from '../_supabase.js';

const STATUSES = ['draft', 'published'];

// The only columns the admin panel may write. Anything else in the
// request body is ignored, so a malformed or hostile payload can't reach
// id, created_at, or any column added later.
const WRITABLE = [
  'title', 'slug', 'starts_at', 'ends_at', 'all_day',
  'location_name', 'address_line', 'city', 'region', 'postal_code', 'country',
  'excerpt', 'description', 'image_url', 'image_alt',
  'source_url', 'source_label', 'featured', 'status',
  'seo_title', 'seo_description'
];

const LONG_FIELDS = { description: 20000, excerpt: 500, seo_description: 500 };

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return deny(res, 401, 'Please sign in again');

  try {
    if (req.method === 'GET')    return await list(res);
    if (req.method === 'POST')   return await create(req, res);
    if (req.method === 'PATCH')  return await update(req, res);
    if (req.method === 'DELETE') return await remove(req, res);
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return deny(res, 405, 'Method not allowed');
  } catch (err) {
    console.error('[admin/events] unhandled:', err);
    return deny(res, 500, 'Something went wrong');
  }
}

async function list(res) {
  const r = await db('events?select=*&order=starts_at.desc&limit=1000');
  if (!r.ok) return deny(res, 502, r.error || 'Could not load events');
  return res.status(200).json({ ok: true, events: r.data || [] });
}

async function create(req, res) {
  const body = readBody(req);
  const row = clean(body);

  const problem = validate(row, true);
  if (problem) return deny(res, 400, problem);

  row.slug = await uniqueSlug(row.slug || slugify(row.title));

  const r = await db('events', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: row
  });
  if (!r.ok) return deny(res, 502, r.error || 'Could not create the event');

  const created = Array.isArray(r.data) ? r.data[0] : r.data;
  console.log('[admin/events] created:', created && created.slug);
  return res.status(200).json({ ok: true, event: created });
}

async function update(req, res) {
  const body = readBody(req);
  const id = body.id;
  if (!isUuid(id)) return deny(res, 400, 'Missing or invalid id');

  const row = clean(body);
  if (Object.keys(row).length === 0) return deny(res, 400, 'Nothing to update');

  const problem = validate(row, false);
  if (problem) return deny(res, 400, problem);

  // A slug change has to stay unique, but an event keeping its own slug
  // must not be treated as a collision with itself.
  if (row.slug) row.slug = await uniqueSlug(slugify(row.slug), id);

  const r = await db(`events?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: row
  });
  if (!r.ok) return deny(res, 502, r.error || 'Could not save the event');

  const updated = Array.isArray(r.data) ? r.data[0] : r.data;
  if (!updated) return deny(res, 404, 'Event not found');
  return res.status(200).json({ ok: true, event: updated });
}

async function remove(req, res) {
  const id = (req.query || {}).id;
  if (!isUuid(id)) return deny(res, 400, 'Missing or invalid id');

  const r = await db(`events?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' }
  });
  if (!r.ok) return deny(res, 502, r.error || 'Could not delete the event');

  console.log('[admin/events] deleted:', id);
  return res.status(200).json({ ok: true });
}

// ---------------------------------------------------------------------

function clean(body) {
  const row = {};
  WRITABLE.forEach((key) => {
    if (!(key in body)) return;
    const value = body[key];

    if (key === 'featured' || key === 'all_day') {
      row[key] = Boolean(value);
    } else if (key === 'status') {
      if (STATUSES.includes(value)) row[key] = value;
    } else if (key === 'starts_at' || key === 'ends_at') {
      row[key] = value ? new Date(value).toISOString() : null;
    } else {
      row[key] = str(value, LONG_FIELDS[key] || 500);
    }
  });
  return row;
}

function validate(row, isNew) {
  if (isNew) {
    if (!row.title)     return 'A title is required';
    if (!row.starts_at) return 'A start date and time is required';
    if (!row.ends_at)   return 'An end date and time is required';
  }
  // Matches the database constraint, but caught here so the admin panel
  // shows a sentence rather than a Postgres error code.
  if (row.starts_at && row.ends_at && new Date(row.ends_at) < new Date(row.starts_at)) {
    return 'The event cannot end before it starts';
  }
  if (row.starts_at && isNaN(new Date(row.starts_at))) return 'The start date is not valid';
  if (row.ends_at && isNaN(new Date(row.ends_at)))     return 'The end date is not valid';
  return null;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'event';
}

// Appends -2, -3 ... until the slug is free. Two events called
// "Annual Golf Classic" in different years each get a working URL.
async function uniqueSlug(base, ignoreId) {
  let slug = slugify(base);
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? slug : `${slug}-${n}`;
    let query = `events?select=id&slug=eq.${encodeURIComponent(candidate)}&limit=1`;
    if (ignoreId) query += `&id=neq.${encodeURIComponent(ignoreId)}`;
    const r = await db(query);
    if (!r.ok) return candidate;
    if (!Array.isArray(r.data) || r.data.length === 0) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
