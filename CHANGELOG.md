# Changelog — flowchart-studio

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Version SSOT:** `package.json` `version`  
**Path:** `c:/yk-application/flowchart-studio/`（独立 Git リポジトリ · `YK_APPLICATION_RULES`）

## [Unreleased]

### Changed

- **`yk-tool` から `yk-application/flowchart-studio` へ移行** — 独立リポジトリ化 · パッケージ名 `flowchart-studio`
- husky / CI を単体レポ用に整備（`.github/workflows/ci.yml`）

### Changed (historical)

- ディレクトリ・npm パッケージ名を `flowchart-web` → **`flowchart-web-reactflow`**（ADR-010 · 挙動変更なし）

### Added

- `CHANGELOG.md` 雛形（yk-tool モノレポ台帳運用 · 2026-05-23）

## [0.1.0] - 2026-05-23

### Added

- `yk-tool` モノレポへ移行（元: `yk-skill/flowchart-web/`）
