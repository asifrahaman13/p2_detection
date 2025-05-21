# API documentation

The followings are the list of curl requests for the APIs. 

1. Upload Documentss

```bash
curl -X POST http://localhost:8000/v1/docs/upload-docs \
  -F "file=@path/to/your/file.pdf" \
  -F "title=SAMPLE_DOC"
```

2. Proces the Doc (Core part)

```bash
curl -X POST http://localhost:8000/v1/docs/process-docs \
  -H "Content-Type: application/json" \
  -d '{
        "input_key": "SAMPLE_DOC"
      }'

```

3. Presigned URL

```bash
curl -X POST http://localhost:8000/v1/docs/get-presigned-url \
  -H "Content-Type: application/json" \
  -d '{
        "input_key": "SAMPLE_DOC"
      }'

```

4. List of all the docs uploaded.

```bash
curl -X GET http://localhost:8000/v1/docs/list-files
```

5. Save the document key points.

```bash
curl -X POST http://localhost:8000/v1/docs/save \
  -H "Content-Type: application/json" \
  -d '{
        "key_points": [
          {
            "entity": "John Doe",
            "description": "Name of the patient",
            "replaceWith": "REDACTED_NAME"
          }
        ],
        "pdf_name": "SAMPLE_DOC",
        "process_type": "replace"
      }'

```

6. Get all the key points of the document. 

```bash
curl -X POST http://localhost:8000/v1/docs/get-key-points \
  -H "Content-Type: application/json" \
  -d '{
        "input_key": "SAMPLE_DOC"
      }'

```