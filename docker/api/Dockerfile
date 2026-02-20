FROM python:3.12-slim

WORKDIR /app

# Allow corporate proxy / self-signed certs
ENV PIP_TRUSTED_HOST="pypi.org pypi.python.org files.pythonhosted.org"

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Application code + dependencies (editable install needs source present)
COPY . .
RUN pip install --no-cache-dir -e ".[dev]"

# Run
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
