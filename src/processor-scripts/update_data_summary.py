#!/usr/bin/env python3
"""
Script to update data summary with total artists and songs count for both latest and weekly data.
"""

import json
import os
from collections import defaultdict
from pathlib import Path


def count_latest_data():
    """Count artists and songs in the latest data directory."""
    data_dir = Path("../data/latest")
    artists_dir = data_dir / "artists-songs"

    print("Counting latest data...")

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

    print(f"   Latest - Total Artists: {total_artists:,}")
    print(f"   Latest - Total Songs: {total_songs:,}")

    return {"totalArtists": total_artists, "totalSongs": total_songs}


def count_weekly_data():
    """Count artists and songs in the weekly data."""
    weekly_dir = Path("../data/weekly")

    print("Counting weekly data...")

    # Initialize counters
    unique_artists = set()
    unique_songs = set()
    unique_dates = set()

    # Process global_charts_by_date.json
    charts_file = weekly_dir / "global_charts_by_date.json"
    if charts_file.exists():
        try:
            with open(charts_file, "r", encoding="utf-8") as f:
                charts_data = json.load(f)

            # Get metadata if available
            metadata = charts_data.get("metadata", {})

            # Count from charts data
            charts = charts_data.get("charts", {})
            for date, entries in charts.items():
                unique_dates.add(date)
                for entry in entries:
                    # Add track ID
                    if "track_id" in entry:
                        unique_songs.add(entry["track_id"])

                    # Add artists
                    if "artists" in entry:
                        for artist in entry["artists"]:
                            unique_artists.add(artist)

        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error reading charts data: {e}")

    # Process global_daily_totals.json
    totals_file = weekly_dir / "global_daily_totals.json"
    if totals_file.exists():
        try:
            with open(totals_file, "r", encoding="utf-8") as f:
                totals_data = json.load(f)

            # Count from daily totals
            for entry in totals_data:
                if "artistId" in entry:
                    unique_artists.add(entry["artist"])
                if "trackId" in entry:
                    unique_songs.add(entry["trackId"])

        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error reading daily totals: {e}")

    total_artists = len(unique_artists)
    total_songs = len(unique_songs)
    total_dates = len(unique_dates)

    print(f"   Weekly - Total Artists: {total_artists:,}")
    print(f"   Weekly - Total Songs: {total_songs:,}")
    print(f"   Weekly - Total Dates: {total_dates:,}")

    return {"totalArtists": total_artists, "totalSongs": total_songs, "totalDates": total_dates}


def update_data_summary():
    """Generate and update data summary with artist and song counts."""

    # Get counts for both latest and weekly data
    latest_stats = count_latest_data()
    weekly_stats = count_weekly_data()

    # Prepare summary data
    summary = {"latest": latest_stats, "weekly": weekly_stats}

    # Write to file
    summary_file = Path("../data/data-summary.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ Data summary updated successfully!")
    print(f"   File: {summary_file}")

    return summary


if __name__ == "__main__":
    update_data_summary()
