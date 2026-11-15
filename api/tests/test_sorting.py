"""Sorting rules (docs/TEST-PLAN.md, tie-breaker and "Non-ASCII search and UTC output").

Results are sorted by startTime ascending, then id ascending. In every test the
input order is NOT the expected order, so a missing sort cannot pass by accident.
"""

from tests.helpers import ids, make_client, record


def test_sorted_by_start_time_ascending() -> None:
    client = make_client(
        [
            record(1, "March", start_time="2024-03-01T09:00:00Z"),
            record(2, "January", start_time="2024-01-01T09:00:00Z"),
            record(3, "February", start_time="2024-02-01T09:00:00Z"),
        ]
    )

    response = client.get("/contributions")

    assert response.status_code == 200
    assert ids(response.json()) == [2, 3, 1]


def test_equal_start_times_are_ordered_by_id() -> None:
    same = "2024-01-10T10:30:00Z"
    client = make_client(
        [
            record(3, "Three", start_time=same),
            record(1, "One", start_time=same),
            record(2, "Two", start_time=same),
        ]
    )

    response = client.get("/contributions")

    assert response.status_code == 200
    assert ids(response.json()) == [1, 2, 3]


def test_id_tiebreak_is_numeric() -> None:
    same = "2024-01-10T10:30:00Z"
    client = make_client(
        [
            record(10, "Ten", start_time=same),
            record(2, "Two", start_time=same),
        ]
    )

    response = client.get("/contributions")

    assert response.status_code == 200
    # As text, "10" sorts before "2". Numerically, 2 comes first.
    assert ids(response.json()) == [2, 10]


def test_start_time_sorts_by_real_time_not_by_text() -> None:
    client = make_client(
        [
            record(2, "Later in UTC", start_time="2024-01-10T10:45:00Z"),
            record(1, "Earlier in UTC", start_time="2024-01-10T11:30:00+01:00"),
        ]
    )

    response = client.get("/contributions")

    assert response.status_code == 200
    # 11:30+01:00 is 10:30 UTC, before 10:45 UTC. As text, id 2 would come first.
    assert ids(response.json()) == [1, 2]


def test_sort_applies_to_search_results() -> None:
    client = make_client(
        [
            record(1, "Alpha later", start_time="2024-05-01T09:00:00Z"),
            record(2, "Beta", start_time="2024-01-01T09:00:00Z"),
            record(3, "Alpha earlier", start_time="2024-02-01T09:00:00Z"),
        ]
    )

    response = client.get("/contributions", params={"q": "alpha"})

    assert response.status_code == 200
    assert ids(response.json()) == [3, 1]
