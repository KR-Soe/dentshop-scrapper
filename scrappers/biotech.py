import json
import requests
from utils.connection import make_mongo_conn

def send_request(category, page):
    url = 'https://biotechchile.cl/ws/api/products'
    params = {
        'categoryId': f'{category}',
        'take': 200,
        'page': {page},
        'filterOrderBy': 'customAsc',
        'searchWord': '',
        'productTypes%5B0%5D': 1,
        'productTypes%5B1%5D': 4,
        'productTypes%5B2%5D': 5,
        'filterBrandId': 0,
        'isImportant': False,
        'isOffering': False,
        'filterPriceRange%5B0%5D': 0,
        'filterPriceRange%5B1%5D': 500000,
        'limitPriceRangeMin': 0,
        'limitPriceRangeMax': 500000,
        'token': ''
    }

    print('sending request...', url,params)
    results = requests.post(url, params).json()

    if len(results['products']) == 0:
        return {}

    data = results['products']['data']
    current_page = results['products']['current_page']
    last_page = results['products']['last_page']

    insert_data(data)
    return send_request(category, current_page+1) if last_page > current_page else send_request(category+1, 1)


def insert_data(data):
    connection = make_mongo_conn()
    for item in data:
        uri = item['uri']
        item_id = item['id']
        categories = []
        for cat in item['categories']:
            categories.append(cat['name'])

        output = {
            'title': item['name'],
            'internetPrice': int(float(item['net_price'])),
            'normalPrice': int(float(item['salePrice'])),
            'sku': item['barcode'],
            'stock': item['availableStock'],
            'category': categories,
            'image': None,
            'referUrl': f'https://www.biotechchile.com/#/producto/{uri}/{item_id}'
        }

        connection.dentshop.biotech.insert_one(output)

    print('total items inserted: ', len(data))

print(send_request(1,1))
