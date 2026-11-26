# ASSETS NEEDED

`brand/` was empty, so every illustration is a **placeholder SVG** drawn in the brand style (flat palette fills, thick rounded navy outlines). All illustrations render through one component, `src/components/illustrations/Illustration.tsx`.

**To replace one with real art:** put the file in `public/art/` and register it in `src/components/illustrations/overrides.ts`, e.g. `box: '/art/box.svg'`. Every use on the site switches to the real file, with no other code changes.

## Illustrations (placeholders in `src/components/illustrations/shapes.tsx`)

| Name | Used for | Replace with | Notes |
|---|---|---|---|
| `box` / `box-closed` | Hero, preloader, kit cards, empty states, sold-out block | `public/art/box.svg` (+ `box-closed.svg`) | **Redrawn 2026-11-26** as a finished open cardboard box (three-quarter view, four flaps, taped when closed); standalone files in `docs/brand/`. Still replaceable. The preloader and hero animate the flaps, so a replacement must be **inline-able** (not an `<img>`) and keep the groups `data-part="lid-open"` (back flaps, hinge at their bottom edge; front flaps get `data-hinge-top`), `"lid-closed"`, `"base"` and `"inside"`. |
| `logo` | Header logo mark, favicon | `public/art/logo.svg` | **Drawn 2026-11-26:** the box with a yellow gear rising out of it, chunky enough for 32-40px. Files in `docs/brand/`. |
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
| Logo (header) | `logo` mark (box + rising gear) + "INVENTO" set in the display font | only if the owner has an official logo: `public/art/logo.svg` |
| Footer wordmark | "INVENTO" set in the display font | can stay as text, or use the real wordmark |
| Favicon / app icon | `src/app/icon.svg`, the `logo` mark (regenerate with `pnpm export:brand`) | only if the owner has an official icon |
| Default share image (OG) | generated navy card with Latin text (`src/app/(frontend)/[locale]/opengraph-image.tsx`) | upload a 1200×630 image in Admin → Site settings → SEO defaults |

## Photos (upload in the admin, no code needed)

| Where | Currently | Needed |
|---|---|---|
| Kit hero + gallery (Admin → Kits) | generated "SAMPLE PHOTO" images | real product photos of each kit, square works best, ≥1600 px |
| Customer builds (Admin → Customer builds) | 6 generated "SAMPLE BUILD" images | real build photos **with parent consent** (hands and builds, no faces) |
