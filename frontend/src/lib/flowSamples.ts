import sampleCurry from "@/samples/sample-curry.json";
import sampleMorning from "@/samples/sample-morning.json";
import sampleAtm from "@/samples/sample-atm.json";
import sampleSimpleYes from "@/samples/sample-simple-yes.json";
import templateLinear from "@/samples/template-linear.json";
import templateStarter from "@/samples/template-starter.json";
import {
  normalizeFlowchartDocument,
  parseFlowchartDocument,
} from "@/lib/flowchart/model/document";
import type { FlowchartDocument } from "@/lib/flowchart/model/types";
import { DEFAULT_LAYOUT } from "@/lib/flowchart/model/types";

const SAMPLE_RAW: Record<string, unknown> = {
  curry: sampleCurry,
  morning: sampleMorning,
  atm: sampleAtm,
  simpleYes: sampleSimpleYes,
  templateStarter,
  templateLinear,
};

function parseSampleJson(
  raw: unknown,
  label: string
): FlowchartDocument | null {
  const text = JSON.stringify(raw);
  const { doc: parsed, errors } = parseFlowchartDocument(text);
  if (parsed && errors.length === 0) {
    return normalizeFlowchartDocument(parsed);
  }
  if (typeof console !== "undefined") {
    console.warn(
      `[flowSamples] ${label}: parse failed — ${errors.join(" / ") || "unknown"}`
    );
  }
  return null;
}

const templateStarterDoc =
  parseSampleJson(SAMPLE_RAW.templateStarter, "templateStarter") ??
  normalizeFlowchartDocument({
    version: 1,
    title: "はじめから",
    table: [],
    layout: DEFAULT_LAYOUT,
    schema: "default",
    createdAt: new Date(0).toISOString(),
  });

export const FLOW_SAMPLES: Record<string, FlowchartDocument> = {
  templateStarter: templateStarterDoc,
  templateLinear:
    parseSampleJson(SAMPLE_RAW.templateLinear, "templateLinear") ??
    templateStarterDoc,
  curry: parseSampleJson(SAMPLE_RAW.curry, "curry") ?? templateStarterDoc,
  morning: parseSampleJson(SAMPLE_RAW.morning, "morning") ?? templateStarterDoc,
  atm: parseSampleJson(SAMPLE_RAW.atm, "atm") ?? templateStarterDoc,
  simpleYes:
    parseSampleJson(SAMPLE_RAW.simpleYes, "simpleYes") ?? templateStarterDoc,
};
