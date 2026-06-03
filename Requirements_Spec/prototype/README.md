# SquadSeeker — Architecture Prototype
This folder contains the **stub** prototype referenced by `PrototypeImplementation.md`.
It is intentionally minimal: it validates the *communication paths* from the
architecture (HW2), not real functionality. No database, no real proximity
math, no UI — responses are hardcoded or echoed.

## Files

| File | Role |
|---|---|
| `api_server.py` | FastAPI stub for the **API Server**: `POST /interests/subscribe` + WebSocket `/ws/chat/{session_id}` |
| `location_service.py` | FastAPI stub for the **Location Service**: `POST /location/update` + `GET /internal/nearby` |
| `SquadSeekerClientStub.swift` | Headless Swift client: fires the REST calls and opens the chat WebSocket with hardcoded coordinates |

The two backend files run as **separate processes on separate ports**, confirming
the API Server / Location Service split is workable (ArchitectureDoc_v2.md §1.1).

## Run the backend stubs

```bash
pip install "fastapi[standard]" uvicorn

# Terminal 1 — API Server
uvicorn api_server:app --reload --port 8000

# Terminal 2 — Location Service
uvicorn location_service:app --reload --port 8001
```

Quick check without Swift:

```bash
curl -X POST localhost:8000/interests/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"u1","interest_ids":["hiking"]}'

curl -X POST localhost:8001/location/update \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"u1","lat":33.6405,"lng":-117.8443}'
```

## Run the Swift client stub

Drop `SquadSeekerClientStub.swift` into a SwiftUI project (or run with the Swift
toolchain) and call the functions in the example driver at the bottom of the file.

## What we learned (summary)

- REST via `URLSession` was straightforward; the **WebSocket receive loop must be
  manually re-armed** after every message, and the **auth header attaches at
  connection open**, not per message.
- **camelCase (Swift) vs snake_case (Python)** JSON field naming caused silent
  failures — fields arrived but were unmatched. Planned fix: a shared JSON schema
  both sides reference.

See `../PrototypeImplementation.md` for the full write-up, including the hosting
pivot from Supabase to a plain UCI ICS Linux server.
