# complete_sample.json(풀이 엔진 출력)을 인포그래픽 고정 스키마 infographic.json으로 변환·길이검증하는 스크립트
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


def cut(text, limit):
    """문장 경계 우선으로 limit자 이내 절단. 초과 시 말줄임."""
    text = (text or "").strip()
    if len(text) <= limit:
        return text
    # 마침표 경계에서 자를 수 있으면 자른다
    head = text[:limit]
    dot = head.rfind("다.")
    if dot >= limit // 2:
        return head[: dot + 2]
    return head[: limit - 1].rstrip() + "…"


def validate(data):
    """스키마 길이 제한 검증. 위반 항목을 리스트로 반환(절단은 cut에서 이미 완료)."""
    errors = []
    if len(data["day_master"]["desc"]) > 60:
        errors.append("day_master.desc > 60자")
    for s in data["sections"]:
        if len(s["body"]) > 55:
            errors.append(f"sections[{s['heading']}].body > 55자")
    if len(data["conclusion"]) > 30:
        errors.append("conclusion > 30자")
    return errors


def normalize(src):
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

    # 오행 분포 (엔진 출력이 % 합계 100)
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

    # 일간 캐릭터 카드 (일주 = pillars[1])
    day_pillar = pillars_src[1]
    dm_char = day_pillar["stem"] + ELEMENT_HANJA[day_pillar["stem_elem"]]
    day_master = {
        "char": dm_char,
        "element": day_pillar["stem_elem"],
        "color": ELEMENT_COLORS[day_pillar["stem_elem"]],
        "title": DAYMASTER_TITLES.get(day_pillar["stem"], ""),
        "desc": cut(saju.get("daymaster_desc", ""), 60),
    }

    # 영역별 요약 카드
    interpret = saju.get("interpret", {})
    sections = []
    for heading, key, icon in SECTION_DEFS:
        sections.append({
            "icon": icon,
            "heading": heading,
            "body": cut(interpret.get(key, ""), 55),
        })

    # 현재 나이: 세운의 isCurrent 항목에서 역산
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
        "meta": {
            "name": src.get("name", ""),
            "birth": f"{src.get('birth_date', '')} {src.get('birth_time', '')}".strip(),
            "place": src.get("birth_place", ""),
            "gender": src.get("gender", ""),
        },
        "pillars": pillars,
        "elements": elements,
        "day_master": day_master,
        "sections": sections,
        "luck_cycle": luck_cycle,
        "yongsin": saju.get("yongsin", {}).get("yong", ""),
        "conclusion": conclusion,
    }


def main():
    here = Path(__file__).parent
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else here.parent / "complete_sample.json"
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else here / "infographic.json"

    src = json.loads(src_path.read_text(encoding="utf-8"))
    data = normalize(src)

    errors = validate(data)
    if errors:
        print("길이 검증 실패:", errors)
        sys.exit(1)

    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK -> {out_path}")


if __name__ == "__main__":
    main()
