FROM python:3.11-slim

WORKDIR /app

# Install netcat for health check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

ENV PYTHONPATH=/app

EXPOSE 8000
