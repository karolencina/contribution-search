# AI Developer Working Agreement

Rules for AI-assisted development on the Contribution Search app.
They apply to every AI agent and every human working in this repo, whichever
tool or vendor. Agents load them through `AGENTS.md` (any tool) and `CLAUDE.md`
(Claude Code). The brief is the source of truth. Anything not in it gets
proposed in one sentence, not built. Prefer quality over quantity.

**Roles**

- **Owner:** The human developer. Owns all decisions, approvals and commits.
- **Agent:** any AI tool working in this repo, including reviewer sessions and subagents.

## 1. Scope of Changes

**In scope**

- A FastAPI endpoint for search and pagination
- The Next.js UI: list, search, paging, and loading, empty and error states
- A sample dataset
- A focused set of tests
- README, WORKING-AGREEMENT, DECISIONS.md and AI-WORKFLOW.md

**Out of scope**

- Databases, auth, deployment, monitoring
- Features unrelated to search reliability
- Large refactors

**Non-negotiable behaviour**

API

- Search is a literal, case-insensitive substring match on title or owner. Never regex.
- An empty or whitespace-only query means no filter. Any other query is not trimmed.
- Results are sorted (`startTime`, then `id`) before pagination, and `total` is counted before slicing.
- Invalid `page` or `pageSize` get a 422, never a silent clamp.

UI

- Changing the query resets to page 1. No request ever pairs the new query with the old page.
- A newer request's result is never overwritten by an older one: not its data, not its loading state, not its error.
- Search text containing `+`, `&`, `#` or `%` reaches the API unchanged.

## 2. Verification Commands

Run backend commands from `api/` inside its virtualenv (`api/.venv`) and frontend
commands from `web/`. Each tool has a **check** form and a **write** form.

**Backend**

| Purpose               | Check                   | Write                |
| --------------------- | ----------------------- | -------------------- |
| Format                | `ruff format --check .` | `ruff format .`      |
| Lint                  | `ruff check .`          | `ruff check --fix .` |
| Types                 | `mypy .`                |                      |
| Tests                 | `pytest`                |                      |
| Known vulnerabilities | `pip-audit`             |                      |

**Frontend**

| Purpose                             | Check                  | Write              |
| ----------------------------------- | ---------------------- | ------------------ |
| Install                             | `npm ci`               | `npm install`      |
| Format                              | `npm run format:check` | `npm run format`   |
| Lint (includes accessibility rules) | `npm run lint`         | `npm run lint:fix` |
| Types                               | `npm run typecheck`    |                    |
| Tests                               | `npm run test`         |                    |
| Build                               | `npm run build`        |                    |
| Known vulnerabilities               | `npm audit --omit=dev` |                    |

## 3. Dependency Boundaries

- Stick to FastAPI and Next.js plus only the libraries that are necessary.
- **Pre-approved**:
  - Backend: `fastapi`, `uvicorn`, `httpx2`, `pytest`, `ruff`, `mypy`, `pip-audit`
  - Frontend: `next`, `react`, `react-dom`, `typescript`, `eslint` with
    `eslint-config-next`, `prettier`, `vitest`, `jsdom`, `testing-library`
- For anything else, the Agent asks first and states what it is for, why it's
  needed, and the alternatives considered. The Owner then checks downloads,
  maintenance activity, licence and known vulnerabilities before it is installed.
- Only well-established, actively maintained packages from the official
  registries (npm, PyPI).
- If avoiding a library means rewriting a lot of what it already provides, use the library.
- No global installs. Python packages go in `api/.venv`, npm packages in `web/`.
  Lockfiles and pinned versions are committed.

## 4. Restrictions on Destructive Actions

- Never run destructive or dangerous commands (`rm -rf`, `sudo`, `git clean`, `git reset --hard`).
- Never permanently change history or other people's work: no commits, no pushes,
  no rebases, no history rewrites. Only the Owner commits.
- Stay inside the project folder. Don't touch `.env` files or home-directory configs.
- Never weaken a test to make it pass: no deleting, skipping or loosening
  assertions. Tests only change with the Owner's explicit approval.
