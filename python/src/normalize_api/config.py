from __future__ import annotations

from functools import lru_cache

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# lib/flowchart/import/importBundleLimits.ts EQUIPMENT_XLSX_MAX_BYTES と同期
DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024
DEFAULT_PROCESS_TIMEOUT_SEC = 60


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )

    app_name: str = "flowchart-normalize-api"
    api_key: str = Field(
        default="",
        validation_alias=AliasChoices("FASTAPI_API_KEY", "API_KEY"),
    )
    max_upload_bytes: int = DEFAULT_MAX_UPLOAD_BYTES
    process_timeout_sec: int = DEFAULT_PROCESS_TIMEOUT_SEC
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:3001"]
    )
    enable_docs: bool = Field(default=False, validation_alias="ENABLE_DOCS")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            if not value.strip():
                return []
            return [part.strip() for part in value.split(",") if part.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
