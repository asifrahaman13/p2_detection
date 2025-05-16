import pytesseract


def process_image(image_data):
    page_number, image = image_data
    text = pytesseract.image_to_string(image)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return page_number, lines
