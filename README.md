# SquadSeeker

**IN4MATX 43 — Spring 2026 Team Project**

SquadSeeker is a mobile app that helps people find others nearby who share their interests in real time. Users subscribe to interests and are notified when matching people enter a per-interest geographic range, with privacy protections (count-bubble anonymity, blackout zones, time-limited precise sharing) built into the core design.

## Team

| Name | UCInetID |
|---|---|
| Anna Lee | chaeeul3 |
| Manas Kottakota | kottakom |
| Nikash Malhotra | nikashm |
| Tanmay Garg | tanmayg1 |
| Jared Yrastorza | jryrasto |

## Repository structure

| Path | Contents |
|---|---|
| `Requirements_Spec/RequirementsSpecificationDoc_v2.md` | **HW1** — Requirements Specification (exec summary, functional requirements, analyses, use cases) |
| `Requirements_Spec/PrototypeImplementation.md` | **HW2** — prototype write-up and lessons learned |
| `Requirements_Spec/prototype/` | **HW2** — architecture prototype stub code (FastAPI servers + Swift client) |
| `Architecture/ArchitectureDoc_v2.md` | **HW2** — Architecture (components, connectors, design styles, platforms, languages, protocols) |
| `UI_Prototyping/UI_Prototyping.md` | **HW3** — UI mockups, per-screen descriptions, and Nielsen heuristic evaluation |
| `UI_Prototyping/SquadSeeker_UI_Prototype.html` | **HW3** — full interactive UI prototype (open in a browser) |
| `UI_Prototyping/SS_U_Mock.png` | **HW3** — early hand-drawn design sketch |
| `Testing/TEST_PLAN.md` | **HW4** — test plan, implementation report, and reflection |
| `Testing/app.js`, `Testing/tests.js` | **HW4** — logic layer + unit/integration test suite |
| `Testing/coverage/` | **HW4** — committed c8 HTML coverage report (open `index.html`) |
| `MeetingNotes.md` | Team meeting log (date, type, attendees, summary), kept current each week |
| `PROJECT_STATUS_REPORT.md` | Internal status & gap analysis against the four phase rubrics |

## Running the tests

```bash
cd Testing
node --version        # need Node >= 14
node tests.js         # runs 28 unit + 10 integration tests, zero dependencies
```

Regenerate the coverage report (needs network for `npx`):

```bash
cd Testing
npx c8 --reporter=html --reporter=text node tests.js   # writes coverage/index.html
```

## Prototypes

There are two intentionally separate prototypes:

1. **UI/logic prototype** — `UI_Prototyping/SquadSeeker_UI_Prototype.html`. Self-contained HTML/JS used to explore the interface; its logic layer is what the HW4 test suite exercises.
2. **Architecture spike** — `Requirements_Spec/prototype/`. FastAPI + Swift *stubs* that validate the client–server communication paths from the architecture (hardcoded responses, no database).
