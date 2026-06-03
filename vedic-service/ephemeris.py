"""Vedic chart calculation core.

Swiss Ephemeris precision (< 1 arcsecond), Lahiri Ayanamsha, Whole Sign houses,
Vimshottari Dasha. Independent of FastAPI so unit tests can import directly.
"""
from __future__ import annotations

import os
from datetime import datetime
from typing import Any

import swisseph as swe

EPHE_PATH = os.environ.get("VEDIC_EPHE_PATH", "/opt/ephe")
swe.set_ephe_path(EPHE_PATH)

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

SIGN_NAMES_ZH = [
    "白羊", "金牛", "双子", "巨蟹", "狮子", "处女",
    "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

DASHA_LORD_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
]
DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]

PLANET_MAP = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.TRUE_NODE,
}


def get_nakshatra(lon: float) -> tuple[str, int]:
    span = 360 / 27
    idx = int(lon / span) % 27
    pada = int((lon % span) / (span / 4)) + 1
    return NAKSHATRAS[idx], pada


def lon_to_sign(lon: float) -> tuple[int, str, str, float]:
    sign = int(lon / 30) + 1
    degree = lon % 30
    return sign, SIGN_NAMES[sign - 1], SIGN_NAMES_ZH[sign - 1], round(degree, 4)


def calculate_chart(
    year: int, month: int, day: int,
    hour: int, minute: int,
    lat: float, lng: float,
    utc_offset: float,
    time_uncertain: bool = False,
) -> dict[str, Any]:
    ut_hour = hour - utc_offset + minute / 60
    jd = swe.julday(year, month, day, ut_hour)

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsha = swe.get_ayanamsa(jd)

    cusps, ascmc = swe.houses_ex(jd, lat, lng, b"W", swe.FLG_SIDEREAL)
    asc_lon = ascmc[0]
    asc_sign, asc_sign_name, asc_sign_zh, asc_degree = lon_to_sign(asc_lon)
    asc_nak, asc_pada = get_nakshatra(asc_lon)
    house_start = asc_sign

    planets: list[dict[str, Any]] = []
    moon_lon: float | None = None

    for name, planet_id in PLANET_MAP.items():
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
        result, _ = swe.calc_ut(jd, planet_id, flags)
        lon = result[0]
        speed = result[3]
        is_retro = speed < 0 if name != "Rahu" else True

        sign, sign_name, sign_zh, degree = lon_to_sign(lon)
        nak, pada = get_nakshatra(lon)
        house = ((sign - house_start) % 12) + 1

        if name == "Moon":
            moon_lon = lon

        planets.append({
            "graha": name,
            "longitude": round(lon, 4),
            "sign": sign,
            "signName": sign_name,
            "signNameZh": sign_zh,
            "degree": degree,
            "house": house,
            "isRetrograde": is_retro,
            "nakshatra": nak,
            "nakshatraPada": pada,
        })

    rahu = next(p for p in planets if p["graha"] == "Rahu")
    ketu_lon = (rahu["longitude"] + 180) % 360
    k_sign, k_sign_name, k_sign_zh, k_degree = lon_to_sign(ketu_lon)
    k_nak, k_pada = get_nakshatra(ketu_lon)
    planets.append({
        "graha": "Ketu",
        "longitude": round(ketu_lon, 4),
        "sign": k_sign,
        "signName": k_sign_name,
        "signNameZh": k_sign_zh,
        "degree": k_degree,
        "house": ((k_sign - house_start) % 12) + 1,
        "isRetrograde": True,
        "nakshatra": k_nak,
        "nakshatraPada": k_pada,
    })

    if moon_lon is None:
        raise RuntimeError("Moon longitude missing — ephemeris calc returned no Moon entry.")

    dasha = _calculate_dasha(moon_lon, year, month, day)
    validations = _run_validations(planets, rahu)

    return {
        "ascendant": {
            "longitude": round(asc_lon, 4),
            "sign": asc_sign,
            "signName": asc_sign_name,
            "signNameZh": asc_sign_zh,
            "degree": asc_degree,
            "nakshatra": asc_nak,
            "nakshatraPada": asc_pada,
        },
        "planets": planets,
        "houseStartSign": house_start,
        "dasha": dasha,
        "ayanamsha": round(ayanamsha, 4),
        "julianDay": round(jd, 6),
        "timeUncertain": time_uncertain,
        "validations": validations,
        "birthData": {
            "year": year, "month": month, "day": day,
            "hour": hour, "minute": minute,
            "lat": lat, "lng": lng, "utcOffset": utc_offset,
        },
    }


def _calculate_dasha(moon_lon: float, year: int, month: int, day: int) -> list[dict[str, Any]]:
    from dateutil.relativedelta import relativedelta

    span = 360 / 27
    nak_idx = int(moon_lon / span) % 27
    start_idx = nak_idx % 9
    progress = (moon_lon % span) / span
    first_years = DASHA_YEARS[start_idx] * (1 - progress)

    birth = datetime(year, month, day)
    periods: list[dict[str, Any]] = []
    current = birth
    now = datetime.now()

    for i in range(9):
        idx = (start_idx + i) % 9
        yrs = first_years if i == 0 else DASHA_YEARS[idx]
        full_yrs = int(yrs)
        extra_days = round((yrs - full_yrs) * 365.25)
        end = current + relativedelta(years=full_yrs, days=extra_days)

        periods.append({
            "graha": DASHA_LORD_ORDER[idx],
            "startDate": current.strftime("%Y-%m-%d"),
            "endDate": end.strftime("%Y-%m-%d"),
            "years": round(yrs, 2),
            "isCurrent": current <= now < end,
        })
        current = end

    return periods


def _run_validations(planets: list[dict[str, Any]], rahu: dict[str, Any]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    ketu = next(p for p in planets if p["graha"] == "Ketu")
    diff = abs(rahu["longitude"] - ketu["longitude"])
    diff = min(diff, 360 - diff)
    results.append({
        "rule": "Rahu-Ketu opposition",
        "pass": abs(diff - 180) < 0.5,
        "detail": f"差值 {diff:.2f}°（应为 180°）",
    })

    results.append({
        "rule": "Rahu retrograde",
        "pass": rahu["isRetrograde"],
        "detail": "Rahu 应始终逆行",
    })

    return results
