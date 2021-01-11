import re
import scrapy
import json
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn
from utils.parser import text_to_number


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
        try:
            product_title = response.css('.single-post-title.product_title.entry-title::text').get()
            normal_price = text_to_number(response.css('.summary.entry-summary > .price > span > bdi::text').get())
            internet_price = text_to_number(response.css('.summary.entry-summary > .price > span > bdi::text').get())
            stock = text_to_number(response.css('.stock.in-stock::text').get())
            sku = response.css('.sku_wrapper > .sku::text').get()
            category = response.css('.posted_in > a::text').getall()
            image = response.css('.woocommerce-product-gallery__image > a::attr(href)').get()

            output = {
                'title': product_title,
                'internetPrice': int(internet_price),
                'normalPrice': int(normal_price),
                'stock': int(stock),
                'sku': sku,
                'category': category,
                'image': image,
                'referUrl': response.url
            }

            self.connection.dentshop.expressdent.insert_one(output)
        except TypeError as err:
            pass


process = CrawlerProcess(settings={})
process.crawl(Expressdent)
process.start()
