from typing import List, Optional
from pydantic import BaseModel, Field

from src.models.doc_config import ProcessTypes


class RedactRequest(BaseModel):
    input_key: str = Field(..., example="sample_doc_123")

    class Config:
        from_attributes = True
        json_schema_extra = {"example": {"input_key": "sample_doc_123"}}


class KeyPoint(BaseModel):
    entity: str = Field(..., example="John Doe")
    description: str = Field(..., example="Name of the patient")
    replaceWith: str = Field(..., example="REDACTED_NAME")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "entity": "John Doe",
                "description": "Name of the patient",
                "replaceWith": "REDACTED_NAME",
            }
        }


class DocumentData(BaseModel):
    key_points: List[KeyPoint] = Field(
        ...,
        example=[
            {
                "entity": "John Doe",
                "description": "Name of the patient",
                "replaceWith": "REDACTED_NAME",
            }
        ],
    )
    pdf_name: str = Field(..., example="medical_record.pdf")
    process_type: Optional[str] = Field(
        default=ProcessTypes.REPLACE.value, example="replace"
    )

    class Config:
        from_attributes = True
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "key_points": [
                    {
                        "entity": "John Doe",
                        "description": "Name of the patient",
                        "replaceWith": "REDACTED_NAME",
                    }
                ],
                "pdf_name": "medical_record",
                "process_type": "replace",
            }
        }
