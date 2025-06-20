#!/usr/bin/env python3
"""
Script to reorganize global charts by date with positions sorted from 1 to highest for each date
"""
import csv
from collections import defaultdict
from datetime import datetime


def reorganize_charts_by_date():
    input_file = "git_ignore/global_charts.csv"
    output_file = "git_ignore/global_charts_by_date.csv"

    print("Reading global charts data...")

    # Dictionary to group entries by date
    charts_by_date = defaultdict(list)

    with open(input_file, "r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)

        for row in reader:
            date = row["date"]
            charts_by_date[date].append(row)

    print(f"Found {len(charts_by_date)} unique dates")

    # Sort dates chronologically (handle different date formats)
    def parse_date(date_str):
        try:
            return datetime.strptime(date_str, "%Y/%m/%d")
        except ValueError:
            try:
                return datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                print(f"Warning: Unable to parse date {date_str}")
                return datetime.min

    sorted_dates = sorted(charts_by_date.keys(), key=parse_date)

    print(f"Date range: {sorted_dates[0]} to {sorted_dates[-1]}")

    # Create the reorganized file
    print(f"Creating reorganized file: {output_file}")

    with open(output_file, "w", newline="", encoding="utf-8") as outfile:
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
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        total_entries = 0

        for date in sorted_dates:
            # Sort entries for this date by position (1 to highest)
            date_entries = sorted(charts_by_date[date], key=lambda x: int(x["position"]))

            print(
                f"Processing {date}: {len(date_entries)} entries (positions {date_entries[0]['position']} to {date_entries[-1]['position']})"
            )

            # Write all entries for this date
            for entry in date_entries:
                writer.writerow(entry)
                total_entries += 1

        print(f"Successfully reorganized {total_entries} entries")
        print(f"Output saved to: {output_file}")

    # Create a summary report
    summary_file = "charts_organization_summary.txt"
    with open(summary_file, "w", encoding="utf-8") as summary:
        summary.write(f"Global Charts Organization Summary\n")
        summary.write(f"================================\n\n")
        summary.write(f"Input file: {input_file}\n")
        summary.write(f"Output file: {output_file}\n")
        summary.write(f"Total entries: {total_entries}\n")
        summary.write(f"Unique dates: {len(charts_by_date)}\n")
        summary.write(f"Date range: {sorted_dates[0]} to {sorted_dates[-1]}\n\n")

        summary.write("Organization structure:\n")
        summary.write("- Data grouped by date (chronologically sorted)\n")
        summary.write("- Within each date, entries sorted by position (1 to highest)\n")
        summary.write("- All entries for one date appear together before moving to next date\n\n")

        # Sample of entries per date
        summary.write("Sample entries per date:\n")
        for i, date in enumerate(sorted_dates[:5]):  # First 5 dates
            entries = charts_by_date[date]
            positions = [int(e["position"]) for e in entries]
            summary.write(f"{date}: {len(entries)} entries, positions {min(positions)}-{max(positions)}\n")

        if len(sorted_dates) > 5:
            summary.write("...\n")
            for date in sorted_dates[-2:]:  # Last 2 dates
                entries = charts_by_date[date]
                positions = [int(e["position"]) for e in entries]
                summary.write(f"{date}: {len(entries)} entries, positions {min(positions)}-{max(positions)}\n")

    print(f"Summary report saved to: {summary_file}")


if __name__ == "__main__":
    reorganize_charts_by_date()
