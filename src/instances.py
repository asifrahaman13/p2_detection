import os
from src.cloud.aws import AWS
from dotenv import load_dotenv

from src.logs.logger import Logger

log = Logger(name="PDFRedactor").get_logger()

load_dotenv()


AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    raise ValueError(
        "AWS_ACCESS_KEY and AWS_SECRET_ACCESS are required in the environment variables."
    )
if not S3_BUCKET_NAME:
    raise ValueError("AWS_BUCKET_NAME is required in the environment variables.")
if not AWS_REGION:
    raise ValueError("AWS_REGION is required in the environment variables.")

aws = AWS(
    region_name=AWS_REGION,
    bucket_name=S3_BUCKET_NAME,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)
