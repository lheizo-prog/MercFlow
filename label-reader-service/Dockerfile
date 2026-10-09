FROM python:3.11-slim

# Instala dependências de sistema necessárias para OpenCV e Tesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-por \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
EXPOSE 8001

CMD ["uvicorn", "label_reader.api.main:app", "--host", "0.0.0.0", "--port", "8001"]
