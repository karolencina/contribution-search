# AGENTS.md

Instructions for any AI coding agent working in this repo.

**Read [WORKING-AGREEMENT.md](WORKING-AGREEMENT.md) in full before doing anything, and follow it.**
It is the single source of truth for scope, verification commands, dependency
limits, restrictions on destructive actions and the review process. Do not edit the file.

## Project

Contribution Search: a FastAPI backend (`api/`) and a Next.js frontend (`web/`) to
browse and search contributions. The `BRIEF.md` is the source of truth - it is not committed. Anything not in the brief gets proposed in one sentence, not built.

## Hard stops

1. **Plan first.** Ask questions and propose a plan. Wait for the Owner's approval before writing code.
2. **Never commit, push or rewrite history.** Only the Owner does that, and the Owner writes the
   commit messages. Any AI involvement is disclosed in AI-WORKFLOW.md.
3. **Ask before adding any dependency.** State what it is for, why it is needed and the alternatives.
4. **Never weaken a test** to make it pass: no deleting, skipping or loosening.
5. **Report checks honestly.** Run the verification commands from the agreement and show the real
   result. Never say a check passed if you did not run it.
6. **If a command is blocked, stop and tell the Owner.** Do not rephrase it to get past the block.

## Decisions

The Owner makes every decision. When you find something that needs the Owner (a trade-off,
a change to behaviour, scope or the API contract, a new dependency, an edit to a protected
file, or something only the Owner can check), **add it to [TODO.md](TODO.md) straight away**, with
the options, your recommendation and where the outcome will land. Then carry on with any work
that does not depend on it. If you are blocked on the answer, stop and ask. Never decide it
silently. Tick the item only after you have seen the outcome applied in the file it lands in.
Re-read TODO.md before editing it, because the Owner edits it too.
