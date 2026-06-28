import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Device,
  FlowModule,
} from "@/lib/flowchart/equipment/moduleHierarchy";
import type { ModuleSnapshot } from "@/lib/flowchart/browser/moduleDraftRepository";

const store = new Map<string, ModuleSnapshot>();

vi.mock("@/lib/flowchart/actions/documents/flowDocuments", () => ({
  loadFlowDocument: vi.fn(),
  loadFlowDocumentsBatch: vi.fn(),
}));

vi.mock("@/lib/flowchart/browser/offlineFlowCache", () => ({
  getOfflineModuleCache: vi.fn().mockResolvedValue(null),
  putOfflineModuleCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase/env", () => ({
  isAuthDisabled: vi.fn(() => true),
}));

vi.mock("@/lib/flowchart/browser/moduleDraftRepository", () => ({
  moduleDraftRepository: {
    get: (key: string) => store.get(key) ?? null,
    set: (key: string, snapshot: ModuleSnapshot) => {
      store.set(key, snapshot);
    },
  },
}));

import {
  loadFlowDocument,
  loadFlowDocumentsBatch,
} from "@/lib/flowchart/actions/documents/flowDocuments";
import { isAuthDisabled } from "@/lib/supabase/env";

import {
  clearModuleWarmCache,
  loadModuleDraft,
  peekModuleWarmCache,
  prefetchDeviceModuleDrafts,
} from "./moduleDraftLoader";

const testModule: FlowModule = {
  id: "c0000001-0001-4001-8001-000000000101",
  label: "供給動作",
  legacyKey: "supply-feed",
};

const device: Device = {
  id: "a0000001-0001-4001-8001-000000000001",
  name: "プレス A",
  internalCode: "DEMO-001",
  units: [
    {
      id: "b0000001-0001-4001-8001-000000000101",
      label: "供給ユニット",
      modules: [testModule],
    },
  ],
};

describe("loadModuleDraft isCancelled", () => {
  afterEach(() => {
    store.clear();
    clearModuleWarmCache();
    vi.clearAllMocks();
  });

  it("isCancelled が false なら local の snapshot を返す", async () => {
    store.set(testModule.id, {
      jsonText: '{"title":"saved"}',
      committedJson: "",
      nodes: [],
      edges: [],
    });

    const result = await loadModuleDraft(testModule, device, {
      isCancelled: () => false,
    });

    expect(result.source).toBe("local");
    expect(result.snapshot?.jsonText).toContain("saved");
  });

  it("isCancelled が true なら snapshot を適用しない", async () => {
    store.set(testModule.id, {
      jsonText: '{"title":"stale"}',
      committedJson: "",
      nodes: [],
      edges: [],
    });

    const result = await loadModuleDraft(testModule, device, {
      isCancelled: () => true,
    });

    expect(result).toEqual({ snapshot: null, source: "none" });
  });
});

describe("prefetchDeviceModuleDrafts warm cache", () => {
  const snapshot: ModuleSnapshot = {
    jsonText: '{"title":"prefetched"}',
    committedJson: "",
    nodes: [],
    edges: [],
  };

  beforeEach(() => {
    vi.stubGlobal("navigator", { onLine: true });
  });

  afterEach(() => {
    store.clear();
    clearModuleWarmCache();
    vi.clearAllMocks();
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("プリフェッチ後は loadModuleDraft がクラウド往復なしで返す", async () => {
    vi.mocked(isAuthDisabled).mockReturnValue(false);
    vi.mocked(loadFlowDocumentsBatch).mockResolvedValue({
      ok: true,
      documents: { [testModule.id]: snapshot },
    });

    await prefetchDeviceModuleDrafts(device, {
      isCancelled: () => false,
    });

    const result = await loadModuleDraft(testModule, device);
    expect(result.source).toBe("cloud");
    expect(result.snapshot?.jsonText).toContain("prefetched");
    expect(loadFlowDocument).not.toHaveBeenCalled();

    const peeked = peekModuleWarmCache(device.id, testModule.id);
    expect(peeked?.source).toBe("cloud");
    expect(peeked?.snapshot?.jsonText).toContain("prefetched");
  });

  it("peekModuleWarmCache はプリフェッチ前は null", () => {
    expect(peekModuleWarmCache(device.id, testModule.id)).toBeNull();
  });

  it("isCancelled 中は warm cache を作らない", async () => {
    vi.mocked(isAuthDisabled).mockReturnValue(false);
    vi.mocked(loadFlowDocumentsBatch).mockResolvedValue({
      ok: true,
      documents: { [testModule.id]: snapshot },
    });
    vi.mocked(loadFlowDocument).mockResolvedValue({
      ok: false,
      error: "not_found",
    });

    await prefetchDeviceModuleDrafts(device, {
      isCancelled: () => true,
    });

    store.set(testModule.id, {
      jsonText: '{"title":"local"}',
      committedJson: "",
      nodes: [],
      edges: [],
    });

    const result = await loadModuleDraft(testModule, device, {
      isCancelled: () => false,
    });
    expect(result.source).toBe("local");
  });
});
