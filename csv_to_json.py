#!/usr/bin/env python3
"""
Script to convert global_charts_by_date.csv to JSON format
"""
import csv
import json
from collections import defaultdict
from datetime import datetime

def csv_to_json():
    input_file = 'git_ignore/global_charts_by_date.csv'
    output_file = 'global_charts_by_date.json'
    
    print(f"Reading CSV file: {input_file}")
    
    # Dictionary to store charts organized by date
    charts_data = defaultdict(list)
    total_entries = 0
    
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            date = row['date']
            
            # Clean and structure the entry
            entry = {
                'position': int(row['position']),
                'streams': int(row['streams']),
                'track_id': row['track_id'],
                'artists': json.loads(row['artists']),  # Convert from JSON string to list
                'genres': json.loads(row['genres']),    # Convert from JSON string to list
                'duration_ms': int(row['duration_ms']),
                'explicit': row['explicit'].lower() == 'true',
                'track_name': row['track_name']
            }
            
            charts_data[date].append(entry)
            total_entries += 1
            
            if total_entries % 10000 == 0:
                print(f"Processed {total_entries} entries...")
    
    print(f"Total entries processed: {total_entries}")
    print(f"Unique dates: {len(charts_data)}")
    
    # Create the final JSON structure
    dates = list(charts_data.keys())
    date_range = {
        'start': min(dates),
        'end': max(dates)
    }
    
    json_data = {
        'metadata': {
            'title': 'Global Spotify Charts Data',
            'description': 'Global Spotify charts organized by date with positions sorted from 1 to highest',
            'source': 'Converted from global_charts_by_date.csv',
            'total_entries': total_entries,
            'unique_dates': len(charts_data),
            'date_range': date_range,
            'created_date': datetime.now().isoformat(),
            'data_structure': {
                'charts': 'Object with date keys, each containing array of chart entries',
                'entry_fields': [
                    'position (integer)',
                    'streams (integer)', 
                    'track_id (string)',
                    'artists (array of strings)',
                    'genres (array of strings)',
                    'duration_ms (integer)',
                    'explicit (boolean)',
                    'track_name (string)'
                ]
            }
        },
        'charts': dict(charts_data)  # Convert defaultdict to regular dict
    }
    
    print(f"Writing JSON file: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as jsonfile:
        json.dump(json_data, jsonfile, indent=2, ensure_ascii=False)
    
    print(f"Successfully created {output_file}")
    print(f"File contains {total_entries} chart entries across {len(charts_data)} dates")
    
    # Create a sample to show the structure
    sample_file = 'global_charts_sample.json'
    print(f"Creating sample file: {sample_file}")
    
    # Get first 3 dates for sample
    sample_dates = sorted(charts_data.keys())[:3]
    sample_data = {
        'metadata': json_data['metadata'],
        'charts': {date: charts_data[date] for date in sample_dates},
        'note': f'This is a sample containing only the first 3 dates. Full data is in {output_file}'
    }
    
    with open(sample_file, 'w', encoding='utf-8') as sample_jsonfile:
        json.dump(sample_data, sample_jsonfile, indent=2, ensure_ascii=False)
    
    print(f"Sample file created: {sample_file}")

if __name__ == "__main__":
    csv_to_json()
