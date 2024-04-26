import scrapy
from lxml.html.soupparser import convert_tree
from lxml import etree
import lxml.html
from urllib.parse import urljoin
import bs4
import re

class GrahamvalueSpider(scrapy.Spider):
    name = "grahamvalue"
    allowed_domains = ["grahamvalue.com"]
    start_urls = []

    def __init__(self):
        url = "https://www.grahamvalue.com/screener?field_grahamnumber_value=1.3&field_ncav_net_net__value=0&keys=&field_issuetype_value%5B0%5D=3&field_exchange_value%5B0%5D=US&order=field_grahamnumber&sort=desc"
        
        self.start_urls.append(url)
        for n in range(1,9):
            self.start_urls.append(url + "&page={0}".format(n))

    def convert_table_to_csv(self, response):
        root = lxml.html.fromstring(response.text)[0]
        table = root.xpath('//table[contains(@class,"views-table")]')[0]

        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if len(tds) == 0: continue
            row = [ td.text_content().strip() for td in tds]
            m = re.match('^.*\((.*?)\)$',row[1])
            ticker = m.groups()[0]

    def parse(self, response):
        self.convert_table_to_csv(response)
