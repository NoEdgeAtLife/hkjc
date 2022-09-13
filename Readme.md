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

### Run Version 1

Monitor Sudden Odds Changes

```bash
node notification.js
```

### To Do

- [X] Auto switch race numbers

- [X] Replace example data with real response

- [ ] Aggregate all changes in output

- [ ] Database (main.js)

- [ ] Docker and process management

- [ ] Auto betting