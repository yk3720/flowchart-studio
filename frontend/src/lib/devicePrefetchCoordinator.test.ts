import { describe, expect, it } from "vitest";

import { createDevicePrefetchCoordinator } from "./devicePrefetchCoordinator";

describe("createDevicePrefetchCoordinator", () => {
  it("track 中は isInFlight が true · 完了後に false", async () => {
    const coordinator = createDevicePrefetchCoordinator();
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });

    coordinator.track("device-a", promise);
    expect(coordinator.isInFlight("device-a")).toBe(true);
    expect(coordinator.isInFlight("device-b")).toBe(false);

    resolve();
    await promise;
    expect(coordinator.isInFlight("device-a")).toBe(false);
  });

  it("awaitFor は該当装置の prefetch 完了まで待つ", async () => {
    const coordinator = createDevicePrefetchCoordinator();
    const order: string[] = [];

    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        order.push("prefetch-done");
        resolve();
      }, 10);
    });
    coordinator.track("device-a", promise);

    await coordinator.awaitFor("device-a");
    order.push("load-after-await");

    expect(order).toEqual(["prefetch-done", "load-after-await"]);
  });

  it("別装置の prefetch は awaitFor しない", async () => {
    const coordinator = createDevicePrefetchCoordinator();
    const promise = new Promise<void>(() => {
      /* 意図的に未解決 */
    });
    coordinator.track("device-a", promise);

    await coordinator.awaitFor("device-b");
    expect(coordinator.isInFlight("device-a")).toBe(true);
  });

  it("新しい track で古い promise の finally が inFlight を消さない", async () => {
    const coordinator = createDevicePrefetchCoordinator();
    let resolveOld!: () => void;
    const oldPromise = new Promise<void>((r) => {
      resolveOld = r;
    });
    coordinator.track("device-a", oldPromise);

    const newPromise = Promise.resolve();
    coordinator.track("device-a", newPromise);
    await newPromise;

    expect(coordinator.isInFlight("device-a")).toBe(false);

    resolveOld();
    await oldPromise;
    expect(coordinator.isInFlight("device-a")).toBe(false);
  });
});
