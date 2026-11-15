"""Response format rules (docs/API-CONTRACT.md, "Item")."""

from tests.helpers import make_client, record


def test_start_time_is_sent_in_utc_with_z() -> None:
    client = make_client(
        [
            record(1, "Offset input", start_time="2024-01-10T11:30:00+01:00"),
            record(2, "Already UTC", start_time="2024-01-10T10:45:00Z"),
        ]
    )

    response = client.get("/contributions")

    assert response.status_code == 200
    start_times = {item["id"]: item["startTime"] for item in response.json()["items"]}
    assert start_times == {
        1: "2024-01-10T10:30:00Z",
        2: "2024-01-10T10:45:00Z",
    }
