import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isPlaywrightActionStubEnabled,
  isPlaywrightAuthStubEnabled,
} from "./e2eStub";

describe("isPlaywrightActionStubEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false on Vercel production even when flags are set", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PLAYWRIGHT_E2E", "1");
    vi.stubEnv("MODULE_DELETE_E2E_STUB", "1");
    expect(isPlaywrightActionStubEnabled("MODULE_DELETE_E2E_STUB")).toBe(false);
  });

  it("returns true when flags are set and not Vercel production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PLAYWRIGHT_E2E", "1");
    vi.stubEnv("IMPORT_E2E_STUB", "1");
    expect(isPlaywrightActionStubEnabled("IMPORT_E2E_STUB")).toBe(true);
  });
});

describe("isPlaywrightAuthStubEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when AUTH_DISABLED=1", () => {
    vi.stubEnv("PLAYWRIGHT_E2E", "1");
    vi.stubEnv("AUTH_E2E_STUB", "1");
    vi.stubEnv("AUTH_DISABLED", "1");
    expect(isPlaywrightAuthStubEnabled()).toBe(false);
  });

  it("returns true when auth stub flags set and AUTH_DISABLED=0", () => {
    vi.stubEnv("PLAYWRIGHT_E2E", "1");
    vi.stubEnv("AUTH_E2E_STUB", "1");
    vi.stubEnv("AUTH_DISABLED", "0");
    expect(isPlaywrightAuthStubEnabled()).toBe(true);
  });

  it("returns false on Vercel production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PLAYWRIGHT_E2E", "1");
    vi.stubEnv("AUTH_E2E_STUB", "1");
    vi.stubEnv("AUTH_DISABLED", "0");
    expect(isPlaywrightAuthStubEnabled()).toBe(false);
  });
});
