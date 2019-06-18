# Name of recipe

## Requirements
* Python 3 (TODO: Make this run with Python 2.7)
* [Configured .env file](../README.md)


## How to run

1. Create and activate a new virtual environment

```
python3 -m venv /path/to/new/virtual/environment
source /path/to/new/virtual/environment/venv/bin/activate
```
2. Install dependencies

```
pip install requirements.txt
```

3. Export and run the server locally

```
export FLASK_APP=server.py
python3 -m flask run
```