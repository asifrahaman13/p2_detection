from io import BytesIO
import time

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from src.instances import aws
from src.doc.doc_process import DocsRedactor
from src.logs.logger import Logger
from src.instances import mongo_db
from src.routers.callback_func import progress_callback_func
from src.helper import *
from src.models import *

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
        start_time = time.time()
        file_name = f"{title}"
        file.file.seek(0)
        upload_response = await run_blocking_io(aws.upload_pdf, file_name, file)
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
        insert_doc = await mongo_db.create(
            data={
                "file_name": file_name,
                "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.UPLOADS.value}/{file_name}",
                "title": title,
                "status": Status.UPLOADED.value,
                "timestamp": curr_timestamp(),
                "time_taken": time.time() - start_time,
            },
            collection_name=Collections.DOC_FILES.value,
        )
        if insert_doc is None:
            raise HTTPException(status_code=404, detail="Sorry something went wrong")

        insert_config = await mongo_db.create(
            data={
                "pdf_name": file_name,
                "key_points": [],
                "process_type": ProcessTypes.REPLACE.value,
            },
            collection_name=Collections.CONFIGUATIONS.value,
        )

        if insert_config is None:
            raise HTTPException(status_code=404, detail="Sorry something went wrong")

        return JSONResponse(content={"presigned_url": presigned_url}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.post("/process-docs")
async def process_pdf(request: RedactRequest):
    """
    There are several steps in this process.
    1. It downloads the doc into the memory (not hard drive) and keep in the buffer.
    2. The download happens in separate event loop so that other operations are not blocked.
    3. Data about the upload operation is inserted in mongodb.
    4. DocReadactor object is created for the document processing.
    5. The function process_docs() will process the doc, return the stats and the image array.
    6. The image will be uploaded to the S3 from memory.
    7. Data are saved to mongodb and api returns the stats.
    """
    try:
        start_time = time.time()
        log.info("Processing docs...")
        log.info(request.input_key)

        await progress_callback_func(
            "downloading the file to our system. It may take a few moments",
            key=request.input_key,
        )

        log.info(f"Input key: {request.input_key}")

        input_stream = await run_blocking_io(
            aws.download_file_to_memory,
            f"{CloudStorage.UPLOADS.value}/{request.input_key}",
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
            start_time=start_time,
        )

        result = await redactor.process_doc()

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

        await run_blocking_io(aws.upload_file_from_memory, output_stream, output_key)
        log.info(f"Redacted file uploaded successfully: {output_key}")

        filter = {
            "file_name": request.input_key,
        }
        result = {
            "message": "Redacted file uploaded successfully.",
            "file_name": request.input_key,
            "s3_path": f"s3://{aws.bucket_name}/{CloudStorage.REDACTED.value}/{output_key}",
            "stats": result["stats"],
            "status": Status.PROCESSED.value,
            "timestamp": curr_timestamp(),
            "time_taken": result["total_time"],
        }
        result = await mongo_db.upsert(filter=filter, data=result, upsert=True)
        if not result:
            raise HTTPException(
                status_code=500, detail="Failed to save results in MongoDB"
            )

        update_result = await mongo_db.upsert(
            filter=filter,
            data={"status": Status.PROCESSED.value, "timestamp": curr_timestamp()},
            upsert=True,
            collection_name=Collections.DOC_FILES.value,
        )

        if not update_result:
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
        file_metadata = await mongo_db.get_all(
            collection_name=Collections.DOC_FILES.value
        )

        for f in file_metadata:
            pdf_name = f["file_name"]
            res = await mongo_db.find_one(
                filters={"pdf_name": pdf_name},
                collection_name=Collections.CONFIGUATIONS.value,
            )
            if res is None:
                continue
            key_points = res.get("key_points", None)
            entities = []
            if key_points:
                for k in key_points:
                    entity = k["entity"]
                    entities.append(entity)
            f["tags"] = entities

        log.info(f"Final metadata after aggregating the results: {file_metadata}")
        return JSONResponse(content={"files": file_metadata}, status_code=200)
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

        await mongo_db.upsert(
            filter={"pdf_name": data["pdf_name"]},
            data={
                "key_points": data["key_points"],
                "pdf_name": data["pdf_name"],
                "process_type": data["process_type"],
            },
            upsert=True,
            collection_name=Collections.CONFIGUATIONS.value,
        )

        log.info(f"Document saved successfully: {data['pdf_name']}")
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


@docs_router.delete("/delete-resource")
async def delete_resource(request: RedactRequest):
    try:
        key = request.input_key
        filters = {"file_name": key}

        """ Mongodb transactions are only supported when you are connected to a replica set or mongodb shared cluster.
         So for now we are not passing the sessions. The code could have looked like this:

         async with mongo_db.start_transaction() as session:
            await mongo_db.delete_all(
                filters=filters, collection_name=Collections.DOCS.value, session=session
            )
            await mongo_db.delete_all(
                filters=filters, collection_name=Collections.DOC_FILES.value, session=session
            )
            await mongo_db.delete_all(
                filters={"pdf_name": key},
                collection_name=Collections.CONFIGUATIONS.value, session=session
            )
        """

        await mongo_db.delete_all(
            filters=filters, collection_name=Collections.DOCS.value
        )
        await mongo_db.delete_all(
            filters=filters, collection_name=Collections.DOC_FILES.value
        )
        await mongo_db.delete_all(
            filters={"pdf_name": key}, collection_name=Collections.CONFIGUATIONS.value
        )

        aws.delete_file(key=key)

        return JSONResponse(
            content={"message": "Resources deleted successfully"},
            status_code=200,
        )

    except Exception as e:
        log.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@docs_router.get("/logs/{key}")
async def logs(key: str):
    try:
        response = await mongo_db.find_one(
            filters={"doc_name": key}, collection_name=Collections.LOGS.value
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
