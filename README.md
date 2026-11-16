# Contribution Search

A small full-stack app to browse and search contributions: a FastAPI backend (`api/`) and a
Next.js frontend (`web/`).

> **TODO-DELETE** this note before submitting. The README grows with the build. Only what has
> been built and run is described. Sections marked `TODO-WRITE` are still to do. Find them with
> `grep -rn "TODO[-]" .`

## Status

| Part                                                          | State                         |
| ------------------------------------------------------------- | ----------------------------- |
| Backend: search by title or owner (case-insensitive, literal) | Built, tested                 |
| Backend: sorting (`startTime`, then `id`) and UTC output      | Built, tested                 |
| Backend: pagination, `page` / `pageSize` validation           | Built, tested                 |
| Backend: loading `api/contributions.json`                     | Built, tested                 |
| Frontend: first load, search box, debounce                    | Built, tested                 |
| Frontend: stale responses, loading and error states           | Built, tested                 |
| Frontend: paging and the empty state                          | Built, tested                 |
| Frontend: layout, colours, readable UTC dates                 | Built, checked in Chrome only |

## Requirements

- Python 3.14 or newer (set in `api/pyproject.toml`; tested on 3.14.x)
- Node.js ^22.22.2, ^24.15.0 or ≥26 (set in `web/package.json` `engines`; tested on 26.0.0)

## Backend (`api/`)

### Set up

From the repository root:

```bash
cd api
python3.14 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

`requirements.txt` has what the app needs to run. `requirements-dev.txt` adds the test and
check tools, and includes the first file.

### Run

```bash
uvicorn app.main:app --reload
```

The server listens on `http://127.0.0.1:8000`. Interactive docs are at `/docs`, a read-only view
at `/redoc`, and the schema at `/openapi.json`. The docs page loads its scripts from a public
CDN, so it needs an internet connection.

The app loads the 40 sample records from `api/contributions.json` when it starts.

### Test and check

Run these from `api/`, inside the virtualenv:

| Purpose               | Command                 |
| --------------------- | ----------------------- |
| Tests                 | `pytest`                |
| Format                | `ruff format --check .` |
| Lint                  | `ruff check .`          |
| Types                 | `mypy .`                |
| Known vulnerabilities | `pip-audit`             |

To fix formatting and simple lint problems, run `ruff format .` and `ruff check --fix .`.

### API

`GET /contributions` searches contributions by title or owner. The full contract, with every
rule, error and example, is in [api/docs/API-CONTRACT.md](api/docs/API-CONTRACT.md).

Try it once the server is running:

```bash
curl "http://127.0.0.1:8000/contributions?q=api"
```

## Frontend (`web/`)

From the repository root:

```bash
cd web
npm ci
npm run dev
```

Open **http://localhost:3000**. Use `localhost`, not `127.0.0.1`: the API only accepts requests
from the origin `http://localhost:3000` (CORS), so the list would not load from another address.
The page calls the API at `http://127.0.0.1:8000`, so start the backend first (see above).

Run these from `web/`:

| Purpose               | Command                |
| --------------------- | ---------------------- |
| Tests                 | `npm run test`         |
| Format                | `npm run format:check` |
| Lint                  | `npm run lint`         |
| Types                 | `npm run typecheck`    |
| Build                 | `npm run build`        |
| Known vulnerabilities | `npm audit --omit=dev` |

To fix formatting and simple lint problems, run `npm run format` and `npm run lint:fix`.

## Verify manually

TODO-WRITE: the manual checks (keyboard-only, 320px wide, 200% zoom, and the browsers actually
tried), once the frontend exists.

## More documents

- [DECISIONS.md](DECISIONS.md): key decisions, trade-offs, limitations
- [WORKING-AGREEMENT.md](WORKING-AGREEMENT.md): the rules for the work, including AI-assisted work
- [AI-WORKFLOW.md](AI-WORKFLOW.md): what was delegated to AI tools and what was checked
- [docs/TEST-PLAN.md](docs/TEST-PLAN.md): the test list
