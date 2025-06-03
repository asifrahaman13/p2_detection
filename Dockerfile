FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y gcc build-essential poppler-utils tesseract-ocr curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Create and use a virtual environment that uv controls
RUN uv venv /venv
ENV PATH="/venv/bin:$PATH"

# Copy and install dependencies
COPY pyproject.toml ./
RUN uv pip install .  # This installs from pyproject.toml
# OR: RUN uv sync if you want to strictly use lock files

# Copy the rest of your app
COPY . .

EXPOSE 8000

CMD ["gunicorn", "src.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
