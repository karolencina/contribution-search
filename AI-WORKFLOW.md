# AI-WORKFLOW

I used Claude chat for planning and drafting, and Claude Code for implementation and reviews. A more advanced model at high
effort helped me plan the workflow and the steps; lower-capability agents then implemented them. I wrote the human-only parts
myself: the API contract, the test list, and the scope, restrictions and extra rules of the working agreement. Claude helped me standardise the formats and improve the writing quality, but not the main ideas.

Time: the brief suggests 4–5 hours. I spent about 6 hours over three days. The extra went on the working agreement, relearning Python and design polish.

## What tasks were delegated to AI tools

- **Planning (chat).** I set the order of work and wrote the agreement's rules; the AI improved the wording. It also read Anthropic's docs on token use and drafted the agreement's "Context and Token Use" section, which I then shortened.
- **Code (Claude Code).** It turned my test list into tests, each written first and seen to fail for the right reason, then wrote
  the backend and the frontend in small slices and ran the checks after each. I committed every slice myself.
- **Reviews.** A read-only reviewer agent (it can read and search, not run anything) looked at the backend, the frontend and the
  components. It got the brief, the agreement, the code and a list of attacks, not the history. Its findings were leads, and I had
  the important ones proved by a test before I accepted them.
- **The API contract** I wrote myself. I had never written one, so I used the AI as a teacher and reviewer - it explained the
  format.
- **Python reference.** I had not used Python for a while and could not remember which tools are built in and which need a
  library. The AI helped (for example `casefold()`, `sorted()` with a key and `astimezone()` are standard Python; `AwareDatetime`
  and the request handling come from pydantic and FastAPI), and explained code line by line when I did not follow it. I checked the behaviour with the tests, not the explanation alone.
- **Where I relied on it most:** the pytest code. I wrote the test list and the expected values; the AI wrote the test syntax, which I had not used for a while. I reviewed every test and every line of main.py before committing.

## What decisions you retained

- **API.** A page past the end is 200 with empty items; invalid `page` or `pageSize` is 422, not clamped; `q` is used exactly as
  sent unless it is empty or whitespace-only.
- **Frontend.**
  - Each request gets a number and only the latest may update the page, so a slow old response never overwrites a newer one.
  - Search text and page are not saved in the web address (`?q=api&page=2`), so a reload or shared link starts fresh. I first
    chose the opposite, then reversed it.
  - The 300 ms debounce only saves requests; it does not fix ordering.
  - Paging stays enabled while loading, as the brief asks.
- **No minimum search length.** I wanted 3 characters to save calls. The AI pointed out that it would break the brief's own `.`
  example and that the debounce already covers the cost. I checked and dropped it.
- **Components.** Each has its own styles and test file, and the page has headings, a search landmark and a clear button. I
  simplified them only where it removed code, added one guard for a 200 response with an unexpected body, and dropped the other
  optional work.
- **My agreement worked both ways :)** I wanted to move `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE` and `MAX_PAGE` out of `main.py` into a constants file. The AI pointed to my own DRY and YAGNI rules, so I left them.

## One example of an AI-generated output you corrected or rejected

**A green test run hid a bug that I found by reading.** All checks passed, but the status text flickered between "40 contributions" and "Loading contributions" on every page change. The AI's own tests had asserted the flawed message, so nothing failed. I traced the cause, it wrote a failing test first and fixed it, and I asked for the loading text to wait 200 ms so a fast response shows no flash.

Other smaller examples:

- **Pinned and overlapping tests.** I had them removed and added a check to the reviewer agent.
- **Semantic HTML.** AI used some HTML elements incorrectly (e.g. span which I changed to a heading)

## Which checks and tests you actually executed

- **Backend** (`api/`): `ruff format --check`, `ruff check`, `mypy`, `pytest` (75 tests) and `pip-audit` (no known
  vulnerabilities).
- **Frontend** (`web/`): `npm run format:check`, `lint`, `typecheck`, `test` (83 tests), `build` and `npm audit --omit=dev`
  (0 vulnerabilities).
- **Tests first.** Backend tests for search, sorting and pagination were committed before the code they test (each `test(api)`
  commit precedes its `feat(api)`). The CORS and sample-data tests, and all frontend tests, landed in the same commits as their code.
- **Break it on purpose.** Claude Code made each change at my request, ran the tests, reported which failed and reverted it.
  Backend: six one-line changes: `ge=1` removed, trailing-space trim, whitespace strip,
  regex search, `total` counted after slicing, and sorting without the `id` tiebreaker. Each made 1 to 12 tests fail. Frontend:
  the same for each guard (removing `clearTimeout` fails 1 test; building the URL without encoding fails 5; removing the
  unexpected-body check fails its test).
- **Reviews.** Three read-only reviews (backend, frontend, components). I verified the leads by running tests, not by trusting
  them. The backend review found that the real app served no data (`create_app([])`); no test noticed, because each builds its
  own app. I fixed it tests first: a new test failed with `0 == 40`, then the app was changed to load the sample file.
- **By hand, by me:** search, paging and the three states in Chrome, Firefox and Safari. Keyboard-only, VoiceOver, 320px wide and 200% zoom in Chrome only.
