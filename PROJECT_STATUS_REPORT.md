# SquadSeeker — Project Status Report & Gap Analysis

**Prepared:** 2026-06-03
**Repo reviewed:** `Hemabyss/INF43_S26_Project` (branch `main`)
**Scope:** Accomplishments to date vs. the TA's Phase I–IV criteria, plus remaining work.

---

## At-a-glance

| Phase | Deliverable | Status | Headline gap |
|---|---|---|---|
| I — Requirements Analysis | `RequirementsSpecificationDoc_v2.md` | **Strong / near-complete** | Duplicate v1/v2 files; optional sketches absent |
| II — Architecture | `ArchitectureDoc_v2.md` + `PrototypeImplementation.md` | **Strong on docs, weak on artifact** | Prototype code (FastAPI/Swift) is *described but not committed* |
| III — UI Prototype | `UI_Prototyping.md` | **Incomplete in-repo** | Mockups + heuristic write-up live only as external links, not in the repo/doc |
| IV — Testing & Retrospective | `docs/TEST_PLAN.md` + `app.js` + `tests.js` | **Mostly complete** | `coverage/` HTML report not committed; team roles table half-empty |

Repo currently contains: two requirements docs (v1, v2), two architecture docs (v1, v2), `PrototypeImplementation.md`, `UI_Prototyping.md`, `MeetingNotes.md`, `docs/TEST_PLAN.md`, `app.js`, `tests.js`. No backend code, no committed UI files, no `README.md`, no `coverage/`.

---

## Phase I — Requirements Analysis

**What's done (and done well):**

- **Title block** with all five members and UCInetIDs. ✔
- **Executive summary** (~1 page, non-technical, covers audience/goals/features/assumptions/risks). ✔
- **Application Context / Environmental Constraints** — physical environment, hardware/platform (iOS), GPS/network/OS-privacy/power/map dependencies, signal-integrity constraints. ✔
- **Functional Requirements** — extensive and precise, organized by entity (Range System, Interest Subscriptions, Bios, Blocking, Location Sharing & Blackout Zones, Precise Time-Window Sharing, User Interactions, Chat, Events, Onboarding, Map View, Interest Discovery, Notification Anatomy). Detailed enough to hand to developers. ✔
- **Functional Requirements Analyses** — the assignment requires ≥5 optional features + ≥2 of your own, each with pros/cons/ethics. You have **13 analyses**, comfortably exceeding the minimum. Optional features covered: range model, multiple interests, structured bios, blocking, location limits/blackout zones, geofenced chat. Your own additions: precise time-window sharing, events/activity markers, first-in group-chat policy, onboarding, map view, interest discovery, notification anatomy. ✔ (exceeds)
- **Use Cases** — each feature has Basic / Alternative / Exceptional flows. ✔
- **Format** — Markdown, as required. ✔

**Gaps / to-do for Phase I:**

1. **Duplicate documents.** Both `RequirementsSpecificationDoc.md` (v1) and `..._v2.md` exist with near-identical headers. Decide which is canonical, delete or archive the other, and make sure the live one is the most complete (v2 appears to be). Two competing files invite grader confusion.
2. **Optional sketches** were explicitly invited ("rough sketches of how you imagine the app to look"). None are embedded. Not required, but cheap credit toward "thoroughness" — and you already have UI mockups (Phase III) you could link from here.
3. **Verify GitHub access** (applies to all phases, see Cross-Cutting): confirm the repo is **private** and that Prof. Jones (`jajones`), your section TA, and the two readers (`LinaaaNguyen`, `sprshr`) are invited as collaborators.

---

## Phase II — Architecture

**What's done (and done well):**

