from pydantic import BaseModel


class RedactRequest(BaseModel):
    input_key: str
