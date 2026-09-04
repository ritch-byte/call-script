"""Build the full call-flow reference from the tool's own flow.ts, so the sheet cannot
drift from what reps see on screen. Reads the JSON dumped out of the module and writes HTML
that Chrome renders to PDF."""
import html
import json
import pathlib
import re
import sys

SRC = sys.argv[1]
OUT = sys.argv[2]
d = json.load(open(SRC, encoding="utf-8"))
C = d["consts"]
NODES = d["nodes"]


def fill(text):
    """Show the tokens as the placeholders a rep sees, and resolve the shared constants."""
    if not text:
        return ""
    t = text
    for token, value in [
        ("{leadName}", "[Lead Name]"),
        ("{yourName}", "[Your Name]"),
        ("{SAVINGS_CLAIM}", C["SAVINGS_CLAIM"]),
        ("{SAVINGS_PCT}", C["SAVINGS_PCT"]),
        ("{MEETING_LENGTH}", C["MEETING_LENGTH"]),
        ("{role}", "[that role]"),
        ("{statedTimelineVerbatim}", "[their timeframe, in their words]"),
        ("{hiringSetup}", "team"),
        ("{geminiResearch}", "[the research you generated for this lead]"),
    ]:
        t = t.replace(token, value)
    return t


PLACEHOLDER = re.compile(r"(\[[^\]]{2,60}\])")


def spoken(text):
    """Paragraphs the rep reads aloud, with placeholders and pause marks picked out."""
    out = []
    for para in [p.strip() for p in fill(text).split("\n\n") if p.strip()]:
        bits = []
        for part in PLACEHOLDER.split(para):
            if PLACEHOLDER.fullmatch(part or ""):
                bits.append(f'<span class="ph">{html.escape(part)}</span>')
            else:
                esc = html.escape(part or "")
                esc = re.sub(r"\((pause|Pause)\)", r'<span class="mark">(\1)</span>', esc)
                bits.append(esc)
        out.append("<p>" + "".join(bits) + "</p>")
    return "".join(out)


def tipline(text):
    return html.escape(fill(text)) if text else ""


TYPE_CLASS = {"positive": "opt-yes", "negative": "opt-no", "neutral": "opt-mid"}


def options(node):
    if not node.get("options"):
        return ""
    rows = []
    for o in node["options"]:
        cls = TYPE_CLASS.get(o.get("type") or "", "opt-mid")
        dest = NODES.get(o.get("next") or "", {}).get("title") or o.get("next") or ""
        rows.append(
            f'<tr><td class="{cls}">{html.escape(o.get("label") or "")}</td>'
            f'<td class="dest">&rarr; {html.escape(dest)}</td></tr>'
        )
    return '<table class="opts">' + "".join(rows) + "</table>"


def step(i, key):
    n = NODES[key]
    rec = (
        f'<div class="rec">TYPE THIS IN &mdash; {html.escape(n["records"])}</div>'
        if n.get("records")
        else ""
    )
    tip = f'<div class="tip"><span>COACH</span>{tipline(n.get("tip"))}</div>' if n.get("tip") else ""
    return f"""<div class="step">
  <div class="steph"><span class="num">{i}</span>{html.escape(n['title'] or key)}</div>
  <div class="say">{spoken(n.get('script'))}</div>
  {rec}{tip}{options(n)}
</div>"""


def handler(key):
    n = NODES[key]
    tip = f'<div class="tip"><span>COACH</span>{tipline(n.get("tip"))}</div>' if n.get("tip") else ""
    return f"""<div class="obj">
  <div class="objh">{html.escape(n['title'] or key)}</div>
  <div class="say">{spoken(n.get('script'))}</div>
  {tip}{options(n)}
</div>"""


gates = d["gates"]
gate_rows = []
for gk in gates["SPOKEN_GATE_ORDER"]:
    g = gates["GATE_COPY"][gk]
    gate_rows.append(
        f'<tr><td><strong>{html.escape(gates["GATE_TITLES"][gk])}</strong></td>'
        f'<td>{html.escape(fill(g["ask"]))}</td>'
        f'<td class="yes">{html.escape(" · ".join(g.get("say") or []))}</td>'
        f'<td class="no">{html.escape(" · ".join(g.get("not") or []))}</td></tr>'
    )
dm = gates["GATE_COPY"].get("decision_maker")
if dm:
    gate_rows.append(
        f'<tr><td><strong>Decision maker</strong></td>'
        f'<td>{html.escape(fill(dm["ask"]))}</td>'
        f'<td class="yes">{html.escape(" · ".join(dm.get("say") or []))}</td>'
        f'<td class="no">{html.escape(" · ".join(dm.get("not") or []))}</td></tr>'
    )

