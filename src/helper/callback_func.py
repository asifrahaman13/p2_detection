import asyncio
from src.instances.index import manager
from src.logs.logger import Logger
import time

log = Logger(name="router").get_logger()


async def progress_callback(data: dict, key: str) -> None:
    ws = manager.get_connection(key)
    log.info(f"The websocket connection is: {ws}")
    if ws:
        try:
            log.info(f"The data received is: {data}")
            await asyncio.sleep(0)
            await ws.send_json(data)
        except Exception as e:
            log.warning(f"WebSocket progress error: {e}")


async def progress_callback_func(message: str, key: str) -> None:
    timestamp = int(time.time() * 1000)
    await asyncio.sleep(0)
    await progress_callback({"status": message, "timestamp": timestamp}, key=key)