- **Architectural summary** — client-server primary style + event-driven for proximity/notifications; MVP-scoped. ✔
- **Components** — iOS Client, API Server (modular monolith), Location Service, PostgreSQL, plus external deps (APNs, MapKit/CoreLocation, OAuth providers, content-analysis service), each with key functionalities and where it runs. ✔
- **Connectors** — HTTPS REST, WebSocket chat, batched HTTPS GPS POST, internal HTTPS service-to-service, in-process event bus, SQL/TCP, APNs HTTPS — each with the data communicated. ✔
- **Design styles** — client-server and event-driven, with justification and benefits. ✔
- **Platforms** — iOS/SwiftUI, Linux (university hosting), PostgreSQL, each with benefits *and* trade-offs; plus a thoughtful "mitigations against over-scoped architecture" section. ✔
- **Programming languages** — Swift, Python/FastAPI, SQL, each with benefits/trade-offs + a "single backend language" rationale. ✔
- **Communication protocols** — REST, WebSocket, GPS POST, internal HTTPS, JWT auth, APNs, event bus, SQL/TCP, with message contents and rationale. ✔
- **Component functions & connector communications by use case** — Section 5 walks all 10 use cases step-by-step with functions and data payloads. ✔ (this is the strongest single section)
- **Prototype implementation write-up** — `PrototypeImplementation.md` documents what was built (FastAPI stub endpoints, Swift URLSession/WebSocket stub), what was learned (WebSocket re-arming, camelCase/snake_case mismatch), and the hosting pivot from Supabase to a plain Linux server, with reflection. ✔

**Gaps / to-do for Phase II:**

1. **The prototype code is not in the repo.** `PrototypeImplementation.md` describes FastAPI stub endpoints and a Swift client stub, but no `.py` / `.swift` files exist in the repository. The assignment's prototype is low-stakes ("we will not be evaluating this prototype"), but committing even the stub code makes the reflection verifiable and is expected. **Action:** commit the FastAPI stubs and Swift stub (or a `prototype/` folder), even if rough.
2. **Duplicate documents** — same issue as Phase I: `ArchitectureDoc.md` (v1) vs `ArchitectureDoc_v2.md`. Consolidate to one canonical file.
3. **Prototype consistency.** Note that two *different* prototypes now exist in the project: the architecture's FastAPI+Swift stub (Phase II) and the single-file HTML/JS prototype that Phase IV actually tests. That's acceptable for a class project, but a one-line note reconciling them (e.g., "the HTML prototype is a UI/logic spike; the FastAPI/Swift stub is the architecture spike") would prevent grader confusion.

---

## Phase III — UI Prototype

**What's done:**

- `UI_Prototyping.md` exists and links to two Claude artifacts: a wireframe and a full interactive UI. ✔ (artifacts created)
- **Meeting documentation** — `MeetingNotes.md` logs Weeks 6–9 with date/type, attendees, and summaries, kept current. ✔ (this requirement appears under both Phase III and IV and is satisfied)

**Gaps / to-do for Phase III (this is the weakest phase in-repo):**

1. **Mockups are not in the repo.** They exist only as external `claude.ai/public/artifacts/...` links. Graders expect mockups *in* the submission — commit screenshots/PNGs of each major screen (or an exported HTML file). External links can break, change, or be inaccessible to graders, putting the whole deliverable at risk.
2. **No per-screen descriptions in the document.** The assignment explicitly requires, for each mockup/screen: *what the mockup shows, what each on-screen element represents, and how the user is expected to interact with it.* The doc currently defers entirely to an annotation panel inside the linked HTML. Write these descriptions into `UI_Prototyping.md`, screen by screen (Onboarding, Map, Count-bubble sheet, Profile/Bio, Chat, Interests tab, Event creation/detail, Location-sharing sheet, Settings/Notifications, Blackout-zone editor).
3. **No design iteration shown.** The assignment encourages showing the *process* — hand sketches / whiteboard photos first, then software mockups. Only a polished final exists. Add any early sketches (even photos of paper) to demonstrate iteration.
4. **Heuristic evaluation not written out in the doc.** The assignment wants, for **each of the 10 Nielsen heuristics**, a description of how your UI/UX addresses it. The doc only states "the HTML addresses all 10." Write an explicit per-heuristic section (Visibility of system status; Match to real world; User control & freedom; Consistency & standards; Error prevention; Recognition vs. recall; Flexibility/accelerators; Aesthetic & minimalist design; Help users recover from errors; Help & documentation), each tied to concrete UI elements.

