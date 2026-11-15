from pydantic import BaseModel


class Contribution(BaseModel):
    id: int
    title: str
    owner: str
    startTime: str


class SearchResponse(BaseModel):
    items: list[Contribution]
    total: int
