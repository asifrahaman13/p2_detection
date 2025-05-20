import pytest
import json
from unittest.mock import AsyncMock, patch

from src.llm.llm import LLM


@pytest.mark.asyncio
@patch("src.llm.llm.parse_data", return_value='{"name": "John"}')
@patch("src.llm.llm.AsyncOpenAI")
async def test_openai_llm_response_success(mock_openai, mock_parse_data):
    mock_response = AsyncMock()
    mock_response.chat.completions.create.return_value.choices = [
        type(
            "obj",
            (object,),
            {"message": type("msg", (object,), {"content": '{"name": "John"}'})},
        )()
    ]
    mock_openai.return_value = mock_response

    llm = LLM()
    result = await llm.openai_llm_response("What is your name?")

    assert result == {"name": "John"}
    mock_response.chat.completions.create.assert_called_once()
    mock_parse_data.assert_called_once()


@pytest.mark.asyncio
@patch(
    "src.llm.llm.parse_data", side_effect=json.JSONDecodeError("Expecting value", "", 0)
)
@patch("src.llm.llm.AsyncOpenAI")
async def test_openai_llm_response_retry_on_json_error(mock_openai, mock_parse_data):
    mock_response = AsyncMock()
    mock_response.chat.completions.create.return_value.choices = [
        type(
            "obj",
            (object,),
            {"message": type("msg", (object,), {"content": '{"invalid_json":'})},
        )()
    ]
    mock_openai.return_value = mock_response

    llm = LLM()
    result = await llm.openai_llm_response("Invalid JSON response?")

    assert result is None
    assert mock_parse_data.call_count == 3
    assert mock_response.chat.completions.create.call_count == 3


@pytest.mark.asyncio
@patch("src.llm.llm.parse_data", return_value="Not a JSON string")
@patch("src.llm.llm.AsyncOpenAI")
async def test_openai_llm_response_value_error(mock_openai, mock_parse_data):
    mock_response = AsyncMock()
    mock_response.chat.completions.create.return_value.choices = [
        type(
            "obj",
            (object,),
            {"message": type("msg", (object,), {"content": "Not a JSON string"})},
        )()
    ]
    mock_openai.return_value = mock_response

    llm = LLM()
    result = await llm.openai_llm_response("Invalid JSON structure?")

    assert result is None
    assert mock_parse_data.call_count == 3
    assert mock_response.chat.completions.create.call_count == 3
