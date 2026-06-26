import { canDeleteDevice } from "@/lib/flowchart/policy/deviceDeletePermissions";
import { canResetFlowContent } from "@/lib/flowchart/policy/flowResetPermissions";
import { canDeleteModule } from "@/lib/flowchart/policy/moduleDeletePermissions";
import { canDeleteUnit } from "@/lib/flowchart/policy/unitDeletePermissions";
import type { ProfileRole } from "@/lib/auth/types";

import type {
  Device,
  FlowModule,
} from "@/lib/flowchart/equipment/moduleHierarchy";

export type ServerModule = FlowModule & {
  hasFlow?: boolean;
  flowCreatedBy?: string;
};

/** Strip createdBy; attach canDelete / canReset flags for client UI */
export function mapDevicesForClient(
  devices: Device[],
  role: ProfileRole,
  userId: string | undefined
): Device[] {
  return devices.map((device) => ({
    id: device.id,
    internalCode: device.internalCode,
    name: device.name,
    memo: device.memo ?? "",
    canDelete: canDeleteDevice(role, userId, device),
    units: device.units.map((unit) => ({
      id: unit.id,
      label: unit.label,
      memo: unit.memo ?? "",
      modules: unit.modules.map((mod) => {
        const serverMod = mod as ServerModule;
        return {
          id: mod.id,
          label: mod.label,
          memo: mod.memo ?? "",
          legacyKey: mod.legacyKey,
          canReset: canResetFlowContent(role, userId, {
            hasFlow: serverMod.hasFlow ?? false,
            createdBy: serverMod.flowCreatedBy,
          }),
          canDelete: canDeleteModule(role, userId, device, unit),
        };
      }),
      canDelete: canDeleteUnit(role, userId, device, unit),
    })),
  }));
}

/** AUTH_DISABLED demo devices: mark all modules hasFlow for permission flags */
export function mapDemoDevicesForClient(
  devices: Device[],
  role: ProfileRole,
  userId: string | undefined
): Device[] {
  const withFlowMeta = devices.map((device) => ({
    ...device,
    ...(userId ? { createdBy: userId } : {}),
    units: device.units.map((unit) => ({
      ...unit,
      ...(userId ? { createdBy: userId } : {}),
      modules: unit.modules.map(
        (mod): ServerModule => ({
          ...mod,
          hasFlow: true,
          flowCreatedBy: userId,
        })
      ),
    })),
  }));
  return mapDevicesForClient(withFlowMeta, role, userId);
}
