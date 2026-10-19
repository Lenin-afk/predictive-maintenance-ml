
FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
COPY src/ ./src/
COPY models/ ./models/

RUN uv sync --frozen --no-dev --no-install-project

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uv", "run", "--no-sync", "uvicorn", "predictive_maintenance_ml.api:app", "--host", "0.0.0.0", "--port", "8000"]
