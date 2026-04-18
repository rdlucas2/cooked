import { afterEach, vi } from "vitest";

// Reset localStorage between tests
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
