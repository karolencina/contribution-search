from collections.abc import Mapping, Sequence

from fastapi import FastAPI


def create_app(contributions: Sequence[Mapping[str, object]]) -> FastAPI:
    return FastAPI(title="Contribution Search API")


app = create_app([])
