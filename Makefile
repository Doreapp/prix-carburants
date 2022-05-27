PROJECT_NAME=prixcarburants
PYTHON=python3
LINE_LENGTH=100

all: format lint

clean: # Removed all generated files
	@rm -rf *.dist-info *.egg-info
	@rm -rf ${PROJECT_NAME}/__pycache__ ${PROJECT_NAME}/*.pyc ${PROJECT_NAME}/*.pyo


format: # Run isort and black to format code
	@${PYTHON} -m isort --line-length ${LINE_LENGTH} --profile black ${PROJECT_NAME} .
	@${PYTHON} -m black --line-length ${LINE_LENGTH} ${PROJECT_NAME}/* *.py

lint: # Check code with isort, black and pylint to identify any problem
	${PYTHON} -m isort --line-length ${LINE_LENGTH} --profile black --check ${PROJECT_NAME} .
	${PYTHON} -m black --line-length ${LINE_LENGTH} --check ${PROJECT_NAME}/* *.py
	${PYTHON} -m pylint ${PROJECT_NAME}/*

update-data: # Update the data stored in `data` folder
	$(eval DATE := $(shell date --date="yesterday" +%Y%m%d))
	rm -rf data
	@echo "> Downloading raw data"
	${PYTHON} -m prixcarburants download day -o data
	@echo "> Transforming it in JSON format"
	${PYTHON} -m prixcarburants transform \
		data/*${DATE}.xml \
		-o data/${DATE}.json
	rm -rf data/*.xml
