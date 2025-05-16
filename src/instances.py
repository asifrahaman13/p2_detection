import os
from src.cloud.aws import AWS
from dotenv import load_dotenv

load_dotenv()


AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")


print("AWS_ACCESS_KEY_ID:", AWS_ACCESS_KEY_ID)
print("AWS_SECRET_ACCESS_KEY:", AWS_SECRET_ACCESS_KEY)
print("AWS_REGION:", AWS_REGION)
print("S3_BUCKET_NAME:", S3_BUCKET_NAME)

aws = AWS(
    region_name=AWS_REGION,
    bucket_name=S3_BUCKET_NAME,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)
