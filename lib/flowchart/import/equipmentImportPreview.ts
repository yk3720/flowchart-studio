import {
  computeImportBatchIdFromBundle,
  formatImportBundleJson,
} from "./importBatchId";
import type { ImportBundle } from "./importBundleSchema";
import { prepareImportBundleForRpc } from "./prepareImportBundle";

export type EquipmentImportSourceKind = "json" | "xlsx";

export type EquipmentImportPreviewState = {
  batchId: string;
  jsonText: string;
  sourceKind: EquipmentImportSourceKind;
  sourceName: string;
  internalCode: string;
  displayName: string;
  unitCount: number;
  moduleCount: number;
  flowCount: number;
  warnings: string[];
  errors: string[];
};

export type BuildEquipmentImportPreviewInput = {
  bundle: ImportBundle;
  sourceKind: EquipmentImportSourceKind;
  sourceName: string;
  warnings?: string[];
};

export async function buildEquipmentImportPreview(
  input: BuildEquipmentImportPreviewInput
): Promise<EquipmentImportPreviewState> {
  const { bundle, sourceKind, sourceName, warnings = [] } = input;
  const rpcPrep = prepareImportBundleForRpc(bundle);
  const moduleCount = bundle.units.reduce(
    (sum, unit) => sum + unit.modules.length,
    0
  );

  return {
    batchId: await computeImportBatchIdFromBundle(bundle),
    jsonText: formatImportBundleJson(bundle),
    sourceKind,
    sourceName,
    internalCode: bundle.internal_code,
    displayName: bundle.display_name,
    unitCount: bundle.units.length,
    moduleCount,
    flowCount: bundle.flows.length,
    warnings,
    errors: rpcPrep.ok ? [] : rpcPrep.errors,
  };
}

export async function verifyEquipmentImportPreviewBatchId(
  preview: EquipmentImportPreviewState,
  bundle: ImportBundle
): Promise<boolean> {
  const batchId = await computeImportBatchIdFromBundle(bundle);
  return batchId === preview.batchId;
}
