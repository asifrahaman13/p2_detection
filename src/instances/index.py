from src.instances.instances import get_aws, get_conn_manager, get_mongo


aws = get_aws()
mongo_db = get_mongo()
manager = get_conn_manager()
