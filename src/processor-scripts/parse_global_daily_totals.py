#!/usr/bin/env python3
"""
Script to parse `git_ignore/kworb_pages/global_daily_totals.html` and output a JSON array
with entries having the following fields:
  - artist
  - artistId
  - songTitle
  - songId
  - days
  - peakStreams
  - total

Usage:
  pip install beautifulsoup4 lxml
  python3 parse_global_daily_totals.py
"""
import json
import re

INPUT_HTML = "../../git_ignore/kworb_pages/global_daily_totals.html"
OUTPUT_JSON = "../../git_ignore/global_daily_totals.json"


def parse_html_to_json(input_path):
    with open(input_path, "r", encoding="utf-8") as f:
        html = f.read()

    results = []
    # find all <tr>...</tr> entries
    entries = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S)
    for tr in entries:
        # extract artist id and name
        artist_match = re.search(r'<a[^>]*href="[^"]*/artist/([^"]+)\.html"[^>]*>([^<]+)</a>', tr)
        # extract song id and title
        song_match = re.search(r'<a[^>]*href="[^"]*/track/([^"]+)\.html"[^>]*>([^<]+)</a>', tr)
        # extract all td values (including those with attributes)
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
        if not artist_match or not song_match or len(tds) < 4:
            continue

        artist_id, artist = artist_match.groups()
        song_id, song_title = song_match.groups()

        try:
            days = int(tds[1].strip())
            peak_streams = int(tds[2].strip().replace(",", ""))
            total = int(tds[-1].strip().replace(",", ""))
        except ValueError:
            continue

        entry = {
            "artist": artist,
            "artistId": artist_id,
            "songTitle": song_title,
            "songId": song_id,
            "days": days,
            "peakStreams": peak_streams,
            "total": total,
        }
        results.append(entry)
    return results


def main():
    data = parse_html_to_json(INPUT_HTML)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as out:
        json.dump(data, out, indent=2, ensure_ascii=False)
    print(f"Wrote {len(data)} records to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
