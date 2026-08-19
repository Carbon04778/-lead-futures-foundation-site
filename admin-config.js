// admin-config.js
//
// ============================================================
//  YOU ONLY NEED TO CHANGE TWO LINES IN THIS FILE.
//  Both are marked CHANGE THIS below.
//  Keep the quote marks around what you paste. Then save.
// ============================================================
//
// Both values are safe to sit in a file the browser downloads.
// The project URL is public by design, and the publishable key can read
// nothing on its own — every table has row level security on with no
// policies. The SECRET key never appears here; it lives only in Vercel's
// environment variables.

window.LF_ADMIN_CONFIG = {

  // CHANGE THIS — Supabase → Project Settings → Data API → Project URL
  // No trailing slash. No "/rest/v1" on the end.
  // Example: https://abcdefghijkl.supabase.co
  SUPABASE_URL: 'PASTE_YOUR_PROJECT_URL_HERE',

  // CHANGE THIS — Supabase → Project Settings → API Keys → Publishable key
  // Starts with "sb_publishable_". NOT the secret key.
  SUPABASE_PUBLISHABLE_KEY: 'PASTE_YOUR_PUBLISHABLE_KEY_HERE'

};