- Don't edit the brief or this agreement.
- Staying inside the project folder, and not weakening tests beyond the approval prompt.
- Other AI tools: the same rules apply through `AGENTS.md`. Nothing enters history unless the Owner
  commits it after reading the diff.

## 5. Review Process for Generated Code

1. **Plan first.** The Agent asks clarifying questions and proposes a plan as
   reviewable markdown. The Owner approves it before any code is written.
   It saves tokens and rewrites.
2. **Tests first.** The Owner writes the test list (`docs/TEST-PLAN.md`). The Agent
   turns it into tests, and each one is run to see it fail for the right reason
   before any implementation is written. Expected values are written out by hand
   in the test, never computed with the logic being tested.
3. **Small slices.** Use the Elephant Carpaccio method. One concern per diff.
4. **Run the checks** (section 2) after every change. The Agent shows each command and
   its real output, and never says a check passed that it did not run.
5. **Edge-case tests:** rapid typing, clearing, overlapping and out-of-order
   requests, and regex characters in searches.
6. **Break it on purpose.** For each non-negotiable behaviour, make a one-line
   change that breaks it (search with a regex, count `total` after slicing, drop
   the `id` tiebreaker). A test must fail. Then revert it. Results go in AI-WORKFLOW.md.
7. **Fresh-eyes review,** before submitting. In a new session or subagent, the reviewer:
   - gets the brief and the code, not the history of how it was built
   - is read-only and reports findings without changing anything
   - is given specific attacks to try (regex use, total after slicing, stale
     responses, no reset to page 1)
   - produces findings that are leads, not verdicts. The Owner decides and
     verifies them personally.
8. **Owner commits,** in small steps and only after steps 1-7 for that slice, so history reflects work the Owner reviewed. Commit messages are the Owner's and any AI involvement is disclosed in AI-WORKFLOW.md.
9. **Final check.** Before submitting, the Owner clones the repo into an empty folder,
   follows only the README, and runs every check in section 2 and the manual checks it lists.

**Rejected in any review** by the Owner and by the fresh-eyes reviewer:

- **Band-aids:** a change that hides a symptom instead of removing the cause. Here that means
  debounce, a delay or a disabled input used as the fix for out-of-order responses, swallowing an exception, or deleting, skipping or loosening a test to make it pass.
- **Speculative code (YAGNI):** features, options, endpoints or abstractions the brief does not ask for.
- **Duplicated logic (DRY):** the same rule written twice, such as the page-size limits or the
  matching rule. Extract it.

  ## 6. Context and Token Use

Every request re-sends the whole conversation, so long or cluttered sessions cost more
on every turn. These are conventions, not enforced.

- **Owner:** one task per session. `/clear` between unrelated tasks; state lives in the
  repo (`TODO.md`, docs, git), not in the chat. Set model and effort at the start and keep
  them (a mid-session switch re-reads everything uncached). Use the cheapest model that does
  the job, stepping up for the hard parts. Compact at a break, with a focus, not mid-task.
  If a correction fails twice, `/clear` and write a better prompt.
- **Brief specifically:** name the files, the symptom and what "done" looks like.
- **Agent, read little:** search before reading, read line ranges, don't re-read a file just edited.
- **Agent, keep output small:** run the narrowest check while working (one test file), the
  full set from section 2 once per slice, quietly (`pytest -q --tb=short`). Report failures, not logs.
- **Agent, delegate noise:** long logs and fetched docs go to a subagent that returns a summary,
  not small tasks. Each subagent sends its own requests.
- **No agent teams, multi-agent workflows, scheduled loops, extra MCP servers or plugins**
  without the Owner's approval. Each adds token use, and loops add it even while idle.
- **Keep always-loaded files lean** (`CLAUDE.md`, `AGENTS.md`, this file). Claude Code warns
  in `/status` when one is too long.

Resources:
https://code.claude.com/docs/en/best-practices
https://bump.sh/blog/api-contracts-extended-introduction/
