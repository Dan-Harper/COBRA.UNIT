import scrapy

from dataclasses import dataclass
@dataclass
class TickerItem:
    ticker_code: str
    source: str