"use client";

import {
  loadFlowDocument,
  loadFlowDocumentsBatch,
} from "@/lib/flowchart/actions/documents/flowDocuments";
import type {
  Device,
  FlowModule,
} from "@/lib/flowchart/equipment/moduleHierarchy";
import {
  collectDeviceModules,
  moduleStorageKey,
  resolveModuleDraftKeys,
} from "@/lib/flowchart/equipment/moduleHierarchy";
import {
  getOfflineModuleCache,
  putOfflineModuleCache,
} from "@/lib/flowchart/browser/offlineFlowCache";
import type { ModuleSnapshot } from "@/lib/flowchart/browser/moduleDraftRepository";
import { moduleDraftRepository } from "@/lib/flowchart/browser/moduleDraftRepository";
import { isAuthDisabled } from "@/lib/supabase/env";

export type ModuleLoadSource = "cloud" | "offline" | "local" | "none";

export type ModuleLoadResult = {
  snapshot: ModuleSnapshot | null;
  source: ModuleLoadSource;
  offlineCachedAt?: string;
};

export type ModuleLoadOptions = {
  /** true のとき結果を適用しない（進行中読込の無効化） */
  isCancelled?: () => boolean;
};

/** 装置選択時のプリフェッチ — 動作切替を即時化 */
let warmCacheDeviceId: string | null = null;
const warmCache = new Map<string, ModuleLoadResult>();

function resetWarmCache(deviceId: string): void {
  warmCache.clear();
  warmCacheDeviceId = deviceId;
}

function setWarmCache(
  deviceId: string,
  moduleId: string,
  result: ModuleLoadResult
): void {
  if (warmCacheDeviceId !== deviceId) {
    resetWarmCache(deviceId);
  }
  warmCache.set(moduleId, result);
}

function getWarmCache(
  deviceId: string,
  moduleId: string
): ModuleLoadResult | null {
  if (warmCacheDeviceId !== deviceId) return null;
  return warmCache.get(moduleId) ?? null;
}

/** テスト用 */
export function clearModuleWarmCache(): void {
  warmCache.clear();
  warmCacheDeviceId = null;
}

async function loadFromCloud(
  moduleUuid: string,
  primaryKey: string,
  isCancelled?: () => boolean
): Promise<ModuleLoadResult | null> {
  if (
    isAuthDisabled() ||
    typeof navigator === "undefined" ||
    !navigator.onLine
  ) {
    return null;
  }

  const cloud = await loadFlowDocument(moduleUuid);
  if (isCancelled?.()) return null;
  if (cloud.ok) {
    if (!isCancelled?.()) {
      await putOfflineModuleCache(primaryKey, cloud.snapshot);
    }
    return { snapshot: cloud.snapshot, source: "cloud" };
  }
  if (cloud.error !== "not_found" && cloud.error !== "invalid_module_id") {
    const offline = await getOfflineModuleCache(primaryKey);
    if (offline) {
      return {
        snapshot: offline.snapshot,
        source: "offline",
        offlineCachedAt: offline.cachedAt,
      };
    }
  }

  return null;
}

/** 装置配下のフローを一括取得し warm cache / IndexedDB に載せる */
export async function prefetchDeviceModuleDrafts(
  device: Device,
  options?: ModuleLoadOptions
): Promise<void> {
  const isCancelled = options?.isCancelled;
  if (
    isAuthDisabled() ||
    typeof navigator === "undefined" ||
    !navigator.onLine
  ) {
    return;
  }

  const modules = collectDeviceModules(device);
  if (modules.length === 0) return;

  resetWarmCache(device.id);

  const batch = await loadFlowDocumentsBatch(modules.map((m) => m.id));
  if (isCancelled?.()) return;
  if (!batch.ok) return;

  for (const mod of modules) {
    if (isCancelled?.()) return;
    const snapshot = batch.documents[mod.id];
    if (!snapshot) continue;

    const primaryKey = moduleStorageKey(mod.id);
    const result: ModuleLoadResult = { snapshot, source: "cloud" };
    setWarmCache(device.id, mod.id, result);
    await putOfflineModuleCache(primaryKey, snapshot);
  }
}

export async function loadModuleDraft(
  module: FlowModule,
  device: Device,
  options?: ModuleLoadOptions
): Promise<ModuleLoadResult> {
  const isCancelled = options?.isCancelled;
  const storageKeys = resolveModuleDraftKeys(module, device);
  const primaryKey = moduleStorageKey(module.id);

  const warm = getWarmCache(device.id, module.id);
  if (warm) {
    if (isCancelled?.()) {
      return { snapshot: null, source: "none" };
    }
    return warm;
  }

  const fromCloud = await loadFromCloud(module.id, primaryKey, isCancelled);
  if (fromCloud) {
    if (isCancelled?.()) {
      return { snapshot: null, source: "none" };
    }
    setWarmCache(device.id, module.id, fromCloud);
    return fromCloud;
  }

  for (const key of storageKeys) {
    const offline = await getOfflineModuleCache(key);
    if (isCancelled?.()) {
      return { snapshot: null, source: "none" };
    }
    if (offline) {
      const result: ModuleLoadResult = {
        snapshot: offline.snapshot,
        source: "offline",
        offlineCachedAt: offline.cachedAt,
      };
      if (key !== primaryKey) {
        await putOfflineModuleCache(primaryKey, offline.snapshot, {
          pinned: offline.pinned,
        });
      }
      setWarmCache(device.id, module.id, result);
      return result;
    }
  }

  for (const key of storageKeys) {
    if (isCancelled?.()) {
      return { snapshot: null, source: "none" };
    }
    const local = moduleDraftRepository.get(key);
    if (local) {
      const result: ModuleLoadResult = { snapshot: local, source: "local" };
      if (key !== primaryKey) {
        moduleDraftRepository.set(primaryKey, local);
      }
      setWarmCache(device.id, module.id, result);
      return result;
    }
  }

  return { snapshot: null, source: "none" };
}

export type PersistModuleDraftResult = {
  cloudSaved: boolean;
  cloudError?: string;
};

export async function persistModuleDraft(
  module: FlowModule,
  device: Device,
  snapshot: ModuleSnapshot,
  options: { saveToCloud: boolean }
): Promise<PersistModuleDraftResult> {
  const primaryKey = moduleStorageKey(module.id);
  moduleDraftRepository.set(primaryKey, snapshot);
  await putOfflineModuleCache(primaryKey, snapshot);

  const warmResult: ModuleLoadResult = { snapshot, source: "local" };
  setWarmCache(device.id, module.id, warmResult);

  if (options.saveToCloud && !isAuthDisabled() && navigator.onLine) {
    const { saveFlowDocument } =
      await import("@/lib/flowchart/actions/documents/flowDocuments");
    const result = await saveFlowDocument(module.id, snapshot);
    if (!result.ok) {
      return { cloudSaved: false, cloudError: result.error };
    }
    setWarmCache(device.id, module.id, { snapshot, source: "cloud" });
    return { cloudSaved: true };
  }

  return { cloudSaved: false };
}
