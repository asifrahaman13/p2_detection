from contextlib import asynccontextmanager
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from src.instances import aws
from src.doc.doc_process import PDFRedactor
from src.models.docs import RedactRequest

from src.logs.logger import Logger
from src.models.db import Tables
from src.models.cloud import CloudStorage
from src.instances import db

log = Logger(name="main").get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    log.info("Connected to the database")
    yield
    await db.disconnect()
    log.info("Disconnected from the database")


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/pdf/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    title: str = Form(...),
):
    try:
        file_name = f"{title}"
        file.file.seek(0)
        upload_response = aws.upload_pdf(file_name, file)
        if not upload_response:
            raise HTTPException(status_code=500, detail="Failed to upload file to S3")
        presigned_url = aws.generate_presigned_url(
            f"{CloudStorage.UPLOAD.value}/{file_name}"
        )
        if not presigned_url:
            raise HTTPException(
                status_code=500, detail="Failed to generate presigned URL"
            )

        log.info(f"File uploaded successfully: {file_name}")

        await db.create(
            table=Tables.PDF_FILES.value,
            data={
                "file_name": file_name,
                "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.UPLOADS.value}/{file_name}",
                "title": title,
            },
        )
        return JSONResponse(content={"presigned_url": presigned_url}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/pdf/process-pdf")
async def process_pdf(request: RedactRequest):
    try:
        log.info("Processing PDF...")
        input_stream = aws.download_file_to_memory(
            f"{CloudStorage.UPLOADS.value}/{request.input_key}"
        )
        redactor = PDFRedactor(input_stream)
        redacted_images = await redactor.extract_lines_from_scanned_pdf_parallel()
        output_stream = BytesIO()
        redacted_images[0].save(
            output_stream,
            save_all=True,
            append_images=redacted_images[1:],
            format="PDF",
        )
        output_key = f"{CloudStorage.REDACTED.value}/{request.input_key}"
        aws.upload_file_from_memory(output_stream, output_key)
        return {
            "message": "Redacted file uploaded successfully.",
            "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.REDACTED.value}/{output_key}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/pdf/get-presigned-url")
async def get_presigned_url(request: RedactRequest):
    try:
        presigned_url = aws.generate_presigned_url(
            f"{CloudStorage.UPLOADS.value}/{request.input_key}"
        )
        if not presigned_url:
            raise HTTPException(
                status_code=500, detail="Failed to generate presigned URL"
            )
        return JSONResponse(content={"presigned_url": presigned_url}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/pdf/list-files")
async def list_files():
    try:
        files = await db.read(Tables.PDF_FILES.value)
        print(files)

        files = [
            {
                "id": file["id"],
                "file_name": file["file_name"],
                "s3_path": file["s3_path"],
                "title": file["title"],
            }
            for file in files
        ]
        if not files:
            raise HTTPException(status_code=404, detail="No files found")
        log.info(f"Files retrieved successfully: {files}")
        return JSONResponse(content={"files": files}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Welcome to the PDF Redaction API!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
