import scrapy
from lxml.html.soupparser import convert_tree
from lxml import etree
import lxml.html
from urllib.parse import urljoin
import bs4

class Wallstreetzen(scrapy.Spider):
    name = "wallstreetzen"
    allowed_domains = ["wallstreetzen.com"]
    start_urls = ["https://www.wallstreetzen.com/stock-screener/?t=1&p=1&f%5Bmc%5D=%2C300000000&f%5Bzv%5D=80%2C&f%5Broe%5D=0.01%2C&f%5Broa%5D=0.01%2C&f%5Broic%5D=0.01%2C&f%5Bgm%5D=0.1%2C&f%5Bpm%5D=0.1%2C&s=mc&sd=desc"]

    def convert_table_to_csv(self, response):
        root = lxml.html.fromstring(response.text)[0]
        table = root.xpath('//table[contains(@class,"MuiTable-root")]')[0]

        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if len(tds) == 0: continue
            row = [ td.text_content() for td in tds]
            ticker = row[0]
            print(ticker)

    def parse(self, response):
        self.convert_table_to_csv(response)
