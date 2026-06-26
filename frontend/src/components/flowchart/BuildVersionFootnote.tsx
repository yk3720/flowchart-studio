"use client";

import {
  formatBuildLabel,
  formatBuildTitle,
  resolveBuildInfo,
} from "@/lib/app/buildInfo";

import { fcNavBuildFootnote } from "./flowchartUiClasses";

/** 左ナビ下部 — デプロイ済みビルドの識別（本番/preview と commit の照合用） */
export function BuildVersionFootnote() {
  const info = resolveBuildInfo();
  return (
    <p
      className={fcNavBuildFootnote}
      data-testid="build-version"
      title={formatBuildTitle(info)}
    >
      {formatBuildLabel(info)}
    </p>
  );
}
