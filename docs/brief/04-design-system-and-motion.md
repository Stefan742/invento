# 04. Design System and Motion

## Creative concept: "The Box Is the Stage"

INVENTO's packaging is **navy outside, orange inside**. The website is the experience of opening it.

- **Navy = the closed box**: calm, premium, engineered. (Hero, footer.)
- **Orange = what is inside**: energy, discovery. (Intro, questions.)
- Section changes and page transitions feel like **a lid opening or closing**.
- A single **orange marble rolling down a track** threads through the whole home page as the visitor scrolls (the page's "leash"), connecting sections into one continuous story.

Reference observed in dontboardme.com (feel only, never copy art/code/copy):
one continuous illustrated scroll story; each section is its own color world with soft giant background circles; huge condensed single-color headlines; a playful object (balls) on headlines and scattered with physics; step cards that fly in tilted and fan out like paper; a tilted "Book now" sticker always on screen; testimonials on a horizontal timeline; photos drifting around a giant social handle; quiet minimal footer.

**Consistency is what makes it work**: one illustration style, one display font, one accent logic, one recurring object (the marble). Do not add effects that don't belong to this system.

## Color tokens

```
--navy:   #0D1B2A
--orange: #FF7A00
--yellow: #FFD166
--teal:   #00B4DB
--paper:  #F2F2F2
```
Derived tints/shades are allowed but named (e.g. `--navy-80`). Keep white rare.

**Contrast rule (verify with a checker):** orange, teal and yellow have too little contrast against light backgrounds for text. Use them as **text only on navy**. On paper, yellow, orange and teal backgrounds, text is **navy**. Orange/teal/yellow may be used as shapes and decorations anywhere. Large display text must still meet at least 3:1.

## Section color worlds (home page order)

| # | Section | Background | Text | Accent |
|---|---|---|---|---|
| 1 | Hero (box outside) | navy | paper | orange |
| 2 | Intro (inside the box) | orange | navy | yellow |
| 3 | Kits showcase | yellow | navy | orange |
| 4 | How it works | teal | navy | yellow, paper cards |
| 5 | Pick your box | paper | navy | orange shapes |
| 6 | Parents say | navy | paper | yellow |
| 7 | Questions | orange | navy | navy/yellow objects |
| 8 | Builds gallery | paper | navy | teal/orange shapes |
| 9 | Footer | navy | paper | orange |

Section backgrounds carry large soft **circles and gear silhouettes** (low contrast, slowly rotating or drifting with scroll).

**Section hand-off (target):** the next color expands as a `clip-path: circle()` from the marble's position. Fallback: a simple scrubbed cross-fade or a hard edge with a small lid-flap shape. Log whichever you ship.

## Typography

- **Display:** heavy, **condensed**, uppercase, giant (`clamp(4rem, 18vw, 16rem)`), line-height ~0.85, one color per section. Used for section titles and hero slogan.
- **Body:** a friendly geometric/humanist sans, readable at 16-18px.
- **Both fonts MUST fully support Macedonian Cyrillic**, including **Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ**, at every weight used. Many fonts that look great in Latin fail here.
- Process (M0): build a dev-only page `/dev/fonts` rendering the Macedonian alphabet, the slogan, a paragraph and a button set in each candidate. Pick by eye and record in `DECISIONS.md`.
  - Display candidates to test: Oswald, Bebas Neue, Alumni Sans, Fira Sans Extra Condensed, Roboto Condensed (heavy weights), Unbounded (wide alternative).
  - Body candidates: Manrope, Onest, Nunito, Rubik.
  - Self-host via `next/font`; subsets Cyrillic + Latin.

## Illustration style

- Flat fills from the palette, **thick rounded navy outlines** (about 3-4px at 1x), slightly playful/imperfect shapes, tilt elements ±2-6°.
- "Sticker" treatment for UI badges: paper border + hard offset shadow (no blur).
- Recurring objects: the **box (separate lid and base groups)**, gear, rocket, lightbulb, wrench, bolt, spring, wooden peg, catapult, **marble**.
- **Assets:** check `brand/` first and match the owner's real logo and style. If missing, draw clean placeholder SVG components in `src/components/illustrations/` in this style, exposed through one `<Illustration name="..." />` component so files in `public/art/` can replace them later. List each placeholder in `ASSETS_NEEDED.md`.
- The box must be built so the lid can rotate on a hinge and the interior (orange) is visible when open.

## Motion principles

1. Max **five signature moments** (preloader, hero lid + dive, marble track, how-it-works cards, physics questions). Everything else is subtle.
2. Animate `transform` and `opacity` only (plus `clip-path` for the circle reveals). No layout-thrashing animations.
3. Playful easing for small things (`back.out`, light overshoot, squash and stretch), `power3` for large moves. Durations 0.4-0.9s; scroll scrub smoothing ~0.5-1.
4. Content is never trapped behind animation: text is in the HTML, selectable, and visible if animation fails.
5. Use `gsap.matchMedia()` with three branches: **desktop (fine pointer)**, **touch/mobile**, **reduced motion**.
6. Clean up everything on unmount (`gsap.context().revert()`, kill triggers, stop physics when off-screen).
7. **Reduced motion:** preloader becomes a ≤300ms fade; no scrub, no parallax, no physics (static piles), marble sits static or hidden; layout stays intact.
8. **Touch/mobile:** no custom cursor, native scroll (Lenis off), fewer physics bodies (8-10 vs 15-20), simplified vertical marble track, carousels are swipeable and unpinned, no hover-only interactions.

## The signature moments in detail

### A. Preloader: "Build to enter"
- Full-screen navy. Centered open INVENTO box (orange inside). Huge counter `0%` in the display font bottom-left; line of text bottom-right:
  - mk: "Стигнавте на градилиште. Следете ги упатствата."
  - en: "You've landed on a building site. Follow the instructions."
- 5 parts (gear, rocket, bulb, wrench, bolt) hover above the box. They drop in one by one with bounce, squash/stretch on the box and small orange sparks; the counter rises with them.
- **Tap/click a floating part** to send it in immediately (touch target ≥ 56px). Playful but optional.
- Progress = real readiness (fonts + hero assets + critical JS) blended with a minimum of ~1.6s, **hard cap ~4s** so a slow connection never holds the visitor.
- At 100%: the lid slams shut with a small shake, then bursts open; the preloader box hands off to the hero box (same position/scale) so the transition is seamless. Fallback: cross-fade.
- Shows **once per session** (`sessionStorage`), skip button after ~800ms ("Прескокни" / "Skip"), `Esc` skips, `?skip` param skips. Page content is already in the server HTML under the overlay; make sure the overlay does not tank LCP (verify; render its initial state in server HTML/CSS if needed).

### B. Hero: slogan around the box, lid opens on scroll
- Slogan words big and staggered around a large central box illustration: **ГРАДИ.** (top-left), **ОТКРИВАЈ.** (middle-right), **СОЗДАВАЈ.** (bottom-left). English slogan shown on `/en`; the other language as a small subline.
- Word micro-animations (once on load, replay on hover/tap):
  - ГРАДИ: letters drop in like blocks and stack with a bounce.
  - ОТКРИВАЈ: a lightbulb flickers three times, then a radial spotlight (`clip-path`) reveals the word from dim to full color.
  - СОЗДАВАЈ: a small rocket flies across the baseline leaving a trail that draws an underline.
- Hero pins for roughly 200vh: the **lid rotates open** on its hinge, parts pop out and hover, the box scales up (camera "dives inside"), slogan words split outward and fade, the background resolves to **orange**, and the **marble emerges** and drops onto the track start.

### C. Marble track (the thread through the page)
- A client component `MarbleTrack` mounted at the home layout level. Each section registers one or more **anchor elements** (`data-track-anchor="id"`, optional `side` and `loop`). The component builds one smooth SVG path (cubic Béziers) through the anchors, recalculated on resize/refresh.
- The track is a thick rounded line; the marble follows it with MotionPath, **scrubbed by overall scroll progress**. The portion already travelled is drawn bolder (dash offset).
- Track color follows the current section's accent token (`--track` var updated on section enter) so it is always visible.
- At the intro section the path makes a small **loop/curl** around the paragraph.
- **v1 scope:** track + marble + section hand-off reveals + 2-3 simple triggers (a gear that spins when the marble passes, a sticker that pops). Anything more elaborate (levers, dominoes, catapult triggers) goes to the backlog.
- Mobile: a simplified near-vertical track with gentle curves.

### D. How it works: fanned manual pages
- Four paper cards (assembly-manual pages) with tape corners, big numbers 01-04, a small illustration each, tilted between about -5° and +5°.
- On scroll they fly in from off-screen and settle in an overlapping fan; hand-drawn dashed arrows connect them; small floating numbered dots drift around.
- Mobile: vertical stack, alternating tilt, each reveals on enter.

### E. Questions: physics objects
- Giant title. When the section enters, bolts, nuts, gears, springs and wooden pegs fall from the top (Matter.js, canvas) and pile up; they can be flicked/dragged with a pointer.
- Performance: pause the engine when off-screen, let bodies sleep, cap body count (see matchMedia rules). Reduced motion: render a static pile.
- A paper card with the top FAQs (accordion) and Viber/Instagram buttons sits on top.

## Persistent and supporting UI

- **Header:** logo left, nav center, language switch (MK / EN), cart icon with count. Transparent on the hero; hides on scroll down and returns on scroll up. Mobile: full-screen menu with big type and a lid-open transition.
- **Order sticker:** tilted orange pill "Порачај / Order" fixed bottom-right (opens the cart drawer or goes to kits). Small round Instagram and Viber icon buttons bottom-left (desktop).
- **Custom cursor (fine pointer only):** a small gear that rotates with pointer speed, grows over links. Disabled on touch and reduced motion.
- **Route transitions (M5, nice-to-have):** a lid-wipe between pages (≤600ms), triggered through a custom link wrapper. Skip if it fights the App Router; log it.
- **Kit cards, chips, stock bar, gear difficulty rating, buttons, inputs:** consistent sticker-like components in `components/ui`.
