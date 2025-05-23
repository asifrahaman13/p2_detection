from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional, List, Union

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorClientSession

from src.models.db import Collections


default_collection = Collections.DOCS.value


class MongoDBHandler:
    def __init__(self, uri: str, db_name: str) -> None:
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[db_name]

    @asynccontextmanager
    async def start_transaction(
        self,
    ) -> AsyncGenerator[AsyncIOMotorClientSession, None]:
        async with await self.client.start_session() as session:
            async with session.start_transaction():
                yield session

    def _format_doc(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def create(
        self,
        data: dict,
        collection_name: str = default_collection,
        session: Optional[AsyncIOMotorClientSession] = None,
    ) -> str:
        collection = self.db[collection_name]
        result = await collection.insert_one(data, session=session)
        return str(result.inserted_id)

    async def update(
        self,
        id: str,
        data: dict,
        collection_name: str = default_collection,
        session: Optional[AsyncIOMotorClientSession] = None,
    ) -> bool:
        collection = self.db[collection_name]
        result = await collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}, session=session
        )
        return result.modified_count > 0

    async def upsert(
        self,
        filter: Union[dict, str],
        data: dict,
        upsert: bool = False,
        collection_name: str = default_collection,
        session: Optional[AsyncIOMotorClientSession] = None,
        push_fields: Optional[list[str]] = None,
    ) -> bool:
        if isinstance(filter, str):
            filter = {"_id": ObjectId(filter)}

        update_query = {}
        push_fields = push_fields or []

        if push_fields:
            push_ops = {
                field: {"$each": data[field]}
                for field in push_fields
                if field in data and isinstance(data[field], list)
            }
            if push_ops:
                update_query["$push"] = push_ops
        set_ops = {key: value for key, value in data.items() if key not in push_fields}
        if set_ops:
            update_query["$set"] = set_ops

        collection = self.db[collection_name]
        result = await collection.update_one(
            filter, update_query, upsert=upsert, session=session
        )

        return result.modified_count > 0 or result.upserted_id is not None

    async def delete(
        self,
        id: str,
        collection_name: str = default_collection,
        session: Optional[AsyncIOMotorClientSession] = None,
    ) -> bool:
        collection = self.db[collection_name]
        result = await collection.delete_one({"_id": ObjectId(id)}, session=session)
        return result.deleted_count > 0

    async def delete_all(
        self,
        filters: dict = {},
        collection_name: str = default_collection,
        session: Optional[AsyncIOMotorClientSession] = None,
    ) -> int:
        collection = self.db[collection_name]
        result = await collection.delete_many(filters, session=session)
        return result.deleted_count

    async def get(
        self, id: str, collection_name: str = default_collection
    ) -> Optional[dict]:
        collection = self.db[collection_name]
        doc = await collection.find_one({"_id": ObjectId(id)})
        return self._format_doc(doc) if doc else None

    async def find_one(
        self, filters: dict, collection_name: str = default_collection
    ) -> Optional[dict]:
        collection = self.db[collection_name]
        doc = await collection.find_one(filters)
        return self._format_doc(doc) if doc else None

    async def get_all(
        self, filters: dict = {}, collection_name: str = default_collection
    ) -> List[dict]:
        collection = self.db[collection_name]
        cursor = collection.find(filters)
        docs = await cursor.to_list(length=None)
        return [self._format_doc(doc) for doc in docs]
