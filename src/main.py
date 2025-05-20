import asyncio

from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.routers.docs_websocket import docs_websocket
from src.routers.docs import docs_router
from src.logs.logger import Logger

log = Logger(name="main").get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.sleep(0)
    yield
    log.info("Staring the services....")


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
app.include_router(
    docs_websocket,
    prefix="/api",
    tags=["docs_websocket"],
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
