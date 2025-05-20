from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    def add_connection(self, client_id: str, websocket: WebSocket):
        self.active_connections[client_id] = websocket

    def remove_connection(self, client_id: str):
        self.active_connections.pop(client_id, None)

    def get_connection(self, client_id: str):
        return self.active_connections.get(client_id)
