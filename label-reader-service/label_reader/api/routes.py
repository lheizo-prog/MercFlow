from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status
from label_reader.api.schemas import ProcessImageResponse
from label_reader.core.pipeline import Pipeline

router = APIRouter()
pipeline = Pipeline()

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


@router.post(
    "/process-image",
    response_model=ProcessImageResponse,
    summary="Processar imagem para detecção e leitura de etiquetas",
    description="Recebe uma imagem (JPG, PNG, WEBP), detecta etiquetas e extrai textos/códigos via OCR.",
)
async def process_image(
    image: UploadFile = File(..., description="Arquivo de imagem a ser processado (máx 5MB)"),
    confidence_threshold: float = Query(0.5, ge=0.0, le=1.0, description="Limiar mínimo de confiança"),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo inválido. O arquivo enviado deve ser uma imagem válida.",
        )

    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo enviado está vazio.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Imagem excede o limite máximo permitido de {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    try:
        response = pipeline.process(image_bytes, confidence_threshold=confidence_threshold)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no processamento da imagem: {str(e)}",
        )
