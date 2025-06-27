# Spotify Streams Chart Data Pipeline

A Next.js application for visualizing Spotify streaming data with a comprehensive data processing pipeline.

## Overview

This project combines web scraping, data processing, and visualization to analyze Spotify chart data. It includes tools for extracting artist information, processing chart data, and generating interactive visualizations.

## Getting Started

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Structure

- `/src/components/` - React components for the web interface
- `/src/data/` - Processed data files (JSON format)
- `/src/pages/` - Next.js pages and API routes
- `/src/processor-scripts/` - Python data processing scripts
- `/git_ignore/` - Raw data files and scraped content

## Data Processing Scripts

The `/src/processor-scripts/` directory contains Python scripts that handle the data pipeline from raw scraping to processed JSON files ready for the web application.

### Core Processing Scripts

#### `scrape_data.py`

**Purpose**: Web scraper for collecting Spotify chart data from Kworb.net

**Features**:

- Downloads HTML pages for artist song data
- Handles rate limiting and connection management
- Validates downloaded files for corruption
- Uses rotating User-Agent strings to avoid blocking
- Maintains session persistence for efficient downloading

**Usage**:

```bash
cd src/processor-scripts
python3 scrape_data.py
```

**Input**: `git_ignore/all_artists_songs_weekly_x_to_download.txt` (list of URLs)
**Output**: HTML files in `git_ignore/downloaded_html_weekly/`

#### `extract_artist_songs.py`

**Purpose**: Extracts structured data from scraped HTML pages

**Features**:

- Parses artist information from HTML page titles
- Extracts Spotify artist IDs from embedded URLs
- Processes song tables to get track names, IDs, and stream counts
- Handles both total and daily stream statistics

**Usage**:

```bash
cd src/processor-scripts
python3 extract_artist_songs.py
```

**Input**: HTML files in `git_ignore/kworb_artist_songs/`
**Output**: Individual artist JSON files in `src/data/artists-songs/`

**Output Format**:

```json
{
  "artist": "Artist Name",
  "artistId": "spotify_artist_id",
  "songs": [
    {
      "trackName": "Song Title",
      "trackId": "spotify_track_id",
      "total": 1234567890,
      "daily": 123456
    }
  ]
}
```

### Chart Data Processing

#### `filter_global_charts.py`

**Purpose**: Filters and reformats global chart data from the main charts dataset

**Features**:

- Extracts only global chart entries from multi-country dataset
- Cleans and standardizes data format
- Converts string representations of arrays to proper JSON
- Creates both CSV and JSON outputs with metadata

**Usage**:

```bash
cd src/processor-scripts
python3 filter_global_charts.py
```

**Input**: `git_ignore/charts.csv`
**Output**:

- `git_ignore/global_charts.csv`
- `git_ignore/global_charts.json`

#### `csv_to_json.py`

**Purpose**: Converts global charts CSV to structured JSON format

**Features**:

- Organizes chart data by date for efficient querying
- Adds comprehensive metadata including date ranges
- Creates sample files for testing
- Validates and cleans data types (integers, booleans, arrays)

**Usage**:

```bash
cd src/processor-scripts
python3 csv_to_json.py
```

**Input**: `git_ignore/global_charts_by_date.csv`
**Output**:

- `global_charts_by_date.json`
- `global_charts_sample.json`

#### `reorganize_by_artist.py`

**Purpose**: Restructures chart data to create separate entries for each artist in multi-artist tracks

**Features**:

- Handles tracks with multiple collaborating artists
- Creates individual rows for each artist-track combination
- Preserves all original chart data while expanding artist representation

**Usage**:

```bash
cd src/processor-scripts
python3 reorganize_by_artist.py
```

**Input**: `git_ignore/global_charts.csv`
**Output**: Reorganized CSV with expanded artist entries

### Data Management & Analysis

#### `generate_data_summary.py`

**Purpose**: Generates database statistics and summary information

**Features**:

- Counts total unique artists and songs in the database
- Processes all artist JSON files to calculate statistics
- Updates summary file with current database state
- Provides progress tracking for large datasets

**Usage**:

```bash
cd src/processor-scripts
python3 generate_data_summary.py
```

**Input**: `src/data/latest/artists-songs/` (directory of artist JSON files)
**Output**: `src/data/latest/data-summary.json`

**Output Format**:

```json
{
  "totalArtists": 12345,
  "totalSongs": 987654
}
```

#### `process_charts.py`

**Purpose**: Processes main charts.csv to create country-specific JSON files

**Features**:

- Separates chart data by country
- Safely parses string representations of lists
- Handles data validation and error recovery
- Creates organized output structure for each country

**Usage**:

```bash
cd src/processor-scripts
python3 process_charts.py
```

**Input**: `src/data/charts.csv`
**Output**: Individual country JSON files in `output/countries/`

#### Additional Utility Scripts

- `update_data_summary.py` - Updates existing data summary files
- `update_summary.py` - Alternative summary update utility
- `parse_global_daily_totals.py` - Processes daily aggregated data
- `process_artist_play_counts.py` - Analyzes artist streaming statistics
- `reorganize_charts.py` - Alternative chart reorganization utility
- `test_download.py` - Testing utility for download functionality

### Data Flow Pipeline

1. **Collection**: `scrape_data.py` downloads raw HTML data
2. **Extraction**: `extract_artist_songs.py` parses HTML into structured data
3. **Processing**: Various scripts clean, filter, and reorganize the data
4. **Conversion**: `csv_to_json.py` creates final JSON format for web app
5. **Analysis**: `generate_data_summary.py` creates database statistics

### Dependencies

The processing scripts require:

- `requests` - HTTP client for web scraping
- `beautifulsoup4` - HTML parsing
- `csv`, `json`, `os` - Standard library modules

Install with:

```bash
pip install requests beautifulsoup4
```

### Running the Full Pipeline

To process data from scratch:

1. Prepare URL list in `git_ignore/all_artists_songs_weekly_x_to_download.txt`
2. Navigate to scripts directory: `cd src/processor-scripts`
3. Run scraper: `python3 scrape_data.py`
4. Extract data: `python3 extract_artist_songs.py`
5. Process charts: `python3 filter_global_charts.py`
6. Convert to JSON: `python3 csv_to_json.py`
7. Generate summary: `python3 generate_data_summary.py`

## Web Application

The Next.js frontend provides interactive visualization of the processed data:

- **Charts**: View global Spotify charts by date
- **Artists**: Browse artist profiles and top songs
- **Analytics**: Stream count analysis and trends

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/](http://localhost:3000/api/).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
