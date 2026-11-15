import json
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Query

from app.models import Contribution, SearchResponse

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
MAX_PAGE = 1_000_000
DATASET_PATH = Path(__file__).resolve().parent.parent / "contributions.json"


def matches(contribution: Contribution, q: str) -> bool:
    """Literal, case-insensitive substring match on title or owner."""
    query = q.casefold()
    return (
        query in contribution.title.casefold() or query in contribution.owner.casefold()
    )


def create_app(contributions: Sequence[Mapping[str, object]]) -> FastAPI:
    items = sorted(
        (Contribution.model_validate(record) for record in contributions),
        key=lambda c: (c.startTime, c.id),
    )
    app = FastAPI(title="Contribution Search API")

    @app.get("/contributions")
    def search(
        q: str | None = None,
        page: Annotated[int, Query(ge=1, le=MAX_PAGE)] = 1,
        pageSize: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = DEFAULT_PAGE_SIZE,
    ) -> SearchResponse:
        if q is None or not q.strip():
            matched = items
        else:
            matched = [c for c in items if matches(c, q)]
        start = (page - 1) * pageSize
        return SearchResponse(
            items=matched[start : start + pageSize],
            total=len(matched),
            page=page,
            pageSize=pageSize,
        )

    return app


app = create_app(json.loads(DATASET_PATH.read_text(encoding="utf-8")))
