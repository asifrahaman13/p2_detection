from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Union
from bson import ObjectId
from src.models.db import Collections


default_collection = Collections.DOCS.value


class MongoDBHandler:
    def __init__(self, uri: str, db_name: str):
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[db_name]

    def _format_doc(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    async def create(
        self, data: dict, collection_name: str = default_collection
    ) -> str:
        collection = self.db[collection_name]
        result = await collection.insert_one(data)
        return str(result.inserted_id)

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

    async def update(
        self, id: str, data: dict, collection_name: str = default_collection
    ) -> bool:
        collection = self.db[collection_name]
        result = await collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        return result.modified_count > 0

    async def upsert(
        self,
        filter: Union[dict, str],
        data: dict,
        upsert: bool = False,
        collection_name: str = default_collection,
    ) -> bool:
        collection = self.db[collection_name]
        if isinstance(filter, str):
            filter = {"_id": ObjectId(filter)}

        result = await collection.update_one(filter, {"$set": data}, upsert=upsert)
        return result.modified_count > 0 or result.upserted_id is not None

    async def delete(self, id: str, collection_name: str = default_collection) -> bool:
        collection = self.db[collection_name]
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def delete_all(
        self, filters: dict = {}, collection_name: str = default_collection
    ) -> int:
        collection = self.db[collection_name]
        result = await collection.delete_many(filters)
        return result.deleted_count
