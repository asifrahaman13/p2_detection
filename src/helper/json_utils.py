import re


def parse_data(data: str) -> str:
    cleaned_data = re.sub(r"```(?:json)?\n?|```", "", data).strip()
    return cleaned_data
