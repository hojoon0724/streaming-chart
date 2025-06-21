#!/usr/bin/env python3
import requests
import random

# Test with a single Kworb URL
test_url = "https://kworb.net/spotify/artist/1Xyo4u8uXC1ZmMpatF05PJ_songs.html"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
]

headers = {
    "User-Agent": random.choice(USER_AGENTS),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Connection": "keep-alive",
    "Referer": "https://www.google.com/",
}

print(f"Testing download of: {test_url}")

try:
    session = requests.Session()
    response = session.get(test_url, headers=headers, timeout=10)
    response.raise_for_status()

    # Check encoding
    print(f"Response encoding: {response.encoding}")
    print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
    print(f"Content-Encoding: {response.headers.get('content-encoding', 'None')}")

    # Ensure proper encoding
    if response.encoding is None or response.encoding == "ISO-8859-1":
        response.encoding = "utf-8"

    content = response.text
    print(f"Content length: {len(content)}")
    print(f"First 200 characters: {repr(content[:200])}")

    # Check if it looks like HTML
    html_indicators = ["<html", "<head", "<body", "<!doctype", "<title"]
    has_html = any(indicator in content.lower() for indicator in html_indicators)
    print(f"Appears to be HTML: {has_html}")

    if has_html:
        # Save test file
        with open("test_download.html", "w", encoding="utf-8") as f:
            f.write(content)
        print("✅ Successfully downloaded and saved test file!")
    else:
        print("❌ Content doesn't appear to be valid HTML")

except Exception as e:
    print(f"❌ Error: {e}")
