from src.logs.logger import Logger
from src.instances.index import manager
from .time import curr_timestamp

log = Logger(name="callback_func.py").get_logger()


async def progress_callback(data: dict, key: str) -> None:
    ws = manager.get_connection(key)
    log.info(f"The websocket connection is: {ws}")
    if ws:
        try:
            log.info(f"The data received is: {data}")
            await ws.send_json(data)
        except Exception as e:
            log.warning(f"WebSocket progress error: {e}")


async def progress_callback_func(message: str, key: str) -> None:
    timestamp = curr_timestamp()
    await progress_callback({"status": message, "timestamp": timestamp}, key=key)
