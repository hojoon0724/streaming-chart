#!/usr/bin/env python3
"""
Script to filter global charts from charts.csv and create a new format
"""
import csv
import json
from datetime import datetime


def filter_global_charts():
    input_file = "../../git_ignore/charts.csv"
    output_csv = "../../git_ignore/global_charts.csv"
    output_json = "../../git_ignore/global_charts.json"

    global_entries = []

    print("Reading and filtering global entries...")

    with open(input_file, "r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)

        for row in reader:
            if row["country"] == "global":
                # Clean up the data
                try:
                    # Parse artists and genres (they appear to be string representations of lists)
                    artists = eval(row["artists"]) if row["artists"].startswith("[") else [row["artists"]]
                    genres = (
                        eval(row["artist_genres"]) if row["artist_genres"].startswith("[") else [row["artist_genres"]]
                    )

                    clean_entry = {
                        "date": row["date"],
                        "position": int(row["position"]),
                        "streams": int(row["streams"]),
                        "track_id": row["track_id"],
                        "artists": artists,
                        "genres": genres,
                        "duration_ms": int(row["duration"]),
                        "explicit": row["explicit"].lower() == "true",
                        "track_name": row["name"],
                    }

                    global_entries.append(clean_entry)

                except (ValueError, SyntaxError) as e:
                    print(f"Skipping problematic row: {e}")
                    continue

    print(f"Found {len(global_entries)} global entries")

    # Save as CSV with new format
    print(f"Saving to {output_csv}...")
    with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = [
            "date",
            "position",
            "streams",
            "track_id",
            "artists",
            "genres",
            "duration_ms",
            "explicit",
            "track_name",
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for entry in global_entries:
            # Convert lists to strings for CSV
            csv_entry = entry.copy()
            csv_entry["artists"] = json.dumps(entry["artists"])
            csv_entry["genres"] = json.dumps(entry["genres"])
            writer.writerow(csv_entry)

    # Save as JSON with structured format
    print(f"Saving to {output_json}...")
    with open(output_json, "w", encoding="utf-8") as jsonfile:
        # Group by date for better structure
        grouped_by_date = {}
        for entry in global_entries:
            date = entry["date"]
            if date not in grouped_by_date:
                grouped_by_date[date] = []
            grouped_by_date[date].append(entry)

        # Sort dates
        sorted_data = dict(sorted(grouped_by_date.items()))

        output_data = {
            "metadata": {
                "total_entries": len(global_entries),
                "date_range": {
                    "start": min(global_entries, key=lambda x: x["date"])["date"],
                    "end": max(global_entries, key=lambda x: x["date"])["date"],
                },
                "description": "Global Spotify charts data filtered from original charts.csv",
            },
            "charts": sorted_data,
        }

        json.dump(output_data, jsonfile, indent=2, ensure_ascii=False)

    print("Processing complete!")
    print(f"Created {output_csv} and {output_json}")
    print(f"Total global entries: {len(global_entries)}")


if __name__ == "__main__":
    filter_global_charts()
