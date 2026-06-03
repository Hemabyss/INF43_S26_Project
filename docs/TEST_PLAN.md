# TEST_PLAN.md — SquadSeeker
**Course:** IN4MATX 43 — Spring 2026  
**App:** SquadSeeker — geolocation interest-matching web app  
**Prototype (live):** https://claude.ai/public/artifacts/f8ace482-848d-4d8e-8cfb-41563eba3300  
**Repo:** https://github.com/Hemabyss/INF43_S26_Project

---

# Part 1 — Test Plan (Strategic)

## 1.1 Scope: what's in, what's out

SquadSeeker is a single-file HTML prototype — all logic (state, validation, user management, events) lives in one JavaScript closure. The testable surface is the logic layer extracted from that file into `app.js`.

| ✅ In scope | Why this matters |
|---|---|
| User registration + input validation | First touchpoint for every user; bad data here corrupts the entire state |
| Login / logout session management | Security-adjacent; must be correct before anything else works |
| Friend request send + accept | Core social feature; multiple state mutations must happen atomically |
| Event creation + RSVP | Core discovery feature; attendee counts visible to all users |
| Interest-based user + event filtering | The entire matching premise of the app depends on this |
| Username + password validation helpers | Shared logic used across registration and future forms |

| ❌ Out of scope | Why excluded |
|---|---|
| DOM rendering / screen transitions | Browser-only — require Playwright/Puppeteer; out of scope for this sprint |
| Geolocation API | Browser-only native API; cannot run in Node; would need mock infrastructure |
| Persistent storage / database | Prototype is fully in-memory — no DB layer exists yet |
| Cross-browser compatibility | Single-file prototype; Chrome/Safari parity is a future concern |
| Network / API calls | No backend exists; all data is client-side in-memory |
| Stretch features not yet implemented | Nothing to test |

---

## 1.2 Quality goals — what does "good enough" look like?

1. **No critical bug in any happy-path flow** — register → login → send friend request → accept, and register → login → create event → RSVP must all complete without errors.
2. **All invalid inputs are rejected with a specific error code** — no silent failures, no crashes on bad data.
3. **State is always consistent** — accepting a friend request must update both users' friend lists atomically; no half-applied mutations.
4. **No test depends on another** — every test resets state before running; run order must not matter.
5. **≥ 5 unit tests + ≥ 3 integration tests** — per assignment minimums; we exceed both.
6. **Zero unexpected failures** — known bugs are explicitly documented as regression tests that assert the buggy behavior; all other tests must pass.

---

## 1.3 Risks & priorities

| Area | Why it's risky / costly | Priority |
|---|---|---|
| Duplicate friend requests | No guard in `sendFriendReq` — double-calling inflates inbox; could cause phantom accept behavior | H |
| RSVP idempotency | No guard in `rsvpEvent` — double-calling inflates attendee count visible to all users | H |
| State mutation ordering | Friend accept must update both users; if one update throws, state is inconsistent | H |
| validateUsername vs register() mismatch | register() rejects >30 chars correctly, but the helper doesn't — two code paths diverge silently | M |
| STATE.newEvInt undefined | createEvent falls back to a dynamically-set property that may not exist; produces events with undefined interest | M |
| Interest filter returning wrong results | Core premise of app — wrong results here break discovery entirely | M |
| DOM functions (untested) | ~32 UI functions are completely untested — regressions here are invisible | L (for now) |

---

## 1.4 Strategy — test types and approach per component

**Unit test:** A test of a single function in isolation, with state reset before each run. Verifies that one function's input/output contract is correct regardless of how other functions behave.

**Integration test:** A test that calls multiple functions in sequence to verify they work correctly together — e.g., register → login → sendFriendReq → acceptFriendReq — checking that combined state changes are correct.

