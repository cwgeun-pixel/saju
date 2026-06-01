# Trinity of Destiny — 프리미엄 멤버십 리포트 PDF 생성 스크립트 (풀버전)
# 목표 페이지: 25~35페이지 (모든 멤버십 전용 해석 포함)

import json, sys, os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# ── 폰트 ─────────────────────────────────────────────────────
MAIN_FONT, BOLD_FONT = 'Malgun', 'MalgunBold'
for path, name in [('C:/Windows/Fonts/malgun.ttf', MAIN_FONT),
                   ('C:/Windows/Fonts/malgunbd.ttf', BOLD_FONT)]:
    if os.path.exists(path):
        try: pdfmetrics.registerFont(TTFont(name, path))
        except: pass
try:
    pdfmetrics.getFont(MAIN_FONT)
except:
    MAIN_FONT, BOLD_FONT = 'Helvetica', 'Helvetica-Bold'

# ── 색상 ─────────────────────────────────────────────────────
C = {
    'bg':     colors.HexColor('#0d1020'),
    'gold':   colors.HexColor('#d4af37'),
    'goldlt': colors.HexColor('#e8d5a3'),
    'purple': colors.HexColor('#7c6af7'),
    'dark':   colors.HexColor('#1a1d30'),
    'card':   colors.HexColor('#131726'),
    'text':   colors.HexColor('#c8cee8'),
    'muted':  colors.HexColor('#7a82a8'),
    'white':  colors.white,
    'red':    colors.HexColor('#ef4444'),
    'green':  colors.HexColor('#22c55e'),
    'blue':   colors.HexColor('#60a5fa'),
    'orange': colors.HexColor('#f97316'),
    'pink':   colors.HexColor('#f472b6'),
    'line':   colors.HexColor('#2a2d40'),
}

W = A4[0] - 36*mm   # 콘텐츠 폭

# ── 스타일 ────────────────────────────────────────────────────
def S(name, **kw):
    defaults = dict(fontName=MAIN_FONT, fontSize=9, textColor=C['text'],
                    leading=14, spaceAfter=4)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {
    'h1':     S('h1',  fontName=BOLD_FONT, fontSize=22, textColor=C['gold'],   alignment=TA_CENTER, leading=28, spaceAfter=4),
    'h2':     S('h2',  fontName=BOLD_FONT, fontSize=15, textColor=C['gold'],   leading=20, spaceBefore=12, spaceAfter=6),
    'h3':     S('h3',  fontName=BOLD_FONT, fontSize=11, textColor=C['goldlt'], leading=15, spaceBefore=8,  spaceAfter=4),
    'h4':     S('h4',  fontName=BOLD_FONT, fontSize=10, textColor=C['gold'],   leading=14, spaceBefore=6,  spaceAfter=3),
    'body':   S('body'),
    'sm':     S('sm',  fontSize=8, textColor=C['muted'], leading=12),
    'lbl':    S('lbl', fontName=BOLD_FONT, fontSize=9,  textColor=C['gold'],   leading=12),
    'ctr':    S('ctr', alignment=TA_CENTER),
    'quote':  S('qt',  textColor=C['goldlt'], leftIndent=10, rightIndent=10, leading=15, spaceAfter=6, spaceBefore=4),
    'brand':  S('br',  fontName=BOLD_FONT, fontSize=10, textColor=C['muted'],  alignment=TA_CENTER, spaceAfter=4),
    'sub':    S('su',  fontSize=12, textColor=C['goldlt'], alignment=TA_CENTER, leading=16, spaceAfter=6),
    'ival':   S('iv',  fontName=BOLD_FONT, fontSize=10, textColor=C['white'],  leading=14),
    'toc':    S('tc',  fontSize=9,  textColor=C['text'],  leading=13, leftIndent=8, spaceAfter=4),
    'tocp':   S('tp',  fontName=BOLD_FONT, fontSize=10, textColor=C['gold'],   leading=14, spaceAfter=4),
    'part':   S('pt',  fontName=BOLD_FONT, fontSize=16, textColor=C['purple'], alignment=TA_CENTER, leading=22, spaceBefore=8, spaceAfter=6),
    'pillar': S('pl',  fontName=BOLD_FONT, fontSize=22, textColor=C['gold'],   alignment=TA_CENTER, leading=28),
    'pillarb':S('pb',  fontName=BOLD_FONT, fontSize=22, textColor=C['blue'],   alignment=TA_CENTER, leading=28),
    'sign':   S('sg',  fontName=BOLD_FONT, fontSize=12, textColor=C['gold'],   alignment=TA_CENTER, leading=16),
    'tag':    S('tg',  fontName=BOLD_FONT, fontSize=8,  textColor=C['purple'], leading=11),
}

# ── 공통 컴포넌트 ─────────────────────────────────────────────
def draw_bg(canvas, doc):
    w, h = A4
    canvas.saveState()
    canvas.setFillColor(C['bg'])
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setStrokeColor(C['gold'])
    canvas.setLineWidth(0.5)
    canvas.line(14*mm, h-11*mm, w-14*mm, h-11*mm)
    canvas.line(14*mm, 11*mm,   w-14*mm, 11*mm)
    canvas.setFont(MAIN_FONT, 7)
    canvas.setFillColor(C['muted'])
    canvas.drawCentredString(w/2, 7*mm,
        f'TRINITY OF DESTINY  ·  {doc.page}  ·  Confidential · Personal Report')
    canvas.restoreState()

def hr(color=None, thick=0.5):
    return HRFlowable(width='100%', thickness=thick, color=color or C['gold'], spaceAfter=4)

def hr_sm(): return HRFlowable(width='100%', thickness=0.3, color=C['line'], spaceAfter=2)

def part_break(title, subtitle=''):
    return [
        PageBreak(),
        Spacer(1, 8*mm),
        hr(C['purple'], 1),
        Paragraph(title, ST['part']),
        Paragraph(subtitle, ST['sub']) if subtitle else Spacer(1, 1),
        hr(C['purple'], 1),
        Spacer(1, 6*mm),
    ]

def sec(label, sub=''):
    return [
        hr(),
        Paragraph(f'{label}  <font color="#7a82a8" size="8">{sub}</font>', ST['h2']),
        hr(C['purple'], 0.3),
        Spacer(1, 3*mm),
    ]

def subsec(label):
    return [Paragraph(label, ST['h3'])]

def card(rows, widths=None, bg=None):
    bg = bg or C['card']
    t = Table(rows, colWidths=widths or [W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(-1,-1), bg),
        ('BOX',        (0,0),(-1,-1), 0.6, C['gold']),
        ('LINEBELOW',  (0,0),(-1,-2), 0.2, C['line']),
        ('TOPPADDING', (0,0),(-1,-1), 6),
        ('BOTTOMPADDING',(0,0),(-1,-1), 6),
        ('LEFTPADDING',(0,0),(-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('VALIGN',     (0,0),(-1,-1), 'TOP'),
        ('FONTNAME',   (0,0),(-1,-1), MAIN_FONT),
        ('FONTSIZE',   (0,0),(-1,-1), 9),
        ('TEXTCOLOR',  (0,0),(-1,-1), C['text']),
    ]))
    return t

def two_col(left_items, right_items, ratio=0.5):
    lw, rw = W*ratio - 1*mm, W*(1-ratio) - 1*mm
    t = Table([[left_items, right_items]], colWidths=[lw, rw])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), C['card']),
        ('BOX',       (0,0),(-1,-1), 0.5, C['gold']),
        ('LINEAFTER', (0,0),(0,-1),  0.3, C['purple']),
        ('TOPPADDING',(0,0),(-1,-1), 8),
        ('BOTTOMPADDING',(0,0),(-1,-1), 8),
        ('LEFTPADDING',(0,0),(-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('VALIGN',    (0,0),(-1,-1), 'TOP'),
    ]))
    return t

def labeled_card(label, text, label_color=None):
    lc = label_color or C['gold']
    lbl_style = S('lc', fontName=BOLD_FONT, fontSize=9, textColor=lc, leading=13)
    t = Table([[Paragraph(label, lbl_style), Paragraph(text, ST['body'])]],
              colWidths=[30*mm, W-30*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), C['card']),
        ('BOX',       (0,0),(-1,-1), 0.5, lc),
        ('LINEAFTER', (0,0),(0,-1),  0.3, lc),
        ('TOPPADDING',(0,0),(-1,-1), 7),
        ('BOTTOMPADDING',(0,0),(-1,-1), 7),
        ('LEFTPADDING',(0,0),(-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('VALIGN',    (0,0),(-1,-1), 'TOP'),
    ]))
    return t

def badge_card(badge, title, text, badge_color=None):
    bc = badge_color or C['gold']
    badge_style = S('bc', fontName=BOLD_FONT, fontSize=9, textColor=bc, leading=13)
    title_style = S('tc2', fontName=BOLD_FONT, fontSize=10, textColor=C['goldlt'], leading=14, spaceAfter=3)
    t = Table([[
        Paragraph(badge, badge_style),
        [Paragraph(title, title_style), Paragraph(text, ST['body'])]
    ]], colWidths=[18*mm, W-18*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), C['card']),
        ('BOX',       (0,0),(-1,-1), 0.5, bc),
        ('LINEAFTER', (0,0),(0,-1),  0.3, bc),
        ('TOPPADDING',(0,0),(-1,-1), 8),
        ('BOTTOMPADDING',(0,0),(-1,-1), 8),
        ('LEFTPADDING',(0,0),(-1,-1), 8),
        ('RIGHTPADDING',(0,0),(-1,-1), 8),
        ('VALIGN',    (0,0),(-1,-1), 'TOP'),
    ]))
    return t

