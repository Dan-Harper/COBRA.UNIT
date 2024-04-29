Development
===========

The following command will take the output directory as input, it will
then run the scrapers and write the output in a csv file with the name YYYY-MM-DD.csv

	python3 mono-scraper.py  --output /tmp

Docker
======

Building the image and running the container:

	docker build -t ticker_scraper .
	docker run -v .:/tmp ticker_scraper

Cron
====

To schedule the container, run "crontab -e" and use the following line:

	* * * * * docker run -v /home/user/COBRA.UNIT/:/tmp ticker_scraper

Adjust the schedule as needed.
