"""
SquadSeeker — API Server (PROTOTYPE STUB)
==========================================
HW2 architecture spike. This is intentionally a *stub*: no database reads or
writes occur, and responses are either hardcoded or echo the request back. Its
only purpose is to exercise the client <-> API Server communication paths
(HTTPS REST + WebSocket chat) described in ArchitectureDoc_v2.md, Section 4.

Run (separate process / port from the Location Service):
    pip install "fastapi[standard]" uvicorn
    uvicorn api_server:app --reload --port 8000

NOTE: field names use snake_case here; the Swift client uses camelCase. The
mismatch this caused during prototyping is documented in PrototypeImplementation.md.
A shared JSON schema is the planned fix.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

app = FastAPI(title="SquadSeeker API Server (stub)")


# ── REST: interest subscription ───────────────────────────────────────────
class SubscribeRequest(BaseModel):
    user_id: str
    interest_ids: list[str]
    visibility: str = "friends_only"


@app.post("/interests/subscribe")
def subscribe(req: SubscribeRequest):
    # STUB: no persistence — echo the request back with a fake confirmation.
    return {
        "status": "ok",
        "user_id": req.user_id,
        "subscribed": req.interest_ids,
        "visibility": req.visibility,
        "note": "stub response — nothing written to a database",
    }


# ── REST: health check ────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"service": "api_server", "status": "up"}


# ── WebSocket: real-time chat ─────────────────────────────────────────────
@app.websocket("/ws/chat/{session_id}")
async def chat(websocket: WebSocket, session_id: str):
    # Auth note: in the real service the JWT is read from the connection's
    # Authorization header at open time (not per-message). See ArchitectureDoc 4.5.
    await websocket.accept()
    try:
        # The receive loop must be manually re-armed after every message — this
        # was the main WebSocket lesson from the prototype (see PrototypeImplementation.md).
        while True:
            data = await websocket.receive_text()
            # STUB: no moderation, no persistence — just echo back.
            await websocket.send_json(
                {"session_id": session_id, "echo": data, "delivered": True}
            )
    except WebSocketDisconnect:
        # Connection closed by client; nothing to clean up in the stub.
        pass
