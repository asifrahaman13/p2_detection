import io
import boto3
from fastapi import UploadFile

from src.logs.logger import Logger

log = Logger(name="AWS").get_logger()


class AWS:
    def __init__(self, *args, **kwargs) -> None:
        self.region_name = kwargs.get("region_name")
        self.bucket_name = kwargs.get("bucket_name")
        self.aws_access_key_id = kwargs.get("aws_access_key_id")
        self.aws_secret_access_key = kwargs.get("aws_secret_access_key")
        self.s3_client = boto3.client(
            "s3",
            region_name=self.region_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
        )

    def download_file_to_memory(self, key: str):
        from io import BytesIO

        try:
            buffer = BytesIO()
            self.s3_client.download_fileobj(self.bucket_name, key, buffer)
            buffer.seek(0)
            return buffer
        except Exception as e:
            log.error(f"Error downloading file from S3: {e}")
            raise e

    def upload_file_from_memory(self, buffer, key: str):
        buffer.seek(0)
        self.s3_client.upload_fileobj(
            Fileobj=buffer,
            Bucket=self.bucket_name,
            Key=key,
            ExtraArgs={"ContentType": "application/pdf"},
        )

    def get_pdf_buffer_s3(self, file_key):
        try:
            s3 = boto3.client("s3")
            pdf_file = io.BytesIO()
            s3.download_fileobj(self.bucket_name, file_key, pdf_file)
            pdf_file.seek(0)
            return pdf_file
        except Exception as e:
            log.error(f"Error downloading file from S3: {e}")
            raise e

    def upload_pdf(self, file_name: str, file: UploadFile):
        try:
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
        except Exception as e:
            log.error("S3 Upload Error:", e)
            return False

    def generate_presigned_url(self, file_name: str) -> str | None:
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_name},
                ExpiresIn=3600,
            )
            return presigned_url
        except Exception as e:
            log.error("Error generating presigned URL:", e)
            return None

    def download_file_obj(self, file_name, input_key, input_stream):
        self.s3_client.download_fileobj(self.bucket_name, input_key, input_stream)
