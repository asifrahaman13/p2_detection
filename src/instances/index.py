from src.instances.instances import get_aws, get_conn_manager, get_mongo, get_postgres


aws = get_aws()
db = get_postgres()
mongo_db = get_mongo()
manager = get_conn_manager()
