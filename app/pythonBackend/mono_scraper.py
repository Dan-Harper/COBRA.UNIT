from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
import os
import csv
from dataclasses import dataclass
import re
import requests
import lxml.html

router = APIRouter()


@dataclass
class TickerItem:
    ticker_code: str
    source: str

    def serialize(self):
        return [self.ticker_code, self.source]


class Spider:
    def __init__(self):
        self.crawl_queue = []
        self.collected = []

    def get(self, url):
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        response = requests.get(url, headers=headers)
        root = lxml.html.fromstring(response.content)
        return root

    def run(self):
        seen = {}
        while self.crawl_queue:
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
        super().__init__()
        url = "https://www.grahamvalue.com/screener?field_grahamnumber_value=1.3&field_ncav_net_net__value=0&keys=&field_issuetype_value%5B0%5D=3&field_exchange_value%5B0%5D=US&order=field_grahamnumber&sort=desc"
        self.crawl_queue.append(url)
        for n in range(1, 9):
            self.crawl_queue.append(url + f"&page={n}")

    def process(self, url):
        root = self.get(url)
        table = root.xpath('//table[contains(@class,"views-table")]')[0]
        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if not tds:
                continue
            row = [td.text_content().strip() for td in tds]
            ticker_match = re.match(r'^.*\((.*?)\)$', row[1])
            if not ticker_match:
                continue
            last_updated = row[5]
            ticker = ticker_match.groups()[0]
            if not re.match(r'^.*(minute|hour|day).*$', last_updated):
                continue
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))


class FinvizSpider(Spider):
    name = "finviz"

    def __init__(self):
        super().__init__()
        url = "https://finviz.com/screener.ashx?v=111&f=cap_microunder,fa_debteq_u0.5,fa_grossmargin_o15,fa_roa_o15,fa_roe_o10&ft=2"
        self.crawl_queue.append(url)

    def process(self, url):
        root = self.get(url)
        table = root.xpath("//tr[@id='screener-table']/td/table")[0]
        n = 0
        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if not tds:
                continue
            n += 1
            if n == 1:
                continue
            row = [td.text_content() for td in tds]
            ticker = row[1]
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))


class WallstreetzenSpider(Spider):
    name = "wallstreetzen"

    def __init__(self):
        super().__init__()
        url = "https://www.wallstreetzen.com/stock-screener/?t=1&p=1&f%5Bmc%5D=%2C300000000&f%5Bzv%5D=80%2C&f%5Broe%5D=0.01%2C&f%5Broa%5D=0.01%2C&f%5Broic%5D=0.01%2C&f%5Bgm%5D=0.1%2C&f%5Bpm%5D=0.1%2C&s=mc&sd=desc"
        self.crawl_queue.append(url)

    def process(self, url):
        root = self.get(url)
        table = root.xpath('//table[contains(@class,"MuiTable-root")]')[0]
        for tr in table.xpath('.//tr'):
            tds = tr.xpath('.//td')
            if not tds:
                continue
            row = [td.text_content() for td in tds]
            ticker = row[0]
            self.collected.append(TickerItem(ticker_code=ticker, source=self.name))


@router.post("/scrape", tags=["Scraper"])
def scrape_data():
    """
    Runs the scraper, writes collected data to a CSV file, and returns stock tickers as a comma-separated string.
    """
    try:
        spiders = [GrahamvalueSpider(), FinvizSpider(), WallstreetzenSpider()]
        all_collected = []

        for spider in spiders:
            spider.run()
            all_collected += spider.collected

        # Check if data was collected
        if not all_collected:
            print("[LOG] No data collected by scrapers.")
            return PlainTextResponse("No data collected.", media_type="text/plain")

        # Write data to a CSV file
        output_dir = r"C:\Users\Wanderer\Documents\OSU-GT-STANFORD\COBRA.UNIT\!README\mono-scraper-output"
        os.makedirs(output_dir, exist_ok=True)  # Ensure the directory exists
        file_path = os.path.join(output_dir, "pqrScraper.csv")

        with open(file_path, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["ticker_code", "source"])  # Write headers
            for item in all_collected:
                writer.writerow(item.serialize())

        print(f"[LOG] Data written to {file_path}")

        # Extract tickers to return to the frontend
        tickers = [item.ticker_code for item in all_collected]

        return PlainTextResponse(", ".join(tickers), media_type="text/plain")

    except Exception as e:
        print("[ERROR]", str(e))
        raise HTTPException(status_code=500, detail=str(e))
