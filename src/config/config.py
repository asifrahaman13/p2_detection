import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class AWSConfig:
    access_key_id: str = os.getenv("AWS_ACCESS_KEY")
    secret_access_key: str = os.getenv("AWS_SECRET_ACCESS")
    region: str = os.getenv("AWS_REGION", "us-east-1")
    bucket_name: str = os.getenv("AWS_BUCKET_NAME")

    def __post_init__(self):
        if not self.access_key_id or not self.secret_access_key:
            raise ValueError("AWS credentials are missing.")
        if not self.bucket_name:
            raise ValueError("S3 bucket name is missing.")


@dataclass(frozen=True)
class DBConfig:
    mongo_uri: str = os.getenv("MONGO_URI")

    def __post_init__(self):
        if not self.mongo_uri:
            raise ValueError("Mongodb connection string is missing.")


@dataclass(frozen=True)
class APIKeys:
    openai_key: str = os.getenv("OPENAI_API_KEY")

    def __post_init__(self):
        if not self.openai_key:
            raise ValueError("OpenAI API key is missing.")
