# complete_sample.json(풀이 엔진 출력)을 사주/자미두수/점성술 인포그래픽용 고정 스키마 JSON 3종으로 변환·길이검증하는 스크립트
import json
import sys
from pathlib import Path

# 오행 팔레트 (설계 문서 6장 고정값)
ELEMENT_COLORS = {
    "목": "#2E9E6B",
    "화": "#D64545",
    "토": "#D9A441",
    "금": "#C9CDD2",
    "수": "#1F3A5F",
}
ELEMENT_HANJA = {"목": "木", "화": "火", "토": "土", "금": "金", "수": "水"}

# 일간 10종 캐릭터 타이틀 (고정 카피)
DAYMASTER_TITLES = {
    "甲": "곧게 뻗는 큰 나무",
    "乙": "유연하게 감아 오르는 덩굴",
    "丙": "만물을 비추는 태양",
    "丁": "어둠을 밝히는 촛불",
    "戊": "우직하게 자리를 지키는 큰 산",
    "己": "만물을 길러내는 기름진 땅",
    "庚": "단단하게 벼려진 강철과 보검",
    "辛": "정교하게 다듬어진 보석",
    "壬": "넓고 깊게 흐르는 바다",
    "癸": "만물을 적시는 이슬비",
}

# 섹션 구성: (인포그래픽 제목, interpret 키, 아이콘)
SECTION_DEFS = [
    ("재물", "재물", "💰"),
    ("애정", "연애", "❤️"),
    ("직업", "직업", "💼"),
]

PILLAR_LABELS = ["시주", "일주", "월주", "연주"]

# ── 자미두수 상수 ──────────────────────────────
PALACE_KOR = {
    "命宮": "명궁", "兄弟宮": "형제궁", "夫妻宮": "부처궁", "子女宮": "자녀궁",
    "財帛宮": "재백궁", "疾厄宮": "질액궁", "遷移宮": "천이궁", "交友宮": "교우궁",
    "奴僕宮": "노복궁", "官祿宮": "관록궁", "田宅宮": "전택궁", "福德宮": "복덕궁",
    "父母宮": "부모궁",
}
# 명반 4×4 격자에서 지지별 고정 위치 (row, col)
BRANCH_GRID = {
    "巳": (0, 0), "午": (0, 1), "未": (0, 2), "申": (0, 3),
    "辰": (1, 0), "酉": (1, 3),
    "卯": (2, 0), "戌": (2, 3),
    "寅": (3, 0), "丑": (3, 1), "子": (3, 2), "亥": (3, 3),
}
SIHUA_COLORS = {"化祿": "#2E9E6B", "化權": "#D9A441", "化科": "#4A90D9", "化忌": "#D64545"}

# ── 점성술 상수 ──────────────────────────────
# 별자리: (기호, 원소색)
ZODIAC = {
    "양자리": ("♈", "#D64545"), "사자자리": ("♌", "#D64545"), "사수자리": ("♐", "#D64545"),
    "황소자리": ("♉", "#D9A441"), "처녀자리": ("♍", "#D9A441"), "염소자리": ("♑", "#D9A441"),
    "쌍둥이자리": ("♊", "#C9CDD2"), "천칭자리": ("♎", "#C9CDD2"), "물병자리": ("♒", "#C9CDD2"),
    "게자리": ("♋", "#4A90D9"), "전갈자리": ("♏", "#4A90D9"), "물고기자리": ("♓", "#4A90D9"),
}
PLANET_KOR = {
    "Sun": "☀ 태양", "Moon": "🌙 달", "Mercury": "☿ 수성", "Venus": "♀ 금성",
    "Mars": "♂ 화성", "Jupiter": "♃ 목성", "Saturn": "♄ 토성",
    "Uranus": "♅ 천왕성", "Neptune": "♆ 해왕성", "Pluto": "♇ 명왕성",
}
# 어스펙트: (한글, 기호, 색)
ASPECT_INFO = {
    "conjunction": ("컨정션", "☌", "#D9A441"),
    "trine": ("트라인", "△", "#2E9E6B"),
    "sextile": ("섹스타일", "✶", "#2E9E6B"),
    "square": ("스퀘어", "□", "#D64545"),
    "opposition": ("어포지션", "☍", "#D64545"),
}


