import io
from typing import Tuple
from PIL import Image, ImageOps
import numpy as np


class ImagePreprocessor:
    @staticmethod
    def preprocess(image_bytes: bytes) -> Tuple[np.ndarray, dict]:
        """
        Carrega a imagem a partir de bytes, corrige rotação EXIF,
        valida tamanho e retorna como array OpenCV (BGR) junto aos metadados.
        """
        pil_image = Image.open(io.BytesIO(image_bytes))

        # Corrige orientação EXIF se presente (ex: fotos de celular)
        pil_image = ImageOps.exif_transpose(pil_image)

        # Converte para RGB
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        width, height = pil_image.size
        format_name = pil_image.format or "JPEG"

        # Converte PIL -> numpy array (BGR para OpenCV)
        rgb_array = np.array(pil_image)
        bgr_array = rgb_array[:, :, ::-1].copy()

        metadata = {
            "width": width,
            "height": height,
            "format": format_name,
        }

        return bgr_array, metadata
