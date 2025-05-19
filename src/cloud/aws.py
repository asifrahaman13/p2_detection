import io

import boto3
from fastapi import UploadFile
from io import BytesIO

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

    def download_file_to_memory(self, key: str):
        buffer = BytesIO()
        self.s3_client.download_fileobj(self.bucket_name, key, buffer)
        buffer.seek(0)
        return buffer

    def upload_file_from_memory(self, buffer, key: str):
        buffer.seek(0)
        self.s3_client.upload_fileobj(
            Fileobj=buffer,
            Bucket=self.bucket_name,
            Key=key,
            ExtraArgs={"ContentType": "application/pdf"},
        )

    def get_pdf_buffer_s3(self, file_key):
        s3 = boto3.client("s3")
        pdf_file = io.BytesIO()
        s3.download_fileobj(self.bucket_name, file_key, pdf_file)
        pdf_file.seek(0)
        return pdf_file

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

    def generate_presigned_url(self, file_name: str) -> str | None:
        presigned_url = self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": file_name},
            ExpiresIn=3600,
        )
        return presigned_url

    def download_file_obj(self, file_name, input_key, input_stream):
        self.s3_client.download_fileobj(self.bucket_name, input_key, input_stream)
