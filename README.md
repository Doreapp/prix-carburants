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

### Download example

Example on how to download today's data about fuel prices:

```bash
python3 -m prixcarburants download day
```
