import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.instances.index import manager

from src.logs.logger import Logger

log = Logger(name="websocket").get_logger()

docs_websocket = APIRouter()


@docs_websocket.websocket("/ws/progress/{client_id}")
async def progress_ws(websocket: WebSocket, client_id: str):
    await websocket.accept()
    log.info(f"WebSocket connection established for client: {client_id}")
    manager.add_connection(client_id, websocket)
    try:
        while True:
            await asyncio.sleep(0)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.remove_connection(client_id)
