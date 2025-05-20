import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId

from src.database.mongo_db import MongoDBHandler


@pytest.fixture
def handler():
    return MongoDBHandler(uri="mongodb://localhost:27017", db_name="test_db")


@patch("src.database.mongo_db.AsyncIOMotorClient")
@pytest.mark.asyncio
async def test_create(mock_client, handler):
    mock_collection = AsyncMock()
    mock_insert_result = MagicMock(inserted_id=ObjectId())
    mock_collection.insert_one.return_value = mock_insert_result
    handler.db = {"docs": mock_collection}

    inserted_id = await handler.create({"foo": "bar"})
    assert inserted_id == str(mock_insert_result.inserted_id)


@patch("src.database.mongo_db.AsyncIOMotorClient")
@pytest.mark.asyncio
async def test_get(mock_client, handler):
    fake_id = ObjectId()
    handler.db = {"docs": AsyncMock()}
    handler.db["docs"].find_one.return_value = {"_id": fake_id, "name": "Alice"}

    result = await handler.get(str(fake_id))
    assert result == {"id": str(fake_id), "name": "Alice"}


@patch("src.database.mongo_db.AsyncIOMotorClient")
@pytest.mark.asyncio
async def test_update(mock_client, handler):
    handler.db = {"docs": AsyncMock()}
    handler.db["docs"].update_one.return_value.modified_count = 1

    result = await handler.update(str(ObjectId()), {"name": "Updated"})
    assert result is True


@patch("src.database.mongo_db.AsyncIOMotorClient")
@pytest.mark.asyncio
async def test_delete(mock_client, handler):
    handler.db = {"docs": AsyncMock()}
    handler.db["docs"].delete_one.return_value.deleted_count = 1

    result = await handler.delete(str(ObjectId()))
    assert result is True


@patch("src.database.mongo_db.AsyncIOMotorClient")
@pytest.mark.asyncio
async def test_find_one(mock_client, handler):
    fake_id = ObjectId()
    handler.db = {"docs": AsyncMock()}
    handler.db["docs"].find_one.return_value = {"_id": fake_id, "foo": "bar"}

    result = await handler.find_one({"foo": "bar"})
    assert result == {"id": str(fake_id), "foo": "bar"}
