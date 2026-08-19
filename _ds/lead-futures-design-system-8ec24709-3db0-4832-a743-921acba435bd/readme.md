# LEAD Futures Foundation — Design System

A warm, grounded, human-centered identity system for the **LEAD Futures
Foundation**, a nonprofit that helps people *feel seen, supported, and capable
of becoming who they are meant to be.* Leadership begins with belonging, grows
through opportunity, and comes full circle when individuals return to lead
others.

This project is the machine-readable home of that identity: brand assets, color
and type tokens, reusable React components, a full marketing-site UI kit, and a
presentation slide system — all driven by one set of CSS custom properties.

---

## Source material

Everything here is derived from a single provided source:

- **`uploads/LEAD Futures Logo + Branding Deck_FINAL.pdf`** (12 pages) — the
  official brand guidelines deck, designed by Devin Petersen. It defines the
  brand essence, mission & vision, five core values, voice & tone, the color
  palette, the logo lockup, the typography system ("The Seasons" + Karla), and
  photography/campaign style.

Extracted text and the original deck live in `uploads/`. Curated,
production-ready assets were copied into `assets/`. No website, codebase, or
Figma file was provided — the live site referenced throughout is
**leadfutures.org** (not accessed here).

---

## Content fundamentals — how LEAD Futures writes

The voice is **warm, human, and reassuring — never performative, never
distant.** It speaks with grounded confidence rooted in real relationships and a
belief in what people are capable of. Writing is clear, honest, and intentional:
meant to *support, encourage, and invite people forward* — always honoring
dignity, always pointing toward possibility.

**Personality traits:** Future-focused · Calm but confident · Human + relatable
· Deeply caring.

**Practical rules**
- **Person:** Speak as **"we"** (the foundation) to **"you"/"people"** (those
  served). Collective and relational, never corporate-royal.
- **Casing:** Sentence case for headlines and UI. The one exception is the
  brand's signature **tracked-out uppercase overline** (e.g. `WHAT WE BELIEVE`,
  `FOUNDATION`) used as a small eyebrow label.
- **Tone:** Affirming and steady. Lead with people, not programs. Favor verbs of
  growth — *grow, root, lift, invest, become, walk alongside.*
- **Length:** Short, declarative sentences. Generous white space around them.
- **Emoji:** **None.** The brand is grounded and sincere; emoji would read as
  performative. No emoji in product, slides, or copy.
- **Punctuation:** Em dashes for warm asides. Avoid exclamation points.

**Signature lines (use as tone calibration)**
- "Leadership begins where belonging takes root."
- "We help people feel seen, supported, and capable of becoming who they are
  meant to be."
- "Be the life force of inspiration."
- "A future rooted in community."

---

## Visual foundations

**Overall vibe.** Earthy, calm, and optimistic. Think golden-hour light, soil
and seedlings, hands cradling growth. Nothing loud, flashy, or cold.

**Color.** A warm earth palette on a soft cream ground (see `tokens/colors.css`):
- **Evergreen `#3A4B3A`** — the primary; the cradling hands of the logo. Used
  for headlines, primary buttons, the footer, and dark sections.
- **Clay `#A65A2A`** — the warm accent / secondary CTA color and italic
  emphasis. The brand's "pop."
- **Olive `#6A5B2E`**, **Sage `#9C9350`**, **Leaf `#8D9F39`** — supporting
  greens/bronzes for tags, illustration, and texture.
- **Field Gold `#E1BE63`** — the arc of growth; highlights, focus rings,
  numbered accents, the gold on-dark emphasis.
- **Off-white / Sand `#F2F2E7`** — the page ground everything rests on.
- Text is a warm near-black green (**Ink `#26301F`**), never pure black.

**Type.** Two voices (see `tokens/typography.css`):
- **Display serif — "The Seasons"** (high-contrast, elegant, with a beautiful
  italic). Used large for emotive headlines and quotes, often pairing an upright
  word with an italic counterpoint (the "Lead*futures*" wordmark move).
  ⚠️ *Substituted with Cormorant Garamond — see Fonts caveat below.*
- **Karla (sans)** — calm humanist sans for sub-headings, body, labels, and all
  UI. Weights 400/500/600/700.

**Backgrounds.** Three modes: (1) the cream ground for most content; (2) solid
**Clay or Evergreen** full-bleed panels for section dividers and footers; (3)
**full-bleed photography** with a directional evergreen scrim for heroes and
quotes. No gradients-as-decoration, no busy patterns. Occasional thin **outline
circles/arcs** (gold or sage) echo the logo's arc — used sparingly as quiet
corner motifs.

**Imagery.** Warm, candid, documentary photography of real people in community —
hands joined in a circle, group huddles, garden gatherings. Sun-drenched,
slightly warm white balance, gentle film grain, natural greenery. Never sterile
stock. People are mid-moment, not posed at the camera. Subjects are diverse and
intergenerational.

