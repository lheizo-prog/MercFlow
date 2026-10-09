import time
from typing import List
from label_reader.core.image_preprocessor import ImagePreprocessor
from label_reader.core.label_detector import LabelDetector
from label_reader.core.ocr_reader import OCRReader
from label_reader.api.schemas import (
    ProcessImageResponse,
    ImageMetadata,
    SummaryInfo,
    DetectedLabelResult,
    BoundingBox,
)


class Pipeline:
    def __init__(self, yolo_model_path: str = None):
        self.preprocessor = ImagePreprocessor()
        self.detector = LabelDetector(model_path=yolo_model_path)
        self.ocr_reader = OCRReader()

    def process(self, image_bytes: bytes, confidence_threshold: float = 0.5) -> ProcessImageResponse:
        start_time = time.time()

        # 1. Pré-processamento
        image, meta_dict = self.preprocessor.preprocess(image_bytes)

        # 2. Detecção de etiquetas
        detected_labels = self.detector.detect(image, min_confidence=confidence_threshold)

        # 3. OCR e consolidação
        results: List[DetectedLabelResult] = []
        fully_read = 0
        partially_read = 0
        illegible = 0

        for idx, detected in enumerate(detected_labels):
            ocr = self.ocr_reader.read(detected.crop)

            if ocr.quality == "COMPLETE":
                fully_read += 1
            elif ocr.quality == "PARTIAL":
                partially_read += 1
            else:
                illegible += 1

            x1, y1, x2, y2 = detected.bbox
            results.append(
                DetectedLabelResult(
                    label_index=idx,
                    bounding_box=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                    detection_confidence=round(detected.confidence, 2),
                    raw_text=ocr.raw_text,
                    parsed_code=ocr.parsed_code,
                    quality=ocr.quality,
                    confidence=ocr.confidence,
                    uncertain_positions=ocr.uncertain_positions,
                    candidate_variations=ocr.candidate_variations,
                )
            )

        elapsed_ms = int((time.time() - start_time) * 1000)

        return ProcessImageResponse(
            status="success",
            processing_time_ms=elapsed_ms,
            image_metadata=ImageMetadata(**meta_dict),
            summary=SummaryInfo(
                total_labels_detected=len(results),
                fully_read=fully_read,
                partially_read=partially_read,
                illegible=illegible,
            ),
            labels=results,
        )
