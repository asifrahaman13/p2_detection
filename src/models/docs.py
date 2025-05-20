from typing import List, Optional
from pydantic import BaseModel, Field, StrictStr
from src.models.doc_config import ProcessTypes


class RedactRequest(BaseModel):
    input_key: StrictStr = Field(..., example="sample_doc_123")

    class Config:
        orm_mode = True
        extra = "forbid"
        json_schema_extra = {
            "example": {
                "input_key": "sample_doc_123"
            }
        }


class KeyPoint(BaseModel):
    entity: StrictStr = Field(..., example="John Doe")
    description: StrictStr = Field(..., example="Name of the patient")
    replaceWith: StrictStr = Field(..., example="REDACTED_NAME")

    class Config:
        orm_mode = True
        extra = "forbid"
        json_schema_extra = {
            "example": {
                "entity": "John Doe",
                "description": "Name of the patient",
                "replaceWith": "REDACTED_NAME"
            }
        }


class DocumentData(BaseModel):
    key_points: List[KeyPoint] = Field(
        ...,
        example=[
            {
                "entity": "John Doe",
                "description": "Name of the patient",
                "replaceWith": "REDACTED_NAME"
            }
        ]
    )
    pdf_name: StrictStr = Field(..., example="medical_record.pdf")
    process_type: Optional[StrictStr] = Field(
        default=ProcessTypes.REPLACE.value,
        example="replace"
    )

    class Config:
        orm_mode = True
        extra = "forbid"
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "key_points": [
                    {
                        "entity": "John Doe",
                        "description": "Name of the patient",
                        "replaceWith": "REDACTED_NAME"
                    }
                ],
                "pdf_name": "medical_record",
                "process_type": "replace"
            }
        }
