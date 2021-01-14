import json
import scrapy
import re
import json
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from utils.parser import text_to_number


class DentalLaval(scrapy.Spider):
    name = 'dental_laval'

    start_urls = [
        "https://www.dental-laval.cl/collections/insumos-dentales",
        "https://www.dental-laval.cl/collections/equipamiento-dental",
        "https://www.dental-laval.cl/collections/laboratorio-dental"
    ]


    def parse(self, response):
        self.connection = make_mongo_conn()
        last_page = int(response.css('.page > a::text').getall()[-1])
        for page in range(last_page):
            print('page number', page+1 , 'of', last_page)
            base_url = 'https://www.dental-laval.cl/'
            item = response.css('.grid__item.small--one-half.medium-up--one-fifth > a[href]::attr(href)').getall()
            for link in item:
                url = f'{base_url}{link}'
                yield Request(url, callback=self._parse_detail)


    def _parse_detail(self, response):
        data = re.findall('theme.strings =(.+?);\n', response.body.decode('utf-8'), re.S)
        if data:
            details = data[0]
            pattern = r'(href=.+)'
            details_fixed = re.sub(pattern, '",', details)
            details = re.sub(r'(\w+):', lambda x: '"%s":' % x.group(1), details_fixed)
            details = json.loads(details)

        product_title = response.css('.product-single__title::text').get()
        normal_price = text_to_number(response.css('.product-single__price::text').get())
        stock = text_to_number(details['stockAvailable'])
        internet_price = normal_price
        sku = response.css('#ProductSelect-product-template > option::attr(value)').get()
        category = response.css('.h1.return-link::text').extract()[1].strip().split('Volver a')[1]
        image = f'https://{response.css('#ProductPhotoImg-product-template::attr(src)').get()}'

        output = {
            'title': product_title,
            'internetPrice': int(internet_price, 10),
            'normalPrice': int(normal_price, 10),
            'stock': int(stock, 10),
            'sku': sku,
            'category': category.strip(),
            'image': image,
            'referUrl': response.url,
            'platformSource': 'dental-laval'
        }
        self.connection.dentshop.dentallaval.insert_one(output)


process = CrawlerProcess(settings={})
process.crawl(DentalLaval)
process.start()
