import { cn } from "@/lib/utils";
import type { RefObject } from "react";

type Props = {
  dockRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  className?: string;
};

/**
 * 表ビューポート下端に固定するドック型横スクロールバー。
 * aria-hidden — 操作は表本体のネイティブスクロールで行うため装飾扱い。
 */
export function FlowTableDockScrollbar({
  dockRef,
  innerRef,
  className,
}: Props) {
  return (
    <div
      ref={dockRef}
      aria-hidden="true"
      className={cn("shrink-0 overflow-x-scroll overflow-y-hidden", className)}
    >
      <div ref={innerRef} style={{ height: 1 }} />
    </div>
  );
}
