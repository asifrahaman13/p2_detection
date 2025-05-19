from typing import List
from pydantic import BaseModel


class RedactRequest(BaseModel):
    input_key: str


class KeyPoint(BaseModel):
    entity: str
    description: str
    replaceWith: str


class DocumentData(BaseModel):
    key_points: List[KeyPoint]
    pdf_name: str
