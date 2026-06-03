"""FastAPI entrypoint for the vedic chart microservice.

Listens on 127.0.0.1:8765 (loopback only). Reverse-proxied to nothing — the
Nuxt server calls this directly from the same VPS.
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from timezonefinder import TimezoneFinder

from ephemeris import calculate_chart

app = FastAPI(title="Vedic Chart Service", version="1.0.0")
tf = TimezoneFinder()


class ChartRequest(BaseModel):
    year: int = Field(ge=1900, le=2100)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    time_uncertain: bool = False


@app.post("/chart")
def get_chart(req: ChartRequest):
    tz_name = tf.timezone_at(lat=req.lat, lng=req.lng)
    if not tz_name:
        raise HTTPException(status_code=422, detail="Cannot determine timezone for given coordinates")

    tz = ZoneInfo(tz_name)
    local_dt = datetime(req.year, req.month, req.day, req.hour, req.minute, tzinfo=tz)
    offset = local_dt.utcoffset()
    if offset is None:
        raise HTTPException(status_code=422, detail=f"Timezone {tz_name} did not yield a UTC offset")
    utc_offset = offset.total_seconds() / 3600

    try:
        chart = calculate_chart(
            year=req.year, month=req.month, day=req.day,
            hour=req.hour, minute=req.minute,
            lat=req.lat, lng=req.lng,
            utc_offset=utc_offset,
            time_uncertain=req.time_uncertain,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"chart calculation failed: {e}") from e

    chart["timezone"] = tz_name
    return chart


@app.on_event("startup")
async def warmup():
    import swisseph as swe
    swe.calc_ut(swe.julday(2000, 1, 1, 12), swe.SUN, swe.FLG_SIDEREAL)


@app.get("/health")
def health():
    return {"status": "ok"}
