from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class DetectedLabelResult(BaseModel):
    label_index: int
    bounding_box: BoundingBox
    detection_confidence: float = Field(..., ge=0.0, le=1.0)
    raw_text: str
    parsed_code: Optional[str] = None
    quality: str = Field(..., description="COMPLETE, PARTIAL ou ILLEGIBLE")
    confidence: float = Field(..., ge=0.0, le=1.0)
    uncertain_positions: List[int] = Field(default_factory=list)
    candidate_variations: List[str] = Field(default_factory=list)


class SummaryInfo(BaseModel):
    total_labels_detected: int
    fully_read: int
    partially_read: int
    illegible: int


class ImageMetadata(BaseModel):
    width: int
    height: int
    format: str


class ProcessImageResponse(BaseModel):
    status: str = "success"
    processing_time_ms: int
    image_metadata: ImageMetadata
    summary: SummaryInfo
    labels: List[DetectedLabelResult]
