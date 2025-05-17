from typing import List
from pydantic import BaseModel


class RedactRequest(BaseModel):
    input_key: str


class KeyPoint(BaseModel):
    title: str
    description: str


class DocumentData(BaseModel):
    key_points: List[str]
    pdf_name: str
