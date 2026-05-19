#!/usr/bin/env python3
"""
ESPN FIFA World Cup 2026 数据更新脚本

运行方式:
    python scripts/update_bracket.py

数据源:
    1. ESPN Scoreboard API (淘汰赛比分)
       https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/scoreboard?limit=200
    2. ESPN Standings API (小组赛积分榜 & 之后更新淘汰赛)
       https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings

输出:
    - public/bracket.json (淘汰赛对阵)
    - public/teams.json (小组赛积分榜)
"""

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# 项目根目录
ROOT = Path(__file__).parent.parent
BRACKET_PATH = ROOT / "public" / "bracket.json"
TEAMS_PATH = ROOT / "public" / "teams.json"

# ESPN API
SCOREBOARD_URL = (
    "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/scoreboard?limit=200"
)
STANDINGS_URL = (
    "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings"
)


def fetch_url(url: str) -> str:
    """使用 urllib 获取 URL 内容"""
    with urllib.request.urlopen(url, timeout=30) as resp:
        # 清理非法控制字符
        content = resp.read().decode("utf-8", errors="replace")
        return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", content)

# ESPN 小组 API ID → 我们的组别名
GROUP_NAME_MAP = {
    "Group A": "A组",
    "Group B": "B组",
    "Group C": "C组",
    "Group D": "D组",
    "Group E": "E组",
    "Group F": "F组",
    "Group G": "G组",
    "Group H": "H组",
    "Group I": "I组",
    "Group J": "J组",
    "Group K": "K组",
    "Group L": "L组",
}

# 淘汰赛阶段映射 (scoreboard 用 slug)
KNOCKOUT_STAGES = {
    "round_of_32": "Round of 32",
    "round_of_16": "16强",
    "quarterfinals": "8强",
    "semifinals": "半决赛",
    "third_place": "三四名",
    "final": "决赛",
}

# 国家名称映射 (EN -> ZH)
NAME_MAP = {
    "Mexico": "墨西哥",
    "South Africa": "南非",
    "Korea Republic": "韩国",
    "Czechia": "捷克",
    "Canada": "加拿大",
    "Bosnia and Herzegovina": "波斯尼亚和黑塞哥维那",
    "Qatar": "卡塔尔",
    "Switzerland": "瑞士",
    "Brazil": "巴西",
    "Morocco": "摩洛哥",
    "Haiti": "海地",
    "Scotland": "苏格兰",
    "United States": "美国",
    "Paraguay": "巴拉圭",
    "Australia": "澳大利亚",
    "Turkiye": "土耳其",
    "Germany": "德国",
    "Curacao": "库拉索",
    "Ivory Coast": "科特迪瓦",
    "Ecuador": "厄瓜多尔",
    "Netherlands": "荷兰",
    "Japan": "日本",
    "Sweden": "瑞典",
    "Tunisia": "突尼斯",
    "Belgium": "比利时",
    "Egypt": "埃及",
    "Iran": "伊朗",
    "New Zealand": "新西兰",
    "Spain": "西班牙",
    "Cape Verde Islands": "佛得角",
    "Saudi Arabia": "沙特阿拉伯",
    "Uruguay": "乌拉圭",
    "France": "法国",
    "Senegal": "塞内加尔",
    "Norway": "挪威",
    "Iraq": "伊拉克",
    "Argentina": "阿根廷",
    "Algeria": "阿尔及利亚",
    "Austria": "奥地利",
    "Jordan": "约旦",
    "Portugal": "葡萄牙",
    "DR Congo": "刚果民主共和国",
    "Uzbekistan": "乌兹别克斯坦",
    "Colombia": "哥伦比亚",
    "England": "英格兰",
    "Croatia": "克罗地亚",
    "Ghana": "加纳",
    "Panama": "巴拿马",
    "Italy": "意大利",
    "Poland": "波兰",
    "Kosovo": "科索沃",
    "Denmark": "丹麦",
    "Jamaica": "牙买加",
    "Bolivia": "玻利维亚",
    "Bosnia-Herzegovina": "波斯尼亚和黑塞哥维那",
}

