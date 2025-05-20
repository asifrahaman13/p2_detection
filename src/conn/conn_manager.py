from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self, max_conn: int = 100) -> None:
        self.active_connections: Dict[str, WebSocket] = {}
        self.max_conn = max_conn

    def add_connection(self, client_id: str, websocket: WebSocket):
        if len(self.active_connections) >= self.max_conn:
            return
        self.active_connections[client_id] = websocket

    def remove_connection(self, client_id: str):
        self.active_connections.pop(client_id, None)

    def get_connection(self, client_id: str):
        return self.active_connections.get(client_id)
