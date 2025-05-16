from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from src.instances import aws

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