# ID 映射 (将 ESPN team abbreviation 映射到我们的 id)
ID_MAP = {
    "MEX": "MEX",
    "RSA": "RSA",
    "KOR": "KOR",
    "CZE": "CZE",
    "CAN": "CAN",
    "BIH": "BIH",
    "QAT": "QAT",
    "SUI": "SUI",
    "BRA": "BRA",
    "MAR": "MAR",
    "HAI": "HAI",
    "SCO": "SCO",
    "USA": "USA",
    "PAR": "PAR",
    "AUS": "AUS",
    "TUR": "TUR",
    "GER": "GER",
    "CUW": "CUW",
    "CIV": "CIV",
    "ECU": "ECU",
    "NED": "NED",
    "JPN": "JPN",
    "SWE": "SWE",
    "TUN": "TUN",
    "BEL": "BEL",
    "EGY": "EGY",
    "IRN": "IRN",
    "NZL": "NZL",
    "ESP": "ESP",
    "CPV": "CPV",
    "KSA": "KSA",
    "URU": "URU",
    "FRA": "FRA",
    "SEN": "SEN",
    "NOR": "NOR",
    "IRQ": "IRQ",
    "ARG": "ARG",
    "ALG": "ALG",
    "AUT": "AUT",
    "JOR": "JOR",
    "POR": "POR",
    "COD": "COD",
    "UZB": "UZB",
    "COL": "COL",
    "ENG": "ENG",
    "CRO": "CRO",
    "GHA": "GHA",
    "PAN": "PAN",
    "ITA": "ITA",
    "POL": "POL",
    "KVX": "KVX",
    "DEN": "DEN",
    "JAM": "JAM",
    "BOL": "BOL",
}


def get_zh_name(en_name: str) -> str:
    return NAME_MAP.get(en_name, en_name)


def fetch_standings() -> list[dict]:
    """从 ESPN Standings API 获取积分榜数据"""
    try:
        content = fetch_url(STANDINGS_URL)
        data = json.loads(content)
        return data.get("children", [])
    except Exception as e:
        print(f"[ERROR] 获取 ESPN standings 失败: {e}", file=sys.stderr)
        return []


def extract_standings_stats(stats: list[dict]) -> dict:
    """从 stats 列表中提取需要的字段"""
    result = {
        "played": 0,
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "goalsFor": 0,
        "goalsAgainst": 0,
        "pointDiff": 0,
        "points": 0,
        "rank": 0,
    }
    for s in stats:
        name = s.get("name", "")
        value = s.get("value")
        if value is None:
            continue
        if isinstance(value, (int, float)):
            if name == "gamesPlayed":
                result["played"] = int(value)
            elif name == "wins":
                result["wins"] = int(value)
            elif name == "losses":
                result["losses"] = int(value)
            elif name == "ties":
                result["draws"] = int(value)
            elif name == "pointsFor":
                result["goalsFor"] = int(value)
            elif name == "pointsAgainst":
                result["goalsAgainst"] = int(value)
            elif name == "pointDifferential":
                result["pointDiff"] = int(value)
            elif name == "points":
                result["points"] = int(value)
            elif name == "rank":
                result["rank"] = int(value)
    return result


