"""
Focused RenderingsStatistics analysis for component optimization.

- Uses weekday dumps in 10:00-12:00 UTC by filename.
- Handles app recycle by segmenting when cumulative totals drop sharply.
- Aggregates consecutive deltas within each segment.
- Excludes layout rows and DynamicPlaceholderController rows.
- Highlights components with high frequency, high avg time, low cache ratio,
  and high avg items.
"""
from __future__ import annotations

import math
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

# Analyze dumps from current working directory so the tool
# still works when stored under analysis_tools/.
DIR = Path.cwd()
FN_RE = re.compile(r"RenderingsStatistics\.(\d{8})Z\.(\d{6})Z\.html$", re.I)
ROW_RE = re.compile(r"<tr>\s*(.*?)\s*</tr>", re.DOTALL | re.I)
TD_RE = re.compile(r"<td>\s*(.*?)\s*</td>", re.DOTALL | re.I)


def parse_timespan(s: str) -> float:
    s = re.sub(r"\s+", "", s.strip())
    m = re.match(r"^(?:(\d+)\.)?(\d+):(\d+):([\d.]+)$", s)
    if not m:
        return 0.0
    d, h, mi, sec = m.groups()
    total = 0.0
    if d:
        total += int(d) * 86400
    total += int(h) * 3600 + int(mi) * 60 + float(sec)
    return total


def file_meta(p: Path):
    m = FN_RE.match(p.name)
    if not m:
        return None
    d, t = m.group(1), m.group(2)
    y, mo, da = int(d[:4]), int(d[4:6]), int(d[6:8])
    hh, mm, ss = int(t[:2]), int(t[2:4]), int(t[4:6])
    return date(y, mo, da), hh * 10000 + mm * 100 + ss, p


def is_business(d: date) -> bool:
    return d.weekday() < 5


def in_window(t: int) -> bool:
    return 100000 <= t < 120000


