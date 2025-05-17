from io import BytesIO
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from src.instances import aws
from src.doc.doc_process import DocsRedactor
from src.logs.logger import Logger

from src.models.db import Tables
from src.models.cloud import CloudStorage
from src.instances import db
from src.models.docs import DocumentData, RedactRequest
from src.instances import mongo_db

log = Logger(name="router").get_logger()


docs_router = APIRouter(
    prefix="/v1/docs",
    tags=["docs"],
)


@docs_router.post("/upload-docs")
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
            f"{CloudStorage.UPLOADS.value}/{file_name}"
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


@docs_router.post("/process-docs")
async def process_pdf(request: RedactRequest):
    try:
        log.info("Processing docs...")
        input_stream = aws.download_file_to_memory(
            f"{CloudStorage.UPLOADS.value}/{request.input_key}"
        )
        redactor = DocsRedactor(input_stream)
        result = await redactor.extract_lines_from_scanned_pdf_parallel()
        print(f"The statistcis is: {result["stats"]}")
        output_stream = BytesIO()
        result["redacted_images"][0].save(
            output_stream,
            save_all=True,
            append_images=result["redacted_images"][1:],
            format="PDF",
        )
        output_key = f"{CloudStorage.REDACTED.value}/{request.input_key}"
        aws.upload_file_from_memory(output_stream, output_key)
        log.info(f"Redacted file uploaded successfully: {output_key}")

        result = {
            "message": "Redacted file uploaded successfully.",
            "file_name": request.input_key,
            "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.REDACTED.value}/{output_key}",
            "stats": result["stats"],
        }
        result = await mongo_db.create(data=result)
        if not result:
            raise HTTPException(
                status_code=500, detail="Failed to save results in MongoDB"
            )

        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.post("/get-presigned-url")
async def get_presigned_url(request: RedactRequest):
    try:
        original_pdf = aws.generate_presigned_url(
            f"{CloudStorage.UPLOADS.value}/{request.input_key}"
        )
        masked_pdf = aws.generate_presigned_url(
            f"{CloudStorage.REDACTED.value}/{request.input_key}"
        )
        if not original_pdf or not masked_pdf:
            raise HTTPException(
                status_code=500, detail="Failed to generate presigned URL"
            )
        return JSONResponse(
            content={"original_pdf": original_pdf, "masked_pdf": masked_pdf},
            status_code=200,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.get("/list-files")
async def list_files():
    try:
        files = await db.read(Tables.PDF_FILES.value)
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


@docs_router.post("/save")
async def save_document(data: DocumentData):
    try:
        if not data.pdf_name:
            raise HTTPException(status_code=400, detail="docs name is required")

        if not data.key_points:
            raise HTTPException(status_code=400, detail="Key points are required")

        await db.delete(
            table=Tables.DOCUMENT_DATA.value,
            key_name="pdf_name",
            key_val=data.pdf_name,
        )
        for key_point in data.key_points:
            await db.create(
                table=Tables.DOCUMENT_DATA.value,
                data={
                    "key_points": key_point,
                    "pdf_name": data.pdf_name,
                },
            )
        log.info(f"Document saved successfully: {data.pdf_name}")
        return JSONResponse(
            content={"message": "Document saved successfully"}, status_code=200
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.post("/get-key-points")
async def get_key_points(request: RedactRequest):
    try:
        key_points = await db.read(
            table=Tables.DOCUMENT_DATA.value,
            conditions={"pdf_name": request.input_key},
        )
        log.info(key_points)
        if not key_points:
            raise HTTPException(status_code=404, detail="No key points found")

        key_points = [
            {
                "key_points": key_point["key_points"],
                "pdf_name": key_point["pdf_name"],
            }
            for key_point in key_points
        ]
        document_data = {
            "key_points": [item["key_points"] for item in key_points],
            "pdf_name": key_points[0]["pdf_name"] if key_points else "",
        }
        log.info(f"Key points retrieved successfully: {key_points}")
        return JSONResponse(content=document_data, status_code=200)
    except Exception as e:
        log.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.post("/results")
async def get_results(request: RedactRequest):
    try:
        results = await mongo_db.find_one(
            filters={"file_name": request.input_key},
        )
        log.info(f"The results are: {results}")
        if not results:
            raise HTTPException(status_code=404, detail="No results found")
        log.info(f"Results retrieved successfully: {results}")
        return JSONResponse(content={"results": results}, status_code=200)
    except Exception as e:
        log.error(e)
        raise HTTPException(status_code=500, detail=str(e))
