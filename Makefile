.PHONY: init scrappers

init: node_modules
	mkdir -p logs/

node_modules:
	npm ci --no-optional
	pip install -r requirements.txt
	chmod +x load_scrapper.sh

scrappers:
	bash load_scrapper.sh expressdent
	bash load_scrapper.sh exprodental
	bash load_scrapper.sh biotech
	bash load_scrapper.sh dentallaval
	bash load_scrapper.sh mayordent
	bash load_scrapper.sh clandent
