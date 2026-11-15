"""CORS: the browser on the frontend's origin may call the API, no other origin may.

The frontend runs on http://localhost:3000 (DECISIONS.md, Compatibility).
"""

from tests.helpers import make_client, record

ALLOWED = "http://localhost:3000"
OTHER = "http://evil.example"


def test_allowed_origin_gets_the_cors_header() -> None:
    client = make_client([record(1, "Alpha")])

    response = client.get("/contributions", headers={"Origin": ALLOWED})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED


def test_other_origin_gets_no_cors_header() -> None:
    client = make_client([record(1, "Alpha")])

    response = client.get("/contributions", headers={"Origin": OTHER})

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_preflight_from_the_allowed_origin_is_accepted() -> None:
    client = make_client([record(1, "Alpha")])

    response = client.options(
        "/contributions",
        headers={"Origin": ALLOWED, "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED
    assert "GET" in response.headers["access-control-allow-methods"]


def test_preflight_from_another_origin_is_rejected() -> None:
    client = make_client([record(1, "Alpha")])

    response = client.options(
        "/contributions",
        headers={"Origin": OTHER, "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
