# Decisions

## Key technical decisions

**API**

- **Search is a literal, case-insensitive match and is not trimmed.** Only a whitespace-only
  query means "no filter". Trimming would lose word-start searches such as `" jones"`.
- **Sorted by `startTime` parsed as a datetime, then `id`.** As text, `2024-01-10T11:30:00+01:00`
  (10:30 UTC) sorts after `2024-01-10T10:45:00Z` although it is earlier. Every time is sent as UTC.
- **`pageSize` is a parameter** (default 10, max 100), not a fixed size. More flexible, at the cost
  of more validation to test.
- **Flat backend.** One endpoint and an in-memory list do not need repositories or routers (YAGNI).
  `create_app(contributions)` takes the records as an argument, so each test passes its own small
  list and there are no globals to reset.

**Frontend**

- **Stale responses are ignored by a request counter** in a hand-written hook. Only the latest
  request may update the data, the loading state or the error.
- **Search and page are local state**, not in the URL. Changing the query sets `page` to 1 in the
  same update, so no request pairs a new query with an old page. I first chose the URL, then
  reversed that: the brief does not ask for shareable searches.
- **The query is encoded with `URLSearchParams`**, so `+`, `&`, `#` and `%` reach the API unchanged.

## Trade-offs and alternatives considered

- **A page past the end returns 200 with empty `items`, not 4xx.** One simple rule, and "empty" is
  the normal path. A 4xx needs an exception for empty results and is too strict for no benefit.
- **Invalid parameters return 422, not 400.** It is the FastAPI default, so no custom code is needed.
- **Out-of-order responses use a request counter, not a debounce.** A delay hides the race but does
  not remove it.
- **No `AbortController`.** Cancelling only saves bandwidth, which does not matter for 40 records.
- **No TanStack Query.** It handles the race with query keys, but adds caching, retries and
  refetching to switch off, and hides what this exercise is about. I would adopt it if several
  screens shared server data.

## Compatibility implications

- **Scroll-driven CSS** colours the glow and compacts the sticky header. Browsers without it, and
  users who prefer reduced motion, get the same page without the effect. The header is not sticky
  on windows under 640px tall.
- **CORS:** the apps run on different ports, so the API allows only `http://localhost:3000` through
  `CORSMiddleware`. A Next.js proxy needs more config, and `*` or a configurable list is not needed
  without deployment. Open the app at `localhost:3000`, not `127.0.0.1:3000`.
- **Checked by hand:** search, paging and the three states in Chrome, Firefox and Safari. Keyboard-only, VoiceOver, 320px wide and 200% zoom in Chrome only.

## Known limitations

- **Data is in memory and read-only.** Search scans every record, which is fine at this size.
- **Query parameters follow FastAPI's defaults.** Unknown ones are ignored (`pagesize` gives 10),
  a repeated one uses its last value, and `+1` and `01` are accepted. Next I would reject unknown
  parameters with 422. A `page` above 1,000,000 is a 422.
- **No accent-insensitive search.** `casefold()` without Unicode normalisation, so `ecole` does
  not find `École`. I would add it next, as a contract change.
- **The page controls stay enabled while loading**, because the brief asks for paging during
  requests. A new search can then read "2 of 1" (or "2 of 0" after an error); Previous goes back.
  I would disable them until the first response arrives.
- **No automated accessibility or cross-browser tests.** Playwright and axe add dependencies and
  browser downloads. The search box name is tested with `getByRole("searchbox", { name })`, because
  the lint rules miss an unlabelled input. Contrast is calculated, not measured, and WCAG
  conformance is not audited.

## Any API behaviour changes introduced

This is a new API, so nothing existing changes. A client might not expect: a page past the end
returns 200 with empty items, a whitespace-only `q` means no filter, `q` is not trimmed, and
unknown parameters are ignored.
