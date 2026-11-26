# INVENTO · Кутија 01 · Мини катапулт

Everything needed to make box 01: laser files for the woodworker, the woodworker's spec sheet, the
children's building guide (Macedonian and English), the printable target, and pictures for the
website. All of it is generated from one model (`src/geometry.mjs`), so the files always match.

## Files

| File | What it is | Who gets it |
|---|---|---|
| `catapult-woodworker-mk.pdf` | Spec sheet (A4, Macedonian): material, file colours, fits, parts table, dowels, finishing, QC checklist, kit contents, prototype steps | woodworker |
| `cut/catapult-4mm.svg` | **Laser file** for 4 mm birch plywood, 300 × 200 mm. Red = cut, blue = engrave. Dowels 32 mm. | woodworker |
| `cut/catapult-3mm.svg` | Same for 3 mm plywood. Dowels 26 mm. | woodworker (if 3 mm) |
| `cut/test-piece-4mm.svg` / `-3mm.svg` | Fit test: slots around the sheet thickness, holes 5.6–7.0 mm | woodworker, **cut first** |
| `catapult-guide-mk.pdf` / `-en.pdf` | Building guide, A5, 12 pages: parts, 8 steps, how it works, experiments, game, troubleshooting | goes in the box |
| `catapult-target.pdf` | Printable target (A4, both languages) | goes in the box |
| `images/catapult-*.svg` | Isometric pictures (cover + 8 steps) | website / social media |

## The design in short

- **9 kinds of parts, no glue, no tools.** Base (1), left and right supports (2, 3), arm (4), cup bottom and ring (5, 6), washers (7), caps (8), plus two 6 mm dowels (9).
- **Can't be built wrong:** the support tabs are different lengths (10 and 14 mm), so a support only goes in one way and its holes always line up.
- **Built-in science:** three angle holes (30° / 45° / 60° launch) and three power notches on the arm. That is what the "Lab" page of the guide is built around.
- **Engraved:** part numbers, angle labels, a 0–18 cm ruler on the base, the INVENTO box and wordmark.
- **Fits:** support holes Ø6.2 (snug), arm and washers Ø6.8 (turns freely), caps Ø5.8 (press fit). Gap between supports = 3 × sheet + 1 mm.

## Message for the woodworker (Viber / email)

> Здраво! Ви праќам фајлови за ласерско сечење за нашата прва дрвена играчка (мини катапулт).
> Во прилог: спецификација (PDF), главниот фајл за шперплоча 4 мм и тест-парче.
> Ве молам прво исечете го тест-парчето и кажете ни кои отвори и дупки најдобро налегнуваат,
> и колку е вистински дебела плочата. Потоа би сакале 1–2 прототипи за тестирање.
> Црвено = сечење, сино = гравирање, мерки во мм 1:1. Ви благодарам!

## After the test piece: rebuild for the real sheet

Measure the real plywood thickness (for example 3.8 mm) and run:

```
pnpm kit:catapult --t=3.8
```

This adds `cut/catapult-3.8mm.svg` and `cut/test-piece-3.8mm.svg`, with slots and the gap between the supports sized for that sheet. Hole sizes are in `src/geometry.mjs` (`HOLE`); change them there if the test piece shows another fit is better, then rebuild.

## To check on the first prototype

- Rubber band size: the spec suggests about 32 mm long when flat (1.5–3 mm wide). Try a few and pick the one that throws well without being hard for a child to pull.
- Pom-poms: 25 mm, soft.
- Let 2–3 children build it from the guide without help, and note where they get stuck.
- Toy safety rules for selling (see OWNER_TODO): the guide carries the standard small-parts warning, but no safety or certification claims.
