"use client";
import { useSyncExternalStore } from "react";

const MQ = "(min-width: 1024px)";

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    () => false
  );
}
