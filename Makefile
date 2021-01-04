.PHONY: scrappers

scrappers:
	source ~/.envs/dentshop/bin/activate && \
	python scrappers/exprodental.py && \
	python scrappers/biotech.py && \
	python scrappers/dental-laval.py && \
	python scrappers/mayordent.py
