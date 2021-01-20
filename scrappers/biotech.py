import re
import json
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from utils.parser import text_to_number
from dto.product import Product


class Biotech(scrapy.Spider):
    name = 'biotech'

    def start_requests(self):
        self.connection = make_mongo_conn()
        self.categories = {}

        with open('./scrappers/inputs/biotech.json', 'r') as file:
            urls = json.load(file)

        for url in urls:
            self._add_category(url)

            for i in range(1, 5):
                new_url = f'{url}/page/{i}'
                yield Request(new_url, callback=self._parse_list)

    def _add_category(self, url):
        category_name, pk = url.split('/')[-1].split('-')
        self.categories[pk] = category_name

    def _get_category_from_url(self, url):
        result = re.search(r'category=(?P<category_id>\d+)', url)
        category_name = self.categories[result.group('category_id')]
        return category_name

    def _parse_list(self, response):
        links = response.css('.card.oe_product_cart a::attr(href)').getall()
        new_links = [f'https://biotechchile.com{url}' for url in links if url != '#']

        for link in new_links:
            yield Request(link, callback=self._parse_detail)

    def _parse_detail(self, response):
        category = self._get_category_from_url(response.url)
        title = response.css('#product_details > h1::text').get()
        price = response.css('.oe_price > .oe_currency_value::text').get()
        image = response.css('.carousel.slide img::attr(src)').get()
        stock = response.css('.availability_messages.o_not_editable > div').get()

        output = Product()
        output.title = title
        output.price = text_to_number(price)
        output.refer_url = response.url
        output.image = image
        output.brand = ''
        output.description = ''
        output.sku = ''
        output.platform_source = 'biotech'
        output.stock = text_to_number(stock)
        output.add_category(category)

        self.connection.dentshop.products.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(Biotech)
process.start()
