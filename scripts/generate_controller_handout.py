#!/usr/bin/env python3
"""Build the all-case controller handout from the current Notion DB export."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "tmp" / "controller-handout-cases.json"
OUTPUT_DIR = ROOT / "output" / "controller-handout"
HTML_FILE = OUTPUT_DIR / "controller_handout_2026.html"
PDF_FILE = OUTPUT_DIR / "controller_handout_2026.pdf"

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 24

COLORS = {
    "ink": HexColor("#102a43"),
    "muted": HexColor("#526579"),
    "line": HexColor("#cbd5e1"),
    "paper": HexColor("#f8fafc"),
    "navy": HexColor("#153e75"),
    "teal": HexColor("#0f766e"),
    "amber": HexColor("#b45309"),
    "rose": HexColor("#be123c"),
    "blue_bg": HexColor("#eaf2ff"),
    "teal_bg": HexColor("#e8f7f3"),
    "amber_bg": HexColor("#fff6e5"),
    "rose_bg": HexColor("#fff0f3"),
    "slate_bg": HexColor("#f1f5f9"),
}


def plain(value: object, fallback: str = "記載なし") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    if not text:
        return fallback
    if text.startswith("[") and text.endswith("]"):
        try:
            value = json.loads(text)
            if isinstance(value, list):
                return " / ".join(map(str, value)) or fallback
        except json.JSONDecodeError:
            pass
    return text


def clean(value: object) -> str:
    return plain(value).replace("\r\n", "\n").replace("\r", "\n")


def html_text(value: object) -> str:
    return html.escape(clean(value)).replace("\n", "<br>")


def list_items(value: object) -> str:
    text = clean(value)
    if text == "記載なし":
        return '<p class="empty">記載なし</p>'
    parts = [part.strip(" ・-") for part in re.split(r"\n|(?<=。)\s*", text) if part.strip()]
    return "".join(f"<li>{html.escape(part)}</li>" for part in parts)


def label_value(label: str, value: object) -> str:
    return f'<div class="field"><div class="label">{label}</div><div class="value">{html_text(value)}</div></div>'


def case_html(case: dict) -> str:
    case_id = int(case["id"])
    compact = " compact" if sum(len(clean(case.get(key))) for key in case) > 2500 else ""
    return f"""
<section class="case{compact}">
  <header class="case-head">
    <div class="id">CASE<br><strong>{case_id:02d}</strong></div>
    <div class="heading">
      <h1>{html.escape(plain(case.get("title")))}</h1>
      <div class="subline">{html.escape(plain(case.get("demographics")))}　{html.escape(plain(case.get("patient_name")))}　/　到着 {html.escape(plain(case.get("arrival_time")))}</div>
    </div>
    <div class="tags"><span>{html.escape(plain(case.get("arrival_method")))}</span><span>{html.escape(plain(case.get("triage")))}</span><span>{html.escape(plain(case.get("zone")))}</span><span>{html.escape(plain(case.get("procedure")))}</span></div>
  </header>
  <div class="overview"><b>症例設定・概要</b><span>{html_text(case.get("overview"))}</span></div>
  <div class="body">
    <section class="column arrival">
      <h2>01　到着・一次評価</h2>
      {label_value("救急隊バイタル", case.get("ems_vitals"))}
      {label_value("一次トリアージ所見", case.get("primary_triage"))}
      {label_value("ムラージュ", case.get("moulage"))}
      {label_value("演技ポイント", case.get("acting"))}
    </section>
    <section class="column course">
      <h2>02　初療から治療へ</h2>
      {label_value("来院後初回バイタル", case.get("initial_vitals"))}
      {label_value("診察所見", case.get("examination"))}
      {label_value("検査所見", case.get("tests"))}
      {label_value("想定される治療", case.get("treatment"))}
      {label_value("コントローラー指示", case.get("controller_instruction"))}
      {label_value("追加イベント", case.get("extra_events"))}
    </section>
    <section class="column control">
      <h2>03　進行・分岐・到達点</h2>
      <div class="field checkpoint"><div class="label">コントローラーチェックポイント</div><ul>{list_items(case.get("controller_checkpoints"))}</ul></div>
      {label_value("分岐・悪化条件", case.get("branches"))}
      <div class="outcome-row">{label_value("予想される転帰", case.get("outcome"))}{label_value("重点訓練ポイント", case.get("focus"))}</div>
      {label_value("学習ポイント", case.get("learning"))}
    </section>
  </div>
  <footer><span>2026 災害訓練　コントローラ配布資料</span><span>DB更新日を反映した印刷用資料</span></footer>
