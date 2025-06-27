#!/usr/bin/env python3
"""
Script to reorganize global_charts.csv by artist.
Creates a new CSV where tracks with multiple artists get separate rows for each artist.
"""

import csv
import json
import os


def parse_artists_field(artists_str):
    """Parse the artists field which is a JSON-formatted string list."""
    try:
        # Remove any extra quotes and parse as JSON
        artists_list = json.loads(artists_str)
        return artists_list
    except json.JSONDecodeError:
        # Fallback: if JSON parsing fails, try to extract manually
        # Remove brackets and quotes, split by comma
        clean_str = artists_str.strip("[]").replace('"', "")
        return [artist.strip() for artist in clean_str.split(",")]


def reorganize_csv_by_artist(input_file, output_file):
    """Reorganize CSV data by artist, creating separate rows for each artist."""

    with open(input_file, "r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)

        # Get the fieldnames from the original CSV
        fieldnames = reader.fieldnames

        # Prepare output data
        output_rows = []

        for row in reader:
            # Parse the artists field
            artists_str = row["artists"]
            artists_list = parse_artists_field(artists_str)

            # Create a separate row for each artist
            for artist in artists_list:
                new_row = row.copy()
                # Replace the artists field with just this single artist
                new_row["artists"] = f'["{artist}"]'
                output_rows.append(new_row)

    # Sort by artist name for better organization
    output_rows.sort(key=lambda x: parse_artists_field(x["artists"])[0])

    # Write to output file
    with open(output_file, "w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Successfully reorganized {len(output_rows)} rows by artist.")
    print(f"Output saved to: {output_file}")


def main():
    input_file = "../../git_ignore/global_charts.csv"
    output_file = "../../git_ignore/global_charts_by_artist.csv"

    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} not found.")
        return

    print(f"Reading from: {input_file}")
    print(f"Writing to: {output_file}")

    reorganize_csv_by_artist(input_file, output_file)


if __name__ == "__main__":
    main()
