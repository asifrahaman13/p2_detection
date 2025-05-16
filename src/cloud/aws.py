import asyncio
import io
import logging
import boto3
from fastapi import UploadFile

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")


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

    async def download_file_to_memory(self, s3_key: str, buffer: io.BytesIO) -> None:
        try:
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.s3_client.get_object(Bucket=self.bucket_name, Key=s3_key),
            )

            buffer.write(response["Body"].read())
            buffer.seek(0)
        except Exception as e:
            raise e

    def get_pdf_buffer_s3(self, file_key):
        bucket_name = "gainlife-asif-document-ingestion"
        try:
            s3 = boto3.client("s3")
            pdf_file = io.BytesIO()
            s3.download_fileobj(bucket_name, file_key, pdf_file)
            pdf_file.seek(0)
            return pdf_file
        except Exception as e:
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
            print("S3 Upload Error:", e)
            return False

    def upload_fileobj(self, s3_key: str, file_obj) -> str | None:
        try:
            s3_key = self.s3_client.upload_fileobj(file_obj, self.bucket_name, s3_key)
            return s3_key
        except Exception as e:
            raise e

    def generate_presigned_url(self, file_name: str) -> str | None:
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_name},
                ExpiresIn=3600,
            )
            return presigned_url
        except Exception as e:
            raise e
