"use client";

import {
  ChevronDown,
  ChevronRight,
  FoldVertical,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Trash2,
  UnfoldVertical,
} from "lucide-react";
import { useCallback, useRef, type KeyboardEvent } from "react";

import {
  formatDeviceSelectLabel,
  type Device,
  type FlowModule,
  type FlowUnit,
} from "@/lib/flowchart/equipment/moduleHierarchy";
import { cn } from "@/lib/utils";

import { BuildVersionFootnote } from "./BuildVersionFootnote";

import {
  fcNavAside,
  fcNavAsideCollapsed,
  fcBorderB,
  fcNavChevron,
  fcNavCollapseBtn,
  fcNavDeleteBtn,
  fcNavHeader,
  fcNavIconBtn,
  fcNavLabel,
  fcNavModuleBtn,
  fcNavModuleBtnState,
  fcNavModuleList,
  fcNavSelect,
  fcNavTitle,
  fcNavToggleAllBtn,
  fcNavUnitRow,
  fcNavUnitToggle,
} from "./flowchartUiClasses";

type ModuleNavPaneProps = {
  devices: readonly Device[];
  selectedDeviceId: string;
  device: Device;
  selectedModuleId: string | null;
  expandedUnitIds: ReadonlySet<string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectDevice: (deviceId: string) => void;
  onToggleUnit: (unitId: string) => void;
  onToggleAllUnits: () => void;
  onSelectModule: (moduleId: string) => void;
  onRequestDeleteUnit?: (unitId: string) => void;
  onRequestDeleteModule?: (moduleId: string) => void;
  /** §E N9: デスクトップのみ渡す — ペイン幅を v2 デフォルトへリセット */
  onResetPaneWidths?: () => void;
};

