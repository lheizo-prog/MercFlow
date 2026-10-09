import re
from typing import List, Tuple, Optional
import numpy as np
from label_reader.utils.char_confusion import generate_candidate_variations


class OCRResult:
    def __init__(
        self,
        raw_text: str,
        parsed_code: Optional[str],
        quality: str,
        confidence: float,
        uncertain_positions: List[int],
        candidate_variations: List[str],
    ):
        self.raw_text = raw_text
        self.parsed_code = parsed_code
        self.quality = quality
        self.confidence = confidence
        self.uncertain_positions = uncertain_positions
        self.candidate_variations = candidate_variations


class OCRReader:
    def __init__(self, languages: List[str] = None):
        self.languages = languages or ["pt", "en"]
        self._reader = None

    def _get_easyocr_reader(self):
        if self._reader is None:
            try:
                import easyocr
                self._reader = easyocr.Reader(self.languages, gpu=False)
            except Exception as e:
                print(f"[OCRReader] Aviso: EasyOCR não inicializado: {e}")
        return self._reader

    def read(self, crop: np.ndarray) -> OCRResult:
        """
        Executa OCR no recorte da etiqueta e extrai códigos candidatos (EAN, SKU).
        """
        reader = self._get_easyocr_reader()
        raw_lines = []
        confidences = []

        if reader:
            try:
                results = reader.readtext(crop)
                for _, text, conf in results:
                    text_str = text.strip()
                    if text_str:
                        raw_lines.append(text_str)
                        confidences.append(float(conf))
            except Exception as e:
                print(f"[OCRReader] Erro ao ler recorte com EasyOCR: {e}")

        raw_text = " ".join(raw_lines)
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0

        # Identificação de código de produto (EAN-13, EAN-8 ou SKU alfanumérico)
        parsed_code = self._extract_likely_code(raw_text)

        # Determina qualidade
        quality = "ILLEGIBLE"
        uncertain_positions = []
        if avg_confidence >= 0.80 and parsed_code:
            quality = "COMPLETE"
        elif avg_confidence >= 0.40 and parsed_code:
            quality = "PARTIAL"
        elif parsed_code:
            quality = "PARTIAL"

        candidate_variations = (
            generate_candidate_variations(parsed_code) if parsed_code else []
        )

        return OCRResult(
            raw_text=raw_text,
            parsed_code=parsed_code,
            quality=quality,
            confidence=round(avg_confidence, 2),
            uncertain_positions=uncertain_positions,
            candidate_variations=candidate_variations,
        )

    def _extract_likely_code(self, text: str) -> Optional[str]:
        if not text:
            return None

        # 1. Procura por código de barras numérico (ex: EAN-13 de 13 dígitos ou 8-14 dígitos)
        barcodes = re.findall(r"\b\d{8,14}\b", text)
        if barcodes:
            # Prioriza 13 dígitos (padrão Brasil EAN-13)
            ean13 = [b for b in barcodes if len(b) == 13]
            return ean13[0] if ean13 else barcodes[0]

        # 2. Procura por SKU padrão letras e números (ex: ABC-1234, SKU12345, PRD-01)
        skus = re.findall(r"\b[A-Za-z0-9]{3,}[-_][A-Za-z0-9]+\b|\b[A-Z]{2,}\d{3,}\b", text)
        if skus:
            return skus[0]

        # 3. Fallback: primeira sequência de 4+ caracteres alfanuméricos
        words = [w for w in re.findall(r"[A-Za-z0-9]+", text) if len(w) >= 4]
        return words[0] if words else None
