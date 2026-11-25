# ASSETS NEEDED

`brand/` was empty, so every illustration is a **placeholder SVG** drawn in the brand style (flat palette fills, thick rounded navy outlines). All illustrations render through one component, `src/components/illustrations/Illustration.tsx`.

**To replace one with real art:** put the file in `public/art/` and register it in `src/components/illustrations/overrides.ts`, e.g. `box: '/art/box.svg'`. Every use on the site switches to the real file, with no other code changes.

## Illustrations (placeholders in `src/components/illustrations/shapes.tsx`)

| Name | Used for | Replace with | Notes |
|---|---|---|---|
| `box` / `box-closed` | Logo mark, hero, empty states, sold-out block | `public/art/box.svg` (+ `box-closed.svg`) | **Most important.** Navy outside, orange inside. The preloader and hero animate the lid on its hinge, so the replacement SVG must be **inline-able** (not an `<img>`) and keep separate groups: `data-part="lid-open"` (lid standing up, hinge at its bottom edge), `"lid-closed"` (lid on the box, hinge at its top edge), `"base"` and `"inside"`. Send the artwork and we will wire it in. |
| `gear`, `gear-orange`, `gear-teal` | Difficulty rating, section decorations | `public/art/gear.svg` | |
| `rocket` | Hero parts, How-it-works step 4 | `public/art/rocket.svg` | |
| `bulb` | Hero parts, How-it-works step 3, FAQ header | `public/art/bulb.svg` | |
| `wrench` | Error page, policy page headers | `public/art/wrench.svg` | |
| `bolt`, `nut`, `spring`, `peg` | Questions-section pile (physics in M4) | `public/art/<name>.svg` | Simple, recognisable silhouettes work best for physics. |
| `catapult` | Intro section, gallery header | `public/art/catapult.svg` | |
| `marble` | 404 page, marble track (M4) | `public/art/marble.svg` | Orange ball. |

## Logo and wordmark

| Asset | Currently | Replace with |
|---|---|---|
| Logo (header) | placeholder box icon + "INVENTO" set in the display font | `public/art/logo.svg` (light version for navy backgrounds) |
| Footer wordmark | "INVENTO" set in the display font | can stay as text, or use the real wordmark |
| Favicon / app icon | none yet | square logo mark, SVG or 512×512 PNG |
| Default share image (OG) | generated navy card with Latin text (`src/app/(frontend)/[locale]/opengraph-image.tsx`) | upload a 1200×630 image in Admin → Site settings → SEO defaults |

## Photos (upload in the admin, no code needed)

| Where | Currently | Needed |
|---|---|---|
| Kit hero + gallery (Admin → Kits) | generated "SAMPLE PHOTO" images | real product photos of each kit, square works best, ≥1600 px |
| Customer builds (Admin → Customer builds) | 6 generated "SAMPLE BUILD" images | real build photos **with parent consent** (hands and builds, no faces) |
