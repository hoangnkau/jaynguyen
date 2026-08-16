/**
 * Declares which background texture a page wears.
 *
 * The pattern itself is painted by a single `body::before` layer in
 * globals.css, selected with `body:has([data-pattern="..."])`. Doing it this
 * way rather than putting the pattern on a wrapper element buys three things:
 *
 *   - one fixed layer for the whole document, so a long page does not tile
 *     visibly and the browser paints the texture once rather than per screen;
 *   - no extra DOM around the content, so the page layout is untouched;
 *   - the pattern stays entirely in CSS, where it can be reasoned about
 *     alongside the contrast measurements that constrain it.
 *
 * The marker is hidden and aria-hidden: it exists for the selector, and a
 * screen reader should never meet it. `:has()` matches regardless of
 * display, so hiding it costs nothing. On a browser without `:has()` the
 * page simply renders with no texture, which is a fine place to land.
 */
export type PatternName =
  | "circuit"
  | "grid"
  | "contour"
  | "dots"
  | "rings"
  | "rules";

export function PagePattern({ name }: { name: PatternName }) {
  return <span hidden aria-hidden="true" data-pattern={name} />;
}
