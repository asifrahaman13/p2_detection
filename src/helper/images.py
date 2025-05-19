import pytesseract
from typing import Tuple, List
from PIL import Image


def process_image(image_data: Tuple[int, Image.Image]) -> Tuple[int, List[str]]:
    page_number, image = image_data
    text = pytesseract.image_to_string(image)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return page_number, lines
