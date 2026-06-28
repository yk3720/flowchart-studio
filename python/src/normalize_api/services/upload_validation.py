from __future__ import annotations

from fastapi import HTTPException, UploadFile, status

XLSX_MAGIC = b"PK\x03\x04"
XLSX_EXTENSION = ".xlsx"
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
LEGACY_XLS_MIME = "application/vnd.ms-excel"


def validate_xlsx_upload(file: UploadFile, *, max_bytes: int) -> None:
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(XLSX_EXTENSION):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="拡張子は .xlsx のみ対応しています",
        )

    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if content_type and content_type not in {XLSX_MIME, LEGACY_XLS_MIME}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel（.xlsx）ファイルを選択してください",
        )

    if file.size is not None and file.size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="ファイルサイズが上限を超えています",
        )


def validate_xlsx_bytes(data: bytes, *, max_bytes: int) -> None:
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="空のファイルは処理できません",
        )
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="ファイルサイズが上限を超えています",
        )
    if not data.startswith(XLSX_MAGIC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel（.xlsx）形式ではないファイルです",
        )
