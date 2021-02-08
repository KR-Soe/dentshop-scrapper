import pymongo

def make_mongo_conn(db_to_connect = 'dentshop'):
    connection = pymongo.MongoClient('127.0.0.1', 27017)
    return getattr(connection, db_to_connect)
