# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# # Install necessary system dependencies including gcc
RUN apt-get update && \
    apt-get install -y gcc build-essential poppler-utils tesseract-ocr && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# Install 'uv' package for dependency management and process management
RUN pip install uv

# Copy the pyproject.toml and poetry.lock files into the container
COPY pyproject.toml ./

# Install dependencies from pyproject.toml using 'uv sync'
RUN uv sync

# Copy the rest of the application into the container
COPY . .

# Expose the port that the application will run on
EXPOSE 8000

# Use gunicorn to run in production
CMD ["gunicorn", "src.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
