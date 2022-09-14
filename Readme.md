# Hong Kong Jockey Club Odd Scraping

Get the odds from the Hong Kong Jockey Club website.

Store the odds in a database. SurrealDB is used for the database.

## Usage

### Install

```bash
npm install
```

SurrealDB

```bash
curl -sSf https://install.surrealdb.com | sh
```
docker run --rm -p 8000:8000 surrealdb/surrealdb:latest start

### sureraldb

start server : surreal start --log info --user root --pass pass [path]

[path] default to be memory, can be set to a subdirectory, for example "file://hkjc"

connection: surreal sql --conn http://localhost:8000 --user root --pass pass --ns hkjc --db odds

export : surreal export --conn http://localhost:8000 --user root --pass pass --ns hkjc --db odds export.sql

### Run

Monitor Sudden Odds Changes

```bash
node notification.js
```

arg:
--lang [eng|chi] default eng

For data collection

```bash
node main.js
```

### To Do

- [X] Auto switch race numbers

- [X] Replace example data with real response

- [ ] Aggregate all changes in output

- [X] Database test for storing win and place odds (main.js)

- [ ] Refine database (main.js)

- [ ] Docker and process management

- [ ] Auto betting