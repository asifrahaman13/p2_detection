import json
from multiprocessing import Pool, cpu_count
from anthropic import AsyncAnthropicBedrock

from pdf2image import convert_from_path
from PIL import ImageDraw, ImageFont
import pytesseract
import re
from PyPDF2 import PdfReader
from collections import defaultdict

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    filename="app.log",
    filemode="a",
)


async def async_sleep(duration):
    await asyncio.sleep(duration)


prompt_builder = """You are helpful AI assistant. You will be given certain text. Your job is to extract out the follosings:
                    
                    company_name: any name which seems to be a company name\n
                    physical_addresses: All physical address of company or people\n
                    phone_numbers: All phone number in the text\n
                    person_names: All the name of the people in the text \n
                    email_address: All email address in the text\n 
                      
                    give the result in a json format only. 
                    
                    The key should be the text and the value should be fom the following generic placeholders.

                    The person names should not be any list. In fact everything should be key value pairs only.

                    o Company names → "THE COMPANY"
                    o Company email addresses → "theCOMPANY@email.com"
                    o Person names → Randomly generated names
                    o Addresses → Generic placeholder addresses
                    o Phone numbers → Generic placeholder numbers\n  

                    =======================================================\n\n

                    *IMPORTANT: Only give the json formatted text and no other response. Your response should be ready to be converted to json.\n

                    The given text is: {prompt}.  
                    """


