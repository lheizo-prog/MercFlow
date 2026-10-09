from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from label_reader.api.routes import router

app = FastAPI(
    title="MercFlow Label Reader Service",
    description="Microsserviço de Visão Computacional e OCR para detecção e leitura de etiquetas de produtos.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "label-reader-service"}
