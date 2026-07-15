# Prompt Log — Atelier Object

Chronological record of the prompts used to build this project
(theme-toggle / light-mode requests intentionally omitted).

---

## 1. Initial build brief

> Role: Elite Front-End Developer & Creative Technologist specialized in 3D Web Experiences.
>
> Context:
> You are tasked with building a premium, visually stunning landing page using Astro (v4+) for the framework and Three.js (via vanilla Three.js or a lightweight wrapper like `@react-three/fiber` if integrated with a React island, but keeping performance overhead minimal) for high-end 3D graphics. The goal is to create an immersive, award-winning digital experience reminiscent of top-tier sites featured on Awwwards or FWA, utilizing a highly detailed 3D model and advanced web animations.
>
> Task:
> Generate the complete architecture, configuration, and main component files for this landing page.
> 1. Choose a compelling theme that suits a 3D showcase (e.g., futuristic tech, luxury watch/product customizer, or a cyberpunk space capsule).
> 2. Write a clean Astro page layout that loads a container for the Three.js canvas.
> 3. Write the client-side JavaScript/TypeScript block to initialize the Three.js scene, camera, and renderer.
> 4. Set up lighting (Ambient, Directional, and Point lights) to make the geometry look cinematic.
> 5. Implement a continuous animation loop (requestAnimationFrame) that includes smooth auto-rotation and interactive mouse-tracking (parallax effect) where the camera shifts slightly based on cursor movement.
> 6. Include standard interactive landing page content overlayed cleanly on top of the canvas (Hero text, sub-headline, and an animated Call-to-Action button).
>
> Constraints & Rules:
> - The code must be self-contained and modular.
> - Do NOT use heavy frameworks if simple vanilla JS inside an Astro `<script>` tag can handle it, ensuring fast initial page loads.
> - Ensure the canvas is fully responsive (`resize` event listener handling camera aspect ratio and renderer size).
> - Use standard, open-source 3D primitives (like a detailed Torus Knot with custom MeshStandardMaterial or custom shaders) or provide a clear placeholder loader for a `.gltf` / `.glb` model so the code runs immediately without breaking on missing assets.
> - Use CSS or Tailwind for typography overlays, ensuring text is perfectly readable on top of the 3D scene (use subtle dark overlays or text-shadows if needed).
>
> Output Format:
> Provide the response in a structured markdown format containing:
> 1. `astro.config.mjs` (If any specific integrations are needed).
> 2. `src/layouts/Layout.astro` (Base HTML/CSS wrapper).
> 3. `src/pages/index.astro` (The core landing page containing the full HTML overlay and the robust Three.js setup inside an optimized Astro client-side script tag).

**Result:** Dark cinematic landing — luxury timepiece as living sculpture.
Astro shell + vanilla Three.js procedural watch, hero overlay, CTA.

---

## 2. Product / design interview answers (Impeccable init)

Strategic answers captured into `PRODUCT.md` / `DESIGN.md`:

| Question | Answer |
|---|---|
| Register | Product UI / app shell (primary surface is the object experience) |
| Platform | Web |
| Theme | Luxury object / timepiece |
| Audience | Luxury / design buyers |
| Primary job | Understand the craft |
| Positioning | The watch as living sculpture |
| Personality | Warm, craft, human |
| Anti-reference | Generic SaaS / startup landing |
| Primary action | Request a private viewing |
| Soft fallback | Read the craft story |
| Accessibility | Strict AAA where practical |
| Color strategy | Restrained: deep neutrals + one warm metal accent ≤10% |
| Type | Serif display + sans body |
| Motion | Choreographed |
| References | A. Lange & Söhne + Hermès + V&A object pages |
| Visual anti-reference | Minimalist pure-white tech (Apple clone) |

---

## 3. Add scroll-story section after hero

> เพิ่ม Story Scrolling section ต่อจาก herosection ไปด้วยซิจะเป็นไงคู่กับ 3D

**Result:** Sticky WebGL canvas across hero + craft story.
Four chapters (case → bezel → dial → crown) drive camera shots via scroll progress.

---

## 4. Lenis + redesign story scroll

> ถ้าผมอยากให้ลง lenis ด้วยเเละอีกอย่างผมอยากให้ลองปรับตรง scroll story ใหม่ผมว่ายังไม่ค่อยสวยหน่ะลองปรับๆดู

**Result:**
- Installed Lenis smooth scroll, wired to story progress + Three.js
- Editorial alternating left/right chapters
- Progress rail, longer chapter holds, chapter-aware camera mapping

---

## 5. Fix warp + empty chapter shots

> คือตอนนี้อ่ะตรง story scroll อ่ะพอเปลี่ยนไปอันต่อไปมันวาปไปเลยอ่ะไม่สวยเเลมพอไปอันที่ 2 3 4 มันให้ดูอะไรก็ไม่รู้ไม่มีอะไรให้ดูเลยทำไมนายทำอย่างงี้ไม่ดีเลยไปเเก้ model กับ scrooll story ไปปปป ให้มันดีกว่านี้ซะเเละจะให้เพิ่มเเบบมีชี้เเละบอกว่าส่วนนี้คื่ออะไรที่ model ได้ด้วยก็ดีอยากเห็นเเต่ไปเเก้ก่อนถ้าเเก้ได้ค้่อยทำนะ

**Result:**
- Rebuilt camera as spherical orbit (az / el / dist) with hold-then-ease
- Double smoothing (scroll + orbit) to kill warp
- Thickened procedural model: case layers, bezel ticks, applied indices, fluted crown, leather straps
- Chapter progress mapped to real DOM chapter positions
- Callout pointers deferred until shots feel right

---

## 6. Remove side white wash / scrims

> คือนายจะมีไอเเสงสีขาวๆด้านข้างเพื่ออะไรรรเอาออกไปมันไม่สวย

**Result:**
- Removed side scrim, bottom scrim, and story vignette entirely
- Copy readability now comes only from chapter/hero plates and type contrast
- Softened 3D side fill / rim / spark so they no longer read as a white wall
