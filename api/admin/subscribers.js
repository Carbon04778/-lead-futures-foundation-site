// api/admin/subscribers.js
// The newsletter list for the admin panel.
//
//   GET   /api/admin/subscribers   list
//   PATCH /api/admin/subscribers   update status or notes (body.id)

import { db, requireAdmin, deny, readBody, str } from '../_supabase.js';

const STATUSES = ['active', 'unsubscribed', 'bounced'];

export default async function handler(req, res) {
  const admin = await requireAdmin(req);
  if (!admin) return deny(res, 401, 'Please sign in again');

  if (req.method === 'GET') {
    const r = await db('subscribers?select=*&order=created_at.desc&limit=5000');
    if (!r.ok) return deny(res, 502, r.error || 'Could not load subscribers');
    return res.status(200).json({ ok: true, subscribers: r.data || [] });
  }

  if (req.method === 'PATCH') {
    const { id, status, notes } = readBody(req);
    if (!id) return deny(res, 400, 'Missing id');

    // Built field by field rather than passing the body through, so a
    // crafted request can't rewrite the email address or the timestamp.
    const patch = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return deny(res, 400, 'Invalid status');
      patch.status = status;
    }
    if (notes !== undefined) patch.notes = str(notes, 5000);
    if (Object.keys(patch).length === 0) return deny(res, 400, 'Nothing to update');

    const r = await db(`subscribers?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: patch
    });
    if (!r.ok) return deny(res, 502, r.error || 'Could not save');
    return res.status(200).json({ ok: true, subscriber: Array.isArray(r.data) ? r.data[0] : r.data });
  }

  res.setHeader('Allow', 'GET, PATCH');
  return deny(res, 405, 'Method not allowed');
}
