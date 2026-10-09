from typing import List, Tuple
import numpy as np


class DetectedLabel:
    def __init__(self, crop: np.ndarray, bbox: Tuple[int, int, int, int], confidence: float):
        self.crop = crop
        self.bbox = bbox  # (x1, y1, x2, y2)
        self.confidence = confidence


class LabelDetector:
    def __init__(self, model_path: str = None):
        self.model = None
        self.model_path = model_path
        # Quando model_path for fornecido e ultralytics estiver instalado, carrega o modelo
        if model_path:
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
            except Exception as e:
                print(f"[LabelDetector] Aviso: Não foi possível carregar modelo YOLO: {e}")

    def detect(self, image: np.ndarray, min_confidence: float = 0.5) -> List[DetectedLabel]:
        """
        Detecta etiquetas na imagem. Se houver modelo YOLO carregado, executa a inferência.
        Caso contrário (ou se nenhuma caixa for detectada), trata a imagem inteira como 1 etiqueta.
        """
        h, w, _ = image.shape
        detected: List[DetectedLabel] = []

        if self.model:
            results = self.model(image, conf=min_confidence, verbose=False)
            for r in results:
                for box in r.boxes:
                    coords = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = [int(v) for v in coords]
                    # Adiciona margem de segurança de 5%
                    pad_x = int((x2 - x1) * 0.05)
                    pad_y = int((y2 - y1) * 0.05)
                    cx1 = max(0, x1 - pad_x)
                    cy1 = max(0, y1 - pad_y)
                    cx2 = min(w, x2 + pad_x)
                    cy2 = min(h, y2 + pad_y)

                    crop = image[cy1:cy2, cx1:cx2]
                    conf = float(box.conf[0])
                    detected.append(DetectedLabel(crop, (cx1, cy1, cx2, cy2), conf))

        # Fallback defensivo: se não houver detecções específicas ou modelo não carregado,
        # considera a imagem inteira como etiqueta principal
        if not detected:
            detected.append(DetectedLabel(image, (0, 0, w, h), 1.0))

        return detected
