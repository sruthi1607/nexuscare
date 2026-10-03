import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Route modules are lazy-loaded and compiled on first use in tests, which can exceed the 1 s
// default wait on a busy machine.
configure({ asyncUtilTimeout: 3_000 });

// jsdom does not implement scrolling; React Router's ScrollRestoration calls it.
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
