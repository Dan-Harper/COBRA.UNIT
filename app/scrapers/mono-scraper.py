#
# minimal monolithic spider
#
import argparse
import os
import csv
from datetime import datetime
import requests
import re
from lxml import etree
from lxml.html.soupparser import convert_tree
import lxml.html
from urllib.parse import urljoin
from dataclasses import dataclass
import sys

@dataclass
class TickerItem:
    ticker_code: str
    source: str

    def serialize(self):
        return [self.ticker_code, self.source]

class Spider:
    crawl_queue = None
    collected = None

    def __init__(self):
        self.crawl_queue = []
        self.collected = []

    def get(self, url):
        h = headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        r = requests.get(url, headers=h)
        root = lxml.html.fromstring(r.content)
        return root

    def run(self):
        seen = {}
        while len(self.crawl_queue) > 0:
            url = self.crawl_queue.pop()
            if url in seen:
                continue
            self.process(url)
            seen[url] = 1

    def process(self, url):
        pass

class GrahamvalueSpider(Spider):
    name = "grahamvalue"
    def __init__(self):
        super(GrahamvalueSpider, self).__init__()
        url = "https://www.grahamvalue.com/screener?field_grahamnumber_value=1.3&field_ncav_net_net__value=0&keys=&field_issuetype_value%5B0%5D=3&field_exchange_value%5B0%5D=US&order=field_grahamnumber&sort=desc"        
        self.crawl_queue.append(url)
        for n in range(1,9):
            self.crawl_queue.append(url + "&page={0}".format(n))

    def process(self, url):
        root = self.get(url)
        table = root.xpath('//table[contains(@class,"views-table")]')[0]

        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if len(tds) == 0: continue
            row = [ td.text_content().strip() for td in tds]
            m = re.match('^.*\((.*?)\)$',row[1])
            last_updated = row[5]
            ticker = m.groups()[0]
            if not re.match('^.*(minute|hour|day).*$',last_updated):
                continue
            print(row)
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))

class FinvizSpider(Spider):
    name = "finviz"
    
    def __init__(self):
        super(FinvizSpider, self).__init__()
        url = "https://finviz.com/screener.ashx?v=111&f=cap_microunder,fa_debteq_u0.5,fa_grossmargin_o15,fa_roa_o15,fa_roe_o10&ft=2"
        self.crawl_queue.append(url)

    def process(self, url):
        root = self.get(url)
        # print(root)
        # print(etree.tostring(root))
        table = root.xpath("//tr[@id='screener-table']/td/table")[0]
        n = 0
        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if len(tds) == 0: continue
            n += 1
            if n == 1: continue
            row = [ td.text_content() for td in tds]
            ticker = row[1]
            print(row)
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))


class WallstreetzenSpider(Spider):
    name = "wallstreetzen"

    def __init__(self):
        super(WallstreetzenSpider, self).__init__()
        url = "https://www.wallstreetzen.com/stock-screener/?t=1&p=1&f%5Bmc%5D=%2C300000000&f%5Bzv%5D=80%2C&f%5Broe%5D=0.01%2C&f%5Broa%5D=0.01%2C&f%5Broic%5D=0.01%2C&f%5Bgm%5D=0.1%2C&f%5Bpm%5D=0.1%2C&s=mc&sd=desc"
        self.crawl_queue.append(url)

    def process(self, url):
        root = self.get(url)
        table = root.xpath('//table[contains(@class,"MuiTable-root")]')[0]

        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if len(tds) == 0: continue
            row = [ td.text_content() for td in tds]
            ticker = row[0]
            print(row)
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))

def valid_dir(outputdir):
    if not os.path.isdir(outputdir):
        raise argparse.ArgumentTypeError('[ERROR] input directory does not exist')
    return outputdir

if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser(description='operator script for femtocrawl')
    arg_parser.add_argument('--output' ,dest='output', action='store', type=valid_dir, required=True, help='output directory')
    args = arg_parser.parse_args()

    all_collected = []
    for cname in [GrahamvalueSpider, FinvizSpider, WallstreetzenSpider]:
    #for cname in [FinvizSpider,]:
        c = cname()
        c.run()
        all_collected += c.collected

    out_file = os.path.join(args.output, datetime.today().strftime('%Y-%m-%d.csv') )
    print("[LOG] Writing to file {0}".format(out_file), file=sys.stderr)
    with open(out_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
        for tickeritem in all_collected:
            writer.writerow(tickeritem.serialize())

