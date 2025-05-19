from io import BytesIO
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from src.instances.index import aws
from src.doc.doc_process import DocsRedactor
from src.logs.logger import Logger

from src.models.db import Tables
from src.models.cloud import CloudStorage
from src.instances.index import db
from src.models.docs import DocumentData, RedactRequest
from src.instances.index import mongo_db
from src.helper.callback_func import progress_callback_func
from src.models.db import Collections

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

        for _ in range(2):
            await progress_callback_func(
                "downloading the file to our system", key=request.input_key
            )

        log.info(f"Input key: {request.input_key}")
        input_stream = aws.download_file_to_memory(
            f"{CloudStorage.UPLOADS.value}/{request.input_key}"
        )

        configurations = await mongo_db.find_one(
            filters={"pdf_name": request.input_key},
            collection_name=Collections.CONFIGUATIONS.value,
        )

        log.info(f"The configurations are as follows: {str(configurations)}")

        redactor = DocsRedactor(
            input_stream,
            key=request.input_key,
            configurations=configurations,
            progress_callback=progress_callback_func,
        )
        result = await redactor.extract_lines_from_scanned_pdf_parallel()
        log.info(f"The statistcis is: {result["stats"]}")
        log.info(f"The redacted images are: {result["redacted_images"]}")

        if not result["redacted_images"] or not result["redacted_images"][0]:
            log.error("No redacted images found")
            raise HTTPException(
                status_code=500, detail="Failed to process the PDF file"
            )
        output_stream = BytesIO()
        result["redacted_images"][0].save(
            output_stream,
            save_all=True,
            append_images=result["redacted_images"][1:],
            format="PDF",
        )
        output_key = f"{CloudStorage.REDACTED.value}/{request.input_key}"
        await progress_callback_func(
            "Uploading the processed file...", key=request.input_key
        )

        aws.upload_file_from_memory(output_stream, output_key)
        log.info(f"Redacted file uploaded successfully: {output_key}")

        result = {
            "message": "Redacted file uploaded successfully.",
            "file_name": request.input_key,
            "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.REDACTED.value}/{output_key}",
            "stats": result["stats"],
        }
        filter = {
            "file_name": request.input_key,
        }
        result = await mongo_db.upsert(
            filter=filter,
            data={
                "file_name": request.input_key,
                "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.REDACTED.value}/{output_key}",
                "stats": result["stats"],
            },
            upsert=True,
        )
        if not result:
            raise HTTPException(
                status_code=500, detail="Failed to save results in MongoDB"
            )

        await progress_callback_func("completed", key=request.input_key)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        log.error(f"Error processing PDF: {e}")
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
        data = data.model_dump()
        if not data["pdf_name"]:
            raise HTTPException(status_code=400, detail="docs name is required")

        if not data["key_points"]:
            raise HTTPException(status_code=400, detail="Key points are required")

        await mongo_db.delete_all(
            {"pdf_name": data["pdf_name"]},
            collection_name=Collections.CONFIGUATIONS.value,
        )

        await mongo_db.create(
            data={"key_points": data["key_points"], "pdf_name": data["pdf_name"]},
            collection_name=Collections.CONFIGUATIONS.value,
        )
        log.info(f"Document saved successfully: {data["pdf_name"]}")
        return JSONResponse(
            content={"message": "Document saved successfully"}, status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.post("/get-key-points")
async def get_key_points(request: RedactRequest):
    try:
        key_points = await mongo_db.find_one(
            {"pdf_name": request.input_key},
            collection_name=Collections.CONFIGUATIONS.value,
        )
        log.info(key_points)
        if not key_points:
            raise HTTPException(status_code=404, detail="No key points found")

        log.info(f"Key points retrieved successfully: {key_points}")
        return JSONResponse(content=key_points, status_code=200)
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