class LLM:
    def __init__(
        self,
        max_tokens: int = 5000,
        model: str = "anthropic.claude-3-5-sonnet-20240620-v1:0",
        stream: bool = False,
    ) -> int:
        self.max_tokens = max_tokens
        self.model = model
        self.stream = stream

        self.client = AsyncAnthropicBedrock()

    async def llm_response(self, prompt: str) -> str:
        for attempt in range(3):  # Retry up to 3 times
            try:
                message = {
                    "role": "user",
                    "content": prompt_builder.format(prompt=prompt),
                }

                response = await self.client.messages.create(
                    model=self.model, max_tokens=self.max_tokens, messages=[message]
                )

                logging.info(f"The llm response is: {response.content[0].text}")
                response_text = response.content[0].text
                json_result = json.loads(response_text)

                if not isinstance(json_result, dict):
                    raise ValueError("Parsed response is not a dict.")

                return json_result

            except (json.JSONDecodeError, ValueError, Exception) as e:
                logging.info(f"Attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    logging.error("All retries failed.")
                    return None
                await asyncio.sleep(1)


def process_image(image_data):
    page_number, image = image_data
    text = pytesseract.image_to_string(image)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return page_number, lines


class PDFRedactor:
    def __init__(
        self,
        pdf_path: str,
        dpi: int = 300,
        chunk_size: int = 2,
    ):
        self.pdf_path = pdf_path
        self.word_map = defaultdict()
        self.dpi = dpi
        self.chunk_size = chunk_size
        self.dpi = dpi
        self.llm = LLM()

    async def extract_lines_from_scanned_pdf_parallel(self):
        reader = PdfReader(self.pdf_path)
        total_pages = len(reader.pages)
        all_lines = []
        results = {}
        with Pool(cpu_count()) as pool:
            for start_page in range(1, total_pages + 1, self.chunk_size):
                end_page = min(start_page + self.chunk_size - 1, total_pages)
                logging.info(f"\n🔹 Processing pages {start_page} to {end_page}")
                images = convert_from_path(
                    self.pdf_path,
                    dpi=self.dpi,
                    first_page=start_page,
                    last_page=end_page,
                )
                image_data = [(start_page + i - 1, img) for i, img in enumerate(images)]
                results = pool.map(process_image, image_data)
                results.sort(key=lambda x: x[0])
                for page_number, lines in results:
                    logging.info(f"\n--- Page {page_number + 1} ---")
                    for line in lines:
                        logging.info(line)
                    all_lines.extend(lines)
                logging.info(
                    f"=========================================> {"".join(all_lines)}"
                )

                result = await self.llm.llm_response("".join(all_lines))

                if result is not None:
                    # sets the word maps
                    self.word_map.update(result)
                    logging.info(
                        f"============================> word update now: {self.word_map}"
                    )

        logging.info(f"============================> word update now: {self.word_map}")
        if self.word_map:
            self.word_map = {self._normalize(k): v for k, v in self.word_map.items()}
            logging.info(self.word_map)
            return self.redact()

    def _normalize(self, text: str) -> str:
        return re.sub(r"[^\w\s]", "", text).strip().lower()

    def _get_font(
        self, replacement: str, box_width: int, box_height: int
    ) -> ImageFont.FreeTypeFont:
        try:
            font_path = "arial.ttf"
            font_size = int(box_height * 0.8)
            font = ImageFont.truetype(font_path, font_size)

            while font.getsize(replacement)[0] > box_width and font_size > 5:
                font_size -= 1
                font = ImageFont.truetype(font_path, font_size)

            return font
        except Exception:
            return ImageFont.load_default()

    def _centered_text_position(self, font: ImageFont.ImageFont, replacement: str, box):
        bbox = font.getbbox(replacement)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        min_x, min_y, max_x, max_y = box
        x = min_x + (max_x - min_x - text_width) // 2
        y = min_y + (max_y - min_y - text_height) // 2
        return x, y

    def redact(self):
        images = convert_from_path(self.pdf_path, dpi=self.dpi)
        processed_images = []

        for page_num, image in enumerate(images):
            logging.info(f"🔹 Processing Page {page_num + 1}")
            draw = ImageDraw.Draw(image)
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

            n_boxes = len(data["text"])
            words = [
                {
                    "text": data["text"][i].strip(),
                    "normalized": self._normalize(data["text"][i]),
                    "box": (
                        data["left"][i],
                        data["top"][i],
                        data["width"][i],
                        data["height"][i],
                    ),
                    "index": i,
                }
                for i in range(n_boxes)
                if data["text"][i].strip()
            ]

            i = 0
            while i < len(words):
                match_found = False
                for phrase, replacement in self.word_map.items():
                    phrase_parts = phrase.split()
                    match = all(
                        i + j < len(words)
                        and words[i + j]["normalized"] == phrase_parts[j]
                        for j in range(len(phrase_parts))
                    )

                    if match:
                        boxes = [words[i + j]["box"] for j in range(len(phrase_parts))]
                        min_x = min(box[0] for box in boxes)
                        min_y = min(box[1] for box in boxes)
                        max_x = max(box[0] + box[2] for box in boxes)
                        max_y = max(box[1] + box[3] for box in boxes)

                        draw.rectangle([min_x, min_y, max_x, max_y], fill="black")

                        font = self._get_font(replacement, max_x - min_x, max_y - min_y)
                        text_pos = self._centered_text_position(
                            font, replacement, (min_x, min_y, max_x, max_y)
                        )
                        draw.text(text_pos, replacement, fill="white", font=font)

                        logging.info(
                            f"🔒 Replaced phrase '{phrase}' with '{replacement}'"
                        )
                        i += len(phrase_parts)
                        match_found = True
                        break

                if not match_found:
                    i += 1

            processed_images.append(image)

        return processed_images

    def save(self, images, output_path: str):
        if not images:
            logging.error("❌ No images to save.")
            return

        images[0].save(
            output_path, save_all=True, append_images=images[1:], format="PDF"
        )
        logging.info(f"✅ Output saved to {output_path}")


async def main():
    pdf_path = "src/Sample assignment document v2.pdf"
    output_path = "redacted_output.pdf"

    redactor = PDFRedactor(pdf_path)
    redacted_images = await redactor.extract_lines_from_scanned_pdf_parallel()
    redactor.save(redacted_images, output_path)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
