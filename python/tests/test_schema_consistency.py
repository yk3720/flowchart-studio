"""TS↔Python スキーマ整合性ピンテスト（ADR-016）。

FLOW_HEADERS / FLOW_SCHEMA が TypeScript 側の TABLE_HEADERS_10_V2 / TIER10_SCHEMA と
一致していることを担保する。列順を変えるときはこのテストを先に更新すること。
"""

from __future__ import annotations

from excel_normalize.constants import FLOW_HEADERS, FLOW_SCHEMA

# TypeScript: lib/flowchart/table/tableColumns.ts の TABLE_HEADERS_10_V2 と同値
EXPECTED_V2_HEADERS = (
    "ID",
    "図形種別",
    "色",
    "接続先(下)",
    "接続先(右)",
    "段",
    "列",
    "Text1",
    "Text2",
    "Text3",
)

# TypeScript: TIER10_SCHEMA = "table-10col-v2"
EXPECTED_SCHEMA = "table-10col-v2"


def test_flow_schema_is_v2() -> None:
    assert FLOW_SCHEMA == EXPECTED_SCHEMA


def test_flow_headers_match_v2_column_order() -> None:
    """列順が v2 仕様（色=index2, 接続先=3/4, 段/列=5/6, Text=7-9）であることを確認。"""
    assert FLOW_HEADERS == EXPECTED_V2_HEADERS


def test_color_column_index() -> None:
    assert FLOW_HEADERS.index("色") == 2


def test_dest_down_column_index() -> None:
    assert FLOW_HEADERS.index("接続先(下)") == 3


def test_tier_level_column_indices() -> None:
    assert FLOW_HEADERS.index("段") == 5
    assert FLOW_HEADERS.index("列") == 6


def test_text_column_indices() -> None:
    assert FLOW_HEADERS.index("Text1") == 7
    assert FLOW_HEADERS.index("Text2") == 8
    assert FLOW_HEADERS.index("Text3") == 9
