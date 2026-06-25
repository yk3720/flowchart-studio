import type { RefObject } from "react";

type Props = {
  dockRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
};

/**
 * 表ビューポート下端に固定するドック型横スクロールバー。
 * aria-hidden — 操作は表本体のネイティブスクロールで行うため装飾扱い。
 */
export function FlowTableDockScrollbar({ dockRef, innerRef }: Props) {
  return (
    <div
      ref={dockRef}
      aria-hidden="true"
      className="shrink-0 overflow-x-scroll overflow-y-hidden"
    >
      <div ref={innerRef} style={{ height: 1 }} />
    </div>
  );
}
