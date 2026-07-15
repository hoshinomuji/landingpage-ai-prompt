# Atelier Object

> The watch as living sculpture — not a catalog entry, but a singular object you meet in space.

Premium **Astro + vanilla Three.js** landing experience for a luxury timepiece.
Cinematic dark stage, scroll-driven craft story, Lenis smooth scroll.
Built to feel like an atelier encounter, not a SaaS product page.

---

## Live experience

| Surface | What you get |
|---|---|
| **Hero** | Full-viewport WebGL timepiece, cursor parallax, auto-orbit |
| **Craft story** | Sticky 3D canvas + 4 scroll chapters (case → bezel → dial → crown) |
| **CTA** | Private viewing (primary) · craft story (soft path) |

Camera is an **orbit system** (azimuth / elevation / distance) with hold-then-ease between shots — the model stays put; the camera does the storytelling.

---

## Stack

- [Astro](https://astro.build) — static shell, zero React tax
- [Three.js](https://threejs.org) — vanilla, dynamic import after first paint
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll (respects `prefers-reduced-motion`)
- OKLCH design tokens · Petrona (display) + Public Sans (body)

No `.glb` required. The watch is **fully procedural** from primitives so the page runs cold with zero asset pipeline.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview
```

Requires **Node ≥ 22.12**.

---

## Project structure

```text
.
├── PRODUCT.md                 # strategy: users, purpose, principles
├── DESIGN.md                  # visual system seed (Warm Stage)
├── prompt.md                  # every build prompt used (audit trail)
├── astro.config.mjs
├── public/
│   └── favicon.svg
└── src/
    ├── layouts/Layout.astro   # HTML shell, fonts, skip link
    ├── styles/global.css      # OKLCH tokens (dark stage)
    ├── lib/
    │   └── watch-scene.ts     # Three.js scene + orbit story shots
    └── pages/
        └── index.astro        # hero + sticky story + CTA
```

---

## Design system (short)

**Creative North Star:** *The Warm Stage*

- Deep pure-black stage · one warm metal accent ≤10%
- Object first — UI is supporting cast
- Warm craft, not cold gallery / not SaaS chrome
- Motion serves form; full reduced-motion freeze
- Invitation over pressure

Strategic detail lives in `PRODUCT.md`. Visual seed lives in `DESIGN.md`.

---

## Story camera map

| Scroll band | Shot | What you see |
|---|---|---|
| Hero | ¾ portrait | Whole piece, auto-orbit |
| 01 Case | Low side | Brushed flank, lugs, strap |
| 02 Bezel | Elevated ring | Brass bezel + 60 ticks |
| 03 Dial | Near top-down | Indices, hands, chapter ring |
| 04 Crown | Close side | Fluted crown + stem |
| Exit | Pull-back | Soft leave |

---

## Accessibility

- Skip link, semantic landmarks, focus-visible rings
- `prefers-reduced-motion: reduce` → Lenis off, continuous motion frozen, discrete shot snaps
- Type contrast held via chapter plates (no full-frame white veil)

---

## What this is *not*

- Generic SaaS landing / feature grids / stock gradients
- Apple-clone pure-white product chrome
- Neon cyberpunk / countdown / hard-sell cart energy

---

## Roadmap / next flex

- [ ] Swap procedural watch for a real `.glb` (keep the same orbit shot map)
- [ ] Part callouts (label pins on case / bezel / dial / crown)
- [ ] Re-run design document pass once visuals settle

---

## License

Personal / portfolio project. Do what you want with the code; the craft is the point.
