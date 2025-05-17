import asyncpg
from typing import Any, Dict, List, Optional

from src.logs.logger import Logger


log = Logger(name="main").get_logger()


class AsyncPostgresCRUD:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.pool: Optional[asyncpg.pool.Pool] = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(dsn=self.dsn)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
    
    async def create_table_if_not_exists(self, table: str, columns: Dict[str, str]) -> bool:
        try:
            column_definitions = ", ".join(
                f"{name} {definition}" for name, definition in columns.items()
            )
            table_sql = f"CREATE TABLE IF NOT EXISTS {table} ({column_definitions});"
            return await self.create_table(table_sql)
        except Exception as e:
            log.error(f"Error creating table {table}: {e}")
            return False

    async def create_table(self, table_sql: str) -> bool:
        if not self.pool:
            log.error("Database connection pool is not initialized.")
            return False
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(table_sql)
            return True
        except Exception as e:
            log.error(f"Error executing table SQL: {e}")
            return False

    async def create(self, table: str, data: Dict[str, Any]) -> int:
        columns = ", ".join(data.keys())
        values = ", ".join(f"${i+1}" for i in range(len(data)))
        query = f"INSERT INTO {table} ({columns}) VALUES ({values}) RETURNING id;"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *data.values())
            return row["id"]

    async def read(
        self, table: str, conditions: Dict[str, Any] = {}
    ) -> List[asyncpg.Record]:
        if conditions:
            where_clause = " AND ".join(
                f"{k} = ${i+1}" for i, k in enumerate(conditions)
            )
            query = f"SELECT * FROM {table} WHERE {where_clause};"
            values = list(conditions.values())
        else:
            query = f"SELECT * FROM {table};"
            values = []
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *values)

    async def update(self, table: str, id_val: Any, data: Dict[str, Any]) -> str:
        set_clause = ", ".join(f"{k} = ${i+1}" for i, k in enumerate(data))
        query = f"UPDATE {table} SET {set_clause} WHERE id = ${len(data) + 1};"
        values = list(data.values()) + [id_val]
        async with self.pool.acquire() as conn:
            await conn.execute(query, *values)
            return "Updated successfully"

    async def delete(self, table: str, key_name: str, key_val: Any) -> str:
        query = f"DELETE FROM {table} WHERE {key_name} = $1;"
        async with self.pool.acquire() as conn:
            await conn.execute(query, key_val)
            return "Deleted successfully"
