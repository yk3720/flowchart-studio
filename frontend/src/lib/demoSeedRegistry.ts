"use client";

import { serializeDocument } from "@/lib/flowchart/model/document";
import type { ModuleSnapshot } from "@/lib/flowchart/browser/moduleDraftRepository";
import { FLOW_SAMPLES } from "@/client/flowSamples";

function sampleToSnapshot(key: string): ModuleSnapshot | null {
  const doc = FLOW_SAMPLES[key];
  if (!doc) return null;
  const text = serializeDocument(doc);
  return { jsonText: text, committedJson: text, nodes: [], edges: [] };
}

/** 一般デモモジュール ID → サンプルキー（ADR-018） */
const GENERAL_DEMO_SEED_MAP: Record<string, string> = {
  "c0000003-0001-4001-8001-000000003001": "curry", // 料理・カレーを作る
  "c0000003-0001-4001-8001-000000003002": "morning", // 料理・パスタを作る
  "c0000003-0002-4001-8001-000000003003": "atm", // 掃除・キッチンを掃除する
  "c0000003-0002-4001-8001-000000003004": "simpleYes", // 掃除・浴室を掃除する
};

/** AUTH_DISABLED デモ時にモジュール ID に対応する同梱シードを返す */
export function getDemoSeed(moduleId: string): ModuleSnapshot | null {
  const key = GENERAL_DEMO_SEED_MAP[moduleId];
  if (!key) return null;
  return sampleToSnapshot(key);
}
