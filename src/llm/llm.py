import json
from anthropic import AsyncAnthropicBedrock
import logging
import asyncio

from src.constants.prompt import prompt_builder


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    filename="app.log",
    filemode="a",
)


async def async_sleep(duration):
    await asyncio.sleep(duration)


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
