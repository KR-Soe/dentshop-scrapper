import json
import scrapy
import re
import json
from datetime import datetime
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from .utils.connection import make_mongo_conn
from .utils.parser import text_to_number
from .dto.product import Product
from .utils.pricecalculator import PriceCalculator


class DentalLaval(scrapy.Spider):
    name = 'dental_laval'

    def start_requests(self):
        self.connection = make_mongo_conn()
        self.calculator = PriceCalculator(self.connection)
        self.now = datetime.now().isoformat()
        self.base_url = 'https://www.dental-laval.cl/'

        with open('./scrappers/inputs/dental-laval.json', 'r') as file:
            start_urls = json.load(file)

        for category_url in start_urls:
            yield Request(category_url, callback=self._parse_list)

    def _parse_list(self, response):
        elements = response.css('.pagination > .page > a::text').getall()

        if len(elements) > 0:
            last_page = int(elements[-1])

            for _ in range(last_page + 1):
                item_detail_list = self._get_detail_urls(response)

                for item_detail_request in item_detail_list:
                    yield item_detail_request
        else:
            item_detail_list = self._get_detail_urls(response)

            for item_detail_request in item_detail_list:
                yield item_detail_request

    def _get_detail_urls(self, response):
        item = response.css('.grid__item.small--one-half.medium-up--one-fifth > a[href]::attr(href)').getall()
        new_urls = []

        for link in item:
            url = f'{self.base_url}{link}'
            new_urls.append(Request(url, callback=self._parse_detail))

        return new_urls

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
        image = f'https://{image_url}'.replace('////', '//')
        description = response.css('.rte.product-single__description::text').get(default='')

        output = Product()
        output.title = product_title
        output.price = int(internet_price)
        output.revenue_price = self.calculator.calculate_price_with_revenue(output.price)
        output.stock = int(stock)
        output.sku = sku
        output.image = image
        output.refer_url = response.url
        output.platform_source = 'dental-laval'
        output.brand = ''
        output.description = description
        output.created_at = self.now
        output.add_category(category)

        self.connection.products.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(DentalLaval)
process.start()
