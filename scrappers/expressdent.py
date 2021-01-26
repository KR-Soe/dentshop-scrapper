import re
import scrapy
import json
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from utils.parser import text_to_number
from dto.product import Product


class Expressdent(scrapy.Spider):
    name = 'expressdent'

    def start_requests(self):
        self.connection = make_mongo_conn()
        with open('./scrappers/inputs/expressdent.json', 'r') as file:
            start_urls = json.load(file)

        for url in start_urls:
            yield Request(url, callback=self.parse_list)

    def parse_list(self, response):
        items = response.css('.products > .entry')
        for item in items:
            link = item.css('a::attr(href)').get()
            yield Request(link, callback=self._parse_detail)

    def _parse_detail(self, response):
        product_title = response.css('.single-post-title.product_title.entry-title::text').get()
        normal_price = text_to_number(response.css('.summary.entry-summary > .price > span > bdi::text').get())
        internet_price = text_to_number(response.css('.summary.entry-summary > .price > span > bdi::text').get())
        stock = text_to_number(response.css('.stock.in-stock::text').get())
        sku = response.css('.sku_wrapper > .sku::text').get()
        categories = response.css('.posted_in > a::text').getall()
        image = response.css('.woocommerce-product-gallery__image > a::attr(href)').get()
        description = response.css('.woocommerce-product-details__short-description > p::text').get()

        output = Product()
        output.title = product_title
        output.price = int(internet_price)
        output.stock = int(stock)
        output.sku = sku
        output.image = image or 'sin imagen'
        output.refer_url = response.url
        output.description = description or ''
        output.brand = ''
        output.platform_source = 'expressdent'

        for category in categories:
            output.add_category(category)

        self.connection.dentshop.products.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(Expressdent)
process.start()