function getNavFocusables(nav: HTMLElement | null): HTMLElement[] {
  if (!nav) return [];
  return Array.from(
    nav.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

function ModuleButton({
  module,
  selected,
  onSelect,
  showDelete,
  onRequestDelete,
}: {
  module: FlowModule;
  selected: boolean;
  onSelect: () => void;
  showDelete: boolean;
  onRequestDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "page" : undefined}
        className={cn(fcNavModuleBtn, fcNavModuleBtnState(selected))}
      >
        <span className="truncate">{module.label}</span>
      </button>
      {showDelete && onRequestDelete ? (
        <button
          type="button"
          onClick={onRequestDelete}
          data-testid={`delete-module-${module.id}`}
          className={fcNavDeleteBtn}
          title={`${module.label} を削除`}
          aria-label={`${module.label} を削除`}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function UnitSection({
  unit,
  expanded,
  selectedModuleId,
  onToggleUnit,
  onSelectModule,
  showDelete,
  onRequestDelete,
  onRequestDeleteModule,
}: {
  unit: FlowUnit;
  expanded: boolean;
  selectedModuleId: string | null;
  onToggleUnit: () => void;
  onSelectModule: (moduleId: string) => void;
  showDelete: boolean;
  onRequestDelete?: () => void;
  onRequestDeleteModule?: (moduleId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className={fcNavUnitRow}>
        <button
          type="button"
          onClick={onToggleUnit}
          aria-expanded={expanded}
          data-unit-toggle
          data-unit-id={unit.id}
          className={fcNavUnitToggle}
        >
          {expanded ? (
            <ChevronDown className={fcNavChevron} aria-hidden />
          ) : (
            <ChevronRight className={fcNavChevron} aria-hidden />
          )}
          <span className="truncate">{unit.label}</span>
        </button>
        {showDelete && onRequestDelete ? (
          <button
            type="button"
            onClick={onRequestDelete}
            data-testid={`delete-unit-${unit.id}`}
            className={fcNavDeleteBtn}
            title={`${unit.label} を削除`}
            aria-label={`${unit.label} を削除`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      {expanded ? (
        <div className={fcNavModuleList}>
          {unit.modules.map((mod) => (
            <ModuleButton
              key={mod.id}
              module={mod}
              selected={selectedModuleId === mod.id}
              onSelect={() => onSelectModule(mod.id)}
              showDelete={mod.canDelete === true}
              onRequestDelete={
                onRequestDeleteModule
                  ? () => onRequestDeleteModule(mod.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ModuleNavPane({
  devices,
  selectedDeviceId,
  device,
  selectedModuleId,
  expandedUnitIds,
  collapsed,
  onToggleCollapsed,
  onSelectDevice,
  onToggleUnit,
  onToggleAllUnits,
  onSelectModule,
  onRequestDeleteUnit,
  onRequestDeleteModule,
  onResetPaneWidths,
}: ModuleNavPaneProps) {
  const navRef = useRef<HTMLElement>(null);

  const allUnitsExpanded =
    device.units.length > 0 &&
    device.units.every((unit) => expandedUnitIds.has(unit.id));

  const handleNavKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const focusables = getNavFocusables(navRef.current);
      const current = document.activeElement as HTMLElement;
      const currentIndex = focusables.indexOf(current);
      const unitToggle = current.closest<HTMLElement>("[data-unit-toggle]");

      if (unitToggle && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        const unitId = unitToggle.getAttribute("data-unit-id");
        const expanded = unitToggle.getAttribute("aria-expanded") === "true";
        if (unitId) {
          if (e.key === "ArrowRight" && !expanded) {
            e.preventDefault();
            onToggleUnit(unitId);
            return;
          }
          if (e.key === "ArrowLeft" && expanded) {
            e.preventDefault();
            onToggleUnit(unitId);
            return;
          }
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < 0) {
            focusables[0]?.focus();
          } else {
            focusables[(currentIndex + 1) % focusables.length]?.focus();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex < 0) {
            focusables[focusables.length - 1]?.focus();
          } else {
            focusables[
              (currentIndex - 1 + focusables.length) % focusables.length
            ]?.focus();
          }
          break;
        case "Home":
          e.preventDefault();
          focusables[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          focusables[focusables.length - 1]?.focus();
          break;
        default:
          break;
      }
    },
    [onToggleUnit]
  );

  if (collapsed) {
    return (
      <aside className={fcNavAsideCollapsed}>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={fcNavCollapseBtn}
          title="ナビを開く"
          aria-label="ナビを開く"
        >
          <PanelLeftOpen className="size-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className={fcNavAside}>
      <div className={fcNavHeader}>
        {/* §E: タイトル「フロー」→「Flowchart Studio」 */}
        <h2 className={cn(fcNavTitle, "truncate")}>Flowchart Studio</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleAllUnits}
            data-testid="toggle-all-units"
            className={fcNavToggleAllBtn}
            title={
              allUnitsExpanded
                ? "すべてのユニットを折りたたみ"
                : "すべてのユニットを展開"
            }
            aria-label={
              allUnitsExpanded
                ? "すべてのユニットを折りたたみ"
                : "すべてのユニットを展開"
            }
          >
            {allUnitsExpanded ? (
              <FoldVertical className="size-4" aria-hidden />
            ) : (
              <UnfoldVertical className="size-4" aria-hidden />
            )}
          </button>
          {/* §E N9: ペイン幅リセット — デスクトップのみ渡される */}
          {onResetPaneWidths ? (
            <button
              type="button"
              onClick={onResetPaneWidths}
              className={fcNavToggleAllBtn}
              title="ペイン幅をリセット"
              aria-label="ペイン幅をリセット"
              data-testid="reset-pane-widths"
            >
              <RefreshCw className="size-4" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={fcNavIconBtn}
            title="ナビを閉じる"
            aria-label="ナビを閉じる"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      <div className={cn(fcBorderB, "px-3 py-2")}>
        <label className="flex flex-col gap-1">
          <span className={fcNavLabel}>装置</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => onSelectDevice(e.target.value)}
            className={fcNavSelect}
            aria-label="装置を選択"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {formatDeviceSelectLabel(d)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav
        ref={navRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
        aria-label="ユニットと動作"
        onKeyDown={handleNavKeyDown}
      >
        {device.units.map((unit) => (
          <UnitSection
            key={unit.id}
            unit={unit}
            expanded={expandedUnitIds.has(unit.id)}
            selectedModuleId={selectedModuleId}
            onToggleUnit={() => onToggleUnit(unit.id)}
            onSelectModule={onSelectModule}
            showDelete={unit.canDelete === true}
            onRequestDelete={
              onRequestDeleteUnit
                ? () => onRequestDeleteUnit(unit.id)
                : undefined
            }
            onRequestDeleteModule={onRequestDeleteModule}
          />
        ))}
      </nav>
      <BuildVersionFootnote />
    </aside>
  );
}
