from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class NormalizeSuccessResponse(BaseModel):
    bundle: dict[str, Any]
    warnings: list[str] = Field(default_factory=list)


class NormalizeErrorResponse(BaseModel):
    errors: list[str]
