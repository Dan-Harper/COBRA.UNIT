FROM python:3.11.9-slim-bookworm
WORKDIR /
COPY requirements.txt .
COPY mono-scraper.py .
RUN pip install -r requirements.txt
CMD /usr/local/bin/python3 mono-scraper.py --output /tmp