def cut(text, limit):
    """문장 경계 우선으로 limit자 이내 절단. 초과 시 말줄임."""
    text = (text or "").strip()
    if len(text) <= limit:
        return text
    head = text[:limit]
    dot = head.rfind("다.")
    if dot >= limit // 2:
        return head[: dot + 2]
    return head[: limit - 1].rstrip() + "…"


def meta_of(src):
    return {
        "name": src.get("name", ""),
        "birth": f"{src.get('birth_date', '')} {src.get('birth_time', '')}".strip(),
        "place": src.get("birth_place", ""),
        "gender": src.get("gender", ""),
    }


# ── 사주 ─────────────────────────────────────
def normalize_saju(src):
    saju = src["saju"]
    pillars_src = saju["pillars"]

    pillars = []
    for label, p in zip(PILLAR_LABELS, pillars_src):
        pillars.append({
            "label": label,
            "gan": p["stem"],
            "ji": p["branch"],
            "gan_el": p["stem_elem"],
            "ji_el": p["branch_elem"],
            "gan_color": ELEMENT_COLORS[p["stem_elem"]],
            "ji_color": ELEMENT_COLORS[p["branch_elem"]],
            "sipsin_top": p.get("sipsin_top", ""),
            "sipsin_bot": p.get("sipsin_bot", ""),
        })

    elements = []
    counts = saju["elements"]
    max_v = max(counts.values())
    min_v = min(counts.values())
    for kor in ["목", "화", "토", "금", "수"]:
        v = counts.get(kor, 0)
        elements.append({
            "kor": kor,
            "hanja": ELEMENT_HANJA[kor],
            "pct": v,
            "color": ELEMENT_COLORS[kor],
            "mark": "과다" if v == max_v else ("부족" if v == min_v else ""),
        })

    day_pillar = pillars_src[1]
    dm_char = day_pillar["stem"] + ELEMENT_HANJA[day_pillar["stem_elem"]]
    day_master = {
        "char": dm_char,
        "element": day_pillar["stem_elem"],
        "color": ELEMENT_COLORS[day_pillar["stem_elem"]],
        "title": DAYMASTER_TITLES.get(day_pillar["stem"], ""),
        "desc": cut(saju.get("daymaster_desc", ""), 60),
    }

    interpret = saju.get("interpret", {})
    sections = []
    for heading, key, icon in SECTION_DEFS:
        sections.append({
            "icon": icon,
            "heading": heading,
            "body": cut(interpret.get(key, ""), 55),
        })

    cur_age = None
    for sy in saju.get("seyun", []):
        if sy.get("isCurrent"):
            cur_age = sy["age"]
            break

    luck_cycle = []
    for dw in saju.get("daewoon", []):
        is_current = cur_age is not None and dw["age"] <= cur_age < dw["age"] + 10
        luck_cycle.append({
            "age": dw["age"],
            "gz": dw["ganzi"],
            "current": is_current,
        })

    conclusion = cut(src.get("advice", {}).get("summary", "") or saju.get("pillar_quote", ""), 30)

    return {
        "meta": meta_of(src),
        "pillars": pillars,
        "elements": elements,
        "day_master": day_master,
        "sections": sections,
        "luck_cycle": luck_cycle,
        "yongsin": saju.get("yongsin", {}).get("yong", ""),
        "conclusion": conclusion,
    }


