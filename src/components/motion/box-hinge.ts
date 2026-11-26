/**
 * Transform origin for the box's "lid-open" flap groups: back flaps fold down onto the rim
 * (hinge at their bottom edge), front flaps (marked data-hinge-top) fold up (hinge at their top).
 * For GSAP's function-based values.
 */
export const flapHinge = (_i: number, el: Element) => (el.hasAttribute('data-hinge-top') ? '50% 0%' : '50% 100%')