---

## Phase IV — Testing & Retrospective

**What's done (and done well):**

- `docs/TEST_PLAN.md` contains **Part 1 (Plan)**, **Part 2 (Implementation Report)**, and **Part 3 (Reflection, ~250 words)**. ✔
- **Part 1** covers scope in/out with reasons, measurable-ish quality goals, a risks/priorities table with H/M/L, test-type definitions + per-component strategy/frameworks, environment & assumptions, and a team-roles table. ✔
- **Part 2** reports required minimums and **exceeds them**: 28 unit tests (≥5 required) and 10 integration tests (≥3 required); examples, run instructions, run-times, and a plan-vs-implementation gap table. ✔
- **Tests exist and pass.** I ran `node tests.js`: **38/38 pass** (28 unit + 10 integration), including 4 intentional regression tests that document known bugs. ✔
- **Snapshot dates present** ("Last updated: 2026-06-02"). ✔
- **Reflection** answers all four prompts (bug caught, hardest to test, next test to add, where Claude helped/erred). ✔

**Gaps / to-do for Phase IV:**

1. **`coverage/` HTML report is not committed.** This is an explicit item on the Deliverables Checklist ("coverage/ HTML report (committed)"). You currently use *manual accounting* ("~45% whole prototype, 100% of logic layer") with no coverage tool. **Action:** add a coverage tool (e.g., `c8` or `nyc` over `node tests.js`, or port the suite to Jest `--coverage`), generate the HTML report, and commit the `coverage/` folder. Even a low number is fine — the requirement is that you *measured* it.
2. **Team-roles table is half-empty.** Only Nikash is listed; teammates 2–4 are blank placeholders. Fill these in — the assignment grades on who owns what.
3. **Test target ≠ architecture.** Tests cover the single-file HTML/JS prototype's logic layer, not the FastAPI/Swift system from Phase II. This is honestly disclosed in §2.6, which is what the assignment asks for, so it's acceptable — but a sentence acknowledging it lines up with the Phase II "prototype consistency" note above.
4. **Repo privacy / collaborators** — the TEST_PLAN points to `github.com/Hemabyss/INF43_S26_Project`; confirm it's private and that all required collaborators are invited (see Cross-Cutting).

---

## Cross-Cutting To-Dos (affect grading across all phases)

1. **Confirm GitHub setup.** Private repo; invite **Prof. Jones (`jajones`)**, your **section TA** (Hang Du `qinfendeheichi` / Asif Haider `asifhaider` / Eric Huang `HE-1234`), and **both readers** (`LinaaaNguyen`, `sprshr`). I cannot verify invitations from the local clone — check this on GitHub.
2. **Remove duplicate docs.** Keep one canonical Requirements doc and one Architecture doc; delete or clearly archive the v1 files.
3. **Commit the prototypes.** Both the FastAPI/Swift stub (Phase II) and the HTML UI prototype (Phase III) should live in the repo, not only as prose descriptions or external links.
4. **Add a root `README.md`.** TEST_PLAN's structure diagram references a `README.md` that doesn't exist. A short README (project overview + index of docs + how to run tests) ties the submission together. Meeting notes can stay in `MeetingNotes.md`.

---

## Priority-ordered punch list (what to do next)

**High — required checklist items currently missing:**
1. Generate and commit the `coverage/` HTML report (Phase IV).
2. Embed UI mockups (images) **and** per-screen descriptions **and** the 10-heuristic write-up directly in `UI_Prototyping.md` (Phase III).
3. Verify private repo + all collaborator invites (all phases).

**Medium — completeness / verifiability:**
4. Commit the FastAPI/Swift prototype stub code (Phase II).
5. Fill in the Phase IV team-roles table (3 missing members).
6. Consolidate duplicate v1/v2 Requirements and Architecture docs.

**Low — polish / extra credit:**
7. Add a root `README.md` indexing all deliverables.
8. Add early UI sketches to show design iteration (Phase III).
9. Add optional app sketches to the Requirements doc (Phase I).
10. Add a one-line note reconciling the two prototypes (Phases II & IV).
