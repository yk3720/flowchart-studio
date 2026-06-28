from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from normalize_api.config import Settings, get_settings
from normalize_api.main import app

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "testdata" / "fixtures"
INPUT_XLSX = FIXTURES / "input-device-z00001.xlsx"
TEST_API_KEY = "test-api-key"


@pytest.fixture
def client() -> TestClient:
    app.dependency_overrides[get_settings] = lambda: Settings(
        api_key=TEST_API_KEY,
        max_upload_bytes=10 * 1024 * 1024,
        process_timeout_sec=60,
    )
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def input_xlsx() -> Path:
    if not INPUT_XLSX.is_file():
        pytest.skip("fixture 未生成 — scripts/build_fixture.py を実行してください")
    return INPUT_XLSX


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_normalize_requires_api_key(client: TestClient, input_xlsx: Path) -> None:
    with input_xlsx.open("rb") as handle:
        response = client.post(
            "/api/v1/normalize",
            files={
                "file": (
                    "device.xlsx",
                    handle,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )
    assert response.status_code == 401


def test_normalize_success(client: TestClient, input_xlsx: Path) -> None:
    with input_xlsx.open("rb") as handle:
        response = client.post(
            "/api/v1/normalize",
            headers={"X-API-Key": TEST_API_KEY},
            files={
                "file": (
                    "device.xlsx",
                    handle,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["bundle"]["internal_code"] == "Z00001"
    assert len(payload["bundle"]["flows"]) == 4


def test_normalize_rejects_non_xlsx(client: TestClient) -> None:
    response = client.post(
        "/api/v1/normalize",
        headers={"X-API-Key": TEST_API_KEY},
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400


def test_normalize_rejects_oversized(client: TestClient, input_xlsx: Path) -> None:
    app.dependency_overrides[get_settings] = lambda: Settings(
        api_key=TEST_API_KEY,
        max_upload_bytes=32,
        process_timeout_sec=60,
    )
    with TestClient(app) as small_client:
        with input_xlsx.open("rb") as handle:
            response = small_client.post(
                "/api/v1/normalize",
                headers={"X-API-Key": TEST_API_KEY},
                files={
                    "file": (
                        "device.xlsx",
                        handle,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    )
                },
            )
    app.dependency_overrides.clear()
    assert response.status_code == 413
