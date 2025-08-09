FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use PORT environment variable with default fallback
ENV PORT=8004

# Modified CMD to use PORT env variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}