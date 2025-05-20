import json
import asyncio

from openai import AsyncOpenAI

from src.helper.json_utuils import parse_data
from src.logs.logger import Logger

log = Logger(name="llm.py").get_logger()


class LLM:
    def __init__(
        self,
        max_tokens: int = 400,
        model: str = "gpt-4.1",
        temperature: float = 0.7,
        stream: bool = False,
    ) -> int:
        self.max_tokens = max_tokens
        self.model = model
        self.temperature = temperature
        self.stream = stream
        self.openai_client = AsyncOpenAI()

    async def openai_llm_response(self, prompt: str) -> str:
        for attempt in range(3):
            try:
                log.info(f"Prompt: {prompt}")
                message = {"role": "user", "content": prompt}

                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[message],
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                )

                log.info(f"The llm response is: {response.choices[0].message.content}")
                response_text = response.choices[0].message.content
                cleaned = parse_data(response_text)
                json_result = json.loads(cleaned)
                if not isinstance(json_result, dict):
                    raise ValueError("Parsed response is not a dict.")

                return json_result

            except (json.JSONDecodeError, ValueError, Exception) as e:
                log.info(f"Attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    log.error("All retries failed.")
                    return None
                await asyncio.sleep(1)
