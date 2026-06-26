from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class NormalizeError(Exception):
    messages: list[str]

    def __str__(self) -> str:
        return "\n".join(self.messages)


@dataclass
class NormalizeResult:
    bundle: dict
    warnings: list[str] = field(default_factory=list)


def validate_bundle(
    kosei,
    flows: list[dict],
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    expected = {(r.unit_label, r.module_label) for r in kosei.rows}
    found = {(f["unit_label"], f["module_label"]) for f in flows}

    for unit_label, module_label in sorted(expected - found):
        warnings.append(
            f"構成に「{unit_label} · {module_label}」がありますが、"
            f"フロー表が未登録です（段階手書きでは警告）。"
        )

    for unit_label, module_label in sorted(found - expected):
        errors.append(
            f"ユニットシート「{unit_label}」· テーブル「{module_label}」が構成シートにありません。"
            f"構成シートに行を追加するか、テーブルを削除してください。"
        )

    for flow in flows:
        table = flow["payload"]["table"]
        if not table:
            warnings.append(
                f"動作「{flow['unit_label']} · {flow['module_label']}」: フロー行が空です"
            )

    return errors, warnings


def validate_unit_bands(kosei) -> tuple[list[str], list[str]]:
    """V-B1〜B4: MID帯の整合性検証（§10.4）。

    unit_bands が空（旧フォーマット等）の場合はスキップ。
    """
    errors: list[str] = []
    warnings: list[str] = []

    if not kosei.unit_bands:
        return errors, warnings

    active_bands = [
        b
        for b in kosei.unit_bands.values()
        if b.mid_count > 0 and b.mid_start is not None and b.mid_end is not None
    ]

    # V-B2: ユニット間で帯が重複しない
    for i, b1 in enumerate(active_bands):
        for b2 in active_bands[i + 1 :]:
            if b1.mid_start <= b2.mid_end and b2.mid_start <= b1.mid_end:
                errors.append(
                    f"V-B2: ユニット{b1.uid}（{b1.label}）とユニット{b2.uid}（{b2.label}）の"
                    f"MID帯が重複しています"
                    f"（[{b1.mid_start},{b1.mid_end}] ∩ [{b2.mid_start},{b2.mid_end}]）"
                )

    # V-B3: MID数=0 のユニットに構成行が無い
    placeholder_uids = {b.uid for b in kosei.unit_bands.values() if b.mid_count == 0}
    for row in kosei.rows:
        if row.uin_id in placeholder_uids:
            band = kosei.unit_bands[row.uin_id]
            errors.append(
                f"V-B3: MID数=0のユニット{row.uin_id}（{band.label}）に構成行があります"
                f"（モジュール: {row.module_label}）"
            )

    # V-B4: 構成の MID がファイル内で一意
    seen: dict[int, str] = {}
    for row in kosei.rows:
        if row.module_id is None:
            continue
        if row.module_id in seen:
            errors.append(
                f"V-B4: MID {row.module_id} が重複しています"
                f"（{seen[row.module_id]} と {row.module_label}）"
            )
        else:
            seen[row.module_id] = row.module_label

    # V-B1: 構成の MID が当該 UinID の [MID開始, MID終了] 内
    band_by_uid = {b.uid: b for b in active_bands}
    for row in kosei.rows:
        if row.uin_id is None or row.module_id is None:
            continue
        band = band_by_uid.get(row.uin_id)
        if band is None:
            continue
        if not (band.mid_start <= row.module_id <= band.mid_end):
            errors.append(
                f"V-B1: MID {row.module_id}（{row.module_label}）が"
                f"ユニット{row.uin_id}（{band.label}）の帯"
                f"[{band.mid_start},{band.mid_end}]外です"
            )

    return errors, warnings
