# Fund Transfer App

A small full-stack simulation of money transfers between bank accounts. It consists of a **.NET 8 Web API** backed by **Microsoft SQL Server**, and a **React (Vite)** frontend. Transfers are validated server-side, executed atomically inside a database transaction, and recorded in a transaction history.

## What the app does

- Shows a list of accounts with their current balances (three accounts are seeded automatically on first startup).
- Lets you transfer an amount from one account to another via a simple form.
- Validates every transfer on the server:
  - the amount must be greater than zero,
  - sender and recipient must be different accounts,
  - both accounts must exist,
  - the sender must have sufficient funds — **a balance can never go below zero**.
- Executes the debit and credit atomically in a single database transaction (either both happen or neither does).
- Records transfer attempts in the `Transactions` table — every executed transfer and every insufficient-funds rejection — and shows the history, newest first, with a success/failure status and message. (Requests rejected up front — non-positive amount, same account, unknown account — are refused with an error message before reaching the ledger.)

## Architecture

```
┌──────────────┐   HTTP (browser)   ┌──────────────────┐    EF Core / TDS    ┌─────────────────┐
│  web         │ ─────────────────► │  api             │ ──────────────────► │  sqlserver      │
│  React + Vite│    localhost:8080  │  .NET 8 Web API  │   sqlserver:1433    │  SQL Server 2022│
│  nginx :3000 │                    │  Kestrel :8080   │  (compose network)  │  (container)    │
└──────────────┘                    └──────────────────┘                     └─────────────────┘
```

- **API** (`FundTransfer.Api`): ASP.NET Core 8, EF Core 8. On startup it creates the database schema (`EnsureCreated`) and seeds three accounts, so no migrations or SQL scripts need to be run manually. Transfers are handled by `TransferService` inside an explicit DB transaction.
- **Frontend** (`fundtransfer-web`): React 18 + Vite. Three views on one page — accounts, transfer form, transaction history. The API base URL is read from the `VITE_API_URL` environment variable at build time, falling back to `http://localhost:5137` for local development.
- **Database**: SQL Server 2022 in a container. Data is persisted in a named Docker volume (`sqlserver-data`).

### API endpoints

| Method | Route               | Description                                        |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/api/accounts`     | All accounts with current balances                 |
| GET    | `/api/transactions` | All transfer attempts, newest first                |
| POST   | `/api/transfers`    | Execute a transfer; body `{ fromAccountId, toAccountId, amount }` |

`POST /api/transfers` always returns `{ "success": bool, "message": string }` with an HTTP status describing the outcome: `200` success, `400` invalid request (non-positive amount, same account), `404` unknown account, `422` insufficient funds, `500` unexpected error.

### Seeded accounts

| ID | Owner          | Starting balance |
| -- | -------------- | ---------------- |
| 1  | Alice Johnson  | 1000.00          |
| 2  | Bob Smith      | 500.00           |
| 3  | Charlie Brown  | 250.00           |

## Prerequisites

- **Docker Desktop** (with Docker Compose v2 — the `docker compose` command). That's all you need to run the app.
- Only for running outside Docker: .NET 8 SDK, Node.js 18+, and a reachable SQL Server instance.

## Running with Docker (recommended)

From the repository root:

```bash
docker compose up --build
```

That single command, with zero manual configuration:

1. starts SQL Server 2022 and waits until it passes a health check,
2. builds and starts the API (its connection string is overridden by an environment variable in `docker-compose.yml` to point at the `sqlserver` service), which then creates the schema and seeds the accounts automatically,
3. builds the frontend (with the API URL baked in) and serves it with nginx.

Then open:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8080/api/accounts
- **Swagger UI:** http://localhost:8080/swagger

The first startup takes a few minutes (image pulls + SQL Server initialization). Stop everything with `Ctrl+C` or `docker compose down`; add `-v` to also delete the database volume and start fresh next time.

## Testing the transfer scenarios

### In the UI (http://localhost:3000)

1. **Successful transfer** — From: `#1 — Alice Johnson`, To: `#2 — Bob Smith`, Amount: `100`. A green message appears ("Transferred 100.00 from account 1 to account 2."), the balances update, and a `Success` row appears at the top of the history.
2. **Insufficient funds** — From: `#3 — Charlie Brown`, To: `#1`, Amount: `99999`. A red message appears ("Account 3 has insufficient funds for this transfer."), balances are unchanged, and a `Failed` row is logged in the history.
3. **Negative amount** — Any accounts, Amount: `-50`. Red message: "Transfer amount must be greater than zero." (Rejected before execution, so no history row is created.)
4. **Same account** — From and To set to the same account. Red message: "Sender and recipient must be different accounts." (Also rejected before execution.)

### Invalid account (not reachable via the UI dropdowns)

The dropdowns only offer existing accounts, so use the API directly (or Swagger UI):

```bash
curl -i -X POST http://localhost:8080/api/transfers \
  -H "Content-Type: application/json" \
  -d '{"fromAccountId": 1, "toAccountId": 999, "amount": 10}'
```

Expected: `404 Not Found` with `{"success":false,"message":"One or both accounts do not exist."}`.

The other scenarios via curl, if you prefer:

```bash
# success (200)
curl -i -X POST http://localhost:8080/api/transfers -H "Content-Type: application/json" -d '{"fromAccountId":1,"toAccountId":2,"amount":100}'

# insufficient funds (422)
curl -i -X POST http://localhost:8080/api/transfers -H "Content-Type: application/json" -d '{"fromAccountId":3,"toAccountId":1,"amount":99999}'

# negative amount (400)
curl -i -X POST http://localhost:8080/api/transfers -H "Content-Type: application/json" -d '{"fromAccountId":1,"toAccountId":2,"amount":-50}'
```

The successful transfer and the insufficient-funds rejection show up in the history at http://localhost:3000 and via `GET http://localhost:8080/api/transactions`; the invalid-account and negative-amount requests are refused before anything is written.

## Running locally without Docker (development)

1. Start a SQL Server reachable at `localhost:1433` with the credentials from `FundTransfer.Api/appsettings.json`, e.g.:
   ```bash
   docker run -d --name sqlserver-dev -e ACCEPT_EULA=Y -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
   ```
2. Run the API: `dotnet run --project FundTransfer.Api` (listens on http://localhost:5137).
3. Run the frontend: `cd fundtransfer-web && npm install && npm run dev` (http://localhost:5173). It falls back to `http://localhost:5137` as the API URL; set `VITE_API_URL` to override.

## Project structure

```
FundTransferApp/
├── docker-compose.yml          # sqlserver + api + web, one-command startup
├── README.md
├── FundTransfer.Api/           # .NET 8 Web API
│   ├── Dockerfile              # multi-stage: sdk build → aspnet runtime
│   ├── Program.cs              # DI, CORS, DB init on startup
│   ├── AppDbContext.cs
│   ├── Controllers/            # AccountsController, TransactionsController, TransfersController
│   ├── Services/               # TransferService: validation + atomic transfer + logging
│   ├── Models/                 # Account, TransferTransaction
│   ├── DTOs/                   # TransferRequest
│   └── Data/                   # DbInitializer: EnsureCreated + seed data
└── fundtransfer-web/           # React + Vite frontend
    ├── Dockerfile              # node build (VITE_API_URL build arg) → nginx
    ├── nginx.conf
    └── src/
        ├── App.jsx             # state management: accounts, history, transfer result
        ├── api.js              # API client, VITE_API_URL with localhost fallback
        └── components/         # AccountsList, TransferForm, TransactionHistory
```
