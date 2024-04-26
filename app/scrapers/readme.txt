usage
=====

running all, with merged output:

	rm output.csv ; python3 scrapers/runall.py ; cat output.csv | wc -l

running individually:

	scrapy crawl finviz -o output.csv
	scrapy crawl wallstreetzen -o output.csv
	scrapy crawl grahamvalue -o output.csv

