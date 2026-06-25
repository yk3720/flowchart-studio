import { useCallback, useEffect, useRef } from "react";

/**
 * 表ビューポートとドック横スクロールバーの scrollLeft を双方向同期する。
 * viewportRef: 表の overflow-auto コンテナ
 * dockRef: aria-hidden のドック div（overflow-x: scroll）
 * innerRef: ドック div の中の幅合わせ用 div
 */
export function useSyncedHorizontalScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const syncInnerWidth = useCallback(() => {
    const viewport = viewportRef.current;
    const inner = innerRef.current;
    if (viewport && inner) {
      inner.style.width = `${viewport.scrollWidth}px`;
    }
  }, []);

  // scrollLeft 双方向同期
  useEffect(() => {
    const viewport = viewportRef.current;
    const dock = dockRef.current;
    if (!viewport || !dock) return;

    let syncing = false;

    const onViewportScroll = () => {
      if (syncing) return;
      syncing = true;
      dock.scrollLeft = viewport.scrollLeft;
      syncing = false;
    };

    const onDockScroll = () => {
      if (syncing) return;
      syncing = true;
      viewport.scrollLeft = dock.scrollLeft;
      syncing = false;
    };

    viewport.addEventListener("scroll", onViewportScroll, { passive: true });
    dock.addEventListener("scroll", onDockScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onViewportScroll);
      dock.removeEventListener("scroll", onDockScroll);
    };
  }, []);

  // ドック内幅を表の scrollWidth に合わせ続ける
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    syncInnerWidth();
    const ro = new ResizeObserver(syncInnerWidth);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [syncInnerWidth]);

  return { viewportRef, dockRef, innerRef, syncInnerWidth };
}
