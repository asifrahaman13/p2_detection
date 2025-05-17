import json
from src.database.mongo_db import MongoDBHandler

db = MongoDBHandler(
    uri="mongodb://localhost:27017", db_name="testdb", collection_name="items"
)


import asyncio


async def create_item():
    data = {}

    with open("output.json", "r") as f:
        data = f.read()

    # print(data["stats"])

    inserted_id = await db.create(json.loads(data))
    print(f"Inserted item with ID: {inserted_id}")


# Run the create function
asyncio.run(create_item())
