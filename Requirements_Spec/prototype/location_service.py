"""
SquadSeeker — Location Service (PROTOTYPE STUB)
===============================================
HW2 architecture spike. Runs as a SEPARATE process on a SEPARATE port from the
API Server, confirming that the planned API Server / Location Service split is
workable in practice (ArchitectureDoc_v2.md, Section 1.1).

This stub ingests GPS updates and pretends to compute proximity. There is no
PostGIS index, no blackout-zone check, and no real matching — responses are
hardcoded. Coordinates are accepted but only echoed.

Run:
    pip install "fastapi[standard]" uvicorn
    uvicorn location_service:app --reload --port 8001
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SquadSeeker Location Service (stub)")


class LocationUpdate(BaseModel):
    user_id: str
    lat: float
    lng: float
    accuracy: float | None = None
    timestamp: float | None = None


@app.get("/health")
def health():
    return {"service": "location_service", "status": "up"}


@app.post("/location/update")
def location_update(update: LocationUpdate):
    # STUB: accept the point, skip blackout-zone + geo-index logic, and return a
    # hardcoded "nearby" result so the client can exercise the round trip.
    return {
        "status": "ok",
        "received": update.model_dump(),
        "nearby": [
            {"user_id": "demo_user_2", "shared_interest": "hiking", "approx_distance_m": 420}
        ],
        "note": "stub response — no real proximity computation",
    }


# ── Internal endpoint the API Server would call for map rendering ──────────
@app.get("/internal/nearby")
def internal_nearby(interest_id: str, lat: float, lng: float, radius_m: int = 3000):
    # STUB: hardcoded count bubble payload.
    return {
        "interest_id": interest_id,
        "centroid": {"lat": lat + 0.001, "lng": lng + 0.001},
        "count": 3,
    }
