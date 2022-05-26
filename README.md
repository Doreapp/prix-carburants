# Prix carburants

Fetches french fuel prices

It uses french open data. See https://www.prix-carburants.gouv.fr/rubrique/opendata/ for details.

## Installation

### (Optional) Virtual environment

We recommend using a python virtual environment :

```bash
virtualenv venv
source venv/bin/activate
```

### Dependencies

```bash
pip install -r requirements.txt
```

## Usage

### Help on usage

```bash
python3 -m prixcarburants -h
```

**Command help**:

```bash
python3 -m prixcarburants <command> -h
```

### Usage example

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
