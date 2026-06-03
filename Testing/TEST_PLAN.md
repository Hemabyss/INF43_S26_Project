# TEST_PLAN.md — SquadSeeker
**Course:** IN4MATX 43 — Spring 2026  
**App:** SquadSeeker — geolocation interest-matching app (iOS in the architecture; HTML/JS UI prototype for this phase)  
**UI prototype:** `UI_Prototyping/SquadSeeker_UI_Prototype.html` (committed)  
**Repo:** https://github.com/Hemabyss/INF43_S26_Project

> **Note — two prototypes.** The project contains two intentionally separate prototypes. (1) The **architecture spike** (FastAPI + Swift stubs under `Requirements_Spec/prototype/`, described in `PrototypeImplementation.md`) validates the client-server communication paths from HW2. (2) The **UI/logic prototype** (`UI_Prototyping/SquadSeeker_UI_Prototype.html`) is a self-contained HTML/JS build used to explore the interface and exercise the app's core logic. **This test plan targets the UI/logic prototype's logic layer** (extracted into `Testing/app.js`), because it is the only prototype with self-contained, runnable business logic. The FastAPI/Swift spike is stub-only (hardcoded responses) and out of scope for automated testing this phase.

---

# Part 1 — Test Plan (Strategic)

## 1.1 Scope: what's in, what's out

SquadSeeker's UI/logic prototype is a single-file HTML app — all logic (state, validation, user management, events) lives in one JavaScript closure. The testable surface is the logic layer extracted from that file into `app.js`.

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

Ownership areas below reflect the team's agreed division of ongoing test work. The first testing commit was authored solely by Nikash; the remaining members own the categories listed as the suite grows.

| Member | Owns which test categories / components |
|---|---|
| Nikash Malhotra | Logic extraction (`app.js`), initial unit + integration test suite (`tests.js`), bug identification and documentation, TEST_PLAN.md authoring |
| Anna Lee | Registration, login/logout, and username/password validation tests; auth happy-path and error-path integration flows |
| Manas Kottakota | Friend-request and blocking flows (unit + integration); state-consistency / atomic-mutation tests |
| Tanmay Garg | Event creation, RSVP, and interest-based filtering tests; documented regression (`[BUG #N]`) tests |
| Jared Yrastorza | Coverage tooling (`c8`) and the committed `coverage/` report; CI-readiness and the plan-vs-implementation gap reporting |

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
INF43_S26_Project/
├── Testing/
│   ├── TEST_PLAN.md        ← this file
│   ├── app.js              ← logic layer extracted from the prototype
│   ├── tests.js            ← full test suite (unit + integration)
│   └── coverage/           ← committed c8 HTML coverage report (open index.html)
├── UI_Prototyping/
│   └── SquadSeeker_UI_Prototype.html   ← full exported UI prototype
├── Architecture/
├── Requirements_Spec/
└── README.md
```

The full exported UI prototype is committed at `UI_Prototyping/SquadSeeker_UI_Prototype.html`. `app.js` is the testable logic layer extracted from the prototype's JavaScript closure.

### How to clone and run (TA instructions)

```bash
# 1. Clone the repo
git clone https://github.com/Hemabyss/INF43_S26_Project.git
cd INF43_S26_Project/Testing

# 2. Verify Node is available (need ≥ 14)
node --version

# 3. No install step — zero external dependencies
node tests.js

# 4. (Optional) regenerate the coverage report (requires network for npx)
npx c8 --reporter=html --reporter=text node tests.js
# → writes coverage/index.html
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

**Last updated: 2026-06-03** (measured with `c8` — committed HTML report under `Testing/coverage/`, open `coverage/index.html`)

| Test type | Tool | Coverage (logic layer, `app.js`) |
|---|---|---|
| Statements | c8 (V8 coverage) | **98.06%** (455/464) |
| Branches | c8 | **89.74%** (105/117) |
| Functions | c8 | **100%** (15/15) |
| Lines | c8 | **98.06%** (455/464) |

These numbers are now **measured, not estimated** — generated by running `npx c8 --reporter=html --reporter=text node tests.js`. The full line-by-line HTML report is committed under `Testing/coverage/` and a plain-text snapshot is at `Testing/coverage/COVERAGE_SUMMARY.txt`.

**What is NOT covered and why:**

The c8 figures cover the logic layer (`app.js`) only. The full prototype (`UI_Prototyping/SquadSeeker_UI_Prototype.html`) also contains ~32 functions that handle DOM mutations — rendering screens, toggling modals, updating counters, animating transitions. These reference `document`, `window`, and browser APIs that do not exist in Node.js, so they are excluded from this measurement. Testing them would require Playwright or Puppeteer (a headless browser), which is a future sprint goal. The small remaining gap inside `app.js` itself (≈2% of statements, ≈10% of branches) is a handful of defensive error branches not yet exercised by a dedicated test.

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

