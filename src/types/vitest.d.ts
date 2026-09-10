import 'vitest';

import type { AxeMatchers } from 'vitest-axe/matchers';

/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars --
   Merging into Vitest's own Assertion interface requires an empty body and a type parameter list
   identical to the original declaration. */
declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
}
