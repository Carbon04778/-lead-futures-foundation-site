// api/subscribe.js
// Newsletter signups from the homepage and events page.
//
// Before this existed, both forms simply hid themselves and showed a
// thank-you — the address was never sent anywhere. Every signup was lost.

import { db, readBody, str } from './_supabase.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { email, page, url, website } = readBody(req);

  // Honeypot: a hidden field no human ever sees or fills in. Bots fill
  // every field they find, so anything here is automated. Answer 200 so
  // the bot believes it succeeded and doesn't retry.
  if (website) return res.status(200).json({ ok: true });

  const address = str(email, 320);
  if (!address || !EMAIL_PATTERN.test(address)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address' });
  }

  // Upsert on the unique lower(email) index: signing up twice updates the
  // existing row instead of creating duplicates you'd have to clean up.
  // A previously unsubscribed address becomes active again, which is the
  // correct reading of someone deliberately signing up a second time.
  const result = await db('subscribers?on_conflict=email', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: {
      email: address.toLowerCase(),
      source_page: str(page, 120),
      source_url: str(url, 500),
      status: 'active'
    }
  });

  if (!result.ok) {
    console.error('[subscribe] failed:', result.error);
    return res.status(502).json({ ok: false, error: 'Could not save your signup. Please try again.' });
  }

  console.log('[subscribe] saved:', address, '| page:', page || '?');
  return res.status(200).json({ ok: true });
}
