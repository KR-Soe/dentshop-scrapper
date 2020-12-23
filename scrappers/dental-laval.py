import json
import scrapy
import re
import json
from scrapy.http import Request
from utils.connection import make_mongo_conn

class DentalLaval(scrapy.Spider):
    name = 'dental_laval'

    start_urls = [
        "https://www.dental-laval.cl/collections/insumos-dentales",
        "https://www.dental-laval.cl/collections/equipamiento-dental",
        "https://www.dental-laval.cl/collections/laboratorio-dental"
    ]


    def parse(self, response):
        self.connection = make_mongo_conn()
        total_pages = response.css('.pagination > .page > a::text').getall()
        last_page = len(total_pages)

        for page in total_pages[last_page-1]:
            base_url = 'https://www.dental-laval.cl/'
            item = response.css('.grid__item.small--one-half.medium-up--one-fifth > a[href]::attr(href)').getall()
            for link in item:
                url = f'{base_url}{link}'
                yield Request(url, callback=self._parse_detail)


    def _parse_detail(self, response):
        data = re.findall('theme.strings =(.+?);\n', response.body.decode('utf-8'), re.S)
        OBJECT_DETAILS = {
            'STOCK': 0
        }
        if data:
            details = data[0]

        print(details)
        product_title = response.css('.product-single__title::text').get()
        normal_price = self._get_number(response.css('.product-single__price::text').get())
        stock = self._get_number(details[OBJECT_DETAILS['STOCK']])
        internet_price = normal_price
        # sku = response.css('.sku_wrapper > .sku::text').get()
        category = response.css('.posted_in > a::text').getall()
        # image = response.css('.wp-post-image.thb-ignore-lazyload::attr(src)').get()
        # del category[0]

        # output = {
        #     'title': product_title,
        #     'internetPrice': int(internet_price, 10),
        #     'normalPrice': int(normal_price, 10),
        #     'stock': int(stock, 10),
        #     'sku': sku,
        #     'category': category,
        #     'image': image,
        #     'referUrl': response.url
        # }

        # self.connection.dentshop.mayordent.insert_one(output)


    def _get_number(self, text):
        result = re.sub(r'\D*', '', text)
        return 0 if result == '' else result
