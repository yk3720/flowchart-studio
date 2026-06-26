"use client";

import { formatBuildLabel, formatBuildTitle } from "@/lib/app/buildInfo";
import { readClientBuildInfo } from "@/lib/app/buildInfoClient";

import { fcNavBuildFootnote } from "./flowchartUiClasses";

/** 左ナビ下部 — デプロイ済みビルドの識別（本番/preview と commit の照合用） */
export function BuildVersionFootnote() {
  const info = readClientBuildInfo();
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