**Corners & cards.** Soft, organic radii (`--radius-md` 12px to `--radius-lg`
18px); buttons and pills go fully round (`--radius-pill`). Cards are white on
cream, a 1px soft border, and a **warm low shadow** (`--shadow-sm`) — grounded,
never floating. An optional thin left **accent strip** in a brand color is the
only "accent border" pattern used, and it's used sparingly.

**Shadows.** Low, soft, warm (tinted with the ink green), four steps xs→lg. The
focus ring is a 3px **Field Gold** glow.

**Borders.** Hairlines in warm stone (`--border-default`/`--border-soft`).
Strong borders (outline buttons) use Evergreen at 1.5px.

**Motion.** Calm and quiet. Short durations (140–360ms) on a gentle ease-out
(`--ease-out`); fades and small translations. **No bounce, no spring.** The only
press feedback is a subtle `scale(0.97)`. Hover states darken brand fills
(Evergreen→`-700`, Clay→`-700`) or wash a faint Evergreen tint behind ghost/
outline buttons. Links shift toward clay on hover.

**Transparency & blur.** Used lightly: the sticky header is cream at ~86% with a
backdrop blur; photo scrims are layered evergreen at varying opacity. Otherwise
surfaces are opaque.

**Layout.** Centered max-width containers (`--container-lg` 1120px), generous
section padding (~88px vertical), and a 4px-based spacing scale. Numbered lists
(01–05) borrow the guidelines-deck convention.

---

## Iconography

The brand deck defines **no custom icon set** and uses **no emoji**. Icons are a
supporting, not signature, element — the logo mark and photography carry the
identity.

- **System used:** **[Lucide](https://lucide.dev)** (CDN), chosen for its calm,
  humanist, **rounded 2px-stroke** line style, which matches the brand's gentle,
  grounded feel. Loaded via `https://unpkg.com/lucide` in the UI kit and
  component cards; render with `data-lucide="name"` then `lucide.createIcons()`.
  ⚠️ *This is a substitution* — the brand has no documented icons. If LEAD
  Futures adopts an official set, swap the CDN reference.
- **Style rules:** line (not filled) icons, 16–22px, stroke in `--text-secondary`
  or a brand color; never multi-color. Pair icons with text, not alone.
- **The logo mark** (hands + seedling + gold arc) is the one true brand glyph —
  available in color (`assets/logo-mark-color.png`) and white
  (`assets/logo-mark-white.png`). Use it for avatars/favicons, not as a generic
  UI icon.
- **Unicode** is used only for the typographic quote mark on quote slides.

---

## Fonts — substitution caveat ⚠️

- **Karla** — exact match, open-source, bundled in `fonts/` (`karla-400…700`).
- **"The Seasons"** — the brand's display serif is a **commercial font not
  available on Google Fonts.** It is **substituted here with Cormorant
  Garamond** (`fonts/cormorant-garamond-*`), the closest free high-contrast
  elegant serif, registered under the family name `"Seasons Display"`. Headlines
  will look very close but not pixel-identical. **To match exactly, drop licensed
  "The Seasons" `.woff2` files into `fonts/` and update `tokens/fonts.css`.**

---

## Project index / manifest

**Root**
- `styles.css` — global entry point; consumers link **this one file**. Imports
  only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front matter so this system works in Claude Code.

**`tokens/`** — CSS custom properties, imported by `styles.css`
- `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `base.css`

**`fonts/`** — bundled `.woff2` (Karla + Cormorant Garamond substitute)

**`assets/`** — brand imagery
- `logo-full-color.png`, `logo-full-white.png` — full lockups
- `logo-mark-color.png`, `logo-mark-white.png` — mark only
- **Real program photos** (preferred): `photo-school-class.jpg`, `photo-evokicks-gift-anon.jpg`
  (student name pixelated for privacy), `photo-evokicks-team.jpg`, `photo-athletes.jpg`
- Lifestyle references from the brand deck: `photo-hands-circle.png`,
  `photo-lake-huddle.png`, `photo-garden-gathering.png`
- `example-campaign-poster.png` — reference layout from the deck

**`guidelines/`** — foundation specimen cards (Design System tab)
- Colors: core · greens & gold · neutrals · status
- Type: display · body · scale · overline
- Spacing: scale · radii · elevation
- Brand: logo · mark · photography · voice

**`components/core/`** — reusable React primitives
- `Button` · `Badge` · `Card` · `Input` · `Avatar`
  (each with `.jsx`, `.d.ts`, `.prompt.md`; `core.card.html` is the gallery)

**`ui_kits/website/`** — leadfutures.org marketing-site recreation
- `index.html` (interactive) + `SiteHeader`, `Hero`, `Values`, `Programs`,
  `Mentorship` (join flow), `SiteFooter`

**`slides/`** — presentation system (1280×720)
- `title` · `section` · `values` · `quote` · `closing`

---

## Using this system

Link `styles.css` and the generated `_ds_bundle.js`, then read components off the
window namespace (run `check_design_system` for the exact name):

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, Badge, Input, Avatar } = window.LEADFuturesDesignSystem_8ec247;
</script>
```

Always reach for the **semantic aliases** (`--surface-page`, `--text-brand`,
`--action-accent`, …) rather than raw brand values, so themes stay consistent.
