#!/usr/bin/env python3
"""
Script to process charts.csv and create separate JSON files for each country.
Each JSON file will contain all chart entries for that specific country.
"""

import ast
import csv
import json
import os
from collections import defaultdict


def parse_list_string(list_str):
    """
    Parse string representation of list into actual list.
    Handles cases like "['item1', 'item2']" and empty lists.
    """
    if not list_str or list_str == "[]":
        return []
    try:
        # Use ast.literal_eval for safe evaluation of list strings
        return ast.literal_eval(list_str)
    except (ValueError, SyntaxError):
        # Fallback: try to parse manually
        if list_str.startswith("[") and list_str.endswith("]"):
            # Remove brackets and split by comma
            inner = list_str[1:-1]
            if not inner:
                return []
            # Split and clean items
            items = []
            for item in inner.split(","):
                item = item.strip().strip("'\"")
                if item:
                    items.append(item)
            return items
        return [list_str]  # Return as single item if parsing fails


def process_csv_to_json():
    """
    Process the charts.csv file and create separate JSON files for each country.
    """
    csv_file_path = "src/data/charts.csv"
    output_dir = "output/countries"

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Dictionary to store data by country
    country_data = defaultdict(list)

    print("Processing CSV file...")

    # Read and process the CSV file
    try:
        with open(csv_file_path, "r", encoding="utf-8") as file:
            csv_reader = csv.DictReader(file)

            row_count = 0
            for row in csv_reader:
                row_count += 1

                # Show progress every 100k rows
                if row_count % 100000 == 0:
                    print(f"Processed {row_count:,} rows...")

                country = row["country"]

                # Parse the row data and handle list fields
                processed_row = {
                    "date": row["date"],
                    "position": int(row["position"]) if row["position"].isdigit() else row["position"],
                    "streams": int(row["streams"]) if row["streams"].isdigit() else row["streams"],
                    "track_id": row["track_id"],
                    "artists": parse_list_string(row["artists"]),
                    "artist_genres": parse_list_string(row["artist_genres"]),
                    "duration": int(row["duration"]) if row["duration"].isdigit() else row["duration"],
                    "explicit": (
                        row["explicit"].lower() == "true"
                        if row["explicit"].lower() in ["true", "false"]
                        else row["explicit"]
                    ),
                    "name": row["name"],
                }

                # Add to country data
                country_data[country].append(processed_row)

    except FileNotFoundError:
        print(f"Error: Could not find {csv_file_path}")
        return
    except Exception as e:
        print(f"Error processing CSV: {e}")
        return

    print(f"Finished processing {row_count:,} rows")
    print(f"Found {len(country_data)} unique countries")

    # Write JSON files for each country
    print("\nCreating JSON files for each country...")

    for country, data in country_data.items():
        if country == "country":  # Skip header row if it got through
            continue

        output_file = os.path.join(output_dir, f"{country}.json")

        try:
            with open(output_file, "w", encoding="utf-8") as file:
                json.dump(
                    {"country": country, "total_entries": len(data), "chart_data": data},
                    file,
                    indent=2,
                    ensure_ascii=False,
                )

            print(f"Created {output_file} with {len(data):,} entries")

        except Exception as e:
            print(f"Error writing {output_file}: {e}")

    print(f"\nCompleted! JSON files created in '{output_dir}' directory")

    # Print summary statistics
    print("\nSummary:")
    print(f"Total countries: {len(country_data)}")
    top_countries = sorted(country_data.items(), key=lambda x: len(x[1]), reverse=True)[:10]
    print("\nTop 10 countries by number of chart entries:")
    for country, data in top_countries:
        if country != "country":
            print(f"  {country}: {len(data):,} entries")


if __name__ == "__main__":
    process_csv_to_json()
