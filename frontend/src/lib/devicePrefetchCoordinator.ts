export type DevicePrefetchCoordinator = {
  track: (deviceId: string, promise: Promise<void>) => void;
  isInFlight: (deviceId: string) => boolean;
  awaitFor: (deviceId: string) => Promise<void>;
};

/** 装置プリフェッチの進行中 Promise — loadModule が完了を待つ */
export function createDevicePrefetchCoordinator(): DevicePrefetchCoordinator {
  let inFlight: { deviceId: string; promise: Promise<void> } | null = null;

  return {
    track(deviceId, promise) {
      inFlight = { deviceId, promise };
      void promise.finally(() => {
        if (inFlight?.promise === promise) {
          inFlight = null;
        }
      });
    },
    isInFlight(deviceId) {
      return inFlight?.deviceId === deviceId;
    },
    async awaitFor(deviceId) {
      if (inFlight?.deviceId === deviceId) {
        await inFlight.promise;
      }
    },
  };
}
