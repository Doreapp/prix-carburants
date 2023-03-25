PROJECT_NAME=prixcarburants
PYTHON=python3
LINE_LENGTH=100
GITHUB_PAGES_DIR=gh-pages
ESLINT=cd ${GITHUB_PAGES_DIR} && npx eslint
PRETTIER=cd ${GITHUB_PAGES_DIR} && npx prettier

all: py_format py_lint js_format js_lint

clean: # Removed all generated files
	@rm -rf *.dist-info *.egg-info
	@rm -rf ${PROJECT_NAME}/__pycache__ ${PROJECT_NAME}/*.pyc ${PROJECT_NAME}/*.pyo


py_format: # Run isort and black to format Python code
	@${PYTHON} -m isort --line-length ${LINE_LENGTH} --profile black ${PROJECT_NAME} .
	@${PYTHON} -m black --line-length ${LINE_LENGTH} ${PROJECT_NAME}/* *.py

py_lint: # Check Python code with isort, black and pylint to identify any problem
	${PYTHON} -m isort --line-length ${LINE_LENGTH} --profile black --check ${PROJECT_NAME} .
	${PYTHON} -m black --line-length ${LINE_LENGTH} --check ${PROJECT_NAME}/* *.py
	${PYTHON} -m pylint ${PROJECT_NAME}/*

js_setup: # Setup dependencies for JS code
	mkdir -p ${GITHUB_PAGES_DIR}/assets/javascript/vendor/
	mkdir -p ${GITHUB_PAGES_DIR}/assets/css/vendor/
	cd ${GITHUB_PAGES_DIR} && \
		curl -X GET https://cdn.plot.ly/plotly-2.18.2.min.js \
		> assets/javascript/vendor/plotly.js

js_format: # Run eslint and prettier to reformat website code
	${ESLINT} assets/javascript/ --fix
	${PRETTIER} --write .

js_lint: # Run eslint and prettier to check website code's lint
	${ESLINT} assets/javascript/
	${PRETTIER} --check .

update-latest-data: # Update the latest data stored in `data` folder
	rm -rf data
	@echo "> Downloading raw data"
	${PYTHON} -m prixcarburants download now -o data
	@echo "> Transforming it in JSON format"
	${PYTHON} -m prixcarburants transform \
		--latest \
		--metrics \
		data/*.xml \
		-o data/latest.json
	rm -rf data/*.xml

serve: # Serve gh-pages for development
	cd ${GITHUB_PAGES_DIR} && \
	bundle exec jekyll serve --livereload
