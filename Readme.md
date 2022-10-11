# Hong Kong Jockey Club Odd Scraping

Get the odds from the Hong Kong Jockey Club website.

Store the odds in a database. SurrealDB is used for the database.

## API

check /api

## Start server

### using pm2

```bash
npm install pm2 -g
```

or 

```bash
pnpm install pm2 -g
```

```bash
pm2 start surreal -- start --log info --user root --pass pass
pm2 start backend/dist/main.js --name backend
```

#### stop

```bash
pm2 delete all
```


### Install

```bash
npm install
```

SurrealDB

```bash
curl -sSf https://install.surrealdb.com | sh
```
docker run --rm -p 8000:8000 surrealdb/surrealdb:latest start

```

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

## Frontend

###

```bash
cd frontend
npm run dev
````

### To Do

- [ ] Frontend

- [ ] Auto betting integration
