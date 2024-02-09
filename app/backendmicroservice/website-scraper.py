import scrapy
import csv

class FinvizSpider(scrapy.Spider):
    name = "finviz"
    tickers = []

    def start_requests(self):
        urls = [
            "https://finviz.com/screener.ashx?v=111&f=cap_microunder,fa_debteq_u0.5,fa_grossmargin_o15,fa_roa_o15,fa_roe_o10&ft=2",
            "https://finviz.com/screener.ashx?v=111&f=cap_microunder,fa_debteq_u0.5,fa_grossmargin_o15,fa_roa_o15,fa_roe_o10&ft=2&r=21"
        ]
        for url in urls:
            yield scrapy.Request(url, self.parse)

    def parse(self, response):
        for i in range(1, 31):
            ticker_xpath = f'/html/body/div[2]/table/tbody/tr[4]/td/div/table/tbody/tr[5]/td/table/tbody/tr/td/table/tbody/tr[{i}]/td[2]/a'
            ticker = response.xpath(ticker_xpath + '/text()').get()
            if ticker:
                self.tickers.append(ticker)

    def closed(self, reason):
        with open('tickers.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(self.tickers)
