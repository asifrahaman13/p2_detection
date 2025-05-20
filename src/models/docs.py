from typing import List, Optional

from pydantic import BaseModel
from src.models.doc_config import ProcessTypes


class RedactRequest(BaseModel):
    input_key: str


class KeyPoint(BaseModel):
    entity: str
    description: str
    replaceWith: str


class DocumentData(BaseModel):
    key_points: List[KeyPoint]
    pdf_name: str
    process_type: Optional[str] = ProcessTypes.REPLACE.value
