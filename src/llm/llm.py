import json
from anthropic import AsyncAnthropicBedrock
import asyncio

from src.constants.prompt import prompt_builder
from src.logs.logger import Logger

log = Logger(name="PDFRedactor").get_logger()


class LLM:
    def __init__(
        self,
        max_tokens: int = 1000,
        model: str = "anthropic.claude-3-5-sonnet-20240620-v1:0",
        stream: bool = False,
    ) -> int:
        self.max_tokens = max_tokens
        self.model = model
        self.stream = stream

        self.client = AsyncAnthropicBedrock()

    async def llm_response(self, prompt: str) -> str:
        for attempt in range(3):
            try:
                message = {
                    "role": "user",
                    "content": prompt_builder.format(prompt=prompt),
                }

                response = await self.client.messages.create(
                    model=self.model, max_tokens=self.max_tokens, messages=[message]
                )

                log.info(f"The llm response is: {response.content[0].text}")
                response_text = response.content[0].text
                json_result = json.loads(response_text)

                if not isinstance(json_result, dict):
                    raise ValueError("Parsed response is not a dict.")

                return json_result

            except (json.JSONDecodeError, ValueError, Exception) as e:
                log.info(f"Attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    log.error("All retries failed.")
                    return None
                await asyncio.sleep(1)
