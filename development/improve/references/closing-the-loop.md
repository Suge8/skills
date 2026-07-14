# Closing the Loop — reconcile, issues

The advisor's job doesn't end at the plan. This file covers the follow-through flow: keeping the plans alive and reviewing executed work (`reconcile`).

The founding rule survives unchanged: **the advisor never edits source code, and never dispatches execution.** Plans are self-contained deliverables; how they get executed is the user's decision (pi-flow pointed at the plan file, a fresh session, by hand). The advisor's follow-through is review — like a tech lead who doesn't push commits to your branch.

---

## Reviewing executed plans (inside `reconcile`)

When the user returns after executing a plan, review like a tech lead reviewing a PR against the spec — never fix anything yourself:

1. **Re-run every done criterion.** Don't trust the execution report — verify on the current tree.
2. **Scope compliance**: diff the executed changes against the plan's in-scope list. Any file outside scope fails review, full stop.
3. **Read the full diff.** Judge it against "Why this matters" (does it solve the actual problem?) and the repo conventions named in the plan (does it look like the rest of the codebase?).
4. **Audit the new tests.** Executors game criteria — a test that asserts nothing meaningful passes `pnpm test` and proves nothing. Read what the tests assert.

**Documented deviations are judged on merit, not reflex-blocked.** An executor that hit a real obstacle, adapted minimally, and recorded why has done the right thing — approve if the adaptation serves the plan's intent and stays in scope; treat *undocumented* deviations as review failures. Verdicts: pass → mark DONE in the index; fixable gaps → write the specific feedback into the plan and hand off again (max 2 rounds); otherwise → mark BLOCKED with the reason and rewrite the plan with what was learned.

---

## `reconcile` — keep `plans/` alive

Process what happened since the last session. Read `plans/README.md` and every plan file, then per status:

- **DONE** — spot-check that the done criteria still hold on the current HEAD (cheap ones only). Mark verified in the index. Don't delete plan files — they're the record.
- **BLOCKED** — read the reason. Investigate the underlying obstacle in the codebase. Either rewrite the plan around it (new number if the approach changed fundamentally, in-place refresh otherwise) or mark REJECTED with one line of rationale.
- **IN PROGRESS** (stale) — flag it to the user; an execution probably died mid-run. Check for uncommitted changes or an abandoned branch.
- **TODO** — run the drift check. If drifted: re-verify the finding still exists (it may have been fixed in passing), then refresh the "Current state" excerpts and `Planned at` SHA. If the finding is gone, mark REJECTED ("fixed independently").

Finish with a short report: what's verified done, what was refreshed, what's rejected, and what's executable right now.

