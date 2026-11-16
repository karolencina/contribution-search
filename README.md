# Contribution Search

A small full-stack app to browse and search contributions: a FastAPI backend (`api/`) and a
Next.js frontend (`web/`).

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

`requirements-dev.txt` adds the test and check tools to `requirements.txt`.

### Run

```bash
uvicorn app.main:app --reload
```

The server listens on `http://127.0.0.1:8000` and loads the 40 sample records from
`api/contributions.json` when it starts. Interactive docs are at `/docs` (they load scripts from
a public CDN, so they need an internet connection).

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
If port 3000 is already in use, Next.js moves to 3001 and the CORS rule blocks the page, which then shows only a generic error: free port 3000 first.
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

The automated checks do not cover the browser. Start the API and the frontend (see above), open
**http://localhost:3000** and check:

- **Loading state.** The local API answers too fast to see it. In the browser's developer tools,
  throttle the network to Slow 3G and reload: the page shows "Loading contributions".
- **Empty and error states.** Search for `zzz`: the page says no contributions match it. Stop the
  API and search again: an error message appears. Restart the API and change the search text to
  recover.
- **Rapid input.** With Slow 3G on, type `rep`, replace it with `sarah`, clear it, and click Next
  while it loads: the list always matches the search box.
- **Keyboard only.** Tab reaches the search box, then the clear button (once there is text), then
  Previous page and Next page when they are shown. Each shows a visible focus ring, and Previous
  and Next work with Enter and Space.
- **320px wide and 200% zoom.** Use the browser's responsive mode at 320px wide, then zoom to
  200%: no sideways scrolling, nothing cut off, and long titles end in an ellipsis.
- **Screen reader.** With VoiceOver or another: a search announces the count or
  that nothing matches, changing page announces the new page (for example "2 of 3"), and the error
  message is announced.
- **Browsers.** Repeat the checks above in Chrome, Firefox and Safari.

## More documents

- [DECISIONS.md](DECISIONS.md): key decisions, trade-offs, limitations
- [WORKING-AGREEMENT.md](WORKING-AGREEMENT.md): the rules for the work, including AI-assisted work
- [AI-WORKFLOW.md](AI-WORKFLOW.md): what was delegated to AI tools and what was checked
