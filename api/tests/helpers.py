from collections.abc import Mapping, Sequence
from typing import Any

from fastapi.testclient import TestClient

from app.main import create_app

Records = Sequence[Mapping[str, object]]


def record(
    id: int,
    title: str,
    owner: str = "Nobody",
    start_time: str = "2024-01-10T10:00:00Z",
) -> dict[str, object]:
    return {"id": id, "title": title, "owner": owner, "startTime": start_time}


def make_client(records: Records) -> TestClient:
    return TestClient(create_app(records))


def ids(body: Any) -> list[int]:
    return [item["id"] for item in body["items"]]
