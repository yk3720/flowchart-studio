# flowchart-studio — 装置 xlsx 正規化 API（ADR-019 · Railway）
# ビルド context: python/（Railway Root Directory = python）

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

COPY pyproject.toml ./
COPY src ./src

RUN pip install --upgrade pip \
    && pip install -e ".[api]"

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Railway が PORT を注入
CMD ["sh", "-c", "uvicorn normalize_api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
