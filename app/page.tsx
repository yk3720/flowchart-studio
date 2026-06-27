import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAuthState } from "@/lib/auth/session";
import { FlowchartWorkspace } from "@/components/flowchart/FlowchartWorkspace";
import { fetchDeviceHierarchy } from "@/lib/flowchart/actions/hierarchy/deviceHierarchy";
import {
  mapDemoDevicesForClient,
  mapDevicesForClient,
} from "@/lib/flowchart/mapDevicesForClient";
import {
  DEMO_DEVICES,
  GENERAL_DEMO_DEVICES,
} from "@/lib/flowchart/equipment/moduleHierarchy";
import { getDemoProfile } from "@/lib/demo/demoProfile";

const PAGE_TITLES = {
  allowed: "Flowchart Studio",
  technical: "Flowchart Studio（技術デモ）",
  general: "Flowchart Studio（一般デモ）",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") ?? "";
  const profile = getDemoProfile(hostname);
  const authState = await import("@/lib/auth/session").then((m) =>
    m.getAuthState()
  );
  const title =
    authState.kind === "allowed" ? PAGE_TITLES.allowed : PAGE_TITLES[profile];
  return { title };
}

export default async function HomePage() {
  const state = await getAuthState();

  if (state.kind === "guest") {
    redirect("/login");
  }
  if (state.kind === "pending") {
    redirect("/login/no-access");
  }

  const context =
    state.kind === "allowed"
      ? state.context
      : state.kind === "disabled"
        ? state.context
        : null;

  if (!context) {
    redirect("/login");
  }

  const headersList = await headers();
  const hostname = headersList.get("host") ?? "";
  const demoProfile = getDemoProfile(hostname);
  const rawDemoDevices =
    demoProfile === "general" ? GENERAL_DEMO_DEVICES : DEMO_DEVICES;

  let devices = mapDemoDevicesForClient(
    rawDemoDevices,
    context.role,
    context.userId
  );
  if (state.kind === "allowed") {
    const hierarchy = await fetchDeviceHierarchy();
    if (hierarchy.ok) {
      devices = mapDevicesForClient(
        hierarchy.devices,
        context.role,
        context.userId
      );
    }
  }

  return (
    <FlowchartWorkspace
      role={context.role}
      email={context.email}
      authDisabled={state.kind === "disabled"}
      devices={devices}
    />
  );
}
