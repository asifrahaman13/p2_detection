from typing import Optional
import boto3
from io import BytesIO

from fastapi import UploadFile

from src.logs.logger import Logger

log = Logger(name="aws.py").get_logger()


class AWS:
    def __init__(
        self,
        region_name: str,
        bucket_name: str,
        aws_access_key_id: str,
        aws_secret_access_key: str,
    ) -> None:
        self.region_name = region_name
        self.bucket_name = bucket_name
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key
        self.s3_client = boto3.client(
            "s3",
            region_name=self.region_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
        )

    def download_file_to_memory(self, key: str) -> BytesIO:
        buffer = BytesIO()
        self.s3_client.download_fileobj(self.bucket_name, key, buffer)
        buffer.seek(0)
        return buffer

    def upload_file_from_memory(self, buffer, key: str) -> None:
        buffer.seek(0)
        self.s3_client.upload_fileobj(
            Fileobj=buffer,
            Bucket=self.bucket_name,
            Key=key,
            ExtraArgs={"ContentType": "application/pdf"},
        )

    def upload_pdf(self, file_name: str, file: UploadFile):
        if file.file is None:
            raise ValueError("Uploaded file is None")

        file.file.seek(0)
        s3_key = f"uploads/{file_name}"
        self.s3_client.upload_fileobj(
            file.file,
            self.bucket_name,
            s3_key,
            ExtraArgs={"ContentType": file.content_type or "application/pdf"},
        )
        return True

    def generate_presigned_url(self, file_name: str) -> Optional[str]:
        presigned_url = self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": file_name},
            ExpiresIn=3600,
        )
        return presigned_url

    def delete_file(self, key: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception as e:
            log.error(f"Error deleting file from S3: {e}")
            return False