# ── 자미두수 ──────────────────────────────────
def normalize_ziwei(src):
    z = src["ziwei"]

    # 현재 대한이 활성화된 궁 (명반에 배지 표시용)
    daxian_palace = ""
    for dh in z.get("dahahn", []):
        if dh.get("is_current"):
            daxian_palace = dh.get("palace", "")
            break

    palaces = []
    for name, p in z.get("palaces", {}).items():
        branch = p["ganzhi"][1] if len(p.get("ganzhi", "")) == 2 else ""
        if branch not in BRANCH_GRID:
            continue
        row, col = BRANCH_GRID[branch]
        palaces.append({
            "name": name,
            "kor": PALACE_KOR.get(name, name),
            "ganzhi": p["ganzhi"],
            "stars": p.get("stars_text", ""),
            "row": row,
            "col": col,
            "is_ming": name == "命宮",
            "is_daxian": bool(daxian_palace) and name == daxian_palace,
        })

    ming = z.get("palaces", {}).get("命宮", {})
    center = {
        "stars": ming.get("stars_text", ""),
        "chart_type": z.get("chart_type", ""),
        "desc": cut(ming.get("desc", ""), 50),
    }

    sihua = []
    for s in z.get("sihua", []):
        sihua.append({
            "type": s["type"],
            "star": s["star"],
            "palace_kor": PALACE_KOR.get(s.get("palace", ""), s.get("palace", "")),
            "desc": cut(s.get("desc", ""), 30),
            "color": SIHUA_COLORS.get(s["type"], "#C9CDD2"),
        })

    dahahn = []
    for dh in z.get("dahahn", []):
        dahahn.append({
            "age": dh.get("age", ""),
            "gz": dh.get("ganzhi", ""),
            "palace_kor": PALACE_KOR.get(dh.get("palace", ""), dh.get("palace", "")),
            "current": bool(dh.get("is_current")),
        })

    return {
        "meta": meta_of(src),
        "palaces": palaces,
        "center": center,
        "sihua": sihua,
        "dahahn": dahahn,
        "conclusion": cut(z.get("summary", ""), 70),
        "liuyear": cut(z.get("liuyear", ""), 60),
    }


# ── 점성술 ────────────────────────────────────
def normalize_natal(src):
    n = src["natal"]

    def zinfo(sign):
        sym, color = ZODIAC.get(sign, ("★", "#C9CDD2"))
        return sym, color

    house_by_id = {p.get("id"): p.get("house", "") for p in n.get("planets", [])}

    big3 = []
    for label, sign, house in [
        ("태양", n.get("sun_sign", ""), house_by_id.get("Sun", "")),
        ("달", n.get("moon_sign", ""), house_by_id.get("Moon", "")),
        ("상승", n.get("asc_sign", ""), ""),
    ]:
        sym, color = zinfo(sign)
        big3.append({"label": label, "sign": sign, "symbol": sym, "color": color, "house": house})

    planets = []
    for p in n.get("planets", []):
        sym, color = zinfo(p.get("sign", ""))
        planets.append({
            "name": p.get("name", PLANET_KOR.get(p.get("id", ""), p.get("id", ""))),
            "sign": p.get("sign", ""),
            "symbol": sym,
            "color": color,
            "degree": p.get("degree", ""),
            "house": p.get("house", ""),
            "keyword": p.get("keyword", ""),
            "retrograde": bool(p.get("retrograde")),
        })

    aspects = []
    for a in n.get("aspects", []):
        kor, sym, color = ASPECT_INFO.get(a.get("type", ""), (a.get("type", ""), "·", "#C9CDD2"))
        aspects.append({
            "p1": PLANET_KOR.get(a.get("planet1", ""), a.get("planet1", "")),
            "p2": PLANET_KOR.get(a.get("planet2", ""), a.get("planet2", "")),
            "type_kor": kor,
            "symbol": sym,
            "color": color,
            "orb": a.get("orb", ""),
        })

    ext = n.get("extended", {})
    sections = [
        {"icon": "💼", "heading": "커리어", "body": cut(ext.get("career", ""), 55)},
        {"icon": "💰", "heading": "재물", "body": cut(ext.get("wealth", ""), 55)},
        {"icon": "❤️", "heading": "사랑", "body": cut(ext.get("love", ""), 55)},
    ]

    # U+FE0E: 별자리 기호를 이모지가 아닌 텍스트 글리프로 렌더링
    footer_line = " · ".join(f"{b['symbol']}︎ {b['sign']} {b['label']}" for b in big3)

    return {
        "meta": meta_of(src),
        "big3": big3,
        "overview": cut(n.get("chart_overview", ""), 75),
        "planets": planets,
        "aspects": aspects,
        "sections": sections,
        "footer_line": footer_line,
    }


def main():
    here = Path(__file__).parent
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else here.parent / "complete_sample.json"
    src = json.loads(src_path.read_text(encoding="utf-8"))

    outputs = {
        "infographic_saju.json": normalize_saju(src),
        "infographic_ziwei.json": normalize_ziwei(src),
        "infographic_natal.json": normalize_natal(src),
    }
    for fname, data in outputs.items():
        out = here / fname
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"OK -> {out}")


if __name__ == "__main__":
    main()
