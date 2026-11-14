@AGENTS.md
@WORKING-AGREEMENT.md

## Claude Code specifics

- Claude Code reads AGENTS.md on its own only when a repo has no CLAUDE.md. This repo has one,
  so Claude Code loads this file, and the two imports above bring in the shared instructions
  and the full agreement at the start of every session.
- `.claude/settings.json` denies plain `git commit` and `git push`, `.env` reads, and edits to the
  agreement and `.claude/`. It asks before editing test files or installing packages.
- Use plan mode before writing code.

# Compact instructions

When compacting, keep: the open items in TODO.md, decisions made, the API contract, the test list,
and the last result of each check command. Drop file contents that can be read again and command
output that has already been dealt with.
