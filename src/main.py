from io import BytesIO
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from src.instances import aws
from src.doc.doc_process import PDFRedactor
from src.models.docs import RedactRequest

from src.logs.logger import Logger

log = Logger(name="PDFRedactor").get_logger()

app = FastAPI()


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
        presigned_url = aws.generate_presigned_url(f"uploads/{file_name}")
        if not presigned_url:
            raise HTTPException(
                status_code=500, detail="Failed to generate presigned URL"
            )
        return JSONResponse(content={"presigned_url": presigned_url}, status_code=200)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/pdf/process-pdf")
async def process_pdf(request: RedactRequest):
    try:
        input_stream = aws.download_file_to_memory(request.input_key)
        redactor = PDFRedactor(input_stream)
        redacted_images = await redactor.extract_lines_from_scanned_pdf_parallel()
        output_stream = BytesIO()
        redacted_images[0].save(
            output_stream,
            save_all=True,
            append_images=redacted_images[1:],
            format="PDF",
        )
        output_key = "sample_redacted.pdf"
        aws.upload_file_from_memory(output_stream, output_key)
        return {
            "message": "✅ Redacted file uploaded successfully.",
            "s3_path": f"s3://{aws.bucket_name}/{output_key}",
        }
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
