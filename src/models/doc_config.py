from enum import Enum


class ProcessTypes(Enum):
    MASK = "mask"
    REPLACE = "replace"


class Status(Enum):
    UPLOADED = "uploaded"
    PROCESSED = "processed"