salary_rows = "".join(
    f'<tr><td>{html.escape(r["role"])}</td><td>{html.escape(r["us"])}</td>'
    f'<td>{html.escape(r["offshore"])}</td><td class="sv">{html.escape(r["savings"])}</td></tr>'
    for r in d["salary"]
)

RETIRED = [
    ("Six curated CVs regardless of the outcome", "Reduces the meeting to an email attachment, and invites &ldquo;just send them over&rdquo;."),
    ("Candidates on the bench, pricing per candidate", "We do not see partner inventory and cannot speak for it."),
    ("60K locally is 12 to 18K offshore", "Quoting price does the partner&rsquo;s discovery for them, with numbers we cannot stand behind."),
    ("4,700 partners", "Not verifiable. Say <strong>more than 80 BPO partners</strong>."),
    ("Our global talent network", "Reads as if we employ the people. We are a marketplace and we say so."),
    ("Can I count on you to attend?", "Pressure at the point the lead is already leaving."),
    ("I&rsquo;m not really trying to sell anything today", "Said while selling."),
    ("We can guarantee it would be below your budget", "A price promise, on the partner&rsquo;s behalf, before anything is scoped."),
]
retired_rows = "".join(
    f'<tr><td class="out">{a}</td><td>{b}</td></tr>' for a, b in RETIRED
)

main_steps = "".join(step(i, k) for i, k in enumerate(d["main"], 1))

quick = [q if isinstance(q, str) else (q.get("label") or "") for q in d["quick"]]
quick_list = "".join(f"<li>{html.escape(q)}</li>" for q in quick if q)

objection_keys = d["objectionNodes"]
handlers = "".join(handler(k) for k in objection_keys)

extra_keys = [k for k in d["otherNodes"] if k not in d["main"]]
extras = "".join(handler(k) for k in extra_keys)

