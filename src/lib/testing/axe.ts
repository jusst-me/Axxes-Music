import { axe as runAxe } from 'vitest-axe';

type AxeOptions = NonNullable<Parameters<typeof runAxe>[1]>;

/**
 * Runs axe against a rendered container.
 *
 * The color-contrast rule is disabled: jsdom performs no layout and does not resolve the CSS custom
 * properties the theme is built on, so the rule can only ever report "incomplete". Contrast is
 * verified against the design tokens instead, see docs/04-design-system.md.
 */
export function axe(container: Element, options: AxeOptions = {}) {
  return runAxe(container, {
    ...options,
    rules: { 'color-contrast': { enabled: false }, ...options.rules },
  });
}
