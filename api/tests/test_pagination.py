"""Pagination rules (docs/TEST-PLAN.md: page boundaries, query parameters, totals).

Each test builds its own fixture. Expected values are written out by hand.
`numbered(n)` makes ids 1..n whose start times rise with the id, so the sorted
order is 1..n and page contents can be written as plain lists.
"""

import pytest

from tests.helpers import Records, ids, make_client, record


def numbered(count: int, title: str = "Item") -> Records:
    return [
        record(
            n, f"{title} {n}", start_time=f"2024-01-01T00:{n // 60:02d}:{n % 60:02d}Z"
        )
        for n in range(1, count + 1)
    ]


# --- Page boundaries ---------------------------------------------------------


def test_first_page_uses_the_defaults() -> None:
    client = make_client(numbered(12))

    response = client.get("/contributions")

    body = response.json()
    assert response.status_code == 200
    assert ids(body) == [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    assert body["total"] == 12
    assert body["page"] == 1
    assert body["pageSize"] == 10


def test_last_partial_page() -> None:
    client = make_client(numbered(12))

    response = client.get("/contributions", params={"page": 2})

    body = response.json()
    assert response.status_code == 200
    assert ids(body) == [11, 12]
    assert body["total"] == 12
    assert body["page"] == 2
    assert body["pageSize"] == 10


def test_page_size_echoes_the_request() -> None:
    client = make_client(numbered(12))

    response = client.get("/contributions", params={"page": 3, "pageSize": 5})

    body = response.json()
    assert response.status_code == 200
    assert ids(body) == [11, 12]
    assert body["total"] == 12
    assert body["page"] == 3
    assert body["pageSize"] == 5


def test_exact_multiple_page_is_empty() -> None:
    client = make_client(numbered(10))

    response = client.get("/contributions", params={"page": 2})

    body = response.json()
    assert response.status_code == 200
    assert body["items"] == []
    assert body["total"] == 10


def test_total_is_unchanged_past_the_end() -> None:
    client = make_client(numbered(3))

    response = client.get("/contributions", params={"page": 999})

    body = response.json()
    assert response.status_code == 200
    assert body["items"] == []
    assert body["total"] == 3


# --- Total and search with paging -------------------------------------------


def test_total_is_counted_before_slicing() -> None:
    matching = numbered(12, title="Report")
    other = [record(100 + n, f"Other {n}") for n in range(3)]
    client = make_client([*matching, *other])

    response = client.get("/contributions", params={"q": "report", "pageSize": 5})

    body = response.json()
    assert response.status_code == 200
    assert body["total"] == 12
    assert len(body["items"]) == 5
    assert ids(body) == [1, 2, 3, 4, 5]


def test_search_is_applied_before_paging() -> None:
    client = make_client(
        [
            record(1, "Match", start_time="2024-01-01T00:00:01Z"),
            record(2, "Skip", start_time="2024-01-01T00:00:02Z"),
            record(3, "Match", start_time="2024-01-01T00:00:03Z"),
            record(4, "Skip", start_time="2024-01-01T00:00:04Z"),
            record(5, "Match", start_time="2024-01-01T00:00:05Z"),
            record(6, "Match", start_time="2024-01-01T00:00:06Z"),
        ]
    )

    response = client.get(
        "/contributions", params={"q": "match", "page": 2, "pageSize": 2}
    )

    body = response.json()
    assert response.status_code == 200
    assert ids(body) == [5, 6]
    assert body["total"] == 4


def test_tied_start_times_page_without_repeats() -> None:
    same = "2024-01-10T10:30:00Z"
    client = make_client(
        [
            record(10, "Ten", start_time=same),
            record(1, "One", start_time=same),
            record(2, "Two", start_time=same),
        ]
    )

    pages = [
        ids(client.get("/contributions", params={"page": page, "pageSize": 1}).json())
        for page in (1, 2, 3)
    ]

    assert pages == [[1], [2], [10]]


# --- Query parameters --------------------------------------------------------


def test_unknown_parameter_is_ignored() -> None:
    client = make_client(numbered(12))

    response = client.get("/contributions?pagesize=50")

    body = response.json()
    assert response.status_code == 200
    assert len(body["items"]) == 10
    assert body["pageSize"] == 10


def test_repeated_parameter_uses_the_last_value() -> None:
    client = make_client(numbered(3))

    response = client.get("/contributions?page=1&page=2&pageSize=1")

    body = response.json()
    assert response.status_code == 200
    assert body["page"] == 2
    assert ids(body) == [2]


def test_maximum_page_is_allowed() -> None:
    client = make_client(numbered(3))

    response = client.get("/contributions?page=1000000")

    body = response.json()
    assert response.status_code == 200
    assert body["items"] == []
    assert body["total"] == 3


def test_maximum_page_size_is_allowed() -> None:
    client = make_client(numbered(101))

    response = client.get("/contributions?pageSize=100")

    body = response.json()
    assert response.status_code == 200
    assert len(body["items"]) == 100
    assert body["total"] == 101


@pytest.mark.parametrize(
    "query",
    [
        "page=",
        "page=abc",
        "page=0",
        "page=-1",
        "page=1.5",
        "page=1000001",
        "page=99999999999999999999",
        "pageSize=",
        "pageSize=abc",
        "pageSize=0",
        "pageSize=-1",
        "pageSize=101",
    ],
)
def test_invalid_page_or_page_size_is_422(query: str) -> None:
    client = make_client(numbered(3))

    response = client.get(f"/contributions?{query}")

    assert response.status_code == 422


def test_422_body_names_the_bad_parameter() -> None:
    client = make_client(numbered(3))

    response = client.get("/contributions?pageSize=200")

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "pageSize"]
