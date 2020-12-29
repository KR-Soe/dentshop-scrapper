import re
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn


class Expressdent(scrapy.Spider):
    name = 'expressdent'

    def start_requests(self):
        self.connection = make_mongo_conn()
        start_url = 'https://expressdent.cl/'

        yield Request(start_url, callback=self.parse)

    def parse(self, response):
        last_page = [
            int(num)
            for num in response.css('.page-numbers::text').getall()
            if num.isnumeric()
        ][-1]

        for i in range(1, last_page + 1):
            item = response.css('.ht-product-image > a[href]::attr(href)').getall()

            for link in item:
                yield Request(link, callback=self._parse_detail)


    def _parse_detail(self, response):
        product_title = response.css('.single-post-title.product_title.entry-title::text').get()
        normal_price = self._get_number(response.css('.price::text').get())
        internet_price = self._get_number(response.css('.price::text').get())
        stock = self._get_number(response.css('.stock in-stock::text').get())
        sku = response.css('.sku_wrapper > .sku::text').get()
        category = response.css('.posted_in > a::text').getall()
        image = response.css('.zoomImg::attr(src)').get()

        output = {
            'title': product_title,
            'internetPrice': int(internet_price, 10),
            'normalPrice': int(normal_price, 10),
            'stock': int(stock, 10),
            'sku': sku,
            'category': category,
            'image': image,
            'referUrl': response.url
        }

        self.connection.dentshop.expressdent.insert_one(output)


    def _get_number(self, text):
        result = re.sub(r'\D*', '', text)
        return 0 if result == '' else result


process = CrawlerProcess(settings={})
process.crawl(Expressdent)
process.start()
