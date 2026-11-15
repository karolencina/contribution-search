from collections.abc import Mapping, Sequence

from fastapi import FastAPI

from app.models import Contribution, SearchResponse


def matches(contribution: Contribution, q: str) -> bool:
    """Literal, case-insensitive substring match on title or owner."""
    query = q.casefold()
    return (
        query in contribution.title.casefold() or query in contribution.owner.casefold()
    )


def create_app(contributions: Sequence[Mapping[str, object]]) -> FastAPI:
    items = [Contribution.model_validate(record) for record in contributions]
    app = FastAPI(title="Contribution Search API")

    @app.get("/contributions")
    def search(q: str | None = None) -> SearchResponse:
        if q is None or not q.strip():
            matched = items
        else:
            matched = [c for c in items if matches(c, q)]
        return SearchResponse(items=matched, total=len(matched))

    return app


app = create_app([])