# ═══════════════════════════════════════════════════════════════
#  메인 생성 함수
# ═══════════════════════════════════════════════════════════════
def generate_report(data: dict, output_path: str):
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=18*mm, bottomMargin=18*mm,
        title=f"Trinity of Destiny Premium Report — {data.get('name','회원')}",
        author='Trinity of Destiny',
    )
    story = []

    saju  = data.get('saju', {})
    ziwei = data.get('ziwei', {})
    natal = data.get('natal', {})
    pillars = saju.get('pillars', [])
    p_labels = ['시주 (時柱)', '일주 (日柱)', '월주 (月柱)', '년주 (年柱)']

    # ─────────────────────────────────────────────────────────
    # PAGE 1 · 표지
    # ─────────────────────────────────────────────────────────
    story += [
        Spacer(1, 18*mm),
        Paragraph('PREMIUM MEMBERSHIP REPORT', ST['h1']),
        Paragraph('TRINITY OF DESTINY', ST['brand']),
        Paragraph('渾天 · 運命의 三重 視線', ST['sub']),
        Spacer(1, 5*mm),
        hr(C['gold'], 1),
        Spacer(1, 3*mm),
        Paragraph('프리미엄 운명 분석 리포트', S('cs', fontName=BOLD_FONT, fontSize=18,
            textColor=C['goldlt'], alignment=TA_CENTER, leading=24, spaceAfter=4)),
        Paragraph('사주 · 자미두수 · 서양 점성술 통합 해석', ST['sub']),
        Spacer(1, 3*mm),
        hr(C['gold'], 1),
        Spacer(1, 6*mm),
    ]
    info_rows = [
        [Paragraph('성명',     ST['lbl']), Paragraph(data.get('name','—'),        ST['ival'])],
        [Paragraph('생년월일', ST['lbl']), Paragraph(data.get('birth_date','—'),   ST['ival'])],
        [Paragraph('출생시각', ST['lbl']), Paragraph(data.get('birth_time','—'),   ST['ival'])],
        [Paragraph('출생지',   ST['lbl']), Paragraph(data.get('birth_place','—'),  ST['ival'])],
        [Paragraph('성별',     ST['lbl']), Paragraph(data.get('gender','—'),       ST['ival'])],
        [Paragraph('발행일',   ST['lbl']), Paragraph(data.get('report_date', datetime.now().strftime('%Y년 %m월 %d일')), ST['ival'])],
    ]
    story.append(card(info_rows, [38*mm, W-38*mm]))
    story += [
        Spacer(1, 8*mm),
        Paragraph('⚫ 사주명리   ✦ 자미두수   ✧ 서양 점성술', ST['ctr']),
        Spacer(1, 4*mm),
        Paragraph('TRINITY OF DESTINY · PREMIUM MEMBERSHIP · CONFIDENTIAL',
            S('fc', fontName=MAIN_FONT, fontSize=7, textColor=C['muted'], alignment=TA_CENTER)),
    ]

    # ─────────────────────────────────────────────────────────
    # PAGE 2 · 목차
    # ─────────────────────────────────────────────────────────
    story += [PageBreak(), Paragraph('목차  ·  Table of Contents', ST['h2']), hr()]
    toc = [
        (None, 'PART I · 사주명리 四柱命理'),
        ('01', '사주팔자 원국 전체 분석  四柱八字 原局'),
        ('02', '오행 분석 및 용신  五行 · 用神'),
        ('03', '성격 · 기질 심층 해석'),
        ('04', '직업 · 사업 · 커리어 심층 해석'),
        ('05', '재물 · 투자 · 부동산 심층 해석'),
        ('06', '연애 · 결혼 · 인연 심층 해석'),
        ('07', '건강 · 체질 · 주의사항 심층 해석'),
        ('08', '대운 흐름 분석  大運 · 60년'),
        ('09', '신살 전체 분석  神殺'),
        ('10', '12운성 분석  十二運星'),
        (None, 'PART II · 자미두수 紫微斗數'),
        ('11', '명반 개요 및 주성 분석  命盤'),
        ('12', '12궁 전체 상세 해석  十二宮'),
        ('13', '사화 분석  四化'),
        ('14', '대한 운세 흐름  大限'),
        ('15', '유년 운세  流年'),
        (None, 'PART III · 서양 점성술 Western Astrology'),
        ('16', '네이탈 차트 완전 해석'),
        ('17', '태양 · 달 · 상승궁 심층 분석'),
        ('18', '행성 배치 · 12하우스 완전 해석'),
        ('19', '심리 점성학  Psychological Astrology'),
        ('20', '직업 · 재물 · 연애 운세 점성술 해석'),
        ('21', '트랜짓 미래운  Transit Forecast'),
        ('22', '솔라 리턴  Solar Return'),
        ('23', '프로그레션  Progressions'),
        ('24', '카르마 · 영혼 해석  Karma & Soul'),
        ('25', '역행 행성 해석  Retrograde Planets'),
        ('26', '건강 점성학  Medical Astrology'),
        ('27', '12하우스 전체 해석'),
        ('28', '행성 각도 심층 해석  Aspects'),
        ('29', '아스트로카토그래피  Astrocartography'),
        (None, 'PART IV · 종합 분석'),
        ('30', '삼중 시선 종합 운세 해석'),
        ('31', '월별 운세 가이드  2026'),
        ('32', '인생 조언 및 개운법'),
    ]
    for num, label in toc:
        if num is None:
            story += [Spacer(1, 3*mm), Paragraph(label, ST['tocp'])]
        else:
            story.append(Table([[Paragraph(f'  {num}.  {label}', ST['toc']),
                                  Paragraph(num, S('pg', fontSize=8, textColor=C['muted'], alignment=TA_RIGHT))]],
                colWidths=[W-10*mm, 10*mm],
                style=[('LINEBELOW',(0,0),(-1,-1),0.15,C['line']),
                       ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1)]))

    # ═════════════════════════════════════════════════════════
    # PART I · 사주명리
    # ═════════════════════════════════════════════════════════
    story += part_break('PART I · 사주명리', '四柱命理 · The Four Pillars')

    # ── 01. 사주팔자 원국 ─────────────────────────────────────
    story += sec('01.  사주팔자 원국 전체 분석', '四柱八字 原局')
    if pillars:
        hdr = [Paragraph('', ST['lbl'])] + [Paragraph(l, ST['lbl']) for l in p_labels]
        r1  = [Paragraph('十神上', ST['sm'])] + [Paragraph(p.get('sipsin_top',''), ST['ctr']) for p in pillars]
        r2  = [Paragraph('天干', ST['sm'])]   + [Paragraph(f'<b>{p.get("stem","")}</b>', ST['pillar']) for p in pillars]
        r3  = [Paragraph('地支', ST['sm'])]   + [Paragraph(f'<b>{p.get("branch","")}</b>', ST['pillarb']) for p in pillars]
        r4  = [Paragraph('十神下', ST['sm'])] + [Paragraph(p.get('sipsin_bot',''), ST['ctr']) for p in pillars]
        r5  = [Paragraph('12운성', ST['sm'])] + [Paragraph(p.get('unseong',''), S('us', fontSize=8, textColor=C['purple'], alignment=TA_CENTER)) for p in pillars]
        t = Table([hdr,r1,r2,r3,r4,r5], colWidths=[18*mm]+[(W-18*mm)/4]*4)
        t.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1), C['card']),
            ('BACKGROUND',(0,0),(-1,0), C['dark']),
            ('BOX',(0,0),(-1,-1),0.8,C['gold']),
            ('INNERGRID',(0,0),(-1,-1),0.2,C['line']),
            ('ALIGN',(0,0),(-1,-1),'CENTER'),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
            ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
            ('BACKGROUND',(2,1),(2,-1), colors.HexColor('#1c1f35')),
            ('BOX',(2,1),(2,-1),1.5,C['gold']),
        ]))
        story.append(t)
        story.append(Spacer(1, 3*mm))

    yongsin = saju.get('yongsin', {})
    quote = saju.get('pillar_quote', '사주 원국 분석 내용입니다.')
    story += [
        card([[Paragraph(f'"{quote}"', ST['quote'])]], [W]),
        Spacer(1, 3*mm),
        two_col(
            [Paragraph('✦ 일간 분석', ST['h4']), Paragraph(saju.get('daymaster_desc','일간 분석 내용입니다.'), ST['body'])],
            [Paragraph('✦ 용신 · 희신 · 기신', ST['h4']),
             Paragraph(f"<b>용신:</b> {yongsin.get('yong','—')}<br/><b>희신:</b> {yongsin.get('hee','—')}<br/><b>기신:</b> {yongsin.get('gi','—')}<br/><br/>{yongsin.get('desc','용신 상세 설명입니다.')}", ST['body'])],
        ),
        Spacer(1, 3*mm),
    ]

    # ── 02. 오행 분석 ────────────────────────────────────────
    story += sec('02.  오행 분석 및 용신', '五行 Balance Analysis')
    elements = saju.get('elements', {'목':35,'화':20,'토':10,'금':20,'수':15})
    elem_info = [
        ('목', '木', C['green'],  '성장·창의·도전의 에너지'),
        ('화', '火', C['red'],    '열정·표현·명예의 에너지'),
        ('토', '土', C['orange'], '안정·신뢰·중심의 에너지'),
        ('금', '金', C['muted'],  '결단·원칙·수확의 에너지'),
        ('수', '水', C['blue'],   '지혜·유연·적응의 에너지'),
    ]
    elem_rows = [[Paragraph('오행', ST['lbl']), Paragraph('비율', ST['lbl']),
                  Paragraph('분포', ST['lbl']), Paragraph('의미', ST['lbl'])]]
    for ko, hj, col, meaning in elem_info:
        pct = elements.get(ko, 0)
        filled = int(pct / 4)
        bar_filled   = '<font color="' + col.hexval() + '">' + '█' * filled + '</font>'
        bar_empty    = '<font color="#2a2d40">' + '░' * (25 - filled) + '</font>'
        elem_rows.append([
            Paragraph(f'<b>{hj} {ko}</b>', S('el', fontName=BOLD_FONT, fontSize=9, textColor=col, leading=13)),
            Paragraph(f'<b>{pct}%</b>', ST['lbl']),
            Paragraph(bar_filled + bar_empty, ST['body']),
            Paragraph(meaning, ST['sm']),
        ])
    story.append(card(elem_rows, [16*mm, 12*mm, W-58*mm, 30*mm]))
    story += [Spacer(1, 3*mm), Paragraph(saju.get('element_desc','오행 균형 해석 내용입니다.'), ST['body'])]

    # ── 03~07. 성격/직업/재물/연애/건강 심층 해석 ─────────────
    interpret = saju.get('interpret', {})
    for num, cat, emoji, color in [
        ('03','성격·기질','🌟', C['purple']),
        ('04','직업·커리어','💼', C['blue']),
        ('05','재물·투자','💰', C['gold']),
        ('06','연애·결혼','💗', C['pink']),
        ('07','건강·체질','🌿', C['green']),
    ]:
        story += sec(f'{num}.  {cat} 심층 해석')
        text = interpret.get(cat.split('·')[0].strip(), f'{cat} 심층 해석 내용입니다.')
        story.append(badge_card(emoji, f'{cat} 심층 해석', text, color))
        detail = interpret.get(cat+'_detail', '')
        if detail:
            story += [Spacer(1,2*mm), Paragraph(detail, ST['body'])]
        story.append(Spacer(1, 2*mm))

    # ── 08. 대운 분석 ────────────────────────────────────────
    story += sec('08.  대운 흐름 분석', '大運 · 60년 운명의 흐름')
    daewoon = saju.get('daewoon', [])
    if daewoon:
        dw_hdr = [Paragraph(h, ST['lbl']) for h in ['기간','간지','십성','운세 흐름']]
        dw_rows = [dw_hdr]
        for i, dw in enumerate(daewoon):
            is_cur = dw.get('is_current', False)
            bg_col = colors.HexColor('#1c2a1c') if is_cur else C['card']
            gz_color = C['green'] if is_cur else C['gold']
            dw_rows.append([
                Paragraph(('▶ ' if is_cur else '') + dw.get('age',''), S('da', fontName=BOLD_FONT if is_cur else MAIN_FONT, fontSize=9, textColor=C['green'] if is_cur else C['text'], leading=13)),
                Paragraph(f'<b>{dw.get("ganzhi","")}</b>', S('dg', fontName=BOLD_FONT, fontSize=13, textColor=gz_color, alignment=TA_CENTER)),
                Paragraph(dw.get('sipsin',''), S('ds', fontSize=8, textColor=C['muted'], alignment=TA_CENTER)),
                Paragraph(dw.get('desc',''), ST['body']),
            ])
        t = card(dw_rows, [20*mm, 16*mm, 18*mm, W-54*mm])
        story.append(t)
    story += [Spacer(1, 3*mm),
              Paragraph(saju.get('daewoon_current_desc','현재 대운 심층 분석 내용입니다.'), ST['body'])]

    # ── 09. 신살 분석 ────────────────────────────────────────
    story += sec('09.  신살 분석', '神殺 · 길신·흉신·중성')
    sinsal = saju.get('sinsal', [])
    for sin in sinsal:
        t_color = C['green'] if sin.get('type')=='길신' else (C['red'] if sin.get('type')=='흉신' else C['muted'])
        story.append(Table([[
            Paragraph(f"[{sin.get('type','')}]", S('st', fontName=BOLD_FONT, fontSize=9, textColor=t_color, leading=13)),
            Paragraph(sin.get('name',''), S('sn', fontName=BOLD_FONT, fontSize=9, textColor=C['goldlt'], leading=13)),
            Paragraph(f"📍 {sin.get('pos','')}", ST['sm']),
            Paragraph(sin.get('desc',''), ST['body']),
        ]], colWidths=[14*mm, 36*mm, 20*mm, W-70*mm],
        style=[('BACKGROUND',(0,0),(-1,-1),C['card']),('BOX',(0,0),(-1,-1),0.5,t_color),
               ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
               ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
               ('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
        story.append(Spacer(1, 2*mm))

    # ── 10. 12운성 분석 ──────────────────────────────────────
    story += sec('10.  12운성 분석', '十二運星 · 사주 각 기둥의 생명 단계')
    unseong_data = saju.get('unseong', [])
    if unseong_data:
        us_hdr = [Paragraph(h, ST['lbl']) for h in ['기둥','운성','의미','해석']]
        us_rows = [us_hdr] + [[
            Paragraph(u.get('pillar',''), ST['body']),
            Paragraph(f'<b>{u.get("name","")}</b>', S('un', fontName=BOLD_FONT, fontSize=10, textColor=C['purple'], alignment=TA_CENTER)),
            Paragraph(u.get('meaning',''), S('um', fontSize=8, textColor=C['muted'], alignment=TA_CENTER)),
            Paragraph(u.get('desc',''), ST['body']),
        ] for u in unseong_data]
        story.append(card(us_rows, [16*mm, 18*mm, 20*mm, W-54*mm]))
    story += [Spacer(1, 2*mm), Paragraph(saju.get('unseong_desc','12운성 종합 해석 내용입니다.'), ST['body'])]

    # ═════════════════════════════════════════════════════════
    # PART II · 자미두수
    # ═════════════════════════════════════════════════════════
    story += part_break('PART II · 자미두수', '紫微斗數 · 命盤 完全解析')

    # ── 11. 명반 개요 ────────────────────────────────────────
    story += sec('11.  명반 개요 및 주성 분석', '命盤 · 主星')
    palaces = ziwei.get('palaces', {})
    fate_palace = palaces.get('命宮', {})
    story += [
        labeled_card('명궁 주성', fate_palace.get('stars','—') + '  ' + fate_palace.get('ganzhi','')),
        Spacer(1, 2*mm),
        labeled_card('명반 유형', ziwei.get('chart_type','—')),
        Spacer(1, 3*mm),
        Paragraph(ziwei.get('summary','자미두수 명반 종합 해석 내용입니다.'), ST['body']),
    ]

    # ── 12. 12궁 전체 해석 ───────────────────────────────────
    story += sec('12.  12궁 전체 상세 해석', '十二宮 完全解析')
    palace_order = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮',
                    '遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮']
    palace_icons = {'命宮':'🌟','兄弟宮':'👥','夫妻宮':'💗','子女宮':'👶',
                    '財帛宮':'💰','疾厄宮':'🌿','遷移宮':'✈','交友宮':'🤝',
                    '官祿宮':'💼','田宅宮':'🏠','福德宮':'🧘','父母宮':'👨‍👩‍👧'}

    for pname in palace_order:
        p = palaces.get(pname, {'stars':'空宮','ganzhi':'','desc':'—','detail':''})
        icon = palace_icons.get(pname, '⭐')
        t = Table([[
            Paragraph(f'{icon}\n{pname}', S('pn', fontName=BOLD_FONT, fontSize=9, textColor=C['gold'], alignment=TA_CENTER, leading=13)),
            Paragraph(f'<b>{p.get("stars","空宮")}</b>', S('ps', fontName=BOLD_FONT, fontSize=10, textColor=C['goldlt'], leading=14)),
            Paragraph(p.get('ganzhi',''), S('pg2', fontSize=8, textColor=C['muted'], alignment=TA_CENTER)),
            [Paragraph(p.get('desc','—'), ST['body']),
             Paragraph(p.get('detail',''), ST['sm']) if p.get('detail') else Spacer(1,1)],
        ]], colWidths=[18*mm, 30*mm, 12*mm, W-60*mm],
        style=[('BACKGROUND',(0,0),(-1,-1),C['card']),('BOX',(0,0),(-1,-1),0.5,C['gold']),
               ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
               ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
               ('VALIGN',(0,0),(-1,-1),'TOP'),
               ('LINEAFTER',(0,0),(0,-1),0.3,C['purple']),('LINEAFTER',(1,0),(1,-1),0.3,C['line'])])
        story.append(t)
        story.append(Spacer(1, 2*mm))

    # ── 13. 사화 ─────────────────────────────────────────────
    story += sec('13.  사화 분석', '四化 · 化祿·化權·化科·化忌')
    sihua = ziwei.get('sihua', [])
    sh_colors = {'化祿':C['green'],'化權':C['gold'],'化科':C['blue'],'化忌':C['red']}
    sh_meanings = {'化祿':'재물과 인연을 불러오는 길성화','化權':'권력과 통제력을 강화하는 화성',
                   '化科':'명예와 학문을 높이는 화성','化忌':'주의와 집중이 필요한 화성'}
    for sh in sihua:
        bc = sh_colors.get(sh.get('type',''), C['muted'])
        story.append(Table([[
            Paragraph(f'<b>{sh.get("type","")}</b>', S('sc', fontName=BOLD_FONT, fontSize=11, textColor=bc, alignment=TA_CENTER, leading=14)),
            Paragraph(f'<b>{sh.get("star","")}</b>', S('ss', fontName=BOLD_FONT, fontSize=10, textColor=C['goldlt'], alignment=TA_CENTER)),
            Paragraph(f'→ {sh.get("palace","")}', S('sp', fontSize=9, textColor=C['muted'], alignment=TA_CENTER)),
            [Paragraph(sh_meanings.get(sh.get('type',''),''), ST['sm']),
             Paragraph(sh.get('desc',''), ST['body'])],
        ]], colWidths=[18*mm, 18*mm, 22*mm, W-58*mm],
        style=[('BACKGROUND',(0,0),(-1,-1),C['card']),('BOX',(0,0),(-1,-1),0.5,bc),
               ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
               ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
               ('VALIGN',(0,0),(-1,-1),'TOP')]))
        story.append(Spacer(1, 2*mm))

    # ── 14. 대한 ─────────────────────────────────────────────
    story += sec('14.  대한 운세 흐름', '大限 · 인생 10년 단위 흐름')
    dahahn = ziwei.get('dahahn', [])
    if dahahn:
        dh_hdr = [Paragraph(h, ST['lbl']) for h in ['기간','간지','명궁','운세 흐름']]
        dh_rows = [dh_hdr] + [[
            Paragraph(d.get('age',''), ST['body']),
            Paragraph(f'<b>{d.get("ganzhi","")}</b>', S('dh', fontName=BOLD_FONT, fontSize=11, textColor=C['gold'], alignment=TA_CENTER)),
            Paragraph(d.get('palace',''), S('dp', fontSize=8, textColor=C['muted'], alignment=TA_CENTER)),
            Paragraph(d.get('desc',''), ST['body']),
        ] for d in dahahn]
        story.append(card(dh_rows, [20*mm, 16*mm, 20*mm, W-56*mm]))
    story += [Spacer(1,3*mm), Paragraph(ziwei.get('dahahn_current','현재 대한 심층 해석 내용입니다.'), ST['body'])]

    # ── 15. 유년 ─────────────────────────────────────────────
    story += sec('15.  유년 운세', '流年 2026 · 올해의 운세')
    story.append(Paragraph(ziwei.get('liuyear','2026년 유년 운세 해석 내용입니다.'), ST['body']))
    liuyear_months = ziwei.get('liuyear_months', {})
    if liuyear_months:
        ly_hdr = [[Paragraph('월', ST['lbl']), Paragraph('유월간지', ST['lbl']),
                   Paragraph('입궁', ST['lbl']), Paragraph('운세', ST['lbl'])]]
        ly_rows = ly_hdr + [[
            Paragraph(lm.get('month',''), ST['body']),
            Paragraph(lm.get('ganzhi',''), S('lm', fontName=BOLD_FONT, fontSize=9, textColor=C['gold'])),
            Paragraph(lm.get('palace',''), ST['sm']),
            Paragraph(lm.get('desc',''), ST['body']),
        ] for lm in liuyear_months]
        story.append(card(ly_rows, [10*mm, 18*mm, 20*mm, W-48*mm]))

    # ═════════════════════════════════════════════════════════
    # PART III · 서양 점성술
    # ═════════════════════════════════════════════════════════
    story += part_break('PART III · 서양 점성술', 'Western Astrology · Complete Reading')

    sun_sign  = natal.get('sun_sign','—')
    moon_sign = natal.get('moon_sign','—')
    asc_sign  = natal.get('asc_sign','—')
    planets   = natal.get('planets', [])

    # ── 16. 네이탈 차트 완전 해석 ─────────────────────────────
    story += sec('16.  네이탈 차트 완전 해석', 'Natal Chart Complete Interpretation')
    story.append(Table([[
        Paragraph(f'☀ {sun_sign}',  S('sg1', fontName=BOLD_FONT, fontSize=13, textColor=C['gold'],   alignment=TA_CENTER, leading=18)),
        Paragraph(f'🌙 {moon_sign}', S('sg2', fontName=BOLD_FONT, fontSize=13, textColor=C['blue'],   alignment=TA_CENTER, leading=18)),
        Paragraph(f'⬆ {asc_sign}',  S('sg3', fontName=BOLD_FONT, fontSize=13, textColor=C['green'],  alignment=TA_CENTER, leading=18)),
    ]], colWidths=[W/3]*3,
    style=[('BACKGROUND',(0,0),(-1,-1),C['card']),('BOX',(0,0),(-1,-1),0.8,C['gold']),
           ('INNERGRID',(0,0),(-1,-1),0.3,C['purple']),
           ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
           ('ALIGN',(0,0),(-1,-1),'CENTER')]))
    story += [Spacer(1, 3*mm),
              Paragraph(natal.get('chart_overview','네이탈 차트 전체 해석 내용입니다.'), ST['body'])]

    # ── 17. 태양·달·상승궁 심층 ───────────────────────────────
    story += sec('17.  태양 · 달 · 상승궁 심층 분석')
    signs_desc = natal.get('signs_desc', {})
    for key, label, icon, col in [
        ('sun',  f'태양 별자리 — {sun_sign}',  '☀', C['gold']),
        ('moon', f'달 별자리 — {moon_sign}',   '🌙', C['blue']),
        ('asc',  f'상승궁 — {asc_sign}',       '⬆', C['green']),
    ]:
        story.append(labeled_card(f'{icon}  {label}', signs_desc.get(key,'해석 내용입니다.'), col))
        story.append(Spacer(1, 2*mm))

    # ── 18. 행성 배치 · 12하우스 ────────────────────────────
    story += sec('18.  행성 배치 및 12하우스 완전 해석')
    if planets:
        p_hdr = [Paragraph(h, ST['lbl']) for h in ['행성','별자리','도수','하우스','키워드']]
        p_rows = [p_hdr] + [[
            Paragraph(p.get('name',''), ST['body']),
            Paragraph(p.get('sign',''), ST['body']),
            Paragraph(p.get('degree',''), ST['body']),
            Paragraph(p.get('house',''), ST['body']),
            Paragraph(p.get('keyword',''), ST['sm']),
        ] for p in planets]
        story.append(card(p_rows, [18*mm, 18*mm, 12*mm, 18*mm, W-66*mm]))
    houses_desc = natal.get('houses_desc', {})
    if houses_desc:
        story += [Spacer(1, 3*mm)]
        for i in range(1, 13):
            h = houses_desc.get(str(i), '')
            if h:
                story.append(labeled_card(f'{i}하우스', h))
                story.append(Spacer(1, 1*mm))

    # ── 19~29. 점성술 16종 해석 ────────────────────────────────
    astro_sections = [
        ('19', '심리 점성학', 'Psychological Astrology',   '🧠', C['purple'], 'psych'),
        ('20', '직업 점성술', 'Career Astrology',           '💼', C['blue'],   'career'),
        ('20', '재물 점성술', 'Wealth Astrology',           '💰', C['gold'],   'wealth'),
        ('20', '연애 점성술', 'Love & Marriage Astrology',  '💗', C['pink'],   'love'),
        ('21', '트랜짓 미래운', 'Transit Forecast 2026',   '🔮', C['purple'], 'transit'),
        ('22', '솔라 리턴', 'Solar Return',                 '📅', C['orange'], 'solar'),
        ('23', '프로그레션', 'Progressions',                '🌙', C['blue'],   'progression'),
        ('24', '카르마·영혼 해석', 'Karma & Soul',          '✨', C['purple'], 'karma'),
        ('25', '역행 행성 해석', 'Retrograde Planets',      '🔄', C['muted'],  'retrograde'),
        ('26', '건강 점성학', 'Medical Astrology',          '🏥', C['green'],  'health_astro'),
        ('27', '12하우스 전체 해석', 'All 12 Houses',       '🏠', C['blue'],   'all_houses'),
        ('28', '행성 각도 심층 해석', 'Aspects Analysis',   '⚡', C['orange'], 'aspects'),
        ('29', '아스트로카토그래피', 'Astrocartography',    '🌍', C['green'],  'astrocarto'),
    ]

    astro_data = natal.get('extended', {})
    for num, title, en_title, icon, col, key in astro_sections:
        text = astro_data.get(key, f'{title} 심층 해석 내용입니다.')
        story += sec(f'{num}.  {title}', en_title)
        story.append(badge_card(icon, title, text, col))
        story.append(Spacer(1, 2*mm))

    # ═════════════════════════════════════════════════════════
    # PART IV · 종합 분석
    # ═════════════════════════════════════════════════════════
    story += part_break('PART IV · 종합 분석', '사주 · 자미두수 · 점성술 통합 해석')

    # ── 30. 삼중 시선 종합 ────────────────────────────────────
    summary = data.get('summary', {})
    story += sec('30.  삼중 시선 종합 운세 해석', 'Trinity Analysis')
    story.append(Paragraph(summary.get('lifetime','종합 해석 내용입니다.'), ST['body']))
    story.append(Spacer(1, 4*mm))
    story += subsec('⭐ 2026년 핵심 운세')
    year_items = [
        ('사주', summary.get('year_saju','사주 연운 내용')),
        ('자미두수', summary.get('year_ziwei','자미두수 연운 내용')),
        ('점성술', summary.get('year_natal','점성술 연운 내용')),
    ]
    year_rows = [[Paragraph(s, ST['lbl']), Paragraph(d, ST['body'])] for s, d in year_items]
    story.append(card(year_rows, [20*mm, W-20*mm]))

    # ── 31. 월별 운세 ─────────────────────────────────────────
    story += sec('31.  월별 운세 가이드', '2026 Monthly Fortune Guide')
    monthly = data.get('monthly_2026', {str(m): f'{m}월 운세 내용입니다.' for m in range(1,13)})
    m_hdr = [[Paragraph('월', ST['lbl']), Paragraph('핵심 테마', ST['lbl']), Paragraph('운세 가이드', ST['lbl'])]]
    m_rows = m_hdr + [[
        Paragraph(f'<b>{m}월</b>', S('mth', fontName=BOLD_FONT, fontSize=10, textColor=C['gold'], alignment=TA_CENTER)),
        Paragraph(monthly.get(f'{m}_theme', f'{m}월'), S('mt', fontName=BOLD_FONT, fontSize=8, textColor=C['purple'], alignment=TA_CENTER, leading=11)),
        Paragraph(monthly.get(str(m), '—'), ST['body']),
    ] for m in range(1, 13)]
    story.append(card(m_rows, [10*mm, 22*mm, W-32*mm]))

    # ── 32. 인생 조언 ─────────────────────────────────────────
    story += sec('32.  인생 조언 및 개운법', 'Life Advice & Fortune Enhancement')
    advice = data.get('advice', {})
    story.append(Paragraph(advice.get('summary','인생 조언 내용입니다.'), ST['body']))
    story.append(Spacer(1, 4*mm))
    adv_items = [
        ('🧭 길방 (吉方)', advice.get('direction','')),
        ('🎨 행운의 색상', advice.get('color','')),
        ('💎 수호석',      advice.get('stone','')),
        ('📅 행운의 날',   advice.get('lucky_day','')),
        ('🍃 개운 행동',   advice.get('action','')),
    ]
    for label, text in adv_items:
        if text:
            story.append(labeled_card(label, text))
            story.append(Spacer(1, 1.5*mm))

    # ── 마무리 ───────────────────────────────────────────────
    story += [
        Spacer(1, 8*mm),
        hr(C['gold'], 0.8),
        Spacer(1, 4*mm),
        Paragraph('본 리포트는 전통 명리학·자미두수·서양 점성술을 기반으로 작성되었습니다.', ST['ctr']),
        Paragraph('운명은 참고 지표이며, 최종 선택은 항상 본인에게 있습니다.', ST['ctr']),
        Spacer(1, 3*mm),
        Paragraph('© 2026 Trinity of Destiny · All Rights Reserved', ST['ctr']),
    ]

    doc.build(story, onFirstPage=draw_bg, onLaterPages=draw_bg)
    open(os.devnull, 'w').write(f'Done: {output_path}')
    import sys as _sys
    _sys.stdout.buffer.write(f'PDF generated: {output_path}\n'.encode('utf-8'))
    return output_path


# ── 샘플 데이터로 테스트 ──────────────────────────────────────
if __name__ == '__main__':
    sample = {
        'name': '홍길동',
        'birth_date': '1990년 3월 15일 (양력)',
        'birth_time': '오시 (午時, 11:00~13:00)',
        'birth_place': '서울특별시',
        'gender': '남성',
        'report_date': '2026년 6월 1일',

        'saju': {
            'pillars': [
                {'stem':'壬','branch':'午','sipsin_top':'편인','sipsin_bot':'비견','unseong':'장생'},
                {'stem':'甲','branch':'子','sipsin_top':'일간','sipsin_bot':'정재','unseong':'사'},
                {'stem':'丁','branch':'卯','sipsin_top':'식신','sipsin_bot':'겁재','unseong':'목욕'},
                {'stem':'庚','branch':'午','sipsin_top':'편관','sipsin_bot':'비견','unseong':'장생'},
            ],
            'pillar_quote': '甲木 일간은 봄의 큰 나무처럼 위로 뻗어 오르는 기상을 지닙니다. 庚金 년간과 충(沖)을 이루어 내면에 긴장감과 도전 정신이 공존하며, 丁火 식신이 월간에서 재성을 생하는 구조로 전문 기술 기반의 성취가 예상됩니다.',
            'daymaster_desc': '甲木(갑목)은 십천간 중 첫 번째로, 양목(陽木)의 기운을 지닙니다. 봄의 대목(大木)처럼 하늘을 향해 곧게 뻗어 오르는 성질로, 리더십과 개척 정신이 탁월합니다. 강인한 생명력과 진취적 기상으로 어떤 환경에서도 성장하는 특성을 보입니다.',
            'yongsin': {
                'yong': '丁火 (정화) — 식신',
                'hee':  '壬水 (임수) — 편인',
                'gi':   '庚金 (경금) — 편관',
                'desc': '丁火 식신이 용신으로, 전문 기술과 창의력을 통해 재물을 창출하는 구조입니다. 壬水 편인이 희신으로 학문과 지식을 통한 성장을 지원합니다. 庚金 편관은 기신으로, 과도한 경쟁과 스트레스를 주의해야 합니다.',
            },
            'elements': {'목':35,'화':20,'토':10,'금':20,'수':15},
            'element_desc': '목(木) 기운이 35%로 가장 강하여 일간 甲木의 기운이 왕성합니다. 화(火) 20%와 금(金) 20%가 균형을 이루고 있으나, 토(土) 기운이 10%로 부족하여 현실적 안정감과 신중함을 보완할 필요가 있습니다.\n\n개운 방향: 황색·갈색 계열 의류 착용, 흙·돌 소재 인테리어, 중앙 방위 활용을 권합니다.',
            'interpret': {
                '성격': '甲木 일간은 타고난 리더십과 강한 개척 정신의 소유자입니다. 정직하고 직선적인 성격으로 타인에게 신뢰를 주며, 새로운 것을 시작하고 도전하는 데 두려움이 없습니다. 다만 지나친 자존심으로 인해 타인과의 갈등이 생길 수 있으니, 유연성을 기르는 것이 중요합니다.',
                '성격_detail': '식신(食神) 丁火가 월주에 위치하여 창의적이고 표현력이 풍부한 면모도 갖추고 있습니다. 예술·교육·강연 분야에서 자신의 재능을 자연스럽게 발휘할 수 있습니다.',
                '직업': '관성(官星) 庚金이 년간에 위치하여 조직·공직과의 인연이 깊습니다. 식신 丁火가 재성을 생하는 구조로 전문 기술 기반 창업이 유리하며, IT·교육·컨설팅·연구 분야에서 두각을 나타냅니다.',
                '직업_detail': '대운의 흐름상 30대 중반까지 전문성을 쌓는 시기이며, 40대 이후 독립 사업이나 전문직 개설이 가장 유리합니다. 협력보다는 독자적 전문 영역 구축이 더 큰 성취를 가져옵니다.',
                '재물': '재성이 시주에 위치하여 노년에 재물이 모이는 구조입니다. 부동산보다 기술·지식 기반 수익이 더 유리하며, 50대 이후 안정적 재물 축적이 기대됩니다.',
                '재물_detail': '식신생재(食神生財) 구조로 꾸준한 기술 연마가 재물로 이어집니다. 충동적 투자나 단기 수익보다 장기적 관점의 자산 관리가 효과적이며, 지적 재산권이나 컨텐츠 수익이 특히 유리합니다.',
                '연애': '일지 子水 정재가 배우자 자리에 앉아 경제적으로 안정된 배우자와의 인연이 강합니다. 卯年·亥年에 인연이 강하게 작용합니다.',
                '연애_detail': '감정 표현이 직접적이고 솔직한 편이나, 때로는 상대방의 감정적 필요를 놓칠 수 있습니다. 배우자는 현실적이고 안정적인 성향을 선호하며, 경제적 안정을 중시하는 파트너와 잘 맞습니다.',
                '건강': '甲木은 간(肝)·담(膽)과 연관됩니다. 庚金의 극으로 스트레스성 간 기능 저하에 주의하세요. 규칙적 운동과 충분한 수면이 핵심입니다.',
                '건강_detail': '봄철과 목(木) 기운이 강한 시기에는 에너지가 넘치지만, 과로에 주의해야 합니다. 간 건강을 위한 규칙적인 식사와 음주 절제가 중요하며, 근골격계 부상을 예방하기 위해 스트레칭을 꾸준히 하세요.',
            },
            'daewoon': [
                {'age':'1~10세', 'ganzhi':'丙寅', 'sipsin':'인성', 'desc':'인성 대운 — 학업 기초 형성, 부모의 보호 아래 안정적 성장기'},
                {'age':'11~20세','ganzhi':'乙丑', 'sipsin':'비겁', 'desc':'비겁 대운 — 또래 관계 확장, 경쟁 심화, 자아 정체성 형성'},
                {'age':'21~30세','ganzhi':'甲子', 'sipsin':'비겁', 'desc':'비겁 대운 — 독립심 강화, 사업·창업 도전 의지 상승', 'is_current': True},
                {'age':'31~40세','ganzhi':'癸亥', 'sipsin':'인성', 'desc':'인성 대운 — 학문·자격증 취득, 내면 성장, 귀인 등장'},
                {'age':'41~50세','ganzhi':'壬戌', 'sipsin':'식신', 'desc':'식신 대운 — 전문성 절정, 사회적 인정, 수입 증가'},
                {'age':'51~60세','ganzhi':'辛酉', 'sipsin':'정관', 'desc':'정관 대운 — 조직 내 승진·명예, 안정적 커리어 마무리'},
            ],
            'daewoon_current_desc': '현재 甲子 대운은 일간과 동일한 甲木이 겹치는 비겁(比劫) 대운으로, 강한 독립 의지와 자기 주도적 행동력이 극대화되는 시기입니다. 子水 대운지는 일지 子水와 복음(伏吟)을 이루어 내면의 갈등과 성찰이 깊어집니다. 이 시기의 핵심 과제는 경쟁과 협력의 균형입니다.',
            'sinsal': [
                {'type':'길신','name':'천을귀인 (天乙貴人)','pos':'년주·월주','desc':'하늘이 내린 귀인의 기운. 위기 상황에서 뜻밖의 도움이 찾아오고, 귀한 인연과의 만남이 많습니다. 특히 직업·사업 분야에서 든든한 후원자가 나타납니다.'},
                {'type':'길신','name':'문창귀인 (文昌貴人)','pos':'일주','desc':'학문과 시험의 귀인. 글쓰기, 강의, 연구 분야에서 탁월한 재능을 발휘하며, 자격증·시험 운이 강합니다.'},
                {'type':'길신','name':'월덕귀인 (月德貴人)','pos':'월주','desc':'월의 덕을 받아 매월 관재와 액운이 자연스럽게 해소됩니다. 법적 분쟁이나 갑작스러운 문제에서 보호받습니다.'},
                {'type':'흉신','name':'백호살 (白虎殺)','pos':'월주','desc':'사고·수술에 주의가 필요합니다. 하지만 이 살은 동시에 강한 추진력과 결단력의 원천이 되기도 합니다. 의료·군경·스포츠 분야에서는 오히려 유리합니다.'},
                {'type':'중성','name':'역마살 (驛馬殺)','pos':'년주','desc':'이동과 변화가 많은 삶을 의미합니다. 해외 활동이나 이직·이사가 잦을 수 있으며, 이 에너지를 잘 활용하면 넓은 세계 무대에서 활약할 수 있습니다.'},
            ],
            'unseong': [
                {'pillar':'시주', 'name':'장생', 'meaning':'생기가 시작되는 단계', 'desc':'노년의 복록. 말년에 귀인의 도움으로 편안한 삶을 누립니다.'},
                {'pillar':'일주', 'name':'사(死)', 'meaning':'기운이 쉬는 단계', 'desc':'일간의 사(死)는 오히려 깊은 사색과 직관력을 부여합니다. 집중력이 뛰어나며 연구·분석 분야에서 두각을 나타냅니다.'},
                {'pillar':'월주', 'name':'목욕', 'meaning':'정화와 변화의 단계', 'desc':'변화와 새로운 시작의 에너지. 청년기에 다양한 경험을 쌓으며 자신만의 색깔을 찾아갑니다.'},
                {'pillar':'년주', 'name':'장생', 'meaning':'생기가 시작되는 단계', 'desc':'조상의 덕이 있고 어린 시절 안정적인 환경에서 성장합니다.'},
            ],
            'unseong_desc': '일주 사(死)와 월주 목욕(沐浴)의 조합은 겉으로는 조용해 보이지만 내면에 강렬한 에너지를 품고 있는 특성을 보입니다. 변화를 통해 성장하는 타입으로, 안정보다는 도전 속에서 진면목이 드러납니다.',
        },

        'ziwei': {
            'chart_type': '火六局 · 紫微天府同宮',
            'summary': '자미성과 천부성이 명궁에 동궁하는 자부동궁(紫府同宮) 구조는 자미두수에서 가장 귀한 배치 중 하나입니다. 이는 강한 리더십과 안정적 재물 축적 능력을 동시에 부여합니다. 관록궁의 염정·칠살 조합은 강한 추진력으로 중년 이후 큰 사회적 성취를 예고하며, 재백궁의 무곡·탐랑은 금융·투자 분야에서의 탁월한 재물 운을 나타냅니다.',
            'palaces': {
                '命宮':   {'stars':'紫微 · 天府','ganzhi':'戊子','desc':'제왕의 기질, 강한 리더십과 카리스마. 큰 조직의 수장에 적합합니다.','detail':'자미성의 위엄과 천부성의 안정감이 결합되어 타인에게 자연스러운 권위와 신뢰를 줍니다.'},
                '兄弟宮': {'stars':'天機','ganzhi':'己丑','desc':'형제와 지적 교류 활발. 총명한 형제 인연.','detail':'천기성의 영향으로 형제가 지적이고 민첩한 성향입니다.'},
                '夫妻宮': {'stars':'天同 · 太陰','ganzhi':'庚寅','desc':'온화하고 감성적인 배우자. 결혼 후 안정적 가정 형성.','detail':'배우자는 예술적 감수성이 풍부하고 가정을 중시하는 성향입니다.'},
                '子女宮': {'stars':'太陽','ganzhi':'辛卯','desc':'밝고 활동적인 자녀. 자녀의 사회적 성공 기대.','detail':'태양성의 영향으로 자녀가 사교적이고 지도자적 기질을 지닙니다.'},
                '財帛宮': {'stars':'武曲 · 貪狼','ganzhi':'壬辰','desc':'탁월한 재물 획득 능력. 40대 이후 재물운 절정.','detail':'무곡성의 재물력과 탐랑성의 욕망이 결합, 금융·사업 분야에서 큰 수익을 창출합니다.'},
                '疾厄宮': {'stars':'巨門','ganzhi':'癸巳','desc':'소화기계·구강 건강 주의. 정신적 스트레스 관리 필요.','detail':'거문성의 영향으로 과식이나 구강 질환에 특히 주의가 필요합니다.'},
                '遷移宮': {'stars':'天相','ganzhi':'甲午','desc':'해외 활동에서 귀인 도움. 이민·유학·해외 사업 유리.','detail':'천상성의 보호 기운으로 해외에서 귀인을 만나 큰 기회를 얻습니다.'},
                '交友宮': {'stars':'天梁','ganzhi':'乙未','desc':'연장자·스승 귀인 인연. 인맥으로 큰 기회 획득.','detail':'천량성의 선배 귀인 기운으로 스승이나 선배의 강력한 후원을 받습니다.'},
                '官祿宮': {'stars':'廉貞 · 七殺','ganzhi':'丙申','desc':'강한 승부욕과 경쟁력. 중년 이후 큰 성취.','detail':'염정칠살 조합은 강렬한 추진력과 경쟁심으로 어떤 분야에서든 정상을 목표로 합니다.'},
                '田宅宮': {'stars':'破軍','ganzhi':'丁酉','desc':'부동산 변동 잦음. 결국 좋은 환경에 정착.','detail':'파군성의 변화 기운으로 여러 번의 이사 후 최종적으로 좋은 부동산에 정착합니다.'},
                '福德宮': {'stars':'文昌 · 文曲','ganzhi':'戊戌','desc':'학문적 복덕 풍부. 노년 정신적 풍요로움.','detail':'문창문곡 쌍성의 영향으로 학문과 예술에서 큰 복덕을 누리며 노년이 풍요롭습니다.'},
                '父母宮': {'stars':'左輔 · 右弼','ganzhi':'己亥','desc':'부모의 충분한 지원. 가문 후광의 도움.','detail':'좌보우필 보좌성의 영향으로 부모와 집안의 든든한 지원을 받습니다.'},
            },
            'sihua': [
                {'type':'化祿','star':'太陽','palace':'官祿宮','desc':'직업·사업에서 재물의 흐름이 강화됩니다. 공적 활동에서 수입이 발생하며 사회적 명성이 높아집니다.'},
                {'type':'化權','star':'太陰','palace':'財帛宮','desc':'재물 통제력과 부동산 운이 강화됩니다. 재물에 대한 통찰력이 뛰어나 투자에서 좋은 결과를 얻습니다.'},
                {'type':'化科','star':'文曲','palace':'命宮','desc':'학문·명예 운이 상승하고 귀인의 도움이 있습니다. 전문 지식으로 사회적 인정을 받습니다.'},
                {'type':'化忌','star':'文昌','palace':'父母宮','desc':'부모와의 관계에서 소통에 주의가 필요합니다. 서류·계약·문서 관련 사항을 꼼꼼히 확인하세요.'},
            ],
            'dahahn': [
                {'age':'3~12세', 'ganzhi':'己亥', 'palace':'父母宮', 'desc':'부모의 보살핌 속에 안정적 성장. 학업 기초를 다지는 시기.'},
                {'age':'13~22세','ganzhi':'戊戌', 'palace':'福德宮', 'desc':'학문과 예술적 재능 개화. 자격증·시험 운이 강한 시기.'},
                {'age':'23~32세','ganzhi':'丁酉', 'palace':'田宅宮', 'desc':'독립과 자립의 시기. 주거 변화가 있을 수 있으나 최종 안정.', 'is_current': True},
                {'age':'33~42세','ganzhi':'丙申', 'palace':'官祿宮', 'desc':'커리어 최대 전성기. 사업·직업에서 큰 성취와 도약.'},
                {'age':'43~52세','ganzhi':'乙未', 'palace':'交友宮', 'desc':'인맥과 협력의 시기. 귀인의 도움으로 새로운 기회 창출.'},
                {'age':'53~62세','ganzhi':'甲午', 'palace':'遷移宮', 'desc':'해외 활동·이주 기회. 넓은 세계 무대에서 활약.'},
            ],
            'dahahn_current': '현재 丁酉 대한은 田宅宮(전택궁)이 활성화되는 시기로, 주거와 부동산 관련 변화가 일어나는 시기입니다. 파군성의 혁신 에너지로 기존의 틀을 깨고 새로운 방향을 모색하는 과정에서 일시적 불안정이 있을 수 있으나, 결국 더 좋은 환경으로의 발전이 예상됩니다.',
            'liuyear': '2026년(丙午年)은 관록궁이 활성화되는 해로, 커리어에서 중요한 전환점이 찾아옵니다. 化祿이 관록궁에 들어와 직업적 기회가 증가하며, 특히 상반기에 중요한 결정을 내릴 기회가 찾아옵니다.',
            'liuyear_months': [
                {'month':'1월','ganzhi':'壬寅','palace':'遷移宮','desc':'새해 시작. 해외 인연이나 원거리 기회에 주목하세요.'},
                {'month':'2월','ganzhi':'癸卯','palace':'交友宮','desc':'인맥 활성화. 중요한 만남이 예정되어 있습니다.'},
                {'month':'3월','ganzhi':'甲辰','palace':'官祿宮','desc':'커리어 핵심 시기. 중요한 업무 결정에 집중하세요.'},
                {'month':'4월','ganzhi':'乙巳','palace':'田宅宮','desc':'주거 관련 변화. 이사나 인테리어 시기로 좋습니다.'},
                {'month':'5월','ganzhi':'丙午','palace':'福德宮','desc':'정신적 충전의 달. 여행이나 휴식으로 에너지를 보충하세요.'},
                {'month':'6월','ganzhi':'丁未','palace':'父母宮','desc':'가족 관계에 집중. 부모님 건강 챙기기에 좋은 시기.'},
                {'month':'7월','ganzhi':'戊申','palace':'命宮','desc':'개인 역량 극대화 시기. 중요한 도전과 결정을 내리세요.'},
                {'month':'8월','ganzhi':'己酉','palace':'兄弟宮','desc':'형제·동료와의 협력. 팀워크로 큰 성과를 거둡니다.'},
                {'month':'9월','ganzhi':'庚戌','palace':'夫妻宮','desc':'파트너십 강화. 배우자나 사업 파트너와의 관계가 중요합니다.'},
                {'month':'10월','ganzhi':'辛亥','palace':'子女宮','desc':'창의적 활동의 달. 새로운 아이디어를 실행에 옮기세요.'},
                {'month':'11월','ganzhi':'壬子','palace':'財帛宮','desc':'재물 운 상승. 투자나 수입 증가 기회를 포착하세요.'},
                {'month':'12월','ganzhi':'癸丑','palace':'疾厄宮','desc':'건강 관리 집중. 한 해 마무리와 내년 준비에 집중하세요.'},
            ],
        },

        'natal': {
            'sun_sign': '쌍둥이자리',
            'moon_sign': '전갈자리',
            'asc_sign': '물고기자리',
            'chart_overview': '쌍둥이자리 태양, 전갈자리 달, 물고기자리 상승의 조합은 지적 탐구(쌍둥이), 깊은 내면 세계(전갈), 신비로운 첫인상(물고기)이 어우러진 복합적 성격을 만들어냅니다. 세 별자리 모두 유연성과 적응력이 강하며, 외면적 사교성과 내면적 깊이가 공존하는 독특한 개성을 지닙니다.',
            'signs_desc': {
                'sun': '쌍둥이자리 태양은 지적 호기심과 다재다능함의 상징입니다. 4하우스에 위치하여 가정과 뿌리에 대한 지적 탐구가 삶의 중심이 됩니다. 변화를 즐기고 새로운 아이디어를 끊임없이 생성하는 창의적 사고방식으로 다양한 분야에서 두각을 나타냅니다. 언어와 소통에 천부적 재능을 지니며, 가르치고 나누는 행위에서 큰 만족감을 얻습니다.',
                'moon': '전갈자리 달은 강렬하고 깊은 감정 세계를 나타냅니다. 표면적으로 냉정해 보이지만 내면에 격렬한 감정의 파도가 흐릅니다. 직관력이 매우 강하여 타인의 숨겨진 의도를 꿰뚫어 봅니다. 8하우스 위치로 삶과 죽음, 변환의 주제가 감정적 핵심이며, 깊은 신뢰를 쌓은 관계에서만 진정한 자신을 드러냅니다.',
                'asc': '물고기자리 상승궁은 타인에게 신비롭고 몽환적인 첫인상을 줍니다. 공감 능력이 뛰어나고 예술적 감수성이 풍부합니다. 해왕성의 영향으로 영적 관심사와 직관적 통찰력이 발달해 있으며, 타인의 고통에 민감하게 반응하는 치유자적 기질도 지니고 있습니다.',
            },
            'planets': [
                {'name':'☀ 태양','sign':'쌍둥이','degree':'24°','house':'4하우스','keyword':'가정·뿌리에 대한 지적 탐구'},
                {'name':'🌙 달','sign':'전갈','degree':'7°','house':'8하우스','keyword':'심층 감정, 변환과 재생의 에너지'},
                {'name':'☿ 수성','sign':'쌍둥이','degree':'18°','house':'4하우스','keyword':'가정 내 소통, 부동산 관련 계약'},
                {'name':'♀ 금성','sign':'황소','degree':'3°','house':'2하우스','keyword':'물질적 안정 추구, 감각적 쾌락'},
                {'name':'♂ 화성','sign':'양','degree':'29°','house':'2하우스','keyword':'강한 재물 추진력, 충동적 소비 주의'},
                {'name':'♃ 목성','sign':'게','degree':'12°','house':'5하우스','keyword':'창의적 확장, 자녀 복, 로맨스 행운'},
                {'name':'♄ 토성','sign':'염소','degree':'5°','house':'11하우스','keyword':'사회적 목표 달성, 인맥 구축의 책임'},
                {'name':'♅ 천왕성','sign':'염소','degree':'8°','house':'11하우스','keyword':'사회 변혁, 독창적 아이디어로 인정'},
                {'name':'♆ 해왕성','sign':'염소','degree':'14°','house':'11하우스','keyword':'이상적 커뮤니티, 영적 인맥'},
                {'name':'♇ 명왕성','sign':'전갈','degree':'16°','house':'9하우스','keyword':'철학적 변혁, 해외에서의 깊은 변화'},
            ],
            'houses_desc': {
                '1': '물고기자리 1하우스 — 신비롭고 예술적인 외모와 첫인상. 타인에게 꿈꾸는 듯한 이미지를 줍니다.',
                '2': '양자리 2하우스 — 재물에 대한 강한 의지와 추진력. 적극적으로 수입을 창출하는 성향.',
                '3': '황소자리 3하우스 — 꾸준하고 안정적인 소통 방식. 실용적이고 감각적인 학습 스타일.',
                '4': '쌍둥이자리 4하우스 — 지적인 가정 환경. 여러 번의 이사나 다양한 가족 배경.',
                '5': '게자리 5하우스 — 감성적이고 보호적인 창의성. 자녀에 대한 강한 애착.',
                '6': '사자자리 6하우스 — 자존감 높은 일 처리 방식. 직장에서 리더십 발휘.',
                '7': '처녀자리 7하우스 — 분석적이고 실용적인 파트너십. 완벽주의적 배우자 상.',
                '8': '전갈자리 8하우스 — 심층적 변환 에너지. 타인의 자원 관리 능력 탁월.',
                '9': '사수자리 9하우스 — 철학적 탐구와 해외 여행 선호. 고등 교육과 종교에 관심.',
                '10': '염소자리 10하우스 — 체계적이고 지속적인 커리어 구축. 사회적 성공 지향.',
                '11': '물병자리 11하우스 — 독창적이고 인도주의적 인맥. 혁신적 사회 활동.',
                '12': '물고기자리 12하우스 — 깊은 영적 세계와 무의식. 혼자만의 시간에서 에너지 충전.',
            },
            'extended': {
                'psych': '쌍둥이 태양(4하우스)과 전갈 달(8하우스)의 조합은 표면적 경쾌함 뒤에 깊은 심리적 복잡성을 숨기고 있습니다. 어린 시절 가정 환경에서 감정적 안정을 충분히 받지 못했을 수 있으며, 이로 인해 감정을 지적으로 처리하려는 경향이 있습니다. 내면의 전갈 달은 강렬한 감정 변화를 경험하며, 이를 쌍둥이 태양이 언어와 소통으로 표현하려 합니다.',
                'career': '10하우스 MC(미드헤븐)가 염소자리에 위치하여 체계적이고 전문적인 커리어를 지향합니다. 태양이 4하우스에 위치하므로 재택근무나 가정 기반 사업이 유리하며, 목성이 5하우스에서 창의적 확장을 지원합니다. IT, 미디어, 교육, 컨설팅, 부동산 관련 분야에서 특히 두각을 나타냅니다.',
                'wealth': '금성이 황소 2하우스에 위치하여 물질적 안정에 대한 강한 욕구가 있습니다. 화성도 같은 2하우스에 있어 재물 추진력이 강하지만 충동적 소비에 주의해야 합니다. 명왕성이 9하우스에서 해외 관련 재물 변화를 의미하며, 해외 사업이나 투자에서 큰 변화와 수익이 예상됩니다.',
                'love': '7하우스 처녀자리는 분석적이고 실용적인 파트너를 원함을 나타냅니다. 배우자는 지적이고 성실한 성향이며, 건강과 청결에 관심이 많은 사람일 가능성이 높습니다. 금성이 황소자리에 위치하여 안정적이고 감각적인 사랑을 추구하며, 물질적·정서적 안정감을 중시합니다.',
                'transit': '2026년 목성이 쌍둥이자리를 통과하며 태양과 합(Conjunction)을 형성합니다. 이는 10년에 한 번 찾아오는 개인적 확장의 기회로, 새로운 시작·기회·성장이 집중되는 해입니다. 특히 6~9월에 목성이 태양과 정확한 합을 이루는 시기에 중요한 결정을 내리세요.',
                'solar': '2026년 솔라 리턴 차트에서 태양이 10하우스 근처에 위치하여 커리어와 사회적 성취에 집중되는 한 해임을 나타냅니다. 올해의 핵심 테마는 직업적 인정과 사회적 위상 강화이며, 새로운 전문 분야 개척이나 승진 기회가 찾아올 것입니다.',
                'progression': '진행 태양이 게자리로 이동하면서 감정적 성숙과 가정·뿌리에 대한 깊은 성찰의 시기를 맞이하고 있습니다. 진행 달이 물병자리를 통과하며 독립적이고 혁신적인 감정 표현 방식을 탐구합니다. 이 시기는 내면의 변화가 외적 행동으로 자연스럽게 드러나는 전환점입니다.',
                'karma': '북쪽 노드가 게자리 5하우스에 위치하여, 이번 생의 영혼 과제는 창의적 표현과 진정한 기쁨의 발견입니다. 남쪽 노드가 나타내는 전생 패턴인 지적 분석(염소자리, 11하우스)에서 벗어나 마음이 이끄는 창의적 활동에 투자하세요. 키론이 전갈자리에 위치하여 변화와 상실을 통해 치유하는 여정을 가리킵니다.',
                'retrograde': '토성, 천왕성, 해왕성이 출생 차트에서 역행 중으로, 이 행성들의 에너지가 내면화되어 있습니다. 역행 토성은 규율과 책임감을 내면에서부터 스스로 구축하는 능력을 의미하며, 역행 천왕성은 독창적 아이디어가 시대를 앞서가는 특성을 나타냅니다.',
                'health_astro': '6하우스 사자자리와 1하우스 물고기자리의 조합은 심장·순환계(사자자리)와 발·면역계(물고기자리)에 주의가 필요함을 나타냅니다. 전갈 달(8하우스)은 생식기·내분비계 건강에 주의를 요합니다. 규칙적인 유산소 운동과 충분한 수분 섭취가 건강 유지의 핵심입니다.',
                'all_houses': '1하우스(자아): 물고기자리 — 신비롭고 공감 능력이 뛰어난 첫인상\n2하우스(재물): 양자리 — 적극적 재물 추구, 빠른 결정력\n3하우스(소통): 황소자리 — 안정적이고 실용적인 커뮤니케이션\n4하우스(가정): 쌍둥이자리 — 지적 가정 환경, 다양한 이사 경험\n5하우스(창의): 게자리 — 감성적 창작, 자녀에 대한 깊은 사랑\n6하우스(직업): 사자자리 — 리더십으로 일하는 스타일\n7하우스(파트너십): 처녀자리 — 분석적이고 실용적인 파트너\n8하우스(변환): 전갈자리 — 심층 변화, 타인 자원 관리 능력\n9하우스(철학): 사수자리 — 자유로운 철학 탐구, 해외 인연\n10하우스(커리어): 염소자리 — 체계적 성공 추구, 전문직 지향\n11하우스(사회): 물병자리 — 혁신적 인맥, 인류애적 활동\n12하우스(영성): 물고기자리 — 깊은 영적 세계, 직관적 통찰',
                'aspects': '주요 각도 분석:\n☀ 태양 합(Conjunction) ☿ 수성 — 언어와 지성의 강화, 탁월한 표현력\n🌙 달 합 ♇ 명왕성 — 강렬한 감정 변화, 심리적 깊이\n♀ 금성 삼각(Trine) ♄ 토성 — 안정적이고 지속적인 사랑, 실용적 심미안\n♂ 화성 사각(Square) ♃ 목성 — 과도한 추진력, 균형 잡힌 행동 필요\n♄ 토성 합 ♅ 천왕성 — 전통과 혁신의 긴장, 혁신적 구조 구축',
                'astrocarto': '아스트로카토그래피 분석:\n태양선이 통과하는 지역 — 동아시아(한국·일본) 커리어와 자기 표현에 유리한 지역\nASC선 교차점 — 동남아시아 개인 브랜딩과 새로운 시작에 최적\n목성선 — 북아메리카(캐나다·서부 미국) 교육·사업 확장에 탁월\n금성선 — 유럽(프랑스·이탈리아) 연애·예술 활동에 유리한 지역\n토성선 주의 — 중동 지역 과도한 책임감으로 스트레스 가능성',
            },
        },

        'summary': {
            'lifetime': '세 가지 동양·서양 운명학의 관점을 종합하면, 강한 지적 능력과 리더십을 바탕으로 중년 이후 큰 성취를 이루는 삶의 궤적을 가지고 있습니다. 사주의 甲木 일간은 진취적 기상과 개척 정신을, 자미두수의 紫微星은 제왕적 리더십을, 점성술의 쌍둥이자리 태양은 지식과 소통을 통한 성장을 가리킵니다. 세 시스템 모두 "지식과 소통을 통한 성장"이라는 공통 주제를 향하고 있습니다.',
            'year_saju': '丙午년 대운 전환기로 식신 丁火의 기운이 강화되어 전문성이 빛을 발합니다. 특히 상반기에 새로운 기회의 문이 열립니다.',
            'year_ziwei': '관록궁 화록(化祿) 활성화로 커리어에서 중요한 도약의 기회가 찾아옵니다. 6~9월이 가장 강한 길운 구간입니다.',
            'year_natal': '목성이 쌍둥이자리를 통과하며 태양과 합(Conjunction)을 형성, 10년에 한 번 찾아오는 확장의 기회입니다.',
        },
        'monthly_2026': {
            '1': '새해 시작과 함께 커리어에서 새로운 기회의 씨앗이 뿌려집니다.', '1_theme': '새 시작',
            '2': '내면 성찰과 준비의 달. 무리한 결정보다 역량 강화에 집중하세요.', '2_theme': '준비',
            '3': '봄의 기운으로 재물 운 상승. 새 프로젝트 시작에 최적의 시기.', '3_theme': '도약',
            '4': '귀인 등장. 인맥 관리와 네트워킹에 적극적으로 임하세요.', '4_theme': '귀인',
            '5': '건강 관리 집중. 과로를 피하고 충분한 휴식이 중요합니다.', '5_theme': '건강',
            '6': '최고의 길운 시작. 중요한 결정과 도전에 최적의 시기.', '6_theme': '절정',
            '7': '길운 지속. 사업 확장이나 이직 등 큰 변화를 시도할 만합니다.', '7_theme': '확장',
            '8': '재물 운의 절정. 투자 기회를 놓치지 마세요.', '8_theme': '재물',
            '9': '삼합 길운 마무리. 이룬 것을 안정화하는 데 집중하세요.', '9_theme': '안정화',
            '10': '내실 다지기. 관계 회복과 건강 점검에 좋은 달.', '10_theme': '점검',
            '11': '학업·자격증 취득에 유리. 지식 투자의 시기.', '11_theme': '학습',
            '12': '한 해 마무리와 내년 준비. 감사와 성찰로 한 해를 닫으세요.', '12_theme': '마무리',
        },
        'advice': {
            'summary': '당신의 가장 큰 강점은 다양한 분야를 연결하는 통합적 사고력입니다. 한 가지에 집중하기보다 여러 분야를 융합하는 방향으로 커리어를 설계하면 독보적인 위치를 차지할 수 있습니다. 지식을 나누고 가르치는 활동이 가장 큰 성취감과 재물을 가져다줍니다.',
            'direction': '동쪽·남동쪽이 길방(吉方)입니다. 책상을 동쪽으로 배치하고, 새로운 시작은 동쪽을 향해 하세요.',
            'color': '초록·청록 계열이 행운의 색입니다. 의류·소품에 활용하고, 실내에 식물을 키우면 목(木) 기운이 강화됩니다.',
            'stone': '에메랄드·말라카이트가 甲木의 기운을 강화합니다. 책상 위나 지갑 속에 작은 원석을 지니세요.',
            'lucky_day': '甲·乙일, 목요일에 중요한 결정을 내리세요. 봄(3~5월)과 이른 아침이 최적의 활동 시간입니다.',
            'action': '매일 이른 아침 동쪽을 향해 5분간 명상하세요. 초록색 식물 키우기, 새벽 산책, 독서와 글쓰기로 木 기운을 활성화하면 운이 자연스럽게 상승합니다.',
        },
    }

    out = os.path.join(os.path.dirname(__file__), 'trinity_premium_full.pdf')
    generate_report(sample, out)
