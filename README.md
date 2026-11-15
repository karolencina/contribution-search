# Contribution Search

A small full-stack app to browse and search contributions: a FastAPI backend (`api/`) and a
Next.js frontend (`web/`).

> **TODO-DELETE** this note before submitting. The README grows with the build. Only what has
> been built and run is described. Sections marked `TODO-WRITE` are still to do. Find them with
> `grep -rn "TODO[-]" .`

## Status

| Part                                                                     | State         |
| ------------------------------------------------------------------------ | ------------- |
| Backend: search by title or owner (case-insensitive, literal)            | Built, tested |
| Backend: sorting (`startTime`, then `id`) and UTC output                 | Built, tested |
| Backend: pagination, `page` / `pageSize` validation                      | Not built yet |
| Backend: loading `api/contributions.json`                                | Not built yet |
| Frontend (`web/`)                                                        | Not started   |

## Requirements

- Python 3.14 (`api/pyproject.toml` requires `>=3.14`)
- Node.js: TODO-WRITE (once `web/` exists)

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

The app starts with no data for now, so every search returns an empty list.

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

Try it once the server is running (the list is empty until the data is loaded):

```bash
curl "http://127.0.0.1:8000/contributions?q=api"
```

## Frontend (`web/`)

TODO-WRITE: how to install, run, test and build, once the frontend exists.

## Verify manually

TODO-WRITE: the manual checks (keyboard-only, 320px wide, 200% zoom, and the browsers actually
tried), once the frontend exists.

## More documents

- [DECISIONS.md](DECISIONS.md): key decisions, trade-offs, limitations
- [WORKING-AGREEMENT.md](WORKING-AGREEMENT.md): the rules for the work, including AI-assisted work
- [AI-WORKFLOW.md](AI-WORKFLOW.md): what was delegated to AI tools and what was checked
- [docs/TEST-PLAN.md](docs/TEST-PLAN.md): the test list
