import templateStarter from "@/samples/template-starter.json";

import type { ModuleSnapshot } from "../browser/moduleDraftRepository";
import { snapshotFromFlowchartDocument } from "../model/snapshotFromDocument";
import type { FlowchartDocument } from "../model/types";

let cachedStarter: ModuleSnapshot | null = null;

/** フロー中身リセット時に使う雛形（template-starter と同一） */
export function getStarterFlowSnapshot(): ModuleSnapshot {
  if (cachedStarter) {
    return cachedStarter;
  }

  const result = snapshotFromFlowchartDocument(
    templateStarter as FlowchartDocument
  );
  if (!result.ok) {
    throw new Error(`starter snapshot failed: ${result.errors.join(" / ")}`);
  }

  cachedStarter = result.snapshot;
  return cachedStarter;
}