</section>"""


def build_html(cases: list[dict]) -> None:
    style = """
@page { size: A4 landscape; margin: 7mm; }
* { box-sizing: border-box; }
body { margin:0; background:#e2e8f0; color:#102a43; font-family:"Yu Gothic","Meiryo",sans-serif; }
.case { width:283mm; height:196mm; padding:5mm 6mm 3mm; background:#fff; page-break-after:always; overflow:hidden; display:flex; flex-direction:column; }
.case:last-child { page-break-after:auto; }
.case-head { display:grid; grid-template-columns:18mm 1fr auto; align-items:center; gap:4mm; border-bottom:1.2px solid #153e75; padding-bottom:2.5mm; }
.id { color:#153e75; font-size:6.5pt; font-weight:700; line-height:1.1; letter-spacing:.4px; }
.id strong { font-size:22pt; letter-spacing:0; }
h1 { margin:0; font-size:18pt; line-height:1.15; color:#102a43; }
.subline { margin-top:1.2mm; color:#526579; font-size:8pt; }
.tags { display:flex; gap:1.2mm; justify-content:flex-end; max-width:58mm; flex-wrap:wrap; }
.tags span { border-radius:2mm; padding:1mm 2mm; font-weight:700; font-size:7pt; background:#eaf2ff; color:#153e75; }
.tags span:nth-child(2) { background:#fff0f3; color:#be123c; }.tags span:nth-child(3) { background:#e8f7f3; color:#0f766e; }.tags span:nth-child(4) { background:#fff6e5; color:#92400e; }
.overview { margin:2.5mm 0; padding:2.2mm 3mm; background:#f1f5f9; border-left:3px solid #153e75; font-size:8pt; line-height:1.45; display:flex; gap:3mm; }
.overview b { color:#153e75; white-space:nowrap; }.overview span { flex:1; }
.body { display:grid; grid-template-columns:29% 36% 35%; gap:2.5mm; flex:1; min-height:0; }
.column { padding:2.2mm 2.5mm; border:1px solid #cbd5e1; border-radius:1.5mm; min-height:0; overflow:hidden; }
.arrival { background:#f8fbff; }.course { background:#fbfffd; }.control { background:#fffdf9; }
h2 { margin:0 0 1.5mm; color:#153e75; font-size:9pt; line-height:1.2; border-bottom:1px solid #cbd5e1; padding-bottom:1.1mm; }
.course h2 { color:#0f766e; }.control h2 { color:#b45309; }
.field { margin:0 0 1.55mm; }.label { color:#526579; font-size:6.5pt; font-weight:700; line-height:1.2; margin-bottom:.55mm; }.value { font-size:7.4pt; line-height:1.36; overflow-wrap:anywhere; }
.checkpoint { border-left:2px solid #b45309; padding-left:2mm; }.checkpoint ul { margin:.4mm 0 1mm; padding-left:3.3mm; font-size:7.1pt; line-height:1.3; }.checkpoint li { margin-bottom:.5mm; }
.outcome-row { display:grid; grid-template-columns:31% 1fr; gap:2mm; }.outcome-row .value { font-size:7pt; }
.empty { color:#94a3b8; margin:0; font-size:7pt; }
footer { display:flex; justify-content:space-between; border-top:1px solid #cbd5e1; margin-top:2mm; padding-top:1.4mm; font-size:6.5pt; color:#64748b; }
.compact .value { font-size:6.65pt; line-height:1.28; }.compact .checkpoint ul { font-size:6.4pt; line-height:1.23; }.compact .field { margin-bottom:1.1mm; }.compact .overview { font-size:7.4pt; }
@media screen { .case { margin:8mm auto; box-shadow:0 4px 18px rgba(15,23,42,.15); } }
"""
    document = f"""<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>2026 災害訓練 コントローラ配布資料</title><style>{style}</style></head>
<body>{''.join(case_html(case) for case in cases)}</body></html>"""
    # Keep the Notion-embedded HTML safely below the 200 KiB attachment limit.
    document = re.sub(r">\s+<", "><", document)
    document = re.sub(r"\s{2,}", " ", document)
    # The short class names are only for the self-contained export; source remains
    # readable above, while repeated markup stays compact enough for Notion upload.
    for old, new in (
        ('class="field"', 'class="f"'), ('.field', '.f'),
        ('class="label"', 'class="l"'), ('.label', '.l'),
        ('class="value"', 'class="v"'), ('.value', '.v'),
        ('class="checkpoint"', 'class="k"'), ('.checkpoint', '.k'),
        ('class="outcome-row"', 'class="u"'), ('.outcome-row', '.u'),
        ('class="empty"', 'class="e"'), ('.empty', '.e'),
    ):
        document = document.replace(old, new)
    HTML_FILE.write_text(document, encoding="utf-8")


def wrap_text(text: str, font_name: str, font_size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    for paragraph in clean(text).split("\n"):
        if paragraph == "記載なし":
            lines.append(paragraph)
            continue
        line = ""
        for char in paragraph:
            candidate = line + char
            if pdfmetrics.stringWidth(candidate, font_name, font_size) <= max_width:
                line = candidate
            else:
                if line:
                    lines.append(line)
                line = char
        if line:
            lines.append(line)
    return lines or ["記載なし"]


def draw_box(c: canvas.Canvas, x: float, y_top: float, width: float, height: float, title: str, items: list[tuple[str, object]], accent: HexColor, background: HexColor, font_size: float) -> None:
    c.setFillColor(background)
    c.roundRect(x, y_top-height, width, height, 4, fill=1, stroke=0)
    c.setStrokeColor(COLORS["line"])
    c.roundRect(x, y_top-height, width, height, 4, fill=0, stroke=1)
    c.setStrokeColor(accent)
    c.setLineWidth(1.3)
    c.line(x, y_top-17, x+width, y_top-17)
    c.setFillColor(accent)
    c.setFont("HeiseiKakuGo-W5", 9)
    c.drawString(x+8, y_top-12, title)
    cursor = y_top - 27
    leading = font_size * 1.33
    for label, value in items:
        c.setFillColor(COLORS["muted"])
        c.setFont("HeiseiKakuGo-W5", max(5.6, font_size - 1.1))
        c.drawString(x+8, cursor, label)
        cursor -= leading
        c.setFillColor(COLORS["ink"])
        c.setFont("HeiseiKakuGo-W5", font_size)
        for line in wrap_text(clean(value), "HeiseiKakuGo-W5", font_size, width-16):
            if cursor < y_top-height+8:
                return
            c.drawString(x+8, cursor, line)
            cursor -= leading
        cursor -= 2


def build_pdf(cases: list[dict]) -> None:
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
    c = canvas.Canvas(str(PDF_FILE), pagesize=landscape(A4), pageCompression=1)
    for case in cases:
        content_size = sum(len(clean(value)) for value in case.values())
        font_size = 6.4 if content_size > 2600 else 6.9 if content_size > 1900 else 7.4
        c.setFillColor(white)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # Header
        c.setFillColor(COLORS["navy"])
        c.rect(0, PAGE_H-44, PAGE_W, 44, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("HeiseiKakuGo-W5", 7)
        c.drawString(MARGIN, PAGE_H-15, "2026 災害訓練　コントローラ配布資料")
        c.setFont("HeiseiKakuGo-W5", 18)
        c.drawString(MARGIN, PAGE_H-34, f"症例 {int(case['id']):02d}　{plain(case.get('title'))}")
        tag = f"{plain(case.get('arrival_time'))}  |  {plain(case.get('arrival_method'))}  |  {plain(case.get('triage'))}  |  {plain(case.get('zone'))}  |  {plain(case.get('procedure'))}"
        c.setFont("HeiseiKakuGo-W5", 7.5)
        c.drawRightString(PAGE_W-MARGIN, PAGE_H-30, tag)

        overview_top = PAGE_H - 53
        overview_h = 40
        c.setFillColor(COLORS["slate_bg"])
        c.roundRect(MARGIN, overview_top-overview_h, PAGE_W-2*MARGIN, overview_h, 4, fill=1, stroke=0)
        c.setFillColor(COLORS["navy"])
        c.setFont("HeiseiKakuGo-W5", 7)
        c.drawString(MARGIN+8, overview_top-11, "症例設定・概要")
        c.setFillColor(COLORS["ink"])
        c.setFont("HeiseiKakuGo-W5", font_size)
        oy = overview_top-22
        overview = f"{plain(case.get('demographics'))}／{plain(case.get('patient_name'))}　{clean(case.get('overview'))}"
        for line in wrap_text(overview, "HeiseiKakuGo-W5", font_size, PAGE_W-2*MARGIN-16):
            c.drawString(MARGIN+8, oy, line)
            oy -= font_size*1.32

        box_top = overview_top-overview_h-9
        box_h = box_top - 24
        gap = 7
        usable = PAGE_W-2*MARGIN-2*gap
        widths = [usable*.29, usable*.36, usable*.35]
        x1 = MARGIN
        x2 = x1 + widths[0] + gap
        x3 = x2 + widths[1] + gap
        draw_box(c, x1, box_top, widths[0], box_h, "01　到着・一次評価", [
            ("救急隊バイタル", case.get("ems_vitals")),
            ("一次トリアージ所見", case.get("primary_triage")),
            ("ムラージュ", case.get("moulage")),
            ("演技ポイント", case.get("acting")),
        ], COLORS["navy"], HexColor("#f8fbff"), font_size)
        draw_box(c, x2, box_top, widths[1], box_h, "02　初療から治療へ", [
            ("来院後初回バイタル", case.get("initial_vitals")),
            ("診察所見", case.get("examination")),
            ("検査所見", case.get("tests")),
            ("想定される治療", case.get("treatment")),
            ("コントローラー指示", case.get("controller_instruction")),
            ("追加イベント", case.get("extra_events")),
        ], COLORS["teal"], HexColor("#fbfffd"), font_size)
        draw_box(c, x3, box_top, widths[2], box_h, "03　進行・分岐・到達点", [
            ("コントローラーチェックポイント", case.get("controller_checkpoints")),
            ("分岐・悪化条件", case.get("branches")),
            ("予想される転帰", case.get("outcome")),
            ("重点訓練ポイント", case.get("focus")),
            ("学習ポイント", case.get("learning")),
        ], COLORS["amber"], HexColor("#fffdf9"), font_size)
        c.setFillColor(COLORS["muted"])
        c.setFont("HeiseiKakuGo-W5", 6)
        c.drawString(MARGIN, 11, "時系列：到着情報 → 初療・検査 → 治療・追加イベント → 分岐・転帰")
        c.drawRightString(PAGE_W-MARGIN, 11, f"{int(case['id'])} / {len(cases)}")
        c.showPage()
    c.save()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cases = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    build_html(cases)
    build_pdf(cases)
    print(f"Generated {len(cases)} cases")
    print(HTML_FILE)
    print(PDF_FILE)


if __name__ == "__main__":
    main()
