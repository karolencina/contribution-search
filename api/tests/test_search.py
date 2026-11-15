"""Search matching rules (docs/TEST-PLAN.md, "Search matching rules").

Each test builds its own small fixture. Expected values are written out by hand.
All records share one startTime, so results come back in id order.
"""

import pytest

from tests.helpers import ids, make_client, record


@pytest.mark.parametrize("q", ["report", "REPORT", "Report", "rEpOrT"])
def test_search_ignores_case(q: str) -> None:
    client = make_client(
        [
            record(1, "Report"),
            record(2, "REPORT"),
            record(3, "report"),
            record(4, "Something else"),
        ]
    )

    response = client.get("/contributions", params={"q": q})

    assert response.status_code == 200
    assert ids(response.json()) == [1, 2, 3]
    assert response.json()["total"] == 3


def test_search_ignores_case_on_owner() -> None:
    client = make_client([record(1, "Reporting API", owner="Sarah Jones")])

    response = client.get("/contributions", params={"q": "SARAH"})

    assert response.status_code == 200
    assert ids(response.json()) == [1]
    assert response.json()["total"] == 1


@pytest.mark.parametrize("q", ["report", "port", "API", "ing A"])
def test_search_is_a_substring_not_a_whole_word(q: str) -> None:
    client = make_client([record(1, "Reporting API"), record(2, "Unrelated")])

    response = client.get("/contributions", params={"q": q})

    assert response.status_code == 200
    assert ids(response.json()) == [1]


def test_search_matches_title_only_owner_only_and_both() -> None:
    client = make_client(
        [
            record(1, "Alpha plan", owner="Zed"),
            record(2, "Zeta", owner="Alpha Team"),
            record(3, "Alpha", owner="Alpha Lee"),
            record(4, "Gamma", owner="Delta"),
        ]
    )

    response = client.get("/contributions", params={"q": "alpha"})

    assert response.status_code == 200
    assert ids(response.json()) == [1, 2, 3]
    assert response.json()["total"] == 3


def test_search_does_not_match_across_title_and_owner() -> None:
    client = make_client([record(1, "Alpha", owner="Beta")])

    response = client.get("/contributions", params={"q": "pha b"})

    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["total"] == 0


def test_row_matching_both_fields_counts_once() -> None:
    client = make_client([record(1, "Sarah's review", owner="Sarah Lee")])

    response = client.get("/contributions", params={"q": "sarah"})

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1
    assert response.json()["total"] == 1


def test_no_matches_is_200_with_empty_items() -> None:
    client = make_client([record(1, "Alpha"), record(2, "Beta")])

    response = client.get("/contributions", params={"q": "zzz"})

    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["total"] == 0


@pytest.mark.parametrize(
    ("q", "title"),
    [("ÉCOLE", "école partnership"), ("STRASSE", "Straße")],
)
def test_search_matches_non_ascii_case(q: str, title: str) -> None:
    client = make_client([record(1, title), record(2, "plain")])

    response = client.get("/contributions", params={"q": q})

    assert response.status_code == 200
    assert ids(response.json()) == [1]
    assert response.json()["total"] == 1


def test_accents_are_not_folded() -> None:
    client = make_client([record(1, "école partnership")])

    response = client.get("/contributions", params={"q": "ecole"})

    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_decomposed_accent_does_not_match_precomposed() -> None:
    client = make_client([record(1, "cafe\u0301")])

    response = client.get("/contributions", params={"q": "caf\u00e9"})

    assert response.status_code == 200
    assert response.json()["total"] == 0


@pytest.mark.parametrize(
    ("q", "title"),
    [
        (".", "a.b"),
        ("*", "a*b"),
        ("[", "[EU] data"),
        ("]", "[EU] data"),
        ("+", "C++ build"),
        ("?", "Why is churn up?"),
        ("(", "f(x)"),
        ("\\", "a\\b"),
        ("^", "2^3"),
        ("$", "cost $5"),
        ("|", "a|b"),
        ("{", "{id}"),
    ],
)
def test_search_treats_regex_characters_as_text(q: str, title: str) -> None:
    client = make_client([record(1, title), record(2, "plain")])

    response = client.get("/contributions", params={"q": q})

    assert response.status_code == 200
    assert ids(response.json()) == [1]
    assert response.json()["total"] == 1


@pytest.mark.parametrize(
    ("raw_q", "title"),
    [
        ("%25", "Cut cloud costs by 20%"),
        ("%26", "Q&A tooling"),
        ("%23", "Issue #42"),
        ("%2B", "C++ build"),
    ],
)
def test_encoded_special_characters_reach_the_search(raw_q: str, title: str) -> None:
    client = make_client([record(1, title), record(2, "Cut costs")])

    response = client.get(f"/contributions?q={raw_q}")

    assert response.status_code == 200
    assert ids(response.json()) == [1]
    assert response.json()["total"] == 1


def test_empty_query_means_no_filter() -> None:
    client = make_client([record(1, "Alpha"), record(2, "Beta")])

    response = client.get("/contributions?q=")

    assert response.status_code == 200
    assert ids(response.json()) == [1, 2]
    assert response.json()["total"] == 2


@pytest.mark.parametrize("raw_q", ["%20%20", "+", "%09"])
def test_whitespace_only_query_means_no_filter(raw_q: str) -> None:
    client = make_client([record(1, "Alpha"), record(2, "Beta")])

    response = client.get(f"/contributions?q={raw_q}")

    assert response.status_code == 200
    assert ids(response.json()) == [1, 2]
    assert response.json()["total"] == 2


def test_query_is_not_trimmed() -> None:
    client = make_client(
        [
            record(1, "Reporting API"),
            record(2, "Rapid tooling"),
            record(3, "Other", owner="Jo Api"),
        ]
    )

    response = client.get("/contributions?q=%20api")

    assert response.status_code == 200
    assert ids(response.json()) == [1, 3]
    assert response.json()["total"] == 2


def test_trailing_space_in_query_is_not_trimmed() -> None:
    client = make_client([record(1, "Reporting API"), record(2, "Api tooling")])

    response = client.get("/contributions?q=api%20")

    assert response.status_code == 200
    assert ids(response.json()) == [2]
    assert response.json()["total"] == 1
