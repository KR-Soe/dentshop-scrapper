import scrapy
from datetime import datetime
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from scrapy.exceptions import CloseSpider
from scrapy.spidermiddlewares.httperror import HttpError
from .utils.connection import make_mongo_conn
from .utils.parser import text_to_number
from .dto.product import Product
from .utils.pricecalculator import PriceCalculator


class Mayordent(scrapy.Spider):
    name = 'mayordent'

    def start_requests(self):
        self.connection = make_mongo_conn()
        self.calculator = PriceCalculator(self.connection)
        self.now = datetime.now().isoformat()

        for page_number in range(1, 100):
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
        internet_price = text_to_number(response.css('.summary.entry-summary .woocommerce-Price-amount.amount > bdi::text').get())
        stock = text_to_number(response.css('.stock.in-stock::text').get())
        sku = response.css('.sku_wrapper > .sku::text').get()
        categories = response.css('.posted_in > a::text').getall()
        image = response.css('.wp-post-image.thb-ignore-lazyload::attr(src)').get()
        brand = product_title.split(',')[-1].strip()

        output = Product()
        output.title = product_title
        output.price = int(internet_price)
        output.revenue_price = self.calculator.calculate_price_with_revenue(output.price)
        output.stock = int(stock)
        output.sku = sku or ''
        output.image = image or 'sin imagen'
        output.refer_url = response.url
        output.platform_source = 'mayordent'
        output.brand = brand
        output.description = ''
        output.created_at = self.now

        for cat in categories:
            output.add_category(cat)

        self.connection.products.insert_one(output.to_serializable())


process = CrawlerProcess(settings={})
process.crawl(Mayordent)
process.start()
