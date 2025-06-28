#!/usr/bin/env python3

import os
import re
from pathlib import Path


def extract_track_urls():
    """
    Extract track URLs from all HTML files in the artists_songs_list directory
    and write them to songs_url_repo.txt
    """

    # Define paths
    artists_dir = Path("/Users/hojoon/Code/active/streams-chart/git_ignore/artists_songs_list")
    output_file = Path("/Users/hojoon/Code/active/streams-chart/git_ignore/songs_url_repo.txt")

    # Pattern to match the track links
    # Looking for: <td class="text"><div><a href="../track/TRACK_ID.html">
    pattern = r'<td class="text"><div><a href="\.\./track/([a-zA-Z0-9]+)\.html">'

    all_urls = []

    # Process each HTML file in the directory
    for html_file in sorted(artists_dir.glob("*.html")):
        try:
            print(f"Processing: {html_file.name}")

            with open(html_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Find all track IDs in the file
            matches = re.findall(pattern, content)

            # Convert to full URLs
            for track_id in matches:
                url = f"https://kworb.net/spotify/track/{track_id}.html"
                all_urls.append(url)

            print(f"Found {len(matches)} tracks in {html_file.name}")

        except Exception as e:
            print(f"Error processing {html_file.name}: {e}")

    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in all_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    # Write to output file
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            for url in unique_urls:
                f.write(url + "\n")

        print(f"\nSuccessfully extracted {len(unique_urls)} unique track URLs")
        print(f"Results written to: {output_file}")
        print(f"Total files processed: {len(list(artists_dir.glob('*.html')))}")

    except Exception as e:
        print(f"Error writing to output file: {e}")


if __name__ == "__main__":
    extract_track_urls()
