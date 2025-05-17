from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware

from src.models.db import Tables
from src.instances import db
from src.routers.docs import docs_router
from src.logs.logger import Logger

log = Logger(name="main").get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    log.info("Connected to the database")

    docs_table = await db.create_table_if_not_exists(
        table=Tables.PDF_FILES.value,
        columns={
            "id": "SERIAL PRIMARY KEY",
            "file_name": "TEXT",
            "s3_path": "TEXT",
            "title": "TEXT",
        },
    )

    if docs_table is False:
        log.error("Failed to create PDF_FILES table")
        raise HTTPException(status_code=500, detail="Failed to create PDF_FILES table")

    docs_table = await db.create_table_if_not_exists(
        table=Tables.DOCUMENT_DATA.value,
        columns={
            "id": "SERIAL PRIMARY KEY",
            "key_points": "TEXT",
            "pdf_name": "TEXT",
        },
    )

    if docs_table is False:
        log.error("Failed to create DOCUMENT_DATA table")
        raise HTTPException(
            status_code=500, detail="Failed to create DOCUMENT_DATA table"
        )

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

app.include_router(
    docs_router,
    prefix="/api",
    tags=["docs"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the PDF Redaction API!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
