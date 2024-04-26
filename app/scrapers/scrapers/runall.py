import scrapy
import os, sys
script_dir = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(script_dir)
#print(script_dir)
#print(parent_dir)
sys.path.append(script_dir)
sys.path.append(parent_dir)

from scrapy.utils.reactor import install_reactor
install_reactor('twisted.internet.asyncioreactor.AsyncioSelectorReactor')
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.utils.log import configure_logging
from scrapy.utils.project import get_project_settings

from spiders.finviz import FinvizSpider
from spiders.grahamvalue import GrahamvalueSpider
from spiders.wallstreetzen import WallstreetzenSpider

configure_logging()
settings = get_project_settings()

settings['FEEDS'] = {
    "output.csv": {
        "format": "csv",
        "overwrite": False,
        'item_export_kwargs': {
            'include_headers_line': False,
        },        
    },    
}

runner = CrawlerRunner(settings)
runner.crawl(FinvizSpider)
runner.crawl(GrahamvalueSpider)
runner.crawl(WallstreetzenSpider)
d = runner.join()
d.addBoth(lambda _: reactor.stop())
reactor.run()
