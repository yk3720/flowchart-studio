"use client";

import {
  COLOR_HINT_LEGEND_ITEMS,
  FLOW_NODE_FRAME_STROKE,
} from "@/lib/flowchart/visual/flowColors";
import { fcColorLegend } from "./flowchartUiClasses";

/** プレビュー列 chrome 帯に配置する色列凡例 */
export function FlowColorLegend() {
  return (
    <div className={fcColorLegend} aria-label="色列の凡例">
      {COLOR_HINT_LEGEND_ITEMS.map(({ hint, label, title, fill }) => (
        <span
          key={hint}
          className="inline-flex items-center gap-1"
          title={title}
        >
          <span
            className="inline-block h-4 w-4 shrink-0 border-2 sm:h-5 sm:w-5"
            style={{
              backgroundColor: fill,
              borderColor: FLOW_NODE_FRAME_STROKE,
            }}
            aria-hidden
          />
          {label}
        </span>
      ))}
    </div>
  );
}
