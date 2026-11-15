from datetime import UTC, datetime

from pydantic import AwareDatetime, BaseModel, field_validator


class Contribution(BaseModel):
    id: int
    title: str
    owner: str
    startTime: AwareDatetime

    @field_validator("startTime")
    @classmethod
    def to_utc(cls, value: datetime) -> datetime:
        """Store every time in UTC, so it sorts and is sent the same way."""
        return value.astimezone(UTC)


class SearchResponse(BaseModel):
    items: list[Contribution]
    total: int
