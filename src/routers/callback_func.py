from src.logs.logger import Logger
from src.instances import manager
from src.instances import mongo_db
from ..helper.time import curr_timestamp
from src.models import Collections

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
    log = {"status": message, "timestamp": timestamp}
    await progress_callback(log, key=key)

    await mongo_db.upsert(
        filter={"doc_name": key},
        data={"log": [log], "status": "processed"},
        upsert=True,
        collection_name=Collections.LOGS.value,
        push_fields=["log"],
    )
