import json
import re
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from scrapy.exceptions import CloseSpider
from scrapy.spidermiddlewares.httperror import HttpError
from utils.connection import make_mongo_conn


class Mayordent(scrapy.Spider):
    name = 'mayordent'

    def start_requests(self):
        self.connection = make_mongo_conn()

        for page_number in range(1, 999):
            url = f'https://www.mayordent.cl/page/{page_number}/?s=+&post_type=product'
            yield Request(url, callback=self.parse_list, errback=self.do_nothing)

    def do_nothing(self, failure):
        if failure.check(HttpError):
            response = failure.value.response

            if response.status == 404:
                raise CloseSpider(reason='no page found')

    def parse_list(self, response):
        items = response.css('.products.row.thb-main-products.thb-products-spacing-30 > li')

        for item in items:
            link_to_follow = item.css('a::attr(href)').get()
            yield Request(link_to_follow, callback=self._parse_detail)

    def _parse_detail(self, response):
        product_title = response.css('.product_title.entry-title::text').get()
        internet_price = self._get_number(response.css('.woocommerce-Price-amount.amount > bdi::text').get())
        normal_price = self._get_number(response.css('.woocommerce-product-details__short-description > p::text').get())
        stock = self._get_number(response.css('.stock.in-stock::text').get())

        sku = response.css('.sku_wrapper > .sku::text').get()
        category = response.css('.posted_in > a::text').getall()
        image = response.css('.wp-post-image.thb-ignore-lazyload::attr(src)').get()
        del category[0]

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

        self.connection.dentshop.mayordent.insert_one(output)


    def _get_number(self, text):
        if text is None:
            return 0

        result = re.sub(r'\D*', '', text)
        return 0 if result == '' else result


process = CrawlerProcess(settings={})
process.crawl(Mayordent)
process.start()
