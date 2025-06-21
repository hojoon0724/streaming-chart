import os
import random
import time

import requests

# Load your list of URLs from a file
with open("git_ignore/all_artists_songs_x_to_download.txt", "r") as file:
    urls = [line.strip() for line in file if line.strip()]

# Keep track of remaining URLs and processed URLs
remaining_urls = urls.copy()
downloaded_urls = []
error_urls = []

# Make a folder to store the HTML files
os.makedirs("git_ignore/downloaded_html", exist_ok=True)

# Create a requests session for connection reuse
session = requests.Session()

# List of realistic User-Agent strings to rotate through
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]

for i, url in enumerate(urls, 1):
    try:
        # Clean up the URL to use as a filename
        filename = url.replace("https://", "").replace("http://", "").replace("/", "_") + ".html"
        filepath = os.path.join("git_ignore/downloaded_html", filename)

        # Check if file already exists
        if os.path.exists(filepath):
            print(f"[{i}/{len(urls)}] Already downloaded, skipping: {url}")
            downloaded_urls.append(url)
            remaining_urls.remove(url)
            continue

        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Connection": "keep-alive",
            "Referer": "https://www.google.com/",
        }

        print(f"[{i}/{len(urls)}] Downloading: {url}")
        response = session.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Save HTML to file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(response.text)

        # Mark as successfully downloaded
        downloaded_urls.append(url)
        remaining_urls.remove(url)

        # Random delay between 5-10 seconds
        delay = round(random.uniform(5, 10), 2)
        time.sleep(delay)

        # Occasionally take a longer break every 50-100 downloads
        if i % random.randint(50, 100) == 0:
            long_pause = random.uniform(30, 90)
            print(f"Taking a longer break: {long_pause:.2f} seconds")
            time.sleep(long_pause)

    except Exception as e:
        print(f"Failed to download {url}: {e}")
        error_urls.append(url)
        remaining_urls.remove(url)

# Update the files after processing
# Write remaining URLs back to the original file
with open("git_ignore/all_artists_songs_x_to_download.txt", "w") as file:
    for url in remaining_urls:
        file.write(url + "\n")

# Write downloaded URLs to success file
with open("git_ignore/all_artists_songs_y_downloaded.txt", "a") as file:
    for url in downloaded_urls:
        file.write(url + "\n")

# Write error URLs to error file
with open("git_ignore/all_artists_songs_z_error.txt", "a") as file:
    for url in error_urls:
        file.write(url + "\n")

print(f"\nProcessing complete:")
print(f"- Downloaded: {len(downloaded_urls)}")
print(f"- Errors: {len(error_urls)}")
print(f"- Remaining: {len(remaining_urls)}")