def update_teams_from_standings(standings_children: list[dict], teams_path: Path) -> int:
    """从 standings 数据更新 teams.json"""
    if not teams_path.exists():
        print(f"[WARN] {teams_path} 不存在，跳过积分榜更新", file=sys.stderr)
        return 0

    with open(teams_path, "r", encoding="utf-8") as f:
        teams = json.load(f)

    groups = teams.get("groups", {})
    updated = 0

    for child in standings_children:
        group_en = child.get("name", "")
        if group_en not in GROUP_NAME_MAP:
            # 可能是淘汰赛阶段(如 "Quarterfinals")，暂时跳过
            continue
        group_zh = GROUP_NAME_MAP[group_en]
        if group_zh not in groups:
            continue

        entries = child.get("standings", {}).get("entries", [])
        for entry in entries:
            team = entry.get("team", {})
            abbr = team.get("abbreviation", "").upper()
            # 查找对应队伍
            for team_data in groups[group_zh]:
                if team_data.get("id") == abbr:
                    stats = extract_standings_stats(entry.get("stats", []))
                    # 更新字段
                    team_data["played"] = stats["played"]
                    team_data["wins"] = stats["wins"]
                    team_data["losses"] = stats["losses"]
                    team_data["draws"] = stats["draws"]
                    team_data["goalsFor"] = stats["goalsFor"]
                    team_data["goalsAgainst"] = stats["goalsAgainst"]
                    team_data["pointDiff"] = stats["pointDiff"]
                    team_data["points"] = stats["points"]
                    team_data["rank"] = stats["rank"]
                    updated += 1
                    break

    # 更新 tournament timestamp
    teams["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    with open(teams_path, "w", encoding="utf-8") as f:
        json.dump(teams, f, ensure_ascii=False, indent=2)

    return updated


def extract_match_info(event: dict) -> dict | None:
    """从 ESPN event 对象中提取 match 信息"""
    competition = event.get("competition", {})
    if not competition:
        return None

    stage_slug = competition.get("type", {}).get("abbreviation", "").lower()

    # 只处理淘汰赛阶段（小组赛在 teams.json 中静态维护）
    if stage_slug not in KNOCKOUT_STAGES:
        return None

    competitors = event.get("competitions", [{}])[0].get("competitors", [])
    if len(competitors) != 2:
        return None

    home_comp = competitors[0]
    away_comp = competitors[1]

    home_team = home_comp.get("team", {})
    away_team = away_comp.get("team", {})

    home_id = ID_MAP.get(
        home_team.get("abbreviation", "").upper(), home_team.get("abbreviation", "").upper()
    )
    away_id = ID_MAP.get(
        away_team.get("abbreviation", "").upper(), away_team.get("abbreviation", "").upper()
    )

    home_name = get_zh_name(home_team.get("displayName", home_team.get("name", "")))
    away_name = get_zh_name(away_team.get("displayName", away_team.get("name", "")))

    # 比赛状态
    status = event.get("status", {})
    type_detail = status.get("type", {})
    finished = type_detail.get("completed", False)
    winner_id = None

    if finished:
        home_score = int(home_comp.get("score", "0") or "0")
        away_score = int(away_comp.get("score", "0") or "0")
        if home_score > away_score:
            winner_id = home_id
        elif away_score > home_score:
            winner_id = away_id
        else:
            # 点球等需要更复杂的判断，ESPN 通常在 type_detail 中提供 winner
            pass

    # 比赛时间
    date_str = event.get("date", "")
    scheduled_at = date_str

    # 场地
    venue = event.get("competitions", [{}])[0].get("venue", {}).get("fullName", "")

    # 生成 match id
    match_id = f"{stage_slug}_{event.get('id', '')}"

    return {
        "id": match_id,
        "stage": stage_slug,
        "home": {"id": home_id, "name": home_name},
        "away": {"id": away_id, "name": away_name},
        "scheduled_at": scheduled_at,
        "venue": venue,
        "finished": finished,
        "winner": winner_id,
    }


def fetch_scoreboard() -> list:
    """从 ESPN Scoreboard API 获取比赛数据"""
    try:
        content = fetch_url(SCOREBOARD_URL)
        data = json.loads(content)
        return data.get("events", [])
    except Exception as e:
        print(f"[ERROR] 获取 ESPN scoreboard 失败: {e}", file=sys.stderr)
        return []


def main() -> None:
    # 1. 更新积分榜 (小组赛)
    standings_children = fetch_standings()
    if standings_children:
        updated = update_teams_from_standings(standings_children, TEAMS_PATH)
        print(f"[OK] teams.json 已更新: {updated} 队伍积分榜")
    else:
        print("[SKIP] 未获取到积分榜数据")

    # 2. 更新淘汰赛对阵
    events = fetch_scoreboard()
    matches = []

    for event in events:
        match = extract_match_info(event)
        if match:
            matches.append(match)

    # 按比赛时间排序
    matches.sort(key=lambda m: m.get("scheduled_at", ""))

    # 判断当前阶段
    stage = "group_stage"
    if matches:
        stage = matches[-1].get("stage", "group_stage")

    bracket = {
        "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "stage": stage,
        "matches": matches,
    }

    # 写入文件
    BRACKET_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(BRACKET_PATH, "w", encoding="utf-8") as f:
        json.dump(bracket, f, ensure_ascii=False, indent=2)

    print(f"[OK] bracket.json 已更新: {len(matches)} 场淘汰赛, stage={stage}")


if __name__ == "__main__":
    main()
