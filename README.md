# Prix carburants

Contains:
- A python module to fetch fuel prices.
- A *Github-pages* website to display data about fuel prices.

It uses french open data. See https://www.prix-carburants.gouv.fr/rubrique/opendata/ for details.

## Installation

### Python module

The python module is in [`prixcarburants`](prixcarburants/) directory.

1. **(Optional) Virtual environment**

We recommend using a python virtual environment. Here are instructions for Linux users:

```bash
virtualenv venv
source venv/bin/activate
```

2. **Download dependencies**

```bash
pip install -r requirements.txt
```

3. **Help on usage**

```bash
# Global help
python3 -m prixcarburants -h
# Command-specific help
python3 -m prixcarburants <command> -h
```

4. **Usage example**

   1. Download today's data about fuel prices, into `data` directory

       ```bash
       $ python3 -m prixcarburants download day -o data
       data/PrixCarburants_quotidien_20220525.xml
       ```

   2. Transform it in a `json` file

       ```bash
       $ python3 -m prixcarburants transform data/PrixCarburants_quotidien_20220525.xml
       data/PrixCarburants_quotidien_20220525.json
       ```

   3. *Result* : `cat data/PrixCarburants_quotidien_20220525.json`


### Jekyll website (Github pages)

1. Follow [installation guide in dedicated README](docs/Github_pages.md#installation).

2. **Serve the website locally**:

    ```
    make serve
    ```

## Github-pages website

The sources about GitHub-pages website are under [`gh-pages`](gh-pages/) directory.

The actual sources used are in `gh-pages` branch.

## Data

Up-to-date data in stored in `data` branch of this repository and updated frequently.