HTML = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Live Call Assist &mdash; the full call flow</title>
<style>
  @page {{ size: A4; margin: 12mm 11mm 14mm; }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin:0; padding:0; }}
  body {{ font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; color:#0f1729;
         font-size:9pt; line-height:1.4; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
  header {{ background:#0f1729; color:#fff; padding:13px 16px; margin-bottom:12px; }}
  .eyebrow {{ font-family:Consolas,monospace; font-size:6.5pt; letter-spacing:.18em; color:#ff5fa8; }}
  h1 {{ margin:4px 0 2px; font-size:20pt; letter-spacing:-.03em; }}
  .sub {{ font-size:8.5pt; color:#aab3c4; }}
  h2 {{ font-size:11pt; margin:18px 0 8px; padding-bottom:4px; border-bottom:2px solid #0f1729;
        break-after:avoid; page-break-after:avoid; }}
  h2 .n {{ font-family:Consolas,monospace; font-size:7pt; color:#8b94a5; letter-spacing:.12em; }}
  p {{ margin:0 0 6px; }}
  .lede {{ font-size:9.5pt; margin-bottom:10px; }}

  .step, .obj {{ break-inside:avoid; page-break-inside:avoid; margin:0 0 11px;
                 border:1px solid #dfe3ec; border-left:3px solid #0f1729; }}
  .obj {{ border-left-color:#d6006e; }}
  .steph, .objh {{ background:#f7f8fb; padding:5px 10px; font-size:9pt; font-weight:bold;
                   border-bottom:1px solid #eceff5; }}
  .num {{ display:inline-block; min-width:15px; height:15px; border-radius:50%; background:#0f1729;
          color:#fff; font-family:Consolas,monospace; font-size:6.5pt; text-align:center;
          line-height:15px; margin-right:7px; }}
  .say {{ padding:8px 10px 3px; font-size:10pt; line-height:1.5; }}
  .say p {{ margin:0 0 7px; }}
  .ph {{ color:#d6006e; font-weight:600; }}
  .mark {{ color:#9aa3b2; font-style:italic; }}
  .rec {{ margin:0 10px 7px; padding:4px 8px; background:#fce7f0; color:#a4004f;
          font-family:Consolas,monospace; font-size:6.5pt; letter-spacing:.06em; }}
  .tip {{ margin:0 10px 7px; padding:5px 8px; background:#eef3fb; font-size:8pt;
          line-height:1.45; color:#31456b; }}
  .tip span {{ display:block; font-family:Consolas,monospace; font-size:6pt; letter-spacing:.12em;
               color:#7d90b5; margin-bottom:2px; }}
  table.opts {{ width:100%; border-collapse:collapse; margin:0 0 2px; }}
  table.opts td {{ padding:3px 10px; font-size:8pt; border-top:1px solid #eceff5; }}
  td.dest {{ text-align:right; color:#8b94a5; font-size:7.5pt; white-space:nowrap; }}
  .opt-yes {{ color:#0a6b3d; }} .opt-no {{ color:#b0212f; }} .opt-mid {{ color:#31456b; }}

  table.grid {{ width:100%; border-collapse:collapse; font-size:8pt; break-inside:avoid; }}
  table.grid th {{ text-align:left; font-family:Consolas,monospace; font-size:6.5pt;
                   letter-spacing:.1em; color:#6b7280; border-bottom:1px solid #0f1729;
                   padding:0 7px 4px 0; font-weight:400; }}
  table.grid td {{ padding:5px 7px 5px 0; border-bottom:1px solid #eceff5; vertical-align:top; }}
  td.yes {{ color:#0a6b3d; }} td.no {{ color:#b0212f; }} td.sv {{ font-weight:bold; }}
  td.out {{ color:#b0212f; text-decoration:line-through; }}
  ul.q {{ columns:2; margin:0 0 8px; padding-left:16px; font-size:8.5pt; }}
  .note {{ font-size:8pt; color:#6b7280; margin:6px 0 10px; }}
  .foot {{ margin-top:14px; padding-top:8px; border-top:1px solid #dfe3ec; font-size:7.5pt; color:#8b94a5; }}
  .break {{ page-break-before:always; }}
</style></head><body>

<header>
  <div class="eyebrow">OUTSOURCE ACCELERATOR / SD OUTBOUND</div>
  <h1>Live Call Assist</h1>
  <div class="sub">The full call flow, word for word &nbsp;&middot;&nbsp; generated from the live tool, 4 September 2026</div>
</header>

<p class="lede"><strong>Every line in here is the line the tool shows you.</strong> This sheet is
generated from the script itself rather than typed out, so it cannot drift from what is on your
screen. Pink text is a placeholder you fill from the lead. Grey italics are pauses, not words.
The savings figure reads <strong>{html.escape(C['SAVINGS_CLAIM'])}</strong> and the meeting is
<strong>{html.escape(C['MEETING_LENGTH'])}</strong>, both from one place in the tool, so if you
see anything else you are on a cached page.</p>

<h2><span class="n">PART ONE</span> &nbsp;The call, start to finish</h2>
{main_steps}

<h2 class="break"><span class="n">PART TWO</span> &nbsp;The three gates &mdash; they have to say it, not you</h2>
<p class="note">A gate banks when the lead says it in their own voice. Your summary of what they
meant does not count, and neither does a bare &ldquo;yeah&rdquo; to a leading question.</p>
<table class="grid">
  <tr><th style="width:19%">Gate</th><th style="width:34%">Ask it like this</th>
      <th style="width:24%">Banks on</th><th>Does not bank on</th></tr>
  {''.join(gate_rows)}
</table>

<h2><span class="n">PART THREE</span> &nbsp;Lines that are out</h2>
<table class="grid">
  <tr><th style="width:44%">Do not say</th><th>Because</th></tr>
  {retired_rows}
</table>
<p class="note">These are searchable across stored call transcripts and counted weekly. None of
them are in the tool any more, so there is nothing to memorise. Just do not add them back from
memory.</p>

<h2><span class="n">PART FOUR</span> &nbsp;Local vs offshore, your reference only</h2>
<p class="note">Not a line to read. The figure we say on calls is
<strong>{html.escape(C['SAVINGS_CLAIM'])}</strong>. These are the underlying cost gap per role and
several run higher than that, so quote the range and let the partner price the actual spec.</p>
<table class="grid">
  <tr><th style="width:34%">Role</th><th>Local / yr</th><th>Offshore / yr</th><th>Gap</th></tr>
  {salary_rows}
</table>

<h2 class="break"><span class="n">PART FIVE</span> &nbsp;Objection handlers</h2>
<p class="note">The eight on the quick bar, in the order they appear:</p>
<ul class="q">{quick_list}</ul>
{handlers}

<h2><span class="n">PART SIX</span> &nbsp;The other endings</h2>
{extras}

<div class="foot">
  Outsource Accelerator &middot; SD Outbound. Generated from the live script, which is under
  version control: every change is logged with its reason and can be rolled back. Both links,
  /call-script/ and /call-script/v2/, now open the same tool. Anything that does not match what
  you see on screen, send it to your TL rather than working around it.
</div>

</body></html>"""

pathlib.Path(OUT).write_text(HTML, encoding="utf-8")
print(f"wrote {OUT}  ({len(HTML)} chars, {len(d['main'])} steps, {len(objection_keys)} handlers)")
