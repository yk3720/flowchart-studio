import { describe, expect, it } from "vitest";

import {
  formatBuildLabel,
  formatBuildTitle,
  formatDeployEnvLabel,
  resolveBuildInfo,
} from "./buildInfo";

describe("buildInfo", () => {
  it("formatBuildLabel for production", () => {
    const info = resolveBuildInfo({
      NEXT_PUBLIC_APP_VERSION: "0.1.0",
      NEXT_PUBLIC_BUILD_SHA: "c92f345",
      NEXT_PUBLIC_BUILD_ENV: "production",
      NEXT_PUBLIC_BUILD_TIME: "2026-06-26T10:00:00.000Z",
    });
    expect(formatBuildLabel(info)).toBe("v0.1.0 · c92f345 · 本番");
    expect(formatBuildTitle(info)).toContain("2026-06-26T10:00:00.000Z");
  });

  it("formatDeployEnvLabel", () => {
    expect(formatDeployEnvLabel("production")).toBe("本番");
    expect(formatDeployEnvLabel("preview")).toBe("preview");
    expect(formatDeployEnvLabel("local")).toBe("local");
  });
});
