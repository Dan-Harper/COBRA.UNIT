import scrapy
from lxml import html
from urllib.parse import urljoin
import bs4

class FinvizSpider(scrapy.Spider):
    name = "finviz"
    allowed_domains = ["finviz.com"]
    start_urls = ["https://finviz.com/screener.ashx?v=111&f=cap_microunder,fa_debteq_u0.5,fa_grossmargin_o15,fa_roa_o15,fa_roe_o10&ft=2"]

    def convert_table_to_csv(self, response):
        soup = bs4.BeautifulSoup(response.text, 'lxml')
        table = soup.find(id="screener-table")

        # skip header and empty row, we only want the data
        rows = table.find_all('tr')[2:]
        for tr in rows:
            row = [td.text for td in tr('td')]
            ticker = row[1]
            print(ticker)

    def parse(self, response):
        xpath_next_url = '//*[@id="screener_pagination"]//a[last()]'
        next_link = response.xpath(xpath_next_url)

        if len(next_link) == 1:
            if 'href' in next_link[0].attrib:
                absolute_url = urljoin(response.url, next_link[0].attrib['href'])
                self.convert_table_to_csv(response)
                yield scrapy.Request(url=absolute_url)
