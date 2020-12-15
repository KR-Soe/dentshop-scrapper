import pymongo

def make_mongo_conn():
    return pymongo.MongoClient('127.0.0.1', 27017)
