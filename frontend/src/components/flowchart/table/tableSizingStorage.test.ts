import { describe, expect, it } from "vitest";
import {
  loadColWidths,
  makeSizingStorageKey,
  saveColWidths,
} from "./tableSizingStorage";

describe("makeSizingStorageKey", () => {
  it("includes version suffix", () => {
    expect(makeSizingStorageKey(9)).toContain("v1");
  });

  it("uses colCount as fallback schema", () => {
    expect(makeSizingStorageKey(9)).toContain("9col");
    expect(makeSizingStorageKey(10)).toContain("10col");
  });

  it("uses tableSchema when provided", () => {
    const key = makeSizingStorageKey(9, "table-9col-v1");
    expect(key).toContain("table-9col-v1");
  });

  it("produces different keys for different schemas", () => {
    expect(makeSizingStorageKey(8)).not.toBe(makeSizingStorageKey(9));
  });
});

describe("loadColWidths / saveColWidths", () => {
  it("returns null for unknown key", () => {
    expect(loadColWidths("no-such-key", 5)).toBeNull();
  });

  it("round-trips valid widths", () => {
    const key = "test:col:v1";
    const widths = [40, 80, 160, 160, 72];
    saveColWidths(key, widths);
    expect(loadColWidths(key, widths.length)).toEqual(widths);
    localStorage.removeItem(key);
  });

  it("returns null when stored length does not match expectedLength", () => {
    const key = "test:col:mismatch";
    saveColWidths(key, [40, 80, 160]);
    expect(loadColWidths(key, 5)).toBeNull();
    localStorage.removeItem(key);
  });
});
