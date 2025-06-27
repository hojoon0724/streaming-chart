#!/usr/bin/env python3
"""
Quick script to update data summary with total artists and songs count.
"""

import json
import os
from pathlib import Path


def update_data_summary():
    """Generate and update data summary with artist and song counts."""

    # Paths
    data_dir = Path("../data/latest")
    artists_dir = data_dir / "artists-songs"
    summary_file = data_dir / "data-summary.json"

    print("Counting artists and songs...")

    # Count artists (number of JSON files)
    artist_files = list(artists_dir.glob("*.json"))
    total_artists = len(artist_files)

    # Count unique songs across all artists
    unique_songs = set()

    for artist_file in artist_files:
        try:
            with open(artist_file, "r", encoding="utf-8") as f:
                artist_data = json.load(f)

            # Add track IDs to set
            for song in artist_data.get("songs", []):
                if "trackId" in song:
                    unique_songs.add(song["trackId"])

        except (json.JSONDecodeError, FileNotFoundError):
            continue

    total_songs = len(unique_songs)

    # Prepare summary data
    summary = {"totalArtists": total_artists, "totalSongs": total_songs}

    # Write to file
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"✅ Summary updated:")
    print(f"   Total Artists: {total_artists:,}")
    print(f"   Total Songs: {total_songs:,}")

    return summary


if __name__ == "__main__":
    update_data_summary()
