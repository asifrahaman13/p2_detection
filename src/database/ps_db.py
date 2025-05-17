import asyncpg
from typing import Any, Dict, List, Optional


class AsyncPostgresCRUD:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.pool: Optional[asyncpg.pool.Pool] = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(dsn=self.dsn)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def create_table(self, table_sql: str):
        async with self.pool.acquire() as conn:
            await conn.execute(table_sql)

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

    async def delete(self, table: str, id_val: Any) -> str:
        query = f"DELETE FROM {table} WHERE id = $1;"
        async with self.pool.acquire() as conn:
            await conn.execute(query, id_val)
            return "Deleted successfully"
