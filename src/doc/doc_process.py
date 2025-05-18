import asyncio
from io import BytesIO
from multiprocessing import Pool, cpu_count
import time

from pdf2image import convert_from_bytes
from PIL import ImageDraw, ImageFont
import pytesseract
import re
from PyPDF2 import PdfReader
from collections import Counter, defaultdict

from src.helper.images import process_image
from src.llm.llm import LLM
from src.logs.logger import Logger

log = Logger(name="PDFRedactor").get_logger()


class DocsRedactor:
    def __init__(
        self,
        pdf_bytes_io: BytesIO,
        dpi: int = 150,
        chunk_size: int = 2,
        key: str = None,
        progress_callback=None,
    ) -> None:
        self.pdf_path = pdf_bytes_io
        self.word_map = defaultdict()
        self.dpi = dpi
        self.chunk_size = chunk_size
        self.dpi = dpi
        self.pdf_bytes_io = pdf_bytes_io
        self.key = key
        self.progress_callback = progress_callback
        self.llm = LLM()

    async def extract_lines_from_scanned_pdf_parallel(self) -> dict:
        start_time = time.time()
        reader = PdfReader(self.pdf_path)
        total_pages = len(reader.pages)

        all_lines = []
        word_count = Counter()
        word_pages = defaultdict(set)

        with Pool(cpu_count()) as pool:
            for start_page in range(1, total_pages + 1, self.chunk_size):
                end_page = min(start_page + self.chunk_size - 1, total_pages)
                log.info(f"\n🔹 Processing pages {start_page} to {end_page}")
                self.pdf_path.seek(0)
                pdf_bytes = self.pdf_path.read()

                images = convert_from_bytes(
                    pdf_bytes,
                    dpi=self.dpi,
                    first_page=start_page,
                    last_page=end_page,
                )
                image_data = [(start_page + i - 1, img) for i, img in enumerate(images)]
                results = pool.map(process_image, image_data)
                results.sort(key=lambda x: x[0])

                await self.progress_callback(
                    f"Processing the pages: {start_page} to {end_page}",
                    self.key,
                )

                for page_number, lines in results:
                    log.info(f"\n--- Page {page_number + 1} ---")

                    await self.progress_callback(
                        f"Processing the page number: {page_number+1}",
                        self.key,
                    )

                    # all_lines = []
                    # all_lines.extend([line + "\n" for line in lines])
                    # log.info("llm is triggered.")
                    # text = "".join(all_lines)

                    # result = await self.llm.llm_response(text)
                    # log.info(f"llm response is: {result}")
                    # if result is not None:
                    #     for phrase, replacement in result.items():
                    #         normalized = self._normalize(phrase)
                    #         self.word_map[normalized] = replacement
                    #         word_count[normalized] += 1
                    # word_pages[normalized].add(page_number + 1)

        total_time = time.time() - start_time
        log.info(f"🔹 Total time taken: {total_time:.2f}s")
        log.info(f"🧠 Unique phrases found: {len(self.word_map)}")
        log.info(f"📈 Word frequency: {dict(word_count)}")
        log.info(f"📄 Word locations: {dict(word_pages)}")

        if self.word_map:
            await self.progress_callback("Redacting the document", self.key)
            self.word_map = {self._normalize(k): v for k, v in self.word_map.items()}
            redacted_images = self.redact()

            return {
                "redacted_images": redacted_images,
                "stats": {
                    "total_time": total_time,
                    "total_words_extracted": sum(word_count.values()),
                    "unique_words_extracted": list(self.word_map.keys()),
                    "word_frequencies": dict(word_count),
                    "word_page_map": {
                        k: sorted(list(v)) for k, v in word_pages.items()
                    },
                },
            }

        return {
            "redacted_images": [],
            "stats": {
                "total_time": total_time,
                "total_words_extracted": 0,
                "unique_words_extracted": [],
                "word_frequencies": {},
                "word_page_map": {},
            },
        }

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

    def _centered_text_position(
        self, font: ImageFont.ImageFont, replacement: str, box
    ) -> tuple[float, float]:
        bbox = font.getbbox(replacement)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        min_x, min_y, max_x, max_y = box
        x = min_x + (max_x - min_x - text_width) // 2
        y = min_y + (max_y - min_y - text_height) // 2
        return x, y

    def redact(self) -> list:
        self.pdf_bytes_io.seek(0)
        images = convert_from_bytes(self.pdf_path.getvalue(), dpi=self.dpi)

        processed_images = []

        for page_num, image in enumerate(images):
            log.info(f"🔹 Processing Page {page_num + 1}")
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

                        log.info(f"🔒 Replaced phrase '{phrase}' with '{replacement}'")
                        i += len(phrase_parts)
                        match_found = True
                        break

                if not match_found:
                    i += 1

            processed_images.append(image)

        return processed_images
