<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Atelier Object
description: Luxury timepiece as living sculpture — warm craft on a deep stage.
---

# Design System: Atelier Object

## 1. Overview

**Creative North Star: "The Warm Stage"**

A dark, quiet room where a single timepiece is lit like a living object. Light is warm and material; UI is subordinate, almost spoken under the breath. The system channels A. Lange & Söhne’s object gravity, Hermès’ tactile restraint, and V&A object pages’ museum-grade focus — never a product grid, never a sterile white cube.

Density is low. Space and silence are part of the craft. Motion is choreographed around the object: continuous rotation and parallax exist to reveal form; page entrances are orchestrated, not decorative. Personality is warm, craft, human — atelier intimacy on a cinematic stage.

This system explicitly rejects generic SaaS / startup landing patterns and minimalist pure-white tech (Apple-clone) product pages.

**Key Characteristics:**
- Deep neutrals as the stage; one warm metal accent used sparingly (≤10%)
- Serif display + humanist sans body
- Object-first layout; chrome yields to the 3D encounter
- Choreographed motion that serves form, with full reduced-motion degradation
- Invitation language — private viewing over hard sell

## 2. Colors

Restrained strategy: deep neutrals carry the surface; one warm metal accent appears at ≤10% (CTAs, fine rules, hover glints).

### Primary
- **Warm Metal** `[to be resolved during implementation]`: Brass / soft gold family for primary actions and rare highlights. Rarity is the point.

### Neutral
- **Stage Ink** `[to be resolved]`: Near-black body / canvas behind the 3D scene.
- **Stage Lift** `[to be resolved]`: Slightly lifted surface for overlays and scrims.
- **Paper Whisper** `[to be resolved]`: Warm off-white for primary text on dark.
- **Muted Craft** `[to be resolved]`: Secondary text and quiet labels — same hue family as the stage, not pure gray.

**The Rarity Rule.** The warm metal accent occupies ≤10% of any given view. If the page feels “golden,” the accent has escaped.

**The Stage Rule.** Body background is deep and quiet — never cream/sand/beige, never pure Apple-white. Warmth lives in light, metal, and type, not in a parchment body.

## 3. Typography

**Display Font:** `[font pairing to be chosen at implementation]` — elegant serif for hero and section titles  
**Body Font:** `[font pairing to be chosen at implementation]` — warm humanist sans for UI and prose  

**Character:** Editorial luxury. Display carries craft and human presence; body stays clear and calm over the cinematic scene.

### Hierarchy
- **Display** (light–regular, clamp hero, tight but ≥ -0.04em tracking): Hero encounter only.
- **Headline** (regular, section scale): Craft story headings.
- **Title** (medium): Overlay labels, nav.
- **Body** (regular, ~1rem, 65–75ch max): Craft narrative.
- **Label** (medium, small, slight tracking): Specs, captions — never all-caps eyebrows on every section.

**The Object Title Rule.** One display moment owns the hero. Do not stack multiple shouting display lines.

## 4. Elevation

Depth comes from light on the 3D object and from soft tonal scrims over the canvas — not from stacked card shadows. UI sits in flat or barely lifted overlays; the model owns dimensional light.

Choreographed motion: continuous object rotation + cursor parallax; orchestrated text entrances. Shadows on UI, if any, are ambient and soft — never Material “lifted card” stacks.

**The Object Light Rule.** Cinematic lighting belongs to the timepiece. UI does not cast competing drop shadows that read as SaaS cards.

## 5. Components

_No components yet — seed only. Primary button (private viewing), ghost/secondary (craft story), and hero overlay will be defined at implementation and captured on the next `/impeccable document` scan._

## 6. Do's and Don'ts

### Do:
- **Do** keep the timepiece as the visual protagonist; UI is supporting cast.
- **Do** use deep stage neutrals and a single warm metal accent at ≤10%.
- **Do** pair serif display with humanist sans body.
- **Do** choreograph motion around form; honor `prefers-reduced-motion` with a still or heavily damped scene.
- **Do** lead with craft understanding; primary CTA is “request a private viewing,” soft path is craft story.

### Don't:
- **Don't** use generic SaaS / startup landing patterns — feature grids, stock gradients, “modern product” chrome, conversion-optimized section stacks.
- **Don't** ship minimalist pure-white tech (Apple clone) product pages — sterile white cubes and default system-product chrome are forbidden.
- **Don't** use cream/sand/beige body backgrounds, gradient text, side-stripe accents, or glassmorphism as default decoration.
- **Don't** use neon cyberpunk, countdown timers, discount badges, or hard-sell cart energy.
- **Don't** put tiny uppercase tracked eyebrows above every section.
