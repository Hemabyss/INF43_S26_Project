# 6. Prototype Implementation

> **Code:** the stub prototype described below is committed under
> [`prototype/`](./prototype/) — `api_server.py`, `location_service.py`,
> `SquadSeekerClientStub.swift`, and a `README.md` with run instructions.

## 6.1 What Was Built

The team built a minimal prototype to gain early experience with the core communication paths in the system. On the backend, a skeleton FastAPI application was stood up with stub endpoints for interest subscription (`POST /interests/subscribe`), location updates (`POST /location/update`), and a WebSocket chat endpoint (`/ws/chat/{sessionId}`). No database reads or writes are performed at this stage — all responses are hardcoded or echo the input back. The two backend services were run as separate processes on separate ports to confirm that the planned separation between the API Server and Location Service is workable in practice.

On the client side, a minimal Swift stub was written with no UI — just a set of functions that can be called manually to fire HTTPS requests and open a WebSocket connection, simulating what the real client will eventually do with live CoreLocation data and a full SwiftUI interface. Coordinates are hardcoded at this stage.

## 6.2 What We Learned

The REST calls from Swift were straightforward using `URLSession`, but the WebSocket integration required more care than expected — specifically, the receive loop must be manually re-armed after every message, and authentication headers must be attached at connection open rather than per-message. This confirmed the risk we noted in Section 4.2 and reinforced the value of having the HTTP polling fallback planned.

A small but time-consuming issue was inconsistent JSON field naming between Swift (camelCase, e.g. `userId`) and Python (snake_case, e.g. `user_id`), which caused silent failures where payloads arrived but fields were missing. Going forward the team will maintain a shared JSON schema document that both sides reference. CoreLocation integration and a live database connection are the immediate next steps.

## 6.3 Software and Hosting

### Initial Approach: Supabase and Managed Cloud Platforms

When we first started the prototype we went with Supabase as the database layer, along with looking into other managed cloud platforms for hosting the backend services. The reasoning was straightforward — these platforms are designed to reduce setup time and handle a lot of the infrastructure complexity for you.

### Challenges

In practice it was more of a headache than expected. Supabase required setting up a project, configuring shared access across the whole team, managing environment variables, and understanding its own abstraction layer on top of PostgreSQL — all before any real database work could happen. Getting everyone on the team connected and working in the same environment took longer than it should have and was pulling focus away from actually building things.

### How We Got to the Current Decision

That friction is what pushed us toward a simpler setup. Rather than continuing to fight with platform-specific configuration, we decided it made more sense to target a plain Linux server where the backend services can just be run directly as Python processes without any extra layers on top. UCI ICS-provided hosting fits that and removes concerns around billing and account management across team members.

### Current Implementation

At this point we've identified the core tooling — FastAPI for both backend services, Swift URLSession on the client side, and PostgreSQL as the database — and have a base idea and model for what the prototype looks like going forward.
