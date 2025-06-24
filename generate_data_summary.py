#!/usr/bin/env python3
"""
Script to generate data summary including total unique artists and total unique songs.
"""

import json
import os
from pathlib import Path
from typing import Dict, Set


def collect_database_stats(data_dir: str) -> Dict[str, int]:
    """
    Collect statistics about the database including total artists and songs.

    Args:
        data_dir: Path to the data directory containing artists-songs folder

    Returns:
        Dictionary containing totalArtists and totalSongs
    """
    artists_dir = Path(data_dir) / "artists-songs"

    if not artists_dir.exists():
        raise FileNotFoundError(f"Artists directory not found: {artists_dir}")

    # Count unique artists (number of JSON files)
    artist_files = list(artists_dir.glob("*.json"))
    total_artists = len(artist_files)

    # Track unique songs across all artists
    unique_songs: Set[str] = set()

    print(f"Processing {total_artists} artist files...")

    for i, artist_file in enumerate(artist_files, 1):
        try:
            with open(artist_file, "r", encoding="utf-8") as f:
                artist_data = json.load(f)

            # Add all track IDs from this artist to the set
            if "songs" in artist_data:
                for song in artist_data["songs"]:
                    if "trackId" in song:
                        unique_songs.add(song["trackId"])

            # Progress indicator
            if i % 100 == 0:
                print(f"  Processed {i}/{total_artists} artists...")

        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Warning: Could not process {artist_file}: {e}")
            continue

    total_songs = len(unique_songs)

    print(f"✓ Found {total_artists} unique artists")
    print(f"✓ Found {total_songs} unique songs")

    return {"totalArtists": total_artists, "totalSongs": total_songs}


def update_data_summary(data_dir: str, stats: Dict[str, int]) -> None:
    """
    Update the data-summary.json file with the collected statistics.

    Args:
        data_dir: Path to the data directory
        stats: Dictionary containing the statistics to write
    """
    summary_file = Path(data_dir) / "data-summary.json"

    # Read existing data if file exists and is not empty
    existing_data = {}
    if summary_file.exists() and summary_file.stat().st_size > 0:
        try:
            with open(summary_file, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except json.JSONDecodeError:
            print("Warning: data-summary.json exists but contains invalid JSON. Starting fresh.")

    # Update with new stats
    existing_data.update(stats)

    # Write updated data
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=2, ensure_ascii=False)

    print(f"✓ Updated {summary_file}")


def main():
    """Main function to generate the data summary."""
    # Path to the latest data directory
    data_dir = "src/data/latest"

    print("Generating data summary...")
    print(f"Data directory: {os.path.abspath(data_dir)}")

    try:
        # Collect statistics
        stats = collect_database_stats(data_dir)

        # Update the summary file
        update_data_summary(data_dir, stats)

        print("\n📊 Database Summary:")
        print(f"   Total Artists: {stats['totalArtists']:,}")
        print(f"   Total Songs: {stats['totalSongs']:,}")
        print("\n✅ Data summary generated successfully!")

    except Exception as e:
        print(f"❌ Error generating data summary: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
