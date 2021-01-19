import json
import re
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from dto.product import Product


class Clandent(scrapy.Spider):
    name = 'clandent'

    def start_requests(self):
        self.connection = make_mongo_conn()

        with open('./scrappers/inputs/clandent.json', 'r') as file:
            categories = json.load(file)

        for category in categories:
            yield Request(category, callback=self._parse_product_list)

    def _parse_product_list(self, response):
        products = response.css('.woocommerce.main-products > .products > .product')

        for product in products:
            link = product.css('.product-wrapper > .thumbnail-wrapper > a::attr(href)').get()
            yield Request(link, callback=self._parse_product_detail)

    def _parse_product_detail(self, response):
        raw_price = response.css('.price > .woocommerce-Price-amount.amount > bdi::text').get()
        price = raw_price.replace('.', '')
        brand = response.css('.product-brands > a::text').get()
        name = response.css('.product_title.entry-title::text').get()
        sku = response.css('.meta-content > .sku-wrapper.product_meta > .sku::text').get()
        category = response.css('.breadcrumbs-container > a::text').getall()[1]
        description = response.css('.product-content > p::text').get()
        image = response.css('.product-images-summary img::attr(src)').get()
        stock = re.sub(r'\D', '', response.css('.availability.stock::attr(data-original)').get())

        output = Product()
        output.platform_source = 'clandent'
        output.brand = brand or ''
        output.title = name
        output.price = price
        output.refer_url = response.url
        output.description = description
        output.sku = sku
        output.image = image
        output.stock = stock or 0
        output.add_category(category)

        self.connection.dentshop.clandent.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(Clandent)
process.start()
