from __future__ import annotations

import asyncio
from typing import Annotated

from anyio import to_thread
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from excel_normalize.validate import NormalizeError

from ..config import Settings, get_settings
from ..dependencies import require_api_key
from ..schemas.normalize import NormalizeErrorResponse, NormalizeSuccessResponse
from ..services.normalize import normalize_xlsx_bytes
from ..services.upload_validation import validate_xlsx_bytes, validate_xlsx_upload

router = APIRouter(tags=["normalize"])


@router.post(
    "/normalize",
    response_model=NormalizeSuccessResponse,
    responses={
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": NormalizeErrorResponse},
    },
)
async def post_normalize(
    _: Annotated[None, Depends(require_api_key)],
    file: Annotated[UploadFile, File(...)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> NormalizeSuccessResponse:
    validate_xlsx_upload(file, max_bytes=settings.max_upload_bytes)

    data = await file.read()
    await file.close()
    validate_xlsx_bytes(data, max_bytes=settings.max_upload_bytes)

    try:
        result = await asyncio.wait_for(
            to_thread.run_sync(normalize_xlsx_bytes, data),
            timeout=settings.process_timeout_sec,
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="正規化処理がタイムアウトしました",
        ) from exc
    except NormalizeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": exc.messages},
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": [str(exc)]},
        ) from exc

    return NormalizeSuccessResponse(bundle=result.bundle, warnings=result.warnings)
