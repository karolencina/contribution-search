"""The real app serves the sample dataset (api/contributions.json, 40 records).

Expected values are written out by hand from the file: sorted by (startTime, id),
the first ten are ids 33, 31, 32, 8, 9, 1, 2, 3, 4 and 5.
"""

from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import ids


def test_real_app_serves_the_sample_dataset() -> None:
    client = TestClient(app)

    response = client.get("/contributions")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 40
    assert ids(body) == [33, 31, 32, 8, 9, 1, 2, 3, 4, 5]
