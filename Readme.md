# Hong Kong Jockey Club Odd Scraping

Get the odds from the Hong Kong Jockey Club website.

Store the odds in a database. SurrealDB is used for the database.

Frontend is built on qwik. Backend is built on Nestjs. 

## API

check /api

## Start server

### DB, backend and frontend

```
bash
surreal start --log info --user root --pass pass
cd backend && nest start
cd frontend && npm run dev
```

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
cd backend && pm2 start --name backend nest -- start
cd frontend && pm2 start npm -- run dev
```

#### Stop

```bash
pm2 delete all
```

stop only

* pm2 stop all

### Installation

```bash
npm install
```

or 

```bash
pnpm install
```

SurrealDB:

```bash
curl -sSf https://install.surrealdb.com | sh
```
docker run --rm -p 8000:8000 surrealdb/surrealdb:latest start

### sureraldb

start server : surreal start --log info --user root --pass pass [path]

[path] default to be memory, can be set to a subdirectory, for example "file://hkjc"

connection: surreal sql --conn http://localhost:8000 --user root --pass pass --ns hkjc --db wpodds

export : surreal export --conn http://localhost:8000 --user root --pass pass --ns hkjc --db wpodds export.sql

### cli notification (deprecated)

Monitor Sudden Odds Changes

```bash
node notification.js
```

arg:
--lang [eng|chi] default eng

### cli data collection (deprecated)

```bash
node main.js
```

### Issue

- [ ] WP odd crashes and stop updating on some shells

### To Do

- [ ] Frontend: useWatch and refresh odd feed

- [ ] Data Structure Optimization

- [ ] Auto betting integration

- [ ] Logger