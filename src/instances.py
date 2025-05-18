import os
from src.cloud.aws import AWS
from dotenv import load_dotenv
from src.database.mongo_db import MongoDBHandler
from src.helper.conn_manager import ConnectionManager
from src.models.db import Collections, Databases

from src.database.ps_db import AsyncPostgresCRUD
from src.logs.logger import Logger

log = Logger(name="PDFRedactor").get_logger()

load_dotenv()


AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
POSTGRES_CONNECTION = os.getenv("POSTGRES_CONNECTION_STRING")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not POSTGRES_CONNECTION:
    raise ValueError("POSTGRES_CONNECTION is required in the environment variables.")

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    raise ValueError(
        "AWS_ACCESS_KEY and AWS_SECRET_ACCESS are required in the environment variables."
    )

if not S3_BUCKET_NAME:
    raise ValueError("AWS_BUCKET_NAME is required in the environment variables.")
    
if not AWS_REGION:
    raise ValueError("AWS_REGION is required in the environment variables.")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is required in the environment variables.")


aws = AWS(
    region_name=AWS_REGION,
    bucket_name=S3_BUCKET_NAME,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

db = AsyncPostgresCRUD(dsn=POSTGRES_CONNECTION)

mongo_db = MongoDBHandler(
    uri=MONGO_URI,
    db_name=Databases.DOCS.value,
    collection_name=Collections.DOCS.value,
)


manager = ConnectionManager()
