from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Union
from bson import ObjectId


class MongoDBHandler:
    def __init__(self, uri: str, db_name: str, collection_name: str):
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def _format_doc(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def create(self, data: dict) -> str:
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get(self, id: str) -> Optional[dict]:
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        return self._format_doc(doc) if doc else None

    async def find_one(self, filters: dict) -> Optional[dict]:
        doc = await self.collection.find_one(filters)
        return self._format_doc(doc) if doc else None

    async def get_all(self, filters: dict = {}) -> List[dict]:
        cursor = self.collection.find(filters)
        docs = await cursor.to_list(length=None)
        return [self._format_doc(doc) for doc in docs]

    async def update(self, id: str, data: dict) -> bool:
        result = await self.collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        return result.modified_count > 0

    async def upsert(
        self, filter: Union[dict, str], data: dict, upsert: bool = False
    ) -> bool:
        if isinstance(filter, str):
            filter = {"_id": ObjectId(filter)}

        result = await self.collection.update_one(filter, {"$set": data}, upsert=upsert)
        return result.modified_count > 0 or result.upserted_id is not None

    async def delete(self, id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def delete_all(self, filters: dict = {}) -> int:
        result = await self.collection.delete_many(filters)
        return result.deleted_count
