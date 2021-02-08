import json
import re
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from .utils.connection import make_mongo_conn
from .dto.product import Product
from .utils.pricecalculator import PriceCalculator


class Exprodental(scrapy.Spider):
    name = 'exprodental'

    def start_requests(self):
        self.connection = make_mongo_conn()
        self.calculator = PriceCalculator(self.connection)

        with open('./scrappers/inputs/exprodental.json', 'r') as file:
            urls = json.load(file)

        for url in urls:
            yield Request(url, callback=self.parse)

    def parse(self, response):
        links = response.css('.prod > article > a[href]::attr(href)').getall()

        for link in links:
            detail_url = f'https://www.exprodental.cl/{link}'
            self.logger.info(f'fetching from url {detail_url}')
            yield Request(detail_url, callback=self._parse_detail)

    def _parse_detail(self, response):
        product_title = response.css('.title-ficha > h3::text').get()
        internet_price = self._get_number(response.css('.ficha-der > h4 > strong::text').get())
        description = ''.join(response.css('.col-100 .col-50 *::text').getall())
        image = response.css('.ficha-izq img::attr(src)').get()
        texts = [text for text in response.css('.ficha-der > ul > li::text').getall() if text.strip() != '']
        stock = self._get_number(texts[0])
        brand = response.css('.ficha-der > ul > li > a::text').getall()[-1]

        if len(texts) == 5:
            category = self._get_category(texts[3])
            sku = texts[2].split(' ')[2]
        else:
            category = self._get_category(texts[2])
            sku = texts[1].split(' ')[1]

        output = Product()
        output.title = product_title
        output.price = int(internet_price)
        output.revenue_price = self.calculator.calculate_price_with_revenue(output.price)
        output.stock = int(stock)
        output.sku = sku
        output.brand = brand
        output.description = description.strip()
        output.image = f'https://www.exprodental.cl/{image}'
        output.refer_url = response.url
        output.platform_source = 'exprodental'
        output.add_category(category)

        self.connection.products.insert_one(output.to_serializable())

    def _get_number(self, text):
        result = re.sub(r'\D*', '', text)
        return 0 if result == '' else result

    def _get_category(self, text):
        result = re.search(r'\w+:\s?(?P<category>\w*)', text)
        return None if result is None else result.group('category')


process = CrawlerProcess(settings={})
process.crawl(Exprodental)
process.start()
