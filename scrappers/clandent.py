import json
import re
import scrapy
from scrapy.http import Request
from scrapy.crawler import CrawlerProcess
from utils.connection import make_mongo_conn


class Clandent(scrapy.Spider):
    name = 'clandent'

    with open('./scrappers/inputs/clandent.json', 'r') as file:
        start_urls = json.load(file)

    def parse(self, response):
        self.connection = make_mongo_conn()
        item = response.css('figure > a[href]::attr(href)').getall()

        for link in item:
            yield Request(link, callback=self._parse_detail)

    # https://www.clandent.cl/productos/operatoria-y-estetica/pulido/maquira/pasta-pulido-diamond-universal-2gr/
    # https://www.clandent.cl/productos/operatoria-y-estetica/pulido/microdont/goma-pulido-amalgama-llama-diferentes-colores/


    # def _parse_detail(self, response):
    #     product_title = response.css('.contenido-right > h1::text').get()
    #     normal_price = self._get_number(response.css('.valor > .precio::text').get())
    #     stock = self._get_number(response.css('.stock.in-stock::text').get())
    #     internet_price = self._get_number(response.css('.woocommerce-Price-amount.amount > bdi::text').get())
    #     sku = response.css('.sku_wrapper > .sku::text').get()
    #     category = response.css('.posted_in > a::text').getall()
    #     image = response.css('.wp-post-image.thb-ignore-lazyload::attr(src)').get()
    #     del category[0]

    #     output = {
    #         'title': product_title,
    #         'internetPrice': int(internet_price, 10),
    #         'normalPrice': int(normal_price, 10),
    #         'stock': int(stock, 10),
    #         'sku': sku,
    #         'category': category,
    #         'image': image,
    #         'referUrl': response.url
    #     }

    #     self.connection.dentshop.mayordent.insert_one(output)


    # def _get_number(self, text):
    #     result = re.sub(r'\D*', '', text)
    #     return 0 if result == '' else result

process = CrawlerProcess(settings={})
process.crawl(Clandent)
process.start()