| Component | Test types | Framework | Why this fit |
|---|---|---|---|
| Logic layer (`app.js`) — validation, auth, friends, events | Unit + Integration | Plain Node.js (`node tests.js`) | Zero-dependency; runs anywhere Node is installed; prototype has no build step or package.json |
| DOM / UI layer | Not tested this sprint | Would use Playwright | Browser-only functions cannot run in Node without a headless driver |
| Geolocation / matching | Unit (mocked data) | Plain Node.js | We pass synthetic user objects with interests; no real GPS needed |
| Persistence / DB | N/A | N/A | Prototype is fully in-memory |

---

## 1.5 Environment & assumptions

- **Runtime:** Node.js ≥ 14 (no install; zero external dependencies)
- **OS:** Any — macOS, Linux, Windows (WSL tested)
- **Test data:** Generated fresh inside each test; state fully reset via `resetState()` before every test case
- **Mocking:** No mocks needed — the logic layer has no I/O, no DOM calls, no network; all functions are pure state mutations
- **What is NOT mocked (because it doesn't exist yet):** database, external APIs, browser APIs
- **CI assumption:** Tests can be added to any CI pipeline with `node tests.js` as the run command; exit code 0 = pass, 1 = unexpected failure

---

## 1.6 Team roles

| Member | Owns which test categories / components |
|---|---|
| Nikash Malhotra | Logic extraction (`app.js`), full unit + integration test suite (`tests.js`), bug identification and documentation, TEST_PLAN.md authored — all work/ files covered in first commit |
| _(teammate 2)_ | |
| _(teammate 3)_ | |
| _(teammate 4)_ | |

---

# Part 2 — Tests Implemented + Report

## 2.1 Required minimums

| Category | Required | Implemented |
|---|---|---|
| Unit tests | ≥ 5 | **28** |
| Integration tests | ≥ 3 | **10** |
| **Total** | **≥ 8** | **38** |

✅ Both minimums exceeded.

---

## 2.3 Tests by category

**Last updated: 2026-06-02 (see `tests.js` header)**

| Category | Count | Examples |
|---|---|---|
| Unit | 28 | `valid registration returns ok:true`; `wrong password returns wrong_password`; `createEvent with blank title returns empty_title`; `validateUsername rejects 2-char string`; `returns only events matching the interest` |
| Integration | 10 | `full friend-request flow: send then accept creates mutual friendship`; `full event flow: create then RSVP adds second user to attendees`; `registered users with shared interests appear in getNearbyUsers`; `[BUG #1] sending friend request twice creates duplicate inbox entry`; `events created by one user are visible via filter to another` |

---

## 2.4 Where the tests live + how to run them

### Repository structure

```
YOUR_REPO/
├── docs/
│   └── TEST_PLAN.md        ← this file
├── app.js                  ← logic layer extracted from the prototype
├── tests.js                ← full test suite (unit + integration)
└── README.md
```

The live prototype HTML is hosted at:  
**https://claude.ai/public/artifacts/f8ace482-848d-4d8e-8cfb-41563eba3300**

The prototype is **not** committed to the repo as an HTML file. `app.js` is the testable logic extracted from it. The Claude artifact link above is the authoritative source for the full running UI.

### How to clone and run (TA instructions)

```bash
# 1. Clone the repo
git clone https://github.com/Hemabyss/INF43_S26_Project.git
cd YOUR_REPO

# 2. Verify Node is available (need ≥ 14)
node --version

# 3. No install step — zero external dependencies

# 4. Run the full test suite
node tests.js
```

### Expected output

```
══════════════════════════════════════════════════
  UNIT TESTS
══════════════════════════════════════════════════

── Registration ──
  ✅ PASS   [unit]  valid registration returns ok:true
  ✅ PASS   [unit]  registered user is stored in STATE
  ...

══════════════════════════════════════════════════
  INTEGRATION TESTS
══════════════════════════════════════════════════

── Register → Login → Send friend request ──
  ✅ PASS [integ]  full friend-request flow: send then accept creates mutual friendship
  ...

══════════════════════════════════════════════════
  RESULTS
══════════════════════════════════════════════════
  Unit tests:        28/28 passed
  Integration tests: 10/10 passed
  Total:             38/38 passed
══════════════════════════════════════════════════

✅ All non-bug tests passed. Bug tests confirm known defects above.
```

The 4 tests marked `[BUG #N]` **intentionally pass** by asserting the buggy behavior — they are regression tests that prove the bugs exist and will catch if/when the bugs are fixed.

### Approximate run times

| Category | Time | Where it runs |
|---|---|---|
| Unit (28 tests) | < 50 ms | local + any CI with Node |
| Integration (10 tests) | < 50 ms | local + any CI with Node |
| Full suite | < 100 ms total | local + any CI with Node |

---

## 2.5 Coverage achieved

**Last updated: 2026-06-02**

| Test type | Tool | Coverage |
|---|---|---|
| Unit | Manual accounting (Node.js, no coverage tool) | 100% of extractable logic functions |
| Integration | Manual accounting | 100% of multi-function flows in logic layer |
| Combined — logic layer | — | ~100% of `app.js` |
| Combined — full prototype | — | ~45% (logic layer only; DOM layer untested) |

**What is NOT covered and why:**

The prototype is a single-file HTML app. Approximately 32 functions handle DOM mutations — rendering screens, toggling modals, updating counters, animating transitions. These functions cannot run in Node.js because they reference `document`, `window`, and browser APIs that don't exist in a Node environment. Testing them would require Playwright or Puppeteer (a headless browser), which is a future sprint goal. The 45% whole-file estimate is based on line counts: `app.js` (~120 lines of logic) vs the full prototype (~800 lines including DOM functions and HTML).

No automated coverage tool (Jest `--coverage`, nyc, c8) was used because the test harness is a plain Node.js script with no build toolchain. Coverage was assessed manually by auditing which exported functions from `app.js` have at least one test exercising them.

---

## 2.6 Plan-vs-implementation gap

| What the plan called for | What was shipped | What blocked / what's next |
|---|---|---|
| DOM / UI testing via Playwright | Not implemented | No headless browser in scope this sprint; Playwright setup is next |
| Geolocation-based proximity matching | Tested with mock data (user objects with `interests`) | Real GPS requires browser; mock approach covers the matching logic |
| Load / concurrency testing | Not implemented | Prototype is single-user in-memory; no server to load test |
| CI pipeline integration | Not set up | `node tests.js` is CI-ready (exit code 0/1); pipeline config left to repo owner |

---

# Part 3 — Reflection

**What did our tests catch that we missed before?**  
The most concrete catch was Bug #2 — the RSVP idempotency issue. Before writing the integration test for the full event flow, it wasn't obvious that calling `rsvpEvent()` a second time would silently double the attendee count rather than returning an error or being a no-op. The test `[BUG #2] rsvpEvent not idempotent` makes this visible: after two RSVP calls, `bob` appears twice in `event.attendees`. In a UI with a "You're going!" button that re-sends on refresh, this would inflate headcount for every attendee who refreshes the page.

**What was hardest to test, and why?**  
The hardest part was that the prototype mixes logic and DOM in a single file — there's no natural seam between "business logic" and "rendering." To write any tests at all, we had to manually extract the logic functions into a separate `app.js` and re-expose them via `module.exports`. This is structural work that should have been done during development, not during testing. The DOM functions (about 32 of them) remain completely untested because they reference `document` and `window`, which don't exist in Node.js.

**What test would we add next with more time?**  
End-to-end tests using Playwright — specifically: open the prototype in a headless browser, click "Sign Up," fill in the form, assert the home screen appears. This would cover the entire UI layer currently at 0% coverage and would catch bugs like the username counter showing 30 chars but the validation regex not enforcing it in the UI.

**Where did Claude help — and where did it get things wrong?**  
Claude was useful for quickly extracting the logic layer from the single-file prototype and scaffolding the test file structure. Where it went wrong initially: the first attempt generated a document with a completely different section structure than what the assignment required — it wrote an informal "Introduction / Scope / Test Cases / Bugs / Reflection" format instead of following the Part 1 / Part 2 / Part 3 structure with numbered subsections. It took an explicit correction to get the right document structure. Claude also initially ran test commands without producing the actual deliverable files, which needed to be caught and redirected.

