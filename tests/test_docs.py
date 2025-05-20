import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from io import BytesIO

from src.doc.doc_process import DocsRedactor


class TestDocsRedactor(unittest.TestCase):
    def setUp(self):
        self.dummy_pdf_bytes = BytesIO(b"%PDF-1.4 test pdf data")
        self.configurations = {
            "key_points": [
                {
                    "entity": "John Doe",
                    "replaceWith": "REDACTED",
                    "description": "Name",
                },
                {
                    "entity": "123 Main St",
                    "replaceWith": "ADDRESS",
                    "description": "Address",
                },
            ],
            "process_type": "replace",
        }
        self.redactor = DocsRedactor(
            pdf_bytes_io=self.dummy_pdf_bytes,
            key="123",
            configurations=self.configurations,
            progress_callback=AsyncMock(),
        )

    def test_initialization(self):
        self.assertEqual(self.redactor.key, "123")
        self.assertEqual(self.redactor.dpi, 150)
        self.assertIsInstance(self.redactor.pdf_bytes_io, BytesIO)

    def test_prompt_builder(self):
        sample_text = "John Doe lives at 123 Main St."
        prompt = self.redactor.prompt_builder(sample_text)
        self.assertIn("John Doe", prompt)
        self.assertIn("REDACTED", prompt)
        self.assertIn("123 Main St", prompt)
        self.assertIn("ADDRESS", prompt)

    def test_normalize(self):
        normalized = self.redactor._normalize("John. Doe!")
        self.assertEqual(normalized, "john doe")

    @patch("src.doc.doc_process.PdfReader")
    @patch("src.doc.doc_process.convert_from_bytes")
    @patch(
        "src.doc.doc_process.process_image", return_value=(0, ["John Doe lives here."])
    )
    @patch("src.doc.doc_process.LLM.openai_llm_response", new_callable=AsyncMock)
    async def test_process_doc_mocked(
        self, mock_llm_response, mock_process_image, mock_convert, mock_reader
    ):
        mock_reader.return_value.pages = [MagicMock()]
        mock_convert.return_value = [MagicMock()]
        mock_llm_response.return_value = {"John Doe": "REDACTED"}

        result = await self.redactor.process_doc()

        self.assertIn("redacted_images", result)
        self.assertIn("stats", result)
        self.assertGreaterEqual(result["stats"]["total_unique_words_extracted"], 1)
        self.redactor.progress_callback.assert_called()

    @patch("src.doc.doc_process.pytesseract.image_to_data")
    @patch("src.doc.doc_process.convert_from_bytes")
    def test_redact(self, mock_convert_from_bytes, mock_image_to_data):
        dummy_img = MagicMock()
        mock_convert_from_bytes.return_value = [dummy_img]
        self.redactor.word_map = {"john doe": "REDACTED"}
        mock_image_to_data.return_value = {
            "text": ["John", "Doe"],
            "left": [10, 60],
            "top": [10, 10],
            "width": [40, 40],
            "height": [20, 20],
        }

        result = self.redactor.redact()
        self.assertEqual(len(result), 1)
        dummy_img.save.assert_not_called()


if __name__ == "__main__":
    unittest.main()