def parse_snapshot(path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    out = {}
    for rm in ROW_RE.finditer(text):
        tds = TD_RE.findall(rm.group(1))
        if len(tds) < 11:
            continue
        tds = [re.sub(r"\s+", " ", t.replace("\n", " ")).strip() for t in tds]
        if tds[0].lower() == "rendering":
            continue
        k = (tds[0], tds[1])
        try:
            out[k] = {
                "count": int(tds[2]),
                "from_cache": int(tds[3]),
                "avg_ms": float(tds[4]),
                "avg_items": float(tds[5]),
                "max_time_ms": float(tds[6]),
                "max_items": float(tds[7]),
                "total_sec": parse_timespan(tds[8]),
                "total_items": float(tds[9]),
            }
        except ValueError:
            continue
    return out


def total_count(snap):
    return sum(v["count"] for v in snap.values())


def split_segments(snaps, reset_ratio=0.55):
    if not snaps:
        return []
    segs = []
    cur = [snaps[0]]
    for i in range(1, len(snaps)):
        a = total_count(snaps[i - 1])
        b = total_count(snaps[i])
        if a > 0 and b < a * reset_ratio:
            segs.append(cur)
            cur = [snaps[i]]
        else:
            cur.append(snaps[i])
    segs.append(cur)
    return segs


def aggregate_deltas(seg):
    acc = defaultdict(lambda: {"count": 0, "from_cache": 0, "total_sec": 0.0, "total_items": 0.0})
    for i in range(1, len(seg)):
        a, b = seg[i - 1], seg[i]
        for k in (set(a) & set(b)):
            dc = b[k]["count"] - a[k]["count"]
            dcache = b[k]["from_cache"] - a[k]["from_cache"]
            dt = b[k]["total_sec"] - a[k]["total_sec"]
            ditems = b[k]["total_items"] - a[k]["total_items"]
            if dc > 0 and dt >= 0 and ditems >= 0 and dcache >= 0:
                acc[k]["count"] += dc
                acc[k]["from_cache"] += dcache
                acc[k]["total_sec"] += dt
                acc[k]["total_items"] += ditems
    return acc


def should_exclude(name: str) -> bool:
    n = name.lower()
    if "dynamicplaceholders.controller" in n:
        return True
    if "/views/sxalayout/" in n:
        return True
    if "customsxalayout" in n or "sxalayout.cshtml" in n:
        return True
    return False


def main():
    metas = []
    for p in DIR.iterdir():
        if not p.is_file():
            continue
        m = file_meta(p)
        if m and is_business(m[0]) and in_window(m[1]):
            metas.append(m)

    by_date = defaultdict(list)
    for d, t, p in metas:
        by_date[d].append((t, p))

    target = date(2026, 4, 3)
    if target not in by_date:
        target = max(by_date, key=lambda dd: len(by_date[dd]))

    files = sorted(by_date[target], key=lambda x: x[0])
    snaps = [parse_snapshot(p) for _, p in files]
    segs = split_segments(snaps)

    merged = defaultdict(lambda: {"count": 0, "from_cache": 0, "total_sec": 0.0, "total_items": 0.0})
    for seg in segs:
        part = aggregate_deltas(seg)
        for k, v in part.items():
            merged[k]["count"] += v["count"]
            merged[k]["from_cache"] += v["from_cache"]
            merged[k]["total_sec"] += v["total_sec"]
            merged[k]["total_items"] += v["total_items"]

    rows = []
    for (name, site), v in merged.items():
        if should_exclude(name):
            continue
        c = v["count"]
        if c <= 0:
            continue
        cache_ratio = v["from_cache"] / c if c else 0.0
        avg_ms = (v["total_sec"] / c) * 1000.0
        avg_items = v["total_items"] / c if c else 0.0
        score = c * avg_ms * (1.0 - cache_ratio) * math.log1p(avg_items)
        rows.append({
            "name": name,
            "site": site,
            "count": c,
            "cache_ratio": cache_ratio,
            "avg_ms": avg_ms,
            "avg_items": avg_items,
            "score": score,
        })

    candidates = [r for r in rows if r["count"] >= 100 and r["avg_ms"] >= 5 and r["cache_ratio"] <= 0.2]
    candidates.sort(key=lambda r: r["score"], reverse=True)

    print(f"Date: {target} ({target.strftime('%A')}) UTC")
    print(f"Window: {files[0][0]:06d}..{files[-1][0]:06d} ({len(files)} snapshots)")
    print(f"Segments detected: {len(segs)}")
    print()

    print("Top optimization candidates (excluding Layout + DynamicPlaceholderController)")
    print("Rules: count>=100, avg_ms>=5, cache_ratio<=20%")
    print(f"{'Rendering':<74} {'Site':<14} {'Count':>8} {'Avg ms':>9} {'Cache%':>8} {'AvgItems':>10}")
    print("-" * 132)
    for r in candidates[:30]:
        short = (r['name'][:71] + '...') if len(r['name']) > 74 else r['name']
        print(f"{short:<74} {r['site']:<14} {r['count']:>8} {r['avg_ms']:>9.2f} {r['cache_ratio']*100:>7.1f}% {r['avg_items']:>10.1f}")

    print()
    print("High avg-items stress points (avg_items >= 300, count >= 50, cache <=20%)")
    hi_items = [r for r in rows if r['avg_items'] >= 300 and r['count'] >= 50 and r['cache_ratio'] <= 0.2]
    hi_items.sort(key=lambda r: (r['avg_items'], r['avg_ms'], r['count']), reverse=True)
    for r in hi_items[:20]:
        short = (r['name'][:71] + '...') if len(r['name']) > 74 else r['name']
        print(f"{short:<74} {r['site']:<14} {r['count']:>8} {r['avg_ms']:>9.2f} {r['cache_ratio']*100:>7.1f}% {r['avg_items']:>10.1f}")


if __name__ == '__main__':
    main()
