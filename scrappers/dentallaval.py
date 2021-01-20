import json
import scrapy
import re
import json
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from utils.parser import text_to_number
from dto.product import Product


class DentalLaval(scrapy.Spider):
    name = 'dental_laval'

    def start_requests(self):
        self.connection = make_mongo_conn()

        start_urls = [
            "https://www.dental-laval.cl/collections/insumos-dentales",
            "https://www.dental-laval.cl/collections/equipamiento-dental",
            "https://www.dental-laval.cl/collections/laboratorio-dental"
        ]

        for url in start_urls:
            yield Request(url, callback=self.parse)

    def parse(self, response):
        last_page = int(response.css('.page > a::text').getall()[-1])

        for page in range(last_page):
            base_url = 'https://www.dental-laval.cl/'
            item = response.css('.grid__item.small--one-half.medium-up--one-fifth > a[href]::attr(href)').getall()

            for link in item:
                url = f'{base_url}{link}'
                yield Request(url, callback=self._parse_detail)

    def _parse_detail(self, response):
        data = re.findall('theme.strings =(.+?);\n', response.body.decode('utf-8'), re.S)
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
        image_url = response.css('#ProductPhotoImg-product-template::attr(src)').get()
        image = f'https://{image_url}'
        description = response.css('.rte.product-single__description::text').get(default='')

        output = Product()
        output.title = product_title
        output.price = int(internet_price)
        output.stock = int(stock)
        output.sku = sku
        output.image = image
        output.refer_url = response.url
        output.platform_source = 'dental-laval'
        output.brand = ''
        output.description = description
        output.add_category(category)

        self.connection.dentshop.products.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(DentalLaval)
process.start()
