// api/events.js
// PUBLIC endpoint — the calendar and event detail pages read from here.
//
// Only PUBLISHED events are ever returned. Drafts stay invisible to
// visitors no matter how the URL is manipulated, because the filter is
// applied here on the server rather than in the browser.
//
//   GET /api/events                 -> all published events
//   GET /api/events?month=2026-07   -> that month (plus a small margin)
//   GET /api/events?slug=some-event -> one event

import { db } from './_supabase.js';

// The columns a visitor is allowed to see. Listing them explicitly means
// a future internal column can't leak by accident.
const PUBLIC_COLUMNS = [
  'id', 'title', 'slug', 'starts_at', 'ends_at', 'all_day',
  'location_name', 'address_line', 'city', 'region', 'postal_code', 'country',
  'excerpt', 'description', 'image_url', 'image_alt',
  'source_url', 'source_label', 'featured',
  'seo_title', 'seo_description'
].join(',');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { month, slug } = req.query || {};

  let query = `events?select=${PUBLIC_COLUMNS}&status=eq.published&order=starts_at.asc`;

  if (slug) {
    query += `&slug=eq.${encodeURIComponent(String(slug).toLowerCase())}&limit=1`;
  } else if (month && /^\d{4}-\d{2}$/.test(String(month))) {
    // Fetch a window either side of the month so events spilling in from
    // the previous or next month still appear in the visible grid — a
    // month view always shows a few days of its neighbours.
    const [y, m] = String(month).split('-').map(Number);
    const from = new Date(Date.UTC(y, m - 1, 1));
    const to = new Date(Date.UTC(y, m, 1));
    from.setUTCDate(from.getUTCDate() - 7);
    to.setUTCDate(to.getUTCDate() + 7);
    query += `&starts_at=gte.${from.toISOString()}&starts_at=lt.${to.toISOString()}`;
  }

  const result = await db(query);

  if (!result.ok) {
    console.error('[events] failed:', result.error);
    return res.status(502).json({ ok: false, error: 'Could not load events' });
  }

  const rows = Array.isArray(result.data) ? result.data : [];

  // Cache briefly at the edge. Events change rarely, and stale-while-
  // revalidate means a visitor never waits on a slow database round trip.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  if (slug) {
    if (rows.length === 0) return res.status(404).json({ ok: false, error: 'Event not found' });
    return res.status(200).json({ ok: true, event: rows[0] });
  }
  return res.status(200).json({ ok: true, events: rows });
}
