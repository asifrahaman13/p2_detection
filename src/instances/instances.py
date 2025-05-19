from src.cloud.aws import AWS
from src.config.index import aws_config, db_config
from src.database.mongo_db import MongoDBHandler
from src.helper.conn_manager import ConnectionManager
from src.models.db import Collections, Databases
from src.database.ps_db import AsyncPostgresCRUD


def singleton(cls):
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance


@singleton
def get_aws():
    return AWS(
        region_name=aws_config.region,
        bucket_name=aws_config.bucket_name,
        aws_access_key_id=aws_config.access_key_id,
        aws_secret_access_key=aws_config.secret_access_key,
    )


@singleton
def get_postgres():
    return AsyncPostgresCRUD(dsn=db_config.postgres_dsn)


@singleton
def get_mongo():
    return MongoDBHandler(
        uri=db_config.mongo_uri,
        db_name=Databases.DOCS.value,
        collection_name=Collections.DOCS.value,
    )


@singleton
def get_conn_manager():
    return ConnectionManager()
